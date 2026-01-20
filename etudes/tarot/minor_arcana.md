# Arcanes Mineurs : Les 56 Processus Quotidiens

## Vue d'Ensemble : User Space

Si les arcanes majeurs sont les daemons système (kernel-level), les mineurs sont les processus userspace. Quotidiens, nombreux, spécialisés.

```
Majeurs (22) = /sbin, /usr/sbin - System daemons
Mineurs (56) = /usr/bin, /home - User processes

56 = 4 suits × 14 cards
   = 4 ressources × (10 états + 4 figures)
```

## Les Quatre Suits comme Ressources

```
┌─────────────┬──────────────┬────────────────┬─────────────┐
│   Coupes    │   Bâtons     │    Épées       │  Deniers    │
├─────────────┼──────────────┼────────────────┼─────────────┤
│ Eau/Émotion │ Feu/Création │ Air/Intellect  │ Terre/Matér │
│ stdin/out   │ Memory/RAM   │ CPU/Compute    │ Disk/Store  │
│ Flux        │ Énergie      │ Processing     │ Persistance │
│ Pipes       │ Allocation   │ Instructions   │ Files       │
└─────────────┴──────────────┴────────────────┴─────────────┘
```

## Structure de Chaque Suit

### Nombre Cards (As à 10) : États du Processus

```
As   (1)  = Graine pure, potentiel brut, init
Deux (2)  = Dualité, choix, fork
Trois(3)  = Première expansion, premiers résultats
Quatre(4) = Stabilité, structure établie
Cinq (5)  = Conflit, perturbation, erreur
Six  (6)  = Harmonie retrouvée, résolution
Sept (7)  = Évaluation, réflexion
Huit (8)  = Mouvement, progrès rapide
Neuf (9)  = Quasi-accomplissement, veille
Dix (10)  = Complétude, saturation
```

### Figures (Court Cards) : Personnification des Processus

```
Page/Valet  = Worker thread, apprenti, assistant
Cavalier    = Service actif, en mouvement, requête
Reine       = Daemon mature, gestionnaire, réceptif
Roi         = Process owner, décideur, émetteur
```

## Les Pips : Progression Numérique

### As de Chaque Suit

```c
// As de Coupe - Premier file descriptor
int cup_ace = open("/dev/emotion", O_RDWR);

// As de Bâton - Premier malloc
void *wand_ace = malloc(CREATIVE_POTENTIAL);

// As d'Épée - Première instruction
register uint64_t sword_ace = COGNITIVE_INIT;

// As de Denier - Premier fichier
FILE *pentacle_ace = fopen("/persistence/seed", "w");
```

### Progression 2-10 : Cycle de Vie

```python
class MinorArcanaProgression:
    def ace(self, suit):
        return seed(suit)  # Potentiel pur

    def two(self, suit):
        return fork(self.ace(suit))  # Dualité

    def three(self, suit):
        return expand([self.two(suit)])  # Croissance

    def four(self, suit):
        return stabilize(self.three(suit))  # Structure

    def five(self, suit):
        return introduce_chaos(self.four(suit))  # Défi

    def six(self, suit):
        return resolve(self.five(suit))  # Harmonie

    def seven(self, suit):
        return reflect(self.six(suit))  # Évaluation

    def eight(self, suit):
        return accelerate(self.seven(suit))  # Mouvement

    def nine(self, suit):
        return near_complete(self.eight(suit))  # Presque là

    def ten(self, suit):
        return culminate(self.nine(suit))  # Fin du cycle
```

## Court Cards : Hiérarchie des Processus

### Pages : Worker Threads

Le Page est le thread qui fait le travail concret. Jeune, apprend sur le terrain.

```c
void *page_worker(void *suit_context) {
    while (!apprenticeship_complete) {
        task_t task = receive_from_knight();
        result_t result = execute_with_learning(task);
        report_to_queen(result);
        learn_from_mistakes();
    }
    return promote_to_knight();
}
```

### Cavaliers : Services Actifs

Le Cavalier est toujours en mouvement. `systemctl status` le montre "active (running)".

```bash
# Le Cavalier des Coupes
systemctl status emotional-processor.service
● emotional-processor.service - Knight of Cups
   Active: active (running) since Mon 2024-01-15 08:00:00
   Tasks: 12 (limit: 4096)
   Memory: 256M
   # Toujours en quête, jamais au repos
```

