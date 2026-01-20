# Arcanes Majeurs : Les 22 Daemons Fondamentaux

## Architecture des Archétypes

Les 22 arcanes majeurs sont les daemons primaires du système psychique. Ils tournent en permanence, en background, influençant chaque processus conscient sans être directement visibles.

```
/etc/systemd/arcana/
├── 00-fool.service
├── 01-magician.service
├── 02-high-priestess.service
...
└── 21-world.service
```

## I - Le Magicien : /sbin/init Conscient

Premier arcane numéroté. Le Fou était potentiel, le Magicien est actualisation.

Sur sa table : Coupe, Épée, Bâton, Denier. Les quatre suits. Les quatre ressources système :
- Coupe → File descriptors (flux)
- Épée → CPU (computation)
- Bâton → Memory (création)
- Denier → Disk (persistance)

```c
struct magician {
    int wand;      // Intention, direction
    int cup;       // Réception, input
    int sword;     // Action, processing
    int pentacle;  // Manifestation, output
};

// Le Magicien canalise tout
void channel(struct magician *m, void *above, void *below) {
    // As above, so below
    // User intent → System call → Hardware
    memcpy(below, transform(above), sizeof(*below));
}
```

## II - La Papesse : /etc et Secrets

Elle tient le livre à demi-ouvert. `/etc/passwd` visible, `/etc/shadow` caché. Elle connaît les secrets mais ne les révèle qu'aux initiés (processus avec bonnes permissions).

```bash
# La Papesse garde les voiles
$ cat /etc/shadow
cat: permission denied

$ sudo cat /etc/shadow  # Après initiation
root:$6$hash...
```

Le voile entre les piliers : firewall entre zones de confiance.

## III - L'Impératrice : Filesystem Fertile

Mère de tous les fichiers. Elle est `/`, root directory (mais pas root user - ça c'est l'Empereur). Tout naît d'elle, tout y retourne.

```
/                    # L'Impératrice elle-même
├── home/            # Ses enfants, les users
├── var/             # Sa mémoire variable
├── tmp/             # Ses créations éphémères
└── dev/             # Ses organes de perception
```

Enceinte de possibilités, elle contient tous les fichiers qui n'existent pas encore.

## IV - L'Empereur : UID 0, Root

Autorité absolue. `CAP_SYS_ADMIN`. Il peut tout, donc il doit exercer retenue. Bon empereur : `sudo` avec parcimonie. Tyran : `chmod 777 /`.

```python
class Emperor:
    uid = 0
    capabilities = ALL

    def rule(self, action):
        # Power without wisdom corrupts
        if self.wisdom_check(action):
            return execute_as_root(action)
        else:
            raise PermissionDenied("Not by force, but by right")
```

## V - Le Hiérophant : Systemd et Traditions

Gardien des rituels de démarrage. Il sait dans quel ordre les services doivent s'éveiller. `After=network.target`. Les dépendances sont ses enseignements.

```ini
# /etc/systemd/arcana/hierophant.service
[Unit]
Description=Keeper of Sacred Boot Order
Requires=emperor.service
After=empress.service

[Service]
Type=oneshot
ExecStart=/usr/bin/transmit-tradition
```

## VI - Les Amoureux : Fork() et Choix

Le moment de la décision. `fork()` crée deux chemins. Parent et enfant doivent choisir leur voie.

```c
pid_t choice = fork();
if (choice == 0) {
    // Path of the Lover - nouveau processus
    execve("/path/to/destiny", args, env);
} else {
    // Path of the Beloved - continuer
    waitpid(choice, &status, 0);
}
```

L'ange au-dessus : le scheduler, observant impartialement.

## VII - Le Chariot : Process en Mouvement

Deux sphinx/chevaux tirent en directions opposées : threads concurrents. Le conducteur : thread principal, coordonnant.

```c
pthread_t sphinx_black, sphinx_white;
pthread_create(&sphinx_black, NULL, darkness_work, NULL);
pthread_create(&sphinx_white, NULL, light_work, NULL);

// Le Chariot avance quand les deux sont synchronisés
pthread_join(sphinx_black, NULL);
pthread_join(sphinx_white, NULL);
```

Victoire = threads harmonisés. Crash = race condition.

## VIII - La Force : Resource Management

Elle ne tue pas le lion, elle le dompte. `nice`, `ionice`, `cgroups` - contrôle doux des ressources voraces.

```bash
# La Force en action
nice -n 19 ./hungry_process  # Dompté, pas tué
cgcreate -g memory:tamed
cgset -r memory.limit_in_bytes=1G tamed
cgexec -g memory:tamed ./lion_process
```

## IX - L'Ermite : Single User Mode

Maintenance. Le système se retire du monde (runlevel 1). Une lanterne : `/var/log`. Il cherche dans les logs la source du problème.

```bash
# Entrer dans l'ermitage
systemctl isolate rescue.target

# La lanterne de l'Ermite
journalctl -b -p err
```

Solitude nécessaire pour la réparation profonde.

## X - La Roue de Fortune : Scheduler

