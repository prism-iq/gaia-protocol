# Neurofunk: L'Architecture Sonore du Chaos Contrôlé

## Définition et Contexte Historique

Le neurofunk émerge à la fin des années 90 comme mutation du drum and bass, caractérisé par des basses agressives, des textures métalliques et une production obsessionnellement précise. À 170-174 BPM, il représente l'extrême technique du continuum 140-174.

## Théorie Musicale Fondamentale

### Structure Harmonique

Le neurofunk opère principalement en **modes mineurs** avec emphase sur:
- **Phrygien**: tension par la seconde mineure (Eb dans C phrygien)
- **Locrien**: instabilité maximale via la quinte diminuée
- **Gammes diminuées**: alternance ton-demi-ton pour dissonance contrôlée

```
C Phrygien:  C  Db  Eb  F  G  Ab  Bb  C
             1  b2  b3  4  5  b6  b7  1

C Locrien:   C  Db  Eb  F  Gb Ab  Bb  C
             1  b2  b3  4  b5  b6  b7  1
```

### Intervalles Caractéristiques

| Intervalle | Ratio | Usage Neurofunk |
|------------|-------|-----------------|
| Triton | 45:32 | Tension bass drops |
| Seconde mineure | 16:15 | Leads agressifs |
| Septième majeure | 15:8 | Accords de suspension |

## Architecture du Bass Design

### Reese Bass Fondamentale

```python
import numpy as np
from scipy import signal
import soundfile as sf

class ReeseBass:
    """
    Générateur de Reese Bass - fondation du neurofunk.
    Deux oscillateurs désaccordés avec modulation de phase.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def generate(self, freq, duration, detune_cents=15,
                 phase_mod_depth=0.3, phase_mod_rate=2.5):
        """
        Génère une Reese bass avec paramètres de design.

        Args:
            freq: Fréquence fondamentale (Hz)
            duration: Durée (secondes)
            detune_cents: Désaccordage en cents
            phase_mod_depth: Profondeur modulation de phase
            phase_mod_rate: Vitesse modulation (Hz)
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        # Calcul fréquence désaccordée
        detune_ratio = 2 ** (detune_cents / 1200)
        freq_detuned = freq * detune_ratio

        # Modulation de phase (crée le mouvement caractéristique)
        phase_mod = phase_mod_depth * np.sin(2 * np.pi * phase_mod_rate * t)

        # Deux oscillateurs
        osc1 = np.sin(2 * np.pi * freq * t)
        osc2 = np.sin(2 * np.pi * freq_detuned * t + phase_mod)

        # Mix avec légère différence de phase initiale
        reese = 0.5 * osc1 + 0.5 * osc2

        return reese

    def add_harmonics(self, signal, harmonic_ratios=[2, 3, 4, 5],
                      harmonic_amps=[0.5, 0.25, 0.125, 0.0625]):
        """Ajoute des harmoniques pour richesse spectrale."""
        result = signal.copy()
        for ratio, amp in zip(harmonic_ratios, harmonic_amps):
            # Approximation par waveshaping
            result += amp * np.tanh(ratio * signal)
        return result / np.max(np.abs(result))


class NeurofunkBassProcessor:
    """
    Chaîne de traitement typique neurofunk.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def multiband_distortion(self, audio,
                              low_drive=2.0, mid_drive=4.0, high_drive=3.0,
                              crossover_low=150, crossover_high=2500):
        """
        Distorsion multiband - technique signature neurofunk.
        """
        # Design des filtres crossover (Linkwitz-Riley 4ème ordre)
        nyq = self.sr / 2

        # Filtres pour séparation des bandes
        b_low, a_low = signal.butter(4, crossover_low/nyq, btype='low')
        b_mid, a_mid = signal.butter(4, [crossover_low/nyq, crossover_high/nyq], btype='band')
        b_high, a_high = signal.butter(4, crossover_high/nyq, btype='high')

        # Séparation
        low = signal.filtfilt(b_low, a_low, audio)
        mid = signal.filtfilt(b_mid, a_mid, audio)
        high = signal.filtfilt(b_high, a_high, audio)

        # Distorsion par bande (tanh saturation)
        low_dist = np.tanh(low_drive * low) / np.tanh(low_drive)
        mid_dist = np.tanh(mid_drive * mid) / np.tanh(mid_drive)
        high_dist = np.tanh(high_drive * high) / np.tanh(high_drive)

        return low_dist + mid_dist + high_dist

    def formant_filter(self, audio, formant_freq=800,
                       bandwidth=200, resonance=10):
        """
        Filtre formant pour caractère vocal des basses.
        """
        nyq = self.sr / 2
        low = (formant_freq - bandwidth/2) / nyq
        high = (formant_freq + bandwidth/2) / nyq

        b, a = signal.butter(2, [low, high], btype='band')

        # Résonance par feedback
        filtered = signal.lfilter(b, a, audio)
        return audio + resonance * filtered


# Exemple d'utilisation complète
def create_neurofunk_bass_patch(freq=55, duration=2.0):
    """
    Crée un patch de basse neurofunk complet.
    """
    reese = ReeseBass()
    processor = NeurofunkBassProcessor()

    # Génération base
    bass = reese.generate(freq, duration, detune_cents=12)

    # Ajout harmoniques
    bass = reese.add_harmonics(bass)

    # Traitement neurofunk
    bass = processor.multiband_distortion(bass)
    bass = processor.formant_filter(bass, formant_freq=600)

    # Normalisation finale
    bass = bass / np.max(np.abs(bass)) * 0.9

    return bass
```

