# Complexité : Au-delà du Simple et du Compliqué

## Définition

La complexité désigne les propriétés des systèmes dont le comportement global ne peut être compris par la simple analyse de leurs parties, caractérisés par des interactions non-linéaires, une émergence, et une sensibilité aux conditions.

```
┌─────────────────────────────────────────────────────────────┐
│              SIMPLE vs COMPLIQUÉ vs COMPLEXE                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   SIMPLE                 COMPLIQUÉ              COMPLEXE    │
│   ───────                ──────────             ─────────   │
│                                                              │
│   ●───●                  ●───┬───●              ●═══●═══●   │
│                          │   │   │              ║   ║   ║   │
│   Peu de parties         ●───┼───●              ●═══●═══●   │
│   Peu d'interactions     │   │   │              ║   ║   ║   │
│   Comportement           ●───┴───●              ●═══●═══●   │
│   prévisible                                                │
│                          Beaucoup parties      Interactions │
│   Ex: Pendule            Interactions simples  non-linéaires│
│       Levier             Démontable           Émergence     │
│                                                Imprévisible │
│                          Ex: Montre           Ex: Cerveau   │
│                              Avion                Ville     │
│                              Ordinateur           Économie  │
│                                                              │
│   Peut être               Peut être             Ne peut être│
│   COMPRIS                 DÉMONTÉ               que DÉCRIT  │
│   par analyse             et REMONTÉ            et SIMULÉ   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Caractéristiques des Systèmes Complexes

```
┌─────────────────────────────────────────────────────────────────┐
│           SIGNATURES DE LA COMPLEXITÉ                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. NON-LINÉARITÉ                                               │
│     Petites causes → grands effets (et vice versa)              │
│     f(a+b) ≠ f(a) + f(b)                                       │
│                                                                  │
│  2. ÉMERGENCE                                                   │
│     Propriétés du tout absentes des parties                     │
│     Le tout > somme des parties                                 │
│                                                                  │
│  3. AUTO-ORGANISATION                                           │
│     Ordre spontané sans contrôle central                        │
│                                                                  │
│  4. ADAPTATION                                                  │
│     Le système change en réponse à l'environnement             │
│                                                                  │
│  5. RÉTROACTIONS                                                │
│     Boucles positives et négatives                              │
│                                                                  │
│  6. SENSIBILITÉ AUX CONDITIONS INITIALES                       │
│     "Effet papillon"                                            │
│                                                                  │
│  7. ORGANISATION HIÉRARCHIQUE                                   │
│     Niveaux imbriqués                                           │
│                                                                  │
│  8. LOIS DE PUISSANCE                                           │
│     Distributions sans échelle caractéristique                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Mesures de Complexité

