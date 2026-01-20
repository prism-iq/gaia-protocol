# L'Autre Monde Celtique et les Couches Système

## Les Royaumes Celtiques

La cosmologie celtique ne divise pas le monde en haut/bas comme les traditions méditerranéennes, mais en **ici/ailleurs**. L'Autre Monde (Annwn en gallois, Tír na nÓg en irlandais, Sid en gaélique) coexiste avec notre monde, accessible par des passages spécifiques.

### Caractéristiques de l'Autre Monde

- **Coexistence spatiale** : L'Autre Monde n'est pas "au-dessus" ou "en-dessous", mais *à côté*
- **Temps différent** : Une heure là-bas peut être un an ici (ou l'inverse)
- **Passages liminaux** : Tertres, brumes, crépuscules, Samhain
- **Entités distinctes** : Les Tuatha Dé Danann, les Sidhe

## Correspondance avec l'Architecture en Couches

### User Space et Kernel Space

L'architecture système moderne reflète cette dualité :

```
┌───────────────────────────────────────────────┐
│                                               │
│   ┌─────────────────────────────────────┐     │
│   │         USER SPACE                  │     │
│   │     (Le Monde des Mortels)          │     │
│   │                                     │     │
│   │  Applications, utilisateurs,        │     │
│   │  la vie quotidienne numérique       │     │
│   └──────────────────┬──────────────────┘     │
│                      │                        │
│            ══════════╪══════════              │
│            System Call Interface              │
│               (Les Passages)                  │
│            ══════════╪══════════              │
│                      │                        │
│   ┌──────────────────▼──────────────────┐     │
│   │         KERNEL SPACE                │     │
│   │     (L'Autre Monde / Annwn)         │     │
│   │                                     │     │
│   │  Drivers, scheduler, mémoire,       │     │
│   │  les mystères du système            │     │
│   └─────────────────────────────────────┘     │
│                                               │
└───────────────────────────────────────────────┘
```

### Les Sidhe et les Processus Kernel

Les Tuatha Dé Danann se retirèrent dans les tertres (sidhe) pour devenir les "gens des collines". De même, les processus kernel :

```bash
# Les habitants de l'Autre Monde
ps aux | grep '\[.*\]'
# [kthreadd]    - Parent des threads kernel (roi des Sidhe)
# [ksoftirqd]   - Les messagers entre mondes
# [kworker]     - Les artisans invisibles
# [migration]   - Les guides entre les CPUs

# Ils n'ont pas de binaire visible, pas de /proc/pid/exe
# Comme les Sidhe, ils sont "de l'autre côté"
```

## Les Passages vers l'Autre Monde

### Les Tertres (Sidhe) et les Points d'Entrée

En mythologie celtique, certains lieux permettent le passage : les tertres, les sources, les carrefours. En informatique :

```c
// Les passages vers le kernel (Autre Monde)
syscall(SYS_write, fd, buf, count);  // Invocation formelle
ioctl(fd, request, argp);            // Rituels spécifiques par device
mmap(NULL, size, prot, flags, fd, 0); // Partage de mémoire entre mondes
```

### Le Temps Liminal : Samhain et les Race Conditions

Samhain (31 octobre) est le moment où le voile entre les mondes s'amincit. Les entités peuvent passer dans les deux sens. En informatique, les moments liminaux sont dangereux :

```c
// Samhain informatique : le moment entre vérification et action
if (access(file, W_OK) == 0) {
    // *** LE VOILE EST MINCE ICI ***
    // Une autre entité peut modifier "file"
    // entre access() et open()
    open(file, O_WRONLY);  // TOCTOU - Time of Check to Time of Use
}

// Protection : les atomiques gardent le voile fermé
int fd = open(file, O_WRONLY | O_CREAT | O_EXCL, 0600);
```

## Tír na nÓg : Le Royaume de l'Éternelle Jeunesse

Tír na nÓg est le pays où le temps ne passe pas, où rien ne vieillit. Oisín y passa ce qu'il crut être trois ans, mais trois cents ans avaient passé dans notre monde.

### Les Processus Sans Temps

```c
// Un processus peut entrer dans Tír na nÓg
pause();           // Temps suspendu, attend un signal
sleep(INFINITY);   // Sommeil éternel
select(0, NULL, NULL, NULL, NULL);  // Attente sans fin

// Quand il revient...
// L'horloge système dit combien de temps RÉEL a passé
clock_gettime(CLOCK_REALTIME, &ts);  // Le choc du retour
```

### La Mémoire Swap : L'Exil en Tír na nÓg

```bash
# Les processus exilés dans le swap
# Ils "dorment" dans l'Autre Monde jusqu'à ce qu'on les rappelle

vmstat 1
# Quand swpd augmente : des processus partent vers Tír na nÓg
# Quand si (swap in) > 0 : ils reviennent, désorientés par le temps passé
```

## Les Geasa et les Contraintes Système

Les **geasa** (sing. geas) sont des interdits sacrés imposés aux héros celtiques. Les violer apporte malheur ou mort. Cúchulainn mourut parce qu'il fut forcé de violer ses geasa.

### Les Geasa Informatiques

```c
// Les geasa d'un processus
struct geas {
    char *description;
    int (*check)(process_t *);
};

struct geas process_geasa[] = {
    {"Ne jamais déréférencer NULL", check_null_ptr},
    {"Ne jamais écrire hors des limites", check_bounds},
    {"Ne jamais diviser par zéro", check_division},
    {"Ne jamais utiliser après free", check_use_after_free},
    // Violer ces geasa provoque SIGSEGV, SIGFPE...
    // La mort du processus
};
```

```bash
# ulimit : les geasa imposés par le système
ulimit -n 1024    # "Tu n'ouvriras pas plus de 1024 fichiers"
ulimit -u 512     # "Tu n'engendreras pas plus de 512 processus"
ulimit -v 1048576 # "Tu ne consommeras pas plus d'1Go de mémoire"

# Violer un geas
too_many_files = [open(f"/tmp/f{i}", "w") for i in range(2000)]
# OSError: [Errno 24] Too many open files
# Le héros tombe
```

## La Chasse Sauvage et les Signaux

La Chasse Sauvage (Wild Hunt) est une cavalcade d'esprits qui traverse le ciel, emportant parfois les mortels. On ne peut l'arrêter une fois lancée.

### Les Signaux Comme Cavalcades

```c
// La Chasse Sauvage des signaux
kill(pid, SIGKILL);  // La Chasse ne peut être ignorée
// Le processus sera emporté, qu'il le veuille ou non

// Certaines chasses peuvent être détournées
signal(SIGTERM, gentle_handler);  // Se cacher de la chasse
signal(SIGINT, handler);          // Négocier avec les chasseurs

// Mais SIGKILL et SIGSTOP sont comme la Chasse de Gwyn ap Nudd
// Inévitables, impossibles à bloquer
```

## Les Quatre Trésors et les Ressources Système

Les Tuatha Dé Danann apportèrent quatre trésors magiques en Irlande :

| Trésor | Origine | Ressource Système |
|--------|---------|-------------------|
| Pierre de Fál | Falias | /dev/null - accepte tout, ne crie que pour les rois |
| Épée de Nuada | Findias | CPU - aucune bataille perdue avec elle |
| Lance de Lugh | Gorias | Réseau - frappe à distance, jamais ne manque |
| Chaudron de Dagda | Murias | Mémoire - nourrit tous, personne n'en part insatisfait |

```bash
# Les quatre trésors modernes
cat /proc/cpuinfo     # L'Épée - puissance de calcul
cat /proc/meminfo     # Le Chaudron - abondance de mémoire
ip link show          # La Lance - portée du réseau
ls /dev/null          # La Pierre - le test de légitimité
```

## La Brume et les Namespaces

Les mortels accèdent souvent à l'Autre Monde à travers une brume qui désoriène, transforme l'espace. Les **namespaces** Linux font de même :

```bash
# Créer une brume (namespace) autour d'un processus
unshare --mount --uts --pid --fork /bin/bash
# Le processus voit un autre monde
# Son /proc est différent
# Ses montages sont différents
# Son hostname peut être différent
# Il est "de l'autre côté de la brume"

# Containers : emprisonner dans l'Autre Monde
docker run -it alpine /bin/sh
# Un monde complet, isolé, avec son propre temps (cgroups)
```

## Conclusion : La Liminalité comme Principe Architectural

La cosmologie celtique nous enseigne que les frontières sont des **zones**, pas des lignes. L'interface entre user space et kernel space n'est pas une simple barrière mais une région de transformation où les règles changent.

Les passages existent pour ceux qui connaissent les rituels (syscalls). Le temps peut s'écouler différemment (scheduling, swap). Des geasa protègent et contraignent. Et parfois, la Chasse Sauvage emporte ce qu'elle veut.

L'architecture système moderne est un paysage celtique : notre monde visible coexiste avec un Autre Monde invisible mais puissant, et les interactions entre les deux définissent ce qui est possible.

---

*"Je suis allé dans Annwn, et j'en suis revenu. Le monde avait changé pendant mon absence, mais les trésors que j'ai rapportés sont éternels."*

*`unshare --map-root-user` : Le rituel pour marcher dans l'Autre Monde avec les pouvoirs d'un roi.*
