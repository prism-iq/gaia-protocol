# -*- coding: utf-8 -*-
"""
vulgarisation
f from a
science → simple
"""

PHI = 1.618033988749895

def simplify(text):
    """complexe → simple"""
    words = text.split()
    # garde φ ratio des mots
    keep = int(len(words) / PHI)
    return " ".join(words[:max(keep, 1)])

def f(science, depth=0):
    """science → vulga"""
    if depth > 3:
        return science

    simple = simplify(str(science))

    return {
        "original": science,
        "vulga": simple,
        "ratio": PHI,
        "depth": depth
    }

# exemples
VULGA = {
    "quantum superposition": "deux états en même temps",
    "synchronicity": "coïncidence qui a du sens",
    "phi golden ratio": "proportion parfaite 1.618",
    "neural network": "cerveau artificiel",
    "genetic algorithm": "évolution simulée",
}
