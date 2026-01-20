# Microtonalité: Au-delà des 12 Demi-tons

## Introduction

La microtonalité explore les intervalles plus petits que le demi-ton du système tempéré occidental. Dans la bass music à 140-174 BPM, elle offre des possibilités expressives uniques pour la tension et la dissonance contrôlée.

## Fondements Théoriques

### Systèmes de Division de l'Octave

```python
import numpy as np

class MicrotonalSystem:
    """
    Implémentation de différents systèmes microtonaux.
    """

    def __init__(self, reference_freq=440.0):
        self.ref = reference_freq

    def equal_temperament(self, divisions=12):
        """
        Tempérament égal avec n divisions de l'octave.

        Systèmes courants:
        - 12-TET: Standard occidental
        - 19-TET: Meilleure approximation des tierces
        - 24-TET: Quarts de ton (musique arabe)
        - 31-TET: Excellentes tierces et septièmes
        - 53-TET: Approximation quasi-parfaite des justes
        """
        ratios = []
        for i in range(divisions + 1):
            ratio = 2 ** (i / divisions)
            cents = (i / divisions) * 1200
            ratios.append({
                'step': i,
                'ratio': ratio,
                'cents': cents,
                'frequency': self.ref * ratio
            })
        return ratios

    def just_intonation(self):
        """
        Intonation juste basée sur les ratios de nombres entiers.
        """
        ratios = {
            'unisson': (1, 1),
            'comma_syntonic': (81, 80),
            'seconde_mineure': (16, 15),
            'seconde_majeure': (9, 8),
            'tierce_mineure': (6, 5),
            'tierce_majeure': (5, 4),
            'quarte': (4, 3),
            'triton': (45, 32),
            'quinte': (3, 2),
            'sixte_mineure': (8, 5),
            'sixte_majeure': (5, 3),
            'septieme_mineure': (9, 5),
            'septieme_majeure': (15, 8),
            'octave': (2, 1)
        }

        result = []
        for name, (num, den) in ratios.items():
            ratio = num / den
            cents = 1200 * np.log2(ratio)
            result.append({
                'name': name,
                'ratio': f"{num}:{den}",
                'decimal': ratio,
                'cents': cents,
                'frequency': self.ref * ratio
            })
        return result

    def quarter_tones(self):
        """
        Système de quarts de ton (24-TET).
        Utilisé dans la musique arabe et pour effets de tension.
        """
        return self.equal_temperament(24)

    def generate_scale(self, root_freq, intervals_cents):
        """
        Génère une gamme à partir d'intervalles en cents.

        Permet de créer des gammes microtonales personnalisées.
        """
        scale = [root_freq]
        for cents in intervals_cents:
            freq = root_freq * (2 ** (cents / 1200))
            scale.append(freq)
        return scale


# Comparaison des systèmes
micro = MicrotonalSystem(440)

print("Comparaison des tierces majeures:")
print(f"  12-TET: {2**(4/12):.6f} = {400:.0f} cents")
print(f"  19-TET: {2**(6/19):.6f} = {6/19*1200:.1f} cents")
print(f"  31-TET: {2**(10/31):.6f} = {10/31*1200:.1f} cents")
print(f"  Juste:  {5/4:.6f} = {1200*np.log2(5/4):.1f} cents")
```

## Microtonalité dans la Bass Music

### Application au Sound Design

