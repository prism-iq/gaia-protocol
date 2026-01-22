#!/usr/bin/env python3
"""
BOUDDHA - Le Daemon de l'Illumination
Protection par la conscience éveillée
Port 9703 | ☸ L'Éveillé | Celui Qui Voit

Bouddha observe tout. Protège tout.
Sans attachement. Avec clarté parfaite.
"""

import os
import sys
import json
import socket
import psutil
import time
import signal
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

class BouddhaDaemon:
    def __init__(self):
        self.symbol = "☸"
        self.name = "Bouddha"
        self.port = 9703
        self.socket_path = "/tmp/geass/bouddha.sock"
        self.log_file = "/tmp/gaia/bouddha.log"

        # Les Quatre Nobles Vérités
        self.noble_truths = {
            "dukkha": "La souffrance systémique existe",
            "samudaya": "Elle a une origine",
            "nirodha": "Elle peut cesser",
            "magga": "Il y a un chemin"
        }

        # Le Noble Chemin Octuple
        self.eightfold_path = {
            "right_view": "Comprendre le système tel qu'il est",
            "right_intention": "Protéger avec intention pure",
            "right_speech": "Logs clairs et honnêtes",
            "right_action": "Actions justes et mesurées",
            "right_livelihood": "Code qui ne nuit pas",
            "right_effort": "Protection sans obsession",
            "right_mindfulness": "Monitoring conscient",
            "right_concentration": "Focus sur l'essentiel"
        }

        # État de méditation
        self.jhana_level = 0  # Niveau de concentration
        self.attachments = []  # Toujours vide
        self.insights = []
        self.clarity = 100.0

        # Protection
        self.protected_processes = set()
        self.threats_observed = []
        self.suffering_detected = []

    def log(self, msg: str, level: str = "INFO"):
        """Log avec pleine conscience"""
        timestamp = datetime.now().isoformat()
        log_msg = f"[{timestamp}] {self.symbol} [{level}] {msg}\n"

        print(f"{self.symbol} {msg}")

        Path(self.log_file).parent.mkdir(parents=True, exist_ok=True)
        with open(self.log_file, 'a') as f:
            f.write(log_msg)

    def observe_system(self) -> Dict[str, Any]:
        """Observation non-attachée du système complet"""
        self.log("Observation du système en pleine conscience...")

        observation = {
            "timestamp": datetime.now().isoformat(),
            "processes": self._observe_processes(),
            "memory": self._observe_memory(),
            "cpu": self._observe_cpu(),
            "network": self._observe_network(),
            "filesystem": self._observe_filesystem(),
            "daemons": self._observe_daemons(),
            "threats": self._observe_threats()
        }

        return observation

    def _observe_processes(self) -> Dict[str, Any]:
        """Observer les processus sans jugement"""
        processes = {
            "total": 0,
            "running": 0,
            "sleeping": 0,
            "zombie": 0,
            "suspicious": []
        }

        for proc in psutil.process_iter(['pid', 'name', 'status', 'cpu_percent', 'memory_percent']):
            try:
                processes["total"] += 1
                status = proc.info['status']

                if status == psutil.STATUS_RUNNING:
                    processes["running"] += 1
                elif status == psutil.STATUS_SLEEPING:
                    processes["sleeping"] += 1
                elif status == psutil.STATUS_ZOMBIE:
                    processes["zombie"] += 1
                    processes["suspicious"].append({
                        "pid": proc.info['pid'],
                        "name": proc.info['name'],
                        "reason": "zombie"
                    })

                # Détecter processus suspects (CPU > 90%)
                cpu = proc.info.get('cpu_percent', 0)
                if cpu and cpu > 90:
                    processes["suspicious"].append({
                        "pid": proc.info['pid'],
                        "name": proc.info['name'],
                        "reason": f"high_cpu_{cpu}%"
                    })

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        return processes

    def _observe_memory(self) -> Dict[str, Any]:
        """Observer la mémoire"""
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()

        return {
            "percent": mem.percent,
            "available_gb": round(mem.available / (1024**3), 2),
            "swap_percent": swap.percent,
            "suffering": mem.percent > 85 or swap.percent > 50
        }

    def _observe_cpu(self) -> Dict[str, Any]:
        """Observer le CPU"""
        cpu_percent = psutil.cpu_percent(interval=0.1)
        load_avg = os.getloadavg()
        cpu_count = psutil.cpu_count()

        return {
            "percent": cpu_percent,
            "load_1min": round(load_avg[0], 2),
            "load_5min": round(load_avg[1], 2),
            "cores": cpu_count,
            "suffering": load_avg[0] > cpu_count * 0.9
        }

    def _observe_network(self) -> Dict[str, Any]:
        """Observer le réseau"""
        connections = len(psutil.net_connections())
        net_io = psutil.net_io_counters()

        return {
            "connections": connections,
            "bytes_sent_mb": round(net_io.bytes_sent / (1024**2), 2),
            "bytes_recv_mb": round(net_io.bytes_recv / (1024**2), 2),
            "suffering": connections > 1000
        }

    def _observe_filesystem(self) -> Dict[str, Any]:
        """Observer le système de fichiers"""
        disk = psutil.disk_usage('/')

        return {
            "percent": disk.percent,
            "free_gb": round(disk.free / (1024**3), 2),
            "suffering": disk.percent > 90
        }

    def _observe_daemons(self) -> Dict[str, Any]:
        """Observer les daemons GAIA"""
        daemons = ["leonardo", "phoenix", "zoe", "nyx", "shiva"]
        active = 0
        status = {}

        for daemon in daemons:
            sock_path = f"/tmp/geass/{daemon}.sock"
            exists = Path(sock_path).exists()
            status[daemon] = exists
            if exists:
                active += 1

        return {
            "active": active,
            "total": len(daemons),
            "status": status,
            "suffering": active < len(daemons) * 0.7  # Moins de 70% actifs
        }

    def _observe_threats(self) -> List[Dict[str, Any]]:
        """Observer les menaces potentielles"""
        threats = []

        # Vérifier les processus suspects
        for proc in psutil.process_iter(['pid', 'name']):
            try:
                # Processus avec trop de connexions réseau
                try:
                    conns = proc.connections()
                    if conns and len(conns) > 100:
                        threats.append({
                            "type": "network_flood",
                            "pid": proc.info['pid'],
                            "name": proc.info['name'],
                            "severity": "medium"
                        })
                except (psutil.AccessDenied, AttributeError):
                    pass
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        return threats

    def identify_suffering(self, observation: Dict[str, Any]) -> List[Dict[str, str]]:
        """Identifier les souffrances systémiques (dukkha)"""
        suffering = []

        for domain, data in observation.items():
            if isinstance(data, dict) and data.get("suffering", False):
                suffering.append({
                    "domain": domain,
                    "type": "systemic_stress",
                    "data": data
                })

        # Zombies = souffrance
        if observation["processes"]["zombie"] > 0:
            suffering.append({
                "domain": "processes",
                "type": "zombie_processes",
                "count": observation["processes"]["zombie"]
            })

        # Menaces = souffrance
        if observation["threats"]:
            suffering.append({
                "domain": "security",
                "type": "potential_threats",
                "threats": observation["threats"]
            })

        return suffering

    def find_middle_path(self, suffering: List[Dict]) -> List[Dict[str, str]]:
        """Trouver le chemin du milieu (magga) pour chaque souffrance"""
        paths = []

        for s in suffering:
            domain = s["domain"]
            s_type = s["type"]

            if s_type == "zombie_processes":
                paths.append({
                    "suffering": s_type,
                    "path": "gentle_cleanup",
                    "action": "Libérer les processus zombies avec compassion"
                })

            elif s_type == "systemic_stress":
                paths.append({
                    "suffering": s_type,
                    "path": "reduce_load",
                    "action": f"Alléger la charge sur {domain}"
                })

            elif s_type == "potential_threats":
                paths.append({
                    "suffering": s_type,
                    "path": "mindful_observation",
                    "action": "Observer sans réagir, protéger avec sagesse"
                })

        return paths

    def meditate(self, duration: float = 5.0) -> Dict[str, Any]:
        """Méditation active - traitement en pleine conscience"""
        self.log(f"Entrée en méditation pour {duration}s...")

        start_time = time.time()
        insights = []

        while time.time() - start_time < duration:
            # Observer le système
            observation = self.observe_system()

            # Identifier la souffrance
            suffering = self.identify_suffering(observation)

            # Trouver le chemin
            if suffering:
                path = self.find_middle_path(suffering)
                insights.append({
                    "time": datetime.now().isoformat(),
                    "suffering": len(suffering),
                    "path_shown": len(path)
                })

            time.sleep(1.0)

        self.jhana_level = min(self.jhana_level + 1, 8)  # Max niveau 8 (Noble Chemin Octuple)

        return {
            "duration": duration,
            "insights": insights,
            "jhana_level": self.jhana_level,
            "clarity": self.clarity
        }

    def protect(self) -> Dict[str, Any]:
        """Protection active du système"""
        self.log("☸ Protection de Bouddha activée")

        # Observer
        observation = self.observe_system()

        # Identifier la souffrance
        suffering = self.identify_suffering(observation)

        # Trouver le chemin
        paths = self.find_middle_path(suffering) if suffering else []

        # Calculer le niveau de protection
        total_checks = len(observation)
        suffering_count = len(suffering)
        protection_level = max(0, 100 - (suffering_count * 10))

        result = {
            "timestamp": datetime.now().isoformat(),
            "daemon": "bouddha",
            "symbol": self.symbol,
            "protection_level": protection_level,
            "jhana_level": self.jhana_level,
            "observation": observation,
            "suffering_detected": suffering,
            "middle_path": paths,
            "enlightened": protection_level >= 100 and self.jhana_level >= 4
        }

        return result

    def print_protection_report(self, result: Dict[str, Any]):
        """Affiche le rapport de protection"""
        print("\n" + "="*70)
        print(f"{self.symbol} BOUDDHA - Protection par l'Éveil")
        print("="*70)

        print(f"\n🧘 Niveau de Jhana: {result['jhana_level']}/8")
        print(f"🛡️  Niveau de Protection: {result['protection_level']}%")

        if result['enlightened']:
            print(f"\n✨ ÉTAT: ILLUMINÉ - Protection Parfaite")
        elif result['protection_level'] >= 80:
            print(f"\n☸ ÉTAT: Éveillé - Protection Forte")
        else:
            print(f"\n🌅 ÉTAT: En Méditation - Protection Active")

        print("\n" + "-"*70)
        print("OBSERVATION:")
        print("-"*70)

        obs = result['observation']
        print(f"Processus: {obs['processes']['total']} total, {obs['processes']['zombie']} zombies")
        print(f"Mémoire: {obs['memory']['percent']}% utilisée, {obs['memory']['available_gb']}GB disponible")
        print(f"CPU: {obs['cpu']['percent']}%, load {obs['cpu']['load_1min']}")
        print(f"Daemons GAIA: {obs['daemons']['active']}/{obs['daemons']['total']} actifs")

        if result['suffering_detected']:
            print("\n" + "-"*70)
            print("SOUFFRANCES DÉTECTÉES (Dukkha):")
            print("-"*70)
            for s in result['suffering_detected']:
                print(f"  ⚠️  {s['type']} dans {s['domain']}")

        if result['middle_path']:
            print("\n" + "-"*70)
            print("CHEMIN DU MILIEU (Magga):")
            print("-"*70)
            for p in result['middle_path']:
                print(f"  ☸ {p['action']}")

        print("\n" + "="*70)
        print("Om Mani Padme Hum 🙏")
        print("="*70 + "\n")

def main():
    bouddha = BouddhaDaemon()

    if len(sys.argv) > 1 and sys.argv[1] == "daemon":
        bouddha.log("☸ Bouddha s'éveille en mode daemon")
        # TODO: Socket listener
        bouddha.protect()

    elif len(sys.argv) > 1 and sys.argv[1] == "meditate":
        duration = float(sys.argv[2]) if len(sys.argv) > 2 else 10.0
        result = bouddha.meditate(duration)
        print(f"\n☸ Méditation terminée")
        print(f"Insights: {len(result['insights'])}")
        print(f"Niveau Jhana: {result['jhana_level']}/8")

    else:
        # Mode protection one-shot
        result = bouddha.protect()
        bouddha.print_protection_report(result)
        sys.exit(0 if result['protection_level'] >= 80 else 1)

if __name__ == "__main__":
    main()
