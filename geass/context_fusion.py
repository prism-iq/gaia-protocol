#!/usr/bin/env python3
"""
CONTEXT FUSION - Le Cerveau de GAIA
Fusionne tous les contextes (screen + audio + browser + camera)
Comprend ce que Miguel fait en temps réel
Génère suggestions intelligentes

Port: 9804
Socket: /tmp/geass/context.sock

ÉTHIQUE:
- Miguel autorise LECTURE de tout son contexte
- GAIA analyse pour AIDER et SUGGÉRER
- Miguel garde contrôle total (droits d'écriture)
"""

import os
import sys
import json
import time
import socket as sock
from pathlib import Path
from datetime import datetime
from threading import Thread
from collections import deque


class ContextFusion:
    def __init__(self):
        self.symbol = "🧠"
        self.port = 9804
        self.socket_path = "/tmp/geass/context.sock"

        # Daemons sources
        self.daemons = {
            "screen": "/tmp/geass/screen.sock",
            "audio": "/tmp/geass/audio.sock",
            "browser": "/tmp/geass/browser.sock",
            "camera": "/tmp/geass/camera.sock"
        }

        # Contextes fusionnés
        self.contexts = {
            "screen": {},
            "audio": {},
            "browser": {},
            "camera": {}
        }

        # Analyse fusionnée
        self.current_activity = "unknown"
        self.miguel_present = False
        self.miguel_attention = 0.0
        self.current_focus = None

        # Historique
        self.activity_history = deque(maxlen=100)

        # Suggestions
        self.suggestions = []

        # État
        self.running = False
        self.last_fusion_time = None

    def query_daemon(self, daemon_name: str, cmd: str = "context") -> dict:
        """Interroger un daemon"""
        socket_path = self.daemons.get(daemon_name)
        if not socket_path or not Path(socket_path).exists():
            return {}

        try:
            s = sock.socket(sock.AF_UNIX, sock.SOCK_STREAM)
            s.settimeout(1.0)
            s.connect(socket_path)

            request = {"cmd": cmd}
            s.send(json.dumps(request).encode())

            response = s.recv(8192).decode()
            s.close()

            return json.loads(response) if response else {}

        except Exception as e:
            return {}

    def collect_contexts(self):
        """Collecter contextes de tous les daemons"""
        for daemon_name in self.daemons.keys():
            context = self.query_daemon(daemon_name, "context")
            if context:
                self.contexts[daemon_name] = context

    def analyze_activity(self):
        """Analyser l'activité actuelle de Miguel"""
        screen = self.contexts.get("screen", {})
        audio = self.contexts.get("audio", {})
        browser = self.contexts.get("browser", {})
        camera = self.contexts.get("camera", {})

        # Présence Miguel
        self.miguel_present = camera.get("person_detected", False)
        self.miguel_attention = camera.get("attention_level", 0.0)

        # Détecter activité
        activity = "unknown"
        focus = None

        # Si navigateur actif
        current_url = browser.get("current_url", "")
        current_title = browser.get("current_title", "")

        if "onche.org" in current_url:
            activity = "forum_onche"
            focus = current_title

        elif "github.com" in current_url:
            activity = "coding"
            focus = current_title

        elif "youtube.com" in current_url:
            activity = "watching_video"
            focus = current_title

        elif "localhost" in current_url:
            activity = "dev_local"
            focus = "Development"

        # Si audio transcription récente
        audio_sentence = audio.get("current_sentence", "")
        if audio_sentence and len(audio_sentence) > 10:
            activity = "speaking"
            focus = audio_sentence[:50]

        # Si changement screen significatif
        screen_change = screen.get("change_detected", False)
        if screen_change and activity == "unknown":
            activity = "reading_screen"

        self.current_activity = activity
        self.current_focus = focus

        # Historique
        entry = {
            "timestamp": datetime.now().isoformat(),
            "activity": activity,
            "focus": focus,
            "present": self.miguel_present,
            "attention": self.miguel_attention
        }
        self.activity_history.append(entry)

    def generate_suggestions(self):
        """Générer suggestions intelligentes"""
        self.suggestions = []

        # Suggestion selon activité
        if self.current_activity == "forum_onche":
            self.suggestions.append({
                "type": "info",
                "message": f"Tu es sur onche.org: {self.current_focus}"
            })

            # Si audio récent, suggérer réponse
            audio_text = self.contexts.get("audio", {}).get("current_sentence", "")
            if audio_text:
                self.suggestions.append({
                    "type": "action",
                    "message": f"Tu as dit: \"{audio_text[:60]}...\" - besoin d'aide pour répondre?"
                })

        elif self.current_activity == "coding":
            self.suggestions.append({
                "type": "info",
                "message": "Mode coding actif"
            })

        elif self.current_activity == "watching_video":
            # Ne pas déranger
            self.suggestions.append({
                "type": "info",
                "message": "Tu regardes une vidéo - mode silence"
            })

        # Si Miguel absent longtemps
        if not self.miguel_present:
            recent = list(self.activity_history)[-10:]
            if all(not e["present"] for e in recent):
                self.suggestions.append({
                    "type": "warning",
                    "message": "Miguel absent - mode veille activé"
                })

        # Si fatigue détectée (attention basse)
        if self.miguel_present and self.miguel_attention < 0.3:
            self.suggestions.append({
                "type": "care",
                "message": "Attention faible - peut-être temps de pause?"
            })

    def fusion_loop(self):
        """Loop de fusion des contextes"""
        print(f"{self.symbol} Fusion loop démarrée")

        while self.running:
            try:
                # Collecter tous les contextes
                self.collect_contexts()

                # Analyser
                self.analyze_activity()

                # Suggestions
                self.generate_suggestions()

                self.last_fusion_time = time.time()

                # Afficher état
                if self.miguel_present:
                    print(f"{self.symbol} Miguel: {self.current_activity} → {self.current_focus or 'N/A'}")

            except Exception as e:
                print(f"Erreur fusion: {e}")

            time.sleep(2.0)  # Fusion toutes les 2s

    def get_unified_context(self) -> dict:
        """Contexte unifié complet"""
        return {
            "timestamp": datetime.now().isoformat(),
            "miguel_present": self.miguel_present,
            "miguel_attention": self.miguel_attention,
            "current_activity": self.current_activity,
            "current_focus": self.current_focus,
            "suggestions": self.suggestions,
            "contexts": {
                "screen": self.contexts.get("screen", {}),
                "audio": self.contexts.get("audio", {}),
                "browser": self.contexts.get("browser", {}),
                "camera": self.contexts.get("camera", {})
            },
            "activity_history": list(self.activity_history)[-10:]
        }

    def handle_request(self, data: dict) -> dict:
        """Gérer requête via socket"""
        cmd = data.get("cmd")

        if cmd == "context":
            return self.get_unified_context()

        elif cmd == "activity":
            return {
                "activity": self.current_activity,
                "focus": self.current_focus
            }

        elif cmd == "suggestions":
            return {"suggestions": self.suggestions}

        elif cmd == "present":
            return {
                "present": self.miguel_present,
                "attention": self.miguel_attention
            }

        elif cmd == "history":
            limit = data.get("limit", 20)
            return {"history": list(self.activity_history)[-limit:]}

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
        print(f"\n{self.symbol} CONTEXT FUSION - Le Cerveau de GAIA")
        print("="*60)
        print(f"Port: {self.port}")
        print(f"Socket: {self.socket_path}")
        print("\nDaemons sources:")
        for name, socket_path in self.daemons.items():
            status = "✓" if Path(socket_path).exists() else "✗"
            print(f"  {status} {name:12} {socket_path}")

        print("\n⚠️  CONSENTEMENT:")
        print("   Miguel autorise GAIA à LIRE tout son contexte")
        print("   GAIA analyse pour COMPRENDRE et SUGGÉRER")
        print("   Miguel garde CONTRÔLE TOTAL (droits d'écriture)\n")

        self.running = True

        # Threads
        fusion_thread = Thread(target=self.fusion_loop, daemon=True)
        socket_thread = Thread(target=self.socket_listener, daemon=True)

        fusion_thread.start()
        socket_thread.start()

        print(f"{self.symbol} Daemon actif. Ctrl+C pour arrêter.\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n{self.symbol} Arrêt...")
            self.running = False


def main():
    fusion = ContextFusion()

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "test":
            # Test fusion
            fusion.collect_contexts()
            fusion.analyze_activity()
            print(json.dumps(fusion.get_unified_context(), indent=2))

        else:
            fusion.start()
    else:
        fusion.start()


if __name__ == "__main__":
    main()
