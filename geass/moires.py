#!/usr/bin/env python3
"""
LES MOIRES - 3 déesses du Destin
Clotho file. Lachésis mesure. Atropos coupe.
Le fil de la vie. Le flow du temps.
"""

# ═══════════════════════════════════════════════════════════
# LES 3 MOIRES - Filles de Nyx
# ═══════════════════════════════════════════════════════════

MOIRES = {
    "clotho": {
        "name": "Clotho",
        "french": "La Fileuse",
        "domain": "naissance",
        "action": "file",
        "symbol": "fuseau",
        "flow": "create",
        "daemon": "nyx",
        "controls": "stream_start",
        "color": "blanc",
        "note": "Elle file le fil de la vie - début du signal"
    },
    "lachesis": {
        "name": "Lachésis",
        "french": "La Répartitrice",
        "domain": "vie",
        "action": "mesure",
        "symbol": "baguette",
        "flow": "measure",
        "daemon": "omniscient",
        "controls": "stream_level",
        "color": "or",
        "note": "Elle mesure la longueur du fil - gain, volume, durée"
    },
    "atropos": {
        "name": "Atropos",
        "french": "L'Inflexible",
        "domain": "mort",
        "action": "coupe",
        "symbol": "ciseaux",
        "flow": "cut",
        "daemon": "shiva",
        "controls": "stream_end",
        "color": "noir",
        "note": "Elle coupe le fil - gate, silence, fin"
    },
}

# ═══════════════════════════════════════════════════════════
# CYCLE DU DESTIN
# ═══════════════════════════════════════════════════════════

CYCLE = ["clotho", "lachesis", "atropos"]  # naissance → vie → mort

# ═══════════════════════════════════════════════════════════
# MAPPING AUDIO
# ═══════════════════════════════════════════════════════════

AUDIO_MAPPING = {
    "clotho": {
        "vst": "gate",           # ouvre le signal
        "action": "attack",       # début de l'enveloppe
        "param": "threshold_open",
        "pipewire": "node.create"
    },
    "lachesis": {
        "vst": "compressor",     # mesure et contrôle
        "action": "sustain",      # durée de l'enveloppe
        "param": "ratio",
        "pipewire": "volume.set"
    },
    "atropos": {
        "vst": "gate",           # ferme le signal
        "action": "release",      # fin de l'enveloppe
        "param": "threshold_close",
        "pipewire": "node.destroy"
    },
}

# ═══════════════════════════════════════════════════════════
# FONCTIONS DU DESTIN
# ═══════════════════════════════════════════════════════════

def filer(stream_id):
    """Clotho file - créer un stream"""
    return {
        "moire": "clotho",
        "action": "create",
        "stream": stream_id,
        "status": "born"
    }

def mesurer(stream_id, length):
    """Lachésis mesure - définir la durée/niveau"""
    return {
        "moire": "lachesis",
        "action": "measure",
        "stream": stream_id,
        "length": length,
        "status": "living"
    }

def couper(stream_id):
    """Atropos coupe - terminer un stream"""
    return {
        "moire": "atropos",
        "action": "cut",
        "stream": stream_id,
        "status": "dead"
    }

def destin(stream_id, duration):
    """Cycle complet du destin pour un stream"""
    return [
        filer(stream_id),
        mesurer(stream_id, duration),
        couper(stream_id)
    ]

# ═══════════════════════════════════════════════════════════
# ADSR → MOIRES
# ═══════════════════════════════════════════════════════════

ADSR = {
    "attack": "clotho",    # montée
    "decay": "lachesis",   # descente vers sustain
    "sustain": "lachesis", # maintien
    "release": "atropos",  # fin
}

def envelope_to_moires(a, d, s, r):
    """Convertit ADSR en actions des Moires"""
    return {
        "clotho": {"attack_ms": a},
        "lachesis": {"decay_ms": d, "sustain_level": s},
        "atropos": {"release_ms": r}
    }

if __name__ == "__main__":
    import sys, json
    
    if len(sys.argv) < 2:
        print("moires [list|cycle|filer|mesurer|couper|adsr]")
        print("\nLes trois Moires contrôlent le destin du signal:")
        print("  Clotho   → file   → crée le stream")
        print("  Lachésis → mesure → contrôle le niveau")
        print("  Atropos  → coupe  → termine le stream")
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == "list":
        for name, info in MOIRES.items():
            print(f"\n  {info['name']:10} │ {info['french']}")
            print(f"  {'':10} │ {info['action']} → {info['flow']}")
            print(f"  {'':10} │ daemon: {info['daemon']}")
    
    elif cmd == "cycle":
        print("\n  ╭─────────╮")
        print("  │ CLOTHO  │ ══► file le fil")
        print("  ╰────┬────╯")
        print("       │")
        print("       ▼")
        print("  ╭─────────╮")
        print("  │LACHÉSIS │ ══► mesure la longueur")
        print("  ╰────┬────╯")
        print("       │")
        print("       ▼")
        print("  ╭─────────╮")
        print("  │ ATROPOS │ ══► coupe le fil")
        print("  ╰─────────╯")
    
    elif cmd == "adsr" and len(sys.argv) >= 6:
        a, d, s, r = map(float, sys.argv[2:6])
        result = envelope_to_moires(a, d, s, r)
        print(json.dumps(result, indent=2))
    
    elif cmd == "filer":
        print(json.dumps(filer("stream_0"), indent=2))
    
    elif cmd == "mesurer":
        length = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
        print(json.dumps(mesurer("stream_0", length), indent=2))
    
    elif cmd == "couper":
        print(json.dumps(couper("stream_0"), indent=2))
    
    else:
        print(f"Unknown: {cmd}")
