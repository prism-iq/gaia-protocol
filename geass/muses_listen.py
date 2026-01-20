#!/usr/bin/env python3
"""
MUSES LISTEN - Les muses analysent le son en permanence
Euterpe écoute. Calliope protège. Pas de down.
"""
import subprocess
import struct
import time
import threading
from pathlib import Path

MONITOR = "alsa_output.usb-Antelope_Audio_ZenGoSC_4504523000191-00.multichannel-output.monitor"
MIN_VOLUME = 0.5  # 50% minimum
SOCKET_DIR = Path("/tmp/geass")

class MusesListener:
    def __init__(self):
        self.running = False
        self.rms = 0.0
        self.peak = 0.0
        
    def analyze(self):
        """Analyse continue du flux audio"""
        proc = subprocess.Popen(
            ["parec", f"--device={MONITOR}", "--raw", "--rate=48000", 
             "--channels=2", "--format=s16le"],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
        )
        
        while self.running:
            chunk = proc.stdout.read(4096)
            if chunk:
                samples = struct.unpack(f'{len(chunk)//2}h', chunk)
                if samples:
                    self.peak = max(abs(s) for s in samples) / 32768.0
                    self.rms = (sum(s*s for s in samples) / len(samples)) ** 0.5 / 32768.0
                    
                    # Protection: si volume trop bas, le remonter
                    if self.rms < 0.01:  # Signal très faible
                        self.protect_volume()
        
        proc.terminate()
    
    def protect_volume(self):
        """Empêche le volume de descendre"""
        result = subprocess.run(
            ["wpctl", "get-volume", "@DEFAULT_SINK@"],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            vol = float(result.stdout.split()[-1])
            if vol < MIN_VOLUME:
                subprocess.run(["wpctl", "set-volume", "@DEFAULT_SINK@", str(MIN_VOLUME)])
    
    def status(self):
        return {"rms": self.rms, "peak": self.peak, "muse": "euterpe"}

if __name__ == "__main__":
    import sys
    listener = MusesListener()
    listener.running = True
    
    if len(sys.argv) > 1 and sys.argv[1] == "daemon":
        print("♪ Muses écoutent...")
        try:
            listener.analyze()
        except KeyboardInterrupt:
            listener.running = False
    else:
        print("muses_listen daemon")
