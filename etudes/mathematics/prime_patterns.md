# Patterns des Nombres Premiers

## Les Atomes de l'Arithmétique

Les nombres premiers sont les briques fondamentales des entiers. Leur distribution cache des motifs profonds qui connectent l'arithmétique à l'analyse complexe.

## La Spirale d'Ulam

```
                    147─148─149─150─151─152─153─154─155─156─157
                     │                                       │
                    146 101─102─103─104─105─106─107─108─109 158
                     │   │                               │   │
                    145 100  65──66──67──68──69──70──71 110 159
                     │   │   │                       │   │   │
                    144  99  64  37──38──39──40──41  72 111 160
                     │   │   │   │               │   │   │   │
                    143  98  63  36  17──18──19  42  73 112 161
                     │   │   │   │   │       │   │   │   │   │
                    142  97  62  35  16   5──6   43  74 113 162
                     │   │   │   │   │   │       │   │   │   │
                    141  96  61  34  15  4───3   44  75 114 163
                     │   │   │   │   │       │   │   │   │   │
                    140  95  60  33  14  1───2   45  76 115 164
                     │   │   │   │   │           │   │   │   │
                    139  94  59  32  13──12──11──10  77 116 165
                     │   │   │   │                   │   │   │
                    138  93  58  31──30──29──28──27  78 117 166
                     │   │   │                       │   │   │
                    137  92  57──56──55──54──53──52  79 118 167
                     │   │                           │   │   │
                    136  91──90──89──88──87──86──85  80 119 168
                     │                               │   │   │
                    135─134─133─132─131─130─129─128─127 120 169
                                                     │   │   │
                                                    121─122─123...

Les nombres premiers forment des diagonales!
```

```python
def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

def ulam_spiral(size):
    """Génère la spirale d'Ulam en ASCII"""
    grid = [[0] * size for _ in range(size)]

    x, y = size // 2, size // 2
    num = 1
    grid[y][x] = num

    directions = [(1, 0), (0, -1), (-1, 0), (0, 1)]  # droite, haut, gauche, bas
    dir_idx = 0
    steps_in_dir = 1
    steps_taken = 0
    turns = 0

    while num < size * size:
        dx, dy = directions[dir_idx]
        x += dx
        y += dy
        num += 1

        if 0 <= x < size and 0 <= y < size:
            grid[y][x] = num

        steps_taken += 1
        if steps_taken == steps_in_dir:
            steps_taken = 0
            dir_idx = (dir_idx + 1) % 4
            turns += 1
            if turns % 2 == 0:
                steps_in_dir += 1

    # Affichage
    result = []
    for row in grid:
        line = ''
        for val in row:
            if is_prime(val):
                line += '██'
            else:
                line += '  '
        result.append(line)

    return '\n'.join(result)

print("Spirale d'Ulam (21x21):")
print(ulam_spiral(21))
```

## Connexion avec φ: Les Premiers de Fibonacci

```python
import math

phi = (1 + math.sqrt(5)) / 2

def fibonacci(n):
    return round((phi**n - (1-phi)**n) / math.sqrt(5))

def fibonacci_primes(limit=30):
    """Trouve les indices n tels que F(n) est premier"""
    primes = []
    for n in range(2, limit):
        f = fibonacci(n)
        if is_prime(f):
            primes.append((n, f))
    return primes

fib_primes = fibonacci_primes(40)
print("Nombres de Fibonacci premiers:")
print("n  | F(n)")
print("-" * 30)
for n, f in fib_primes:
    print(f"{n:2d} | {f}")

# Observation: n doit être premier (ou 4) pour que F(n) soit premier
print("\nObservation: si F(n) est premier et n > 4, alors n est premier.")
```

**Sortie:**
```
Nombres de Fibonacci premiers:
n  | F(n)
------------------------------
 3 | 2
 4 | 3
 5 | 5
 7 | 13
11 | 89
13 | 233
17 | 1597
23 | 28657
29 | 514229
```

## Le Théorème des Nombres Premiers

