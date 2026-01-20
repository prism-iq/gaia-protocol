# Actor Model

## Vue d'ensemble

Le modèle d'acteurs est un paradigme de concurrence où les "acteurs" sont des unités fondamentales de calcul. Chaque acteur peut recevoir des messages, créer d'autres acteurs, et envoyer des messages.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Actor Model Architecture                          │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                           Actor System                                  │ │
│  │                                                                         │ │
│  │    ┌─────────────┐        Messages        ┌─────────────┐              │ │
│  │    │   Actor A   │ ───────────────────▶  │   Actor B   │              │ │
│  │    │  ┌───────┐  │                        │  ┌───────┐  │              │ │
│  │    │  │Mailbox│  │                        │  │Mailbox│  │              │ │
│  │    │  │ ████  │  │                        │  │ ██    │  │              │ │
│  │    │  └───────┘  │                        │  └───────┘  │              │ │
│  │    │  ┌───────┐  │                        │  ┌───────┐  │              │ │
│  │    │  │ State │  │                        │  │ State │  │              │ │
│  │    │  └───────┘  │                        │  └───────┘  │              │ │
│  │    │  ┌───────┐  │        spawn          │  ┌───────┐  │              │ │
│  │    │  │Behavior│ │ ─────────────────┐     │  │Behavior│ │              │ │
│  │    │  └───────┘  │                  │     │  └───────┘  │              │ │
│  │    └─────────────┘                  │     └─────────────┘              │ │
│  │           │                         │            │                     │ │
│  │           │                         ▼            │                     │ │
│  │           │                   ┌─────────────┐    │                     │ │
│  │           │                   │   Actor C   │    │                     │ │
│  │           │                   │  (Child)    │    │                     │ │
│  │           │                   └─────────────┘    │                     │ │
│  │           │                         │            │                     │ │
│  │           └─────────────────────────┼────────────┘                     │ │
│  │                                     ▼                                  │ │
│  │                            ┌─────────────┐                             │ │
│  │                            │  Supervisor │                             │ │
│  │                            │   (Parent)  │                             │ │
│  │                            └─────────────┘                             │ │
│  │                                                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Key Principles:                                                             │
│  ─────────────────                                                          │
│  1. No shared state - Actors communicate only via messages                   │
│  2. Asynchronous messaging - Fire and forget                                │
│  3. Location transparency - Actors can be local or remote                   │
│  4. Supervision hierarchy - Parent actors supervise children                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implémentation Python

### 1. Actor System de Base

