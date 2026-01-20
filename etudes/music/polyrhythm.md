# Polyrythmie: Superposition des Grilles Temporelles

## Définition

La polyrythmie est la superposition simultanée de deux ou plusieurs patterns rythmiques indépendants. Dans la bass music à 140-174 BPM, elle crée complexité et tension tout en maintenant le groove fondamental.

## Fondements Mathématiques

### Ratios Polyrythmiques

```python
import numpy as np
from math import gcd
from functools import reduce

class PolyrhythmMath:
    """
    Mathématiques des polyrythmes.
    """

    @staticmethod
    def lcm(a, b):
        """Plus petit commun multiple."""
        return abs(a * b) // gcd(a, b)

    @staticmethod
    def lcm_multiple(*args):
        """LCM pour plusieurs nombres."""
        return reduce(PolyrhythmMath.lcm, args)

    @staticmethod
    def polyrhythm_analysis(ratios):
        """
        Analyse un polyrythme.

        ratios: tuple comme (3, 4) pour 3 contre 4
        """
        cycle_length = PolyrhythmMath.lcm_multiple(*ratios)

        patterns = {}
        for r in ratios:
            step = cycle_length // r
            positions = [i * step for i in range(r)]
            patterns[r] = positions

        # Points de coïncidence (où les rythmes se rencontrent)
        all_positions = [set(p) for p in patterns.values()]
        coincidences = set.intersection(*all_positions)

        return {
            'ratios': ratios,
            'cycle_length': cycle_length,
            'patterns': patterns,
            'coincidences': sorted(coincidences),
            'density': sum(len(p) for p in patterns.values()) / cycle_length
        }

    @staticmethod
    def generate_positions(ratio, total_length, bpm):
        """
        Génère les positions temporelles pour un ratio.
        """
        beat_duration = 60 / bpm
        positions = []

        interval = beat_duration / ratio
        current = 0

        while current < total_length:
            positions.append(current)
            current += interval

        return positions


# Analyse de polyrythmes courants
poly_math = PolyrhythmMath()

common_polyrhythms = [
    (2, 3),   # Hemiola
    (3, 4),   # 3 contre 4
    (4, 5),   # 4 contre 5
    (5, 7),   # 5 contre 7
    (7, 8),   # 7 contre 8
    (3, 4, 5) # Triple polyrythme
]

for poly in common_polyrhythms:
    analysis = poly_math.polyrhythm_analysis(poly)
    print(f"\nPolyrythme {poly}:")
    print(f"  Cycle: {analysis['cycle_length']} unités")
    print(f"  Coïncidences: {analysis['coincidences']}")
    print(f"  Densité: {analysis['density']:.2f}")
```

### Visualisation des Polyrythmes

```python
def visualize_polyrhythm(ratio_a, ratio_b, width=48):
    """
    Visualisation ASCII d'un polyrythme.
    """
    cycle = PolyrhythmMath.lcm(ratio_a, ratio_b)

    # Pattern A
    step_a = cycle // ratio_a
    pattern_a = ['.' for _ in range(cycle)]
    for i in range(ratio_a):
        pattern_a[i * step_a] = 'A'

    # Pattern B
    step_b = cycle // ratio_b
    pattern_b = ['.' for _ in range(cycle)]
    for i in range(ratio_b):
        pattern_b[i * step_b] = 'B'

    # Combined
    combined = []
    for i in range(cycle):
        if pattern_a[i] == 'A' and pattern_b[i] == 'B':
            combined.append('X')  # Coïncidence
        elif pattern_a[i] == 'A':
            combined.append('A')
        elif pattern_b[i] == 'B':
            combined.append('B')
        else:
            combined.append('.')

    print(f"\nPolyrythme {ratio_a}:{ratio_b} (cycle = {cycle})")
    print(f"A ({ratio_a}): {''.join(pattern_a)}")
    print(f"B ({ratio_b}): {''.join(pattern_b)}")
    print(f"Mix:    {''.join(combined)}")
    print(f"        {'X = coïncidence'}")


visualize_polyrhythm(3, 4)
visualize_polyrhythm(5, 7)
```

## Polyrythmes dans la Bass Music

### Application au 140-174 BPM

