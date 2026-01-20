# Rules: Le Kernel Immuable de la Mort

## La Constitution du Death Note

Les règles du Death Note forment un **kernel** - un ensemble de lois fondamentales que même les dieux de la mort ne peuvent violer.

## Architecture des Règles

```
┌─────────────────────────────────────────────────────────────┐
│                    DEATH NOTE KERNEL                         │
├─────────────────────────────────────────────────────────────┤
│  Ring 0 (Core Rules - Absolues)                             │
│    ├── La personne dont le nom est écrit meurt              │
│    ├── Le visage doit être connu                            │
│    └── 40 secondes par défaut, crise cardiaque              │
│                                                              │
│  Ring 1 (Cause Rules - Détails)                             │
│    ├── Cause écrite dans 40s après le nom                   │
│    ├── Détails dans 6min 40s après la cause                 │
│    └── Actions physiquement possibles uniquement            │
│                                                              │
│  Ring 2 (Ownership Rules - Possession)                      │
│    ├── Toucher le note = voir le shinigami                  │
│    ├── Abandonner = perte des mémoires                      │
│    └── Transfert de propriété possible                      │
│                                                              │
│  Ring 3 (Meta Rules - Système)                              │
│    ├── Le note ne peut affecter que des humains             │
│    ├── Noms écrits sont irrévocables                        │
│    └── Le shinigami doit suivre le propriétaire             │
└─────────────────────────────────────────────────────────────┘
```

## Les Règles comme Syscalls

Chaque règle est un **syscall** avec des paramètres stricts:

```c
// Syscall: write_name()
int sys_write_name(const char *name, const char *cause,
                   const char *details, int delay) {

    // RULE 1: Nom requis
    if (name == NULL || strlen(name) == 0)
        return -EINVAL;

    // RULE 2: Visage requis (vérifié côté userspace)
    if (!current_user->knows_face(name))
        return -EPERM;

    // RULE 3: Timing
    if (cause != NULL && time_since_name > 40)
        cause = NULL;  // Trop tard, défaut à heart attack

    if (details != NULL && time_since_cause > 400)
        details = NULL;  // Trop tard, ignoré

    // RULE 4: Possibilité physique
    if (!is_physically_possible(cause, details))
        return -ENOTSUP;  // Revient à heart attack

    // Exécution
    schedule_death(find_human(name), cause, details, delay);

    return 0;  // Succès, mort inévitable
}
```

## La Règle des 23 Jours

```
┌─────────────────────────────────────────┐
│         RULE: 23-DAY LIMIT              │
├─────────────────────────────────────────┤
│                                         │
│  Si une cause de mort prend plus de     │
│  23 jours à se réaliser:                │
│                                         │
│  if (death_delay > 23 * DAYS) {         │
│      cause = HEART_ATTACK;              │
│      delay = 40 * SECONDS;              │
│  }                                      │
│                                         │
│  Maximum scheduling window: 23 jours    │
│                                         │
└─────────────────────────────────────────┘
```

## Les Fausses Règles de Light

Light ajoute des **règles fictives** au note - un exploit social:

```python
# Les "règles" ajoutées par Light
FAKE_RULES = {
    "13_day_rule": """
        Si le possesseur n'écrit pas de nom pendant 13 jours,
        il meurt.
    """,
    "destruction_rule": """
        Si le Death Note est détruit ou brûlé,
        tous ceux qui l'ont touché meurent.
    """
}

# Ces règles n'existent pas dans le kernel réel
# Mais elles manipulent le comportement de L et Near

def light_strategy():
    """
    Exploiter la peur de tester les règles
    """
    # L ne peut pas vérifier sans risquer des vies
    # Donc il doit traiter les fausses règles comme vraies
    # C'est de la sécurité par obscurité inversée
```

## Le Paradoxe du Contrôle des Actions

Les règles permettent de **contrôler les actions** avant la mort:

```
INPUT: "L Lawliet - accident de voiture dans 3 jours,
        après avoir brûlé toutes les preuves contre Kira"

VALIDATION:
├── Nom correct? ✓
├── Physiquement possible?
│   ├── L peut conduire? ✓
│   ├── L peut brûler des documents? ✓
│   ├── 3 jours < 23 jours? ✓
│   └── Actions cohérentes avec sa personnalité?
│       └── L détruirait-il des preuves?
│           └── ✗ VIOLATION: contre sa nature fondamentale
│
RESULT: Actions ignorées, défaut à crise cardiaque
```

## Les Règles de Propriété: State Machine

```
         ┌──────────────────────────────────────────┐
         │          OWNERSHIP STATE MACHINE         │
         └──────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
         ┌─────────│   NO_OWNER    │─────────┐
         │         └───────────────┘         │
         │                 │                 │
    pick_up()         claim()          touch()
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  POSSESSOR  │    │   OWNER     │    │  TOUCHED    │
│ (can write) │◄──►│ (full ctrl) │    │(sees shini) │
└─────────────┘    └─────────────┘    └─────────────┘
         │                 │                 │
    forfeit()        give_up()          forget()
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────────────────────────────────────────┐
    │              MEMORIES_ERASED                 │
    │  - Oubli total des événements liés au note  │
    │  - Le shinigami devient invisible           │
    │  - Les meurtres sont oubliés               │
    └─────────────────────────────────────────────┘
```

## La Règle Ultime: Irrévocabilité

```c
// La règle la plus fondamentale
#define DEATH_IS_FINAL 1

int cancel_death(const char *name) {
    // Cette fonction n'existe pas
    // Il n'y a pas de syscall pour annuler
    return -ENOSYS;  // Function not implemented
}

// Une fois écrit, le destin est scellé
// Même effacer le nom ne change rien
// C'est write-once, execute-always
```

## Exploitation des Edge Cases

Light et L exploitent les **corner cases** des règles:

```python
class RuleExploitation:

    @staticmethod
    def control_before_death():
        """
        Light utilise le contrôle des actions pour:
        - Faire envoyer des messages
        - Faire détruire des preuves
        - Créer des alibis
        """
        write("Raye Penber - heart attack in 2 hours, "
              "after writing names of all FBI agents")

    @staticmethod
    def test_ownership_rules():
        """
        Light exploite les règles de propriété:
        - Abandonner = perdre mémoires
        - Toucher à nouveau = tout revient
        """
        forfeit_note()  # Devient innocent
        # ... temps passe, enquête bloquée ...
        touch_note_again()  # Tout revient
```

## Leçon Système: Les Règles Créent les Exploits

Le Death Note enseigne que:

1. **Tout système a des règles** - même la mort a un API
2. **Les règles créent des failles** - chaque contrainte est exploitable
3. **La documentation est cruciale** - ne pas connaître les règles = désavantage fatal
4. **L'irrévocabilité est dangereuse** - pas de rollback dans la mort

> "The human whose name is written in this note shall die."
> - Règle 1, simple et absolue