```python
"""
Mesures de la complexité computationnelle et informationnelle
"""

import numpy as np
from typing import List, Dict, Tuple, Callable
from collections import Counter
import zlib

class ComplexityMeasures:
    """
    Différentes façons de mesurer la complexité
    """

    @staticmethod
    def kolmogorov_complexity_approx(data: bytes) -> int:
        """
        Approximation de la complexité de Kolmogorov
        via compression

        K(x) = longueur du plus court programme produisant x

        ┌────────────────────────────────────────────────────┐
        │       COMPLEXITÉ DE KOLMOGOROV                     │
        ├────────────────────────────────────────────────────┤
        │                                                    │
        │   Faible complexité:                              │
        │   "aaaaaaaaaa" → K ≈ "print('a'*10)" = 15 bits   │
        │                                                    │
        │   Haute complexité:                               │
        │   "xj2k9f3..." → K ≈ len(string) bits            │
        │   (incompressible)                                │
        │                                                    │
        │   Note: K(x) est non-calculable!                  │
        │   On l'approxime par compression.                 │
        │                                                    │
        └────────────────────────────────────────────────────┘
        """
        compressed = zlib.compress(data, level=9)
        return len(compressed)

    @staticmethod
    def shannon_entropy(data: str) -> float:
        """
        Entropie de Shannon

        H(X) = -Σ p(x) log₂ p(x)

        Mesure l'incertitude moyenne
        """
        if not data:
            return 0.0

        freq = Counter(data)
        probs = np.array(list(freq.values())) / len(data)
        return -np.sum(probs * np.log2(probs))

    @staticmethod
    def statistical_complexity(data: str, word_length: int = 3) -> float:
        """
        Complexité statistique (Crutchfield)

        Balance entre ordre et désordre

        Haute quand: structure ET imprévisibilité

        ┌────────────────────────────────────────────────────┐
        │       COMPLEXITÉ STATISTIQUE                       │
        ├────────────────────────────────────────────────────┤
        │                                                    │
        │  Complexité │                                      │
        │             │            ●                         │
        │             │           ╱ ╲                        │
        │             │          ╱   ╲                       │
        │             │         ╱     ╲                      │
        │             │        ╱       ╲                     │
        │             │       ╱         ╲                    │
        │             └──────╱───────────╲────────▶         │
        │                 Ordre        Désordre             │
        │              (cristal)   (gaz parfait)            │
        │                                                    │
        │   Maximum au "bord du chaos"                      │
        │                                                    │
        └────────────────────────────────────────────────────┘
        """
        if len(data) < word_length:
            return 0.0

        # Extraire les mots (n-grammes)
        words = [data[i:i+word_length] for i in range(len(data) - word_length + 1)]

        # Distribution des mots
        freq = Counter(words)
        probs = np.array(list(freq.values())) / len(words)

        # Entropie des mots
        h_words = -np.sum(probs * np.log2(probs))

        # Entropie maximale
        h_max = np.log2(min(len(freq), 26**word_length))

        if h_max == 0:
            return 0.0

        # Complexité = entropie normalisée * (1 - entropie normalisée)
        # Maximum à entropie = 0.5
        h_norm = h_words / h_max
        return 4 * h_norm * (1 - h_norm)  # Parabole, max = 1

    @staticmethod
    def effective_complexity(data: str) -> float:
        """
        Complexité effective (Gell-Mann)

        Longueur de la description des régularités

        Ni le chaos pur ni l'ordre pur ne sont complexes;
        la complexité est dans les RÉGULARITÉS PARTIELLES.
        """
        # Approximation: parties compressibles vs incompressibles
        data_bytes = data.encode()
        original_len = len(data_bytes)
        compressed_len = len(zlib.compress(data_bytes, level=9))

        # Régularité = ce qui peut être compressé
        regularity = original_len - compressed_len

        # Random = ce qui ne peut pas être compressé
        randomness = compressed_len

        # Complexité effective = régularité (les patterns)
        return regularity / original_len if original_len > 0 else 0

    @staticmethod
    def logical_depth(program: str, output: str) -> int:
        """
        Profondeur logique (Bennett)

        Temps de calcul du programme minimal produisant l'output

        Intuition: un objet est "profond" s'il est le résultat
        d'un long calcul mais peut être compressé.

        Ex: Les décimales de π sont profondes
            - Court programme (formule de π)
            - Long calcul (beaucoup de décimales)
        """
        # Approximation très grossière
        # (la vraie profondeur est non-calculable)
        compressed_output = zlib.compress(output.encode())
        compression_ratio = len(compressed_output) / len(output.encode())

        # Profondeur ∝ 1/compression_ratio pour données structurées
        if compression_ratio > 0:
            return int(100 * (1 - compression_ratio))
        return 0


class NetworkComplexity:
    """
    Mesures de complexité pour les réseaux
    """

    def __init__(self, adjacency_matrix: np.ndarray):
        self.adj = adjacency_matrix
        self.n = len(adjacency_matrix)

    def density(self) -> float:
        """Densité du réseau: nombre d'arêtes / nombre possible"""
        n_edges = np.sum(self.adj) / 2  # Non-dirigé
        n_possible = self.n * (self.n - 1) / 2
        return n_edges / n_possible if n_possible > 0 else 0

    def clustering_coefficient(self) -> float:
        """
        Coefficient de clustering moyen

        Mesure la probabilité que deux voisins d'un noeud
        soient eux-mêmes voisins.
        """
        coefficients = []

        for i in range(self.n):
            neighbors = np.where(self.adj[i] > 0)[0]
            k = len(neighbors)

            if k < 2:
                continue

            # Compter les liens entre voisins
            links = 0
            for j in range(len(neighbors)):
                for l in range(j + 1, len(neighbors)):
                    if self.adj[neighbors[j], neighbors[l]] > 0:
                        links += 1

            possible = k * (k - 1) / 2
            coefficients.append(links / possible)

        return np.mean(coefficients) if coefficients else 0

    def average_path_length(self) -> float:
        """
        Longueur moyenne du plus court chemin

        Utilise Floyd-Warshall
        """
        # Matrice des distances
        dist = np.full((self.n, self.n), np.inf)
        np.fill_diagonal(dist, 0)
        dist[self.adj > 0] = 1

        # Floyd-Warshall
        for k in range(self.n):
            for i in range(self.n):
                for j in range(self.n):
                    if dist[i, k] + dist[k, j] < dist[i, j]:
                        dist[i, j] = dist[i, k] + dist[k, j]

        # Moyenne (exclure infinis et diagonale)
        finite_dists = dist[np.isfinite(dist) & (dist > 0)]
        return np.mean(finite_dists) if len(finite_dists) > 0 else np.inf

    def small_world_coefficient(self) -> float:
        """
        Coefficient "petit monde" (Watts-Strogatz)

        σ = (C/C_random) / (L/L_random)

        Haut clustering + courts chemins = petit monde
        """
        C = self.clustering_coefficient()
        L = self.average_path_length()

        # Valeurs pour réseau aléatoire équivalent
        p = self.density()
        C_random = p  # Approximation
        L_random = np.log(self.n) / np.log(self.n * p) if p > 0 else np.inf

        if C_random == 0 or L_random == 0 or np.isinf(L):
            return 0

        return (C / C_random) / (L / L_random)

    def degree_distribution(self) -> Dict[int, float]:
        """
        Distribution des degrés

        Les réseaux complexes ont souvent des distributions
        en loi de puissance: P(k) ~ k^(-γ)
        """
        degrees = np.sum(self.adj > 0, axis=1)
        freq = Counter(degrees)
        total = self.n
        return {k: v/total for k, v in freq.items()}

    def power_law_exponent(self) -> float:
        """
        Estime l'exposant de la loi de puissance
        via régression log-log
        """
        dist = self.degree_distribution()
        degrees = np.array(list(dist.keys()))
        probs = np.array(list(dist.values()))

        # Filtrer zéros
        mask = (degrees > 0) & (probs > 0)
        if np.sum(mask) < 2:
            return 0

        log_k = np.log(degrees[mask])
        log_p = np.log(probs[mask])

        # Régression linéaire
        slope, _ = np.polyfit(log_k, log_p, 1)
        return -slope  # γ (généralement entre 2 et 3)
```

