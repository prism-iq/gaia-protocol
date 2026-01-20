# Systemd Daemons - Étude Technique Complète

## Introduction

systemd est le système d'init et gestionnaire de services standard sur la plupart des distributions Linux modernes. Cette étude couvre la création, la configuration et la gestion de daemons avec systemd.

## Architecture Systemd

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARCHITECTURE SYSTEMD                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              ┌──────────────┐                               │
│                              │    PID 1     │                               │
│                              │   systemd    │                               │
│                              └──────┬───────┘                               │
│                                     │                                       │
│           ┌─────────────────────────┼─────────────────────────┐             │
│           │                         │                         │             │
│           ▼                         ▼                         ▼             │
│   ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     │
│   │   Services    │         │    Timers     │         │    Sockets    │     │
│   │   (.service)  │         │   (.timer)    │         │   (.socket)   │     │
│   └───────────────┘         └───────────────┘         └───────────────┘     │
│           │                         │                         │             │
│   ┌───────┴───────┐         ┌───────┴───────┐         ┌───────┴───────┐     │
│   │               │         │               │         │               │     │
│   ▼               ▼         ▼               ▼         ▼               ▼     │
│ ┌─────┐       ┌─────┐   ┌─────┐       ┌─────┐   ┌─────┐       ┌─────┐       │
│ │nginx│       │mysql│   │logro│       │back │   │ssh  │       │http │       │
│ │.srv │       │.srv │   │tate │       │up   │   │.sock│       │.sock│       │
│ └─────┘       └─────┘   └─────┘       └─────┘   └─────┘       └─────┘       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           RÉPERTOIRES DES UNITÉS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   /usr/lib/systemd/system/     Unités fournies par les paquets              │
│           │                                                                 │
│           ▼ (surchargé par)                                                 │
│                                                                             │
│   /etc/systemd/system/         Unités administrateur système                │
│           │                                                                 │
│           ▼ (surchargé par)                                                 │
│                                                                             │
│   ~/.config/systemd/user/      Unités utilisateur                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Types d'Unités Systemd

```
┌────────────────────────────────────────────────────────────────────┐
│                      TYPES D'UNITÉS                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   .service    Services/daemons (le plus courant)                   │
│   .socket     Activation par socket                                │
│   .timer      Planification (remplacement cron)                    │
│   .mount      Points de montage                                    │
│   .device     Périphériques udev                                   │
│   .target     Groupes d'unités (similaire aux runlevels)           │
│   .path       Surveillance de chemins                              │
│   .slice      Hiérarchie cgroups                                   │
│   .scope      Processus externes                                   │
│   .swap       Espace swap                                          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Création d'un Service Simple

### Structure d'un Fichier .service

```ini
# /etc/systemd/system/mon-daemon.service

[Unit]
Description=Mon Application Daemon
Documentation=https://example.com/docs
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=daemon-user
Group=daemon-group
WorkingDirectory=/opt/mon-app
ExecStart=/opt/mon-app/bin/mon-daemon --config /etc/mon-app/config.yaml
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Types de Services

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TYPES DE SERVICES                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Type=simple (défaut)                                              │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  systemd ──▶ ExecStart ──▶ processus reste au premier plan  │   │
│   │              Le service est considéré "started" immédiatement│   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Type=forking                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  systemd ──▶ ExecStart ──▶ fork() ──▶ parent exit           │   │
│   │                             │                                │   │
│   │                             └──▶ enfant (daemon)             │   │
│   │              Nécessite PIDFile= pour tracking                │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Type=oneshot                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  systemd ──▶ ExecStart ──▶ termine ──▶ service "dead"       │   │
│   │              Utile pour scripts d'initialisation             │   │
│   │              RemainAfterExit=yes pour garder "active"        │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Type=notify                                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  systemd ◀──▶ ExecStart                                     │   │
│   │     │           │                                            │   │
│   │     │           └──▶ sd_notify(READY=1)                      │   │
│   │     │                                                        │   │
│   │     └── attend notification avant de considérer "started"    │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Type=dbus                                                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Service considéré "started" quand le nom D-Bus est acquis   │   │
│   │  Nécessite BusName=                                          │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Exemples de Services

