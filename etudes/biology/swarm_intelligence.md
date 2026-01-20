# Intelligence en Essaim : La Sagesse des Collectifs

## Le Paradoxe de la Complexité Collective

Une fourmi est simple. Une colonie de fourmis résout des problèmes complexes.
Une abeille a un petit cerveau. Une ruche prend des décisions optimales.
L'intelligence émerge de l'interaction, pas de l'individu.

## Principes Fondamentaux

```python
class SwarmPrinciples:
    """
    Les principes communs à toute intelligence en essaim
    """

    RULES = {
        'decentralization': 'Pas de contrôle central',
        'local_interaction': 'Chaque agent interagit localement',
        'simple_rules': 'Règles individuelles simples',
        'emergence': 'Comportement complexe émerge',
        'robustness': 'Résistance aux pannes individuelles',
        'scalability': 'Fonctionne quelle que soit la taille'
    }

    def emergent_behavior(self, agents, simple_rules):
        """
        Comportement global = f(interactions locales)
        Non réductible à la somme des comportements individuels
        """
        while True:
            for agent in agents:
                neighbors = agent.perceive_neighbors()
                agent.apply_rules(simple_rules, neighbors)

            # Le comportement collectif émerge
            # Personne ne l'a programmé explicitement
```

## Fourmis : Optimisation par Phéromones

```python
class AntColony:
    """
    Les fourmis résolvent des problèmes d'optimisation
    sans calcul centralisé
    """

    def __init__(self, n_ants):
        self.ants = [Ant() for _ in range(n_ants)]
        self.pheromone_map = {}

    def find_shortest_path(self, source, destination):
        """
        Algorithme de colonie de fourmis (ACO)
        Résout le problème du voyageur de commerce
        """
        for iteration in range(max_iterations):
            paths = []

            for ant in self.ants:
                path = ant.explore(source, destination, self.pheromone_map)
                paths.append(path)

                # Dépôt de phéromones proportionnel à la qualité
                self.deposit_pheromone(path, 1.0 / path.length)

            # Évaporation (permet d'oublier les mauvaises solutions)
            self.evaporate_pheromones(rate=0.1)

        return self.best_path()

    def deposit_pheromone(self, path, amount):
        """
        Plus le chemin est court, plus de phéromones
        → Feedback positif vers les bonnes solutions
        """
        for edge in path.edges:
            self.pheromone_map[edge] += amount

    def evaporate_pheromones(self, rate):
        """
        L'évaporation évite le lock-in sur solutions sous-optimales
        Permet l'exploration continue
        """
        for edge in self.pheromone_map:
            self.pheromone_map[edge] *= (1 - rate)


class Ant:
    def explore(self, start, end, pheromones):
        """
        Chaque fourmi suit une règle probabiliste simple :
        P(choisir chemin) ∝ phéromone^α × (1/distance)^β
        """
        path = [start]
        current = start

        while current != end:
            neighbors = get_neighbors(current)

            # Choix probabiliste basé sur phéromones et distance
            probabilities = []
            for next_node in neighbors:
                if next_node not in path:  # Éviter les cycles
                    p = (pheromones.get((current, next_node), 0.1) ** ALPHA *
                         (1.0 / distance(current, next_node)) ** BETA)
                    probabilities.append((next_node, p))

            # Sélection roulette
            current = weighted_random_choice(probabilities)
            path.append(current)

        return Path(path)
```

## Daemon : L'Agent de l'Essaim

```bash
#!/bin/bash
# /etc/systemd/system/swarm-agent.service
# Un agent dans un système distribué inspiré des essaims

[Unit]
Description=Swarm Intelligence Agent
After=network.target
Wants=pheromone-bus.service

[Service]
Type=simple
ExecStart=/usr/lib/swarm/agent --local-only

# Pas de contrôle central
# L'agent ne connaît que ses voisins
Environment="NEIGHBORS_ONLY=true"
Environment="BROADCAST_LOCAL=true"

# Communication par stigmergie (traces dans l'environnement)
ReadWritePaths=/var/lib/swarm/pheromones/

# Résilience : si cet agent meurt, l'essaim continue
Restart=on-failure
RestartSec=1s

# Ressources limitées par agent
MemoryMax=50M
CPUQuota=5%

[Install]
WantedBy=swarm.target
```

## Abeilles : Décision Collective

