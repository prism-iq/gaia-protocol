# Auto-Organisation : L'Ordre Spontané

## Définition

L'auto-organisation est le processus par lequel un système acquiert spontanément une structure ordonnée sans intervention externe. L'ordre émerge des interactions locales entre composants.

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTO-ORGANISATION                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   AVANT                              APRÈS                   │
│   (Désordre)                         (Ordre)                 │
│                                                              │
│   ○ ○   ○  ○                       ●───●───●───●            │
│     ○ ○    ○                       │   │   │   │            │
│   ○    ○  ○ ○                      ●───●───●───●            │
│    ○  ○    ○                       │   │   │   │            │
│   ○ ○  ○  ○                        ●───●───●───●            │
│                                                              │
│         │                                                    │
│         │  Interactions locales                             │
│         │  (sans contrôle central)                          │
│         ▼                                                    │
│                                                              │
│   Principes:                                                │
│   • Pas de chef d'orchestre                                 │
│   • Règles locales simples                                  │
│   • Rétroactions positives et négatives                     │
│   • Fluctuations amplifiées sélectivement                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Exemples Naturels

```
┌─────────────────────────────────────────────────────────────────┐
│               EXEMPLES D'AUTO-ORGANISATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHYSIQUE:                                                      │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Cellules de Bénard (convection)                     │       │
│  │                                                      │       │
│  │     ○   ○   ○   ○   ○    Fluide chauffé             │       │
│  │    ╱ ╲ ╱ ╲ ╱ ╲ ╱ ╲ ╱ ╲   par-dessous →             │       │
│  │   ○   ●   ○   ●   ○     cellules hexagonales        │       │
│  │    ╲ ╱ ╲ ╱ ╲ ╱ ╲ ╱ ╲                               │       │
│  │     ○   ○   ○   ○   ○                               │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  CHIMIE:                                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Réaction de Belousov-Zhabotinsky                    │       │
│  │                                                      │       │
│  │     ╭──╮  ╭──╮  ╭──╮     Oscillations               │       │
│  │    │░░│  │██│  │░░│     chimiques et                │       │
│  │    │░░│  │██│  │░░│     spirales                    │       │
│  │     ╰──╯  ╰──╯  ╰──╯                                │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  BIOLOGIE:                                                      │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Motifs de pelage (Turing patterns)                  │       │
│  │                                                      │       │
│  │     █░█░█░█░█░         Réaction-diffusion           │       │
│  │     ░█░█░█░█░█         de morphogènes →             │       │
│  │     █░█░█░█░█░         rayures, taches              │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  SOCIAL:                                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Formation de sentiers (stigmergie)                  │       │
│  │                                                      │       │
│  │     A ────────────── B   Le chemin le plus          │       │
│  │        ╲          ╱      fréquenté devient          │       │
│  │         ╲────────╱       le chemin dominant         │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Mécanismes Fondamentaux

```python
"""
Modélisation des mécanismes d'auto-organisation
"""

import numpy as np
from typing import Callable, List, Tuple, Dict
from dataclasses import dataclass
from enum import Enum
from scipy.ndimage import laplace, convolve

class SelfOrganizationMechanism(Enum):
    POSITIVE_FEEDBACK = "retroaction_positive"
    NEGATIVE_FEEDBACK = "retroaction_negative"
    SYMMETRY_BREAKING = "brisure_symetrie"
    NOISE_AMPLIFICATION = "amplification_bruit"
    COMPETITION = "competition"
    COOPERATION = "cooperation"

@dataclass
class OrderParameter:
    """
    Paramètre d'ordre: mesure quantitative de l'organisation

    Exemples:
    - Aimantation (spin up - spin down) / N
    - Degré de ségrégation spatiale
    - Synchronisation de phase
    """
    name: str
    value: float
    critical_value: float  # Valeur au point de transition

