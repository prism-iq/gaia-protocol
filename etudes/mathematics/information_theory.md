# Théorie de l'Information

## L'Entropie: Mesure de l'Incertitude

Claude Shannon a fondé la théorie de l'information en 1948, quantifiant l'information comme la réduction de l'incertitude.

## Entropie de Shannon

```
H(X) = -Σ p(x) · log₂(p(x))
```

L'entropie mesure le nombre moyen de bits nécessaires pour encoder un message.

```python
import math

def entropy(probabilities):
    """Calcule l'entropie de Shannon en bits"""
    return -sum(p * math.log2(p) for p in probabilities if p > 0)

# Exemples
print("Entropie de différentes distributions:")
print("=" * 50)

# Pièce équitable
fair_coin = [0.5, 0.5]
print(f"Pièce équitable [0.5, 0.5]: H = {entropy(fair_coin):.4f} bits")

# Pièce biaisée
biased_coin = [0.9, 0.1]
print(f"Pièce biaisée [0.9, 0.1]:   H = {entropy(biased_coin):.4f} bits")

# Dé équitable
fair_die = [1/6] * 6
print(f"Dé équitable (6 faces):    H = {entropy(fair_die):.4f} bits")

# Distribution certaine
certain = [1.0]
print(f"Événement certain [1.0]:   H = {entropy(certain):.4f} bits")

# Distribution uniforme sur n symboles
for n in [2, 4, 8, 16, 256]:
    uniform = [1/n] * n
    print(f"Uniforme sur {n:3d} symboles:  H = {entropy(uniform):.4f} bits = log₂({n})")
```

## Visualisation ASCII: Fonction d'Entropie Binaire

```
H(p) │
     │
1.0  │           ╭───────────╮
     │          ╱             ╲
0.8  │         ╱               ╲
     │        ╱                 ╲
0.6  │       ╱                   ╲
     │      ╱                     ╲
0.4  │     ╱                       ╲
     │    ╱                         ╲
0.2  │   ╱                           ╲
     │  ╱                             ╲
0.0  │─●───────────────────────────────●─
     └──────────────────────────────────── p
     0.0   0.2   0.4   0.5   0.6   0.8  1.0

H(p) = -p·log₂(p) - (1-p)·log₂(1-p)
Maximum à p = 0.5 où H = 1 bit
```

```python
def binary_entropy(p):
    """Entropie binaire H(p)"""
    if p == 0 or p == 1:
        return 0
    return -p * math.log2(p) - (1-p) * math.log2(1-p)

def plot_binary_entropy(width=60, height=20):
    """Visualise H(p) en ASCII"""
    canvas = [[' ' for _ in range(width)] for _ in range(height)]

    # Axes
    for i in range(width):
        canvas[height-1][i] = '─'
    for j in range(height):
        canvas[j][0] = '│'
    canvas[height-1][0] = '└'

    # Courbe
    for i in range(1, width):
        p = i / width
        h = binary_entropy(p)
        j = int((1 - h) * (height - 2))
        if 0 <= j < height-1:
            canvas[j][i] = '*'

    # Labels
    canvas[0][width//2] = '1'
    canvas[height-1][width//2] = '.'
    canvas[height-1][width//2+1] = '5'

    return '\n'.join(''.join(row) for row in canvas)

print("Fonction d'entropie binaire H(p):")
print(plot_binary_entropy())
```

## Connexion avec φ: Entropie et Nombre d'Or

```python
phi = (1 + math.sqrt(5)) / 2

# La probabilité dorée
p_golden = 1 / phi
q_golden = 1 - p_golden  # = 1/φ²

print("L'entropie et le nombre d'or:")
print("=" * 50)
print(f"p = 1/φ = {p_golden:.6f}")
print(f"q = 1 - 1/φ = 1/φ² = {q_golden:.6f}")
print(f"H(1/φ) = {binary_entropy(p_golden):.6f} bits")

# Le codage de Fibonacci
print(f"\nCodage de Fibonacci (Zeckendorf):")
print(f"Efficacité liée à φ car:")
print(f"  - Longueur moyenne des codes ∝ logφ(n)")
print(f"  - logφ(n) = ln(n)/ln(φ) = {1/math.log(phi):.4f}·ln(n)")
print(f"  - Ratio avec log₂: ln(φ)/ln(2) = {math.log(phi)/math.log(2):.6f}")

# Distribution de Fibonacci
def fibonacci_distribution(n):
    """Distribution où P(F_k) ∝ 1/F_k"""
    fibs = [1, 1]
    while len(fibs) < n:
        fibs.append(fibs[-1] + fibs[-2])
    total = sum(1/f for f in fibs)
    probs = [1/(f*total) for f in fibs]
    return probs, entropy(probs)

probs, H = fibonacci_distribution(20)
print(f"\nDistribution de Fibonacci (20 termes):")
print(f"H = {H:.4f} bits")
```

