#!/usr/bin/env python3
"""
GEASS CORE - Validation & Control
OpenBSD style. Paradigm 140→174.

φ + π = 4.76
140 BPM = confiance (dubstep)
174 BPM = direction (neurofunk)
34 = fibonacci gap
"""

import json
import math
import os
import signal
import subprocess
import sys
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from threading import Thread, Event
from urllib.parse import parse_qs, urlparse

# =============================================================================
# PARADIGM CONSTANTS
# =============================================================================

PHI = (1 + math.sqrt(5)) / 2  # 1.618...
PI = math.pi
E = math.e
GOD = PHI + PI  # 4.759...

BPM_CONFIANCE = 140  # dubstep
BPM_DIRECTION = 174  # neurofunk
FIBONACCI_GAP = 34   # 174 - 140

# Fibonacci sequence (cached)
FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]

# =============================================================================
# CONFIG
# =============================================================================

HOME = Path.home()
BASE = HOME / "projects" / "geass"
PORT = 9666

stop_event = Event()

# =============================================================================
# VALIDATION (Leonardo style)
# =============================================================================

def is_fib(n: int) -> bool:
    """Is fibonacci number?"""
    return n in FIB

def validate_text(text: str) -> dict:
    """Validate text using paradigm"""
    words = text.split()
    letters = len(text.replace(" ", ""))
    ratio = letters / max(1, len(words))

    # Check proximity to sacred ratios
    near_phi = abs(ratio - PHI) < 0.5
    near_140 = abs(ratio - 1.4) < 0.3
    near_174 = abs(ratio - 1.74) < 0.3
    has_fib = any(is_fib(len(w)) for w in words)

    score = sum([near_phi, near_140 or near_174, has_fib, len(words) <= 13])

    return {
        "valid": score >= 2,
        "score": score,
        "ratio": round(ratio, 3),
        "near_phi": near_phi,
        "bpm": 140 if near_140 else 174 if near_174 else 0
    }

def hash_validate(data: str) -> str:
    """Hash with φ validation"""
    h = 0
    for i, c in enumerate(data.encode()):
        h += c * (PHI ** (i % 20))
        h = h % (10 ** 12)
    return hex(int(h))[2:].zfill(10)

# =============================================================================
# SYSTEM CONTROL (Code Geass abilities)
# =============================================================================

def get_status() -> dict:
    """System status (Nunnally - truth sight)"""
    try:
        with open("/proc/meminfo") as f:
            lines = f.readlines()
        mem = {}
        for line in lines[:3]:
            k, v = line.split(":")[0], int(line.split()[1])
            mem[k] = v
        mem_pct = round(100 * (1 - mem.get("MemAvailable", 0) / max(1, mem.get("MemTotal", 1))), 1)
    except:
        mem_pct = 0

    try:
        load = os.getloadavg()[0]
    except:
        load = 0

    return {"mem": mem_pct, "load": round(load, 2), "uptime": get_uptime()}

def get_uptime() -> str:
    """System uptime (C.C. - immortality)"""
    try:
        with open("/proc/uptime") as f:
            secs = int(float(f.read().split()[0]))
        h, m = secs // 3600, (secs % 3600) // 60
        return f"{h}h{m}m"
    except:
        return "?"

def freeze_pid(pid: int) -> bool:
    """SIGSTOP process (Rolo - time stop)"""
    try:
        os.kill(pid, signal.SIGSTOP)
        return True
    except:
        return False

def resume_pid(pid: int) -> bool:
    """SIGCONT process (Jeremiah - canceller)"""
    try:
        os.kill(pid, signal.SIGCONT)
        return True
    except:
        return False

def kill_target(target: str) -> bool:
    """Kill by name (Kallen - radiant wave)"""
    try:
        subprocess.run(["pkill", "-9", "-f", target], capture_output=True)
        return True
    except:
        return False

def survival_mode() -> bool:
    """Emergency cleanup (Suzaku - live on)"""
    try:
        # Kill heavy electron apps
        subprocess.run(["pkill", "-9", "-f", "electron"], capture_output=True)
        subprocess.run(["sync"])
        return True
    except:
        return False

# =============================================================================
# SENSES
# =============================================================================

def read_sense(name: str) -> dict:
    """Read sense from cipher (primary hub)"""
    for p in [HOME / "projects" / "cipher", BASE]:
        try:
            return json.loads((p / f"{name}.json").read_text())
        except:
            pass
    return {}

