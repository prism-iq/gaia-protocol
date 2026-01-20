#!/usr/bin/env python3
"""
CODE GEASS - Defensive Shield Extensions
Port: 9666
"""
import asyncio, subprocess, os, signal
from datetime import datetime
from fastapi import FastAPI

app = FastAPI(title="Code Geass Shield")

# LELOUCH - Absolute Obedience (ordres)
@app.post("/lelouch")
async def lelouch(data: dict):
    cmd = data.get("order")
    allowed = ["kill", "pkill", "systemctl stop", "iptables"]
    if cmd and any(cmd.startswith(a) for a in allowed):
        proc = await asyncio.create_subprocess_shell(cmd, stdout=asyncio.subprocess.PIPE)
        out, _ = await proc.communicate()
        return {"geass": "absolute_obedience", "order": cmd, "done": True}
    return {"error": "order refused"}

# C.C. - Immortality (uptime + grant powers)
@app.get("/cc")
async def cc():
    return {"geass": "immortality", "uptime": subprocess.getoutput("uptime -p"), "pizza": True}

# MAO - Mind Reading (logs + network)
@app.get("/mao")
async def mao():
    return {"geass": "mind_reading", "thoughts": subprocess.getoutput("journalctl -n 10 --no-pager").split("\n")}

# ROLO - Time Stop (SIGSTOP)
@app.post("/rolo")
async def rolo(data: dict):
    pid = data.get("pid")
    if pid:
        os.kill(int(pid), signal.SIGSTOP)
        return {"geass": "time_stop", "pid": pid, "frozen": True}
    return {"error": "need pid"}

# CHARLES - Memory Rewrite (USA/Britannia - BLOQUÉ)
@app.post("/charles")
async def charles(data: dict):
    """Charles vit en Amérique - ses pouvoirs sont BLOQUÉS ici"""
    return {
        "geass": "memory_rewrite",
        "status": "BLOCKED",
        "reason": "Charles lives in America (Britannia)",
        "hosts_blocked": True,
        "message": "His influence cannot reach this system"
    }

# JEREMIAH - Geass Canceller (restore)
@app.post("/jeremiah")
async def jeremiah(data: dict):
    subprocess.run(["pkill", "-CONT", "-f", "."], capture_output=True)
    return {"geass_canceller": True, "all_resumed": True, "loyalty": "ORANGE"}

# SUZAKU - Live On (survival mode)
@app.post("/suzaku")
async def suzaku():
    subprocess.run(["pkill", "-9", "-f", "electron"], capture_output=True)
    subprocess.run(["sync"])
    return {"geass": "live_on", "survival_mode": True, "curse": "cannot_die"}

# KALLEN - Radiant Wave (kill -9)
@app.post("/kallen")
async def kallen(data: dict):
    target = data.get("target")
    if target:
        subprocess.run(["pkill", "-9", "-f", target], capture_output=True)
        return {"guren": "radiant_wave", "target": target, "obliterated": True}
    return {"error": "need target"}

# NUNNALLY - Truth Sight (health)
@app.get("/nunnally")
async def nunnally():
    return {
        "sight": "truth",
        "cpu": subprocess.getoutput("grep 'cpu ' /proc/stat | awk '{print ($2+$4)*100/($2+$4+$5)}'"),
        "mem": subprocess.getoutput("free -h | awk '/Mem:/ {print $3\"/\"$2}'"),
        "wish": "peace"
    }

# STATUS
@app.get("/geass")
async def geass_status():
    return {
        "code_geass": "active",
        "port": 9666,
        "bearers": ["lelouch","cc","mao","rolo","charles(blocked)","jeremiah","suzaku","kallen","nunnally"],
        "charles_status": "BLOCKED - lives in America"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=9666, log_level="warning")
