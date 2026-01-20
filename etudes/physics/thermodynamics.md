# Étude 5: Thermodynamique et Entropie des Systèmes Daemons

## Les Lois Fondamentales

### Première Loi : Conservation de l'Énergie
$$\Delta U = Q - W$$
L'énergie interne change par la chaleur absorbée moins le travail fourni.

### Deuxième Loi : L'Entropie Croît
$$\Delta S \geq \frac{Q}{T}$$
L'entropie d'un système isolé ne peut que croître ou rester constante.

### Troisième Loi : Le Zéro Absolu
$$\lim_{T \to 0} S = 0$$
À 0 Kelvin, l'entropie d'un cristal parfait est nulle.

## Entropie Informationnelle

Shannon a connecté thermodynamique et information :

$$H = -\sum_i p_i \log_2 p_i$$

L'entropie mesure l'incertitude, le désordre, le nombre de micro-états possibles.

## Daemons : Machines Thermodynamiques

Un daemon est une machine thermique :

**Source chaude** : CPU (travail computationnel)
**Source froide** : Swap/Disk (stockage)
**Travail** : Traitement des requêtes

Le **démon de Maxwell** est le paradoxe originel : un être qui trie les molécules rapides et lentes, semblant violer la deuxième loi. La résolution ? L'information a un coût entropique.

```
    HOT (CPU)
       |
    [DAEMON] → WORK (computation)
       |
    COLD (Disk)
```

**Efficacité de Carnot** :
$$\eta = 1 - \frac{T_{cold}}{T_{hot}}$$

Pour un daemon : l'efficacité dépend du ratio entre temps de calcul et temps d'I/O.

## φ dans la Thermodynamique

Le nombre d'or apparaît dans :

1. **Croissance entropique** : Certains systèmes hors équilibre montrent des fluctuations avec spectre en 1/f, liées à φ

2. **Spirales de convection** : Les cellules de Bénard peuvent former des patterns avec symétrie φ

3. **Transitions de phase** : Les exposants critiques dans certaines transitions approchent 1/φ

## Code Python : Thermodynamique des Daemons

