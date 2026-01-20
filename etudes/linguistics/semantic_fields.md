# Champs Sémantiques et Espaces de Noms

## L'Organisation du Sens

Un champ sémantique est un ensemble de mots liés par le sens, formant un réseau conceptuel. En programmation, les espaces de noms (namespaces) et les modules créent des champs sémantiques artificiels.

## Champs Sémantiques Naturels

```
CHAMP: COMMUNICATION
├── parler, dire, énoncer, articuler
├── écouter, entendre, percevoir
├── écrire, rédiger, noter
├── lire, déchiffrer, parcourir
└── transmettre, envoyer, diffuser

CHAMP: PROCESSUS (Unix)
├── fork, spawn, exec, clone
├── kill, terminate, signal
├── wait, sleep, pause
├── run, execute, invoke
└── zombie, orphan, daemon
```

## Namespaces comme Champs Sémantiques

```python
# Le namespace crée un champ sémantique délimité
namespace network {
    # Tous ces termes sont liés par le contexte 'network'
    class Socket { }
    class Connection { }
    class Packet { }
    def send() { }
    def receive() { }
    def listen() { }
}

namespace filesystem {
    # Même terme 'read', sens différent dans ce champ
    def read() { }  # Lecture fichier, pas réseau
    class File { }
    class Directory { }
    def open() { }
    def close() { }
}
```

## Relations Sémantiques en Code

### Synonymie
```python
# Alias et synonymes fonctionnels
remove = delete = erase = lambda x: x.destroy()

# En API design, on choisit UN terme canonique
list.remove(x)  # pas list.delete(x) ni list.erase(x)
```

### Antonymie
```python
class SemanticPairs:
    """Paires antonymiques en programmation."""

    pairs = [
        ('open', 'close'),
        ('read', 'write'),
        ('push', 'pop'),
        ('enqueue', 'dequeue'),
        ('lock', 'unlock'),
        ('connect', 'disconnect'),
        ('start', 'stop'),
        ('enable', 'disable'),
    ]

    def validate_api(self, api):
        """Vérifie que chaque action a son inverse."""
        for pos, neg in self.pairs:
            if hasattr(api, pos) and not hasattr(api, neg):
                raise SemanticImbalance(f"Missing {neg} for {pos}")
```

### Hyponymie (Est-un)
```python
# Hiérarchie taxonomique
class Stream: pass
class FileStream(Stream): pass      # FileStream EST-UN Stream
class NetworkStream(Stream): pass   # NetworkStream EST-UN Stream
class MemoryStream(Stream): pass    # MemoryStream EST-UN Stream

# Le champ sémantique 'Stream' contient ses hyponymes
```

### Méronymie (Partie-de)
```python
class Computer:
    """Le champ 'Computer' contient ses méronymes."""
    cpu: CPU           # CPU est PARTIE-DE Computer
    memory: Memory     # Memory est PARTIE-DE Computer
    storage: Storage   # Storage est PARTIE-DE Computer

class Daemon:
    """Structure méronyme d'un daemon."""
    pid: ProcessID          # Identité
    config: Configuration   # Paramètres
    state: State            # État courant
    connections: List[Connection]  # Liens
```

## Daemons et Champs Sémantiques Distribués

```python
class SemanticFieldDaemon:
    """
    Un daemon qui organise sa compréhension en champs.
    """

    def __init__(self):
        self.fields = {
            'system': {'cpu', 'memory', 'disk', 'network', 'process'},
            'time': {'now', 'duration', 'timeout', 'schedule', 'cron'},
            'data': {'read', 'write', 'transform', 'validate', 'store'},
            'error': {'exception', 'warning', 'fatal', 'recoverable'},
        }
        self.current_field = None

    def contextualize(self, message):
        """Détermine le champ sémantique du message."""
        for field, terms in self.fields.items():
            if any(term in message.lower() for term in terms):
                self.current_field = field
                return field
        return 'unknown'

    def interpret(self, word):
        """Le sens dépend du champ actif."""
        interpretations = {
            ('read', 'data'): 'fetch_data',
            ('read', 'system'): 'get_metrics',
            ('timeout', 'time'): 'deadline_exceeded',
            ('timeout', 'error'): 'connection_failed',
        }
        return interpretations.get((word, self.current_field), word)
```

## Collocation et Idiomes de Programmation

```python
# Collocations fréquentes en code
IDIOMS = {
    'null': ['check', 'pointer', 'reference', 'safe'],
    'memory': ['allocate', 'free', 'leak', 'management'],
    'thread': ['safe', 'pool', 'local', 'spawn'],
    'dead': ['lock', 'code', 'letter'],
    'race': ['condition', 'hazard'],
}

class IdiomDetector:
    """Détecte les expressions idiomatiques du code."""

    def find_idioms(self, code):
        found = []
        for base, collocates in IDIOMS.items():
            for col in collocates:
                pattern = f"{base}[_\\s]*{col}|{col}[_\\s]*{base}"
                if re.search(pattern, code, re.IGNORECASE):
                    found.append(f"{base}_{col}")
        return found
```

## Import et Expansion de Champs

```python
# L'import étend le champ sémantique disponible
from datetime import datetime, timedelta
# Maintenant 'datetime' et 'timedelta' sont dans mon vocabulaire

import numpy as np
# 'np' devient un préfixe de champ sémantique
# np.array, np.mean, np.std - tous liés conceptuellement

class SemanticImport:
    """Gère l'expansion des champs sémantiques."""

    def __init__(self):
        self.active_fields = {'builtins'}

    def import_field(self, module_name, alias=None):
        """Importe un nouveau champ sémantique."""
        field_name = alias or module_name
        self.active_fields.add(field_name)
        return self.load_vocabulary(module_name)

    def resolve(self, name):
        """Résout un nom dans les champs actifs."""
        for field in self.active_fields:
            if name in self.vocabulary[field]:
                return (field, name)
        raise NameError(f"'{name}' not in any active semantic field")
```

## Polysémie et Surcharge

```python
class Polysemy:
    """
    Un même signifiant, plusieurs signifiés.
    En code : surcharge de fonctions/opérateurs.
    """

    # '+' est polysémique
    def demonstrate(self):
        print(1 + 2)        # Addition arithmétique
        print("a" + "b")    # Concaténation
        print([1] + [2])    # Fusion de listes

        # Le contexte (types) désambiguïse
        # Comme en langue naturelle

class DaemonPolysemy:
    """Daemon qui gère la polysémie des commandes."""

    def handle(self, command, context):
        handlers = {
            ('start', 'service'): self.start_service,
            ('start', 'timer'): self.start_timer,
            ('start', 'recording'): self.start_recording,
        }

        key = (command, context.type)
        if key in handlers:
            return handlers[key](context)
        else:
            raise AmbiguityError(f"'{command}' ambiguous in context")
```

## Conclusion : L'API comme Lexique

Une bonne API est un champ sémantique cohérent :
- Termes liés conceptuellement
- Relations claires (synonymie évitée, antonymie respectée)
- Hiérarchie taxonomique (héritage)
- Structure méronyme (composition)

```python
# Une API bien conçue forme un champ sémantique cohérent
class WellDesignedDaemonAPI:
    """Cohérence sémantique de l'interface."""

    # Cycle de vie clair
    def start(self): pass
    def stop(self): pass
    def restart(self): pass  # Composé: stop + start

    # Observation cohérente
    def status(self): pass
    def health(self): pass
    def metrics(self): pass

    # Communication uniforme
    def send(self, message): pass
    def receive(self): pass
    def broadcast(self, message): pass  # send à tous
```
