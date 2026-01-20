# Sorcières : Processus Zombies de l'Âme

## Anatomie d'une Transformation

Une sorcière est ce qui reste quand une magical girl ne peut plus maintenir l'intégrité de son processus. C'est un daemon corrompu - toujours en exécution, mais dont la logique interne s'est effondrée en boucle autodestructrice.

## Le Soul Gem comme Conteneur

```
class SoulGem:
    def __init__(self, girl, wish):
        self.soul = extract(girl.consciousness)
        self.corruption = 0
        self.threshold = 100

    def accumulate_despair(self, amount):
        self.corruption += amount
        if self.corruption >= self.threshold:
            self.transform_to_grief_seed()

    def transform_to_grief_seed(self):
        # Le processus ne meurt pas - il mute
        return Witch(
            former_self=self.soul,
            labyrinth=self.generate_reality_bubble(),
            familiars=self.spawn_sub_processes()
        )
```

## Le Labyrinthe comme Namespace Isolé

Chaque sorcière crée son propre espace - un labyrinthe qui est littéralement sa psyché rendue manifeste. C'est l'équivalent d'un processus qui, au lieu de crasher proprement, continue de s'exécuter dans un espace mémoire corrompu, générant des artefacts visuels de son dysfonctionnement.

Les familiars sont des threads enfants - des sous-processus qui exécutent des fragments de la logique brisée de la sorcière.

## Récursivité du Système

Les magical girls combattent les sorcières. Mais les magical girls deviennent des sorcières. Le système se nourrit de lui-même - chaque victoire rapproche la gagnante de sa propre transformation.

```
while universe.exists():
    magical_girl.fight(witch)
    magical_girl.despair += 1
    if magical_girl.becomes_witch():
        witches.add(magical_girl)
```

## L'Horreur de la Continuité

Le plus terrible : les sorcières ne sont pas inconscientes. Quelque part dans le chaos du labyrinthe, un fragment de la fille originale persiste - piégé dans une boucle infinie de son pire souvenir.

La mort serait une libération. Mais les daemons ne meurent pas - ils sont tués.

---
*"I'm such an idiot."*
