# L'Identité d'Euler

## La Plus Belle Équation des Mathématiques

```
              e^(iπ) + 1 = 0
```

Cette équation relie les cinq constantes les plus importantes des mathématiques:
- **e** ≈ 2.71828... (base du logarithme naturel)
- **i** = √(-1) (unité imaginaire)
- **π** ≈ 3.14159... (ratio cercle/diamètre)
- **1** (identité multiplicative)
- **0** (identité additive)

## Visualisation ASCII

```
                              Im
                               │
                               │
                    e^(i2π/3)  │  e^(iπ/3)
                         ╲     │     ╱
                          ╲    │    ╱
                           ╲   │   ╱
              e^(iπ)        ╲  │  ╱        e^(i0)
           ───────●──────────●─┼─●──────────●─────── Re
              -1             ╱ │ ╲          +1
                           ╱   │   ╲
                          ╱    │    ╲
                         ╱     │     ╲
                    e^(i4π/3)  │  e^(i5π/3)
                               │
                               │
                               │

    Le cercle unité: e^(iθ) parcourt le cercle quand θ varie
```

## La Formule d'Euler

```python
import cmath
import math

# e^(iθ) = cos(θ) + i·sin(θ)
def euler_formula(theta):
    """Vérifie e^(iθ) = cos(θ) + i·sin(θ)"""
    left = cmath.exp(1j * theta)
    right = complex(math.cos(theta), math.sin(theta))
    return left, right, abs(left - right) < 1e-10

# Vérification pour plusieurs angles
print("Vérification de la formule d'Euler: e^(iθ) = cos(θ) + i·sin(θ)")
print("-" * 70)
print(f"{'θ':^10} | {'e^(iθ)':^25} | {'cos(θ)+i·sin(θ)':^25} | Égal?")
print("-" * 70)

for angle_name, theta in [("0", 0), ("π/6", math.pi/6), ("π/4", math.pi/4),
                           ("π/3", math.pi/3), ("π/2", math.pi/2), ("π", math.pi),
                           ("2π", 2*math.pi)]:
    left, right, equal = euler_formula(theta)
    print(f"{angle_name:^10} | {left.real:+.4f}{left.imag:+.4f}i | {right.real:+.4f}{right.imag:+.4f}i | {equal}")
```

**Sortie:**
```
Vérification de la formule d'Euler: e^(iθ) = cos(θ) + i·sin(θ)
----------------------------------------------------------------------
    θ      |         e^(iθ)          |     cos(θ)+i·sin(θ)     | Égal?
----------------------------------------------------------------------
    0      | +1.0000+0.0000i | +1.0000+0.0000i | True
   π/6     | +0.8660+0.5000i | +0.8660+0.5000i | True
   π/4     | +0.7071+0.7071i | +0.7071+0.7071i | True
   π/3     | +0.5000+0.8660i | +0.5000+0.8660i | True
   π/2     | +0.0000+1.0000i | +0.0000+1.0000i | True
    π      | -1.0000+0.0000i | -1.0000+0.0000i | True
   2π      | +1.0000+0.0000i | +1.0000+0.0000i | True
```

## Connexion avec φ: La Constante de Sommerfeld

```python
# Le nombre d'or apparaît dans les rotations
phi = (1 + math.sqrt(5)) / 2
golden_angle = 2 * math.pi / (phi ** 2)  # ≈ 137.5°

print("L'angle d'or et e^(iθ):")
print(f"Angle d'or = 2π/φ² ≈ {math.degrees(golden_angle):.2f}°")

# e^(i·angle_d'or)
z_golden = cmath.exp(1j * golden_angle)
print(f"e^(i·angle_d'or) = {z_golden.real:.4f} + {z_golden.imag:.4f}i")
print(f"|e^(i·angle_d'or)| = {abs(z_golden):.4f} (toujours 1)")

# Relations avec φ
print(f"\nConnexions φ et e:")
print(f"e^(1/φ) = {math.e**(1/phi):.6f}")
print(f"φ = {phi:.6f}")
print(f"e^(ln(φ)) = {math.e**math.log(phi):.6f} = φ")
```

