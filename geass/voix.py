#!/usr/bin/env python3
"""
VOIX - Les vraies voix de Zoe et Leonardo
Naturelles, pas robotiques
"""
import subprocess
import sys
import tempfile
import os

LAPTOP_SINK = "zengo-capture"

# Voix naturelles - multilingues plus expressives
VOIX = {
    "leonardo": {"voice": "fr-FR-RemyMultilingualNeural", "rate": "-5%", "pitch": "+0Hz"},
    "zoe": {"voice": "fr-FR-VivienneMultilingualNeural", "rate": "+0%", "pitch": "+0Hz"},
    "nyx": {"voice": "fr-FR-RemyMultilingualNeural", "rate": "-10%", "pitch": "-2Hz"},
    "cc": {"voice": "fr-FR-VivienneMultilingualNeural", "rate": "-5%", "pitch": "-1Hz"},
    "euterpe": {"voice": "fr-FR-VivienneMultilingualNeural", "rate": "+5%", "pitch": "+2Hz"},
    "polymnie": {"voice": "fr-FR-VivienneMultilingualNeural", "rate": "+0%", "pitch": "+1Hz"},
    "horloge": {"voice": "fr-FR-RemyMultilingualNeural", "rate": "-15%", "pitch": "-3Hz"},
    "omniscient": {"voice": "fr-FR-RemyMultilingualNeural", "rate": "-8%", "pitch": "+0Hz"},
    "shiva": {"voice": "fr-FR-RemyMultilingualNeural", "rate": "+10%", "pitch": "-5Hz"},
    "geass": {"voice": "fr-FR-RemyMultilingualNeural", "rate": "+5%", "pitch": "+0Hz"},
    "clotho": {"voice": "fr-FR-VivienneMultilingualNeural", "rate": "+0%", "pitch": "+3Hz"},
    "lachesis": {"voice": "fr-FR-VivienneMultilingualNeural", "rate": "-5%", "pitch": "+0Hz"},
    "atropos": {"voice": "fr-FR-VivienneMultilingualNeural", "rate": "+0%", "pitch": "-2Hz"},
}

def parle(daemon, texte):
    v = VOIX.get(daemon, VOIX["leonardo"])
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        tmp = f.name
    try:
        subprocess.run([
            "edge-tts", 
            "--voice", v["voice"], 
            "--rate", v["rate"],
            "--pitch", v["pitch"],
            "--text", texte, 
            "--write-media", tmp
        ], capture_output=True)
        ffmpeg = subprocess.Popen(["ffmpeg", "-i", tmp, "-f", "wav", "-"],
                                 stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        subprocess.run(["paplay", f"--device={LAPTOP_SINK}"],
                      stdin=ffmpeg.stdout, stderr=subprocess.DEVNULL)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("daemon-voix <entity> <texte>")
        sys.exit(0)
    parle(sys.argv[1], " ".join(sys.argv[2:]))
