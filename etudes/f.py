# -*- coding: utf-8 -*-
"""
etudes scientifiques
f from a
"""

PHI = 1.618033988749895

DOMAINES = {
    "psy": ["jung", "lacan", "freud", "inconscient", "archetype"],
    "phys": ["quantum", "relativite", "thermodynamique", "chaos"],
    "bio": ["adn", "neurone", "evolution", "genetique"],
    "math": ["phi", "fibonacci", "topologie", "fractale"],
    "info": ["algorithm", "complexity", "ai", "network"],
}

def f(topic, depth=0):
    """feedback recursif sur un sujet"""
    if depth > 3:
        return topic

    # simplifie
    words = topic.split() if isinstance(topic, str) else [topic]
    score = PHI / (len(words) + 1)

    return {
        "topic": topic,
        "score": round(score, 4),
        "depth": depth,
        "phi": PHI
    }