class SelfOrganizingSystem:
    """
    Système auto-organisé générique
    """

    def __init__(self, n_components: int):
        self.n = n_components
        self.state = np.random.randn(n_components)
        self.history = []

    def interaction_matrix(self) -> np.ndarray:
        """Matrice des interactions entre composants"""
        raise NotImplementedError

    def local_dynamics(self, i: int) -> float:
        """Dynamique locale du composant i"""
        raise NotImplementedError

    def step(self, noise: float = 0.01) -> np.ndarray:
        """Un pas de temps"""
        new_state = np.zeros(self.n)

        for i in range(self.n):
            # Dynamique déterministe
            new_state[i] = self.local_dynamics(i)
            # Plus bruit
            new_state[i] += noise * np.random.randn()

        self.state = new_state
        self.history.append(self.state.copy())
        return self.state

    def compute_order_parameter(self) -> float:
        """Calcule le paramètre d'ordre"""
        raise NotImplementedError


class SchellingSegregation(SelfOrganizingSystem):
    """
    Modèle de ségrégation de Schelling (1971)

    Auto-organisation sociale: des préférences individuelles FAIBLES
    produisent une ségrégation collective FORTE.

    ┌────────────────────────────────────────────────────────────┐
    │                  MODÈLE DE SCHELLING                       │
    ├────────────────────────────────────────────────────────────┤
    │                                                            │
    │  Règle: Un agent est "satisfait" si au moins X% de        │
    │         ses voisins sont du même type.                     │
    │                                                            │
    │  Paradoxe: Même avec X = 30% (tolérance!),                │
    │            le résultat est une ségrégation presque totale! │
    │                                                            │
    │  INITIAL (aléatoire)          FINAL (auto-organisé)       │
    │  ░█░█░░██░█░░█                ░░░░░░░░████████            │
    │  █░░█░█░░█░█░░                ░░░░░░░░████████            │
    │  ░█░█░░█░░█░█░                ░░░░░░░░████████            │
    │  █░█░█░░░█░░█░                ░░░░░░░░████████            │
    │  ░░█░█░██░█░░█                ░░░░░░░░████████            │
    │                                                            │
    └────────────────────────────────────────────────────────────┘
    """

    def __init__(self, grid_size: int, threshold: float = 0.3,
                 empty_ratio: float = 0.1):
        self.size = grid_size
        self.threshold = threshold

        # 0 = vide, 1 = type A, 2 = type B
        total = grid_size * grid_size
        n_empty = int(total * empty_ratio)
        n_each = (total - n_empty) // 2

        population = [0] * n_empty + [1] * n_each + [2] * (total - n_empty - n_each)
        np.random.shuffle(population)

        self.grid = np.array(population).reshape((grid_size, grid_size))

    def get_neighbors(self, i: int, j: int) -> List[int]:
        """Obtient les voisins non-vides"""
        neighbors = []
        for di in [-1, 0, 1]:
            for dj in [-1, 0, 1]:
                if di == 0 and dj == 0:
                    continue
                ni, nj = (i + di) % self.size, (j + dj) % self.size
                if self.grid[ni, nj] != 0:
                    neighbors.append(self.grid[ni, nj])
        return neighbors

    def is_satisfied(self, i: int, j: int) -> bool:
        """Un agent est-il satisfait de son voisinage?"""
        if self.grid[i, j] == 0:
            return True

        neighbors = self.get_neighbors(i, j)
        if not neighbors:
            return True

        same_type = sum(1 for n in neighbors if n == self.grid[i, j])
        return same_type / len(neighbors) >= self.threshold

    def step(self) -> int:
        """Un pas: déplacer un agent insatisfait"""
        # Trouver agents insatisfaits
        unhappy = []
        for i in range(self.size):
            for j in range(self.size):
                if self.grid[i, j] != 0 and not self.is_satisfied(i, j):
                    unhappy.append((i, j))

        if not unhappy:
            return 0  # Équilibre atteint

        # Trouver cellules vides
        empty = list(zip(*np.where(self.grid == 0)))

        if not empty:
            return 0

        # Déplacer un agent insatisfait aléatoire
        agent_pos = unhappy[np.random.randint(len(unhappy))]
        new_pos = empty[np.random.randint(len(empty))]

        # Échanger
        self.grid[new_pos] = self.grid[agent_pos]
        self.grid[agent_pos] = 0

        return len(unhappy)

    def compute_order_parameter(self) -> float:
        """
        Indice de ségrégation: moyenne de la fraction de voisins similaires
        """
        similar_fractions = []

        for i in range(self.size):
            for j in range(self.size):
                if self.grid[i, j] != 0:
                    neighbors = self.get_neighbors(i, j)
                    if neighbors:
                        same = sum(1 for n in neighbors if n == self.grid[i, j])
                        similar_fractions.append(same / len(neighbors))

        return np.mean(similar_fractions) if similar_fractions else 0

    def visualize(self) -> str:
        """Représentation ASCII"""
        chars = {0: '·', 1: '░', 2: '█'}
        lines = []
        for row in self.grid:
            line = ''.join(chars[cell] for cell in row)
            lines.append(line)
        return '\n'.join(lines)


