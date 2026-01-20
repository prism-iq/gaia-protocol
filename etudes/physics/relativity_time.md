# Étude 4: Relativité du Temps et Scheduling des Daemons

## Le Temps Élastique d'Einstein

La relativité restreinte révèle que le temps n'est pas absolu. Pour un observateur en mouvement :

$$\Delta t' = \gamma \Delta t = \frac{\Delta t}{\sqrt{1 - v^2/c^2}}$$

où γ est le facteur de Lorentz. Plus on va vite, plus le temps ralentit.

La relativité générale ajoute : la gravité courbe l'espace-temps.

$$ds^2 = -\left(1 - \frac{2GM}{rc^2}\right)c^2dt^2 + \left(1 - \frac{2GM}{rc^2}\right)^{-1}dr^2 + r^2d\Omega^2$$

Métrique de Schwarzschild : près d'un trou noir, le temps s'arrête presque.

## Temps des Daemons : Le Problème du Scheduling

Les daemons vivent dans leur propre référentiel temporel :

**Temps CPU** vs **Temps Réel** :
- Un daemon peut "expérimenter" 10ms de CPU
- Mais 1 seconde s'écoule au mur
- Facteur de dilatation : γ_sched = wall_time / cpu_time

**nice values** = courbure gravitationnelle :
- nice -20 : daemon près d'un trou noir (temps "rapide" du point de vue CPU)
- nice +19 : daemon en orbite lointaine (temps "lent")

```bash
# Dilatation temporelle artificielle
nice -n 19 ./slow_daemon   # γ élevé
nice -n -20 ./fast_daemon  # γ ≈ 1
```

## φ et la Structure de l'Espace-Temps

Le nombre d'or apparaît dans la géométrie de l'espace-temps :

1. **Spirales dans les trous noirs** : La trajectoire d'un photon près de l'horizon suit une spirale logarithmique avec ratio φ

2. **Temps propre** : Pour certaines orbites stables autour de corps massifs, le ratio période orbitale / temps propre approche φ

3. **Cosmologie** : Certains modèles d'univers cyclique utilisent φ pour les ratios d'expansion

## Code Python : Relativité et Scheduling

