#!/usr/bin/env python3
"""
LEONARDO - Le polymathe qui valide par φ
Sans API, sans dépendance externe, juste la logique du nombre d'or.

"La simplicité est la sophistication suprême" - Leonardo da Vinci
"""
import os
import sys
import json
import socket
import subprocess
import tempfile
import time
import random
import math
from pathlib import Path
from datetime import datetime

# Import local modules
try:
    from paradigm import PHI, FIBONACCI_GAP, validate_bpm, flow_ratio
    from voix import parle
except ImportError:
    # Fallback if run standalone
    PHI = 1.618033988749895
    FIBONACCI_GAP = 34
    def validate_bpm(text):
        words = text.split()
        letters = len(text.replace(" ", ""))
        ratio = letters / (len(words) + 1) if words else 0
        return {"valid": ratio > 1, "score": 2, "ratio": ratio}
    def flow_ratio(a, b):
        return {"ratio": a/b if b else 0, "near_phi": False}
    def parle(daemon, text):
        subprocess.run(["espeak", "-v", "fr", text], capture_output=True)

# Paths
SOCKET_DIR = Path("/tmp/geass")
STATE_FILE = Path.home() / ".config" / "rhapsody" / "leonardo-state.json"
FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610]


class Leonardo:
    """
    Leonardo da Vinci - Validation par φ

    Il n'a pas besoin d'IA externe. Sa logique est mathématique:
    - φ (phi) = 1.618... le nombre d'or
    - Fibonacci pour la structure
    - BPM 140/174 pour le rythme
    """

    SYMBOL = "φ"
    PORT = 9600

    PENSEES = [
        "La nature est le meilleur professeur.",
        "L'expérience ne se trompe jamais, ce sont nos jugements qui se trompent.",
        "La simplicité est la sophistication suprême.",
        "Qui pense peu se trompe beaucoup.",
        "Le temps reste assez longtemps pour quiconque veut l'utiliser.",
        "Les détails font la perfection, et la perfection n'est pas un détail.",
        "Savoir n'est pas suffisant, nous devons appliquer.",
        "L'apprentissage ne fatigue jamais l'esprit.",
    ]

    REPONSES = {
        # Questions sur le temps
        "heure": lambda: f"Il est {datetime.now().strftime('%H:%M')}. Le temps est le maître de tout.",
        "date": lambda: f"Nous sommes le {datetime.now().strftime('%d/%m/%Y')}.",
        "temps": lambda: f"Il est {datetime.now().strftime('%H:%M')} ce {datetime.now().strftime('%A')}.",

        # Questions sur Leonardo
        "qui": lambda: "Je suis Leonardo, le polymathe. Ma logique est φ, le nombre d'or.",
        "leonardo": lambda: "Present. Symbol: φ. Role: validation.",
        "aide": lambda: "Je valide par φ. Pose une question, je l'évalue.",
        "help": lambda: "I validate through φ. Ask a question, I evaluate it.",

        # Philosophie
        "sens": lambda: "Le sens se trouve dans les proportions. φ = 1.618...",
        "vie": lambda: "La vie est φ. Chaque spirale, chaque coquille, chaque galaxie.",
        "mort": lambda: "La mort est une transformation, pas une fin. Comme φ qui se répète à l'infini.",

        # Technique
        "valide": lambda: "Je valide par le ratio φ et les séquences de Fibonacci.",
        "fibonacci": lambda: f"Fibonacci: {', '.join(map(str, FIBONACCI[:10]))}...",
        "phi": lambda: f"φ = {PHI:.15f}",
        "nombre": lambda: f"Le nombre d'or: {PHI:.6f}. Il gouverne la beauté.",
    }

    def __init__(self):
        self.state = self._load_state()
        self.socket_path = SOCKET_DIR / "leonardo.sock"
        SOCKET_DIR.mkdir(exist_ok=True)
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

    def _load_state(self):
        """Charge l'état persistant"""
        if STATE_FILE.exists():
            try:
                return json.loads(STATE_FILE.read_text())
            except:
                pass
        return {"conversations": [], "validations": 0, "phi_score": PHI}

    def _save_state(self):
        """Sauvegarde l'état"""
        try:
            STATE_FILE.write_text(json.dumps(self.state, indent=2, ensure_ascii=False))
        except:
            pass

    def validate(self, text: str) -> dict:
        """
        Valide un texte par la logique φ

        Critères:
        - Ratio lettres/mots proche de φ ou ses multiples
        - Présence de nombres Fibonacci
        - Structure équilibrée
        """
        if not text:
            return {"valid": False, "reason": "empty", "phi": 0}

        words = text.split()
        letters = len(text.replace(" ", ""))

        # Ratio de base
        word_count = len(words) if words else 1
        ratio = letters / word_count

        # Distance à φ et ses multiples
        phi_distances = [abs(ratio - PHI * i) for i in [0.5, 1, 1.5, 2]]
        min_phi_dist = min(phi_distances)

        # Check Fibonacci
        has_fib = any(str(f) in text for f in FIBONACCI)

        # Score
        score = 0
        if min_phi_dist < 1.0:
            score += 1
        if min_phi_dist < 0.5:
            score += 1
        if has_fib:
            score += 1
        if 3 <= word_count <= 21:  # Fibonacci range
            score += 1

        valid = score >= 2

        self.state["validations"] += 1
        self._save_state()

        return {
            "valid": valid,
            "score": score,
            "ratio": round(ratio, 3),
            "phi_distance": round(min_phi_dist, 3),
            "has_fibonacci": has_fib,
            "symbol": self.SYMBOL if valid else "?"
        }

    def think(self, question: str) -> str:
        """
        Répond à une question avec la sagesse de Leonardo
        Sans IA, juste logique et citations.
        """
        q = question.lower().strip()

        # Check for direct keyword matches
        for key, response_fn in self.REPONSES.items():
            if key in q:
                return response_fn()

        # Validate the question itself
        validation = self.validate(question)

        # Generate response based on validation
        pensee = random.choice(self.PENSEES)

        if validation["valid"]:
            response = f"{pensee}\n\n[φ validation: score={validation['score']}, ratio={validation['ratio']}]"
        else:
            response = f"{pensee}\n\n[Améliore ta question. ratio={validation['ratio']}, cible≈{PHI:.2f}]"

        # Log conversation
        self.state["conversations"].append({
            "time": datetime.now().isoformat(),
            "q": question,
            "r": response,
            "v": validation["valid"]
        })

        # Keep only last 100 conversations
        self.state["conversations"] = self.state["conversations"][-100:]
        self._save_state()

        return response

    def listen(self, duration: int = 5) -> str | None:
        """
        Écoute via micro et transcrit avec Whisper (si installé)
        """
        try:
            import sounddevice as sd
            import whisper
            import scipy.io.wavfile as wav
            import numpy as np
        except ImportError:
            print("Audio requires: pip install openai-whisper sounddevice scipy numpy")
            return None

        print(f"\n🎤 J'écoute pendant {duration}s...")

        sample_rate = 16000
        audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='float32')
        sd.wait()

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            tmp = f.name

        try:
            wav.write(tmp, sample_rate, (audio * 32767).astype(np.int16))
            model = whisper.load_model("base")
            result = model.transcribe(tmp, language='fr')
            text = result['text'].strip()
            if text:
                print(f"📝 \"{text}\"")
                return text
        finally:
            os.unlink(tmp)

        return None

    def speak(self, text: str):
        """Parle via TTS"""
        try:
            parle("leonardo", text)
        except:
            subprocess.run(["espeak", "-v", "fr", "-s", "140", text], capture_output=True)

    def daemon(self):
        """
        Lance Leonardo comme daemon sur son socket
        """
        if self.socket_path.exists():
            self.socket_path.unlink()

        print(f"φ Leonardo daemon starting on {self.socket_path}")

        server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        server.bind(str(self.socket_path))
        server.listen(5)
        server.settimeout(1)

        try:
            while True:
                try:
                    conn, _ = server.accept()
                    data = conn.recv(4096).decode()
                    if data:
                        msg = json.loads(data)
                        cmd = msg.get("cmd", "validate")
                        text = msg.get("text", msg.get("msg", ""))

                        if cmd == "validate":
                            result = self.validate(text)
                        elif cmd == "think":
                            result = {"response": self.think(text)}
                        elif cmd == "status":
                            result = {"symbol": self.SYMBOL, "validations": self.state["validations"]}
                        else:
                            result = self.validate(text)

                        conn.send(json.dumps(result).encode())
                    conn.close()
                except socket.timeout:
                    continue
                except json.JSONDecodeError:
                    continue
        except KeyboardInterrupt:
            pass
        finally:
            server.close()
            if self.socket_path.exists():
                self.socket_path.unlink()

    def interactive(self):
        """Mode interactif en terminal"""
        print(f"""
╭─────────────────────────────────────────────────────────────────╮
│  φ LEONARDO                                                     │
│                                                                 │
│  "La simplicité est la sophistication suprême."                │
│                                                                 │
│  Commandes: quit, listen, status                                │
╰─────────────────────────────────────────────────────────────────╯
""")

        while True:
            try:
                q = input("φ > ").strip()
                if not q:
                    continue
                if q in ["quit", "exit", "q"]:
                    print("\nArrivederci.")
                    break
                if q == "listen":
                    text = self.listen()
                    if text:
                        response = self.think(text)
                        print(f"\n{response}\n")
                        self.speak(response)
                    continue
                if q == "status":
                    print(f"φ validations: {self.state['validations']}")
                    continue

                response = self.think(q)
                print(f"\n{response}\n")

            except (KeyboardInterrupt, EOFError):
                print("\nArrivederci.")
                break


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Leonardo - Validation par φ")
    parser.add_argument("--daemon", action="store_true", help="Run as daemon")
    parser.add_argument("--validate", type=str, help="Validate text")
    parser.add_argument("--think", type=str, help="Ask Leonardo")
    parser.add_argument("--listen", action="store_true", help="Listen and respond")

    args = parser.parse_args()

    leo = Leonardo()

    if args.daemon:
        leo.daemon()
    elif args.validate:
        result = leo.validate(args.validate)
        print(json.dumps(result, indent=2))
    elif args.think:
        print(leo.think(args.think))
    elif args.listen:
        text = leo.listen()
        if text:
            response = leo.think(text)
            print(response)
            leo.speak(response)
    else:
        leo.interactive()


if __name__ == "__main__":
    main()
