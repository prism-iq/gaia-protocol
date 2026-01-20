# Audio Routing sous Linux - Étude Technique Complète

## Introduction

Le routage audio sous Linux permet de diriger les flux audio entre différentes applications et périphériques matériels. Cette étude couvre les différentes couches du stack audio Linux et les techniques de routage avancées.

## Architecture du Stack Audio Linux

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STACK AUDIO LINUX                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         APPLICATIONS                                │   │
│   │                                                                     │   │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│   │   │ Firefox │  │  VLC    │  │ Ardour  │  │Discord  │  │  OBS    │   │   │
│   │   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │   │
│   │        │            │            │            │            │        │   │
│   └────────┼────────────┼────────────┼────────────┼────────────┼────────┘   │
│            │            │            │            │            │            │
│   ┌────────┼────────────┼────────────┼────────────┼────────────┼────────┐   │
│   │        ▼            ▼            │            ▼            ▼        │   │
│   │   ┌────────────────────────┐     │     ┌──────────────────────┐    │   │
│   │   │     PulseAudio API     │     │     │      JACK API        │    │   │
│   │   │   (pipewire-pulse)     │     │     │   (pipewire-jack)    │    │   │
│   │   └───────────┬────────────┘     │     └──────────┬───────────┘    │   │
│   │               │                  │                │                │   │
│   │               └──────────────────┼────────────────┘                │   │
│   │                                  ▼                                 │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                        PIPEWIRE                             │  │   │
│   │   │                                                             │  │   │
│   │   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │  │   │
│   │   │   │   Session   │    │   Graph     │    │  Buffers    │     │  │   │
│   │   │   │   Manager   │    │   Engine    │    │   & DSP     │     │  │   │
│   │   │   │(WirePlumber)│    │             │    │             │     │  │   │
│   │   │   └─────────────┘    └─────────────┘    └─────────────┘     │  │   │
│   │   │                                                             │  │   │
│   │   └─────────────────────────────┬───────────────────────────────┘  │   │
│   │                                 │                                  │   │
│   │               SERVEURS AUDIO    │                                  │   │
│   └─────────────────────────────────┼──────────────────────────────────┘   │
│                                     │                                      │
│   ┌─────────────────────────────────┼──────────────────────────────────┐   │
│   │                                 ▼                                  │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                          ALSA                               │  │   │
│   │   │           Advanced Linux Sound Architecture                 │  │   │
│   │   │                                                             │  │   │
│   │   │   ┌───────────┐  ┌───────────┐  ┌───────────┐               │  │   │
│   │   │   │  PCM      │  │  Control  │  │  MIDI     │               │  │   │
│   │   │   │  Devices  │  │  Mixer    │  │  Sequencer│               │  │   │
│   │   │   └───────────┘  └───────────┘  └───────────┘               │  │   │
│   │   │                                                             │  │   │
│   │   └─────────────────────────────┬───────────────────────────────┘  │   │
│   │                                 │                                  │   │
│   │               KERNEL SPACE      │                                  │   │
│   └─────────────────────────────────┼──────────────────────────────────┘   │
│                                     │                                      │
│   ┌─────────────────────────────────┼──────────────────────────────────┐   │
│   │                                 ▼                                  │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                    DRIVERS MATÉRIELS                        │  │   │
│   │   │                                                             │  │   │
│   │   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │   │
│   │   │   │  HDA     │  │   USB    │  │Bluetooth │  │  HDMI    │    │  │   │
│   │   │   │ Intel    │  │  Audio   │  │  A2DP    │  │  Audio   │    │  │   │
│   │   │   └──────────┘  └──────────┘  └──────────┘  └──────────┘    │  │   │
│   │   │                                                             │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │               MATÉRIEL                                             │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ALSA - La Couche de Base

### Configuration ALSA

```bash
# ~/.asoundrc ou /etc/asound.conf

# Définir le périphérique par défaut
pcm.!default {
    type pulse
    fallback "sysdefault"
    hint {
        show on
        description "Default ALSA Output (PulseAudio)"
    }
}

ctl.!default {
    type pulse
    fallback "sysdefault"
}

# Périphérique personnalisé avec rééchantillonnage
pcm.high_quality {
    type plug
    slave {
        pcm "hw:0,0"
        format S32_LE
        rate 96000
    }
}

# Loopback pour capture interne
pcm.loop_out {
    type plug
    slave.pcm "hw:Loopback,0,0"
}

pcm.loop_in {
    type plug
    slave.pcm "hw:Loopback,1,0"
}
```