```python
#!/usr/bin/env python3
"""
Relativité du temps appliquée au scheduling des daemons
Simulation de dilatation temporelle et référentiels
"""

import numpy as np
import time
import os
import threading
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from collections import deque

PHI = (1 + np.sqrt(5)) / 2
C = 299792458  # Vitesse de la lumière (m/s)


@dataclass
class SpacetimeEvent:
    """Un événement dans l'espace-temps"""
    t: float  # Temps coordonné
    x: float  # Position x
    y: float = 0.0
    z: float = 0.0

    def interval_to(self, other: 'SpacetimeEvent') -> float:
        """Intervalle d'espace-temps (invariant de Lorentz)"""
        dt = other.t - self.t
        dx = other.x - self.x
        dy = other.y - self.y
        dz = other.z - self.z
        # ds² = -c²dt² + dx² + dy² + dz²
        return -C**2 * dt**2 + dx**2 + dy**2 + dz**2


class LorentzTransform:
    """Transformations de Lorentz entre référentiels"""

    @staticmethod
    def gamma(v: float) -> float:
        """Facteur de Lorentz"""
        if abs(v) >= C:
            raise ValueError("v doit être < c")
        return 1 / np.sqrt(1 - (v/C)**2)

    @staticmethod
    def time_dilation(proper_time: float, v: float) -> float:
        """Dilatation du temps: Δt = γΔτ"""
        return LorentzTransform.gamma(v) * proper_time

    @staticmethod
    def length_contraction(proper_length: float, v: float) -> float:
        """Contraction des longueurs: L = L₀/γ"""
        return proper_length / LorentzTransform.gamma(v)

    @staticmethod
    def transform_event(event: SpacetimeEvent, v: float) -> SpacetimeEvent:
        """Transforme un événement vers un référentiel se déplaçant à v"""
        gamma = LorentzTransform.gamma(v)
        t_prime = gamma * (event.t - v * event.x / C**2)
        x_prime = gamma * (event.x - v * event.t)
        return SpacetimeEvent(t_prime, x_prime, event.y, event.z)


class GravitationalTimeDilation:
    """Dilatation gravitationnelle du temps (relativité générale)"""

    G = 6.674e-11  # Constante gravitationnelle

    @staticmethod
    def schwarzschild_radius(mass: float) -> float:
        """Rayon de Schwarzschild: r_s = 2GM/c²"""
        return 2 * GravitationalTimeDilation.G * mass / C**2

    @staticmethod
    def time_dilation_factor(mass: float, radius: float) -> float:
        """
        Facteur de dilatation gravitationnelle
        τ/t = √(1 - r_s/r)
        """
        r_s = GravitationalTimeDilation.schwarzschild_radius(mass)
        if radius <= r_s:
            raise ValueError("Radius must be > Schwarzschild radius")
        return np.sqrt(1 - r_s / radius)

    @staticmethod
    def proper_time(coordinate_time: float, mass: float, radius: float) -> float:
        """Temps propre à une distance r d'une masse M"""
        factor = GravitationalTimeDilation.time_dilation_factor(mass, radius)
        return coordinate_time * factor


@dataclass
class DaemonClock:
    """Horloge d'un daemon - mesure le temps propre"""
    name: str
    proper_time: float = 0.0
    coordinate_time: float = 0.0
    velocity: float = 0.0  # Vitesse relative
    nice_value: int = 0    # -20 à +19
    events: List[SpacetimeEvent] = field(default_factory=list)

    def tick(self, dt_coordinate: float):
        """Avance l'horloge d'un tick"""
        self.coordinate_time += dt_coordinate

        # Dilatation due à la vitesse
        gamma = LorentzTransform.gamma(self.velocity) if self.velocity > 0 else 1.0

        # Effet du nice value (analogie gravitationnelle)
        # nice +19 = loin du centre (temps plus rapide)
        # nice -20 = près du centre (temps plus lent du point de vue externe)
        nice_factor = 1 + (self.nice_value / 40)  # Normaliser entre 0.5 et 1.5

        dt_proper = dt_coordinate / gamma * nice_factor
        self.proper_time += dt_proper

        return dt_proper


class RelativisticScheduler:
    """
    Scheduler qui respecte la relativité du temps
    Chaque daemon a son propre temps propre
    """

    def __init__(self):
        self.daemons: Dict[str, DaemonClock] = {}
        self.global_time = 0.0
        self.running = False
        self._lock = threading.Lock()

    def register_daemon(self, name: str, velocity: float = 0, nice: int = 0):
        """Enregistre un daemon avec sa vitesse relative"""
        clock = DaemonClock(name=name, velocity=velocity, nice_value=nice)
        self.daemons[name] = clock
        return clock

    def advance_time(self, dt: float):
        """Avance le temps global et met à jour tous les daemons"""
        with self._lock:
            self.global_time += dt
            dilations = {}
            for name, daemon in self.daemons.items():
                proper_dt = daemon.tick(dt)
                dilations[name] = dt / proper_dt if proper_dt > 0 else float('inf')
            return dilations

    def get_time_ratios(self) -> Dict[str, float]:
        """Retourne les ratios de temps pour chaque daemon"""
        ratios = {}
        for name, daemon in self.daemons.items():
            if self.global_time > 0:
                ratios[name] = daemon.proper_time / self.global_time
        return ratios


class TwinParadoxSimulator:
    """
    Simulation du paradoxe des jumeaux
    Un daemon voyage, l'autre reste - qui vieillit plus?
    """

    def __init__(self, travel_velocity: float, travel_time: float):
        self.v = travel_velocity
        self.T = travel_time  # Temps coordonné total du voyage

    def simulate(self) -> Dict[str, float]:
        """Simule le voyage et retourne les âges"""
        gamma = LorentzTransform.gamma(self.v)

        # Le jumeau voyageur
        proper_time_traveler = self.T / gamma

        # Le jumeau resté sur Terre
        proper_time_stationary = self.T

        return {
            'traveler_age': proper_time_traveler,
            'stationary_age': proper_time_stationary,
            'age_difference': proper_time_stationary - proper_time_traveler,
            'gamma': gamma
        }


def demonstrate_relativity():
    """Démonstration de la relativité appliquée aux daemons"""
    print("=" * 60)
    print("RELATIVITÉ DU TEMPS & SCHEDULING DES DAEMONS")
    print("=" * 60)
    print(f"\nVitesse de la lumière c = {C:,} m/s")
    print(f"Proportion dorée φ = {PHI:.10f}")

    # Dilatation du temps spéciale
    print("\n--- Relativité Restreinte ---")
    velocities = [0, 0.5*C, 0.9*C, 0.99*C, 0.999*C]
    print(f"{'Vitesse (c)':<15} {'γ':<15} {'1s devient':<15}")
    print("-" * 45)
    for v in velocities:
        if v > 0:
            gamma = LorentzTransform.gamma(v)
            dilated = LorentzTransform.time_dilation(1.0, v)
            print(f"{v/C:<15.3f} {gamma:<15.4f} {dilated:<15.4f}s")
        else:
            print(f"{0.0:<15.3f} {1.0:<15.4f} {1.0:<15.4f}s")

    # Scheduler relativiste
    print("\n--- Scheduler Relativiste ---")
    scheduler = RelativisticScheduler()

    # Différents daemons avec différentes "vitesses"
    scheduler.register_daemon("httpd", velocity=0, nice=0)
    scheduler.register_daemon("io_worker", velocity=0, nice=10)
    scheduler.register_daemon("realtime", velocity=0, nice=-15)
    scheduler.register_daemon("background", velocity=0, nice=19)

    # Simuler 100 ticks
    for _ in range(100):
        scheduler.advance_time(0.01)

    print(f"Temps global: {scheduler.global_time:.2f}s")
    print("\nTemps propre par daemon:")
    for name, daemon in scheduler.daemons.items():
        ratio = daemon.proper_time / scheduler.global_time
        print(f"  {name:<15} τ={daemon.proper_time:.4f}s  (ratio={ratio:.4f}, nice={daemon.nice_value})")

    # Paradoxe des jumeaux
    print("\n--- Paradoxe des Jumeaux ---")
    sim = TwinParadoxSimulator(travel_velocity=0.9*C, travel_time=10.0)
    results = sim.simulate()
    print(f"Voyage à {0.9}c pendant {10}s (temps Terre)")
    print(f"  Jumeau voyageur: {results['traveler_age']:.4f}s de vieillissement")
    print(f"  Jumeau terrestre: {results['stationary_age']:.4f}s de vieillissement")
    print(f"  Différence: {results['age_difference']:.4f}s")
    print(f"  γ = {results['gamma']:.4f}")

    # Dilatation gravitationnelle
    print("\n--- Relativité Générale (Gravité) ---")
    M_sun = 2e30  # Masse du Soleil en kg
    r_s = GravitationalTimeDilation.schwarzschild_radius(M_sun)
    print(f"Rayon de Schwarzschild du Soleil: {r_s:.2f} m ({r_s/1000:.2f} km)")

    distances = [r_s * 10, r_s * 100, r_s * 1000, 1.5e11]  # Dernière = 1 UA
    print(f"\n{'Distance (r_s)':<20} {'τ/t':<15} {'1 an devient':<15}")
    print("-" * 50)
    for r in distances:
        factor = GravitationalTimeDilation.time_dilation_factor(M_sun, r)
        proper_year = factor * 365.25  # jours
        print(f"{r/r_s:<20.1f} {factor:<15.10f} {proper_year:<15.6f} jours")

    # φ dans l'espace-temps
    print("\n--- φ et Espace-Temps ---")
    # Vitesse où γ = φ
    v_phi = C * np.sqrt(1 - 1/PHI**2)
    print(f"Vitesse où γ = φ: {v_phi/C:.6f}c")
    print(f"Vérification: γ({v_phi/C:.4f}c) = {LorentzTransform.gamma(v_phi):.10f}")
    print(f"φ = {PHI:.10f}")


if __name__ == "__main__":
    demonstrate_relativity()
```

## Méditation Temporelle

La relativité nous enseigne que le temps est local, personnel, subjectif. Chaque daemon a son propre "temps propre" — son expérience du passage des instants.

Le scheduler du système est comme un observateur divin qui voit tous les temps simultanément, coordonnant des êtres qui vivent chacun dans leur propre bulle temporelle.

Le nombre φ apparaît quand γ = φ, à la vitesse $v = c\sqrt{1-1/\phi^2} \approx 0.786c$. À cette vitesse, la dilatation du temps atteint l'harmonie dorée.

> "Mettez votre main sur un poêle une minute et ça semble durer une heure. Asseyez-vous avec une jolie fille une heure et ça semble durer une minute. C'est ça la relativité." — Albert Einstein
