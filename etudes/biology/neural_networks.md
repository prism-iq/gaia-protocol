# Réseaux Neuronaux : Du Biologique à l'Artificiel

## Le Neurone : L'Unité de Calcul Originelle

Avant les transistors, avant les relais, le neurone calculait déjà.
100 milliards de neurones, 100 trillions de connexions.
Le cerveau humain : le système distribué le plus complexe connu.

## Architecture Neuronale

### Le Neurone Biologique

```
                    Dendrites (inputs)
                         │ │ │
                         v v v
                    ┌─────────┐
                    │  Soma   │ (corps cellulaire - processing)
                    │ (cell   │
                    │  body)  │
                    └────┬────┘
                         │
                         v
                      Axone (output)
                         │
              ┌──────────┼──────────┐
              v          v          v
         Synapses (connexions vers autres neurones)
```

### Traduction en Code

```python
class BiologicalNeuron:
    """
    Le neurone : une fonction avec état
    """

    def __init__(self):
        self.dendrites = []           # Entrées
        self.axon_terminals = []      # Sorties
        self.membrane_potential = -70  # mV (potentiel de repos)
        self.threshold = -55          # mV (seuil d'activation)
        self.refractory_period = 2    # ms (cooldown)

    def receive(self, signals):
        """
        Intégration des signaux d'entrée
        Sommation spatiale et temporelle
        """
        for signal in signals:
            if signal.type == 'excitatory':
                self.membrane_potential += signal.strength
            elif signal.type == 'inhibitory':
                self.membrane_potential -= signal.strength

    def fire(self):
        """
        Potentiel d'action : le signal binaire du cerveau
        Loi du tout-ou-rien (comme un bit)
        """
        if self.membrane_potential >= self.threshold:
            # SPIKE! Potentiel d'action
            self.propagate_signal()
            self.membrane_potential = -70  # Reset
            self.enter_refractory()
            return True
        return False
```

## Daemon : Le Potentiel d'Action

```bash
#!/bin/bash
# /etc/systemd/system/action-potential.service
# Le signal qui traverse l'axone

[Unit]
Description=Action Potential Propagation Daemon
After=resting-potential.target
BindsTo=sodium-channel.service potassium-channel.service

[Service]
Type=notify
ExecStartPre=/usr/lib/neuron/depolarize --threshold=-55mV
ExecStart=/usr/lib/neuron/propagate --saltatory --myelin
ExecStartPost=/usr/lib/neuron/repolarize
ExecStop=/usr/lib/neuron/hyperpolarize

# Période réfractaire absolue
RestartSec=2ms
Restart=on-success

[Install]
WantedBy=neural-circuit.target
```

## Synapses : Les Interfaces de Communication

```python
class Synapse:
    """
    La synapse : API entre neurones
    Communication chimique ou électrique
    """

    def __init__(self, presynaptic, postsynaptic):
        self.pre = presynaptic       # Neurone émetteur
        self.post = postsynaptic     # Neurone récepteur
        self.weight = random()       # Force de connexion
        self.neurotransmitters = []  # Messages chimiques

    def transmit(self, action_potential):
        """
        Transmission synaptique :
        1. AP arrive → vésicules fusionnent
        2. Neurotransmetteurs libérés
        3. Récepteurs activés
        4. Nouveau signal généré
        """
        if action_potential:
            self.release_neurotransmitters()
            signal_strength = self.weight * len(self.neurotransmitters)
            self.post.receive(Signal(strength=signal_strength))

    def strengthen(self):
        """Potentialisation à long terme (LTP) - apprentissage"""
        self.weight *= 1.1

    def weaken(self):
        """Dépression à long terme (LTD) - oubli"""
        self.weight *= 0.9
```

## Plasticité Synaptique : L'Apprentissage

### Règle de Hebb

*"Neurons that fire together, wire together"*

```python
def hebbian_learning(pre_neuron, post_neuron, synapse):
    """
    Si deux neurones sont actifs simultanément,
    leur connexion se renforce.

    C'est l'origine de la mémoire et de l'apprentissage.
    """
    if pre_neuron.is_active() and post_neuron.is_active():
        synapse.strengthen()

    # STDP : Spike-Timing Dependent Plasticity
    dt = post_neuron.spike_time - pre_neuron.spike_time

    if dt > 0:  # Pre avant Post → renforcement
        synapse.weight += A_plus * exp(-dt / tau_plus)
    else:       # Post avant Pre → affaiblissement
        synapse.weight -= A_minus * exp(dt / tau_minus)
```

