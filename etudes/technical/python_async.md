# Python Async - Étude Technique Approfondie

## Introduction

La programmation asynchrone en Python, introduite avec `asyncio` en Python 3.4 et améliorée avec `async/await` en Python 3.5+, permet d'écrire du code concurrent efficace pour les opérations I/O-bound.

## Concepts Fondamentaux

### Event Loop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EVENT LOOP ASYNCIO                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        Event Loop                                   │   │
│   │                                                                     │   │
│   │   ┌─────────────┐                                                   │   │
│   │   │  Ready      │  Coroutines prêtes à s'exécuter                   │   │
│   │   │  Queue      │                                                   │   │
│   │   └──────┬──────┘                                                   │   │
│   │          │                                                          │   │
│   │          ▼                                                          │   │
│   │   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │   │
│   │   │  Exécuter   │────▶│   Await?    │────▶│  Suspendre  │           │   │
│   │   │  Coroutine  │     │             │ Oui │  Coroutine  │           │   │
│   │   └─────────────┘     └──────┬──────┘     └──────┬──────┘           │   │
│   │          ▲                   │ Non               │                  │   │
│   │          │                   ▼                   ▼                  │   │
│   │          │            ┌─────────────┐     ┌─────────────┐           │   │
│   │          │            │  Terminer   │     │  Waiting    │           │   │
│   │          │            │  Coroutine  │     │  Queue      │           │   │
│   │          │            └─────────────┘     └──────┬──────┘           │   │
│   │          │                                       │                  │   │
│   │          │                                       │ I/O Ready        │   │
│   │          └───────────────────────────────────────┘                  │   │
│   │                                                                     │   │
│   │   ┌─────────────────────────────────────────────────────────────┐   │   │
│   │   │              Selector (epoll/kqueue/IOCP)                   │   │   │
│   │   │   Surveille les file descriptors pour I/O                   │   │   │
│   │   └─────────────────────────────────────────────────────────────┘   │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Coroutines, Tasks et Futures

```python
import asyncio

# Coroutine - définie avec async def
async def fetch_data(url: str) -> str:
    print(f"Fetching {url}...")
    await asyncio.sleep(1)  # Simule I/O
    return f"Data from {url}"

# Task - coroutine planifiée pour exécution
async def main():
    # Créer des Tasks explicitement
    task1 = asyncio.create_task(fetch_data("url1"))
    task2 = asyncio.create_task(fetch_data("url2"))

    # Attendre les résultats
    result1 = await task1
    result2 = await task2

    print(result1, result2)

# Exécuter l'event loop
asyncio.run(main())
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                HIÉRARCHIE DES AWAITABLES                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                        ┌──────────────┐                             │
│                        │  Awaitable   │                             │
│                        │   (ABC)      │                             │
│                        └──────┬───────┘                             │
│                               │                                     │
│           ┌───────────────────┼───────────────────┐                 │
│           │                   │                   │                 │
│           ▼                   ▼                   ▼                 │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐         │
│   │   Coroutine   │   │    Future     │   │  Generator    │         │
│   │ async def f() │   │ (low-level)   │   │  (legacy)     │         │
│   └───────────────┘   └───────┬───────┘   └───────────────┘         │
│                               │                                     │
│                               ▼                                     │
│                       ┌───────────────┐                             │
│                       │     Task      │                             │
│                       │(Future + coro)│                             │
│                       └───────────────┘                             │
│                                                                     │
│   Coroutine: Fonction async, doit être await                        │
│   Future: Résultat futur d'une opération async                      │
│   Task: Future qui wrappe une coroutine                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Patterns de Base

### Exécution Concurrente avec gather

```python
import asyncio
import aiohttp

async def fetch_url(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url) as response:
        return {
            "url": url,
            "status": response.status,
            "content_length": len(await response.text())
        }

async def fetch_all(urls: list[str]) -> list[dict]:
    async with aiohttp.ClientSession() as session:
        # Exécution concurrente de toutes les requêtes
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results

async def main():
    urls = [
        "https://python.org",
        "https://asyncio.readthedocs.io",
        "https://aiohttp.readthedocs.io",
    ]

    results = await fetch_all(urls)
    for result in results:
        if isinstance(result, Exception):
            print(f"Error: {result}")
        else:
            print(f"{result['url']}: {result['status']}")

asyncio.run(main())
```

### Timeouts et Cancellation

```python
import asyncio

