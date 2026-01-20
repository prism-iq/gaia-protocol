# Analyse Spectrale: Décoder le Contenu Fréquentiel

## Fondements Théoriques

L'analyse spectrale décompose un signal audio en ses composantes fréquentielles. Outil essentiel pour le sound design et le mastering dans la bass music à 140-174 BPM.

## Transformée de Fourier

### Théorie

La transformée de Fourier exprime tout signal comme somme de sinusoïdes:

```
X(f) = ∫ x(t) × e^(-2πift) dt

Où:
- x(t) = signal temporel
- X(f) = spectre fréquentiel
- f = fréquence
- i = unité imaginaire
```

### Implémentation Python

```python
import numpy as np
from scipy.fft import fft, fftfreq, rfft, rfftfreq
from scipy import signal
import matplotlib.pyplot as plt

class SpectralAnalyzer:
    """
    Analyseur spectral complet pour audio.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def compute_spectrum(self, audio, window='hann'):
        """
        Calcule le spectre de magnitude.

        window: type de fenêtrage ('hann', 'hamming', 'blackman')
        """
        n = len(audio)

        # Application du fenêtrage
        if window == 'hann':
            w = np.hanning(n)
        elif window == 'hamming':
            w = np.hamming(n)
        elif window == 'blackman':
            w = np.blackman(n)
        else:
            w = np.ones(n)

        windowed = audio * w

        # FFT (partie réelle seulement pour signal réel)
        spectrum = rfft(windowed)
        frequencies = rfftfreq(n, 1/self.sr)

        # Magnitude en dB
        magnitude = np.abs(spectrum)
        magnitude_db = 20 * np.log10(magnitude + 1e-10)

        # Phase
        phase = np.angle(spectrum)

        return {
            'frequencies': frequencies,
            'magnitude': magnitude,
            'magnitude_db': magnitude_db,
            'phase': phase,
            'complex_spectrum': spectrum
        }

    def compute_spectrogram(self, audio, frame_size=2048,
                            hop_size=512, window='hann'):
        """
        Calcule le spectrogramme (spectre évoluant dans le temps).

        STFT - Short-Time Fourier Transform
        """
        # Nombre de frames
        n_frames = (len(audio) - frame_size) // hop_size + 1

        # Fenêtre
        if window == 'hann':
            w = np.hanning(frame_size)
        else:
            w = np.ones(frame_size)

        # Initialisation
        n_bins = frame_size // 2 + 1
        spectrogram = np.zeros((n_bins, n_frames))

        for i in range(n_frames):
            start = i * hop_size
            frame = audio[start:start + frame_size] * w
            spectrum = np.abs(rfft(frame))
            spectrogram[:, i] = 20 * np.log10(spectrum + 1e-10)

        frequencies = rfftfreq(frame_size, 1/self.sr)
        times = np.arange(n_frames) * hop_size / self.sr

        return {
            'spectrogram': spectrogram,
            'frequencies': frequencies,
            'times': times,
            'frame_size': frame_size,
            'hop_size': hop_size
        }

    def find_peaks(self, magnitude, frequencies, n_peaks=10,
                   min_distance_hz=50):
        """
        Trouve les pics spectraux (harmoniques dominantes).
        """
        from scipy.signal import find_peaks as scipy_peaks

        # Convertir distance minimale en bins
        freq_resolution = frequencies[1] - frequencies[0]
        min_distance_bins = int(min_distance_hz / freq_resolution)

        peaks_idx, properties = scipy_peaks(magnitude,
                                            distance=min_distance_bins,
                                            height=np.max(magnitude)*0.01)

        # Trier par magnitude
        sorted_idx = np.argsort(magnitude[peaks_idx])[::-1]
        top_peaks = peaks_idx[sorted_idx[:n_peaks]]

        return [{
            'frequency': frequencies[idx],
            'magnitude': magnitude[idx],
            'magnitude_db': 20 * np.log10(magnitude[idx] + 1e-10)
        } for idx in top_peaks]

    def spectral_centroid(self, magnitude, frequencies):
        """
        Calcule le centroïde spectral (centre de masse fréquentiel).

        Mesure de la "brillance" du son.
        """
        return np.sum(frequencies * magnitude) / np.sum(magnitude)

    def spectral_bandwidth(self, magnitude, frequencies, centroid=None):
        """
        Calcule la largeur de bande spectrale.

        Mesure de l'étalement fréquentiel.
        """
        if centroid is None:
            centroid = self.spectral_centroid(magnitude, frequencies)

        variance = np.sum(magnitude * (frequencies - centroid)**2) / np.sum(magnitude)
        return np.sqrt(variance)

    def spectral_rolloff(self, magnitude, frequencies, percentile=0.85):
        """
        Fréquence en dessous de laquelle se trouve X% de l'énergie.
        """
        cumsum = np.cumsum(magnitude**2)
        threshold = percentile * cumsum[-1]
        idx = np.where(cumsum >= threshold)[0][0]
        return frequencies[idx]


# Exemple d'utilisation
analyzer = SpectralAnalyzer(44100)

# Génération d'un signal test (basse avec harmoniques)
t = np.linspace(0, 1, 44100)
test_signal = np.sin(2*np.pi*55*t)  # Fondamentale
test_signal += 0.5 * np.sin(2*np.pi*110*t)  # 2ème harmonique
test_signal += 0.25 * np.sin(2*np.pi*165*t)  # 3ème harmonique
test_signal += 0.1 * np.sin(2*np.pi*220*t)  # 4ème harmonique

spectrum = analyzer.compute_spectrum(test_signal)
peaks = analyzer.find_peaks(spectrum['magnitude'], spectrum['frequencies'])

print("Pics spectraux détectés:")
for p in peaks[:5]:
    print(f"  {p['frequency']:.1f} Hz: {p['magnitude_db']:.1f} dB")
```

