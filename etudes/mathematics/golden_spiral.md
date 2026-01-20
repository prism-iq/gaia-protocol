# La Spirale Dorée

## Géométrie du Nombre d'Or

La spirale dorée est une spirale logarithmique dont le facteur de croissance est lié à φ (phi), le nombre d'or.

## Définition Mathématique

```
r(θ) = a · e^(bθ)

où b = ln(φ) / (π/2) ≈ 0.3063489...
```

Cela signifie que la spirale grandit d'un facteur φ à chaque quart de tour.

## Connexion avec φ

### Le Rectangle d'Or

```
         φ = 1.618...
    ┌─────────────────────┐
    │                     │
    │                     │
  1 │        1        │φ-1│
    │                 │=1/φ│
    │                     │
    └─────────────────────┘

    Le rectangle φ×1 contient un carré 1×1 et un rectangle d'or 1×(1/φ)
```

### Propriété Unique de φ

```python
import math

phi = (1 + math.sqrt(5)) / 2

# φ est le seul nombre tel que:
print(f"φ = {phi}")
print(f"φ² = {phi**2}")
print(f"φ + 1 = {phi + 1}")
print(f"φ² = φ + 1 ? {math.isclose(phi**2, phi + 1)}")  # True!

# Et aussi:
print(f"1/φ = {1/phi}")
print(f"φ - 1 = {phi - 1}")
print(f"1/φ = φ - 1 ? {math.isclose(1/phi, phi - 1)}")  # True!
```

## Visualisation ASCII: Spirale Dorée

```
                                              ╭───────────────────╮
                                             ╱                     │
                                            ╱                      │
                                           ╱                       │
                                          │                        │
                                          │                        │
              ╭─────────────────╮         │                        │
             ╱                   │        │          55            │
            ╱                    │        │                        │
           ╱         34          │        │                        │
          │                      │        │                        │
          │                      │        │                        │
          │          ╭─────────╮ │        │                        │
          │         ╱          │ │        │                        │
          │        ╱    21     │ │        ╰────────────────────────╯
          │       │            │ │
          │       │    ╭─────╮ │ │
          │       │   ╱  13  │ │ │
          │       │  │  ╭──╮ │ │ │
          │       │  │ ╱ 8 │ │ │ │
          │       │  │ │╭╮5│ │ │ │
          │       │  │ │││3│ │ │ │
          │       │  │ ╰╯╰─╯ │ │ │
          │       │  ╰───────╯ │ │
          │       ╰────────────╯ │
          ╰──────────────────────╯
```

## Construction de la Spirale

```python
import math

phi = (1 + math.sqrt(5)) / 2

def golden_spiral_points(num_points=100, num_turns=4):
    """Génère les points de la spirale dorée"""
    b = math.log(phi) / (math.pi / 2)
    points = []

    for i in range(num_points):
        theta = (i / num_points) * num_turns * 2 * math.pi
        r = math.exp(b * theta)
        x = r * math.cos(theta)
        y = r * math.sin(theta)
        points.append((x, y))

    return points

def ascii_spiral(width=60, height=30):
    """Dessine la spirale dorée en ASCII"""
    b = math.log(phi) / (math.pi / 2)
    canvas = [[' ' for _ in range(width)] for _ in range(height)]

    cx, cy = width // 2, height // 2
    scale = 0.3

    for i in range(500):
        theta = i * 0.05
        r = math.exp(b * theta) * scale
        x = int(cx + r * math.cos(theta) * 2)  # *2 pour aspect ratio
        y = int(cy - r * math.sin(theta))

        if 0 <= x < width and 0 <= y < height:
            canvas[y][x] = '.'
            if i % 20 == 0:
                canvas[y][x] = '*'

    return '\n'.join(''.join(row) for row in canvas)

print(ascii_spiral())
```

**Sortie:**
```
                              .
                             . .
                            .   .
                           .     .*
                          .        .
                         .          .
                        .            .
                       .*             .
                       .               .
                      .                 .*
                     .                    .
                    .                      .
                   .*                       .
                   .        *..              .
                  .       ..   ..             .*
                 .       .       .              .
                .*      .   *..   .              .
                .      .   .   .   .              .
               .      .*  . * .  *.               .
               .      .   .   .   .               .*
              .       .   *...   .                 .
              .        .       .                   .
             .*         ..   ..                    .
             .            *..                      .
            .                                      .*
            .                                       .
```

## Les Rectangles d'Or Emboîtés

