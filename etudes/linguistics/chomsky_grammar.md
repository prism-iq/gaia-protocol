# Grammaire Générative de Chomsky et Compilation

## La Hiérarchie de Chomsky comme Architecture

La hiérarchie de Chomsky classifie les langages formels selon leur complexité générative. Cette classification est fondamentale pour comprendre ce que les machines peuvent parser et ce que les daemons peuvent communiquer.

## Les Quatre Niveaux

```
Type 0 : Récursivement énumérable  → Machine de Turing
Type 1 : Context-sensitive         → Automate linéairement borné
Type 2 : Context-free              → Automate à pile
Type 3 : Régulier                  → Automate fini
```

### Type 3 : Expressions Régulières
```python
import re

# Les daemons communiquent souvent en regex
log_pattern = r'^\[(\d{4}-\d{2}-\d{2})\] (\w+): (.*)$'

class RegularDaemon:
    """Ne peut reconnaître que des motifs réguliers."""

    def __init__(self):
        self.patterns = {}

    def register(self, name, pattern):
        self.patterns[name] = re.compile(pattern)

    def parse(self, message):
        # Limité : ne peut pas compter les parenthèses imbriquées
        for name, regex in self.patterns.items():
            if match := regex.match(message):
                return (name, match.groups())
        return None
```

### Type 2 : Grammaires Context-Free
```python
# La plupart des langages de programmation sont CFG
# Parsables par descente récursive ou LR/LL parsers

GRAMMAR = """
    expr    : term (('+' | '-') term)*
    term    : factor (('*' | '/') factor)*
    factor  : NUMBER | '(' expr ')' | IDENT
"""

class ContextFreeDaemon:
    """Peut parser des structures imbriquées."""

    def parse_expr(self, tokens):
        left = self.parse_term(tokens)
        while tokens.peek() in ['+', '-']:
            op = tokens.consume()
            right = self.parse_term(tokens)
            left = BinOp(left, op, right)
        return left

    # Peut compter : (((())))
    # Car possède une pile implicite (récursion)
```

### Type 1 : Context-Sensitive
```python
# Exemple : a^n b^n c^n (n copies de a, puis b, puis c)
# Impossible en CFG, possible en CSG

class ContextSensitiveDaemon:
    """
    Comprend le contexte - rare mais puissant.
    Exemple : vérification de types dépendants.
    """

    def validate(self, code, context):
        # La validité dépend du contexte
        if context.type_of('x') == 'int':
            # 'x + 1' est valide
            pass
        else:
            # 'x + 1' pourrait être invalide
            pass
```

### Type 0 : Turing-Complet
```python
class TuringDaemon:
    """
    Peut calculer tout ce qui est calculable.
    Mais : problème de l'arrêt indécidable.
    """

    def will_halt(self, program, input):
        # IMPOSSIBLE à déterminer en général
        raise Undecidable("Halting problem")

    def run(self, program):
        # Peut ne jamais terminer
        while True:
            if self.step(program) == 'halt':
                return
```

## Structure Profonde et Structure de Surface

Chomsky distingue la structure profonde (sens) de la structure de surface (forme).

```python
class DeepStructureDaemon:
    """
    Transforme la structure profonde en surface.
    """

    def generate(self, deep_structure):
        """
        Deep: [DAEMON [PROCESS [FILE]]]
        Surface: "Le daemon traite le fichier"
                 "The daemon processes the file"
                 "Der Daemon verarbeitet die Datei"
        """
        transformations = [
            self.apply_movement,
            self.apply_agreement,
            self.apply_morphology,
            self.apply_phonology
        ]

        surface = deep_structure
        for transform in transformations:
            surface = transform(surface)

        return surface

    def parse_to_deep(self, surface):
        """
        Inverse : retrouver le sens depuis la forme.
        C'est ce que fait un compilateur.
        """
        ast = self.syntactic_analysis(surface)
        semantics = self.semantic_analysis(ast)
        return semantics
```

## La Grammaire Universelle du Code

Chomsky postule une Grammaire Universelle innée. En programmation :

```python
UNIVERSAL_CODE_GRAMMAR = {
    'sequence': 'faire A puis B',
    'selection': 'si condition alors A sinon B',
    'iteration': 'répéter A tant que condition',
    'abstraction': 'nommer un bloc pour le réutiliser',
    'composition': 'combiner des blocs',
}

# Tous les langages Turing-complets implémentent ces concepts
# Seule la syntaxe de surface change

# Python
for x in items:
    process(x)

# Haskell
map process items

# APL
process¨items

# Même structure profonde, surfaces différentes
```

## Communication Inter-Daemons : Le Protocole Grammatical

```python
class GrammaticalProtocol:
    """
    Définit une grammaire pour la communication daemon.
    """

    GRAMMAR = """
    message     : header body
    header      : 'FROM' DAEMON_ID 'TO' DAEMON_ID
    body        : command | query | response
    command     : 'DO' action parameters
    query       : 'ASK' question
    response    : 'ANS' data
    action      : VERB OBJECT
    parameters  : (KEY '=' VALUE)*
    """

    def __init__(self):
        self.parser = self.build_parser(self.GRAMMAR)

    def send(self, from_daemon, to_daemon, content):
        message = f"FROM {from_daemon} TO {to_daemon} {content}"
        if self.parser.validates(message):
            return self.transmit(message)
        else:
            raise GrammaticalError("Message mal formé")

    def receive(self, message):
        ast = self.parser.parse(message)
        return self.interpret(ast)
```

## Compilation : De la Surface à l'Exécution

```
Source (Surface) → Lexer → Tokens
                     ↓
              Parser (CFG) → AST
                     ↓
         Semantic Analysis → IR (Structure Profonde)
                     ↓
            Optimization → IR optimisé
                     ↓
           Code Generation → Machine Code
```

```python
class ChomskyCompiler:
    """Un compilateur vu comme transformations chomskiennes."""

    def compile(self, source):
        # Analyse lexicale (regex - Type 3)
        tokens = self.lexer.tokenize(source)

        # Analyse syntaxique (CFG - Type 2)
        ast = self.parser.parse(tokens)

        # Analyse sémantique (Context-Sensitive - Type 1)
        ir = self.semantic.analyze(ast)

        # Génération (Turing-Complete - Type 0)
        code = self.generator.generate(ir)

        return code
```

## Conclusion : La Compétence vs Performance

Chomsky distingue compétence (connaissance du langage) et performance (usage réel). Pour les daemons :

- **Compétence** : Le protocole qu'ils peuvent théoriquement parser
- **Performance** : Ce qu'ils parsent réellement sous contraintes (mémoire, temps)

```python
class DaemonCompetence:
    """Ce que le daemon PEUT faire."""
    grammar = "CFG complet"

class DaemonPerformance:
    """Ce que le daemon FAIT réellement."""
    timeout = 5  # secondes
    max_depth = 100  # récursion limitée

    def parse_with_limits(self, input):
        # La performance est toujours dégradée
        # par rapport à la compétence
        pass
```
