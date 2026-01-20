# Autopoïèse : Les Systèmes qui se Créent Eux-Mêmes

## Définition

L'autopoïèse (du grec auto = soi-même, poiesis = création) désigne la propriété d'un système de se produire lui-même, de maintenir et régénérer sa propre organisation.

```
┌─────────────────────────────────────────────────────────────┐
│                      AUTOPOÏÈSE                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Concept introduit par Maturana & Varela (1972)            │
│   pour définir le vivant                                     │
│                                                              │
│         ┌─────────────────────────────────────┐             │
│         │                                     │             │
│         │    ┌───────────────────────┐       │             │
│         │    │                       │       │             │
│         │    │   RÉSEAU DE          │       │             │
│         │    │   PROCESSUS ────────▶│ Frontière           │
│         │    │       │              │       │             │
│         │    │       │              │       │             │
│         │    │       ▼              │       │             │
│         │    │   Composants ◀───────│       │             │
│         │    │                       │       │             │
│         │    └───────────────────────┘       │             │
│         │              ▲                     │             │
│         │              └─────────────────────┘             │
│         │         (la frontière produit                    │
│         │          les processus qui                       │
│         │          produisent la frontière)                │
│         └─────────────────────────────────────┘             │
│                                                              │
│   DÉFINITION FORMELLE:                                      │
│   Un système autopoïétique est un réseau de processus       │
│   de production de composants qui:                          │
│   1. Régénèrent continuellement le réseau                   │
│   2. Constituent le système comme unité dans l'espace       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Autopoïèse vs Allopoïèse

```
┌─────────────────────────────────────────────────────────────────┐
│              AUTOPOÏÈSE vs ALLOPOÏÈSE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AUTOPOÏÉTIQUE                    ALLOPOÏÉTIQUE                 │
│  (se produit soi-même)            (produit autre chose)         │
│                                                                  │
│       ┌───────────┐                    ┌───────────┐            │
│       │  ┌─────┐  │                    │           │            │
│       │  │     │  │                    │  Machine  │───▶ Produit│
│       │  │  ●  │◀─┼─┐                  │           │            │
│       │  │     │  │ │                  └───────────┘            │
│       │  └─────┘  │ │                                           │
│       │     │     │ │                                           │
│       │     ▼     │ │                                           │
│       │  produit  │─┘                                           │
│       │           │                                              │
│       └───────────┘                                              │
│                                                                  │
│  Exemples:                        Exemples:                     │
│  • Cellule vivante               • Usine                        │
│  • Organisme                     • Ordinateur                   │
│  • Système immunitaire           • Voiture                      │
│  • (Société?)                    • Robot                        │
│  • (Conscience?)                                                 │
│                                                                  │
│  Produit = le producteur         Produit ≠ le producteur        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Formalisation Mathématique

