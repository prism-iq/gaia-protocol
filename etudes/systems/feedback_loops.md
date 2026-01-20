# Boucles de Rétroaction : L'Architecture de la Causalité Circulaire

## Définition

Une boucle de rétroaction (feedback loop) existe quand la sortie d'un système influence son entrée, créant une causalité circulaire.

```
┌─────────────────────────────────────────────────────────────┐
│                    STRUCTURE FONDAMENTALE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌──────────────┐                         │
│         ┌────────▶│   SYSTÈME    │────────┐                │
│         │         └──────────────┘        │                 │
│         │                                  │                 │
│         │ Entrée                   Sortie │                 │
│         │                                  │                 │
│         │         ┌──────────────┐        │                 │
│         └─────────│  RÉTROACTION │◀───────┘                │
│                   └──────────────┘                          │
│                                                              │
│   Sortie(t) ──▶ Entrée(t+1) ──▶ Sortie(t+1) ──▶ ...       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Types de Rétroaction

### Rétroaction Négative (Stabilisatrice)

```
┌─────────────────────────────────────────────────────────────┐
│                  RÉTROACTION NÉGATIVE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Effet: OPPOSE le changement → STABILITÉ                   │
│                                                              │
│         Consigne                                             │
│            │                                                 │
│            ▼         ┌────────┐                             │
│         ⊖─────▶ △ ──▶│Système │──────┬──▶ Sortie           │
│            ▲         └────────┘      │                      │
│            │                          │                      │
│            │    ┌──────────────┐     │                      │
│            └────│   Capteur    │◀────┘                      │
│                 └──────────────┘                             │
│                                                              │
│   Exemples:                                                  │
│   • Thermostat (T↑ → chauffage↓)                           │
│   • Homéostasie (glucose↑ → insuline↑ → glucose↓)          │
│   • Régulation population (pop↑ → ressources↓ → pop↓)      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Rétroaction Positive (Amplificatrice)

```
┌─────────────────────────────────────────────────────────────┐
│                   RÉTROACTION POSITIVE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Effet: RENFORCE le changement → CROISSANCE/EFFONDREMENT   │
│                                                              │
│                       ┌────────┐                            │
│         ──────▶ ⊕ ───▶│Système │──────┬──▶ Sortie          │
│                  ▲    └────────┘      │                     │
│                  │                     │                     │
│                  │   ┌───────────┐    │                     │
│                  └───│Amplificat.│◀───┘                     │
│                      └───────────┘                          │
│                                                              │
│   Exemples:                                                  │
│   • Intérêts composés (argent↑ → intérêts↑ → argent↑)      │
│   • Effet boule de neige                                    │
│   • Panique bancaire (retraits↑ → peur↑ → retraits↑)       │
│   • Larsen acoustique                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Formalisation Mathématique

```python
"""
Modélisation des boucles de rétroaction
Analyse dynamique et stabilité
"""

import numpy as np
from typing import Callable, Tuple, List
from dataclasses import dataclass
from enum import Enum
import matplotlib.pyplot as plt

class FeedbackType(Enum):
    NEGATIVE = -1  # Stabilisant
    POSITIVE = 1   # Amplificateur
    MIXED = 0      # Combinaison

@dataclass
class FeedbackLoop:
    """
    Représentation d'une boucle de rétroaction

    dx/dt = f(x) + g(feedback)
    où feedback = h(x) avec délai τ
    """
    gain: float           # Amplitude de la rétroaction
    delay: float         # Délai temporel
    feedback_type: FeedbackType
    transfer_function: Callable[[float], float]