## Systèmes Adaptatifs Complexes (CAS)

```
┌─────────────────────────────────────────────────────────────────┐
│              SYSTÈMES ADAPTATIFS COMPLEXES                       │
│                    (Santa Fe Institute)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Un CAS est composé d'AGENTS qui:                              │
│   • Interagissent localement                                    │
│   • S'adaptent à leur environnement                             │
│   • Apprennent et évoluent                                      │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │    Agent ←──────→ Agent ←──────→ Agent                 │   │
│   │      │              │              │                    │   │
│   │      │              │              │                    │   │
│   │      ↓              ↓              ↓                    │   │
│   │    Agent ←──────→ Agent ←──────→ Agent                 │   │
│   │      │              │              │                    │   │
│   │      │    ENVIRONNEMENT           │                    │   │
│   │      ↓              ↓              ↓                    │   │
│   │    Agent ←──────→ Agent ←──────→ Agent                 │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Exemples:                                                     │
│   • Écosystèmes                                                 │
│   • Système immunitaire                                         │
│   • Marchés financiers                                          │
│   • Villes                                                      │
│   • Internet                                                    │
│   • Cerveau                                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```python
class ComplexAdaptiveSystem:
    """
    Système adaptatif complexe générique
    """

    def __init__(self, n_agents: int, environment_size: int):
        self.n_agents = n_agents
        self.env_size = environment_size
        self.agents = []
        self.environment = np.zeros(environment_size)
        self.time = 0

    def initialize_agents(self, agent_factory: Callable):
        """Crée les agents"""
        self.agents = [agent_factory(i) for i in range(self.n_agents)]

    def step(self):
        """
        Un pas de simulation:
        1. Agents perçoivent l'environnement
        2. Agents décident et agissent
        3. Environnement mis à jour
        4. Agents s'adaptent
        """
        # Perception et action
        actions = []
        for agent in self.agents:
            perception = agent.perceive(self.environment, self.agents)
            action = agent.decide(perception)
            actions.append(action)

        # Mise à jour de l'environnement
        for agent, action in zip(self.agents, actions):
            agent.act(action, self.environment)

        # Adaptation
        for agent in self.agents:
            feedback = self.evaluate(agent)
            agent.adapt(feedback)

        self.time += 1

    def evaluate(self, agent) -> float:
        """Évalue la performance d'un agent"""
        # À implémenter selon le contexte
        return 0.0

    def emergent_properties(self) -> Dict:
        """Détecte les propriétés émergentes"""
        return {
            'global_order': self._measure_order(),
            'diversity': self._measure_diversity(),
            'clustering': self._measure_clustering()
        }

    def _measure_order(self) -> float:
        """Mesure l'ordre global"""
        return 0.0  # À implémenter

    def _measure_diversity(self) -> float:
        """Mesure la diversité des agents"""
        return 0.0  # À implémenter

    def _measure_clustering(self) -> float:
        """Mesure le clustering spatial"""
        return 0.0  # À implémenter


