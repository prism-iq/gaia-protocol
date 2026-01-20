# Types de Synthèse: Architectures Sonores

## Vue d'Ensemble

La synthèse sonore est l'art de créer des sons à partir de composants élémentaires. Chaque type de synthèse offre des caractéristiques uniques pour le sound design dans la bass music à 140-174 BPM.

## Synthèse Soustractive

### Principe

La synthèse soustractive part d'un signal riche en harmoniques et sculpte le son par filtrage.

```
[Oscillateur] → [Filtre] → [Amplificateur] → [Sortie]
     ↑              ↑            ↑
   [LFO]        [Envelope]   [Envelope]
```

### Implémentation

```python
import numpy as np
from scipy import signal

class SubtractiveSynth:
    """
    Synthétiseur soustractif complet.
    Base de la majorité des synthés hardware et software.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def oscillator(self, freq, duration, waveform='saw', pulse_width=0.5):
        """
        Génère une forme d'onde de base.

        waveforms: saw, square, pulse, triangle, sine
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        phase = 2 * np.pi * freq * t

        if waveform == 'sine':
            return np.sin(phase)
        elif waveform == 'saw':
            return 2 * (phase / (2*np.pi) % 1) - 1
        elif waveform == 'square':
            return np.sign(np.sin(phase))
        elif waveform == 'pulse':
            # Pulse width modulation capable
            return (phase / (2*np.pi) % 1 < pulse_width).astype(float) * 2 - 1
        elif waveform == 'triangle':
            return 2 * np.abs(2 * (phase / (2*np.pi) % 1) - 1) - 1
        else:
            return np.sin(phase)

    def filter_lowpass(self, audio, cutoff, resonance=1.0, filter_type='butter'):
        """
        Filtre passe-bas.

        resonance: 1.0 = plat, >1 = résonant (max ~10 pour self-oscillation)
        """
        nyq = self.sr / 2
        normalized_cutoff = min(cutoff / nyq, 0.99)

        if filter_type == 'butter':
            b, a = signal.butter(2, normalized_cutoff, btype='low')
        elif filter_type == 'resonant':
            # Approximation d'un filtre résonant
            Q = resonance
            b, a = signal.iirpeak(normalized_cutoff, Q)
            b2, a2 = signal.butter(2, normalized_cutoff, btype='low')
            # Combiner peak et lowpass
            audio_peak = signal.lfilter(b, a, audio)
            return signal.lfilter(b2, a2, audio + (resonance-1)*audio_peak)

        return signal.lfilter(b, a, audio)

    def envelope_adsr(self, duration, attack=0.01, decay=0.1,
                      sustain=0.7, release=0.2):
        """
        Génère une enveloppe ADSR.
        """
        total_samples = int(self.sr * duration)
        envelope = np.zeros(total_samples)

        attack_samples = int(self.sr * attack)
        decay_samples = int(self.sr * decay)
        release_samples = int(self.sr * release)

        # Attack
        if attack_samples > 0:
            envelope[:attack_samples] = np.linspace(0, 1, attack_samples)

        # Decay
        decay_end = attack_samples + decay_samples
        if decay_samples > 0 and decay_end <= total_samples:
            envelope[attack_samples:decay_end] = np.linspace(1, sustain, decay_samples)

        # Sustain
        sustain_end = total_samples - release_samples
        if sustain_end > decay_end:
            envelope[decay_end:sustain_end] = sustain

        # Release
        if release_samples > 0:
            envelope[sustain_end:] = np.linspace(sustain, 0, release_samples)

        return envelope

    def synthesize(self, freq, duration, waveform='saw',
                   cutoff=2000, resonance=1.0,
                   filter_envelope=True,
                   attack=0.01, decay=0.1, sustain=0.7, release=0.2):
        """
        Synthétise un son complet.
        """
        # Oscillateur
        osc = self.oscillator(freq, duration, waveform)

        # Enveloppe d'amplitude
        amp_env = self.envelope_adsr(duration, attack, decay, sustain, release)

        # Enveloppe de filtre (optionnelle)
        if filter_envelope:
            filter_env = self.envelope_adsr(duration, attack*2, decay*2, sustain*0.5, release)
            # Moduler la cutoff
            cutoff_mod = cutoff * (0.5 + filter_env * 1.5)

            # Appliquer filtre frame par frame
            frame_size = 256
            filtered = np.zeros_like(osc)

            for i in range(0, len(osc) - frame_size, frame_size):
                frame = osc[i:i+frame_size]
                cf = cutoff_mod[i + frame_size//2]
                filtered[i:i+frame_size] = self.filter_lowpass(frame, cf, resonance)
        else:
            filtered = self.filter_lowpass(osc, cutoff, resonance)

        # Appliquer enveloppe d'amplitude
        return filtered * amp_env


# Exemple: Bass patch typique
synth = SubtractiveSynth()
bass = synth.synthesize(
    freq=55,
    duration=1.0,
    waveform='saw',
    cutoff=800,
    resonance=2.0,
    attack=0.005,
    decay=0.2,
    sustain=0.5,
    release=0.3
)
```