class TuringPattern:
    """
    Motifs de Turing: auto-organisation par réaction-diffusion

    Système de deux espèces chimiques:
    - Activateur (u): s'auto-amplifie
    - Inhibiteur (v): inhibe l'activateur mais diffuse plus vite

    ∂u/∂t = Du∇²u + f(u,v)
    ∂v/∂t = Dv∇²v + g(u,v)

    Condition d'instabilité de Turing: Dv >> Du
    """

    def __init__(self, size: int, Du: float = 0.1, Dv: float = 0.4):
        self.size = size
        self.Du = Du
        self.Dv = Dv

        # État initial: léger bruit autour de l'équilibre
        self.u = np.ones((size, size)) + 0.01 * np.random.randn(size, size)
        self.v = np.ones((size, size)) + 0.01 * np.random.randn(size, size)

    def reaction_gray_scott(self, u: np.ndarray, v: np.ndarray,
                           f: float = 0.04, k: float = 0.06) -> Tuple[np.ndarray, np.ndarray]:
        """
        Réaction de Gray-Scott

        u + 2v → 3v  (autocatalyse)
        v → P        (décroissance)

        ┌────────────────────────────────────────────────────┐
        │           MOTIFS DE GRAY-SCOTT                     │
        ├────────────────────────────────────────────────────┤
        │                                                    │
        │   f, k différents → motifs différents:            │
        │                                                    │
        │   ●●●  Spots       ═══  Stripes                   │
        │   ●●●              ═══                             │
        │   ●●●              ═══                             │
        │                                                    │
        │   ⊕⊕   Mitose      ≋≋≋  Turbulence               │
        │    ⊕⊕                                             │
        │   ⊕⊕                                              │
        │                                                    │
        └────────────────────────────────────────────────────┘
        """
        uvv = u * v * v
        du = -uvv + f * (1 - u)
        dv = uvv - (f + k) * v
        return du, dv

    def step(self, dt: float = 1.0, f: float = 0.04, k: float = 0.06) -> None:
        """Un pas de temps"""
        # Diffusion (Laplacien avec conditions périodiques)
        laplacian_u = laplace(self.u, mode='wrap')
        laplacian_v = laplace(self.v, mode='wrap')

        # Réaction
        du_react, dv_react = self.reaction_gray_scott(self.u, self.v, f, k)

        # Mise à jour
        self.u += (self.Du * laplacian_u + du_react) * dt
        self.v += (self.Dv * laplacian_v + dv_react) * dt

        # Borner les valeurs
        self.u = np.clip(self.u, 0, 1)
        self.v = np.clip(self.v, 0, 1)

    def simulate(self, steps: int, dt: float = 1.0,
                f: float = 0.04, k: float = 0.06) -> None:
        """Simulation complète"""
        for _ in range(steps):
            self.step(dt, f, k)

    def visualize_ascii(self, threshold: float = 0.5) -> str:
        """Visualisation ASCII du motif"""
        lines = []
        for row in self.v:
            line = ''.join('█' if val > threshold else '░' for val in row)
            lines.append(line)
        return '\n'.join(lines)