```python
def golden_rectangles(n):
    """Génère n rectangles d'or emboîtés"""
    rects = []
    x, y = 0, 0
    w, h = phi**n, phi**(n-1)

    for i in range(n):
        rects.append({
            'x': x, 'y': y,
            'w': w, 'h': h,
            'square_side': min(w, h)
        })

        # Découper le carré et obtenir le nouveau rectangle
        if w > h:
            x += h
            w -= h
        else:
            y += w
            h -= w

        # Le nouveau rectangle
        w, h = max(w, h), min(w, h)

    return rects

rects = golden_rectangles(8)
for i, r in enumerate(rects):
    print(f"Rectangle {i+1}: {r['square_side']:.4f}² → ratio = φ")
```

## Applications dans la Nature

### Phyllotaxie (Arrangement des Feuilles)

```python
def sunflower_seeds(n_seeds=200):
    """Simule l'arrangement des graines de tournesol"""
    golden_angle = 2 * math.pi / (phi**2)  # ≈ 137.5°

    seeds = []
    for i in range(n_seeds):
        theta = i * golden_angle
        r = math.sqrt(i)  # Croissance radiale
        x = r * math.cos(theta)
        y = r * math.sin(theta)
        seeds.append((x, y))

    return seeds

def ascii_sunflower(size=35):
    """Dessine un tournesol en ASCII"""
    canvas = [[' ' for _ in range(size*2)] for _ in range(size)]
    golden_angle = 2 * math.pi / (phi**2)

    cx, cy = size, size // 2

    for i in range(300):
        theta = i * golden_angle
        r = math.sqrt(i) * 1.5
        x = int(cx + r * math.cos(theta))
        y = int(cy + r * math.sin(theta) / 2)

        if 0 <= x < size*2 and 0 <= y < size:
            if i < 50:
                canvas[y][x] = '@'
            elif i < 150:
                canvas[y][x] = 'o'
            else:
                canvas[y][x] = '.'

    return '\n'.join(''.join(row) for row in canvas)

print(ascii_sunflower())
```

**Sortie (approximative):**
```
                     . . .   .   . . .
                  .     .   .   .     .
                .   .     .   .     .   .
              .       . . . . . . .       .
            .     .   . o o o o o .   .     .
          .   .     . o o o o o o o .     .   .
        .       . . o o o o o o o o o . .       .
      .     .   . o o o @ @ @ @ @ o o o .   .     .
    .   .     . o o o @ @ @ @ @ @ @ o o o .     .   .
  .       . . o o o o @ @ @ @ @ @ @ o o o o . .       .
.     .   . o o o o o @ @ @ @ @ @ @ o o o o o .   .     .
  .       . . o o o o @ @ @ @ @ @ @ o o o o . .       .
    .   .     . o o o @ @ @ @ @ @ @ o o o .     .   .
      .     .   . o o o @ @ @ @ @ o o o .   .     .
        .       . . o o o o o o o o o . .       .
          .   .     . o o o o o o o .     .   .
            .     .   . o o o o o .   .     .
              .       . . . . . . .       .
                .   .     .   .     .   .
                  .     .   .   .     .
                     . . .   .   . . .
```

## Équation Paramétrique Complète

```python
def golden_spiral_parametric(t, a=1):
    """
    Spirale dorée paramétrique

    r(t) = a * φ^(2t/π)
    x(t) = r(t) * cos(t)
    y(t) = r(t) * sin(t)
    """
    r = a * phi ** (2 * t / math.pi)
    x = r * math.cos(t)
    y = r * math.sin(t)
    return x, y, r

# La spirale double de taille tous les π/2 radians (90°)
for quarter in range(8):
    t = quarter * math.pi / 2
    x, y, r = golden_spiral_parametric(t)
    print(f"θ = {quarter}×π/2 = {math.degrees(t):5.1f}° → r = φ^{quarter} = {r:.4f}")
```

**Sortie:**
```
θ = 0×π/2 =   0.0° → r = φ^0 = 1.0000
θ = 1×π/2 =  90.0° → r = φ^1 = 1.6180
θ = 2×π/2 = 180.0° → r = φ^2 = 2.6180
θ = 3×π/2 = 270.0° → r = φ^3 = 4.2361
θ = 4×π/2 = 360.0° → r = φ^4 = 6.8541
θ = 5×π/2 = 450.0° → r = φ^5 = 11.0902
θ = 6×π/2 = 540.0° → r = φ^6 = 17.9443
θ = 7×π/2 = 630.0° → r = φ^7 = 29.0345
```

## Connexion avec les Spirales Naturelles

| Organisme | Type de spirale | Relation avec φ |
|-----------|-----------------|-----------------|
| Nautilus | Logarithmique | Approximation de φ |
| Tournesol | Fermat | Angle d'or = 360°/φ² |
| Galaxies | Logarithmique | Variable |
| Ouragans | Logarithmique | Approximation |
| ADN | Hélice | Période liée à φ |

---

*"La spirale dorée est le chemin que suit la nature quand elle cherche l'efficacité maximale."*