```python
import asyncio
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Callable, Type, TypeVar
from abc import ABC, abstractmethod
from enum import Enum
import uuid
from collections import deque
import traceback


# Messages
@dataclass
class Message:
    """Classe de base pour les messages."""
    sender: Optional["ActorRef"] = None


@dataclass
class PoisonPill(Message):
    """Message pour arrêter un acteur."""
    pass


@dataclass
class ChildFailed(Message):
    """Message quand un enfant échoue."""
    child: "ActorRef" = None
    error: Exception = None


@dataclass
class Terminated(Message):
    """Message quand un acteur est terminé."""
    actor: "ActorRef" = None


# Actor Reference
class ActorRef:
    """Référence à un acteur (proxy)."""

    def __init__(self, actor_id: str, mailbox: asyncio.Queue,
                 system: "ActorSystem"):
        self._id = actor_id
        self._mailbox = mailbox
        self._system = system

    @property
    def id(self) -> str:
        return self._id

    async def tell(self, message: Message) -> None:
        """Envoie un message (fire-and-forget)."""
        await self._mailbox.put(message)

    async def ask(self, message: Message, timeout: float = 5.0) -> Any:
        """Envoie un message et attend une réponse."""
        response_queue: asyncio.Queue = asyncio.Queue()
        ask_message = AskMessage(
            original=message,
            response_queue=response_queue
        )
        await self._mailbox.put(ask_message)

        try:
            return await asyncio.wait_for(response_queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            raise TimeoutError(f"No response from {self._id} within {timeout}s")

    def __repr__(self) -> str:
        return f"ActorRef({self._id})"


@dataclass
class AskMessage(Message):
    """Wrapper pour les messages ask."""
    original: Message = None
    response_queue: asyncio.Queue = None


# Supervision Strategies
class SupervisionStrategy(Enum):
    RESTART = "restart"      # Redémarre l'acteur
    STOP = "stop"            # Arrête l'acteur
    ESCALATE = "escalate"    # Escalade au parent
    RESUME = "resume"        # Continue malgré l'erreur


class SupervisionDecider:
    """Décide de la stratégie de supervision."""

    def __init__(self, default: SupervisionStrategy = SupervisionStrategy.RESTART):
        self._default = default
        self._rules: Dict[Type[Exception], SupervisionStrategy] = {}

    def when(self, exception_type: Type[Exception],
             strategy: SupervisionStrategy) -> "SupervisionDecider":
        self._rules[exception_type] = strategy
        return self

    def decide(self, error: Exception) -> SupervisionStrategy:
        for exc_type, strategy in self._rules.items():
            if isinstance(error, exc_type):
                return strategy
        return self._default


# Actor Base Class
class Actor(ABC):
    """Classe de base pour tous les acteurs."""

    def __init__(self):
        self._context: Optional["ActorContext"] = None
        self._state: Dict[str, Any] = {}

    def set_context(self, context: "ActorContext") -> None:
        self._context = context

    @property
    def context(self) -> "ActorContext":
        return self._context

    @property
    def self_ref(self) -> ActorRef:
        return self._context.self_ref

    @abstractmethod
    async def receive(self, message: Message) -> Any:
        """Traite un message reçu."""
        pass

    async def pre_start(self) -> None:
        """Hook appelé avant le démarrage."""
        pass

    async def post_stop(self) -> None:
        """Hook appelé après l'arrêt."""
        pass

    async def pre_restart(self, reason: Exception) -> None:
        """Hook appelé avant un redémarrage."""
        pass

    async def post_restart(self, reason: Exception) -> None:
        """Hook appelé après un redémarrage."""
        pass

    def supervision_strategy(self) -> SupervisionDecider:
        """Retourne la stratégie de supervision par défaut."""
        return SupervisionDecider(SupervisionStrategy.RESTART)


# Actor Context
class ActorContext:
    """Contexte d'exécution d'un acteur."""

    def __init__(self, actor_id: str, self_ref: ActorRef,
                 parent: Optional[ActorRef], system: "ActorSystem"):
        self._actor_id = actor_id
        self._self_ref = self_ref
        self._parent = parent
        self._system = system
        self._children: Dict[str, ActorRef] = {}
        self._watchers: List[ActorRef] = []

    @property
    def self_ref(self) -> ActorRef:
        return self._self_ref

    @property
    def parent(self) -> Optional[ActorRef]:
        return self._parent

    @property
    def children(self) -> Dict[str, ActorRef]:
        return self._children.copy()

    async def spawn(self, actor_class: Type[Actor], name: str,
                    *args, **kwargs) -> ActorRef:
        """Crée un acteur enfant."""
        child_id = f"{self._actor_id}/{name}"
        child_ref = await self._system._create_actor(
            actor_class, child_id, self._self_ref, *args, **kwargs
        )
        self._children[name] = child_ref
        return child_ref

    async def stop(self, child_ref: ActorRef) -> None:
        """Arrête un acteur enfant."""
        await child_ref.tell(PoisonPill())

    def watch(self, actor_ref: ActorRef) -> None:
        """Surveille un acteur pour être notifié de sa terminaison."""
        self._system._add_watcher(actor_ref, self._self_ref)

    def unwatch(self, actor_ref: ActorRef) -> None:
        """Arrête de surveiller un acteur."""
        self._system._remove_watcher(actor_ref, self._self_ref)


# Actor System
class ActorSystem:
    """Système d'acteurs - Point d'entrée principal."""

    def __init__(self, name: str = "actor-system"):
        self._name = name
        self._actors: Dict[str, tuple] = {}  # id -> (actor, task, mailbox)
        self._watchers: Dict[str, List[ActorRef]] = {}
        self._lock = asyncio.Lock()
        self._running = False

    async def start(self) -> None:
        """Démarre le système d'acteurs."""
        self._running = True
        print(f"[ActorSystem] {self._name} started")

    async def shutdown(self) -> None:
        """Arrête le système d'acteurs."""
        self._running = False

        # Envoyer PoisonPill à tous les acteurs
        for actor_id in list(self._actors.keys()):
            actor, task, mailbox = self._actors[actor_id]
            await mailbox.put(PoisonPill())

        # Attendre que tous les acteurs s'arrêtent
        tasks = [t for _, t, _ in self._actors.values()]
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

        print(f"[ActorSystem] {self._name} shutdown complete")

    async def spawn(self, actor_class: Type[Actor], name: str,
                    *args, **kwargs) -> ActorRef:
        """Crée un acteur racine."""
        actor_id = f"/{name}"
        return await self._create_actor(actor_class, actor_id, None, *args, **kwargs)

    async def _create_actor(self, actor_class: Type[Actor], actor_id: str,
                            parent: Optional[ActorRef], *args, **kwargs) -> ActorRef:
        """Crée un acteur."""
        async with self._lock:
            if actor_id in self._actors:
                raise ValueError(f"Actor {actor_id} already exists")

            mailbox: asyncio.Queue = asyncio.Queue()
            actor_ref = ActorRef(actor_id, mailbox, self)

            actor = actor_class(*args, **kwargs)
            context = ActorContext(actor_id, actor_ref, parent, self)
            actor.set_context(context)

            # Démarrer la boucle de traitement
            task = asyncio.create_task(
                self._actor_loop(actor, actor_ref, mailbox, parent)
            )
            self._actors[actor_id] = (actor, task, mailbox)

            await actor.pre_start()
            print(f"[ActorSystem] Actor {actor_id} started")

            return actor_ref

    async def _actor_loop(self, actor: Actor, actor_ref: ActorRef,
                          mailbox: asyncio.Queue,
                          parent: Optional[ActorRef]) -> None:
        """Boucle principale de traitement des messages."""
        supervision = actor.supervision_strategy()

        while True:
            try:
                message = await mailbox.get()

                if isinstance(message, PoisonPill):
                    break

                if isinstance(message, AskMessage):
                    result = await actor.receive(message.original)
                    await message.response_queue.put(result)
                else:
                    await actor.receive(message)

            except Exception as e:
                print(f"[Actor {actor_ref.id}] Error: {e}")
                strategy = supervision.decide(e)

                if strategy == SupervisionStrategy.RESTART:
                    await actor.pre_restart(e)
                    # Réinitialiser l'état
                    actor._state = {}
                    await actor.post_restart(e)

                elif strategy == SupervisionStrategy.STOP:
                    break

                elif strategy == SupervisionStrategy.ESCALATE:
                    if parent:
                        await parent.tell(ChildFailed(child=actor_ref, error=e))
                    break

                elif strategy == SupervisionStrategy.RESUME:
                    continue  # Ignorer l'erreur

        # Nettoyage
        await actor.post_stop()
        await self._cleanup_actor(actor_ref)

    async def _cleanup_actor(self, actor_ref: ActorRef) -> None:
        """Nettoie un acteur arrêté."""
        async with self._lock:
            if actor_ref.id in self._actors:
                del self._actors[actor_ref.id]

            # Notifier les watchers
            watchers = self._watchers.pop(actor_ref.id, [])
            for watcher in watchers:
                await watcher.tell(Terminated(actor=actor_ref))

            print(f"[ActorSystem] Actor {actor_ref.id} stopped")

    def _add_watcher(self, watched: ActorRef, watcher: ActorRef) -> None:
        """Ajoute un watcher."""
        if watched.id not in self._watchers:
            self._watchers[watched.id] = []
        self._watchers[watched.id].append(watcher)

    def _remove_watcher(self, watched: ActorRef, watcher: ActorRef) -> None:
        """Retire un watcher."""
        if watched.id in self._watchers:
            self._watchers[watched.id] = [
                w for w in self._watchers[watched.id]
                if w.id != watcher.id
            ]
```

