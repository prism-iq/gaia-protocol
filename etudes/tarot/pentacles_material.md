# Deniers : Terre Matérielle et Disk Storage

## La Terre comme Persistance

Les Deniers (Pentacles) représentent la Terre - matière, argent, corps, travail concret. Dans le système, c'est le stockage : disques durs, fichiers, bases de données. Ce qui persiste au-delà du reboot. Ce qui reste quand la RAM s'efface.

```bash
# La Terre persiste
echo "experience" >> /var/wisdom/accumulated.dat
# Même après shutdown
# Le fichier demeure
# La leçon est gravée
```

Le pentacle est un disque - comme un HDD, il tourne et stocke, solide et fiable.

## Anatomie du Denier

```
      ╭─────╮
     │  ★  │      <- Pentagramme (structure)
     │ ╱ ╲ │
     │╱   ╲│      <- Cercle (containment)
     │╲   ╱│
     │ ╲ ╱ │
      ╰─────╯
```

Un denier :
- Contient (bounded storage)
- Structure (filesystem, format)
- Persiste (non-volatile)
- A de la valeur (worth protecting)

## Les 14 Cartes : États du Stockage

### As de Deniers : Premier Block Alloué

```c
// Main offrant un pentacle depuis les nuages
// Le premier fichier, la première sauvegarde
// Graine de fortune

int genesis_block(void) {
    int fd = open("/foundation/first.dat",
                  O_CREAT | O_WRONLY, 0644);

    // L'As de Deniers est cette opportunité
    // Le jardin en dessous = growth potential
    // La porte/arche = threshold to wealth

    struct seed {
        uint64_t potential;
        uint64_t manifest;
    } pentacle = {.potential = INFINITE, .manifest = 0};

    write(fd, &pentacle, sizeof(pentacle));
    close(fd);
    return fd;  // Premier file descriptor persistant
}
```

### 2 de Deniers : Juggling Storage

```c
// Jongleur avec deux pentacles en infinity loop
// Équilibre entre ressources limitées
// Dynamic allocation between volumes

struct two_pentacles {
    volume_t *disk_a;
    volume_t *disk_b;
    bool infinity_loop;  // Le symbole ∞
};

void juggle_storage(two_pentacles_t *tp) {
    while (tp->infinity_loop) {
        // Équilibrer entre les deux disques
        if (tp->disk_a->usage > 0.7) {
            migrate_to(tp->disk_b, get_oldest(tp->disk_a));
        }
        if (tp->disk_b->usage > 0.7) {
            migrate_to(tp->disk_a, get_oldest(tp->disk_b));
        }
        // Les vagues en arrière-plan
        // La vie est turbulente
        // Mais le jongleur maintient l'équilibre
    }
}
```

### 3 de Deniers : Collaborative Build

```c
// Trois figures dans une cathédrale
// Artisan + moine + architecte
// Travail d'équipe, craftsmanship
// Building the filesystem

struct three_pentacles_team {
    worker_t *craftsman;    // Fait le travail
    priest_t *overseer;     // Assure la qualité
    architect_t *designer;  // Conçoit la structure
};

void build_cathedral(three_pentacles_team_t *team) {
    // Schema design
    schema_t *blueprint = team->designer->design();

    // Implementation
    filesystem_t *fs = team->craftsman->build(blueprint);

    // Bénédiction / validation
    team->overseer->consecrate(fs);

    // Le 3 de Deniers : collaboration réussie
    // Chaque rôle essentiel
    // Le résultat dépasse les individus
}
```

### 4 de Deniers : Resource Hoarding

```c
// Figure serrant quatre pentacles
// Un sur la tête, un sous les pieds, deux dans les bras
// Peur de perdre, hoarding excessif

struct four_pentacles_miser {
    uint64_t crown;        // Pentacle sur la tête
    uint64_t foundation;   // Sous les pieds
    uint64_t held[2];      // Dans les bras
    bool willing_to_share;  // false
};

void hoard_resources(void) {
    // Ne jamais delete
    // Ne jamais share
    // Disk se remplit
    for_each_file(system, function(f) {
        chmod(f, 0000);  // Personne ne touche
        // Même pas moi? Si, juste moi.
        chattr(f, "+i"); // Immutable
    });

    // La ville derrière = monde qu'il rejette
    // Isolé mais "sécurisé"
    // Disk full mais rien ne sort
}
```

