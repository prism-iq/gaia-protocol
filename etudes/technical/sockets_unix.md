# Sockets UNIX - Étude Technique Approfondie

## Introduction

Les sockets UNIX (aussi appelés sockets de domaine UNIX) sont un mécanisme de communication inter-processus (IPC) permettant l'échange de données entre processus sur la même machine. Contrairement aux sockets réseau, ils utilisent le système de fichiers comme espace de noms.

## Architecture des Sockets UNIX

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ESPACE UTILISATEUR                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐                      ┌──────────────┐            │
│   │  Processus A │                      │  Processus B │            │
│   │   (Client)   │                      │   (Serveur)  │            │
│   └──────┬───────┘                      └──────┬───────┘            │
│          │ socket()                            │ socket()           │
│          │ connect()                           │ bind()             │
│          │                                     │ listen()           │
│          │                                     │ accept()           │
│          │                                     │                    │
│          └──────────────┬──────────────────────┘                    │
│                         │                                           │
├─────────────────────────┼───────────────────────────────────────────┤
│                         ▼                                           │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    NOYAU LINUX                              │   │
│   │  ┌───────────────────────────────────────────────────────┐  │   │
│   │  │           Socket Buffer (sk_buff)                     │  │   │
│   │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  │   │
│   │  │  │ Données │──│ Données │──│ Données │──│ Données │   │  │   │
│   │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │  │   │
│   │  └───────────────────────────────────────────────────────┘  │   │
│   │                                                             │   │
│   │  ┌──────────────────────────────────────────────────────┐   │   │
│   │  │  /var/run/app.sock  (inode dans le VFS)              │   │   │
│   │  └──────────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Types de Sockets UNIX

### 1. SOCK_STREAM (TCP-like)
- Connexion orientée
- Fiable, ordonnée
- Flux continu de données

### 2. SOCK_DGRAM (UDP-like)
- Sans connexion
- Datagrammes individuels
- Limites de messages préservées

### 3. SOCK_SEQPACKET
- Connexion orientée
- Datagrammes ordonnés
- Limites de messages préservées

## Implémentation en C

### Serveur Socket UNIX

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/un.h>

#define SOCKET_PATH "/tmp/unix_socket_example.sock"
#define BUFFER_SIZE 256

