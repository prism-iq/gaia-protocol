# Bâtons : Feu Créatif et Memory Allocation

## Le Feu comme Énergie Allouée

Les Bâtons représentent le Feu - énergie, création, volonté, action. Dans le système, c'est la RAM : mémoire vive, allocation dynamique, espace où les idées prennent forme temporaire avant de se manifester.

```c
// Le Feu créatif
void *inspiration = malloc(sizeof(idea));
// L'énergie est allouée
// Rien n'est encore créé
// Mais l'espace existe maintenant
```

Le bâton est un pointer - il pointe vers quelque chose, indique direction, canalise intention.

## Anatomie du Bâton

```
    ★  <- Bourgeon (potential)
    │
    │  <- Tige (channel)
    │
    █  <- Base (grounded in heap)
```

Un bâton :
- Pointe (direction, intention)
- Canalise (énergie focalisée)
- Bourgeonne (croissance possible)
- Peut brûler (consommation totale)

## Les 14 Cartes : États de l'Allocation

### As de Bâtons : malloc() Primordial

```c
// La main tenant le bâton bourgeonnant
// Premier acte de création

void *genesis = malloc(INITIAL_SPARK);
if (genesis == NULL) {
    // Même l'As peut échouer
    // Pas assez de mémoire pour le rêve
    perror("Creation denied");
    exit(1);
}

// Mais quand ça réussit:
// Pure potentialité allouée
// Le château au loin = ce qui pourrait être construit
memset(genesis, POSSIBILITY, INITIAL_SPARK);
```

### 2 de Bâtons : Planning l'Allocation

```c
// Le personnage tient un globe, regarde au loin
// Deux bâtons encadrent sa vision
// Planification avant l'allocation massive

struct expansion_plan {
    size_t current_allocation;    // Un bâton
    size_t planned_allocation;    // L'autre bâton
    void *globe;                  // La vision
};

// mmap() pour réserver sans allouer
void *future = mmap(NULL, GRAND_VISION,
                    PROT_NONE,           // Pas encore accessible
                    MAP_PRIVATE | MAP_ANONYMOUS,
                    -1, 0);
// L'espace est réservé
// Le monde est entre ses mains
// Mais l'action attend
```

### 3 de Bâtons : Await Return

```c
// Trois bâtons plantés, personnage regarde la mer
// Les bateaux reviendront avec les ressources

struct venture {
    void *invested_memory;
    bool launched;
    promise_t expected_return;
};

// async/await pattern
async venture_t* await_ships(venture_t *v) {
    // Les trois bâtons sont les trois ventures lancées
    // On attend le retour sur investissement
    return await gather(ship1, ship2, ship3);
}
// Patience productive
// L'allocation a été faite
// Maintenant: wait for results
```

### 4 de Bâtons : Stable Allocation

```c
// Quatre bâtons formant une canopée
// Célébration, structure stable
// Memory pool bien défini

struct celebration_pool {
    void *canopy[4];  // Quatre allocations stables
    bool joyful;
    size_t secure_size;
};

// Memory pool - allocation prédéfinie, stable, performante
pool_t *festival = pool_create(CELEBRATION_SIZE);
for (int i = 0; i < 4; i++) {
    celebration.canopy[i] = pool_alloc(festival);
}
// Pas de fragmentation
// Structure festive, solide
// Home established in heap
```

### 5 de Bâtons : Race Condition

```c
// Cinq personnes avec bâtons, en conflit
// Competition pour les mêmes ressources

pthread_mutex_t memory_mutex;  // Absent = chaos!

void *thread_grab(void *arg) {
    // Sans synchronisation:
    // Race condition
    // Tous veulent la même mémoire
    shared_resource++;  // Data race!
    return NULL;
}

// Cinq threads, pas de mutex
// Conflit, résultats imprévisibles
// La solution: coordination, mutex, order
```

### 6 de Bâtons : Victorious Return