### Périphériques Loopback ALSA

```bash
# Charger le module loopback
sudo modprobe snd-aloop

# Vérifier
aplay -l | grep Loopback

# Rendre permanent
echo "snd-aloop" | sudo tee /etc/modules-load.d/snd-aloop.conf

# Options du module (pour plusieurs périphériques)
echo "options snd-aloop index=10,11 pcm_substreams=8" | \
    sudo tee /etc/modprobe.d/snd-aloop.conf
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ALSA LOOPBACK DEVICE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                      snd-aloop                               │  │
│   │                                                              │  │
│   │   ┌──────────────────┐     ┌──────────────────┐              │  │
│   │   │   Loopback,0     │◀───▶│   Loopback,1     │              │  │
│   │   │   (Playback)     │     │   (Capture)      │              │  │
│   │   └────────┬─────────┘     └────────┬─────────┘              │  │
│   │            │                        │                        │  │
│   │            ▼                        ▼                        │  │
│   │   Ce qu'on envoie à        Ce qu'on peut capturer            │  │
│   │   Loopback,0 sort sur      depuis Loopback,1                 │  │
│   │   Loopback,1                                                 │  │
│   │                                                              │  │
│   │   Cas d'usage:                                               │  │
│   │   - Capture du son du système                                │  │
│   │   - Routing entre applications                               │  │
│   │   - Streaming/Recording                                      │  │
│   │                                                              │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Commandes ALSA Essentielles

```bash
# Lister les périphériques
aplay -l               # Périphériques de lecture
arecord -l             # Périphériques de capture
aplay -L               # Tous les PCM définis

# Tester la lecture
speaker-test -D hw:0,0 -c 2 -t wav
aplay -D hw:0,0 /usr/share/sounds/alsa/Front_Center.wav

# Tester l'enregistrement
arecord -D hw:0,0 -f cd -d 5 test.wav
arecord -D hw:0,0 -f S16_LE -r 48000 -c 2 test.wav

# Mixer
alsamixer
amixer
amixer -c 0 sset Master 80%
amixer -c 0 sset Capture 50%

# Informations détaillées
cat /proc/asound/cards
cat /proc/asound/card0/pcm0p/sub0/status
```

## PipeWire - Routage Moderne

### Commandes de Routage PipeWire

```bash
# Voir l'état du graph
wpctl status

# Lister les nœuds avec détails
pw-dump | jq '.[] | select(.type == "PipeWire:Interface:Node") |
    {id: .id, name: .info.props["node.name"], class: .info.props["media.class"]}'

# Lister les ports disponibles
pw-link -o    # Ports de sortie
pw-link -i    # Ports d'entrée
pw-link -l    # Liens existants

# Créer un lien
pw-link "Firefox:output_FL" "Built-in Audio:playback_FL"
pw-link "Firefox:output_FR" "Built-in Audio:playback_FR"

# Supprimer un lien
pw-link -d "Firefox:output_FL" "Built-in Audio:playback_FL"

# Définir les sinks par défaut
wpctl set-default <sink-id>
```

### Création de Nœuds Virtuels

```bash
# Créer un sink virtuel (Virtual Sink)
pw-loopback -n "Virtual-Sink" \
    --capture-props="media.class=Audio/Sink node.name=my_virtual_sink" \
    --playback-props="node.name=my_virtual_sink_output"

# Créer une source virtuelle (Virtual Source)
pw-loopback -n "Virtual-Source" \
    --capture-props="node.name=my_virtual_source_input" \
    --playback-props="media.class=Audio/Source node.name=my_virtual_source"
```

### Script de Routage Automatique

```bash
#!/bin/bash
# audio_routing.sh - Script de routage audio automatique

set -e

# Configuration
VIRTUAL_SINK="Virtual-Streaming"
MONITOR_SOURCE="Virtual-Streaming-Monitor"