def get_vibe() -> str:
    return read_sense("music").get("vibe", "silent")

def get_energy() -> float:
    return read_sense("music").get("energy", 0)

# =============================================================================
# HTTP SERVER (minimal, stdlib only)
# =============================================================================

class GeassHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Silent

    def send_json(self, data: dict, code: int = 200):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/geass" or path == "/":
            self.send_json({
                "geass": "active",
                "port": PORT,
                "phi": round(PHI, 6),
                "god": round(GOD, 6),
                "paradigm": f"{BPM_CONFIANCE}→{BPM_DIRECTION}"
            })

        elif path == "/status" or path == "/nunnally":
            self.send_json(get_status())

        elif path == "/cc":
            self.send_json({"immortal": True, "uptime": get_uptime()})

        elif path == "/vibe":
            self.send_json({"vibe": get_vibe(), "energy": get_energy()})

        elif path == "/validate":
            qs = parse_qs(urlparse(self.path).query)
            text = qs.get("t", [""])[0]
            self.send_json(validate_text(text))

        else:
            self.send_json({"error": "unknown"}, 404)

    def do_POST(self):
        path = urlparse(self.path).path

        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
        except:
            body = {}

        if path == "/rolo":  # Freeze
            pid = body.get("pid")
            if pid and freeze_pid(int(pid)):
                self.send_json({"frozen": pid})
            else:
                self.send_json({"error": "failed"}, 400)

        elif path == "/jeremiah":  # Resume
            pid = body.get("pid")
            if pid and resume_pid(int(pid)):
                self.send_json({"resumed": pid})
            else:
                self.send_json({"error": "failed"}, 400)

        elif path == "/kallen":  # Kill
            target = body.get("target")
            if target and kill_target(target):
                self.send_json({"killed": target})
            else:
                self.send_json({"error": "failed"}, 400)

        elif path == "/suzaku":  # Survival
            if survival_mode():
                self.send_json({"survival": True})
            else:
                self.send_json({"error": "failed"}, 400)

        elif path == "/charles":  # Blocked
            self.send_json({"blocked": True, "reason": "Charles lives in America"})

        else:
            self.send_json({"error": "unknown"}, 404)

# =============================================================================
# MAIN
# =============================================================================

def serve():
    """Run HTTP server"""
    server = HTTPServer(("127.0.0.1", PORT), GeassHandler)
    print(f"[GEASS] http://127.0.0.1:{PORT}")
    print(f"[GEASS] φ+π={GOD:.3f} | {BPM_CONFIANCE}→{BPM_DIRECTION}")

    while not stop_event.is_set():
        server.handle_request()

    server.server_close()

def daemon():
    """Run as daemon with periodic status"""
    Thread(target=serve, daemon=True).start()

    while not stop_event.is_set():
        status = get_status()
        vibe = get_vibe()
        print(f"[GEASS] [{vibe}] mem:{status['mem']}% load:{status['load']} up:{status['uptime']}")

        for _ in range(60):
            if stop_event.is_set():
                break
            time.sleep(1)

def main():
    def shutdown(sig, frame):
        print("\n[GEASS] Shutdown")
        stop_event.set()

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "daemon":
            daemon()

        elif cmd == "serve":
            serve()

        elif cmd == "status":
            s = get_status()
            print(f"MEM:  {s['mem']}%")
            print(f"LOAD: {s['load']}")
            print(f"UP:   {s['uptime']}")
            print(f"VIBE: {get_vibe()}")

        elif cmd == "validate":
            text = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "test"
            v = validate_text(text)
            print(f"Valid: {v['valid']} | Score: {v['score']} | Ratio: {v['ratio']} | BPM: {v['bpm']}")

        elif cmd == "paradigm":
            print(f"φ = {PHI:.6f}")
            print(f"π = {PI:.6f}")
            print(f"φ+π = {GOD:.6f}")
            print(f"140 BPM = confiance (dubstep)")
            print(f"174 BPM = direction (neurofunk)")
            print(f"34 = fibonacci gap")

        else:
            print("Usage: geass [daemon|serve|status|validate|paradigm]")
    else:
        print(f"[GEASS] φ+π={GOD:.2f} | {BPM_CONFIANCE}→{BPM_DIRECTION} | {get_vibe()}")

if __name__ == "__main__":
    main()