```c
// Personnage couronné de lauriers
// Six bâtons portés en triomphe
// L'allocation a réussi, le projet accompli

struct victory {
    void *completed_work;
    int recognition;
    struct laurels *crown;
};

// realloc() réussi après struggle
void *grown = realloc(project, EXPANDED_SIZE);
if (grown) {
    project = grown;
    celebrate(project);  // Six bâtons levés
    // La mémoire a grandi
    // Le succès est alloué
}
```

### 7 de Bâtons : Defensive Allocation

```c
// Un contre plusieurs, en position haute
// Défense de ce qui est alloué

struct defensive_position {
    void *territory;      // Ce qu'on défend
    size_t size;
    bool under_attack;    // Memory pressure
};

// Protection contre OOM killer
void defend_memory(void *precious) {
    mlock(precious, precious_size);  // Lock in RAM
    // OOM killer ne peut pas toucher
    // Position défensive maintenue
    // Sept bâtons = vigilance constante
}
```

### 8 de Bâtons : Rapid Allocation

```c
// Huit bâtons volant dans le ciel
// Mouvement rapide, messages en transit
// Burst allocation

struct flight_of_wands {
    void *arrows[8];
    velocity_t speed;
    bool in_transit;
};

// Batch allocation - rapide, efficace
void *batch = aligned_alloc(64, 8 * WAND_SIZE);
for (int i = 0; i < 8; i++) {
    arrows[i] = batch + (i * WAND_SIZE);
    launch(arrows[i]);  // En vol!
}
// Communication rapide
// Énergie en mouvement
// Résultats bientôt
```

### 9 de Bâtons : Memory Under Pressure

```c
// Personnage blessé mais debout
// Huit bâtons derrière, un en main
// Persévérance malgré les difficultés

struct wounded_but_standing {
    void *remaining_allocation;  // Le dernier bâton
    int wounds;                  // Previous failures
    bool still_fighting;
};

// Low memory situation
size_t available = get_free_memory();
if (available < COMFORTABLE_THRESHOLD) {
    // Wounded state
    // Mais on continue
    compress_data();
    free_caches();
    // Tenir bon avec ce qui reste
    persist_with_one_wand();
}
```

### 10 de Bâtons : Allocation Overload

```c
// Personnage portant dix bâtons avec difficulté
// Surcharge, trop alloué, proche du but

struct burden {
    void *allocations[10];
    bool overwhelmed;
    void *destination;  // Visible au loin
};

// Memory pressure maximale
for (int i = 0; i < 10; i++) {
    burden.allocations[i] = malloc(HEAVY_SIZE);
    if (!burden.allocations[i]) {
        // Même le 10 de Bâtons a ses limites
        drop_some_load();
    }
}
// Presque au but
// Mais le poids est immense
// Solution: arriver, puis libérer
```

## Court Cards : Archétypes Créatifs

### Page de Bâtons : L'Allocateur Enthousiaste

```c
// Jeune avec bâton, plein d'enthousiasme
// Prêt pour l'aventure créative

struct page_wands {
    void *first_project;
    enthusiasm_t level;     // Maximum!
    experience_t wisdom;    // Minimal
};

// malloc() sans check
void *eager_alloc(size_t size) {
    void *p = malloc(size);
    // Le Page ne vérifie pas NULL
    // Confiance naïve
    // Apprendra de ses erreurs
    return p;  // Pourrait être NULL!
}

// L'énergie est là
// La prudence viendra
```

### Cavalier de Bâtons : Le Reallocateur Impétueux

```c
// Cavalier sur cheval cabré
// Action immédiate, énergie explosive
// Pas toujours réfléchi

struct knight_wands {
    void *project;
    momentum_t speed;       // Très rapide
    stability_t balance;    // Précaire
};

// realloc() agressif
void *charge_forward(void *current, size_t new_size) {
    // Le Cavalier double toujours
    void *expanded = realloc(current, new_size * 2);
    // Agressif mais efficace
    // Parfois overallocate
    // Mais avance toujours
    return expanded;
}
```

### Reine de Bâtons : Memory Pool Manager