```python
"""
Modélisation formelle de l'autopoïèse
"""

import numpy as np
from typing import Set, Dict, List, Callable, Optional
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
from enum import Enum

class ComponentState(Enum):
    ACTIVE = "active"
    DEGRADED = "degradé"
    DESTROYED = "détruit"

@dataclass
class Component:
    """
    Composant d'un système autopoïétique
    """
    id: str
    state: ComponentState = ComponentState.ACTIVE
    lifetime: float = 100.0  # Durée de vie
    age: float = 0.0

    def decay(self, dt: float) -> None:
        """Vieillissement naturel"""
        self.age += dt
        if self.age > self.lifetime:
            self.state = ComponentState.DEGRADED

@dataclass
class Process:
    """
    Processus de production dans le réseau autopoïétique
    """
    id: str
    inputs: Set[str]      # IDs des composants nécessaires
    outputs: Set[str]     # IDs des composants produits
    rate: float = 1.0     # Taux de production

    def can_execute(self, available_components: Set[str]) -> bool:
        """Le processus peut-il s'exécuter?"""
        return self.inputs.issubset(available_components)


class AutopoieticSystem:
    """
    Système autopoïétique abstrait

    Propriétés définitoires:
    1. ORGANISATION: Réseau de processus de production
    2. CLÔTURE: Les processus produisent les composants du réseau
    3. UNITÉ: Le système se distingue de son environnement (frontière)
    4. AUTONOMIE: L'organisation est maintenue par le système lui-même
    """

    def __init__(self):
        self.components: Dict[str, Component] = {}
        self.processes: Dict[str, Process] = {}
        self.boundary_components: Set[str] = set()
        self.time = 0.0

    def add_component(self, comp: Component, is_boundary: bool = False) -> None:
        """Ajoute un composant au système"""
        self.components[comp.id] = comp
        if is_boundary:
            self.boundary_components.add(comp.id)

    def add_process(self, process: Process) -> None:
        """Ajoute un processus de production"""
        self.processes[process.id] = process

    def is_organizationally_closed(self) -> bool:
        """
        Vérifie la clôture organisationnelle:
        Tous les composants sont produits par des processus internes

        ┌────────────────────────────────────────────────────┐
        │           CLÔTURE ORGANISATIONNELLE                │
        ├────────────────────────────────────────────────────┤
        │                                                    │
        │   Un système est clos si:                         │
        │   ∀ composant c ∈ S, ∃ processus p ∈ S            │
        │   tel que c ∈ outputs(p)                          │
        │                                                    │
        │         ┌──────────────────────────┐              │
        │         │   p1 ──▶ c1 ──┐          │              │
        │         │   ▲           │          │              │
        │         │   │           ▼          │              │
        │         │   c3 ◀── p3   p2         │              │
        │         │   ▲           │          │              │
        │         │   │           ▼          │              │
        │         │   └─── c2 ◀───┘          │              │
        │         └──────────────────────────┘              │
        │             (cycle fermé)                         │
        │                                                    │
        └────────────────────────────────────────────────────┘
        """
        all_outputs = set()
        for p in self.processes.values():
            all_outputs.update(p.outputs)

        return set(self.components.keys()).issubset(all_outputs)

    def is_self_referential(self) -> bool:
        """
        Vérifie l'autoréférence:
        Les processus produisent les composants qui
        permettent les processus
        """
        # Construire le graphe de dépendances
        for p in self.processes.values():
            if not p.inputs.issubset(set(self.components.keys())):
                return False
            if not p.outputs.issubset(set(self.components.keys())):
                return False
        return True

    def compute_viability(self) -> float:
        """
        Calcule la viabilité du système (0-1)
        Basé sur la proportion de composants actifs
        """
        if not self.components:
            return 0.0

        active = sum(1 for c in self.components.values()
                    if c.state == ComponentState.ACTIVE)
        return active / len(self.components)

    def step(self, dt: float = 1.0) -> Dict[str, any]:
        """
        Un pas de simulation

        1. Vieillissement des composants
        2. Exécution des processus possibles
        3. Maintien de la frontière
        """
        metrics = {'produced': [], 'degraded': [], 'viability': 0}

        # 1. Vieillissement
        for comp in self.components.values():
            comp.decay(dt)
            if comp.state == ComponentState.DEGRADED:
                metrics['degraded'].append(comp.id)

        # 2. Production
        active_ids = {cid for cid, c in self.components.items()
                     if c.state == ComponentState.ACTIVE}

        for process in self.processes.values():
            if process.can_execute(active_ids):
                # Produire/régénérer les composants de sortie
                for output_id in process.outputs:
                    if output_id in self.components:
                        # Régénération
                        self.components[output_id].age = 0
                        self.components[output_id].state = ComponentState.ACTIVE
                        metrics['produced'].append(output_id)

        # 3. Calculer la viabilité
        metrics['viability'] = self.compute_viability()

        self.time += dt
        return metrics


class CellularAutopoiesis(AutopoieticSystem):
    """
    Modèle simplifié d'autopoïèse cellulaire

    ┌────────────────────────────────────────────────────────────┐
    │              CELLULE COMME SYSTÈME AUTOPOÏÉTIQUE          │
    ├────────────────────────────────────────────────────────────┤
    │                                                            │
    │   Membrane ════════════════════════════════════            │
    │   ║                                             ║          │
    │   ║   ┌──────────────────────────────────┐     ║          │
    │   ║   │         MÉTABOLISME              │     ║          │
    │   ║   │                                  │     ║          │
    │   ║   │  Nutriments ──▶ ATP ──▶ Synthèse │     ║          │
    │   ║   │                   │              │     ║          │
    │   ║   │                   ▼              │     ║          │
    │   ║   │              Protéines           │     ║          │
    │   ║   │                   │              │     ║          │
    │   ║   │                   ▼              │     ║          │
    │   ║   │  ┌─────── Enzymes ────────┐     │     ║          │
    │   ║   │  │                        │     │     ║          │
    │   ║   │  │                        ▼     │     ║          │
    │   ║   │  └──▶ catalysent ──▶ Lipides ───┼─────╬───────╮  │
    │   ║   │         les                     │     ║       │  │
    │   ║   │      réactions                  │     ║       │  │
    │   ║   └──────────────────────────────────┘     ║       │  │
    │   ║                                             ║       │  │
    │   ╚═════════════════════════════════════════════╝       │  │
    │                   ▲                                      │  │
    │                   └──────────── renouvellent ◀───────────┘  │
    │                                                              │
    └────────────────────────────────────────────────────────────┘
    """

    def __init__(self):
        super().__init__()
        self._setup_cellular_network()

    def _setup_cellular_network(self):
        """Configure le réseau autopoïétique cellulaire"""
        # Composants
        components = [
            Component("membrane", lifetime=50),
            Component("atp", lifetime=10),
            Component("enzymes", lifetime=30),
            Component("proteines", lifetime=40),
            Component("lipides", lifetime=60),
            Component("adn", lifetime=1000),  # Plus stable
            Component("ribosomes", lifetime=100),
        ]

        for c in components:
            is_boundary = c.id == "membrane"
            self.add_component(c, is_boundary)

        # Processus de production (métabolisme simplifié)
        processes = [
            Process("glycolyse",
                   inputs={"enzymes"},
                   outputs={"atp"}),
            Process("transcription",
                   inputs={"adn", "atp", "enzymes"},
                   outputs={"ribosomes"}),
            Process("traduction",
                   inputs={"ribosomes", "atp"},
                   outputs={"proteines", "enzymes"}),
            Process("synthese_lipides",
                   inputs={"enzymes", "atp"},
                   outputs={"lipides"}),
            Process("assemblage_membrane",
                   inputs={"lipides", "proteines"},
                   outputs={"membrane"}),
            Process("replication_adn",
                   inputs={"adn", "enzymes", "atp"},
                   outputs={"adn"}),
        ]

        for p in processes:
            self.add_process(p)

    def visualize_network(self) -> str:
        """Visualisation ASCII du réseau"""
        output = ["RÉSEAU AUTOPOÏÉTIQUE CELLULAIRE", "=" * 40, ""]

        output.append("Composants:")
        for cid, comp in self.components.items():
            status = "●" if comp.state == ComponentState.ACTIVE else "○"
            boundary = " [FRONTIÈRE]" if cid in self.boundary_components else ""
            output.append(f"  {status} {cid}: age={comp.age:.1f}/{comp.lifetime}{boundary}")

        output.append("\nProcessus:")
        for pid, proc in self.processes.items():
            inputs = ", ".join(proc.inputs)
            outputs = ", ".join(proc.outputs)
            can_exec = "✓" if proc.can_execute(
                {c for c, comp in self.components.items()
                 if comp.state == ComponentState.ACTIVE}
            ) else "✗"
            output.append(f"  [{can_exec}] {pid}: {inputs} → {outputs}")

        output.append(f"\nClôture organisationnelle: {self.is_organizationally_closed()}")
        output.append(f"Viabilité: {self.compute_viability():.2%}")

        return "\n".join(output)


class VarelaModel:
    """
    Modèle computationnel de Varela pour l'autopoïèse minimale

    Simulation sur grille 2D avec:
    - Substrat (S): matière première
    - Catalyseur (K): transforme S en L
    - Lien (L): peut former des chaînes (membrane)
    - Membrane (M): chaîne de L qui clôt l'espace

    ┌────────────────────────────────────────────────────────┐
    │            AUTOPOÏÈSE MINIMALE DE VARELA              │
    ├────────────────────────────────────────────────────────┤
    │                                                        │
    │   Réactions:                                          │
    │   S + K → K + L    (production de liens)              │
    │   L + L → L-L      (formation de chaîne)              │
    │   L → S            (désintégration)                   │
    │                                                        │
    │   ░░░░░░░░░░░░░░░░░░                                  │
    │   ░░░░░░████░░░░░░░░   █ = Membrane (chaîne de L)    │
    │   ░░░░░█    █░░░░░░░   K = Catalyseur                │
    │   ░░░░█  K   █░░░░░░   ░ = Substrat                  │
    │   ░░░░░█    █░░░░░░░                                  │
    │   ░░░░░░████░░░░░░░░                                  │
    │   ░░░░░░░░░░░░░░░░░░                                  │
    │                                                        │
    │   La membrane:                                        │
    │   1. Concentre K à l'intérieur                       │
    │   2. Est produite par K                              │
    │   3. Permet l'autopoïèse                             │
    │                                                        │
    └────────────────────────────────────────────────────────┘
    """

    def __init__(self, size: int = 50):
        self.size = size

        # Grille: 0=vide, 1=substrat, 2=catalyseur, 3=lien libre, 4=lien lié
        self.grid = np.ones((size, size), dtype=int)  # Substrat partout

        # Placer catalyseur au centre
        center = size // 2
        self.grid[center-1:center+2, center-1:center+2] = 2

        # Paramètres
        self.production_prob = 0.9    # Prob de S + K → L
        self.bonding_prob = 0.8       # Prob de L + L → chaîne
        self.decay_prob = 0.01        # Prob de L → S
        self.diffusion_prob = 0.1     # Prob de déplacement

    def step(self) -> Dict[str, int]:
        """Un pas de simulation"""
        new_grid = self.grid.copy()
        stats = {'productions': 0, 'bonds': 0, 'decays': 0}

        # Parcourir toutes les cellules dans un ordre aléatoire
        positions = [(i, j) for i in range(self.size) for j in range(self.size)]
        np.random.shuffle(positions)

        for i, j in positions:
            cell = self.grid[i, j]

            # Diffusion
            if np.random.random() < self.diffusion_prob and cell in [1, 2, 3]:
                # Choisir direction aléatoire
                di, dj = [(0, 1), (0, -1), (1, 0), (-1, 0)][np.random.randint(4)]
                ni, nj = (i + di) % self.size, (j + dj) % self.size

                if self.grid[ni, nj] == 0 or self.grid[ni, nj] == 1:
                    new_grid[ni, nj], new_grid[i, j] = new_grid[i, j], new_grid[ni, nj]

            # Production: S + K → K + L
            if cell == 2:  # Catalyseur
                neighbors = self._get_neighbors(i, j)
                for ni, nj in neighbors:
                    if self.grid[ni, nj] == 1 and np.random.random() < self.production_prob:
                        new_grid[ni, nj] = 3  # Lien libre
                        stats['productions'] += 1
                        break

            # Liaison: L + L → chaîne
            if cell == 3:  # Lien libre
                neighbors = self._get_neighbors(i, j)
                for ni, nj in neighbors:
                    if self.grid[ni, nj] == 3 and np.random.random() < self.bonding_prob:
                        new_grid[i, j] = 4  # Lien lié
                        new_grid[ni, nj] = 4
                        stats['bonds'] += 1
                        break

            # Désintégration: L → S
            if cell in [3, 4] and np.random.random() < self.decay_prob:
                new_grid[i, j] = 1
                stats['decays'] += 1

        self.grid = new_grid
        return stats

    def _get_neighbors(self, i: int, j: int) -> List[Tuple[int, int]]:
        """Retourne les voisins (von Neumann)"""
        return [
            ((i + di) % self.size, (j + dj) % self.size)
            for di, dj in [(-1, 0), (1, 0), (0, -1), (0, 1)]
        ]

    def is_viable(self) -> bool:
        """
        Le système est-il viable?
        Vérifie s'il y a une membrane fermée autour du catalyseur
        """
        # Trouver le catalyseur
        cat_pos = np.where(self.grid == 2)
        if len(cat_pos[0]) == 0:
            return False

        center_i, center_j = cat_pos[0][0], cat_pos[1][0]

        # Vérifier si entouré de liens
        for di in range(-3, 4):
            for dj in range(-3, 4):
                if abs(di) == 3 or abs(dj) == 3:  # Périmètre
                    ni, nj = (center_i + di) % self.size, (center_j + dj) % self.size
                    if self.grid[ni, nj] not in [3, 4]:
                        return False
        return True

    def visualize(self) -> str:
        """Représentation ASCII"""
        chars = {0: ' ', 1: '░', 2: 'K', 3: '○', 4: '●'}
        lines = []
        for row in self.grid:
            line = ''.join(chars.get(cell, '?') for cell in row)
            lines.append(line)
        return '\n'.join(lines)

    def statistics(self) -> Dict[str, float]:
        """Statistiques du système"""
        unique, counts = np.unique(self.grid, return_counts=True)
        stat_dict = dict(zip(unique, counts))

        total = self.size * self.size
        return {
            'substrat_ratio': stat_dict.get(1, 0) / total,
            'catalyseur_count': stat_dict.get(2, 0),
            'liens_libres': stat_dict.get(3, 0),
            'liens_lies': stat_dict.get(4, 0),
            'membrane_coverage': (stat_dict.get(3, 0) + stat_dict.get(4, 0)) / total
        }
```

