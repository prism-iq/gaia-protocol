# Emergence : Le Tout Plus Grand que ses Parties

## Définition Fondamentale

L'émergence décrit le phénomène où des propriétés complexes apparaissent au niveau macroscopique sans être présentes ni prédictibles à partir des composants individuels.

```
ÉMERGENCE = f(Interactions) → Propriétés Nouvelles
           où f est non-linéaire et non-réductible
```

## Taxonomie de l'Émergence

### Émergence Faible vs Forte

```
┌─────────────────────────────────────────────────────────────┐
│                   SPECTRE DE L'ÉMERGENCE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FAIBLE                                          FORTE      │
│    │                                               │        │
│    ▼                                               ▼        │
│  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐      │
│  │Réduc│───▶│Prédi│───▶│Surpr│───▶│Irréd│───▶│Ontol│      │
│  │tible│    │ctble│    │enant│    │uctbl│    │ogique│     │
│  └─────┘    └─────┘    └─────┘    └─────┘    └─────┘      │
│                                                             │
│  Température  Flocons   Conscience?   Vie?    Qualia?      │
│  (gaz)        de neige                                      │
└─────────────────────────────────────────────────────────────┘
```

## Modèle Formel

### Définition Mathématique

```python
"""
Formalisation de l'émergence selon les niveaux d'organisation
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Set, Callable
import numpy as np
from dataclasses import dataclass
from enum import Enum

class EmergenceType(Enum):
    WEAK = "faible"           # Réductible en principe
    EPISTEMIC = "épistémique" # Limite de connaissance
    STRONG = "forte"          # Ontologiquement nouveau

@dataclass
class Level:
    """Niveau d'organisation dans un système"""
    name: str
    entities: Set[str]
    properties: Dict[str, float]
    laws: List[Callable]

class EmergentSystem:
    """
    Système exhibant des propriétés émergentes

    Propriété P est émergente si:
    1. P existe au niveau N
    2. P n'existe pas au niveau N-1
    3. P dépend causalement du niveau N-1
    4. P n'est pas déductible de N-1 seul
    """

    def __init__(self):
        self.levels: List[Level] = []
        self.inter_level_relations = {}

    def add_level(self, level: Level, emergence_map: Callable = None):
        """Ajoute un niveau avec sa fonction d'émergence"""
        if self.levels and emergence_map:
            self.inter_level_relations[len(self.levels)] = emergence_map
        self.levels.append(level)

    def compute_emergence(self, level_idx: int) -> Dict[str, float]:
        """
        Calcule les propriétés émergentes à un niveau donné

        Émergence = Propriétés(Niveau N) - Σ Propriétés(Niveau N-1)
        """
        if level_idx == 0:
            return {}  # Niveau de base: pas d'émergence

        current = self.levels[level_idx]
        below = self.levels[level_idx - 1]

        emergent_props = {}
        for prop, value in current.properties.items():
            if prop not in below.properties:
                emergent_props[prop] = value
            else:
                # Propriété existante mais avec valeur émergente
                delta = value - below.properties[prop]
                if abs(delta) > 0.01:  # Seuil de nouveauté
                    emergent_props[f"{prop}_emergent"] = delta

        return emergent_props

    def measure_emergence_strength(self, level_idx: int) -> float:
        """
        Mesure la force de l'émergence (0-1)
        Basé sur l'information mutuelle entre niveaux
        """
        if level_idx == 0:
            return 0.0

        # Entropie au niveau courant
        H_current = self._entropy(self.levels[level_idx])
        # Entropie conditionnelle sachant le niveau inférieur
        H_conditional = self._conditional_entropy(level_idx)

        # Émergence = 1 - (H(N|N-1) / H(N))
        # Plus H_conditional est grand, plus l'émergence est forte
        if H_current == 0:
            return 0.0
        return H_conditional / H_current

    def _entropy(self, level: Level) -> float:
        """Entropie de Shannon d'un niveau"""
        values = list(level.properties.values())
        if not values:
            return 0.0
        probs = np.array(values) / sum(values)
        probs = probs[probs > 0]
        return -np.sum(probs * np.log2(probs))

    def _conditional_entropy(self, level_idx: int) -> float:
        """Entropie conditionnelle H(N|N-1)"""
        # Approximation: différence des entropies pondérée
        H_n = self._entropy(self.levels[level_idx])
        H_n_minus_1 = self._entropy(self.levels[level_idx - 1])
        return max(0, H_n - 0.5 * H_n_minus_1)
```

## Exemple: Jeu de la Vie de Conway