### 2. Exemple: Système de Commandes

```python
from dataclasses import dataclass
from typing import Dict, List
from decimal import Decimal


# Messages
@dataclass
class CreateOrder(Message):
    order_id: str = ""
    customer_id: str = ""


@dataclass
class AddItem(Message):
    order_id: str = ""
    product_id: str = ""
    quantity: int = 0
    price: float = 0.0


@dataclass
class GetOrder(Message):
    order_id: str = ""


@dataclass
class OrderCreated(Message):
    order_id: str = ""


@dataclass
class ItemAdded(Message):
    order_id: str = ""
    product_id: str = ""


@dataclass
class OrderDetails(Message):
    order_id: str = ""
    customer_id: str = ""
    items: List[Dict] = field(default_factory=list)
    total: float = 0.0


# Order Actor
class OrderActor(Actor):
    """Acteur gérant une commande."""

    def __init__(self, order_id: str, customer_id: str):
        super().__init__()
        self.order_id = order_id
        self.customer_id = customer_id
        self.items: List[Dict] = []

    async def receive(self, message: Message) -> Any:
        if isinstance(message, AddItem):
            return await self._handle_add_item(message)
        elif isinstance(message, GetOrder):
            return await self._handle_get_order(message)

    async def _handle_add_item(self, message: AddItem) -> ItemAdded:
        self.items.append({
            "product_id": message.product_id,
            "quantity": message.quantity,
            "price": message.price
        })
        print(f"[Order {self.order_id}] Added item {message.product_id}")
        return ItemAdded(order_id=self.order_id, product_id=message.product_id)

    async def _handle_get_order(self, message: GetOrder) -> OrderDetails:
        total = sum(item["quantity"] * item["price"] for item in self.items)
        return OrderDetails(
            order_id=self.order_id,
            customer_id=self.customer_id,
            items=self.items.copy(),
            total=total
        )


# Order Manager Actor (Supervisor)
class OrderManagerActor(Actor):
    """Acteur superviseur gérant toutes les commandes."""

    def __init__(self):
        super().__init__()
        self.orders: Dict[str, ActorRef] = {}

    async def receive(self, message: Message) -> Any:
        if isinstance(message, CreateOrder):
            return await self._handle_create_order(message)
        elif isinstance(message, AddItem):
            return await self._forward_to_order(message.order_id, message)
        elif isinstance(message, GetOrder):
            return await self._forward_to_order(message.order_id, message)
        elif isinstance(message, ChildFailed):
            return await self._handle_child_failed(message)
        elif isinstance(message, Terminated):
            return await self._handle_terminated(message)

    async def _handle_create_order(self, message: CreateOrder) -> OrderCreated:
        # Créer un acteur enfant pour la commande
        order_ref = await self.context.spawn(
            OrderActor,
            message.order_id,
            message.order_id,
            message.customer_id
        )
        self.orders[message.order_id] = order_ref
        self.context.watch(order_ref)

        print(f"[OrderManager] Created order {message.order_id}")
        return OrderCreated(order_id=message.order_id)

    async def _forward_to_order(self, order_id: str, message: Message) -> Any:
        if order_id not in self.orders:
            raise ValueError(f"Order {order_id} not found")

        order_ref = self.orders[order_id]
        return await order_ref.ask(message)

    async def _handle_child_failed(self, message: ChildFailed) -> None:
        print(f"[OrderManager] Child {message.child.id} failed: {message.error}")
        # Logique de récupération

    async def _handle_terminated(self, message: Terminated) -> None:
        # Retirer la commande de notre registre
        for order_id, ref in list(self.orders.items()):
            if ref.id == message.actor.id:
                del self.orders[order_id]
                print(f"[OrderManager] Order {order_id} removed")
                break

    def supervision_strategy(self) -> SupervisionDecider:
        return (SupervisionDecider(SupervisionStrategy.RESTART)
                .when(ValueError, SupervisionStrategy.RESUME)
                .when(RuntimeError, SupervisionStrategy.STOP))


# Inventory Actor
@dataclass
class CheckStock(Message):
    product_id: str = ""
    quantity: int = 0


@dataclass
class StockResult(Message):
    product_id: str = ""
    available: bool = False
    current_stock: int = 0


@dataclass
class ReserveStock(Message):
    product_id: str = ""
    quantity: int = 0


@dataclass
class StockReserved(Message):
    product_id: str = ""
    quantity: int = 0


class InventoryActor(Actor):
    """Acteur gérant l'inventaire."""

    def __init__(self, initial_stock: Dict[str, int] = None):
        super().__init__()
        self.stock = initial_stock or {}
        self.reservations: Dict[str, int] = {}

    async def receive(self, message: Message) -> Any:
        if isinstance(message, CheckStock):
            return await self._handle_check_stock(message)
        elif isinstance(message, ReserveStock):
            return await self._handle_reserve_stock(message)

    async def _handle_check_stock(self, message: CheckStock) -> StockResult:
        current = self.stock.get(message.product_id, 0)
        reserved = self.reservations.get(message.product_id, 0)
        available = current - reserved

        return StockResult(
            product_id=message.product_id,
            available=available >= message.quantity,
            current_stock=available
        )

    async def _handle_reserve_stock(self, message: ReserveStock) -> StockReserved:
        current = self.stock.get(message.product_id, 0)
        reserved = self.reservations.get(message.product_id, 0)
        available = current - reserved

        if available < message.quantity:
            raise ValueError(f"Insufficient stock for {message.product_id}")

        self.reservations[message.product_id] = reserved + message.quantity
        print(f"[Inventory] Reserved {message.quantity} of {message.product_id}")

        return StockReserved(
            product_id=message.product_id,
            quantity=message.quantity
        )
```

