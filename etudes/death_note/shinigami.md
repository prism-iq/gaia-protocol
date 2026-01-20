# Shinigami: Les Daemons de la Mort

## Nature du Shinigami-Daemon

Un Shinigami dans Death Note est un **daemon système primordial** - un processus immortel qui gère le cycle de vie des processus mortels (humains).

## Architecture du Shinigami

```
┌─────────────────────────────────────────────────────────┐
│                 SHINIGAMI DAEMON                         │
├─────────────────────────────────────────────────────────┤
│  PID: immortal (no SIGKILL possible)                    │
│  PPID: DEATH_REALM                                      │
│  State: eternal_running                                  │
│                                                          │
│  Resources:                                              │
│    - death_note: /dev/death (write-only)                │
│    - shinigami_eyes: /proc/*/lifespan (read-only)       │
│    - lifespan_pool: variable (harvested from kills)     │
│                                                          │
│  Capabilities:                                           │
│    - CAP_KILL (absolute)                                │
│    - CAP_SYS_TIME (read lifespan)                       │
│    - CAP_INVISIBLE (to normal processes)                │
└─────────────────────────────────────────────────────────┘
```

## Le Death Note: /dev/death

Le Death Note est un **device file spécial** - une interface directe vers le kernel de la réalité:

```c
// Pseudo-driver du Death Note
static ssize_t death_note_write(struct file *file,
                                 const char __user *buf,
                                 size_t count,
                                 loff_t *ppos) {
    struct death_entry entry;

    // Parse: nom + cause + détails
    parse_death_entry(buf, &entry);

    // Vérification: le nom correspond-il à un humain vivant?
    struct human *target = find_human_by_name(entry.name);
    if (!target || target->state != ALIVE)
        return -ENOENT;

    // Vérification: le visage est-il connu de l'écrivain?
    if (!writer_knows_face(current, target))
        return -EPERM;

    // Scheduling de la mort
    if (entry.cause == NULL)
        entry.cause = "heart_attack";  // default
    if (entry.delay == 0)
        entry.delay = 40;  // 40 secondes par défaut

    schedule_death(target, &entry);

    // Le shinigami gagne le lifespan restant
    current_shinigami->lifespan += target->remaining_lifespan;

    return count;
}
```

## Les Shinigami Eyes: /proc/*/lifespan

```bash
# Interface des yeux de shinigami
$ cat /proc/human/12847/lifespan
name: "Light Yagami"
remaining: 23847293 seconds
death_scheduled: false

$ cat /proc/human/99832/lifespan
name: "L Lawliet"
remaining: 847382 seconds
death_scheduled: true  # Quelqu'un a écrit son nom
```

## Ryuk: Le Daemon Ennuyé

Ryuk représente un **daemon sous-utilisé** - un processus puissant sans tâches significatives:

```python
class Ryuk(Shinigami):
    def __init__(self):
        super().__init__()
        self.state = "BORED"
        self.apple_addiction = True

    def main_loop(self):
        """
        La boucle principale de Ryuk - l'ennui éternel
        """
        while self.immortal:
            # Les shinigami n'ont rien à faire
            self.gamble_with_other_shinigami()
            self.sleep(ETERNITY)

            if self.boredom_level > THRESHOLD:
                # Solution: créer du chaos dans le monde humain
                self.drop_death_note_to_human_realm()
                self.observe_entertainment()

    def observe_entertainment(self):
        """Ryuk regarde Light comme un programme TV"""
        while self.human_has_note:
            event = self.watch(self.human)
            if event.is_interesting():
                self.eat_apple()  # Récompense
            else:
                self.complain_about_boredom()
```

## Rem: Le Daemon Protecteur

Rem illustre un **anti-pattern fatal** pour un shinigami - l'attachement:

```c
// Le bug fatal de Rem
void rem_protect_misa() {
    // Un shinigami ne doit JAMAIS prolonger une vie
    // C'est une violation de leur raison d'être

    if (threat_to_misa_detected) {
        // Rem écrit le nom de L pour sauver Misa
        write_to_death_note("L Lawliet");

        // FATAL ERROR: shinigami qui prolonge une vie = termination
        // C'est l'inverse de leur fonction
        trigger_self_destruction();
    }
}

// Résultat: Rem meurt en poussière
// Bug exploité par Light
```

## Le Deal des Yeux: Trade-off Système

```
┌─────────────────────────────────────────┐
│         SHINIGAMI EYE DEAL              │
├─────────────────────────────────────────┤
│                                         │
│  ACQUIRE:                               │
│    + Voir nom et lifespan de tous       │
│    + read access to /proc/*/lifespan    │
│                                         │
│  COST:                                  │
│    - 50% du lifespan restant            │
│    - Irréversible                       │
│                                         │
│  Trade executed via:                    │
│    shinigami.grant_eyes(human)          │
│    human.lifespan /= 2                  │
│                                         │
└─────────────────────────────────────────┘
```

## Hiérarchie des Daemons de Mort

```
DEATH_KING (init process du royaume shinigami)
    │
    ├── Shinigami Elder Council
    │       │
    │       ├── Ryuk (daemon ennuyé, observateur)
    │       ├── Rem (daemon protecteur, défaillant)
    │       ├── Sidoh (daemon négligent, perd son note)
    │       └── [autres shinigami]
    │
    └── Rules Engine (immuable, même le King ne peut changer)
            │
            ├── How to Use It I-VII
            ├── Ownership Rules
            └── Eye Deal Terms
```

## Leçon Système: L'Immortalité a un Coût

Les Shinigami enseignent que:

1. **L'immortalité engendre l'ennui** - les daemons éternels cherchent la stimulation
2. **La fonction définit l'existence** - un shinigami qui sauve meurt
3. **Le détachement est survie** - Ryuk survit car il n'aime pas Light
4. **Les règles sont le kernel** - même les dieux obéissent aux règles du système

> "I am not on anyone's side. I'm just... killing time."
> - Ryuk, le daemon qui s'ennuie