## Couplage Structurel

```
┌─────────────────────────────────────────────────────────────────┐
│                   COUPLAGE STRUCTUREL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Le système autopoïétique interagit avec son environnement     │
│   mais maintient son organisation interne.                       │
│                                                                  │
│        ENVIRONNEMENT                                             │
│   ╔══════════════════════════════════════════════════╗          │
│   ║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ║          │
│   ║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ║          │
│   ║  ░░░░░░░░░░░░░┌───────────────┐░░░░░░░░░░░░░   ║          │
│   ║  ░░░░░░░░░░░░░│               │░░░░░░░░░░░░░   ║          │
│   ║  ░░░░░░░░░░░░░│   SYSTÈME     │░░░░░░░░░░░░░   ║          │
│   ║  ░░░perturb──▶│   AUTOPOÏÉ-   │──▶compens.░░   ║          │
│   ║  ░░░░░░░░░░░░░│   TIQUE       │░░░░░░░░░░░░░   ║          │
│   ║  ░░░░░░░░░░░░░│               │░░░░░░░░░░░░░   ║          │
│   ║  ░░░░░░░░░░░░░└───────────────┘░░░░░░░░░░░░░   ║          │
│   ║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ║          │
│   ╚══════════════════════════════════════════════════╝          │
│                                                                  │
│   Le système:                                                   │
│   • Ne reçoit pas d'INSTRUCTIONS de l'environnement            │
│   • Reçoit des PERTURBATIONS                                    │
│   • COMPENSE selon sa propre structure                          │
│   • Maintient son IDENTITÉ                                      │
│                                                                  │
│   "L'environnement ne spécifie pas les changements,            │
│    il les déclenche seulement."                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Extensions: Autopoïèse Sociale

```python
class SocialAutopoiesis:
    """
    Extension de l'autopoïèse aux systèmes sociaux (Luhmann)

    Selon Niklas Luhmann, les systèmes sociaux sont autopoïétiques
    mais leurs composants sont des COMMUNICATIONS, pas des individus.

    ┌────────────────────────────────────────────────────────────┐
    │            AUTOPOÏÈSE DES SYSTÈMES SOCIAUX                │
    ├────────────────────────────────────────────────────────────┤
    │                                                            │
    │   Système biologique:    Système social:                  │
    │   Composants = molécules Composants = communications      │
    │                                                            │
    │   ┌───────────────┐     ┌───────────────┐                │
    │   │ Molécule ──▶  │     │ Comm. ──▶     │                │
    │   │      │        │     │    │          │                │
    │   │      ▼        │     │    ▼          │                │
    │   │  Molécule     │     │  Comm.        │                │
    │   │      │        │     │    │          │                │
    │   │      ▼        │     │    ▼          │                │
    │   │  Molécule...  │     │  Comm....     │                │
    │   └───────────────┘     └───────────────┘                │
    │                                                            │
    │   La société produit des communications                   │
    │   à partir de communications.                             │
    │   Les humains sont l'ENVIRONNEMENT du système social!    │
    │                                                            │
    └────────────────────────────────────────────────────────────┘
    """

    def __init__(self, n_agents: int):
        self.n_agents = n_agents
        self.communications = []  # Historique des communications
        self.active_topics = set()  # Thèmes actifs
        self.time = 0

    def generate_communication(self, sender: int, topic: str,
                              references: List[int] = None) -> Dict:
        """
        Une communication est une synthèse de:
        1. Information (quoi)
        2. Expression (comment)
        3. Compréhension (par qui)
        """
        comm = {
            'id': len(self.communications),
            'time': self.time,
            'sender': sender,
            'topic': topic,
            'references': references or [],  # Communications précédentes
        }

        self.communications.append(comm)
        self.active_topics.add(topic)

        return comm

    def process_communication(self, comm_id: int) -> List[int]:
        """
        Le traitement d'une communication génère potentiellement
        de nouvelles communications (autopoïèse)
        """
        comm = self.communications[comm_id]
        new_comms = []

        # Probabilité que d'autres agents répondent
        for agent in range(self.n_agents):
            if agent != comm['sender']:
                if np.random.random() < 0.3:  # Prob de réponse
                    new_comm = self.generate_communication(
                        sender=agent,
                        topic=comm['topic'],
                        references=[comm_id]
                    )
                    new_comms.append(new_comm['id'])

        return new_comms

    def step(self) -> Dict:
        """Un pas temporel"""
        self.time += 1

        # Les communications récentes peuvent en générer de nouvelles
        recent = [c for c in self.communications if c['time'] == self.time - 1]

        new_count = 0
        for comm in recent:
            new_comms = self.process_communication(comm['id'])
            new_count += len(new_comms)

        # Attrition des topics inactifs
        if self.time % 10 == 0:
            active_recently = {c['topic'] for c in self.communications
                             if c['time'] > self.time - 10}
            self.active_topics = active_recently

        return {
            'total_communications': len(self.communications),
            'new_communications': new_count,
            'active_topics': len(self.active_topics)
        }

    def is_autopoietic(self) -> bool:
        """
        Le système est autopoïétique si les communications
        génèrent des communications (clôture opérationnelle)
        """
        if len(self.communications) < 10:
            return False

        # Vérifier que les communications récentes en génèrent d'autres
        recent = [c for c in self.communications if c['references']]
        return len(recent) > len(self.communications) * 0.3
