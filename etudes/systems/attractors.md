# Attracteurs : Les Destinations des Systèmes Dynamiques

## Définition

Un attracteur est un ensemble vers lequel un système dynamique évolue au fil du temps, indépendamment des conditions initiales dans son bassin d'attraction.

```
┌─────────────────────────────────────────────────────────────┐
│                     CONCEPT D'ATTRACTEUR                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Espace des phases:                                        │
│                                                              │
│      ╲    ╲    │    ╱    ╱                                  │
│       ╲    ╲   │   ╱    ╱                                   │
│        ╲    ╲  │  ╱    ╱                                    │
│         ╲    ╲ │ ╱    ╱                                     │
│          ╲    ╲│╱    ╱                                      │
│           ────●────         ← ATTRACTEUR (point fixe)       │
│          ╱    ╱│╲    ╲                                      │
│         ╱    ╱ │ ╲    ╲                                     │
│        ╱    ╱  │  ╲    ╲                                    │
│       ╱    ╱   │   ╲    ╲                                   │
│      ╱    ╱    │    ╲    ╲                                  │
│                                                              │
│   Toutes les trajectoires convergent vers l'attracteur      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Taxonomie des Attracteurs

```
┌─────────────────────────────────────────────────────────────────┐
│                      TYPES D'ATTRACTEURS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. POINT FIXE                    2. CYCLE LIMITE               │
│     (dimension 0)                    (dimension 1)              │
│                                                                  │
│         ╲   │   ╱                      ╭──────╮                 │
│          ╲  │  ╱                    ↗ │      │ ↘               │
│           ╲ │ ╱                    │  │  →   │  │               │
│            ●                       │  │      │  │               │
│           ╱ │ ╲                    ↖ │      │ ↙               │
│          ╱  │  ╲                      ╰──────╯                  │
│         ╱   │   ╲                                               │
│                                                                  │
│     Équilibre stable                Oscillation périodique      │
│     Ex: Pendule amorti             Ex: Battement cardiaque     │
│                                                                  │
│  3. TORE                          4. ATTRACTEUR ÉTRANGE         │
│     (dimension 2)                    (dimension fractale)       │
│                                                                  │
│       ╭─────────╮                   ╱╲  ╱╲   ╱╲                │
│      ╱    ╭─╮    ╲                 ╱  ╲╱  ╲ ╱  ╲               │
│     │    │   │    │              ╱        ╳      ╲             │
│     │    ╰─╯    │               ╲  ╱╲  ╱    ╲  ╱╲             │
│      ╲          ╱                 ╲╱  ╲╱      ╲╱  ╲            │
│       ╰─────────╯                                               │
│                                                                  │
│     Quasi-périodicité             Chaos déterministe            │
│     Ex: Deux oscillateurs         Ex: Météo, turbulence        │
│         indépendants                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Formalisation Mathématique