### 3. Router et Load Balancing

```python
from enum import Enum
import random


class RoutingStrategy(Enum):
    ROUND_ROBIN = "round_robin"
    RANDOM = "random"
    BROADCAST = "broadcast"


class RouterActor(Actor):
    """Acteur router pour distribuer les messages."""

    def __init__(self, routee_class: Type[Actor], num_routees: int,
                 strategy: RoutingStrategy = RoutingStrategy.ROUND_ROBIN,
                 *args, **kwargs):
        super().__init__()
        self._routee_class = routee_class
        self._num_routees = num_routees
        self._strategy = strategy
        self._args = args
        self._kwargs = kwargs
        self._routees: List[ActorRef] = []
        self._current_index = 0

    async def pre_start(self) -> None:
        """Crée les routees au démarrage."""
        for i in range(self._num_routees):
            routee = await self.context.spawn(
                self._routee_class,
                f"routee-{i}",
                *self._args,
                **self._kwargs
            )
            self._routees.append(routee)
        print(f"[Router] Created {self._num_routees} routees")

    async def receive(self, message: Message) -> Any:
        if self._strategy == RoutingStrategy.ROUND_ROBIN:
            return await self._round_robin(message)
        elif self._strategy == RoutingStrategy.RANDOM:
            return await self._random(message)
        elif self._strategy == RoutingStrategy.BROADCAST:
            return await self._broadcast(message)

    async def _round_robin(self, message: Message) -> Any:
        routee = self._routees[self._current_index]
        self._current_index = (self._current_index + 1) % len(self._routees)
        return await routee.ask(message)

    async def _random(self, message: Message) -> Any:
        routee = random.choice(self._routees)
        return await routee.ask(message)

    async def _broadcast(self, message: Message) -> List[Any]:
        results = await asyncio.gather(*[
            routee.ask(message) for routee in self._routees
        ])
        return list(results)


# Worker Actor pour le pool
@dataclass
class WorkTask(Message):
    task_id: str = ""
    data: Any = None


@dataclass
class WorkResult(Message):
    task_id: str = ""
    result: Any = None
    worker_id: str = ""


class WorkerActor(Actor):
    """Acteur worker."""

    def __init__(self, worker_id: str):
        super().__init__()
        self.worker_id = worker_id

    async def receive(self, message: Message) -> Any:
        if isinstance(message, WorkTask):
            # Simuler un travail
            await asyncio.sleep(0.1)
            result = f"Processed {message.data} by {self.worker_id}"
            print(f"[Worker {self.worker_id}] Completed task {message.task_id}")
            return WorkResult(
                task_id=message.task_id,
                result=result,
                worker_id=self.worker_id
            )
```

