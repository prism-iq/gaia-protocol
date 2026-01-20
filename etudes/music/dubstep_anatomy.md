# Anatomie du Dubstep: Déconstruction d'un Genre à 140 BPM

## Origines et Définition

Le dubstep émerge de South London au début des années 2000, fusion de UK garage, dub, et grime. Caractérisé par son tempo de **140 BPM** et son pattern **half-time**, il constitue la borne inférieure du paradigme 140-174.

## Structure Temporelle

### Le Half-Time Feel

À 140 BPM, le dubstep sonne comme 70 BPM grâce au placement du snare:

```
Full-time (DnB 140):  K . S . K . S . K . S . K . S .
Half-time (Dubstep):  K . . . S . . . K . . . S . . .

Où:
- K = Kick
- S = Snare
- . = Division 8th note
```

### Mathématiques du Tempo

```python
class DubstepTempo:
    """
    Analyse mathématique du tempo dubstep et ses relations.
    """

    def __init__(self, bpm=140):
        self.bpm = bpm
        self.beat_ms = 60000 / bpm  # ~428.57 ms à 140 BPM

    def get_subdivisions(self):
        """Retourne toutes les subdivisions rythmiques en ms."""
        beat = self.beat_ms
        return {
            'whole_note': beat * 4,      # 1714.29 ms
            'half_note': beat * 2,       # 857.14 ms
            'quarter_note': beat,        # 428.57 ms
            'eighth_note': beat / 2,     # 214.29 ms
            'sixteenth_note': beat / 4,  # 107.14 ms
            'thirty_second': beat / 8,   # 53.57 ms
            'triplet_eighth': beat / 3,  # 142.86 ms
        }

    def sync_delay(self, subdivision='eighth_note', feedback=0.5):
        """
        Calcule les temps de delay synchronisés.
        Essentiel pour les effets dubstep.
        """
        times = self.get_subdivisions()
        delay_ms = times[subdivision]

        # Delays en cascade (typique dub/dubstep)
        return {
            'main_delay': delay_ms,
            'dotted': delay_ms * 1.5,
            'ping_pong_l': delay_ms,
            'ping_pong_r': delay_ms * 2,
            'feedback': feedback
        }

    def wobble_rates(self):
        """
        Fréquences LFO synchronisées pour wobble bass.
        """
        beat_hz = self.bpm / 60  # 2.33 Hz à 140 BPM
        return {
            '1_bar': beat_hz / 4,      # 0.583 Hz
            '1_beat': beat_hz,          # 2.33 Hz
            '1/2_beat': beat_hz * 2,    # 4.67 Hz
            '1/4_beat': beat_hz * 4,    # 9.33 Hz
            '1/8_beat': beat_hz * 8,    # 18.67 Hz
            'triplet': beat_hz * 3,     # 7 Hz
        }


# Démonstration
tempo = DubstepTempo(140)
print(f"Subdivisions: {tempo.get_subdivisions()}")
print(f"Wobble rates: {tempo.wobble_rates()}")
```

## Anatomie Fréquentielle

### Le Spectre Dubstep

```
Fréquence (Hz)    | Élément              | Caractéristique
------------------|----------------------|------------------
20-60            | Sub bass             | Sine pure, mono
60-150           | Bass body            | Harmoniques, stereo limité
150-400          | Low mids             | Growls, wobbles
400-2000         | Mids                 | Leads, FX
2000-8000        | High mids            | Présence, attaque
8000-20000       | Highs                | Air, cymbales
```

### Analyse Spectrale Python

```python
import numpy as np
from scipy import signal
from scipy.fft import fft, fftfreq

class DubstepSpectralAnalyzer:
    """
    Analyseur spectral optimisé pour le dubstep.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate
        self.dubstep_bands = {
            'sub': (20, 60),
            'bass': (60, 150),
            'low_mid': (150, 400),
            'mid': (400, 2000),
            'high_mid': (2000, 8000),
            'high': (8000, 20000)
        }

    def analyze_energy_distribution(self, audio):
        """
        Analyse la distribution d'énergie par bande fréquentielle.
        Le dubstep devrait avoir forte énergie sub + low_mid.
        """
        n = len(audio)
        yf = fft(audio)
        xf = fftfreq(n, 1/self.sr)

        # Magnitude spectrum (partie positive)
        magnitude = np.abs(yf[:n//2])
        freqs = xf[:n//2]

        energy = {}
        total_energy = np.sum(magnitude**2)

        for band_name, (low, high) in self.dubstep_bands.items():
            mask = (freqs >= low) & (freqs < high)
            band_energy = np.sum(magnitude[mask]**2)
            energy[band_name] = {
                'absolute': band_energy,
                'percentage': (band_energy / total_energy) * 100
            }

        return energy

    def detect_wobble_rate(self, audio, window_size=4096):
        """
        Détecte la fréquence de wobble dominante.
        Analyse l'enveloppe du signal dans la bande mid.
        """
        # Filtrer bande mid (150-400 Hz)
        nyq = self.sr / 2
        b, a = signal.butter(4, [150/nyq, 400/nyq], btype='band')
        mid_band = signal.filtfilt(b, a, audio)

        # Extraire enveloppe (Hilbert)
        analytic = signal.hilbert(mid_band)
        envelope = np.abs(analytic)

        # FFT de l'enveloppe pour trouver le rate de modulation
        env_fft = fft(envelope)
        env_freqs = fftfreq(len(envelope), 1/self.sr)

        # Chercher dans la plage 0.5-20 Hz (rates de wobble typiques)
        mask = (env_freqs > 0.5) & (env_freqs < 20)
        peak_idx = np.argmax(np.abs(env_fft)[mask])
        wobble_freq = env_freqs[mask][peak_idx]

        return wobble_freq
```

