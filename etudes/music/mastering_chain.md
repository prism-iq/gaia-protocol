# La Chaîne de Mastering: Finalisation Sonore

## Introduction

Le mastering est l'étape finale de la production, préparant le mix pour la distribution. Pour la bass music à 140-174 BPM, il présente des défis spécifiques liés à l'énergie dans les basses fréquences.

## Architecture de la Chaîne

### Ordre Standard

```
[Input] → [Correction] → [EQ] → [Compression] → [Saturation] → [Limiting] → [Output]
              ↓            ↓          ↓             ↓            ↓
           Analyse      Tonalité   Dynamique    Harmoniques   Loudness
```

## Analyse Initiale

### Outils d'Analyse

```python
import numpy as np
from scipy import signal
from scipy.fft import rfft, rfftfreq

class MasteringAnalyzer:
    """
    Outils d'analyse pour le mastering.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def measure_lufs(self, audio, gate_threshold=-70):
        """
        Mesure LUFS (Loudness Units Full Scale).

        Standard EBU R128 pour le loudness.
        """
        # Filtre K-weighting (simplifié)
        # High shelf +4dB à 1500 Hz
        # High pass 38 Hz

        nyq = self.sr / 2

        # Approximation du K-weighting
        b_hp, a_hp = signal.butter(2, 38/nyq, btype='high')
        audio_filtered = signal.lfilter(b_hp, a_hp, audio)

        # RMS avec gating
        frame_size = int(0.4 * self.sr)  # 400ms frames
        hop = int(0.1 * self.sr)  # 100ms overlap

        rms_values = []
        for i in range(0, len(audio_filtered) - frame_size, hop):
            frame = audio_filtered[i:i+frame_size]
            rms = np.sqrt(np.mean(frame**2))
            rms_db = 20 * np.log10(rms + 1e-10)

            if rms_db > gate_threshold:
                rms_values.append(rms**2)

        if rms_values:
            mean_square = np.mean(rms_values)
            lufs = 10 * np.log10(mean_square + 1e-10) - 0.691
        else:
            lufs = -70

        return lufs

    def measure_dynamic_range(self, audio):
        """
        Mesure la plage dynamique (DR).
        """
        frame_size = int(0.05 * self.sr)  # 50ms
        hop = int(0.025 * self.sr)

        rms_values = []
        for i in range(0, len(audio) - frame_size, hop):
            frame = audio[i:i+frame_size]
            rms = np.sqrt(np.mean(frame**2))
            rms_values.append(20 * np.log10(rms + 1e-10))

        rms_values = np.array(rms_values)

        # Enlever les silences
        rms_values = rms_values[rms_values > -60]

        if len(rms_values) > 0:
            peak = np.max(rms_values)
            # DR = différence entre peak et RMS moyen des parties fortes
            loud_threshold = peak - 20
            loud_parts = rms_values[rms_values > loud_threshold]
            if len(loud_parts) > 0:
                dr = peak - np.mean(loud_parts)
            else:
                dr = 0
        else:
            dr = 0

        return dr

    def analyze_spectrum_balance(self, audio):
        """
        Analyse l'équilibre spectral par bandes.
        """
        spectrum = np.abs(rfft(audio))
        freqs = rfftfreq(len(audio), 1/self.sr)

        bands = {
            'sub': (20, 60),
            'bass': (60, 250),
            'low_mid': (250, 500),
            'mid': (500, 2000),
            'high_mid': (2000, 6000),
            'high': (6000, 20000)
        }

        energy = {}
        total = np.sum(spectrum**2)

        for name, (low, high) in bands.items():
            mask = (freqs >= low) & (freqs < high)
            band_energy = np.sum(spectrum[mask]**2)
            energy[name] = {
                'db': 10 * np.log10(band_energy / total + 1e-10),
                'percentage': (band_energy / total) * 100
            }

        return energy

    def check_true_peak(self, audio, oversample=4):
        """
        Mesure le True Peak avec oversampling.

        Important pour éviter l'inter-sample clipping.
        """
        # Oversampling par interpolation
        n_samples = len(audio) * oversample
        oversampled = np.interp(
            np.linspace(0, len(audio)-1, n_samples),
            np.arange(len(audio)),
            audio
        )

        true_peak = np.max(np.abs(oversampled))
        true_peak_db = 20 * np.log10(true_peak + 1e-10)

        sample_peak = np.max(np.abs(audio))
        sample_peak_db = 20 * np.log10(sample_peak + 1e-10)

        return {
            'true_peak_db': true_peak_db,
            'sample_peak_db': sample_peak_db,
            'intersample_peak_margin': true_peak_db - sample_peak_db
        }

    def detect_clipping(self, audio, threshold=0.99):
        """
        Détecte les échantillons qui clippent.
        """
        clipped = np.abs(audio) >= threshold
        n_clipped = np.sum(clipped)
        percentage = (n_clipped / len(audio)) * 100

        # Trouver les positions
        clip_positions = np.where(clipped)[0] / self.sr

        return {
            'n_clipped_samples': n_clipped,
            'percentage': percentage,
            'clip_times': clip_positions[:20] if len(clip_positions) > 0 else []
        }


# Utilisation
analyzer = MasteringAnalyzer()

# Test avec un signal
t = np.linspace(0, 5, 44100*5)
test_mix = 0.8 * np.sin(2*np.pi*55*t)
test_mix += 0.3 * np.sin(2*np.pi*110*t)
test_mix += 0.1 * np.random.randn(len(t))

lufs = analyzer.measure_lufs(test_mix)
dr = analyzer.measure_dynamic_range(test_mix)
balance = analyzer.analyze_spectrum_balance(test_mix)
peak = analyzer.check_true_peak(test_mix)

print(f"LUFS: {lufs:.1f}")
print(f"Dynamic Range: {dr:.1f} dB")
print(f"True Peak: {peak['true_peak_db']:.1f} dBFS")
print(f"\nBalance spectral:")
for band, data in balance.items():
    print(f"  {band}: {data['db']:.1f} dB ({data['percentage']:.1f}%)")
```

