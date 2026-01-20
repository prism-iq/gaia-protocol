# PipeWire Mastery - Étude Technique Complète

## Introduction

PipeWire est un serveur multimédia moderne pour Linux qui unifie la gestion de l'audio et de la vidéo. Il remplace à la fois PulseAudio et JACK, offrant une faible latence et une grande flexibilité.

## Architecture PipeWire

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATIONS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │   Firefox   │  │   Ardour    │  │    OBS      │  │   Discord   │        │
│   │  (Browser)  │  │    (DAW)    │  │ (Streaming) │  │   (VoIP)    │        │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│          │                │                │                │               │
│          │ PulseAudio     │ JACK           │ V4L2           │ PulseAudio    │
│          │ API            │ API            │ API            │ API           │
│          │                │                │                │               │
├──────────┼────────────────┼────────────────┼────────────────┼───────────────┤
│          ▼                ▼                ▼                ▼               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    COUCHE DE COMPATIBILITÉ                          │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│   │  │pipewire-pulse│  │ pipewire-jack│  │ pipewire-v4l2│               │   │
│   │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         PIPEWIRE DAEMON                             │   │
│   │                                                                     │   │
│   │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │   │
│   │   │  Session Mgr  │  │    Graph      │  │   Scheduler   │           │   │
│   │   │  (WirePlumber)│  │   Manager     │  │  (RT Thread)  │           │   │
│   │   └───────────────┘  └───────────────┘  └───────────────┘           │   │
│   │                                                                     │   │
│   │   ┌─────────────────────────────────────────────────────────────┐   │   │
│   │   │                      NŒUDS (NODES)                          │   │   │
│   │   │                                                             │   │   │
│   │   │   [Source] ──▶ [Filter] ──▶ [Sink]                          │   │   │
│   │   │                                                             │   │   │
│   │   └─────────────────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         COUCHE MATÉRIELLE                           │   │
│   │                                                                     │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│   │   │     ALSA     │  │   V4L2       │  │  Bluetooth   │              │   │
│   │   │  (Audio HW)  │  │  (Caméra)    │  │   (A2DP)     │              │   │
│   │   └──────────────┘  └──────────────┘  └──────────────┘              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Concepts Fondamentaux

### Le Graph Audio

```
┌─────────────────────────────────────────────────────────────────────┐
│                      GRAPH PIPEWIRE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│   │   Node      │     │   Node      │     │   Node      │           │
│   │ (Firefox)   │     │  (Filtre)   │     │   (Sink)    │           │
│   │             │     │   EQ        │     │  Speakers   │           │
│   │  ┌───────┐  │     │  ┌───────┐  │     │  ┌───────┐  │           │
│   │  │Port FL├──┼─────┼──▶Port I├──┼─────┼──▶Port FL│  │           │
│   │  └───────┘  │     │  └───────┘  │     │  └───────┘  │           │
│   │  ┌───────┐  │     │  ┌───────┐  │     │  ┌───────┐  │           │
│   │  │Port FR├──┼─────┼──▶Port I├──┼─────┼──▶Port FR│  │           │
│   │  └───────┘  │     │  └───────┘  │     │  └───────┘  │           │
│   └─────────────┘     └─────────────┘     └─────────────┘           │
│                                                                     │
│   Légende:                                                          │
│   ─────────  Link (connexion entre ports)                           │
│   Port FL = Front Left                                              │
│   Port FR = Front Right                                             │
│   Port I  = Input                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Installation et Configuration

### Installation

```bash
# Arch Linux
sudo pacman -S pipewire pipewire-pulse pipewire-jack pipewire-alsa wireplumber

# Debian/Ubuntu
sudo apt install pipewire pipewire-pulse pipewire-jack wireplumber

# Fedora
sudo dnf install pipewire pipewire-pulseaudio pipewire-jack-audio-connection-kit wireplumber
```

### Activation des Services

```bash
# Activer PipeWire pour l'utilisateur
systemctl --user enable --now pipewire.socket
systemctl --user enable --now pipewire-pulse.socket
systemctl --user enable --now wireplumber.service

# Vérifier le statut
systemctl --user status pipewire pipewire-pulse wireplumber

