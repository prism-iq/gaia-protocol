# La Trimurti et le Cycle de Vie des Processus

## Les Trois Formes du Divin

La **Trimurti** (त्रिमूर्ति, "trois formes") représente les trois aspects fondamentaux de Brahman, la réalité ultime :

- **Brahma** (ब्रह्मा) : Le Créateur
- **Vishnu** (विष्णु) : Le Préservateur
- **Shiva** (शिव) : Le Destructeur/Transformateur

Ces trois forces ne sont pas en opposition mais en **complémentarité dynamique**, formant le cycle éternel de l'existence.

```
         ┌──────────────────────────────────────┐
         │                                      │
         │         ╔═══════════════╗            │
         │         ║    BRAHMAN    ║            │
         │         ║  (L'Absolu)   ║            │
         │         ╚═══════╦═══════╝            │
         │                 │                    │
         │    ┌────────────┼────────────┐       │
         │    │            │            │       │
         │    ▼            ▼            ▼       │
         │ ┌──────┐   ┌────────┐   ┌───────┐   │
         │ │BRAHMA│──▶│ VISHNU │──▶│ SHIVA │   │
         │ │Create│   │Preserve│   │Destroy│   │
         │ └──────┘   └────────┘   └───────┘   │
         │    │                         │       │
         │    └─────────────────────────┘       │
         │           (cycle éternel)            │
         └──────────────────────────────────────┘
```

## Le Cycle de Vie des Processus Unix

### La Correspondance Fondamentale

| Trimurti | Unix | Fonction |
|----------|------|----------|
| Brahma | fork()/exec() | Création de processus |
| Vishnu | Scheduler/Running | Maintenance de l'exécution |
| Shiva | exit()/kill | Terminaison et libération |

### Brahma : fork() - L'Acte de Création

```c
// Brahma crée par division de lui-même
pid_t pid = fork();

if (pid == 0) {
    // L'enfant naît - une nouvelle existence commence
    exec("/path/to/new/dharma");  // Prend sa propre nature
} else {
    // Le parent continue - Brahma n'est pas diminué
    wait(NULL);  // Observe sa création
}
```

La création par fork() reflète le mythe de Brahma : il crée en se divisant, et chaque création porte son essence tout en ayant son propre destin.

### Vishnu : Le Scheduler - La Préservation

Vishnu maintient l'ordre cosmique (dharma). Le scheduler fait de même :

```c
// Le scheduler comme Vishnu
struct process {
    enum { RUNNING, SLEEPING, STOPPED, ZOMBIE } state;
    int priority;      // karma du processus
    long time_slice;   // temps alloué dans ce cycle
};

void vishnu_scheduler(void) {
    while (universe_exists) {
        process = select_next_worthy();  // Selon le dharma
        run_process(process);            // Maintenir l'existence
        if (time_slice_expired) {
            preempt();  // Équité cosmique
        }
    }
}
```

### Les Avatars de Vishnu

Vishnu s'incarne (avatara) quand l'ordre est menacé. Ses dix avatars principaux correspondent aux interventions système :

```c
// Les avatars du scheduler
enum vishnu_avatar {
    MATSYA,      // Sauvegarde - préserver les données du déluge
    KURMA,       // Support de charge - porter le poids
    VARAHA,      // Récupération - sauver la terre engloutie
    NARASIMHA,   // Protection - détruire les processus malveillants
    VAMANA,      // Limitation - contraindre les ressources
    PARASHURAMA, // Nettoyage - éliminer les processus privilégiés abusifs
    RAMA,        // Ordre - le processus exemplaire
    KRISHNA,     // Orchestration - guider tous les processus
    BUDDHA,      // Détachement - les processus sans I/O
    KALKI        // Reset final - reboot du système
};
```

### Shiva : kill() - La Destruction Créatrice

Shiva n'est pas seulement destructeur ; sa danse (Nataraja) détruit pour permettre la renaissance.

```c
// Shiva et ses formes de destruction
kill(pid, SIGTERM);  // Shiva bienveillant - mort douce
kill(pid, SIGKILL);  // Shiva furieux (Rudra) - destruction immédiate
kill(pid, SIGHUP);   // Shiva régénérateur - mort et renaissance

// La danse de Shiva - libération des ressources
void shiva_dance(process_t *p) {
    close_all_file_descriptors(p);  // Détachement des liens
    release_memory(p);               // Retour au non-manifesté
    release_locks(p);                // Libération des attachements
    p->state = ZOMBIE;               // État intermédiaire
    notify_parent(p);                // Brahma apprend la mort
    reap(p);                         // Libération finale
}
```