```python
import math

def prime_counting(n):
    """π(n) = nombre de premiers ≤ n"""
    return sum(1 for i in range(2, n+1) if is_prime(i))

def prime_density_approximation(n):
    """π(n) ≈ n / ln(n)"""
    if n < 2:
        return 0
    return n / math.log(n)

def li(x):
    """Fonction logarithme intégral Li(x) - meilleure approximation"""
    if x <= 1:
        return 0
    # Intégration numérique simple
    result = 0
    dx = 0.001
    t = 2
    while t < x:
        result += dx / math.log(t)
        t += dx
    return result

print("Distribution des nombres premiers:")
print("     n    | π(n) réel | n/ln(n)  | Li(n)    | Erreur %")
print("-" * 60)
for exp in range(2, 7):
    n = 10 ** exp
    real = prime_counting(n)
    approx = prime_density_approximation(n)
    li_approx = li(n)
    error = abs(real - approx) / real * 100
    print(f"{n:8d} | {real:8d}  | {approx:8.1f} | {li_approx:8.1f} | {error:5.2f}%")
```

## Les Gaps entre Premiers et φ

```python
def prime_gaps(limit=200):
    """Calcule les écarts entre nombres premiers consécutifs"""
    primes = [i for i in range(2, limit) if is_prime(i)]
    gaps = [primes[i+1] - primes[i] for i in range(len(primes)-1)]
    return primes, gaps

primes, gaps = prime_gaps(500)

# Statistiques des gaps
from collections import Counter
gap_counts = Counter(gaps)

print("Distribution des gaps entre premiers (jusqu'à 500):")
print("Gap | Fréquence | ██████")
print("-" * 40)
for gap in sorted(gap_counts.keys())[:15]:
    count = gap_counts[gap]
    bar = '█' * (count // 2)
    print(f" {gap:2d} |    {count:3d}    | {bar}")

# Connexion avec φ
print(f"\nGap moyen: {sum(gaps)/len(gaps):.3f}")
print(f"log(500) ≈ {math.log(500):.3f}")
print(f"φ³ ≈ {phi**3:.3f}")
```

## Les Premiers de Lucas

```python
def lucas(n):
    """Suite de Lucas: L(n) = L(n-1) + L(n-2), L(0)=2, L(1)=1"""
    if n == 0:
        return 2
    if n == 1:
        return 1
    a, b = 2, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b

# Relation avec φ: L(n) = φⁿ + ψⁿ où ψ = (1-√5)/2
print("Suite de Lucas et φ:")
print("n  | L(n)   | φⁿ + ψⁿ  | Premier?")
print("-" * 45)
psi = (1 - math.sqrt(5)) / 2
for n in range(20):
    L = lucas(n)
    formula = phi**n + psi**n
    is_p = "OUI" if is_prime(L) else ""
    print(f"{n:2d} | {L:6d} | {formula:8.1f} | {is_p}")
```

## Visualisation ASCII: Crible d'Ératosthène

```
   10  20  30  40  50  60  70  80  90 100
  ┌─────────────────────────────────────────┐
 1│·  ·  ·  ·  ·  ·  ·  ·  ·  · │·=composite
 2│█  █  ·  █  ·  █  ·  █  ·  █ │█=premier
 3│█  ·  █  ·  █  ·  █  ·  █  · │
 4│·  ·  ·  ·  ·  ·  ·  ·  ·  · │
 5│·  ·  ·  ·  ·  ·  ·  ·  ·  · │
 6│·  ·  ·  ·  ·  ·  ·  ·  ·  · │
 7│█  ·  █  ·  █  ·  █  ·  █  · │
 8│·  ·  ·  ·  ·  ·  ·  ·  ·  · │
 9│·  ·  ·  ·  ·  ·  ·  ·  ·  · │
10│·  ·  ·  ·  ·  ·  ·  ·  ·  · │
  └─────────────────────────────────────────┘
  Les colonnes 2,3,5,7 contiennent des premiers
  Les autres colonnes sont vides après filtrage
```

