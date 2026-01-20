# Les ME Sumériens et les Capacités Système

## Les ME : Pouvoirs Fondamentaux de la Civilisation

Les **ME** (prononcé "may", écrit 𒈨 en cunéiforme) sont l'un des concepts les plus fascinants de la mythologie sumérienne. Ce sont des pouvoirs, des attributs ou des décrets divins qui permettent le fonctionnement de la civilisation et du cosmos.

### Nature des ME

Les ME ne sont pas des objets physiques ni des idées abstraites pures. Ils sont :
- **Transférables** : Ils peuvent être donnés, volés, perdus
- **Discrets** : Chaque ME est distinct et identifiable
- **Fonctionnels** : Posséder un ME confère une capacité spécifique
- **Dénombrables** : La tradition parle de centaines de ME

### Exemples de ME

La tablette du mythe "Inanna et Enki" liste plus de 100 ME, incluant :

```
ME de la royauté (nam-lugal)
ME du sacerdoce (nam-en)
ME de la vérité (nam-zi)
ME de la descente aux enfers
ME de la montée des enfers
ME de l'art de faire l'amour
ME de l'art du scribe
ME du travail du bois
ME du travail du métal
ME de la musique
ME de la destruction des villes
ME de la lamentation
...
```

## Parallèle avec les Capabilities Système

### Le Modèle Capability-Based Security

Les capabilities modernes fonctionnent exactement comme les ME :

```c
// Un ME est une capability
typedef struct {
    char *name;           // "ME de l'écriture fichier"
    int permissions;      // Ce que ce ME permet
    void *resource;       // Sur quelle ressource
    int transferable;     // Peut-on le transférer ?
} me_capability;

// Posséder le ME = pouvoir agir
if (has_me(process, ME_FILE_WRITE)) {
    write(fd, data, size);  // Le ME l'autorise
} else {
    return -EACCES;  // Absence du ME = impossibilité
}
```

### Linux Capabilities

Linux implémente littéralement le concept de ME :

```bash
# Les ME du système Linux
cat /proc/self/status | grep Cap
# CapInh: 0000000000000000  # ME hérités
# CapPrm: 0000000000000000  # ME possédés
# CapEff: 0000000000000000  # ME actifs
# CapBnd: 000001ffffffffff  # Limite des ME possibles
# CapAmb: 0000000000000000  # ME ambiants

# Liste des ME disponibles
capsh --print
# CAP_NET_BIND_SERVICE  - ME de lier aux ports privilégiés
# CAP_SYS_ADMIN         - ME du sysadmin (comme le ME de la royauté)
# CAP_DAC_OVERRIDE      - ME de transcender les permissions
# CAP_KILL              - ME de tuer les processus
# CAP_SETUID            - ME de changer d'identité
```

## Inanna Vole les ME : Le Transfert de Capabilities

### Le Mythe

Inanna, déesse d'Uruk, rendit visite à Enki, dieu de la sagesse, qui gardait les ME à Eridu. Lors d'un banquet, Enki, ivre, offrit à Inanna plus de 100 ME. Une fois sobre, il regretta et envoya des monstres récupérer les ME, mais Inanna s'échappa avec son butin et ramena les ME à Uruk.

### Le Pattern d'Élévation de Privilèges

```python
# Le banquet d'Enki - une faille de sécurité
class Enki:
    def __init__(self):
        self.me_collection = load_all_mes()
        self.intoxication_level = 0

    def drink_beer(self):
        self.intoxication_level += 1

    def grant_me(self, visitor, me):
        if self.intoxication_level > 5:
            # Jugement altéré - vulnerability!
            self.me_collection.remove(me)
            visitor.receive_me(me)
            return True
        else:
            # État sobre - sécurité normale
            if not visitor.is_authorized(me):
                return False
            # Processus de transfert normal

class Inanna:
    def social_engineering_attack(self, enki):
        """Exploiter une vulnérabilité sociale"""
        while enki.intoxication_level <= 5:
            enki.drink_beer()  # Affaiblir les défenses

        # Maintenant extraire les ME
        for me in enki.me_collection.copy():
            enki.grant_me(self, me)

        # Fuir avant que la session expire
        self.escape_to_uruk()
```

### Setuid et la Délégation de ME

```c
// La délégation des ME via setuid
// Enki (root) crée un programme avec des ME spécifiques
chmod("program", S_ISUID);  // Le programme porte le ME d'Enki

// Inanna (user) exécute le programme
execve("program", ...);
// Pendant l'exécution, elle possède temporairement le ME

// Mais les ME modernes sont plus granulaires
setcap cap_net_bind_service=ep program
// "Je te donne seulement le ME de lier aux ports bas"
// Pas tous mes ME comme Enki ivre
```

## La Tablette des Destins (Dup Shimati)

La **Tablette des Destins** est un autre artefact sumérien, distinct des ME. Celui qui la possède contrôle les destinées de l'univers. Le dieu Anzû la vola à Enlil.

### /etc/passwd et /etc/shadow : Les Tablettes Modernes