## Synthèse FM (Frequency Modulation)

### Principe

Un oscillateur (modulateur) module la fréquence d'un autre (carrier), créant des spectres complexes.

```
y(t) = A × sin(2πfc×t + I × sin(2πfm×t))

Où:
- fc = fréquence carrier
- fm = fréquence modulateur
- I = index de modulation (profondeur)
```

### Implémentation

```python
class FMSynthesizer:
    """
    Synthèse FM - base du DX7 et des growls modernes.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def simple_fm(self, carrier_freq, mod_freq, mod_index, duration):
        """
        FM simple: 1 carrier, 1 modulateur.
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        modulator = mod_index * np.sin(2 * np.pi * mod_freq * t)
        carrier = np.sin(2 * np.pi * carrier_freq * t + modulator)

        return carrier

    def fm_ratio_analysis(self, carrier_freq, ratio):
        """
        Analyse les harmoniques produites par un ratio C:M.

        ratio = fm/fc

        Ratios entiers → harmoniques
        Ratios non-entiers → inharmoniques (métallique)
        """
        # Fréquences des sidebands
        # fn = fc ± n×fm pour n = 1, 2, 3...
        mod_freq = carrier_freq * ratio

        sidebands = [carrier_freq]  # Carrier
        for n in range(1, 10):
            upper = carrier_freq + n * mod_freq
            lower = carrier_freq - n * mod_freq
            if upper < self.sr / 2:
                sidebands.append(upper)
            if lower > 0:
                sidebands.append(abs(lower))

        return sorted(set(sidebands))

    def dx7_algorithm(self, freq, duration, algorithm=1, mod_index=5):
        """
        Implémentation simplifiée d'algorithmes DX7.

        Algorithm 1: Stack (op6→op5→op4→op3→op2→op1→out)
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        if algorithm == 1:
            # Chaîne linéaire
            op6 = np.sin(2 * np.pi * freq * 14 * t)
            op5 = np.sin(2 * np.pi * freq * 7 * t + mod_index * op6)
            op4 = np.sin(2 * np.pi * freq * 3.5 * t + mod_index * op5)
            op3 = np.sin(2 * np.pi * freq * 2 * t + mod_index * op4)
            op2 = np.sin(2 * np.pi * freq * 1.5 * t + mod_index * op3)
            op1 = np.sin(2 * np.pi * freq * t + mod_index * op2)
            return op1

        elif algorithm == 5:
            # Classique pour basses électriques
            # op6 feedback → op6 → op5 → out
            # op4 → op3 → op2 → op1 → out (parallel)
            op6 = np.sin(2 * np.pi * freq * 4 * t)  # Simplifié (pas de feedback)
            op5 = np.sin(2 * np.pi * freq * t + mod_index * op6)

            op4 = np.sin(2 * np.pi * freq * 2 * t)
            op3 = np.sin(2 * np.pi * freq * t + mod_index * 0.5 * op4)

            return 0.5 * op5 + 0.5 * op3

        return np.sin(2 * np.pi * freq * t)

    def fm_bass_growl(self, freq=55, duration=1.0, mod_rate=2.5):
        """
        Growl bass typique neurofunk via FM.

        Le mod_rate bas (2-5 Hz) crée le mouvement "growl".
        """
        t = np.linspace(0, duration, int(self.sr * duration))

        # Modulation lente pour le mouvement
        slow_mod = np.sin(2 * np.pi * mod_rate * t)

        # Index de modulation qui varie
        mod_index = 5 + 3 * slow_mod

        # Carrier avec FM
        modulator = mod_index * np.sin(2 * np.pi * freq * 2 * t)
        carrier = np.sin(2 * np.pi * freq * t + modulator)

        # Ajout d'harmoniques supplémentaires
        carrier += 0.5 * np.sin(2 * np.pi * freq * 3 * t + modulator * 1.5)

        return carrier / np.max(np.abs(carrier))


# Démonstration FM
fm_synth = FMSynthesizer()

# Analyse des ratios
print("Ratios FM et leurs caractères:")
ratios = [1, 2, 3, 1.414, 2.76]
for r in ratios:
    sidebands = fm_synth.fm_ratio_analysis(100, r)[:8]
    character = "harmonique" if r == int(r) else "métallique"
    print(f"  Ratio {r}: {character} - sidebands: {[f'{s:.0f}' for s in sidebands]}")
```

