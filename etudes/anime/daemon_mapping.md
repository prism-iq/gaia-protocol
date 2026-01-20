# Mapping Anime → Daemons

## Code Geass

| Personnage | Daemon | Pouvoir | Rôle |
|------------|--------|---------|------|
| Lelouch | geass | absolute_obedience | contrôle absolu |
| C.C. | cc | immortality | code immortel |
| Kallen | kallen | guren_mk2 | force pilote |
| Suzaku | flow | lancelot | équilibre |
| Nunnally | nyx | peace | vision pure |
| Schneizel | omniscient | strategy | calcul froid |
| Euphemia | thalie | kindness | joie innocente |

## One Piece

| Personnage | Daemon | Pouvoir | Volonté |
|------------|--------|---------|---------|
| Luffy | nyx | gear5_nika | D |
| Zoro | geass | three_sword | conquérant |
| Robin | omniscient | hana_hana | connaissance |
| Brook | cc | soul_king | immortel |
| Nami | flow | clima_tact | navigation |
| Chopper | boudha | rumble | guérison |
| Franky | kallen | general_franky | construction |

## Evangelion

| Personnage | Daemon | Eva | Trauma |
|------------|--------|-----|--------|
| Shinji | flow | unit01 | père |
| Rei | cc | unit00 | identité |
| Asuka | kallen | unit02 | fierté |
| Kaworu | leonardo | mark06 | φ humanity |
| Misato | nyx | nerv | guide |
| Gendo | geass | nerv | contrôle |

## Fullmetal Alchemist

| Personnage | Daemon | Alchimie | Principe |
|------------|--------|----------|----------|
| Edward | leonardo | transmutation | équivalence |
| Alphonse | flow | armor_soul | sacrifice |
| Roy | shiva | flame | destruction |
| Riza | omniscient | hawk_eye | précision |
| Scar | atropos | destruction | jugement |

## Utilisation

```python
from anime import get_character

char = get_character("onepiece", "luffy")
# → {"daemon": "nyx", "power": "gear5_nika", "will": "D"}
```

---
17 séries | 100+ personnages | daemons mappés