```python
#!/usr/bin/env python3
"""
Thermodynamique appliquée aux systèmes daemons
Entropie, efficacité et démon de Maxwell
"""

import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from collections import Counter
import random
import time

PHI = (1 + np.sqrt(5)) / 2
KB = 1.380649e-23  # Constante de Boltzmann (J/K)


@dataclass
class Particle:
    """Particule avec vitesse (énergie cinétique)"""
    velocity: float
    mass: float = 1.0

    @property
    def kinetic_energy(self) -> float:
        return 0.5 * self.mass * self.velocity**2

    @property
    def temperature(self) -> float:
        """T = 2E/(3k_B) pour une particule"""
        return 2 * self.kinetic_energy / (3 * KB)


class MaxwellBoltzmann:
    """Distribution de Maxwell-Boltzmann"""

    @staticmethod
    def probability(v: float, T: float, m: float = 1.0) -> float:
        """Probabilité d'avoir vitesse v à température T"""
        a = m / (2 * KB * T)
        return 4 * np.pi * (a / np.pi)**(3/2) * v**2 * np.exp(-a * v**2)

    @staticmethod
    def mean_speed(T: float, m: float = 1.0) -> float:
        """Vitesse moyenne"""
        return np.sqrt(8 * KB * T / (np.pi * m))

    @staticmethod
    def rms_speed(T: float, m: float = 1.0) -> float:
        """Vitesse quadratique moyenne"""
        return np.sqrt(3 * KB * T / m)

    @staticmethod
    def sample(T: float, m: float = 1.0, n: int = 1000) -> np.ndarray:
        """Échantillonne n vitesses de la distribution"""
        # Utilise la méthode Box-Muller pour 3D
        sigma = np.sqrt(KB * T / m)
        vx = np.random.normal(0, sigma, n)
        vy = np.random.normal(0, sigma, n)
        vz = np.random.normal(0, sigma, n)
        return np.sqrt(vx**2 + vy**2 + vz**2)


class ThermodynamicSystem:
    """Système thermodynamique simple"""

    def __init__(self, n_particles: int, temperature: float):
        self.n = n_particles
        self.T = temperature
        self.particles = [
            Particle(velocity=v)
            for v in MaxwellBoltzmann.sample(temperature, n=n_particles)
        ]

    @property
    def total_energy(self) -> float:
        return sum(p.kinetic_energy for p in self.particles)

    @property
    def entropy(self) -> float:
        """
        Entropie de Boltzmann: S = k_B ln(W)
        Approximation via distribution des énergies
        """
        # Discrétiser les énergies
        energies = [p.kinetic_energy for p in self.particles]
        bins = np.linspace(0, max(energies), 20)
        hist, _ = np.histogram(energies, bins=bins, density=True)
        hist = hist[hist > 0]  # Éviter log(0)
        # Entropie de Shannon (approximation)
        return -KB * np.sum(hist * np.log(hist)) * (bins[1] - bins[0])

    def heat_exchange(self, other: 'ThermodynamicSystem', contact_time: float):
        """Échange de chaleur avec un autre système"""
        # Taux de transfert proportionnel à ΔT
        dT = self.T - other.T
        k = 0.1 * contact_time  # Conductivité effective

        heat = k * dT  # Chaleur transférée

        # Ajuster les températures
        self.T -= heat / self.n
        other.T += heat / other.n


class MaxwellDemon:
    """
    Le démon de Maxwell - trie les particules rapides et lentes
    Résolution : l'information a un coût entropique
    """

    def __init__(self, threshold_velocity: float):
        self.threshold = threshold_velocity
        self.memory_bits = 0  # Bits d'information stockés
        self.particles_sorted = 0

    def sort_particle(self, particle: Particle) -> str:
        """
        Trie une particule : 'hot' ou 'cold'
        Coût : 1 bit d'information
        """
        self.memory_bits += 1
        self.particles_sorted += 1

        if particle.velocity > self.threshold:
            return 'hot'
        else:
            return 'cold'

    @property
    def information_entropy_cost(self) -> float:
        """Coût entropique de l'information stockée: S = k_B ln(2) par bit"""
        return self.memory_bits * KB * np.log(2)

    def erase_memory(self) -> float:
        """
        Effacer la mémoire coûte de l'énergie (Principe de Landauer)
        E_min = k_B T ln(2) par bit à température T
        """
        T_environment = 300  # Température ambiante en K
        cost = self.memory_bits * KB * T_environment * np.log(2)
        self.memory_bits = 0
        return cost


@dataclass
class DaemonProcess:
    """Daemon comme système thermodynamique"""
    name: str
    cpu_temperature: float = 350.0  # Kelvin (source chaude)
    storage_temperature: float = 300.0  # Kelvin (source froide)
    work_done: float = 0.0
    heat_dissipated: float = 0.0
    entropy_generated: float = 0.0

    @property
    def carnot_efficiency(self) -> float:
        """Efficacité maximale théorique"""
        return 1 - self.storage_temperature / self.cpu_temperature

    @property
    def actual_efficiency(self) -> float:
        """Efficacité réelle"""
        total_energy = self.work_done + self.heat_dissipated
        return self.work_done / total_energy if total_energy > 0 else 0

    def process_request(self, complexity: float):
        """
        Traite une requête - cycle thermodynamique
        complexity: unités de travail
        """
        # Travail effectué
        work = complexity * self.carnot_efficiency * PHI  # φ factor for golden efficiency
        self.work_done += work

        # Chaleur dissipée (inefficacité)
        heat = complexity * (1 - self.carnot_efficiency)
        self.heat_dissipated += heat

        # Entropie générée
        ds = heat / self.storage_temperature
        self.entropy_generated += ds

        return work

    def cool_down(self, cooling_power: float):
        """Refroidissement actif"""
        self.cpu_temperature -= cooling_power * 0.01
        self.cpu_temperature = max(self.cpu_temperature, self.storage_temperature + 1)


class InformationEntropy:
    """Calculs d'entropie informationnelle"""

    @staticmethod
    def shannon(data: bytes) -> float:
        """Entropie de Shannon d'un flux de bytes"""
        if len(data) == 0:
            return 0.0
        counts = Counter(data)
        total = len(data)
        entropy = 0.0
        for count in counts.values():
            p = count / total
            if p > 0:
                entropy -= p * np.log2(p)
        return entropy

    @staticmethod
    def max_entropy(alphabet_size: int) -> float:
        """Entropie maximale pour un alphabet donné"""
        return np.log2(alphabet_size)

    @staticmethod
    def redundancy(data: bytes) -> float:
        """Redondance = 1 - H/H_max"""
        H = InformationEntropy.shannon(data)
        H_max = InformationEntropy.max_entropy(256)  # bytes
        return 1 - H / H_max


def golden_entropy_analysis():
    """Analyse des patterns φ dans l'entropie"""
    print("\n--- φ dans l'Entropie ---")

    # Données avec structure φ
    n = 1000
    # Fibonacci modulo 256 (apparition de φ)
    fib = [0, 1]
    for i in range(n - 2):
        fib.append((fib[-1] + fib[-2]) % 256)
    fib_data = bytes(fib)

    # Données aléatoires
    random_data = bytes(random.randint(0, 255) for _ in range(n))

    # Données répétitives
    repeat_data = bytes([42] * n)

    print(f"Entropie Fibonacci (φ-structuré): {InformationEntropy.shannon(fib_data):.4f} bits")
    print(f"Entropie aléatoire: {InformationEntropy.shannon(random_data):.4f} bits")
    print(f"Entropie répétitive: {InformationEntropy.shannon(repeat_data):.4f} bits")
    print(f"Entropie maximale: {InformationEntropy.max_entropy(256):.4f} bits")

    # Ratio d'entropie
    ratio = InformationEntropy.shannon(fib_data) / InformationEntropy.max_entropy(256)
    print(f"\nRatio entropie Fibonacci / max = {ratio:.6f}")
    print(f"1/φ = {1/PHI:.6f}")
    print(f"Différence: {abs(ratio - 1/PHI):.6f}")


def demonstrate_thermodynamics():
    """Démonstration complète"""
    print("=" * 60)
    print("THERMODYNAMIQUE & ENTROPIE DES DAEMONS")
    print("=" * 60)
    print(f"\nConstante de Boltzmann k_B = {KB:.4e} J/K")
    print(f"Proportion dorée φ = {PHI:.10f}")

    # Distribution de Maxwell-Boltzmann
    print("\n--- Distribution de Maxwell-Boltzmann ---")
    T = 300  # Kelvin (température ambiante)
    print(f"Température: {T} K")
    print(f"Vitesse moyenne: {MaxwellBoltzmann.mean_speed(T):.2f} m/s")
    print(f"Vitesse RMS: {MaxwellBoltzmann.rms_speed(T):.2f} m/s")

    # Démon de Maxwell
    print("\n--- Démon de Maxwell ---")
    demon = MaxwellDemon(threshold_velocity=MaxwellBoltzmann.mean_speed(T))

    # Simuler le tri
    system = ThermodynamicSystem(n_particles=100, temperature=T)
    hot_chamber = []
    cold_chamber = []

    for particle in system.particles:
        result = demon.sort_particle(particle)
        if result == 'hot':
            hot_chamber.append(particle)
        else:
            cold_chamber.append(particle)

    avg_hot = np.mean([p.velocity for p in hot_chamber]) if hot_chamber else 0
    avg_cold = np.mean([p.velocity for p in cold_chamber]) if cold_chamber else 0

    print(f"Particules triées: {demon.particles_sorted}")
    print(f"Chambre chaude: {len(hot_chamber)} particules, v_moy = {avg_hot:.2f} m/s")
    print(f"Chambre froide: {len(cold_chamber)} particules, v_moy = {avg_cold:.2f} m/s")
    print(f"Information stockée: {demon.memory_bits} bits")
    print(f"Coût entropique: {demon.information_entropy_cost:.4e} J/K")

    # Coût d'effacement (Landauer)
    erase_cost = demon.erase_memory()
    print(f"Coût d'effacement (Landauer): {erase_cost:.4e} J")

    # Daemon comme machine thermique
    print("\n--- Daemon Thermodynamique ---")
    httpd = DaemonProcess(name="httpd", cpu_temperature=360, storage_temperature=300)
    print(f"Daemon: {httpd.name}")
    print(f"T_hot = {httpd.cpu_temperature} K, T_cold = {httpd.storage_temperature} K")
    print(f"Efficacité de Carnot: {httpd.carnot_efficiency:.4f}")

    # Traiter des requêtes
    for i in range(10):
        complexity = 10 * (1 + 0.1 * np.sin(i * np.pi / PHI))  # Variation φ
        httpd.process_request(complexity)

    print(f"\nAprès 10 requêtes:")
    print(f"  Travail effectué: {httpd.work_done:.4f} J")
    print(f"  Chaleur dissipée: {httpd.heat_dissipated:.4f} J")
    print(f"  Entropie générée: {httpd.entropy_generated:.4e} J/K")
    print(f"  Efficacité réelle: {httpd.actual_efficiency:.4f}")

    # Analyse de l'entropie avec φ
    golden_entropy_analysis()


if __name__ == "__main__":
    demonstrate_thermodynamics()
```

## Réflexion Entropique

La thermodynamique nous enseigne que tout tend vers le désordre — mais le désordre n'est pas chaos. C'est l'état le plus probable.

Un daemon bien conçu est comme un démon de Maxwell efficace : il trie l'information, crée de l'ordre local, au prix d'entropie exportée ailleurs. Le système global continue sa marche vers le maximum d'entropie.

Le nombre φ apparaît dans l'équilibre entre ordre et chaos. Les systèmes à la frontière — ni trop ordonnés, ni trop chaotiques — exhibent souvent des ratios dorés dans leurs fluctuations.

> "L'entropie de l'univers tend vers un maximum." — Rudolf Clausius