## Synthèse par Table d'Ondes (Wavetable)

### Principe

Lecture de formes d'onde pré-calculées avec morphing entre elles.

```python
class WavetableSynth:
    """
    Synthèse par table d'ondes avec morphing.
    """

    def __init__(self, sample_rate=44100, table_size=2048):
        self.sr = sample_rate
        self.table_size = table_size
        self.wavetables = {}

    def generate_wavetable(self, name, harmonics_func):
        """
        Génère une wavetable à partir d'une fonction d'harmoniques.
        """
        table = np.zeros(self.table_size)
        for n in range(1, 64):
            amp = harmonics_func(n)
            if amp > 0:
                phase = np.linspace(0, 2*np.pi*n, self.table_size, endpoint=False)
                table += amp * np.sin(phase)

        table = table / np.max(np.abs(table))
        self.wavetables[name] = table
        return table

    def create_standard_tables(self):
        """
        Crée un set de wavetables standards.
        """
        # Saw: 1/n
        self.generate_wavetable('saw', lambda n: 1/n)

        # Square: 1/n pour n impair
        self.generate_wavetable('square', lambda n: 1/n if n % 2 == 1 else 0)

        # Bright: sqrt(1/n)
        self.generate_wavetable('bright', lambda n: 1/np.sqrt(n))

        # Dark: 1/n²
        self.generate_wavetable('dark', lambda n: 1/(n*n))

        # PWM-like
        self.generate_wavetable('pwm', lambda n: (1/n) * np.sin(n * np.pi * 0.3))

        # Vocal formant approximation
        self.generate_wavetable('vocal', lambda n:
            1/n * (1 if n in [1,2,3,5,6,8,10] else 0.1))

    def read_table(self, table_name, phase):
        """
        Lit une valeur de la table avec interpolation linéaire.
        """
        table = self.wavetables[table_name]
        phase_normalized = phase % 1

        index_float = phase_normalized * self.table_size
        index_0 = int(index_float) % self.table_size
        index_1 = (index_0 + 1) % self.table_size
        frac = index_float - int(index_float)

        return table[index_0] * (1 - frac) + table[index_1] * frac

    def morph_tables(self, table_a, table_b, morph_amount):
        """
        Morphe entre deux tables.
        """
        if table_a not in self.wavetables or table_b not in self.wavetables:
            raise ValueError("Table not found")

        return ((1 - morph_amount) * self.wavetables[table_a] +
                morph_amount * self.wavetables[table_b])

    def synthesize(self, freq, duration, table_name='saw'):
        """
        Synthétise avec une seule table.
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        phase = (freq * t) % 1
        output = np.array([self.read_table(table_name, p) for p in phase])
        return output

    def synthesize_morphing(self, freq, duration, tables, morph_lfo_rate=0.5):
        """
        Synthétise avec morphing entre tables.

        tables: liste de noms de tables
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        n_tables = len(tables)

        # LFO pour le morphing
        morph_pos = (np.sin(2 * np.pi * morph_lfo_rate * t) + 1) / 2 * (n_tables - 1)

        output = np.zeros_like(t)
        phase = (freq * t) % 1

        for i, p in enumerate(phase):
            # Trouver les deux tables à mélanger
            table_idx = morph_pos[i]
            idx_a = int(table_idx)
            idx_b = min(idx_a + 1, n_tables - 1)
            frac = table_idx - idx_a

            val_a = self.read_table(tables[idx_a], p)
            val_b = self.read_table(tables[idx_b], p)

            output[i] = val_a * (1 - frac) + val_b * frac

        return output


# Utilisation
wt = WavetableSynth()
wt.create_standard_tables()

# Morphing bass
morphing_bass = wt.synthesize_morphing(
    freq=55,
    duration=2.0,
    tables=['dark', 'saw', 'bright', 'vocal'],
    morph_lfo_rate=1.0
)
```