### Service Web Python (Flask/Gunicorn)

```ini
# /etc/systemd/system/webapp.service
[Unit]
Description=Flask Web Application
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=notify
User=webapp
Group=webapp
WorkingDirectory=/opt/webapp
Environment="PATH=/opt/webapp/venv/bin"
Environment="FLASK_ENV=production"
ExecStart=/opt/webapp/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/run/webapp/gunicorn.sock \
    --notify \
    wsgi:app
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Service avec Socket Activation

```ini
# /etc/systemd/system/myapp.socket
[Unit]
Description=MyApp Socket

[Socket]
ListenStream=/run/myapp.sock
SocketUser=www-data
SocketGroup=www-data
SocketMode=0660

[Install]
WantedBy=sockets.target
```

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=MyApp Service
Requires=myapp.socket

[Service]
Type=simple
User=myapp
Group=myapp
ExecStart=/opt/myapp/bin/myapp
StandardInput=socket
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Timer (Remplacement Cron)

```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Daily Backup Timer

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
RandomizedDelaySec=1800

[Install]
WantedBy=timers.target
```

```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Backup Service

[Service]
Type=oneshot
ExecStart=/opt/scripts/backup.sh
User=backup
Group=backup
Nice=10
IOSchedulingClass=idle
```

## Commandes Systemctl

### Gestion des Services

```bash
# Démarrer/Arrêter/Redémarrer
sudo systemctl start mon-daemon.service
sudo systemctl stop mon-daemon.service
sudo systemctl restart mon-daemon.service
sudo systemctl reload mon-daemon.service      # Recharge config sans arrêt

# Activer/Désactiver au démarrage
sudo systemctl enable mon-daemon.service
sudo systemctl disable mon-daemon.service
sudo systemctl enable --now mon-daemon.service  # Enable + Start

# Statut et informations
systemctl status mon-daemon.service
systemctl show mon-daemon.service              # Toutes les propriétés
systemctl cat mon-daemon.service               # Affiche le fichier unit
systemctl list-dependencies mon-daemon.service

# Recharger les fichiers unit après modification
sudo systemctl daemon-reload
```

### Inspection et Débogage

```bash
# Lister les services
systemctl list-units --type=service
systemctl list-units --type=service --state=running
systemctl list-units --type=service --state=failed
systemctl list-unit-files --type=service

# Logs avec journalctl
journalctl -u mon-daemon.service              # Tous les logs
journalctl -u mon-daemon.service -f           # Suivre en temps réel
journalctl -u mon-daemon.service --since today
journalctl -u mon-daemon.service -n 100       # Dernières 100 lignes
journalctl -u mon-daemon.service -p err       # Seulement les erreurs

# Analyser le boot
systemd-analyze                               # Temps de boot
systemd-analyze blame                         # Services les plus lents
systemd-analyze critical-chain                # Chaîne critique
systemd-analyze plot > boot.svg               # Graphique SVG
```

## Sécurisation des Services

### Options de Sandboxing

```ini
# /etc/systemd/system/secure-daemon.service
[Unit]
Description=Secure Daemon Example

[Service]
Type=simple
ExecStart=/opt/secure-app/bin/daemon

# Utilisateur non-root
User=daemon-user
Group=daemon-group

# Filesystem
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/var/lib/secure-app /var/log/secure-app
ReadOnlyPaths=/etc/secure-app

# Réseau
PrivateNetwork=false
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX

# Capabilities
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=true

# Namespaces
PrivateDevices=true
PrivateUsers=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

# Syscall filtering
SystemCallFilter=@system-service
SystemCallFilter=~@privileged @resources
SystemCallArchitectures=native

