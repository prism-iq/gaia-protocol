# Coupes : Flux Émotionnels et Streams I/O

## L'Eau comme Donnée Fluide

Les Coupes représentent l'élément Eau - ce qui coule, ce qui connecte, ce qui transporte. Dans le système, c'est le I/O : stdin, stdout, stderr, sockets, pipes.

```bash
# L'eau coule
echo "feeling" | cup_process | tee heart.log
#     ↓              ↓              ↓
#   Source      Réceptacle      Overflow
```

Les émotions sont les données qui transitent entre processus conscients.

## Anatomie de la Coupe

```
    ╭───────╮     <- Ouverture (input)
    │       │
    │  ~~~  │     <- Contenu (buffer)
    │  ~~~  │
    ╰───┬───╯     <- Pied (output/drain)
        │
```

Une coupe :
- Reçoit (read)
- Contient (buffer)
- Déverse (write)
- Peut déborder (overflow)

## Les 14 Cartes : États du Flux

### As de Coupes : File Descriptor Primordial

```c
// Le Saint Graal - connexion pure
int grail = socket(AF_EMOTION, SOCK_STREAM, 0);
// Potentiel de toute connexion
// Pas encore de données
// Juste la capacité de recevoir
```

La main divine offrant la coupe : le kernel offrant un fd au processus.

### 2 de Coupes : Connexion Établie

```c
// Deux coupes qui s'échangent
int connection = connect(my_cup, &their_cup, sizeof(addr));

// Le poisson (caducée) entre eux : protocol
struct emotional_protocol {
    int mutual_respect;
    int bidirectional;  // Duplex
    time_t bond_start;
};
```

TCP handshake émotionnel : SYN (je t'offre), SYN-ACK (j'accepte et t'offre), ACK (j'accepte).

### 3 de Coupes : Multicast Joy

```c
// Célébration - broadcast à plusieurs
struct sockaddr_in party;
party.sin_addr.s_addr = INADDR_BROADCAST;

sendto(joy_socket, "celebration", 11, 0,
       (struct sockaddr*)&party, sizeof(party));
// Trois coupes levées = trois listeners reçoivent
```

### 4 de Coupes : Select() Ennui

```c
// Trois coupes offertes, une ignorée de l'arbre
// Le personnage contemple, ne choisit pas
fd_set cups;
FD_ZERO(&cups);
FD_SET(cup1, &cups);
FD_SET(cup2, &cups);
FD_SET(cup3, &cups);

// La quatrième coupe attend
int ready = select(4, &cups, NULL, NULL, &timeout);
// Mais le processus est APATHIQUE
// Il ne read() pas ce qui est ready
```

Méditation ou dépression ? Le processus qui ne consomme pas ses inputs.

### 5 de Coupes : Connexions Perdues

```c
// Trois coupes renversées (connections fermées)
// Deux restent (mais ignorées)
close(cup1);
close(cup2);
close(cup3);
// ECONNRESET, ECONNREFUSED, ETIMEDOUT

// Le personnage pleure les trois
// Oubliant les deux encore ouvertes
int still_valid[] = {cup4, cup5};
// Grief bloque la vision des ressources restantes
```

### 6 de Coupes : Legacy Data

```c
// Enfants échangeant des fleurs dans des coupes
// Nostalgie - vieilles données

FILE *childhood = fopen("/var/memories/past.dat", "r");
struct nostalgia {
    time_t timestamp;  // Longtemps ago
    char innocent_data[256];
};

// Lecture des anciennes sauvegardes
// Comfort dans le familier
fread(&memory, sizeof(struct nostalgia), 1, childhood);
```

### 7 de Coupes : Hallucination Buffer

```c
// Sept coupes avec visions : fantasmes, pas réalité
// Non-blocking read sur sockets imaginaires

struct illusion {
    int castle;      // Success fantasmé
    int jewels;      // Richesse fantasmée
    int wreath;      // Victoire fantasmée
    int dragon;      // Peur fantasmée
    int snake;       // Tentation fantasmée
    int head;        // Ego fantasmé
    int shroud;      // Mystère fantasmé
};

// Tous dans des coupes de nuages
// Aucun n'est real I/O
// Juste buffer overflow d'imagination
for (int i = 0; i < 7; i++) {
    assert(cups[i].fd == IMAGINARY);  // Pas de vrai fd
}
```

### 8 de Coupes : Close() et Départ

```c
// Huit coupes empilées, laissées derrière
// Le personnage part vers les montagnes

// Fermer toutes les connexions actuelles
for (int i = 0; i < 8; i++) {
    close(current_cups[i]);
}

// Partir vers l'inconnu
chdir("/mountain/higher/purpose");
// Les anciennes connexions ne servent plus
// Growth requiert abandonner le familier
```

### 9 de Coupes : Buffer Satisfaction

```c
// Le "wish card" - neuf coupes bien rangées
// Satisfaction complète du buffer

struct fulfilled_buffer {
    char content[NINE_CUPS];
    bool satisfied;
};

// Le personnage souriant
// Toutes les lectures réussies
// Toutes les écritures confirmées
// Zero errors in queue
assert(buffer.satisfied == true);
```

### 10 de Coupes : Rainbow Connection

