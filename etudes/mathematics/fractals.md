# Fractales

## L'Infini dans le Fini

Les fractales sont des objets géométriques qui présentent une auto-similarité à toutes les échelles. Leur dimension n'est pas un entier.

## Le Triangle de Sierpinski

```
              /\
             /  \
            /    \
           /______\
          /\      /\
         /  \    /  \
        /    \  /    \
       /______\/______\
      /\              /\
     /  \            /  \
    /    \          /    \
   /______\        /______\
  /\      /\      /\      /\
 /  \    /  \    /  \    /  \
/____\  /____\  /____\  /____\
```

### Dimension Fractale

```python
import math

# Triangle de Sierpinski: 3 copies de taille 1/2
# D = log(N) / log(1/r) = log(3) / log(2)
D_sierpinski = math.log(3) / math.log(2)
print(f"Dimension du triangle de Sierpinski: {D_sierpinski:.6f}")

# Connexion avec φ
phi = (1 + math.sqrt(5)) / 2
print(f"D * φ / 2 = {D_sierpinski * phi / 2:.6f}")
```

## Connexion avec φ: Le Pentagone de Sierpinski

```
           *
          / \
         /   \
        *-----*
       / \   / \
      /   \ /   \
     *-----*-----*
    / \   / \   / \
   /   \ /   \ /   \
  *-----*-----*-----*

Dans un pentagone régulier:
- Diagonale / Côté = φ
- La fractale pentagonale a une dimension liée à φ
```

```python
def pentagon_fractal_dimension():
    """
    Pentagone de Sierpinski:
    - 5 copies
    - Facteur de réduction = 1/φ²
    """
    phi = (1 + math.sqrt(5)) / 2
    r = 1 / (phi ** 2)  # Facteur de réduction
    N = 5  # Nombre de copies

    D = math.log(N) / math.log(1/r)
    return D

D_pentagon = pentagon_fractal_dimension()
print(f"Dimension du pentagone de Sierpinski: {D_pentagon:.6f}")
print(f"log(5) / log(φ²) = {math.log(5) / math.log(((1+5**0.5)/2)**2):.6f}")
```

## L'Ensemble de Mandelbrot

```python
def mandelbrot(c, max_iter=100):
    z = 0
    for n in range(max_iter):
        if abs(z) > 2:
            return n
        z = z*z + c
    return max_iter

def ascii_mandelbrot_zoom(cx, cy, zoom, width=70, height=30):
    """Visualise un zoom sur Mandelbrot"""
    chars = ' .:;+=xX$&@'

    result = []
    for row in range(height):
        line = ''
        for col in range(width):
            x = cx + (col - width/2) / (width * zoom)
            y = cy + (row - height/2) / (height * zoom)

            escape = mandelbrot(complex(x, y), 100)
            if escape == 100:
                char = '#'
            else:
                char = chars[min(escape, len(chars)-1)]
            line += char
        result.append(line)

    return '\n'.join(result)

print("Ensemble de Mandelbrot - Vue globale:")
print(ascii_mandelbrot_zoom(-0.5, 0, 0.4))
```

**Sortie:**
```
                                       :::::::..
                                   ..::;;;;====;;::.
                                 .:;;===++xxxXX$++==;:.
                               .;===+xX$$&&@@@@&&$Xx+==;.
                              :;=+xX$&@@@@########@@&$x+=;:
                            .:;=+x$&@################@&$x+=;.
                           .;=+x$&@####################@&$x+;.
                          :;=+X$&@######################@&$X+=:
                         .;=+X$@########################@$X+=;.
                         :=+x$@##########################@$x+=:
                        .;=+$@############################@$+=;.
                        :=+X@##############################@X+=:
        ...:::::::::....:=+$@##############################@$+=:....:::::::...
                        :=+X@##############################@X+=:
                        .;=+$@############################@$+=;.
                         :=+x$@##########################@$x+=:
                         .;=+X$@########################@$X+=;.
                          :;=+X$&@######################@&$X+=:
                           .;=+x$&@####################@&$x+;.
                            .:;=+x$&@################@&$x+=;.
                              :;=+xX$&@@@@########@@&$Xx+=;:
                               .;===+xX$$&&@@@@&&$Xx+==;.
                                 .:;;===++xxxXX$++==;:.
                                   ..::;;;;====;;::.
                                       :::::::..
```

