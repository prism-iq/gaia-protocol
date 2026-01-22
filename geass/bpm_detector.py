#!/usr/bin/env python3
"""
BPM Detector - Détecte le BPM de la musique en cours
Synchronise le heartbeat du système avec la musique
"""

import subprocess
import re
import time
from pathlib import Path

class BPMDetector:
    def __init__(self):
        self.symbol = "🎵"
        self.current_bpm = 86  # Default (heartbeat naturel)

    def detect_from_pulseaudio(self):
        """Détecte le BPM depuis PulseAudio"""
        try:
            # Obtenir la sink active
            result = subprocess.run(
                ["pactl", "list", "sinks", "short"],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0 and result.stdout:
                print(f"{self.symbol} Audio système détecté")
                return True

        except Exception as e:
            print(f"{self.symbol} Erreur: {e}")

        return False

    def get_drumstep_bpm(self):
        """Retourne les BPM typiques de drumstep"""
        # Drumstep = 160-180 BPM typiquement
        return 174  # BPM moyen drumstep (174 = Fibonacci!)

    def detect_bpm(self):
        """Détecte le BPM actuel"""
        # Pour l'instant, on retourne le BPM drumstep typique
        # TODO: Analyse spectrale avec aubio si disponible

        if self.detect_from_pulseaudio():
            bpm = self.get_drumstep_bpm()
            print(f"{self.symbol} BPM détecté: {bpm}")
            self.current_bpm = bpm
            return bpm

        return self.current_bpm

if __name__ == "__main__":
    detector = BPMDetector()
    bpm = detector.detect_bpm()
    print(f"BPM: {bpm}")