```
┌─────────────────────────────────────────────────────────────┐
│                    RÈGLES MICROSCOPIQUES                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Cellule VIVANTE:                 Cellule MORTE:           │
│   • < 2 voisins → MEURT           • = 3 voisins → NAÎT      │
│   • 2-3 voisins → VIT             • sinon → RESTE MORTE     │
│   • > 3 voisins → MEURT                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  STRUCTURES ÉMERGENTES                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   STILL LIFES:        OSCILLATORS:       SPACESHIPS:        │
│                                                              │
│   ░░██░░              ░░░░░░░░           ░░█░░░░            │
│   ░██░░░   Block      ░███░░░░  Blinker  ░░░██░░  Glider   │
│   ░░░░░░              ░░░░░░░░           ░███░░░            │
│                       ░░░░░░░░           ░░░░░░░            │
│   ░░██░░              ░░█░░░░░                              │
│   ░█░░█░   Beehive    ░░█░░░░░                              │
│   ░░██░░              ░░█░░░░░                              │
│                                                              │
│   Ces structures N'EXISTENT PAS dans les règles!            │
│   Elles ÉMERGENT des interactions.                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Implémentation

```python
import numpy as np
from typing import Tuple, List
from collections import defaultdict

class GameOfLife:
    """
    Automate cellulaire de Conway
    Démonstration d'émergence computationnelle
    """

    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height
        self.grid = np.zeros((height, width), dtype=np.int8)
        self.pattern_registry = {}

    def seed_random(self, density: float = 0.3):
        """Initialisation aléatoire"""
        self.grid = (np.random.random((self.height, self.width)) < density).astype(np.int8)

    def count_neighbors(self, x: int, y: int) -> int:
        """Compte les voisins vivants (Moore neighborhood)"""
        count = 0
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx, ny = (x + dx) % self.width, (y + dy) % self.height
                count += self.grid[ny, nx]
        return count

    def step(self) -> Tuple[int, int]:
        """
        Un pas de simulation
        Retourne (naissances, morts)
        """
        new_grid = np.zeros_like(self.grid)
        births, deaths = 0, 0

        for y in range(self.height):
            for x in range(self.width):
                neighbors = self.count_neighbors(x, y)
                alive = self.grid[y, x]

                if alive:
                    if neighbors < 2 or neighbors > 3:
                        deaths += 1  # Meurt
                    else:
                        new_grid[y, x] = 1  # Survit
                else:
                    if neighbors == 3:
                        new_grid[y, x] = 1  # Naît
                        births += 1

        self.grid = new_grid
        return births, deaths

    def detect_patterns(self) -> Dict[str, int]:
        """
        Détecte les structures émergentes connues
        Ceci est l'OBSERVATION de l'émergence
        """
        patterns = defaultdict(int)

        # Patterns connus (représentés comme tuples de positions relatives)
        known_patterns = {
            'block': frozenset([(0,0), (0,1), (1,0), (1,1)]),
            'blinker_h': frozenset([(0,0), (0,1), (0,2)]),
            'blinker_v': frozenset([(0,0), (1,0), (2,0)]),
            'glider_1': frozenset([(0,1), (1,2), (2,0), (2,1), (2,2)]),
        }

        # Recherche naïve de patterns
        visited = set()
        for y in range(self.height):
            for x in range(self.width):
                if self.grid[y, x] and (x, y) not in visited:
                    # Extraire composante connexe
                    component = self._flood_fill(x, y)
                    visited.update(component)

                    # Normaliser et comparer
                    normalized = self._normalize_pattern(component)
                    for name, pattern in known_patterns.items():
                        if normalized == pattern:
                            patterns[name] += 1

        return dict(patterns)

    def _flood_fill(self, start_x: int, start_y: int) -> Set[Tuple[int, int]]:
        """Extraction d'une composante connexe"""
        component = set()
        stack = [(start_x, start_y)]

        while stack:
            x, y = stack.pop()
            if (x, y) in component:
                continue
            if not (0 <= x < self.width and 0 <= y < self.height):
                continue
            if not self.grid[y, x]:
                continue

            component.add((x, y))
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    stack.append((x + dx, y + dy))

        return component

    def _normalize_pattern(self, component: Set[Tuple[int, int]]) -> frozenset:
        """Normalise un pattern à l'origine"""
        if not component:
            return frozenset()
        min_x = min(p[0] for p in component)
        min_y = min(p[1] for p in component)
        return frozenset((x - min_x, y - min_y) for x, y in component)

    def measure_complexity(self) -> Dict[str, float]:
        """
        Mesures de complexité émergente
        """
        alive = np.sum(self.grid)
        total = self.width * self.height

        # Densité
        density = alive / total

        # Entropie spatiale (approximation)
        if density == 0 or density == 1:
            entropy = 0
        else:
            entropy = -density * np.log2(density) - (1-density) * np.log2(1-density)

        # Clustering coefficient (combien de cellules ont des voisins vivants)
        clustering = 0
        for y in range(self.height):
            for x in range(self.width):
                if self.grid[y, x]:
                    neighbors = self.count_neighbors(x, y)
                    clustering += neighbors / 8
        clustering = clustering / max(1, alive)

        return {
            'population': alive,
            'density': density,
            'entropy': entropy,
            'clustering': clustering,
            'emergence_index': entropy * clustering  # Métrique composite
        }

    def visualize(self) -> str:
        """Représentation ASCII"""
        lines = []
        for row in self.grid:
            line = ''.join('█' if cell else '░' for cell in row)
            lines.append(line)
        return '\n'.join(lines)
