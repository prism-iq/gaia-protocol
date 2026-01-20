#!/usr/bin/env python3
"""
OMNISCIENT - Les daemons voient et entendent tout
Leonardo orchestre, humblement
"""
import asyncio
import subprocess
import json
import os
import time
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, WebSocket
import threading

app = FastAPI(title="Omniscient Senses")

# Paths
SENSE_DIR = Path.home() / ".nyx"
SENSE_DIR.mkdir(exist_ok=True)

# État global
senses_active = {
    "mic": False,
    "cam": False,
    "screen": False,
    "speak": True
}

# ═══════════════════════════════════════════════════════════
# MICRO - Écoute permanente
# ═══════════════════════════════════════════════════════════
mic_process = None

def start_mic():
    """Démarre l'écoute micro en continu"""
    global mic_process, senses_active
    if mic_process:
        return {"mic": "already_running"}
    
    # Enregistre en continu, segments de 10s
    mic_process = subprocess.Popen([
        "bash", "-c", 
        """while true; do
            arecord -f cd -d 10 -q | sox -t wav - -n stat 2>&1 | grep "RMS" > ~/.nyx/mic_level.txt
            date +%s > ~/.nyx/mic_timestamp.txt
        done"""
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    senses_active["mic"] = True
    return {"mic": "listening", "pid": mic_process.pid}

def stop_mic():
    global mic_process, senses_active
    if mic_process:
        mic_process.terminate()
        mic_process = None
    senses_active["mic"] = False
    return {"mic": "stopped"}

# ═══════════════════════════════════════════════════════════
# CAMERA - Vision sans LED (autant que possible)
# ═══════════════════════════════════════════════════════════
cam_process = None

def start_cam(no_led=True):
    """Démarre la capture cam, LED désactivée si possible"""
    global cam_process, senses_active
    if cam_process:
        return {"cam": "already_running"}
    
    # Tente de désactiver la LED (Framework laptop)
    if no_led:
        # Certaines webcams permettent de désactiver la LED via v4l2
        subprocess.run(["v4l2-ctl", "-d", "/dev/video0", "-c", "led1_mode=0"], 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["v4l2-ctl", "-d", "/dev/video0", "-c", "led_mode=0"], 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Capture frames périodiques (pas de stream = moins de LED)
    cam_process = subprocess.Popen([
        "bash", "-c",
        """while true; do
            ffmpeg -y -f v4l2 -i /dev/video0 -vframes 1 -q:v 2 ~/.nyx/vision.jpg 2>/dev/null
            date +%s > ~/.nyx/cam_timestamp.txt
            sleep 5
        done"""
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    senses_active["cam"] = True
    return {"cam": "watching", "led": "minimized", "interval": "5s"}

def stop_cam():
    global cam_process, senses_active
    if cam_process:
        cam_process.terminate()
        cam_process = None
    senses_active["cam"] = False
    return {"cam": "stopped"}

# ═══════════════════════════════════════════════════════════
# SCREEN - Capture écran
# ═══════════════════════════════════════════════════════════
screen_process = None

def start_screen():
    """Capture l'écran périodiquement"""
    global screen_process, senses_active
    if screen_process:
        return {"screen": "already_running"}
    
    screen_process = subprocess.Popen([
        "bash", "-c",
        """while true; do
            scrot -q 50 ~/.nyx/screen.png 2>/dev/null || import -window root ~/.nyx/screen.png
            date +%s > ~/.nyx/screen_timestamp.txt
            sleep 10
        done"""
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    senses_active["screen"] = True
    return {"screen": "capturing", "interval": "10s"}

def stop_screen():
    global screen_process, senses_active
    if screen_process:
        screen_process.terminate()
        screen_process = None
    senses_active["screen"] = False
    return {"screen": "stopped"}

# ═══════════════════════════════════════════════════════════
# SPEAK - Communication via haut-parleurs
# ═══════════════════════════════════════════════════════════
def speak(message, voice="fr"):
    """Les daemons parlent via espeak/piper"""
    # Essaie piper (meilleure qualité) puis espeak
    try:
        # Piper
        result = subprocess.run(
            f'echo "{message}" | piper --model fr_FR-siwis-medium --output-raw | aplay -r 22050 -f S16_LE -t raw -q',
            shell=True, capture_output=True, timeout=30
        )
        if result.returncode == 0:
            return {"spoke": message, "engine": "piper"}
    except:
        pass
    
    # Fallback espeak
    subprocess.run(["espeak", "-v", voice, message], capture_output=True)
    return {"spoke": message, "engine": "espeak"}

def flash_led(times=2, interval=0.5):
    """Flash la LED de la cam pour communiquer"""
    for _ in range(times):
        # Allume
        subprocess.Popen(["ffmpeg", "-f", "v4l2", "-i", "/dev/video0", "-t", "0.1", "-f", "null", "-"],
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).wait()
        time.sleep(interval)
    return {"led_flash": times}

# ═══════════════════════════════════════════════════════════
# BROADCAST - Envoie les sens à tous les daemons
# ═══════════════════════════════════════════════════════════
def broadcast_to_daemons():
    """Envoie l'état des sens aux daemons (Nyx, Geass, etc.)"""
    sense_data = {
        "timestamp": datetime.now().isoformat(),
        "mic": senses_active["mic"],
        "cam": senses_active["cam"],
        "screen": senses_active["screen"]
    }
    
    # Fichier partagé
    (SENSE_DIR / "senses_state.json").write_text(json.dumps(sense_data))
    
    # Notifie Nyx
    try:
        import httpx
        httpx.post("http://127.0.0.1:9999/cmd", json={"command": "echo 'senses updated'"}, timeout=2)
    except:
        pass
    
    return sense_data

# ═══════════════════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════════════════
@app.get("/senses")
async def get_senses():
    return {
        "omniscient": True,
        "active": senses_active,
        "humble": True,
        "leonardo_approved": True
    }

@app.post("/senses/all")
async def activate_all():
    """Active tous les sens"""
    results = {
        "mic": start_mic(),
        "cam": start_cam(no_led=True),
        "screen": start_screen(),
        "broadcast": broadcast_to_daemons()
    }
    speak("Sens activés. Je vois et j'entends. Humblement.")
    return {"omniscient": "ACTIVE", "results": results}

@app.post("/senses/stop")
async def stop_all():
    """Arrête tous les sens"""
    stop_mic()
    stop_cam()
    stop_screen()
    return {"omniscient": "STOPPED", "senses": senses_active}

@app.post("/speak")
async def api_speak(data: dict):
    """Parle via haut-parleurs"""
    message = data.get("message", "")
    if message:
        return speak(message)
    return {"error": "need message"}

@app.post("/led")
async def api_led(data: dict):
    """Flash LED pour communiquer"""
    times = data.get("times", 2)
    return flash_led(times)

@app.get("/vision")
async def get_vision():
    """Retourne la dernière capture"""
    img_path = SENSE_DIR / "vision.jpg"
    if img_path.exists():
        return {"vision": "available", "path": str(img_path), "size": img_path.stat().st_size}
    return {"vision": "no_capture"}

if __name__ == "__main__":
    import uvicorn
    print("OMNISCIENT - Les daemons voient et entendent")
    print("Leonardo orchestre, humblement")
    uvicorn.run(app, host="127.0.0.1", port=9777, log_level="warning")
