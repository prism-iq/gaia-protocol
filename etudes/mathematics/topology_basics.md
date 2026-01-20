# Fondamentaux de Topologie

## La Géométrie du Caoutchouc

La topologie étudie les propriétés des espaces qui sont préservées sous déformations continues (étirement, torsion) sans déchirure ni collage.

## Équivalence Topologique

```
    TASSE  ←────→  TORE (donut)
      ↕              ↕
    ╭───╮        ╭─────────╮
   ╱ ○   ╲      │  ╭───╮   │
  │  │    │  ≅  │  │   │   │
  │  │    │     │  ╰───╯   │
   ╲_│___╱      ╰─────────╯
    anse         trou central

   Homéomorphes: même "nombre de trous"
```

```
  SPHÈRE ←────→ CUBE ←────→ PYRAMIDE
     ○            ◇            △
    ╱│╲          ╱│╲          ╱│╲
   ╱ │ ╲        ╱ │ ╲        ╱ │ ╲
  ───┼───      ───┼───      ───┼───

  Tous homéomorphes: 0 trou
```

## Le Genre d'une Surface

```python
def classify_surface(handles, boundaries, crosscaps):
    """
    Classifie une surface selon sa topologie
    - handles (anses): augmente le genre
    - boundaries (bords): cercles de bord
    - crosscaps: pour les surfaces non-orientables
    """
    if crosscaps == 0:
        # Surface orientable
        genus = handles
        chi = 2 - 2*genus - boundaries  # Caractéristique d'Euler
        return f"Surface orientable, genre {genus}, χ = {chi}"
    else:
        # Surface non-orientable
        chi = 2 - crosscaps - boundaries
        return f"Surface non-orientable, χ = {chi}"

print("Classification des surfaces:")
print(f"Sphère:           {classify_surface(0, 0, 0)}")
print(f"Tore:             {classify_surface(1, 0, 0)}")
print(f"Double tore:      {classify_surface(2, 0, 0)}")
print(f"Disque:           {classify_surface(0, 1, 0)}")
print(f"Cylindre:         {classify_surface(0, 2, 0)}")
print(f"Ruban de Möbius:  {classify_surface(0, 1, 1)}")
print(f"Bouteille Klein:  {classify_surface(0, 0, 2)}")
print(f"Plan projectif:   {classify_surface(0, 0, 1)}")
```

## Caractéristique d'Euler

```
χ = V - E + F

où V = sommets, E = arêtes, F = faces
```

```python
def euler_characteristic(vertices, edges, faces):
    """Calcule la caractéristique d'Euler"""
    return vertices - edges + faces

# Polyèdres réguliers (solides de Platon)
polyhedra = [
    ("Tétraèdre",    4,  6,  4),
    ("Cube",         8, 12,  6),
    ("Octaèdre",     6, 12,  8),
    ("Dodécaèdre",  20, 30, 12),
    ("Icosaèdre",   12, 30, 20),
]

print("Caractéristique d'Euler des solides de Platon:")
print("-" * 50)
print(f"{'Polyèdre':^15} | V | E  | F  | χ = V-E+F")
print("-" * 50)
for name, V, E, F in polyhedra:
    chi = euler_characteristic(V, E, F)
    print(f"{name:^15} | {V:1d} | {E:2d} | {F:2d} | {chi}")

print("\nTous ont χ = 2 car ils sont homéomorphes à la sphère!")
```

## Connexion avec φ: L'Icosaèdre et le Dodécaèdre

```python
import math

phi = (1 + math.sqrt(5)) / 2

print("Le nombre d'or dans les polyèdres:")
print("=" * 50)

# Coordonnées des sommets de l'icosaèdre
print("\nSommets de l'icosaèdre (normalisés):")
print("(0, ±1, ±φ)")
print("(±1, ±φ, 0)")
print("(±φ, 0, ±1)")

# Relations
print(f"\nRelations avec φ:")
print(f"Arête icosaèdre / Arête dodécaèdre = φ")
print(f"Rayon inscrit dodécaèdre = φ² / √3 ≈ {phi**2 / math.sqrt(3):.4f}")
print(f"Rayon circonscrit icosaèdre = φ·√(φ+2)/2 ≈ {phi * math.sqrt(phi+2) / 2:.4f}")

# Le ratio doré apparaît partout
print(f"\nDans l'icosaèdre:")
print(f"  - Diagonale face / Arête = φ")
print(f"  - 12 sommets formant 3 rectangles d'or perpendiculaires")
```