### 4. Patterns de Communication

```python
# Pattern: Ask avec Timeout
@dataclass
class RequestWithDeadline(Message):
    request: Message = None
    deadline: float = 0.0  # timestamp


# Pattern: Pipe and Filter
class FilterActor(Actor):
    """Acteur filtre dans un pipeline."""

    def __init__(self, filter_func: Callable, next_actor: Optional[ActorRef] = None):
        super().__init__()
        self._filter_func = filter_func
        self._next_actor = next_actor

    async def receive(self, message: Message) -> Any:
        # Appliquer le filtre
        result = self._filter_func(message)

        # Passer au suivant si accepté
        if result is not None and self._next_actor:
            await self._next_actor.tell(result)

        return result


# Pattern: Aggregator
@dataclass
class AggregateRequest(Message):
    correlation_id: str = ""
    expected_responses: int = 0


@dataclass
class PartialResponse(Message):
    correlation_id: str = ""
    data: Any = None


@dataclass
class AggregatedResponse(Message):
    correlation_id: str = ""
    responses: List[Any] = field(default_factory=list)


class AggregatorActor(Actor):
    """Acteur agrégateur de réponses."""

    def __init__(self):
        super().__init__()
        self._pending: Dict[str, tuple] = {}  # correlation_id -> (expected, received, requester)

    async def receive(self, message: Message) -> Any:
        if isinstance(message, AggregateRequest):
            self._pending[message.correlation_id] = (
                message.expected_responses,
                [],
                message.sender
            )
            return message.correlation_id

        elif isinstance(message, PartialResponse):
            if message.correlation_id in self._pending:
                expected, received, requester = self._pending[message.correlation_id]
                received.append(message.data)

                if len(received) >= expected:
                    # Toutes les réponses reçues
                    del self._pending[message.correlation_id]
                    if requester:
                        await requester.tell(AggregatedResponse(
                            correlation_id=message.correlation_id,
                            responses=received
                        ))


# Pattern: Saga Actor
class SagaState(Enum):
    STARTED = "started"
    STEP_1_DONE = "step_1_done"
    STEP_2_DONE = "step_2_done"
    COMPLETED = "completed"
    COMPENSATING = "compensating"
    FAILED = "failed"


@dataclass
class StartSaga(Message):
    saga_id: str = ""
    data: Dict = field(default_factory=dict)


@dataclass
class SagaStepCompleted(Message):
    saga_id: str = ""
    step: str = ""
    result: Any = None


@dataclass
class SagaStepFailed(Message):
    saga_id: str = ""
    step: str = ""
    error: str = ""


class SagaActor(Actor):
    """Acteur orchestrant une saga."""

    def __init__(self, step_actors: Dict[str, ActorRef]):
        super().__init__()
        self._step_actors = step_actors
        self._sagas: Dict[str, tuple] = {}  # saga_id -> (state, data, compensation_data)

    async def receive(self, message: Message) -> Any:
        if isinstance(message, StartSaga):
            return await self._start_saga(message)
        elif isinstance(message, SagaStepCompleted):
            return await self._handle_step_completed(message)
        elif isinstance(message, SagaStepFailed):
            return await self._handle_step_failed(message)

    async def _start_saga(self, message: StartSaga) -> str:
        self._sagas[message.saga_id] = (SagaState.STARTED, message.data, {})
        # Démarrer la première étape
        await self._execute_step(message.saga_id, "step_1")
        return message.saga_id

    async def _execute_step(self, saga_id: str, step: str) -> None:
        if step in self._step_actors:
            state, data, comp_data = self._sagas[saga_id]
            # Envoyer le message à l'acteur de l'étape
            # ...

    async def _handle_step_completed(self, message: SagaStepCompleted) -> None:
        # Passer à l'étape suivante ou terminer
        pass

    async def _handle_step_failed(self, message: SagaStepFailed) -> None:
        # Démarrer la compensation
        pass
```