class AdaptiveAgent:
    """
    Agent adaptatif pour CAS
    """

    def __init__(self, agent_id: int):
        self.id = agent_id
        self.position = np.random.rand(2)
        self.strategy = np.random.rand(10)  # Vecteur de stratégie
        self.fitness = 0.0
        self.memory = []

    def perceive(self, environment: np.ndarray, agents: List) -> Dict:
        """Perçoit l'environnement local"""
        # Voisins proches
        neighbors = []
        for other in agents:
            if other.id != self.id:
                dist = np.linalg.norm(self.position - other.position)
                if dist < 0.2:  # Rayon de perception
                    neighbors.append(other)

        return {
            'local_env': environment[int(self.position[0] * len(environment))],
            'neighbors': neighbors,
            'n_neighbors': len(neighbors)
        }

    def decide(self, perception: Dict) -> np.ndarray:
        """Prend une décision basée sur la perception"""
        # Décision simple basée sur la stratégie
        if perception['n_neighbors'] > 2:
            # Trop de voisins: s'éloigner
            return -0.1 * np.random.rand(2)
        else:
            # Peu de voisins: se rapprocher du centre
            return 0.1 * (0.5 - self.position)

    def act(self, action: np.ndarray, environment: np.ndarray):
        """Exécute l'action"""
        self.position += action
        self.position = np.clip(self.position, 0, 1)

    def adapt(self, feedback: float):
        """S'adapte en fonction du feedback"""
        self.fitness = 0.9 * self.fitness + 0.1 * feedback

        # Mutation de la stratégie si fitness faible
        if self.fitness < 0.3:
            self.strategy += 0.1 * np.random.randn(10)
            self.strategy = np.clip(self.strategy, 0, 1)