# Créer le sink virtuel
create_virtual_sink() {
    echo "Creating virtual sink: $VIRTUAL_SINK"

    pw-loopback -n "$VIRTUAL_SINK" \
        --capture-props="media.class=Audio/Sink node.name=$VIRTUAL_SINK" \
        --playback-props="node.name=${VIRTUAL_SINK}_playback" &

    sleep 1
    echo "Virtual sink created"
}

# Router une application vers le sink virtuel
route_app_to_sink() {
    local app_name="$1"
    local sink_name="$2"

    echo "Routing $app_name to $sink_name"

    # Trouver les ports de l'application
    local app_fl=$(pw-link -o | grep "$app_name" | grep "FL" | head -1)
    local app_fr=$(pw-link -o | grep "$app_name" | grep "FR" | head -1)

    # Trouver les ports du sink
    local sink_fl=$(pw-link -i | grep "$sink_name" | grep "FL" | head -1)
    local sink_fr=$(pw-link -i | grep "$sink_name" | grep "FR" | head -1)

    # Déconnecter les liens existants
    pw-link -d "$app_fl" 2>/dev/null || true
    pw-link -d "$app_fr" 2>/dev/null || true

    # Créer les nouveaux liens
    pw-link "$app_fl" "$sink_fl"
    pw-link "$app_fr" "$sink_fr"

    echo "Routing complete"
}

# Afficher le status
show_status() {
    echo "=== Current Audio Graph ==="
    wpctl status
    echo ""
    echo "=== Active Links ==="
    pw-link -l
}

# Menu principal
case "${1:-status}" in
    create)
        create_virtual_sink
        ;;
    route)
        route_app_to_sink "$2" "$3"
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {create|route <app> <sink>|status}"
        exit 1
        ;;
esac
```

## Routage pour le Streaming

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SETUP STREAMING TYPIQUE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                    │
│   │   Discord    │   │    Jeu       │   │   Musique    │                    │
│   │   (VoIP)     │   │              │   │              │                    │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                    │
│          │                  │                  │                            │
│          ▼                  ▼                  ▼                            │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                        PIPEWIRE GRAPH                                │  │
│   │                                                                      │  │
│   │   ┌─────────────────┐        ┌─────────────────┐                     │  │
│   │   │ Virtual Sink    │        │ Virtual Sink    │                     │  │
│   │   │ "Stream-Mix"    │◀───────│ "Desktop-Audio" │◀── Jeu + Musique    │  │
│   │   └────────┬────────┘        └────────┬────────┘                     │  │
│   │            │                          │                              │  │
│   │            │    ┌─────────────────────┘                              │  │
│   │            │    │                                                    │  │
│   │            ▼    ▼                                                    │  │
│   │   ┌─────────────────┐                                                │  │
│   │   │      OBS        │──────▶  Twitch/YouTube                         │  │
│   │   │   (Capture)     │                                                │  │
│   │   └─────────────────┘                                                │  │
│   │                                                                      │  │
│   │   ┌─────────────────┐                                                │  │
│   │   │  Microphone     │──────▶  Discord + OBS                          │  │
│   │   │  (avec filter)  │                                                │  │
│   │   └─────────────────┘                                                │  │
│   │                                                                      │  │
│   │                             ┌─────────────────┐                      │  │
│   │   Tous les sons ──────────▶│    Speakers     │                       │  │
│   │                             │   (Monitoring)  │                       │  │
│   │                             └─────────────────┘                      │  │
│   │                                                                      │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Configuration Streaming avec PipeWire

```bash
#!/bin/bash
# streaming_setup.sh

# Créer les sinks virtuels
setup_streaming_sinks() {
    # Sink pour le desktop audio (jeux, musique)
    pw-loopback -n "Desktop-Audio" \
        --capture-props="media.class=Audio/Sink node.name=Desktop-Audio" \
        --playback-props="node.name=Desktop-Audio-Out" &

    # Sink pour le mix final (ce que OBS capture)
    pw-loopback -n "Stream-Mix" \
        --capture-props="media.class=Audio/Sink node.name=Stream-Mix" \
        --playback-props="node.name=Stream-Mix-Out" &

    sleep 2

    # Router Desktop-Audio vers Stream-Mix et Speakers
    pw-link "Desktop-Audio-Out:output_FL" "Stream-Mix:input_FL"
    pw-link "Desktop-Audio-Out:output_FR" "Stream-Mix:input_FR"

    # Monitor vers les speakers
    wpctl set-default $(wpctl status | grep -A 100 "Sinks:" | grep "Desktop-Audio" | awk '{print $1}' | head -1)
}