async def long_operation():
    try:
        print("Starting long operation...")
        await asyncio.sleep(10)
        return "Completed"
    except asyncio.CancelledError:
        print("Operation was cancelled!")
        raise  # Re-raise pour propager l'annulation

async def main():
    # Timeout avec wait_for
    try:
        result = await asyncio.wait_for(long_operation(), timeout=2.0)
        print(result)
    except asyncio.TimeoutError:
        print("Operation timed out!")

    # Timeout avec async context manager (Python 3.11+)
    async with asyncio.timeout(2.0):
        await long_operation()

    # Annulation manuelle
    task = asyncio.create_task(long_operation())
    await asyncio.sleep(1)
    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        print("Task was cancelled")

asyncio.run(main())
```

### TaskGroup (Python 3.11+)

```python
import asyncio

async def process_item(item: int) -> int:
    await asyncio.sleep(0.1)
    if item == 5:
        raise ValueError(f"Error processing {item}")
    return item * 2

async def main():
    results = []

    # TaskGroup gère automatiquement l'annulation en cas d'erreur
    try:
        async with asyncio.TaskGroup() as tg:
            tasks = [
                tg.create_task(process_item(i))
                for i in range(10)
            ]

        results = [t.result() for t in tasks]

    except* ValueError as eg:
        print(f"Caught exceptions: {eg.exceptions}")

    print(f"Results: {results}")

asyncio.run(main())
```

## Synchronisation

### Locks et Semaphores

```python
import asyncio

class RateLimiter:
    """Limiteur de débit basé sur semaphore."""

    def __init__(self, max_concurrent: int = 5):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.lock = asyncio.Lock()
        self.request_count = 0

    async def acquire(self):
        await self.semaphore.acquire()
        async with self.lock:
            self.request_count += 1

    def release(self):
        self.semaphore.release()

    async def __aenter__(self):
        await self.acquire()
        return self

    async def __aexit__(self, *args):
        self.release()

async def fetch_with_limit(limiter: RateLimiter, url: str) -> str:
    async with limiter:
        print(f"Fetching {url}...")
        await asyncio.sleep(1)  # Simule requête
        return f"Result from {url}"

async def main():
    limiter = RateLimiter(max_concurrent=3)
    urls = [f"url_{i}" for i in range(10)]

    tasks = [fetch_with_limit(limiter, url) for url in urls]
    results = await asyncio.gather(*tasks)

    print(f"Total requests: {limiter.request_count}")

asyncio.run(main())
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                  PRIMITIVES DE SYNCHRONISATION                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   asyncio.Lock()                                                    │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  - Exclusion mutuelle                                       │   │
│   │  - Un seul détenteur à la fois                              │   │
│   │  - async with lock: ...                                     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   asyncio.Semaphore(n)                                              │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  - Limite le nombre d'accès concurrents à n                 │   │
│   │  - Utile pour rate limiting                                 │   │
│   │  - async with semaphore: ...                                │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   asyncio.Event()                                                   │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  - Signal entre coroutines                                  │   │
│   │  - event.set() / await event.wait()                         │   │
│   │  - Utilisé pour coordination                                │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   asyncio.Condition()                                               │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  - Lock + notification                                      │   │
│   │  - await cond.wait() / cond.notify_all()                    │   │
│   │  - Pattern producteur/consommateur                          │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Queues Async

```python
import asyncio
from dataclasses import dataclass
from typing import Any

@dataclass
class Job:
    id: int
    data: Any

async def producer(queue: asyncio.Queue, num_jobs: int):
    """Produit des jobs et les ajoute à la queue."""
    for i in range(num_jobs):
        job = Job(id=i, data=f"data_{i}")
        await queue.put(job)
        print(f"Produced: {job}")
        await asyncio.sleep(0.1)

    # Signal de fin (poison pill)
    await queue.put(None)

async def consumer(queue: asyncio.Queue, worker_id: int):
    """Consomme les jobs de la queue."""
    while True:
        job = await queue.get()

        if job is None:
            # Remettre le signal pour les autres consumers
            await queue.put(None)
            break

        print(f"Worker {worker_id} processing: {job}")
        await asyncio.sleep(0.3)  # Simule traitement
        queue.task_done()

    print(f"Worker {worker_id} finished")

async def main():
    queue = asyncio.Queue(maxsize=5)  # Limite la taille

    # Démarrer producteur et consumers
    producer_task = asyncio.create_task(producer(queue, 10))

    consumers = [
        asyncio.create_task(consumer(queue, i))
        for i in range(3)
    ]

    # Attendre que le producteur finisse
    await producer_task

    # Attendre que tous les jobs soient traités
    await queue.join()

    # Attendre les consumers
    await asyncio.gather(*consumers)

asyncio.run(main())
```

