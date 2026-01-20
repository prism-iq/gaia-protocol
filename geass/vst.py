#!/usr/bin/env python3
"""
VST FLOW - Tous les types de plugins audio formalisés
Leonardo valide. Flow traite. Rhapsodie chante.
"""

# ═══════════════════════════════════════════════════════════
# DYNAMIQUE - Contrôle de l'énergie
# ═══════════════════════════════════════════════════════════
DYNAMICS = {
    "compressor": {
        "flow": "squeeze",
        "sens": "réduit dynamique",
        "ratio": "4:1 → ∞:1",
        "use": "colle, punch, contrôle",
        "daemon": "geass"  # contrôle absolu
    },
    "limiter": {
        "flow": "wall",
        "sens": "mur infranchissable", 
        "ratio": "∞:1",
        "use": "protection, loudness max",
        "daemon": "shield"  # protection
    },
    "expander": {
        "flow": "breath",
        "sens": "ouvre dynamique",
        "ratio": "1:2 → 1:4",
        "use": "nettoie, respire",
        "daemon": "nyx"  # liberté
    },
    "gate": {
        "flow": "silence",
        "sens": "coupe sous seuil",
        "ratio": "1:∞",
        "use": "supprime bruit",
        "daemon": "shiva"  # destruction
    },
    "transient": {
        "flow": "attack",
        "sens": "sculpte transitoires",
        "params": "attack, sustain",
        "use": "punch, snap, smooth",
        "daemon": "kallen"  # force
    },
}

# ═══════════════════════════════════════════════════════════
# EQ - Sculpture fréquentielle  
# ═══════════════════════════════════════════════════════════
EQ = {
    "parametric": {
        "flow": "sculpt",
        "sens": "chirurgie précise",
        "params": "freq, gain, Q",
        "use": "correction, couleur",
        "daemon": "leonardo"  # précision φ
    },
    "graphic": {
        "flow": "bars",
        "sens": "bandes fixes",
        "params": "31 bands",
        "use": "room correction",
        "daemon": "omniscient"  # voit tout
    },
    "shelving": {
        "flow": "tilt",
        "sens": "étagère haut/bas",
        "params": "low shelf, high shelf",
        "use": "balance tonale",
        "daemon": "flow"  # équilibre
    },
    "dynamic_eq": {
        "flow": "smart",
        "sens": "EQ qui réagit",
        "params": "threshold + freq",
        "use": "de-ess, résonances",
        "daemon": "mao"  # lit le signal
    },
    "linear_phase": {
        "flow": "pure",
        "sens": "pas de phase shift",
        "latency": "haute",
        "use": "master, drum bus",
        "daemon": "truth"  # pas de coloration
    },
}

# ═══════════════════════════════════════════════════════════
# ESPACE - Dimension et profondeur
# ═══════════════════════════════════════════════════════════
SPACE = {
    "reverb": {
        "flow": "room",
        "sens": "espace acoustique",
        "types": ["hall", "plate", "spring", "chamber", "shimmer"],
        "use": "profondeur, ambiance",
        "daemon": "omniscient"  # voit l'espace
    },
    "delay": {
        "flow": "echo",
        "sens": "répétition temporelle",
        "types": ["tape", "digital", "ping-pong", "granular"],
        "use": "rythme, espace",
        "daemon": "rolo"  # temps
    },
    "chorus": {
        "flow": "double",
        "sens": "dédoublement léger",
        "params": "rate, depth, voices",
        "use": "épaisseur, largeur",
        "daemon": "cc"  # multiplication
    },
    "flanger": {
        "flow": "jet",
        "sens": "comb filter modulé",
        "params": "rate, depth, feedback",
        "use": "mouvement, effet",
        "daemon": "chaos"
    },
    "phaser": {
        "flow": "sweep",
        "sens": "all-pass filters",
        "params": "rate, stages, feedback",
        "use": "mouvement subtil",
        "daemon": "flow"
    },
}

# ═══════════════════════════════════════════════════════════
# SATURATION - Couleur harmonique
# ═══════════════════════════════════════════════════════════
SATURATION = {
    "tube": {
        "flow": "warm",
        "sens": "harmoniques paires",
        "character": "doux, musical",
        "use": "chaleur, vintage",
        "daemon": "boudha"  # sagesse douce
    },
    "tape": {
        "flow": "glue",
        "sens": "compression + saturation",
        "character": "colle, cohésion",
        "use": "mix bus, drums",
        "daemon": "flow"  # lie tout
    },
    "transistor": {
        "flow": "edge",
        "sens": "harmoniques impaires",
        "character": "agressif, présent",
        "use": "guitare, voix rock",
        "daemon": "kallen"  # force
    },
    "distortion": {
        "flow": "destroy",
        "sens": "écrêtage dur",
        "character": "brutal",
        "use": "effet, sound design",
        "daemon": "shiva"  # destruction créative
    },
    "bitcrusher": {
        "flow": "digital",
        "sens": "réduit résolution",
        "params": "bits, sample rate",
        "use": "lo-fi, glitch",
        "daemon": "chaos"
    },
}