# Nettoyer
cleanup() {
    pkill -f "pw-loopback.*Desktop-Audio" || true
    pkill -f "pw-loopback.*Stream-Mix" || true
}

trap cleanup EXIT

setup_streaming_sinks
echo "Streaming setup ready. Press Ctrl+C to cleanup."
wait
```

## Filtres Audio avec PipeWire

### Filter-Chain pour Traitement Audio

```bash
# ~/.config/pipewire/pipewire.conf.d/10-filters.conf

context.modules = [
    # Filtre de suppression de bruit pour le micro
    { name = libpipewire-module-filter-chain
      args = {
        node.description = "Noise Suppressor"
        media.name       = "Noise Suppressor"
        filter.graph = {
          nodes = [
            {
              type   = ladspa
              name   = rnnoise
              plugin = /usr/lib/ladspa/librnnoise_ladspa.so
              label  = noise_suppressor_mono
              control = {
                "VAD Threshold (%)" = 50.0
              }
            }
          ]
        }
        audio.rate = 48000
        audio.channels = 1
        audio.position = [ MONO ]
        capture.props = {
          node.name   = "rnnoise_capture"
          node.passive = true
        }
        playback.props = {
          node.name   = "rnnoise_playback"
          media.class = Audio/Source
        }
      }
    }

    # Égaliseur paramétrique
    { name = libpipewire-module-filter-chain
      args = {
        node.description = "Parametric EQ"
        media.name       = "Parametric EQ"
        filter.graph = {
          nodes = [
            {
              type = builtin
              name = eq_band1
              label = bq_peaking
              control = { "Freq" = 100 "Q" = 1.0 "Gain" = 3.0 }
            }
            {
              type = builtin
              name = eq_band2
              label = bq_peaking
              control = { "Freq" = 1000 "Q" = 1.0 "Gain" = 0.0 }
            }
            {
              type = builtin
              name = eq_band3
              label = bq_peaking
              control = { "Freq" = 5000 "Q" = 1.0 "Gain" = 2.0 }
            }
          ]
          links = [
            { output = "eq_band1:Out" input = "eq_band2:In" }
            { output = "eq_band2:Out" input = "eq_band3:In" }
          ]
        }
        capture.props = {
          node.name = "eq_capture"
          media.class = Audio/Sink
        }
        playback.props = {
          node.name = "eq_playback"
        }
      }
    }
]
```

## JACK pour Audio Pro

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE JACK                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    JACK Server (via PipeWire)               │   │
│   │                                                             │   │
│   │   Quantum: 64 samples   Rate: 48000 Hz   Latency: ~2.7ms    │   │
│   │                                                             │   │
│   │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │   │
│   │   │   Ardour     │    │   Guitarix   │    │   Carla      │  │   │
│   │   │  ┌────────┐  │    │  ┌────────┐  │    │  ┌────────┐  │  │   │
│   │   │  │out_L   │──┼────┼─▶│in_L    │  │    │  │midi_in │  │  │   │
│   │   │  │out_R   │──┼────┼─▶│in_R    │  │    │  │        │  │  │   │
│   │   │  └────────┘  │    │  └────────┘  │    │  │        │  │  │   │
│   │   │              │    │  ┌────────┐  │    │  │audio_L │──┼──┼──▶│
│   │   │              │    │  │out_L   │──┼────┼─▶│audio_R │──┼──┼──▶│
│   │   │              │    │  │out_R   │──┼────┼─▶│        │  │  │   │
│   │   │              │    │  └────────┘  │    │  └────────┘  │  │   │
│   │   └──────────────┘    └──────────────┘    └──────────────┘  │   │
│   │                                                             │   │
│   │   ┌──────────────┐                       ┌──────────────┐   │   │
│   │   │ system:      │                       │ system:      │   │   │
│   │   │  capture_1 ──┼──────────────────────▶│  playback_1  │   │   │
│   │   │  capture_2 ──┼──────────────────────▶│  playback_2  │   │   │
│   │   └──────────────┘                       └──────────────┘   │   │
│   │    (Interface)                            (Speakers)        │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Commandes JACK

```bash
# Démarrer avec PipeWire-JACK
pw-jack <application>

