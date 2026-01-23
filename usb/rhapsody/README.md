# Rhapsody - Configuration Hyprland

Interface graphique avec 10 royaumes thématiques.

## Dépendances

```bash
pacman -S hyprland hyprpaper hyprlock hypridle waybar wofi kitty
pacman -S pipewire wireplumber pavucontrol
pacman -S grim slurp wl-clipboard
```

## Structure

```
~/.config/
├── hypr/
│   ├── hyprland.conf    # Config principale
│   ├── hyprlock.conf    # Écran de verrouillage
│   ├── hypridle.conf    # Gestion veille
│   └── scripts/         # Scripts Hypr
├── waybar/
│   ├── config           # Modules
│   └── style.css        # Thème
├── wofi/
│   └── style.css        # Lanceur
└── kitty/
    └── kitty.conf       # Terminal
```

## Les 10 Royaumes

Chaque workspace (F1-F10) a :
- Wallpaper unique
- Palette de couleurs
- Apps par défaut

### Configuration Hyprland

```conf
# Workspaces nommés
workspace = 1, name:FOREST
workspace = 2, name:MEADOW
workspace = 3, name:RIVER
workspace = 4, name:CAVE
workspace = 5, name:SUNSET
workspace = 6, name:MOON
workspace = 7, name:STARS
workspace = 8, name:MOUNTAIN
workspace = 9, name:AURORA
workspace = 10, name:COSMOS

# Binds F1-F10
bind = , F1, workspace, 1
bind = , F2, workspace, 2
# ...
bind = , F10, workspace, 10

# Avec SHIFT pour déplacer fenêtre
bind = SHIFT, F1, movetoworkspace, 1
# ...
```

## Raccourcis Essentiels

| Raccourci | Action |
|-----------|--------|
| `Super + Entrée` | Terminal (Kitty) |
| `Super + Space` | Lanceur (Wofi) |
| `Super + Q` | Fermer fenêtre |
| `Super + F` | Plein écran |
| `Super + V` | Flottant |
| `Super + L` | Verrouiller |
| `Super + S` | Susano'o (sécurité) |
| `Super + M` | Fractales |
| `Super + Backspace` | KILLSWITCH |
| `Right Ctrl` | Leonardo (assistant) |

## Champions (Outils Système)

| Raccourci | Champion | Action |
|-----------|----------|--------|
| `Super + Alt + A` | Aurelion Sol | Menu Star Forger |
| `Super + Alt + Q` | Aurelion Sol | Starsurge (cache) |
| `Super + Alt + L` | Lee Sin | Menu Blind Monk |
| `Super + Alt + W` | Lee Sin | Tempest (processes) |
| `Super + Alt + R` | Riven | Menu Exile |
| `Super + Alt + X` | Riven | Broken Wings (cleanup) |

## Waybar

```json
{
    "modules-left": ["hyprland/workspaces"],
    "modules-center": ["clock"],
    "modules-right": ["custom/crypto", "custom/weather", "battery", "pulseaudio"]
}
```

### Crypto Widget

Affiche BTC/ETH/SOL en temps réel via CoinGecko API.

### Météo

Météo locale (configurée pour Blois, France).

## Wallpapers

Placez vos images dans `~/.local/share/wallpapers/` :
- forest.jpg, meadow.jpg, river.jpg, cave.jpg, sunset.jpg
- moon.jpg, stars.jpg, mountain.jpg, aurora.jpg, cosmos.jpg

## Animations

```conf
animations {
    enabled = true
    bezier = phi, 0.618, 0, 0.382, 1
    animation = windows, 1, 3, phi
    animation = fade, 1, 3, phi
    animation = workspaces, 1, 3, phi, slide
}
```