class Boids:
    """
    Modèle de Boids (Reynolds, 1987): Auto-organisation de vol en groupe

    Trois règles simples produisent un comportement de nuée complexe:

    1. SÉPARATION: Éviter les collisions avec les voisins proches
    2. ALIGNEMENT: S'aligner avec la direction moyenne des voisins
    3. COHÉSION: Se diriger vers le centre de masse des voisins

    ┌────────────────────────────────────────────────────────────┐
    │                    RÈGLES DES BOIDS                        │
    ├────────────────────────────────────────────────────────────┤
    │                                                            │
    │  SÉPARATION          ALIGNEMENT          COHÉSION         │
    │                                                            │
    │      ←●               →→→               ●    ●            │
    │     ↙  ↘              →→→               ↘  ↙              │
    │    ●    ●             →→→                 ●               │
    │   (repousse)       (même direction)    (vers centre)      │
    │                                                            │
    └────────────────────────────────────────────────────────────┘
    """

    def __init__(self, n_boids: int, width: float = 100, height: float = 100):
        self.n = n_boids
        self.width = width
        self.height = height

        # Positions et vitesses aléatoires
        self.positions = np.random.rand(n_boids, 2) * np.array([width, height])
        self.velocities = (np.random.rand(n_boids, 2) - 0.5) * 2

        # Paramètres
        self.separation_radius = 5
        self.perception_radius = 20
        self.max_speed = 2
        self.max_force = 0.1

        # Poids des règles
        self.w_separation = 1.5
        self.w_alignment = 1.0
        self.w_cohesion = 1.0

    def separation(self, boid_idx: int) -> np.ndarray:
        """Éviter les voisins trop proches"""
        steer = np.zeros(2)
        pos = self.positions[boid_idx]

        for i, other_pos in enumerate(self.positions):
            if i != boid_idx:
                diff = pos - other_pos
                dist = np.linalg.norm(diff)
                if 0 < dist < self.separation_radius:
                    steer += diff / (dist * dist)  # Inversement proportionnel

        return steer

    def alignment(self, boid_idx: int) -> np.ndarray:
        """S'aligner avec les voisins"""
        avg_velocity = np.zeros(2)
        count = 0
        pos = self.positions[boid_idx]

        for i, (other_pos, other_vel) in enumerate(zip(self.positions, self.velocities)):
            if i != boid_idx:
                dist = np.linalg.norm(pos - other_pos)
                if dist < self.perception_radius:
                    avg_velocity += other_vel
                    count += 1

        if count > 0:
            avg_velocity /= count
            return avg_velocity - self.velocities[boid_idx]

        return np.zeros(2)

    def cohesion(self, boid_idx: int) -> np.ndarray:
        """Se diriger vers le centre des voisins"""
        center = np.zeros(2)
        count = 0
        pos = self.positions[boid_idx]

        for i, other_pos in enumerate(self.positions):
            if i != boid_idx:
                dist = np.linalg.norm(pos - other_pos)
                if dist < self.perception_radius:
                    center += other_pos
                    count += 1

        if count > 0:
            center /= count
            return center - pos

        return np.zeros(2)

    def step(self, dt: float = 1.0) -> None:
        """Un pas de simulation"""
        for i in range(self.n):
            # Calculer les forces
            sep = self.separation(i) * self.w_separation
            ali = self.alignment(i) * self.w_alignment
            coh = self.cohesion(i) * self.w_cohesion

            acceleration = sep + ali + coh

            # Limiter la force
            norm = np.linalg.norm(acceleration)
            if norm > self.max_force:
                acceleration = acceleration / norm * self.max_force

            # Mettre à jour vitesse
            self.velocities[i] += acceleration
            speed = np.linalg.norm(self.velocities[i])
            if speed > self.max_speed:
                self.velocities[i] = self.velocities[i] / speed * self.max_speed

            # Mettre à jour position
            self.positions[i] += self.velocities[i] * dt

            # Conditions aux bords (toroïdal)
            self.positions[i] = self.positions[i] % np.array([self.width, self.height])

    def compute_order_parameter(self) -> float:
        """
        Paramètre d'ordre: alignement global des vitesses
        Vicsek order parameter: |Σv_i| / (N * v₀)
        """
        total_velocity = np.sum(self.velocities, axis=0)
        return np.linalg.norm(total_velocity) / (self.n * self.max_speed)

    def visualize_ascii(self, resolution: int = 40) -> str:
        """Visualisation ASCII"""
        grid = [[' ' for _ in range(resolution)] for _ in range(resolution)]

        for pos, vel in zip(self.positions, self.velocities):
            x = int(pos[0] / self.width * (resolution - 1))
            y = int(pos[1] / self.height * (resolution - 1))
            x, y = max(0, min(x, resolution-1)), max(0, min(y, resolution-1))

            # Direction
            angle = np.arctan2(vel[1], vel[0])
            if -np.pi/4 <= angle < np.pi/4:
                char = '→'
            elif np.pi/4 <= angle < 3*np.pi/4:
                char = '↑'
            elif -3*np.pi/4 <= angle < -np.pi/4:
                char = '↓'
            else:
                char = '←'

            grid[resolution - 1 - y][x] = char

        return '\n'.join([''.join(row) for row in grid])
