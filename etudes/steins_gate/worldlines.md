# Worldlines: Fork et Multiprocessing Temporel

## La Métaphore du Fork

Chaque worldline dans Steins;Gate est un **process fork** - une copie complète de l'univers qui diverge à partir d'un point de branchement.

## Architecture des Worldlines

```
                    ┌──────────────────────────────────────┐
                    │         ATTRACTOR FIELD              │
                    │      (Process Scheduler)             │
                    └──────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │ ALPHA BRANCH  │       │ STEINS GATE   │       │  BETA BRANCH  │
    │  (0.x lines)  │       │  (1.048596)   │       │  (1.x lines)  │
    └───────────────┘       └───────────────┘       └───────────────┘
            │                       │                       │
    fork() on D-Mail         unique_pid              fork() on save
```

## Le D-Mail comme Fork Trigger

```bash
#!/bin/bash
# d_mail.sh - Time Leap Protocol

send_dmail() {
    local message="$1"
    local timestamp_target="$2"

    # Sauvegarde de l'état actuel (pour Reading Steiner)
    checkpoint_memories > /tmp/okabe_state_$$

    # Fork de la worldline
    if fork_worldline "$timestamp_target"; then
        # Process enfant - nouvelle worldline
        apply_message "$message"
        recalculate_divergence

        # Signaler à Okabe via Reading Steiner
        kill -SIGWORLDLINE $OKABE_PID
    else
        # Process parent - ancienne worldline (devient inactive)
        exit 0  # Cette timeline "meurt"
    fi
}
```

## Reconstruction de la Worldline

Quand un D-Mail est envoyé, le système **reconstruit** toute la worldline:

```python
class WorldlineManager:
    def __init__(self):
        self.active_worldline = None
        self.attractor_field = None

    def fork_worldline(self, divergence_point, modification):
        """
        Fork crée une nouvelle worldline à partir du point de divergence
        """
        # Clone de l'état mondial au point de divergence
        new_worldline = copy.deepcopy(
            self.active_worldline.state_at(divergence_point)
        )

        # Application de la modification (le D-Mail)
        new_worldline.apply(modification)

        # Propagation causale: recalcul de TOUT depuis ce point
        new_worldline.propagate_causality(
            from_time=divergence_point,
            to_time=datetime.now()
        )

        # L'ancienne worldline est garbage collected
        self.active_worldline = new_worldline

        return new_worldline.divergence_value
```

## Le Time Leap vs D-Mail

| Mécanisme | Analogie Système | Effet |
|-----------|------------------|-------|
| D-Mail | `fork()` + message passing | Nouvelle worldline, mémoires perdues |
| Time Leap | `checkpoint/restore` | Même worldline, mémoires préservées |
| Reading Steiner | `SIGCONT` handler | Conscience transférée |

## Time Leap: Checkpoint/Restore

```c
// Time Leap Machine Protocol
struct time_leap_state {
    brain_state_t memories[48_HOURS];  // Limite de 48h
    consciousness_t awareness;
    timestamp_t target_time;
};

int time_leap(struct time_leap_state *state) {
    // 1. Compression des mémoires (48h max)
    compress_memories(state->memories, 48 * HOURS);

    // 2. Pas de fork - même worldline
    // 3. Rembobinage du temps local
    rewind_timeline(state->target_time);

    // 4. Injection des mémoires dans le passé-self
    inject_to_past_self(state);

    return LEAP_SUCCESS;
}
```

## Attractor Field: Le Scheduler Cosmique

L'Attractor Field agit comme un **process scheduler** qui force les worldlines vers des états de convergence:

```
┌─────────────────────────────────────────────────────────┐
│              ATTRACTOR FIELD SCHEDULER                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  convergence_points = [                                  │
│      {event: "mayuri_death", attractor: "alpha"},        │
│      {event: "kurisu_death", attractor: "beta"},         │
│      {event: "ww3_start", attractor: "beta"}             │
│  ]                                                       │
│                                                          │
│  for each worldline in active_worldlines:                │
│      if worldline.divergence in alpha_range:             │
│          schedule(worldline, convergence="mayuri_death") │
│      elif worldline.divergence in beta_range:            │
│          schedule(worldline, convergence="ww3_start")    │
│                                                          │
│  # Le scheduler FORCE la convergence                     │
│  # Peu importe les actions, le résultat converge         │
└─────────────────────────────────────────────────────────┘
```

## Échapper à l'Attractor: Operation Skuld

Pour échapper au scheduler, Okabe doit:

1. **Tromper le système** - faire croire que Kurisu est morte
2. **Modifier les observables** - le sang, le corps visible
3. **Préserver le réel** - Kurisu survit en secret

```bash
# operation_skuld.sh
deceive_attractor_field() {
    # Créer les observables attendus par l'attractor
    fake_death_scene "kurisu" --blood --witness="past_okabe"

    # Mais le processus réel continue
    kurisu_process.state = ALIVE_BUT_HIDDEN

    # L'attractor vérifie seulement les observables
    # Si les conditions de convergence SEMBLENT remplies,
    # il libère la worldline
}
```

## Leçon Système: Déterminisme et Liberté

Les worldlines enseignent que:

1. **Fork n'est pas liberté** - chaque branche a ses propres contraintes
2. **Le scheduler domine** - les convergences sont inévitables sans ruse
3. **Tromper > Combattre** - on n'échappe pas à l'attractor, on le dupe
4. **La mémoire transcende** - seul le Reading Steiner permet la continuité

> "There is no end. There is no beginning. There is only the infinite passion of life."
