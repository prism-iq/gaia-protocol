# Scripts - Utilitaires Rhapsody

## Fractales Audio-Réactives

Visualiseur de fractales qui réagit à l'audio.

### Installation

```bash
pip install moderngl glfw numpy sounddevice
```

### Usage

```bash
python ~/scripts/rhapsody-fractals.py
# Ou: Super + M
```

### Contrôles

| Touche | Action |
|--------|--------|
| SPACE | Pause |
| R | Randomiser |
| F | Plein écran |
| 1-9 | Changer formule |
| C | Changer couleurs |
| ESC | Quitter |

### Formules Fractales

1. Mandelbrot classique
2. Julia set
3. Burning Ship
4. Tricorn
5. Phoenix
6. Newton
7. Magnet
8. Custom φ
9. Ouroboros

## Audio Engine

Génération et amélioration audio.

### Installation

```bash
pip install numpy scipy soundfile
```

### Générer de l'ambient

```bash
python ~/scripts/rhapsody-audio.py --generate ambient -d 120
```

### Améliorer un fichier

```bash
python ~/scripts/rhapsody-audio.py --enhance song.wav --preset dreamy
```

### Presets

- `dreamy` - Réverb éthérée
- `crisp` - Son clair et net
- `warm` - Tons chauds
- `dark` - Tons sombres
- `phi` - Basé sur φ

## Peripherals

Gestion des périphériques (Stream Deck, etc.)

```bash
python ~/scripts/peripherals.py
```

## KILLSWITCH

Tue le processus le plus gourmand.

```bash
# Super + Backspace
~/scripts/killswitch.sh
```

## Zoe Toggle

Basculer l'interface Zoe.

```bash
~/scripts/zoe-toggle.sh
```

## Création de Scripts

### Template

```python
#!/usr/bin/env python3
"""
Script Rhapsody - Description
φ proportions | Local-first
"""

import sys
from pathlib import Path

PHI = 1.618033988749895

def main():
    pass

if __name__ == "__main__":
    main()
```

### Bonnes Pratiques

1. Shebang Python3
2. Docstring avec description
3. Constante PHI si pertinent
4. Pas de dépendances cloud
5. Gestion des erreurs gracieuse