```

## Applications et Implications

```
┌─────────────────────────────────────────────────────────────────┐
│              IMPLICATIONS DE L'AUTOPOÏÈSE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BIOLOGIE:                                                      │
│  • Définition opérationnelle de la vie                         │
│  • Distinction virus/cellule (virus = non autopoïétique)       │
│  • Origine de la vie = origine de l'autopoïèse                 │
│                                                                  │
│  COGNITION (Enactivisme):                                       │
│  • La cognition = maintien de l'autopoïèse                     │
│  • Pas de représentation du monde, mais couplage               │
│  • "Vivre = connaître" (Maturana)                              │
│                                                                  │
│  INTELLIGENCE ARTIFICIELLE:                                     │
│  • Critère pour la "vraie" IA?                                 │
│  • Les réseaux de neurones sont allopoïétiques                 │
│  • Vie artificielle: peut-on créer l'autopoïèse?              │
│                                                                  │
│  SYSTÈMES SOCIAUX:                                              │
│  • Organisations comme systèmes autopoïétiques?                │
│  • Communication comme composant fondamental                   │
│  • Clôture opérationnelle des systèmes juridiques, économiques │
│                                                                  │
│  PHILOSOPHIE:                                                   │
│  • Autonomie = auto-législation structurelle                   │
│  • Identité = invariance de l'organisation                     │
│  • Sens = couplage structurel avec l'environnement             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Conclusion

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESSENCE DE L'AUTOPOÏÈSE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   "Un système autopoïétique est un système qui se produit      │
│    lui-même en produisant ses propres composants."              │
│                                                                  │
│   Caractéristiques fondamentales:                               │
│                                                                  │
│   1. AUTONOMIE                                                  │
│      Le système définit ses propres lois                        │
│      (pas de programme externe)                                 │
│                                                                  │
│   2. CLÔTURE OPÉRATIONNELLE                                    │
│      Les opérations produisent les conditions                   │
│      de possibilité des opérations                              │
│                                                                  │
│   3. IDENTITÉ PAR L'ORGANISATION                               │
│      L'identité = invariance de l'organisation                  │
│      (pas des composants matériels)                             │
│                                                                  │
│   4. DISTINCTION SYSTÈME/ENVIRONNEMENT                         │
│      Auto-production de la frontière                            │
│                                                                  │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │ "Vivre c'est connaître, et connaître c'est vivre"        │ │
│   │  - Humberto Maturana                                      │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*"L'autopoïèse est la signature minimale de la vie."*