## Le Wobble Bass: Coeur du Dubstep

### Théorie du Wobble

Le wobble est une **modulation d'amplitude et/ou de filtre** synchronisée au tempo:

```python
class WobbleBass:
    """
    Générateur de wobble bass avec multiples formes d'onde LFO.
    """

    def __init__(self, sample_rate=44100, bpm=140):
        self.sr = sample_rate
        self.bpm = bpm
        self.beat_duration = 60 / bpm

    def generate_lfo(self, shape, freq, duration):
        """
        Génère un LFO de forme spécifique.

        Shapes:
        - sine: wobble smooth
        - saw: sweep ascendant
        - square: gate effect
        - triangle: wobble linéaire
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        phase = 2 * np.pi * freq * t

        if shape == 'sine':
            return np.sin(phase)
        elif shape == 'saw':
            return 2 * (phase / (2*np.pi) % 1) - 1
        elif shape == 'square':
            return np.sign(np.sin(phase))
        elif shape == 'triangle':
            return 2 * np.abs(2 * (phase / (2*np.pi) % 1) - 1) - 1
        else:
            raise ValueError(f"Unknown shape: {shape}")

    def create_wobble(self, carrier_freq=55, lfo_division=2,
                      duration=4.0, lfo_shape='sine',
                      filter_range=(200, 2000)):
        """
        Crée un wobble bass complet.

        Args:
            carrier_freq: Fréquence de la basse (Hz)
            lfo_division: Division du beat (1=quarter, 2=eighth, etc.)
            duration: Durée en secondes
            lfo_shape: Forme du LFO
            filter_range: (freq_min, freq_max) du filtre
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        # Fréquence LFO synchronisée
        lfo_freq = (self.bpm / 60) * lfo_division

        # Génération du carrier riche en harmoniques (saw)
        carrier = signal.sawtooth(2 * np.pi * carrier_freq * t)

        # LFO
        lfo = self.generate_lfo(lfo_shape, lfo_freq, duration)
        lfo_normalized = (lfo + 1) / 2  # 0 to 1

        # Modulation de fréquence de coupure
        min_freq, max_freq = filter_range
        cutoff_modulated = min_freq + lfo_normalized * (max_freq - min_freq)

        # Application du filtre (frame par frame pour modulation)
        frame_size = 256
        output = np.zeros_like(carrier)

        for i in range(0, len(carrier) - frame_size, frame_size):
            frame = carrier[i:i+frame_size]
            cutoff = cutoff_modulated[i + frame_size//2]

            # Filtre passe-bas résonant
            nyq = self.sr / 2
            normalized_cutoff = min(cutoff / nyq, 0.99)
            b, a = signal.butter(2, normalized_cutoff, btype='low')
            output[i:i+frame_size] = signal.lfilter(b, a, frame)

        return output

    def rhythmic_wobble(self, carrier_freq=55, pattern=[1, 0.5, 0.5, 2],
                        duration=4.0):
        """
        Wobble avec pattern rythmique variable.

        pattern: Liste de divisions (1=quarter note à 140 BPM)
        """
        output = []
        current_time = 0
        pattern_idx = 0

        while current_time < duration:
            division = pattern[pattern_idx % len(pattern)]
            segment_duration = self.beat_duration * (1 / division)
            segment_duration = min(segment_duration, duration - current_time)

            # Génère un cycle de wobble pour ce segment
            segment = self.create_wobble(
                carrier_freq=carrier_freq,
                lfo_division=division,
                duration=segment_duration
            )
            output.append(segment)

            current_time += segment_duration
            pattern_idx += 1

        return np.concatenate(output)


# Exemple: Wobble pattern "standard" dubstep
wobbler = WobbleBass(bpm=140)
# Pattern: quarter-eighth-eighth-half (classique)
wobble = wobbler.rhythmic_wobble(pattern=[1, 2, 2, 0.5], duration=8.0)
```

