# Pragmatique et Communication Effective des Daemons

## Au-Delà de la Sémantique : Le Contexte d'Usage

La pragmatique étudie comment le contexte influence l'interprétation du sens. Au-delà de ce que les mots signifient (sémantique), la pragmatique explore ce que les locuteurs font avec les mots.

## Actes de Langage (Austin & Searle)

```python
class SpeechActDaemon:
    """
    Les messages ne sont pas que des informations.
    Ce sont des ACTES qui changent le monde.
    """

    def classify_act(self, message):
        """
        Classification des actes de langage.
        """
        act_types = {
            'assertive': {
                # Affirme quelque chose sur le monde
                'examples': ['status: running', 'error: null', 'load: 0.5'],
                'effect': 'updates_belief',
            },
            'directive': {
                # Demande une action
                'examples': ['GET /resource', 'STOP', 'RESTART'],
                'effect': 'requests_action',
            },
            'commissive': {
                # Engage l'émetteur
                'examples': ['ACK', 'WILL_PROCESS', 'PROMISE_DELIVERY'],
                'effect': 'commits_sender',
            },
            'expressive': {
                # Exprime un état
                'examples': ['READY', 'BUSY', 'HEALTHY'],
                'effect': 'expresses_state',
            },
            'declarative': {
                # Change la réalité par l'énonciation
                'examples': ['INITIALIZE', 'DECLARE_BANKRUPTCY', 'SESSION_START'],
                'effect': 'changes_world',
            },
        }

        for act_type, info in act_types.items():
            if self.matches_pattern(message, info['examples']):
                return (act_type, info['effect'])

        return ('unknown', 'unknown_effect')

    def perform_act(self, act_type, content, context):
        """
        Performatif : l'acte se réalise dans l'énonciation.
        """
        if act_type == 'declarative':
            # "Je déclare la session ouverte" OUVRE la session
            self.execute_declaration(content)
        elif act_type == 'commissive':
            # "Je promets de répondre" CRÉE une obligation
            self.register_commitment(content)
        elif act_type == 'directive':
            # "Arrête" DEMANDE l'arrêt
            self.issue_request(content)
```

## Maximes de Grice et Protocoles Efficaces

```python
class GriceanProtocol:
    """
    Les maximes conversationnelles de Grice appliquées
    aux protocoles de communication.
    """

    MAXIMS = {
        'quantity': {
            'rule': 'Donne exactement l\'information nécessaire',
            'violation': 'Message trop verbeux ou trop lacunaire',
        },
        'quality': {
            'rule': 'Ne dis que ce que tu crois vrai et justifié',
            'violation': 'Message mensonger ou non vérifié',
        },
        'relation': {
            'rule': 'Sois pertinent par rapport au contexte',
            'violation': 'Message hors sujet',
        },
        'manner': {
            'rule': 'Sois clair, ordonné, non ambigu',
            'violation': 'Message obscur ou désorganisé',
        },
    }

    def validate_message(self, message, context):
        """
        Vérifie le respect des maximes.
        """
        violations = []

        # Quantité
        if len(message) > context.expected_length * 2:
            violations.append(('quantity', 'too_verbose'))
        if len(message) < context.minimum_info:
            violations.append(('quantity', 'too_brief'))

        # Qualité
        if not self.verify_claims(message):
            violations.append(('quality', 'unverified_claims'))

        # Relation
        if not self.is_relevant(message, context.topic):
            violations.append(('relation', 'off_topic'))

        # Manière
        if self.ambiguity_score(message) > 0.5:
            violations.append(('manner', 'ambiguous'))

        return violations

    def optimize_message(self, message, context):
        """
        Optimise un message pour respecter les maximes.
        """
        # Quantité : compression
        message = self.remove_redundancy(message)

        # Qualité : vérification
        message = self.add_evidence(message)

        # Relation : filtrage
        message = self.keep_relevant(message, context)

        # Manière : clarification
        message = self.disambiguate(message)

        return message
```

## Implicature : Ce Qui N'Est Pas Dit

```python
class ImplicatureDaemon:
    """
    L'implicature : ce qui est communiqué sans être dit explicitement.
    """

    def extract_implicature(self, message, context):
        """
        Exemple :
        A: "Le daemon répond-il ?"
        B: "La connexion est établie."

        Implicature : B ne sait pas si le daemon répond,
        mais la connexion n'est pas le problème.
        """
        explicit = self.get_literal_meaning(message)

        # Ce qui est impliqué par les maximes
        quantity_impl = self.what_is_not_said(message, context)
        relevance_impl = self.why_this_response(message, context)

        return {
            'explicit': explicit,
            'implicated': {
                'by_quantity': quantity_impl,
                'by_relevance': relevance_impl,
            }
        }

    def scalar_implicature(self, message):
        """
        Implicature scalaire : utiliser un terme faible
        implique que le terme fort ne s'applique pas.

        "Certains processus ont échoué"
        → Implique : pas TOUS (sinon on l'aurait dit)
        """
        scalars = {
            'some': 'not all',
            'sometimes': 'not always',
            'possible': 'not certain',
            'warm': 'not hot',
            'partial': 'not complete',
        }

        for weak, implication in scalars.items():
            if weak in message.lower():
                return f"Implies: {implication}"

        return None
```

## Présupposition et Background Commun