## Analyse Spectrale pour Bass Music

### Zones Fréquentielles Critiques

```python
class BassMusicSpectralAnalysis:
    """
    Analyse spectrale spécialisée pour bass music 140-174 BPM.
    """

    # Bandes fréquentielles standard
    FREQUENCY_BANDS = {
        'sub_bass': (20, 60),
        'bass': (60, 150),
        'low_mids': (150, 400),
        'mids': (400, 2000),
        'upper_mids': (2000, 6000),
        'highs': (6000, 20000)
    }

    # Cibles de niveau pour bass music (relatif au pic)
    TARGET_LEVELS = {
        'sub_bass': -6,    # Fort mais contrôlé
        'bass': -3,        # Zone dominante
        'low_mids': -6,    # Présence
        'mids': -12,       # Espace pour vocals/leads
        'upper_mids': -15, # Attaque, présence
        'highs': -24       # Air
    }

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate
        self.analyzer = SpectralAnalyzer(sample_rate)

    def analyze_band_energy(self, audio):
        """
        Analyse l'énergie par bande fréquentielle.
        """
        spectrum = self.analyzer.compute_spectrum(audio)
        freqs = spectrum['frequencies']
        mag = spectrum['magnitude']

        band_energy = {}

        for band_name, (low, high) in self.FREQUENCY_BANDS.items():
            mask = (freqs >= low) & (freqs < high)
            energy = np.sum(mag[mask]**2)
            energy_db = 10 * np.log10(energy + 1e-10)
            band_energy[band_name] = {
                'energy': energy,
                'energy_db': energy_db,
                'freq_range': (low, high)
            }

        # Normaliser par rapport au max
        max_energy_db = max(b['energy_db'] for b in band_energy.values())
        for band in band_energy:
            band_energy[band]['relative_db'] = band_energy[band]['energy_db'] - max_energy_db

        return band_energy

    def compare_to_target(self, band_energy):
        """
        Compare le mix actuel aux cibles.
        """
        comparison = {}

        for band_name, target_db in self.TARGET_LEVELS.items():
            actual_db = band_energy[band_name]['relative_db']
            difference = actual_db - target_db

            if abs(difference) < 3:
                status = "OK"
            elif difference > 0:
                status = "TROP FORT"
            else:
                status = "TROP FAIBLE"

            comparison[band_name] = {
                'target_db': target_db,
                'actual_db': actual_db,
                'difference': difference,
                'status': status
            }

        return comparison

    def detect_frequency_masking(self, audio, threshold_db=-20):
        """
        Détecte les zones de masquage fréquentiel potentiel.

        Le masquage se produit quand des fréquences proches
        se couvrent mutuellement.
        """
        spectrum = self.analyzer.compute_spectrum(audio)
        freqs = spectrum['frequencies']
        mag_db = spectrum['magnitude_db']

        # Trouver les pics
        peaks = self.analyzer.find_peaks(spectrum['magnitude'], freqs, n_peaks=20)

        masking_issues = []

        for i, peak1 in enumerate(peaks):
            for peak2 in peaks[i+1:]:
                freq1, freq2 = peak1['frequency'], peak2['frequency']

                # Bande critique (approximation de Bark)
                bark1 = 13 * np.arctan(0.00076*freq1) + 3.5*np.arctan((freq1/7500)**2)
                bark2 = 13 * np.arctan(0.00076*freq2) + 3.5*np.arctan((freq2/7500)**2)

                # Si dans la même bande critique et niveaux similaires
                if abs(bark1 - bark2) < 1:
                    level_diff = abs(peak1['magnitude_db'] - peak2['magnitude_db'])
                    if level_diff < 6:
                        masking_issues.append({
                            'freq1': freq1,
                            'freq2': freq2,
                            'level_diff_db': level_diff,
                            'recommendation': f"Considérer EQ cut autour de {min(freq1,freq2):.0f}-{max(freq1,freq2):.0f} Hz"
                        })

        return masking_issues

    def analyze_sub_bass_quality(self, audio):
        """
        Analyse spécifique de la qualité du sub bass.
        """
        spectrum = self.analyzer.compute_spectrum(audio)
        freqs = spectrum['frequencies']
        mag = spectrum['magnitude']
        mag_db = spectrum['magnitude_db']

        # Isoler la zone sub (20-60 Hz)
        sub_mask = (freqs >= 20) & (freqs <= 60)
        sub_freqs = freqs[sub_mask]
        sub_mag = mag[sub_mask]

        # Trouver la fondamentale du sub
        if len(sub_mag) > 0:
            fund_idx = np.argmax(sub_mag)
            fundamental = sub_freqs[fund_idx]
        else:
            fundamental = None

        # Vérifier la pureté (ratio fondamentale/harmoniques dans sub range)
        if fundamental:
            fund_energy = sub_mag[fund_idx]**2
            total_sub_energy = np.sum(sub_mag**2)
            purity = fund_energy / total_sub_energy
        else:
            purity = 0

        # Vérifier la phase (idéalement mono en dessous de 80 Hz)
        # Ceci nécessiterait un signal stéréo

        return {
            'fundamental_freq': fundamental,
            'sub_purity': purity,
            'purity_assessment': 'CLEAN' if purity > 0.8 else 'MUDDY' if purity > 0.5 else 'TRÈS MUDDY',
            'recommendation': 'Sub est propre' if purity > 0.8 else 'Considérer high-pass sur autres éléments'
        }


# Utilisation
bass_analyzer = BassMusicSpectralAnalysis()

# Test avec un signal de basse
t = np.linspace(0, 2, 88200)
test_bass = np.sin(2*np.pi*40*t)  # Sub à 40 Hz
test_bass += 0.3 * np.sin(2*np.pi*80*t)  # Harmonique
test_bass += 0.1 * np.random.randn(len(t))  # Bruit

band_energy = bass_analyzer.analyze_band_energy(test_bass)
print("\nÉnergie par bande:")
for band, data in band_energy.items():
    print(f"  {band}: {data['relative_db']:.1f} dB (relative)")

comparison = bass_analyzer.compare_to_target(band_energy)
print("\nComparaison aux cibles:")
for band, data in comparison.items():
    print(f"  {band}: {data['status']} ({data['difference']:+.1f} dB)")
```