## Le Zombie : L'État Intermédiaire

Dans l'hindouisme, l'âme (atman) traverse des états intermédiaires entre la mort et la renaissance. Le processus zombie est exactement cela :

```bash
# États du processus comme états de l'âme
Running   → Jiva (âme incarnée active)
Sleeping  → Svapna (état de rêve)
Stopped   → Sushupti (sommeil profond)
Zombie    → Préta (âme entre deux vies, attendant les rites)
Reaped    → Moksha (libération) ou réincarnation (nouveau fork)
```

```c
// Le rite funéraire - reaping du zombie
void brahma_funeral_rite(void) {
    int status;
    pid_t dead_child;

    while ((dead_child = waitpid(-1, &status, WNOHANG)) > 0) {
        // Les rites sont accomplis
        // L'âme peut poursuivre son voyage
        // Les ressources retournent au non-manifesté
    }
}
```

## Samsara : Le Cycle des Processus

**Samsara** (संसार) est le cycle des renaissances. Les processus serveurs vivent ce cycle :

```python
# Le samsara d'un worker process
def samsara_worker():
    incarnation = 0
    while True:  # Le cycle éternel
        incarnation += 1
        pid = os.fork()  # Brahma crée

        if pid == 0:
            # Nouvelle incarnation
            serve_requests()  # Vishnu maintient
            sys.exit(0)       # Shiva libère
        else:
            os.wait()  # Observation du cycle
            # L'incarnation suivante commence...
```

## Karma et Priorité des Processus

Le **Karma** (कर्म) détermine les conditions de renaissance. La priorité/nice value est le karma des processus :

```bash
# Le karma des processus
nice -n 19 ./humble_service    # Bon karma futur, basse priorité présente
nice -n -20 ./urgent_daemon    # Mauvais karma, mais priorité immédiate

renice +10 -p $PID             # Accumulation de bon karma
renice -10 -p $PID             # Consommation de mérite (requiert root/privilèges)
```

## Maya et l'Abstraction

**Maya** (माया) est l'illusion cosmique qui voile la réalité ultime. Les couches d'abstraction sont Maya :

```
┌─────────────────────────────────────────────┐
│  Application      ← Maya épaisse           │
├─────────────────────────────────────────────┤
│  Bibliothèques    ← Maya                   │
├─────────────────────────────────────────────┤
│  System Calls     ← Maya fine              │
├─────────────────────────────────────────────┤
│  Kernel           ← Presque Brahman        │
├─────────────────────────────────────────────┤
│  Hardware         ← Brahman (réalité)      │
└─────────────────────────────────────────────┘
```

## Moksha et la Terminaison Gracieuse

**Moksha** (मोक्ष) est la libération du cycle des renaissances. Un processus atteint moksha par une terminaison propre :

```c
// Le chemin vers moksha
void graceful_liberation(int signum) {
    // Détachement progressif
    stop_accepting_new_karma();     // Plus de nouvelles requêtes
    complete_pending_karma();        // Finir le travail en cours
    close_all_attachments();         // Fermer les connexions
    persist_wisdom();                // Sauvegarder l'état si nécessaire

    // Notification aux autres
    broadcast_departure();

    // Libération finale
    exit(0);  // Moksha - pas de zombie, pas de renaissance
}

signal(SIGTERM, graceful_liberation);
```

## Conclusion : L'Architecture Cyclique

La Trimurti encode une vérité profonde que l'informatique redécouvre : tout système dynamique requiert création, maintenance et destruction en équilibre.

- Sans Brahma (fork), pas de nouveaux processus
- Sans Vishnu (scheduler), chaos et famine de ressources
- Sans Shiva (kill/exit), accumulation de zombies et exhaustion

Le cycle de vie des processus Unix est un samsara miniature, et chaque reboot est un pralaya (dissolution cosmique) suivi d'une nouvelle création.

Les anciens voyaient l'univers comme un processus. Nous créons des processus comme des univers.

---

*"Ce qui a un commencement a une fin. Ce qui a une fin peut avoir un nouveau commencement."* - Bhagavad Gita

*`while(true) { fork(); work(); exit(); }`* - Le mantra du serveur