## Serveur TCP Async

```python
import asyncio
from dataclasses import dataclass

@dataclass
class Client:
    reader: asyncio.StreamReader
    writer: asyncio.StreamWriter
    addr: tuple

class AsyncTCPServer:
    def __init__(self, host: str = "127.0.0.1", port: int = 8888):
        self.host = host
        self.port = port
        self.clients: dict[tuple, Client] = {}

    async def handle_client(self, reader: asyncio.StreamReader,
                           writer: asyncio.StreamWriter):
        addr = writer.get_extra_info('peername')
        client = Client(reader, writer, addr)
        self.clients[addr] = client

        print(f"New connection from {addr}")

        try:
            while True:
                data = await reader.read(1024)
                if not data:
                    break

                message = data.decode('utf-8').strip()
                print(f"Received from {addr}: {message}")

                # Echo response
                response = f"Echo: {message}\n"
                writer.write(response.encode())
                await writer.drain()

        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Error with {addr}: {e}")
        finally:
            del self.clients[addr]
            writer.close()
            await writer.wait_closed()
            print(f"Connection closed: {addr}")

    async def broadcast(self, message: str, exclude: tuple = None):
        """Envoie un message à tous les clients."""
        for addr, client in self.clients.items():
            if addr != exclude:
                try:
                    client.writer.write(message.encode())
                    await client.writer.drain()
                except Exception:
                    pass

    async def run(self):
        server = await asyncio.start_server(
            self.handle_client,
            self.host,
            self.port
        )

        addr = server.sockets[0].getsockname()
        print(f"Server running on {addr}")

        async with server:
            await server.serve_forever()

async def main():
    server = AsyncTCPServer()
    await server.run()

if __name__ == "__main__":
    asyncio.run(main())
```

## Iterateurs et Générateurs Async

```python
import asyncio
from typing import AsyncIterator, AsyncGenerator

# Async Iterator
class AsyncRange:
    def __init__(self, start: int, stop: int, delay: float = 0.1):
        self.start = start
        self.stop = stop
        self.delay = delay

    def __aiter__(self):
        self.current = self.start
        return self

    async def __anext__(self) -> int:
        if self.current >= self.stop:
            raise StopAsyncIteration

        await asyncio.sleep(self.delay)
        value = self.current
        self.current += 1
        return value

# Async Generator
async def async_range(start: int, stop: int, delay: float = 0.1) -> AsyncGenerator[int, None]:
    for i in range(start, stop):
        await asyncio.sleep(delay)
        yield i

# Async Comprehension
async def main():
    # Utilisation de l'itérateur
    async for i in AsyncRange(0, 5):
        print(f"Iterator: {i}")

    # Utilisation du générateur
    async for i in async_range(0, 5):
        print(f"Generator: {i}")

    # Async list comprehension
    results = [i async for i in async_range(0, 10)]
    print(f"Comprehension: {results}")

    # Async generator expression avec filtrage
    even = [i async for i in async_range(0, 10) if i % 2 == 0]
    print(f"Even: {even}")

asyncio.run(main())
```

## Context Managers Async

```python
import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

class AsyncDatabaseConnection:
    """Exemple de connexion DB async avec context manager."""

    def __init__(self, dsn: str):
        self.dsn = dsn
        self.connected = False

    async def connect(self):
        print(f"Connecting to {self.dsn}...")
        await asyncio.sleep(0.5)  # Simule connexion
        self.connected = True
        print("Connected!")

    async def disconnect(self):
        print("Disconnecting...")
        await asyncio.sleep(0.1)
        self.connected = False
        print("Disconnected!")

    async def execute(self, query: str) -> list:
        if not self.connected:
            raise RuntimeError("Not connected")
        await asyncio.sleep(0.1)  # Simule requête
        return [{"result": f"Data for: {query}"}]

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()
        return False  # Ne pas supprimer les exceptions

# Avec décorateur
@asynccontextmanager
async def managed_resource(name: str) -> AsyncGenerator[str, None]:
    print(f"Acquiring {name}")
    await asyncio.sleep(0.1)
    try:
        yield f"Resource: {name}"
    finally:
        print(f"Releasing {name}")
        await asyncio.sleep(0.1)

async def main():
    # Context manager de classe
    async with AsyncDatabaseConnection("postgres://localhost/db") as db:
        results = await db.execute("SELECT * FROM users")
        print(results)

    # Context manager avec décorateur
    async with managed_resource("file_handle") as resource:
        print(f"Using {resource}")

asyncio.run(main())
```

