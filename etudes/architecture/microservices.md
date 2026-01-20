# Architecture Microservices

## Vue d'ensemble

L'architecture microservices décompose une application en services autonomes, chacun responsable d'une fonctionnalité métier spécifique.

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                               │
│                    (Routage, Auth, Rate Limiting)               │
└─────────────┬───────────────┬───────────────┬───────────────────┘
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  User Service   │ │  Order Service  │ │ Product Service │
│   ┌─────────┐   │ │   ┌─────────┐   │ │   ┌─────────┐   │
│   │   API   │   │ │   │   API   │   │ │   │   API   │   │
│   └────┬────┘   │ │   └────┬────┘   │ │   └────┬────┘   │
│        │        │ │        │        │ │        │        │
│   ┌────▼────┐   │ │   ┌────▼────┐   │ │   ┌────▼────┐   │
│   │ Business│   │ │   │ Business│   │ │   │ Business│   │
│   │  Logic  │   │ │   │  Logic  │   │ │   │  Logic  │   │
│   └────┬────┘   │ │   └────┬────┘   │ │   └────┬────┘   │
│        │        │ │        │        │ │        │        │
│   ┌────▼────┐   │ │   ┌────▼────┐   │ │   ┌────▼────┐   │
│   │   DB    │   │ │   │   DB    │   │ │   │   DB    │   │
│   └─────────┘   │ │   └─────────┘   │ │   └─────────┘   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                    ┌─────────────────┐
                    │  Message Broker │
                    │ (RabbitMQ/Kafka)│
                    └─────────────────┘
```

## Patterns Fondamentaux

### 1. Service Registry & Discovery

```python
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import time
import threading
import random


@dataclass
class ServiceInstance:
    service_id: str
    service_name: str
    host: str
    port: int
    health_check_url: str
    metadata: Dict[str, str] = field(default_factory=dict)
    last_heartbeat: float = field(default_factory=time.time)
    status: str = "UP"


class ServiceRegistry:
    """Registre centralisé pour la découverte de services."""

    def __init__(self, heartbeat_timeout: float = 30.0):
        self._services: Dict[str, Dict[str, ServiceInstance]] = {}
        self._lock = threading.RLock()
        self._heartbeat_timeout = heartbeat_timeout
        self._running = False

    def register(self, instance: ServiceInstance) -> None:
        """Enregistre une instance de service."""
        with self._lock:
            if instance.service_name not in self._services:
                self._services[instance.service_name] = {}
            self._services[instance.service_name][instance.service_id] = instance
            print(f"[Registry] Registered {instance.service_name}:{instance.service_id} "
                  f"at {instance.host}:{instance.port}")

    def deregister(self, service_name: str, service_id: str) -> None:
        """Désenregistre une instance de service."""
        with self._lock:
            if service_name in self._services:
                if service_id in self._services[service_name]:
                    del self._services[service_name][service_id]
                    print(f"[Registry] Deregistered {service_name}:{service_id}")

    def heartbeat(self, service_name: str, service_id: str) -> bool:
        """Met à jour le heartbeat d'une instance."""
        with self._lock:
            if service_name in self._services:
                if service_id in self._services[service_name]:
                    self._services[service_name][service_id].last_heartbeat = time.time()
                    return True
        return False

    def get_instances(self, service_name: str) -> List[ServiceInstance]:
        """Récupère toutes les instances actives d'un service."""
        with self._lock:
            if service_name not in self._services:
                return []
            return [
                inst for inst in self._services[service_name].values()
                if inst.status == "UP"
            ]

    def get_instance(self, service_name: str) -> Optional[ServiceInstance]:
        """Récupère une instance (load balancing round-robin simplifié)."""
        instances = self.get_instances(service_name)
        if not instances:
            return None
        return random.choice(instances)

    def _health_check_loop(self):
        """Vérifie périodiquement la santé des services."""
        while self._running:
            current_time = time.time()
            with self._lock:
                for service_name, instances in self._services.items():
                    for service_id, instance in list(instances.items()):
                        if current_time - instance.last_heartbeat > self._heartbeat_timeout:
                            instance.status = "DOWN"
                            print(f"[Registry] {service_name}:{service_id} marked as DOWN")
            time.sleep(5)

    def start(self):
        """Démarre le thread de vérification de santé."""
        self._running = True
        self._health_thread = threading.Thread(target=self._health_check_loop, daemon=True)
        self._health_thread.start()

    def stop(self):
        """Arrête le registre."""
        self._running = False