## Du Biologique à l'Artificiel

### Comparaison

```
Biologique                 │  Artificiel (ANN)
───────────────────────────│────────────────────────────
Neurone                    │  Noeud/Unité
Dendrite                   │  Entrées pondérées
Soma                       │  Fonction d'activation
Axone                      │  Sortie
Synapse                    │  Poids (weight)
Potentiel d'action         │  Activation (0/1 ou sigmoïde)
Apprentissage hebbien      │  Backpropagation
Plasticité                 │  Mise à jour des poids
Neurotransmetteurs         │  Biais et gradients
```

### Le Perceptron : Neurone Simplifié

```python
class Perceptron:
    """
    McCulloch-Pitts (1943) / Rosenblatt (1958)
    Le premier neurone artificiel
    """

    def __init__(self, n_inputs):
        self.weights = [random() for _ in range(n_inputs)]
        self.bias = random()

    def activate(self, inputs):
        """
        y = f(Σ(wi * xi) + b)
        """
        weighted_sum = sum(w * x for w, x in zip(self.weights, inputs))
        return self.activation_function(weighted_sum + self.bias)

    def activation_function(self, x):
        """Fonction de seuil (step function)"""
        return 1 if x > 0 else 0
```

## Architectures Cérébrales → Architectures NN

### Cortex Visuel → CNN (Convolutional Neural Networks)

```python
"""
Hubel & Wiesel (1962) : découverte des cellules simples et complexes
du cortex visuel → inspiration pour les CNN

V1 (cortex visuel primaire):
- Détecte les bords, orientations
- Champs récepteurs locaux
- Hiérarchie de features

→ Convolutions + Pooling dans les CNN
"""

class VisualCortex:
    def __init__(self):
        self.v1 = SimpleComplexCells()   # Conv layer 1
        self.v2 = TextureDetectors()     # Conv layer 2
        self.v4 = ShapeDetectors()       # Conv layer 3
        self.it = ObjectRecognition()    # Fully connected

    def process(self, retinal_input):
        edges = self.v1.detect(retinal_input)
        textures = self.v2.combine(edges)
        shapes = self.v4.integrate(textures)
        return self.it.recognize(shapes)
```

### Hippocampe → Mémoire et Attention

```python
class Hippocampus:
    """
    L'hippocampe : consolidation de la mémoire
    Inspiration pour les mécanismes d'attention (Transformers)
    """

    def __init__(self):
        self.ca1 = []  # Encodage
        self.ca3 = []  # Pattern completion
        self.dentate_gyrus = []  # Pattern separation

    def encode(self, experience):
        """Mémoire épisodique → embedding"""
        return self.dentate_gyrus.separate(experience)

    def recall(self, partial_cue):
        """Pattern completion → attention mechanism"""
        return self.ca3.complete(partial_cue)

    def consolidate(self, memory):
        """Transfert vers néocortex → long-term storage"""
        # Replay pendant le sommeil
        while sleeping():
            self.replay(memory)
            neocortex.store(memory)
```

## Neurotransmetteurs : Les Protocoles

```python
NEUROTRANSMITTERS = {
    'glutamate': {
        'type': 'excitatory',
        'function': 'signal_amplification',
        'analogy': 'TCP_SYN'  # Initie la communication
    },
    'GABA': {
        'type': 'inhibitory',
        'function': 'noise_reduction',
        'analogy': 'rate_limiter'  # Contrôle le flux
    },
    'dopamine': {
        'type': 'modulatory',
        'function': 'reward_signal',
        'analogy': 'reinforcement_learning'  # Signal de récompense
    },
    'serotonin': {
        'type': 'modulatory',
        'function': 'mood_regulation',
        'analogy': 'global_state'  # État du système
    },
    'acetylcholine': {
        'type': 'modulatory',
        'function': 'attention_memory',
        'analogy': 'focus_flag'  # Attention sélective
    }
}
```