## Synthèse Granulaire

### Principe

Décompose le son en micro-grains (1-50ms) et les réarrange.

```python
class GranularSynth:
    """
    Synthèse granulaire pour textures et effets.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def create_grain(self, source, position, grain_size, pitch_ratio=1.0):
        """
        Extrait un grain du source avec fenêtrage.
        """
        start = int(position * len(source))
        size = int(grain_size * self.sr)

        if start + size > len(source):
            start = max(0, len(source) - size)

        grain = source[start:start + size].copy()

        # Fenêtre de Hann pour éviter les clics
        window = np.hanning(len(grain))
        grain = grain * window

        # Pitch shift par ré-échantillonnage
        if pitch_ratio != 1.0:
            new_length = int(len(grain) / pitch_ratio)
            grain = np.interp(
                np.linspace(0, len(grain)-1, new_length),
                np.arange(len(grain)),
                grain
            )

        return grain

    def granular_stretch(self, source, stretch_factor, grain_size=0.03,
                         grain_density=100, randomize_position=0.01):
        """
        Time stretch via synthèse granulaire.
        """
        output_length = int(len(source) * stretch_factor)
        output = np.zeros(output_length)

        grain_samples = int(grain_size * self.sr)
        interval = self.sr / grain_density

        position = 0
        output_position = 0

        while output_position < output_length - grain_samples:
            # Position source avec randomisation
            source_pos = position / output_length
            source_pos += np.random.uniform(-randomize_position, randomize_position)
            source_pos = max(0, min(1, source_pos))

            # Créer et placer le grain
            grain = self.create_grain(source, source_pos, grain_size)

            end = int(output_position + len(grain))
            if end > output_length:
                grain = grain[:output_length - int(output_position)]
                end = output_length

            output[int(output_position):end] += grain

            output_position += interval
            position += interval / stretch_factor

        return output / np.max(np.abs(output) + 1e-10)

    def granular_texture(self, source, duration, grain_size=0.05,
                         density=50, position_range=(0.2, 0.8),
                         pitch_range=(0.8, 1.2)):
        """
        Crée une texture granulaire à partir d'une source.

        Parfait pour pads atmosphériques et risers.
        """
        output_samples = int(duration * self.sr)
        output = np.zeros(output_samples)

        interval = self.sr / density

        for i in range(int(duration * density)):
            # Position aléatoire dans la source
            position = np.random.uniform(*position_range)

            # Pitch aléatoire
            pitch = np.random.uniform(*pitch_range)

            # Créer le grain
            grain = self.create_grain(source, position, grain_size, pitch)

            # Position de sortie
            out_pos = int(i * interval + np.random.uniform(-interval/2, interval/2))
            out_pos = max(0, min(output_samples - len(grain), out_pos))

            # Placer
            output[out_pos:out_pos + len(grain)] += grain

        return output / np.max(np.abs(output) + 1e-10)


# Exemple: Créer une texture à partir d'un son
granular = GranularSynth()

# Source: une note de basse
t = np.linspace(0, 0.5, 22050)
source_sound = np.sin(2*np.pi*110*t) * np.exp(-3*t)
for h in range(2, 6):
    source_sound += (1/h) * np.sin(2*np.pi*110*h*t) * np.exp(-3*t)

# Texture granulaire (bon pour intros/outros)
texture = granular.granular_texture(source_sound, duration=4.0, density=80)
```

## Synthèse Additive

### Implémentation Avancée