## L'Ensemble de Julia et φ

```python
def julia(z, c, max_iter=100):
    for n in range(max_iter):
        if abs(z) > 2:
            return n
        z = z*z + c
    return max_iter

def ascii_julia(c, width=70, height=30):
    """Ensemble de Julia pour un c donné"""
    chars = ' .:-=+*#%@'

    result = []
    for row in range(height):
        line = ''
        for col in range(width):
            x = (col - width/2) / (width/4)
            y = (row - height/2) / (height/2)

            escape = julia(complex(x, y), c, 50)
            if escape == 50:
                char = '#'
            else:
                char = chars[min(escape, len(chars)-1)]
            line += char
        result.append(line)

    return '\n'.join(result)

# Julia set avec c lié à φ
phi = (1 + math.sqrt(5)) / 2
c_golden = complex(-phi/2, phi/4)
print(f"Ensemble de Julia pour c = {c_golden}")
print(ascii_julia(c_golden))
```

## Le Flocon de Koch

```
Itération 0:    _____

Itération 1:    _/\_
               /    \

Itération 2:   _/\_
              /\  /\
             /  \/  \
            _/      \_

Dimension = log(4)/log(3) ≈ 1.2619
```

```python
def koch_dimension():
    """Le flocon de Koch: 4 copies de taille 1/3"""
    return math.log(4) / math.log(3)

D_koch = koch_dimension()
print(f"Dimension du flocon de Koch: {D_koch:.6f}")

# La courbe de Koch a une longueur infinie mais entoure une aire finie
def koch_length(n, initial_length=1):
    """Longueur après n itérations"""
    return initial_length * (4/3)**n

def koch_area(n, initial_length=1):
    """Aire après n itérations (converge)"""
    # Aire initiale du triangle équilatéral
    A0 = (math.sqrt(3)/4) * initial_length**2
    # Chaque itération ajoute des triangles
    total = A0
    for i in range(n):
        new_triangles = 3 * 4**i
        triangle_side = initial_length / (3**(i+1))
        triangle_area = (math.sqrt(3)/4) * triangle_side**2
        total += new_triangles * triangle_area
    return total

print("\nÉvolution du flocon de Koch:")
print("Itération | Longueur    | Aire")
print("-" * 40)
for n in range(10):
    L = koch_length(n)
    A = koch_area(n)
    print(f"    {n}     | {L:10.4f}  | {A:.6f}")

print(f"\nAire limite: {8/5 * (math.sqrt(3)/4):.6f}")
```

## L'Éponge de Menger

```
    ┌───┬───┬───┐
    │███│   │███│
    ├───┼───┼───┤
    │   │   │   │
    ├───┼───┼───┤
    │███│   │███│
    └───┴───┴───┘
        ↓
    Répéter à l'infini...

Dimension = log(20)/log(3) ≈ 2.7268
```

```python
def menger_dimension():
    """L'éponge de Menger: 20 copies de taille 1/3"""
    return math.log(20) / math.log(3)

D_menger = menger_dimension()
print(f"Dimension de l'éponge de Menger: {D_menger:.6f}")
print(f"Entre 2D et 3D!")
```

## Système de Fonctions Itérées (IFS)