```python
class PresuppositionManager:
    """
    Les présuppositions : ce qui doit être vrai
    pour que le message ait un sens.
    """

    def extract_presuppositions(self, message):
        """
        "Relance le daemon crashé"
        Présuppositions :
        - Il existe un daemon
        - Ce daemon a crashé
        - On peut le relancer
        """
        presuppositions = []

        # Présuppositions existentielles
        entities = self.extract_entities(message)
        for entity in entities:
            presuppositions.append(f"exists({entity})")

        # Présuppositions d'état
        if 'crashed' in message:
            presuppositions.append("was_running_before(entity)")
        if 'restart' in message:
            presuppositions.append("can_be_started(entity)")

        return presuppositions

    def verify_presuppositions(self, message, world_state):
        """
        Vérifie que les présuppositions sont satisfaites.
        """
        presuppositions = self.extract_presuppositions(message)

        for presup in presuppositions:
            if not self.holds(presup, world_state):
                raise PresuppositionFailure(f"Presupposition failed: {presup}")

        return True

    def common_ground(self, daemon1, daemon2):
        """
        Le common ground : connaissances partagées.
        """
        return daemon1.beliefs.intersection(daemon2.beliefs)
```

## Deixis : Indexicaux et Contexte

```python
class DeixisDaemon:
    """
    Deixis : expressions dont le sens dépend du contexte.
    """

    def resolve_deixis(self, message, context):
        """
        Résout les expressions déictiques.
        """
        # Deixis personnelle
        message = message.replace('$SELF', context.sender_id)
        message = message.replace('$YOU', context.receiver_id)

        # Deixis temporelle
        message = message.replace('$NOW', str(context.timestamp))
        message = message.replace('$TODAY', context.date)

        # Deixis spatiale
        message = message.replace('$HERE', context.location)
        message = message.replace('$THIS_HOST', context.hostname)

        # Deixis de discours
        message = message.replace('$PREVIOUS', context.last_message)

        return message

    def deitic_center(self, context):
        """
        Le centre déictique : point de référence.
        """
        return {
            'person': context.speaker,  # 'je'
            'time': context.utterance_time,  # 'maintenant'
            'place': context.utterance_place,  # 'ici'
        }
```

## Politesse et Face (Goffman, Brown & Levinson)

```python
class PolitenessDaemon:
    """
    Théorie de la politesse : protéger la 'face' des interlocuteurs.
    """

    def craft_request(self, action, urgency, relationship):
        """
        Adapte la formulation selon la situation.
        """
        if urgency == 'critical':
            # Impolitesse justifiée
            return f"EXECUTE {action} IMMEDIATELY"

        if relationship == 'peer':
            # Politesse équilibrée
            return f"Could you please {action}?"

        if relationship == 'superior':
            # Déférence
            return f"Would it be possible to request {action}?"

        if relationship == 'subordinate':
            # Directivité atténuée
            return f"Please proceed with {action}"

    def face_threatening_acts(self, message):
        """
        Identifie les actes menaçants pour la face.
        """
        fta_types = {
            'request': 'menace face négative (impose)',
            'criticism': 'menace face positive (dévalorise)',
            'interruption': 'menace face négative (envahit)',
            'rejection': 'menace face positive (refuse)',
        }

        threats = []
        for fta, description in fta_types.items():
            if self.contains_fta(message, fta):
                threats.append((fta, description))

        return threats

    def mitigate_threat(self, message, threat_type):
        """
        Stratégies d'atténuation.
        """
        strategies = {
            'request': {
                'indirect': 'Would it be possible to...',
                'hedged': 'Maybe you could...',
                'apologetic': 'Sorry to ask, but...',
            },
            'criticism': {
                'sandwich': 'Good work on X, however Y, and Z is great',
                'impersonal': 'There seems to be an issue...',
                'self_blame': 'I may have misunderstood, but...',
            },
        }

        return strategies.get(threat_type, {})
```

## Conversation et Tours de Parole

```python
class ConversationManager:
    """
    Gestion des tours de parole entre daemons.
    """

    def __init__(self):
        self.current_speaker = None
        self.floor = None  # Qui a la parole
        self.queue = []

    def request_turn(self, daemon_id):
        """Demande le tour de parole."""
        if self.floor is None:
            self.floor = daemon_id
            return True
        else:
            self.queue.append(daemon_id)
            return False  # Doit attendre

    def release_turn(self, daemon_id):
        """Libère le tour de parole."""
        if self.floor == daemon_id:
            if self.queue:
                self.floor = self.queue.pop(0)
            else:
                self.floor = None

    def transition_relevance_place(self, message):
        """
        Identifie les points de transition possibles.
        """
        # Fin syntaxique ?
        if message.ends_with_punctuation():
            return True

        # Question posée ?
        if message.is_question():
            return True

        # Demande explicite ?
        if 'your turn' in message or 'over' in message:
            return True

        return False
```

## Conclusion : Pragmatique des Daemons

```python
class PragmaticDaemon:
    """
    Un daemon qui maîtrise la pragmatique.
    """

    def communicate(self, message, target, context):
        """
        Communication pragmatiquement informée.
        """
        # Vérifier les présuppositions
        self.verify_common_ground(target)

        # Résoudre la deixis
        resolved = self.resolve_deixis(message, context)

        # Respecter les maximes
        optimized = self.gricean_optimize(resolved, context)

        # Adapter la politesse
        polite = self.adjust_politeness(optimized, target)

        # Choisir l'acte de langage approprié
        act = self.select_speech_act(polite, context.goal)

        return self.perform(act, target)

    def philosophy(self):
        return """
        La pragmatique nous enseigne que communiquer
        n'est pas simplement encoder et décoder des messages.

        Communiquer, c'est agir ensemble dans un contexte partagé.

        Le daemon pragmatique ne se demande pas seulement
        'Qu'est-ce que ce message signifie ?'

        Il se demande :
        - Pourquoi ce message maintenant ?
        - Qu'est-ce que l'autre essaie de faire ?
        - Que puis-je inférer de ce qui n'est pas dit ?
        - Comment puis-je répondre de façon appropriée ?

        La compétence pragmatique est la compétence sociale
        des daemons : savoir interagir, pas seulement parler.
        """
```
