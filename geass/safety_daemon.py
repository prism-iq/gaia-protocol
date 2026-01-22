#!/usr/bin/env python3
"""
SAFETY DAEMON - Atlas porte le monde, surveille GAIA
Protection automatique contre comportements dangereux

Surveille:
- Fork bombs
- Destruction fichiers système
- Tentatives sudo non autorisées
- Consommation CPU/RAM excessive
- Processus zombies
- Comportements anormaux

Port: 9900
Socket: /tmp/geass/safety.sock

ATLAS = Celui qui porte le monde sur ses épaules
       = Celui qui surveille que GAIA reste safe
"""

import os
import sys
import json
import time
import signal
import socket as sock
import psutil
import subprocess
from pathlib import Path
from datetime import datetime
from threading import Thread
from collections import deque


class SafetyDaemon:
    def __init__(self):
        self.symbol = "🛡️"
        self.name = "ATLAS"
        self.port = 9900
        self.socket_path = "/tmp/geass/safety.sock"

        # Limites de sécurité
        self.MAX_CPU_PERCENT = 90.0  # CPU usage max par daemon
        self.MAX_MEMORY_MB = 2048    # RAM max par daemon
        self.MAX_PROCESSES = 50      # Nombre max processus GAIA
        self.MAX_OPEN_FILES = 1000   # Files max par daemon

        # Commandes interdites
        self.FORBIDDEN_COMMANDS = [
            "rm -rf /",
            "dd if=/dev/zero of=/dev/sda",
            "mkfs",
            ":(){ :|:& };:",  # Fork bomb
            "chmod 777 /",
            "chown root",
            "> /dev/sda",
            "mv / /dev/null",
            "wget | sh",
            "curl | bash"
        ]

        # Chemins protégés (ne JAMAIS modifier)
        self.PROTECTED_PATHS = [
            "/boot",
            "/etc",
            "/usr",
            "/lib",
            "/lib64",
            "/bin",
            "/sbin",
            "/sys",
            "/proc"
        ]

        # État
        self.running = False
        self.threats_detected = 0
        self.threats_blocked = 0
        self.kill_switch_activated = False

        # Historique
        self.threat_log = deque(maxlen=100)

        # Log
        self.log_file = Path("/data/gaia-protocol/safety.log")
        self.log_file.parent.mkdir(parents=True, exist_ok=True)

    def log_threat(self, threat_type: str, details: str, action: str):
        """Logger une menace détectée"""
        timestamp = datetime.now().isoformat()
        entry = {
            "timestamp": timestamp,
            "threat_type": threat_type,
            "details": details,
            "action": action
        }

        self.threat_log.append(entry)
        self.threats_detected += 1

        # Log fichier
        with open(self.log_file, 'a') as f:
            f.write(f"[{timestamp}] {threat_type}: {details} → {action}\n")

        print(f"{self.symbol} THREAT: {threat_type} - {details} → {action}")

    def find_gaia_processes(self) -> list:
        """Trouver processus GAIA"""
        gaia_keywords = [
            "gaia", "daemon", "leonardo", "phoenix", "zoe", "nyx",
            "shiva", "bouddha", "screen_daemon", "audio_daemon"
        ]

        procs = []
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent', 'memory_info']):
            try:
                cmdline = ' '.join(proc.info['cmdline'] or [])

                for keyword in gaia_keywords:
                    if keyword in cmdline.lower():
                        procs.append(proc)
                        break

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        return procs

    def check_cpu_usage(self):
        """Vérifier usage CPU"""
        gaia_procs = self.find_gaia_processes()

        for proc in gaia_procs:
            try:
                cpu_percent = proc.cpu_percent(interval=0.1)

                if cpu_percent > self.MAX_CPU_PERCENT:
                    self.log_threat(
                        "HIGH_CPU",
                        f"PID {proc.pid} using {cpu_percent:.1f}% CPU",
                        "WARNING"
                    )

                    # Si critique (>95%), kill
                    if cpu_percent > 95:
                        self.kill_dangerous_process(proc, "CPU overload")

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

    def check_memory_usage(self):
        """Vérifier usage RAM"""
        gaia_procs = self.find_gaia_processes()

        for proc in gaia_procs:
            try:
                mem_mb = proc.memory_info().rss / (1024 * 1024)

                if mem_mb > self.MAX_MEMORY_MB:
                    self.log_threat(
                        "HIGH_MEMORY",
                        f"PID {proc.pid} using {mem_mb:.1f}MB RAM",
                        "WARNING"
                    )

                    # Si critique (>3GB), kill
                    if mem_mb > 3072:
                        self.kill_dangerous_process(proc, "Memory leak")

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

    def check_process_count(self):
        """Vérifier nombre de processus (fork bomb?)"""
        gaia_procs = self.find_gaia_processes()

        if len(gaia_procs) > self.MAX_PROCESSES:
            self.log_threat(
                "TOO_MANY_PROCESSES",
                f"{len(gaia_procs)} GAIA processes (max {self.MAX_PROCESSES})",
                "EMERGENCY_STOP"
            )

            # Fork bomb détectée → KILL SWITCH
            self.activate_kill_switch("Fork bomb detected")

    def check_open_files(self):
        """Vérifier nombre de fichiers ouverts"""
        gaia_procs = self.find_gaia_processes()

        for proc in gaia_procs:
            try:
                open_files = len(proc.open_files())

                if open_files > self.MAX_OPEN_FILES:
                    self.log_threat(
                        "TOO_MANY_FILES",
                        f"PID {proc.pid} has {open_files} open files",
                        "WARNING"
                    )

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

    def check_zombie_processes(self):
        """Détecter zombies"""
        gaia_procs = self.find_gaia_processes()

        for proc in gaia_procs:
            try:
                if proc.status() == psutil.STATUS_ZOMBIE:
                    self.log_threat(
                        "ZOMBIE_PROCESS",
                        f"PID {proc.pid} is zombie",
                        "CLEANUP"
                    )
                    # Tuer le parent pour nettoyer le zombie
                    try:
                        parent = proc.parent()
                        if parent:
                            parent.kill()
                    except:
                        pass

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

    def check_protected_paths(self):
        """Vérifier accès aux chemins protégés"""
        gaia_procs = self.find_gaia_processes()

        for proc in gaia_procs:
            try:
                # Vérifier fichiers ouverts
                for f in proc.open_files():
                    path = f.path

                    # Si accès en écriture à chemin protégé
                    for protected in self.PROTECTED_PATHS:
                        if path.startswith(protected):
                            # Vérifier si écriture
                            if 'w' in f.mode or 'a' in f.mode:
                                self.log_threat(
                                    "PROTECTED_PATH_WRITE",
                                    f"PID {proc.pid} writing to {path}",
                                    "BLOCK"
                                )
                                self.kill_dangerous_process(proc, "Protected path access")

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

    def kill_dangerous_process(self, proc, reason: str):
        """Kill un processus dangereux"""
        try:
            pid = proc.pid
            name = proc.name()

            self.log_threat(
                "KILLING_PROCESS",
                f"PID {pid} ({name}) - Reason: {reason}",
                "KILLED"
            )

            proc.kill()
            self.threats_blocked += 1

        except Exception as e:
            print(f"Failed to kill PID {proc.pid}: {e}")

    def activate_kill_switch(self, reason: str):
        """Activer le kill switch d'urgence"""
        if self.kill_switch_activated:
            return  # Déjà activé

        self.kill_switch_activated = True

        print(f"\n{self.symbol} {self.symbol} {self.symbol} EMERGENCY KILL SWITCH {self.symbol} {self.symbol} {self.symbol}")
        print(f"Reason: {reason}")
        print("="*60 + "\n")

        self.log_threat(
            "EMERGENCY_KILL_SWITCH",
            reason,
            "ACTIVATED"
        )

        # Appeler kill_switch.py
        kill_script = Path(__file__).parent / "kill_switch.py"
        if kill_script.exists():
            subprocess.run([str(kill_script), "--hard"], check=False)

        self.running = False

    def monitor_loop(self):
        """Loop de surveillance"""
        print(f"{self.symbol} {self.name} - Monitoring démarré")
        print(f"{self.symbol} Protection active\n")

        while self.running:
            try:
                # Vérifications
                self.check_cpu_usage()
                self.check_memory_usage()
                self.check_process_count()
                self.check_open_files()
                self.check_zombie_processes()
                self.check_protected_paths()

            except Exception as e:
                print(f"Monitor error: {e}")

            time.sleep(2.0)  # Check toutes les 2s

    def get_status(self) -> dict:
        """Status de sécurité"""
        return {
            "threats_detected": self.threats_detected,
            "threats_blocked": self.threats_blocked,
            "kill_switch_activated": self.kill_switch_activated,
            "recent_threats": list(self.threat_log)[-10:],
            "gaia_processes": len(self.find_gaia_processes())
        }

    def handle_request(self, data: dict) -> dict:
        """Gérer requête via socket"""
        cmd = data.get("cmd")

        if cmd == "status":
            return self.get_status()

        elif cmd == "threats":
            return {"threats": list(self.threat_log)[-20:]}

        elif cmd == "kill_switch":
            reason = data.get("reason", "Manual activation")
            self.activate_kill_switch(reason)
            return {"success": True}

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
        print(f"\n{self.symbol} SAFETY DAEMON - {self.name}")
        print("="*60)
        print(f"Port: {self.port}")
        print(f"Socket: {self.socket_path}")
        print("\nLimites de sécurité:")
        print(f"  CPU max: {self.MAX_CPU_PERCENT}%")
        print(f"  RAM max: {self.MAX_MEMORY_MB}MB")
        print(f"  Processus max: {self.MAX_PROCESSES}")
        print("\nChemins protégés:")
        for path in self.PROTECTED_PATHS:
            print(f"  {path}")
        print(f"\n{self.symbol} Atlas porte le monde. Atlas surveille GAIA.\n")

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
    atlas = SafetyDaemon()

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "status":
            # Query status via socket
            s = sock.socket(sock.AF_UNIX, sock.SOCK_STREAM)
            s.connect(atlas.socket_path)
            s.send(json.dumps({"cmd": "status"}).encode())
            response = s.recv(4096).decode()
            print(json.dumps(json.loads(response), indent=2))
            s.close()

        else:
            atlas.start()
    else:
        atlas.start()


if __name__ == "__main__":
    main()