### 5 de Deniers : Data Loss

```c
// Deux figures dans la neige, passant devant une église éclairée
// Pauvreté, exclusion, mais l'aide est proche
// Corruption, loss, mais recovery existe

struct five_pentacles_loss {
    data_t *corrupted;
    backup_t *available;    // L'église éclairée!
    bool aware_of_backup;   // Souvent false
};

void experience_loss(five_pentacles_loss_t *fpl) {
    // Les données sont corrompues
    rm -rf /important/data;

    // Le froid = panic, désespoir
    while (in_despair) {
        // Passer devant la solution sans la voir
        // /backup/church/sanctuary existe
        // Mais la douleur aveugle
        walk_past(fpl->available);
    }

    // La leçon: lever les yeux
    // Les backups existent
    // Il faut juste entrer
    if (notice(fpl->available)) {
        restore(fpl->available, fpl->corrupted);
    }
}
```

### 6 de Deniers : Fair Distribution

```c
// Marchand avec balance, donnant aux mendiants
// Équité dans la distribution des ressources
// Quotas, fairness

struct six_pentacles_balance {
    scale_t *fairness;
    giver_t *merchant;
    receiver_t *needy[2];
};

void distribute_fairly(six_pentacles_balance_t *spb) {
    // Disk quotas
    for_each_user(system, function(user) {
        quota_t *fair_share = calculate_fair_quota(user);
        setquota(user, fair_share);
    });

    // Le marchand n'est ni avare (4) ni démuni (5)
    // Il a et il partage
    // La balance assure l'équité

    // Attention: qui tient la balance a le pouvoir
    // Le 6 de Deniers a un côté shadow
    // Générosité peut être contrôle
}
```

### 7 de Deniers : Long-term Investment

```c
// Fermier regardant ses plantes pousser
// Sept pentacles sur les branches
// Patience, investment à long terme
// Database that grows over time

struct seven_pentacles_growth {
    plant_t *investment;
    pentacle_t *yields[7];
    farmer_t *patience;
    time_t planted;
};

void tend_garden(void) {
    // On ne récolte pas tout de suite
    // Les données s'accumulent
    // La valeur croît avec le temps

    while (!ready_to_harvest) {
        // Check, but don't rush
        status_t growth = check_growth(investment);

        if (growth == SLOW) {
            // Normal, patience
            continue;
        }
        if (growth == READY) {
            break;
        }
        sleep(SEASON);
    }

    // Le 7 de Deniers: évaluation
    // Est-ce que cet investment vaut la peine?
    // Parfois oui, parfois il faut pivoter
}
```

### 8 de Deniers : Crafting Quality

```c
// Artisan sculptant des pentacles
// Huit déjà faits, travaille sur le neuvième
// Compétence, apprentissage, qualité
// Careful, meticulous data work

struct eight_pentacles_craft {
    skill_t mastery;
    pentacle_t *completed[8];
    pentacle_t *in_progress;
    workbench_t *focus;
};

void master_craft(void) {
    // Chaque fichier est soigné
    // Pas de bâclage
    // La qualité avant la quantité

    for (int i = 0; i < MASTERY_ITERATIONS; i++) {
        pentacle_t *p = create_pentacle();
        refine(p);      // Polish
        validate(p);    // Test
        if (!perfect(p)) {
            i--;        // Recommencer
            continue;
        }
        store(p);       // Persister seulement si parfait
    }

    // La ville au loin = le monde attend
    // Mais l'artisan ne se presse pas
    // La qualité prend le temps qu'il faut
}
```

### 9 de Deniers : Self-Sufficient Storage