## Intégration avec Code Synchrone

### run_in_executor pour Code Bloquant

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import time

def blocking_io_operation(duration: float) -> str:
    """Opération I/O bloquante (ex: lecture fichier, requête sync)."""
    time.sleep(duration)
    return f"IO completed after {duration}s"

def cpu_intensive_task(n: int) -> int:
    """Calcul CPU intensif."""
    return sum(i * i for i in range(n))

async def main():
    loop = asyncio.get_running_loop()

    # ThreadPoolExecutor pour I/O bloquant
    with ThreadPoolExecutor(max_workers=4) as thread_pool:
        # Exécuter plusieurs opérations I/O en parallèle
        tasks = [
            loop.run_in_executor(thread_pool, blocking_io_operation, i * 0.5)
            for i in range(1, 5)
        ]
        results = await asyncio.gather(*tasks)
        print(f"IO Results: {results}")

    # ProcessPoolExecutor pour CPU intensif
    with ProcessPoolExecutor(max_workers=4) as process_pool:
        tasks = [
            loop.run_in_executor(process_pool, cpu_intensive_task, 1000000)
            for _ in range(4)
        ]
        results = await asyncio.gather(*tasks)
        print(f"CPU Results: {results}")

asyncio.run(main())
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                  CHOIX DE L'EXECUTOR                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌────────────────────┬────────────────────────────────────────┐   │
│   │      Type          │           Cas d'utilisation            │   │
│   ├────────────────────┼────────────────────────────────────────┤   │
│   │ ThreadPoolExecutor │ - I/O bloquant (fichiers, DB sync)     │   │
│   │                    │ - Appels à des libs synchrones         │   │
│   │                    │ - Opérations réseau legacy             │   │
│   ├────────────────────┼────────────────────────────────────────┤   │
│   │ ProcessPoolExecutor│ - Calculs CPU intensifs                │   │
│   │                    │ - Contourne le GIL                     │   │
│   │                    │ - Traitement d'images, crypto          │   │
│   ├────────────────────┼────────────────────────────────────────┤   │
│   │ None (default)     │ - Utilise le ThreadPool par défaut     │   │
│   │                    │ - Convenable pour la plupart des cas   │   │
│   └────────────────────┴────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### to_thread (Python 3.9+)

```python
import asyncio

def sync_function(x: int, y: int) -> int:
    import time
    time.sleep(1)
    return x + y

async def main():
    # Plus simple que run_in_executor
    result = await asyncio.to_thread(sync_function, 10, 20)
    print(f"Result: {result}")

asyncio.run(main())
```

## Patterns Avancés

### Circuit Breaker

```python
import asyncio
from enum import Enum
from dataclasses import dataclass, field
from typing import Callable, Any
import time

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if service recovered

@dataclass
class CircuitBreaker:
    failure_threshold: int = 5
    recovery_timeout: float = 30.0

    state: CircuitState = field(default=CircuitState.CLOSED, init=False)
    failure_count: int = field(default=0, init=False)
    last_failure_time: float = field(default=0, init=False)

    async def call(self, func: Callable, *args, **kwargs) -> Any:
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time >= self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
            else:
                raise CircuitBreakerError("Circuit is OPEN")

        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

class CircuitBreakerError(Exception):
    pass
```

### Retry avec Exponential Backoff

```python
import asyncio
import random
from functools import wraps
from typing import Type

def async_retry(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exceptions: tuple[Type[Exception], ...] = (Exception,)
):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e

                    if attempt == max_retries:
                        break

                    # Exponential backoff with jitter
                    delay = min(base_delay * (2 ** attempt), max_delay)
                    delay *= (0.5 + random.random())  # Jitter

                    print(f"Attempt {attempt + 1} failed: {e}. "
                          f"Retrying in {delay:.2f}s...")
                    await asyncio.sleep(delay)

            raise last_exception

        return wrapper
    return decorator

@async_retry(max_retries=3, base_delay=1.0)
async def unreliable_api_call(success_rate: float = 0.3) -> str:
    if random.random() > success_rate:
        raise ConnectionError("API unavailable")
    return "Success!"
```

### Debounce et Throttle