## Patterns Rythmiques à 174 BPM

### Le Two-Step Neurofunk

```python
def generate_drum_pattern_174bpm(bars=4, sample_rate=44100):
    """
    Génère un pattern two-step neurofunk à 174 BPM.

    Le two-step: kick sur 1, snare sur 2 et 4,
    avec hats syncopés en triolets.
    """
    bpm = 174
    beat_duration = 60 / bpm  # ~0.345 secondes
    bar_duration = beat_duration * 4
    total_duration = bar_duration * bars

    samples = int(total_duration * sample_rate)
    pattern = np.zeros(samples)

    # Positions en samples
    def beat_to_sample(beat):
        return int(beat * beat_duration * sample_rate)

    # Pattern sur 4 bars
    for bar in range(bars):
        bar_offset = bar * 4  # 4 beats par bar

        # Kick: beat 1 de chaque bar
        kick_pos = beat_to_sample(bar_offset)
        # Snare: beats 2 et 4
        snare_pos_1 = beat_to_sample(bar_offset + 1)
        snare_pos_2 = beat_to_sample(bar_offset + 3)

        # Ghost notes (signature neurofunk)
        # 16th notes avant le snare
        ghost_1 = beat_to_sample(bar_offset + 0.75)
        ghost_2 = beat_to_sample(bar_offset + 2.75)

    return {
        'kick_positions': [0, 4, 8, 12],  # En beats
        'snare_positions': [1, 3, 5, 7, 9, 11, 13, 15],
        'ghost_positions': [0.75, 2.75, 4.75, 6.75, 8.75, 10.75, 12.75, 14.75],
        'hat_pattern': 'OXOXOXOX OXOXOXOX',  # X = closed, O = open
        'tempo': 174
    }
```

### Fills et Variations

```
Bar 1-3: Pattern standard two-step
Bar 4: Fill avec rolls de snare en 32nd notes

Notation rythmique (16th notes):
K = Kick, S = Snare, g = ghost, h = hat

Beat:  1 e & a 2 e & a 3 e & a 4 e & a
Bar 1: K h h g S h h h K h h g S h h h
Bar 4: K h h h S S S S S S S S S S S S (fill)
```

## Connexion avec le Paradigme 140-174 BPM

### Position dans le Spectre

```
140 BPM -------- 150 BPM -------- 160 BPM -------- 170 BPM ---- 174 BPM
   |                |                |                |            |
Dubstep         Hybrid           Jump-Up         Neurofunk    Neuro max
Half-time       Crossbreed       Dancefloor      Technique    Extreme
```

### Techniques de Transition Tempo

```python
def tempo_morph(audio, start_bpm, end_bpm, duration_beats, sample_rate=44100):
    """
    Morphing de tempo pour transitions dubstep -> neurofunk.
    Utilisé dans les DJ sets pour passages 140 -> 174.
    """
    # Calcul du ratio de time-stretch
    ratio = end_bpm / start_bpm

    # Time-stretch progressif
    # En pratique, utiliser librosa.effects.time_stretch
    # ou élastique/rubber band pour qualité pro

    return {
        'start_bpm': start_bpm,
        'end_bpm': end_bpm,
        'stretch_ratio': ratio,
        'technique': 'granular_time_stretch',
        'preserve_pitch': True
    }
```

## Sound Design Avancé

### Modulation FM pour Growls

```python
def fm_growl(carrier_freq=80, mod_freq=2.5, mod_index=5,
             duration=1.0, sample_rate=44100):
    """
    Synthèse FM pour growls neurofunk.

    La modulation basse fréquence (2-5 Hz) crée le mouvement
    caractéristique du "growl" ou "wobble".
    """
    t = np.linspace(0, duration, int(sample_rate * duration))

    # Modulateur
    modulator = mod_index * np.sin(2 * np.pi * mod_freq * t)

    # Carrier avec FM
    carrier = np.sin(2 * np.pi * carrier_freq * t + modulator)

    # Ajout d'harmoniques par waveshaping
    growl = np.tanh(3 * carrier)

    return growl
```

### Layering Technique

```
LAYER STACK (bas vers haut):
─────────────────────────────
1. Sub (sine 30-60 Hz)        - Fondation
2. Reese (60-200 Hz)          - Corps
3. Mid growl (200-800 Hz)     - Caractère
4. High formant (800-2500 Hz) - Présence
5. Noise/texture (2500+ Hz)   - Air
─────────────────────────────

Chaque layer traité séparément puis mixé.
Phase alignment CRITIQUE entre sub et reese.
```

## Références et Artistes Clés

- **Noisia**: Maîtres du sound design, référence technique
- **Black Sun Empire**: Atmosphères sombres
- **Mefjus**: Précision chirurgicale
- **Current Value**: Expérimentation extrême
- **Phace**: Mélodies dans le chaos

## Exercices Pratiques

1. **Reese Design**: Créer 5 variations de Reese avec différents détunes
2. **Rhythm Programming**: Programmer un pattern 8 bars avec variations
3. **Multiband Processing**: Configurer une chaîne 3 bandes sur une basse
4. **Tempo Transition**: Mixer un track dubstep vers neurofunk

---

*Le neurofunk représente l'apogée technique du continuum 140-174 BPM, où chaque élément sonore est sculpté avec précision chirurgicale.*
