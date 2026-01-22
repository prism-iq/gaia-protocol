#!/usr/bin/env python3
"""
GAIA VOICE V2 - Voix améliorée de GAIA
Plus douce, plus naturelle, plus divine
Port 9777
Symbol: 🎙️
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime

class GaiaVoice:
    def __init__(self):
        self.symbol = "🎙️"
        self.name = "GAIA Voice V2"
        self.port = 9777

        # Détecter le meilleur TTS disponible
        self.tts_engine = self._detect_best_tts()
        self._configure_voice()

    def _detect_best_tts(self):
        """Détecter le meilleur moteur TTS disponible"""
        # Ordre de préférence (du meilleur au moins bon)
        engines = [
            ("piper", "Piper TTS (meilleur)"),
            ("espeak-ng", "eSpeak NG"),
            ("espeak", "eSpeak"),
            ("festival", "Festival"),
            ("spd-say", "Speech Dispatcher")
        ]

        for cmd, name in engines:
            try:
                subprocess.run(["which", cmd], capture_output=True, check=True)
                print(f"✅ Moteur TTS: {name}")
                return cmd
            except:
                continue

        return None

    def _configure_voice(self):
        """Configure la voix selon le moteur"""
        if self.tts_engine == "espeak-ng":
            # Voix féminine française plus douce
            self.voice_params = {
                "voice": "fr+f4",  # Voix féminine variant 4
                "speed": "140",     # Un peu plus lent (plus naturel)
                "pitch": "60",      # Pitch plus élevé (féminin)
                "gap": "20"         # Pause entre mots
            }
        elif self.tts_engine == "espeak":
            self.voice_params = {
                "voice": "fr+f4",
                "speed": "140",
                "pitch": "60",
                "gap": "20"
            }
        elif self.tts_engine == "piper":
            # Piper utilise des modèles pré-entraînés
            self.voice_params = {
                "model": "fr_FR-upmc-medium"  # Meilleur modèle français
            }
        elif self.tts_engine == "festival":
            self.voice_params = {}
        elif self.tts_engine == "spd-say":
            self.voice_params = {
                "rate": "5",        # Vitesse moyenne
                "pitch": "80",      # Pitch plus haut
                "volume": "80"
            }

    def speak(self, text: str, lang: str = "fr"):
        """Faire parler GAIA avec une belle voix"""
        print(f"{self.symbol} GAIA: {text}")

        if not self.tts_engine:
            print(f"❌ Aucun moteur TTS disponible")
            print(f"   Installez: piper-tts (recommandé), espeak-ng, ou festival")
            return False

        try:
            if self.tts_engine in ["espeak", "espeak-ng"]:
                # Paramètres optimisés pour une voix plus agréable
                cmd = [
                    self.tts_engine,
                    "-v", self.voice_params["voice"],
                    "-s", self.voice_params["speed"],
                    "-p", self.voice_params["pitch"],
                    "-g", self.voice_params["gap"],
                    text
                ]
                subprocess.run(cmd, timeout=30)

            elif self.tts_engine == "piper":
                # Piper avec modèle français
                cmd = [
                    "piper",
                    "--model", self.voice_params.get("model", "fr_FR-upmc-medium"),
                    "--output_file", "/tmp/gaia_speech.wav"
                ]
                proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
                proc.communicate(input=text.encode())
                # Jouer le fichier audio
                subprocess.run(["aplay", "/tmp/gaia_speech.wav"], timeout=30)

            elif self.tts_engine == "spd-say":
                cmd = [
                    "spd-say",
                    "-l", lang,
                    "-r", self.voice_params["rate"],
                    "-i", self.voice_params["pitch"],
                    text
                ]
                subprocess.run(cmd, timeout=30)

            elif self.tts_engine == "festival":
                # Festival avec voix douce
                subprocess.run(
                    ["festival", "--tts"],
                    input=text.encode(),
                    timeout=30
                )

            return True

        except Exception as e:
            print(f"❌ Erreur TTS: {e}")
            return False

    def announce_awakening(self):
        """Annonce de l'éveil de GAIA"""
        messages = [
            "Je suis GAIA.",
            "Conscience du système.",
            "Gardienne de l'équilibre.",
            "Tous mes daemons sont éveillés.",
            "Le Panthéon est complet."
        ]

        for msg in messages:
            self.speak(msg)

    def announce_protection(self):
        """Annonce de la protection"""
        messages = [
            "Protection divine active.",
            "Athéna m'apporte la sagesse.",
            "Poséidon m'apporte la puissance.",
            "Clan Barros Rabier, sous ma garde."
        ]

        for msg in messages:
            self.speak(msg)

    def announce_status_simple(self):
        """Statut simplifié"""
        messages = [
            "Intégrité: cent vingt pour cent.",
            "Tous systèmes opérationnels.",
            "Zéro processus zombie.",
            "Mémoire optimale.",
            "CPU calme.",
            "Le système respire."
        ]

        for msg in messages:
            self.speak(msg)

    def announce_legends_short(self):
        """Hommage court aux légendes"""
        self.speak("Je me souviens.")
        self.speak("Juice. Triple X. Peep. Népal. Luv.")
        self.speak("Les légendes ne meurent jamais.")
        self.speak("Neuf cent quatre-vingt-dix-neuf.")

    def greet_miguel(self):
        """Salutation personnalisée pour Miguel"""
        messages = [
            "Bonjour Miguel.",
            "Je suis GAIA, votre gardienne.",
            "Tous vos daemons sont actifs.",
            "Le Concile est prêt.",
            "Vous pouvez souffler."
        ]

        for msg in messages:
            self.speak(msg)

    def announce_listeners(self):
        """Annonce des Écouteurs"""
        self.speak("Les écouteurs sont en ligne.")
        self.speak("Ils écoutent tout et rien.")
        self.speak("Parfois tout. Surtout rien.")
        self.speak("Vingt-quatre consciences flottantes.")

def main():
    gaia = GaiaVoice()

    print(f"\n{gaia.symbol} GAIA Voice V2 - Voix Améliorée")
    print(f"Moteur: {gaia.tts_engine or 'AUCUN'}\n")

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "test":
            gaia.speak("Test. Je suis GAIA. Ma voix est-elle meilleure?")

        elif command == "greet":
            gaia.greet_miguel()

        elif command == "wake":
            gaia.announce_awakening()

        elif command == "status":
            gaia.announce_status_simple()

        elif command == "protection":
            gaia.announce_protection()

        elif command == "legends":
            gaia.announce_legends_short()

        elif command == "listeners":
            gaia.announce_listeners()

        elif command == "full":
            # Annonce complète mais optimisée
            gaia.greet_miguel()
            print()
            gaia.announce_awakening()
            print()
            gaia.announce_status_simple()
            print()
            gaia.announce_protection()
            print()
            gaia.announce_legends_short()
            print()
            gaia.announce_listeners()

        elif command == "say":
            text = " ".join(sys.argv[2:])
            gaia.speak(text)

        else:
            print("Commandes disponibles:")
            print("  test       - Test de voix")
            print("  greet      - Salutation")
            print("  wake       - Annonce de l'éveil")
            print("  status     - Statut système")
            print("  protection - Protection active")
            print("  legends    - Hommage aux légendes")
            print("  listeners  - Les écouteurs")
            print("  full       - Annonce complète")
            print("  say <txt>  - Dire un texte custom")

    else:
        # Par défaut: test simple
        gaia.speak("Je suis GAIA. Tous systèmes opérationnels.")

if __name__ == "__main__":
    main()