class ServiceClient:
    """Client pour s'enregistrer auprès du registry."""

    def __init__(self, registry: ServiceRegistry, instance: ServiceInstance):
        self.registry = registry
        self.instance = instance
        self._running = False

    def start(self):
        """Démarre le client et l'enregistrement."""
        self.registry.register(self.instance)
        self._running = True
        self._heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
        self._heartbeat_thread.start()

    def _heartbeat_loop(self):
        """Envoie des heartbeats périodiques."""
        while self._running:
            self.registry.heartbeat(self.instance.service_name, self.instance.service_id)
            time.sleep(10)

    def stop(self):
        """Arrête le client."""
        self._running = False
        self.registry.deregister(self.instance.service_name, self.instance.service_id)


# Démonstration
if __name__ == "__main__":
    registry = ServiceRegistry()
    registry.start()

    # Simuler plusieurs instances de services
    user_service_1 = ServiceInstance(
        service_id="user-1",
        service_name="user-service",
        host="localhost",
        port=8001,
        health_check_url="/health"
    )

    user_service_2 = ServiceInstance(
        service_id="user-2",
        service_name="user-service",
        host="localhost",
        port=8002,
        health_check_url="/health"
    )

    order_service = ServiceInstance(
        service_id="order-1",
        service_name="order-service",
        host="localhost",
        port=9001,
        health_check_url="/health"
    )

    client1 = ServiceClient(registry, user_service_1)
    client2 = ServiceClient(registry, user_service_2)
    client3 = ServiceClient(registry, order_service)

    client1.start()
    client2.start()
    client3.start()

    time.sleep(1)

    # Découverte de services
    print("\n--- Service Discovery ---")
    for _ in range(3):
        instance = registry.get_instance("user-service")
        if instance:
            print(f"Found: {instance.service_name} at {instance.host}:{instance.port}")
```

### 2. API Gateway Pattern

```python
from dataclasses import dataclass
from typing import Dict, Callable, Any, Optional
from functools import wraps
import time
import threading
from collections import defaultdict
import hashlib
import json


@dataclass
class RateLimitConfig:
    requests_per_second: int = 100
    burst_size: int = 150


@dataclass
class RouteConfig:
    service_name: str
    path_prefix: str
    strip_prefix: bool = True
    rate_limit: Optional[RateLimitConfig] = None
    auth_required: bool = True


class TokenBucket:
    """Algorithme Token Bucket pour le rate limiting."""

    def __init__(self, rate: float, capacity: float):
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_update = time.time()
        self._lock = threading.Lock()

    def consume(self, tokens: int = 1) -> bool:
        with self._lock:
            now = time.time()
            elapsed = now - self.last_update
            self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
            self.last_update = now

            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False


class CircuitBreaker:
    """Circuit Breaker pour la résilience."""

    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

    def __init__(self, failure_threshold: int = 5,
                 recovery_timeout: float = 30.0,
                 success_threshold: int = 3):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold

        self.state = self.CLOSED
        self.failures = 0
        self.successes = 0
        self.last_failure_time = 0
        self._lock = threading.Lock()

    def can_execute(self) -> bool:
        with self._lock:
            if self.state == self.CLOSED:
                return True
            elif self.state == self.OPEN:
                if time.time() - self.last_failure_time >= self.recovery_timeout:
                    self.state = self.HALF_OPEN
                    self.successes = 0
                    return True
                return False
            else:  # HALF_OPEN
                return True

    def record_success(self):
        with self._lock:
            if self.state == self.HALF_OPEN:
                self.successes += 1
                if self.successes >= self.success_threshold:
                    self.state = self.CLOSED
                    self.failures = 0
            elif self.state == self.CLOSED:
                self.failures = 0

    def record_failure(self):
        with self._lock:
            self.failures += 1
            self.last_failure_time = time.time()

            if self.state == self.HALF_OPEN:
                self.state = self.OPEN
            elif self.state == self.CLOSED:
                if self.failures >= self.failure_threshold:
                    self.state = self.OPEN