class FeedbackSystem:
    """
    Système avec boucles de rétroaction multiples
    """

    def __init__(self, initial_state: float):
        self.state = initial_state
        self.history = [initial_state]
        self.loops: List[FeedbackLoop] = []
        self.time = 0

    def add_loop(self, loop: FeedbackLoop):
        """Ajoute une boucle de rétroaction"""
        self.loops.append(loop)

    def compute_feedback(self) -> float:
        """
        Calcule la rétroaction totale de toutes les boucles
        """
        total_feedback = 0

        for loop in self.loops:
            # Récupérer l'état avec délai
            delay_steps = int(loop.delay)
            if delay_steps < len(self.history):
                delayed_state = self.history[-delay_steps-1]
            else:
                delayed_state = self.history[0]

            # Appliquer la fonction de transfert
            feedback_signal = loop.transfer_function(delayed_state)

            # Appliquer gain et signe
            total_feedback += loop.gain * loop.feedback_type.value * feedback_signal

        return total_feedback

    def step(self, external_input: float = 0, dt: float = 0.1) -> float:
        """
        Avance le système d'un pas de temps

        dx/dt = input + feedback
        """
        feedback = self.compute_feedback()

        # Équation différentielle simple
        derivative = external_input + feedback
        self.state += derivative * dt

        self.history.append(self.state)
        self.time += dt

        return self.state

    def simulate(self, steps: int, external_input: Callable[[float], float] = None) -> np.ndarray:
        """
        Simulation sur plusieurs pas de temps
        """
        if external_input is None:
            external_input = lambda t: 0

        states = []
        for i in range(steps):
            input_val = external_input(self.time)
            state = self.step(input_val)
            states.append(state)

        return np.array(states)

    def analyze_stability(self) -> dict:
        """
        Analyse la stabilité du système

        Critère: Si gain total des boucles positives < 1, stable
        """
        positive_gain = sum(
            loop.gain for loop in self.loops
            if loop.feedback_type == FeedbackType.POSITIVE
        )
        negative_gain = sum(
            loop.gain for loop in self.loops
            if loop.feedback_type == FeedbackType.NEGATIVE
        )

        net_gain = positive_gain - negative_gain

        return {
            'positive_gain': positive_gain,
            'negative_gain': negative_gain,
            'net_gain': net_gain,
            'stable': net_gain < 1,
            'oscillatory': any(loop.delay > 0 for loop in self.loops) and negative_gain > 0
        }


class PIDController:
    """
    Contrôleur PID - Application classique de la rétroaction négative

    u(t) = Kp*e(t) + Ki*∫e(τ)dτ + Kd*de(t)/dt

    où e(t) = setpoint - measured_value
    """

    def __init__(self, kp: float, ki: float, kd: float):
        self.kp = kp  # Gain proportionnel
        self.ki = ki  # Gain intégral
        self.kd = kd  # Gain dérivé

        self.integral = 0
        self.previous_error = 0
        self.setpoint = 0

    def set_target(self, setpoint: float):
        """Définit la consigne"""
        self.setpoint = setpoint

    def update(self, measured_value: float, dt: float = 1.0) -> float:
        """
        Calcule la commande de contrôle

        ┌─────────────────────────────────────────────────────┐
        │                                                     │
        │  Consigne ──┬──▶ [⊖] ──▶ Erreur ──┬──▶ [P] ──┐    │
        │             │                      │           │    │
        │             │                      ├──▶ [I] ──┼──▶ Σ ──▶ Commande
        │             │                      │           │    │
        │             │                      └──▶ [D] ──┘    │
        │             │                                       │
        │  Mesure ────┘◀──────── Système ◀────────────────────│
        │                                                     │
        └─────────────────────────────────────────────────────┘
        """
        # Erreur
        error = self.setpoint - measured_value

        # Terme Proportionnel: réagit à l'erreur actuelle
        p_term = self.kp * error

        # Terme Intégral: élimine l'erreur statique
        self.integral += error * dt
        i_term = self.ki * self.integral

        # Terme Dérivé: anticipe les changements
        derivative = (error - self.previous_error) / dt
        d_term = self.kd * derivative

        self.previous_error = error

        return p_term + i_term + d_term

    def reset(self):
        """Réinitialise l'état du contrôleur"""
        self.integral = 0
        self.previous_error = 0
```

## Diagramme: Dynamiques des Boucles

```
┌─────────────────────────────────────────────────────────────────┐
│            COMPORTEMENTS SELON LE TYPE DE RÉTROACTION           │
└─────────────────────────────────────────────────────────────────┘

RÉTROACTION NÉGATIVE (gain < 1):          RÉTROACTION POSITIVE:

     │                                          │
     │    ~~~                                   │           ╱
   S │   ╱   ╲__________                      S │         ╱
   o │  ╱                                     o │       ╱
   r │ ╱                                      r │     ╱
   t │╱                                       t │   ╱
   i │                                        i │ ╱
   e │                                        e │╱
     └──────────────────▶                      └──────────────────▶
              Temps                                    Temps

     → Convergence vers équilibre              → Croissance exponentielle


