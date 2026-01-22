#!/usr/bin/env python3
"""
GAIA Protocol - Unified Launcher

Orchestre tous les daemons du Panthéon:
- Leonardo (φ validation) - Port 9600
- Phoenix (runtime vivant) - Port 3666
- Zoe (interface web) - Port 3000
- Nyx (protection) - Port 9999

Usage:
    python gaia.py start      # Démarre tout
    python gaia.py stop       # Arrête tout
    python gaia.py status     # État des daemons
    python gaia.py restart    # Redémarre tout
"""

import os
import sys
import json
import time
import signal
import socket
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

# Paths
GAIA_ROOT = Path(__file__).parent
GEASS_DIR = GAIA_ROOT / "geass"
PHOENIX_DIR = GAIA_ROOT / "phoenix"
ZOE_DIR = GAIA_ROOT / "zoe"
NYX_DIR = GAIA_ROOT / "nyx"
PID_DIR = Path("/tmp/gaia")
LOG_DIR = Path("/tmp/gaia/logs")

# Constants
PHI = 1.618033988749895

# Daemon configurations
DAEMONS = {
    "leonardo": {
        "name": "Leonardo",
        "symbol": "φ",
        "port": 9600,
        "cmd": ["python3", str(GEASS_DIR / "leonardo.py"), "--daemon"],
        "check": "socket",
        "socket": "/tmp/geass/leonardo.sock"
    },
    "phoenix": {
        "name": "Phoenix",
        "symbol": "🦅",
        "port": 3666,
        "cmd": ["node", str(PHOENIX_DIR / "src/systems/flow-pure.js")],
        "check": "http",
        "url": "http://localhost:3666/status"
    },
    "zoe": {
        "name": "Zoe",
        "symbol": "✧",
        "port": 3000,
        "cmd": ["python3", "-m", "http.server", "3000"],
        "cwd": str(ZOE_DIR),
        "check": "http",
        "url": "http://localhost:3000/"
    },
    "nyx": {
        "name": "Nyx",
        "symbol": "☽",
        "port": 9999,
        "cmd": ["python3", str(NYX_DIR / "core.py"), "daemon"],
        "check": "socket",
        "socket": "/tmp/geass/nyx.sock"
    }
}


