# Les Secrets de Fibonacci

## La Suite qui Gouverne la Nature

La suite de Fibonacci (0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...) cache des secrets profonds qui connectent les mathématiques à la structure même de l'univers.

## Connexion avec le Nombre d'Or φ

Le ratio entre termes consécutifs converge vers φ (phi):

```
F(n+1)/F(n) → φ = (1 + √5)/2 ≈ 1.618033988749895
```

### Formule de Binet

```python
import math

phi = (1 + math.sqrt(5)) / 2
psi = (1 - math.sqrt(5)) / 2

def fibonacci_binet(n):
    """Calcule F(n) directement via le nombre d'or"""
    return round((phi**n - psi**n) / math.sqrt(5))

# Vérification
for n in range(15):
    print(f"F({n:2d}) = {fibonacci_binet(n):5d}  |  ratio → φ: {fibonacci_binet(n+1)/max(1,fibonacci_binet(n)):.10f}")
```

**Sortie:**
```
F( 0) =     0  |  ratio → φ: 1.0000000000
F( 1) =     1  |  ratio → φ: 1.0000000000
F( 2) =     1  |  ratio → φ: 2.0000000000
F( 3) =     2  |  ratio → φ: 1.5000000000
F( 4) =     3  |  ratio → φ: 1.6666666667
F( 5) =     5  |  ratio → φ: 1.6000000000
F( 6) =     8  |  ratio → φ: 1.6250000000
F( 7) =    13  |  ratio → φ: 1.6153846154
F( 8) =    21  |  ratio → φ: 1.6190476190
F( 9) =    34  |  ratio → φ: 1.6176470588
F(10) =    55  |  ratio → φ: 1.6181818182
F(11) =    89  |  ratio → φ: 1.6179775281
F(12) =   144  |  ratio → φ: 1.6180555556
F(13) =   233  |  ratio → φ: 1.6180257511
F(14) =   377  |  ratio → φ: 1.6180371353
```

## Visualisation ASCII: Spirale de Fibonacci

```
                                        ╔══════════════════════════════════════════╗
                                        ║                                          ║
                                        ║                                          ║
                                        ║                    21                    ║
                                        ║                                          ║
                                        ║                                          ║
╔═════════════════════════╗             ║                                          ║
║                         ║             ║                                          ║
║                         ║             ║                                          ║
║          13             ║             ║                                          ║
║                         ║             ║                                          ║
║                         ║╔═══════════╗║                                          ║
║                         ║║     8     ║║                                          ║
║                         ║║           ║║                                          ║
║                         ║║     ╔════╗║║                                          ║
║                         ║║     ║ 5  ║║║                                          ║
║                         ║║╔══╗ ║╔═╗ ║║║                                          ║
║                         ║║║3 ║ ║║2║ ║║║                                          ║
║                         ║║║╔╗║ ║╚═╝ ║║║                                          ║
║                         ║║║╚╝║ ╚════╝║║                                          ║
║                         ║║╚══╝      ║║                                          ║
║                         ║╚═══════════╝║                                          ║
╚═════════════════════════╝             ╚══════════════════════════════════════════╝
```

## Propriétés Secrètes

### 1. Identité de Cassini
```python
def cassini_identity(n):
    """F(n-1) * F(n+1) - F(n)² = (-1)^n"""
    F = fibonacci_binet
    result = F(n-1) * F(n+1) - F(n)**2
    expected = (-1)**n
    return result == expected

# Toujours vrai pour tout n > 0
print(all(cassini_identity(n) for n in range(1, 100)))  # True
```

### 2. Somme des Carrés
```python
def sum_of_squares(n):
    """F(1)² + F(2)² + ... + F(n)² = F(n) * F(n+1)"""
    F = fibonacci_binet
    left = sum(F(i)**2 for i in range(1, n+1))
    right = F(n) * F(n+1)
    return left == right

print(all(sum_of_squares(n) for n in range(1, 20)))  # True
```

### 3. Représentation de Zeckendorf

Tout entier positif peut s'écrire comme somme de nombres de Fibonacci non consécutifs:

```python
def zeckendorf(n):
    """Décomposition unique en Fibonacci non-consécutifs"""
    if n == 0:
        return []

    # Trouver les Fibonacci jusqu'à n
    fibs = [1, 2]
    while fibs[-1] < n:
        fibs.append(fibs[-1] + fibs[-2])

    result = []
    for f in reversed(fibs):
        if f <= n:
            result.append(f)
            n -= f
    return result

# Exemples
for num in [42, 100, 144, 256]:
    decomp = zeckendorf(num)
    print(f"{num} = {' + '.join(map(str, decomp))}")
```

**Sortie:**
```
42 = 34 + 8
100 = 89 + 8 + 3
144 = 144
256 = 233 + 21 + 2
```

## Le Triangle de Pascal et Fibonacci

Les diagonales du triangle de Pascal somment aux nombres de Fibonacci:

```
        1                           → 1 = F(1)
       1 1                          → 1 = F(2)
      1 2 1                         → 1+1 = 2 = F(3)
     1 3 3 1                        → 1+2 = 3 = F(4)
    1 4 6 4 1                       → 1+3+1 = 5 = F(5)
   1 5 10 10 5 1                    → 1+4+3 = 8 = F(6)
  1 6 15 20 15 6 1                  → 1+5+6+1 = 13 = F(7)
```

```python
from math import comb

def fibonacci_from_pascal(n):
    """Calcule F(n) depuis les diagonales de Pascal"""
    total = 0
    for k in range((n+1)//2 + 1):
        if n-1-k >= k:
            total += comb(n-1-k, k)
    return total

print([fibonacci_from_pascal(n) for n in range(1, 15)])
# [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377]
```

## Application: Système de Numération Fibonacci (Zeckendorf Base)

```python
def to_fibonacci_base(n):
    """Convertit en base Fibonacci (où chaque bit correspond à F(i))"""
    if n == 0:
        return "0"

    fibs = [1, 2]
    while fibs[-1] < n:
        fibs.append(fibs[-1] + fibs[-2])

    result = []
    for f in reversed(fibs):
        if f <= n:
            result.append('1')
            n -= f
        else:
            result.append('0')

    return ''.join(result).lstrip('0')

# Les premiers entiers en base Fibonacci
print("Décimal → Fibonacci")
for i in range(1, 21):
    print(f"  {i:3d}   →  {to_fibonacci_base(i):>10s}")
```

## Connexion avec φ: La Fraction Continue

φ est la fraction continue la plus simple:

```
φ = 1 + 1/(1 + 1/(1 + 1/(1 + 1/(1 + ...))))

        1
φ = 1 + ─────────────
            1
        1 + ─────────
                1
            1 + ─────
                1 + ⋯
```

Les convergentes de cette fraction continue sont exactement F(n+1)/F(n):

```python
def continued_fraction_convergents(depth):
    """Calcule les convergentes de φ"""
    num, den = 1, 1
    convergents = [(num, den)]

    for _ in range(depth):
        num, den = num + den, num
        convergents.append((num, den))

    return convergents

conv = continued_fraction_convergents(12)
for i, (n, d) in enumerate(conv):
    print(f"F({i+2})/F({i+1}) = {n:4d}/{d:<4d} = {n/d:.15f}")
```

---

*"La suite de Fibonacci est la signature numérique de la croissance optimale dans l'univers."*