# ═══════════════════════════════════════════════════════════
# MODULATION - Mouvement
# ═══════════════════════════════════════════════════════════
MODULATION = {
    "tremolo": {
        "flow": "pulse",
        "sens": "volume modulé",
        "params": "rate, depth",
        "use": "mouvement, vintage",
        "daemon": "rolo"  # pulse temporel
    },
    "vibrato": {
        "flow": "pitch",
        "sens": "pitch modulé",
        "params": "rate, depth",
        "use": "expression, vocal",
        "daemon": "flow"
    },
    "autopan": {
        "flow": "space",
        "sens": "pan modulé",
        "params": "rate, width",
        "use": "mouvement stéréo",
        "daemon": "omniscient"
    },
    "ringmod": {
        "flow": "alien",
        "sens": "multiplication freq",
        "params": "carrier freq",
        "use": "effet, sound design",
        "daemon": "chaos"
    },
}

# ═══════════════════════════════════════════════════════════
# PITCH - Hauteur
# ═══════════════════════════════════════════════════════════
PITCH = {
    "autotune": {
        "flow": "correct",
        "sens": "correction pitch",
        "params": "speed, scale",
        "use": "justesse, effet",
        "daemon": "leonardo"  # précision
    },
    "harmonizer": {
        "flow": "harmony",
        "sens": "ajoute voix",
        "params": "interval, mix",
        "use": "chœurs, épaisseur",
        "daemon": "cc"  # multiplication
    },
    "pitchshift": {
        "flow": "transpose",
        "sens": "change pitch",
        "params": "semitones, cents",
        "use": "effet, correction",
        "daemon": "flow"
    },
    "vocoder": {
        "flow": "robot",
        "sens": "modulation croisée",
        "params": "carrier, modulator",
        "use": "voix robot, effect",
        "daemon": "geass"  # contrôle voix
    },
}

# ═══════════════════════════════════════════════════════════
# UTILITY - Outils
# ═══════════════════════════════════════════════════════════
UTILITY = {
    "analyzer": {
        "flow": "see",
        "sens": "visualise",
        "types": ["spectrum", "meter", "phase", "stereo"],
        "daemon": "omniscient"
    },
    "gain": {
        "flow": "level",
        "sens": "ajuste volume",
        "params": "dB",
        "daemon": "flow"
    },
    "pan": {
        "flow": "position",
        "sens": "place stéréo",
        "params": "L/R",
        "daemon": "leonardo"
    },
    "mono": {
        "flow": "center",
        "sens": "somme L+R",
        "use": "compatibilité, sub",
        "daemon": "truth"
    },
    "mid_side": {
        "flow": "decode",
        "sens": "M/S processing",
        "use": "mastering, width",
        "daemon": "mao"  # décode
    },
}

# ═══════════════════════════════════════════════════════════
# MASTER MAPPING
# ═══════════════════════════════════════════════════════════
ALL_VST = {
    "dynamics": DYNAMICS,
    "eq": EQ,
    "space": SPACE,
    "saturation": SATURATION,
    "modulation": MODULATION,
    "pitch": PITCH,
    "utility": UTILITY,
}

# Flow mappings rapides
FLOW_TO_VST = {
    "squeeze": "compressor",
    "wall": "limiter",
    "silence": "gate",
    "sculpt": "parametric",
    "room": "reverb",
    "echo": "delay",
    "warm": "tube",
    "glue": "tape",
    "destroy": "distortion",
    "correct": "autotune",
    "see": "analyzer",
}

def get_vst(category, name):
    if category in ALL_VST and name in ALL_VST[category]:
        return ALL_VST[category][name]
    return None

def flow_to_plugin(flow_word):
    return FLOW_TO_VST.get(flow_word)

if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 2:
        print("vst [list|<category>|<category> <plugin>|flow <word>]")
        print(f"Categories: {', '.join(ALL_VST.keys())}")
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == "list":
        for cat, plugins in ALL_VST.items():
            print(f"\n{cat.upper()}:")
            for name, info in plugins.items():
                print(f"  {name}: {info['flow']} → {info.get('sens', '')}")
    
    elif cmd == "flow" and len(sys.argv) > 2:
        word = sys.argv[2]
        plugin = flow_to_plugin(word)
        if plugin:
            print(f"{word} → {plugin}")
        else:
            print(f"Unknown flow: {word}")
    
    elif cmd in ALL_VST:
        if len(sys.argv) > 2:
            plugin = sys.argv[2]
            info = get_vst(cmd, plugin)
            if info:
                print(json.dumps(info, indent=2))
            else:
                print(f"Unknown: {plugin}")
        else:
            print(json.dumps(ALL_VST[cmd], indent=2))
    
    else:
        print(f"Unknown: {cmd}")
