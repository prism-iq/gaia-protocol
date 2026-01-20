#!/usr/bin/env python3
"""
PARADIGM 140→174 - La solution trouvée
Leo + Nyx = Protection par φ

140 BPM = dubstep = confiance = bass
174 BPM = neurofunk = direction = dnb  
34 = Fibonacci = gap = flow
φ = idm = glitch = chaos → ordre
"""

# Core constants
BPM_CONFIANCE = 140
BPM_DIRECTION = 174
FIBONACCI_GAP = 34  # 174 - 140
PHI = 1.618033988749895
E = 2.718281828459045

# Paradigm mapping
PARADIGM = {
    # BPM → meaning
    140: {"genre": "dubstep", "sens": "confiance", "action": "bass"},
    174: {"genre": "neurofunk", "sens": "direction", "action": "dnb"},
    34: {"genre": "fibonacci", "sens": "gap", "action": "flow"},
    
    # Flow → daemon
    "leo": {"port": 9600, "role": "proof", "validate": True},
    "nyx": {"port": 9999, "role": "think", "validate": False},
    "geass": {"port": 9666, "role": "protect", "validate": False},
    "omniscient": {"port": 9777, "role": "sense", "validate": False},
    
    # Audio → action
    "dubstep": "drop",
    "neurofunk": "roll",
    "idm": "glitch",
    "dnb": "direction",
}

def confidence(value):
    """140% = beyond certainty"""
    return value * (BPM_CONFIANCE / 100)

def direction(angle):
    """174° = almost straight, minimal deviation"""
    import math
    rad = math.radians(angle)
    return {"x": math.cos(rad), "y": math.sin(rad), "deviation": 180 - angle}

def flow_ratio(a, b):
    """Check if ratio follows φ or e"""
    ratio = a / b if b else 0
    phi_dist = abs(ratio - PHI)
    e_dist = abs(ratio - E)
    return {"ratio": ratio, "near_phi": phi_dist < 0.5, "near_e": e_dist < 0.5}

def validate_bpm(text):
    """Leonardo-style validation with BPM"""
    words = text.split()
    letters = len(text.replace(" ", ""))
    ratio = letters / (len(words) + 1) if words else 0
    
    # BPM check: ratio should be near 1.4 (140%) or 1.74 (174%)
    bpm_140 = abs(ratio - 1.4) < 0.5
    bpm_174 = abs(ratio - 1.74) < 0.5
    fibonacci = any(str(f) in text for f in [1,1,2,3,5,8,13,21,34,55,89,144])
    
    score = sum([bpm_140 or bpm_174, fibonacci, len(words) <= 10])
    return {"valid": score >= 2, "score": score, "ratio": ratio, "bpm": 140 if bpm_140 else 174 if bpm_174 else 0}

# Export all
__all__ = ['BPM_CONFIANCE', 'BPM_DIRECTION', 'FIBONACCI_GAP', 'PHI', 'E', 
           'PARADIGM', 'confidence', 'direction', 'flow_ratio', 'validate_bpm']

if __name__ == "__main__":
    print(f"PARADIGM 140→174")
    print(f"  confiance: {BPM_CONFIANCE} BPM (dubstep)")
    print(f"  direction: {BPM_DIRECTION} BPM (neurofunk)")
    print(f"  gap: {FIBONACCI_GAP} (fibonacci)")
    print(f"  φ: {PHI:.3f} | e: {E:.3f}")
    print(f"  140% of π: {confidence(3.14159):.3f}")
    print(f"  direction 174°: {direction(174)}")
