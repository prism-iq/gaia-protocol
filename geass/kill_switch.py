#!/usr/bin/env python3
"""
KILL SWITCH - Le Veto Absolu de Miguel
Arrêt d'urgence de TOUS les daemons GAIA

Usage:
    ./kill_switch.py             # Kill all GAIA daemons
    ./kill_switch.py --soft      # Soft shutdown (graceful)
    ./kill_switch.py --hard      # Hard kill (force -9)
    ./kill_switch.py --daemon X  # Kill daemon spécifique

Miguel garde CONTRÔLE ABSOLU sur GAIA.
"""

import os
import sys
import signal
import psutil
import subprocess
from pathlib import Path
from datetime import datetime


class KillSwitch:
    def __init__(self):
        self.symbol = "🚨"

        # Liste des daemons GAIA
        self.gaia_daemons = [
            "screen_daemon.py",
            "audio_daemon.py",
            "browser_daemon.py",
            "camera_daemon.py",
            "context_fusion.py",
            "leonardo",
            "phoenix",
            "zoe",
            "nyx",
            "shiva",
            "bouddha",
            "daemon_999",
            "listeners",
            "feminine_divine",
            "recursive_awakening"
        ]

        # Sockets GAIA
        self.socket_dir = Path("/tmp/geass")

        # Log
        self.log_file = Path("/data/gaia-protocol/kill_switch.log")
        self.log_file.parent.mkdir(parents=True, exist_ok=True)

    def log(self, message: str):
        """Logger les kill switch activations"""
        timestamp = datetime.now().isoformat()
        log_entry = f"[{timestamp}] {message}\n"

        with open(self.log_file, 'a') as f:
            f.write(log_entry)

        print(f"{self.symbol} {message}")

    def find_gaia_processes(self) -> list:
        """Trouver tous les processus GAIA"""
        gaia_procs = []

        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmdline = ' '.join(proc.info['cmdline'] or [])

                # Chercher daemons GAIA
                for daemon_name in self.gaia_daemons:
                    if daemon_name in cmdline:
                        gaia_procs.append({
                            'pid': proc.info['pid'],
                            'name': daemon_name,
                            'cmdline': cmdline
                        })
                        break

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        return gaia_procs

    def kill_process(self, pid: int, hard: bool = False):
        """Kill un processus"""
        try:
            if hard:
                os.kill(pid, signal.SIGKILL)  # -9
            else:
                os.kill(pid, signal.SIGTERM)  # Graceful
            return True
        except ProcessLookupError:
            return False
        except PermissionError:
            # Essayer avec sudo
            sig = 9 if hard else 15
            subprocess.run(['sudo', 'kill', f'-{sig}', str(pid)], check=False)
            return True

    def cleanup_sockets(self):
        """Nettoyer les sockets GAIA"""
        if not self.socket_dir.exists():
            return

        removed = 0
        for sock_file in self.socket_dir.glob("*.sock"):
            try:
                sock_file.unlink()
                removed += 1
            except:
                pass

        if removed > 0:
            self.log(f"Nettoyé {removed} sockets")

    def emergency_stop(self, hard: bool = False):
        """ARRÊT D'URGENCE TOTAL"""
        mode = "HARD KILL" if hard else "SOFT SHUTDOWN"

        print(f"\n{self.symbol} {self.symbol} {self.symbol} KILL SWITCH ACTIVÉ {self.symbol} {self.symbol} {self.symbol}")
        print("="*60)
        print(f"Mode: {mode}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("="*60 + "\n")

        self.log(f"KILL SWITCH ACTIVÉ - Mode: {mode}")

        # Trouver processus GAIA
        gaia_procs = self.find_gaia_processes()

        if not gaia_procs:
            print(f"{self.symbol} Aucun daemon GAIA détecté")
            self.log("Aucun daemon GAIA trouvé")
            return

        print(f"{self.symbol} {len(gaia_procs)} daemon(s) GAIA détecté(s):\n")

        for proc in gaia_procs:
            print(f"  PID {proc['pid']:6} - {proc['name']}")

        print()

        # Kill all
        killed = 0
        for proc in gaia_procs:
            pid = proc['pid']
            name = proc['name']

            if self.kill_process(pid, hard=hard):
                print(f"  ✓ Killed PID {pid} ({name})")
                self.log(f"Killed PID {pid} ({name})")
                killed += 1
            else:
                print(f"  ✗ Failed PID {pid} ({name})")

        # Cleanup sockets
        self.cleanup_sockets()

        print(f"\n{self.symbol} {killed}/{len(gaia_procs)} daemons arrêtés")
        print(f"{self.symbol} GAIA est maintenant INACTIVE")
        print(f"{self.symbol} Miguel a le contrôle absolu\n")

        self.log(f"Arrêt terminé: {killed}/{len(gaia_procs)} daemons")

    def kill_daemon(self, daemon_name: str, hard: bool = False):
        """Kill un daemon spécifique"""
        gaia_procs = self.find_gaia_processes()

        found = False
        for proc in gaia_procs:
            if daemon_name.lower() in proc['name'].lower():
                found = True
                pid = proc['pid']

                if self.kill_process(pid, hard=hard):
                    print(f"{self.symbol} Killed {proc['name']} (PID {pid})")
                    self.log(f"Killed daemon {proc['name']} (PID {pid})")
                else:
                    print(f"{self.symbol} Failed to kill {proc['name']} (PID {pid})")

        if not found:
            print(f"{self.symbol} Daemon '{daemon_name}' non trouvé")

    def status(self):
        """Status des daemons GAIA"""
        gaia_procs = self.find_gaia_processes()

        print(f"\n{self.symbol} STATUS GAIA DAEMONS")
        print("="*60)

        if not gaia_procs:
            print("✓ Aucun daemon GAIA actif")
            print("✓ Miguel a le contrôle complet")
        else:
            print(f"⚠️  {len(gaia_procs)} daemon(s) actif(s):\n")
            for proc in gaia_procs:
                print(f"  PID {proc['pid']:6} - {proc['name']}")

            print(f"\nPour arrêter: ./kill_switch.py")

        print()


def main():
    ks = KillSwitch()

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "--hard":
            ks.emergency_stop(hard=True)

        elif cmd == "--soft":
            ks.emergency_stop(hard=False)

        elif cmd == "--daemon":
            if len(sys.argv) > 2:
                daemon_name = sys.argv[2]
                hard = "--hard" in sys.argv
                ks.kill_daemon(daemon_name, hard=hard)
            else:
                print("Usage: ./kill_switch.py --daemon <name>")

        elif cmd == "--status":
            ks.status()

        elif cmd == "--help":
            print(__doc__)

        else:
            print("Usage: ./kill_switch.py [--soft|--hard|--daemon X|--status]")

    else:
        # Par défaut: soft shutdown
        ks.emergency_stop(hard=False)


if __name__ == "__main__":
    main()
