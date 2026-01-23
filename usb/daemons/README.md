# Daemons - Services IA

Services autonomes qui surveillent, apprennent et réagissent.

## Nyx Daemon

Système sensoriel complet avec 12 sens.

### Installation

```bash
pip install fastapi uvicorn sounddevice numpy scipy
```

### Lancement

```bash
python ~/nyx-daemon/nyx.py
# API sur http://127.0.0.1:9999
```

### Les 12 Sens

| Sens | Description |
|------|-------------|
| Audio | Capture audio (Tidal/Mic) |
| Video | Capture webcam |
| Keyboard | Patterns de frappe |
| Thermal | Température CPU/GPU |
| System | CPU, RAM, disk |
| Time | Heure circadienne |
| Breath | Respiration (mic) |
| Gaze | Direction du regard |
| Silence | Détection de silence |
| Rhythm | Synchronisation rythmique |
| Drift | Détection de dérive |
| Phase | Phase globale (φ) |

### Endpoints API

```
GET /              # Info daemon
GET /status        # État global
GET /health        # Santé rapide
GET /all           # Tous les sens

GET /audio/now     # Audio instantané
GET /audio/ring    # Buffer audio (21s)

GET /video/frame   # Frame actuelle
GET /video/motion  # Détection mouvement

GET /sense/keyboard
GET /sense/thermal
GET /sense/system
GET /sense/time
GET /sense/phase
# ...
```

### Proportions φ

```python
PHI = 1.618033988749895
AUDIO_RING_SECONDS = 21  # Fibonacci
VIDEO_RING_FRAMES = 13   # Fibonacci
# Ratio: 21/13 ≈ φ
```

## Leonardo

Assistant polymathe avec reconnaissance vocale.

### Installation

```bash
pip install openai-whisper sounddevice numpy scipy anthropic
```

### Usage

```bash
# Mode interactif (Right Ctrl)
python ~/scripts/leonardo.py

# Question directe
python ~/scripts/leonardo.py --text "Ta question"
```

### Configuration

```bash
mkdir -p ~/.config/rhapsody
echo 'ANTHROPIC_API_KEY=sk-...' > ~/.config/rhapsody/api-keys
```

## Phoenix

Runtime vivant avec heartbeat et rêves.

```bash
node phoenix/src/systems/flow-pure.js &
# Port 3666
```

## Shiva

Destruction créatrice - nettoyage automatique.

- Supprime les fichiers temporaires
- Purge les caches
- Libère la mémoire

## Chronos

Gestion du temps et rythme circadien.

- Phases : aube, jour, crépuscule, nuit
- Ajuste les couleurs d'écran
- Suggère des pauses