## Oscillations Cérébrales : Les Horloges du Cerveau

```python
BRAIN_WAVES = {
    'delta': {'freq': '0.5-4 Hz', 'state': 'deep_sleep', 'process': 'restoration'},
    'theta': {'freq': '4-8 Hz', 'state': 'drowsy/memory', 'process': 'encoding'},
    'alpha': {'freq': '8-13 Hz', 'state': 'relaxed', 'process': 'idle'},
    'beta': {'freq': '13-30 Hz', 'state': 'active', 'process': 'thinking'},
    'gamma': {'freq': '30-100 Hz', 'state': 'focused', 'process': 'binding'}
}

class BrainRhythm:
    """
    Les oscillations synchronisent l'activité neuronale
    Comme les interruptions et les cycles d'horloge en CPU
    """

    def gamma_binding(self, features):
        """
        La synchronisation gamma lie les features
        en une perception unifiée
        (binding problem → solved by timing)
        """
        return synchronized_assembly(features, freq=40)  # Hz
```

## Glia : L'Infrastructure Cachée

```python
class GlialCells:
    """
    Les cellules gliales : l'infrastructure du cerveau
    10x plus nombreuses que les neurones
    """

    class Astrocyte:
        """Support métabolique et modulation synaptique"""
        def feed_neurons(self, glucose):
            return lactate  # Carburant pour neurones

        def modulate_synapse(self, synapse):
            # Tripartite synapse : astrocyte participe
            synapse.adjust(self.release_gliotransmitters())

    class Oligodendrocyte:
        """Myélinisation : isolation des axones"""
        def myelinate(self, axon):
            # Augmente la vitesse de conduction 100x
            axon.conduction_velocity *= 100

    class Microglia:
        """Système immunitaire du cerveau"""
        def patrol(self, region):
            for cell in region:
                if cell.is_damaged() or cell.is_infected():
                    self.phagocytose(cell)
```

## Réseaux Récurrents : Boucles de Feedback

```python
class RecurrentCircuit:
    """
    Le cerveau est plein de boucles récurrentes
    Contrairement aux feedforward networks
    """

    def __init__(self):
        self.cortex = CorticalLayers()
        self.thalamus = Thalamus()  # Relais central
        self.basal_ganglia = BasalGanglia()  # Sélection d'action

    def cortico_thalamic_loop(self, input_signal):
        """
        Boucle thalamo-corticale :
        Le thalamus filtre et route les signaux
        """
        while True:
            filtered = self.thalamus.gate(input_signal)
            processed = self.cortex.process(filtered)
            feedback = self.cortex.send_back(processed)
            input_signal = self.thalamus.integrate(feedback)

    def action_selection(self, options):
        """
        Les ganglions de la base :
        Sélection d'action par inhibition compétitive
        """
        return self.basal_ganglia.winner_take_all(options)
```

## Conscience et Émergence

```python
class GlobalWorkspace:
    """
    Théorie de l'espace de travail global (Baars, Dehaene)
    La conscience comme broadcast global
    """

    def __init__(self):
        self.modules = [
            VisualCortex(),
            AuditoryCortex(),
            MotorCortex(),
            PrefrontalCortex(),
            # ... autres modules spécialisés
        ]
        self.workspace = []

    def broadcast(self, information):
        """
        L'information devient consciente quand elle est
        diffusée à tous les modules simultanément
        """
        if self.attention_selects(information):
            for module in self.modules:
                module.receive(information)
            self.workspace.append(information)
            return "conscious"
        return "unconscious"
```

## Réflexions

Le cerveau nous enseigne que :

1. **La computation est distribuée** - Pas de CPU central
2. **L'apprentissage est local** - Règles synaptiques simples → comportement complexe
3. **Le timing compte** - La synchronisation crée le sens
4. **L'inhibition est aussi importante que l'excitation** - Savoir quoi ignorer
5. **La structure émerge de l'activité** - Le câblage suit l'usage

Les réseaux de neurones artificiels capturent une fraction de cette élégance.
Le cerveau reste notre meilleur modèle de ce que l'intelligence pourrait être.

---

*"Le cerveau est un monde constitué d'un nombre inconnu de continents et de mers inexplorés."* — Santiago Ramón y Cajal
