# ADN : Le Code Source Originel

## L'Architecture du Vivant

L'ADN est le premier système de contrôle de version. Avant Git, avant SVN,
avant même l'écriture, la vie avait déjà résolu le problème du stockage,
de la réplication et de la transmission de l'information.

## Analogies Fondamentales

### ADN comme Code Source

```
Biologie          | Informatique
------------------|------------------
ADN               | Code source
Gènes             | Fonctions/Modules
Codons            | Instructions
Ribosomes         | Compilateurs
Protéines         | Binaires exécutables
Mutations         | Bugs/Features
Épigénétique      | Variables d'environnement
```

### Les Quatre Bases : Un Alphabet Minimal

```python
# L'alphabet de la vie
BASES = ['A', 'T', 'G', 'C']  # Adénine, Thymine, Guanine, Cytosine

# Appariement - le premier protocole de communication
PAIRS = {'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G'}

def replicate(strand):
    """La réplication : fork() biologique"""
    return ''.join(PAIRS[base] for base in strand)
```

Quatre lettres. Trois milliards de caractères. Un organisme humain.
C'est la compression ultime de l'information.

## Le Dogme Central comme Pipeline

```
┌──────────┐    Transcription    ┌──────────┐    Traduction    ┌──────────┐
│   ADN    │ ─────────────────── │   ARN    │ ───────────────── │ Protéine │
│ (source) │                     │ (message)│                   │ (binary) │
└──────────┘                     └──────────┘                   └──────────┘
     │                                                                │
     │              ┌─────────────────────────────────────────────────┘
     │              │
     │              v
     │         Fonction cellulaire
     │              │
     └──────────────┴─── Feedback (régulation génétique)
```

### Daemon : Le Réplicateur

```bash
#!/bin/bash
# /etc/systemd/system/dna-replicator.service
# Le daemon le plus ancien : la réplication

[Unit]
Description=DNA Replication Daemon
After=cell-cycle.target
Requires=nucleotide-pool.service

[Service]
Type=forking
ExecStart=/usr/lib/cell/helicase --unwind
ExecStartPost=/usr/lib/cell/polymerase --replicate
ExecStop=/usr/lib/cell/ligase --seal
Restart=on-failure
RestartSec=checkpoint

[Install]
WantedBy=mitosis.target
```

## Codons : Le Premier Bytecode

Chaque codon (triplet de bases) code pour un acide aminé.
64 combinaisons possibles, 20 acides aminés + signaux de contrôle.

```python
CODON_TABLE = {
    'AUG': 'Met',  # START - point d'entrée du programme
    'UAA': 'STOP', # Terminaison
    'UAG': 'STOP', # Terminaison (amber)
    'UGA': 'STOP', # Terminaison (opal)
    # ... 61 autres codons pour 20 acides aminés
}

def translate(mrna):
    """Le ribosome : machine virtuelle biologique"""
    protein = []
    i = 0

    # Chercher le codon START
    while mrna[i:i+3] != 'AUG':
        i += 1

    # Traduire jusqu'au STOP
    while i < len(mrna) - 2:
        codon = mrna[i:i+3]
        if CODON_TABLE[codon] == 'STOP':
            break
        protein.append(CODON_TABLE[codon])
        i += 3

    return protein
```

## Mutations : Bugs ou Features ?

```python
class Mutation:
    """Les mutations sont les commits de l'évolution"""

    TYPES = {
        'substitution': 'Changement d'une base',      # typo
        'insertion': 'Ajout de bases',                 # code injection
        'deletion': 'Suppression de bases',            # code removal
        'duplication': 'Copie d'un segment',           # copy-paste
        'inversion': 'Segment inversé',                # endianness flip
        'translocation': 'Segment déplacé'             # refactoring
    }

    def evaluate(self, context):
        """
        La même mutation peut être :
        - Létale (segfault)
        - Neutre (dead code)
        - Bénéfique (optimization)

        Tout dépend du contexte d'exécution (environnement)
        """
        pass
```

## Introns et Exons : Code et Commentaires

L'ADN contient plus de "junk code" que de code fonctionnel.
Les introns (non-codants) représentent ~98% du génome humain.

```
Gène brut:
[EXON1]---intron---[EXON2]---intron---[EXON3]---intron---[EXON4]

Après splicing (épissage):
[EXON1][EXON2][EXON3][EXON4]

# Comme un preprocesseur qui retire les commentaires
# Mais les introns ont des rôles régulateurs cachés
```