```python
class BassPolyrhythm:
    """
    Implémentation de polyrythmes pour bass music.
    """

    def __init__(self, bpm=174, sample_rate=44100):
        self.bpm = bpm
        self.sr = sample_rate
        self.beat_duration = 60 / bpm

    def generate_polyrhythmic_pattern(self, ratio_a, ratio_b,
                                       bars=4, element='hihat'):
        """
        Génère un pattern polyrythmique.

        ratio_a: divisions principales (ex: 4 pour quarter notes)
        ratio_b: divisions croisées (ex: 3 pour triplets)
        """
        bar_duration = self.beat_duration * 4
        total_duration = bar_duration * bars

        # Positions en secondes
        positions_a = []
        positions_b = []

        # Pattern A
        interval_a = bar_duration / ratio_a
        t = 0
        while t < total_duration:
            positions_a.append(t)
            t += interval_a

        # Pattern B
        interval_b = bar_duration / ratio_b
        t = 0
        while t < total_duration:
            positions_b.append(t)
            t += interval_b

        return {
            'pattern_a': positions_a,
            'pattern_b': positions_b,
            'bpm': self.bpm,
            'bars': bars,
            'ratio': f"{ratio_a}:{ratio_b}"
        }

    def polyrhythmic_wobble(self, freq, ratio_a, ratio_b,
                            duration=4.0):
        """
        Wobble bass avec modulation polyrythmique.

        ratio_a contrôle le filtre, ratio_b contrôle l'amplitude.
        """
        t = np.linspace(0, duration, int(self.sr * duration))
        bar_duration = self.beat_duration * 4

        # LFO A pour le filtre (ratio_a divisions par bar)
        lfo_freq_a = ratio_a / bar_duration
        lfo_a = (np.sin(2 * np.pi * lfo_freq_a * t) + 1) / 2

        # LFO B pour l'amplitude (ratio_b divisions par bar)
        lfo_freq_b = ratio_b / bar_duration
        lfo_b = (np.sin(2 * np.pi * lfo_freq_b * t) + 1) / 2

        # Carrier (sawtooth riche en harmoniques)
        carrier = np.sin(2 * np.pi * freq * t)
        for h in range(2, 8):
            carrier += (1/h) * np.sin(2 * np.pi * freq * h * t)

        # Modulation de filtre simulée (lowpass)
        # Plus lfo_a est haut, plus de harmoniques passent
        from scipy import signal

        output = np.zeros_like(t)
        chunk_size = 512

        for i in range(0, len(t) - chunk_size, chunk_size):
            chunk = carrier[i:i+chunk_size]
            cutoff_normalized = 0.05 + 0.4 * lfo_a[i + chunk_size//2]
            b, a = signal.butter(2, cutoff_normalized, btype='low')
            filtered = signal.lfilter(b, a, chunk)

            # Modulation d'amplitude
            amp = 0.3 + 0.7 * lfo_b[i + chunk_size//2]
            output[i:i+chunk_size] = filtered * amp

        return output / np.max(np.abs(output))

    def euclidean_rhythm(self, pulses, steps):
        """
        Rythme euclidien - distribution optimale de pulses sur steps.

        Fondement mathématique de nombreux rythmes traditionnels.
        Euclidean(3,8) = tresillo, Euclidean(5,8) = cinquillo
        """
        if pulses > steps:
            raise ValueError("Pulses must be <= steps")

        pattern = []
        bucket = 0

        for _ in range(steps):
            bucket += pulses
            if bucket >= steps:
                pattern.append(1)
                bucket -= steps
            else:
                pattern.append(0)

        # Rotation pour commencer sur un pulse
        while pattern[0] == 0:
            pattern = pattern[1:] + pattern[:1]

        return pattern

    def euclidean_polyrhythm(self, euclidean_a, euclidean_b,
                             bars=4, freq=55):
        """
        Combine deux rythmes euclidiens en polyrythme.
        """
        pulses_a, steps_a = euclidean_a
        pulses_b, steps_b = euclidean_b

        pattern_a = self.euclidean_rhythm(pulses_a, steps_a)
        pattern_b = self.euclidean_rhythm(pulses_b, steps_b)

        return {
            'pattern_a': pattern_a,
            'pattern_b': pattern_b,
            'description_a': f"Euclidean({pulses_a},{steps_a})",
            'description_b': f"Euclidean({pulses_b},{steps_b})"
        }


# Démonstration
poly_bass = BassPolyrhythm(bpm=174)

# Euclidean rhythms célèbres
famous_euclidean = [
    (3, 8),   # Tresillo (Cuba)
    (5, 8),   # Cinquillo
    (7, 12),  # West African bell pattern
    (5, 16),  # Bossa nova
    (7, 16),  # DnB variation
]

for pulses, steps in famous_euclidean:
    pattern = poly_bass.euclidean_rhythm(pulses, steps)
    visual = ''.join(['X' if p else '.' for p in pattern])
    print(f"Euclidean({pulses},{steps}): {visual}")
```

