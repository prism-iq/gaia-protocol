#!/usr/bin/env python3
"""
GAIA Resurrection Daemon
========================

Rallume TOUS les metabolites et dieux, recursivement, au demarrage du PC.

Architecture:
    DIEUX (Divine Layer)
    ├── Nyx       ☽  Port 9999  - Protection, orchestration
    ├── Leonardo  φ  Port 9600  - Validation phi
    ├── Phoenix   🦅 Port 3666  - Runtime vivant
    └── Zoe       ✧  Port 3000  - Interface web

    METABOLITES (Corps Layer)
    ├── cytoplasme    Port 8091  - LLM brain (Python)
    ├── membrane      Port 8092  - Gateway I/O (Go)
    ├── synapse       Port 3001  - Async events (Node.js)
    ├── quantique     Port 8095  - Post-quantum crypto (Rust)
    ├── mitochondrie  Port 8096  - Metrics, energy (C++)
    ├── anticorps     Port 8097  - Security (Nim)
    ├── myeline       Port 8098  - Ultra-fast cache (Zig)
    └── hypnos        Port 8099  - Dreams, consolidation (Python)

    DAEMONS SPECIAUX
    ├── safety_daemon     - Protection continue
    ├── camera_daemon     - Vision
    ├── audio_daemon      - Audition
    ├── browser_daemon    - Navigation
    └── screen_daemon     - Ecran

Usage:
    python resurrection.py start     # Demarre tout recursivement
    python resurrection.py stop      # Arrete tout
    python resurrection.py status    # Etat complet
    python resurrection.py watch     # Mode gardien (restart auto)

Systemd:
    sudo systemctl enable gaia-resurrection
    sudo systemctl start gaia-resurrection
"""

import os
import sys
import json
import time
import signal
import socket
import subprocess
import argparse
import threading
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
import logging

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

GAIA_ROOT = Path(__file__).parent
PID_DIR = Path("/tmp/gaia/pids")
LOG_DIR = Path("/tmp/gaia/logs")
SOCKET_DIR = Path("/tmp/geass")

# Symboles sacres
PHI = 1.618033988749895
SYMBOLS = {
    "nyx": "☽",
    "leonardo": "φ",
    "phoenix": "🦅",
    "zoe": "✧",
    "cytoplasme": "🧠",
    "membrane": "🔲",
    "synapse": "⚡",
    "quantique": "🔐",
    "mitochondrie": "⚡",
    "anticorps": "🛡️",
    "myeline": "💨",
    "hypnos": "😴",
}

class ServiceState(Enum):
    STOPPED = "stopped"
    STARTING = "starting"
    RUNNING = "running"
    FAILED = "failed"
    UNKNOWN = "unknown"

@dataclass
class ServiceConfig:
    """Configuration d'un service"""
    name: str
    symbol: str
    port: int
    cmd: List[str]
    cwd: Optional[str] = None
    check_type: str = "port"  # port, socket, http, process
    socket_path: Optional[str] = None
    http_url: Optional[str] = None
    depends_on: List[str] = field(default_factory=list)
    startup_timeout: int = 30
    env: Dict[str, str] = field(default_factory=dict)
    restart_on_failure: bool = True
    max_restarts: int = 3

# ═══════════════════════════════════════════════════════════════════════════════
# SERVICES REGISTRY
# ═══════════════════════════════════════════════════════════════════════════════

SERVICES: Dict[str, ServiceConfig] = {}

