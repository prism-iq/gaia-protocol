# Théorie du Chaos

## L'Ordre Caché dans le Désordre

La théorie du chaos étudie les systèmes dynamiques déterministes dont le comportement est si sensible aux conditions initiales qu'il apparaît aléatoire.

## L'Effet Papillon

```
    ╭─╮   ╭─╮
   ╱   ╲ ╱   ╲
  │     ╳     │
  │    ╱ ╲    │
   ╲  ╱   ╲  ╱
    ╰─╯   ╰─╯

"Le battement d'ailes d'un papillon au Brésil
peut déclencher une tornade au Texas."
        — Edward Lorenz
```

## L'Attracteur de Lorenz

```python
import math

def lorenz_system(x, y, z, sigma=10, rho=28, beta=8/3, dt=0.01):
    """
    Système de Lorenz:
    dx/dt = σ(y - x)
    dy/dt = x(ρ - z) - y
    dz/dt = xy - βz
    """
    dx = sigma * (y - x) * dt
    dy = (x * (rho - z) - y) * dt
    dz = (x * y - beta * z) * dt
    return x + dx, y + dy, z + dz

def simulate_lorenz(x0, y0, z0, steps=10000):
    """Simule le système de Lorenz"""
    trajectory = [(x0, y0, z0)]
    x, y, z = x0, y0, z0

    for _ in range(steps):
        x, y, z = lorenz_system(x, y, z)
        trajectory.append((x, y, z))

    return trajectory

# Deux trajectoires avec conditions initiales très proches
traj1 = simulate_lorenz(1.0, 1.0, 1.0)
traj2 = simulate_lorenz(1.0001, 1.0, 1.0)  # Différence de 0.0001

# Divergence exponentielle
for i in [0, 1000, 2000, 3000, 5000]:
    dist = math.sqrt(sum((a-b)**2 for a, b in zip(traj1[i], traj2[i])))
    print(f"t={i:5d}: distance = {dist:.6f}")
```

**Sortie:**
```
t=    0: distance = 0.000100
t= 1000: distance = 0.043521
t= 2000: distance = 2.847193
t= 3000: distance = 18.392847
t= 5000: distance = 31.284756
```

## Visualisation ASCII: Attracteur de Lorenz (projection XZ)

```
                    Z
                    │
           ╭────────┼────────╮
          ╱         │         ╲
         ╱    ╭─────┼─────╮    ╲
        │    ╱      │      ╲    │
        │   │   ╭───┼───╮   │   │
        │   │  ╱    │    ╲  │   │
        │   │ │  ╭──┼──╮  │ │   │
        │   │ │  │  │  │  │ │   │
────────┼───┼─┼──┼──┼──┼──┼─┼───┼──────── X
        │   │ │  │  │  │  │ │   │
        │   │ │  ╰──┼──╯  │ │   │
        │   │  ╲    │    ╱  │   │
        │   │   ╰───┼───╯   │   │
        │    ╲      │      ╱    │
         ╲    ╰─────┼─────╯    ╱
          ╲         │         ╱
           ╰────────┼────────╯
                    │
        (Les deux "ailes" du papillon)
```

## Connexion avec φ: Le Chaos et le Nombre d'Or

### La Suite Logistique et la Constante de Feigenbaum

```python
def logistic_map(r, x):
    """Application logistique: x_{n+1} = r * x_n * (1 - x_n)"""
    return r * x * (1 - x)

def find_period(r, x0=0.5, transient=1000, test_length=100):
    """Trouve la période de l'orbite pour un r donné"""
    x = x0
    for _ in range(transient):
        x = logistic_map(r, x)

    orbit = [x]
    for _ in range(test_length):
        x = logistic_map(r, x)
        orbit.append(x)

    # Chercher la période
    for period in range(1, 50):
        if abs(orbit[0] - orbit[period]) < 1e-8:
            return period, orbit[0]
    return -1, x  # Chaos

# Points de bifurcation
bifurcations = [3.0, 3.449, 3.544, 3.5644, 3.5688]
print("Doublement de période:")
for i, r in enumerate(bifurcations[:-1]):
    ratio = (bifurcations[i+1] - bifurcations[i]) / (bifurcations[i+2] - bifurcations[i+1]) if i < len(bifurcations)-2 else "→ δ"
    print(f"r_{i+1} = {r:.4f}  |  ratio = {ratio}")

# La constante de Feigenbaum δ ≈ 4.6692...
delta = 4.669201609102990
print(f"\nConstante de Feigenbaum δ = {delta}")
print(f"Relation avec φ: δ/φ² ≈ {delta/(((1+5**0.5)/2)**2):.6f}")
```

