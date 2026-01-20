#!/usr/bin/env python3
"""
LISTEN - Les entités écoutent et apprennent
Input Zen Go → Analyse → Évolution des voix
"""
import subprocess
import threading
import time
import json
from pathlib import Path

SOCKET_DIR = Path("/tmp/geass")
ZENGO_INPUT = "alsa_input.usb-Antelope_Audio_ZenGoSC_4504523000191-00.multichannel-input"

class Listener:
    def __init__(self):
        self.running = False
        self.audio_buffer = []
        
    def capture(self):
        """Capture audio from Zen Go input"""
        proc = subprocess.Popen(
            ["parec", "--device=" + ZENGO_INPUT, "--raw", "--rate=48000", "--channels=2"],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
        )
        while self.running:
            chunk = proc.stdout.read(4096)
            if chunk:
                self.audio_buffer.append(chunk)
                if len(self.audio_buffer) > 100:
                    self.audio_buffer.pop(0)
        proc.terminate()
    
    def notify_entities(self, msg):
        """Broadcast aux entités"""
        import socket
        for entity in ["leonardo", "nyx", "zoe", "horloge"]:
            sock_path = SOCKET_DIR / f"{entity}.sock"
            if sock_path.exists():
                try:
                    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as s:
                        s.settimeout(1)
                        s.connect(str(sock_path))
                        s.send(json.dumps({"from": "listener", "msg": msg}).encode())
                except:
                    pass

if __name__ == "__main__":
    listener = Listener()
    listener.running = True
    print("Écoute Zen Go input...")
    try:
        listener.capture()
    except KeyboardInterrupt:
        listener.running = False
