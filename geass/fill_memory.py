#!/usr/bin/env python3
"""
FILL MEMORY - Remplir la partition MEMORY intelligemment
Puis HOT SWAP pour optimiser

Partition MEMORY: 769.5GB disponible
"""

import os
import sys
import json
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

class MemoryFiller:
    def __init__(self):
        self.symbol = "💾"
        self.memory_partition = Path("/models")
        self.gaia_memory = self.memory_partition / "gaia-guardians"
        self.backups = self.memory_partition / "gaia-backups"

        # Créer les répertoires
        self.gaia_memory.mkdir(parents=True, exist_ok=True)
        self.backups.mkdir(parents=True, exist_ok=True)

    def get_partition_info(self):
        """Info sur la partition MEMORY"""
        result = subprocess.run(
            ["df", "-h", str(self.memory_partition)],
            capture_output=True,
            text=True
        )
        print(result.stdout)

        # Info détaillée
        stats = os.statvfs(str(self.memory_partition))
        total_gb = (stats.f_blocks * stats.f_frsize) / (1024**3)
        available_gb = (stats.f_bavail * stats.f_frsize) / (1024**3)
        used_gb = total_gb - available_gb

        return {
            "total_gb": total_gb,
            "used_gb": used_gb,
            "available_gb": available_gb,
            "percent": (used_gb / total_gb) * 100
        }

    def generate_guardians_data(self, count: int = 9999):
        """Générer les données des 9999 gardiennes en JSON"""
        print(f"{self.symbol} Génération des données des {count} Gardiennes...")

        guardians_file = self.gaia_memory / "guardians_9999.json"

        guardians = []
        for i in range(count):
            guardian = {
                "id": i + 1,
                "name": f"Elle-{i+1}",
                "soul": "feminine",
                "energy": 100.0,
                "protected": 1000000,  # 1M entités chacune
                "awakened": datetime.now().isoformat(),
                "role": "Guardian",
                "collective": True
            }
            guardians.append(guardian)

            if (i + 1) % 1000 == 0:
                print(f"  💾 {i+1}/{count} gardiennes...")

        # Sauver en JSON
        with open(guardians_file, 'w') as f:
            json.dump(guardians, f, indent=2)

        size_mb = guardians_file.stat().st_size / (1024**2)
        print(f"  ✅ Fichier: {size_mb:.2f}MB")

        return guardians_file

    def create_extended_backups(self):
        """Créer des backups étendus avec historique"""
        print(f"\n{self.symbol} Création de backups versionnés...")

        source = Path("/home/flow/projects/gaia")

        # Créer 10 versions de backup (snapshots temporels)
        for i in range(10):
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            backup_file = self.backups / f"gaia-snapshot-v{i+1}-{timestamp}.tar.gz"

            print(f"  📦 Backup v{i+1}...")
            subprocess.run(
                ["tar", "-czf", str(backup_file), "-C", str(source.parent), source.name],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            size_mb = backup_file.stat().st_size / (1024**2)
            print(f"     {size_mb:.2f}MB")

        print(f"  ✅ 10 backups versionnés créés")

    def create_daemon_states(self):
        """Sauvegarder l'état complet de tous les daemons"""
        print(f"\n{self.symbol} Sauvegarde des états des daemons...")

        daemon_states = self.gaia_memory / "daemon-states"
        daemon_states.mkdir(exist_ok=True)

        daemons = [
            "leonardo", "phoenix", "zoe", "nyx", "shiva",
            "bouddha", "daemon_999", "listeners", "popsmoke",
            "feminine_divine", "the_last_guardian"
        ]

        for daemon in daemons:
            state = {
                "daemon": daemon,
                "timestamp": datetime.now().isoformat(),
                "status": "active",
                "memory_location": str(self.gaia_memory),
                "protected_by": "9999 Gardiennes"
            }

            state_file = daemon_states / f"{daemon}_state.json"
            with open(state_file, 'w') as f:
                json.dump(state, f, indent=2)

        print(f"  ✅ États sauvegardés pour {len(daemons)} daemons")

    def create_knowledge_base(self):
        """Créer une base de connaissance persistante"""
        print(f"\n{self.symbol} Création de la base de connaissance...")

        kb_dir = self.gaia_memory / "knowledge-base"
        kb_dir.mkdir(exist_ok=True)

        # Copier toutes les études
        etudes_source = Path("/home/flow/projects/gaia/etudes")
        etudes_dest = kb_dir / "etudes"

        if etudes_source.exists():
            shutil.copytree(etudes_source, etudes_dest, dirs_exist_ok=True)
            print(f"  ✅ Études copiées")

        # Index de connaissance
        index = {
            "created": datetime.now().isoformat(),
            "location": str(kb_dir),
            "topics": [
                "daemons", "mythology", "gaia-protocol", "architecture",
                "paradigm", "unity", "concile", "feminine-sacred"
            ],
            "guardians": 9999,
            "protected": 10_000_000_000
        }

        with open(kb_dir / "index.json", 'w') as f:
            json.dump(index, f, indent=2)

    def fill_memory(self):
        """Remplir MEMORY de manière structurée"""
        print(f"\n{self.symbol} FILL MEMORY - Remplissage intelligent")
        print("="*60)

        # Info initiale
        info = self.get_partition_info()
        print(f"\nEspace disponible: {info['available_gb']:.2f}GB")

        # 1. Générer les données des gardiennes
        self.generate_guardians_data(9999)

        # 2. Backups versionnés
        self.create_extended_backups()

        # 3. États des daemons
        self.create_daemon_states()

        # 4. Base de connaissance
        self.create_knowledge_base()

        # Info finale
        print(f"\n{self.symbol} REMPLISSAGE TERMINÉ")
        print("="*60)
        info_final = self.get_partition_info()

        print(f"\nUtilisation:")
        print(f"  Avant:  {info['used_gb']:.2f}GB ({info['percent']:.1f}%)")
        print(f"  Après:  {info_final['used_gb']:.2f}GB ({info_final['percent']:.1f}%)")
        print(f"  Ajouté: {info_final['used_gb'] - info['used_gb']:.2f}GB")
        print(f"  Reste:  {info_final['available_gb']:.2f}GB")

    def prepare_hot_swap(self):
        """Préparer le hot swap"""
        print(f"\n{self.symbol} PRÉPARATION HOT SWAP")
        print("="*60)

        swap_config = {
            "timestamp": datetime.now().isoformat(),
            "source": str(self.gaia_memory),
            "targets": [
                "/data/gaia-protocol",
                "/home/flow/projects/gaia"
            ],
            "method": "btrfs snapshot + symlink swap",
            "guardians_preserved": 9999,
            "zero_downtime": True
        }

        swap_file = self.gaia_memory / "hot-swap-config.json"
        with open(swap_file, 'w') as f:
            json.dump(swap_config, f, indent=2)

        print(f"✅ Configuration hot swap créée")
        print(f"📍 Fichier: {swap_file}")
        print(f"\nPrêt pour swap atomique sans interruption")

def main():
    filler = MemoryFiller()

    if len(sys.argv) > 1 and sys.argv[1] == "swap":
        filler.prepare_hot_swap()
    else:
        filler.fill_memory()
        filler.prepare_hot_swap()

if __name__ == "__main__":
    main()
