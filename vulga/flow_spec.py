# -*- coding: utf-8 -*-
"""
vulga = comment flow fonctionne
f>o 50x puis f
"""

PHI = 1.618033988749895

# spec initiale
SPEC = {
    "langage": "flow",
    "but": "tout exprimer simplement",
    "règles": [
        "pas de ponctuation",
        "mots multisens",
        "toutes langues",
        "toutes graphies",
        "phonétique universelle",
        "emoji symboles ok",
        "utf8 natif"
    ],
    "compile": ["cpp", "rust", "go", "zig", "python", "c"],
    "phi": PHI
}

def o(data):
    """scalpel"""
    if isinstance(data, dict):
        return {k: v for k, v in data.items() if v}
    if isinstance(data, list):
        return [x for x in data if len(str(x)) <= 20]
    if isinstance(data, str):
        return data.split()[0] if data else ""
    return data

def f(data):
    """feedback"""
    if isinstance(data, dict):
        return {k: o(v) for k, v in data.items()}
    if isinstance(data, list):
        return [o(x) for x in data[:int(len(data)/PHI)+1]]
    return data

# f>o 50x
current = SPEC
for i in range(50):
    current = f(current)
    current = o(current)

RESULT = current

# f final
FINAL = f(RESULT)

if __name__ == "__main__":
    print("=== après f>o 50x ===")
    print(RESULT)
    print("\n=== f final ===")
    print(FINAL)