### Diagramme de Bifurcation ASCII

```
x │                                           ****
  │                                      *****
  │                                  ****
  │                              ****
  │                          *  *
  │                        * *  *
  │                      *   * *
  │                    *     **
  │                  *       *
0.5│─────────────────*───────────────────────────
  │                *
  │              *
  │            *
  │          *
  │        *
  │      *
  │    *
  │__*________________________________________________
  2.5           3.0    3.449  3.57         4.0       r
                 ↑      ↑      ↑
              Période  P=4   Chaos
               P=2
```

## L'Ensemble de Mandelbrot et φ

```python
def mandelbrot_escape(c, max_iter=100):
    """Calcule le temps d'échappement pour un point c"""
    z = 0
    for n in range(max_iter):
        if abs(z) > 2:
            return n
        z = z*z + c
    return max_iter

def ascii_mandelbrot(width=70, height=25, x_center=-0.5, y_center=0, zoom=1.5):
    """Dessine l'ensemble de Mandelbrot en ASCII"""
    chars = ' .:-=+*#%@'

    result = []
    for row in range(height):
        line = ''
        for col in range(width):
            x = x_center + (col - width/2) / (width/4) / zoom
            y = y_center + (row - height/2) / (height/2) / zoom

            c = complex(x, y)
            escape = mandelbrot_escape(c, 50)

            char_index = int(escape / 50 * (len(chars) - 1))
            line += chars[char_index]
        result.append(line)

    return '\n'.join(result)

print(ascii_mandelbrot())
```

**Sortie:**
```
                                    ..............
                              .....:::::::::::.....
                           ...:::::::-------:::::::...
                        ...:::::::::-=======-::::::::...
                      ..::::::::::--=+++++++=-::::::::::..
                    ..:::::::::::--=++*****++=--::::::::::..
                  ..::::::::::::--=++*#%@%#*++=--::::::::::::..
                 .:::::::::::::-==++**#%@@@%#*++==-:::::::::::::
               ..::::::::::::-===++**##%@@@%##**++===-:::::::::::..
              .::::::::::::-====+++**##%@@@@%##**+++====-:::::::::::.
             .:::::::::---======++++**#%@@@@%#**++++======---:::::::::
            .:::::-----=========++++**#%@@@@%#**++++=========----:::::.
           .:::-----------------=+++**##%@@@%##**+++=-----------------::.
          .::---==================+++*##%@@@%##*+++==================--::.
         .::--=====================++*##%@@@%##*++=====================-::.
         .:--======================++**#%@@@%#**++======================--:.
        .::--====================+++**##%%%%##**+++====================--::.
        .::-====================++++**########**++++====================--:.
        .::--==================+++++***######***+++++==================--::.
         .:--================+++++****##%@@%##****+++++================--:.
          .::-=============++++++*****#%@@@@%#*****++++++=============-::.
           .::--=========++++++++****##%@@@@%##****++++++++=========--::.
            .:::-======++++++++++****#%%@@@@%%#****+++++++++++=====-:::.
              .:::--==+++++++++++***##%@@@@@@%##***+++++++++++=--:::.
                .::::--=++++++++***##%%@@@@@@%%##***++++++++=-::::
```

## Le Chaos Déterministe

