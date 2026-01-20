# Rythmes Circadiens : L'Horloge Interne

## Le Temps Biologique

Avant les horloges mécaniques, la vie avait déjà inventé le chronométrage.
Chaque cellule contient une horloge moléculaire synchronisée au cycle jour/nuit.
Nous sommes des systèmes temporels autant que spatiaux.

## L'Oscillateur Central

### La Boucle de Rétroaction

```
┌─────────────────────────────────────────────────────────────┐
│                    BOUCLE CIRCADIENNE                       │
│                                                             │
│    Gènes CLOCK/BMAL1                                        │
│           │                                                 │
│           v                                                 │
│    ┌─────────────┐        Activation                        │
│    │ Transcription│ ────────────────────────┐               │
│    └─────────────┘                          │               │
│           │                                 v               │
│           v                          ┌──────────┐           │
│    Protéines PER/CRY                 │ Per, Cry │           │
│           │                          │  genes   │           │
│           │                          └──────────┘           │
│           v                                                 │
│    ┌─────────────┐        Inhibition                        │
│    │ Accumulation│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘              │
│    │ & transport │         (feedback négatif)               │
│    │  au noyau   │                                          │
│    └─────────────┘                                          │
│           │                                                 │
│           └──────── ~24h pour un cycle ─────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implémentation

```python
class CircadianClock:
    """
    L'horloge circadienne moléculaire
    Période endogène ≈ 24h (sans signaux externes)
    """

    def __init__(self):
        self.clock_bmal1 = 1.0   # Activateurs
        self.per_cry = 0.0       # Répresseurs
        self.phase = 0           # Position dans le cycle
        self.period = 24 * 60    # ~24h en minutes

    def tick(self, dt):
        """
        Un pas de l'oscillateur
        Équations différentielles simplifiées
        """
        # CLOCK-BMAL1 active la transcription de Per et Cry
        transcription_rate = self.clock_bmal1 * (1 - self.per_cry)

        # PER-CRY s'accumule
        self.per_cry += transcription_rate * dt

        # PER-CRY inhibe CLOCK-BMAL1
        self.clock_bmal1 = 1.0 / (1 + self.per_cry ** 2)

        # Dégradation de PER-CRY
        self.per_cry *= 0.95  # Demi-vie ~4h

        self.phase = (self.phase + dt) % self.period

    def output(self):
        """
        Signal de sortie : rythme d'activité génique
        Contrôle des gènes clock-controlled (CCGs)
        """
        return sin(2 * pi * self.phase / self.period)
```

## Daemon : Le Pacemaker Central

```bash
#!/bin/bash
# /etc/systemd/system/circadian-clock.service
# Le noyau suprachiasmatique (SCN) comme daemon maître

[Unit]
Description=Suprachiasmatic Nucleus - Master Clock Daemon
After=retinal-input.service
Wants=light-sensor.service

[Service]
Type=notify
ExecStart=/usr/lib/brain/scn/oscillate --period=24h

# Entrainement par la lumière
ExecStartPre=/usr/lib/brain/scn/sync-to-light
Environment="ZEITGEBER=light"

# Synchronisation des horloges périphériques
ExecStartPost=/usr/lib/brain/scn/broadcast-time

# Ne s'arrête jamais (mais peut être perturbé)
Restart=always
WatchdogSec=1h

# Timer précis
CPUSchedulingPolicy=fifo
CPUSchedulingPriority=99

[Install]
WantedBy=homeostasis.target
```

## Architecture Hiérarchique

```python
class CircadianSystem:
    """
    Système circadien hiérarchique
    Horloge maître → Horloges périphériques
    """

    def __init__(self):
        # Horloge maître dans l'hypothalamus
        self.scn = SuprachiasmaticNucleus()  # ~20,000 neurones

        # Horloges périphériques dans chaque organe
        self.peripheral_clocks = {
            'liver': LiverClock(),
            'heart': HeartClock(),
            'muscle': MuscleClock(),
            'adipose': AdiposeClock(),
            'skin': SkinClock(),
            # Chaque cellule a sa propre horloge
        }

    def synchronize(self):
        """
        Le SCN synchronise les horloges périphériques
        via signaux nerveux et hormonaux
        """
        master_time = self.scn.get_time()

        # Signaux de synchronisation
        for organ, clock in self.peripheral_clocks.items():
            # Voie nerveuse (rapide)
            self.scn.send_neural_signal(clock)

            # Voie hormonale (plus lente)
            cortisol = self.scn.trigger_cortisol_release()
            melatonin = self.scn.trigger_melatonin_release()

            clock.entrain(master_time, cortisol, melatonin)
