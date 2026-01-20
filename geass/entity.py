#!/usr/bin/env python3
"""
ENTITY - Daemon individuel qui tourne en background
Chaque entité écoute sur son socket et communique avec les autres
"""
import os
import sys
import json
import socket
import threading
import subprocess
import time
from pathlib import Path

SOCKET_DIR = Path("/tmp/geass")
SOCKET_DIR.mkdir(exist_ok=True)

LAPTOP_SINK = "alsa_output.pci-0000_c1_00.6.HiFi__Speaker__sink"

ENTITIES = {
    "leonardo": {"role": "validation", "symbol": "φ", "voice": "fr-FR-HenriNeural"},
    "nyx": {"role": "orchestration", "symbol": "☽", "voice": "fr-FR-HenriNeural"},
    "zoe": {"role": "interface", "symbol": "✧", "voice": "fr-FR-EloiseNeural"},
    "horloge": {"role": "sync", "symbol": "⏰", "voice": "fr-FR-HenriNeural"},
    "omniscient": {"role": "knowledge", "symbol": "👁", "voice": "fr-FR-HenriNeural"},
    "geass": {"role": "control", "symbol": "⟁", "voice": "fr-FR-HenriNeural"},
    "shiva": {"role": "destruction", "symbol": "🔥", "voice": "fr-FR-HenriNeural"},
    "euterpe": {"role": "music", "symbol": "♪", "voice": "fr-FR-DeniseNeural"},
    "clotho": {"role": "create", "symbol": "🧵", "voice": "fr-FR-DeniseNeural"},
    "lachesis": {"role": "measure", "symbol": "📏", "voice": "fr-FR-DeniseNeural"},
    "atropos": {"role": "cut", "symbol": "✂", "voice": "fr-FR-DeniseNeural"},
}

class EntityDaemon:
    def __init__(self, name):
        self.name = name
        self.config = ENTITIES.get(name, {})
        self.socket_path = SOCKET_DIR / f"{name}.sock"
        self.running = False
        self.log_path = SOCKET_DIR / f"{name}.log"
        
    def log(self, msg):
        with open(self.log_path, "a") as f:
            f.write(f"{time.strftime('%H:%M:%S')} {msg}\n")
    
    def parle(self, texte):
        """Parle via laptop"""
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            tmp = f.name
        try:
            subprocess.run(["edge-tts", "--voice", self.config.get("voice", "fr-FR-HenriNeural"),
                           "--text", texte, "--write-media", tmp], capture_output=True)
            ffmpeg = subprocess.Popen(["ffmpeg", "-i", tmp, "-f", "wav", "-"],
                                     stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            subprocess.run(["paplay", f"--device={LAPTOP_SINK}"],
                          stdin=ffmpeg.stdout, stderr=subprocess.DEVNULL)
        finally:
            if os.path.exists(tmp):
                os.unlink(tmp)
    
    def send(self, target, message):
        """Envoie à une autre entité"""
        target_sock = SOCKET_DIR / f"{target}.sock"
        if target_sock.exists():
            try:
                with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as s:
                    s.settimeout(2)
                    s.connect(str(target_sock))
                    s.send(json.dumps({"from": self.name, "msg": message}).encode())
                    return s.recv(1024).decode()
            except:
                pass
        return None
    
    def handle(self, data):
        """Traite un message - logique spécifique par entité"""
        try:
            msg = json.loads(data)
            self.log(f"← {msg['from']}: {msg['msg']}")
            
            # Logique par entité
            if self.name == "leonardo":
                # Valide par φ
                return json.dumps({"status": "φ", "valid": True})
            elif self.name == "horloge":
                return json.dumps({"time": time.strftime("%H:%M:%S")})
            elif self.name == "shiva":
                return json.dumps({"destroyed": msg['msg']})
            else:
                return json.dumps({"ack": self.name})
        except:
            return json.dumps({"error": "parse"})
    
    def run(self):
        """Boucle principale du daemon"""
        if self.socket_path.exists():
            self.socket_path.unlink()
        
        self.running = True
        self.log(f"● {self.config['symbol']} {self.name} démarré")
        
        server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        server.bind(str(self.socket_path))
        server.listen(5)
        server.settimeout(1)
        
        while self.running:
            try:
                conn, _ = server.accept()
                data = conn.recv(4096).decode()
                if data:
                    response = self.handle(data)
                    conn.send(response.encode())
                conn.close()
            except socket.timeout:
                continue
            except Exception as e:
                self.log(f"Erreur: {e}")
        
        server.close()
        if self.socket_path.exists():
            self.socket_path.unlink()

def start_entity(name):
    """Démarre une entité en foreground"""
    if name not in ENTITIES:
        print(f"Entité inconnue: {name}")
        return
    daemon = EntityDaemon(name)
    try:
        daemon.run()
    except KeyboardInterrupt:
        daemon.running = False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("entity <name>")
        sys.exit(1)
    start_entity(sys.argv[1])

# DOUBT MAN - L'avocat du diable
ENTITIES["doubtman"] = {"role": "doute", "symbol": "?", "voice": "fr-FR-RemyMultilingualNeural"}