# Logs en temps réel
journalctl --user -u pipewire -f
```

## Configuration

### Structure des Fichiers de Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│              HIÉRARCHIE DE CONFIGURATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   /usr/share/pipewire/           (Défauts système)              │
│   ├── pipewire.conf                                             │
│   ├── pipewire-pulse.conf                                       │
│   ├── client.conf                                               │
│   └── jack.conf                                                 │
│              │                                                  │
│              ▼ (surchargé par)                                  │
│                                                                 │
│   /etc/pipewire/                 (Config système locale)        │
│   ├── pipewire.conf.d/                                          │
│   └── pipewire-pulse.conf.d/                                    │
│              │                                                  │
│              ▼ (surchargé par)                                  │
│                                                                 │
│   ~/.config/pipewire/            (Config utilisateur)           │
│   ├── pipewire.conf.d/                                          │
│   │   └── 10-custom.conf                                        │
│   └── pipewire-pulse.conf.d/                                    │
│       └── 10-custom.conf                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration Audio Basse Latence

```bash
# ~/.config/pipewire/pipewire.conf.d/10-low-latency.conf
context.properties = {
    default.clock.rate          = 48000
    default.clock.allowed-rates = [ 44100 48000 96000 ]
    default.clock.quantum       = 64      # Latence ~1.3ms à 48kHz
    default.clock.min-quantum   = 32
    default.clock.max-quantum   = 2048
}

context.modules = [
    { name = libpipewire-module-rt
      args = {
        nice.level   = -11
        rt.prio      = 88
        rt.time.soft = -1
        rt.time.hard = -1
      }
      flags = [ ifexists nofail ]
    }
]
```

### Configuration pour Production Audio

```bash
# ~/.config/pipewire/pipewire.conf.d/20-pro-audio.conf
context.properties = {
    default.clock.rate          = 96000
    default.clock.quantum       = 128
    default.clock.min-quantum   = 64
    default.clock.max-quantum   = 1024
}
```

## Outils en Ligne de Commande

### pw-cli - Interface en Ligne de Commande

```bash
# Lister tous les objets
pw-cli ls

# Informations détaillées sur un objet
pw-cli info 42

# Surveiller les événements
pw-cli dump

# Créer un lien entre ports
pw-cli create-link <output-node-id> <output-port-id> <input-node-id> <input-port-id>
```

### pw-dump - Export JSON du Graph

```bash
# Dump complet du graph
pw-dump

# Dump formaté avec jq
pw-dump | jq '.[] | select(.type == "PipeWire:Interface:Node")'

# Lister les nœuds audio
pw-dump | jq '.[] | select(.info.props["media.class"] | startswith("Audio"))'
```

### pw-top - Monitoring en Temps Réel

```bash
# Afficher les statistiques en temps réel
pw-top

# Sortie exemple:
# S   ID  QUANT   RATE   WAIT   BUSY  W/Q  B/Q  ERR  NAME
# *   45    256  48000   1.2ms  0.3ms  4%   1%    0  Firefox
# *   47    256  48000   0.8ms  0.2ms  3%   0%    0  ALSA Playback
```

### pw-record et pw-play

```bash
# Enregistrement audio
pw-record --target 0 output.wav                    # Défaut
pw-record --target "alsa_input.usb-*" record.wav   # Source spécifique
pw-record --rate 96000 --channels 2 hi-res.wav     # Haute résolution

# Lecture audio
pw-play music.flac
pw-play --target "alsa_output.pci-*" audio.wav

# Enregistrement écran (capture du moniteur audio)
pw-record --target "$(pw-dump | jq -r '.[] | select(.info.props["node.name"] | contains("monitor")) | .id' | head -1)" desktop.wav
```

### wpctl - Contrôle WirePlumber

```bash
# Statut global
wpctl status

# Obtenir/définir le volume
wpctl get-volume @DEFAULT_AUDIO_SINK@
wpctl set-volume @DEFAULT_AUDIO_SINK@ 50%
wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%+
wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-

# Mute/Unmute
wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle

# Définir la sortie par défaut
wpctl set-default <node-id>

# Inspecter un nœud
wpctl inspect <node-id>
```

## Scripting avec pw-link

```bash
#!/bin/bash
# Script: connect_audio.sh
# Connecte automatiquement les sources aux sinks

# Lister les ports de sortie disponibles
pw-link -o

# Lister les ports d'entrée disponibles
pw-link -i

# Lister les liens existants
pw-link -l

# Créer un lien
pw-link "Firefox:output_FL" "Built-in Audio:playback_FL"
pw-link "Firefox:output_FR" "Built-in Audio:playback_FR"

# Supprimer un lien
pw-link -d "Firefox:output_FL" "Built-in Audio:playback_FL"

# Script automatique pour router une application
route_app_to_device() {
    local app_name="$1"
    local device_name="$2"

    # Trouver les ports de l'application
    local app_ports=$(pw-link -o | grep "$app_name")

    # Trouver les ports du device
    local device_ports=$(pw-link -i | grep "$device_name")

    # Connecter FL -> FL, FR -> FR
    for channel in FL FR; do
        local out=$(echo "$app_ports" | grep "$channel" | head -1)
        local in=$(echo "$device_ports" | grep "playback_$channel" | head -1)
        if [[ -n "$out" && -n "$in" ]]; then
            pw-link "$out" "$in"
            echo "Connecté: $out -> $in"
        fi
    done
}

