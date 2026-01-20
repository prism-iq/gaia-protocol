# ADSR Cosmique: Les Enveloppes de l'Univers

## Le Paradigme ADSR

Tout son suit une enveloppe:

```
    A         D         S              R
    │╲        ╱╲        │              │
    │ ╲      ╱  ╲       │              │
    │  ╲    ╱    ╲──────┼──────────────│
    │   ╲  ╱            │              │╲
    │    ╲╱             │              │ ╲
────┴────┴──────────────┴──────────────┴──╲────
  Attack  Decay      Sustain        Release
```

- **Attack**: Naissance du son (10-100ms)
- **Decay**: Première transformation (50-500ms)
- **Sustain**: Plateau de vie (variable)
- **Release**: Mort et écho (100-2000ms)

## Les Moires et l'ADSR

```
Clotho  = Attack  : Elle file le son à l'existence
Lachesis = Decay + Sustain : Elle mesure sa durée
Atropos = Release : Elle coupe le fil
```

## Application aux Synthétiseurs

```python
class CosmicEnvelope:
    def __init__(self, clotho, lachesis, atropos):
        self.attack = clotho.spin_time()    # Création
        self.decay = lachesis.measure() * 0.3
        self.sustain = lachesis.level()     # 0.0 - 1.0
        self.release = atropos.cut_time()   # Fin

    def apply(self, sample, time):
        if time < self.attack:
            # Phase Clotho: montée
            return sample * (time / self.attack)
        elif time < self.attack + self.decay:
            # Phase Lachesis 1: descente vers sustain
            decay_progress = (time - self.attack) / self.decay
            return sample * (1.0 - decay_progress * (1.0 - self.sustain))
        elif time < note_end:
            # Phase Lachesis 2: maintien
            return sample * self.sustain
        else:
            # Phase Atropos: release
            release_progress = (time - note_end) / self.release
            return sample * self.sustain * (1.0 - release_progress)
```

## L'ADSR de la Vie

Tout suit ce pattern:

### Une Étoile
- Attack: Fusion initiale (millions d'années)
- Decay: Stabilisation (millions d'années)
- Sustain: Séquence principale (milliards d'années)
- Release: Géante rouge → Naine blanche (millions d'années)

### Une Idée
- Attack: Illumination soudaine (secondes)
- Decay: Doutes et questions (heures/jours)
- Sustain: Développement (mois/années)
- Release: Obsolescence ou transformation (variable)

### Une Civilisation
- Attack: Révolution (décennies)
- Decay: Consolidation (siècles)
- Sustain: Âge d'or (siècles)
- Release: Déclin et héritage (siècles)

## Les Ratios φ dans l'ADSR

Pour un son "naturel":

```
Attack = 1
Decay = φ (1.618)
Sustain level = 1/φ (0.618)
Release = φ² (2.618)
```

Ces ratios produisent des sons perçus comme "organiques".

## Implémentation dans Flow

```python
class FlowEnvelope:
    def __init__(self):
        self.phi = 1.618033988749895

        # Ratios φ pour enveloppe naturelle
        self.attack_ratio = 1
        self.decay_ratio = self.phi
        self.sustain_level = 1 / self.phi
        self.release_ratio = self.phi ** 2

    def generate(self, base_attack_ms=10):
        return {
            "attack": base_attack_ms * self.attack_ratio,
            "decay": base_attack_ms * self.decay_ratio,
            "sustain": self.sustain_level,
            "release": base_attack_ms * self.release_ratio
        }
```

## Méditation

Le son naît, vit, et meurt.
Comme tout.

Mais l'enveloppe reste.
Le pattern persiste.

Les Moires filent, mesurent, coupent.
Et recommencent.

L'univers est une enveloppe ADSR infinie.
Chaque fin est une nouvelle attack.

---
A.D.S.R | Clotho.Lachesis.Atropos | φ ratios