class APIGateway:
    """API Gateway avec routage, authentification et rate limiting."""

    def __init__(self, registry: "ServiceRegistry"):
        self.registry = registry
        self.routes: Dict[str, RouteConfig] = {}
        self.rate_limiters: Dict[str, TokenBucket] = {}
        self.circuit_breakers: Dict[str, CircuitBreaker] = defaultdict(CircuitBreaker)
        self.cache: Dict[str, tuple] = {}  # (response, expiry_time)
        self._lock = threading.Lock()

    def register_route(self, path: str, config: RouteConfig):
        """Enregistre une route vers un service."""
        self.routes[path] = config
        if config.rate_limit:
            self.rate_limiters[path] = TokenBucket(
                rate=config.rate_limit.requests_per_second,
                capacity=config.rate_limit.burst_size
            )
        print(f"[Gateway] Route registered: {path} -> {config.service_name}")

    def _authenticate(self, token: str) -> Optional[Dict[str, Any]]:
        """Vérifie le token d'authentification."""
        # Simulation - en production, valider JWT/OAuth
        if token and token.startswith("Bearer "):
            return {"user_id": "user-123", "roles": ["user"]}
        return None

    def _check_rate_limit(self, path: str, client_id: str) -> bool:
        """Vérifie le rate limit pour un client."""
        key = f"{path}:{client_id}"
        if path in self.rate_limiters:
            # Rate limit par client
            with self._lock:
                if key not in self.rate_limiters:
                    config = self.routes[path].rate_limit
                    self.rate_limiters[key] = TokenBucket(
                        rate=config.requests_per_second / 10,  # Par client
                        capacity=config.burst_size / 10
                    )
            return self.rate_limiters[key].consume()
        return True

    def _get_cache_key(self, method: str, path: str, params: Dict) -> str:
        """Génère une clé de cache."""
        data = f"{method}:{path}:{json.dumps(params, sort_keys=True)}"
        return hashlib.md5(data.encode()).hexdigest()

    def _route_request(self, service_name: str, path: str,
                       method: str, body: Any) -> Dict[str, Any]:
        """Route la requête vers le service approprié."""
        instance = self.registry.get_instance(service_name)
        if not instance:
            return {"error": "Service unavailable", "status": 503}

        # Simulation d'appel HTTP
        print(f"[Gateway] Routing to {instance.host}:{instance.port}{path}")
        return {
            "data": f"Response from {service_name}",
            "instance": f"{instance.host}:{instance.port}",
            "status": 200
        }

    def handle_request(self, method: str, path: str,
                       headers: Dict[str, str],
                       body: Any = None,
                       params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Point d'entrée principal pour traiter les requêtes."""

        # 1. Trouver la route correspondante
        route_config = None
        matched_path = None
        for route_path, config in self.routes.items():
            if path.startswith(route_path):
                route_config = config
                matched_path = route_path
                break

        if not route_config:
            return {"error": "Not Found", "status": 404}

        # 2. Authentification
        if route_config.auth_required:
            auth_header = headers.get("Authorization", "")
            user_context = self._authenticate(auth_header)
            if not user_context:
                return {"error": "Unauthorized", "status": 401}

        # 3. Rate limiting
        client_id = headers.get("X-Client-ID", "anonymous")
        if not self._check_rate_limit(matched_path, client_id):
            return {"error": "Too Many Requests", "status": 429}

        # 4. Circuit Breaker
        cb = self.circuit_breakers[route_config.service_name]
        if not cb.can_execute():
            return {"error": "Service temporarily unavailable", "status": 503}

        # 5. Caching (pour GET)
        if method == "GET" and params:
            cache_key = self._get_cache_key(method, path, params or {})
            if cache_key in self.cache:
                response, expiry = self.cache[cache_key]
                if time.time() < expiry:
                    return {**response, "cached": True}

        # 6. Routage
        try:
            target_path = path
            if route_config.strip_prefix:
                target_path = path[len(matched_path):]

            response = self._route_request(
                route_config.service_name,
                target_path,
                method,
                body
            )

            cb.record_success()

            # Cache la réponse GET
            if method == "GET" and response.get("status") == 200:
                cache_key = self._get_cache_key(method, path, params or {})
                self.cache[cache_key] = (response, time.time() + 60)  # TTL 60s

            return response

        except Exception as e:
            cb.record_failure()
            return {"error": str(e), "status": 500}


# Exemple d'utilisation
if __name__ == "__main__":
    # Créer le registry et gateway
    registry = ServiceRegistry()
    gateway = APIGateway(registry)

    # Enregistrer des services
    user_instance = ServiceInstance(
        service_id="user-1",
        service_name="user-service",
        host="localhost",
        port=8001,
        health_check_url="/health"
    )
    registry.register(user_instance)

    # Configurer les routes
    gateway.register_route("/api/users", RouteConfig(
        service_name="user-service",
        path_prefix="/api/users",
        rate_limit=RateLimitConfig(requests_per_second=100),
        auth_required=True
    ))

    # Simuler des requêtes
    response = gateway.handle_request(
        method="GET",
        path="/api/users/123",
        headers={
            "Authorization": "Bearer token123",
            "X-Client-ID": "client-001"
        },
        params={"include": "profile"}
    )
    print(f"Response: {response}")
```

### 3. Communication Inter-Services

```python
import asyncio
from dataclasses import dataclass, field
from typing import Dict, List, Callable, Any, Optional
from enum import Enum
import json
import uuid
from datetime import datetime
from abc import ABC, abstractmethod


class MessageType(Enum):
    COMMAND = "command"
    EVENT = "event"
    QUERY = "query"
    REPLY = "reply"


@dataclass
class Message:
    id: str
    type: MessageType
    topic: str
    payload: Dict[str, Any]
    correlation_id: Optional[str] = None
    reply_to: Optional[str] = None
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    headers: Dict[str, str] = field(default_factory=dict)


class MessageBroker(ABC):
    """Interface abstraite pour le broker de messages."""

    @abstractmethod
    async def publish(self, topic: str, message: Message) -> None:
        pass

    @abstractmethod
    async def subscribe(self, topic: str, handler: Callable) -> None:
        pass

    @abstractmethod
    async def request(self, topic: str, message: Message, timeout: float) -> Message:
        pass


class InMemoryBroker(MessageBroker):
    """Broker en mémoire pour démonstration."""

    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}
        self._reply_queues: Dict[str, asyncio.Queue] = {}
        self._lock = asyncio.Lock()

    async def publish(self, topic: str, message: Message) -> None:
        async with self._lock:
            handlers = self._subscribers.get(topic, [])

        for handler in handlers:
            asyncio.create_task(handler(message))

        # Gérer les réponses
        if message.type == MessageType.REPLY and message.correlation_id:
            if message.correlation_id in self._reply_queues:
                await self._reply_queues[message.correlation_id].put(message)

    async def subscribe(self, topic: str, handler: Callable) -> None:
        async with self._lock:
            if topic not in self._subscribers:
                self._subscribers[topic] = []
            self._subscribers[topic].append(handler)

    async def request(self, topic: str, message: Message,
                      timeout: float = 30.0) -> Message:
        """Pattern Request-Reply."""
        correlation_id = str(uuid.uuid4())
        message.correlation_id = correlation_id
        message.reply_to = f"reply.{correlation_id}"

        # Créer la queue de réponse
        reply_queue: asyncio.Queue = asyncio.Queue()
        self._reply_queues[correlation_id] = reply_queue

        try:
            await self.publish(topic, message)
            response = await asyncio.wait_for(reply_queue.get(), timeout=timeout)
            return response
        finally:
            del self._reply_queues[correlation_id]