```python
class BeeSwarm:
    """
    Les abeilles prennent des décisions de groupe
    pour choisir un nouveau site de nidification
    """

    def find_new_nest(self, swarm, candidates):
        """
        Algorithme de choix du nid (Seeley et al.)

        1. Éclaireuses explorent
        2. Rapport par danse
        3. Débat par recrutement compétitif
        4. Quorum atteint → décision
        """
        nest_scouts = {}

        while not self.quorum_reached(candidates):
            for scout in swarm.scouts:
                if scout.found_site:
                    # Danse proportionnelle à la qualité du site
                    dance_intensity = scout.evaluate_site()
                    scout.waggle_dance(duration=dance_intensity)

                    # Recrutement d'autres éclaireuses
                    recruited = scout.recruit(dance_intensity)
                    nest_scouts[scout.site] += recruited
                else:
                    # Observer les danses, être recrutée
                    scout.observe_and_follow()

            # Désengagement naturel (comme évaporation phéromones)
            self.scouts_disengage(rate=0.1)

        # Le site avec le plus d'éclaireuses gagne
        return max(nest_scouts, key=nest_scouts.get)

    def waggle_dance(self, bee, site_quality):
        """
        La danse encode :
        - Direction (angle par rapport au soleil)
        - Distance (durée de la phase waggle)
        - Qualité (nombre de répétitions)

        C'est un protocole de communication vectoriel
        """
        angle = site.direction_from_sun
        distance = site.distance_from_hive
        repetitions = int(site_quality * 10)

        return Dance(angle, distance, repetitions)
```

## Oiseaux et Poissons : Mouvement Coordonné

```python
class Boids:
    """
    Modèle de Craig Reynolds (1986)
    Trois règles simples → mouvements de volées réalistes
    """

    def __init__(self, n_boids):
        self.boids = [Boid(random_position(), random_velocity())
                      for _ in range(n_boids)]

    def update(self):
        for boid in self.boids:
            neighbors = boid.get_neighbors(radius=PERCEPTION_RADIUS)

            # Règle 1: Séparation - éviter les collisions
            separation = self.separate(boid, neighbors)

            # Règle 2: Alignement - suivre la direction moyenne
            alignment = self.align(boid, neighbors)

            # Règle 3: Cohésion - rester avec le groupe
            cohesion = self.cohere(boid, neighbors)

            # Combiner les forces
            boid.velocity += (separation * W_SEP +
                             alignment * W_ALI +
                             cohesion * W_COH)
            boid.velocity = limit(boid.velocity, MAX_SPEED)
            boid.position += boid.velocity

    def separate(self, boid, neighbors):
        """Éviter de se rapprocher trop"""
        steer = Vector(0, 0)
        for other in neighbors:
            diff = boid.position - other.position
            diff /= diff.magnitude()  # Pondéré par distance
            steer += diff
        return steer

    def align(self, boid, neighbors):
        """S'aligner sur la vélocité moyenne"""
        if not neighbors:
            return Vector(0, 0)
        avg_velocity = mean([n.velocity for n in neighbors])
        return avg_velocity - boid.velocity

    def cohere(self, boid, neighbors):
        """Se diriger vers le centre de masse local"""
        if not neighbors:
            return Vector(0, 0)
        center = mean([n.position for n in neighbors])
        return center - boid.position
```

## Termites : Construction Émergente

```python
class TermiteConstruction:
    """
    Les termites construisent des structures complexes
    sans plan architectural centralisé
    """

    def build_mound(self, termites, environment):
        """
        Stigmergie : coordination indirecte via l'environnement

        Les termites déposent des boulettes de terre imprégnées de phéromones
        D'autres termites sont attirées et ajoutent leur contribution
        La structure émerge du feedback positif local
        """
        while True:
            for termite in termites:
                if termite.carrying_mud:
                    # Déposer là où il y a déjà des dépôts (ou au hasard)
                    if self.smell_pheromone(termite.position) > threshold:
                        termite.deposit_mud()
                    elif random() < 0.01:  # Parfois au hasard (exploration)
                        termite.deposit_mud()
                else:
                    # Ramasser de la boue
                    termite.pick_up_mud()

            # La structure émerge : piliers, arches, chambres
            # Sans qu'aucune termite ne "connaisse" le plan final
```

## Bactéries : Quorum Sensing