# Usage
route_app_to_device "Firefox" "alsa_output.pci"
```

## API C/C++ Native

### Client PipeWire Simple

```c
// simple_client.c
#include <pipewire/pipewire.h>
#include <spa/param/audio/format-utils.h>

struct data {
    struct pw_main_loop *loop;
    struct pw_stream *stream;
};

static void on_process(void *userdata) {
    struct data *data = userdata;
    struct pw_buffer *b;
    struct spa_buffer *buf;
    float *samples;
    uint32_t n_samples;

    if ((b = pw_stream_dequeue_buffer(data->stream)) == NULL) {
        pw_log_warn("out of buffers");
        return;
    }

    buf = b->buffer;
    samples = buf->datas[0].data;
    n_samples = buf->datas[0].chunk->size / sizeof(float);

    // Générer un signal (sine wave 440Hz)
    static float phase = 0.0f;
    for (uint32_t i = 0; i < n_samples; i++) {
        samples[i] = sinf(phase) * 0.5f;
        phase += 2.0f * M_PI * 440.0f / 48000.0f;
        if (phase >= 2.0f * M_PI)
            phase -= 2.0f * M_PI;
    }

    buf->datas[0].chunk->offset = 0;
    buf->datas[0].chunk->stride = sizeof(float);
    buf->datas[0].chunk->size = n_samples * sizeof(float);

    pw_stream_queue_buffer(data->stream, b);
}

static const struct pw_stream_events stream_events = {
    PW_VERSION_STREAM_EVENTS,
    .process = on_process,
};

int main(int argc, char *argv[]) {
    struct data data = {0};
    const struct spa_pod *params[1];
    uint8_t buffer[1024];
    struct spa_pod_builder b = SPA_POD_BUILDER_INIT(buffer, sizeof(buffer));

    pw_init(&argc, &argv);

    data.loop = pw_main_loop_new(NULL);

    data.stream = pw_stream_new_simple(
        pw_main_loop_get_loop(data.loop),
        "audio-src",
        pw_properties_new(
            PW_KEY_MEDIA_TYPE, "Audio",
            PW_KEY_MEDIA_CATEGORY, "Playback",
            PW_KEY_MEDIA_ROLE, "Music",
            NULL),
        &stream_events,
        &data);

    params[0] = spa_format_audio_raw_build(&b, SPA_PARAM_EnumFormat,
        &SPA_AUDIO_INFO_RAW_INIT(
            .format = SPA_AUDIO_FORMAT_F32,
            .channels = 1,
            .rate = 48000));

    pw_stream_connect(data.stream,
        PW_DIRECTION_OUTPUT,
        PW_ID_ANY,
        PW_STREAM_FLAG_AUTOCONNECT |
        PW_STREAM_FLAG_MAP_BUFFERS |
        PW_STREAM_FLAG_RT_PROCESS,
        params, 1);

    pw_main_loop_run(data.loop);

    pw_stream_destroy(data.stream);
    pw_main_loop_destroy(data.loop);
    pw_deinit();

    return 0;
}
```

### Compilation

```bash
# Compiler avec pkg-config
gcc -o simple_client simple_client.c \
    $(pkg-config --cflags --libs libpipewire-0.3) -lm

# Ou avec CMake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(pipewire_example)

find_package(PkgConfig REQUIRED)
pkg_check_modules(PIPEWIRE REQUIRED libpipewire-0.3)