class MicroserviceBase:
    """Classe de base pour un microservice."""

    def __init__(self, name: str, broker: MessageBroker):
        self.name = name
        self.broker = broker
        self._handlers: Dict[str, Callable] = {}

    async def start(self):
        """Démarre le service et s'abonne aux topics."""
        for topic, handler in self._handlers.items():
            await self.broker.subscribe(topic, handler)
        print(f"[{self.name}] Started")

    def on_message(self, topic: str):
        """Décorateur pour enregistrer un handler."""
        def decorator(func: Callable):
            self._handlers[topic] = func
            return func
        return decorator

    async def send_event(self, topic: str, payload: Dict[str, Any]):
        """Publie un événement."""
        message = Message(
            id=str(uuid.uuid4()),
            type=MessageType.EVENT,
            topic=topic,
            payload=payload
        )
        await self.broker.publish(topic, message)

    async def send_command(self, topic: str, payload: Dict[str, Any]) -> Message:
        """Envoie une commande et attend la réponse."""
        message = Message(
            id=str(uuid.uuid4()),
            type=MessageType.COMMAND,
            topic=topic,
            payload=payload
        )
        return await self.broker.request(topic, message)

    async def reply(self, original: Message, payload: Dict[str, Any]):
        """Répond à un message."""
        if original.reply_to:
            reply = Message(
                id=str(uuid.uuid4()),
                type=MessageType.REPLY,
                topic=original.reply_to,
                payload=payload,
                correlation_id=original.correlation_id
            )
            await self.broker.publish(original.reply_to, reply)