### Épissage Alternatif : Polymorphisme Biologique

Un même gène peut produire plusieurs protéines différentes :

```python
def splice(pre_mrna, variant='default'):
    """
    Alternative splicing : un gène, plusieurs protéines
    Comme les feature flags ou le polymorphisme
    """
    exons = extract_exons(pre_mrna)

    if variant == 'default':
        return join(exons[0], exons[1], exons[2])
    elif variant == 'muscle':
        return join(exons[0], exons[2])  # skip exon 1
    elif variant == 'neuron':
        return join(exons[0], exons[1], exons[3])  # include exon 3
```

## Régulation Génétique : Le Système de Permissions

```
┌─────────────────────────────────────────────────────────────┐
│                    RÉGION RÉGULATRICE                       │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│ Enhancer │ Silencer │ Promoter │   TATA   │     GÈNE       │
│ (+chmod) │ (-chmod) │ (main()) │  (init)  │   (code)       │
└──────────┴──────────┴──────────┴──────────┴────────────────┘

Facteurs de transcription = sudo
Répresseurs = firewall rules
Activateurs = port forwarding
```

## CRISPR : L'Éditeur de Code Génétique

```python
class CRISPR:
    """
    CRISPR-Cas9 : sed/awk pour l'ADN
    Trouve et remplace avec précision
    """

    def __init__(self, guide_rna):
        self.guide = guide_rna  # Pattern de recherche
        self.cas9 = Cas9()      # L'enzyme qui coupe

    def find(self, genome):
        """Localise la séquence cible"""
        return genome.index(self.guide.complement())

    def cut(self, genome, position):
        """Coupe le double brin"""
        return genome[:position], genome[position:]

    def edit(self, genome, old_seq, new_seq):
        """
        L'équivalent de :
        sed -i 's/old_seq/new_seq/g' genome.dna
        """
        pos = self.find(genome)
        left, right = self.cut(genome, pos)
        return left + new_seq + right[len(old_seq):]
```

## Virus : Injection de Code

```python
class Virus:
    """
    Les virus sont des programmes qui s'injectent
    dans le système hôte pour se répliquer
    """

    def __init__(self, genome, envelope=None):
        self.genome = genome      # Payload
        self.envelope = envelope  # Mécanisme d'entrée

    def inject(self, host_cell):
        """Injection du code viral"""
        host_cell.genome.insert(self.genome)

    def hijack(self, host_cell):
        """Détourne la machinerie cellulaire"""
        host_cell.ribosome.priority = self.genome
        host_cell.replicate(self.genome)
```

Les rétrovirus (comme le VIH) font même de la rétro-ingénierie :
ARN → ADN (reverse transcription), inversant le dogme central.

## Hérédité : Git pour la Vie

```
Parent A          Parent B
    │                 │
    └────────┬────────┘
             │
         Méiose (merge avec crossing-over)
             │
             v
          Enfant
    (nouveau commit avec historique des deux branches)
```

### Les Chromosomes comme Branches

```bash
# Visualiser l'arbre généalogique
git log --graph --oneline --all

# Le génome humain
* 23 paires de chromosomes
* 1 paire = 2 branches (maternel/paternel)
* Méiose = merge récursif avec recombinaison
```

## Mitochondries : Les Bibliothèques Importées

```python
# Les mitochondries ont leur propre ADN
# Hérité uniquement de la mère
# Comme une dépendance externe avec son propre repo

import mitochondria  # 37 gènes, 16,569 paires de bases

# Fonction principale : production d'ATP (énergie)
energy = mitochondria.oxidative_phosphorylation(glucose)
```

Théorie de l'endosymbiose : les mitochondries étaient des bactéries
libres qui ont été "importées" dans les cellules eucaryotes.
Le premier cas de réutilisation de code.

## Réflexions

L'ADN nous enseigne que :

1. **La simplicité engendre la complexité** - 4 lettres suffisent
2. **La redondance est une feature** - Le code génétique est dégénéré (plusieurs codons = 1 acide aminé)
3. **Les erreurs sont nécessaires** - Sans mutations, pas d'évolution
4. **Le contexte est roi** - Une séquence n'a de sens que dans son environnement
5. **La modularité triomphe** - Gènes, exons, domaines protéiques sont réutilisables

Le code de la vie compile depuis 3.8 milliards d'années.
Aucun de nos programmes n'a cette durabilité.

---

*"L'ADN n'est pas un plan, c'est un algorithme. Il ne décrit pas le produit final, il décrit le processus pour y arriver."*
