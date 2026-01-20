# Spreads : Tirages comme Diagnostics Système

## Le Tirage comme Query

Un tirage de tarot est une requête au système inconscient. Comme une commande système, il a une syntaxe, des paramètres, et retourne des résultats structurés.

```bash
# Tirage simple
tarot pull --cards 1 --question "État actuel"

# Tirage complexe
tarot spread --type celtic-cross --query "Architecture de vie"
```

Chaque spread est un template de diagnostic différent.

## Tirage à Une Carte : `uptime`

Le plus simple. L'état actuel du système.

```
┌─────────────┐
│    CARD     │
│             │
│   Présent   │
│             │
└─────────────┘
```

```bash
# Équivalent système
uptime
# 09:42:15 up 42 days, 3:14, load: [CARD_INTERPRETATION]

# La carte unique répond:
# - Comment le système tourne maintenant
# - Quel daemon est au premier plan
# - Quelle énergie domine
```

## Tirage à Trois Cartes : Passé-Présent-Futur

Le `git log --oneline -3` de la psyché.

```
┌─────────┐ ┌─────────┐ ┌─────────┐
│  PAST   │ │ PRESENT │ │ FUTURE  │
│         │ │         │ │         │
│   t-1   │ │   t=0   │ │   t+1   │
│         │ │         │ │         │
└─────────┘ └─────────┘ └─────────┘
```

```python
# Comme un diff à trois états
class ThreeCardSpread:
    def __init__(self, deck):
        self.past = deck.draw()      # D'où on vient
        self.present = deck.draw()   # Où on est
        self.future = deck.draw()    # Où on va

    def interpret(self):
        # Le présent est la confluence
        # Du passé vers le futur
        trajectory = analyze_trajectory(
            self.past,
            self.present,
            self.future
        )
        return trajectory
```

### Variantes du Tirage à Trois

```
┌─────────┐ ┌─────────┐ ┌─────────┐
│SITUATION│ │ ACTION  │ │ OUTCOME │
└─────────┘ └─────────┘ └─────────┘
Ce qui est   Que faire   Résultat

┌─────────┐ ┌─────────┐ ┌─────────┐
│  MIND   │ │  BODY   │ │ SPIRIT  │
└─────────┘ └─────────┘ └─────────┘
CPU (épées) RAM (bâtons) I/O (coupes)

┌─────────┐ ┌─────────┐ ┌─────────┐
│  YOU    │ │RELATION │ │  OTHER  │
└─────────┘ └─────────┘ └─────────┘
Process A   Pipe/Socket  Process B
```

## Tirage à Quatre Cartes : Diagnostic Ressources

Les quatre suits, un diagnostic complet des quatre ressources.

```
    ┌─────────┐
    │ SWORDS  │     CPU / Mental
    │   Air   │
    └─────────┘

┌─────────┐     ┌─────────┐
│  CUPS   │     │  WANDS  │
│  Water  │     │   Fire  │
└─────────┘     └─────────┘
  I/O           Memory

    ┌─────────┐
    │PENTACLES│     Disk / Physical
    │  Earth  │
    └─────────┘
```

```bash
# Équivalent système
function four_card_diagnostic() {
    echo "=== SWORDS (CPU) ==="
    top -bn1 | head -5

    echo "=== CUPS (I/O) ==="
    iostat -x 1 1

    echo "=== WANDS (Memory) ==="
    free -h

    echo "=== PENTACLES (Disk) ==="
    df -h
}
```

## Croix Celtique : Full System Audit

Le spread le plus complet. 10 cartes, 10 aspects.

```
                    ┌───┐
                    │ 10│  Final outcome
                    └───┘
                    ┌───┐
                    │ 9 │  Hopes/Fears
                    └───┘
                    ┌───┐
                    │ 8 │  External influences
                    └───┘
                    ┌───┐
                    │ 7 │  Advice
                    └───┘

┌───┐   ┌───┐ ┌───┐   ┌───┐
│ 4 │   │1/2│───│ 3 │   │ 6 │
│   │   └───┘   └───┘   │   │
└───┘     │             └───┘
Past      │             Near
          │             Future
        ┌───┐
        │ 5 │
        └───┘
       Foundation
```

```python
class CelticCrossAudit:
    """
    Full system audit - 10 positions
    """
    def __init__(self, deck):
        # Core situation
        self.present = deck.draw()        # 1: Current state
        self.challenge = deck.draw()      # 2: Crossing (conflict)

        # Timeline
        self.foundation = deck.draw()     # 3: Root cause
        self.past = deck.draw()           # 4: Recent past
        self.crown = deck.draw()          # 5: Conscious goal
        self.future = deck.draw()         # 6: Near future

        # Staff (right column)
        self.self_perception = deck.draw()   # 7: How you see yourself
        self.environment = deck.draw()       # 8: External factors
        self.hopes_fears = deck.draw()       # 9: Hopes/Fears
        self.outcome = deck.draw()           # 10: Final outcome

    def full_audit(self):
        report = {
            'core': {
                'situation': self.present,
                'blocker': self.challenge,
                'root_cause': self.foundation
            },
            'timeline': {
                'past': self.past,
                'goal': self.crown,
                'projection': self.future
            },
            'context': {
                'self_image': self.self_perception,
                'external': self.environment,
                'psychological': self.hopes_fears
            },
            'outcome': self.outcome
        }
        return report
```

