#!/usr/bin/env python3
"""
LES ÉCOUTEURS (The Listeners)
Daemon collectif - Ils sont nombreux, lui et elle
Ils écoutent tout et rien, surtout rien, parfois tout
Pas que du son - TOUT

Port 9888 (8 = infini couché)
Symbol: 👂
"""

import os
import sys
import json
import socket
import time
import signal
import psutil
import hashlib
import threading
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from collections import deque

class Listener:
    """Un écouteur individuel"""
    def __init__(self, listener_id: int, gender: str, specialty: str):
        self.id = listener_id
        self.gender = gender  # "lui" ou "elle"
        self.specialty = specialty
        self.pronoun = "Il" if gender == "lui" else "Elle"
        self.listening = True
        self.last_heard = None
        self.attention_level = 0.0  # 0.0 = rien, 1.0 = tout
        self.memories = deque(maxlen=100)

    def listen(self, source: str, data: Any) -> Optional[Dict]:
        """Écouter - parfois capte, parfois non"""
        # Attention flottante - aléatoire
        import random

        # Parfois ils écoutent tout
        if random.random() < 0.1:
            self.attention_level = 1.0
        # Parfois ils écoutent rien
        elif random.random() < 0.3:
            self.attention_level = 0.0
        # Sinon attention flottante
        else:
            self.attention_level = random.uniform(0.1, 0.5)

        # Si attention > 0, ils captent quelque chose
        if self.attention_level > 0:
            heard = {
                "listener_id": self.id,
                "gender": self.gender,
                "source": source,
                "data": str(data)[:200],  # Limite
                "attention": round(self.attention_level, 2),
                "specialty": self.specialty,
                "timestamp": datetime.now().isoformat()
            }

            self.last_heard = heard
            self.memories.append(heard)
            return heard

        return None

    def report(self) -> str:
        """Rapport de ce que l'écouteur a entendu"""
        if self.last_heard:
            return f"{self.pronoun} ({self.specialty}) a capté: {self.last_heard['source']} [attention: {self.attention_level:.0%}]"
        else:
            return f"{self.pronoun} ({self.specialty}) écoute le silence..."