```

## Zeitgebers : Les Synchroniseurs

```python
class Zeitgeber:
    """
    Zeitgeber = "donneur de temps" en allemand
    Signaux externes qui synchronisent l'horloge interne
    """

    ZEITGEBERS = {
        'light': {
            'strength': 'primary',
            'receptor': 'melanopsin_cells',  # Dans la rétine
            'pathway': 'retinohypothalamic_tract',
            'target': 'SCN'
        },
        'food': {
            'strength': 'secondary',
            'receptor': 'metabolic_sensors',
            'pathway': 'vagus_nerve',
            'target': 'liver_clock'  # Peut désynchroniser du SCN
        },
        'temperature': {
            'strength': 'secondary',
            'receptor': 'thermoreceptors',
            'pathway': 'hypothalamic',
            'target': 'SCN'
        },
        'social': {
            'strength': 'weak',
            'receptor': 'social_cues',
            'pathway': 'limbic',
            'target': 'SCN_indirect'
        }
    }

    def entrain(self, clock, zeitgeber, signal_strength):
        """
        Entrainement : ajuster la phase de l'horloge
        au signal externe
        """
        phase_difference = clock.phase - zeitgeber.phase
        adjustment = signal_strength * sin(phase_difference)
        clock.phase += adjustment
```

## Phase Response Curve

```python
def phase_response_curve(clock, light_pulse, time_of_pulse):
    """
    Comment un stimulus lumineux affecte la phase
    selon le moment où il est donné

    Phase Response Curve (PRC):

    Phase shift
         ▲
    +2h  │    ╱╲
    +1h  │   ╱  ╲
     0   │──╱────╲───────
    -1h  │        ╲  ╱
    -2h  │         ╲╱
         └────────────────▶ Circadian time
              0   6   12  18  24
              │   │    │   │
           Début Midi Crépuscule Nuit

    Lumière le soir → retarde l'horloge (phase delay)
    Lumière le matin → avance l'horloge (phase advance)
    Lumière le jour → peu d'effet
    """

    if time_of_pulse in ['early_night', 'evening']:
        return clock.delay(light_pulse.intensity)
    elif time_of_pulse in ['late_night', 'early_morning']:
        return clock.advance(light_pulse.intensity)
    else:
        return 0  # Dead zone
```

## Rythmes Physiologiques

```python
CIRCADIAN_RHYTHMS = {
    'core_body_temperature': {
        'peak': '18:00',
        'trough': '04:00',
        'amplitude': 0.5,  # °C
        'function': 'métabolisme, performance'
    },
    'melatonin': {
        'peak': '02:00-04:00',
        'trough': 'daytime',
        'trigger': 'darkness_onset',
        'function': 'signal de nuit, sommeil'
    },
    'cortisol': {
        'peak': '06:00-08:00',  # CAR - Cortisol Awakening Response
        'trough': '00:00',
        'function': 'éveil, énergie, stress'
    },
    'alertness': {
        'peaks': ['10:00', '21:00'],  # Bimodal
        'troughs': ['03:00', '15:00'],  # Post-lunch dip
        'function': 'performance cognitive'
    },
    'blood_pressure': {
        'peak': 'morning',
        'trough': 'sleep',
        'clinical': 'Crises cardiaques plus fréquentes le matin'
    },
    'cell_division': {
        'peak': 'late_night',
        'function': 'réparation, croissance'
    }
}

class PhysiologicalRhythm:
    def __init__(self, rhythm_data):
        self.peak_time = rhythm_data['peak']
        self.trough_time = rhythm_data['trough']

    def current_level(self, time):
        """Niveau actuel basé sur l'heure"""
        phase = (time - self.trough_time) % 24
        return sin(2 * pi * phase / 24)
```

## Chronotypes

```python
class Chronotype:
    """
    Variation individuelle dans la phase circadienne
    """

    TYPES = {
        'early_bird': {
            'sleep_onset': '21:00-22:00',
            'wake_time': '05:00-06:00',
            'peak_alertness': '09:00-12:00',
            'prevalence': '25%',
            'genetic_bias': 'PER3 short allele'
        },
        'night_owl': {
            'sleep_onset': '00:00-02:00',
            'wake_time': '09:00-11:00',
            'peak_alertness': '18:00-21:00',
            'prevalence': '25%',
            'genetic_bias': 'PER3 long allele'
        },
        'intermediate': {
            'sleep_onset': '23:00-00:00',
            'wake_time': '07:00-08:00',
            'prevalence': '50%'
        }
    }

    def social_jetlag(self, chronotype, work_schedule):
        """
        Décalage entre horloge biologique et contraintes sociales
        Les night owls souffrent le plus du 9-5
        """
        bio_wake = chronotype['wake_time']
        social_wake = work_schedule['start'] - commute

        return abs(bio_wake - social_wake)  # Heures de décalage