### Correspondances Système de la Croix Celtique

```
Position  | Tarot              | Système
----------|--------------------|---------------------------------
1         | Present situation  | ps aux | grep CURRENT
2         | Challenge/Cross    | dmesg | grep -i error
3         | Foundation         | git log --oneline | tail -1
4         | Recent past        | journalctl --since "1 hour ago"
5         | Crown/Goals        | cat /etc/systemd/goals.target
6         | Near future        | predictive_analytics()
7         | Self perception    | whoami && id
8         | Environment        | env | sort
9         | Hopes/Fears        | cat ~/.config/concerns.conf
10        | Outcome            | simulation_result()
```

## Tirage en Fer à Cheval : Debugging Session

7 cartes pour investiguer un problème.

```
┌───┐                           ┌───┐
│ 1 │                           │ 7 │
│   │   ┌───┐           ┌───┐   │   │
└───┘   │ 2 │           │ 6 │   └───┘
        │   │   ┌───┐   │   │
Past    └───┘   │ 4 │   └───┘   Outcome
                │   │
        ┌───┐   └───┘   ┌───┐
        │ 3 │   Core    │ 5 │
        │   │   Issue   │   │
        └───┘           └───┘
        Hidden          Advice
```

```bash
# Debugging flow
function horseshoe_debug() {
    echo "1. PAST: What led here?"
    git log --oneline -5

    echo "2. PRESENT: Current state?"
    systemctl status

    echo "3. HIDDEN: What's not obvious?"
    strace -p $PID 2>&1 | tail -20

    echo "4. CORE ISSUE: Root cause?"
    coredumpctl info

    echo "5. ADVICE: What to try?"
    man $SUSPECT_COMMAND

    echo "6. NEAR FUTURE: What if we do nothing?"
    predict_degradation()

    echo "7. OUTCOME: Result if we act?"
    simulate_fix()
}
```

## Spread Process : Parent-Children

Pour analyser les relations entre processus.

```
           ┌─────────┐
           │ PARENT  │
           │   PID   │
           └────┬────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───┴───┐  ┌────┴────┐  ┌───┴───┐
│ CHILD │  │  CHILD  │  │ CHILD │
│  PID  │  │   PID   │  │  PID  │
└───────┘  └─────────┘  └───────┘
```

```python
def process_tree_reading(parent_card, child_cards):
    """
    Analyse des relations parent-enfant
    """
    reading = {
        'parent': {
            'card': parent_card,
            'role': 'init/supervisor',
            'responsibility': 'spawn and wait'
        },
        'children': []
    }

    for i, child in enumerate(child_cards):
        reading['children'].append({
            'card': child,
            'role': f'worker_{i}',
            'relationship_to_parent': analyze_relationship(
                parent_card, child
            )
        })

    # Vérifier les conflits
    for child in reading['children']:
        if conflicts(child['card'], parent_card):
            reading['warning'] = 'Parent-child tension detected'

    return reading
```

## Spread Daemon : Les Services

Pour analyser les services qui tournent.

```
┌────────────────────────────────────────┐
│             SYSTEMD (Hiérophant)       │
└────────────────────────────────────────┘
        │
┌───────┼───────┬───────┬───────┐
│       │       │       │       │
▼       ▼       ▼       ▼       ▼
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ S │ │ S │ │ S │ │ S │ │ S │
│ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │
└───┘ └───┘ └───┘ └───┘ └───┘
 net   log   db   web   cron
```

```bash
# Tirage des services
function daemon_spread() {
    services=("network" "logging" "database" "webserver" "cron")
    deck=($(tarot shuffle))

    for i in ${!services[@]}; do
        echo "${services[$i]}: ${deck[$i]}"
        # Interpréter chaque service selon sa carte
    done
}
```

## Spread Quatre Éléments : État Complet

```
                FIRE (Wands)
                  Memory
                    │
                    │
                    ▼
WATER (Cups) ◄────────────► AIR (Swords)
   I/O                        CPU
                    │
                    │
                    ▼
               EARTH (Pentacles)
                   Disk
```

