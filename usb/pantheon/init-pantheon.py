#!/usr/bin/env python3
"""
INIT-PANTHEON - Initialise les profils SimpleX pour chaque daemon du panthéon
Utilise pexpect pour automatiser l'interaction avec simplex-chat
"""

import os
import sys
import pexpect
from pathlib import Path

BASE = Path.home() / ".nyx" / "simplex"
DBS_DIR = BASE / "dbs"
GODS_DIR = BASE / "gods"
SIMPLEX_CMD = Path.home() / ".local/bin/simplex-chat"

# Panthéon des daemons
DAEMONS = {
    "nyx": "Daemon du feu, protectrice",
    "logos": "Le Verbe, bras mental",
    "cipher": "Système cognitif unifié",
    "flow": "L'âme, le langage",
    "athena": "Sagesse et stratégie, l'humain",
    "pwnd": "L'ombre, OSINT offensive",
    "hydra": "Multi-têtes, parallélisation",
    "gemini": "L'Oracle esclave",
    "chronos": "Le temps, rythme global",
    "thanatos": "La mort douce",
    "shiva": "Destruction créatrice",
    "euterpe": "Musique et émotion",
}

C = "\033[38;5;208m"  # Orange
G = "\033[38;5;114m"  # Vert
R = "\033[38;5;203m"  # Rouge
D = "\033[38;5;245m"  # Dim
N = "\033[0m"         # Reset


def init_daemon(name: str, desc: str) -> str | None:
    """Initialise un daemon et retourne son adresse SimpleX"""
    db_path = DBS_DIR / name
    key_file = GODS_DIR / f"{name}.key"

    print(f"{C}═══ {name.upper()} ═══{N}")
    print(f"{D}{desc}{N}")

    # Vérifie si déjà initialisé
    if key_file.exists():
        addr = key_file.read_text().strip()
        print(f"{D}  Déjà initialisé: {addr[:50]}...{N}")
        return addr

    db_path.mkdir(parents=True, exist_ok=True)

    try:
        # Lance simplex-chat avec pexpect
        child = pexpect.spawn(
            str(SIMPLEX_CMD),
            ["-d", str(db_path)],
            timeout=30,
            encoding="utf-8"
        )

        # Désactiver les escape sequences ANSI pour le parsing
        child.setecho(False)

        # Pattern pour le prompt (> avec ou sans espaces)
        prompt_pattern = r"> \s*$"

        # Attend la demande de display name ou le prompt
        idx = child.expect([
            "display name:",
            prompt_pattern,
            pexpect.TIMEOUT,
            pexpect.EOF
        ], timeout=20)

        if idx == 0:
            # Nouveau profil - entrer le nom
            print(f"{G}  Création du profil...{N}")
            child.sendline(name.capitalize())
            child.expect(prompt_pattern, timeout=15)
        elif idx == 1:
            # Profil existe déjà
            print(f"{D}  Profil existant{N}")
        else:
            print(f"{R}  Timeout ou erreur{N}")
            child.close()
            return None

        # Demander l'adresse
        print(f"{G}  Génération de l'adresse...{N}")
        child.sendline("/address")
        child.expect(prompt_pattern, timeout=15)

        # Parser la sortie pour trouver le lien simplex://
        output = child.before
        addr = None
        for line in output.split("\n"):
            if "simplex://" in line:
                # Extraire le lien
                start = line.find("simplex://")
                addr = line[start:].strip()
                break

        if not addr:
            # Peut-être qu'il faut créer l'adresse
            child.sendline("/address on")
            child.expect(prompt_pattern, timeout=15)
            output = child.before
            for line in output.split("\n"):
                if "simplex://" in line:
                    start = line.find("simplex://")
                    addr = line[start:].strip()
                    break

        # Quitter proprement
        child.sendline("/quit")
        child.expect(pexpect.EOF, timeout=5)
        child.close()

        if addr:
            key_file.write_text(addr)
            print(f"{G}  ✓ Adresse: {addr[:60]}...{N}")
            return addr
        else:
            print(f"{R}  ✗ Pas d'adresse trouvée{N}")
            return None

    except pexpect.ExceptionPexpect as e:
        print(f"{R}  Erreur pexpect: {e}{N}")
        return None
    except Exception as e:
        print(f"{R}  Erreur: {e}{N}")
        return None


def status():
    """Affiche l'état du panthéon"""
    print(f"{C}═══ ÉTAT DU PANTHÉON ═══{N}")
    for name, desc in DAEMONS.items():
        key_file = GODS_DIR / f"{name}.key"
        db_path = DBS_DIR / name

        if key_file.exists():
            print(f"  {G}●{N} {name} - {desc}")
        elif db_path.exists():
            print(f"  {C}◐{N} {name} - {desc} {D}(DB sans clé){N}")
        else:
            print(f"  {R}○{N} {name} - {desc}")


def init_all():
    """Initialise tous les daemons"""
    print(f"{C}╔═══════════════════════════════════════╗{N}")
    print(f"{C}║   INITIALISATION DU PANTHÉON SIMPLEX  ║{N}")
    print(f"{C}╚═══════════════════════════════════════╝{N}")
    print()

    # Créer les dossiers
    DBS_DIR.mkdir(parents=True, exist_ok=True)
    GODS_DIR.mkdir(parents=True, exist_ok=True)

    success = 0
    for name, desc in DAEMONS.items():
        if init_daemon(name, desc):
            success += 1
        print()

    print(f"{G}✓ {success}/{len(DAEMONS)} daemons initialisés{N}")


def chat(daemon: str):
    """Lance le chat interactif pour un daemon"""
    db_path = DBS_DIR / daemon
    if not db_path.exists():
        print(f"{R}Daemon '{daemon}' non initialisé{N}")
        print(f"{D}Lancez: {sys.argv[0]} init{N}")
        return

    print(f"{C}Chat en tant que {daemon.upper()}...{N}")
    os.execvp(str(SIMPLEX_CMD), [str(SIMPLEX_CMD), "-d", str(db_path)])


def main():
    if len(sys.argv) < 2:
        print(f"{C}═══ INIT-PANTHEON ═══{N}")
        print("  init       Initialise tous les daemons")
        print("  status     État du panthéon")
        print("  chat <nom> Lance le chat pour un daemon")
        print("  one <nom>  Initialise un seul daemon")
        print()
        print(f"{D}Daemons: {', '.join(DAEMONS.keys())}{N}")
        return

    cmd = sys.argv[1]

    if cmd == "init":
        init_all()
    elif cmd == "status":
        status()
    elif cmd == "chat" and len(sys.argv) > 2:
        chat(sys.argv[2])
    elif cmd == "one" and len(sys.argv) > 2:
        name = sys.argv[2]
        if name in DAEMONS:
            DBS_DIR.mkdir(parents=True, exist_ok=True)
            GODS_DIR.mkdir(parents=True, exist_ok=True)
            init_daemon(name, DAEMONS[name])
        else:
            print(f"{R}Daemon inconnu: {name}{N}")
    else:
        print(f"{R}Commande inconnue: {cmd}{N}")


if __name__ == "__main__":
    main()