```python
class QuorumSensing:
    """
    Les bactéries comptent leur population
    et changent de comportement quand le seuil est atteint
    """

    def __init__(self, bacteria_population):
        self.bacteria = bacteria_population
        self.signal_molecules = 0  # Autoinducteurs

    def communicate(self):
        """
        Chaque bactérie :
        1. Produit des molécules signal
        2. Détecte la concentration
        3. Change de comportement si seuil atteint
        """
        for bacterium in self.bacteria:
            # Production continue de signal
            bacterium.produce_autoinducer()
            self.signal_molecules += 1

            # Détection
            if self.signal_concentration() > QUORUM_THRESHOLD:
                # Changement de comportement collectif
                bacterium.activate_quorum_genes()

    def collective_behaviors(self):
        """
        Comportements activés par quorum :
        - Bioluminescence (Vibrio fischeri)
        - Virulence (Pseudomonas)
        - Biofilm formation
        - Sporulation

        L'individu n'agit que quand le collectif est prêt
        """
        pass
```

## Algorithmes Bio-inspirés

```python
class ParticleSwarmOptimization:
    """
    PSO : Optimisation par essaim de particules
    Inspiré des oiseaux cherchant de la nourriture
    """

    def __init__(self, n_particles, dimensions, fitness_func):
        self.particles = [
            Particle(random_position(dimensions), random_velocity(dimensions))
            for _ in range(n_particles)
        ]
        self.fitness = fitness_func
        self.global_best = None

    def optimize(self, iterations):
        for _ in range(iterations):
            for particle in self.particles:
                # Évaluer
                score = self.fitness(particle.position)

                # Mettre à jour le meilleur personnel
                if score > particle.best_score:
                    particle.best_position = particle.position
                    particle.best_score = score

                # Mettre à jour le meilleur global
                if score > self.global_best_score:
                    self.global_best = particle.position
                    self.global_best_score = score

            # Mettre à jour vélocités et positions
            for particle in self.particles:
                # v = w*v + c1*r1*(pbest-x) + c2*r2*(gbest-x)
                inertia = W * particle.velocity
                cognitive = C1 * random() * (particle.best_position - particle.position)
                social = C2 * random() * (self.global_best - particle.position)

                particle.velocity = inertia + cognitive + social
                particle.position += particle.velocity

        return self.global_best
```

## Systèmes Distribués Inspirés

```python
class SwarmInspiredSystem:
    """
    Appliquer l'intelligence en essaim aux systèmes informatiques
    """

    class DistributedHashTable:
        """
        DHT comme réseau P2P
        Chaque nœud ne connaît que quelques voisins
        """
        pass

    class LoadBalancer:
        """
        Équilibrage de charge par feedback positif
        Comme les fourmis avec les chemins
        """
        def route_request(self, request, servers):
            # "Phéromones" = inverse du temps de réponse récent
            pheromones = {s: 1.0 / s.response_time for s in servers}

            # Choix probabiliste
            return weighted_random(servers, pheromones)

    class ConsensusProtocol:
        """
        Consensus sans leader
        Inspiré des décisions collectives des abeilles
        """
        def reach_consensus(self, nodes, proposals):
            votes = {p: 0 for p in proposals}

            while not quorum_reached(votes):
                for node in nodes:
                    # Observer les voisins
                    neighbor_votes = node.observe_neighbors()

                    # Mettre à jour son vote (influence sociale)
                    node.vote = node.update_vote(neighbor_votes)
                    votes[node.vote] += 1

                # Désengagement possible (exploration)
                self.random_vote_changes(nodes, rate=0.01)

            return max(votes, key=votes.get)
```

## Émergence et Non-linéarité

```python
def emergence_properties():
    """
    Propriétés des systèmes émergents
    """
    return {
        'non_reducibility':
            "Le tout n'est pas la somme des parties",

        'downward_causation':
            "Le niveau macro influence le niveau micro",

        'multiple_realizability':
            "Même comportement, agents différents",

        'phase_transitions':
            "Changements qualitatifs soudains",

        'self_organization':
            "Ordre sans organisateur"
    }
```

## Réflexions

L'intelligence en essaim nous enseigne que :

1. **Simple × Beaucoup = Complexe** - Les règles simples multipliées créent la complexité
2. **Pas besoin de chef** - La décentralisation fonctionne
3. **L'environnement comme mémoire** - Stigmergie et traces
4. **La redondance est robustesse** - Perdre des agents ne tue pas le système
5. **L'exploration équilibre l'exploitation** - Bruit nécessaire pour éviter les optima locaux

L'Internet, les blockchains, les systèmes distribués modernes
redécouvrent ce que les colonies d'insectes pratiquent depuis des millions d'années.

---

*"Aucune abeille ne sait qu'elle fait partie d'une ruche. Aucun neurone ne sait qu'il pense. Peut-être que nous non plus."*