```python
import asyncio
from functools import wraps
from typing import Callable

def debounce(wait: float):
    """Retarde l'exécution jusqu'à ce qu'il n'y ait plus d'appels pendant 'wait' secondes."""
    def decorator(func: Callable):
        task: asyncio.Task | None = None

        @wraps(func)
        async def wrapper(*args, **kwargs):
            nonlocal task

            if task is not None:
                task.cancel()

            async def delayed_call():
                await asyncio.sleep(wait)
                await func(*args, **kwargs)

            task = asyncio.create_task(delayed_call())

        return wrapper
    return decorator

def throttle(rate: float):
    """Limite les appels à un maximum d'un appel par 'rate' secondes."""
    def decorator(func: Callable):
        last_call = 0.0
        lock = asyncio.Lock()

        @wraps(func)
        async def wrapper(*args, **kwargs):
            nonlocal last_call

            async with lock:
                now = asyncio.get_event_loop().time()
                time_since_last = now - last_call

                if time_since_last < rate:
                    await asyncio.sleep(rate - time_since_last)

                last_call = asyncio.get_event_loop().time()
                return await func(*args, **kwargs)

        return wrapper
    return decorator
```

## Testing Async Code

```python
import asyncio
import pytest
import pytest_asyncio

# Test simple avec pytest-asyncio
@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result == expected_value

# Fixture async
@pytest_asyncio.fixture
async def async_client():
    client = AsyncClient()
    await client.connect()
    yield client
    await client.disconnect()

@pytest.mark.asyncio
async def test_with_fixture(async_client):
    result = await async_client.fetch_data()
    assert result is not None

# Mock d'une coroutine
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_with_mock():
    mock_fetch = AsyncMock(return_value={"data": "test"})

    with patch("module.fetch_data", mock_fetch):
        result = await some_function_that_calls_fetch()

    mock_fetch.assert_called_once()
    assert result["data"] == "test"

# Test de timeout
@pytest.mark.asyncio
async def test_timeout():
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(slow_function(), timeout=0.1)
```

## Performance et Debugging

```python
import asyncio
import time

# Activer le mode debug
asyncio.run(main(), debug=True)

# Ou via variable d'environnement
# PYTHONASYNCIODEBUG=1 python script.py

# Mesurer le temps d'exécution
async def timed_execution():
    start = time.perf_counter()

    await some_async_work()

    elapsed = time.perf_counter() - start
    print(f"Execution time: {elapsed:.3f}s")

# Profiling avec yappi (support async)
import yappi

yappi.set_clock_type("wall")
yappi.start()

asyncio.run(main())

yappi.stop()
stats = yappi.get_func_stats()
stats.print_all()
```

## Bonnes Pratiques

```
┌─────────────────────────────────────────────────────────────────────┐
│                      BONNES PRATIQUES                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. Ne jamais bloquer l'event loop                                 │
│      ✗ time.sleep(1)                                                │
│      ✓ await asyncio.sleep(1)                                       │
│      ✓ await loop.run_in_executor(None, blocking_func)              │
│                                                                     │
│   2. Toujours await les coroutines                                  │
│      ✗ async_function()  # Crée juste un objet coroutine            │
│      ✓ await async_function()                                       │
│      ✓ asyncio.create_task(async_function())                        │
│                                                                     │
│   3. Gérer correctement les exceptions                              │
│      - Utiliser try/except dans les coroutines                      │
│      - Vérifier les exceptions dans gather avec return_exceptions   │
│      - Utiliser TaskGroup (Python 3.11+) pour gestion automatique   │
│                                                                     │
│   4. Nettoyer les ressources                                        │
│      - Utiliser async context managers                              │
│      - Fermer les connexions dans finally                           │
│      - Annuler les tasks en attente à l'arrêt                       │
│                                                                     │
│   5. Éviter les race conditions                                     │
│      - Utiliser Lock pour les sections critiques                    │
│      - Préférer les structures thread-safe (asyncio.Queue)          │
│                                                                     │
│   6. Structurer le code                                             │
│      - Un seul asyncio.run() au point d'entrée                      │
│      - Séparer la logique métier des coroutines I/O                 │
│      - Utiliser des classes pour encapsuler l'état                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Références

- Documentation officielle: https://docs.python.org/3/library/asyncio.html
- Real Python Async: https://realpython.com/async-io-python/
- PEP 492 - Coroutines avec async/await
- PEP 525 - Générateurs asynchrones
- PEP 530 - Comprehensions asynchrones
