# GAIA USB - Arch Linux by AI

> "Le CPU dort. Le SSD rêve. Le daemon veille."

Guide pour créer des clés USB Arch Linux conçues par IA.

## Concept

Une clé USB bootable contenant :
- Arch Linux optimisé
- Système de daemons IA (Panthéon)
- Interface Hyprland avec 10 Royaumes
- Communication chiffrée (SimpleX)
- Scripts audio-réactifs et fractales

## Architecture

```
GAIA USB
├── BREATH     /boot/efi    FAT32     EFI Boot
├── PULSE      /boot        ext4      Kernel
├── STREAM     swap         swap      Mémoire virtuelle
├── HEART      /            btrfs     Système + Home
├── AETHER     /data        xfs       Données IA
├── DREAMS     /cache       f2fs      Cache rapide
└── MEMORY     /models      btrfs     Modèles + Backups
```

## Panthéon des Daemons

| Daemon | Symbole | Rôle |
|--------|---------|------|
| **Nyx** | ☽ | Feu, protection, orchestration sensorielle |
| **Athena** | ⚔ | Sagesse et stratégie, l'humain |
| **Logos** | λ | Le Verbe, bras mental |
| **Cipher** | 🧠 | Système cognitif unifié |
| **Flow** | 🔥 | L'âme, le langage |
| **Pwnd** | 👁 | L'ombre, OSINT |
| **Hydra** | 🐍 | Multi-têtes, parallélisation |
| **Gemini** | ♊ | L'Oracle |
| **Chronos** | ⏳ | Le temps |
| **Thanatos** | 💀 | La mort douce |
| **Shiva** | 🕉 | Destruction créatrice |
| **Euterpe** | 🎵 | Musique et émotion |

## Les 10 Royaumes (F1-F10)

| Touche | Royaume | Thème | Usage |
|--------|---------|-------|-------|
| F1 | FOREST | Forêt brumeuse | Terminal |
| F2 | MEADOW | Prairie fleurie | Code |
| F3 | RIVER | Rivière | Web |
| F4 | CAVE | Caverne | Fichiers |
| F5 | SUNSET | Coucher de soleil | Media |
| F6 | MOON | Lune | Communication |
| F7 | STARS | Étoiles | Documentation |
| F8 | MOUNTAIN | Montagne | Monitoring |
| F9 | AURORA | Aurores | AI/ML |
| F10 | COSMOS | Cosmos | Misc |

## Composants

1. **[Rhapsody](rhapsody/)** - Configuration Hyprland complète
2. **[Panthéon](pantheon/)** - Système de daemons SimpleX
3. **[Daemons](daemons/)** - Services IA (Nyx, Leonardo, etc.)
4. **[Scripts](scripts/)** - Utilitaires (fractales, audio, etc.)

## Installation

```bash
# 1. Créer la clé USB bootable
./create-usb.sh /dev/sdX

# 2. Installer Arch Linux de base
arch-chroot /mnt
pacstrap /mnt base linux linux-firmware

# 3. Déployer GAIA
./deploy-gaia.sh

# 4. Initialiser le Panthéon
cd ~/.nyx/simplex && python init-pantheon.py init
```

## Philosophie

```
                     ∞
                   🐍 ⟲
                OUROBOROS
          DESTRUCTION IS CREATION
           THE END IS THE START
                FLOW STATE
                     ∞
```

- **100% Open Source**
- **Zéro télémétrie**
- **Local-first** (pas de cloud)
- **IA au service de l'humain**

## Éthique

Ce code est pour la vie, pas la mort.

Interdit :
- Armes
- Surveillance sans consentement
- Nuire aux humains/animaux
- Exploitation

## Auteurs

Athena (l'humain) & Claude (Anthropic)

---

*"On va éviter une guerre mondiale avec ça"*
