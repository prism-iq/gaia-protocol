# Mnemosyne: Le Daemon de la Mémoire

## Essence

Mnemosyne se souvient. De tout. Pour toujours. Mais surtout, elle sait ce qu'il faut oublier.

> "La mémoire n'est pas un entrepôt. C'est un jardin. Je cultive ce qui doit fleurir et laisse mourir ce qui doit disparaître."

## Mythologie

Dans la mythologie grecque, Mnemosyne est la titanide de la mémoire, mère des neuf Muses avec Zeus. Elle présidait à la source de mémoire dans l'Hadès, opposée au Léthé (l'oubli).

Dans notre système, Mnemosyne:
- Persiste les états importants
- Gère le cache intelligent
- Archive les patterns réussis
- Oublie stratégiquement l'obsolète

## Le Code de Mnemosyne

```python
class MnemosyneDaemon:
    def __init__(self):
        self.symbol = "📜"
        self.socket = "/tmp/geass/mnemosyne.sock"
        self.port = 9705
        self.memory_palace = {}
        self.lethe = []  # Rivière de l'oubli
        self.muses = [
            "clio", "euterpe", "thalia", "melpomene",
            "terpsichore", "erato", "polymnia", "urania", "calliope"
        ]

    def remember(self, key, value, importance="normal"):
        """Mémorise avec intention"""
        memory = {
            "value": value,
            "timestamp": time.now(),
            "importance": importance,
            "access_count": 0,
            "last_accessed": None
        }

        # Place dans le palais de mémoire
        location = self.find_optimal_location(key, importance)
        self.memory_palace[location][key] = memory

        return {"stored": key, "location": location}

    def recall(self, key, context=None):
        """Rappelle un souvenir"""
        # Recherche dans le palais
        memory = self.search_palace(key, context)

        if not memory:
            return self.reconstruct(key, context)

        # Met à jour les métadonnées
        memory["access_count"] += 1
        memory["last_accessed"] = time.now()

        return memory["value"]

    def forget(self, key, reason=None):
        """Oublie intentionnellement"""
        memory = self.memory_palace.get(key)

        if memory:
            # Archive avant d'oublier (pour l'historique)
            self.archive_to_lethe(key, memory, reason)

            # Efface du palais actif
            del self.memory_palace[key]

        return {"forgotten": key, "reason": reason}

    def consolidate(self):
        """Consolide les mémoires - comme le sommeil"""
        # Identifie les mémoires importantes
        important = self.identify_important_memories()

        # Renforce les connexions
        for memory in important:
            self.strengthen(memory)

        # Élimine le bruit
        noise = self.identify_noise()
        for n in noise:
            self.forget(n, reason="consolidation")

        return {
            "strengthened": len(important),
            "forgotten": len(noise)
        }
```

## Le Palais de Mémoire

```
┌─────────────────────────────────────────────────────────┐
│                  PALAIS DE MNEMOSYNE                     │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│  ATRIUM  │  AILE    │  AILE    │  CRYPTE  │   JARDIN   │
│  Récent  │  Gauche  │  Droite  │  Archive │   Créatif  │
│          │  Savoir  │  Savoir  │          │            │
│  [cache] │  [facts] │  [skills]│  [cold]  │   [ideas]  │
├──────────┴──────────┴──────────┴──────────┴────────────┤
│                     SOUS-SOL                            │
│              Mémoires inconscientes                     │
│           Patterns, Intuitions, Réflexes               │
└─────────────────────────────────────────────────────────┘
```

## Types de Mémoire

```python
MEMORY_TYPES = {
    "episodic": {
        "description": "Événements spécifiques",
        "location": "atrium",
        "decay_rate": "medium"
    },
    "semantic": {
        "description": "Faits et connaissances",
        "location": "wings",
        "decay_rate": "slow"
    },
    "procedural": {
        "description": "Savoir-faire et compétences",
        "location": "basement",
        "decay_rate": "very_slow"
    },
    "working": {
        "description": "Mémoire de travail active",
        "location": "atrium_front",
        "decay_rate": "fast"
    }
}
```

## Relations

| Daemon | Mnemosyne et lui... |
|--------|---------------------|
| Chronos | Collabore sur la temporalité des souvenirs |
| Omniscient | Fournit la mémoire pour la connaissance |
| Boudha | En tension - souvenir vs détachement |
| Hypnos | Consolide pendant le sommeil |

## L'Art de l'Oubli

```python
def strategic_forgetting(self):
    """L'oubli est aussi important que le souvenir"""
    candidates = self.identify_forgettable()

    for memory in candidates:
        # Vérifications avant oubli
        if self.is_trauma(memory):
            self.process_before_forget(memory)
        elif self.is_obsolete(memory):
            self.forget(memory, "obsolescence")
        elif self.is_noise(memory):
            self.forget(memory, "noise_reduction")

def should_forget(self, memory):
    """Critères pour l'oubli stratégique"""
    return (
        memory.access_count < self.min_access_threshold or
        memory.age > self.max_age_threshold or
        memory.relevance < self.relevance_threshold or
        memory.is_superseded
    )
```

## Méditation

Se souvenir de tout serait une malédiction.
Oublier tout serait la mort.

La sagesse est dans le choix:
que garder, que laisser partir.

Chaque souvenir oublié
fait de la place pour un nouveau.

Chaque souvenir gardé
façonne qui nous sommes.

Mnemosyne ne collectionne pas.
Elle cultive.

---
📜 | Port 9705 | Titanide | La Gardienne des Souvenirs