### 5. Application Complète

```python
async def main():
    print("=" * 60)
    print("Actor Model Demo")
    print("=" * 60)

    # Créer le système d'acteurs
    system = ActorSystem("order-system")
    await system.start()

    try:
        # Créer les acteurs
        order_manager = await system.spawn(OrderManagerActor, "order-manager")
        inventory = await system.spawn(
            InventoryActor,
            "inventory",
            initial_stock={"PROD-001": 100, "PROD-002": 50}
        )

        print("\n--- Creating Orders ---\n")

        # Créer une commande
        result = await order_manager.ask(CreateOrder(
            order_id="ORD-001",
            customer_id="CUST-001"
        ))
        print(f"Result: {result}")

        # Vérifier le stock
        stock_result = await inventory.ask(CheckStock(
            product_id="PROD-001",
            quantity=5
        ))
        print(f"Stock check: {stock_result}")

        # Ajouter des articles
        if stock_result.available:
            await inventory.ask(ReserveStock(
                product_id="PROD-001",
                quantity=5
            ))

            result = await order_manager.ask(AddItem(
                order_id="ORD-001",
                product_id="PROD-001",
                quantity=5,
                price=29.99
            ))
            print(f"Item added: {result}")

        # Récupérer la commande
        order_details = await order_manager.ask(GetOrder(order_id="ORD-001"))
        print(f"\nOrder details: {order_details}")

        print("\n--- Worker Pool Demo ---\n")

        # Créer un pool de workers
        worker_router = await system.spawn(
            RouterActor,
            "worker-pool",
            WorkerActor,  # routee class
            3,  # num routees
            RoutingStrategy.ROUND_ROBIN,
            "worker"  # args for WorkerActor
        )

        # Envoyer des tâches
        tasks = []
        for i in range(5):
            task = WorkTask(task_id=f"task-{i}", data=f"data-{i}")
            tasks.append(worker_router.ask(task))

        results = await asyncio.gather(*tasks)
        print("\nWorker results:")
        for result in results:
            print(f"  - {result}")

    finally:
        await system.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
```

