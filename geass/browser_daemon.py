#!/usr/bin/env python3
"""
BROWSER DAEMON - L'Attention de GAIA
Comprend ce que Miguel lit et fait sur le web
Contexte navigateur en temps réel

Port: 9803
Socket: /tmp/geass/browser.sock

ÉTHIQUE:
- Lit UNIQUEMENT l'historique/session de Miguel (avec consentement)
- Données privées = restent privées
- Pour suggérer et AIDER, pas pour surveiller
"""

import os
import sys
import json
import time
import socket as sock
import sqlite3
import subprocess
from pathlib import Path
from datetime import datetime, timedelta
from threading import Thread
from collections import deque
import shutil


class BrowserDaemon:
    def __init__(self):
        self.symbol = "🌐"
        self.port = 9803
        self.socket_path = "/tmp/geass/browser.sock"

        # Configuration
        self.firefox_profile = self.find_firefox_profile()
        self.check_interval = 3.0  # Secondes

        # État
        self.running = False
        self.current_url = None
        self.current_title = None
        self.recent_urls = deque(maxlen=50)
        self.open_tabs = []

        # Contexte
        self.important_sites = {
            "onche.org": "Forum",
            "github.com": "Code",
            "youtube.com": "Vidéo",
            "localhost": "Dev local"
        }

        # Stats
        self.total_urls_seen = 0

    def find_firefox_profile(self) -> Path:
        """Trouver le profil Firefox de Miguel"""
        firefox_dir = Path.home() / ".mozilla/firefox"

        if not firefox_dir.exists():
            return None

        # Chercher profil par défaut
        profiles_ini = firefox_dir / "profiles.ini"
        if profiles_ini.exists():
            with open(profiles_ini) as f:
                lines = f.readlines()
                for i, line in enumerate(lines):
                    if "Default=1" in line or "Path=" in line:
                        # Trouver le chemin
                        for j in range(max(0, i-5), min(len(lines), i+5)):
                            if "Path=" in lines[j]:
                                path = lines[j].split("=")[1].strip()
                                profile_path = firefox_dir / path
                                if profile_path.exists():
                                    return profile_path

        # Fallback: premier profil trouvé
        for item in firefox_dir.iterdir():
            if item.is_dir() and ".default" in item.name:
                return item

        return None

    def get_recent_history(self, limit: int = 20) -> list:
        """Lire l'historique récent de Firefox"""
        if not self.firefox_profile:
            return []

        places_db = self.firefox_profile / "places.sqlite"
        if not places_db.exists():
            return []

        # Copier DB (Firefox lock)
        temp_db = Path("/tmp/gaia-places.sqlite")
        try:
            shutil.copy2(places_db, temp_db)
        except:
            return []

        history = []

        try:
            conn = sqlite3.connect(str(temp_db))
            cursor = conn.cursor()

            # Requête historique récent
            query = """
            SELECT url, title, last_visit_date, visit_count
            FROM moz_places
            WHERE last_visit_date IS NOT NULL
            ORDER BY last_visit_date DESC
            LIMIT ?
            """

            cursor.execute(query, (limit,))
            rows = cursor.fetchall()

            for row in rows:
                url, title, last_visit_us, visit_count = row

                # Convertir timestamp Firefox (microsecondes)
                if last_visit_us:
                    last_visit = datetime.fromtimestamp(last_visit_us / 1000000)
                else:
                    last_visit = None

                history.append({
                    "url": url,
                    "title": title or url,
                    "last_visit": last_visit.isoformat() if last_visit else None,
                    "visit_count": visit_count
                })

            conn.close()

        except Exception as e:
            print(f"Erreur lecture historique: {e}")

        finally:
            if temp_db.exists():
                temp_db.unlink()

        return history

    def get_open_tabs(self) -> list:
        """Lire les onglets ouverts (approximatif via sessionstore)"""
        if not self.firefox_profile:
            return []

        # Firefox stocke la session dans sessionstore-backups/recovery.jsonlz4
        session_dir = self.firefox_profile / "sessionstore-backups"
        if not session_dir.exists():
            return []

        # Chercher le fichier de session le plus récent
        session_files = list(session_dir.glob("*.jsonlz4")) + list(session_dir.glob("*.json"))
        if not session_files:
            return []

        # Plus récent
        session_file = max(session_files, key=lambda p: p.stat().st_mtime)

        # Pour .jsonlz4, faudrait décompresser (lz4)
        # Pour l'instant, on skip si c'est compressé
        if session_file.suffix == ".jsonlz4":
            # TODO: installer lz4 et décompresser
            return []

        try:
            with open(session_file) as f:
                data = json.load(f)

            tabs = []
            windows = data.get("windows", [])

            for window in windows:
                for tab in window.get("tabs", []):
                    entries = tab.get("entries", [])
                    if entries:
                        current_entry = entries[-1]
                        tabs.append({
                            "url": current_entry.get("url"),
                            "title": current_entry.get("title")
                        })

            return tabs

        except Exception as e:
            print(f"Erreur lecture session: {e}")
            return []

    def detect_current_context(self):
        """Détecter le contexte actuel du navigateur"""
        # Historique récent
        history = self.get_recent_history(limit=5)

        if history:
            most_recent = history[0]
            self.current_url = most_recent['url']
            self.current_title = most_recent['title']

            # Ajouter au buffer
            if self.current_url not in [u['url'] for u in self.recent_urls]:
                self.recent_urls.append({
                    "url": self.current_url,
                    "title": self.current_title,
                    "timestamp": datetime.now().isoformat()
                })
                self.total_urls_seen += 1

                # Détecter site important
                for domain, category in self.important_sites.items():
                    if domain in self.current_url:
                        print(f"{self.symbol} [{category}] {self.current_title}")
                        break

        # Onglets ouverts
        self.open_tabs = self.get_open_tabs()

    def monitor_loop(self):
        """Loop de monitoring du navigateur"""
        print(f"{self.symbol} Monitoring démarré (intervalle: {self.check_interval}s)")

        while self.running:
            try:
                self.detect_current_context()
            except Exception as e:
                print(f"Erreur monitoring: {e}")

            time.sleep(self.check_interval)

    def get_current_context(self) -> dict:
        """Contexte navigateur actuel"""
        return {
            "current_url": self.current_url,
            "current_title": self.current_title,
            "recent_urls": list(self.recent_urls)[-10:],
            "open_tabs_count": len(self.open_tabs),
            "open_tabs": self.open_tabs[:10],  # Limiter à 10
            "total_urls_seen": self.total_urls_seen
        }

    def handle_request(self, data: dict) -> dict:
        """Gérer requête via socket"""
        cmd = data.get("cmd")

        if cmd == "context":
            return self.get_current_context()

        elif cmd == "current":
            return {
                "url": self.current_url,
                "title": self.current_title
            }

        elif cmd == "history":
            limit = data.get("limit", 20)
            return {"history": self.get_recent_history(limit)}

        elif cmd == "tabs":
            return {"tabs": self.open_tabs}

        elif cmd == "stats":
            return {
                "total_urls_seen": self.total_urls_seen,
                "recent_count": len(self.recent_urls),
                "tabs_count": len(self.open_tabs)
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
        print(f"\n{self.symbol} BROWSER DAEMON - L'Attention de GAIA")
        print("="*60)
        print(f"Port: {self.port}")
        print(f"Socket: {self.socket_path}")
        print(f"Firefox profile: {self.firefox_profile}")
        print("\n⚠️  CONSENTEMENT:")
        print("   Ce daemon lit TON historique pour T'AIDER")
        print("   Données privées = restent privées")
        print("   GAIA ne surveille pas, GAIA comprend ton contexte\n")

        if not self.firefox_profile:
            print("⚠️  Profil Firefox non trouvé")
            print("   Fonctionnalités limitées\n")

        self.running = True

        # Threads
        monitor_thread = Thread(target=self.monitor_loop, daemon=True)
        socket_thread = Thread(target=self.socket_listener, daemon=True)

        monitor_thread.start()
        socket_thread.start()

        print(f"{self.symbol} Daemon actif. Ctrl+C pour arrêter.\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n{self.symbol} Arrêt...")
            self.running = False


def main():
    daemon = BrowserDaemon()

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "history":
            history = daemon.get_recent_history(20)
            for item in history:
                print(f"{item['title'][:60]}")
                print(f"  {item['url']}")
                print()

        elif cmd == "tabs":
            tabs = daemon.get_open_tabs()
            for tab in tabs:
                print(f"{tab['title']}")

        else:
            daemon.start()
    else:
        daemon.start()


if __name__ == "__main__":
    main()