```python
class AdditiveSynth:
    """
    Synthèse additive avec contrôle par partiel.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def synthesize(self, freq, duration, partial_data):
        """
        Synthétise avec contrôle total sur chaque partiel.

        partial_data: dict {partial_num: {'amp': float, 'detune_cents': float}}
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        output = np.zeros_like(t)

        for partial, data in partial_data.items():
            amp = data.get('amp', 1/partial)
            detune = data.get('detune_cents', 0)
            phase_offset = data.get('phase', 0)

            partial_freq = freq * partial * (2 ** (detune / 1200))
            output += amp * np.sin(2 * np.pi * partial_freq * t + phase_offset)

        return output / np.max(np.abs(output))

    def analyze_and_resynthesize(self, audio, n_partials=32):
        """
        Analyse un son et le resynthétise additivement.
        """
        from scipy.fft import rfft, rfftfreq

        spectrum = rfft(audio)
        freqs = rfftfreq(len(audio), 1/self.sr)
        magnitudes = np.abs(spectrum)

        # Trouver la fondamentale (premier pic significatif)
        threshold = np.max(magnitudes) * 0.1
        for i, mag in enumerate(magnitudes):
            if mag > threshold and freqs[i] > 20:
                fundamental = freqs[i]
                break
        else:
            fundamental = 100  # Fallback

        # Extraire les partiels
        partial_data = {}
        for n in range(1, n_partials + 1):
            target_freq = fundamental * n
            idx = np.argmin(np.abs(freqs - target_freq))

            if idx < len(magnitudes):
                amp = magnitudes[idx] / magnitudes[0]
                phase = np.angle(spectrum[idx])
                partial_data[n] = {'amp': amp, 'phase': phase}

        return partial_data, fundamental


# Profils de partiels pour différents timbres
PARTIAL_PROFILES = {
    'reese': {
        1: {'amp': 1.0, 'detune_cents': 0},
        2: {'amp': 0.5, 'detune_cents': 7},
        3: {'amp': 0.3, 'detune_cents': -5},
        4: {'amp': 0.2, 'detune_cents': 10},
        5: {'amp': 0.15, 'detune_cents': -8},
    },
    'organ': {
        1: {'amp': 1.0, 'detune_cents': 0},
        2: {'amp': 0.8, 'detune_cents': 0},
        3: {'amp': 0.6, 'detune_cents': 0},
        4: {'amp': 0.4, 'detune_cents': 0},
        6: {'amp': 0.3, 'detune_cents': 0},
        8: {'amp': 0.2, 'detune_cents': 0},
    },
    'bell': {
        1: {'amp': 1.0, 'detune_cents': 0},
        2.76: {'amp': 0.6, 'detune_cents': 0},
        4.72: {'amp': 0.4, 'detune_cents': 0},
        7.81: {'amp': 0.25, 'detune_cents': 0},
    }
}
```

## Connexion au Paradigme 140-174 BPM

### Choix de Synthèse par Genre

```python
def synth_recommendations_by_genre():
    """
    Recommandations de types de synthèse par genre/élément.
    """
    return {
        'dubstep_140': {
            'sub_bass': 'Soustractive (sine ou triangle filtrée)',
            'mid_bass': 'FM ou Wavetable avec modulation LFO',
            'leads': 'Soustractive ou Wavetable',
            'pads': 'Wavetable ou Granulaire',
            'fx': 'Granulaire, FM'
        },
        'neurofunk_174': {
            'sub_bass': 'Soustractive (sine pure)',
            'mid_bass': 'FM complexe, Wavetable morphing',
            'reese': 'Additive ou Soustractive (2 osc detunés)',
            'leads': 'FM, Wavetable',
            'textures': 'Granulaire'
        },
        'liquid_dnb_170': {
            'sub_bass': 'Soustractive (triangle)',
            'mid_bass': 'Soustractive douce',
            'pads': 'Wavetable, Granulaire',
            'leads': 'Soustractive, FM douce'
        }
    }


# Affichage
for genre, elements in synth_recommendations_by_genre().items():
    print(f"\n{genre.upper()}:")
    for element, synth_type in elements.items():
        print(f"  {element}: {synth_type}")
```

## Exercices Pratiques

1. **Soustractive**: Créer un patch de basse avec filtre résonant
2. **FM**: Explorer les ratios et leur effet sur le timbre
3. **Wavetable**: Créer un morphing entre 4 tables
4. **Granulaire**: Transformer une voix en texture atmosphérique
5. **Hybride**: Combiner FM + Wavetable pour un growl complexe

---

*Chaque type de synthèse est un outil dans l'arsenal du sound designer - la maîtrise vient de savoir quand utiliser chacun.*