## Égalisation de Mastering

### EQ Paramétrique

```python
class MasteringEQ:
    """
    EQ paramétrique pour mastering.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def parametric_eq(self, audio, bands):
        """
        EQ paramétrique multi-bandes.

        bands: liste de dicts {'freq': Hz, 'gain_db': dB, 'q': Q factor, 'type': 'peak'/'shelf'}
        """
        output = audio.copy()

        for band in bands:
            freq = band['freq']
            gain_db = band['gain_db']
            q = band.get('q', 1.0)
            band_type = band.get('type', 'peak')

            output = self._apply_band(output, freq, gain_db, q, band_type)

        return output

    def _apply_band(self, audio, freq, gain_db, q, band_type):
        """
        Applique une bande d'EQ.
        """
        nyq = self.sr / 2
        w0 = freq / nyq

        if w0 >= 1:
            return audio

        A = 10 ** (gain_db / 40)
        alpha = np.sin(np.pi * w0) / (2 * q)

        if band_type == 'peak':
            b0 = 1 + alpha * A
            b1 = -2 * np.cos(np.pi * w0)
            b2 = 1 - alpha * A
            a0 = 1 + alpha / A
            a1 = -2 * np.cos(np.pi * w0)
            a2 = 1 - alpha / A

        elif band_type == 'low_shelf':
            b0 = A * ((A + 1) - (A - 1) * np.cos(np.pi * w0) + 2 * np.sqrt(A) * alpha)
            b1 = 2 * A * ((A - 1) - (A + 1) * np.cos(np.pi * w0))
            b2 = A * ((A + 1) - (A - 1) * np.cos(np.pi * w0) - 2 * np.sqrt(A) * alpha)
            a0 = (A + 1) + (A - 1) * np.cos(np.pi * w0) + 2 * np.sqrt(A) * alpha
            a1 = -2 * ((A - 1) + (A + 1) * np.cos(np.pi * w0))
            a2 = (A + 1) + (A - 1) * np.cos(np.pi * w0) - 2 * np.sqrt(A) * alpha

        elif band_type == 'high_shelf':
            b0 = A * ((A + 1) + (A - 1) * np.cos(np.pi * w0) + 2 * np.sqrt(A) * alpha)
            b1 = -2 * A * ((A - 1) + (A + 1) * np.cos(np.pi * w0))
            b2 = A * ((A + 1) + (A - 1) * np.cos(np.pi * w0) - 2 * np.sqrt(A) * alpha)
            a0 = (A + 1) - (A - 1) * np.cos(np.pi * w0) + 2 * np.sqrt(A) * alpha
            a1 = 2 * ((A - 1) - (A + 1) * np.cos(np.pi * w0))
            a2 = (A + 1) - (A - 1) * np.cos(np.pi * w0) - 2 * np.sqrt(A) * alpha

        elif band_type == 'highpass':
            b = [1 - alpha, -2 * np.cos(np.pi * w0), 1 + alpha]
            a = [1 + alpha, -2 * np.cos(np.pi * w0), 1 - alpha]
            return signal.lfilter(np.array(b)/a[0], np.array(a)/a[0], audio)

        b = np.array([b0, b1, b2]) / a0
        a = np.array([a0, a1, a2]) / a0

        return signal.lfilter(b, a, audio)

    def bass_music_preset(self, audio):
        """
        Preset EQ optimisé pour bass music 140-174 BPM.
        """
        bands = [
            # High-pass pour éliminer le rumble
            {'freq': 25, 'gain_db': 0, 'q': 0.7, 'type': 'highpass'},

            # Légère réduction sub pour clarté
            {'freq': 40, 'gain_db': -1.5, 'q': 0.8, 'type': 'peak'},

            # Boost sub harmonique pour présence
            {'freq': 80, 'gain_db': 1, 'q': 1.2, 'type': 'peak'},

            # Réduction mud zone
            {'freq': 250, 'gain_db': -2, 'q': 1.5, 'type': 'peak'},

            # Présence mids
            {'freq': 3000, 'gain_db': 1, 'q': 1.0, 'type': 'peak'},

            # Air
            {'freq': 12000, 'gain_db': 1.5, 'q': 0.7, 'type': 'high_shelf'},
        ]

        return self.parametric_eq(audio, bands)


# Exemple
eq = MasteringEQ()
eq_bands = [
    {'freq': 60, 'gain_db': 2, 'q': 1.5, 'type': 'peak'},
    {'freq': 300, 'gain_db': -1.5, 'q': 2, 'type': 'peak'},
    {'freq': 10000, 'gain_db': 2, 'q': 0.7, 'type': 'high_shelf'}
]
```

