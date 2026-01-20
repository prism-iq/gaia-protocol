# La Série Harmonique: Fondement Physique de la Musique Électronique

## Définition Physique

La série harmonique est la séquence de fréquences produites naturellement par tout corps vibrant. Chaque harmonique est un multiple entier de la fréquence fondamentale.

```
f₀ = fondamentale
f₁ = 2 × f₀  (octave)
f₂ = 3 × f₀  (quinte + octave)
f₃ = 4 × f₀  (deux octaves)
f₄ = 5 × f₀  (tierce majeure + deux octaves)
...
fₙ = (n+1) × f₀
```

## Mathématiques de la Série

### Ratios et Intervalles

```python
import numpy as np
from fractions import Fraction

class HarmonicSeries:
    """
    Analyse et génération de la série harmonique.
    """

    def __init__(self, fundamental=55):  # A1 = 55 Hz, note basse typique
        self.f0 = fundamental

    def get_harmonics(self, n_harmonics=16):
        """
        Génère les n premiers harmoniques.
        """
        harmonics = []
        for n in range(1, n_harmonics + 1):
            freq = self.f0 * n
            cents_from_f0 = 1200 * np.log2(n)
            octave = int(np.log2(n))

            harmonics.append({
                'harmonic_number': n,
                'frequency': freq,
                'ratio': f"{n}:1",
                'cents_from_fundamental': cents_from_f0,
                'octave': octave,
                'interval_name': self._get_interval_name(n)
            })

        return harmonics

    def _get_interval_name(self, n):
        """
        Retourne le nom de l'intervalle pour chaque harmonique.
        """
        intervals = {
            1: 'Unisson (fondamentale)',
            2: 'Octave',
            3: 'Quinte + Octave',
            4: 'Double Octave',
            5: 'Tierce majeure + 2 Octaves',
            6: 'Quinte + 2 Octaves',
            7: 'Septième mineure (approximative) + 2 Octaves',
            8: 'Triple Octave',
            9: 'Seconde majeure + 3 Octaves',
            10: 'Tierce majeure + 3 Octaves',
            11: 'Quarte augmentée (approximative) + 3 Octaves',
            12: 'Quinte + 3 Octaves',
            13: 'Sixte mineure (approximative) + 3 Octaves',
            14: 'Septième mineure + 3 Octaves',
            15: 'Septième majeure + 3 Octaves',
            16: 'Quadruple Octave'
        }
        return intervals.get(n, f'Harmonique {n}')

    def generate_tone(self, duration=1.0, n_harmonics=8,
                      decay_type='natural', sample_rate=44100):
        """
        Génère un son avec série harmonique spécifiée.

        decay_type:
        - 'natural': 1/n amplitude (son naturel)
        - 'bright': 1/sqrt(n) (plus brillant)
        - 'dark': 1/n² (plus sombre)
        - 'equal': amplitude égale (harsh)
        """
        t = np.linspace(0, duration, int(sample_rate * duration))
        signal = np.zeros_like(t)

        for n in range(1, n_harmonics + 1):
            freq = self.f0 * n

            if decay_type == 'natural':
                amp = 1 / n
            elif decay_type == 'bright':
                amp = 1 / np.sqrt(n)
            elif decay_type == 'dark':
                amp = 1 / (n * n)
            elif decay_type == 'equal':
                amp = 1
            else:
                amp = 1 / n

            signal += amp * np.sin(2 * np.pi * freq * t)

        # Normalisation
        signal = signal / np.max(np.abs(signal))
        return signal


# Exemple: Analyse pour A1 (55 Hz) - note de basse typique
series = HarmonicSeries(55)
for h in series.get_harmonics(16):
    print(f"H{h['harmonic_number']:2d}: {h['frequency']:7.1f} Hz - {h['interval_name']}")
```

### Sortie de l'Analyse

