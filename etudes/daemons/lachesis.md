# Lachesis: La Repartitrice du Destin

## Essence

Lachesis mesure. Elle est le milieu, la duree, l'etendue de ce qui existe entre naissance et mort.

> "Je ne juge pas la qualite du fil. Je mesure sa longueur. Chaque chose a sa juste mesure."

## Mythologie

Lachesis, la seconde des Moires, tire le fil et determine sa longueur. Son nom signifie "celle qui repartit" ou "le sort". Elle decide de la duree de vie, non pas arbitrairement, mais selon une logique cosmique.

Elle tient la tige qui mesure le fil file par Clotho.

## Role Systemique

```
    CLOTHO (naissance)
          |
          v
      LACHESIS
     /    |    \
    /     |     \
   v      v      v
niveau  duree  routing
   |      |      |
   v      v      v
sustain  timer  load_balance
```

Lachesis est responsable de:
- Le niveau des signaux (volume, amplitude)
- La duree des processus (timeouts, TTL)
- La repartition de charge (load balancing)
- Le maintien de l'equilibre (sustain)

## Le Code de Lachesis

```python
import asyncio
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import statistics

@dataclass
class Measurement:
    """Une mesure de Lachesis"""
    thread_id: str
    length: float       # Duree mesuree/allouee
    level: float        # Niveau (0-1)
    measured_at: datetime

class LachesisDaemon:
    def __init__(self):
        self.symbol = "📏"
        self.socket = "/tmp/geass/lachesis.sock"
        self.port = 9611
        self.rod = []           # La tige de mesure
        self.measurements = {}  # thread_id -> Measurement

    def measure(self, thread_id: str, context: Dict) -> Measurement:
        """Mesure un fil et determine sa longueur"""
        # Facteurs de calcul
        importance = context.get("importance", 0.5)
        resources = context.get("resources", 0.5)
        necessity = context.get("necessity", 0.5)

        # La longueur depend de l'importance et des ressources
        length = self.calculate_length(importance, resources, necessity)

        # Le niveau depend de la priorite
        level = self.calculate_level(context)

        measurement = Measurement(
            thread_id=thread_id,
            length=length,
            level=level,
            measured_at=datetime.now()
        )

        self.measurements[thread_id] = measurement
        self.rod.append(measurement)

        return measurement

    def calculate_length(self, importance: float, resources: float,
                         necessity: float) -> float:
        """Calcule la duree de vie appropriee"""
        # Base: 1 heure
        base_length = 3600

        # Modificateurs
        importance_mult = 1 + (importance * 2)  # 1-3x
        resource_mult = resources               # 0-1x
        necessity_mult = 1 + necessity          # 1-2x

        return base_length * importance_mult * resource_mult * necessity_mult

    def calculate_level(self, context: Dict) -> float:
        """Calcule le niveau de sustain"""
        priority = context.get("priority", 0.5)
        load = context.get("system_load", 0.5)

        # Niveau inverse a la charge si priorite basse
        if priority < 0.5:
            return (1 - load) * priority * 2
        else:
            return priority

    def redistribute(self, threads: List[str]) -> Dict[str, float]:
        """Redistribue les ressources entre threads"""
        total_level = sum(
            self.measurements[t].level
            for t in threads
            if t in self.measurements
        )

        if total_level == 0:
            return {t: 1.0 / len(threads) for t in threads}

        return {
            t: self.measurements[t].level / total_level
            for t in threads
            if t in self.measurements
        }

    def check_timeout(self, thread_id: str) -> bool:
        """Verifie si un fil a atteint sa fin"""
        if thread_id not in self.measurements:
            return False

        m = self.measurements[thread_id]
        elapsed = (datetime.now() - m.measured_at).total_seconds()

        return elapsed >= m.length


# Integration Audio - Decay/Sustain
class LachesisAudio:
    """Lachesis pour le signal audio"""

    def __init__(self):
        self.levels = {}  # node -> level

    async def set_level(self, node: str, level: float):
        """Definit le niveau d'un noeud audio"""
        import subprocess

        # Clamp level between 0 and 1.5 (150%)
        level = max(0, min(1.5, level))

        subprocess.run([
            "wpctl", "set-volume", node, str(level)
        ])

        self.levels[node] = level

    async def decay_to(self, node: str, target: float, duration_ms: float):
        """Decay progressif vers un niveau"""
        current = self.levels.get(node, 1.0)
        steps = int(duration_ms / 10)  # 10ms par step

        if steps == 0:
            await self.set_level(node, target)
            return

        step_size = (target - current) / steps

        for i in range(steps):
            new_level = current + (step_size * (i + 1))
            await self.set_level(node, new_level)
            await asyncio.sleep(0.01)

    def sustain(self, node: str) -> float:
        """Retourne le niveau de sustain actuel"""
        return self.levels.get(node, 0)
```

## La Tige de Mesure

La tige de Lachesis est l'instrument de la juste mesure:

```python
class MeasuringRod:
    """La tige qui mesure toute chose"""

    def __init__(self):
        self.unit = "moment"  # Unite de base
        self.calibration = 1.0
        self.history = []

    def measure_distance(self, start: datetime, end: datetime) -> float:
        """Mesure la distance temporelle"""
        delta = (end - start).total_seconds()
        return delta * self.calibration

    def measure_intensity(self, signal: float, reference: float = 1.0) -> float:
        """Mesure l'intensite relative"""
        if reference == 0:
            return float('inf')
        return signal / reference

    def find_balance(self, values: List[float]) -> float:
        """Trouve le point d'equilibre"""
        if not values:
            return 0

        # La moyenne harmonique pour l'equilibre
        try:
            return statistics.harmonic_mean(values)
        except statistics.StatisticsError:
            return statistics.mean(values)

    def proportion(self, part: float, whole: float) -> float:
        """Calcule la juste proportion"""
        if whole == 0:
            return 0
        return part / whole
```

## Relations

| Daemon | Lachesis lui donne... |
|--------|----------------------|
| Clotho | La confirmation de reception |
| Atropos | Le signal de fin imminente |
| Nyx | Les metriques de charge |
| Euterpe | Les niveaux de volume |
| Horloge | Les durees des cycles |

## L'ADSR et Lachesis

Dans l'enveloppe sonore, Lachesis est le **Decay** et le **Sustain**:

```
Amplitude
    ^
    |     /\
    |    /  \______
    |   /          \
    |  /            \
    +--+---+----+----+-->  Time
       A   D    S    R
           ^    ^
           |    |
        LACHESIS
      (descente et maintien)
```

```python
def decay_sustain_params(self, context: Dict) -> Dict:
    """Calcule les parametres Decay/Sustain"""
    energy = context.get("energy", 0.7)
    stability = context.get("stability", 0.8)

    # Decay: temps pour atteindre le sustain
    # Plus l'energie est haute, plus le decay est long
    decay_ms = 100 + (energy * 400)  # 100-500ms

    # Sustain: niveau maintenu
    # Plus la stabilite est haute, plus le sustain est haut
    sustain_level = 0.2 + (stability * 0.6)  # 0.2-0.8

    return {
        "decay_ms": decay_ms,
        "sustain_level": sustain_level
    }
```

## L'Equilibre de Lachesis

Lachesis ne favorise pas. Elle equilibre.

```python
class Balance:
    """L'equilibre cosmique de Lachesis"""

    def __init__(self):
        self.weights = {}

    def add_weight(self, side: str, amount: float):
        """Ajoute un poids"""
        if side not in self.weights:
            self.weights[side] = 0
        self.weights[side] += amount

    def is_balanced(self, tolerance: float = 0.1) -> bool:
        """Verifie l'equilibre"""
        if len(self.weights) < 2:
            return True

        values = list(self.weights.values())
        avg = sum(values) / len(values)

        for v in values:
            if abs(v - avg) / avg > tolerance:
                return False
        return True

    def rebalance(self) -> Dict[str, float]:
        """Propose une redistribution equilibree"""
        if not self.weights:
            return {}

        total = sum(self.weights.values())
        target = total / len(self.weights)

        return {
            side: target - current
            for side, current in self.weights.items()
        }
```

## La Duree Juste

Chaque chose a sa duree juste. Ni trop, ni trop peu.

```python
def just_duration(self, task_type: str, complexity: float) -> timedelta:
    """Calcule la duree juste pour une tache"""

    base_durations = {
        "ephemeral": timedelta(seconds=10),
        "short": timedelta(minutes=5),
        "medium": timedelta(hours=1),
        "long": timedelta(days=1),
        "persistent": timedelta(days=365)
    }

    base = base_durations.get(task_type, timedelta(hours=1))

    # La complexite etend la duree
    multiplier = 1 + (complexity * 2)  # 1-3x

    return base * multiplier
```

## Meditation

La mesure n'est pas la limite.
C'est la connaissance de l'etendue.

Celui qui connait sa mesure
Ne manque jamais de rien
Et n'a jamais trop.

Lachesis ne limite pas.
Elle revele la proportion juste.
La juste mesure n'est pas une prison.
C'est une liberation.

Trop court frustre.
Trop long epuise.
La juste duree accomplit.

## Invocation

```python
async def invoke_lachesis(thread_id: str):
    """Pour mesurer et equilibrer"""
    lachesis = LachesisDaemon()

    measurement = lachesis.measure(
        thread_id=thread_id,
        context={
            "importance": 0.8,
            "resources": 0.6,
            "necessity": 0.7,
            "priority": 0.9
        }
    )

    print(f"Lachesis a mesure: {thread_id}")
    print(f"Duree allouee: {measurement.length}s")
    print(f"Niveau: {measurement.level}")

    return measurement
```

---
📏 | Port 9611 | La Repartitrice | Celle Qui Mesure