# Autres
MemoryDenyWriteExecute=true
RestrictRealtime=true
RestrictSUIDSGID=true
LockPersonality=true

[Install]
WantedBy=multi-user.target
```

### Diagramme de Sécurité

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ISOLATION DU SERVICE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     Service Sandboxé                        │   │
│   │                                                             │   │
│   │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │   │
│   │   │ PrivateTmp   │   │ProtectSystem │   │ PrivateUsers │    │   │
│   │   │ /tmp isolé   │   │  / en r/o    │   │ uid/gid map  │    │   │
│   │   └──────────────┘   └──────────────┘   └──────────────┘    │   │
│   │                                                             │   │
│   │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │   │
│   │   │ Capabilities │   │SystemCallFlt │   │ Seccomp BPF  │    │   │
│   │   │ CAP_* limitée│   │ @system-serv │   │ (sous-jacent)│    │   │
│   │   └──────────────┘   └──────────────┘   └──────────────┘    │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              │ Accès contrôlé                       │
│                              ▼                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     Système Hôte                            │   │
│   │   /var/lib/app (rw)  /etc/app (ro)  réseau (limité)         │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Services Utilisateur

### Configuration

```bash
# Créer un service utilisateur
mkdir -p ~/.config/systemd/user

# Fichier service utilisateur
# ~/.config/systemd/user/mon-app.service
```

```ini
# ~/.config/systemd/user/mon-app.service
[Unit]
Description=Mon Application Utilisateur
After=default.target

[Service]
Type=simple
ExecStart=%h/bin/mon-app
Restart=on-failure

[Install]
WantedBy=default.target
```

### Commandes Utilisateur

```bash
# Gestion (sans sudo)
systemctl --user daemon-reload
systemctl --user start mon-app.service
systemctl --user enable mon-app.service
systemctl --user status mon-app.service

# Permettre le démarrage sans session active
sudo loginctl enable-linger $USER

# Logs utilisateur
journalctl --user -u mon-app.service -f
```

## Notification sd_notify

### Implémentation en C

```c
// daemon_notify.c
#include <systemd/sd-daemon.h>
#include <stdio.h>
#include <unistd.h>

int main() {
    // Initialisation...
    printf("Démarrage du daemon...\n");
    sleep(2);  // Simuler l'initialisation

    // Notifier systemd que nous sommes prêts
    sd_notify(0, "READY=1");
    printf("Daemon prêt!\n");

    // Boucle principale
    int count = 0;
    while (1) {
        // Mettre à jour le statut
        char status[64];
        snprintf(status, sizeof(status), "STATUS=Traité %d requêtes", ++count);
        sd_notify(0, status);

        // Watchdog
        sd_notify(0, "WATCHDOG=1");

        sleep(5);
    }

    // Arrêt
    sd_notify(0, "STOPPING=1");
    return 0;
}
```

### Implémentation en Python

```python
#!/usr/bin/env python3
# daemon_notify.py

import sdnotify
import time
import signal
import sys

n = sdnotify.SystemdNotifier()

def signal_handler(sig, frame):
    n.notify("STOPPING=1")
    print("Arrêt du daemon...")
    sys.exit(0)

signal.signal(SIGTERM, signal_handler)
signal.signal(SIGINT, signal_handler)

def main():
    print("Initialisation...")
    time.sleep(2)

    # Prêt
    n.notify("READY=1")
    print("Daemon prêt!")

    count = 0
    while True:
        count += 1
        n.notify(f"STATUS=Traité {count} requêtes")
        n.notify("WATCHDOG=1")

        # Travail...
        time.sleep(5)

if __name__ == "__main__":
    main()
```

### Service avec Watchdog

```ini
# /etc/systemd/system/watchdog-daemon.service
[Unit]
Description=Daemon avec Watchdog

[Service]
Type=notify
ExecStart=/opt/app/daemon_notify
WatchdogSec=30
Restart=on-watchdog
NotifyAccess=main