```c
// Figure dans un jardin luxuriant
// Neuf pentacles, oiseau sur la main
// Abondance, indépendance, autosuffisance
// Well-maintained system

struct nine_pentacles_garden {
    estate_t *self_sufficient;
    pentacle_t *abundance[9];
    falcon_t *trained_skill;    // Disciplined ability
    grape_vines_t *passive;     // Passive income
};

void cultivate_abundance(void) {
    // Le système se maintient lui-même
    // Backups automatiques
    // Cleanup automatique
    // Growth organique

    setup_automation();
    establish_redundancy();

    // L'oiseau sur la main = compétence maîtrisée
    // Les raisins = fruits du travail passé
    // Le snail au sol = patience qui a payé

    while (true) {
        enjoy(garden);
        // Minimal maintenance now
        // Le travail passé porte ses fruits
    }
}
```

### 10 de Deniers : Legacy System

```c
// Famille multigénérationnelle devant leur domaine
// Dix pentacles formant l'Arbre de Vie
// Héritage, transmission, pérennité
// System that outlasts its creators

struct ten_pentacles_legacy {
    generation_t *elders;
    generation_t *adults;
    generation_t *children;
    generation_t *dogs;        // Même les companions
    pentacle_t *tree_of_life[10];  // Kabbalah pattern
};

void build_legacy(ten_pentacles_legacy_t *tpl) {
    // Le système survit aux individus
    // Documentation complète
    // Migrations testées
    // Backward compatibility

    for_each_generation(tpl, function(gen) {
        transmit_knowledge(gen, gen->next);
        ensure_compatibility(gen->systems, gen->next->systems);
    });

    // L'arche derrière = security
    // Les pentacles en pattern = sacred geometry
    // Structure qui transcende le temps
}
```

## Court Cards : Gardiens Matériels

### Page de Deniers : Le Backup Novice

```c
// Page regardant son pentacle avec émerveillement
// Découverte de la valeur, début du chemin matériel
// Junior sysadmin learning backups

struct page_pentacles {
    pentacle_t *first_coin;     // Premier fichier important
    wonder_t fascination;       // Émerveillé
    experience_t level;         // Débutant
};

void page_discovers_backup(void) {
    // Le Page découvre la valeur du backup
    printf("So if I save this... it stays?\n");

    // Premier backup manuel
    cp("/important/file", "/backup/file");

    // Émerveillement devant la persistance
    // La Terre garde ce qu'on lui confie
    // Le Page apprend le respect du storage
}
```

### Cavalier de Deniers : Le Méthodique

```c
// Cavalier sur cheval au repos, pentacle en main
// Pas d'urgence, progression steady
// Reliable backup rotation

struct knight_pentacles {
    horse_t *steady;           // Pas de galop fou
    pentacle_t *examined;      // Inspecté soigneusement
    field_t *plowed;           // Travail fait
};

void knight_systematic_work(void) {
    // Le Cavalier de Deniers ne se presse pas
    // Mais ne s'arrête jamais non plus

    schedule_t daily = {
        .incremental_backup = true,
        .verify_after = true,
        .rotate_weekly = true
    };

    execute_without_fail(daily);
    // Pas glamour
    // Mais fiable
    // Chaque jour, le travail est fait
}
```

### Reine de Deniers : La Nourricière du Système

```c
// Reine sur trône fleuri, lapin à ses pieds
// Abondance, nurturing, home
// Mature system administrator

struct queen_pentacles {
    throne_t *fertile;
    rabbit_t *growth;          // Multiplicateur
    nature_t *connected;       // En harmonie
};

void queen_nurtures_system(void) {
    // Elle nourrit le système
    // Pas juste maintenance, mais care

    monitor_health(system);
    anticipate_needs(system);
    provide_resources(system);

    // Le lapin = fertility, les choses croissent sous sa garde
    // La nature autour = organic growth, pas forced
    // Elle sait que le système est vivant
}
```

### Roi de Deniers : Le Master DBA