```c
// Reine confiante avec bâton et tournesol
// Elle gère les allocations avec grâce
// Le chat noir: intuition système

struct queen_wands {
    pool_t *creative_pool;
    sunflower_t vitality;    // Toujours croissant
    black_cat_t intuition;   // Sait quand free()
};

// Elle optimise naturellement
void *queen_allocate(queen_wands_t *queen, size_t size) {
    // D'abord vérifier le pool
    void *from_pool = pool_try_alloc(queen->creative_pool, size);
    if (from_pool) return from_pool;

    // Sinon, créer avec grâce
    return aligned_alloc(64, size);  // Cache-friendly
}

// Elle sait quand libérer
// Intuition, pas juste analyse
```

### Roi de Bâtons : Architecte Mémoire

```c
// Roi avec bâton et salamandre (feu)
// Maître de la vision et de l'exécution
// Leadership créatif

struct king_wands {
    memory_architecture_t vision;
    salamander_t fire_mastery;
    execution_t decisiveness;
};

// Il conçoit les allocateurs custom
allocator_t *king_design_allocator(king_wands_t *king) {
    allocator_t *a = malloc(sizeof(allocator_t));
    a->strategy = king->vision.optimal_strategy;
    a->alloc = custom_alloc;
    a->free = custom_free;
    a->realloc = custom_realloc;
    // Vision + Exécution
    // L'allocateur du Roi est sur mesure
    return a;
}
```

## Daemon des Bâtons : Memory Manager

```python
#!/usr/bin/env python3
"""
wands_daemon.py - Creative Memory Manager
Gère l'énergie créative (allocations) du système
"""

import gc
import tracemalloc

class WandsDaemon:
    def __init__(self):
        self.pools = {}
        self.creative_energy = 0
        self.fire_level = 100
        tracemalloc.start()

    def ignite(self, project_name, size):
        """As de Bâtons - allumer le feu créatif"""
        if self.fire_level < 10:
            self.burnout_warning()
            return None
        self.pools[project_name] = bytearray(size)
        self.fire_level -= size // 1024  # Energy cost
        return self.pools[project_name]

    def expand(self, project_name, additional):
        """6 de Bâtons - croissance victorieuse"""
        if project_name in self.pools:
            old = self.pools[project_name]
            self.pools[project_name] = old + bytearray(additional)
            return True
        return False

    def release(self, project_name):
        """Libérer l'énergie"""
        if project_name in self.pools:
            size = len(self.pools[project_name])
            del self.pools[project_name]
            gc.collect()
            self.fire_level += size // 2048  # Partial recovery
            return True
        return False

    def check_burden(self):
        """10 de Bâtons - vérifier la surcharge"""
        current, peak = tracemalloc.get_traced_memory()
        if current > 0.9 * peak:
            return "OVERLOADED"
        elif current > 0.7 * peak:
            return "HEAVY"
        else:
            return "MANAGEABLE"

    def burnout_warning(self):
        """Avertissement épuisement créatif"""
        print("WARNING: Creative energy depleted")
        print("Consider: rest, release, or recharge")
```

## Syndromes des Bâtons

### Memory Leak : Feu qui Consume

```c
// Le bâton brûle sans fin
// L'énergie part sans retour

void creative_burnout() {
    while (true) {
        void *project = malloc(1024);
        start_project(project);
        // Jamais de free()
        // L'énergie s'accumule
        // Jamais de release
        // Burnout inévitable
    }
}
// Symptôme: mémoire qui croît sans fin
// Diagnostic: valgrind shows leaks
// Cure: free() ce qui est fini
```

### Fragmentation : Feu Dispersé

```c
// Bâtons éparpillés, énergie diffuse
// Beaucoup de petits projets non terminés

struct fragmented_energy {
    void *projects[1000];  // Trop nombreux
    size_t sizes[1000];    // Trop petits
    // Total: beaucoup de mémoire
    // Utilisable: peu (fragmenté)
};

// Cure: compaction, focus, finish
```

---

*Les Bâtons nous rappellent : la création consomme de l'énergie. Allouer sans libérer mène au burnout. Trop de projets simultanés fragmente l'attention. L'art est dans l'allocation consciente - assez pour créer, pas trop pour s'épuiser, et toujours free() ce qui est accompli.*