## Polyrythmes Classiques dans le DnB/Neurofunk

### Le 3 contre 4

```
À 174 BPM, le 3:4 crée une tension particulière:

4 (quarter notes): X . . . X . . . X . . . X . . .
3 (triplets):      X . . . . X . . . . X . . . . .
Combined:          X . . . . X . . X . . X . . . .
                   1       2     3     4

Le point de coïncidence est au beat 1 de chaque bar.
```

### Implémentation Audio

```python
def generate_polyrhythmic_drums(bpm=174, bars=4, sample_rate=44100):
    """
    Génère un pattern de batterie avec éléments polyrythmiques.
    """
    beat_duration = 60 / bpm
    bar_duration = beat_duration * 4
    total_duration = bar_duration * bars
    total_samples = int(total_duration * sample_rate)

    # Création des signaux
    kick = np.zeros(total_samples)
    snare = np.zeros(total_samples)
    hihat = np.zeros(total_samples)
    perc = np.zeros(total_samples)  # Percussion polyrythmique

    def sample_position(time):
        return int(time * sample_rate)

    def add_hit(signal, position, sound_type='click'):
        """Ajoute un hit à une position."""
        if position >= len(signal):
            return

        # Simple envelope
        duration = int(0.05 * sample_rate)
        env = np.exp(-np.linspace(0, 5, duration))

        if sound_type == 'kick':
            freq = 55
            t = np.arange(duration) / sample_rate
            hit = np.sin(2 * np.pi * freq * t * np.exp(-10*t)) * env
        elif sound_type == 'snare':
            hit = np.random.randn(duration) * env
        elif sound_type == 'hihat':
            hit = np.random.randn(duration) * env * 0.3
        else:
            freq = 220
            t = np.arange(duration) / sample_rate
            hit = np.sin(2 * np.pi * freq * t) * env * 0.5

        end = min(position + duration, len(signal))
        signal[position:end] += hit[:end-position]

    # Pattern principal (4/4)
    for bar in range(bars):
        bar_start = bar * bar_duration

        # Kick sur 1 et 3
        add_hit(kick, sample_position(bar_start), 'kick')
        add_hit(kick, sample_position(bar_start + 2*beat_duration), 'kick')

        # Snare sur 2 et 4
        add_hit(snare, sample_position(bar_start + beat_duration), 'snare')
        add_hit(snare, sample_position(bar_start + 3*beat_duration), 'snare')

        # Hihat en 8th notes
        for i in range(8):
            add_hit(hihat, sample_position(bar_start + i*beat_duration/2), 'hihat')

    # Pattern polyrythmique (3 contre 4 par bar)
    # 3 hits par bar pendant que les autres font 4 beats
    triplet_duration = bar_duration / 3
    t = 0
    while t < total_duration:
        # Éviter les coïncidences exactes avec kick/snare
        pos = sample_position(t)
        add_hit(perc, pos, 'perc')
        t += triplet_duration

    # Mix
    mix = 0.4*kick + 0.35*snare + 0.15*hihat + 0.1*perc
    mix = mix / np.max(np.abs(mix))

    return {
        'mix': mix,
        'kick': kick,
        'snare': snare,
        'hihat': hihat,
        'perc': perc,
        'sample_rate': sample_rate
    }
```

## Polyrythmes Complexes

### Polyrythmes Imbriqués

