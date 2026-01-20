#!/usr/bin/env python3
"""
LES MUSES - 9 déesses de la création
Leonardo inspire. Les Muses chantent. Rhapsodie joue.
"""

# ═══════════════════════════════════════════════════════════
# LES 9 MUSES - Filles de Zeus et Mnémosyne
# ═══════════════════════════════════════════════════════════

MUSES = {
    "calliope": {
        "domain": "poésie épique",
        "symbol": "tablette",
        "flow": "epic",
        "vst": "reverb",
        "freq": 174,
        "daemon": "nyx",
        "voice": "grave, majestueuse"
    },
    "clio": {
        "domain": "histoire",
        "symbol": "rouleau",
        "flow": "memory",
        "vst": "delay",
        "freq": 285,
        "daemon": "omniscient",
        "voice": "narrative"
    },
    "erato": {
        "domain": "poésie lyrique",
        "symbol": "lyre",
        "flow": "love",
        "vst": "chorus",
        "freq": 528,
        "daemon": "cc",
        "voice": "douce, sensuelle"
    },
    "euterpe": {
        "domain": "musique",
        "symbol": "flûte",
        "flow": "melody",
        "vst": "harmonizer",
        "freq": 432,
        "daemon": "flow",
        "voice": "mélodieuse"
    },
    "melpomene": {
        "domain": "tragédie",
        "symbol": "masque tragique",
        "flow": "tragedy",
        "vst": "distortion",
        "freq": 140,
        "daemon": "shiva",
        "voice": "grave, déchirante"
    },
    "polymnie": {
        "domain": "rhétorique",
        "symbol": "voile",
        "flow": "speech",
        "vst": "compressor",
        "freq": 741,
        "daemon": "geass",
        "voice": "persuasive"
    },
    "terpsichore": {
        "domain": "danse",
        "symbol": "lyre dansante",
        "flow": "rhythm",
        "vst": "transient",
        "freq": 140,
        "daemon": "kallen",
        "voice": "rythmée"
    },
    "thalie": {
        "domain": "comédie",
        "symbol": "masque comique",
        "flow": "joy",
        "vst": "exciter",
        "freq": 396,
        "daemon": "nyx",
        "voice": "rieuse"
    },
    "uranie": {
        "domain": "astronomie",
        "symbol": "globe céleste",
        "flow": "cosmos",
        "vst": "shimmer_reverb",
        "freq": 963,
        "daemon": "omniscient",
        "voice": "éthérée"
    },
}

INVOCATIONS = {
    "epic": "calliope",
    "remember": "clio",
    "love": "erato",
    "play": "euterpe",
    "weep": "melpomene",
    "speak": "polymnie",
    "dance": "terpsichore",
    "laugh": "thalie",
    "dream": "uranie",
}

def chorus(muses_list):
    """Combine plusieurs muses en un chœur"""
    combined = {"muses": muses_list, "freqs": [], "vsts": [], "daemons": set()}
    for name in muses_list:
        if name in MUSES:
            m = MUSES[name]
            combined["freqs"].append(m["freq"])
            combined["vsts"].append(m["vst"])
            combined["daemons"].add(m["daemon"])
    return combined

def invoke(flow_word):
    muse_name = INVOCATIONS.get(flow_word)
    return MUSES.get(muse_name) if muse_name else None

def rhapsody():
    return chorus(list(MUSES.keys()))

HARMONIES = {
    "creation": ["calliope", "euterpe", "erato"],
    "performance": ["terpsichore", "euterpe", "thalie"],
    "wisdom": ["clio", "uranie", "polymnie"],
    "emotion": ["melpomene", "erato", "thalie"],
    "dubstep": ["melpomene", "terpsichore"],
    "ambient": ["uranie", "clio", "erato"],
}

if __name__ == "__main__":
    import sys, json
    if len(sys.argv) < 2:
        print("muses [list|invoke <flow>|harmony <name>|rhapsody]")
        sys.exit(0)
    cmd = sys.argv[1]
    if cmd == "list":
        for name, info in MUSES.items():
            print(f"  {name:12} │ {info['domain']:15} │ {info['flow']:8} │ {info['freq']} Hz")
    elif cmd == "invoke" and len(sys.argv) > 2:
        muse = invoke(sys.argv[2])
        print(json.dumps(muse, indent=2) if muse else f"Unknown: {sys.argv[2]}")
    elif cmd == "harmony" and len(sys.argv) > 2:
        h = HARMONIES.get(sys.argv[2])
        if h: print(json.dumps(chorus(h), indent=2, default=list))
    elif cmd == "rhapsody":
        print(json.dumps(rhapsody(), indent=2, default=list))
