#!/usr/bin/env python3
"""
USB Guardian - Daemon de vérification des périphériques USB
Vérifie que tout ce qui se branche est open source
Compile et sandbox les binaires si nécessaire

Port: 9604
Symbole: 🔌
"""

import os
import sys
import json
import hashlib
import subprocess
import socket
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

class USBGuardian:
    def __init__(self):
        self.symbol = "🔌"
        self.name = "USB Guardian"
        self.port = 9604
        self.socket_path = "/tmp/geass/usb_guardian.sock"
        self.log_file = "/tmp/gaia/usb_guardian.log"
        self.quarantine_dir = Path("/tmp/gaia/quarantine")
        self.allowed_dir = Path("/tmp/gaia/usb_allowed")
        self.sandbox_dir = Path("/tmp/gaia/sandbox")

        # Créer les répertoires
        self.quarantine_dir.mkdir(parents=True, exist_ok=True)
        self.allowed_dir.mkdir(parents=True, exist_ok=True)
        self.sandbox_dir.mkdir(parents=True, exist_ok=True)

    def log(self, msg: str):
        """Log avec timestamp"""
        timestamp = datetime.now().isoformat()
        log_msg = f"[{timestamp}] {self.symbol} {msg}\n"
        print(log_msg.strip())

        with open(self.log_file, 'a') as f:
            f.write(log_msg)

    def get_usb_devices(self) -> List[Dict]:
        """Liste les périphériques USB connectés"""
        devices = []

        try:
            result = subprocess.run(
                ["lsusb"],
                capture_output=True,
                text=True,
                timeout=5
            )

            for line in result.stdout.strip().split('\n'):
                if line:
                    # Format: Bus 001 Device 002: ID 1234:5678 Vendor Product
                    parts = line.split()
                    if len(parts) >= 6:
                        bus = parts[1]
                        device = parts[3].rstrip(':')
                        vendor_product = parts[5]
                        description = ' '.join(parts[6:])

                        devices.append({
                            "bus": bus,
                            "device": device,
                            "id": vendor_product,
                            "description": description
                        })
        except Exception as e:
            self.log(f"Erreur lors de la lecture USB: {e}")

        return devices

    def check_device_opensource(self, device: Dict) -> Dict[str, any]:
        """Vérifie si un périphérique est open source"""
        vendor_id, product_id = device['id'].split(':')

        # Liste blanche de vendors connus comme open source / friendly
        opensource_vendors = {
            "1d6b": "Linux Foundation",  # USB Hub standard
            "046d": "Logitech (drivers libres)",
            "8087": "Intel (firmware ouvert)",
            # Ajouter d'autres vendors de confiance
        }

        # Liste noire de vendors propriétaires connus
        proprietary_vendors = {
            "05ac": "Apple",
            "045e": "Microsoft",
        }

        result = {
            "device": device,
            "opensource": False,
            "reason": "",
            "action": "quarantine"
        }

        if vendor_id in opensource_vendors:
            result["opensource"] = True
            result["reason"] = f"Vendor de confiance: {opensource_vendors[vendor_id]}"
            result["action"] = "allow"

        elif vendor_id in proprietary_vendors:
            result["opensource"] = False
            result["reason"] = f"Vendor propriétaire: {proprietary_vendors[vendor_id]}"
            result["action"] = "quarantine"

        else:
            # Inconnu - vérifier via d'autres moyens
            result["opensource"] = None
            result["reason"] = "Vendor inconnu - vérification manuelle requise"
            result["action"] = "quarantine"

        return result

    def compile_source_sandboxed(self, source_dir: Path, output_name: str) -> Dict[str, any]:
        """Compile du code source dans un sandbox"""
        self.log(f"Compilation sandboxée de {source_dir} -> {output_name}")

        sandbox_build = self.sandbox_dir / f"build_{int(time.time())}"
        sandbox_build.mkdir(parents=True, exist_ok=True)

        result = {
            "success": False,
            "binary": None,
            "logs": "",
            "hash": None
        }

        try:
            # Copier les sources dans le sandbox
            subprocess.run(
                ["cp", "-r", str(source_dir), str(sandbox_build / "src")],
                timeout=10,
                check=True
            )

            # Détection automatique du système de build
            src_path = sandbox_build / "src"

            if (src_path / "Makefile").exists():
                # Build avec make
                build_cmd = ["make", "-C", str(src_path)]

            elif (src_path / "CMakeLists.txt").exists():
                # Build avec cmake
                build_dir = sandbox_build / "build"
                build_dir.mkdir()
                subprocess.run(
                    ["cmake", "-S", str(src_path), "-B", str(build_dir)],
                    timeout=30,
                    check=True
                )
                build_cmd = ["cmake", "--build", str(build_dir)]

            elif (src_path / "Cargo.toml").exists():
                # Build avec Cargo (Rust)
                build_cmd = ["cargo", "build", "--release", "--manifest-path", str(src_path / "Cargo.toml")]

            else:
                result["logs"] = "Système de build non détecté"
                return result

            # Exécuter la compilation dans un sandbox firejail/bwrap
            sandbox_cmd = [
                "bwrap",
                "--ro-bind", "/usr", "/usr",
                "--ro-bind", "/lib", "/lib",
                "--ro-bind", "/lib64", "/lib64",
                "--bind", str(sandbox_build), str(sandbox_build),
                "--tmpfs", "/tmp",
                "--unshare-all",
                "--die-with-parent",
                "--"
            ] + build_cmd

            proc = subprocess.run(
                sandbox_cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes max
            )

            result["logs"] = proc.stdout + proc.stderr

            if proc.returncode == 0:
                # Chercher le binaire compilé
                binaries = list(sandbox_build.rglob(output_name))
                if not binaries:
                    binaries = list(sandbox_build.rglob("*"))
                    binaries = [b for b in binaries if b.is_file() and os.access(b, os.X_OK)]

                if binaries:
                    binary_path = binaries[0]

                    # Calculer le hash
                    with open(binary_path, 'rb') as f:
                        binary_hash = hashlib.sha256(f.read()).hexdigest()

                    # Copier dans allowed
                    output_path = self.allowed_dir / output_name
                    subprocess.run(["cp", str(binary_path), str(output_path)], check=True)

                    result["success"] = True
                    result["binary"] = str(output_path)
                    result["hash"] = binary_hash

                    self.log(f"✅ Compilation réussie: {binary_hash[:16]}")

        except subprocess.TimeoutExpired:
            result["logs"] = "Timeout de compilation"
            self.log("⚠️  Timeout de compilation")

        except Exception as e:
            result["logs"] = str(e)
            self.log(f"❌ Erreur de compilation: {e}")

        return result

    def scan_and_verify(self):
        """Scan les périphériques USB et vérifie leur statut"""
        self.log("Scan des périphériques USB...")

        devices = self.get_usb_devices()
        self.log(f"Trouvé {len(devices)} périphériques")

        results = []
        for device in devices:
            check = self.check_device_opensource(device)
            results.append(check)

            if check["action"] == "allow":
                self.log(f"✅ {device['description']} - {check['reason']}")
            else:
                self.log(f"⚠️  {device['description']} - {check['reason']}")

        return results

    def get_status(self) -> Dict:
        """Retourne le statut du guardian"""
        devices = self.get_usb_devices()
        results = [self.check_device_opensource(d) for d in devices]

        allowed = sum(1 for r in results if r["action"] == "allow")
        quarantined = sum(1 for r in results if r["action"] == "quarantine")

        return {
            "daemon": "usb_guardian",
            "total_devices": len(devices),
            "allowed": allowed,
            "quarantined": quarantined,
            "devices": results
        }

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "daemon":
        # TODO: Mode daemon avec socket listener
        guardian = USBGuardian()
        guardian.log("USB Guardian démarré")
        guardian.scan_and_verify()

    else:
        # Mode one-shot
        guardian = USBGuardian()
        results = guardian.scan_and_verify()

        print(f"\n{guardian.symbol} USB Guardian Report:")
        print("="*60)
        status = guardian.get_status()
        print(f"Périphériques: {status['total_devices']}")
        print(f"✅ Autorisés: {status['allowed']}")
        print(f"⚠️  En quarantaine: {status['quarantined']}")
        print("="*60)

if __name__ == "__main__":
    main()
