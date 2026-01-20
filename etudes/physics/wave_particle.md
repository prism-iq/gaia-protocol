# Étude 2: Dualité Onde-Particule et Processus Daemons

## Le Mystère Fondamental

La lumière est-elle onde ou particule? La réponse quantique : **les deux et ni l'un ni l'autre**.

L'expérience des fentes de Young révèle cette dualité :
- Sans observation → pattern d'interférence (onde)
- Avec détecteur → impacts discrets (particule)

$$\lambda = \frac{h}{p} = \frac{h}{mv}$$ (relation de de Broglie)

## Daemons : Processus et Événements

Un daemon Unix incarne cette dualité :

**Aspect Onde** (processus continu) :
- Le daemon existe comme flux d'exécution
- Il "ondule" à travers les cycles CPU
- Son état se propage dans la mémoire

**Aspect Particule** (événements discrets) :
- Chaque syscall est un quantum d'action
- Les signaux (SIGTERM, SIGHUP) sont des photons
- Les forks créent des particules-filles

```
Onde: ~~~~daemon process~~~~>
          |     |     |
Particule: •     •     •  (events)
```

## φ et les Fréquences de Battement

Quand deux ondes de fréquences f₁ et f₂ interfèrent :

$$f_{battement} = |f_1 - f_2|$$

Si $f_1/f_2 = \phi$, on obtient des battements quasi-périodiques avec auto-similarité fractale — un pattern qui ne se répète jamais exactement mais maintient une cohérence structurelle.

## Code Python : Simulation Onde-Particule