# Ou configurer globalement via LD_PRELOAD
export LD_LIBRARY_PATH=/usr/lib/pipewire-0.3/jack

# Outils de contrôle JACK
jack_control start
jack_control status
jack_lsp                    # Lister les ports
jack_lsp -c                 # Avec les connexions
jack_connect client:out system:playback_1
jack_disconnect client:out system:playback_1

# Monitoring
jack_samplerate
jack_buffersize
```

## Scripts Utilitaires

### Sélecteur de Profil Audio

```python
#!/usr/bin/env python3
"""
audio_profile.py - Gestion des profils audio
"""

import subprocess
import json
import sys
from pathlib import Path

PROFILES_DIR = Path.home() / ".config" / "audio_profiles"

def get_current_state() -> dict:
    """Capture l'état actuel du graph audio."""
    result = subprocess.run(
        ["pw-dump"],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)

def get_links() -> list[tuple[str, str]]:
    """Récupère les liens actuels."""
    result = subprocess.run(
        ["pw-link", "-l"],
        capture_output=True,
        text=True
    )
    links = []
    for line in result.stdout.strip().split('\n'):
        if '|' in line:
            parts = line.split('|')
            if len(parts) == 2:
                links.append((parts[0].strip(), parts[1].strip()))
    return links

def save_profile(name: str):
    """Sauvegarde le profil actuel."""
    PROFILES_DIR.mkdir(parents=True, exist_ok=True)

    profile = {
        "name": name,
        "links": get_links(),
        "default_sink": get_default("sink"),
        "default_source": get_default("source"),
    }

    profile_path = PROFILES_DIR / f"{name}.json"
    profile_path.write_text(json.dumps(profile, indent=2))
    print(f"Profile saved: {profile_path}")

def load_profile(name: str):
    """Charge un profil."""
    profile_path = PROFILES_DIR / f"{name}.json"

    if not profile_path.exists():
        print(f"Profile not found: {name}")
        return

    profile = json.loads(profile_path.read_text())

    # Restaurer les liens
    for output, input_ in profile.get("links", []):
        subprocess.run(["pw-link", output, input_], capture_output=True)

    # Restaurer les défauts
    if sink := profile.get("default_sink"):
        subprocess.run(["wpctl", "set-default", sink])

    if source := profile.get("default_source"):
        subprocess.run(["wpctl", "set-default", source])

    print(f"Profile loaded: {name}")

def get_default(type_: str) -> str:
    """Récupère le sink/source par défaut."""
    result = subprocess.run(
        ["wpctl", "status"],
        capture_output=True,
        text=True
    )
    # Parser la sortie pour trouver le défaut
    # (simplifié - parser réel plus complexe)
    return ""

def list_profiles():
    """Liste les profils disponibles."""
    if not PROFILES_DIR.exists():
        print("No profiles found")
        return

    for profile in PROFILES_DIR.glob("*.json"):
        print(f"  - {profile.stem}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: audio_profile.py {save|load|list} [name]")
        sys.exit(1)

    action = sys.argv[1]

    if action == "save" and len(sys.argv) > 2:
        save_profile(sys.argv[2])
    elif action == "load" and len(sys.argv) > 2:
        load_profile(sys.argv[2])
    elif action == "list":
        list_profiles()
    else:
        print("Usage: audio_profile.py {save|load|list} [name]")
```

### Moniteur de Latence

```bash
#!/bin/bash
# audio_latency_monitor.sh

echo "Audio Latency Monitor"
echo "===================="