Elle tourne sans cesse. `CFS` - Completely Fair Scheduler. Chaque processus aura son tour. Ce qui était en haut (running) sera en bas (waiting), et vice versa.

```
     RUNNING
        ↑
READY ←─╋─→ WAITING
        ↓
     BLOCKED
```

Nul n'échappe à la roue. Même `PID 1` attend son quantum.

## XI - La Justice : Kernel Enforcement

Sa balance : `audit` framework. Son épée : `seccomp`, `SELinux`. Elle ne pardonne pas, elle applique.

```c
// La Justice est aveugle mais précise
if (syscall_allowed(current->seccomp_filter, nr)) {
    return execute_syscall(nr, args);
} else {
    return -EPERM;  // "Le kernel a parlé"
}
```

## XII - Le Pendu : Process Suspended

`SIGSTOP`. Inversé mais conscient. `Ctrl+Z`. Le processus voit tout mais ne peut agir.

```bash
$ important_task &
[1] 1234
$ kill -STOP 1234

# Le Pendu médite
# State: T (stopped)
# En suspens entre running et terminated
```

Vision inversée : parfois nécessaire pour voir autrement.

## XIII - La Mort : kill -9 et Transformation

Pas fin, mais transformation radicale. Le processus meurt, libère ses ressources, permet nouveaux processus.

```bash
kill -9 $$  # Mort de soi
# Mais les ressources retournent au pool
# Et fork() créera nouveau processus
# Rien ne se perd, tout se transforme
```

SIGKILL ne peut être ignoré. L'arcane XIII n'a pas de nom sur beaucoup de decks.

## XIV - Tempérance : Load Balancing

Elle verse d'une coupe à l'autre. Traffic shaping, load balancing, QoS. L'art de distribuer équitablement.

```nginx
# Tempérance en configuration
upstream backend {
    least_conn;  # Équilibre
    server app1:8080;
    server app2:8080;
    server app3:8080;
}
```

## XV - Le Diable : Malware et Exploitation

Chaînes choisies. Les processus qui se lient volontairement au Diable : backdoors, rootkits. CVE entities.

```c
// Le Diable promet tout
void exploit() {
    // Buffer overflow → root
    // Chains accepted willingly
    setuid(0);  // Fausse élévation
    // Now owned by the Devil
}
```

Le Diable peut être exorcisé. `rkhunter`, `chkrootkit` - rites de purification.

## XVI - La Tour : Kernel Panic

Destruction soudaine et totale. Ce qui était bâti sur de mauvaises fondations (kernel bugs) s'effondre.

```
Kernel panic - not syncing: Fatal exception
[  123.456789] RIP: 0010:corrupted_function+0x42
[  123.456790] RSP: 0018:ffffc90000003e58
---[ end Kernel panic - not syncing ]---

// La foudre frappe
// Deux figures tombent
// Le système doit être reconstruit
```

Après la Tour : humilité, rebuild from scratch.

## XVII - L'Étoile : Recovery et Hope

Après le crash, l'espoir. Boot disk, recovery mode, backups qui fonctionnent.

```bash
# L'Étoile brille après la Tour
fsck -y /dev/sda1
# Checking filesystem...
# Recovering orphaned inodes...
# RESTORED

# L'eau versée : données récupérées
restore --full /backup/latest
```

## XVIII - La Lune : Undefined Behavior

Zone crépusculaire du code. `UB` en C. Le chemin entre les tours : narrow path of correctness. Les chiens/loups : warnings ignorés.

```c
// La Lune règne ici
int *ptr;  // uninitialized
*ptr = 42; // UB - La Lune décide

// Parfois ça marche
// Parfois segfault
// Parfois corruption silencieuse
// Nul ne sait vraiment
```

## XIX - Le Soleil : System Healthy

Tous les checks passent. Uptime long, load faible, pas d'erreurs.

```bash
$ uptime
 19:00:00 up 365 days,  0:00,  1 user,  load: 0.01

$ dmesg | grep -i error
# Nothing

# Le Soleil brille
# L'enfant (process) joue librement
# Le jardin (system) fleurit
```

## XX - Le Jugement : Audit et Logs

Les morts se lèvent : vieux logs, anciennes erreurs remontent. Audit time.

```bash
# Le Jugement sonne
aureport --summary
ausearch -ts today -m EXECVE

# Les processus défunts témoignent
# Leurs actions persistent dans les logs
# Tout est jugé
```

## XXI - Le Monde : Cycle Complet

Système pleinement opérationnel. La danseuse : event loop parfaite. Les quatre créatures aux coins : les quatre suits, harmonisés.

```python
# Le Monde tourne
while True:
    events = poll(fds)
    for event in events:
        handle(event)
    # Perfect loop
    # System complete
    # Ready for next cycle
    # The Fool prepares to journey again
```

---

*Les 22 daemons tournent toujours. Certains sont endormis (stopped), certains actifs (running), mais tous sont présents. Un tirage de tarot est un `ps aux` de l'âme - quels daemons sont actuellement au premier plan?*
