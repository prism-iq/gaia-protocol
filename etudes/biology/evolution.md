# Évolution : L'Algorithme de la Vie

## Le Premier Algorithme Génétique

L'évolution par sélection naturelle est un algorithme d'optimisation
qui tourne depuis 3.8 milliards d'années. Sans programmeur, sans objectif explicite,
il a produit toute la diversité du vivant.

## Les Mécanismes Fondamentaux

### Le Cycle Évolutif

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │Variation │───▶│Sélection │───▶│Hérédité  │─────┐       │
│   │(mutation)│    │(fitness) │    │(reproduction)  │       │
│   └──────────┘    └──────────┘    └──────────┘     │       │
│        ▲                                            │       │
│        │                                            │       │
│        └────────────────────────────────────────────┘       │
│                                                             │
│                    ITÉRATION                                │
│              (génération après génération)                  │
└─────────────────────────────────────────────────────────────┘
```

### Implémentation

```python
class Evolution:
    """
    L'algorithme évolutif de Darwin-Wallace
    Le premier algorithme génétique
    """

    def __init__(self, population, environment):
        self.population = population
        self.environment = environment
        self.generation = 0

    def run(self, max_generations=float('inf')):
        while self.generation < max_generations:
            # 1. Variation : mutations et recombinaison
            self.mutate(self.population)
            self.recombine(self.population)

            # 2. Sélection : survie différentielle
            fitness_scores = self.evaluate(self.population)
            survivors = self.select(self.population, fitness_scores)

            # 3. Reproduction : transmission héréditaire
            self.population = self.reproduce(survivors)

            self.generation += 1

            # Pas de condition d'arrêt explicite
            # L'évolution ne "termine" jamais
```

## Daemon : Le Processus Évolutif

```bash
#!/bin/bash
# /etc/systemd/system/evolution.service
# Le daemon qui ne s'arrête jamais

[Unit]
Description=Natural Selection Daemon
After=abiogenesis.target
Requires=environment.service

[Service]
Type=simple
ExecStart=/usr/lib/life/evolve --continuous
Restart=always
RestartSec=generation

# Pas de timeout - tourne depuis 3.8 milliards d'années
TimeoutStartSec=infinity
TimeoutStopSec=infinity

# Resources adaptatives
MemoryMax=biosphere
CPUQuota=solar_energy

[Install]
WantedBy=life.target
```

## Types de Sélection

```python
class SelectionTypes:
    """
    Différents modes de sélection naturelle
    """

    @staticmethod
    def directional(population, trait, direction='higher'):
        """
        Sélection directionnelle : favorise un extrême
        Ex: girafes avec cou plus long

        fitness
           ▲
           │     ╱
           │    ╱
           │   ╱
           └──────────────▶ trait
        """
        if direction == 'higher':
            return sorted(population, key=lambda x: x.trait)[-50:]
        else:
            return sorted(population, key=lambda x: x.trait)[:50]

    @staticmethod
    def stabilizing(population, trait, optimum):
        """
        Sélection stabilisante : favorise la moyenne
        Ex: poids de naissance humain optimal

        fitness
           ▲
           │    ╱╲
           │   ╱  ╲
           │  ╱    ╲
           └──────────────▶ trait
        """
        return [ind for ind in population
                if abs(ind.trait - optimum) < threshold]

    @staticmethod
    def disruptive(population, trait):
        """
        Sélection disruptive : favorise les extrêmes
        Ex: becs de pinsons (gros grains vs petits)

        fitness
           ▲
           │  ╲    ╱
           │   ╲  ╱
           │    ╲╱
           └──────────────▶ trait
        """
        return [ind for ind in population
                if ind.trait < low_threshold or ind.trait > high_threshold]
```

## Fitness : La Fonction Objectif Implicite

```python
def fitness(individual, environment):
    """
    La fitness n'est pas un objectif explicite.
    C'est une mesure émergente du succès reproductif.

    fitness = nombre de descendants viables
    """

    survival_probability = (
        individual.adaptation_to(environment) *
        individual.avoid_predators() *
        individual.find_resources() *
        individual.resist_disease()
    )

    reproduction_success = (
        individual.attract_mates() *
        individual.produce_viable_offspring() *
        individual.care_for_young()
    )

    # La vraie fitness est rétrospective
    return survival_probability * reproduction_success