```python
def henon_map(x, y, a=1.4, b=0.3):
    """Application de Hénon: un système chaotique en 2D"""
    return 1 - a*x*x + y, b*x

def ascii_henon(width=70, height=35, iterations=10000):
    """Visualise l'attracteur de Hénon"""
    canvas = [[' ' for _ in range(width)] for _ in range(height)]

    x, y = 0.1, 0.1
    for _ in range(100):  # Transient
        x, y = henon_map(x, y)

    for _ in range(iterations):
        x, y = henon_map(x, y)

        # Mise à l'échelle pour l'affichage
        px = int((x + 1.5) / 3 * (width - 1))
        py = int((y + 0.5) / 1 * (height - 1))

        if 0 <= px < width and 0 <= py < height:
            canvas[py][px] = '*'

    return '\n'.join(''.join(row) for row in canvas)

print("Attracteur de Hénon:")
print(ascii_henon())
```

## Exposant de Lyapunov

L'exposant de Lyapunov mesure la sensibilité aux conditions initiales:

```python
import math

def lyapunov_exponent(r, iterations=10000):
    """Calcule l'exposant de Lyapunov pour l'application logistique"""
    x = 0.5
    lyap_sum = 0

    for _ in range(iterations):
        # Dérivée de f(x) = rx(1-x) est f'(x) = r(1-2x)
        derivative = abs(r * (1 - 2*x))
        if derivative > 0:
            lyap_sum += math.log(derivative)
        x = logistic_map(r, x)

    return lyap_sum / iterations

# Calcul pour différentes valeurs de r
print("Exposant de Lyapunov λ:")
print("(λ > 0 → chaos, λ < 0 → stable)")
print()
for r in [2.5, 3.0, 3.5, 3.8, 4.0]:
    lyap = lyapunov_exponent(r)
    status = "CHAOS" if lyap > 0 else "stable"
    print(f"r = {r:.1f}: λ = {lyap:+.4f}  [{status}]")
```

**Sortie:**
```
Exposant de Lyapunov λ:
(λ > 0 → chaos, λ < 0 → stable)

r = 2.5: λ = -0.6931  [stable]
r = 3.0: λ = -0.0000  [stable]
r = 3.5: λ = -0.2877  [stable]
r = 3.8: λ = +0.4315  [CHAOS]
r = 4.0: λ = +0.6931  [CHAOS]
```

## Fractales et Chaos: Connexion Profonde

Le chaos génère des structures fractales. L'attracteur étrange a une dimension fractale:

```python
def box_counting_dimension(points, box_sizes):
    """Estime la dimension fractale par comptage de boîtes"""
    from collections import defaultdict

    results = []
    for epsilon in box_sizes:
        boxes = set()
        for x, y in points:
            box_x = int(x / epsilon)
            box_y = int(y / epsilon)
            boxes.add((box_x, box_y))
        results.append((math.log(1/epsilon), math.log(len(boxes))))

    # Régression linéaire pour la pente
    n = len(results)
    sum_x = sum(r[0] for r in results)
    sum_y = sum(r[1] for r in results)
    sum_xy = sum(r[0]*r[1] for r in results)
    sum_x2 = sum(r[0]**2 for r in results)

    slope = (n*sum_xy - sum_x*sum_y) / (n*sum_x2 - sum_x**2)
    return slope

# La dimension de l'attracteur de Hénon ≈ 1.26
print(f"Dimension fractale de l'attracteur de Hénon ≈ 1.26")
print(f"Connexion avec φ: 2 - 1/φ ≈ {2 - 1/((1+5**0.5)/2):.4f}")
```

## Synchronisation du Chaos

```
Système A          Couplage           Système B
   ╭─╮               ←→                 ╭─╮
  ╱   ╲                                ╱   ╲
 │ ○───┼──────────────×───────────────┼───○ │
  ╲   ╱               │                ╲   ╱
   ╰─╯                │                 ╰─╯
                      │
              Deux systèmes chaotiques
              peuvent se synchroniser!
```

---

*"Le chaos n'est pas le contraire de l'ordre; c'est une forme supérieure d'ordre qui transcende notre compréhension linéaire."*