class Gaia:
    """GAIA Protocol orchestrator"""

    def __init__(self):
        PID_DIR.mkdir(parents=True, exist_ok=True)
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        self.pids = {}
        self._load_pids()

    def _load_pids(self):
        """Load PIDs from files"""
        for name in DAEMONS:
            pid_file = PID_DIR / f"{name}.pid"
            if pid_file.exists():
                try:
                    pid = int(pid_file.read_text().strip())
                    if self._is_running(pid):
                        self.pids[name] = pid
                    else:
                        pid_file.unlink()
                except:
                    pass

    def _save_pid(self, name: str, pid: int):
        """Save PID to file"""
        pid_file = PID_DIR / f"{name}.pid"
        pid_file.write_text(str(pid))
        self.pids[name] = pid

    def _remove_pid(self, name: str):
        """Remove PID file"""
        pid_file = PID_DIR / f"{name}.pid"
        if pid_file.exists():
            pid_file.unlink()
        if name in self.pids:
            del self.pids[name]

    def _is_running(self, pid: int) -> bool:
        """Check if process is running"""
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False

    def _check_port(self, port: int) -> bool:
        """Check if port is in use"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                result = s.connect_ex(('localhost', port))
                return result == 0
        except:
            return False

    def _check_socket(self, socket_path: str) -> bool:
        """Check if Unix socket exists and responds"""
        if not Path(socket_path).exists():
            return False
        try:
            with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                s.connect(socket_path)
                s.send(json.dumps({"cmd": "status"}).encode())
                response = s.recv(1024)
                return len(response) > 0
        except:
            return False

    def _check_http(self, url: str) -> bool:
        """Check if HTTP endpoint responds"""
        try:
            import urllib.request
            req = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(req, timeout=2) as response:
                return response.status == 200
        except:
            return False

    def is_alive(self, name: str) -> bool:
        """Check if daemon is alive"""
        config = DAEMONS.get(name)
        if not config:
            return False

        # Check PID first
        if name in self.pids and not self._is_running(self.pids[name]):
            self._remove_pid(name)
            return False

        # Check service
        check_type = config.get("check", "port")
        if check_type == "socket":
            return self._check_socket(config["socket"])
        elif check_type == "http":
            return self._check_http(config["url"])
        else:
            return self._check_port(config["port"])

    def start_daemon(self, name: str) -> bool:
        """Start a single daemon"""
        if name not in DAEMONS:
            print(f"Unknown daemon: {name}")
            return False

        config = DAEMONS[name]

        if self.is_alive(name):
            print(f"  {config['symbol']} {config['name']} already running")
            return True

        print(f"  {config['symbol']} Starting {config['name']}...", end=" ", flush=True)

        try:
            log_file = LOG_DIR / f"{name}.log"
            with open(log_file, 'a') as log:
                log.write(f"\n--- Start {datetime.now().isoformat()} ---\n")

            with open(log_file, 'a') as log:
                cwd = config.get("cwd", str(GAIA_ROOT))
                process = subprocess.Popen(
                    config["cmd"],
                    cwd=cwd,
                    stdout=log,
                    stderr=log,
                    start_new_session=True
                )
                self._save_pid(name, process.pid)

            # Wait for startup
            for _ in range(10):
                time.sleep(0.5)
                if self.is_alive(name):
                    print("OK")
                    return True

            print("TIMEOUT")
            return False

        except Exception as e:
            print(f"FAILED ({e})")
            return False

    def stop_daemon(self, name: str) -> bool:
        """Stop a single daemon"""
        if name not in DAEMONS:
            return False

        config = DAEMONS[name]
        print(f"  {config['symbol']} Stopping {config['name']}...", end=" ", flush=True)

        pid = self.pids.get(name)
        if not pid:
            print("not running")
            return True

        try:
            os.kill(pid, signal.SIGTERM)
            for _ in range(10):
                time.sleep(0.3)
                if not self._is_running(pid):
                    break
            else:
                os.kill(pid, signal.SIGKILL)

            self._remove_pid(name)
            print("OK")
            return True
        except ProcessLookupError:
            self._remove_pid(name)
            print("OK")
            return True
        except Exception as e:
            print(f"FAILED ({e})")
            return False

    def start_all(self):
        """Start all daemons"""
        print("\n🌍 GAIA Protocol - Starting...\n")

        success = True
        for name in DAEMONS:
            if not self.start_daemon(name):
                success = False

        print()
        self.status()
        return success

    def stop_all(self):
        """Stop all daemons"""
        print("\n🌍 GAIA Protocol - Stopping...\n")

        for name in reversed(list(DAEMONS.keys())):
            self.stop_daemon(name)

        print("\n✓ All daemons stopped\n")

    def restart_all(self):
        """Restart all daemons"""
        self.stop_all()
        time.sleep(1)
        self.start_all()

    def status(self):
        """Show status of all daemons"""
        print("┌─────────────────────────────────────────┐")
        print("│  GAIA Protocol - Status                 │")
        print("├─────────────────────────────────────────┤")

        all_alive = True
        for name, config in DAEMONS.items():
            alive = self.is_alive(name)
            status = "●" if alive else "○"
            color = "\033[92m" if alive else "\033[91m"
            reset = "\033[0m"
            pid = self.pids.get(name, "-")

            print(f"│  {config['symbol']} {config['name']:<12} {color}{status}{reset}  Port {config['port']:<5} PID {pid:<6} │")

            if not alive:
                all_alive = False

        print("├─────────────────────────────────────────┤")
        if all_alive:
            print("│  ✓ All systems operational              │")
        else:
            print("│  ⚠ Some systems offline                 │")
        print("└─────────────────────────────────────────┘")
        print()

        if all_alive:
            print("  Zoe Dashboard: http://localhost:3000")
            print("  Phoenix API:   http://localhost:3666")
            print("  Leonardo:      /tmp/geass/leonardo.sock")
            print()

    def logs(self, name: str = None, follow: bool = False):
        """Show logs"""
        if name:
            log_file = LOG_DIR / f"{name}.log"
            if log_file.exists():
                if follow:
                    os.system(f"tail -f {log_file}")
                else:
                    print(log_file.read_text()[-5000:])
        else:
            for n in DAEMONS:
                log_file = LOG_DIR / f"{n}.log"
                if log_file.exists():
                    print(f"\n=== {n} ===")
                    print(log_file.read_text()[-1000:])


def main():
    parser = argparse.ArgumentParser(description="GAIA Protocol Launcher")
    parser.add_argument("command", choices=["start", "stop", "status", "restart", "logs"],
                        help="Command to execute")
    parser.add_argument("--daemon", "-d", help="Specific daemon")
    parser.add_argument("--follow", "-f", action="store_true", help="Follow logs")

    args = parser.parse_args()
    gaia = Gaia()

    if args.command == "start":
        if args.daemon:
            gaia.start_daemon(args.daemon)
        else:
            gaia.start_all()

    elif args.command == "stop":
        if args.daemon:
            gaia.stop_daemon(args.daemon)
        else:
            gaia.stop_all()

    elif args.command == "restart":
        if args.daemon:
            gaia.stop_daemon(args.daemon)
            time.sleep(0.5)
            gaia.start_daemon(args.daemon)
        else:
            gaia.restart_all()

    elif args.command == "status":
        gaia.status()

    elif args.command == "logs":
        gaia.logs(args.daemon, args.follow)


if __name__ == "__main__":
    main()