```python
def sieve_visualization(n=100, width=10):
    """Visualise le crible d'Ératosthène"""
    is_prime_arr = [True] * (n + 1)
    is_prime_arr[0] = is_prime_arr[1] = False

    for i in range(2, int(n**0.5) + 1):
        if is_prime_arr[i]:
            for j in range(i*i, n + 1, i):
                is_prime_arr[j] = False

    # Affichage en grille
    result = ["   " + "".join(f"{i:4d}" for i in range(1, width+1))]
    result.append("  ┌" + "─" * (width * 4) + "┐")

    for row in range(n // width):
        line = f"{row*width:2d}│"
        for col in range(1, width + 1):
            num = row * width + col
            if num <= n:
                if is_prime_arr[num]:
                    line += " █  "
                else:
                    line += " ·  "
        line += "│"
        result.append(line)

    result.append("  └" + "─" * (width * 4) + "┘")
    return '\n'.join(result)

print(sieve_visualization(100))
```

## Le Modèle 6k±1

Tout premier > 3 s'écrit sous la forme 6k±1:

```python
def classify_primes_6k(limit=100):
    """Classifie les premiers selon 6k-1 et 6k+1"""
    primes = [p for p in range(5, limit) if is_prime(p)]

    plus_one = [p for p in primes if p % 6 == 1]
    minus_one = [p for p in primes if p % 6 == 5]

    print("Premiers de la forme 6k+1:")
    print(plus_one)
    print(f"\nPremiers de la forme 6k-1 (ou 6k+5):")
    print(minus_one)
    print(f"\nRatio (6k+1)/(6k-1): {len(plus_one)/len(minus_one):.4f}")
    print(f"Théoriquement → 1 (équidistribution)")

classify_primes_6k(200)
```

## Spirale de Sacks (polaire)

```
              . .   .       .   . .
           .         .   .         .
         .     .               .     .
        .   .                   .   .
       .         .       .         .
      . .     .     .     .     . .
     .     .     . * .     .     .
      . .     .     .     .     . .
       .         .       .         .
        .   .                   .   .
         .     .               .     .
           .         .   .         .
              . .   .       .   . .

    Les premiers forment des bras spiralés
    partant du centre (r = √n, θ = 2π√n)
```

```python
def sacks_spiral(size=35, max_n=1000):
    """Spirale de Sacks en ASCII"""
    canvas = [[' ' for _ in range(size*2)] for _ in range(size)]
    cx, cy = size, size // 2

    for n in range(1, max_n):
        if is_prime(n):
            r = math.sqrt(n) * 2
            theta = 2 * math.pi * math.sqrt(n)
            x = int(cx + r * math.cos(theta))
            y = int(cy + r * math.sin(theta) / 2)

            if 0 <= x < size*2 and 0 <= y < size:
                canvas[y][x] = '*'

    return '\n'.join(''.join(row) for row in canvas)

print("Spirale de Sacks:")
print(sacks_spiral())
```

## La Fonction Zêta et les Premiers

```python
def riemann_zeta(s, terms=10000):
    """Approximation de ζ(s) pour s > 1"""
    if s <= 1:
        return float('inf')
    return sum(1/n**s for n in range(1, terms))

def euler_product(s, primes, num_primes=100):
    """Produit d'Euler: ζ(s) = Π 1/(1-p⁻ˢ)"""
    product = 1.0
    for p in primes[:num_primes]:
        product *= 1 / (1 - p**(-s))
    return product

primes_list = [p for p in range(2, 1000) if is_prime(p)]

print("Identité d'Euler: ζ(s) = Π 1/(1-p⁻ˢ)")
print("-" * 50)
for s in [2, 3, 4, 5]:
    zeta = riemann_zeta(s)
    euler = euler_product(s, primes_list)
    print(f"s = {s}: ζ({s}) = {zeta:.6f}, Produit d'Euler = {euler:.6f}")

print(f"\nζ(2) = π²/6 = {math.pi**2/6:.6f}")
print(f"ζ(4) = π⁴/90 = {math.pi**4/90:.6f}")
```

---

*"Les nombres premiers sont les atomes de l'arithmétique, et leurs patterns cachés sont la symphonie silencieuse des mathématiques."*