## Spectrogramme et Analyse Temporelle

### Visualisation de l'Évolution Spectrale

```python
class SpectrogramAnalysis:
    """
    Analyse via spectrogramme pour observer l'évolution temporelle.
    """

    def __init__(self, sample_rate=44100):
        self.sr = sample_rate

    def compute_mel_spectrogram(self, audio, n_mels=128,
                                 frame_size=2048, hop_size=512):
        """
        Spectrogramme en échelle Mel (plus proche de la perception).
        """
        # STFT
        n_frames = (len(audio) - frame_size) // hop_size + 1
        window = np.hanning(frame_size)

        stft = np.zeros((frame_size//2 + 1, n_frames), dtype=complex)

        for i in range(n_frames):
            start = i * hop_size
            frame = audio[start:start + frame_size] * window
            stft[:, i] = rfft(frame)

        # Power spectrum
        power = np.abs(stft)**2

        # Mel filterbank
        freqs = rfftfreq(frame_size, 1/self.sr)
        mel_filters = self._create_mel_filterbank(freqs, n_mels)

        # Appliquer les filtres
        mel_spec = np.dot(mel_filters, power)
        mel_spec_db = 10 * np.log10(mel_spec + 1e-10)

        times = np.arange(n_frames) * hop_size / self.sr

        return {
            'mel_spectrogram': mel_spec_db,
            'times': times,
            'n_mels': n_mels
        }

    def _create_mel_filterbank(self, freqs, n_mels, f_min=20, f_max=20000):
        """
        Crée une banque de filtres Mel.
        """
        def hz_to_mel(hz):
            return 2595 * np.log10(1 + hz/700)

        def mel_to_hz(mel):
            return 700 * (10**(mel/2595) - 1)

        mel_min = hz_to_mel(f_min)
        mel_max = hz_to_mel(f_max)
        mel_points = np.linspace(mel_min, mel_max, n_mels + 2)
        hz_points = mel_to_hz(mel_points)

        filterbank = np.zeros((n_mels, len(freqs)))

        for i in range(n_mels):
            left = hz_points[i]
            center = hz_points[i + 1]
            right = hz_points[i + 2]

            for j, f in enumerate(freqs):
                if left <= f <= center:
                    filterbank[i, j] = (f - left) / (center - left)
                elif center < f <= right:
                    filterbank[i, j] = (right - f) / (right - center)

        return filterbank

    def detect_transients(self, audio, threshold=0.5):
        """
        Détecte les transitoires via analyse spectrale.

        Les transitoires ont un spectre large bande et une
        augmentation rapide d'énergie.
        """
        frame_size = 1024
        hop_size = 256

        n_frames = (len(audio) - frame_size) // hop_size + 1
        energy = np.zeros(n_frames)
        spectral_flux = np.zeros(n_frames)

        prev_spectrum = None

        for i in range(n_frames):
            start = i * hop_size
            frame = audio[start:start + frame_size]
            spectrum = np.abs(rfft(frame))

            energy[i] = np.sum(spectrum**2)

            if prev_spectrum is not None:
                # Spectral flux = sum of positive differences
                diff = spectrum - prev_spectrum
                spectral_flux[i] = np.sum(np.maximum(diff, 0))

            prev_spectrum = spectrum.copy()

        # Normaliser
        spectral_flux = spectral_flux / np.max(spectral_flux + 1e-10)

        # Trouver les pics (transitoires)
        from scipy.signal import find_peaks
        peaks, _ = find_peaks(spectral_flux, height=threshold, distance=5)

        times = peaks * hop_size / self.sr

        return {
            'transient_times': times,
            'spectral_flux': spectral_flux,
            'n_transients': len(peaks)
        }

    def analyze_wobble_modulation(self, audio, expected_rate_hz=None):
        """
        Analyse la modulation d'un wobble bass.

        Détecte le rate de modulation via analyse de l'enveloppe spectrale.
        """
        # Filtrer la bande mid (150-400 Hz) où le wobble est le plus visible
        from scipy.signal import butter, filtfilt

        nyq = self.sr / 2
        b, a = butter(4, [150/nyq, 400/nyq], btype='band')
        mid_band = filtfilt(b, a, audio)

        # Extraire l'enveloppe
        analytic = np.abs(signal.hilbert(mid_band))

        # FFT de l'enveloppe pour trouver le rate de modulation
        envelope_fft = np.abs(rfft(analytic))
        envelope_freqs = rfftfreq(len(analytic), 1/self.sr)

        # Chercher dans la plage 0.5-20 Hz
        mask = (envelope_freqs > 0.5) & (envelope_freqs < 20)
        masked_fft = envelope_fft.copy()
        masked_fft[~mask] = 0

        mod_freq = envelope_freqs[np.argmax(masked_fft)]

        return {
            'detected_modulation_rate_hz': mod_freq,
            'expected_rate_hz': expected_rate_hz,
            'match': abs(mod_freq - expected_rate_hz) < 0.5 if expected_rate_hz else None
        }


# Exemple avec wobble simulé
spectro = SpectrogramAnalysis()

# Créer un wobble bass test
t = np.linspace(0, 2, 88200)
carrier = np.sin(2*np.pi*80*t)
for h in range(2, 6):
    carrier += (1/h) * np.sin(2*np.pi*80*h*t)

# Modulation à 2 Hz
mod_freq = 2
modulator = 0.5 + 0.5 * np.sin(2*np.pi*mod_freq*t)
wobble = carrier * modulator

result = spectro.analyze_wobble_modulation(wobble, expected_rate_hz=2)
print(f"\nAnalyse wobble:")
print(f"  Rate détecté: {result['detected_modulation_rate_hz']:.2f} Hz")
print(f"  Rate attendu: {result['expected_rate_hz']} Hz")
```