```python
import random

def sierpinski_ifs(iterations=10000):
    """Génère le triangle de Sierpinski par IFS"""
    # Sommets du triangle
    vertices = [(0, 0), (1, 0), (0.5, math.sqrt(3)/2)]

    points = []
    x, y = random.random(), random.random()

    for _ in range(iterations):
        # Choisir un sommet au hasard
        vx, vy = random.choice(vertices)
        # Aller à mi-chemin
        x = (x + vx) / 2
        y = (y + vy) / 2
        points.append((x, y))

    return points

def ascii_ifs_triangle(width=70, height=35):
    """Affiche le triangle de Sierpinski"""
    points = sierpinski_ifs(5000)
    canvas = [[' ' for _ in range(width)] for _ in range(height)]

    for x, y in points:
        px = int(x * (width - 1))
        py = int((1 - y / (math.sqrt(3)/2)) * (height - 1))
        if 0 <= px < width and 0 <= py < height:
            canvas[py][px] = '*'

    return '\n'.join(''.join(row) for row in canvas)

print("Triangle de Sierpinski par IFS:")
print(ascii_ifs_triangle())
```

## Fractales et le Nombre d'Or

### La Fractale Dorée

```python
def golden_fractal_ifs(iterations=5000):
    """
    IFS basé sur le nombre d'or
    Utilise des transformations avec facteur φ
    """
    phi = (1 + math.sqrt(5)) / 2
    r = 1 / phi  # Facteur de contraction

    points = []
    x, y = 0.5, 0.5

    # Deux transformations avec rotation par l'angle d'or
    golden_angle = 2 * math.pi / (phi**2)

    for _ in range(iterations):
        choice = random.random()
        if choice < 0.5:
            # Transformation 1
            x_new = r * (x * math.cos(golden_angle) - y * math.sin(golden_angle))
            y_new = r * (x * math.sin(golden_angle) + y * math.cos(golden_angle))
        else:
            # Transformation 2
            x_new = r * x + (1 - r)
            y_new = r * y

        x, y = x_new, y_new
        points.append((x, y))

    return points

print("\nDimension de la fractale dorée:")
phi = (1 + math.sqrt(5)) / 2
D_golden = math.log(2) / math.log(phi)
print(f"D = log(2) / log(φ) = {D_golden:.6f}")
```

## Tableau des Dimensions Fractales

```
╔═══════════════════════════════╦══════════════╦══════════════════╗
║ Fractale                      ║ Dimension    ║ Connexion avec φ ║
╠═══════════════════════════════╬══════════════╬══════════════════╣
║ Ligne                         ║ 1.000        ║ -                ║
║ Courbe de Koch                ║ 1.262        ║ ≈ 1/ln(φ)        ║
║ Triangle de Sierpinski        ║ 1.585        ║ ≈ φ - 0.03       ║
║ Pentagone de Sierpinski       ║ 1.672        ║ log(5)/log(φ²)   ║
║ Frontière de Mandelbrot       ║ 2.000        ║ = 2              ║
║ Éponge de Menger              ║ 2.727        ║ ≈ φ + 1.1        ║
║ Cube                          ║ 3.000        ║ -                ║
╚═══════════════════════════════╩══════════════╩══════════════════╝
```

## La Poussière de Cantor

```
Étape 0: ████████████████████████████████████████████████████
Étape 1: ████████████████                ████████████████
Étape 2: █████     █████                █████     █████
Étape 3: ██  ██   ██  ██              ██  ██   ██  ██
Étape 4: █ █ █ █ █ █ █ █            █ █ █ █ █ █ █ █

Dimension = log(2)/log(3) ≈ 0.6309
```

```python
def cantor_set(n, width=60):
    """Génère la poussière de Cantor"""
    def cantor_recursive(level, start, end):
        if level == 0:
            return [(start, end)]
        third = (end - start) / 3
        left = cantor_recursive(level-1, start, start + third)
        right = cantor_recursive(level-1, end - third, end)
        return left + right

    result = []
    for level in range(n+1):
        segments = cantor_recursive(level, 0, width)
        line = [' '] * width
        for start, end in segments:
            for i in range(int(start), int(end)):
                if i < width:
                    line[i] = '█'
        result.append(f"Étape {level}: {''.join(line)}")

    return '\n'.join(result)

print(cantor_set(5))
```

---

*"Les fractales révèlent que la complexité infinie peut émerger de règles simples répétées à l'infini."*