```python
"""
Étude des attracteurs dans les systèmes dynamiques
"""

import numpy as np
from typing import Callable, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
from scipy.integrate import odeint

class AttractorType(Enum):
    FIXED_POINT = "point_fixe"
    LIMIT_CYCLE = "cycle_limite"
    TORUS = "tore"
    STRANGE = "etrange"
    NONE = "aucun"

@dataclass
class Attractor:
    """Représentation d'un attracteur"""
    type: AttractorType
    dimension: float  # Peut être fractale
    basin_volume: float  # Volume du bassin d'attraction
    lyapunov_exponents: List[float]  # Exposants de Lyapunov

class DynamicalSystem:
    """
    Système dynamique général
    dx/dt = f(x, t)
    """

    def __init__(self, dynamics: Callable[[np.ndarray, float], np.ndarray],
                 dimension: int):
        self.dynamics = dynamics
        self.dim = dimension

    def trajectory(self, initial: np.ndarray, t_span: np.ndarray) -> np.ndarray:
        """Calcule une trajectoire"""
        return odeint(self.dynamics, initial, t_span)

    def find_fixed_points(self, search_region: Tuple[np.ndarray, np.ndarray],
                          n_samples: int = 1000) -> List[np.ndarray]:
        """
        Recherche les points fixes: f(x*) = 0
        Méthode: Newton-Raphson depuis points aléatoires
        """
        from scipy.optimize import fsolve

        low, high = search_region
        fixed_points = []

        for _ in range(n_samples):
            x0 = np.random.uniform(low, high)
            try:
                root, info, ier, msg = fsolve(
                    lambda x: self.dynamics(x, 0), x0, full_output=True
                )
                if ier == 1:  # Convergence
                    # Vérifier si c'est un nouveau point
                    is_new = True
                    for fp in fixed_points:
                        if np.allclose(root, fp, atol=1e-6):
                            is_new = False
                            break
                    if is_new:
                        fixed_points.append(root)
            except:
                continue

        return fixed_points

    def classify_fixed_point(self, fixed_point: np.ndarray) -> str:
        """
        Classifie un point fixe selon les valeurs propres du Jacobien

        ┌──────────────────────────────────────────────────┐
        │           CLASSIFICATION DES POINTS FIXES        │
        ├──────────────────────────────────────────────────┤
        │                                                  │
        │   Valeurs propres λ:                            │
        │                                                  │
        │   • Re(λ) < 0 pour tous: STABLE (noeud/spiral) │
        │   • Re(λ) > 0 pour tous: INSTABLE              │
        │   • Re(λ) mixtes: SELLE (instable)             │
        │   • Re(λ) = 0: CENTRE (marginalement stable)   │
        │                                                  │
        │   Im(λ) ≠ 0: comportement oscillatoire         │
        │                                                  │
        └──────────────────────────────────────────────────┘
        """
        # Calcul numérique du Jacobien
        jacobian = self._numerical_jacobian(fixed_point)
        eigenvalues = np.linalg.eigvals(jacobian)

        real_parts = np.real(eigenvalues)
        imag_parts = np.imag(eigenvalues)

        has_oscillation = np.any(np.abs(imag_parts) > 1e-6)

        if np.all(real_parts < -1e-6):
            return "spiral_stable" if has_oscillation else "noeud_stable"
        elif np.all(real_parts > 1e-6):
            return "spiral_instable" if has_oscillation else "noeud_instable"
        elif np.all(np.abs(real_parts) < 1e-6):
            return "centre"
        else:
            return "selle"

    def _numerical_jacobian(self, x: np.ndarray, eps: float = 1e-6) -> np.ndarray:
        """Calcul numérique du Jacobien"""
        n = len(x)
        jacobian = np.zeros((n, n))
        f0 = self.dynamics(x, 0)

        for i in range(n):
            x_plus = x.copy()
            x_plus[i] += eps
            jacobian[:, i] = (self.dynamics(x_plus, 0) - f0) / eps

        return jacobian

    def lyapunov_exponents(self, initial: np.ndarray,
                          t_total: float, dt: float = 0.01) -> np.ndarray:
        """
        Calcule les exposants de Lyapunov

        λ > 0: Chaos (divergence exponentielle)
        λ = 0: Cycle limite
        λ < 0: Attracteur stable

        ┌──────────────────────────────────────────────────┐
        │          EXPOSANTS DE LYAPUNOV                   │
        ├──────────────────────────────────────────────────┤
        │                                                  │
        │   Mesurent le taux de séparation des           │
        │   trajectoires infiniment proches               │
        │                                                  │
        │   ||δx(t)|| ≈ ||δx(0)|| * e^(λt)               │
        │                                                  │
        │   Point fixe:  (-, -, -)                        │
        │   Cycle limite: (0, -, -)                       │
        │   Tore 2D:     (0, 0, -)                        │
        │   Chaos:       (+, 0, -)                        │
        │                                                  │
        └──────────────────────────────────────────────────┘
        """
        n = self.dim

        # Initialisation
        x = initial.copy()
        Q = np.eye(n)  # Vecteurs de perturbation orthonormés
        lyap_sum = np.zeros(n)

        steps = int(t_total / dt)

        for _ in range(steps):
            # Évolution du système
            x = x + self.dynamics(x, 0) * dt

            # Évolution des perturbations (linéarisé)
            J = self._numerical_jacobian(x)
            Q = Q + J @ Q * dt

            # Réorthonormalisation (Gram-Schmidt)
            Q, R = np.linalg.qr(Q)

            # Accumulation des exposants
            lyap_sum += np.log(np.abs(np.diag(R)) + 1e-10)

        return lyap_sum / t_total


class LorenzSystem(DynamicalSystem):
    """
    Système de Lorenz - Attracteur étrange classique

    dx/dt = σ(y - x)
    dy/dt = x(ρ - z) - y
    dz/dt = xy - βz

    Paramètres classiques: σ=10, ρ=28, β=8/3 → chaos
    """

    def __init__(self, sigma: float = 10, rho: float = 28, beta: float = 8/3):
        self.sigma = sigma
        self.rho = rho
        self.beta = beta

        def lorenz_dynamics(state, t):
            x, y, z = state
            return np.array([
                sigma * (y - x),
                x * (rho - z) - y,
                x * y - beta * z
            ])

        super().__init__(lorenz_dynamics, dimension=3)

    def visualize_ascii(self, trajectory: np.ndarray) -> str:
        """
        Projection ASCII de l'attracteur de Lorenz
        """
        x, y, z = trajectory[:, 0], trajectory[:, 1], trajectory[:, 2]

        # Normalisation pour affichage
        width, height = 60, 30
        x_norm = ((x - x.min()) / (x.max() - x.min()) * (width - 1)).astype(int)
        z_norm = ((z - z.min()) / (z.max() - z.min()) * (height - 1)).astype(int)

        # Création de la grille
        grid = [[' ' for _ in range(width)] for _ in range(height)]

        for xi, zi in zip(x_norm, z_norm):
            grid[height - 1 - zi][xi] = '.'

        return '\n'.join([''.join(row) for row in grid])


class PendulumSystem(DynamicalSystem):
    """
    Pendule simple - Illustre différents types d'attracteurs

    Sans friction: Orbites fermées (pas d'attracteur)
    Avec friction: Point fixe attracteur
    Forcé + friction: Peut avoir attracteur étrange
    """

    def __init__(self, damping: float = 0.5, forcing: float = 0,
                 forcing_freq: float = 1.0):
        self.damping = damping
        self.forcing = forcing
        self.forcing_freq = forcing_freq

        def pendulum_dynamics(state, t):
            theta, omega = state
            return np.array([
                omega,
                -np.sin(theta) - damping * omega + forcing * np.cos(forcing_freq * t)
            ])

        super().__init__(pendulum_dynamics, dimension=2)
```