```
H 1:    55.0 Hz - Unisson (fondamentale)
H 2:   110.0 Hz - Octave
H 3:   165.0 Hz - Quinte + Octave
H 4:   220.0 Hz - Double Octave
H 5:   275.0 Hz - Tierce majeure + 2 Octaves
H 6:   330.0 Hz - Quinte + 2 Octaves
H 7:   385.0 Hz - Septième mineure (approximative) + 2 Octaves
H 8:   440.0 Hz - Triple Octave
H 9:   495.0 Hz - Seconde majeure + 3 Octaves
H10:   550.0 Hz - Tierce majeure + 3 Octaves
H11:   605.0 Hz - Quarte augmentée (approximative) + 3 Octaves
H12:   660.0 Hz - Quinte + 3 Octaves
H13:   715.0 Hz - Sixte mineure (approximative) + 3 Octaves
H14:   770.0 Hz - Septième mineure + 3 Octaves
H15:   825.0 Hz - Septième majeure + 3 Octaves
H16:   880.0 Hz - Quadruple Octave
```

## Série Harmonique et Bass Music

### Application au Design de Basse

Dans le paradigme 140-174 BPM, la compréhension de la série harmonique est cruciale pour:

```python
class BassHarmonicDesign:
    """
    Design de basses basé sur la manipulation de la série harmonique.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def sub_bass(self, freq=55, duration=1.0):
        """
        Sub bass: Fondamentale pure ou avec 2ème harmonique légère.
        Utilisé pour le low-end du dubstep/DnB.
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        # Fondamentale dominante
        fundamental = np.sin(2 * np.pi * freq * t)
        # Légère seconde harmonique pour définition
        h2 = 0.1 * np.sin(2 * np.pi * freq * 2 * t)

        return fundamental + h2

    def mid_bass(self, freq=55, duration=1.0):
        """
        Mid bass: Harmoniques 2-6 pour le "growl".
        Zone 100-400 Hz cruciale pour le caractère.
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        signal = np.zeros_like(t)

        # Emphase sur harmoniques impaires (caractère "nasal")
        harmonic_amps = {
            1: 0.3,   # Fondamentale réduite
            2: 0.4,   # Octave
            3: 0.8,   # Quinte - CRUCIAL pour le growl
            4: 0.5,   # 2 octaves
            5: 0.9,   # Tierce majeure - caractère
            6: 0.4,   # Quinte
            7: 0.3,   # 7ème harmonique - "dirt"
        }

        for n, amp in harmonic_amps.items():
            signal += amp * np.sin(2 * np.pi * freq * n * t)

        return signal / np.max(np.abs(signal))

    def harmonic_distortion_model(self, input_signal, drive=2.0,
                                   even_odd_ratio=0.5):
        """
        Modèle de distorsion harmonique.

        - Distorsion paire (2, 4, 6...): Son "chaud", tube
        - Distorsion impaire (3, 5, 7...): Son "agressif", transistor

        even_odd_ratio: 0 = impaire pure, 1 = paire pure
        """
        # Distorsion impaire (tanh)
        odd = np.tanh(drive * input_signal)

        # Distorsion paire (soft clipping asymétrique)
        even = np.tanh(drive * input_signal + 0.3) - 0.3

        return (1 - even_odd_ratio) * odd + even_odd_ratio * even

    def reese_from_harmonics(self, freq=55, duration=1.0, detune_cents=15):
        """
        Construit un Reese en manipulant la série harmonique.
        Le Reese est fondamentalement une interférence de deux
        séries harmoniques légèrement désaccordées.
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        detune_ratio = 2 ** (detune_cents / 1200)
        freq2 = freq * detune_ratio

        osc1 = np.zeros_like(t)
        osc2 = np.zeros_like(t)

        for n in range(1, 8):
            amp = 1 / n
            osc1 += amp * np.sin(2 * np.pi * freq * n * t)
            osc2 += amp * np.sin(2 * np.pi * freq2 * n * t)

        # Le mouvement du Reese vient de l'interférence
        # (battements) entre les deux séries
        reese = osc1 + osc2

        # Fréquence de battement = |f1 - f2| pour chaque harmonique
        # Crée le "phasing" caractéristique

        return reese / np.max(np.abs(reese))


# Analyse des battements dans un Reese
def analyze_reese_beating(freq=55, detune_cents=15):
    """
    Calcule les fréquences de battement pour chaque harmonique.
    """
    detune_ratio = 2 ** (detune_cents / 1200)

    print(f"Reese Analysis: {freq} Hz, {detune_cents} cents detune\n")
    print("Harmonique | Freq1 (Hz) | Freq2 (Hz) | Beating (Hz)")
    print("-" * 55)

    for n in range(1, 9):
        f1 = freq * n
        f2 = freq * n * detune_ratio
        beating = abs(f1 - f2)
        print(f"    {n:2d}     |  {f1:7.1f}   |  {f2:7.1f}   |   {beating:.2f}")

analyze_reese_beating(55, 15)
```

