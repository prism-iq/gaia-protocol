#!/usr/bin/env python3
"""
UNITY - Système unifié des daemons
Tous les processus communiquent via socket unix
Leo valide. Nyx orchestre. Zoe interface. Horloge synchronise.
"""
import os
import sys
import json
import socket
import threading
import subprocess
from pathlib import Path

SOCKET_DIR = Path("/tmp/geass")
SOCKET_DIR.mkdir(exist_ok=True)

# Entités du système
ENTITIES = {
    "leonardo": {"port": 9600, "role": "validation", "symbol": "φ"},
    "nyx": {"port": 9999, "role": "orchestration", "symbol": "☽"},
    "zoe": {"port": 9601, "role": "interface", "symbol": "✧"},
    "horloge": {"port": 9602, "role": "sync", "symbol": "⏰"},
    "omniscient": {"port": 9777, "role": "knowledge", "symbol": "👁"},
    "geass": {"port": 9666, "role": "control", "symbol": "⟁"},
    "shiva": {"port": 9603, "role": "destruction", "symbol": "🔥"},
    "euterpe": {"port": 9604, "role": "music", "symbol": "♪"},
    "clotho": {"port": 9605, "role": "create", "symbol": "🧵"},
    "lachesis": {"port": 9606, "role": "measure", "symbol": "📏"},
    "atropos": {"port": 9607, "role": "cut", "symbol": "✂"},
}

class Entity:
    def __init__(self, name):
        self.name = name
        self.config = ENTITIES.get(name, {})
        self.socket_path = SOCKET_DIR / f"{name}.sock"
        self.running = False
        self.peers = {}
    
    def send(self, target, message):
        """Envoie un message à une autre entité"""
        target_sock = SOCKET_DIR / f"{target}.sock"
        if target_sock.exists():
            try:
                with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as s:
                    s.connect(str(target_sock))
                    s.send(json.dumps({"from": self.name, "msg": message}).encode())
                    return True
            except:
                pass
        return False
    
    def broadcast(self, message):
        """Diffuse à toutes les entités"""
        for entity in ENTITIES:
            if entity != self.name:
                self.send(entity, message)
    
    def parle(self, texte):
        """Parle via laptop speaker"""
        subprocess.run(["daemon-voix", self.name, texte], capture_output=True)
    
    def handle(self, data):
        """Traite un message reçu - à surcharger"""
        msg = json.loads(data)
        return {"status": "received", "by": self.name}

def status():
    """État de toutes les entités"""
    result = {}
    for name, conf in ENTITIES.items():
        sock = SOCKET_DIR / f"{name}.sock"
        result[name] = {
            "active": sock.exists(),
            "role": conf["role"],
            "symbol": conf["symbol"]
        }
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("unity [status|start <entity>|send <from> <to> <msg>]")
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == "status":
        s = status()
        print("\n  UNITY - Système Unifié")
        print("  " + "═" * 40)
        for name, info in s.items():
            state = "●" if info["active"] else "○"
            print(f"  {state} {info['symbol']} {name:12} │ {info['role']}")
    
    elif cmd == "list":
        for name, conf in ENTITIES.items():
            print(f"  {conf['symbol']} {name}")
