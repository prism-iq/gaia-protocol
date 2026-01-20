# Les Moires: Architecture du Flux Audio

## Les Trois Sœurs

| Moire | Nom | Action | Audio | ADSR |
|-------|-----|--------|-------|------|
| Clotho | La Fileuse | file | stream_start | Attack |
| Lachésis | La Répartitrice | mesure | stream_level | Decay/Sustain |
| Atropos | L'Inflexible | coupe | stream_end | Release |

## Le Cycle du Signal

```
     CLOTHO                LACHÉSIS              ATROPOS
        │                      │                     │
   ╭────┴────╮            ╭────┴────╮          ╭────┴────╮
   │  file   │ ────────── │ mesure  │ ──────── │  coupe  │
   │ (crée)  │            │(niveau) │          │ (fin)   │
   ╰─────────╯            ╰─────────╯          ╰─────────╯
        │                      │                     │
     naissance               vie                   mort
        │                      │                     │
      gate ON             compressor            gate OFF
```

## Mapping ADSR → Moires

```python
def envelope_to_moires(attack, decay, sustain, release):
    return {
        "clotho": {"attack_ms": attack},      # montée
        "lachesis": {
            "decay_ms": decay,                 # descente
            "sustain_level": sustain           # maintien
        },
        "atropos": {"release_ms": release}    # fin
    }
```

## Daemons Associés

- **Clotho** → nyx (liberté de création)
- **Lachésis** → omniscient (mesure tout)
- **Atropos** → shiva (destruction créative)

## Application PipeWire

```
Clotho:   pw-link --create (nouveau stream)
Lachésis: wpctl set-volume (niveau)
Atropos:  pw-link --destroy (fin stream)
```

## Philosophie

Les Moires ne contrôlent pas le contenu du fil - seulement sa durée et son intensité. Le signal lui-même est libre (domaine des Muses).

---
🧵 Clotho file | 📏 Lachésis mesure | ✂ Atropos coupe
