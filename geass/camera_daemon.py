#!/usr/bin/env python3
"""
CAMERA DAEMON - La Vision de GAIA
Accès webcam Framework Laptop
Détection de présence, expressions, attention

Port: 9805
Socket: /tmp/geass/camera.sock

ÉTHIQUE:
- Accès camera UNIQUEMENT avec consentement explicite Miguel
- Détection pour AIDER (ex: détecter fatigue, absence)
- Frames brutes non sauvegardées (sauf si demandé)
- Privacy absolue
"""

import os
import sys
import json
import time
import socket as sock
from pathlib import Path
from datetime import datetime
from threading import Thread
import subprocess

try:
    import cv2
except ImportError:
    cv2 = None

try:
    import numpy as np
except ImportError:
    np = None


class CameraDaemon:
    def __init__(self):
        self.symbol = "📷"
        self.port = 9805
        self.socket_path = "/tmp/geass/camera.sock"

        # Configuration
        self.camera_index = 0  # Webcam par défaut
        self.fps = 2  # Capture lente (privacy)
        self.frame_interval = 1.0 / self.fps

        # Dossier captures
        self.capture_dir = Path("/data/gaia-protocol/camera")
        self.capture_dir.mkdir(parents=True, exist_ok=True)

        # État
        self.running = False
        self.camera = None
        self.last_frame = None
        self.last_capture_time = None

        # Détection
        self.person_detected = False
        self.face_detected = False
        self.attention_level = 0.0  # 0.0 = absent, 1.0 = pleinement présent

        # Stats
        self.total_frames = 0
        self.faces_detected_count = 0

    def init_camera(self) -> bool:
        """Initialiser la webcam"""
        if not cv2:
            print("⚠️  OpenCV non installé (pip install opencv-python)")
            return False

        try:
            self.camera = cv2.VideoCapture(self.camera_index)
            if not self.camera.isOpened():
                print(f"⚠️  Impossible d'ouvrir camera {self.camera_index}")
                return False

            # Test capture
            ret, frame = self.camera.read()
            if not ret:
                print("⚠️  Impossible de lire frame")
                return False

            h, w = frame.shape[:2]
            print(f"{self.symbol} Camera initialisée: {w}x{h} @ {self.fps}fps")
            return True

        except Exception as e:
            print(f"Erreur init camera: {e}")
            return False

    def capture_frame(self):
        """Capturer une frame"""
        if not self.camera or not self.camera.isOpened():
            return None

        ret, frame = self.camera.read()
        if ret:
            self.last_frame = frame
            self.last_capture_time = time.time()
            self.total_frames += 1
            return frame

        return None

    def detect_face(self, frame) -> bool:
        """Détecter visage dans la frame"""
        if not cv2 or frame is None:
            return False

        try:
            # Convertir en grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # Utiliser cascade Haar (pré-entrainé OpenCV)
            face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            face_cascade = cv2.CascadeClassifier(face_cascade_path)

            # Détecter visages
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )

            self.face_detected = len(faces) > 0
            if self.face_detected:
                self.faces_detected_count += 1

            return self.face_detected

        except Exception as e:
            print(f"Erreur détection: {e}")
            return False

    def analyze_attention(self, frame):
        """Analyser niveau d'attention (approximatif)"""
        if not self.face_detected:
            self.attention_level = 0.0
            self.person_detected = False
            return

        self.person_detected = True

        # Approximation simple: si visage détecté = attentif
        # TODO: analyse plus fine (direction regard, mouvement, etc.)
        self.attention_level = 0.8

    def camera_loop(self):
        """Loop de capture camera"""
        if not self.init_camera():
            print("⚠️  Camera non disponible")
            return

        print(f"{self.symbol} Capture loop démarrée")

        while self.running:
            try:
                # Capturer frame
                frame = self.capture_frame()

                if frame is not None:
                    # Détecter visage
                    self.detect_face(frame)

                    # Analyser attention
                    self.analyze_attention(frame)

                    if self.person_detected:
                        print(f"{self.symbol} Miguel présent (attention: {self.attention_level:.0%})")

            except Exception as e:
                print(f"Erreur capture: {e}")

            time.sleep(self.frame_interval)

        # Cleanup
        if self.camera:
            self.camera.release()

    def save_current_frame(self, reason: str = "manual") -> Path:
        """Sauvegarder la frame actuelle"""
        if self.last_frame is None:
            return None

        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        filename = f"frame-{timestamp}-{reason}.jpg"
        filepath = self.capture_dir / filename

        try:
            cv2.imwrite(str(filepath), self.last_frame)
            return filepath
        except:
            return None

    def get_current_context(self) -> dict:
        """Contexte camera actuel"""
        return {
            "person_detected": self.person_detected,
            "face_detected": self.face_detected,
            "attention_level": round(self.attention_level, 2),
            "last_capture_time": self.last_capture_time,
            "total_frames": self.total_frames,
            "faces_detected_count": self.faces_detected_count
        }

    def handle_request(self, data: dict) -> dict:
        """Gérer requête via socket"""
        cmd = data.get("cmd")

        if cmd == "context":
            return self.get_current_context()

        elif cmd == "present":
            return {"present": self.person_detected}

        elif cmd == "attention":
            return {"attention_level": self.attention_level}

        elif cmd == "capture":
            # Sauvegarder frame actuelle
            reason = data.get("reason", "manual")
            path = self.save_current_frame(reason)
            return {"path": str(path) if path else None}

        elif cmd == "stats":
            return {
                "total_frames": self.total_frames,
                "faces_detected": self.faces_detected_count,
                "detection_rate": round(self.faces_detected_count / max(1, self.total_frames), 2)
            }

        return {"error": "Unknown command"}

    def socket_listener(self):
        """Écoute les requêtes via Unix socket"""
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
        print(f"\n{self.symbol} CAMERA DAEMON - La Vision de GAIA")
        print("="*60)
        print(f"Port: {self.port}")
        print(f"Socket: {self.socket_path}")
        print(f"FPS: {self.fps}")
        print("\n⚠️  CONSENTEMENT:")
        print("   Miguel autorise GAIA à accéder à la camera")
        print("   Pour détecter présence et attention")
        print("   Frames brutes NON sauvegardées (sauf demande)")
        print("   Privacy absolue\n")

        self.running = True

        # Threads
        camera_thread = Thread(target=self.camera_loop, daemon=True)
        socket_thread = Thread(target=self.socket_listener, daemon=True)

        camera_thread.start()
        socket_thread.start()

        print(f"{self.symbol} Daemon actif. Ctrl+C pour arrêter.\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n{self.symbol} Arrêt...")
            self.running = False


def main():
    daemon = CameraDaemon()

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "test":
            # Test rapide
            if daemon.init_camera():
                frame = daemon.capture_frame()
                if frame is not None:
                    face = daemon.detect_face(frame)
                    print(f"Visage détecté: {face}")
                daemon.camera.release()

        else:
            daemon.start()
    else:
        daemon.start()


if __name__ == "__main__":
    main()