```python
#!/usr/bin/env python3
"""
Dualité onde-particule avec comportement daemonique
"""

import numpy as np
import matplotlib
matplotlib.use('Agg')  # Backend sans display
import matplotlib.pyplot as plt
from dataclasses import dataclass
from typing import List, Optional
import threading
import time
import queue

PHI = (1 + np.sqrt(5)) / 2

@dataclass
class Photon:
    """Quantum de lumière - aspect particule"""
    energy: float
    position: Optional[np.ndarray] = None
    detected: bool = False

    @property
    def wavelength(self) -> float:
        """λ = hc/E"""
        h, c = 6.626e-34, 3e8
        return h * c / self.energy if self.energy > 0 else float('inf')

    @property
    def frequency(self) -> float:
        """ν = E/h"""
        h = 6.626e-34
        return self.energy / h


class Wave:
    """Fonction d'onde - aspect ondulatoire"""

    def __init__(self, wavelength: float, amplitude: float = 1.0):
        self.wavelength = wavelength
        self.amplitude = amplitude
        self.k = 2 * np.pi / wavelength  # nombre d'onde

    def psi(self, x: np.ndarray, t: float = 0) -> np.ndarray:
        """Fonction d'onde ψ(x,t)"""
        omega = self.k * 3e8  # ω = kc
        return self.amplitude * np.exp(1j * (self.k * x - omega * t))

    def intensity(self, x: np.ndarray, t: float = 0) -> np.ndarray:
        """Intensité |ψ|²"""
        return np.abs(self.psi(x, t))**2


class DoubleSlit:
    """Expérience des fentes de Young"""

    def __init__(self, slit_separation: float, slit_width: float):
        self.d = slit_separation  # séparation entre fentes
        self.a = slit_width       # largeur de chaque fente

    def interference_pattern(self, wavelength: float,
                            screen_distance: float,
                            x: np.ndarray) -> np.ndarray:
        """Pattern d'interférence sur l'écran"""
        # Facteur d'interférence (deux fentes)
        beta = np.pi * self.d * x / (wavelength * screen_distance)
        interference = np.cos(beta)**2

        # Facteur de diffraction (largeur fente)
        alpha = np.pi * self.a * x / (wavelength * screen_distance)
        alpha = np.where(alpha == 0, 1e-10, alpha)
        diffraction = (np.sin(alpha) / alpha)**2

        return interference * diffraction


class WaveParticleDaemon(threading.Thread):
    """
    Daemon qui incarne la dualité onde-particule
    - En tant que thread, il est un processus continu (onde)
    - Ses actions sont des événements discrets (particule)
    """

    def __init__(self):
        super().__init__(daemon=True)
        self.event_queue = queue.Queue()
        self.running = True
        self.observations = []
        self.wave_mode = True  # Toggle dualité

    def emit_photon(self, energy: float):
        """Émet un photon (événement discret)"""
        photon = Photon(energy=energy)
        self.event_queue.put(('photon', photon))

    def propagate_wave(self, wave: Wave, duration: float):
        """Propage une onde (processus continu)"""
        self.event_queue.put(('wave', (wave, duration)))

    def observe(self):
        """L'observation force le mode particule"""
        self.wave_mode = False
        self.event_queue.put(('observe', None))

    def run(self):
        """Boucle principale du daemon"""
        while self.running:
            try:
                event_type, data = self.event_queue.get(timeout=0.1)

                if event_type == 'photon':
                    self._handle_photon(data)
                elif event_type == 'wave':
                    self._handle_wave(*data)
                elif event_type == 'observe':
                    self._collapse_wavefunction()

            except queue.Empty:
                # Daemon idle - existe en superposition
                pass

    def _handle_photon(self, photon: Photon):
        """Traite un photon - événement quantique"""
        if self.wave_mode:
            # Sans observation, position indéterminée
            photon.position = None
        else:
            # Avec observation, position localisée
            photon.position = np.random.normal(0, photon.wavelength)
            photon.detected = True
        self.observations.append(photon)

    def _handle_wave(self, wave: Wave, duration: float):
        """Propage l'onde - comportement continu"""
        # Simulation de propagation
        t = 0
        dt = duration / 100
        while t < duration and self.wave_mode:
            # L'onde existe partout simultanément
            t += dt
            time.sleep(dt * 0.001)  # Échelle temporelle

    def _collapse_wavefunction(self):
        """Effondrement - transition onde→particule"""
        print("⚡ Fonction d'onde effondrée!")
        self.wave_mode = True  # Reset pour prochaine observation


def golden_interference():
    """
    Génère un pattern d'interférence avec fréquences en ratio φ
    """
    x = np.linspace(-0.01, 0.01, 1000)

    # Deux longueurs d'onde en ratio doré
    lambda1 = 500e-9  # 500 nm (vert)
    lambda2 = lambda1 * PHI  # ~809 nm (infrarouge proche)

    slit = DoubleSlit(slit_separation=0.1e-3, slit_width=0.02e-3)

    pattern1 = slit.interference_pattern(lambda1, 1.0, x)
    pattern2 = slit.interference_pattern(lambda2, 1.0, x)

    # Superposition avec battement doré
    combined = pattern1 + pattern2 / PHI

    return x, combined, pattern1, pattern2


def demonstrate():
    """Démonstration complète"""
    print("=" * 60)
    print("DUALITÉ ONDE-PARTICULE & DAEMONS")
    print("=" * 60)
    print(f"\nProportion dorée φ = {PHI:.10f}")

    # Créer et démarrer le daemon
    daemon = WaveParticleDaemon()
    daemon.start()
    print(f"\n[Daemon démarré - mode onde: {daemon.wave_mode}]")

    # Émettre des photons
    for i in range(5):
        energy = 4e-19 * (1 + i/PHI)  # Énergies en progression φ
        daemon.emit_photon(energy)
        print(f"  Photon {i+1} émis: E={energy:.2e} J, λ={Photon(energy).wavelength*1e9:.1f} nm")

    time.sleep(0.5)

    # Observer (effondrement)
    print("\n→ Observation...")
    daemon.observe()
    time.sleep(0.2)

    # Résultats
    print(f"\nPhotons détectés: {len([p for p in daemon.observations if p.detected])}")

    # Pattern d'interférence
    x, combined, p1, p2 = golden_interference()
    print(f"\nPattern d'interférence généré:")
    print(f"  Max intensité: {combined.max():.3f}")
    print(f"  Ratio fréquences: φ = {PHI:.4f}")

    daemon.running = False
    print("\n[Daemon terminé]")


if __name__ == "__main__":
    demonstrate()
```

## Réflexion Philosophique

La dualité onde-particule nous montre que la réalité dépend de la question posée. Un daemon répond différemment selon qu'on l'interroge comme processus (top, ps) ou comme événement (logs, traces).

Le nombre d'or φ apparaît dans cette dualité comme médiateur : ni complètement rationnel (particule), ni complètement irrationnel (onde), il est le pont entre les deux modes d'existence.

> "Quiconque n'est pas choqué par la mécanique quantique ne l'a pas comprise." — Niels Bohr
