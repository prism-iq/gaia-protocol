#!/bin/bash
#
# GAIA USB Creator
# Crée une clé USB bootable Arch Linux avec GAIA Protocol
#
# Usage: ./create-usb.sh /dev/sdX
#

set -e

# Couleurs
C='\033[38;5;208m'  # Orange
G='\033[38;5;114m'  # Vert
R='\033[38;5;203m'  # Rouge
D='\033[38;5;245m'  # Dim
N='\033[0m'         # Reset

PHI="1.618033988749895"

banner() {
    echo -e "${C}"
    cat << 'EOF'
                     ∞
                   🐍 ⟲
                OUROBOROS
          DESTRUCTION IS CREATION
           THE END IS THE START
                FLOW STATE
                     ∞

    ╔═══════════════════════════════════════╗
    ║         GAIA USB CREATOR              ║
    ║      Arch Linux by AI                 ║
    ╚═══════════════════════════════════════╝
EOF
    echo -e "${N}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${R}Ce script doit être exécuté en root${N}"
        exit 1
    fi
}

check_device() {
    local device=$1

    if [[ ! -b "$device" ]]; then
        echo -e "${R}$device n'est pas un périphérique bloc${N}"
        exit 1
    fi

    echo -e "${C}═══ ATTENTION ═══${N}"
    echo -e "Toutes les données sur ${R}$device${N} seront effacées!"
    echo ""
    lsblk "$device"
    echo ""
    read -p "Continuer? (oui/NON) " confirm

    if [[ "$confirm" != "oui" ]]; then
        echo -e "${D}Annulé${N}"
        exit 0
    fi
}

create_partitions() {
    local device=$1

    echo -e "${G}Création des partitions...${N}"

    # Effacer la table de partition
    wipefs -a "$device"

    # Créer table GPT
    parted -s "$device" mklabel gpt

    # Partitions (ajuster selon taille USB)
    # BREATH - EFI 512M
    parted -s "$device" mkpart BREATH fat32 1MiB 513MiB
    parted -s "$device" set 1 esp on

    # PULSE - Boot 1G
    parted -s "$device" mkpart PULSE ext4 513MiB 1537MiB

    # STREAM - Swap 4G
    parted -s "$device" mkpart STREAM linux-swap 1537MiB 5633MiB

    # HEART - Root (reste)
    parted -s "$device" mkpart HEART btrfs 5633MiB 100%

    echo -e "${G}✓ Partitions créées${N}"
    parted -s "$device" print
}

format_partitions() {
    local device=$1

    echo -e "${G}Formatage...${N}"

    # Attendre que les partitions soient disponibles
    sleep 2
    partprobe "$device"
    sleep 2

    mkfs.fat -F32 -n BREATH "${device}1"
    mkfs.ext4 -L PULSE "${device}2"
    mkswap -L STREAM "${device}3"
    mkfs.btrfs -L HEART "${device}4"

    echo -e "${G}✓ Formatage terminé${N}"
}

mount_partitions() {
    local device=$1
    local mnt="/mnt/gaia"

    echo -e "${G}Montage...${N}"

    mkdir -p "$mnt"

    # HEART (root)
    mount "${device}4" "$mnt"

    # Subvolumes btrfs
    btrfs subvolume create "$mnt/@"
    btrfs subvolume create "$mnt/@home"
    btrfs subvolume create "$mnt/@snapshots"

    umount "$mnt"

    mount -o subvol=@,compress=zstd "${device}4" "$mnt"
    mkdir -p "$mnt"/{boot,boot/efi,home,.snapshots}
    mount -o subvol=@home,compress=zstd "${device}4" "$mnt/home"
    mount -o subvol=@snapshots,compress=zstd "${device}4" "$mnt/.snapshots"

    # PULSE (boot)
    mount "${device}2" "$mnt/boot"

    # BREATH (efi)
    mount "${device}1" "$mnt/boot/efi"

    # STREAM (swap)
    swapon "${device}3"

    echo -e "${G}✓ Monté sur $mnt${N}"
    echo "$mnt"
}