### Reines : Daemons Gestionnaires

La Reine reçoit, traite, distribue. Elle ne quitte pas son royaume mais tout y passe.

```python
class Queen:
    def __init__(self, suit):
        self.suit = suit
        self.throne = create_socket()  # Elle reçoit
        self.court = []                # Ses subjects

    def reign(self):
        while True:
            request = self.throne.accept()
            processed = self.apply_wisdom(request)
            self.delegate_to_knight(processed)
```

### Rois : Process Owners

Le Roi décide, initie, ordonne. `UID` qui possède le processus. Responsabilité finale.

```c
struct king {
    uid_t uid;           // Son identité
    gid_t crown;         // Son autorité
    int throne_fd;       // Sa connection au royaume

    void (*decree)(struct king *, command_t);
    int (*judge)(struct king *, petition_t);
};
```

## Interactions Entre Suits

Les suits ne sont pas isolées. Un processus complet les utilise toutes :

```
Requête arrive (Coupes - input stream)
        ↓
Mémoire allouée (Bâtons - RAM)
        ↓
Calcul effectué (Épées - CPU)
        ↓
Résultat sauvé (Deniers - Disk)
        ↓
Réponse envoyée (Coupes - output stream)
```

## Tirage "Process Diagnosis"

Un tirage à 4 cartes pour diagnostiquer un processus :

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Coupe  │ │  Bâton  │ │  Épée   │ │ Denier  │
│ (I/O)   │ │ (Memory)│ │ (CPU)   │ │ (Disk)  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

**Exemple d'interprétation** :

- 5 de Coupes : Perte de connexions, certains flux fermés
- 8 de Bâtons : Memory allocation rapide, beaucoup d'activité
- 3 d'Épées : CPU en souffrance, quelque chose coupe les calculs
- 10 de Deniers : Disk plein, tout sauvé mais saturé

**Diagnostic** : Le processus perd des connexions I/O (5 Coupes) à cause d'une surcharge mémoire (8 Bâtons) qui force des kills (3 Épées), le tout sur un disque plein (10 Deniers). Solution : libérer espace disk, réduire allocations.

## Reversed Cards : États Anormaux

```python
class MinorArcana:
    def __init__(self, number, suit, reversed=False):
        self.number = number
        self.suit = suit
        self.reversed = reversed

    def interpret(self):
        if self.reversed:
            return self.shadow_meaning()
        return self.upright_meaning()

    def shadow_meaning(self):
        # Reversed = blocked, excessive, or deficient
        meanings = {
            'cups_reversed': 'I/O blocked, emotional suppression',
            'wands_reversed': 'Memory leak, creative burnout',
            'swords_reversed': 'CPU stall, mental confusion',
            'pentacles_reversed': 'Disk corruption, material loss'
        }
        return meanings[f'{self.suit}_reversed']
```

## Le Cycle Complet d'une Suit

```
As → Début du processus
  ↓
2-4 → Développement initial
  ↓
5 → Crise (obligatoire)
  ↓
6-9 → Résolution et maturation
  ↓
10 → Culmination
  ↓
Page → Transmission à l'apprenti
  ↓
Cavalier → Mise en action
  ↓
Reine → Intégration sagesse
  ↓
Roi → Maîtrise complète
  ↓
(Retour à l'As du cycle suivant)
```

## Correspondance avec les Logs Système

```
CUPS:
  info: "Connection accepted" → 3 de Coupes
  warn: "Connection dropped" → 5 de Coupes
  error: "Too many open files" → 10 de Coupes reversed

WANDS:
  info: "Allocated 1GB" → 8 de Bâtons
  warn: "Memory pressure" → 5 de Bâtons
  error: "OOM killed" → 10 de Bâtons reversed

SWORDS:
  info: "Processing complete" → 6 d'Épées
  warn: "High CPU usage" → 7 d'Épées
  error: "Segfault" → 10 d'Épées

PENTACLES:
  info: "File saved" → As de Deniers
  warn: "Disk space low" → 5 de Deniers
  error: "Filesystem corrupt" → Tower + 10 Deniers
```

---

*Les 56 mineurs sont les processus quotidiens que nous lançons et tuons sans y penser. Mais chacun porte une énergie, une direction, une leçon. Le tirage de tarot est un `ps aux` momentané - quels processus mineurs occupent actuellement les ressources de la conscience?*