add_executable(simple_client simple_client.c)
target_include_directories(simple_client PRIVATE ${PIPEWIRE_INCLUDE_DIRS})
target_link_libraries(simple_client ${PIPEWIRE_LIBRARIES} m)
```

## Filtres Audio avec PipeWire

### Architecture des Filtres

```
┌────────────────────────────────────────────────────────────────────┐
│                    CHAÎNE DE FILTRES                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│   │  Source  │──▶│  Filter  │──▶│  Filter  │──▶│   Sink   │        │
│   │          │   │   (EQ)   │   │(Compres.│   │          │        │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘        │
│                                                                    │
│   Implémentation avec filter-chain module:                         │
│                                                                    │
│   context.modules = [                                              │
│     { name = libpipewire-module-filter-chain                       │
│       args = {                                                     │
│         node.description = "My EQ"                                 │
│         media.name       = "My EQ"                                 │
│         filter.graph = {                                           │
│           nodes = [                                                │
│             { type = builtin                                       │
│               name = eq_band_1                                     │
│               label = bq_peaking                                   │
│               control = { Freq = 100 Q = 1.0 Gain = 3.0 }          │
│             }                                                      │
│           ]                                                        │
│         }                                                          │
│         capture.props = {                                          │
│           node.name = "eq_capture"                                 │
│           media.class = Audio/Sink                                 │
│         }                                                          │
│         playback.props = {                                         │
│           node.name = "eq_playback"                                │
│         }                                                          │
│       }                                                            │
│     }                                                              │
│   ]                                                                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Configuration EasyEffects

```bash
# Installation
sudo pacman -S easyeffects  # Arch
sudo apt install easyeffects  # Debian/Ubuntu

# Les presets sont stockés dans
~/.config/easyeffects/output/
~/.config/easyeffects/input/
```

## Intégration JACK

```
┌────────────────────────────────────────────────────────────────────┐
│                     MODE JACK                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   Applications JACK existantes fonctionnent via pipewire-jack:     │
│                                                                    │
│   ┌──────────────┐                                                 │
│   │   Ardour     │──┐                                              │
│   └──────────────┘  │                                              │
│   ┌──────────────┐  │    ┌─────────────────┐    ┌───────────────┐  │
│   │   Carla      │──┼───▶│  pipewire-jack  │───▶│   PipeWire    │  │
│   └──────────────┘  │    │   (shim lib)    │    │    Daemon     │  │
│   ┌──────────────┐  │    └─────────────────┘    └───────────────┘  │
│   │  Guitarix    │──┘                                              │
│   └──────────────┘                                                 │
│                                                                    │
│   Pour lancer une app avec JACK:                                   │
│   $ pw-jack ardour7                                                │
│                                                                    │
│   Variables d'environnement:                                       │
│   $ export LD_LIBRARY_PATH=/usr/lib/pipewire-0.3/jack              │
│   $ ardour7                                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## WirePlumber - Session Manager

### Scripts Lua Personnalisés

```lua
-- ~/.config/wireplumber/main.lua.d/51-custom-rules.lua

-- Règle pour définir le volume par défaut
rule = {
  matches = {
    {
      { "node.name", "equals", "alsa_output.pci-0000_00_1f.3.analog-stereo" },
    },
  },
  apply_properties = {
    ["node.volume"] = 0.5,
    ["node.description"] = "Ma Carte Son",
  },
}

table.insert(alsa_monitor.rules, rule)
```

### Profils de Périphériques

```lua
-- ~/.config/wireplumber/main.lua.d/52-device-profiles.lua

-- Sélectionner automatiquement un profil pour un périphérique USB
rule = {
  matches = {
    {
      { "device.name", "matches", "alsa_card.usb-*" },
    },
  },
  apply_properties = {
    ["device.profile"] = "pro-audio",
  },
}

table.insert(alsa_monitor.rules, rule)
```

## Dépannage

### Commandes de Diagnostic

```bash
# Vérifier si PipeWire fonctionne
pactl info | grep "Server Name"
# Devrait afficher: Server Name: PulseAudio (on PipeWire 0.3.xx)

# Vérifier les services
systemctl --user status pipewire pipewire-pulse wireplumber

# Logs détaillés
PIPEWIRE_DEBUG=3 pipewire
WIREPLUMBER_DEBUG=3 wireplumber

# Redémarrer proprement
systemctl --user restart pipewire pipewire-pulse wireplumber

# Vérifier les périphériques ALSA
aplay -l
arecord -l

# Test audio direct ALSA (bypass PipeWire)
speaker-test -D hw:0,0 -c 2

# Test via PipeWire
pw-play /usr/share/sounds/alsa/Front_Center.wav
```

### Problèmes Courants

```
┌────────────────────────────────────────────────────────────────────┐
│                    RÉSOLUTION DE PROBLÈMES                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   Problème: Pas de son                                             │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │ 1. wpctl status                  # Vérifier le graph        │  │
│   │ 2. wpctl get-volume @DEFAULT_AUDIO_SINK@  # Volume?         │  │
│   │ 3. pw-top                        # Le stream existe?        │  │
│   │ 4. journalctl --user -u pipewire # Erreurs?                 │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│   Problème: Craquements/glitches                                   │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │ 1. pw-top                        # Vérifier WAIT/BUSY       │  │
│   │ 2. Augmenter quantum:                                       │  │
│   │    default.clock.quantum = 1024  # Plus de buffer           │  │
│   │ 3. Vérifier les permissions RT:                             │  │
│   │    ulimit -r                     # Devrait être > 0         │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│   Problème: Latence trop élevée                                    │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │ 1. Réduire quantum: 64, 32, ou 16                           │  │
│   │ 2. Activer realtime:                                        │  │
│   │    sudo usermod -a -G realtime $USER                        │  │
│   │ 3. Configurer limits.conf:                                  │  │
│   │    @realtime - rtprio 99                                    │  │
│   │    @realtime - memlock unlimited                            │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Références

- Documentation officielle: https://docs.pipewire.org/
- Wiki Arch Linux: https://wiki.archlinux.org/title/PipeWire
- GitLab PipeWire: https://gitlab.freedesktop.org/pipewire/pipewire
- WirePlumber: https://pipewire.pages.freedesktop.org/wireplumber/