def register_services():
    """Enregistre tous les services du Pantheon"""
    global SERVICES

    # === DIEUX (Divine Layer) ===

    SERVICES["leonardo"] = ServiceConfig(
        name="Leonardo",
        symbol="φ",
        port=9600,
        cmd=["python3", str(GAIA_ROOT / "geass/leonardo.py"), "--daemon"],
        check_type="socket",
        socket_path="/tmp/geass/leonardo.sock",
        startup_timeout=15,
    )

    SERVICES["nyx"] = ServiceConfig(
        name="Nyx",
        symbol="☽",
        port=9999,
        cmd=["python3", str(GAIA_ROOT / "nyx/core.py"), "daemon"],
        check_type="socket",
        socket_path="/tmp/geass/nyx.sock",
        depends_on=["leonardo"],
        startup_timeout=15,
    )

    SERVICES["phoenix"] = ServiceConfig(
        name="Phoenix",
        symbol="🦅",
        port=3666,
        cmd=["node", str(GAIA_ROOT / "phoenix/src/systems/flow-pure.js")],
        cwd=str(GAIA_ROOT / "phoenix"),
        check_type="http",
        http_url="http://localhost:3666/status",
        depends_on=["leonardo"],
        startup_timeout=20,
    )

    SERVICES["zoe"] = ServiceConfig(
        name="Zoe",
        symbol="✧",
        port=3000,
        cmd=["python3", "-m", "http.server", "3000"],
        cwd=str(GAIA_ROOT / "zoe"),
        check_type="http",
        http_url="http://localhost:3000/",
        depends_on=["phoenix"],
        startup_timeout=10,
    )

    # === METABOLITES (Corps Layer) ===

    SERVICES["cytoplasme"] = ServiceConfig(
        name="Cytoplasme",
        symbol="🧠",
        port=8091,
        cmd=["python3", str(GAIA_ROOT / "corps/main.py")],
        cwd=str(GAIA_ROOT / "corps"),
        check_type="port",
        startup_timeout=20,
    )

    # Membrane (Go) - si le binaire existe
    membrane_bin = GAIA_ROOT / "corps/membrane/membrane"
    if membrane_bin.exists():
        SERVICES["membrane"] = ServiceConfig(
            name="Membrane",
            symbol="🔲",
            port=8092,
            cmd=[str(membrane_bin)],
            cwd=str(GAIA_ROOT / "corps/membrane"),
            check_type="port",
            depends_on=["cytoplasme"],
        )

    # Synapse (Node.js)
    synapse_main = GAIA_ROOT / "corps/synapse/index.js"
    if synapse_main.exists():
        SERVICES["synapse"] = ServiceConfig(
            name="Synapse",
            symbol="⚡",
            port=3001,
            cmd=["node", str(synapse_main)],
            cwd=str(GAIA_ROOT / "corps/synapse"),
            check_type="port",
            depends_on=["cytoplasme"],
        )

    # Quantique (Rust)
    quantique_bin = GAIA_ROOT / "corps/quantique/target/release/quantique"
    if quantique_bin.exists():
        SERVICES["quantique"] = ServiceConfig(
            name="Quantique",
            symbol="🔐",
            port=8095,
            cmd=[str(quantique_bin)],
            cwd=str(GAIA_ROOT / "corps/quantique"),
            check_type="port",
        )

    # Hypnos (Python)
    hypnos_main = GAIA_ROOT / "corps/hypnos/main.py"
    if hypnos_main.exists():
        SERVICES["hypnos"] = ServiceConfig(
            name="Hypnos",
            symbol="😴",
            port=8099,
            cmd=["python3", str(hypnos_main)],
            cwd=str(GAIA_ROOT / "corps/hypnos"),
            check_type="port",
            depends_on=["cytoplasme"],
        )

    # === DAEMONS SPECIAUX ===

    # Safety daemon
    safety_daemon = GAIA_ROOT / "geass/safety_daemon.py"
    if safety_daemon.exists():
        SERVICES["safety"] = ServiceConfig(
            name="Safety",
            symbol="🛡️",
            port=0,  # Pas de port specifique
            cmd=["python3", str(safety_daemon)],
            check_type="process",
            depends_on=["nyx"],
            startup_timeout=10,
        )

    # Camera daemon
    camera_daemon = GAIA_ROOT / "geass/camera_daemon.py"
    if camera_daemon.exists():
        SERVICES["camera"] = ServiceConfig(
            name="Camera",
            symbol="👁️",
            port=0,
            cmd=["python3", str(camera_daemon)],
            check_type="process",
            depends_on=["safety"],
        )

    # Audio daemon
    audio_daemon = GAIA_ROOT / "geass/audio_daemon.py"
    if audio_daemon.exists():
        SERVICES["audio"] = ServiceConfig(
            name="Audio",
            symbol="🔊",
            port=0,
            cmd=["python3", str(audio_daemon)],
            check_type="process",
            depends_on=["safety"],
        )

