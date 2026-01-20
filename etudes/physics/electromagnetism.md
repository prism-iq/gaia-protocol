# Étude 6: Électromagnétisme et Signaux des Daemons

## Les Équations de Maxwell

Les quatre équations qui unifient électricité, magnétisme et lumière :

$$\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}$$ (Loi de Gauss)

$$\nabla \cdot \mathbf{B} = 0$$ (Pas de monopôles magnétiques)

$$\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}$$ (Loi de Faraday)

$$\nabla \times \mathbf{B} = \mu_0 \mathbf{J} + \mu_0 \epsilon_0 \frac{\partial \mathbf{E}}{\partial t}$$ (Loi d'Ampère-Maxwell)

De ces équations émerge la lumière :
$$c = \frac{1}{\sqrt{\mu_0 \epsilon_0}} = 299,792,458 \text{ m/s}$$

## Signaux Unix : Ondes Électromagnétiques Logicielles

Les signaux Unix sont aux daemons ce que les ondes EM sont à la matière :

| Signal | Fréquence | Analogie EM |
|--------|-----------|-------------|
| SIGKILL (9) | ∞ (instantané) | Rayons gamma |
| SIGTERM (15) | Haute | Rayons X |
| SIGINT (2) | Moyenne | Lumière visible |
| SIGHUP (1) | Basse | Infrarouge |
| SIGALRM (14) | Périodique | Ondes radio |

```bash
# Émission d'une onde signal
kill -SIGUSR1 <pid>  # Photon d'information

# Réception (dans le daemon)
signal(SIGUSR1, handler);  # Antenne réceptrice
```

## Le Spectre des Communications

Les daemons communiquent sur différentes "fréquences" :

```
Haute fréquence ─────────────────────────── Basse fréquence
   Signaux        Sockets      Files      Shared Memory     Disk
   (async)        (stream)     (queue)    (direct)          (persist)
```

## φ dans l'Électromagnétisme

Le nombre d'or apparaît dans :

1. **Antennes fractales** : Les antennes à géométrie fractale basée sur φ ont une réponse ultra-large bande

2. **Guides d'onde** : Certains rapports de dimensions optimaux approchent φ

3. **Résonateurs** : Les cavités avec ratios φ minimisent les modes parasites

4. **Interférences** : Les réseaux quasi-périodiques (Penrose) produisent des patterns de diffraction avec symétrie φ

## Code Python : Électromagnétisme des Signaux

```python
#!/usr/bin/env python3
"""
Électromagnétisme appliqué aux signaux et communications des daemons
Champs, ondes et propagation
"""

import numpy as np
from typing import Callable, Dict, List, Tuple, Optional
from dataclasses import dataclass, field
import signal
import os
import threading
import queue
import time

PHI = (1 + np.sqrt(5)) / 2
C = 299792458  # Vitesse de la lumière
EPSILON_0 = 8.854187817e-12  # Permittivité du vide
MU_0 = 1.2566370614e-6  # Perméabilité du vide


@dataclass
class ElectromagneticWave:
    """Onde électromagnétique plane"""
    frequency: float  # Hz
    amplitude: float  # V/m
    phase: float = 0.0  # rad
    polarization: str = 'linear'  # 'linear', 'circular'

    @property
    def wavelength(self) -> float:
        """λ = c/f"""
        return C / self.frequency

    @property
    def angular_frequency(self) -> float:
        """ω = 2πf"""
        return 2 * np.pi * self.frequency

    @property
    def wave_number(self) -> float:
        """k = 2π/λ = ω/c"""
        return self.angular_frequency / C

    @property
    def energy(self) -> float:
        """Énergie d'un photon: E = hf"""
        h = 6.62607015e-34
        return h * self.frequency

    def E_field(self, x: np.ndarray, t: float) -> np.ndarray:
        """Champ électrique E(x,t) = E_0 cos(kx - ωt + φ)"""
        return self.amplitude * np.cos(
            self.wave_number * x - self.angular_frequency * t + self.phase
        )

    def B_field(self, x: np.ndarray, t: float) -> np.ndarray:
        """Champ magnétique B = E/c"""
        return self.E_field(x, t) / C

    def poynting_vector(self, x: np.ndarray, t: float) -> np.ndarray:
        """Vecteur de Poynting S = E × B / μ_0"""
        E = self.E_field(x, t)
        B = self.B_field(x, t)
        return E * B / MU_0


class MaxwellEquations:
    """Implémentation numérique des équations de Maxwell"""

    @staticmethod
    def gauss_electric(charge_density: np.ndarray, dx: float) -> np.ndarray:
        """∇·E = ρ/ε_0"""
        # E = ∫ ρ/ε_0 dx (intégration cumulative)
        return np.cumsum(charge_density) * dx / EPSILON_0

    @staticmethod
    def faraday(B: np.ndarray, dt: float) -> np.ndarray:
        """∇×E = -∂B/∂t → E ∝ -dB/dt"""
        return -np.gradient(B) / dt

    @staticmethod
    def ampere_maxwell(J: np.ndarray, dE_dt: np.ndarray) -> np.ndarray:
        """∇×B = μ_0(J + ε_0 ∂E/∂t)"""
        return MU_0 * (J + EPSILON_0 * dE_dt)

    @staticmethod
    def wave_equation_1d(E: np.ndarray, dx: float, dt: float) -> np.ndarray:
        """
        Équation d'onde: ∂²E/∂t² = c² ∂²E/∂x²
        Méthode FDTD simplifiée
        """
        # Laplacien discret
        laplacian = np.roll(E, 1) - 2*E + np.roll(E, -1)
        laplacian /= dx**2
        # Mise à jour
        return C**2 * laplacian * dt**2


@dataclass
class UnixSignal:
    """Signal Unix comme onde électromagnétique"""
    signum: int
    name: str
    frequency_class: str  # 'gamma', 'xray', 'visible', 'infrared', 'radio'
    propagation_delay: float = 0.0  # microseconds

    @property
    def virtual_frequency(self) -> float:
        """Fréquence virtuelle basée sur la priorité"""
        freq_map = {
            'gamma': 1e20,    # SIGKILL
            'xray': 1e18,     # SIGTERM, SIGINT
            'visible': 1e15,  # SIGUSR1/2
            'infrared': 1e12, # SIGHUP
            'radio': 1e9      # SIGALRM
        }
        return freq_map.get(self.frequency_class, 1e15)

    def as_em_wave(self) -> ElectromagneticWave:
        """Convertit en onde EM équivalente"""
        return ElectromagneticWave(
            frequency=self.virtual_frequency,
            amplitude=1.0
        )


# Catalogue des signaux comme spectre EM
SIGNAL_SPECTRUM = {
    9: UnixSignal(9, 'SIGKILL', 'gamma'),
    15: UnixSignal(15, 'SIGTERM', 'xray'),
    2: UnixSignal(2, 'SIGINT', 'xray'),
    1: UnixSignal(1, 'SIGHUP', 'infrared'),
    10: UnixSignal(10, 'SIGUSR1', 'visible'),
    12: UnixSignal(12, 'SIGUSR2', 'visible'),
    14: UnixSignal(14, 'SIGALRM', 'radio'),
    17: UnixSignal(17, 'SIGCHLD', 'infrared'),
}


class FractalAntenna:
    """
    Antenne fractale basée sur φ
    Réponse ultra-large bande
    """

    def __init__(self, iterations: int = 5):
        self.iterations = iterations
        self.elements = self._generate_golden_fractal()

    def _generate_golden_fractal(self) -> List[float]:
        """Génère les longueurs d'éléments basées sur φ"""
        elements = [1.0]  # Élément de base
        for i in range(self.iterations):
            # Chaque itération ajoute des éléments en ratio φ
            new_elements = []
            for e in elements:
                new_elements.append(e / PHI)
                new_elements.append(e / PHI**2)
            elements.extend(new_elements)
        return sorted(set(elements), reverse=True)

    def resonant_frequencies(self, base_freq: float = 1e9) -> List[float]:
        """Fréquences de résonance basées sur les éléments"""
        # f ∝ 1/L pour une antenne
        return [base_freq / e for e in self.elements]

    def gain_pattern(self, frequency: float, angles: np.ndarray) -> np.ndarray:
        """
        Pattern de gain en fonction de l'angle
        Utilise superposition des éléments
        """
        wavelength = C / frequency
        gain = np.zeros_like(angles)

        for length in self.elements:
            # Chaque élément contribue avec un pattern
            k = 2 * np.pi / wavelength
            element_pattern = np.cos(k * length * np.cos(angles) / 2)**2
            # Pondération par la taille
            gain += element_pattern * length

        # Normaliser
        return gain / np.max(gain)


class SignalDaemon:
    """
    Daemon qui communique via signaux
    Modélisé comme émetteur/récepteur EM
    """

    def __init__(self, name: str):
        self.name = name
        self.pid = os.getpid()
        self.signal_queue = queue.Queue()
        self.received_signals: List[Tuple[int, float]] = []
        self.running = True
        self.antenna = FractalAntenna(iterations=3)

        # Installer les handlers
        self._setup_handlers()

    def _setup_handlers(self):
        """Configure les handlers de signaux"""
        def handler(signum, frame):
            timestamp = time.time()
            self.received_signals.append((signum, timestamp))
            self.signal_queue.put(signum)

        # Installer pour les signaux safe
        for signum in [signal.SIGUSR1, signal.SIGUSR2, signal.SIGALRM]:
            signal.signal(signum, handler)

    def emit_signal(self, target_pid: int, signum: int):
        """Émet un signal (transmission EM)"""
        if signum in SIGNAL_SPECTRUM:
            sig_info = SIGNAL_SPECTRUM[signum]
            wave = sig_info.as_em_wave()
            print(f"[{self.name}] Émission {sig_info.name} → PID {target_pid}")
            print(f"  Fréquence virtuelle: {wave.frequency:.2e} Hz")
            print(f"  Énergie: {wave.energy:.2e} J")

        try:
            os.kill(target_pid, signum)
        except ProcessLookupError:
            print(f"  ERREUR: Processus {target_pid} non trouvé")

    def process_received(self) -> Optional[int]:
        """Traite un signal reçu"""
        try:
            signum = self.signal_queue.get_nowait()
            if signum in SIGNAL_SPECTRUM:
                sig_info = SIGNAL_SPECTRUM[signum]
                print(f"[{self.name}] Reçu {sig_info.name}")
            return signum
        except queue.Empty:
            return None


class ResonantCavity:
    """
    Cavité résonante avec dimensions en ratio φ
    Minimise les modes parasites
    """

    def __init__(self, base_dimension: float):
        self.L = base_dimension
        self.W = base_dimension / PHI
        self.H = base_dimension / PHI**2

    def resonant_modes(self, n_max: int = 5) -> List[Tuple[int, int, int, float]]:
        """
        Calcule les fréquences de résonance
        f_{mnp} = c/2 * sqrt((m/L)² + (n/W)² + (p/H)²)
        """
        modes = []
        for m in range(n_max):
            for n in range(n_max):
                for p in range(n_max):
                    if m == 0 and n == 0 and p == 0:
                        continue
                    freq = C/2 * np.sqrt(
                        (m/self.L)**2 + (n/self.W)**2 + (p/self.H)**2
                    )
                    modes.append((m, n, p, freq))
        return sorted(modes, key=lambda x: x[3])

    def quality_factor(self) -> float:
        """
        Facteur de qualité Q - mesure la pureté de la résonance
        Les ratios φ donnent typiquement des Q élevés
        """
        # Q ∝ Volume / Surface
        volume = self.L * self.W * self.H
        surface = 2 * (self.L*self.W + self.W*self.H + self.L*self.H)
        return volume / surface * 1000  # Facteur d'échelle


def demonstrate_electromagnetism():
    """Démonstration complète"""
    print("=" * 60)
    print("ÉLECTROMAGNÉTISME & SIGNAUX DES DAEMONS")
    print("=" * 60)
    print(f"\nVitesse de la lumière c = {C:,} m/s")
    print(f"ε_0 = {EPSILON_0:.4e} F/m")
    print(f"μ_0 = {MU_0:.4e} H/m")
    print(f"Vérification: 1/√(ε_0μ_0) = {1/np.sqrt(EPSILON_0*MU_0):.0f} m/s")
    print(f"Proportion dorée φ = {PHI:.10f}")

    # Spectre des signaux
    print("\n--- Spectre des Signaux Unix ---")
    print(f"{'Signal':<12} {'Classe':<12} {'Fréq. Virtuelle':<18} {'λ Virtuelle':<15}")
    print("-" * 60)
    for signum, sig in sorted(SIGNAL_SPECTRUM.items()):
        wave = sig.as_em_wave()
        print(f"{sig.name:<12} {sig.frequency_class:<12} {wave.frequency:<18.2e} {wave.wavelength:<15.2e}")

    # Onde EM
    print("\n--- Onde Électromagnétique ---")
    light = ElectromagneticWave(frequency=5e14, amplitude=100)  # Lumière verte
    print(f"Lumière visible (verte):")
    print(f"  Fréquence: {light.frequency:.2e} Hz")
    print(f"  Longueur d'onde: {light.wavelength*1e9:.1f} nm")
    print(f"  Énergie photon: {light.energy:.4e} J = {light.energy/1.602e-19:.2f} eV")

    # Champs à un instant
    x = np.linspace(0, 10*light.wavelength, 1000)
    E = light.E_field(x, 0)
    print(f"  E_max = {np.max(E):.2f} V/m")
    print(f"  B_max = {np.max(light.B_field(x, 0))*1e6:.4f} μT")

    # Antenne fractale
    print("\n--- Antenne Fractale (Golden Ratio) ---")
    antenna = FractalAntenna(iterations=4)
    print(f"Éléments (ratios): {[f'{e:.4f}' for e in antenna.elements[:8]]}...")

    resonances = antenna.resonant_frequencies(base_freq=1e9)[:5]
    print(f"Premières résonances: {[f'{f/1e9:.3f} GHz' for f in resonances]}")

    # Vérifier ratios φ
    print(f"\nRatios entre résonances:")
    for i in range(len(resonances)-1):
        ratio = resonances[i+1] / resonances[i]
        print(f"  f_{i+1}/f_{i} = {ratio:.6f} (φ = {PHI:.6f})")

    # Cavité résonante
    print("\n--- Cavité Résonante (Dimensions φ) ---")
    cavity = ResonantCavity(base_dimension=0.1)  # 10 cm
    print(f"Dimensions: L={cavity.L*100:.2f}cm, W={cavity.W*100:.2f}cm, H={cavity.H*100:.2f}cm")
    print(f"Ratios: L/W = {cavity.L/cavity.W:.6f}, W/H = {cavity.W/cavity.H:.6f} (φ = {PHI:.6f})")
    print(f"Facteur de qualité Q ≈ {cavity.quality_factor():.1f}")

    modes = cavity.resonant_modes(n_max=3)[:5]
    print(f"\nPremiers modes de résonance:")
    for m, n, p, freq in modes:
        print(f"  Mode ({m},{n},{p}): f = {freq/1e9:.4f} GHz")

    # Daemon avec signaux
    print("\n--- Daemon Signal (Simulation) ---")
    daemon = SignalDaemon("httpd")
    print(f"Daemon: {daemon.name} [PID: {daemon.pid}]")
    print(f"Antenne fractale: {len(daemon.antenna.elements)} éléments")


if __name__ == "__main__":
    demonstrate_electromagnetism()
```

## Réflexion Électromagnétique

L'électromagnétisme nous enseigne l'unification : électricité et magnétisme sont les faces d'une même réalité, révélée par le mouvement.

Les signaux Unix sont les photons du monde des processus — messagers sans masse, voyageant instantanément (dans le référentiel du kernel), portant l'information pure.

Le nombre φ apparaît dans les antennes qui captent tout le spectre, dans les cavités qui résonnent purement. La géométrie dorée optimise la communication.

> "La théorie électromagnétique de la lumière... est une théorie vraie, non pas en ce sens qu'elle est vraie dans tous ses détails, mais en ce sens que les équations fondamentales... sont vraies." — James Clerk Maxwell