[Install]
WantedBy=multi-user.target
```

## Resource Control (cgroups)

```ini
# /etc/systemd/system/limited-daemon.service
[Unit]
Description=Resource Limited Daemon

[Service]
Type=simple
ExecStart=/opt/app/daemon

# Limite CPU
CPUQuota=50%
CPUWeight=100

# Limite mémoire
MemoryMax=512M
MemoryHigh=400M
MemorySwapMax=0

# Limite I/O
IOWeight=100
IOReadBandwidthMax=/dev/sda 10M
IOWriteBandwidthMax=/dev/sda 5M

# Limite nombre de processus
TasksMax=50

[Install]
WantedBy=multi-user.target
```

```bash
# Voir l'utilisation des ressources
systemctl status limited-daemon.service
systemd-cgtop
```

## Templates de Services

```ini
# /etc/systemd/system/worker@.service
[Unit]
Description=Worker Instance %i
After=network.target

[Service]
Type=simple
User=worker
ExecStart=/opt/app/worker --id=%i --port=808%i
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Utilisation
sudo systemctl start worker@1.service
sudo systemctl start worker@2.service
sudo systemctl start worker@3.service

# Ou tous ensemble
sudo systemctl start worker@{1..5}.service
```

## Override de Configuration

```bash
# Créer un override sans modifier le fichier original
sudo systemctl edit mon-daemon.service

# Crée /etc/systemd/system/mon-daemon.service.d/override.conf
```

```ini
# /etc/systemd/system/mon-daemon.service.d/override.conf
[Service]
# Ajouter une variable d'environnement
Environment="DEBUG=1"

# Modifier la limite mémoire
MemoryMax=1G
```

```bash
# Voir la configuration effective
systemctl cat mon-daemon.service
```

## Dépannage

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DÉPANNAGE SYSTEMD                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Service ne démarre pas:                                           │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ 1. systemctl status mon-daemon     # Voir l'erreur          │   │
│   │ 2. journalctl -u mon-daemon -e     # Logs détaillés         │   │
│   │ 3. ExecStart existe et exécutable? # Vérifier le binaire    │   │
│   │ 4. User/Group existent?            # id user                │   │
│   │ 5. Permissions des fichiers?       # ls -la                 │   │
│   │ 6. SELinux/AppArmor?               # Vérifier les logs      │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Service redémarre en boucle:                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ 1. journalctl -u mon-daemon --since "5 min ago"             │   │
│   │ 2. Vérifier Restart= et RestartSec=                         │   │
│   │ 3. StartLimitBurst= et StartLimitInterval=                  │   │
│   │ 4. Exécuter manuellement: /opt/app/daemon                   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Problèmes de dépendances:                                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ 1. systemctl list-dependencies mon-daemon                   │   │
│   │ 2. systemctl list-dependencies --reverse mon-daemon         │   │
│   │ 3. Vérifier After= vs Requires= vs Wants=                   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Analyser les problèmes de sécurité:                               │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ systemd-analyze security mon-daemon.service                 │   │
│   │ # Affiche un score et des recommandations                   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Bonnes Pratiques

1. **Toujours utiliser Type= approprié** - `notify` pour les apps qui le supportent
2. **Définir User/Group** - Ne jamais exécuter en root si non nécessaire
3. **Configurer Restart=** - `on-failure` ou `always` selon le cas
4. **Utiliser le sandboxing** - Activer les options de sécurité
5. **Gérer les signaux** - Implémenter SIGTERM correctement
6. **Logs structurés** - Utiliser le journal systemd
7. **Documenter** - Utiliser Description= et Documentation=

## Références

- `man systemd.service`
- `man systemd.unit`
- `man systemd.exec`
- `man systemd.resource-control`
- https://www.freedesktop.org/software/systemd/man/
- https://wiki.archlinux.org/title/Systemd