## Information Mutuelle

```
          X                      Y
    ┌───────────┐          ┌───────────┐
    │           │          │           │
    │     H(X)  │          │   H(Y)    │
    │           │          │           │
    │       ╭───┼──────────┼───╮       │
    │       │   │  I(X;Y)  │   │       │
    │       │   │          │   │       │
    │       ╰───┼──────────┼───╯       │
    │           │          │           │
    └───────────┘          └───────────┘

    I(X;Y) = H(X) + H(Y) - H(X,Y)
           = Information partagée
```

```python
def mutual_information(joint_prob):
    """
    Calcule l'information mutuelle I(X;Y)
    joint_prob est une matrice des probabilités jointes
    """
    rows = len(joint_prob)
    cols = len(joint_prob[0])

    # Probabilités marginales
    p_x = [sum(joint_prob[i][j] for j in range(cols)) for i in range(rows)]
    p_y = [sum(joint_prob[i][j] for i in range(rows)) for j in range(cols)]

    # Entropies
    H_X = entropy(p_x)
    H_Y = entropy(p_y)

    # Entropie jointe
    H_XY = entropy([joint_prob[i][j] for i in range(rows) for j in range(cols)])

    # Information mutuelle
    I_XY = H_X + H_Y - H_XY

    return I_XY, H_X, H_Y, H_XY

# Exemple: canal binaire symétrique
def binary_symmetric_channel(error_prob):
    """Canal binaire symétrique avec probabilité d'erreur p"""
    p = error_prob
    # P(Y|X) matrice
    # X=0 → Y=0 avec prob 1-p, Y=1 avec prob p
    # X=1 → Y=0 avec prob p, Y=1 avec prob 1-p

    # Supposons entrée uniforme
    joint = [
        [(1-p)/2, p/2],      # X=0
        [p/2, (1-p)/2]       # X=1
    ]
    return joint

print("Canal binaire symétrique:")
print("=" * 50)
print("Erreur p | I(X;Y)  | H(X)   | H(Y)   | H(X,Y)")
print("-" * 50)
for p in [0.0, 0.1, 0.2, 0.3, 0.4, 0.5]:
    joint = binary_symmetric_channel(p)
    I, H_X, H_Y, H_XY = mutual_information(joint)
    print(f"  {p:.1f}    | {I:.4f}  | {H_X:.4f} | {H_Y:.4f} | {H_XY:.4f}")
```

## Compression de Données: Codage de Huffman

```python
from collections import Counter
import heapq

def huffman_codes(frequencies):
    """Construit un code de Huffman"""
    heap = [[freq, [symbol, ""]] for symbol, freq in frequencies.items()]
    heapq.heapify(heap)

    while len(heap) > 1:
        lo = heapq.heappop(heap)
        hi = heapq.heappop(heap)
        for pair in lo[1:]:
            pair[1] = '0' + pair[1]
        for pair in hi[1:]:
            pair[1] = '1' + pair[1]
        heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])

    return sorted(heap[0][1:], key=lambda p: (len(p[1]), p[0]))

# Exemple avec texte
text = "abracadabra"
freq = Counter(text)
codes = huffman_codes(freq)

print(f"Texte: '{text}'")
print(f"Fréquences: {dict(freq)}")
print(f"\nCode de Huffman:")
print("-" * 30)
total_bits = 0
for symbol, code in codes:
    count = freq[symbol]
    bits = len(code) * count
    total_bits += bits
    print(f"'{symbol}': {code:>5s} (×{count}) = {bits} bits")

print(f"\nTotal: {total_bits} bits")
print(f"Sans compression: {len(text) * 8} bits (ASCII)")
print(f"Entropie théorique: {entropy([c/len(text) for c in freq.values()]):.4f} bits/symbole")
print(f"Minimum théorique: {entropy([c/len(text) for c in freq.values()]) * len(text):.1f} bits")
```

## La Capacité du Canal

```
         C = max I(X;Y)
             P(X)

    ┌──────────────────────────────────────────┐
    │                                          │
    │  Émetteur ──► Canal bruité ──► Récepteur │
    │      X            │              Y       │
    │                   ↓                      │
    │                 Bruit                    │
    │                                          │
    │  Théorème de Shannon:                    │
    │  Si R < C, communication fiable possible │
    │  Si R > C, erreurs inévitables           │
    │                                          │
    └──────────────────────────────────────────┘
```

```python
def channel_capacity_bsc(error_prob):
    """Capacité du canal binaire symétrique"""
    if error_prob == 0 or error_prob == 1:
        return 1.0
    if error_prob == 0.5:
        return 0.0
    return 1 - binary_entropy(error_prob)

print("Capacité du canal binaire symétrique:")
print("=" * 40)
print("Erreur p | Capacité C")
print("-" * 40)
for p in [0.0, 0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5]:
    C = channel_capacity_bsc(p)
    bar = '█' * int(C * 30)
    print(f"  {p:.2f}   | {C:.4f} {bar}")
```