## Connexion au Paradigme 140-174 BPM

### Analyse Spectrale Tempo-Synchronisée

```python
def tempo_synced_spectral_analysis(audio, bpm, sample_rate=44100):
    """
    Analyse spectrale synchronisée au tempo.

    Utile pour voir comment le spectre évolue à travers le groove.
    """
    beat_samples = int(sample_rate * 60 / bpm)
    bar_samples = beat_samples * 4

    n_bars = len(audio) // bar_samples

    # Spectre moyen par beat dans le bar
    beat_spectra = {i: [] for i in range(4)}

    for bar in range(n_bars):
        bar_start = bar * bar_samples

        for beat in range(4):
            beat_start = bar_start + beat * beat_samples
            beat_audio = audio[beat_start:beat_start + beat_samples]

            if len(beat_audio) == beat_samples:
                spectrum = np.abs(rfft(beat_audio))
                beat_spectra[beat].append(spectrum)

    # Moyenner
    avg_spectra = {}
    for beat, spectra in beat_spectra.items():
        if spectra:
            avg_spectra[beat] = np.mean(spectra, axis=0)

    return {
        'beat_spectra': avg_spectra,
        'frequencies': rfftfreq(beat_samples, 1/sample_rate),
        'bpm': bpm
    }


# Analyse de différents tempos
for bpm in [140, 160, 174]:
    print(f"\nÀ {bpm} BPM:")
    beat_duration = 60/bpm * 1000
    print(f"  Durée beat: {beat_duration:.1f} ms")
    print(f"  Résolution FFT (1 beat): {bpm/60:.1f} Hz")
```

## Exercices Pratiques

1. **Analyse de Mix**: Analyser un track et identifier les problèmes de masquage
2. **Détection Wobble**: Créer un détecteur de rate de wobble automatique
3. **Comparaison Reference**: Comparer le spectre d'un mix à une référence
4. **Transitoire Analysis**: Mapper tous les kicks/snares d'un track via transitoires

---

*L'analyse spectrale est l'oeil qui voit au-delà du son, révélant la structure cachée des fréquences.*