```python
class NestedPolyrhythm:
    """
    Polyrythmes imbriqués (polyrythmes de polyrythmes).
    """

    def __init__(self, bpm=174):
        self.bpm = bpm
        self.beat = 60 / bpm

    def create_nested(self, outer_ratio, inner_ratio, bars=4):
        """
        Crée un polyrythme imbriqué.

        outer_ratio: polyrythme principal (ex: 3:4)
        inner_ratio: subdivision de chaque partie (ex: 2:3)
        """
        outer_a, outer_b = outer_ratio
        inner_a, inner_b = inner_ratio

        bar_duration = self.beat * 4

        # Outer pattern positions
        outer_positions_a = [i * bar_duration / outer_a
                            for i in range(outer_a)]
        outer_positions_b = [i * bar_duration / outer_b
                            for i in range(outer_b)]

        # Inner subdivisions
        inner_duration_a = bar_duration / outer_a
        inner_duration_b = bar_duration / outer_b

        nested_a = []
        for pos in outer_positions_a:
            for j in range(inner_a):
                nested_a.append(pos + j * inner_duration_a / inner_a)

        nested_b = []
        for pos in outer_positions_b:
            for j in range(inner_b):
                nested_b.append(pos + j * inner_duration_b / inner_b)

        return {
            'layer_a': sorted(nested_a),
            'layer_b': sorted(nested_b),
            'outer': outer_ratio,
            'inner': inner_ratio,
            'total_hits_a': len(nested_a),
            'total_hits_b': len(nested_b)
        }

    def phasing_polyrhythm(self, base_division=16, phase_offset=1,
                           bars=16):
        """
        Polyrythme par phasing (style Steve Reich).

        Deux patterns identiques avec léger décalage qui se déphasent.
        """
        bar_duration = self.beat * 4
        step = bar_duration / base_division

        pattern_a = [i * step for i in range(base_division * bars)]

        # Pattern B légèrement plus long
        step_b = step * (1 + phase_offset/1000)  # Micro-décalage
        pattern_b = [i * step_b for i in range(base_division * bars)]

        return {
            'pattern_a': pattern_a,
            'pattern_b': pattern_b,
            'phase_shift_per_bar': phase_offset * base_division / 1000,
            'full_phase_cycle_bars': 1000 / phase_offset
        }


# Démonstration
nested = NestedPolyrhythm(174)
result = nested.create_nested((3, 4), (2, 3))
print(f"Polyrythme imbriqué (3:4) x (2:3):")
print(f"  Layer A: {result['total_hits_a']} hits")
print(f"  Layer B: {result['total_hits_b']} hits")
```

## Connexion au Paradigme 140-174 BPM

### Densité Polyrythmique par Tempo

```python
def polyrhythm_density_analysis(bpm_range=(140, 174)):
    """
    Analyse comment la densité polyrythmique perçue
    change avec le tempo.
    """
    results = []

    for bpm in range(bpm_range[0], bpm_range[1] + 1, 10):
        beat_ms = 60000 / bpm

        # Pour un 3:4 polyrythme
        interval_3 = beat_ms * 4 / 3  # Intervalle du triplet
        interval_4 = beat_ms           # Intervalle du quarter

        # Plus petit intervalle (determine la densité perçue)
        min_interval = min(interval_3, interval_4)

        # À très haute vitesse, les hits fusionnent perceptuellement
        # Seuil de fusion ~ 50ms
        fusion_threshold = 50

        results.append({
            'bpm': bpm,
            'min_interval_ms': min_interval,
            'near_fusion': min_interval < fusion_threshold,
            'perceptual_density': 1000 / min_interval  # hits/second
        })

    return results


# Affichage
for r in polyrhythm_density_analysis():
    status = "FUSION PROCHE" if r['near_fusion'] else ""
    print(f"{r['bpm']} BPM: min interval = {r['min_interval_ms']:.1f}ms, "
          f"density = {r['perceptual_density']:.1f} hits/s {status}")
```

### Polyrythmes Typiques par Genre

```
Genre          | BPM     | Polyrythmes Caractéristiques
---------------|---------|--------------------------------
Dubstep        | 140     | 2:3 (swing), 4:6 (shuffle)
Jungle         | 160-170 | 3:4, 5:4 (breaks complexes)
Neurofunk      | 174     | 7:8, 5:6 (tension maximale)
Crossbreed     | 170-180 | 4:3 inversé, 6:5
```

## Exercices Pratiques

1. **Euclidean Explorer**: Programmer tous les rythmes euclidiens de 3 à 13 steps
2. **3:4 Programming**: Créer un pattern DnB avec ghost notes en triplets
3. **Nested Complexity**: Implémenter un polyrythme (3:4) x (5:6)
4. **Tempo Morph**: Observer comment un polyrythme change de 140 à 174 BPM

---

*La polyrythmie est le langage secret de la complexité rythmique, permettant de créer des grooves qui échappent à l'analyse consciente tout en captivant l'oreille.*
