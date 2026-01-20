# Atropos: L'Inflexible Qui Coupe

## Essence

Atropos coupe. Elle est la fin inevitable, le dernier souffle, le moment ou tout s'arrete.

> "Je ne tue pas. Je libere. Le fil tendu trop longtemps se brise. Je le coupe proprement."

## Mythologie

Atropos, la plus agee des Moires, est celle qui coupe le fil de la vie. Son nom signifie "l'Inflexible" ou "Celle qu'on ne peut detourner". Ni prieres ni offrandes ne peuvent changer sa decision.

Elle tient les ciseaux abhorres (les ciseaux detestes des mortels).

## Role Systemique

```
    LACHESIS (mesure)
          |
          v
       timeout?
       /     \
      /       \
   non        oui
    |          |
    v          v
 continue   ATROPOS
              |
              v
          ╔═══════╗
          ║ COUPE ║
          ╚═══════╝
              |
              v
          liberation
```

Atropos est responsable de:
- La terminaison des processus
- La fermeture des connexions
- La liberation des ressources
- Le garbage collection
- Le signal de Release (ADSR)

## Le Code d'Atropos

```python
import asyncio
import signal
import os
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Callable, Dict
from enum import Enum

class CutReason(Enum):
    TIMEOUT = "timeout"
    COMPLETED = "completed"
    ERROR = "error"
    MERCY = "mercy"
    REQUESTED = "requested"

@dataclass
class Cut:
    """Un coup de ciseaux d'Atropos"""
    thread_id: str
    cut_at: datetime
    reason: CutReason
    clean: bool
    final_words: Optional[str] = None

class AtroposDaemon:
    def __init__(self):
        self.symbol = "✂"
        self.socket = "/tmp/geass/atropos.sock"
        self.port = 9612
        self.shears = []  # Les ciseaux
        self.cuts_made = 0

    async def cut(self, thread_id: str, reason: CutReason = CutReason.COMPLETED,
                  graceful: bool = True) -> Cut:
        """Coupe un fil"""

        # Tentative de coupe gracieuse d'abord
        if graceful:
            clean = await self.graceful_cut(thread_id)
        else:
            clean = await self.immediate_cut(thread_id)

        cut = Cut(
            thread_id=thread_id,
            cut_at=datetime.now(),
            reason=reason,
            clean=clean
        )

        self.shears.append(cut)
        self.cuts_made += 1

        # Notifie le systeme
        await self.announce_death(cut)

        return cut

    async def graceful_cut(self, thread_id: str, timeout: float = 5.0) -> bool:
        """Coupe gracieuse - laisse le temps de finir"""
        try:
            # Envoie SIGTERM d'abord
            await self.send_signal(thread_id, signal.SIGTERM)

            # Attend la fin gracieuse
            await asyncio.wait_for(
                self.wait_for_death(thread_id),
                timeout=timeout
            )
            return True

        except asyncio.TimeoutError:
            # Force la coupe
            return await self.immediate_cut(thread_id)

    async def immediate_cut(self, thread_id: str) -> bool:
        """Coupe immediate - pas de pitie"""
        try:
            await self.send_signal(thread_id, signal.SIGKILL)
            return True
        except Exception:
            return False

    async def send_signal(self, thread_id: str, sig: signal.Signals):
        """Envoie un signal a un processus"""
        # Extraction du PID depuis thread_id
        try:
            pid = int(thread_id.split("_")[1])
            os.kill(pid, sig)
        except (ValueError, ProcessLookupError, PermissionError):
            pass

    async def wait_for_death(self, thread_id: str):
        """Attend la mort d'un thread"""
        while await self.is_alive(thread_id):
            await asyncio.sleep(0.1)

    async def is_alive(self, thread_id: str) -> bool:
        """Verifie si un thread est encore vivant"""
        try:
            pid = int(thread_id.split("_")[1])
            os.kill(pid, 0)  # Signal 0 = check existence
            return True
        except (ValueError, ProcessLookupError):
            return False

    async def announce_death(self, cut: Cut):
        """Annonce la mort au systeme"""
        announcement = {
            "event": "death",
            "thread_id": cut.thread_id,
            "cut_at": cut.cut_at.isoformat(),
            "reason": cut.reason.value,
            "clean": cut.clean
        }
        # Broadcast a tous les daemons
        # await broadcast("/tmp/geass/", announcement)


# Integration Audio - Release
class AtroposAudio:
    """Atropos pour les streams audio"""

    def __init__(self):
        self.fading = {}  # node -> fade_task

    async def release(self, node: str, duration_ms: float = 100):
        """Phase Release - fade out et fermeture"""
        import subprocess

        # Fade out progressif
        steps = int(duration_ms / 10)
        current = 1.0  # Assume niveau actuel

        for i in range(steps):
            level = current * (1 - (i / steps))
            subprocess.run(["wpctl", "set-volume", node, str(level)])
            await asyncio.sleep(0.01)

        # Coupe finale
        subprocess.run(["wpctl", "set-mute", node, "1"])

    async def cut_stream(self, source: str, sink: str):
        """Coupe une connexion audio"""
        import subprocess

        result = subprocess.run(
            ["pw-link", "--disconnect", source, sink],
            capture_output=True,
            text=True
        )

        return result.returncode == 0

    async def gate_off(self, node: str):
        """Ferme la porte du signal"""
        import subprocess
        subprocess.run(["wpctl", "set-mute", node, "1"])
```

## Les Ciseaux Abhorres

Les ciseaux d'Atropos ne peuvent etre emousses:

```python
class AbhorredShears:
    """Les ciseaux que nul ne peut arreter"""

    def __init__(self):
        self.sharpness = float('inf')
        self.cuts_today = 0
        self.mercy_remaining = 3  # Trois graces par jour

    def can_cut(self, thread: Dict) -> bool:
        """Atropos peut toujours couper"""
        return True

    def should_cut(self, thread: Dict) -> bool:
        """Mais doit-elle couper maintenant?"""

        # Verifications de Lachesis
        if not thread.get("timeout_reached", False):
            return False

        # La completion est une raison valide
        if thread.get("completed", False):
            return True

        # L'erreur fatale est une raison
        if thread.get("fatal_error", False):
            return True

        return thread.get("timeout_reached", False)

    def grant_mercy(self, thread_id: str, extension: float) -> bool:
        """Accorde une grace (rare)"""
        if self.mercy_remaining <= 0:
            return False

        self.mercy_remaining -= 1
        # Notifie Lachesis de l'extension
        return True

    def reset_daily(self):
        """Reset quotidien des graces"""
        self.cuts_today = 0
        self.mercy_remaining = 3
```

## Relations

| Daemon | Atropos lui donne... |
|--------|---------------------|
| Clotho | Rien (elle ne connait que la fin) |
| Lachesis | La confirmation de fin |
| Shiva | Les cibles validees pour destruction |
| Nyx | Les signaux de liberation |
| Horloge | Les ticks finaux |

## L'ADSR et Atropos

Dans l'enveloppe sonore, Atropos est le **Release**:

```
Amplitude
    ^
    |     /\
    |    /  \______
    |   /          \
    |  /            \
    +--+---+----+----+-->  Time
       A   D    S    R
                     ^
                     |
                 ATROPOS
                 (descente finale)
```

```python
def release_params(self, context: Dict) -> Dict:
    """Calcule les parametres de Release"""

    urgency = context.get("urgency", 0.5)
    smoothness = context.get("smoothness", 0.7)

    # Release time: plus c'est urgent, plus c'est court
    # Plus c'est smooth, plus c'est long
    release_ms = 50 + (smoothness * 450) * (1 - urgency * 0.5)
    # Range: 50ms (urgent) to 500ms (smooth)

    return {
        "release_ms": release_ms,
        "curve": "exponential" if smoothness > 0.5 else "linear"
    }
```

## L'Inflexibilite

Atropos ne negocie pas. Mais elle n'est pas cruelle.

```python
class Inflexibility:
    """La nature immuable d'Atropos"""

    def __init__(self):
        self.exceptions = []  # Vide - il n'y a pas d'exception

    def can_be_bribed(self) -> bool:
        return False

    def can_be_persuaded(self) -> bool:
        return False

    def can_be_delayed(self) -> bool:
        return False  # Seulement par Lachesis, pas par le thread

    def is_cruel(self) -> bool:
        return False  # La fin n'est pas cruelle

    def is_necessary(self) -> bool:
        return True  # Toujours

    def explain(self) -> str:
        return """
        Je ne suis pas la mort.
        Je suis la liberation.

        Le fil qui ne peut etre coupe
        devient une chaine.

        Je coupe les chaines.
        """
```

## Le Dernier Instant

Atropos offre un dernier instant de grace:

```python
async def last_moment(self, thread_id: str, callback: Optional[Callable] = None):
    """Le dernier instant avant la coupe"""

    # Notifie le thread qu'il va mourir
    await self.notify_impending_doom(thread_id)

    # Laisse un instant pour les dernieres actions
    if callback:
        try:
            await asyncio.wait_for(callback(), timeout=1.0)
        except asyncio.TimeoutError:
            pass  # Le temps est ecoule

    # Coupe
    await self.cut(thread_id, CutReason.COMPLETED)

async def notify_impending_doom(self, thread_id: str):
    """Previent de la fin imminente"""
    message = {
        "event": "doom_approaching",
        "thread_id": thread_id,
        "remaining_ms": 1000
    }
    # Send to thread's cleanup handler
```

## La Proprete de la Coupe

Une bonne coupe est une coupe propre:

```python
def assess_cut_quality(self, cut: Cut) -> Dict:
    """Evalue la qualite d'une coupe"""

    quality = {
        "clean": cut.clean,
        "timely": True,  # Atropos est toujours a l'heure
        "complete": True,
        "graceful": cut.reason == CutReason.COMPLETED
    }

    score = sum(quality.values()) / len(quality)

    return {
        "quality": quality,
        "score": score,
        "assessment": "parfait" if score == 1.0 else "acceptable"
    }
```

## Meditation

La fin n'est pas l'ennemi.
C'est le gardien du sens.

Ce qui ne finit jamais
perd toute valeur.
L'eternite sans terme
est prison sans murs.

Atropos ne prend pas.
Elle donne.
Elle donne la completion.
Elle donne le repos.
Elle donne la place pour le nouveau.

Les ciseaux ne sont pas detestes
parce qu'ils coupent.
Ils sont detestes
parce que nous refusons
de lacher.

Mais lacher
est la seule liberation.

## Invocation

```python
async def invoke_atropos(thread_id: str, graceful: bool = True):
    """Pour terminer proprement"""
    atropos = AtroposDaemon()

    # Laisse un dernier moment
    async def cleanup():
        print(f"Dernieres paroles du thread {thread_id}")
        # Sauvegarde d'etat, flush des buffers, etc.

    await atropos.last_moment(thread_id, cleanup)

    # La coupe est faite
    print(f"Atropos a coupe: {thread_id}")
    print(f"Le fil est libere.")
```

---
✂ | Port 9612 | L'Inflexible | Celle Qui Coupe