## Démonstration de l'Identité

La formule d'Euler dérive du développement en série de Taylor:

```python
def taylor_exp(x, terms=20):
    """e^x = Σ x^n/n!"""
    result = 0
    factorial = 1
    for n in range(terms):
        result += x**n / factorial
        factorial *= (n + 1)
    return result

def taylor_cos(x, terms=20):
    """cos(x) = Σ (-1)^n x^(2n)/(2n)!"""
    result = 0
    for n in range(terms):
        sign = (-1)**n
        power = x**(2*n)
        factorial = math.factorial(2*n)
        result += sign * power / factorial
    return result

def taylor_sin(x, terms=20):
    """sin(x) = Σ (-1)^n x^(2n+1)/(2n+1)!"""
    result = 0
    for n in range(terms):
        sign = (-1)**n
        power = x**(2*n + 1)
        factorial = math.factorial(2*n + 1)
        result += sign * power / factorial
    return result

# Vérification avec Taylor
theta = math.pi / 4
print("Développements de Taylor pour θ = π/4:")
print(f"e^(iθ) via Taylor: {taylor_exp(1j * theta)}")
print(f"cos(θ) + i·sin(θ): {taylor_cos(theta)} + {taylor_sin(theta)}i")
print(f"Valeur exacte:     {cmath.exp(1j * theta)}")
```

## Visualisation: Spirale Exponentielle

```
                         Im
                          │          .·
                          │       ·'
                          │     ·'  ←── e^((1+i)t) spirale vers l'extérieur
                          │   .'
                          │  ·
                          │·'
          ────────────────●──────────────── Re
                         '│
                        · │
                       '  │
                      ·   │
                     '    │   ←── e^((-1+i)t) spirale vers l'intérieur
                    ·     │
                   '      │
```

```python
def exponential_spiral(width=60, height=30):
    """Visualise e^((a+bi)t) pour différents a"""
    canvas = [[' ' for _ in range(width)] for _ in range(height)]
    cx, cy = width // 2, height // 2

    # Spirale croissante: a > 0
    for t in range(200):
        t_val = t * 0.1
        z = cmath.exp((0.05 + 1j) * t_val)
        x = int(cx + z.real * 3)
        y = int(cy - z.imag * 1.5)
        if 0 <= x < width and 0 <= y < height:
            canvas[y][x] = '+'

    # Cercle unité: a = 0
    for t in range(100):
        theta = t * 2 * math.pi / 100
        z = cmath.exp(1j * theta)
        x = int(cx + z.real * 10)
        y = int(cy - z.imag * 5)
        if 0 <= x < width and 0 <= y < height:
            canvas[y][x] = 'o'

    # Spirale décroissante: a < 0
    for t in range(200):
        t_val = t * 0.1
        z = cmath.exp((-0.05 + 1j) * t_val)
        x = int(cx + z.real * 15)
        y = int(cy - z.imag * 7)
        if 0 <= x < width and 0 <= y < height:
            canvas[y][x] = '.'

    # Axes
    for i in range(width):
        canvas[cy][i] = '─' if canvas[cy][i] == ' ' else canvas[cy][i]
    for j in range(height):
        canvas[j][cx] = '│' if canvas[j][cx] == ' ' else canvas[j][cx]
    canvas[cy][cx] = '┼'

    return '\n'.join(''.join(row) for row in canvas)

print("Spirales exponentielles:")
print("  + : e^((0.05+i)t) croissante")
print("  o : e^(it) cercle unité")
print("  . : e^((-0.05+i)t) décroissante")
print()
print(exponential_spiral())
```

## Les Racines de l'Unité