## L'Attracteur de Lorenz

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTRACTEUR DE LORENZ                          │
│                    "L'effet papillon"                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                           z                                      │
│                           │                                      │
│                    ╱╲     │     ╱╲                              │
│                   ╱  ╲    │    ╱  ╲                             │
│                  ╱    ╲   │   ╱    ╲                            │
│                 ╱      ╲  │  ╱      ╲                           │
│                │   ↙    ╲ │ ╱    ↘   │                          │
│                │  ╱      ╲│╱      ╲  │                          │
│                │ ╱        ╳        ╲ │                          │
│                │╱        ╱│╲        ╲│                          │
│               ─╳────────╱─┼─╲────────╳───▶ x                    │
│                │╲      ╱  │  ╲      ╱│                          │
│                │ ╲    ╱   │   ╲    ╱ │                          │
│                │  ↖  ╱    │    ╲  ↗  │                          │
│                 ╲   ╱     │     ╲   ╱                           │
│                  ╲ ╱      │      ╲ ╱                            │
│                   ╲       │       ╱                             │
│                    ╲      │      ╱                              │
│                                                                  │
│   Propriétés:                                                   │
│   • Dimension fractale ≈ 2.06                                   │
│   • Exposant de Lyapunov max ≈ 0.9                             │
│   • Sensibilité aux conditions initiales                        │
│   • Trajectoire ne se recoupe jamais                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Bassins d'Attraction