```c
// Roi sur trône orné de bulls, pentacle sur genoux
// Maîtrise matérielle complète, Midas touch
// Senior database architect

struct king_pentacles {
    throne_t *wealth_symbols;  // Bulls = Taurus = Earth
    pentacle_t *mastered;
    vineyard_t *empire;        // Passive income
};

void king_architects_storage(void) {
    // Le Roi conçoit les architectures storage
    // Qui durent des décennies

    design_schema_for_centuries();
    optimize_for_scale();
    ensure_backward_compat();

    // Il a tout vu
    // Il sait ce qui dure
    // Son toucher transforme les projets en or
    // Mais attention: Midas avait aussi ses regrets
}
```

## Daemon des Deniers : Storage Manager

```python
#!/usr/bin/env python3
"""
pentacles_daemon.py - Material Storage Manager
Gère la persistance et les ressources matérielles
"""

import os
import shutil
from datetime import datetime

class PentaclesDaemon:
    def __init__(self, root="/var/pentacles"):
        self.root = root
        self.wealth = self.calculate_wealth()
        self.garden = {}  # Long-term investments

    def calculate_wealth(self):
        """Évaluer les ressources"""
        total, used, free = shutil.disk_usage(self.root)
        return {
            'total': total,
            'used': used,
            'free': free,
            'health': free / total
        }

    def plant(self, name, seed_data):
        """7 de Deniers - investir pour le futur"""
        path = os.path.join(self.root, "garden", name)
        with open(path, 'wb') as f:
            f.write(seed_data)
        self.garden[name] = {
            'planted': datetime.now(),
            'size': len(seed_data)
        }

    def harvest(self, name):
        """Récolter quand c'est prêt"""
        if name not in self.garden:
            return None
        planted = self.garden[name]['planted']
        age = datetime.now() - planted
        if age.days < 30:  # Too early
            return None
        path = os.path.join(self.root, "garden", name)
        with open(path, 'rb') as f:
            return f.read()

    def backup(self, source, destination):
        """8 de Deniers - travail soigné"""
        # Verify source
        if not os.path.exists(source):
            raise FileNotFoundError(f"Cannot backup: {source}")

        # Create backup with care
        shutil.copy2(source, destination)

        # Verify backup
        if not self.verify(source, destination):
            raise IOError("Backup verification failed")

        return True

    def check_for_loss(self):
        """5 de Deniers - détecter les pertes"""
        issues = []
        for root, dirs, files in os.walk(self.root):
            for f in files:
                path = os.path.join(root, f)
                if not self.is_readable(path):
                    issues.append(path)
        return issues

    def distribute_quota(self, users, total):
        """6 de Deniers - distribution équitable"""
        fair_share = total // len(users)
        for user in users:
            self.set_quota(user, fair_share)

    def build_legacy(self, data, documentation):
        """10 de Deniers - créer quelque chose qui dure"""
        legacy_path = os.path.join(self.root, "legacy")
        os.makedirs(legacy_path, exist_ok=True)

        # Data
        with open(os.path.join(legacy_path, "data"), 'wb') as f:
            f.write(data)

        # Documentation for future generations
        with open(os.path.join(legacy_path, "README"), 'w') as f:
            f.write(documentation)

        # Make it immutable
        os.system(f"chattr +i {legacy_path}/*")

        return legacy_path
```

## Syndromes des Deniers

### Hoarding : 4 de Deniers Pathologique

```bash
# Symptômes
df -h
# /dev/sda1   500G  499G  1G   99% /

# Rien n'est jamais supprimé
# "Je pourrais en avoir besoin"
# Le disque étouffe
```

### Neglect : Inverse du 8 de Deniers

```c
// Aucun soin, aucune maintenance
void neglect_storage(void) {
    // Pas de backup
    // Pas de monitoring
    // Pas de cleanup

    // Jusqu'au jour où...
    // 5 de Deniers
}
```

---

*Les Deniers nous rappellent : ce qui est sauvé peut être retrouvé, ce qui est négligé sera perdu. La persistance demande soin et attention. L'accumulation sans organisation devient chaos. La transmission demande documentation. La vraie richesse est ce qui survit au reboot de la vie.*