OSCILLATION (rétro. négative + délai):     EFFONDREMENT (rétro. + positive):

     │      ╱╲    ╱╲                            │ ╲
   S │     ╱  ╲  ╱  ╲   ╱╲                    S │  ╲
   o │    ╱    ╲╱    ╲ ╱  ╲__                 o │   ╲
   r │   ╱            ╲                       r │    ╲
   t │  ╱              ╲                      t │     ╲
   i │ ╱                                      i │      ╲
   e │╱                                       e │       ╲____
     └──────────────────▶                      └──────────────────▶
              Temps                                    Temps

     → Oscillations amorties                   → Décroissance rapide
```

## Boucles Imbriquées

```
┌─────────────────────────────────────────────────────────────────┐
│                   BOUCLES MULTI-NIVEAUX                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   NIVEAU STRATÉGIQUE (lent)                                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   NIVEAU TACTIQUE (moyen)                              │   │
│   │   ┌─────────────────────────────────────────────────┐  │   │
│   │   │                                                 │  │   │
│   │   │   NIVEAU OPÉRATIONNEL (rapide)                 │  │   │
│   │   │   ┌─────────────────────────────────────────┐  │  │   │
│   │   │   │                                         │  │  │   │
│   │   │   │    ┌────────┐      ┌────────┐          │  │  │   │
│   │   │   │    │ Action │──────│ Résult │          │  │  │   │
│   │   │   │    └────┬───┘      └────┬───┘          │  │  │   │
│   │   │   │         │               │              │  │  │   │
│   │   │   │         └───────◀───────┘ Feedback 1   │  │  │   │
│   │   │   │                   (ms-sec)             │  │  │   │
│   │   │   └─────────────────────┬───────────────────┘  │  │   │
│   │   │                         │                       │  │   │
│   │   │         ◀───────────────┘ Feedback 2 (min-h)   │  │   │
│   │   └─────────────────────────┬───────────────────────┘  │   │
│   │                             │                           │   │
│   │             ◀───────────────┘ Feedback 3 (jours-mois)  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Exemple: Contrôle moteur humain                               │
│   • Niveau 1: Réflexe spinal (ms)                               │
│   • Niveau 2: Coordination cervelet (100ms)                     │
│   • Niveau 3: Planification cortex (secondes)                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Modèle de Stock-Flux avec Rétroaction