```python
class BasinAnalyzer:
    """
    Analyse des bassins d'attraction
    """

    def __init__(self, system: DynamicalSystem):
        self.system = system

    def map_basin_2d(self, x_range: Tuple[float, float],
                     y_range: Tuple[float, float],
                     resolution: int = 100,
                     t_final: float = 100) -> np.ndarray:
        """
        Cartographie le bassin d'attraction en 2D

        ┌─────────────────────────────────────────────┐
        │           BASSIN D'ATTRACTION               │
        ├─────────────────────────────────────────────┤
        │                                             │
        │   ████████░░░░░░░░░░░░░████████            │
        │   ███████░░░░░░░░░░░░░░░███████            │
        │   ██████░░░░░░░░░░░░░░░░░██████            │
        │   █████░░░░░░●A░░░░░░░░░░░█████            │
        │   ████░░░░░░░░░░░░░░░░░░░░░████            │
        │   ███░░░░░░░░░░░░░░░░░░░░░░░███            │
        │   ██░░░░░░░░░░░░░░░░░░░░░░░░░██            │
        │   █░░░░░░░░░░░░░░░░░░░░░░░░░░░█            │
        │   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░            │
        │   ████████████████████████████             │
        │   ████████████●B██████████████             │
        │   ████████████████████████████             │
        │                                             │
        │   ░ = Bassin de A    █ = Bassin de B       │
        │                                             │
        └─────────────────────────────────────────────┘
        """
        x_vals = np.linspace(x_range[0], x_range[1], resolution)
        y_vals = np.linspace(y_range[0], y_range[1], resolution)

        basin_map = np.zeros((resolution, resolution))
        t_span = np.linspace(0, t_final, 1000)

        for i, x in enumerate(x_vals):
            for j, y in enumerate(y_vals):
                initial = np.array([x, y])
                trajectory = self.system.trajectory(initial, t_span)
                final_state = trajectory[-1]

                # Identifier vers quel attracteur converge
                basin_map[j, i] = self._identify_attractor(final_state)

        return basin_map

    def _identify_attractor(self, state: np.ndarray, tolerance: float = 0.1) -> int:
        """Identifie l'attracteur correspondant à l'état final"""
        # Simplification: retourne un hash de l'état arrondi
        rounded = np.round(state / tolerance)
        return hash(tuple(rounded)) % 10

    def fractal_boundary(self, x_range: Tuple[float, float],
                         y_range: Tuple[float, float],
                         resolution: int = 500) -> float:
        """
        Mesure la dimension fractale de la frontière du bassin

        Une dimension > 1 indique une frontière fractale
        (sensibilité aux conditions initiales même loin de l'attracteur)
        """
        basin = self.map_basin_2d(x_range, y_range, resolution)

        # Compter les points de frontière à différentes échelles
        box_sizes = [2, 4, 8, 16, 32]
        boundary_counts = []

        for box_size in box_sizes:
            count = 0
            for i in range(0, resolution - box_size, box_size):
                for j in range(0, resolution - box_size, box_size):
                    box = basin[i:i+box_size, j:j+box_size]
                    if len(np.unique(box)) > 1:
                        count += 1
            boundary_counts.append(count)

        # Régression log-log pour la dimension
        log_sizes = np.log(1 / np.array(box_sizes))
        log_counts = np.log(np.array(boundary_counts) + 1)

        slope, _ = np.polyfit(log_sizes, log_counts, 1)
        return slope  # Dimension fractale approximée
```

## Portrait de Phase

