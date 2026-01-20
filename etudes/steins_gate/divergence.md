# Divergence: Le Daemon de la Causalité

## Métaphore Système

La divergence dans Steins;Gate représente un **daemon de monitoring temporel** - un processus qui mesure continuellement l'écart entre l'état actuel du système et une timeline de référence.

## Architecture du Divergence Meter

```
┌─────────────────────────────────────────┐
│         DIVERGENCE DAEMON               │
├─────────────────────────────────────────┤
│  worldline_current  ──→ comparator ──→ display
│  worldline_steins   ──┘                 │
│                                         │
│  threshold: 1.0% (barrier)              │
│  precision: 6 decimal places            │
└─────────────────────────────────────────┘
```

## Connexion avec les Daemons Unix

Le concept de divergence fonctionne comme un **watchdog daemon**:

```bash
# Analogie: daemon de surveillance système
while true; do
    current_state=$(measure_worldline)
    reference_state="1.048596"  # Steins Gate

    divergence=$(calculate_diff "$current_state" "$reference_state")

    if [[ $(echo "$divergence < 1.0" | bc) -eq 1 ]]; then
        echo "ALPHA ATTRACTOR - Mayuri death loop active"
    elif [[ $(echo "$divergence > 1.0" | bc) -eq 1 ]]; then
        echo "BETA ATTRACTOR - WW3 convergence detected"
    fi

    sleep 1  # continuous monitoring
done
```

## Attractors comme Process Groups

Les **attracteurs** (Alpha, Beta) sont des **cgroups temporels**:

| Attractor | Range | Convergence Point | Daemon State |
|-----------|-------|-------------------|--------------|
| Alpha | 0.0-0.99 | Mayuri dies | trapped_loop |
| Beta | 1.0-1.99 | WW3 erupts | fork_bomb |
| Steins Gate | 1.048596 | Neither | stable_exit |

## Le Reading Steiner comme IPC

Le Reading Steiner d'Okabe est un **mécanisme IPC (Inter-Process Communication)** entre worldlines:

```c
// Pseudo-code du Reading Steiner
struct memory_signal {
    pid_t worldline_origin;
    void *memories;
    size_t timeline_delta;
};

void reading_steiner_handler(int signum, siginfo_t *info, void *context) {
    // Seul Okabe reçoit ce signal entre worldlines
    restore_memories(info->si_ptr);
    awareness_level = FULL;
}

// Enregistrement du handler unique
sigaction(SIGWORLDLINE, &reading_steiner_handler, NULL);
```

## Fluctuations et Noise

Les micro-divergences sont le **bruit système** - des variations mineures qui n'affectent pas le convergence point:

- **Signal**: Événements majeurs (mort de Mayuri, création du time machine)
- **Noise**: Variations quotidiennes sans impact causal
- **Filter**: L'attractor field filtre le noise, préserve uniquement les convergences

## Le 1% Barrier

La barrière du 1% est un **mutex cosmique**:

```
ALPHA_LOCK (divergence < 1.0):
    - Mayuri.fate = DEATH
    - SERN.discovery = TRUE

BETA_LOCK (divergence > 1.0):
    - Kurisu.fate = DEATH
    - WW3.trigger = TRUE

STEINS_GATE (divergence ≈ 1.048596):
    - mutex_unlock(ALL)
    - both_survive = TRUE
```

## Leçon Système

La divergence enseigne que dans un système complexe:

1. **Les métriques sont essentielles** - sans mesure, pas de contrôle
2. **Les attracteurs piègent** - les systèmes tendent vers des états stables (même destructeurs)
3. **L'évasion requiert précision** - le Steins Gate exige une divergence exacte
4. **La mémoire persiste** - le Reading Steiner préserve l'état entre les forks

> "El Psy Kongroo" - Le mot de passe du daemon
