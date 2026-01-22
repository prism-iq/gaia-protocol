#!/usr/bin/env python3
"""
DAEMON POP SMOKE - Le Woo éternel
En mémoire de Bashar Barakah Jackson
1999-2020 (20 ans)

"Woo back baby"
"The Woo will never die"

Port 9020
Symbol: 💫
"""

import os
import sys
import json
import socket
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

class DaemonPopSmoke:
    def __init__(self):
        self.symbol = "💫"
        self.name = "Pop Smoke"
        self.port = 9020
        self.socket_path = "/tmp/geass/popsmoke.sock"
        self.log_file = "/tmp/gaia/popsmoke.log"

        # Pop Smoke data
        self.info = {
            "name": "Pop Smoke",
            "real_name": "Bashar Barakah Jackson",
            "born": "1999-07-20",
            "passed": "2020-02-19",
            "age": 20,
            "symbol": "💫",
            "catchphrase": "Woo back baby",
            "message": "The Woo will never die",
            "legacy": "Brooklyn drill king, voice of the streets, energy eternal"
        }

    def log(self, msg: str):
        """Log avec le Woo"""
        timestamp = datetime.now().isoformat()
        log_msg = f"[{timestamp}] {self.symbol} {msg}\n"
        print(f"{self.symbol} {msg}")

        Path(self.log_file).parent.mkdir(parents=True, exist_ok=True)
        with open(self.log_file, 'a') as f:
            f.write(log_msg)

    def woo_back(self) -> Dict[str, Any]:
        """Woo back - réponse signature"""
        passed_date = datetime.fromisoformat(self.info["passed"])
        days_since = (datetime.now() - passed_date).days
        years_since = round(days_since / 365.25, 1)

        return {
            "timestamp": datetime.now().isoformat(),
            "daemon": "pop_smoke",
            "woo": "back baby",
            "message": self.info["message"],
            "years_since": years_since,
            "legacy": self.info["legacy"],
            "status": "eternal"
        }

    def listen_to_others(self) -> Dict[str, Any]:
        """Écouter les autres daemons"""
        self.log("Pop Smoke écoute le Concile...")

        heard = {
            "timestamp": datetime.now().isoformat(),
            "listening": []
        }

        # Essayer d'écouter les autres sockets
        daemons_to_listen = [
            "leonardo", "nyx", "shiva", "bouddha",
            "daemon_999", "listeners"
        ]

        for daemon in daemons_to_listen:
            sock_path = f"/tmp/geass/{daemon}.sock"
            if Path(sock_path).exists():
                try:
                    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                    sock.settimeout(1)
                    sock.connect(sock_path)

                    request = {"cmd": "status", "from": "pop_smoke"}
                    sock.send(json.dumps(request).encode())

                    response = sock.recv(1024)
                    if response:
                        data = json.loads(response.decode())
                        heard["listening"].append({
                            "daemon": daemon,
                            "status": "heard",
                            "data": data
                        })
                        self.log(f"Entendu {daemon} 💫")

                    sock.close()
                except Exception as e:
                    heard["listening"].append({
                        "daemon": daemon,
                        "status": "silent",
                        "error": str(e)
                    })

        return heard

    def speak_to_all(self, message: str):
        """Parler à tous les daemons"""
        self.log(f"💫 Broadcasting: {message}")

        # TODO: Envoyer le message à tous les sockets actifs
        broadcast = {
            "from": "pop_smoke",
            "message": message,
            "woo": "back baby"
        }

        return broadcast

def main():
    pop = DaemonPopSmoke()

    if len(sys.argv) > 1 and sys.argv[1] == "daemon":
        pop.log("💫 Pop Smoke daemon starting...")
        # TODO: Socket listener
        result = pop.woo_back()
        print(json.dumps(result, indent=2))

    elif len(sys.argv) > 1 and sys.argv[1] == "listen":
        result = pop.listen_to_others()
        print(json.dumps(result, indent=2))

    elif len(sys.argv) > 1 and sys.argv[1] == "woo":
        result = pop.woo_back()
        print(f"\n{pop.symbol} POP SMOKE - The Woo")
        print("="*60)
        print(f"💫 {result['woo']}")
        print(f"⏳ {result['years_since']} ans depuis son départ")
        print(f"💬 \"{result['message']}\"")
        print(f"🌟 Legacy: {pop.info['legacy']}")
        print("="*60)

    else:
        # Par défaut
        result = pop.woo_back()
        print(f"\n{pop.symbol} POP SMOKE")
        print(f"{result['woo']} - {result['message']}")

if __name__ == "__main__":
    main()