## Entropie Relative (Divergence de Kullback-Leibler)

```python
def kl_divergence(p, q):
    """D_KL(P || Q) - mesure la 'distance' entre distributions"""
    return sum(p_i * math.log2(p_i / q_i)
               for p_i, q_i in zip(p, q)
               if p_i > 0 and q_i > 0)

# Exemple: mesurer la différence entre distributions
p_true = [0.5, 0.3, 0.2]
q_approx1 = [0.4, 0.4, 0.2]
q_approx2 = [0.33, 0.33, 0.34]

print("Divergence de Kullback-Leibler:")
print("=" * 50)
print(f"P vraie:     {p_true}")
print(f"Q approx 1:  {q_approx1}  D_KL = {kl_divergence(p_true, q_approx1):.4f}")
print(f"Q approx 2:  {q_approx2}  D_KL = {kl_divergence(p_true, q_approx2):.4f}")
print()
print("Note: D_KL n'est pas symétrique!")
print(f"D_KL(P||Q1) = {kl_divergence(p_true, q_approx1):.4f}")
print(f"D_KL(Q1||P) = {kl_divergence(q_approx1, p_true):.4f}")
```

## Information et Physique: Le Démon de Maxwell

```
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║    Chaud  │ Porte │  Froid                ║
    ║    ●→     │       │     ●                 ║
    ║      ●→   │   ↓   │   ●                   ║
    ║        ●→ │ Démon │ ●                     ║
    ║    ●      │ ouvre │     ●                 ║
    ║      ●→   │       │   ●                   ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝

    Résolution de Landauer:
    Effacer 1 bit d'information coûte au minimum
    k_B · T · ln(2) joules d'énergie
```

```python
# Constantes physiques
k_B = 1.380649e-23  # Constante de Boltzmann (J/K)
T = 300  # Température ambiante (K)

E_per_bit = k_B * T * math.log(2)
print("Principe de Landauer:")
print("=" * 50)
print(f"Température: T = {T} K")
print(f"Énergie minimale pour effacer 1 bit:")
print(f"  E = k_B · T · ln(2) = {E_per_bit:.4e} J")
print(f"                      = {E_per_bit * 6.242e18:.4f} eV")
print()
print("Connexion avec φ:")
phi = (1 + math.sqrt(5)) / 2
print(f"ln(φ) = {math.log(phi):.6f}")
print(f"ln(2) = {math.log(2):.6f}")
print(f"ln(2)/ln(φ) = {math.log(2)/math.log(phi):.6f}")
print(f"(C'est logφ(2), le nombre de 'Fibonacci-bits' par bit)")
```

## Visualisation: Arbre de Décision et Entropie

```
                    [?]              H = 1 bit
                   /   \
                  /     \
                 /       \
               [A]       [B]
              p=0.5     p=0.5

         Information gagnée: 1 bit

    ══════════════════════════════════════════

                    [?]              H = 0.81 bit
                   /   \
                  /     \
                 /       \
               [A]       [B]
              p=0.75    p=0.25

         Information gagnée: 0.81 bit
         (plus prévisible → moins d'information)
```

```python
def twenty_questions_strategy(n_objects):
    """
    Stratégie optimale pour 20 questions
    Chaque question binaire réduit l'entropie de ~1 bit
    """
    H_initial = math.log2(n_objects)
    questions_needed = math.ceil(H_initial)

    print(f"Jeu des 20 questions avec {n_objects} objets:")
    print(f"  Entropie initiale: H = log₂({n_objects}) = {H_initial:.2f} bits")
    print(f"  Questions nécessaires (optimal): {questions_needed}")
    print()

    # Simulation
    remaining = n_objects
    for q in range(min(questions_needed, 10)):
        H_before = math.log2(remaining)
        remaining = remaining // 2 + remaining % 2
        H_after = math.log2(remaining) if remaining > 1 else 0
        print(f"  Question {q+1}: {remaining:6d} restants | H = {H_after:.2f} bits")
        if remaining == 1:
            print(f"  → Trouvé!")
            break

twenty_questions_strategy(1000000)
```

## Théorème de Codage Source (Shannon)

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  PREMIER THÉORÈME DE SHANNON (Codage source)                  ║
║                                                               ║
║  Pour une source X d'entropie H(X):                           ║
║                                                               ║
║  • Il est IMPOSSIBLE de compresser en moyenne                 ║
║    à moins de H(X) bits par symbole                           ║
║                                                               ║
║  • Il est POSSIBLE de compresser à H(X) + ε bits              ║
║    pour tout ε > 0 (en codant des blocs)                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

*"L'information est le fondement de la réalité, pas la matière ni l'énergie. 'It from bit.'" - John Wheeler*