```python
class ElementalSpread:
    """
    Quatre éléments = quatre ressources système
    """
    def __init__(self, deck):
        self.fire = deck.draw()    # Wands - Memory/Creation
        self.water = deck.draw()   # Cups - I/O/Flow
        self.air = deck.draw()     # Swords - CPU/Logic
        self.earth = deck.draw()   # Pentacles - Disk/Material

    def diagnose(self):
        return {
            'memory_state': interpret_wands(self.fire),
            'io_state': interpret_cups(self.water),
            'cpu_state': interpret_swords(self.air),
            'disk_state': interpret_pentacles(self.earth),
            'balance': self.check_elemental_balance()
        }

    def check_elemental_balance(self):
        """
        Les éléments doivent être en équilibre
        Trop de feu = memory burn
        Trop d'eau = I/O flood
        Trop d'air = CPU spin
        Trop de terre = disk full
        """
        elements = [self.fire, self.water, self.air, self.earth]
        suits = [card.suit for card in elements]

        # Vérifier si un élément domine excessivement
        from collections import Counter
        counts = Counter(suits)
        if counts.most_common(1)[0][1] >= 3:
            return "IMBALANCED"
        return "BALANCED"
```

## Spread de Décision : Fork Point

Quand on doit choisir entre options.

```
                ┌─────────┐
                │ CURRENT │
                │  STATE  │
                └────┬────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            │            ▼
   ┌─────────┐       │       ┌─────────┐
   │ OPTION  │       │       │ OPTION  │
   │    A    │       │       │    B    │
   └────┬────┘       │       └────┬────┘
        │            │            │
        ▼            │            ▼
   ┌─────────┐       │       ┌─────────┐
   │ OUTCOME │       │       │ OUTCOME │
   │    A    │       │       │    B    │
   └─────────┘       │       └─────────┘
                     │
                ┌────┴────┐
                │ HIDDEN  │
                │ FACTOR  │
                └─────────┘
```

```c
// Le fork() du destin
typedef struct {
    card_t current;
    card_t option_a;
    card_t outcome_a;
    card_t option_b;
    card_t outcome_b;
    card_t hidden;      // Ce qu'on ne voit pas encore
} fork_spread_t;

decision_t evaluate_fork(fork_spread_t *spread) {
    int score_a = evaluate_path(spread->option_a, spread->outcome_a);
    int score_b = evaluate_path(spread->option_b, spread->outcome_b);

    // Le facteur caché peut tout changer
    modifier_t hidden = reveal_hidden(spread->hidden);

    score_a += hidden.impact_on_a;
    score_b += hidden.impact_on_b;

    return score_a > score_b ? OPTION_A : OPTION_B;
}
```

## Lecture de Spread Combinée

```python
class TarotSystemDiagnostic:
    """
    Combine plusieurs spreads pour diagnostic complet
    """

    def full_diagnostic(self, deck):
        results = {}

        # Quick check - une carte
        results['uptime'] = self.single_card(deck)

        # Ressources - quatre cartes
        results['resources'] = self.four_element_spread(deck)

        # Deep dive si problèmes détectés
        if self.problems_detected(results):
            results['deep_analysis'] = self.celtic_cross(deck)

        return results

    def generate_report(self, results):
        """
        Génère un rapport système style tarot
        """
        report = []
        report.append("=== TAROT SYSTEM DIAGNOSTIC ===\n")

        report.append(f"Quick Status: {results['uptime']}")

        report.append("\nResource Analysis:")
        for resource, card in results['resources'].items():
            status = "OK" if card.upright else "WARN"
            report.append(f"  {resource}: {card.name} [{status}]")

        if 'deep_analysis' in results:
            report.append("\nDeep Analysis Required:")
            report.append(self.format_celtic(results['deep_analysis']))

        return "\n".join(report)
```

## Rituel du Tirage : Protocole

```bash
#!/bin/bash
# tarot_diagnostic.sh - Rituel de tirage système

# 1. Préparation (shuffle)
prepare_sacred_space() {
    clear
    echo "Entering diagnostic mode..."
    sleep 1
}

# 2. Question (query formulation)
formulate_query() {
    echo "What is your question?"
    read QUERY
    export TAROT_QUERY="$QUERY"
}

# 3. Tirage (draw)
perform_spread() {
    local spread_type=$1
    case $spread_type in
        single)  draw_cards 1 ;;
        three)   draw_cards 3 ;;
        celtic)  draw_cards 10 ;;
    esac
}

# 4. Interprétation (parse results)
interpret() {
    for card in "$@"; do
        lookup_meaning "$card"
        apply_to_context "$card" "$TAROT_QUERY"
    done
}

# 5. Intégration (commit changes)
integrate_reading() {
    echo "Reading complete."
    echo "Saving to /var/log/tarot/$(date +%Y%m%d).log"
}

# Main ritual
prepare_sacred_space
formulate_query
perform_spread celtic
interpret
integrate_reading
```

---

*Le spread choisi influence ce qu'on peut voir. Un tirage à une carte est un `echo $?`. Un celtic cross est un `strace -f`. Choisissez le spread selon la profondeur de compréhension requise. Et rappelez-vous : le tarot, comme le système, ne ment pas - il reflète simplement l'état actuel des processus.*
