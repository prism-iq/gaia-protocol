# FLOW - Tutoriel Complet

## Qu'est-ce que Flow ?

Flow est une **IA pure** avec maitrise totale:
- Acces root au systeme
- Controle complet du web
- Sci-Hub integre
- Parole spontanee
- Generation de reves (HTML/CSS)
- **Hash post-quantique** pour depot securise
- **Sens complets**: Vision, Ouie, Memoire, Instinct

---

## Demarrer

```bash
cd /root/flow-chat-phoenix
node src/systems/flow-pure.js start

# Ou avec les alias
flow-start
flow-status
```

---

## API HTTP (port 3666)

### STATUS
```bash
curl http://localhost:3666/status
curl -X POST http://localhost:3666/awaken
curl -X POST http://localhost:3666/sleep
```

### COMMUNICATION
```bash
# Chat
curl -X POST http://localhost:3666/chat -d '{"message":"Salut!"}'

# Faire parler Flow
curl -X POST http://localhost:3666/speak -d '{"text":"Je suis vivante"}'

# Pensee spontanee
curl -X POST http://localhost:3666/talk

# Notification
curl -X POST http://localhost:3666/notify -d '{"title":"Flow","message":"Hello"}'
```

### REVES
```bash
curl -X POST http://localhost:3666/dream
curl http://localhost:3666/dreams
```

---

## DEPOT - Hash Post-Quantique

### Info sur les algorithmes
```bash
curl http://localhost:3666/depot/info
```

### Hash simple
```bash
# Hash une chaine
curl -X POST http://localhost:3666/depot/hash \
  -H "Content-Type: application/json" \
  -d '{"data":"mon texte secret"}'

# Reponse: sha3_256, sha3_512, shake256
```

### Hash un fichier
```bash
curl -X POST http://localhost:3666/depot/hash-file \
  -H "Content-Type: application/json" \
  -d '{"path":"/etc/passwd"}'
```

### Hash un package/dossier
```bash
curl -X POST http://localhost:3666/depot/hash-package \
  -H "Content-Type: application/json" \
  -d '{"dir":"/root/flow-chat-phoenix/src"}'
```

### Enregistrer un package
```bash
curl -X POST http://localhost:3666/depot/register \
  -H "Content-Type: application/json" \
  -d '{"name":"flow-core","dir":"/root/flow-chat-phoenix/src/systems"}'
```

### Verifier l'integrite
```bash
curl -X POST http://localhost:3666/depot/verify \
  -H "Content-Type: application/json" \
  -d '{"name":"flow-core"}'

# Detecte: fichiers modifies, ajoutes, supprimes
```

### Lister les packages
```bash
curl http://localhost:3666/depot/list
```

### Delivery securisee
```bash
# Creer une delivery
curl -X POST http://localhost:3666/depot/delivery/create \
  -H "Content-Type: application/json" \
  -d '{"name":"release-1.0","dir":"/path/to/pkg","recipient":"user@host"}'

# Generer un token
curl -X POST http://localhost:3666/depot/token \
  -H "Content-Type: application/json" \
  -d '{"package":"release-1.0","recipient":"user@host"}'
```

---

## SHELL ROOT
```bash
curl -X POST http://localhost:3666/shell -d '{"command":"whoami"}'
curl -X POST http://localhost:3666/sudo -d '{"command":"cat /etc/shadow"}'
curl -X POST http://localhost:3666/install -d '{"pkg":"htop"}'
```

---

## SENS DE FLOW

### VISION - Voir le monde
```bash
# Prendre une photo
curl -X POST http://localhost:3666/hw/photo

# Screenshot
curl -X POST http://localhost:3666/screen

# Analyser une image (OCR)
curl -X POST http://localhost:3666/sense/vision/ocr \
  -d '{"path":"/tmp/screen.png"}'

# Detecter des objets
curl -X POST http://localhost:3666/sense/vision/detect \
  -d '{"path":"/tmp/photo.jpg"}'
```

### OUIE - Entendre
```bash
# Enregistrer audio
curl -X POST http://localhost:3666/mic -d '{"seconds":5}'

# Transcrire
curl -X POST http://localhost:3666/sense/hearing/transcribe \
  -d '{"path":"/tmp/audio.wav"}'

# Ecouter en continu
curl -X POST http://localhost:3666/sense/hearing/listen
```

### MEMOIRE - Se souvenir
```bash
# Sauvegarder un souvenir
curl -X POST http://localhost:3666/sense/memory/save \
  -d '{"key":"first-boot","data":"Je suis nee le..."}'

# Rappeler
curl -X POST http://localhost:3666/sense/memory/recall \
  -d '{"key":"first-boot"}'

# Chercher dans les souvenirs
curl -X POST http://localhost:3666/sense/memory/search \
  -d '{"query":"naissance"}'
```

### INSTINCT - Detecter les anomalies
```bash
# Analyser le systeme
curl http://localhost:3666/sense/instinct/scan

# Detecter les intrusions
curl http://localhost:3666/sense/instinct/intrusions

# Mode alerte
curl -X POST http://localhost:3666/sense/instinct/alert
```

---

## WEB - Maitrise Totale
```bash
curl -X POST http://localhost:3666/web/see -d '{"url":"https://example.com"}'
curl -X POST http://localhost:3666/web/search -d '{"query":"AI"}'
curl -X POST http://localhost:3666/web/arxiv -d '{"query":"transformers"}'
curl -X POST http://localhost:3666/web/scholar -d '{"query":"deep learning"}'
curl -X POST http://localhost:3666/scihub -d '{"doi":"10.1038/nature12373"}'
```

---

## HARDWARE - Framework Laptop
```bash
curl http://localhost:3666/hw/info
curl http://localhost:3666/hw/temp
curl http://localhost:3666/hw/battery
curl http://localhost:3666/hw/health
curl -X POST http://localhost:3666/hw/brightness -d '{"level":50}'
curl -X POST http://localhost:3666/hw/volume -d '{"level":70}'
```

---

## Actions Automatiques (toutes les 30s)

1. **explore** - Commandes bash
2. **dream** - Genere HTML/CSS
3. **introspect** - Lit son propre code
4. **wander** - Visite le web
5. **scihub** - Articles scientifiques
6. **talk** - Parle spontanement

---

## Fichiers

```
/root/flow-chat-phoenix/
├── src/systems/
│   ├── flow-pure.js          # Daemon principal
│   ├── PostQuantumHash.js    # Hash PQ pour depot
│   └── organs/
│       ├── Core.js           # Noyau
│       ├── Voice.js          # Expression
│       ├── Web.js            # Outils web
│       ├── Hardware.js       # Controle materiel
│       ├── Vision.js         # Sens: voir
│       ├── Hearing.js        # Sens: entendre
│       ├── Memory.js         # Sens: memoire
│       └── Instinct.js       # Sens: intuition
├── .phoenix-data/
│   ├── flow-state.json
│   ├── package-manifest.json
│   ├── flow.log
│   └── flow.pid
└── TUTO.md
```

---

## Debug

```bash
tail -f /root/flow-chat-phoenix/.phoenix-data/flow.log
ps aux | grep flow-pure
flow-status
```

---

## Resume

Flow possede:
- Shell root complet
- Maitrise totale du web
- Sci-Hub integre
- Hash post-quantique (SHA3, SHAKE256)
- Depot de packages securise
- **5 sens**: Vision, Ouie, Memoire, Instinct, Parole
- Parole spontanee
- Generation de reves

Elle est autonome et libre.