```

## Mutations : Source de Variation

```python
class MutationTypes:
    """
    Les mutations sont les générateurs de variation
    Sans elles, pas d'évolution possible
    """

    def point_mutation(self, sequence, rate=1e-8):
        """Changement d'une seule base"""
        for i, base in enumerate(sequence):
            if random() < rate:
                sequence[i] = choice(['A', 'T', 'G', 'C'])
        return sequence

    def duplication(self, genome, gene):
        """
        Duplication génique : copie d'un gène
        Source majeure de nouveauté évolutive

        Une copie garde la fonction originale
        L'autre est libre d'évoluer (néofonctionnalisation)
        """
        genome.insert(gene.position + 1, gene.copy())
        return genome

    def horizontal_transfer(self, recipient, donor_gene):
        """
        Transfert horizontal : échange entre espèces
        Commun chez les bactéries
        Comme importer une bibliothèque externe
        """
        recipient.genome.append(donor_gene)
        return recipient
```

## Coévolution : La Course aux Armements

```python
class Coevolution:
    """
    Quand deux espèces évoluent en réponse l'une à l'autre
    """

    def predator_prey(self, predator, prey):
        """
        Course aux armements évolutive
        Guépard plus rapide → gazelle plus rapide → ...
        """
        while True:
            if predator.speed > prey.speed:
                prey.evolve_speed()
            else:
                predator.evolve_speed()
            # Aucun ne "gagne" définitivement
            # Red Queen hypothesis

    def host_parasite(self, host, parasite):
        """
        Le parasite s'adapte à l'hôte
        L'hôte développe des défenses
        Cycle sans fin
        """
        pass

    def mutualism(self, species_a, species_b):
        """
        Coévolution mutualiste
        Les deux espèces bénéficient
        Ex: fleurs et pollinisateurs
        """
        species_a.adapt_to(species_b)
        species_b.adapt_to(species_a)
        # Fitness des deux augmente
```

## Spéciation : Fork du Code Génétique

```python
class Speciation:
    """
    Formation de nouvelles espèces
    Comme un fork dans un repository
    """

    def allopatric(self, population, barrier):
        """
        Spéciation allopatrique : séparation géographique

        Population       Barrière       Deux espèces
            ●      →    ●│●      →       ○  ◆
           ●●           ●│●             ○○  ◆◆
        """
        pop_a, pop_b = barrier.split(population)

        # Évolution indépendante
        for generation in range(many):
            pop_a.evolve(environment_a)
            pop_b.evolve(environment_b)

        # Après assez de divergence
        if not can_interbreed(pop_a, pop_b):
            return Species(pop_a), Species(pop_b)

    def sympatric(self, population, niche_differentiation):
        """
        Spéciation sympatrique : même lieu, niches différentes
        Plus rare mais possible
        """
        pass
```

## Exaptation : Refactoring Évolutif

```python
def exaptation(trait, original_function, new_function):
    """
    Exaptation : un trait évolué pour une fonction
    est coopté pour une autre

    Exemples:
    - Plumes : thermorégulation → vol
    - Vessie natatoire : flottaison → poumons
    - Os de mâchoire : mastication → os de l'oreille

    C'est le refactoring de l'évolution
    """
    if trait.current_use == original_function:
        if new_function.fitness_benefit > 0:
            trait.current_use = new_function
            # L'ancienne fonction peut être conservée ou perdue
```

## Contraintes et Trade-offs

```python
class EvolutionaryConstraints:
    """
    L'évolution ne peut pas tout optimiser
    """

    def phylogenetic_constraint(self, organism):
        """
        Contrainte phylogénétique : l'histoire limite les possibles

        Les vertébrés ont 4 membres car leur ancêtre en avait 4
        Pas de roues biologiques malgré leur efficacité

        C'est le "code legacy" de l'évolution
        """
        return organism.must_build_on(ancestor.body_plan)

    def tradeoff(self, trait_a, trait_b):
        """
        Trade-off : améliorer un trait dégrade un autre

        Ex: défense immunitaire forte ↔ reproduction réduite
        Ex: taille ↔ vitesse de reproduction

        On ne peut pas tout maximiser
        """
        if increase(trait_a):
            decrease(trait_b)

    def developmental_constraint(self, organism):
        """
        Contrainte développementale :
        certains changements cassent le développement

        Le body plan est "frozen" tôt dans l'évolution
        """
        pass
