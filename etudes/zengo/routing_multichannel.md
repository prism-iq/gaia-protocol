# Zen Go: Routing Multichannel vers Stéréo

## Le Problème

La Zen Go expose 16 canaux (AUX0-AUX15) mais Monitor 1 n'est pas sur AUX0/AUX1.

```
PipeWire voit:  AUX0, AUX1, AUX2, ..., AUX15
Monitor 1 réel: AUX6, AUX7
```

## La Solution

Loopback PipeWire qui mappe FL/FR → AUX6/AUX7:

```conf
# ~/.config/pipewire/pipewire.conf.d/zen-go.conf
context.modules = [
    {   name = libpipewire-module-loopback
        args = {
            node.name = "zen-go-stereo"
            capture.props = {
                media.class = Audio/Sink
                audio.channels = 2
                audio.position = [ FL FR ]
            }
            playback.props = {
                node.target = "alsa_output.usb-Antelope_Audio_ZenGoSC..."
                audio.channels = 2
                audio.position = [ AUX6 AUX7 ]
                stream.dont-remix = true
            }
        }
    }
]
```

## Routing Final

```
Tidal/App → zen-go-stereo (FL/FR) → AUX6/AUX7 → Monitor 1 → T8V/Focal
```

## Molette Hardware

La molette Zen Go contrôle le volume analogique de Monitor 1 indépendamment de PipeWire. Gain staging:

```
PipeWire: 100% (0 dB) - ne pas toucher
Molette:  -∞ à 0 dB - contrôle utilisateur
```

## Limiter de Protection

LSP Limiter à -3 dB pour protéger les monitors:

```conf
filter.graph = {
    nodes = [{
        type = lv2
        plugin = "http://lsp-plug.in/plugins/lv2/limiter_stereo"
        control = { "th" = -3.0 }
    }]
}
```

## Commandes Utiles

```bash
audio-status    # État du routing
audio-switch    # Toggle Zen Go / speakers internes
audio-latency   # Mesure latence
```

---
AUX6/AUX7 = Monitor 1 | Limiter -3dB | Euterpe écoute