```python
class StockFlowModel:
    """
    Modèle Stock-Flux pour la pensée systémique
    Utilisé en dynamique des systèmes (System Dynamics)
    """

    def __init__(self):
        self.stocks = {}      # Variables d'état (accumulateurs)
        self.flows = {}       # Taux de changement
        self.auxiliaries = {} # Variables auxiliaires
        self.parameters = {}  # Constantes

    def add_stock(self, name: str, initial: float):
        """
        Stock = Accumulation
        dStock/dt = Σ(inflows) - Σ(outflows)
        """
        self.stocks[name] = {
            'value': initial,
            'inflows': [],
            'outflows': []
        }

    def add_flow(self, name: str, source: str, target: str,
                 rate_function: Callable):
        """
        Flow = Taux de transfert
        Connecte stocks ou représente entrée/sortie système
        """
        self.flows[name] = {
            'source': source,
            'target': target,
            'rate_fn': rate_function
        }

        if source in self.stocks:
            self.stocks[source]['outflows'].append(name)
        if target in self.stocks:
            self.stocks[target]['inflows'].append(name)

    def step(self, dt: float = 1.0) -> dict:
        """
        Intégration d'Euler pour un pas de temps
        """
        # Calculer tous les flux
        flow_values = {}
        for name, flow in self.flows.items():
            # Le taux dépend de l'état actuel (crée la rétroaction)
            context = {**self.stocks, **self.parameters, **self.auxiliaries}
            flow_values[name] = flow['rate_fn'](context)

        # Mettre à jour les stocks
        for stock_name, stock in self.stocks.items():
            net_flow = 0
            for inflow in stock['inflows']:
                net_flow += flow_values[inflow]
            for outflow in stock['outflows']:
                net_flow -= flow_values[outflow]

            stock['value'] += net_flow * dt

        return {name: stock['value'] for name, stock in self.stocks.items()}

    def simulate(self, duration: float, dt: float = 1.0) -> dict:
        """Simulation complète"""
        history = {name: [stock['value']] for name, stock in self.stocks.items()}

        t = 0
        while t < duration:
            state = self.step(dt)
            for name, value in state.items():
                history[name].append(value)
            t += dt

        return history


# Exemple: Modèle proie-prédateur (Lotka-Volterra)
def create_predator_prey_model():
    """
    ┌─────────────────────────────────────────────────────────┐
    │              MODÈLE PROIE-PRÉDATEUR                     │
    │                                                         │
    │         reproduction              prédation             │
    │              │                        │                 │
    │              ▼                        ▼                 │
    │   ┌────▶ [PROIES] ─────────────▶ [PRÉDATEURS] ────┐   │
    │   │         │                        │             │   │
    │   │         │                        │             │   │
    │   │         └────────────────────────┘             │   │
    │   │              (boucle négative)                 │   │
    │   │                                                │   │
    │   └────────────────────────────────────────────────┘   │
    │              (boucle positive: plus de proies          │
    │               = plus de nourriture = plus prédateurs   │
    │               = moins de proies = moins prédateurs)    │
    │                                                         │
    └─────────────────────────────────────────────────────────┘
    """
    model = StockFlowModel()

    # Stocks
    model.add_stock('proies', initial=100)
    model.add_stock('predateurs', initial=20)

    # Paramètres
    model.parameters = {
        'taux_reproduction_proies': 0.1,
        'taux_predation': 0.01,
        'efficacite_conversion': 0.01,
        'taux_mortalite_predateurs': 0.1
    }

    # Flux avec rétroaction
    model.add_flow(
        'naissances_proies',
        source='external',
        target='proies',
        rate_function=lambda ctx: ctx['taux_reproduction_proies'] * ctx['proies']['value']
    )

    model.add_flow(
        'predation',
        source='proies',
        target='external',
        rate_function=lambda ctx: (ctx['taux_predation'] *
                                   ctx['proies']['value'] *
                                   ctx['predateurs']['value'])
    )

    model.add_flow(
        'naissances_predateurs',
        source='external',
        target='predateurs',
        rate_function=lambda ctx: (ctx['efficacite_conversion'] *
                                   ctx['proies']['value'] *
                                   ctx['predateurs']['value'])
    )

    model.add_flow(
        'morts_predateurs',
        source='predateurs',
        target='external',
        rate_function=lambda ctx: ctx['taux_mortalite_predateurs'] * ctx['predateurs']['value']
    )

    return model
```

## Archétypes Systémiques

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHÉTYPES SYSTÉMIQUES                        │
│            Patterns récurrents de boucles de rétroaction        │
└─────────────────────────────────────────────────────────────────┘

1. LIMITES À LA CROISSANCE
   ─────────────────────────

        ┌──────────────────────────────────────┐
        │                                      │
        │    (+)           (-)                │
        │   ┌───┐        ┌───┐                │
        │   │   │        │   │                │
        │   ▼   │        │   ▼                │
        │  Croissance ──▶ Limite ──▶ Contrainte
        │   ▲                         │        │
        │   └─────────────────────────┘        │
        │                                      │
        └──────────────────────────────────────┘

   Exemple: Startup qui sature son marché

2. DÉPLACEMENT DE CHARGE
   ─────────────────────────

        Solution           Problème          Solution
        symptomatique        │              fondamentale
             │               │                   │
             ▼               │                   ▼
            (-)◀─────────────┴─────────────▶(-)
             │                                   │
             │ (effet secondaire)               │
             ▼                                   │
        Aggravation ────────────────────────────┘

   Exemple: Dettes pour masquer problème de productivité

3. ESCALADE
   ─────────────────────────

        Action A ──▶ Menace pour B ──▶ Action B
           ▲                              │
           │                              │
           └────── Menace pour A ◀────────┘

   Exemple: Course aux armements

4. SUCCÈS AUX PLUS FORTS
   ─────────────────────────

        Ressources A ◀────┬────▶ Ressources B
             │            │            │
             ▼            │            ▼
        Succès A    Allocation    Succès B
             │            │            │
             └────────────┴────────────┘

   Exemple: Effet Matthieu en science
