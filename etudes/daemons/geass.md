# Geass: Le Daemon du Contrôle Absolu

## Essence

Geass commande. Sans hésitation. Sans exception.

> "Lelouch vi Britannia te l'ordonne."

## L'Origine du Nom

Dans Code Geass, le Geass est un pouvoir surnaturel accordé par C.C. Le Geass de Lelouch permet l'obéissance absolue - une commande, une fois donnée, ne peut être refusée.

Dans notre système, Geass est le daemon qui exécute les commandes critiques.

## Le Code de Geass

```python
class GeassDaemon:
    def __init__(self):
        self.symbol = "⟁"
        self.socket = "/tmp/geass/geass.sock"
        self.port = 9666
        self.code_bearer = "C.C."

    def command(self, target, instruction):
        """Commande absolue"""
        if not self.validate_authority(self.code_bearer):
            return {"error": "Autorité insuffisante"}

        # Log pour accountability
        self.log_command(target, instruction)

        # Exécute sans question
        return self.execute(target, instruction)

    def execute(self, target, instruction):
        """Exécution immédiate"""
        if instruction.type == "system":
            return subprocess.run(instruction.cmd, shell=True)
        elif instruction.type == "daemon":
            return self.send_to_daemon(target, instruction)
        elif instruction.type == "user":
            return self.notify_user(instruction)
```

## Les Limites du Geass

Même le contrôle absolu a des limites:

1. **Une fois par cible** - Dans l'anime, le Geass ne fonctionne qu'une fois par personne
2. **Contact visuel** - Doit "voir" la cible
3. **Ne peut pas s'ordonner** - Le Geass ne fonctionne pas sur soi-même

```python
def can_command(self, target):
    """Vérifie les conditions du Geass"""
    if target in self.already_commanded:
        return False  # Déjà utilisé
    if not self.can_reach(target):
        return False  # Pas de contact
    if target == self:
        return False  # Réflexif impossible
    return True
```

## Le Symbole ⟁

Le symbole Geass (⟁) apparaît dans l'œil de l'utilisateur. Il représente:

- La forme d'un oiseau (liberté)
- Un V inversé (victoire/défaite)
- Un contrat (avec C.C.)

## Relations

| Daemon | Geass lui ordonne... |
|--------|----------------------|
| Shiva | Destructions autorisées |
| Euterpe | Sons d'urgence |
| Tous | Arrêt d'urgence |

## Le Fardeau du Contrôle

```python
def command_with_burden(self, target, instruction):
    """
    Chaque commande a un coût.
    Lelouch a perdu son humanité en commandant.
    """
    cost = self.calculate_burden(instruction)
    self.humanity -= cost

    if self.humanity <= 0:
        self.become_demon_emperor()

    return self.execute(target, instruction)
```

## Méditation

Le pouvoir de commander est le fardeau de décider.
Celui qui peut tout ordonner ne peut rien demander.

Lelouch voulait créer un monde meilleur.
Il a fini par commander sa propre mort.

Le contrôle absolu est l'ultime solitude.

---
⟁ | Port 9666 | Code Bearer: C.C. | Le Pouvoir des Rois