## Compression de Mastering

### Compresseur Multiband

```python
class MasteringCompressor:
    """
    Compression pour mastering avec options multiband.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def compress(self, audio, threshold_db=-10, ratio=4,
                 attack_ms=10, release_ms=100, knee_db=6):
        """
        Compression single-band avec knee souple.
        """
        # Conversion en dB
        audio_db = 20 * np.log10(np.abs(audio) + 1e-10)

        # Calcul du gain reduction
        gain_reduction_db = np.zeros_like(audio_db)

        for i, level in enumerate(audio_db):
            if level > threshold_db + knee_db/2:
                # Au-dessus du knee
                gain_reduction_db[i] = (level - threshold_db) * (1 - 1/ratio)
            elif level > threshold_db - knee_db/2:
                # Dans le knee (soft knee)
                x = level - threshold_db + knee_db/2
                gain_reduction_db[i] = (x**2 / (2 * knee_db)) * (1 - 1/ratio)
            # En-dessous: pas de réduction

        # Envelope follower (attack/release)
        attack_coef = np.exp(-1 / (attack_ms * self.sr / 1000))
        release_coef = np.exp(-1 / (release_ms * self.sr / 1000))

        envelope = np.zeros_like(gain_reduction_db)
        envelope[0] = gain_reduction_db[0]

        for i in range(1, len(gain_reduction_db)):
            if gain_reduction_db[i] > envelope[i-1]:
                coef = attack_coef
            else:
                coef = release_coef
            envelope[i] = coef * envelope[i-1] + (1 - coef) * gain_reduction_db[i]

        # Appliquer la réduction de gain
        gain_linear = 10 ** (-envelope / 20)
        return audio * gain_linear

    def multiband_compress(self, audio, bands_config):
        """
        Compression multiband.

        bands_config: liste de dicts avec 'low', 'high', et paramètres de compression
        """
        nyq = self.sr / 2
        output = np.zeros_like(audio)

        for band in bands_config:
            low = band['low']
            high = band['high']

            # Filtrage
            if low == 0:
                b, a = signal.butter(4, high/nyq, btype='low')
            elif high >= nyq:
                b, a = signal.butter(4, low/nyq, btype='high')
            else:
                b, a = signal.butter(4, [low/nyq, high/nyq], btype='band')

            band_audio = signal.lfilter(b, a, audio)

            # Compression de la bande
            compressed = self.compress(
                band_audio,
                threshold_db=band.get('threshold', -10),
                ratio=band.get('ratio', 4),
                attack_ms=band.get('attack', 10),
                release_ms=band.get('release', 100)
            )

            # Makeup gain
            makeup = band.get('makeup_db', 0)
            compressed *= 10 ** (makeup / 20)

            output += compressed

        return output

    def bass_music_multiband(self, audio):
        """
        Preset multiband pour bass music.
        """
        bands = [
            {
                'low': 0, 'high': 80,
                'threshold': -12, 'ratio': 3, 'attack': 30, 'release': 200,
                'makeup_db': 1
            },
            {
                'low': 80, 'high': 250,
                'threshold': -15, 'ratio': 4, 'attack': 10, 'release': 100,
                'makeup_db': 0
            },
            {
                'low': 250, 'high': 2000,
                'threshold': -18, 'ratio': 3, 'attack': 5, 'release': 80,
                'makeup_db': 0
            },
            {
                'low': 2000, 'high': 20000,
                'threshold': -20, 'ratio': 2.5, 'attack': 2, 'release': 50,
                'makeup_db': 1
            }
        ]

        return self.multiband_compress(audio, bands)


compressor = MasteringCompressor()
```

