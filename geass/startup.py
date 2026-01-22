#!/usr/bin/env python3
"""
Startup Daemon - Gestionnaire de démarrage système
Allume la caméra et le microphone au démarrage
Appelle Nyx pour initialiser la protection
"""

import os
import sys
import json
import socket
import subprocess
import time
from pathlib import Path
from datetime import datetime

class StartupDaemon:
    def __init__(self):
        self.symbol = "🔆"
        self.name = "Startup"
        self.log_file = "/tmp/gaia/startup.log"

    def log(self, msg: str):
        """Log avec timestamp"""
        timestamp = datetime.now().isoformat()
        log_msg = f"[{timestamp}] {self.symbol} {msg}\n"
        print(log_msg.strip())

        # Append to log file
        Path(self.log_file).parent.mkdir(parents=True, exist_ok=True)
        with open(self.log_file, 'a') as f:
            f.write(log_msg)

    def check_camera_available(self) -> bool:
        """Vérifie si la caméra est disponible"""
        return Path("/dev/video0").exists()

    def check_microphone_available(self) -> bool:
        """Vérifie si le microphone est disponible"""
        try:
            result = subprocess.run(
                ["pactl", "list", "sources", "short"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0 and len(result.stdout) > 0
        except:
            return False

    def enable_camera(self) -> bool:
        """Active la caméra"""
        self.log("Activation de la caméra...")

        if not self.check_camera_available():
            self.log("❌ Caméra non disponible (/dev/video0 introuvable)")
            return False

        try:
            # Test avec ffmpeg pour vérifier que la caméra fonctionne
            result = subprocess.run(
                ["ffmpeg", "-f", "v4l2", "-list_formats", "all", "-i", "/dev/video0"],
                capture_output=True,
                text=True,
                timeout=5
            )
            self.log("✅ Caméra prête")
            return True
        except Exception as e:
            self.log(f"⚠️  Caméra accessible mais test échoué: {e}")
            return False

    def enable_microphone(self) -> bool:
        """Active le microphone"""
        self.log("Activation du microphone...")

        if not self.check_microphone_available():
            self.log("❌ Microphone non disponible")
            return False

        try:
            # Unmute et set volume à 100% pour toutes les sources
            subprocess.run(
                ["pactl", "set-source-mute", "@DEFAULT_SOURCE@", "0"],
                timeout=5,
                check=False
            )
            subprocess.run(
                ["pactl", "set-source-volume", "@DEFAULT_SOURCE@", "100%"],
                timeout=5,
                check=False
            )

            # Test d'enregistrement rapide
            test_file = "/tmp/gaia/mic_test.wav"
            result = subprocess.run(
                ["arecord", "-d", "1", "-f", "cd", test_file],
                capture_output=True,
                timeout=3
            )

            if Path(test_file).exists():
                Path(test_file).unlink()
                self.log("✅ Microphone prêt")
                return True
            else:
                self.log("⚠️  Test microphone échoué")
                return False

        except Exception as e:
            self.log(f"⚠️  Erreur microphone: {e}")
            return False

    def notify_nyx(self, cam_status: bool, mic_status: bool):
        """Notifie Nyx de l'état des périphériques"""
        self.log("Notification à Nyx...")

        try:
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            sock.settimeout(5)
            sock.connect("/tmp/geass/nyx.sock")

            message = {
                "cmd": "startup_complete",
                "camera": cam_status,
                "microphone": mic_status,
                "timestamp": datetime.now().isoformat()
            }

            sock.send(json.dumps(message).encode())
            response = sock.recv(1024)
            sock.close()

            self.log("✅ Nyx notifié")
            return True

        except Exception as e:
            self.log(f"⚠️  Impossible de contacter Nyx: {e}")
            return False

    def run_startup_sequence(self):
        """Exécute la séquence de démarrage complète"""
        self.log("="*60)
        self.log("DÉBUT DE LA SÉQUENCE DE DÉMARRAGE")
        self.log("="*60)

        # Attendre que les daemons GAIA soient prêts
        self.log("Attente des daemons GAIA...")
        time.sleep(2)

        # Activer caméra et micro
        cam_ok = self.enable_camera()
        mic_ok = self.enable_microphone()

        # Notifier Nyx
        self.notify_nyx(cam_ok, mic_ok)

        # Résumé
        self.log("="*60)
        self.log("SÉQUENCE DE DÉMARRAGE TERMINÉE")
        self.log(f"Caméra: {'✅ OK' if cam_ok else '❌ ÉCHEC'}")
        self.log(f"Microphone: {'✅ OK' if mic_ok else '❌ ÉCHEC'}")
        self.log("="*60)

        return cam_ok and mic_ok

def main():
    daemon = StartupDaemon()
    success = daemon.run_startup_sequence()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