while true; do
    clear
    echo "=== PipeWire Stats ==="
    echo ""

    # Informations de base
    pw-top 2>/dev/null | head -20

    echo ""
    echo "=== Buffer Info ==="

    # Quantum actuel
    pw-dump 2>/dev/null | jq -r '
        .[] | select(.type == "PipeWire:Interface:Metadata") |
        .metadata[]? | select(.key == "default.clock.rate" or .key == "default.clock.quantum") |
        "\(.key): \(.value.value)"
    ' 2>/dev/null

    # Calcul de la latence
    RATE=$(pw-dump 2>/dev/null | jq -r '.[] | select(.info.props["clock.rate"]) | .info.props["clock.rate"]' | head -1)
    QUANTUM=$(pw-dump 2>/dev/null | jq -r '.[] | select(.info.props["clock.quantum"]) | .info.props["clock.quantum"]' | head -1)

    if [[ -n "$RATE" && -n "$QUANTUM" ]]; then
        LATENCY=$(echo "scale=2; $QUANTUM / $RATE * 1000" | bc)
        echo ""
        echo "Estimated buffer latency: ${LATENCY}ms"
        echo "(Rate: $RATE Hz, Quantum: $QUANTUM samples)"
    fi

    sleep 2
done
```

## Bluetooth Audio

```bash
# Configuration Bluetooth haute qualité
# ~/.config/wireplumber/bluetooth.lua.d/51-high-quality.lua

bluez_monitor.properties = {
  ["bluez5.enable-sbc-xq"] = true,
  ["bluez5.enable-msbc"] = true,
  ["bluez5.enable-hw-volume"] = true,
  ["bluez5.headset-roles"] = "[ hsp_hs hsp_ag hfp_hf hfp_ag ]",
  ["bluez5.codecs"] = "[ sbc sbc_xq aac ldac aptx aptx_hd aptx_ll aptx_ll_duplex ]",
}
```

```bash
# Commandes Bluetooth audio
bluetoothctl
  > scan on
  > pair XX:XX:XX:XX:XX:XX
  > connect XX:XX:XX:XX:XX:XX
  > trust XX:XX:XX:XX:XX:XX

# Voir les codecs utilisés
pactl list cards | grep -A 20 "bluez"

# Changer de profil
pactl set-card-profile bluez_card.XX_XX_XX_XX_XX_XX a2dp-sink-sbc_xq
```

## Dépannage

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DÉPANNAGE AUDIO                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Pas de son:                                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ 1. wpctl status              # Graph OK?                    │   │
│   │ 2. wpctl get-volume @DEFAULT_AUDIO_SINK@  # Mute?           │   │
│   │ 3. pw-top                    # Streams actifs?              │   │
│   │ 4. speaker-test -D hw:0,0    # ALSA direct OK?              │   │
│   │ 5. journalctl --user -u pipewire  # Erreurs?                │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Craquements/Glitches:                                             │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ 1. pw-top                    # Xruns? WAIT > quantum?       │   │
│   │ 2. Augmenter quantum:        # 256, 512, 1024               │   │
│   │ 3. Vérifier realtime:        # rtkit installé?              │   │
│   │ 4. Vérifier CPU:             # htop - processus bloquant?   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Application non routée:                                           │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ 1. pw-link -l               # Liens existants?              │   │
│   │ 2. pw-dump | jq '...'       # Application visible?          │   │
│   │ 3. pavucontrol              # Interface graphique           │   │
│   │ 4. Redémarrer l'app après PipeWire                          │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Bluetooth audio mauvais:                                          │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ 1. pactl list cards | grep -A 20 bluez  # Codec?            │   │
│   │ 2. Passer en A2DP si en HSP/HFP                             │   │
│   │ 3. Activer codecs haute qualité (aptX, LDAC)                │   │
│   │ 4. bluetoothctl disconnect && connect                       │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Références

- ALSA Documentation: https://www.alsa-project.org/wiki/Main_Page
- PipeWire Documentation: https://docs.pipewire.org/
- WirePlumber: https://pipewire.pages.freedesktop.org/wireplumber/
- JACK Audio: https://jackaudio.org/
- Arch Wiki - PipeWire: https://wiki.archlinux.org/title/PipeWire
- Arch Wiki - ALSA: https://wiki.archlinux.org/title/Advanced_Linux_Sound_Architecture
