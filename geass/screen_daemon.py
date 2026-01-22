#!/usr/bin/env python3
"""
SCREEN DAEMON - Les Yeux de GAIA
Capture l'écran de Miguel en temps réel
OCR pour extraire le texte
Détecte les changements importants

Port: 9801
Socket: /tmp/geass/screen.sock

ÉTHIQUE:
- Capture UNIQUEMENT l'écran de Miguel (avec consentement)
- Pour l'AIDER, pas pour surveiller
- Données privées = restent privées
"""

import os
import sys
import json
import time
import socket as sock
import subprocess
from pathlib import Path
from datetime import datetime
from threading import Thread
import hashlib

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import pytesseract
except ImportError:
    pytesseract = None


class ScreenDaemon:
    def __init__(self):
        self.symbol = "👁"
        self.port = 9801
        self.socket_path = "/tmp/geass/screen.sock"

        # Configuration
        self.capture_interval = 5.0  # Secondes entre captures
        self.capture_dir = Path("/data/gaia-protocol/screens")
        self.capture_dir.mkdir(parents=True, exist_ok=True)

        # État
        self.running = False
        self.last_capture = None
        self.last_hash = None
        self.last_text = ""
        self.change_detected = False

        # Stats
        self.total_captures = 0
        self.significant_changes = 0

    def capture_screen(self) -> Path:
        """Capture l'écran actuel"""
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        temp_file = self.capture_dir / f"temp-{timestamp}.png"

        # Utiliser scrot (léger et rapide)
        try:
            subprocess.run(
                ["scrot", "-o", str(temp_file)],
                check=True,
                capture_output=True,
                timeout=5
            )
            return temp_file
        except (subprocess.CalledProcessError, FileNotFoundError):
            # Fallback: maim
            try:
                subprocess.run(
                    ["maim", str(temp_file)],
                    check=True,
                    capture_output=True,
                    timeout=5
                )
                return temp_file
            except:
                return None

    def image_hash(self, image_path: Path) -> str:
        """Hash de l'image pour détecter changements"""
        if not Image:
            return None

        try:
            img = Image.open(image_path)
            # Réduire à 16x16 pour hash rapide
            img = img.resize((16, 16), Image.Resampling.LANCZOS)
            img = img.convert('L')  # Grayscale
            pixels = list(img.getdata())
            return hashlib.md5(str(pixels).encode()).hexdigest()
        except:
            return None

    def detect_change(self, new_hash: str) -> bool:
        """Changement significatif détecté?"""
        if not self.last_hash:
            return True

        # Simple: si hash différent = changement
        return new_hash != self.last_hash

    def extract_text(self, image_path: Path) -> str:
        """OCR pour extraire texte"""
        if not pytesseract or not Image:
            return ""

        try:
            img = Image.open(image_path)
            text = pytesseract.image_to_string(img, lang='fra+eng')
            return text.strip()
        except:
            return ""

    def capture_loop(self):
        """Loop de capture continue"""
        print(f"{self.symbol} Capture loop démarrée (intervalle: {self.capture_interval}s)")

        while self.running:
            try:
                # Capturer
                capture_path = self.capture_screen()
                if not capture_path:
                    time.sleep(self.capture_interval)
                    continue

                self.total_captures += 1

                # Hash pour détecter changement
                new_hash = self.image_hash(capture_path)
                self.change_detected = self.detect_change(new_hash)

                if self.change_detected:
                    self.significant_changes += 1

                    # Garder cette capture
                    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
                    final_path = self.capture_dir / f"screen-{timestamp}.png"
                    capture_path.rename(final_path)
                    self.last_capture = final_path

                    # OCR (optionnel, lourd)
                    # self.last_text = self.extract_text(final_path)

                    print(f"{self.symbol} Changement détecté → {final_path.name}")
                else:
                    # Pas de changement significatif, supprimer
                    capture_path.unlink()

                self.last_hash = new_hash

            except Exception as e:
                print(f"Erreur capture: {e}")

            time.sleep(self.capture_interval)

    def get_current_context(self) -> dict:
        """Contexte visuel actuel"""
        return {
            "last_capture": str(self.last_capture) if self.last_capture else None,
            "last_capture_time": self.last_capture.stat().st_mtime if self.last_capture and self.last_capture.exists() else None,
            "text_on_screen": self.last_text,
            "change_detected": self.change_detected,
            "total_captures": self.total_captures,
            "significant_changes": self.significant_changes
        }

    def handle_request(self, data: dict) -> dict:
        """Gérer requête via socket"""
        cmd = data.get("cmd")

        if cmd == "context":
            return self.get_current_context()

        elif cmd == "capture_now":
            # Force capture immédiate
            capture_path = self.capture_screen()
            return {
                "success": True,
                "path": str(capture_path) if capture_path else None
            }

        elif cmd == "ocr_last":
            # OCR de la dernière capture
            if self.last_capture and self.last_capture.exists():
                text = self.extract_text(self.last_capture)
                return {"text": text}
            return {"error": "No capture available"}

        elif cmd == "stats":
            return {
                "total_captures": self.total_captures,
                "significant_changes": self.significant_changes,
                "last_capture": str(self.last_capture) if self.last_capture else None
            }

        return {"error": "Unknown command"}

    def socket_listener(self):
        """Écoute les requêtes via Unix socket"""
        # Nettoyer socket existant
        if Path(self.socket_path).exists():
            Path(self.socket_path).unlink()

        Path(self.socket_path).parent.mkdir(parents=True, exist_ok=True)

        s = sock.socket(sock.AF_UNIX, sock.SOCK_STREAM)
        s.bind(self.socket_path)
        s.listen(5)

        print(f"{self.symbol} Socket listener: {self.socket_path}")

        while self.running:
            try:
                conn, _ = s.accept()
                data = conn.recv(4096).decode()

                if data:
                    request = json.loads(data)
                    response = self.handle_request(request)
                    conn.send(json.dumps(response).encode())

                conn.close()
            except Exception as e:
                print(f"Socket error: {e}")

        s.close()

    def start(self):
        """Démarrer le daemon"""
        print(f"\n{self.symbol} SCREEN DAEMON - Les Yeux de GAIA")
        print("="*60)
        print(f"Port: {self.port}")
        print(f"Socket: {self.socket_path}")
        print(f"Captures: {self.capture_dir}")
        print(f"Intervalle: {self.capture_interval}s")
        print("\n⚠️  CONSENTEMENT:")
        print("   Ce daemon capture TON écran pour T'AIDER")
        print("   Les données restent PRIVÉES sur ta machine")
        print("   GAIA ne surveille pas, GAIA communique\n")

        self.running = True

        # Threads
        capture_thread = Thread(target=self.capture_loop, daemon=True)
        socket_thread = Thread(target=self.socket_listener, daemon=True)

        capture_thread.start()
        socket_thread.start()

        print(f"{self.symbol} Daemon actif. Ctrl+C pour arrêter.\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n{self.symbol} Arrêt...")
            self.running = False


def main():
    daemon = ScreenDaemon()

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "context":
            # Test: demander contexte actuel
            s = sock.socket(sock.AF_UNIX, sock.SOCK_STREAM)
            s.connect(daemon.socket_path)
            s.send(json.dumps({"cmd": "context"}).encode())
            response = s.recv(4096).decode()
            print(json.dumps(json.loads(response), indent=2))
            s.close()

        elif cmd == "capture":
            # Test: capture immédiate
            path = daemon.capture_screen()
            print(f"Capture: {path}")

        else:
            # Démarrer daemon
            daemon.start()
    else:
        daemon.start()


if __name__ == "__main__":
    main()