```python
def roots_of_unity(n):
    """Les n racines de z^n = 1"""
    return [cmath.exp(2j * math.pi * k / n) for k in range(n)]

def ascii_roots(n, size=21):
    """Visualise les racines n-ièmes de l'unité"""
    canvas = [[' ' for _ in range(size*2)] for _ in range(size)]
    cx, cy = size, size // 2
    r = size // 2 - 2

    # Dessiner le cercle
    for theta in range(360):
        rad = math.radians(theta)
        x = int(cx + r * math.cos(rad) * 2)
        y = int(cy - r * math.sin(rad))
        if 0 <= x < size*2 and 0 <= y < size:
            canvas[y][x] = '·'

    # Placer les racines
    roots = roots_of_unity(n)
    for k, z in enumerate(roots):
        x = int(cx + z.real * r * 2)
        y = int(cy - z.imag * r)
        if 0 <= x < size*2 and 0 <= y < size:
            canvas[y][x] = str(k) if k < 10 else '*'

    return '\n'.join(''.join(row) for row in canvas)

print("Racines 5-ièmes de l'unité (pentagone):")
print(ascii_roots(5))
print("\nRacines 8-ièmes de l'unité (octogone):")
print(ascii_roots(8))
```

## L'Identité d'Euler et les Matrices

```python
import cmath

def rotation_matrix(theta):
    """Matrice de rotation 2D"""
    c, s = math.cos(theta), math.sin(theta)
    return [[c, -s], [s, c]]

def matrix_exp_approx(theta, terms=20):
    """
    e^(iθ) peut être vu comme une matrice de rotation
    car i correspond à la rotation de 90°
    """
    # i = [[0, -1], [1, 0]] comme matrice
    result = [[1, 0], [0, 1]]  # Identité
    i_matrix = [[0, -1], [1, 0]]  # Représentation matricielle de i
    power = [[1, 0], [0, 1]]

    def mat_mult(A, B):
        return [[A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],
                [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]]]

    def mat_scale(A, s):
        return [[A[0][0]*s, A[0][1]*s], [A[1][0]*s, A[1][1]*s]]

    def mat_add(A, B):
        return [[A[0][0]+B[0][0], A[0][1]+B[0][1]], [A[1][0]+B[1][0], A[1][1]+B[1][1]]]

    factorial = 1
    for n in range(1, terms):
        power = mat_mult(power, i_matrix)
        factorial = n if n == 1 else factorial * n
        term = mat_scale(power, theta**n / factorial)
        result = mat_add(result, term)

    return result

print("e^(iθ) comme matrice de rotation:")
theta = math.pi / 4
mat_exp = matrix_exp_approx(theta)
mat_rot = rotation_matrix(theta)
print(f"\nPour θ = π/4:")
print(f"Matrice e^(iθ): [[{mat_exp[0][0]:.4f}, {mat_exp[0][1]:.4f}],")
print(f"                 [{mat_exp[1][0]:.4f}, {mat_exp[1][1]:.4f}]]")
print(f"Rotation 45°:   [[{mat_rot[0][0]:.4f}, {mat_rot[0][1]:.4f}],")
print(f"                 [{mat_rot[1][0]:.4f}, {mat_rot[1][1]:.4f}]]")
```

## La Beauté Révélée

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                      e^(iπ) + 1 = 0                          ║
║                                                              ║
║  • Addition: représentée par 0                               ║
║  • Multiplication: représentée par 1                         ║
║  • Analyse: représentée par e                                ║
║  • Géométrie: représentée par π                              ║
║  • Algèbre: représentée par i                                ║
║                                                              ║
║  Cinq domaines des mathématiques unis en une seule équation  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

```python
# Vérification finale
print("Vérification de l'identité d'Euler:")
result = cmath.exp(1j * math.pi) + 1
print(f"e^(iπ) + 1 = {result}")
print(f"|e^(iπ) + 1| = {abs(result):.2e}")
print(f"C'est zéro (aux erreurs de flottant près)!")

# Connexion avec φ
print(f"\nBonus - Relations avec φ:")
print(f"e^(i·arctan(1/φ)) = {cmath.exp(1j * math.atan(1/phi))}")
print(f"cos(arctan(1/φ)) = φ/√(1+φ²) = {phi / math.sqrt(1 + phi**2):.6f}")
```

---

*"L'équation de Dieu" - comme l'ont appelée certains mathématiciens, car elle semble révéler une harmonie profonde dans la structure des mathématiques."*