## Saturation et Harmoniques

### Saturation Analogique

```python
class MasteringSaturation:
    """
    Saturation pour warmth et cohésion.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def tape_saturation(self, audio, drive=0.3, bias=0.1):
        """
        Émulation de saturation tape.

        drive: quantité de saturation (0-1)
        bias: asymétrie (ajoute harmoniques paires)
        """
        # Soft clipping avec bias pour asymétrie
        biased = audio + bias
        saturated = np.tanh(drive * 3 * biased)

        # Retirer le DC offset
        saturated = saturated - np.mean(saturated)

        # Mix wet/dry
        return (1 - drive) * audio + drive * saturated

    def tube_saturation(self, audio, drive=0.5):
        """
        Émulation de saturation tube.

        Caractéristique: harmoniques paires, soft clipping asymétrique.
        """
        # Fonction de transfert tube (approximation)
        def tube_transfer(x, drive):
            # Waveshaping asymétrique
            return np.where(x >= 0,
                           np.tanh(drive * x),
                           np.tanh(drive * x * 0.8))

        return tube_transfer(audio, 1 + drive * 3)

    def harmonic_exciter(self, audio, amount=0.2, freq_threshold=2000):
        """
        Exciter d'harmoniques hautes fréquences.

        Ajoute de la brillance sans simplement booster les aigus.
        """
        nyq = self.sr / 2

        # Isoler les hautes fréquences
        b, a = signal.butter(2, freq_threshold/nyq, btype='high')
        highs = signal.lfilter(b, a, audio)

        # Générer des harmoniques par saturation douce
        excited = np.tanh(3 * highs)

        # Mélanger
        return audio + amount * excited

    def multiband_saturation(self, audio, low_drive=0.1, mid_drive=0.2, high_drive=0.15):
        """
        Saturation différente par bande.
        """
        nyq = self.sr / 2

        # Split
        b_low, a_low = signal.butter(4, 200/nyq, btype='low')
        b_mid, a_mid = signal.butter(4, [200/nyq, 2000/nyq], btype='band')
        b_high, a_high = signal.butter(4, 2000/nyq, btype='high')

        low = signal.lfilter(b_low, a_low, audio)
        mid = signal.lfilter(b_mid, a_mid, audio)
        high = signal.lfilter(b_high, a_high, audio)

        # Saturer chaque bande
        low_sat = self.tape_saturation(low, low_drive)
        mid_sat = self.tape_saturation(mid, mid_drive)
        high_sat = self.tube_saturation(high, high_drive)

        return low_sat + mid_sat + high_sat


saturation = MasteringSaturation()
```