## Structure d'un Track Dubstep

### Arrangement Type (140 BPM)

```
Section        | Bars | Temps (s) | Éléments
---------------|------|-----------|---------------------------
Intro          | 16   | 27.4      | Pads, FX, build
Buildup 1      | 8    | 13.7      | Drums légers, tension
Drop 1         | 16   | 27.4      | Full bass, drums complets
Breakdown      | 8    | 13.7      | Mélodie, réduction drums
Buildup 2      | 8    | 13.7      | Intensification
Drop 2         | 16   | 27.4      | Variation drop, plus intense
Breakdown 2    | 8    | 13.7      | Dernière respiration
Drop 3         | 16   | 27.4      | Final drop
Outro          | 8    | 13.7      | Fade out, FX
---------------|------|-----------|---------------------------
Total          | 104  | 178.3     | ~3 minutes
```

### Calcul de Structure

```python
def calculate_arrangement(bpm=140, structure=None):
    """
    Calcule les timings d'un arrangement dubstep.
    """
    if structure is None:
        structure = [
            ('Intro', 16),
            ('Buildup 1', 8),
            ('Drop 1', 16),
            ('Breakdown', 8),
            ('Buildup 2', 8),
            ('Drop 2', 16),
            ('Breakdown 2', 8),
            ('Drop 3', 16),
            ('Outro', 8)
        ]

    bar_duration = (60 / bpm) * 4  # 4 beats par bar

    arrangement = []
    current_time = 0

    for section_name, bars in structure:
        duration = bars * bar_duration
        arrangement.append({
            'name': section_name,
            'bars': bars,
            'start_time': current_time,
            'end_time': current_time + duration,
            'duration': duration
        })
        current_time += duration

    return {
        'sections': arrangement,
        'total_bars': sum(s[1] for s in structure),
        'total_duration': current_time,
        'bpm': bpm
    }
```

## Connexion au Paradigme 140-174 BPM

### Dubstep comme Point d'Ancrage

Le dubstep à 140 BPM est fondamental car:

1. **Half-time de 70 BPM**: Groove accessible
2. **Divisible**: 140 ÷ 2 = 70 (hip-hop), 140 × 1.25 = 175 (DnB)
3. **Transition naturelle**: 140 → 150 → 160 → 174

```python
def tempo_relationships(base_bpm=140):
    """
    Montre les relations mathématiques entre tempos du continuum.
    """
    return {
        'dubstep_base': base_bpm,
        'half_time_feel': base_bpm / 2,
        'hybrid_bass': int(base_bpm * 1.07),  # ~150 BPM
        'jump_up': int(base_bpm * 1.14),       # ~160 BPM
        'liquid': int(base_bpm * 1.21),        # ~170 BPM
        'neurofunk': int(base_bpm * 1.24),     # ~174 BPM
        'ratio_to_dnb': 174 / 140              # 1.243
    }
```

## Sound Design Dubstep

### Le "Brostep" Drop

```python
def brostep_drop_synth(freq=55, duration=0.5, sample_rate=44100):
    """
    Synthèse du son de drop "brostep" caractéristique.
    Combinaison de FM, distorsion, et filtering agressif.
    """
    t = np.linspace(0, duration, int(sample_rate * duration))

    # Carrier + FM aggressive
    mod_freq = freq * 2
    mod_index = 8
    modulator = mod_index * np.sin(2 * np.pi * mod_freq * t)
    carrier = np.sin(2 * np.pi * freq * t + modulator)

    # Waveshaping (distorsion)
    distorted = np.tanh(4 * carrier)

    # Pitch drop enveloppe
    pitch_env = np.exp(-3 * t / duration)
    pitch_multiplier = 1 + (pitch_env * 0.5)

    # Réapplication avec pitch drop
    final = np.sin(2 * np.pi * freq * pitch_multiplier * t + modulator)
    final = np.tanh(4 * final)

    return final
```

## Références Essentielles

### Artistes Fondateurs
- **Skream**: Midnight Request Line - définition du genre
- **Benga**: 26 Basslines - groove originel
- **Digital Mystikz**: Deep meditation dub

### Évolution Moderne
- **Excision**: Wall of death, festival dubstep
- **Virtual Riot**: Sound design extrême
- **MUST DIE!**: Hybridation avec d'autres genres

## Exercices

1. **Tempo Analysis**: Analyser 5 tracks et identifier les divisions de wobble
2. **Wobble Programming**: Créer un wobble avec 4 patterns rythmiques différents
3. **Spectral Balance**: Mixer un drop avec équilibre sub/mid correct
4. **Structure Mapping**: Mapper la structure complète d'un track dubstep

---

*Le dubstep à 140 BPM est le point de départ du voyage vers les hautes fréquences rythmiques du drum and bass.*