int main() {
    int server_fd, client_fd;
    struct sockaddr_un server_addr, client_addr;
    socklen_t client_len;
    char buffer[BUFFER_SIZE];

    // Création du socket
    server_fd = socket(AF_UNIX, SOCK_STREAM, 0);
    if (server_fd == -1) {
        perror("socket");
        exit(EXIT_FAILURE);
    }

    // Configuration de l'adresse
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sun_family = AF_UNIX;
    strncpy(server_addr.sun_path, SOCKET_PATH, sizeof(server_addr.sun_path) - 1);

    // Suppression du socket existant
    unlink(SOCKET_PATH);

    // Liaison du socket
    if (bind(server_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1) {
        perror("bind");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    // Mise en écoute
    if (listen(server_fd, 5) == -1) {
        perror("listen");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    printf("Serveur en écoute sur %s\n", SOCKET_PATH);

    // Boucle principale
    while (1) {
        client_len = sizeof(client_addr);
        client_fd = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);

        if (client_fd == -1) {
            perror("accept");
            continue;
        }

        // Lecture des données
        ssize_t bytes_read = read(client_fd, buffer, BUFFER_SIZE - 1);
        if (bytes_read > 0) {
            buffer[bytes_read] = '\0';
            printf("Reçu: %s\n", buffer);

            // Réponse
            const char *response = "Message reçu!";
            write(client_fd, response, strlen(response));
        }

        close(client_fd);
    }

    close(server_fd);
    unlink(SOCKET_PATH);
    return 0;
}
```

### Client Socket UNIX

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/un.h>

#define SOCKET_PATH "/tmp/unix_socket_example.sock"
#define BUFFER_SIZE 256

int main() {
    int sock_fd;
    struct sockaddr_un server_addr;
    char buffer[BUFFER_SIZE];

    // Création du socket
    sock_fd = socket(AF_UNIX, SOCK_STREAM, 0);
    if (sock_fd == -1) {
        perror("socket");
        exit(EXIT_FAILURE);
    }

    // Configuration de l'adresse serveur
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sun_family = AF_UNIX;
    strncpy(server_addr.sun_path, SOCKET_PATH, sizeof(server_addr.sun_path) - 1);

    // Connexion au serveur
    if (connect(sock_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1) {
        perror("connect");
        close(sock_fd);
        exit(EXIT_FAILURE);
    }

    // Envoi d'un message
    const char *message = "Hello, Unix Socket!";
    write(sock_fd, message, strlen(message));

    // Réception de la réponse
    ssize_t bytes_read = read(sock_fd, buffer, BUFFER_SIZE - 1);
    if (bytes_read > 0) {
        buffer[bytes_read] = '\0';
        printf("Réponse: %s\n", buffer);
    }

    close(sock_fd);
    return 0;
}
```

## Implémentation en Python

### Serveur avec asyncio

```python
#!/usr/bin/env python3
import asyncio
import os

SOCKET_PATH = "/tmp/unix_socket_async.sock"

async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    """Gère une connexion client."""
    addr = writer.get_extra_info('peername')
    print(f"Nouvelle connexion: {addr}")

    try:
        while True:
            data = await reader.read(1024)
            if not data:
                break

            message = data.decode('utf-8')
            print(f"Reçu: {message}")

            response = f"Echo: {message}"
            writer.write(response.encode('utf-8'))
            await writer.drain()

    except asyncio.CancelledError:
        pass
    finally:
        writer.close()
        await writer.wait_closed()
        print(f"Connexion fermée: {addr}")

async def main():
    # Suppression du socket existant
    if os.path.exists(SOCKET_PATH):
        os.unlink(SOCKET_PATH)

    server = await asyncio.start_unix_server(handle_client, path=SOCKET_PATH)

    print(f"Serveur Unix Socket démarré sur {SOCKET_PATH}")

    async with server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())
```

### Client asynchrone

```python
#!/usr/bin/env python3
import asyncio

SOCKET_PATH = "/tmp/unix_socket_async.sock"

async def send_message(message: str) -> str:
    """Envoie un message et retourne la réponse."""
    reader, writer = await asyncio.open_unix_connection(SOCKET_PATH)

    writer.write(message.encode('utf-8'))
    await writer.drain()

    response = await reader.read(1024)

    writer.close()
    await writer.wait_closed()

    return response.decode('utf-8')

async def main():
    messages = ["Hello", "World", "Test Unix Socket"]

    for msg in messages:
        response = await send_message(msg)
        print(f"Envoyé: {msg} -> Réponse: {response}")

if __name__ == "__main__":
    asyncio.run(main())
```

## Abstract Sockets (Linux spécifique)

Les sockets abstraits n'existent pas dans le système de fichiers.

```c
// Socket abstrait - le premier caractère est '\0'
struct sockaddr_un addr;
addr.sun_family = AF_UNIX;
addr.sun_path[0] = '\0';
strcpy(addr.sun_path + 1, "abstract_socket_name");

// La longueur doit inclure le '\0' initial
socklen_t addr_len = offsetof(struct sockaddr_un, sun_path) +
                     1 + strlen("abstract_socket_name");
```

```
┌────────────────────────────────────────────────────────────┐
│                  Sockets UNIX vs Abstraits                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   Socket Fichier:          Socket Abstrait:                │
│   ┌─────────────────┐      ┌─────────────────┐             │
│   │ /tmp/app.sock   │      │ @app_socket     │             │
│   └────────┬────────┘      └────────┬────────┘             │
│            │                        │                      │
│            ▼                        ▼                      │
│   ┌─────────────────┐      ┌─────────────────┐             │
│   │  Inode VFS      │      │  Namespace      │             │
│   │  (persiste)     │      │  kernel only    │             │
│   └─────────────────┘      └─────────────────┘             │
│                                                            │
│   - Visible avec ls        - Invisible dans FS             │
│   - Permissions fichier    - Pas de permissions FS         │
│   - Doit être nettoyé      - Auto-nettoyé                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Passage de Descripteurs de Fichiers

Une fonctionnalité unique des sockets UNIX est la capacité de passer des descripteurs de fichiers entre processus.

```c
#include <sys/socket.h>

// Structure pour le message de contrôle
struct msghdr msg = {0};
struct cmsghdr *cmsg;
char buf[CMSG_SPACE(sizeof(int))];
int fd_to_send = open("/etc/passwd", O_RDONLY);

// Configuration du message
msg.msg_control = buf;
msg.msg_controllen = sizeof(buf);

// Configuration du message de contrôle
cmsg = CMSG_FIRSTHDR(&msg);
cmsg->cmsg_level = SOL_SOCKET;
cmsg->cmsg_type = SCM_RIGHTS;
cmsg->cmsg_len = CMSG_LEN(sizeof(int));
*((int *)CMSG_DATA(cmsg)) = fd_to_send;

// Envoi du descripteur
sendmsg(socket_fd, &msg, 0);
```

```
┌────────────────────────────────────────────────────────────────────┐
│              Passage de Descripteur de Fichier                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   Processus A                      Processus B                     │
│   ┌──────────────┐                 ┌──────────────┐                │
│   │ fd = 5       │   sendmsg()    │ fd = 8       │                │
│   │ (fichier X)  │────────────────▶│ (fichier X)  │                │
│   └──────────────┘   SCM_RIGHTS    └──────────────┘                │
│         │                                │                         │
│         │                                │                         │
│         ▼                                ▼                         │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │                   Table des fichiers kernel             │      │
│   │                                                         │      │
│   │   ┌─────────┐                                           │      │
│   │   │ Fichier │◀──── Deux fd pointent vers                │      │
│   │   │    X    │      le même fichier ouvert               │      │
│   │   └─────────┘                                           │      │
│   └─────────────────────────────────────────────────────────┘      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Credentials Passing (Authentification)

```c
// Activation de la réception des credentials
int enable = 1;
setsockopt(sock_fd, SOL_SOCKET, SO_PASSCRED, &enable, sizeof(enable));

// Réception des credentials
struct ucred cred;
socklen_t len = sizeof(cred);
getsockopt(client_fd, SOL_SOCKET, SO_PEERCRED, &cred, &len);

printf("PID: %d, UID: %d, GID: %d\n", cred.pid, cred.uid, cred.gid);
```

## Commandes Utiles

```bash
# Lister les sockets UNIX
ss -x
ss -xln  # Sockets en écoute

# Informations détaillées
ss -xlp  # Avec le processus associé

# Utiliser socat pour tester
socat - UNIX-CONNECT:/tmp/app.sock

# Créer un serveur de test
socat UNIX-LISTEN:/tmp/test.sock,fork EXEC:/bin/cat

# Netcat avec socket UNIX (certaines versions)
nc -U /tmp/app.sock

# Surveiller les sockets
watch -n1 'ss -x | grep app.sock'

# Permissions du socket
ls -la /tmp/*.sock
chmod 660 /tmp/app.sock
```

## Performance et Optimisation

```
┌─────────────────────────────────────────────────────────────────┐
│              Comparaison des Performances IPC                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Mécanisme         Latence      Débit        Complexité        │
│   ─────────────────────────────────────────────────────         │
│   Unix Socket       ~1μs         Élevé        Moyenne           │
│   TCP Loopback      ~10μs        Moyen        Moyenne           │
│   Pipe              ~0.5μs       Élevé        Faible            │
│   Shared Memory     ~0.1μs       Très élevé   Élevée            │
│   D-Bus             ~100μs       Faible       Élevée            │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  Latence (échelle log)                  │   │
│   │                                                         │   │
│   │   Shared Mem  ████                                      │   │
│   │   Pipe        ████████                                  │   │
│   │   Unix Sock   ████████████████                          │   │
│   │   TCP Loop    ████████████████████████████████          │   │
│   │   D-Bus       ████████████████████████████████████████  │   │
│   │               0.1μs    1μs     10μs     100μs           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Sécurité

### Bonnes Pratiques

1. **Permissions du socket**: Utiliser `chmod` et `chown` appropriés
2. **Répertoire sécurisé**: Créer le socket dans `/run` ou un répertoire avec permissions restreintes
3. **Vérification des credentials**: Toujours vérifier l'identité du client
4. **Suppression au démarrage**: `unlink()` le socket avant `bind()`

```c
// Création sécurisée du socket
mode_t old_umask = umask(077);  // Permissions restrictives
bind(sock_fd, (struct sockaddr*)&addr, sizeof(addr));
umask(old_umask);

// Vérification des credentials client
struct ucred cred;
socklen_t len = sizeof(cred);
getsockopt(client_fd, SOL_SOCKET, SO_PEERCRED, &cred, &len);

if (cred.uid != expected_uid) {
    close(client_fd);
    return -1;
}
```

## Cas d'Usage Courants

- **Serveurs Web**: Nginx, Apache (communication avec PHP-FPM)
- **Bases de données**: MySQL, PostgreSQL (connexions locales)
- **Services système**: systemd, D-Bus
- **Conteneurs**: Docker daemon, Podman
- **Audio**: PulseAudio, PipeWire

## Références

- `man 7 unix` - Documentation complète
- `man 7 socket` - API socket générique
- `man 2 socketpair` - Création de paires de sockets
- Linux Kernel Source: `net/unix/af_unix.c`