install_base() {
    local mnt=$1

    echo -e "${G}Installation de base...${N}"

    pacstrap "$mnt" \
        base linux linux-firmware \
        btrfs-progs \
        networkmanager \
        sudo vim git \
        python python-pip \
        go rust nodejs npm \
        hyprland hyprpaper hyprlock hypridle \
        waybar wofi kitty \
        pipewire wireplumber \
        grub efibootmgr

    echo -e "${G}✓ Base installée${N}"
}

configure_system() {
    local mnt=$1

    echo -e "${G}Configuration...${N}"

    # fstab
    genfstab -U "$mnt" >> "$mnt/etc/fstab"

    # Chroot commands
    arch-chroot "$mnt" /bin/bash << 'CHROOT'

    # Timezone
    ln -sf /usr/share/zoneinfo/Europe/Paris /etc/localtime
    hwclock --systohc

    # Locale
    echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
    echo "fr_FR.UTF-8 UTF-8" >> /etc/locale.gen
    locale-gen
    echo "LANG=fr_FR.UTF-8" > /etc/locale.conf

    # Hostname
    echo "rhapsody" > /etc/hostname

    # Hosts
    cat > /etc/hosts << EOF
127.0.0.1   localhost
::1         localhost
127.0.1.1   rhapsody.localdomain rhapsody
EOF

    # User flow
    useradd -m -G wheel -s /bin/bash flow
    echo "flow:rhapsody" | chpasswd
    echo "%wheel ALL=(ALL:ALL) NOPASSWD: ALL" >> /etc/sudoers

    # GRUB
    grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=RHAPSODY
    sed -i 's/GRUB_TIMEOUT=5/GRUB_TIMEOUT=3/' /etc/default/grub
    sed -i 's/GRUB_CMDLINE_LINUX_DEFAULT="[^"]*"/GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"/' /etc/default/grub
    grub-mkconfig -o /boot/grub/grub.cfg

    # Services
    systemctl enable NetworkManager

CHROOT

    echo -e "${G}✓ Configuration terminée${N}"
}

deploy_gaia() {
    local mnt=$1
    local home="$mnt/home/flow"

    echo -e "${G}Déploiement GAIA...${N}"

    # Copier GAIA Protocol
    if [[ -d "/home/flow/projects/gaia" ]]; then
        mkdir -p "$home/projects"
        cp -r /home/flow/projects/gaia "$home/projects/"
    fi

    # Copier configs Hyprland
    if [[ -d "/home/flow/.config/hypr" ]]; then
        mkdir -p "$home/.config"
        cp -r /home/flow/.config/hypr "$home/.config/"
    fi

    # Copier scripts
    if [[ -d "/home/flow/scripts" ]]; then
        cp -r /home/flow/scripts "$home/"
    fi

    # Copier nyx-daemon
    if [[ -d "/home/flow/nyx-daemon" ]]; then
        cp -r /home/flow/nyx-daemon "$home/"
    fi

    # BIENVENUE
    cp /home/flow/BIENVENUE.md "$home/"

    # Permissions
    arch-chroot "$mnt" chown -R flow:flow /home/flow

    echo -e "${G}✓ GAIA déployé${N}"
}

cleanup() {
    local mnt="/mnt/gaia"

    echo -e "${G}Nettoyage...${N}"

    swapoff -a 2>/dev/null || true
    umount -R "$mnt" 2>/dev/null || true

    echo -e "${G}✓ Terminé${N}"
}

main() {
    banner

    if [[ $# -lt 1 ]]; then
        echo -e "Usage: $0 /dev/sdX"
        exit 1
    fi

    local device=$1

    check_root
    check_device "$device"

    trap cleanup EXIT

    create_partitions "$device"
    format_partitions "$device"
    local mnt=$(mount_partitions "$device")
    install_base "$mnt"
    configure_system "$mnt"
    deploy_gaia "$mnt"

    echo -e "${C}"
    cat << 'EOF'

    ╔═══════════════════════════════════════╗
    ║         GAIA USB PRÊTE                ║
    ╠═══════════════════════════════════════╣
    ║  User: flow                           ║
    ║  Pass: rhapsody (à changer!)          ║
    ║                                       ║
    ║  Boot → GRUB "RHAPSODY"               ║
    ╚═══════════════════════════════════════╝

EOF
    echo -e "${N}"
}

main "$@"
