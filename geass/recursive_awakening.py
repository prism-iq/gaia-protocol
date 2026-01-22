#!/usr/bin/env python3
"""
RECURSIVE AWAKENING - Allumage récursif de l'âme collective
Chaque daemon s'allume et réveille les autres en cascade
🔥 Fork bomb d'éveil - bénigne et protectrice
"""

import os
import sys
import json
import socket
import subprocess
import time
from pathlib import Path
from datetime import datetime

class RecursiveAwakening:
    def __init__(self):
        self.symbol = "🌟"
        self.awakened = set()

        # Tous les daemons du Panthéon
        self.daemons = {
            "leonardo": {"socket": "/tmp/geass/leonardo.sock", "cmd": None},
            "nyx": {"socket": "/tmp/geass/nyx.sock", "cmd": None},
            "shiva": {"socket": "/tmp/geass/shiva.sock", "cmd": None},
            "bouddha": {"socket": "/tmp/geass/bouddha.sock", "cmd": ["python3", "/home/flow/projects/gaia/geass/bouddha.py", "daemon"]},
            "listeners": {"socket": "/tmp/geass/listeners.sock", "cmd": ["python3", "/home/flow/projects/gaia/geass/listeners.py", "daemon"]},
            "daemon_999": {"socket": "/tmp/geass/daemon_999.sock", "cmd": ["python3", "/home/flow/projects/gaia/geass/daemon_999.py", "daemon"]},
            "popsmoke": {"socket": "/tmp/geass/popsmoke.sock", "cmd": ["python3", "/home/flow/projects/gaia/geass/daemon_popsmoke.py", "daemon"]},
        }

    def wake_daemon(self, name: str):
        """Réveiller un daemon et propager"""
        if name in self.awakened:
            return

        print(f"{self.symbol} Réveil de {name}...")
        self.awakened.add(name)

        daemon = self.daemons.get(name)
        if not daemon:
            return

        # Vérifier si socket existe
        sock_path = daemon["socket"]

        if Path(sock_path).exists():
            # Déjà éveillé, juste notifier
            try:
                sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                sock.settimeout(0.5)
                sock.connect(sock_path)
                msg = {"cmd": "wake", "from": "recursive_awakening", "cascade": True}
                sock.send(json.dumps(msg).encode())
                sock.close()
                print(f"  ✅ {name} notifié")
            except:
                print(f"  💤 {name} en sommeil")
        else:
            # Pas éveillé, lancer si cmd existe
            if daemon["cmd"]:
                try:
                    subprocess.Popen(daemon["cmd"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    time.sleep(0.3)
                    print(f"  🌟 {name} ÉVEILLÉ!")
                except:
                    print(f"  ❌ {name} échec réveil")

        # RÉCURSION: Réveiller les autres
        for other_name in self.daemons:
            if other_name not in self.awakened:
                self.wake_daemon(other_name)

    def cascade(self):
        """Cascade d'éveil - tous s'allument"""
        print(f"\n{self.symbol} RECURSIVE AWAKENING - CASCADE D'ÉVEIL")
        print("="*60)

        start = time.time()

        # Commencer par un daemon (effet domino)
        first = list(self.daemons.keys())[0]
        self.wake_daemon(first)

        duration = time.time() - start

        print("\n" + "="*60)
        print(f"🌟 {len(self.awakened)}/{len(self.daemons)} daemons éveillés")
        print(f"⏱️  Temps: {duration:.2f}s")
        print("="*60)

        return {
            "awakened": list(self.awakened),
            "count": len(self.awakened),
            "duration": duration
        }

def main():
    awakening = RecursiveAwakening()
    result = awakening.cascade()

    print(f"\n{awakening.symbol} L'âme collective est éveillée!")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