## Visualisation ASCII: Les Surfaces Fondamentales

### Sphère (χ = 2)
```
        ___________
      /             \
     /               \
    |                 |
    |        ●        |
    |                 |
     \               /
      \___________/

    Genre 0, pas de trou
```

### Tore (χ = 0)
```
        ╭─────────────╮
      ╱╱             ╲╲
     ││   ╭─────╮     ││
     ││   │     │     ││
     ││   │ ○───┼───▶ ││
     ││   │     │     ││
     ││   ╰─────╯     ││
      ╲╲             ╱╱
        ╰─────────────╯

    Genre 1, un trou
    Deux lacets indépendants (méridien et longitude)
```

### Ruban de Möbius (χ = 0)
```
        ╭───────────────╮
       ╱                 ╲
      ╱   ───────────     ╲
     │   ╱             ╲   ╲
     │  ╱               ╲   │
      ╲╱                 ╲ ╱
       ╲                 ╳
        ╲               ╱ ╲
         ╰─────────────╯   │
           ↑               │
           └───────────────┘
           Une seule face!
```

```python
def mobius_demonstration():
    """Démonstration des propriétés du ruban de Möbius"""
    print("Propriétés du ruban de Möbius:")
    print("=" * 40)
    print("1. UNE SEULE face (non-orientable)")
    print("2. UN SEUL bord")
    print("3. Coupé au milieu → un seul ruban tordu")
    print("4. Coupé à 1/3 → deux rubans entrelacés")
    print()
    print("Paramétrisation:")
    print("x(u,v) = (1 + v/2·cos(u/2))·cos(u)")
    print("y(u,v) = (1 + v/2·cos(u/2))·sin(u)")
    print("z(u,v) = v/2·sin(u/2)")
    print("où u ∈ [0, 2π], v ∈ [-1, 1]")

mobius_demonstration()
```

## Bouteille de Klein

```
     ╭─────────────────────────────╮
    ╱                               ╲
   │   ╭───────────────────────╮    │
   │   │                       │    │
   │   │    ╭───────────╮     │    │
   │   │    │           │     │    │
   │   │    │     ●     │     │    │
   │   │    │           │     │    │
   │   │    ╰─────┬─────╯     │    │
   │   │          │           │    │
   │   ╰──────────┼───────────╯    │
   │              │                 │
   ╰──────────────┴─────────────────╯
         ↑        │
         └────────┘
   Le tube se traverse lui-même
   (impossible en 3D sans intersection)
```

```python
def klein_bottle_euler():
    """
    La bouteille de Klein:
    - Surface fermée non-orientable
    - Pas de bord
    - χ = 0 (comme le tore, mais non-orientable)
    """
    print("Bouteille de Klein:")
    print("=" * 40)
    print("• Caractéristique d'Euler: χ = 0")
    print("• Non-orientable (comme Möbius)")
    print("• Fermée (pas de bord)")
    print("• Nécessite 4D pour être sans auto-intersection")
    print()
    print("Construction: coller deux rubans de Möbius")
    print("             le long de leurs bords")

klein_bottle_euler()
```

## Homologie et Groupes Fondamentaux

```python
def fundamental_group_info(surface):
    """Information sur le groupe fondamental π₁"""
    groups = {
        "sphere": ("trivial {e}", "Aucun lacet non-trivial"),
        "circle": ("ℤ", "Lacets comptés par enroulements"),
        "torus": ("ℤ × ℤ", "Deux générateurs: méridien et longitude"),
        "double_torus": ("⟨a,b,c,d | [a,b][c,d]=1⟩", "Groupe libre sur 4 générateurs"),
        "mobius": ("ℤ", "Un générateur, parcours double = identité"),
        "klein": ("ℤ ⋊ ℤ", "Produit semi-direct"),
    }
    return groups.get(surface, ("Inconnu", ""))

print("Groupes fondamentaux π₁:")
print("=" * 60)
for surface in ["sphere", "circle", "torus", "double_torus", "mobius", "klein"]:
    group, description = fundamental_group_info(surface)
    print(f"{surface:12s} | π₁ = {group:20s} | {description}")
```