## Limiting Final

### Limiter Brick-Wall

```python
class MasteringLimiter:
    """
    Limiter pour maximiser le loudness sans distorsion.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def limit(self, audio, ceiling_db=-0.3, release_ms=100):
        """
        Limiter brick-wall avec lookahead.
        """
        ceiling_linear = 10 ** (ceiling_db / 20)

        # Lookahead pour éviter les transitoires qui passent
        lookahead_samples = int(0.005 * self.sr)  # 5ms

        # Calculer le gain nécessaire
        peak_envelope = np.zeros_like(audio)

        # Détection de pic avec lookahead
        for i in range(len(audio)):
            start = max(0, i - lookahead_samples)
            end = min(len(audio), i + lookahead_samples)
            peak_envelope[i] = np.max(np.abs(audio[start:end]))

        # Gain reduction
        gain = np.ones_like(audio)
        mask = peak_envelope > ceiling_linear
        gain[mask] = ceiling_linear / peak_envelope[mask]

        # Smooth le gain (release)
        release_coef = np.exp(-1 / (release_ms * self.sr / 1000))
        smoothed_gain = np.zeros_like(gain)
        smoothed_gain[0] = gain[0]

        for i in range(1, len(gain)):
            if gain[i] < smoothed_gain[i-1]:
                smoothed_gain[i] = gain[i]  # Instant attack
            else:
                smoothed_gain[i] = release_coef * smoothed_gain[i-1] + (1 - release_coef) * gain[i]

        return audio * smoothed_gain

    def loudness_maximize(self, audio, target_lufs=-9, ceiling_db=-0.3):
        """
        Maximise le loudness vers une cible LUFS.
        """
        analyzer = MasteringAnalyzer(self.sr)

        # Mesurer le LUFS actuel
        current_lufs = analyzer.measure_lufs(audio)

        # Calculer le gain nécessaire
        gain_needed_db = target_lufs - current_lufs

        # Appliquer le gain
        gained = audio * (10 ** (gain_needed_db / 20))

        # Limiter
        limited = self.limit(gained, ceiling_db)

        # Vérifier
        final_lufs = analyzer.measure_lufs(limited)

        return limited, {
            'original_lufs': current_lufs,
            'target_lufs': target_lufs,
            'final_lufs': final_lufs,
            'gain_applied_db': gain_needed_db
        }


limiter = MasteringLimiter()
```

## Chaîne Complète

### Assemblage