```

## Diagramme: Niveaux d'Émergence

```
┌─────────────────────────────────────────────────────────────────┐
│                    PYRAMIDE D'ÉMERGENCE                         │
└─────────────────────────────────────────────────────────────────┘

                         ▲
                        ╱ ╲
                       ╱   ╲
                      ╱ CON-╲        Niveau 6: CONSCIENCE
                     ╱SCIENCE╲       Émergence: ???
                    ╱─────────╲
                   ╱           ╲
                  ╱   SOCIÉTÉ   ╲    Niveau 5: SOCIAL
                 ╱               ╲   Émergence: Institutions, Culture
                ╱─────────────────╲
               ╱                   ╲
              ╱    ORGANISMES      ╲  Niveau 4: BIOLOGIQUE
             ╱                      ╲ Émergence: Vie, Métabolisme
            ╱────────────────────────╲
           ╱                          ╲
          ╱      CELLULES              ╲ Niveau 3: CELLULAIRE
         ╱                              ╲Émergence: Autopoïèse
        ╱────────────────────────────────╲
       ╱                                  ╲
      ╱        MOLÉCULES                   ╲ Niveau 2: CHIMIQUE
     ╱                                      ╲Émergence: Liaisons, Réactions
    ╱────────────────────────────────────────╲
   ╱                                          ╲
  ╱            ATOMES / PARTICULES             ╲ Niveau 1: PHYSIQUE
 ╱                                              ╲Émergence: Masse, Charge
╱────────────────────────────────────────────────╲
                 CHAMPS QUANTIQUES                 Niveau 0: FONDAMENTAL

                    │
                    ▼
    Chaque niveau exhibe des propriétés INEXISTANTES au niveau inférieur
```

## Principes Clés

### 1. Non-Linéarité

```
┌────────────────────────────────────────────┐
│         INTERACTION NON-LINÉAIRE           │
├────────────────────────────────────────────┤
│                                            │
│   Linéaire:     f(a+b) = f(a) + f(b)      │
│                                            │
│   Non-linéaire: f(a+b) ≠ f(a) + f(b)      │
│                                            │
│   L'émergence naît de la non-linéarité:   │
│                                            │
│   ┌───┐   ┌───┐         ┌───────────┐     │
│   │ A │ + │ B │   ───▶  │ A+B+EXTRA │     │
│   └───┘   └───┘         └───────────┘     │
│                              ▲             │
│                              │             │
│                         ÉMERGENT           │
│                                            │
└────────────────────────────────────────────┘
```

### 2. Causalité Descendante

```python
class DownwardCausation:
    """
    La causalité descendante: le tout influence les parties

    Exemple: Une fourmi modifie son comportement selon l'état
    de la colonie (entité de niveau supérieur)
    """

    def __init__(self):
        self.micro_level = {}  # Composants individuels
        self.macro_level = {}  # Propriétés émergentes

    def upward_causation(self):
        """
        Causalité ascendante classique:
        Micro → Macro
        """
        # Les comportements individuels créent le pattern collectif
        self.macro_level['pattern'] = self._aggregate(self.micro_level)

    def downward_causation(self):
        """
        Causalité descendante:
        Macro → Micro

        Le pattern global contraint les comportements individuels
        """
        macro_state = self.macro_level.get('pattern', {})

        for agent_id, agent in self.micro_level.items():
            # L'agent ajuste son comportement selon l'état global
            constraint = self._derive_constraint(macro_state, agent_id)
            agent['behavior'] = self._constrain(agent['behavior'], constraint)

    def circular_causation(self):
        """
        Boucle causale complète:

        ┌─────────┐
        │  MACRO  │◀────────────────┐
        └────┬────┘                 │
             │                      │
             │ Causalité           │ Causalité
             │ descendante         │ ascendante
             │                      │
             ▼                      │
        ┌─────────┐                 │
        │  MICRO  │─────────────────┘
        └─────────┘
        """
        for _ in range(10):  # Itérations jusqu'à équilibre
            self.upward_causation()
            self.downward_causation()