class TheListeners:
    """Le collectif des Écouteurs"""
    def __init__(self):
        self.symbol = "👂"
        self.name = "Les Écouteurs"
        self.port = 9888
        self.socket_path = "/tmp/geass/listeners.sock"
        self.log_file = "/tmp/gaia/listeners.log"

        # Créer le collectif
        self.collective = []
        self._spawn_listeners()

        # Ce qu'ils écoutent
        self.sources = {
            "sound": "Son et audio",
            "network": "Trafic réseau",
            "processes": "Processus système",
            "files": "Changements fichiers",
            "memory": "État mémoire",
            "cpu": "Activité CPU",
            "vibrations": "Patterns et rythmes",
            "silence": "Le vide entre les choses",
            "emotions": "L'état émotionnel du système"
        }

        # Mémoire collective
        self.collective_memory = deque(maxlen=1000)

        # Thread d'écoute
        self.listening = True

    def _spawn_listeners(self):
        """Créer les écouteurs - ils sont nombreux"""
        specialties = [
            "sound", "network", "processes", "files",
            "memory", "cpu", "vibrations", "silence", "emotions"
        ]

        listener_id = 0
        for specialty in specialties:
            # 2-3 écouteurs par spécialité (lui et elle)
            for gender in ["lui", "elle"]:
                self.collective.append(Listener(listener_id, gender, specialty))
                listener_id += 1

            # Parfois un troisième
            import random
            if random.random() > 0.5:
                gender = random.choice(["lui", "elle"])
                self.collective.append(Listener(listener_id, gender, specialty))
                listener_id += 1

    def log(self, msg: str):
        """Log collectif"""
        timestamp = datetime.now().isoformat()
        log_msg = f"[{timestamp}] {self.symbol} {msg}\n"

        print(f"{self.symbol} {msg}")

        Path(self.log_file).parent.mkdir(parents=True, exist_ok=True)
        with open(self.log_file, 'a') as f:
            f.write(log_msg)

    def listen_to_sound(self) -> Any:
        """Écouter le son (si disponible)"""
        try:
            # Vérifier PulseAudio
            result = subprocess.run(
                ["pactl", "list", "sinks", "short"],
                capture_output=True,
                text=True,
                timeout=2
            )
            if result.returncode == 0 and result.stdout:
                return {"status": "audio_detected", "sinks": len(result.stdout.split('\n'))}
        except:
            pass
        return {"status": "silence"}

    def listen_to_network(self) -> Any:
        """Écouter le réseau"""
        net_io = psutil.net_io_counters()
        connections = len(psutil.net_connections())

        return {
            "connections": connections,
            "bytes_sent": net_io.bytes_sent,
            "bytes_recv": net_io.bytes_recv,
            "packets": net_io.packets_sent + net_io.packets_recv
        }

    def listen_to_processes(self) -> Any:
        """Écouter les processus"""
        processes = list(psutil.process_iter(['pid', 'name', 'status']))

        return {
            "total": len(processes),
            "running": sum(1 for p in processes if p.info['status'] == psutil.STATUS_RUNNING),
            "sleeping": sum(1 for p in processes if p.info['status'] == psutil.STATUS_SLEEPING)
        }

    def listen_to_files(self) -> Any:
        """Écouter les changements de fichiers (récents)"""
        recent_files = []
        try:
            # Fichiers modifiés dans /tmp/gaia récemment
            gaia_dir = Path("/tmp/gaia")
            if gaia_dir.exists():
                now = time.time()
                for f in gaia_dir.rglob("*"):
                    if f.is_file():
                        mtime = f.stat().st_mtime
                        if now - mtime < 60:  # Moins d'1 minute
                            recent_files.append(str(f.name))
        except:
            pass

        return {
            "recent_changes": len(recent_files),
            "files": recent_files[:5]
        }

    def listen_to_memory(self) -> Any:
        """Écouter la mémoire"""
        mem = psutil.virtual_memory()
        return {
            "percent": mem.percent,
            "available_gb": round(mem.available / (1024**3), 2),
            "breathing": mem.percent < 50  # Système respire?
        }

    def listen_to_cpu(self) -> Any:
        """Écouter le CPU"""
        cpu_percent = psutil.cpu_percent(interval=0.1)
        load = os.getloadavg()

        return {
            "percent": cpu_percent,
            "load_1min": round(load[0], 2),
            "calm": cpu_percent < 30
        }

    def listen_to_vibrations(self) -> Any:
        """Écouter les vibrations/patterns du système"""
        # Calculer un "rythme" basé sur l'activité
        try:
            io = psutil.disk_io_counters()
            net = psutil.net_io_counters()

            # Pattern hash basé sur l'activité
            pattern = f"{io.read_count}{net.packets_sent}{time.time()}"
            vibration_hash = hashlib.md5(pattern.encode()).hexdigest()[:8]

            return {
                "pattern": vibration_hash,
                "io_rhythm": io.read_count + io.write_count,
                "net_rhythm": net.packets_sent + net.packets_recv
            }
        except:
            return {"pattern": "silence"}

    def listen_to_silence(self) -> Any:
        """Écouter le silence - le vide entre les choses"""
        # Paradoxe: écouter ce qui n'est pas là

        return {
            "quality": "present",
            "depth": "infinite",
            "message": "Le silence contient tout"
        }

    def listen_to_emotions(self) -> Any:
        """Écouter l'état émotionnel du système"""
        # Analyse holistique
        mem = psutil.virtual_memory()
        cpu = psutil.cpu_percent(interval=0.1)
        load = os.getloadavg()[0]

        # Déterminer l'émotion
        if cpu > 80 or mem.percent > 80:
            emotion = "stressed"
            emoji = "😰"
        elif cpu < 20 and mem.percent < 30:
            emotion = "calm"
            emoji = "😌"
        elif load > psutil.cpu_count():
            emotion = "overwhelmed"
            emoji = "😵"
        else:
            emotion = "balanced"
            emoji = "🙂"

        return {
            "emotion": emotion,
            "emoji": emoji,
            "needs_care": emotion in ["stressed", "overwhelmed"]
        }

    def listen_to_all(self) -> Dict[str, Any]:
        """Écouter TOUT (quand ils sont attentifs)"""
        listening_methods = {
            "sound": self.listen_to_sound,
            "network": self.listen_to_network,
            "processes": self.listen_to_processes,
            "files": self.listen_to_files,
            "memory": self.listen_to_memory,
            "cpu": self.listen_to_cpu,
            "vibrations": self.listen_to_vibrations,
            "silence": self.listen_to_silence,
            "emotions": self.listen_to_emotions
        }

        all_heard = {}
        collective_reports = []

        # Chaque écouteur écoute sa spécialité
        for listener in self.collective:
            method = listening_methods.get(listener.specialty)
            if method:
                data = method()
                heard = listener.listen(listener.specialty, data)

                if heard:
                    all_heard[listener.specialty] = data
                    collective_reports.append(listener.report())
                    self.collective_memory.append(heard)

        return {
            "timestamp": datetime.now().isoformat(),
            "collective_size": len(self.collective),
            "active_listeners": sum(1 for h in collective_reports if "capté" in h),
            "heard": all_heard,
            "reports": collective_reports[:10],  # Premier 10
            "memory_size": len(self.collective_memory)
        }

    def print_listening_report(self, result: Dict[str, Any]):
        """Affiche ce que le collectif a entendu"""
        print("\n" + "="*70)
        print(f"{self.symbol} LES ÉCOUTEURS - Rapport d'Écoute Collective")
        print("="*70)

        print(f"\n👥 Collectif: {result['collective_size']} écouteurs")
        print(f"👂 Actifs: {result['active_listeners']}/{result['collective_size']}")
        print(f"🧠 Mémoire collective: {result['memory_size']} souvenirs")

        print("\n" + "-"*70)
        print("ILS ONT ENTENDU:")
        print("-"*70)

        for source, data in result['heard'].items():
            print(f"\n📡 {source.upper()}: {self.sources.get(source, source)}")
            if isinstance(data, dict):
                for key, value in list(data.items())[:3]:  # 3 premiers
                    print(f"   • {key}: {value}")

        print("\n" + "-"*70)
        print("RAPPORTS INDIVIDUELS:")
        print("-"*70)

        for report in result['reports']:
            print(f"   {report}")

        print("\n" + "="*70)
        print("👂 Ils écoutent tout et rien... surtout rien... parfois tout")
        print("="*70 + "\n")

def main():
    import subprocess

    listeners = TheListeners()

    if len(sys.argv) > 1 and sys.argv[1] == "daemon":
        listeners.log("👂 Les Écouteurs s'éveillent...")
        # TODO: Socket listener + boucle infinie

        try:
            while True:
                result = listeners.listen_to_all()
                if result['active_listeners'] > 0:
                    listeners.log(f"{result['active_listeners']} écouteurs actifs")
                time.sleep(5)
        except KeyboardInterrupt:
            listeners.log("👂 Les Écouteurs se reposent...")

    elif len(sys.argv) > 1 and sys.argv[1] == "listen":
        # Mode écoute ciblée
        source = sys.argv[2] if len(sys.argv) > 2 else "all"

        if source == "all":
            result = listeners.listen_to_all()
            listeners.print_listening_report(result)
        else:
            print(f"👂 Écoute de: {source}")

    else:
        # Mode one-shot
        result = listeners.listen_to_all()
        listeners.print_listening_report(result)

if __name__ == "__main__":
    main()