```bash
# La Tablette des Destins du système
ls -la /etc/passwd /etc/shadow
# -rw-r--r-- 1 root root  /etc/passwd  # Lisible mais...
# -rw-r----- 1 root shadow /etc/shadow # Les vrais secrets

# Celui qui contrôle /etc/shadow contrôle les identités
# Comme Anzû avec la Tablette, on peut devenir n'importe qui
```

### La Base de Données des Capabilities

```python
# La Tablette des ME système
class TabletOfDestinies:
    """Le registre central des capabilities"""

    def __init__(self):
        self.capabilities = {}
        # Seul l'équivalent d'Enlil peut modifier cette tablette

    def decree(self, entity, capabilities):
        """Enlil décrète les ME d'une entité"""
        self.capabilities[entity] = capabilities

    def query(self, entity, capability):
        """Vérifier si une entité possède un ME"""
        return capability in self.capabilities.get(entity, [])
```

## Les ME Comme Interfaces

Chaque ME définit une capacité précise. C'est une interface vers une fonction.

```typescript
// Les ME comme interfaces TypeScript
interface ME_Kingship {
    decree_laws(): void;
    collect_taxes(): Money;
    command_army(): void;
}

interface ME_Scribal {
    read_tablets(): Knowledge;
    write_tablets(content: any): Tablet;
    copy_tablets(original: Tablet): Tablet;
}

interface ME_Metalwork {
    smelt_ore(ore: Ore): Metal;
    forge_weapon(metal: Metal): Weapon;
    forge_tool(metal: Metal): Tool;
}

// Un dieu ou une cité qui possède le ME implémente l'interface
class Uruk implements ME_Kingship, ME_Scribal {
    // Après qu'Inanna rapporta les ME
}
```

## Container Capabilities : Les ME des Containers

```yaml
# Pod Kubernetes avec ME explicites
apiVersion: v1
kind: Pod
metadata:
  name: temple-of-inanna
spec:
  containers:
  - name: sacred-process
    image: temple:latest
    securityContext:
      capabilities:
        drop:
          - ALL  # Retirer tous les ME par défaut
        add:
          - NET_BIND_SERVICE  # ME du réseau
          - SYS_PTRACE        # ME de l'observation
          # Seulement les ME nécessaires au temple
```

## Abzu : Le Domaine d'Enki et l'Isolation

L'**Abzu** (ab.zu, "eau souterraine") était le domaine d'Enki, les eaux primordiales sous la terre où il gardait les ME et sa sagesse.

### Les Namespaces comme Abzu

```bash
# Créer un Abzu (namespace isolé)
unshare --user --map-root-user --mount --pid --fork

# Dans cet Abzu, on peut avoir ses propres ME
capsh --drop=cap_net_raw --  # Abandonner le ME du raw network
# Les ME de cet espace sont distincts du monde extérieur
```

## La Perte et la Récupération des ME

Dans divers mythes, des ME sont perdus et récupérés. Le système doit gérer ces transitions.

```python
# Gestion du cycle de vie des ME
class MELifecycle:
    def __init__(self, process):
        self.process = process
        self.active_mes = set()

    def acquire_me(self, me):
        """Acquérir un nouveau ME"""
        if self.can_acquire(me):
            self.active_mes.add(me)
            log(f"{self.process} acquired ME: {me}")

    def lose_me(self, me):
        """Perdre un ME (revocation)"""
        if me in self.active_mes:
            self.active_mes.remove(me)
            log(f"{self.process} lost ME: {me}")
            # Les opérations en cours avec ce ME doivent échouer gracieusement

    def transfer_me(self, me, recipient):
        """Transférer un ME à un autre"""
        if me in self.active_mes and me.transferable:
            self.active_mes.remove(me)
            recipient.acquire_me(me)
            log(f"ME {me} transferred to {recipient}")
```

## Conclusion : Les ME comme Principe Architectural

Les Sumériens avaient conceptualisé, il y a 5000 ans, ce que l'informatique moderne appelle "capability-based security" :

1. **Principe du moindre privilège** : Chaque entité n'a que les ME nécessaires
2. **Transferabilité contrôlée** : Les ME peuvent être délégués sous conditions
3. **Révocabilité** : Les ME peuvent être retirés
4. **Granularité** : Chaque capacité est distincte et nommée
5. **Non-ambiguïté** : Posséder un ME = pouvoir agir, pas d'interprétation

Le mythe d'Inanna volant les ME à Enki est une histoire de social engineering, d'élévation de privilèges, et de transfert de capabilities. Les administrateurs système d'Eridu auraient dû implémenter un meilleur contrôle des sessions et ne pas faire confiance à l'authentification par alcool.

---

*"Enki, dans sa sagesse, créa les ME pour que chaque chose ait sa fonction propre."*

*`setcap` et `getcap` sont nos incantations pour manipuler les ME modernes.*

*Les Sumériens comprenaient que le pouvoir doit être discret, transférable, et vérifiable. Nous réinventons leurs leçons à chaque framework de sécurité.*