```

## Signatures de l'Émergence

```
┌─────────────────────────────────────────────────────────────┐
│              COMMENT RECONNAÎTRE L'ÉMERGENCE                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. NOUVEAUTÉ QUALITATIVE                                   │
│     ────────────────────                                    │
│     La propriété n'existe pas aux niveaux inférieurs        │
│     Ex: "Humidité" n'existe pas pour une molécule H₂O      │
│                                                             │
│  2. IRRÉDUCTIBILITÉ PRATIQUE                               │
│     ─────────────────────────                               │
│     Impossible de déduire sans simulation complète          │
│     Ex: Prédire un glider depuis les règles de Conway      │
│                                                             │
│  3. AUTONOMIE CAUSALE                                       │
│     ────────────────────                                    │
│     Le niveau macro a son propre pouvoir causal             │
│     Ex: Les lois de l'offre/demande vs comportement         │
│         individuel d'achat                                  │
│                                                             │
│  4. MULTIPLES RÉALISABILITÉS                               │
│     ────────────────────────                                │
│     Même propriété macro, différentes configs micro         │
│     Ex: "Température" réalisable par ∞ distributions        │
│         de vitesses moléculaires                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Applications

### Intelligence Collective

```python
class SwarmIntelligence:
    """
    Émergence d'intelligence dans un essaim
    Aucun agent n'est "intelligent", mais le collectif l'est
    """

    def __init__(self, n_agents: int):
        self.agents = [
            {'x': np.random.rand(), 'y': np.random.rand(), 'best': None}
            for _ in range(n_agents)
        ]
        self.global_best = None

    def evaluate_fitness(self, x: float, y: float) -> float:
        """Fonction objective (à minimiser)"""
        # Fonction de Rastrigin (pleine d'optima locaux)
        return 20 + (x**2 - 10*np.cos(2*np.pi*x)) + (y**2 - 10*np.cos(2*np.pi*y))

    def step(self):
        """
        Algorithme PSO (Particle Swarm Optimization)
        L'optimisation ÉMERGE des interactions simples
        """
        w = 0.7  # Inertie
        c1, c2 = 1.5, 1.5  # Coefficients cognitif et social

        for agent in self.agents:
            # Évaluation
            fitness = self.evaluate_fitness(agent['x'], agent['y'])

            # Mise à jour du meilleur personnel
            if agent['best'] is None or fitness < agent['best']['fitness']:
                agent['best'] = {'x': agent['x'], 'y': agent['y'], 'fitness': fitness}

            # Mise à jour du meilleur global
            if self.global_best is None or fitness < self.global_best['fitness']:
                self.global_best = {'x': agent['x'], 'y': agent['y'], 'fitness': fitness}

        # Mouvement (comportement simple, intelligence émergente)
        for agent in self.agents:
            r1, r2 = np.random.rand(2)

            # Vitesse = inertie + attraction vers meilleur perso + attraction vers meilleur global
            vx = (w * agent.get('vx', 0) +
                  c1 * r1 * (agent['best']['x'] - agent['x']) +
                  c2 * r2 * (self.global_best['x'] - agent['x']))
            vy = (w * agent.get('vy', 0) +
                  c1 * r1 * (agent['best']['y'] - agent['y']) +
                  c2 * r2 * (self.global_best['y'] - agent['y']))

            agent['vx'], agent['vy'] = vx, vy
            agent['x'] += vx
            agent['y'] += vy
```

## Conclusion Philosophique

```
┌─────────────────────────────────────────────────────────────┐
│                  L'ÉMERGENCE RÉVÈLE QUE:                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   "Le réductionnisme méthodologique est nécessaire,        │
│    mais le réductionnisme ontologique est insuffisant."     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                                                     │  │
│   │   COMPRENDRE les parties ≠ COMPRENDRE le tout      │  │
│   │                                                     │  │
│   │   La science progresse en reconnaissant             │  │
│   │   l'autonomie causale de chaque niveau              │  │
│   │                                                     │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   Questions ouvertes:                                       │
│   • La conscience est-elle fortement émergente?            │
│   • L'émergence a-t-elle un pouvoir explicatif?           │
│   • Peut-on formaliser "nouveauté ontologique"?           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*"More is different." - Philip W. Anderson (1972)*