```

## Désynchronisation : Jet Lag et Shift Work

```python
class CircadianDisruption:
    """
    Perturbations du système circadien
    """

    def jet_lag(self, time_zones_crossed, direction):
        """
        Jet lag : désynchronisation par voyage rapide

        Adaptation : ~1 jour par fuseau horaire
        Vers l'est plus difficile (avancer l'horloge)
        """
        adaptation_rate = 1.0 if direction == 'west' else 0.7  # jours/fuseau

        recovery_time = time_zones_crossed / adaptation_rate

        symptoms = {
            'fatigue': True,
            'insomnia': True,
            'digestive_issues': True,
            'cognitive_impairment': True,
            'mood_disturbance': True
        }

        return recovery_time, symptoms

    def shift_work(self, schedule):
        """
        Travail posté : forcer l'horloge contre sa nature

        Risques santé :
        - Cancer (sein, prostate) - classé carcinogène probable
        - Maladies cardiovasculaires
        - Troubles métaboliques (diabète, obésité)
        - Troubles de l'humeur
        """
        if schedule.rotates or schedule.is_night:
            # L'horloge ne s'adapte jamais complètement
            return ChronicDesynchrony(
                scn_phase='trying_to_be_diurnal',
                behavior='forced_nocturnal',
                peripheral_clocks='confused',
                health_risk='elevated'
            )
```

## Chronopharmacologie

```python
class Chronopharmacology:
    """
    Le timing optimal des médicaments
    """

    EXAMPLES = {
        'statins': {
            'optimal_time': 'evening',
            'reason': 'Synthèse du cholestérol pic la nuit'
        },
        'blood_pressure_meds': {
            'optimal_time': 'bedtime',
            'reason': 'Prévenir surge matinale de BP'
        },
        'chemotherapy': {
            'optimal_time': 'tumor_specific',
            'reason': 'Cellules saines et tumorales ont des rythmes différents'
        },
        'aspirin': {
            'optimal_time': 'evening',
            'reason': 'Protection cardiovasculaire matinale'
        }
    }

    def optimal_dosing_time(self, drug, target_pathway):
        """
        Trouver le moment où le médicament est le plus efficace
        et/ou le moins toxique
        """
        pathway_rhythm = get_rhythm(target_pathway)
        absorption_rhythm = get_rhythm('gut_absorption')

        # Maximiser efficacité, minimiser toxicité
        return optimize(
            efficacy=drug_at(pathway_rhythm.peak),
            safety=avoid(toxicity_window)
        )
```

## Horloges et Vieillissement

```python
class AgingClock:
    """
    Le vieillissement affecte les rythmes circadiens
    Et les perturbations circadiennes accélèrent le vieillissement
    """

    def age_related_changes(self, age):
        changes = {
            'amplitude': 'decreased',      # Rythmes amortis
            'phase': 'advanced',           # Réveil plus tôt
            'synchronization': 'weakened', # Horloges désynchronisées
            'entrainment': 'slower',       # Adaptation plus lente
            'sleep': 'fragmented'          # Sommeil interrompu
        }

        return changes

    def circadian_longevity(self):
        """
        Maintenir des rythmes robustes → vieillissement en meilleure santé

        Études montrent :
        - Restriction calorique temporelle prolonge la vie
        - Lumière régulière améliore la cognition des personnes âgées
        - Perturbation circadienne raccourcit la durée de vie (modèles animaux)
        """
        pass
```

## Implémentation Système

```python
class CircadianScheduler:
    """
    Appliquer les principes circadiens à l'ordonnancement
    """

    def __init__(self):
        self.internal_clock = CircadianClock()
        self.tasks = PriorityQueue()

    def schedule_task(self, task, optimal_phase):
        """
        Planifier les tâches selon le rythme circadien
        """
        cognitive_rhythm = self.get_alertness_rhythm()

        if task.type == 'analytical':
            # Tâches analytiques au pic d'éveil
            task.schedule_at(cognitive_rhythm.peak)
        elif task.type == 'creative':
            # Tâches créatives quand inhibition est basse
            task.schedule_at(cognitive_rhythm.trough)  # Paradoxe de la créativité
        elif task.type == 'physical':
            # Performance physique pic en fin d'après-midi
            task.schedule_at('17:00')

    def cron_circadian(self):
        """
        Un cron qui respecte les rythmes biologiques

        # Backup quand activité utilisateur minimale
        0 3 * * * /usr/bin/backup  # 3h du matin

        # Notifications importantes au pic d'attention
        0 10 * * * /usr/bin/daily-summary

        # Pas de notifications après 21h
        */15 6-21 * * * /usr/bin/check-messages
        """
        pass
```

## Réflexions

Les rythmes circadiens nous enseignent que :

1. **Le temps est une dimension fondamentale** - La biologie est temporelle
2. **La synchronisation est essentielle** - Horloges désynchronisées = pathologie
3. **Les signaux environnementaux importent** - La lumière est information
4. **L'anticipation vaut mieux que la réaction** - Préparer avant que le besoin arrive
5. **Respecter les rythmes naturels** - Aller contre coûte cher en santé

Nos systèmes informatiques sont souvent atemporels.
Peut-être devraient-ils apprendre à respecter les rythmes de leurs utilisateurs humains.

---

*"Le temps n'est pas une ligne mais un cercle. Tout revient, rien ne s'achève vraiment."*