## Tempérament et Série Harmonique

### Le Conflit Fondamental

La série harmonique produit des intervalles **justes**, mais la musique occidentale utilise le tempérament **égal**:

```python
def compare_temperaments():
    """
    Compare les intervalles de la série harmonique
    avec le tempérament égal.
    """
    # Ratios de la série harmonique (intonation juste)
    just_ratios = {
        'unisson': 1/1,
        'seconde_mineure': 16/15,
        'seconde_majeure': 9/8,
        'tierce_mineure': 6/5,
        'tierce_majeure': 5/4,
        'quarte': 4/3,
        'triton': 45/32,
        'quinte': 3/2,
        'sixte_mineure': 8/5,
        'sixte_majeure': 5/3,
        'septieme_mineure': 9/5,
        'septieme_majeure': 15/8,
        'octave': 2/1
    }

    # Tempérament égal: ratio = 2^(n/12)
    equal_semitones = {
        'unisson': 0,
        'seconde_mineure': 1,
        'seconde_majeure': 2,
        'tierce_mineure': 3,
        'tierce_majeure': 4,
        'quarte': 5,
        'triton': 6,
        'quinte': 7,
        'sixte_mineure': 8,
        'sixte_majeure': 9,
        'septieme_mineure': 10,
        'septieme_majeure': 11,
        'octave': 12
    }

    print("Intervalle        | Juste (cents) | Égal (cents) | Diff")
    print("-" * 60)

    for name in just_ratios:
        just_cents = 1200 * np.log2(just_ratios[name])
        equal_cents = 100 * equal_semitones[name]
        diff = just_cents - equal_cents
        print(f"{name:18s}| {just_cents:13.2f} | {equal_cents:12.2f} | {diff:+.2f}")

compare_temperaments()
```

### Impact sur la Bass Music

```python
class HarmonicTuning:
    """
    Outils d'accordage basés sur la série harmonique
    pour la production bass music.
    """

    @staticmethod
    def find_harmonic_key(bpm=174):
        """
        Trouve la tonalité dont la fondamentale
        est harmoniquement liée au tempo.

        La connexion tempo-tonalité crée une cohérence subliminale.
        """
        # Fréquence du tempo
        tempo_freq = bpm / 60  # Hz

        # Multiples qui tombent dans la plage audible
        harmonics = []
        for n in range(1, 100):
            freq = tempo_freq * n
            if 20 <= freq <= 880:  # A1 à A5
                # Trouver la note la plus proche
                midi_note = 69 + 12 * np.log2(freq / 440)
                note_names = ['C', 'C#', 'D', 'D#', 'E', 'F',
                             'F#', 'G', 'G#', 'A', 'A#', 'B']
                note_name = note_names[int(round(midi_note)) % 12]
                octave = int(round(midi_note)) // 12 - 1

                harmonics.append({
                    'harmonic': n,
                    'freq': freq,
                    'note': f"{note_name}{octave}",
                    'midi': round(midi_note)
                })

        return harmonics[:10]  # Top 10

    @staticmethod
    def sub_bass_tuning(key_root_hz):
        """
        Calcule l'accordage optimal du sub bass pour une tonalité.
        Le sub devrait être sur la fondamentale ou la quinte.
        """
        return {
            'root': key_root_hz,
            'fifth': key_root_hz * 3/2,  # Quinte juste
            'octave_down': key_root_hz / 2,
            'sub_range': (key_root_hz / 2, key_root_hz),
            'recommendation': f"Sub entre {key_root_hz/2:.1f} et {key_root_hz:.1f} Hz"
        }


# Exemple: Connexion 174 BPM et tonalité
tuning = HarmonicTuning()
print("Harmoniques du tempo 174 BPM dans la plage audible:")
for h in tuning.find_harmonic_key(174):
    print(f"  H{h['harmonic']:2d}: {h['freq']:6.1f} Hz = {h['note']}")
```