```

## Le Bord du Chaos

```
┌─────────────────────────────────────────────────────────────────┐
│                     LE BORD DU CHAOS                             │
│              (Kauffman, Langton, Packard)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Hypothèse: La vie et l'intelligence émergent au               │
│   "bord du chaos" - transition entre ordre et désordre          │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   Propriété │                                           │   │
│   │             │         BORD DU CHAOS                     │   │
│   │             │              │                            │   │
│   │   Calcul    │              ●                            │   │
│   │   Adaptation│             ╱│╲                           │   │
│   │   Évolution │            ╱ │ ╲                          │   │
│   │             │           ╱  │  ╲                         │   │
│   │             │          ╱   │   ╲                        │   │
│   │             │         ╱    │    ╲                       │   │
│   │             └────────╱─────┼─────╲──────────▶           │   │
│   │                   ORDRE   λc    CHAOS                   │   │
│   │                  (gelé)        (aléatoire)              │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Paramètre λ (Langton):                                        │
│   λ = 0: Toutes les cellules → même état (gelé)                │
│   λ = 1: Aucune régularité (aléatoire)                         │
│   λ ≈ λc: Maximum de capacité computationnelle                 │
│                                                                  │
│   Au bord:                                                      │
│   • Longue corrélation spatiale et temporelle                  │
│   • Structures métastables                                      │
│   • Sensibilité et stabilité équilibrées                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```python
class EdgeOfChaos:
    """
    Exploration du bord du chaos avec automates cellulaires
    """

    def __init__(self, size: int = 100, n_states: int = 2):
        self.size = size
        self.n_states = n_states
        self.state = np.random.randint(0, n_states, size)
        self.rule_table = {}

    def generate_rule(self, lambda_param: float):
        """
        Génère une règle avec paramètre λ donné

        λ = fraction de transitions vers états non-quiescents
        """
        self.rule_table = {}

        # Toutes les configurations de voisinage possibles (rayon 1)
        for left in range(self.n_states):
            for center in range(self.n_states):
                for right in range(self.n_states):
                    config = (left, center, right)

                    if np.random.random() < lambda_param:
                        # Transition vers état non-quiescent
                        self.rule_table[config] = np.random.randint(1, self.n_states)
                    else:
                        # Transition vers état quiescent (0)
                        self.rule_table[config] = 0

    def step(self) -> np.ndarray:
        """Un pas de l'automate"""
        new_state = np.zeros(self.size, dtype=int)

        for i in range(self.size):
            left = self.state[(i - 1) % self.size]
            center = self.state[i]
            right = self.state[(i + 1) % self.size]

            config = (left, center, right)
            new_state[i] = self.rule_table.get(config, 0)

        self.state = new_state
        return self.state

    def simulate(self, steps: int) -> np.ndarray:
        """Simulation et enregistrement de l'histoire"""
        history = [self.state.copy()]
        for _ in range(steps):
            self.step()
            history.append(self.state.copy())
        return np.array(history)

    def measure_dynamics(self, steps: int = 1000) -> Dict:
        """
        Mesure les propriétés dynamiques
        """
        history = self.simulate(steps)

        # Densité moyenne
        density = np.mean(history > 0)

        # Entropie spatiale
        from collections import Counter
        patterns = [tuple(row) for row in history]
        freq = Counter(patterns)
        probs = np.array(list(freq.values())) / len(patterns)
        entropy = -np.sum(probs * np.log2(probs + 1e-10))

        # Longueur de corrélation (approximation)
        final = history[-1]
        corr = np.correlate(final, final, mode='full')
        corr = corr[len(corr)//2:]
        corr_length = np.argmax(corr < corr[0] * 0.5) if np.any(corr < corr[0] * 0.5) else self.size

        return {
            'density': density,
            'entropy': entropy,
            'correlation_length': corr_length,
            'at_edge': 0.3 < density < 0.7 and corr_length > self.size * 0.1
        }

    def find_critical_lambda(self, resolution: int = 20) -> float:
        """
        Trouve λc où la complexité est maximale
        """
        lambdas = np.linspace(0.1, 0.9, resolution)
        entropies = []

        for lam in lambdas:
            self.state = np.random.randint(0, self.n_states, self.size)
            self.generate_rule(lam)
            metrics = self.measure_dynamics(500)
            entropies.append(metrics['entropy'])

        # λc où l'entropie est maximale
        max_idx = np.argmax(entropies)
        return lambdas[max_idx]
```

## Lois de Puissance et Invariance d'Échelle

