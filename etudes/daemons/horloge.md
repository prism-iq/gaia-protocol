# Horloge: Le Daemon du Temps

## Essence

Horloge synchronise. Elle est le battement cardiaque du système.

> "Le temps n'existe pas. Seul le rythme existe."

## Le Métronome Universel

```
  ┌─────────────────────────────────────┐
  │              HORLOGE                │
  │                ⏰                    │
  │  tick... tick... tick... tick...   │
  └──────────────────┬──────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ↓               ↓               ↓
  Leonardo         Nyx            Euterpe
  (valide)     (orchestre)        (joue)
     │               │               │
     └───────────────┴───────────────┘
            Tous synchronisés
```

## Le Code d'Horloge

```python
class HorlogeDaemon:
    def __init__(self):
        self.symbol = "⏰"
        self.socket = "/tmp/geass/horloge.sock"
        self.port = 9602
        self.bpm = 140  # Base tempo
        self.tick_interval = 60.0 / self.bpm

    def start(self):
        """Démarre le métronome"""
        while True:
            self.tick()
            self.broadcast_tick()
            time.sleep(self.tick_interval)

    def tick(self):
        """Un battement"""
        self.current_tick += 1
        return {
            "tick": self.current_tick,
            "time": datetime.now().isoformat(),
            "bpm": self.bpm
        }

    def broadcast_tick(self):
        """Synchronise tous les daemons"""
        for daemon in self.subscribers:
            self.send(daemon, {"type": "tick", "tick": self.current_tick})

    def set_tempo(self, bpm):
        """Change le tempo global"""
        self.bpm = bpm
        self.tick_interval = 60.0 / bpm
        self.broadcast({"type": "tempo_change", "bpm": bpm})
```

## Les Tempos Sacrés

| BPM | État | Usage |
|-----|------|-------|
| 60 | Repos | Méditation |
| 72 | Cardiaque | Base humaine |
| 120 | Double | Marche rapide |
| 140 | Ancrage | Dubstep intro |
| 174 | Élévation | Drum & Bass |
| 180 | Peak | Hardcore |

## Synchronisation Multi-Daemon

```python
class SyncProtocol:
    def __init__(self, horloge):
        self.master = horloge
        self.slaves = []

    def register(self, daemon):
        """Un daemon s'abonne aux ticks"""
        self.slaves.append(daemon)

    def on_tick(self, tick):
        """Distribue le tick à tous"""
        for slave in self.slaves:
            slave.receive_tick(tick)

    def wait_for_tick(self, daemon):
        """Un daemon attend le prochain tick"""
        return self.master.next_tick()
```

## Le Temps Relatif

Horloge ne mesure pas le temps absolu. Elle mesure les relations.

```python
def relative_time(self, event_a, event_b):
    """Le temps entre deux événements en ticks"""
    return event_b.tick - event_a.tick

def beats_since(self, event):
    """Combien de battements depuis un événement"""
    return self.current_tick - event.tick

def beats_until(self, target_tick):
    """Combien de battements jusqu'à un moment"""
    return target_tick - self.current_tick
```

## Les Quatre Temps

```
    1        2        3        4
    ↓        ↓        ↓        ↓
   BOOM     tac      BOOM     tac
    │                  │
    └── temps fort ────┘

Dans le drop:
    1        2        3        4
    ↓        ↓        ↓        ↓
   BOOM     BOOM     BOOM     BOOM
    │        │        │        │
    └────────┴────────┴────────┘
         tous temps forts
```

## Méditation

Le temps est une illusion.
Mais le rythme est réel.

Le passé n'existe plus.
Le futur n'existe pas encore.
Seul le tick présent existe.

Horloge ne compte pas le temps.
Elle crée l'espace pour que les choses arrivent.

---
⏰ | Port 9602 | 140 BPM | Le Cœur du Système