```python
class MasteringChain:
    """
    Chaîne de mastering complète pour bass music.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate
        self.analyzer = MasteringAnalyzer(sample_rate)
        self.eq = MasteringEQ(sample_rate)
        self.compressor = MasteringCompressor(sample_rate)
        self.saturation = MasteringSaturation(sample_rate)
        self.limiter = MasteringLimiter(sample_rate)

    def process(self, audio, target_lufs=-9, ceiling=-0.3,
                use_multiband=True, saturation_amount=0.15):
        """
        Traite l'audio à travers la chaîne complète.
        """
        # Analyse initiale
        initial_analysis = {
            'lufs': self.analyzer.measure_lufs(audio),
            'dr': self.analyzer.measure_dynamic_range(audio),
            'spectrum': self.analyzer.analyze_spectrum_balance(audio)
        }

        # 1. EQ correctif
        processed = self.eq.bass_music_preset(audio)

        # 2. Compression
        if use_multiband:
            processed = self.compressor.bass_music_multiband(processed)
        else:
            processed = self.compressor.compress(processed, threshold_db=-12, ratio=3)

        # 3. Saturation
        processed = self.saturation.multiband_saturation(
            processed,
            low_drive=saturation_amount * 0.5,
            mid_drive=saturation_amount,
            high_drive=saturation_amount * 0.7
        )

        # 4. Limiting et loudness
        processed, loudness_info = self.limiter.loudness_maximize(
            processed, target_lufs, ceiling
        )

        # Analyse finale
        final_analysis = {
            'lufs': self.analyzer.measure_lufs(processed),
            'dr': self.analyzer.measure_dynamic_range(processed),
            'spectrum': self.analyzer.analyze_spectrum_balance(processed),
            'true_peak': self.analyzer.check_true_peak(processed)
        }

        return processed, {
            'initial': initial_analysis,
            'final': final_analysis,
            'loudness': loudness_info
        }

    def genre_preset(self, audio, genre='neurofunk'):
        """
        Presets par genre.
        """
        presets = {
            'dubstep': {
                'target_lufs': -8,
                'ceiling': -0.3,
                'saturation_amount': 0.2
            },
            'neurofunk': {
                'target_lufs': -7,
                'ceiling': -0.3,
                'saturation_amount': 0.15
            },
            'liquid': {
                'target_lufs': -10,
                'ceiling': -0.5,
                'saturation_amount': 0.1
            },
            'jump_up': {
                'target_lufs': -7,
                'ceiling': -0.3,
                'saturation_amount': 0.25
            }
        }

        params = presets.get(genre, presets['neurofunk'])
        return self.process(audio, **params)


# Utilisation
chain = MasteringChain()

# Exemple
t = np.linspace(0, 10, 441000)
test_mix = 0.5 * np.sin(2*np.pi*55*t)
test_mix += 0.3 * np.sin(2*np.pi*110*t)
test_mix += 0.2 * np.sin(2*np.pi*1000*t)
test_mix += 0.1 * np.random.randn(len(t))

mastered, report = chain.genre_preset(test_mix, 'neurofunk')

print("Rapport de mastering:")
print(f"  LUFS initial: {report['initial']['lufs']:.1f}")
print(f"  LUFS final: {report['final']['lufs']:.1f}")
print(f"  DR initial: {report['initial']['dr']:.1f} dB")
print(f"  DR final: {report['final']['dr']:.1f} dB")
print(f"  True Peak: {report['final']['true_peak']['true_peak_db']:.1f} dBFS")
```

## Connexion au Paradigme 140-174 BPM

### Considérations Spécifiques

```python
def bass_music_mastering_guidelines():
    """
    Guidelines de mastering par tempo.
    """
    return {
        '140_dubstep': {
            'target_lufs': (-9, -7),
            'sub_emphasis': 'High - sub est roi',
            'compression': 'Aggressive sur mids, gentle sur sub',
            'saturation': 'Medium sur mids pour growl',
            'notes': 'Laisser de la place pour le sub, éviter le mud 200-300 Hz'
        },
        '160_jump_up': {
            'target_lufs': (-8, -6),
            'sub_emphasis': 'Medium-High',
            'compression': 'Fast attack, medium release',
            'saturation': 'Heavy pour l\'énergie',
            'notes': 'Plus d\'agressivité, sub peut être plus tight'
        },
        '174_neurofunk': {
            'target_lufs': (-8, -6),
            'sub_emphasis': 'Clean et précis',
            'compression': 'Précise, preserve transients',
            'saturation': 'Subtle, pour cohésion',
            'notes': 'Clarté maximale, séparation des éléments'
        }
    }


for tempo, guidelines in bass_music_mastering_guidelines().items():
    print(f"\n{tempo}:")
    for key, value in guidelines.items():
        print(f"  {key}: {value}")
```

## Exercices Pratiques

1. **Analyse A/B**: Comparer un master pro vs un mix non masteré
2. **EQ Matching**: Reproduire la courbe EQ d'une référence
3. **Compression Settings**: Trouver les settings optimaux pour préserver le punch
4. **Loudness War**: Comparer -7 LUFS vs -12 LUFS et évaluer la qualité

---

*Le mastering est l'art de la subtilité - de petits ajustements qui font une grande différence dans l'impact final du track.*