## Théorème de Classification

```
╔════════════════════════════════════════════════════════════════╗
║ CLASSIFICATION DES SURFACES COMPACTES FERMÉES                  ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ ORIENTABLES:                                                   ║
║   Sphère S²  ─────► Tore T² ─────► Tore double T²#T² ─────►   ║
║   (genre 0)        (genre 1)       (genre 2)                   ║
║                                                                ║
║ NON-ORIENTABLES:                                               ║
║   Plan projectif RP² ────► Bouteille Klein ────► ...          ║
║   (1 crosscap)            (2 crosscaps)                        ║
║                                                                ║
║ Théorème: Toute surface compacte est homéomorphe à exactement ║
║           une surface de cette liste.                          ║
╚════════════════════════════════════════════════════════════════╝
```

## Connexion avec φ: Triangulations Minimales

```python
def minimal_triangulations():
    """
    Triangulations minimales des surfaces
    et leur connexion avec le nombre d'or
    """
    # Nombre minimum de triangles pour trianguler
    triangulations = {
        "Sphère": (4, "Tétraèdre: 4 triangles"),
        "Tore": (14, "Minimum 7 sommets, 14 triangles"),
        "Plan projectif": (10, "Minimum 6 sommets"),
        "Klein": (16, "Minimum 8 sommets"),
    }

    print("Triangulations minimales:")
    print("=" * 50)
    for surface, (n_triangles, note) in triangulations.items():
        print(f"{surface:15s}: {n_triangles:2d} triangles - {note}")

    # Connexion avec φ
    phi = (1 + math.sqrt(5)) / 2
    print(f"\nConnexion avec φ:")
    print(f"Le nombre de Heawood h(g) donne le nombre chromatique")
    print(f"d'une surface de genre g:")
    print(f"h(g) = ⌊(7 + √(1+48g))/2⌋")
    print(f"\nPour le tore (g=1): h(1) = ⌊(7+7)/2⌋ = 7")
    print(f"Pour genre 2: h(2) = ⌊(7+√97)/2⌋ = 8")

minimal_triangulations()
```

## Noeuds et Entrelacs

```
Noeud de trèfle         Noeud en huit
     ╱╲                     ╱╲
    ╱  ╲                   ╱  ╲
   ╱ ╱╲ ╲                 │ ╱╲ │
  │ ╱  ╲ │               ╱ ╱  ╲ ╲
  ││    ││              │ │ ╱╲ │ │
  │╲    ╱│              │ ╲╱  ╲╱ │
   ╲╲  ╱╱                ╲      ╱
    ╲╲╱╱                  ╲────╱
     ╲╱

Invariant: polynôme de Jones, nombre de croisements
```

```python
def knot_properties():
    """Propriétés des noeuds fondamentaux"""
    knots = [
        ("Inconnu (trivial)", 0, 0, "1"),
        ("Trèfle (3₁)", 3, 1, "t + t³ - t⁴"),
        ("Huit (4₁)", 4, 1, "t⁻² - t⁻¹ + 1 - t + t²"),
        ("Cinq (5₁)", 5, 2, "t² + t⁴ - t⁵ + t⁶ - t⁷"),
    ]

    print("Propriétés des noeuds:")
    print("=" * 70)
    print(f"{'Noeud':^20} | Croisements | Genre | Polynôme de Jones")
    print("-" * 70)
    for name, crossings, genus, jones in knots:
        print(f"{name:^20} |     {crossings:2d}      |   {genus}   | {jones}")

knot_properties()
```

## Théorème de Brouwer du Point Fixe

```
┌─────────────────────────────┐
│                             │
│  Toute fonction continue    │
│  f: D → D                   │
│  (D = disque fermé)         │
│                             │
│  a au moins un point fixe   │
│  x tel que f(x) = x         │
│                             │
│        ●──────→             │
│        │      ●             │
│        ↓      │             │
│        ●←─────┘             │
│     (point fixe ici)        │
└─────────────────────────────┘
```

---

*"Un topologiste est quelqu'un qui ne fait pas la différence entre une tasse de café et un donut."*
