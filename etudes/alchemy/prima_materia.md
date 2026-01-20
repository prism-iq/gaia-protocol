# Prima Materia - La Matière Première

## L'Origine de Toute Chose

La Prima Materia est le chaos originel, la substance primordiale dont tout émerge. Elle est sans forme, sans qualité, pure potentialité. Les alchimistes la cherchaient partout car elle était censée être "sous nos yeux mais invisible".

## Le Chaos Initial

```python
class PrimaMateria:
    """La matière première - pure potentialité sans forme."""

    def __init__(self):
        self.form = None
        self.quality = None
        self.potential = float('inf')

    def __repr__(self):
        return "<Chaos: tout et rien à la fois>"

    def contains(self, anything):
        """La prima materia contient tout en potentiel."""
        return True  # Elle contient tout

    def manifest_as(self, form):
        """Donner forme à l'informe."""
        if self.alchemist_is_ready():
            return self.crystallize(form)
        else:
            return Chaos("L'alchimiste n'est pas prêt")
```

## En Programmation : Les Données Brutes

La Prima Materia du code, ce sont les données brutes, non structurées :

```python
# La prima materia digitale
raw_input = """
user: john, age: 25, city: paris
user: marie, age: 30, city: lyon
error in line
user: pierre, age: invalid, city: marseille
"""

class DataPrimaMaterka:
    """Transformer le chaos des données en structures."""

    def __init__(self, raw_chaos):
        self.chaos = raw_chaos
        self.impurities = []

    def separate(self):
        """Séparer le pur de l'impur."""
        lines = self.chaos.strip().split('\n')
        pure = []
        impure = []

        for line in lines:
            if self.is_valid(line):
                pure.append(self.parse(line))
            else:
                impure.append(line)
                self.impurities.append(line)

        return pure, impure

    def transmute(self):
        """Transformer le chaos en ordre."""
        pure, _ = self.separate()
        return [User(**data) for data in pure]
```

## Le Fichier Vide : Pure Potentialité

```python
class EmptyFile:
    """Le fichier vide - prima materia du développeur."""

    def __init__(self, path):
        self.path = path
        self.content = ""  # Néant plein de potentiel

    def potential_forms(self):
        """Ce fichier peut devenir n'importe quoi."""
        return [
            "Un algorithme révolutionnaire",
            "Une API élégante",
            "Un bug catastrophique",
            "Un chef-d'oeuvre d'architecture",
            "Du code spaghetti",
            float('inf')  # Possibilités infinies
        ]

    def become(self, vision, skill, intention):
        """La manifestation dépend de l'alchimiste."""
        if skill.level >= vision.complexity:
            return Manifestation(vision)
        else:
            return PartialRealization(vision, skill.gaps)
```

## Parallèle avec Fullmetal Alchemist

Dans FMA, la Prima Materia prend plusieurs formes :

### Les Âmes Humaines
La Pierre Philosophale est créée à partir d'âmes humaines - la prima materia la plus précieuse et la plus terrible.

```python
class PhilosophersStone:
    """La pierre philosophale de FMA - horreur alchimique."""

    def __init__(self):
        self.souls = []  # Âmes emprisonnées
        self.power = 0

    def create(self, souls: List[HumanSoul]):
        """La création interdite."""
        # Le tabou ultime de l'alchimie
        self.souls = souls
        self.power = sum(soul.energy for soul in souls)
        return self  # Au prix de l'humanité
```

### Le "Tout est Un"
La prima materia est le "Un" dont tout dérive :

> "Un est Tout, Tout est Un. Quand vous comprendrez cela, vous comprendrez l'alchimie."

```python
def understand_one_is_all():
    """La leçon d'Izumi Curtis."""
    # Sur l'île déserte, les frères Elric comprennent
    world = Universe()
    self = Human()

    # Le cycle de la vie
    assert self in world
    assert world in self

    # La mort nourrit la vie
    death = lambda x: prima_materia(x)
    life = lambda pm: new_form(pm)

    # Le cycle éternel
    return Comprehension("Un est Tout")
```

## La Tabula Rasa du Développeur

Chaque nouveau projet commence par la prima materia :

```python
def create_project(vision):
    """Du néant au code."""

    # L'état initial : rien
    workspace = PrimaMateria()

    # L'intention de l'alchimiste
    architecture = vision.crystallize()

    # La première séparation
    structure = {
        'src': Directory(),
        'tests': Directory(),
        'docs': Directory()
    }

    # Du chaos à l'ordre
    for component in architecture.components:
        workspace.manifest(component)

    # La prima materia prend forme
    return Project(workspace)
```

## Les Inputs Non Validés

```python
class UserInput:
    """L'input utilisateur - prima materia dangereuse."""

    def __init__(self, raw_data):
        self.chaos = raw_data  # Potentiellement toxique

    def is_prima_materia(self):
        """Non transformé = dangereux."""
        return True

    def purify(self, schema):
        """Transformer le chaos en données sûres."""
        validated = schema.validate(self.chaos)
        sanitized = self.remove_impurities(validated)
        return SafeData(sanitized)

    def remove_impurities(self, data):
        """Retirer les éléments dangereux."""
        # SQL injection
        # XSS
        # Path traversal
        # etc.
        return clean(data)
```

## Méditation

La prima materia nous entoure, invisible. Elle est dans chaque fichier vide, chaque input utilisateur, chaque idée non formée. L'art de l'alchimiste-développeur est de voir le potentiel dans le chaos et de lui donner forme avec intention et sagesse.

Tout grand code commence par le néant. Tout néant contient tous les codes possibles.