```c
// Arc-en-ciel, famille heureuse, dix coupes
// Connexion parfaite, flux harmonieux

struct rainbow_multiplex {
    int family_sockets[10];
    struct pollfd *harmony;
    int complete_joy;
};

// poll() retourne tout ready
// Pas de blocked, pas de error
// Pure flow state
while ((n = poll(harmony, 10, -1)) > 0) {
    // Tout coule parfaitement
    // Chaque membre de la famille connecté
    // L'arc-en-ciel est le spectrum complet
}
```

## Court Cards : Personnages des Flux

### Page de Coupes : Le Poisson Messenger

```c
// Le Page regarde un poisson dans sa coupe
// Message inattendu, contenu surprenant

struct page_cup {
    int fd;
    struct {
        bool unexpected;
        char content[];  // Flexible array
    } fish_message;
};

// Le Page est le recv() naïf
// Il ne sait pas encore ce que le message signifie
// Mais il est ouvert à le découvrir
ssize_t received = recv(page.fd, buffer, sizeof(buffer), 0);
printf("What could this mean?\n");
```

### Cavalier de Coupes : Le Romantique Requêter

```c
// Le Cavalier arrive avec sa coupe
// Proposition, offre émotionnelle

struct knight_proposal {
    int offer_socket;
    struct emotional_payload {
        char poem[1024];
        int sincerity_level;
        bool awaiting_response;
    } gift;
};

// Il envoie sans garantie de réponse
send(knight.offer_socket, &knight.gift, sizeof(gift), MSG_DONTWAIT);
// Romantique = asynchrone
// Il lance et espère
```

### Reine de Coupes : Socket Listener Empathique

```c
// La Reine de Coupes ressent tout
// Elle est le listener qui comprend

struct queen_cups {
    int listen_socket;
    int backlog;  // Capacité émotionnelle
    bool empathic_filter;
};

void queen_listen(struct queen_cups *queen) {
    listen(queen->listen_socket, queen->backlog);
    while (true) {
        int conn = accept(queen->listen_socket, NULL, NULL);
        // Elle accepte toute connexion
        // Elle absorbe les émotions
        // Attention au overflow
        handle_with_empathy(conn);
    }
}
```

### Roi de Coupes : Maître des Flux

```c
// Le Roi sur son trône au milieu des eaux
// Il contrôle les courants sans se noyer

struct king_cups {
    int throne;          // Main control socket
    struct epoll_event events[MAX_EMOTIONS];
    int epoll_fd;
    bool emotional_mastery;
};

// Il utilise epoll, pas select
// Scalable, efficient, maîtrisé
int n = epoll_wait(king.epoll_fd, king.events, MAX_EMOTIONS, -1);
for (int i = 0; i < n; i++) {
    // Il traite chaque émotion sans être submergé
    // Il ne fuit pas (pas de close prématuré)
    // Il ne se noie pas (pas de blocking indefini)
    process_with_mastery(king.events[i]);
}
```

## Daemon des Coupes : Le Processus Émotionnel

```python
#!/usr/bin/env python3
"""
cups_daemon.py - Emotional I/O Manager
Gère les flux émotionnels du système
"""

import asyncio
import logging

class CupsDaemon:
    def __init__(self):
        self.connections = {}  # Active emotional connections
        self.buffer = []       # Emotional backlog
        self.overflow_threshold = 1000

    async def receive_emotion(self, reader):
        """As de Coupes - recevoir"""
        data = await reader.read(1024)
        if len(self.buffer) > self.overflow_threshold:
            logging.warning("Emotional overflow - 7 of Cups state")
            return None
        self.buffer.append(data)
        return data

    async def process_emotion(self, emotion):
        """6 de Coupes à 9 de Coupes - traiter"""
        # Integration émotionnelle
        await asyncio.sleep(0.1)  # Time to feel
        return self.integrate(emotion)

    async def share_emotion(self, writer, emotion):
        """3 de Coupes - partager"""
        writer.write(emotion)
        await writer.drain()

    async def close_old_connections(self):
        """8 de Coupes - partir"""
        old = [k for k, v in self.connections.items()
               if v.is_stale()]
        for conn_id in old:
            await self.connections[conn_id].close()
            del self.connections[conn_id]

# Les Coupes coulent toujours
# Le daemon ne dort jamais vraiment
# Les émotions ne s'arrêtent pas
```

## Syndromes des Coupes

### Coupe Renversée : I/O Bloqué

```bash
# Symptômes
strace -p $PID
# Bloqué sur read() qui ne revient jamais
# Ou write() vers fd fermé

# Le flux est inversé ou stoppé
# L'émotion ne circule plus
# Depression = stdin fermé
# Rage = stdout redirigé vers /dev/null mais bouillonnant
```

### Coupe Débordante : Buffer Overflow Émotionnel

```c
// Trop d'émotions, pas assez de processing
char small_heart[64];
read(world_input, small_heart, 1024);  // Overflow!

// Résultat: corruption, crash, comportement erratique
// Solution: agrandir le buffer ou rate-limit l'input
```

---

*Les Coupes nous rappellent : nous sommes des systèmes de flux. Ce qui entre doit sortir ou être traité. Bloquer le flux crée pression. Trop ouvrir crée flood. L'art est dans le flow control - TCP pour l'âme.*