```

## Applications Pratiques

```python
class SystemArchetype:
    """
    Implémentation des archétypes systémiques
    """

    @staticmethod
    def limits_to_growth(initial_size: float, growth_rate: float,
                         carrying_capacity: float, steps: int) -> List[float]:
        """
        Archétype: Limites à la croissance

        dx/dt = r*x*(1 - x/K)

        où:
        - r = taux de croissance intrinsèque
        - K = capacité de charge (limite)
        """
        history = [initial_size]
        x = initial_size

        for _ in range(steps):
            # Boucle positive: croissance proportionnelle à x
            growth = growth_rate * x
            # Boucle négative: ralentissement près de la capacité
            constraint = 1 - (x / carrying_capacity)

            dx = growth * constraint
            x += dx
            x = max(0, x)  # Non-négatif

            history.append(x)

        return history

    @staticmethod
    def shifting_burden(problem_size: float, quick_fix_strength: float,
                        fundamental_delay: int, steps: int) -> dict:
        """
        Archétype: Déplacement de charge

        La solution rapide masque le problème mais crée une dépendance
        """
        history = {
            'problem': [problem_size],
            'quick_fix_dependency': [0],
            'fundamental_capability': [1.0]
        }

        problem = problem_size
        dependency = 0
        capability = 1.0

        for t in range(steps):
            # Quick fix réduit le problème visible
            visible_problem = max(0, problem - quick_fix_strength * dependency)

            # Mais crée une dépendance
            dependency += 0.1 if visible_problem > 0 else -0.05
            dependency = max(0, dependency)

            # Et érode la capacité fondamentale
            capability -= 0.02 * dependency
            capability = max(0.1, capability)

            # Le problème réel augmente avec la perte de capacité
            problem = problem_size / capability

            history['problem'].append(problem)
            history['quick_fix_dependency'].append(dependency)
            history['fundamental_capability'].append(capability)

        return history

    @staticmethod
    def escalation(initial_action_a: float, initial_action_b: float,
                   escalation_rate: float, steps: int) -> dict:
        """
        Archétype: Escalade

        Chaque partie réagit à l'autre, créant une spirale
        """
        history = {'A': [initial_action_a], 'B': [initial_action_b]}

        a, b = initial_action_a, initial_action_b

        for _ in range(steps):
            # A réagit à B
            new_a = a + escalation_rate * (b - a) if b > a else a * 0.95
            # B réagit à A
            new_b = b + escalation_rate * (a - b) if a > b else b * 0.95

            a, b = new_a, new_b

            history['A'].append(a)
            history['B'].append(b)

        return history
```

## Visualisation ASCII des Dynamiques

```
┌─────────────────────────────────────────────────────────────────┐
│            COMPARAISON DES COMPORTEMENTS DYNAMIQUES             │
└─────────────────────────────────────────────────────────────────┘

Sans rétroaction:                   Avec rétroaction négative:
Entrée constante → Sortie constante Entrée constante → Équilibre

    │ Entrée        │ Sortie            │            ╭──────────
    │───────────    │───────────        │           ╱
    │               │                   │          ╱
    │               │                   │         ╱
    │               │                   │        ╱
    └───────────▶   └───────────▶      └───────────────────────▶
         Temps           Temps                    Temps

Avec rétroaction positive:          Avec boucles couplées:
Croissance exponentielle            Oscillations

    │           ╱                       │     ╱╲     ╱╲
    │          ╱                        │    ╱  ╲   ╱  ╲
    │         ╱                         │   ╱    ╲ ╱    ╲
    │       ╱                           │  ╱      ╳      ╲
    │    ╱                              │ ╱      ╱ ╲      ╲
    └───────────────────▶              └───────────────────────▶
              Temps                              Temps
```

## Conclusion

```
┌─────────────────────────────────────────────────────────────────┐
│               PRINCIPES DES BOUCLES DE RÉTROACTION              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. UBIQUITÉ                                                    │
│     Présentes dans tous les systèmes persistants                │
│                                                                  │
│  2. DUALITÉ                                                     │
│     Négative → Stabilité, Régulation                            │
│     Positive → Croissance, Changement                           │
│                                                                  │
│  3. DÉLAI                                                       │
│     Le délai dans une boucle génère oscillations                │
│                                                                  │
│  4. DOMINANCE                                                   │
│     Une boucle domine les autres à un moment donné              │
│     La dominance peut changer dynamiquement                     │
│                                                                  │
│  5. INTERVENTION                                                │
│     Pour changer un système: identifier et modifier             │
│     les boucles dominantes                                      │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ "Structure détermine comportement"                        │ │
│  │ - Jay Forrester, fondateur de System Dynamics             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*"La rétroaction est le secret de l'activité naturelle." - Norbert Wiener*
