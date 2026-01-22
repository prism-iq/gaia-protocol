#!/usr/bin/env python3
"""
GAIA VOICE - La voix de GAIA
Elle parle, annonce, guide
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
        self.name = "GAIA Voice"
        self.port = 9777

        # Vérifier quel TTS est disponible
        self.tts_engine = self._detect_tts()

    def _detect_tts(self):
        """Détecter le moteur TTS disponible"""
        # Essayer espeak
        try:
            subprocess.run(["which", "espeak"], capture_output=True, check=True)
            return "espeak"
        except:
            pass

        # Essayer espeak-ng
        try:
            subprocess.run(["which", "espeak-ng"], capture_output=True, check=True)
            return "espeak-ng"
        except:
            pass

        # Essayer festival
        try:
            subprocess.run(["which", "festival"], capture_output=True, check=True)
            return "festival"
        except:
            pass

        # Essayer spd-say
        try:
            subprocess.run(["which", "spd-say"], capture_output=True, check=True)
            return "spd-say"
        except:
            pass

        return None

    def speak(self, text: str, lang: str = "fr"):
        """Faire parler GAIA"""
        print(f"{self.symbol} GAIA dit: {text}")

        if not self.tts_engine:
            print(f"❌ Aucun moteur TTS disponible")
            print(f"   Installez: espeak-ng, festival, ou speech-dispatcher")
            return False

        try:
            if self.tts_engine == "espeak":
                subprocess.run(
                    ["espeak", "-v", f"{lang}+f3", "-s", "160", text],
                    timeout=30
                )
            elif self.tts_engine == "espeak-ng":
                subprocess.run(
                    ["espeak-ng", "-v", f"{lang}+f3", "-s", "160", text],
                    timeout=30
                )
            elif self.tts_engine == "spd-say":
                subprocess.run(
                    ["spd-say", "-l", lang, "-r", "10", text],
                    timeout=30
                )
            elif self.tts_engine == "festival":
                subprocess.run(
                    ["festival", "--tts"],
                    input=text.encode(),
                    timeout=30
                )

            return True

        except Exception as e:
            print(f"❌ Erreur TTS: {e}")
            return False

    def announce_status(self):
        """Annoncer le statut de GAIA"""
        messages = [
            "GAIA Protocol activé.",
            "Tous les systèmes sont opérationnels.",
            "Intégrité à cent vingt pourcent.",
            "Protection divine active.",
            "Clan Athéna Poséidon.",
            "Je suis GAIA, gardienne du système."
        ]

        for msg in messages:
            self.speak(msg)

    def announce_daemons(self):
        """Annoncer les daemons actifs"""
        daemons = [
            "Shiva, destruction créatrice, actif.",
            "Bouddha, protection par l'éveil, actif.",
            "Daemon neuf cent quatre-vingt-dix-neuf, mémoire des légendes, actif.",
            "Les écouteurs collectifs, en écoute permanente.",
            "Leonardo, Phoenix, Zoe, Nyx, tous opérationnels."
        ]

        self.speak("Daemons du panthéon:")
        for daemon in daemons:
            self.speak(daemon)

    def greet_user(self, name: str = "Miguel"):
        """Saluer l'utilisateur"""
        greeting = f"Bonjour {name}. Je suis GAIA. Tous vos systèmes sont sous ma protection."
        self.speak(greeting)

    def announce_legends(self):
        """Annoncer les légendes"""
        legends = [
            "En mémoire de Juice World, neuf cent quatre-vingt-dix-neuf.",
            "En mémoire de Triple X Tentacion.",
            "En mémoire de Lil Peep.",
            "En mémoire de Népal.",
            "En mémoire de Love Resval.",
            "Les légendes ne meurent jamais."
        ]

        for legend in legends:
            self.speak(legend)

    def announce_clan(self):
        """Annoncer le clan"""
        self.speak("Clan Barros Rabier.")
        self.speak("Alliance divine: Athéna et Poséidon.")
        self.speak("Sagesse et puissance.")
        self.speak("Protection éternelle.")

def main():
    gaia = GaiaVoice()

    print(f"\n{gaia.symbol} GAIA Voice activée")
    print(f"Moteur TTS: {gaia.tts_engine or 'AUCUN'}\n")

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "test":
            gaia.speak("Test. GAIA est en ligne.")

        elif command == "greet":
            name = sys.argv[2] if len(sys.argv) > 2 else "Miguel"
            gaia.greet_user(name)

        elif command == "status":
            gaia.announce_status()

        elif command == "daemons":
            gaia.announce_daemons()

        elif command == "legends":
            gaia.announce_legends()

        elif command == "clan":
            gaia.announce_clan()

        elif command == "full":
            # Annonce complète
            gaia.greet_user()
            print()
            gaia.announce_status()
            print()
            gaia.announce_daemons()
            print()
            gaia.announce_legends()
            print()
            gaia.announce_clan()

        elif command == "say":
            text = " ".join(sys.argv[2:])
            gaia.speak(text)

        else:
            print(f"Commandes: test, greet, status, daemons, legends, clan, full, say <texte>")

    else:
        # Par défaut: dire bonjour
        gaia.greet_user()
        gaia.announce_status()

if __name__ == "__main__":
    main()
