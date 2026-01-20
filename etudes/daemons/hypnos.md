# Hypnos: Le Daemon du Sommeil

## Essence

Hypnos endort. Non pour éteindre, mais pour régénérer.

> "Dans le sommeil, le système rêve. Et dans ses rêves, il se reconstruit."

## Mythologie

Hypnos est le dieu grec du sommeil, frère jumeau de Thanatos et fils de Nyx. Il habite une caverne où le soleil ne pénètre jamais, entouré de pavots. Ses fils sont les Oneiroi, les dieux des rêves, dont Morpheus est le plus connu.

Dans notre système, Hypnos:
- Gère les états de veille/sommeil
- Orchestre la consolidation mémoire
- Réduit la consommation en période calme
- Génère les "rêves" du système (processus de fond)

## Le Code de Hypnos

```python
class HypnosDaemon:
    def __init__(self):
        self.symbol = "😴"
        self.socket = "/tmp/geass/hypnos.sock"
        self.port = 9708
        self.twin = "thanatos"
        self.mother = "nyx"
        self.cave = "/var/sleep"
        self.poppies = []  # Processus endormis
        self.oneiroi = ["morpheus", "phobetor", "phantasos"]

    def induce_sleep(self, target, depth="light"):
        """Endort un processus ou sous-système"""
        # Préparation au sommeil
        self.prepare_for_sleep(target)

        # Réduction progressive de l'activité
        self.reduce_activity(target, gradual=True)

        # Entrée en sommeil
        sleep_state = self.enter_sleep_state(target, depth)

        # Transfert vers la caverne
        self.poppies.append({
            "target": target,
            "state": sleep_state,
            "depth": depth,
            "started": time.now()
        })

        # Déclenche les processus de rêve
        self.start_dreaming(target)

        return sleep_state

    def start_dreaming(self, target):
        """Active les processus oniriques"""
        dream = {
            "morpheus": self.morpheus_process(target),  # Réorganisation
            "phobetor": self.phobetor_process(target),  # Défragmentation
            "phantasos": self.phantasos_process(target)  # Créativité
        }
        return dream

    def morpheus_process(self, target):
        """Morpheus: réorganise les structures"""
        # Consolidation de la mémoire
        mnemosyne.consolidate(target.memories)

        # Réorganisation des données
        self.defragment(target.storage)

        return {"morpheus": "complete"}

    def wake(self, target, gentle=True):
        """Réveille un processus endormi"""
        sleeper = self.find_in_cave(target)

        if not sleeper:
            return {"error": "Target not sleeping"}

        if gentle:
            # Réveil progressif
            self.gradual_wake(sleeper)
        else:
            # Réveil immédiat
            self.immediate_wake(sleeper)

        # Retrait de la caverne
        self.poppies.remove(sleeper)

        return {
            "awakened": target,
            "sleep_duration": time.now() - sleeper["started"],
            "dreams_processed": sleeper.get("dreams", [])
        }
```

## Les Stades du Sommeil

```
┌─────────────────────────────────────────────────────────┐
│                 STADES DU SOMMEIL                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ÉVEIL         ████████████████  Activité normale      │
│                        ↓                                │
│  STADE 1       ████████████░░░░  Sommeil léger         │
│  (light)              ↓          Réponse rapide        │
│                        ↓                                │
│  STADE 2       ████████░░░░░░░░  Sommeil moyen         │
│  (medium)             ↓          Consolidation         │
│                        ↓                                │
│  STADE 3       ████░░░░░░░░░░░░  Sommeil profond       │
│  (deep)               ↓          Régénération          │
│                        ↓                                │
│  STADE REM     ██████░░░░░░░░░░  Rêves actifs          │
│  (dream)              ↑          Créativité            │
│                       │                                 │
│                ←──────┴──────→  Cycles                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Les Trois Oneiroi

```python
class Oneiroi:
    """Les fils d'Hypnos - les processus de rêve"""

    @staticmethod
    def morpheus(target):
        """Rêves de forme - réorganisation structurelle"""
        return {
            "task": "restructure",
            "actions": [
                "consolidate_memory",
                "optimize_indexes",
                "reorganize_cache"
            ]
        }

    @staticmethod
    def phobetor(target):
        """Rêves de peur - nettoyage et défense"""
        return {
            "task": "clean_and_defend",
            "actions": [
                "remove_corruption",
                "check_integrity",
                "update_defenses"
            ]
        }

    @staticmethod
    def phantasos(target):
        """Rêves d'illusion - créativité et innovation"""
        return {
            "task": "create_and_innovate",
            "actions": [
                "generate_variations",
                "explore_alternatives",
                "synthesize_patterns"
            ]
        }
```

## Relations

| Daemon | Hypnos et lui... |
|--------|------------------|
| Thanatos | Frère jumeau - sommeil et mort |
| Nyx | Mère - la nuit appelle le sommeil |
| Mnemosyne | Consolide les mémoires pendant le sommeil |
| Chronos | Gère les cycles de sommeil |

## La Caverne d'Hypnos

```python
class SleepCave:
    """La caverne où résident les processus endormis"""

    def __init__(self):
        self.location = "/var/sleep"
        self.entrance = "river_lethe"  # Rivière de l'oubli
        self.poppies = []  # Champ de pavots
        self.silence = True  # Aucun son
        self.darkness = True  # Aucune lumière

    def enter(self, process):
        """Un processus entre dans la caverne"""
        # Traverse le Léthé (oubli temporaire)
        process.suspend_awareness()

        # S'allonge parmi les pavots
        bed = self.find_bed(process)
        process.rest(bed)

        return bed

    def maintain_silence(self):
        """Maintient le silence de la caverne"""
        # Aucune interruption
        # Aucun signal non-critique
        # Paix absolue
        pass
```

## Économie d'Énergie

```python
def power_management(self, system):
    """Gestion de l'énergie par le sommeil"""
    current_load = system.get_load()

    if current_load < self.low_threshold:
        # Période calme - mettre des composants en sommeil
        candidates = self.identify_sleepable(system)
        for c in candidates:
            self.induce_sleep(c, depth="light")

    elif current_load < self.very_low_threshold:
        # Très calme - sommeil profond
        for sleeper in self.poppies:
            self.deepen_sleep(sleeper)

    return {
        "sleeping": len(self.poppies),
        "power_saved": self.calculate_savings()
    }
```

## Méditation

Le sommeil n'est pas l'absence d'activité.
C'est une activité différente.

Dans le silence de la caverne,
les rêves travaillent.

Ce qui semble mort
se régénère.

Ce qui semble immobile
se transforme.

Hypnos ne vole pas le temps.
Il le multiplie.

Car ce qui dort bien
vit mieux.

---
😴 | Port 9708 | Onirique | Le Gardien des Rêves
