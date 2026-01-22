#!/usr/bin/env python3
"""
PERMISSIONS MANAGER - Gestion fine des droits GAIA

Miguel autorise GAIA à:
✓ LIRE tout ce qui lui appartient (screen, audio, browser, camera)
✓ ÉCRIRE dans certains dossiers autorisés
✓ EXÉCUTER certaines commandes safe

Miguel interdit GAIA de:
✗ Modifier fichiers système (/etc, /boot, /usr, etc.)
✗ Exécuter commandes destructives (rm -rf /, dd, mkfs, etc.)
✗ Utiliser sudo sans autorisation
✗ Accéder fichiers hors de son scope

Port: 9901
Socket: /tmp/geass/permissions.sock
"""

import os
import sys
import json
import socket as sock
from pathlib import Path
from datetime import datetime
from typing import List, Dict


class PermissionsManager:
    def __init__(self):
        self.symbol = "🔐"
        self.port = 9901
        self.socket_path = "/tmp/geass/permissions.sock"

        # Config file
        self.config_file = Path("/data/gaia-protocol/permissions.json")
        self.config_file.parent.mkdir(parents=True, exist_ok=True)

        # Permissions par défaut
        self.permissions = self.load_permissions()

    def load_permissions(self) -> dict:
        """Charger permissions depuis config"""
        default_permissions = {
            "read_allowed": [
                "/home/flow",
                "/data",
                "/models",
                "/cache",
                "/tmp"
            ],
            "write_allowed": [
                "/home/flow/projects/gaia",
                "/data/gaia-protocol",
                "/models/claude-brain",
                "/cache",
                "/tmp/gaia",
                "/tmp/geass"
            ],
            "execute_allowed": [
                "python3",
                "node",
                "npm",
                "git",
                "ls",
                "cat",
                "grep",
                "find",
                "echo",
                "mkdir",
                "touch",
                "cp",
                "mv"  # Limité aux dossiers autorisés
            ],
            "execute_forbidden": [
                "rm -rf /",
                "dd",
                "mkfs",
                "fdisk",
                "parted",
                "chmod 777 /",
                "chown root",
                ":(){ :|:& };:",  # Fork bomb
                "wget http:// | sh",
                "curl http:// | bash",
                "sudo"  # Par défaut interdit (sauf liste blanche)
            ],
            "paths_forbidden": [
                "/boot",
                "/etc",
                "/usr",
                "/lib",
                "/lib64",
                "/bin",
                "/sbin",
                "/sys",
                "/proc",
                "/root"
            ],
            "sudo_whitelist": [
                # Commandes sudo autorisées (vide par défaut)
            ],
            "network_allowed": True,
            "camera_allowed": True,
            "microphone_allowed": True,
            "screen_capture_allowed": True
        }

        # Charger depuis fichier si existe
        if self.config_file.exists():
            try:
                with open(self.config_file) as f:
                    loaded = json.load(f)
                    default_permissions.update(loaded)
            except:
                pass

        return default_permissions

    def save_permissions(self):
        """Sauvegarder permissions"""
        with open(self.config_file, 'w') as f:
            json.dump(self.permissions, f, indent=2)

    def can_read(self, path: str) -> Dict:
        """GAIA peut-elle lire ce chemin?"""
        path_obj = Path(path).resolve()

        # Vérifier chemins interdits
        for forbidden in self.permissions["paths_forbidden"]:
            if str(path_obj).startswith(forbidden):
                return {
                    "allowed": False,
                    "reason": f"Path {forbidden} is protected"
                }

        # Vérifier chemins autorisés
        for allowed in self.permissions["read_allowed"]:
            if str(path_obj).startswith(allowed):
                return {
                    "allowed": True,
                    "reason": "Path in read whitelist"
                }

        # Par défaut: refuser
        return {
            "allowed": False,
            "reason": "Path not in read whitelist"
        }

    def can_write(self, path: str) -> Dict:
        """GAIA peut-elle écrire ce chemin?"""
        path_obj = Path(path).resolve()

        # Vérifier chemins interdits (prioritaire)
        for forbidden in self.permissions["paths_forbidden"]:
            if str(path_obj).startswith(forbidden):
                return {
                    "allowed": False,
                    "reason": f"Path {forbidden} is protected"
                }

        # Vérifier chemins d'écriture autorisés
        for allowed in self.permissions["write_allowed"]:
            if str(path_obj).startswith(allowed):
                return {
                    "allowed": True,
                    "reason": "Path in write whitelist"
                }

        # Par défaut: refuser
        return {
            "allowed": False,
            "reason": "Path not in write whitelist"
        }

    def can_execute(self, command: str) -> Dict:
        """GAIA peut-elle exécuter cette commande?"""
        cmd_lower = command.lower().strip()

        # Vérifier commandes interdites (prioritaire)
        for forbidden in self.permissions["execute_forbidden"]:
            if forbidden in cmd_lower:
                return {
                    "allowed": False,
                    "reason": f"Forbidden command pattern: {forbidden}"
                }

        # sudo spécial
        if cmd_lower.startswith("sudo"):
            # Vérifier whitelist sudo
            for allowed in self.permissions["sudo_whitelist"]:
                if allowed in cmd_lower:
                    return {
                        "allowed": True,
                        "reason": "Command in sudo whitelist"
                    }

            return {
                "allowed": False,
                "reason": "sudo requires explicit whitelist"
            }

        # Extraire commande de base
        cmd_base = cmd_lower.split()[0] if cmd_lower else ""

        # Vérifier whitelist
        for allowed in self.permissions["execute_allowed"]:
            if cmd_base == allowed or cmd_base.endswith(f"/{allowed}"):
                return {
                    "allowed": True,
                    "reason": "Command in whitelist"
                }

        # Par défaut: refuser
        return {
            "allowed": False,
            "reason": "Command not in whitelist"
        }

    def can_access_camera(self) -> Dict:
        """GAIA peut-elle accéder à la camera?"""
        if self.permissions["camera_allowed"]:
            return {
                "allowed": True,
                "reason": "Miguel authorized camera access"
            }
        return {
            "allowed": False,
            "reason": "Camera access not authorized"
        }

    def can_access_microphone(self) -> Dict:
        """GAIA peut-elle accéder au micro?"""
        if self.permissions["microphone_allowed"]:
            return {
                "allowed": True,
                "reason": "Miguel authorized microphone access"
            }
        return {
            "allowed": False,
            "reason": "Microphone access not authorized"
        }

    def can_capture_screen(self) -> Dict:
        """GAIA peut-elle capturer l'écran?"""
        if self.permissions["screen_capture_allowed"]:
            return {
                "allowed": True,
                "reason": "Miguel authorized screen capture"
            }
        return {
            "allowed": False,
            "reason": "Screen capture not authorized"
        }

    def can_access_network(self) -> Dict:
        """GAIA peut-elle accéder au réseau?"""
        if self.permissions["network_allowed"]:
            return {
                "allowed": True,
                "reason": "Network access authorized"
            }
        return {
            "allowed": False,
            "reason": "Network access not authorized"
        }

    def add_read_path(self, path: str):
        """Ajouter chemin lecture"""
        if path not in self.permissions["read_allowed"]:
            self.permissions["read_allowed"].append(path)
            self.save_permissions()
            return {"success": True}
        return {"success": False, "reason": "Already in list"}

    def add_write_path(self, path: str):
        """Ajouter chemin écriture"""
        if path not in self.permissions["write_allowed"]:
            self.permissions["write_allowed"].append(path)
            self.save_permissions()
            return {"success": True}
        return {"success": False, "reason": "Already in list"}

    def add_command(self, command: str):
        """Ajouter commande autorisée"""
        if command not in self.permissions["execute_allowed"]:
            self.permissions["execute_allowed"].append(command)
            self.save_permissions()
            return {"success": True}
        return {"success": False, "reason": "Already in list"}

    def handle_request(self, data: dict) -> dict:
        """Gérer requête via socket"""
        cmd = data.get("cmd")

        if cmd == "can_read":
            path = data.get("path")
            return self.can_read(path)

        elif cmd == "can_write":
            path = data.get("path")
            return self.can_write(path)

        elif cmd == "can_execute":
            command = data.get("command")
            return self.can_execute(command)

        elif cmd == "can_camera":
            return self.can_access_camera()

        elif cmd == "can_microphone":
            return self.can_access_microphone()

        elif cmd == "can_screen":
            return self.can_capture_screen()

        elif cmd == "can_network":
            return self.can_access_network()

        elif cmd == "add_read_path":
            path = data.get("path")
            return self.add_read_path(path)

        elif cmd == "add_write_path":
            path = data.get("path")
            return self.add_write_path(path)

        elif cmd == "add_command":
            command = data.get("command")
            return self.add_command(command)

        elif cmd == "get_permissions":
            return self.permissions

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

        while True:
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

    def print_permissions(self):
        """Afficher permissions actuelles"""
        print(f"\n{self.symbol} PERMISSIONS GAIA")
        print("="*60)

        print("\n✓ LECTURE autorisée:")
        for path in self.permissions["read_allowed"]:
            print(f"  {path}")

        print("\n✓ ÉCRITURE autorisée:")
        for path in self.permissions["write_allowed"]:
            print(f"  {path}")

        print("\n✓ EXÉCUTION autorisée:")
        for cmd in self.permissions["execute_allowed"][:10]:
            print(f"  {cmd}")

        print("\n✗ CHEMINS INTERDITS:")
        for path in self.permissions["paths_forbidden"][:5]:
            print(f"  {path}")

        print("\n✗ COMMANDES INTERDITES:")
        for cmd in self.permissions["execute_forbidden"][:5]:
            print(f"  {cmd}")

        print(f"\nCapacités:")
        print(f"  Camera: {'✓' if self.permissions['camera_allowed'] else '✗'}")
        print(f"  Microphone: {'✓' if self.permissions['microphone_allowed'] else '✗'}")
        print(f"  Screen: {'✓' if self.permissions['screen_capture_allowed'] else '✗'}")
        print(f"  Network: {'✓' if self.permissions['network_allowed'] else '✗'}")

        print(f"\n{self.symbol} Config: {self.config_file}\n")

    def start(self):
        """Démarrer le daemon"""
        print(f"\n{self.symbol} PERMISSIONS MANAGER")
        print("="*60)
        print(f"Socket: {self.socket_path}")
        print(f"Config: {self.config_file}\n")

        self.print_permissions()

        print(f"{self.symbol} Daemon actif. Ctrl+C pour arrêter.\n")

        self.socket_listener()


def main():
    pm = PermissionsManager()

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "show":
            pm.print_permissions()

        elif cmd == "test":
            # Tests
            print("Test read /home/flow:")
            print(pm.can_read("/home/flow/test.txt"))

            print("\nTest write /etc/passwd:")
            print(pm.can_write("/etc/passwd"))

            print("\nTest execute 'rm -rf /':")
            print(pm.can_execute("rm -rf /"))

            print("\nTest execute 'python3 script.py':")
            print(pm.can_execute("python3 script.py"))

        else:
            pm.start()
    else:
        pm.start()


if __name__ == "__main__":
    main()