## Synthèse Additive

### Principe

La synthèse additive construit des sons en additionnant des sinusoïdes (harmoniques):

```python
class AdditiveSynthesizer:
    """
    Synthétiseur additif pour exploration de la série harmonique.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def synthesize(self, freq, duration, harmonic_profile):
        """
        Synthétise un son avec profil harmonique personnalisé.

        harmonic_profile: dict {harmonic_number: amplitude}
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        signal = np.zeros_like(t)

        for n, amp in harmonic_profile.items():
            signal += amp * np.sin(2 * np.pi * freq * n * t)

        return signal / np.max(np.abs(signal))

    def morph(self, freq, duration, profile_start, profile_end):
        """
        Morphing entre deux profils harmoniques.
        Utile pour évolution de timbre dans les basses.
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        signal = np.zeros_like(t)

        # Enveloppe de morphing
        morph_env = t / duration  # 0 -> 1

        all_harmonics = set(profile_start.keys()) | set(profile_end.keys())

        for n in all_harmonics:
            amp_start = profile_start.get(n, 0)
            amp_end = profile_end.get(n, 0)
            amp = amp_start + morph_env * (amp_end - amp_start)
            signal += amp * np.sin(2 * np.pi * freq * n * t)

        return signal / np.max(np.abs(signal))


# Profils pour différents caractères de basse
BASS_PROFILES = {
    'sub_pure': {1: 1.0, 2: 0.1},
    'warm_bass': {1: 1.0, 2: 0.6, 3: 0.3, 4: 0.15},
    'growl': {1: 0.3, 2: 0.5, 3: 1.0, 4: 0.7, 5: 0.9, 6: 0.4, 7: 0.5},
    'nasal': {1: 0.2, 3: 1.0, 5: 0.8, 7: 0.6, 9: 0.4},
    'metallic': {1: 0.5, 2: 0.3, 4: 0.8, 8: 1.0, 16: 0.5}
}
```

## Connexion au Paradigme 140-174 BPM

### Résonance Tempo-Harmonie

```python
def tempo_harmonic_resonance(bpm):
    """
    Analyse la résonance entre tempo et série harmonique.

    Certains tempos créent des relations harmoniques
    plus cohérentes avec certaines tonalités.
    """
    tempo_hz = bpm / 60

    # Notes standard (A = 440 Hz)
    notes = {
        'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
        'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
        'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    }

    resonances = []

    for note_name, note_freq in notes.items():
        # Chercher quel harmonique du tempo est le plus proche
        for n in range(1, 200):
            harmonic_freq = tempo_hz * n

            # Réduire à l'octave de la note
            while harmonic_freq > note_freq * 2:
                harmonic_freq /= 2
            while harmonic_freq < note_freq / 2:
                harmonic_freq *= 2

            # Calcul de la déviation en cents
            if harmonic_freq > 0:
                cents_diff = 1200 * np.log2(harmonic_freq / note_freq)
                if abs(cents_diff) < 15:  # Tolérance 15 cents
                    resonances.append({
                        'note': note_name,
                        'harmonic': n,
                        'cents_deviation': cents_diff
                    })
                    break

    return sorted(resonances, key=lambda x: abs(x['cents_deviation']))[:5]


# Analyse pour les tempos clés
for bpm in [140, 150, 160, 170, 174]:
    print(f"\n{bpm} BPM - Meilleures résonances:")
    for r in tempo_harmonic_resonance(bpm):
        print(f"  {r['note']}: harmonique {r['harmonic']}, {r['cents_deviation']:+.1f} cents")
```

## Exercices Pratiques

1. **Génération**: Créer des sons avec différents profils harmoniques
2. **Analyse**: Analyser le contenu harmonique de basses existantes
3. **Morphing**: Programmer un morph entre deux timbres
4. **Accordage**: Trouver la tonalité optimale pour un tempo donné

---

*La série harmonique est le langage universel de la vibration, et sa maîtrise est la clé du sound design avancé.*