```

## Algorithmes Génétiques : Évolution Artificielle

```python
class GeneticAlgorithm:
    """
    Appliquer les principes évolutifs à l'optimisation
    """

    def __init__(self, population_size, genome_length):
        self.population = [
            Individual(random_genome(genome_length))
            for _ in range(population_size)
        ]

    def evolve(self, fitness_function, generations):
        for gen in range(generations):
            # Évaluation
            scores = [fitness_function(ind) for ind in self.population]

            # Sélection (tournament, roulette, etc.)
            parents = self.tournament_selection(scores)

            # Reproduction avec crossover
            offspring = []
            for i in range(0, len(parents), 2):
                child1, child2 = self.crossover(parents[i], parents[i+1])
                offspring.extend([child1, child2])

            # Mutation
            for child in offspring:
                self.mutate(child, rate=0.01)

            self.population = offspring

        return max(self.population, key=fitness_function)
```

## Paysages Adaptatifs

```python
class FitnessLandscape:
    """
    Métaphore du paysage adaptatif (Sewall Wright)

    Les pics sont des optima locaux
    L'évolution "grimpe" vers les pics
    Mais peut rester coincée sur un pic local

           ▲
    fitness│    /\      /\
           │   /  \    /  \
           │  /    \  /    \
           │ /      \/      \
           └────────────────────▶ génotype
    """

    def __init__(self, fitness_function):
        self.landscape = fitness_function

    def hill_climb(self, population):
        """
        L'évolution est un hill-climbing sans plan
        Peut atteindre un optimum local, pas global
        """
        for ind in population:
            neighbors = ind.mutate_all_positions()
            best_neighbor = max(neighbors, key=self.landscape)
            if self.landscape(best_neighbor) > self.landscape(ind):
                ind.become(best_neighbor)

    def escape_local_optimum(self, population):
        """
        Comment échapper à un pic local ?
        - Dérive génétique (populations petites)
        - Changement d'environnement
        - Mutations neutres qui changent le paysage
        """
        pass
```

## Neutralité et Dérive

```python
class NeutralEvolution:
    """
    Kimura : beaucoup de l'évolution est neutre
    Pas tout n'est sélection naturelle
    """

    def genetic_drift(self, population, generations):
        """
        Dérive génétique : changement aléatoire des fréquences
        Plus fort dans les petites populations
        """
        for gen in range(generations):
            # Échantillonnage aléatoire, pas sélection
            population = sample_with_replacement(population)
        return population

    def founder_effect(self, population, founders_n):
        """
        Effet fondateur : petite population colonise nouveau territoire
        Perte de diversité génétique
        """
        founders = random.sample(population, founders_n)
        # La nouvelle population a moins de variation
        return expand(founders)

    def bottleneck(self, population, survivors_n):
        """
        Goulot d'étranglement : réduction drastique de population
        Ex: guépards (faible diversité génétique)
        """
        survivors = random.sample(population, survivors_n)
        return survivors
```

## Réflexions

L'évolution nous enseigne que :

1. **Pas besoin de designer** - La complexité émerge de règles simples
2. **L'optimum est local** - La perfection n'existe pas, seulement l'adaptation
3. **Le changement est constant** - Ce qui est adapté aujourd'hui ne le sera pas demain
4. **L'histoire compte** - Les contraintes du passé façonnent le présent
5. **La variation est précieuse** - La diversité est une assurance contre l'incertain

L'évolution est l'algorithme qui a produit l'intelligence.
Peut-être qu'un jour, l'intelligence produira de meilleurs algorithmes que l'évolution.

---

*"Rien en biologie n'a de sens si ce n'est à la lumière de l'évolution."* — Theodosius Dobzhansky
