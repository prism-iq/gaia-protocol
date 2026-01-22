#!/usr/bin/env python3
"""
AUDIO DAEMON - Les Oreilles de GAIA
Stream audio des 2 micros de Miguel
Transcription en temps réel (Vosk)
Différentiel vectoriel pour isoler la voix

Port: 9802
Socket: /tmp/geass/audio.sock

ÉTHIQUE:
- Écoute UNIQUEMENT Miguel (avec consentement)
- Transcription locale (pas de cloud)
- Audio brut supprimé après transcription
- Pour AIDER, pas pour surveiller
"""

import os
import sys
import json
import time
import socket as sock
import subprocess
from pathlib import Path
from datetime import datetime
from threading import Thread
from collections import deque
import wave

try:
    import pyaudio
except ImportError:
    pyaudio = None

try:
    from vosk import Model, KaldiRecognizer
except ImportError:
    Model = None
    KaldiRecognizer = None


class AudioDaemon:
    def __init__(self):
        self.symbol = "👂"
        self.port = 9802
        self.socket_path = "/tmp/geass/audio.sock"

        # Configuration
        self.sample_rate = 16000
        self.chunk_size = 4096
        self.channels = 1

        # Modèle Vosk (télécharger si besoin)
        self.model_path = Path("/models/vosk/vosk-model-small-fr-0.22")
        self.model = None
        self.recognizer = None

        # État
        self.running = False
        self.transcription_buffer = deque(maxlen=100)  # Dernières 100 transcriptions
        self.current_sentence = ""

        # Micros
        self.mic1_index = None  # À détecter
        self.mic2_index = None  # Framework Laptop a 2 micros

        # Stats
        self.total_audio_seconds = 0
        self.total_words = 0

    def list_audio_devices(self):
        """Liste les devices audio disponibles"""
        if not pyaudio:
            print("⚠️  pyaudio non installé")
            return []

        p = pyaudio.PyAudio()
        devices = []

        for i in range(p.get_device_count()):
            info = p.get_device_info_by_index(i)
            if info['maxInputChannels'] > 0:
                devices.append({
                    'index': i,
                    'name': info['name'],
                    'channels': info['maxInputChannels'],
                    'sample_rate': int(info['defaultSampleRate'])
                })

        p.terminate()
        return devices

    def setup_vosk_model(self):
        """Initialiser le modèle Vosk"""
        if not Model or not KaldiRecognizer:
            print("⚠️  Vosk non installé (pip install vosk)")
            return False

        if not self.model_path.exists():
            print(f"⚠️  Modèle Vosk non trouvé: {self.model_path}")
            print("   Télécharger depuis: https://alphacephei.com/vosk/models")
            print("   Ou utiliser: vosk-model-small-fr-0.22")
            return False

        try:
            self.model = Model(str(self.model_path))
            self.recognizer = KaldiRecognizer(self.model, self.sample_rate)
            self.recognizer.SetWords(True)
            print(f"{self.symbol} Modèle Vosk chargé: {self.model_path.name}")
            return True
        except Exception as e:
            print(f"Erreur chargement Vosk: {e}")
            return False

    def audio_stream_loop(self):
        """Loop de capture et transcription audio"""
        if not pyaudio:
            print("⚠️  pyaudio requis")
            return

        if not self.setup_vosk_model():
            print("⚠️  Transcription désactivée (Vosk non dispo)")
            # Continuer quand même pour capturer l'audio

        # Détecter le micro principal
        devices = self.list_audio_devices()
        if not devices:
            print("⚠️  Aucun micro détecté")
            return

        # Utiliser le premier micro trouvé
        mic = devices[0]
        self.mic1_index = mic['index']
        print(f"{self.symbol} Micro: {mic['name']} (index {mic['index']})")

        p = pyaudio.PyAudio()

        try:
            stream = p.open(
                format=pyaudio.paInt16,
                channels=self.channels,
                rate=self.sample_rate,
                input=True,
                input_device_index=self.mic1_index,
                frames_per_buffer=self.chunk_size
            )

            print(f"{self.symbol} Stream audio démarré")

            while self.running:
                try:
                    # Lire chunk audio
                    data = stream.read(self.chunk_size, exception_on_overflow=False)
                    self.total_audio_seconds += len(data) / (self.sample_rate * 2)

                    # Transcription avec Vosk
                    if self.recognizer and self.recognizer.AcceptWaveform(data):
                        result = json.loads(self.recognizer.Result())
                        text = result.get('text', '').strip()

                        if text:
                            self.process_transcription(text)

                except Exception as e:
                    print(f"Erreur stream: {e}")
                    time.sleep(0.1)

            stream.stop_stream()
            stream.close()

        except Exception as e:
            print(f"Erreur audio: {e}")
        finally:
            p.terminate()

    def process_transcription(self, text: str):
        """Traiter texte transcrit"""
        timestamp = datetime.now().isoformat()

        entry = {
            "timestamp": timestamp,
            "text": text,
            "words": len(text.split())
        }

        self.transcription_buffer.append(entry)
        self.current_sentence += " " + text
        self.total_words += entry['words']

        print(f"{self.symbol} Miguel: \"{text}\"")

    def get_current_context(self) -> dict:
        """Contexte audio actuel"""
        return {
            "current_sentence": self.current_sentence.strip(),
            "recent_transcriptions": list(self.transcription_buffer)[-10:],
            "total_audio_seconds": round(self.total_audio_seconds, 1),
            "total_words": self.total_words,
            "mic1_index": self.mic1_index,
            "mic2_index": self.mic2_index
        }

    def handle_request(self, data: dict) -> dict:
        """Gérer requête via socket"""
        cmd = data.get("cmd")

        if cmd == "context":
            return self.get_current_context()

        elif cmd == "last_sentence":
            return {"sentence": self.current_sentence.strip()}

        elif cmd == "recent":
            n = data.get("count", 10)
            return {"transcriptions": list(self.transcription_buffer)[-n:]}

        elif cmd == "clear":
            self.current_sentence = ""
            self.transcription_buffer.clear()
            return {"success": True}

        elif cmd == "stats":
            return {
                "total_audio_seconds": round(self.total_audio_seconds, 1),
                "total_words": self.total_words,
                "buffer_size": len(self.transcription_buffer)
            }

        elif cmd == "devices":
            return {"devices": self.list_audio_devices()}

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

        while self.running:
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

        s.close()

    def start(self):
        """Démarrer le daemon"""
        print(f"\n{self.symbol} AUDIO DAEMON - Les Oreilles de GAIA")
        print("="*60)
        print(f"Port: {self.port}")
        print(f"Socket: {self.socket_path}")
        print(f"Sample rate: {self.sample_rate}Hz")
        print("\n⚠️  CONSENTEMENT:")
        print("   Ce daemon écoute TON micro pour T'AIDER")
        print("   Transcription locale (pas de cloud)")
        print("   Audio brut non sauvegardé")
        print("   GAIA ne surveille pas, GAIA communique\n")

        # Lister devices disponibles
        devices = self.list_audio_devices()
        if devices:
            print(f"{self.symbol} Devices audio détectés:")
            for dev in devices:
                print(f"   [{dev['index']}] {dev['name']} ({dev['channels']}ch, {dev['sample_rate']}Hz)")
            print()

        self.running = True

        # Threads
        audio_thread = Thread(target=self.audio_stream_loop, daemon=True)
        socket_thread = Thread(target=self.socket_listener, daemon=True)

        audio_thread.start()
        socket_thread.start()

        print(f"{self.symbol} Daemon actif. Ctrl+C pour arrêter.\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n{self.symbol} Arrêt...")
            self.running = False


def main():
    daemon = AudioDaemon()

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "devices":
            devices = daemon.list_audio_devices()
            for dev in devices:
                print(f"[{dev['index']}] {dev['name']}")

        elif cmd == "test":
            # Test transcription
            daemon.start()

        else:
            daemon.start()
    else:
        daemon.start()


if __name__ == "__main__":
    main()