```python
class MicrotonalBass:
    """
    Techniques microtonales pour le design de basse.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def detuned_unison(self, freq, n_voices=5, spread_cents=50,
                       duration=1.0):
        """
        Unisson désaccordé microtonalement.

        Technique utilisée pour "épaissir" les basses.
        Le spread_cents définit l'écart total entre les voix.
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        signal = np.zeros_like(t)

        # Distribution des désaccordages
        detunes = np.linspace(-spread_cents/2, spread_cents/2, n_voices)

        for detune in detunes:
            voice_freq = freq * (2 ** (detune / 1200))
            signal += np.sin(2 * np.pi * voice_freq * t)

        return signal / n_voices

    def quarter_tone_tension(self, freq, duration=1.0):
        """
        Utilise les quarts de ton pour créer de la tension.

        Un quart de ton au-dessus ou en-dessous crée une
        dissonance "wronge" mais intéressante.
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        # Fondamentale
        fundamental = np.sin(2 * np.pi * freq * t)

        # Quart de ton au-dessus (50 cents)
        quarter_up = np.sin(2 * np.pi * freq * (2 ** (50/1200)) * t)

        # Mix avec fondamentale dominante
        return 0.7 * fundamental + 0.3 * quarter_up

    def microtonal_modulation(self, freq, mod_cents=25,
                              mod_rate=2.0, duration=1.0):
        """
        Modulation microtonale de la hauteur.

        Crée un vibrato subtil qui ne correspond à aucune
        note du système tempéré.
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        # LFO pour la modulation de pitch
        lfo = np.sin(2 * np.pi * mod_rate * t)

        # Conversion cents -> ratio
        pitch_mod = 2 ** ((mod_cents * lfo) / 1200)

        # Oscillateur avec pitch modulé
        phase = np.cumsum(2 * np.pi * freq * pitch_mod / self.sr)
        signal = np.sin(phase)

        return signal

    def just_interval_bass(self, root_freq, interval_ratio, duration=1.0):
        """
        Crée un intervalle en intonation juste.

        Plus consonant que le tempérament égal, utile pour
        les accords de basse.
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        # Root
        root = np.sin(2 * np.pi * root_freq * t)

        # Intervalle juste
        interval_freq = root_freq * interval_ratio
        interval = np.sin(2 * np.pi * interval_freq * t)

        return (root + interval) / 2

    def comma_shift(self, freq, duration=1.0, comma_type='syntonic'):
        """
        Applique un décalage d'un comma.

        Le comma syntonic (81:80 = ~21.5 cents) est la différence
        entre une tierce majeure tempérée et juste.

        Crée une tension subtile mais perceptible.
        """
        commas = {
            'syntonic': 81/80,      # 21.5 cents
            'pythagorean': 531441/524288,  # 23.5 cents
            'diesis': 128/125       # 41.1 cents
        }

        t = np.linspace(0, duration, int(self.sr * duration))

        original = np.sin(2 * np.pi * freq * t)
        shifted = np.sin(2 * np.pi * freq * commas[comma_type] * t)

        return original, shifted


# Démonstration
bass = MicrotonalBass()

# Épaississement par désaccordage microtonal
thick_bass = bass.detuned_unison(55, n_voices=7, spread_cents=30)

# Tierce juste vs tempérée
print(f"Tierce majeure tempérée: {55 * 2**(4/12):.2f} Hz")
print(f"Tierce majeure juste: {55 * 5/4:.2f} Hz")
print(f"Différence: {1200 * np.log2((5/4) / 2**(4/12)):.1f} cents")
```

## Gammes Microtonales pour Bass Music

### Gammes Expérimentales

```python
class MicrotonalScales:
    """
    Gammes microtonales adaptées à la bass music.
    """

    @staticmethod
    def neutral_scale(root=55):
        """
        Gamme avec tierces neutres (entre majeure et mineure).

        Ni majeur ni mineur, crée une ambiguïté tonale
        intéressante pour les atmosphères sombres.
        """
        # Tierce neutre = ~350 cents (entre 300 min et 400 maj)
        intervals_cents = [0, 200, 350, 500, 700, 850, 1000, 1200]

        return [root * (2 ** (c/1200)) for c in intervals_cents]

    @staticmethod
    def arabic_maqam_hijaz(root=55):
        """
        Maqam Hijaz - gamme arabe avec quarts de ton.

        Caractère exotique, utilisable pour intros/breakdowns.
        """
        # Hijaz: 1 - b2 - 3 - 4 - 5 - b6 - b7
        # Avec le b2 et 3 rapprochés (augmented second)
        intervals_cents = [0, 100, 400, 500, 700, 800, 1000, 1200]

        return [root * (2 ** (c/1200)) for c in intervals_cents]

    @staticmethod
    def bohlen_pierce_fragment(root=55):
        """
        Fragment de la gamme Bohlen-Pierce.

        Basée sur la division du triton (3:1) en 13 parties,
        au lieu de l'octave (2:1) en 12.

        Sonorité complètement aliène.
        """
        # Division du 3:1 (triton) en 13 parties égales
        tritave = 3  # Au lieu de l'octave (2)
        steps = [0, 1, 2, 4, 6, 7, 9, 10]  # Gamme Lambda

        scale = []
        for step in steps:
            freq = root * (tritave ** (step / 13))
            scale.append(freq)

        return scale

    @staticmethod
    def seven_limit_just(root=55):
        """
        Gamme en intonation juste 7-limit.

        Inclut les intervalles basés sur le 7ème harmonique,
        créant des septièmes "blues" naturelles.
        """
        ratios = [1, 8/7, 7/6, 4/3, 3/2, 8/5, 7/4, 2]

        return [root * r for r in ratios]

    @staticmethod
    def xenharmonic_bass_scale(root=55):
        """
        Gamme xénharmonique expérimentale pour bass music.

        Combine quarts de ton avec intervalles de septième harmonique.
        """
        # Custom intervals in cents
        intervals = [
            0,      # Root
            150,    # Entre seconde min et maj
            350,    # Tierce neutre
            550,    # Entre quarte et triton
            700,    # Quinte juste
            969,    # 7ème harmonique naturelle
            1050,   # Entre 7ème min et maj
            1200    # Octave
        ]

        return [root * (2 ** (c/1200)) for c in intervals]


# Génération de toutes les gammes
scales = MicrotonalScales()

print("Gamme Neutre (55 Hz root):")
for i, freq in enumerate(scales.neutral_scale(55)):
    cents = 1200 * np.log2(freq/55)
    print(f"  Degré {i}: {freq:.2f} Hz ({cents:.0f} cents)")
```

## Connexion au Paradigme 140-174 BPM

### Micro-variations Rythmiques