```

## Mécanismes Clés

```
┌─────────────────────────────────────────────────────────────────┐
│              MÉCANISMES D'AUTO-ORGANISATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. BRISURE DE SYMÉTRIE                                         │
│     ─────────────────────                                       │
│     État symétrique initial instable → état asymétrique stable  │
│                                                                  │
│         ○           ○    ○                                      │
│        ╱│╲    →    │    │     (Potentiel en "M")               │
│       ○ │ ○       ○│    │○                                      │
│         ▼                                                        │
│       Instable      Stable                                       │
│                                                                  │
│  2. AMPLIFICATION DES FLUCTUATIONS                              │
│     ─────────────────────────────                               │
│     Petites différences → grandes structures                    │
│                                                                  │
│     ≈≈≈≈≈≈≈≈  →  ≈≈▄█████▄≈≈                                  │
│     (uniforme)    (pattern)                                      │
│                                                                  │
│  3. INSTABILITÉ ET SÉLECTION                                    │
│     ────────────────────────                                    │
│     Plusieurs modes instables, un seul survit                   │
│                                                                  │
│     λ₁ ▄         λ₁ croît le plus vite                         │
│     λ₂ ▃         λ₂ supprimé                                   │
│     λ₃ ▂         λ₃ supprimé                                   │
│                                                                  │
│  4. COMPÉTITION + COOPÉRATION                                   │
│     ──────────────────────────                                  │
│     Balance entre forces attractives et répulsives              │
│                                                                  │
│     ←──●──●──●──●──→    Espacement régulier                    │
│     (répulsion + attraction à distance)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Criticalité Auto-Organisée (SOC)

```python
class SandpileModel:
    """
    Modèle du tas de sable de Bak-Tang-Wiesenfeld (1987)
    Paradigme de la Criticalité Auto-Organisée (SOC)

    Le système s'organise spontanément vers un état critique,
    où des avalanches de toutes tailles peuvent se produire.

    ┌────────────────────────────────────────────────────────────┐
    │         CRITICALITÉ AUTO-ORGANISÉE (SOC)                   │
    ├────────────────────────────────────────────────────────────┤
    │                                                            │
    │   Distribution des avalanches: P(s) ~ s^(-τ)              │
    │   (loi de puissance = pas d'échelle caractéristique)      │
    │                                                            │
    │   log P(s)                                                 │
    │      │╲                                                    │
    │      │ ╲                                                   │
    │      │  ╲                                                  │
    │      │   ╲                                                 │
    │      │    ╲                                                │
    │      │     ╲╲                                              │
    │      │       ╲╲╲                                           │
    │      └─────────────────▶ log s                            │
    │                                                            │
    │   Exemples naturels de SOC:                               │
    │   • Tremblements de terre (loi de Gutenberg-Richter)      │
    │   • Extinctions biologiques                                │
    │   • Activité neuronale                                    │
    │   • Marchés financiers (crashes)                          │
    │                                                            │
    └────────────────────────────────────────────────────────────┘
    """

    def __init__(self, size: int, threshold: int = 4):
        self.size = size
        self.threshold = threshold
        self.grid = np.zeros((size, size), dtype=int)
        self.avalanche_sizes = []

    def add_grain(self, x: int = None, y: int = None) -> int:
        """
        Ajoute un grain et déclenche avalanche si nécessaire
        Retourne la taille de l'avalanche
        """
        if x is None:
            x = np.random.randint(self.size)
        if y is None:
            y = np.random.randint(self.size)

        self.grid[y, x] += 1

        avalanche_size = self._topple()
        self.avalanche_sizes.append(avalanche_size)

        return avalanche_size

    def _topple(self) -> int:
        """
        Propagation de l'avalanche jusqu'à stabilisation
        """
        total_topplings = 0

        while True:
            # Trouver sites instables
            unstable = np.where(self.grid >= self.threshold)

            if len(unstable[0]) == 0:
                break

            n_unstable = len(unstable[0])
            total_topplings += n_unstable

            for y, x in zip(unstable[0], unstable[1]):
                self.grid[y, x] -= self.threshold

                # Distribuer aux voisins
                for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < self.size and 0 <= nx < self.size:
                        self.grid[ny, nx] += 1
                    # Sinon: grain sort du système (bord ouvert)

        return total_topplings

    def simulate(self, n_grains: int) -> List[int]:
        """Simulation d'ajout de n grains"""
        for _ in range(n_grains):
            self.add_grain()
        return self.avalanche_sizes

    def avalanche_distribution(self) -> Dict[int, int]:
        """Distribution des tailles d'avalanche"""
        from collections import Counter
        return dict(Counter(self.avalanche_sizes))

    def visualize(self) -> str:
        """Visualisation ASCII du tas"""
        chars = {0: ' ', 1: '░', 2: '▒', 3: '▓'}
        lines = []
        for row in self.grid:
            line = ''.join(chars.get(min(cell, 3), '█') for cell in row)
            lines.append(line)
        return '\n'.join(lines)

    def is_critical(self) -> bool:
        """
        Vérifie si le système est dans l'état critique
        (distribution proche d'une loi de puissance)
        """
        if len(self.avalanche_sizes) < 100:
            return False

        # Estimer l'exposant de la loi de puissance
        sizes = np.array([s for s in self.avalanche_sizes if s > 0])
        log_sizes = np.log(sizes)

        # Test simple: variance du log doit être grande
        return np.std(log_sizes) > 1.0
```

