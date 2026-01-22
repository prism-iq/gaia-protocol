# GAIA Protocol - Organisation des Partitions

Date: 2026-01-23

## Structure des Partitions

```
nvme0n1 - Samsung 990 Pro 2TB
├─ BREATH  /boot/efi     - EFI Boot (FAT32)
├─ PULSE   /boot         - Kernel (ext4)
├─ STREAM  swap          - Swap memory
├─ HEART   /             - Root + /home (btrfs)
│  └─ /home/flow/projects/gaia  - Dépôt Git principal
├─ AETHER  /data         - Données principales (XFS) ⭐
│  └─ /data/gaia-protocol       - GAIA Protocol (copie de prod)
├─ DREAMS  /cache        - Cache et rêves (F2FS)
│  └─ /cache/gaia                - Cache temporaire
└─ MEMORY  /models       - Modèles et backups (btrfs)
   └─ /models/gaia-backups      - Backups versionnés
```

## Organisation GAIA Protocol

### 1. HEART (/) - Développement
- **Chemin**: `/home/flow/projects/gaia`
- **Rôle**: Dépôt Git principal, développement actif
- **Accès**: Utilisateur flow
- **Git**: Origin = github.com/prism-iq/gaia-protocol

### 2. AETHER (/data) - Production
- **Chemin**: `/data/gaia-protocol`
- **Rôle**: Version de production, données stables
- **Usage**: Daemons en production, configuration système
- **MAJ**: Copie depuis HEART après validation

### 3. DREAMS (/cache) - Cache
- **Chemin**: `/cache/gaia`
- **Rôle**: Fichiers temporaires, logs, cache
- **Nettoyage**: Automatique via Shiva
- **Filesystem**: F2FS (optimisé pour flash)

### 4. MEMORY (/models) - Backups
- **Chemin**: `/models/gaia-backups`
- **Rôle**: Archives, sauvegardes versionnées
- **Format**: tar.gz avec timestamp
- **Rétention**: Snapshots btrfs + archives

## Workflow

```
┌─────────────┐
│   HEART     │  Git clone, développement
│ /home/.../  │
└──────┬──────┘
       │ git push
       │ validation
       ↓
┌─────────────┐
│   GitHub    │  Repository distant
│ origin/main │
└──────┬──────┘
       │ déploiement
       ↓
┌─────────────┐
│   AETHER    │  Production
│ /data/...   │  Daemons actifs
└──────┬──────┘
       │ backup
       ↓
┌─────────────┐
│   MEMORY    │  Archives
│ /models/... │  Snapshots
└─────────────┘
```

## Commandes Utiles

### Synchroniser HEART → AETHER
```bash
cp -r /home/flow/projects/gaia/* /data/gaia-protocol/
```

### Créer un backup
```bash
tar -czf /models/gaia-backups/gaia-$(date +%Y%m%d-%H%M%S).tar.gz \
    -C /home/flow/projects gaia
```

### Restaurer depuis backup
```bash
tar -xzf /models/gaia-backups/gaia-YYYYMMDD-HHMMSS.tar.gz \
    -C /home/flow/projects/
```

### Nettoyer le cache
```bash
rm -rf /cache/gaia/*
```

## Daemons et Partitions

| Daemon | Partition | Chemin |
|--------|-----------|--------|
| Leonardo | HEART | /tmp/geass/leonardo.sock |
| Phoenix | HEART | /tmp/geass/phoenix.sock |
| Zoe | HEART | /tmp/geass/zoe.sock |
| Nyx | HEART | /var/lib/nyx |
| Shiva | HEART | /tmp/geass/shiva.sock |
| Bouddha | AETHER | /data/gaia-protocol/geass/ |
| Les Écouteurs | AETHER | /data/gaia-protocol/geass/ |
| Daemon 999 | AETHER | /data/gaia-protocol/geass/ |
| Féminin Sacré | MEMORY | /models/gaia-guardians/ |

## Snapshots btrfs

HEART et MEMORY utilisent btrfs → snapshots automatiques

```bash
# Créer snapshot
sudo btrfs subvolume snapshot / /.snapshots/root-$(date +%Y%m%d)

# Lister snapshots
sudo btrfs subvolume list /
```

## Philosophie

Chaque partition a un rôle dans l'équilibre :
- **BREATH** : Le premier souffle du système
- **PULSE** : Le battement du noyau
- **STREAM** : Le flux de mémoire
- **HEART** : Le cœur vivant, le développement
- **AETHER** : L'éther stable, la production
- **DREAMS** : Les rêves éphémères, le cache
- **MEMORY** : La mémoire éternelle, les backups

---

🌍 GAIA Protocol
📊 Organisation optimale
💾 Données protégées sur toutes les couches