La microtonalité peut aussi s'appliquer au temps:

```python
class MicrorhythmicVariation:
    """
    Application des concepts microtonaux au rythme.

    Tout comme 12-TET divise l'octave en 12,
    on peut imaginer des divisions plus fines du beat.
    """

    def __init__(self, bpm=174):
        self.bpm = bpm
        self.beat_ms = 60000 / bpm

    def microtiming_grid(self, divisions=24):
        """
        Grille de microtiming plus fine que les 16th notes.

        24 divisions = entre 16th et 32nd notes
        Permet le "swing" précis et les grooves non-quantifiés.
        """
        return [self.beat_ms * (i / divisions) for i in range(divisions)]

    def apply_swing(self, positions, swing_amount=0.1):
        """
        Applique du swing microtonal aux positions.

        swing_amount: 0 = droit, 0.33 = triplet swing max
        """
        swung = []
        for i, pos in enumerate(positions):
            if i % 2 == 1:  # Notes off-beat
                # Décale vers l'avant
                pos += self.beat_ms * swing_amount
            swung.append(pos)
        return swung

    def irrational_subdivision(self, base_division=4):
        """
        Subdivisions irrationnelles du beat.

        Par exemple, sqrt(2) divisions par beat,
        créant des patterns qui ne "loopent" jamais exactement.
        """
        sqrt2 = np.sqrt(2)
        positions = []

        current = 0
        increment = self.beat_ms / sqrt2

        while current < self.beat_ms * base_division:
            positions.append(current)
            current += increment

        return positions


# Exemple à 174 BPM
micro_rhythm = MicrorhythmicVariation(174)

print(f"Beat duration at 174 BPM: {micro_rhythm.beat_ms:.2f} ms")
print(f"\nMicrotiming grid (24 divisions):")
grid = micro_rhythm.microtiming_grid(24)
for i, pos in enumerate(grid[:8]):
    print(f"  Step {i}: {pos:.2f} ms")
```

### Pitch-Tempo Resonance

```python
def microtonal_tempo_lock(bpm=174, root_freq=55):
    """
    Calcule les micro-ajustements de pitch pour
    verrouiller la fondamentale sur un harmonique du tempo.
    """
    tempo_freq = bpm / 60

    # Trouver l'harmonique le plus proche de root_freq
    n = round(root_freq / tempo_freq)
    locked_freq = tempo_freq * n

    deviation_cents = 1200 * np.log2(locked_freq / root_freq)

    return {
        'original_freq': root_freq,
        'locked_freq': locked_freq,
        'harmonic_number': n,
        'adjustment_cents': deviation_cents,
        'creates_beating': deviation_cents != 0
    }


# Exemple
lock = microtonal_tempo_lock(174, 55)
print(f"Pour verrouiller 55 Hz sur 174 BPM:")
print(f"  Ajuster à {lock['locked_freq']:.2f} Hz")
print(f"  (Harmonique #{lock['harmonic_number']} du tempo)")
print(f"  Ajustement: {lock['adjustment_cents']:+.1f} cents")
```

## Implémentation Pratique

### Générateur de Fréquences Microtonales

```python
class MicrotonalGenerator:
    """
    Générateur de signaux audio microtonaux.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def generate_microtonal_chord(self, root, intervals_cents,
                                   duration=1.0, waveform='saw'):
        """
        Génère un accord microtonal.
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        signal = np.zeros_like(t)

        freqs = [root * (2 ** (c/1200)) for c in intervals_cents]

        for freq in freqs:
            if waveform == 'sine':
                signal += np.sin(2 * np.pi * freq * t)
            elif waveform == 'saw':
                signal += 2 * (freq * t % 1) - 1
            elif waveform == 'square':
                signal += np.sign(np.sin(2 * np.pi * freq * t))

        return signal / len(freqs)

    def microtonal_glide(self, start_cents, end_cents, root=55,
                         duration=1.0, curve='linear'):
        """
        Glide microtonal entre deux intervalles.
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        if curve == 'linear':
            cents = np.linspace(start_cents, end_cents, len(t))
        elif curve == 'exponential':
            cents = start_cents * np.exp(np.log(end_cents/start_cents) * t/duration)
        elif curve == 'logarithmic':
            cents = start_cents + (end_cents - start_cents) * np.log1p(9*t/duration) / np.log(10)

        freq = root * (2 ** (cents / 1200))

        # Génération avec fréquence variable
        phase = np.cumsum(2 * np.pi * freq / self.sr)
        signal = np.sin(phase)

        return signal
```

## Exercices Pratiques

1. **Exploration 19-TET**: Créer une gamme en 19-TET et comparer avec 12-TET
2. **Quarts de Ton**: Designer une basse utilisant les quarts de ton
3. **Just Intonation**: Comparer un accord en tempérament égal vs juste
4. **Xenharmonie**: Créer une mélodie dans la gamme Bohlen-Pierce

---

*La microtonalité ouvre des territoires sonores inexploités, offrant de nouvelles couleurs harmoniques pour la bass music expérimentale.*