## Applications

```
┌─────────────────────────────────────────────────────────────────┐
│               APPLICATIONS DE L'AUTO-ORGANISATION                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INGÉNIERIE:                                                    │
│  • Essaims de drones (coordination décentralisée)              │
│  • Réseaux auto-réparateurs                                    │
│  • Optimisation par colonies de fourmis (ACO)                  │
│                                                                  │
│  INFORMATIQUE:                                                  │
│  • Réseaux peer-to-peer                                        │
│  • Équilibrage de charge distribué                             │
│  • Cartes auto-organisatrices (SOM, Kohonen)                   │
│                                                                  │
│  URBANISME:                                                     │
│  • Formation des villes (Christaller)                          │
│  • Flux de trafic                                               │
│  • Gentrification                                               │
│                                                                  │
│  ÉCONOMIE:                                                      │
│  • Formation des prix (main invisible)                         │
│  • Clusters industriels                                        │
│  • Crypto-économies                                             │
│                                                                  │
│  BIOLOGIE:                                                      │
│  • Morphogenèse                                                 │
│  • Colonies d'insectes sociaux                                 │
│  • Organisation cérébrale                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Conclusion

```
┌─────────────────────────────────────────────────────────────────┐
│              PRINCIPES DE L'AUTO-ORGANISATION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  "L'ordre peut naître du chaos, sans architecte."               │
│                                                                  │
│  Conditions nécessaires:                                        │
│                                                                  │
│  1. SYSTÈME OUVERT                                              │
│     Flux d'énergie/matière à travers le système                │
│     (dissipation permet organisation)                           │
│                                                                  │
│  2. NON-LINÉARITÉ                                               │
│     Interactions non-linéaires entre composants                 │
│     (amplification possible)                                    │
│                                                                  │
│  3. RÉTROACTION                                                 │
│     Boucles positives (amplification) et négatives (stabilité) │
│                                                                  │
│  4. MULTIPLICITÉ DE COMPOSANTS                                  │
│     Assez d'éléments pour que la statistique "fonctionne"      │
│                                                                  │
│  5. FLUCTUATIONS                                                │
│     Le bruit est nécessaire pour explorer l'espace des états   │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ "Loin de l'équilibre, la matière acquiert de nouvelles   │ │
│  │  propriétés"  - Ilya Prigogine                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*"From simple rules, complex patterns emerge."*
