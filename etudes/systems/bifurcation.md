# Bifurcation : Les Points de Non-Retour des Systèmes

## Définition

Une bifurcation est un changement qualitatif dans la structure dynamique d'un système lorsqu'un paramètre traverse une valeur critique. Le système passe d'un régime comportemental à un autre.

```
┌─────────────────────────────────────────────────────────────┐
│                   CONCEPT DE BIFURCATION                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Paramètre λ:     λ₁          λc          λ₂               │
│                     │           │           │                │
│                     ▼           ▼           ▼                │
│                                                              │
│   Comportement:  [Régime A] ──▶ [TRANSITION] ──▶ [Régime B] │
│                   Stable      Critique       Nouveau        │
│                                                              │
│   Exemples:                                                  │
│   • Eau: 99°C → 100°C → 101°C (liquide → ébullition)       │
│   • Population: croissance → effondrement                   │
│   • Opinion: consensus → polarisation                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Types de Bifurcations

### Taxonomie Complète

```
┌─────────────────────────────────────────────────────────────────┐
│                    TYPES DE BIFURCATIONS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BIFURCATIONS LOCALES (changement près d'un point fixe):        │
│                                                                  │
│  1. SELLE-NOEUD (Saddle-Node)                                   │
│     Création/destruction de deux points fixes                    │
│                                                                  │
│        λ < λc          λ = λc          λ > λc                   │
│          ↓               ↓               ↓                      │
│        ──●──●──        ────●────        ──────────              │
│          S  I              │             (aucun)                │
│                                                                  │
│  2. TRANSCRITIQUE                                               │
│     Échange de stabilité entre deux points fixes                │
│                                                                  │
│        λ < λc          λ = λc          λ > λc                   │
│          ↓               ↓               ↓                      │
│        ──●──             ●             ──●──                    │
│          S──●──        ──●──           I──●──                   │
│             I            I                S                      │
│                                                                  │
│  3. FOURCHE (Pitchfork)                                         │
│     Un point fixe se divise en trois                            │
│                                                                  │
│        λ < λc          λ = λc          λ > λc                   │
│          ↓               ↓               ↓                      │
│                                        ●  S                     │
│        ──●──           ──●──          ╲│╱                       │
│          S               S             ●  I                     │
│                                       ╱│╲                       │
│                                        ●  S                     │
│                                                                  │
│  4. HOPF                                                        │
│     Point fixe → Cycle limite (oscillations)                    │
│                                                                  │
│        λ < λc          λ = λc          λ > λc                   │
│          ↓               ↓               ↓                      │
│         ╲│╱             ╲│╱            ╭───╮                    │
│        ──●──           ──●──          │ ● │                     │
│         ╱│╲             ╱│╲            ╰───╯                    │
│        stable          critique        cycle                    │
│                                                                  │
│  S = Stable, I = Instable                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Formalisation Mathématique

```python
"""
Analyse des bifurcations dans les systèmes dynamiques
"""

import numpy as np
from typing import Callable, List, Tuple, Dict, Optional
from dataclasses import dataclass
from enum import Enum
from scipy.optimize import fsolve, brentq
from scipy.integrate import odeint

class BifurcationType(Enum):
    SADDLE_NODE = "selle_noeud"
    TRANSCRITICAL = "transcritique"
    PITCHFORK_SUPER = "fourche_supercritique"
    PITCHFORK_SUB = "fourche_souscritique"
    HOPF_SUPER = "hopf_supercritique"
    HOPF_SUB = "hopf_souscritique"
    PERIOD_DOUBLING = "doublement_periode"
    GLOBAL = "globale"

@dataclass
class BifurcationPoint:
    """Représentation d'un point de bifurcation"""
    parameter_value: float
    type: BifurcationType
    eigenvalue_at_bifurcation: complex
    branches_before: int
    branches_after: int

class ParametricSystem:
    """
    Système dynamique dépendant d'un paramètre
    dx/dt = f(x, λ)
    """

    def __init__(self, dynamics: Callable[[np.ndarray, float, float], np.ndarray],
                 dimension: int):
        """
        dynamics: fonction (x, t, lambda) -> dx/dt
        """
        self.dynamics = dynamics
        self.dim = dimension

    def fixed_points(self, lambda_val: float,
                    search_range: Tuple[float, float] = (-10, 10),
                    n_seeds: int = 100) -> List[np.ndarray]:
        """Trouve les points fixes pour une valeur de λ donnée"""
        fixed_pts = []

        for _ in range(n_seeds):
            x0 = np.random.uniform(search_range[0], search_range[1], self.dim)
            try:
                root, info, ier, _ = fsolve(
                    lambda x: self.dynamics(x, 0, lambda_val),
                    x0, full_output=True
                )
                if ier == 1:
                    # Vérifier unicité
                    is_new = True
                    for fp in fixed_pts:
                        if np.allclose(root, fp, atol=1e-6):
                            is_new = False
                            break
                    if is_new and search_range[0] <= root[0] <= search_range[1]:
                        fixed_pts.append(root)
            except:
                continue

        return fixed_pts

    def jacobian(self, x: np.ndarray, lambda_val: float,
                eps: float = 1e-6) -> np.ndarray:
        """Calcul numérique du Jacobien"""
        n = len(x)
        J = np.zeros((n, n))
        f0 = self.dynamics(x, 0, lambda_val)

        for i in range(n):
            x_plus = x.copy()
            x_plus[i] += eps
            J[:, i] = (self.dynamics(x_plus, 0, lambda_val) - f0) / eps

        return J

    def stability(self, x: np.ndarray, lambda_val: float) -> Tuple[bool, np.ndarray]:
        """
        Analyse la stabilité d'un point fixe

        Retourne: (est_stable, valeurs_propres)
        """
        J = self.jacobian(x, lambda_val)
        eigenvalues = np.linalg.eigvals(J)

        # Stable si toutes les parties réelles sont négatives
        stable = np.all(np.real(eigenvalues) < 0)

        return stable, eigenvalues

    def bifurcation_diagram(self, lambda_range: Tuple[float, float],
                           n_points: int = 200) -> Dict:
        """
        Construit le diagramme de bifurcation

        ┌────────────────────────────────────────────────────┐
        │           DIAGRAMME DE BIFURCATION                 │
        ├────────────────────────────────────────────────────┤
        │                                                    │
        │  x │                    ╱───                       │
        │    │                   ╱                           │
        │    │         ●───────●                             │
        │    │        ╱         ╲                            │
        │    │───────●           ╲───                        │
        │    │      ╱                                        │
        │    │     ╱                                         │
        │    └────────────────────────────▶ λ               │
        │              λc                                    │
        │                                                    │
        │    ─── = branche stable                           │
        │    --- = branche instable                          │
        │    ● = point de bifurcation                       │
        │                                                    │
        └────────────────────────────────────────────────────┘
        """
        lambdas = np.linspace(lambda_range[0], lambda_range[1], n_points)

        diagram = {
            'lambda': [],
            'x': [],
            'stable': [],
            'eigenvalues': []
        }

        for lam in lambdas:
            fixed_pts = self.fixed_points(lam)
            for fp in fixed_pts:
                stable, eigs = self.stability(fp, lam)
                diagram['lambda'].append(lam)
                diagram['x'].append(fp[0] if self.dim == 1 else fp)
                diagram['stable'].append(stable)
                diagram['eigenvalues'].append(eigs)

        return diagram

    def find_bifurcations(self, lambda_range: Tuple[float, float],
                         resolution: int = 1000) -> List[BifurcationPoint]:
        """
        Détecte automatiquement les points de bifurcation
        """
        lambdas = np.linspace(lambda_range[0], lambda_range[1], resolution)
        bifurcations = []

        prev_n_fixed = None
        prev_stabilities = None

        for lam in lambdas:
            fixed_pts = self.fixed_points(lam)
            n_fixed = len(fixed_pts)

            stabilities = []
            max_real_eig = -np.inf
            critical_eig = None

            for fp in fixed_pts:
                stable, eigs = self.stability(fp, lam)
                stabilities.append(stable)
                for e in eigs:
                    if np.real(e) > max_real_eig:
                        max_real_eig = np.real(e)
                        critical_eig = e

            # Détecter changement
            if prev_n_fixed is not None:
                if n_fixed != prev_n_fixed:
                    # Changement du nombre de points fixes
                    bif_type = self._classify_bifurcation(
                        prev_n_fixed, n_fixed, prev_stabilities, stabilities, critical_eig
                    )
                    bifurcations.append(BifurcationPoint(
                        parameter_value=lam,
                        type=bif_type,
                        eigenvalue_at_bifurcation=critical_eig,
                        branches_before=prev_n_fixed,
                        branches_after=n_fixed
                    ))
                elif stabilities != prev_stabilities:
                    # Changement de stabilité
                    if critical_eig and np.abs(np.imag(critical_eig)) > 0.01:
                        bif_type = BifurcationType.HOPF_SUPER
                    else:
                        bif_type = BifurcationType.TRANSCRITICAL
                    bifurcations.append(BifurcationPoint(
                        parameter_value=lam,
                        type=bif_type,
                        eigenvalue_at_bifurcation=critical_eig,
                        branches_before=n_fixed,
                        branches_after=n_fixed
                    ))

            prev_n_fixed = n_fixed
            prev_stabilities = stabilities

        return bifurcations

    def _classify_bifurcation(self, n_before: int, n_after: int,
                             stab_before: List, stab_after: List,
                             critical_eig: complex) -> BifurcationType:
        """Classifie le type de bifurcation"""
        if n_after == n_before + 2 or n_after == n_before - 2:
            return BifurcationType.SADDLE_NODE
        elif n_after == n_before + 2:
            return BifurcationType.PITCHFORK_SUPER
        elif critical_eig and np.abs(np.imag(critical_eig)) > 0.01:
            return BifurcationType.HOPF_SUPER
        else:
            return BifurcationType.TRANSCRITICAL


class LogisticMap:
    """
    Application logistique: x_{n+1} = r * x_n * (1 - x_n)

    Modèle canonique de la route vers le chaos par doublement de période

    ┌─────────────────────────────────────────────────────────────┐
    │              CASCADE DE DOUBLEMENT DE PÉRIODE               │
    ├─────────────────────────────────────────────────────────────┤
    │                                                             │
    │   r < 1:      Point fixe à 0 (extinction)                  │
    │   1 < r < 3:  Point fixe non-trivial                       │
    │   r ≈ 3:      Bifurcation vers cycle-2                     │
    │   r ≈ 3.449:  Bifurcation vers cycle-4                     │
    │   r ≈ 3.544:  Bifurcation vers cycle-8                     │
    │   ...                                                       │
    │   r ≈ 3.5699: Accumulation → CHAOS                         │
    │   r > 3.5699: Chaos avec fenêtres de périodicité           │
    │                                                             │
    │   Constante de Feigenbaum: δ ≈ 4.6692                      │
    │   (ratio des intervalles entre bifurcations)               │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
    """

    def __init__(self, r: float):
        self.r = r

    def iterate(self, x: float) -> float:
        """Une itération"""
        return self.r * x * (1 - x)

    def trajectory(self, x0: float, n_steps: int) -> np.ndarray:
        """Calcule une trajectoire"""
        traj = [x0]
        x = x0
        for _ in range(n_steps):
            x = self.iterate(x)
            traj.append(x)
        return np.array(traj)

    def find_period(self, x0: float = 0.5, transient: int = 1000,
                   max_period: int = 256) -> int:
        """
        Détecte la période de l'orbite
        Retourne -1 si chaotique (période > max_period)
        """
        # Éliminer transitoire
        x = x0
        for _ in range(transient):
            x = self.iterate(x)

        # Chercher la période
        orbit = [x]
        for _ in range(max_period):
            x = self.iterate(x)
            for i, prev in enumerate(orbit):
                if abs(x - prev) < 1e-8:
                    return len(orbit) - i
            orbit.append(x)

        return -1  # Chaotique ou période très longue

    @staticmethod
    def bifurcation_diagram(r_range: Tuple[float, float] = (2.5, 4.0),
                           resolution: int = 1000,
                           n_iterations: int = 1000,
                           n_show: int = 100) -> Dict:
        """
        Génère le diagramme de bifurcation de l'application logistique
        """
        r_values = np.linspace(r_range[0], r_range[1], resolution)

        diagram = {'r': [], 'x': []}

        for r in r_values:
            lm = LogisticMap(r)
            x = 0.5

            # Transitoire
            for _ in range(n_iterations - n_show):
                x = lm.iterate(x)

            # Collecter les valeurs stables
            for _ in range(n_show):
                x = lm.iterate(x)
                diagram['r'].append(r)
                diagram['x'].append(x)

        return diagram

    @staticmethod
    def feigenbaum_constant(precision: int = 5) -> float:
        """
        Calcule numériquement la constante de Feigenbaum δ

        δ = lim (r_n - r_{n-1}) / (r_{n+1} - r_n)

        où r_n est le paramètre de la n-ième bifurcation
        """
        def find_bifurcation(r_start: float, period_before: int) -> float:
            """Trouve le point de bifurcation par dichotomie"""
            r_low, r_high = r_start, r_start + 1

            while r_high - r_low > 1e-10:
                r_mid = (r_low + r_high) / 2
                lm = LogisticMap(r_mid)
                period = lm.find_period()

                if period == period_before:
                    r_low = r_mid
                else:
                    r_high = r_mid

            return (r_low + r_high) / 2

        # Trouver les premiers points de bifurcation
        bifurcations = [1.0, 3.0]  # r_0 et r_1 connus

        current_period = 1
        r_search = 3.0

        for _ in range(precision):
            r_bif = find_bifurcation(r_search, current_period)
            bifurcations.append(r_bif)
            current_period *= 2
            r_search = r_bif

        # Calculer δ
        deltas = []
        for i in range(2, len(bifurcations) - 1):
            delta = (bifurcations[i] - bifurcations[i-1]) / (bifurcations[i+1] - bifurcations[i])
            deltas.append(delta)

        return deltas[-1] if deltas else 4.6692
```

## Diagramme de Bifurcation Logistique

```
┌─────────────────────────────────────────────────────────────────┐
│         DIAGRAMME DE BIFURCATION (Application Logistique)       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  x │                                         ▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓  │
│  1 │                                       ▒▒ ░░░  ▒▒▒   ▒▓▓▓  │
│    │                                      ▒░  ▒▒▒ ░░   ▒▒ ░░▓  │
│    │                                    ▒▒    ░░  ▒▒  ░░  ▒▒▒  │
│0.8 │                                  ╱▒       ▒▒  ░░ ▒▒ ░░ ▓  │
│    │                                ╱╱ ▒       ░░  ▒▒ ░░▒▒░░▓  │
│    │                              ╱╱   ▒      ▒▒   ░░ ▒▒ ░░░▓  │
│0.6 │                            ╱╱     ▒       ░░  ▒▒░░ ▒▒░░▓  │
│    │                          ╱╱        ▒      ▒▒  ░░▒▒ ░░ ░▓  │
│    │                        ╱╱                  ░░ ▒▒ ░░▒▒ ░▓  │
│0.4 │                      ╱╱                    ▒▒░░ ▒▒ ░░ ▒▓  │
│    │                    ╱╱                       ░░▒▒ ░░▒▒  ▓  │
│    │                  ╱╱                          ▒▒░░ ▒▒░░ ▓  │
│0.2 │                ╱╱                             ░░▒▒ ░░▒▒▓  │
│    │              ╱╱                                ▒▒░░ ▒▒░▓  │
│    │────────────╱─────────────────────────────────────────────  │
│  0 └────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────▶ r │
│         1   1.5   2   2.5   3   3.2  3.4  3.5  3.6  3.8   4    │
│                             │    │    │    │                    │
│                             │    │    │    └─ Chaos             │
│                             │    │    └─ Cycle-8                │
│                             │    └─ Cycle-4                     │
│                             └─ Cycle-2                          │
│                                                                  │
│  Point fixe ──▶ Cycle-2 ──▶ Cycle-4 ──▶ Cycle-8 ──▶ ... ──▶ Chaos
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Bifurcation de Hopf

```python
class HopfBifurcation:
    """
    Bifurcation de Hopf: naissance d'oscillations

    Forme normale:
    ẋ = (λ - x² - y²)x - ωy
    ẏ = (λ - x² - y²)y + ωx

    λ < 0: Point fixe stable à l'origine
    λ > 0: Cycle limite de rayon √λ
    """

    def __init__(self, omega: float = 1.0):
        self.omega = omega

    def dynamics(self, state: np.ndarray, t: float, lambda_param: float) -> np.ndarray:
        x, y = state
        r_squared = x**2 + y**2

        dx = (lambda_param - r_squared) * x - self.omega * y
        dy = (lambda_param - r_squared) * y + self.omega * x

        return np.array([dx, dy])

    def analytical_solution(self, lambda_param: float) -> Dict:
        """
        Solution analytique

        λ < 0: Point fixe (0, 0)
        λ > 0: Cycle limite r = √λ, période = 2π/ω
        """
        if lambda_param <= 0:
            return {
                'type': 'point_fixe',
                'position': (0, 0),
                'stable': lambda_param < 0
            }
        else:
            return {
                'type': 'cycle_limite',
                'radius': np.sqrt(lambda_param),
                'period': 2 * np.pi / self.omega,
                'frequency': self.omega
            }

    def visualize_ascii(self, lambda_values: List[float]) -> str:
        """
        Visualisation ASCII de la bifurcation de Hopf
        """
        output = []

        for lam in lambda_values:
            sol = self.analytical_solution(lam)
            output.append(f"\nλ = {lam:.2f}:")

            if sol['type'] == 'point_fixe':
                output.append("""
        ╲   │   ╱
         ╲  │  ╱
          ╲ │ ╱
           ●
          ╱ │ ╲
         ╱  │  ╲
        ╱   │   ╲
        Point fixe stable
                """)
            else:
                r = sol['radius']
                output.append(f"""
           ╭───────╮
          ╱         ╲
         │     r={r:.2f}│
         │     ●     │
         │           │
          ╲         ╱
           ╰───────╯
        Cycle limite
                """)

        return '\n'.join(output)


class SaddleNodeBifurcation:
    """
    Bifurcation selle-noeud (collision de points fixes)

    Forme normale: ẋ = λ + x²

    λ < 0: Deux points fixes (±√(-λ))
    λ = 0: Un point fixe (collision)
    λ > 0: Aucun point fixe
    """

    def dynamics(self, x: float, lambda_param: float) -> float:
        return lambda_param + x**2

    def fixed_points(self, lambda_param: float) -> List[float]:
        if lambda_param < 0:
            sqrt_neg_lambda = np.sqrt(-lambda_param)
            return [-sqrt_neg_lambda, sqrt_neg_lambda]
        elif lambda_param == 0:
            return [0]
        else:
            return []

    def stability_analysis(self, lambda_param: float) -> Dict:
        """
        ┌────────────────────────────────────────────────────┐
        │         BIFURCATION SELLE-NOEUD                    │
        ├────────────────────────────────────────────────────┤
        │                                                    │
        │   λ < 0:                                          │
        │       f'(x*) = 2x*                                │
        │       x* = -√(-λ): f'(-√(-λ)) = -2√(-λ) < 0 STABLE│
        │       x* = +√(-λ): f'(+√(-λ)) = +2√(-λ) > 0 INSTAB│
        │                                                    │
        │   λ = 0:                                          │
        │       x* = 0: f'(0) = 0  (marginalement stable)   │
        │                                                    │
        │   λ > 0:                                          │
        │       Pas de points fixes                         │
        │       (tous les états divergent vers +∞)          │
        │                                                    │
        └────────────────────────────────────────────────────┘
        """
        fps = self.fixed_points(lambda_param)

        result = {'lambda': lambda_param, 'fixed_points': []}

        for fp in fps:
            derivative = 2 * fp  # f'(x) = 2x
            result['fixed_points'].append({
                'position': fp,
                'derivative': derivative,
                'stable': derivative < 0
            })

        return result
```

## Catastrophes (Théorie de Thom)

```
┌─────────────────────────────────────────────────────────────────┐
│               THÉORIE DES CATASTROPHES DE THOM                   │
│       Classification des singularités génériques                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Codimension 1 (1 paramètre de contrôle):                       │
│                                                                  │
│  1. PLI (Fold)                                                  │
│     V(x) = x³ + ax                                              │
│                                                                  │
│       V │    ╱                  │    │                          │
│         │   ╱   a < 0          │    │  a > 0                   │
│         │  ●                   │    │                           │
│         │ ╱ ╲                  │    │                           │
│         │╱   ●                 │    ╲╱                          │
│         └──────▶ x             └──────▶ x                       │
│                                                                  │
│  Codimension 2 (2 paramètres de contrôle):                      │
│                                                                  │
│  2. FRONCE (Cusp)                                               │
│     V(x) = x⁴ + ax² + bx                                        │
│                                                                  │
│            b │                                                   │
│              │     ╱│╲                                          │
│              │    ╱ │ ╲                                         │
│              │   ╱  │  ╲   Région bistable                      │
│              │  ╱   │   ╲                                       │
│              │ ╱    │    ╲                                      │
│         ─────┼──────●──────────▶ a                              │
│              │      │                                            │
│              │ Monostable                                        │
│                                                                  │
│     La fronce génère l'hystérésis!                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Hystérésis et Bifurcations

```python
class CuspCatastrophe:
    """
    Catastrophe de la fronce (cusp)
    Modèle de l'hystérésis

    V(x) = x⁴/4 + ax²/2 + bx
    ∂V/∂x = x³ + ax + b = 0
    """

    def potential(self, x: float, a: float, b: float) -> float:
        return x**4/4 + a*x**2/2 + b*x

    def equilibrium_equation(self, x: float, a: float, b: float) -> float:
        return x**3 + a*x + b

    def find_equilibria(self, a: float, b: float) -> List[Tuple[float, bool]]:
        """
        Trouve les équilibres et leur stabilité

        Stabilité: d²V/dx² = 3x² + a > 0 → stable
        """
        from numpy.polynomial import polynomial as P

        # Résoudre x³ + ax + b = 0
        coeffs = [b, a, 0, 1]  # Ordre croissant pour numpy
        roots = np.roots([1, 0, a, b])  # Ordre décroissant
        real_roots = roots[np.abs(roots.imag) < 1e-10].real

        equilibria = []
        for x in real_roots:
            second_deriv = 3*x**2 + a
            stable = second_deriv > 0
            equilibria.append((x, stable))

        return sorted(equilibria, key=lambda e: e[0])

    def hysteresis_loop(self, a: float, b_range: Tuple[float, float],
                       n_points: int = 100) -> Dict:
        """
        Génère une boucle d'hystérésis

        ┌────────────────────────────────────────────────────┐
        │              BOUCLE D'HYSTÉRÉSIS                   │
        ├────────────────────────────────────────────────────┤
        │                                                    │
        │   x │         ╭─────────────────╮                 │
        │     │        ╱                   │                 │
        │     │       ╱                    │                 │
        │     │      ●──────────────────▶ ●  saut!          │
        │     │                            │                 │
        │     │                            ▼                 │
        │     │     ● ◀──────────────────●                  │
        │     │     │                   ╱                    │
        │     │     │                  ╱                     │
        │     │     ╰─────────────────╯                      │
        │     └────────────────────────────▶ b              │
        │                                                    │
        │   La transition dépend de l'HISTOIRE du système   │
        │                                                    │
        └────────────────────────────────────────────────────┘
        """
        b_forward = np.linspace(b_range[0], b_range[1], n_points)
        b_backward = np.linspace(b_range[1], b_range[0], n_points)

        # Branche aller
        x_forward = []
        x_current = None
        for b in b_forward:
            eqs = self.find_equilibria(a, b)
            stable_eqs = [e for e in eqs if e[1]]

            if x_current is None:
                x_current = stable_eqs[0][0] if stable_eqs else 0
            else:
                # Suivre la branche la plus proche
                valid_eqs = [e for e in stable_eqs if abs(e[0] - x_current) < 2]
                if valid_eqs:
                    x_current = min(valid_eqs, key=lambda e: abs(e[0] - x_current))[0]
                elif stable_eqs:
                    x_current = stable_eqs[-1][0]  # Saut vers autre branche

            x_forward.append(x_current)

        # Branche retour
        x_backward = []
        x_current = x_forward[-1]
        for b in b_backward:
            eqs = self.find_equilibria(a, b)
            stable_eqs = [e for e in eqs if e[1]]

            valid_eqs = [e for e in stable_eqs if abs(e[0] - x_current) < 2]
            if valid_eqs:
                x_current = min(valid_eqs, key=lambda e: abs(e[0] - x_current))[0]
            elif stable_eqs:
                x_current = stable_eqs[0][0]  # Saut

            x_backward.append(x_current)

        return {
            'b_forward': b_forward,
            'x_forward': x_forward,
            'b_backward': b_backward,
            'x_backward': x_backward
        }
```

## Applications

```
┌─────────────────────────────────────────────────────────────────┐
│                 APPLICATIONS DES BIFURCATIONS                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ÉCOLOGIE:                                                      │
│  • Effondrement de populations (seuil critique de ressources)   │
│  • Eutrophisation des lacs (transition claire → trouble)        │
│  • Points de basculement climatiques                            │
│                                                                  │
│  PHYSIQUE:                                                      │
│  • Transitions de phase (eau → glace)                          │
│  • Flambage d'une poutre (Euler)                               │
│  • Lasers (seuil d'émission stimulée)                          │
│                                                                  │
│  ÉCONOMIE:                                                      │
│  • Crises financières (basculement soudain)                    │
│  • Bulles spéculatives                                         │
│  • Spirales déflationnistes                                    │
│                                                                  │
│  SOCIAL:                                                        │
│  • Polarisation d'opinion                                       │
│  • Révolutions (bifurcation de régime)                         │
│  • Adoption virale de technologies                              │
│                                                                  │
│  BIOLOGIE:                                                      │
│  • Différenciation cellulaire                                   │
│  • Rythmes circadiens                                           │
│  • Épilepsie (bifurcation neuronale)                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Conclusion

```
┌─────────────────────────────────────────────────────────────────┐
│                   ESSENCE DES BIFURCATIONS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  "Les bifurcations sont les moments où le futur devient         │
│   multiple, où le système choisit son destin."                  │
│                                                                  │
│  Points clés:                                                   │
│                                                                  │
│  1. DISCONTINUITÉ QUALITATIVE                                   │
│     Petit changement de paramètre → grand changement            │
│     de comportement                                              │
│                                                                  │
│  2. IRRÉVERSIBILITÉ                                             │
│     Certaines bifurcations sont à sens unique                   │
│     (hystérésis)                                                 │
│                                                                  │
│  3. UNIVERSALITÉ                                                │
│     Mêmes types de bifurcations dans systèmes très différents   │
│     (Feigenbaum, catastrophes)                                  │
│                                                                  │
│  4. SENSIBILITÉ AUX PERTURBATIONS                               │
│     Près d'une bifurcation, le système est fragile              │
│     (ralentissement critique)                                   │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ "Il y a des moments décisifs où tout bascule"            │ │
│  │  - Ilya Prigogine                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*"Order and disorder, stability and change, are two faces of the same coin."*
