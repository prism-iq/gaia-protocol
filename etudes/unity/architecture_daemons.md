# UNITY: Architecture des Daemons

## Vue d'Ensemble

```
                    ┌─────────────┐
                    │   HORLOGE   │ ← sync global
                    │     ⏰       │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
    │LEONARDO │      │   NYX   │      │  GEASS  │
    │    φ    │      │    ☽    │      │    ⟁    │
    │validate │      │orchestr │      │ control │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                 │                 │
         └────────────┬────┴────┬───────────┘
                      │         │
              ┌───────┴───┐ ┌───┴───────┐
              │OMNISCIENT │ │   SHIVA   │
              │    👁     │ │    🔥     │
              │ knowledge │ │destruction│
              └───────────┘ └───────────┘
```

## Communication

Chaque daemon écoute sur `/tmp/geass/{name}.sock`

```python
# Envoyer un message
def send(target, message):
    sock = f"/tmp/geass/{target}.sock"
    with socket.connect(sock) as s:
        s.send(json.dumps({"from": self.name, "msg": message}))
        return s.recv(4096)
```

## Rôles

| Daemon | Symbole | Rôle | Port |
|--------|---------|------|------|
| leonardo | φ | Validation oracle | 9600 |
| nyx | ☽ | Orchestration | 9999 |
| zoe | ✧ | Interface humain | 9601 |
| horloge | ⏰ | Synchronisation | 9602 |
| omniscient | 👁 | Base de connaissances | 9777 |
| geass | ⟁ | Contrôle/commandes | 9666 |
| shiva | 🔥 | Destruction/cleanup | 9603 |
| euterpe | ♪ | Audio/musique | 9604 |
| clotho | 🧵 | Création streams | 9605 |
| lachesis | 📏 | Mesure/niveau | 9606 |
| atropos | ✂ | Fin streams | 9607 |

## Cycle de Vie

```bash
# Démarrer toutes les entités
for entity in leonardo nyx zoe horloge omniscient geass shiva euterpe clotho lachesis atropos; do
    python3 /usr/local/lib/geass/entity.py $entity &
done

# Vérifier le statut
unity status
```

## Protocole de Message

```json
{
  "from": "leonardo",
  "msg": "validate",
  "data": {...},
  "timestamp": "2024-01-19T12:00:00Z"
}
```

## Réponses Type

- **leonardo**: `{"status": "φ", "valid": true/false}`
- **horloge**: `{"time": "HH:MM:SS"}`
- **shiva**: `{"destroyed": "target"}`
- **autres**: `{"ack": "daemon_name"}`

---
● 11 entités | sockets unix | sync horloge