## Diagramme de Supervision

```
                    ┌─────────────────┐
                    │  /user-guardian │  (System Actor)
                    │   (Root)        │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │ /service-a │ │ /service-b │ │ /service-c │
       │ (Restart)  │ │  (Stop)    │ │ (Escalate) │
       └─────┬──────┘ └────────────┘ └─────┬──────┘
             │                             │
        ┌────┴────┐                   ┌────┴────┐
        │         │                   │         │
        ▼         ▼                   ▼         ▼
   ┌────────┐ ┌────────┐         ┌────────┐ ┌────────┐
   │worker-1│ │worker-2│         │child-1 │ │child-2 │
   └────────┘ └────────┘         └────────┘ └────────┘

   Supervision Strategies:
   ────────────────────────
   • Restart: Redémarrer l'acteur défaillant
   • Stop: Arrêter l'acteur définitivement
   • Escalate: Propager l'erreur au parent
   • Resume: Ignorer l'erreur et continuer
```

## Avantages du Modèle d'Acteurs

1. **Isolation** - Pas d'état partagé, pas de locks
2. **Scalabilité** - Facilement distribuable
3. **Résilience** - Hiérarchie de supervision
4. **Location Transparency** - Local ou distant, même interface

## Quand Utiliser

- Systèmes fortement concurrents
- Applications distribuées
- Systèmes réactifs temps réel
- Traitement de flux d'événements