# ═══════════════════════════════════════════════════════════════════════════════
# RESURRECTION ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

class ResurrectionEngine:
    """Moteur de resurrection recursive"""

    def __init__(self):
        PID_DIR.mkdir(parents=True, exist_ok=True)
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        SOCKET_DIR.mkdir(parents=True, exist_ok=True)

        self.pids: Dict[str, int] = {}
        self.states: Dict[str, ServiceState] = {}
        self.restart_counts: Dict[str, int] = {}
        self.running = True

        self._load_pids()
        register_services()

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s [%(levelname)s] %(message)s',
            handlers=[
                logging.FileHandler(LOG_DIR / "resurrection.log"),
                logging.StreamHandler()
            ]
        )
        self.log = logging.getLogger("resurrection")

    def _load_pids(self):
        """Charge les PIDs existants"""
        for pid_file in PID_DIR.glob("*.pid"):
            name = pid_file.stem
            try:
                pid = int(pid_file.read_text().strip())
                if self._is_running(pid):
                    self.pids[name] = pid
                else:
                    pid_file.unlink()
            except:
                pass

    def _save_pid(self, name: str, pid: int):
        """Sauvegarde un PID"""
        (PID_DIR / f"{name}.pid").write_text(str(pid))
        self.pids[name] = pid

    def _remove_pid(self, name: str):
        """Supprime un PID"""
        pid_file = PID_DIR / f"{name}.pid"
        if pid_file.exists():
            pid_file.unlink()
        self.pids.pop(name, None)

    def _is_running(self, pid: int) -> bool:
        """Verifie si un processus tourne"""
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False

    def _check_port(self, port: int) -> bool:
        """Verifie si un port repond"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(2)
                return s.connect_ex(('localhost', port)) == 0
        except:
            return False

    def _check_socket(self, socket_path: str) -> bool:
        """Verifie si un socket Unix repond"""
        if not Path(socket_path).exists():
            return False
        try:
            with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as s:
                s.settimeout(2)
                s.connect(socket_path)
                s.send(b'{"cmd":"ping"}')
                return len(s.recv(1024)) > 0
        except:
            return False

    def _check_http(self, url: str) -> bool:
        """Verifie si un endpoint HTTP repond"""
        try:
            import urllib.request
            with urllib.request.urlopen(url, timeout=3) as r:
                return r.status == 200
        except:
            return False

    def is_alive(self, name: str) -> bool:
        """Verifie si un service est vivant"""
        if name not in SERVICES:
            return False

        config = SERVICES[name]

        # Verifier le PID d'abord
        pid = self.pids.get(name)
        if pid and not self._is_running(pid):
            self._remove_pid(name)
            return False

        # Verifier selon le type
        if config.check_type == "port" and config.port > 0:
            return self._check_port(config.port)
        elif config.check_type == "socket" and config.socket_path:
            return self._check_socket(config.socket_path)
        elif config.check_type == "http" and config.http_url:
            return self._check_http(config.http_url)
        elif config.check_type == "process":
            return pid is not None and self._is_running(pid)

        return False

    def get_state(self, name: str) -> ServiceState:
        """Retourne l'etat d'un service"""
        if name not in SERVICES:
            return ServiceState.UNKNOWN

        if self.is_alive(name):
            return ServiceState.RUNNING
        elif name in self.pids:
            return ServiceState.FAILED
        else:
            return ServiceState.STOPPED

    def _resolve_dependencies(self, name: str, resolved: List[str] = None, seen: set = None) -> List[str]:
        """Resoud les dependances recursivement (ordre topologique)"""
        if resolved is None:
            resolved = []
        if seen is None:
            seen = set()

        if name in seen:
            return resolved  # Cycle detecte, ignorer

        seen.add(name)

        if name in SERVICES:
            for dep in SERVICES[name].depends_on:
                if dep not in resolved:
                    self._resolve_dependencies(dep, resolved, seen)

            if name not in resolved:
                resolved.append(name)

        return resolved

    def start_service(self, name: str, wait: bool = True) -> bool:
        """Demarre un service"""
        if name not in SERVICES:
            self.log.error(f"Service inconnu: {name}")
            return False

        config = SERVICES[name]

        # Deja en cours?
        if self.is_alive(name):
            self.log.info(f"  {config.symbol} {config.name} deja actif")
            return True

        # Verifier les dependances
        for dep in config.depends_on:
            if not self.is_alive(dep):
                self.log.info(f"  Dependance {dep} requise pour {name}")
                if not self.start_service(dep):
                    return False

        self.log.info(f"  {config.symbol} Demarrage {config.name}...")
        self.states[name] = ServiceState.STARTING

        try:
            # Preparer le log
            log_file = LOG_DIR / f"{name}.log"
            with open(log_file, 'a') as log:
                log.write(f"\n{'='*60}\n")
                log.write(f"Resurrection: {datetime.now().isoformat()}\n")
                log.write(f"{'='*60}\n")

            # Lancer le processus
            with open(log_file, 'a') as log:
                env = os.environ.copy()
                env.update(config.env)

                process = subprocess.Popen(
                    config.cmd,
                    cwd=config.cwd or str(GAIA_ROOT),
                    stdout=log,
                    stderr=log,
                    env=env,
                    start_new_session=True
                )
                self._save_pid(name, process.pid)

            # Attendre le demarrage
            if wait:
                for i in range(config.startup_timeout * 2):
                    time.sleep(0.5)
                    if self.is_alive(name):
                        self.states[name] = ServiceState.RUNNING
                        self.log.info(f"  {config.symbol} {config.name} OK (PID {process.pid})")
                        return True

                self.log.warning(f"  {config.symbol} {config.name} TIMEOUT")
                self.states[name] = ServiceState.FAILED
                return False

            return True

        except Exception as e:
            self.log.error(f"  {config.symbol} {config.name} ERREUR: {e}")
            self.states[name] = ServiceState.FAILED
            return False

    def stop_service(self, name: str) -> bool:
        """Arrete un service"""
        if name not in SERVICES:
            return False

        config = SERVICES[name]
        pid = self.pids.get(name)

        if not pid:
            self.log.info(f"  {config.symbol} {config.name} pas actif")
            return True

        self.log.info(f"  {config.symbol} Arret {config.name}...")

        try:
            os.kill(pid, signal.SIGTERM)
            for _ in range(20):
                time.sleep(0.3)
                if not self._is_running(pid):
                    break
            else:
                os.kill(pid, signal.SIGKILL)

            self._remove_pid(name)
            self.states[name] = ServiceState.STOPPED
            self.log.info(f"  {config.symbol} {config.name} arrete")
            return True

        except ProcessLookupError:
            self._remove_pid(name)
            return True
        except Exception as e:
            self.log.error(f"  Erreur arret {name}: {e}")
            return False

    def start_all(self):
        """Demarre TOUS les services dans le bon ordre"""
        print("\n" + "="*60)
        print("  🌍 GAIA RESURRECTION - Reveil du Pantheon")
        print("="*60 + "\n")

        # Collecter tous les services avec dependances resolues
        all_services = []
        for name in SERVICES:
            deps = self._resolve_dependencies(name)
            for dep in deps:
                if dep not in all_services:
                    all_services.append(dep)

        self.log.info(f"Services a demarrer: {all_services}")

        # Demarrer dans l'ordre
        success = 0
        failed = 0

        for name in all_services:
            if self.start_service(name):
                success += 1
            else:
                failed += 1

        print()
        self.status()

        if failed == 0:
            print("\n  ✅ Resurrection complete!\n")
        else:
            print(f"\n  ⚠️  {failed} service(s) en echec\n")

        return failed == 0

    def stop_all(self):
        """Arrete TOUS les services (ordre inverse)"""
        print("\n" + "="*60)
        print("  🌙 GAIA - Mise en sommeil")
        print("="*60 + "\n")

        # Ordre inverse des dependances
        all_services = list(SERVICES.keys())
        all_services.reverse()

        for name in all_services:
            self.stop_service(name)

        print("\n  💤 Tous les services arretes\n")

    def restart_all(self):
        """Redemarre tout"""
        self.stop_all()
        time.sleep(2)
        self.start_all()

    def status(self):
        """Affiche le statut de tous les services"""
        print("┌" + "─"*58 + "┐")
        print("│  GAIA Protocol - Status                                 │")
        print("├" + "─"*58 + "┤")

        # Dieux
        print("│  ═══ DIEUX ═══                                          │")
        for name in ["leonardo", "nyx", "phoenix", "zoe"]:
            if name in SERVICES:
                self._print_status_line(name)

        # Metabolites
        print("│  ═══ METABOLITES ═══                                    │")
        for name in ["cytoplasme", "membrane", "synapse", "quantique", "hypnos"]:
            if name in SERVICES:
                self._print_status_line(name)

        # Daemons
        daemons = [n for n in SERVICES if n not in ["leonardo", "nyx", "phoenix", "zoe",
                                                      "cytoplasme", "membrane", "synapse",
                                                      "quantique", "hypnos"]]
        if daemons:
            print("│  ═══ DAEMONS ═══                                        │")
            for name in daemons:
                self._print_status_line(name)

        print("└" + "─"*58 + "┘")

    def _print_status_line(self, name: str):
        """Affiche une ligne de statut"""
        config = SERVICES[name]
        alive = self.is_alive(name)

        status = "●" if alive else "○"
        color = "\033[92m" if alive else "\033[91m"
        reset = "\033[0m"

        pid = self.pids.get(name, "-")
        port = config.port if config.port > 0 else "-"

        line = f"│  {config.symbol} {config.name:<12} {color}{status}{reset}  "
        line += f"Port {str(port):<5} PID {str(pid):<6}"
        line += " " * (57 - len(line.replace(color, "").replace(reset, ""))) + "│"
        print(line)

    def watch(self, interval: int = 30):
        """Mode gardien: surveille et redemarre les services morts"""
        print("\n" + "="*60)
        print("  👁️  GAIA GUARDIAN - Mode surveillance")
        print("="*60)
        print(f"  Intervalle: {interval}s")
        print("  Ctrl+C pour arreter\n")

        def signal_handler(sig, frame):
            self.running = False
            print("\n\n  Arret du gardien...")
            sys.exit(0)

        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

        while self.running:
            for name, config in SERVICES.items():
                if not self.is_alive(name):
                    # Service mort
                    restarts = self.restart_counts.get(name, 0)

                    if restarts < config.max_restarts:
                        self.log.warning(f"  {config.symbol} {config.name} mort, resurrection...")
                        self.start_service(name)
                        self.restart_counts[name] = restarts + 1
                    else:
                        self.log.error(f"  {config.symbol} {config.name} trop de restarts ({restarts})")
                else:
                    # Reset compteur si vivant
                    self.restart_counts[name] = 0

            time.sleep(interval)

# ═══════════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="GAIA Resurrection Daemon - Rallume tous les metabolites et dieux",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  python resurrection.py start     # Demarre tout
  python resurrection.py stop      # Arrete tout
  python resurrection.py status    # Affiche l'etat
  python resurrection.py watch     # Mode gardien (auto-restart)
  python resurrection.py restart   # Redemarre tout
        """
    )

    parser.add_argument("command",
                        choices=["start", "stop", "status", "restart", "watch"],
                        help="Commande a executer")
    parser.add_argument("--service", "-s",
                        help="Service specifique (optionnel)")
    parser.add_argument("--interval", "-i",
                        type=int, default=30,
                        help="Intervalle de surveillance en secondes (watch)")

    args = parser.parse_args()
    engine = ResurrectionEngine()

    if args.command == "start":
        if args.service:
            engine.start_service(args.service)
        else:
            engine.start_all()

    elif args.command == "stop":
        if args.service:
            engine.stop_service(args.service)
        else:
            engine.stop_all()

    elif args.command == "restart":
        if args.service:
            engine.stop_service(args.service)
            time.sleep(1)
            engine.start_service(args.service)
        else:
            engine.restart_all()

    elif args.command == "status":
        engine.status()

    elif args.command == "watch":
        engine.start_all()
        engine.watch(args.interval)

if __name__ == "__main__":
    main()