```
┌─────────────────────────────────────────────────────────────────┐
│                     PORTRAITS DE PHASE                           │
│              Visualisation des attracteurs en 2D                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   POINT FIXE STABLE:              CYCLE LIMITE:                 │
│                                                                  │
│        ↘   │   ↙                      ↗ ───── ↘                │
│         ╲  │  ╱                      │    ↑    │                │
│          ╲ │ ╱                       │ ←  ●  → │                │
│   ─────── ● ───────                  │    ↓    │                │
│          ╱ │ ╲                       ↖ ───── ↙                 │
│         ╱  │  ╲                                                  │
│        ↗   │   ↖                                                │
│                                                                  │
│   SELLE (instable):               CENTRE (marginalement stable):│
│                                                                  │
│        ↗   │   ↗                   ╭─────────╮                  │
│         ╲  │  ╱                    │ ╭─────╮ │                  │
│          ╲ │ ╱                     │ │ ╭─╮ │ │                  │
│   ←────── ● ──────→               │ │ │●│ │ │                  │
│          ╱ │ ╲                     │ │ ╰─╯ │ │                  │
│         ╱  │  ╲                    │ ╰─────╯ │                  │
│        ↙   │   ↙                   ╰─────────╯                  │
│                                                                  │
│   NOEUD-SELLE (bifurcation):      ATTRACTEUR ÉTRANGE:          │
│                                                                  │
│          │   │                      ╱ ╲ ╱ ╲ ╱ ╲                 │
│          │   │                     ╱ ╳ ╳ ╳ ╳ ╲                  │
│          ↓   ↓                    ╲ ╱ ╲ ╱ ╲ ╱ ╲ ╱               │
│   ─────────●←─────                 ╲ ╳ ╳ ╳ ╲                   │
│          ↑   ↑                      ╱ ╲ ╱ ╲ ╱                   │
│          │   │                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Reconstruction d'Attracteur (Théorème de Takens)

```python
class AttractorReconstructor:
    """
    Reconstruction d'attracteur depuis une série temporelle
    Basé sur le théorème de Takens (1981)

    Un attracteur de dimension d peut être reconstruit
    depuis une seule variable x(t) en utilisant des délais:

    [x(t), x(t-τ), x(t-2τ), ..., x(t-(m-1)τ)]

    où m > 2d (dimension d'embedding)
    """

    def __init__(self, time_series: np.ndarray):
        self.data = time_series

    def find_optimal_delay(self, max_delay: int = 100) -> int:
        """
        Trouve le délai optimal τ par autocorrélation
        Choix: premier zéro de l'autocorrélation ou premier minimum
        """
        autocorr = np.correlate(self.data - np.mean(self.data),
                                self.data - np.mean(self.data), mode='full')
        autocorr = autocorr[len(autocorr)//2:]
        autocorr /= autocorr[0]

        # Premier passage par zéro
        for i in range(1, min(max_delay, len(autocorr))):
            if autocorr[i] <= 0:
                return i

        # Ou premier minimum local
        for i in range(1, min(max_delay, len(autocorr) - 1)):
            if autocorr[i] < autocorr[i-1] and autocorr[i] < autocorr[i+1]:
                return i

        return max_delay // 4

    def find_embedding_dimension(self, delay: int, max_dim: int = 10) -> int:
        """
        Trouve la dimension d'embedding optimale
        Méthode: False Nearest Neighbors (FNN)
        """
        threshold = 15  # Seuil standard

        for dim in range(1, max_dim):
            fnn_ratio = self._compute_fnn(delay, dim, threshold)
            if fnn_ratio < 0.01:  # Moins de 1% de faux voisins
                return dim

        return max_dim

    def _compute_fnn(self, delay: int, dim: int, threshold: float) -> float:
        """Calcule le ratio de faux plus proches voisins"""
        embedded = self.embed(delay, dim)
        embedded_plus = self.embed(delay, dim + 1)

        n = len(embedded)
        false_neighbors = 0

        for i in range(n - delay):
            # Trouver le plus proche voisin en dimension dim
            distances = np.linalg.norm(embedded - embedded[i], axis=1)
            distances[i] = np.inf  # Exclure soi-même
            nearest_idx = np.argmin(distances)

            if nearest_idx < len(embedded_plus) and i < len(embedded_plus):
                # Vérifier si c'est un faux voisin en dim+1
                dist_dim = distances[nearest_idx]
                dist_dim_plus = np.linalg.norm(embedded_plus[nearest_idx] - embedded_plus[i])

                if dist_dim > 0:
                    ratio = abs(dist_dim_plus - dist_dim) / dist_dim
                    if ratio > threshold:
                        false_neighbors += 1

        return false_neighbors / n

    def embed(self, delay: int, dimension: int) -> np.ndarray:
        """
        Construit l'espace d'embedding

        ┌────────────────────────────────────────────────┐
        │           EMBEDDING DE TAKENS                  │
        ├────────────────────────────────────────────────┤
        │                                                │
        │   Série temporelle: x(t)                      │
        │                                                │
        │   ───●───●───●───●───●───●───●───●──▶ t       │
        │      │   │   │   │                            │
        │      ▼   ▼   ▼   ▼                            │
        │                                                │
        │   Vecteur d'état: [x(t), x(t-τ), x(t-2τ)]    │
        │                                                │
        │         x(t-2τ)                               │
        │            │                                   │
        │            │    ╱╲                            │
        │            │   ╱  ╲                           │
        │            │  ╱    ╲                          │
        │            │ ╱      ╲                         │
        │            │╱────────╲───────▶ x(t)          │
        │           ╱           ╲                       │
        │          ╱             ╲                      │
        │                     x(t-τ)                    │
        │                                                │
        └────────────────────────────────────────────────┘
        """
        n = len(self.data) - (dimension - 1) * delay
        embedded = np.zeros((n, dimension))

        for i in range(dimension):
            embedded[:, i] = self.data[i * delay : i * delay + n]

        return embedded

    def correlation_dimension(self, embedded: np.ndarray,
                             r_range: Tuple[float, float] = None) -> float:
        """
        Calcule la dimension de corrélation (Grassberger-Procaccia)

        C(r) ~ r^D où D est la dimension de corrélation
        """
        n = len(embedded)

        # Calculer toutes les distances
        distances = []
        for i in range(n):
            for j in range(i + 1, n):
                d = np.linalg.norm(embedded[i] - embedded[j])
                if d > 0:
                    distances.append(d)

        distances = np.array(distances)

        if r_range is None:
            r_range = (np.percentile(distances, 1), np.percentile(distances, 50))

        # C(r) pour différentes valeurs de r
        r_values = np.logspace(np.log10(r_range[0]), np.log10(r_range[1]), 20)
        c_values = []

        for r in r_values:
            count = np.sum(distances < r)
            c_values.append(count / (n * (n - 1) / 2))

        # Régression log-log
        log_r = np.log(r_values)
        log_c = np.log(np.array(c_values) + 1e-10)

        # Dimension = pente
        slope, _ = np.polyfit(log_r, log_c, 1)
        return slope
```

## Applications

```
┌─────────────────────────────────────────────────────────────────┐
│              APPLICATIONS DES ATTRACTEURS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHYSIQUE:                                                      │
│  • Prédiction météo (attracteur de Lorenz)                     │
│  • Turbulence (attracteurs étranges)                           │
│  • Oscillateurs couplés (synchronisation)                      │
│                                                                  │
│  BIOLOGIE:                                                      │
│  • Rythmes cardiaques (cycles limites)                         │
│  • Dynamique neuronale (multi-stabilité)                       │
│  • Écosystèmes (bassins d'extinction)                          │
│                                                                  │
│  ÉCONOMIE:                                                      │
│  • Cycles économiques                                           │
│  • Équilibres de marché multiples                              │
│  • Crises financières (transitions d'attracteur)               │
│                                                                  │
│  PSYCHOLOGIE:                                                   │
│  • États émotionnels comme attracteurs                         │
│  • Changement de comportement (bifurcation)                    │
│  • Addiction (bassin profond)                                   │
│                                                                  │
│  INTELLIGENCE ARTIFICIELLE:                                     │
│  • Réseaux de Hopfield (mémoires = attracteurs)               │
│  • Entraînement (convergence vers minima)                      │
│  • Génération (échantillonnage d'attracteur)                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Conclusion

```
┌─────────────────────────────────────────────────────────────────┐
│                 ESSENCE DES ATTRACTEURS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  "Un attracteur est le destin dynamique d'un système"           │
│                                                                  │
│  Insights clés:                                                 │
│                                                                  │
│  1. PRÉVISIBILITÉ LIMITÉE                                       │
│     Connaître l'attracteur ≠ prédire la trajectoire            │
│     Le chaos déterministe reste imprévisible                    │
│                                                                  │
│  2. STRUCTURE DANS LE CHAOS                                     │
│     Même les systèmes chaotiques ont une structure              │
│     L'attracteur étrange est un ensemble organisé               │
│                                                                  │
│  3. MULTI-STABILITÉ                                             │
│     Plusieurs attracteurs = plusieurs "destins"                 │
│     Les conditions initiales déterminent lequel                 │
│                                                                  │
│  4. TRANSITIONS                                                 │
│     Les systèmes peuvent sauter entre attracteurs               │
│     (catastrophes, bifurcations, bruit)                         │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ "La stabilité est une île dans un océan de chaos"        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*"Chaos is not the absence of order, but the presence of complex order."*