# Services exemple
class UserService(MicroserviceBase):
    def __init__(self, broker: MessageBroker):
        super().__init__("UserService", broker)
        self.users = {
            "user-1": {"id": "user-1", "name": "Alice", "email": "alice@example.com"},
            "user-2": {"id": "user-2", "name": "Bob", "email": "bob@example.com"}
        }

        @self.on_message("user.get")
        async def handle_get_user(message: Message):
            user_id = message.payload.get("user_id")
            user = self.users.get(user_id)
            if user:
                await self.reply(message, {"success": True, "user": user})
            else:
                await self.reply(message, {"success": False, "error": "User not found"})

        @self.on_message("user.create")
        async def handle_create_user(message: Message):
            user_data = message.payload
            user_id = f"user-{uuid.uuid4().hex[:8]}"
            user = {"id": user_id, **user_data}
            self.users[user_id] = user

            await self.reply(message, {"success": True, "user": user})
            await self.send_event("user.created", user)


class OrderService(MicroserviceBase):
    def __init__(self, broker: MessageBroker):
        super().__init__("OrderService", broker)
        self.orders = {}

        @self.on_message("order.create")
        async def handle_create_order(message: Message):
            order_data = message.payload
            user_id = order_data.get("user_id")

            # Vérifier l'utilisateur
            user_response = await self.send_command("user.get", {"user_id": user_id})

            if not user_response.payload.get("success"):
                await self.reply(message, {
                    "success": False,
                    "error": "User not found"
                })
                return

            order_id = f"order-{uuid.uuid4().hex[:8]}"
            order = {
                "id": order_id,
                "user_id": user_id,
                "items": order_data.get("items", []),
                "status": "PENDING",
                "created_at": datetime.utcnow().isoformat()
            }
            self.orders[order_id] = order

            await self.reply(message, {"success": True, "order": order})
            await self.send_event("order.created", order)


class NotificationService(MicroserviceBase):
    def __init__(self, broker: MessageBroker):
        super().__init__("NotificationService", broker)

        @self.on_message("user.created")
        async def handle_user_created(message: Message):
            user = message.payload
            print(f"[Notification] Sending welcome email to {user['email']}")

        @self.on_message("order.created")
        async def handle_order_created(message: Message):
            order = message.payload
            print(f"[Notification] Order {order['id']} confirmation sent")


async def main():
    broker = InMemoryBroker()

    user_service = UserService(broker)
    order_service = OrderService(broker)
    notification_service = NotificationService(broker)

    await user_service.start()
    await order_service.start()
    await notification_service.start()

    # Simuler des opérations
    print("\n--- Creating Order ---")
    response = await order_service.send_command("order.create", {
        "user_id": "user-1",
        "items": [
            {"product_id": "prod-1", "quantity": 2},
            {"product_id": "prod-2", "quantity": 1}
        ]
    })
    print(f"Order created: {response.payload}")

    await asyncio.sleep(0.1)  # Laisser le temps aux événements


if __name__ == "__main__":
    asyncio.run(main())
```

## Patterns de Déploiement

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster                          │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                        Ingress Controller                      │ │
│  └───────────────────────────┬───────────────────────────────────┘ │
│                              │                                      │
│  ┌───────────────────────────▼───────────────────────────────────┐ │
│  │                      Service Mesh (Istio)                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │ │
│  │  │   Envoy     │  │   Envoy     │  │   Envoy     │            │ │
│  │  │   Proxy     │  │   Proxy     │  │   Proxy     │            │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │ │
│  │         │                │                │                    │ │
│  │  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐            │ │
│  │  │    Pod      │  │    Pod      │  │    Pod      │            │ │
│  │  │ ┌────────┐  │  │ ┌────────┐  │  │ ┌────────┐  │            │ │
│  │  │ │ User   │  │  │ │ Order  │  │  │ │Product │  │            │ │
│  │  │ │Service │  │  │ │Service │  │  │ │Service │  │            │ │
│  │  │ └────────┘  │  │ └────────┘  │  │ └────────┘  │            │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   ConfigMap     │  │    Secrets      │  │   PersistentVC  │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Bonnes Pratiques

1. **Database per Service** - Chaque service gère sa propre base de données
2. **API Versioning** - Versionner les APIs pour la rétrocompatibilité
3. **Correlation IDs** - Tracer les requêtes à travers les services
4. **Health Checks** - Implémenter des endpoints de santé
5. **Graceful Shutdown** - Gérer proprement l'arrêt des services
6. **Idempotence** - Rendre les opérations idempotentes
7. **Compensating Transactions** - Prévoir les rollbacks distribués

## Anti-Patterns à Éviter

- **Distributed Monolith** - Services trop couplés
- **Shared Database** - Base de données partagée entre services
- **Sync Everything** - Communication synchrone excessive
- **No Observability** - Manque de logs, métriques et traces
- **Nano Services** - Services trop granulaires