```
┌─────────────────────────────────────────────────────────────────┐
│              LOIS DE PUISSANCE (POWER LAWS)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   P(x) ∝ x^(-α)                                                 │
│                                                                  │
│   Caractéristique des systèmes complexes:                       │
│   pas d'échelle caractéristique (scale-free)                    │
│                                                                  │
│   Distribution normale:          Distribution en loi de puissance:
│                                                                  │
│   P(x)│     ╱╲                   P(x)│╲                         │
│       │    ╱  ╲                      │ ╲                        │
│       │   ╱    ╲                     │  ╲                       │
│       │  ╱      ╲                    │   ╲╲                     │
│       │ ╱        ╲                   │    ╲╲╲                   │
│       │╱          ╲                  │      ╲╲╲╲                │
│       └─────────────▶ x              └───────────╲╲╲▶ x        │
│        (échelle typique)              (pas d'échelle)           │
│                                                                  │
│   Exemples:                                                     │
│   • Taille des villes (loi de Zipf)                            │
│   • Revenus (loi de Pareto)                                    │
│   • Tremblements de terre (Gutenberg-Richter)                  │
│   • Connexions internet                                         │
│   • Citations scientifiques                                     │
│   • Fréquence des mots                                         │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │   En échelle log-log, une loi de puissance             │   │
│   │   apparaît comme une droite de pente -α                │   │
│   │                                                         │   │
│   │   log P(x) = -α log(x) + c                             │   │
│   │                                                         │   │
│   │   log P│ ╲                                             │   │
│   │        │  ╲                                            │   │
│   │        │   ╲    pente = -α                            │   │
│   │        │    ╲                                          │   │
│   │        │     ╲                                         │   │
│   │        └──────╲────────▶ log x                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Applications

```
┌─────────────────────────────────────────────────────────────────┐
│                  APPLICATIONS DE LA COMPLEXITÉ                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ÉCOLOGIE:                                                      │
│  • Dynamique des écosystèmes                                   │
│  • Réseaux trophiques                                          │
│  • Extinctions en cascade                                       │
│                                                                  │
│  ÉCONOMIE:                                                      │
│  • Marchés comme CAS                                           │
│  • Crises financières                                          │
│  • Économie de réseau                                          │
│                                                                  │
│  URBANISME:                                                     │
│  • Croissance des villes                                       │
│  • Flux de transport                                           │
│  • Ségrégation spatiale                                        │
│                                                                  │
│  SANTÉ:                                                         │
│  • Épidémiologie                                               │
│  • Système immunitaire                                         │
│  • Réseaux de neurones                                         │
│                                                                  │
│  TECHNOLOGIE:                                                   │
│  • Internet et réseaux sociaux                                 │
│  • Systèmes distribués                                         │
│  • Intelligence artificielle                                   │
│                                                                  │
│  SCIENCES SOCIALES:                                             │
│  • Diffusion de l'innovation                                   │
│  • Formation de l'opinion                                      │
│  • Organisations                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Conclusion

```
┌─────────────────────────────────────────────────────────────────┐
│                   ESSENCE DE LA COMPLEXITÉ                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   "La complexité n'est pas le désordre. C'est l'ordre          │
│    qui émerge du désordre apparent."                            │
│                                                                  │
│   Leçons fondamentales:                                         │
│                                                                  │
│   1. LIMITES DE LA PRÉDICTION                                   │
│      Les systèmes complexes sont intrinsèquement               │
│      imprévisibles à long terme                                 │
│                                                                  │
│   2. POUVOIR DE L'ÉMERGENCE                                     │
│      L'ordre peut naître spontanément des interactions         │
│      locales simples                                            │
│                                                                  │
│   3. IMPORTANCE DES RÉSEAUX                                     │
│      La structure des connexions compte autant                  │
│      que les propriétés des composants                          │
│                                                                  │
│   4. UBIQUITÉ                                                   │
│      La complexité est partout: nature, société, technologie   │
│                                                                  │
│   5. NOUVELLES MÉTHODES                                         │
│      Simulation, modélisation agent, analyse de réseaux        │
│      plutôt que réductionnisme classique                        │
│                                                                  │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │ "Il y a plus de choses dans le ciel et sur la terre,    │ │
│   │  Horatio, que n'en rêve votre philosophie."              │ │
│   │  - Shakespeare (réinterprété par la science              │ │
│   │    de la complexité)                                     │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*"La complexité est le signe que nous cherchons à comprendre quelque chose qui résiste à nos catégories habituelles."*
