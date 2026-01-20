# Architecture Event-Driven

## Vue d'ensemble

L'architecture event-driven (EDA) repose sur la production, détection et réaction aux événements. Elle favorise le découplage et la réactivité.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Event-Driven Architecture                     │
│                                                                      │
│  ┌──────────────┐              ┌──────────────┐                     │
│  │   Producer   │──── Event ──▶│  Event Bus   │                     │
│  │  (Source)    │              │   / Broker   │                     │
│  └──────────────┘              └──────┬───────┘                     │
│                                       │                              │
│                    ┌──────────────────┼──────────────────┐          │
│                    │                  │                  │          │
│                    ▼                  ▼                  ▼          │
│             ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│             │  Consumer 1  │   │  Consumer 2  │   │  Consumer 3  │  │
│             │  (Handler)   │   │  (Handler)   │   │  (Handler)   │  │
│             └──────────────┘   └──────────────┘   └──────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Event Flow Types:
═════════════════

1. Simple Event:
   Producer ────▶ Event Bus ────▶ Consumer

2. Event Sourcing:
   Command ────▶ Aggregate ────▶ Event Store ────▶ Projections

3. Event Choreography:
   Service A ──Event──▶ Service B ──Event──▶ Service C
```

## Patterns Fondamentaux

### 1. Event et Event Bus

```python
from dataclasses import dataclass, field
from typing import Dict, List, Callable, Any, Optional, Type, TypeVar
from datetime import datetime
from abc import ABC, abstractmethod
import uuid
import asyncio
from enum import Enum
import json


class EventPriority(Enum):
    LOW = 0
    NORMAL = 1
    HIGH = 2
    CRITICAL = 3


@dataclass
class Event:
    """Classe de base pour tous les événements."""
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = field(default_factory=datetime.utcnow)
    version: int = 1
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def event_type(self) -> str:
        return self.__class__.__name__

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "timestamp": self.timestamp.isoformat(),
            "version": self.version,
            "metadata": self.metadata,
            "data": {k: v for k, v in self.__dict__.items()
                    if k not in ["event_id", "timestamp", "version", "metadata"]}
        }


# Événements Domain
@dataclass
class UserRegistered(Event):
    user_id: str = ""
    email: str = ""
    name: str = ""


@dataclass
class OrderCreated(Event):
    order_id: str = ""
    user_id: str = ""
    items: List[Dict] = field(default_factory=list)
    total: float = 0.0


@dataclass
class PaymentProcessed(Event):
    payment_id: str = ""
    order_id: str = ""
    amount: float = 0.0
    status: str = "SUCCESS"


@dataclass
class InventoryReserved(Event):
    reservation_id: str = ""
    order_id: str = ""
    items: List[Dict] = field(default_factory=list)


T = TypeVar('T', bound=Event)


class EventHandler(ABC):
    """Interface pour les handlers d'événements."""

    @abstractmethod
    async def handle(self, event: Event) -> None:
        pass


class EventBus:
    """Bus d'événements central avec support async."""

    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = {}
        self._middleware: List[Callable] = []
        self._dead_letter_queue: List[tuple] = []
        self._event_history: List[Event] = []
        self._lock = asyncio.Lock()

    def subscribe(self, event_type: Type[Event],
                  handler: Callable[[Event], Any],
                  priority: EventPriority = EventPriority.NORMAL) -> None:
        """S'abonne à un type d'événement."""
        type_name = event_type.__name__
        if type_name not in self._handlers:
            self._handlers[type_name] = []
        self._handlers[type_name].append((priority.value, handler))
        self._handlers[type_name].sort(key=lambda x: x[0], reverse=True)

    def use(self, middleware: Callable) -> None:
        """Ajoute un middleware au pipeline."""
        self._middleware.append(middleware)

    async def publish(self, event: Event) -> None:
        """Publie un événement."""
        async with self._lock:
            self._event_history.append(event)

        # Exécuter les middlewares
        for middleware in self._middleware:
            try:
                event = await middleware(event)
                if event is None:
                    return  # Middleware a annulé l'événement
            except Exception as e:
                print(f"[EventBus] Middleware error: {e}")

        type_name = event.event_type
        handlers = self._handlers.get(type_name, [])

        if not handlers:
            print(f"[EventBus] No handlers for {type_name}")
            return

        for _, handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event)
                else:
                    handler(event)
            except Exception as e:
                print(f"[EventBus] Handler error: {e}")
                self._dead_letter_queue.append((event, str(e)))

    async def publish_many(self, events: List[Event]) -> None:
        """Publie plusieurs événements."""
        await asyncio.gather(*[self.publish(event) for event in events])

    def get_history(self, event_type: Optional[Type[Event]] = None) -> List[Event]:
        """Récupère l'historique des événements."""
        if event_type:
            return [e for e in self._event_history
                   if e.event_type == event_type.__name__]
        return self._event_history.copy()


# Middlewares
async def logging_middleware(event: Event) -> Event:
    """Middleware de logging."""
    print(f"[Event] {event.event_type} - {event.event_id}")
    return event


async def validation_middleware(event: Event) -> Event:
    """Middleware de validation."""
    if not event.event_id:
        raise ValueError("Event must have an ID")
    return event


async def enrichment_middleware(event: Event) -> Event:
    """Middleware d'enrichissement."""
    event.metadata["processed_at"] = datetime.utcnow().isoformat()
    event.metadata["node_id"] = "node-1"
    return event


# Exemple d'utilisation
class OrderEventHandler:
    """Handler pour les événements de commande."""

    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus

    async def on_order_created(self, event: OrderCreated):
        print(f"[OrderHandler] Processing order {event.order_id}")
        print(f"  - User: {event.user_id}")
        print(f"  - Items: {len(event.items)}")
        print(f"  - Total: ${event.total}")

        # Déclencher la réservation d'inventaire
        inventory_event = InventoryReserved(
            reservation_id=str(uuid.uuid4()),
            order_id=event.order_id,
            items=event.items
        )
        await self.event_bus.publish(inventory_event)


class InventoryEventHandler:
    """Handler pour les événements d'inventaire."""

    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus

    async def on_inventory_reserved(self, event: InventoryReserved):
        print(f"[InventoryHandler] Reserved items for order {event.order_id}")

        # Simuler le traitement du paiement
        payment_event = PaymentProcessed(
            payment_id=str(uuid.uuid4()),
            order_id=event.order_id,
            amount=99.99,
            status="SUCCESS"
        )
        await self.event_bus.publish(payment_event)


class NotificationHandler:
    """Handler pour les notifications."""

    async def on_payment_processed(self, event: PaymentProcessed):
        print(f"[NotificationHandler] Payment {event.status} for order {event.order_id}")
        print(f"  - Sending confirmation email...")


async def main():
    # Créer le bus d'événements
    event_bus = EventBus()

    # Ajouter les middlewares
    event_bus.use(logging_middleware)
    event_bus.use(validation_middleware)
    event_bus.use(enrichment_middleware)

    # Créer les handlers
    order_handler = OrderEventHandler(event_bus)
    inventory_handler = InventoryEventHandler(event_bus)
    notification_handler = NotificationHandler()

    # S'abonner aux événements
    event_bus.subscribe(OrderCreated, order_handler.on_order_created, EventPriority.HIGH)
    event_bus.subscribe(InventoryReserved, inventory_handler.on_inventory_reserved)
    event_bus.subscribe(PaymentProcessed, notification_handler.on_payment_processed)

    # Publier un événement
    print("\n=== Publishing OrderCreated ===\n")
    order_event = OrderCreated(
        order_id="order-123",
        user_id="user-456",
        items=[
            {"product_id": "prod-1", "quantity": 2, "price": 29.99},
            {"product_id": "prod-2", "quantity": 1, "price": 40.01}
        ],
        total=99.99
    )

    await event_bus.publish(order_event)

    # Attendre la propagation
    await asyncio.sleep(0.1)

    print("\n=== Event History ===")
    for event in event_bus.get_history():
        print(f"  - {event.event_type}: {event.event_id[:8]}...")


if __name__ == "__main__":
    asyncio.run(main())
```

### 2. Event Store et Event Sourcing

```python
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Type, Callable
from datetime import datetime
from abc import ABC, abstractmethod
import uuid
import json
import asyncio
from collections import defaultdict


@dataclass
class StoredEvent:
    """Événement persisté dans le store."""
    event_id: str
    aggregate_id: str
    aggregate_type: str
    event_type: str
    event_data: Dict[str, Any]
    metadata: Dict[str, Any]
    version: int
    timestamp: datetime

    def to_json(self) -> str:
        return json.dumps({
            "event_id": self.event_id,
            "aggregate_id": self.aggregate_id,
            "aggregate_type": self.aggregate_type,
            "event_type": self.event_type,
            "event_data": self.event_data,
            "metadata": self.metadata,
            "version": self.version,
            "timestamp": self.timestamp.isoformat()
        })


class EventStore:
    """Store d'événements avec support snapshots."""

    def __init__(self):
        self._events: Dict[str, List[StoredEvent]] = defaultdict(list)
        self._snapshots: Dict[str, tuple] = {}  # (state, version)
        self._global_position: int = 0
        self._subscribers: List[Callable] = []
        self._lock = asyncio.Lock()

    async def append(self, aggregate_id: str, aggregate_type: str,
                     events: List["DomainEvent"],
                     expected_version: int) -> None:
        """Ajoute des événements avec vérification de version optimiste."""
        async with self._lock:
            current_version = len(self._events[aggregate_id])

            if expected_version != -1 and current_version != expected_version:
                raise ConcurrencyError(
                    f"Expected version {expected_version}, but was {current_version}"
                )

            for i, event in enumerate(events):
                stored = StoredEvent(
                    event_id=str(uuid.uuid4()),
                    aggregate_id=aggregate_id,
                    aggregate_type=aggregate_type,
                    event_type=event.__class__.__name__,
                    event_data=event.to_dict(),
                    metadata=event.metadata,
                    version=current_version + i + 1,
                    timestamp=datetime.utcnow()
                )
                self._events[aggregate_id].append(stored)
                self._global_position += 1

                # Notifier les subscribers
                for subscriber in self._subscribers:
                    asyncio.create_task(subscriber(stored))

    async def get_events(self, aggregate_id: str,
                         from_version: int = 0) -> List[StoredEvent]:
        """Récupère les événements d'un agrégat."""
        async with self._lock:
            events = self._events.get(aggregate_id, [])
            return [e for e in events if e.version > from_version]

    async def get_all_events(self, from_position: int = 0) -> List[StoredEvent]:
        """Récupère tous les événements (pour projections)."""
        async with self._lock:
            all_events = []
            for events in self._events.values():
                all_events.extend(events)
            all_events.sort(key=lambda e: e.timestamp)
            return all_events[from_position:]

    async def save_snapshot(self, aggregate_id: str,
                           state: Dict[str, Any], version: int) -> None:
        """Sauvegarde un snapshot."""
        async with self._lock:
            self._snapshots[aggregate_id] = (state, version)

    async def get_snapshot(self, aggregate_id: str) -> Optional[tuple]:
        """Récupère le dernier snapshot."""
        return self._snapshots.get(aggregate_id)

    def subscribe(self, handler: Callable) -> None:
        """S'abonne aux nouveaux événements."""
        self._subscribers.append(handler)


class ConcurrencyError(Exception):
    """Erreur de concurrence optimiste."""
    pass


class DomainEvent(ABC):
    """Classe de base pour les événements du domaine."""

    def __init__(self):
        self.event_id = str(uuid.uuid4())
        self.timestamp = datetime.utcnow()
        self.metadata: Dict[str, Any] = {}

    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        pass

    @classmethod
    @abstractmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DomainEvent":
        pass


class Aggregate(ABC):
    """Classe de base pour les agrégats."""

    def __init__(self, aggregate_id: str):
        self.id = aggregate_id
        self.version = 0
        self._pending_events: List[DomainEvent] = []

    def apply_event(self, event: DomainEvent) -> None:
        """Applique un événement à l'état."""
        handler_name = f"_apply_{event.__class__.__name__}"
        handler = getattr(self, handler_name, None)
        if handler:
            handler(event)
        self.version += 1

    def raise_event(self, event: DomainEvent) -> None:
        """Lève un nouvel événement."""
        self.apply_event(event)
        self._pending_events.append(event)

    def get_pending_events(self) -> List[DomainEvent]:
        """Récupère les événements en attente."""
        events = self._pending_events.copy()
        self._pending_events.clear()
        return events

    def load_from_history(self, events: List[StoredEvent],
                          event_registry: Dict[str, Type[DomainEvent]]) -> None:
        """Reconstruit l'état depuis l'historique."""
        for stored in events:
            event_class = event_registry.get(stored.event_type)
            if event_class:
                event = event_class.from_dict(stored.event_data)
                self.apply_event(event)


# Exemple concret: Compte bancaire
class AccountOpened(DomainEvent):
    def __init__(self, account_id: str, owner: str, initial_balance: float = 0):
        super().__init__()
        self.account_id = account_id
        self.owner = owner
        self.initial_balance = initial_balance

    def to_dict(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "owner": self.owner,
            "initial_balance": self.initial_balance
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AccountOpened":
        return cls(data["account_id"], data["owner"], data["initial_balance"])


class MoneyDeposited(DomainEvent):
    def __init__(self, account_id: str, amount: float, description: str = ""):
        super().__init__()
        self.account_id = account_id
        self.amount = amount
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "amount": self.amount,
            "description": self.description
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MoneyDeposited":
        return cls(data["account_id"], data["amount"], data.get("description", ""))


class MoneyWithdrawn(DomainEvent):
    def __init__(self, account_id: str, amount: float, description: str = ""):
        super().__init__()
        self.account_id = account_id
        self.amount = amount
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "account_id": self.account_id,
            "amount": self.amount,
            "description": self.description
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MoneyWithdrawn":
        return cls(data["account_id"], data["amount"], data.get("description", ""))


class BankAccount(Aggregate):
    """Agrégat compte bancaire."""

    def __init__(self, account_id: str):
        super().__init__(account_id)
        self.owner: str = ""
        self.balance: float = 0
        self.is_open: bool = False

    @classmethod
    def open(cls, account_id: str, owner: str,
             initial_balance: float = 0) -> "BankAccount":
        """Factory pour ouvrir un compte."""
        account = cls(account_id)
        account.raise_event(AccountOpened(account_id, owner, initial_balance))
        return account

    def deposit(self, amount: float, description: str = "") -> None:
        """Dépose de l'argent."""
        if not self.is_open:
            raise ValueError("Account is not open")
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.raise_event(MoneyDeposited(self.id, amount, description))

    def withdraw(self, amount: float, description: str = "") -> None:
        """Retire de l'argent."""
        if not self.is_open:
            raise ValueError("Account is not open")
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.raise_event(MoneyWithdrawn(self.id, amount, description))

    # Event handlers
    def _apply_AccountOpened(self, event: AccountOpened):
        self.owner = event.owner
        self.balance = event.initial_balance
        self.is_open = True

    def _apply_MoneyDeposited(self, event: MoneyDeposited):
        self.balance += event.amount

    def _apply_MoneyWithdrawn(self, event: MoneyWithdrawn):
        self.balance -= event.amount


class BankAccountRepository:
    """Repository pour les comptes bancaires."""

    EVENT_REGISTRY = {
        "AccountOpened": AccountOpened,
        "MoneyDeposited": MoneyDeposited,
        "MoneyWithdrawn": MoneyWithdrawn
    }

    def __init__(self, event_store: EventStore):
        self.event_store = event_store

    async def get(self, account_id: str) -> Optional[BankAccount]:
        """Récupère un compte depuis l'event store."""
        # Vérifier le snapshot
        snapshot = await self.event_store.get_snapshot(account_id)

        if snapshot:
            state, version = snapshot
            account = BankAccount(account_id)
            account.owner = state["owner"]
            account.balance = state["balance"]
            account.is_open = state["is_open"]
            account.version = version

            # Charger les événements depuis le snapshot
            events = await self.event_store.get_events(account_id, version)
        else:
            events = await self.event_store.get_events(account_id)
            if not events:
                return None
            account = BankAccount(account_id)

        account.load_from_history(events, self.EVENT_REGISTRY)
        return account

    async def save(self, account: BankAccount) -> None:
        """Sauvegarde les événements d'un compte."""
        events = account.get_pending_events()
        if events:
            await self.event_store.append(
                account.id,
                "BankAccount",
                events,
                account.version - len(events)
            )

        # Créer un snapshot tous les 10 événements
        if account.version % 10 == 0:
            await self.event_store.save_snapshot(
                account.id,
                {
                    "owner": account.owner,
                    "balance": account.balance,
                    "is_open": account.is_open
                },
                account.version
            )


# Projection pour les rapports
class AccountBalanceProjection:
    """Projection pour visualiser les soldes."""

    def __init__(self):
        self.balances: Dict[str, float] = {}
        self.total_deposits: Dict[str, float] = defaultdict(float)
        self.total_withdrawals: Dict[str, float] = defaultdict(float)

    async def handle(self, stored_event: StoredEvent) -> None:
        """Met à jour la projection."""
        if stored_event.event_type == "AccountOpened":
            account_id = stored_event.event_data["account_id"]
            self.balances[account_id] = stored_event.event_data["initial_balance"]

        elif stored_event.event_type == "MoneyDeposited":
            account_id = stored_event.event_data["account_id"]
            amount = stored_event.event_data["amount"]
            self.balances[account_id] = self.balances.get(account_id, 0) + amount
            self.total_deposits[account_id] += amount

        elif stored_event.event_type == "MoneyWithdrawn":
            account_id = stored_event.event_data["account_id"]
            amount = stored_event.event_data["amount"]
            self.balances[account_id] = self.balances.get(account_id, 0) - amount
            self.total_withdrawals[account_id] += amount

    def get_summary(self, account_id: str) -> Dict[str, Any]:
        """Récupère le résumé d'un compte."""
        return {
            "balance": self.balances.get(account_id, 0),
            "total_deposits": self.total_deposits.get(account_id, 0),
            "total_withdrawals": self.total_withdrawals.get(account_id, 0)
        }


async def main():
    # Setup
    event_store = EventStore()
    repository = BankAccountRepository(event_store)
    projection = AccountBalanceProjection()

    # S'abonner aux événements pour la projection
    event_store.subscribe(projection.handle)

    # Créer et utiliser un compte
    print("=== Creating Account ===")
    account = BankAccount.open("acc-001", "Alice", 100.0)
    await repository.save(account)

    print("\n=== Making Transactions ===")
    account = await repository.get("acc-001")
    account.deposit(50.0, "Salary")
    account.deposit(25.0, "Bonus")
    account.withdraw(30.0, "Groceries")
    await repository.save(account)

    print("\n=== Account State (from events) ===")
    account = await repository.get("acc-001")
    print(f"Owner: {account.owner}")
    print(f"Balance: ${account.balance}")
    print(f"Version: {account.version}")

    await asyncio.sleep(0.1)

    print("\n=== Projection Summary ===")
    summary = projection.get_summary("acc-001")
    print(f"Balance: ${summary['balance']}")
    print(f"Total Deposits: ${summary['total_deposits']}")
    print(f"Total Withdrawals: ${summary['total_withdrawals']}")

    print("\n=== Event History ===")
    events = await event_store.get_events("acc-001")
    for event in events:
        print(f"  v{event.version}: {event.event_type} - {event.event_data}")


if __name__ == "__main__":
    asyncio.run(main())
```

### 3. Event Choreography vs Orchestration

```
Event Choreography (Décentralisé):
══════════════════════════════════

     ┌─────────────┐
     │   Order     │──────────────────────────────────────────┐
     │   Service   │                                          │
     └──────┬──────┘                                          │
            │ OrderCreated                                    │
            ▼                                                 │
     ┌─────────────┐                                          │
     │  Inventory  │──────────────────────────────┐           │
     │   Service   │                              │           │
     └──────┬──────┘                              │           │
            │ InventoryReserved                   │           │
            ▼                                     │           │
     ┌─────────────┐                              │           │
     │   Payment   │─────────────────┐            │           │
     │   Service   │                 │            │           │
     └──────┬──────┘                 │            │           │
            │ PaymentProcessed       │            │           │
            ▼                        ▼            ▼           ▼
     ┌─────────────┐          ┌─────────────────────────────────┐
     │  Shipping   │          │       Notification Service       │
     │   Service   │          │  (Listens to all domain events)  │
     └─────────────┘          └─────────────────────────────────┘


Event Orchestration (Centralisé):
═════════════════════════════════

                    ┌─────────────────────┐
                    │      Saga           │
                    │   Orchestrator      │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
  │   Order     │       │  Inventory  │       │   Payment   │
  │   Service   │       │   Service   │       │   Service   │
  └─────────────┘       └─────────────┘       └─────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Orchestrator     │
                    │   (Coordinates)     │
                    └─────────────────────┘
```

```python
import asyncio
from dataclasses import dataclass, field
from typing import Dict, List, Callable, Any, Optional
from enum import Enum
from abc import ABC, abstractmethod
import uuid


# Choreography Pattern Implementation
class ChoreographyEventBus:
    """Bus d'événements pour la chorégraphie."""

    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_type: str, handler: Callable):
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)

    async def publish(self, event_type: str, data: Dict[str, Any]):
        handlers = self._handlers.get(event_type, [])
        for handler in handlers:
            asyncio.create_task(handler(data))


class OrderServiceChoreography:
    """Service de commande (Choreography)."""

    def __init__(self, event_bus: ChoreographyEventBus):
        self.event_bus = event_bus
        self.orders: Dict[str, Dict] = {}

        event_bus.subscribe("PaymentProcessed", self._on_payment_processed)
        event_bus.subscribe("PaymentFailed", self._on_payment_failed)

    async def create_order(self, order_data: Dict[str, Any]) -> str:
        order_id = str(uuid.uuid4())[:8]
        self.orders[order_id] = {
            **order_data,
            "id": order_id,
            "status": "PENDING"
        }

        print(f"[Order] Created order {order_id}")
        await self.event_bus.publish("OrderCreated", {
            "order_id": order_id,
            **order_data
        })
        return order_id

    async def _on_payment_processed(self, data: Dict[str, Any]):
        order_id = data["order_id"]
        if order_id in self.orders:
            self.orders[order_id]["status"] = "CONFIRMED"
            print(f"[Order] Order {order_id} confirmed")

    async def _on_payment_failed(self, data: Dict[str, Any]):
        order_id = data["order_id"]
        if order_id in self.orders:
            self.orders[order_id]["status"] = "CANCELLED"
            print(f"[Order] Order {order_id} cancelled")


class InventoryServiceChoreography:
    """Service d'inventaire (Choreography)."""

    def __init__(self, event_bus: ChoreographyEventBus):
        self.event_bus = event_bus
        self.inventory = {"prod-1": 100, "prod-2": 50}
        self.reservations: Dict[str, List] = {}

        event_bus.subscribe("OrderCreated", self._on_order_created)
        event_bus.subscribe("PaymentFailed", self._on_payment_failed)

    async def _on_order_created(self, data: Dict[str, Any]):
        order_id = data["order_id"]
        items = data.get("items", [])

        # Vérifier et réserver
        can_reserve = all(
            self.inventory.get(item["product_id"], 0) >= item["quantity"]
            for item in items
        )

        if can_reserve:
            self.reservations[order_id] = items
            for item in items:
                self.inventory[item["product_id"]] -= item["quantity"]

            print(f"[Inventory] Reserved items for order {order_id}")
            await self.event_bus.publish("InventoryReserved", {
                "order_id": order_id,
                "items": items
            })
        else:
            print(f"[Inventory] Cannot reserve items for order {order_id}")
            await self.event_bus.publish("InventoryReservationFailed", {
                "order_id": order_id,
                "reason": "Insufficient stock"
            })

    async def _on_payment_failed(self, data: Dict[str, Any]):
        order_id = data["order_id"]
        if order_id in self.reservations:
            # Rollback
            for item in self.reservations[order_id]:
                self.inventory[item["product_id"]] += item["quantity"]
            del self.reservations[order_id]
            print(f"[Inventory] Released reservation for order {order_id}")


class PaymentServiceChoreography:
    """Service de paiement (Choreography)."""

    def __init__(self, event_bus: ChoreographyEventBus,
                 should_fail: bool = False):
        self.event_bus = event_bus
        self.should_fail = should_fail

        event_bus.subscribe("InventoryReserved", self._on_inventory_reserved)

    async def _on_inventory_reserved(self, data: Dict[str, Any]):
        order_id = data["order_id"]

        if self.should_fail:
            print(f"[Payment] Payment failed for order {order_id}")
            await self.event_bus.publish("PaymentFailed", {
                "order_id": order_id,
                "reason": "Payment declined"
            })
        else:
            print(f"[Payment] Payment processed for order {order_id}")
            await self.event_bus.publish("PaymentProcessed", {
                "order_id": order_id,
                "payment_id": str(uuid.uuid4())[:8]
            })


async def demo_choreography():
    print("=== Choreography Pattern Demo ===\n")

    event_bus = ChoreographyEventBus()

    order_service = OrderServiceChoreography(event_bus)
    inventory_service = InventoryServiceChoreography(event_bus)
    payment_service = PaymentServiceChoreography(event_bus)

    # Créer une commande
    await order_service.create_order({
        "user_id": "user-123",
        "items": [
            {"product_id": "prod-1", "quantity": 2},
            {"product_id": "prod-2", "quantity": 1}
        ]
    })

    await asyncio.sleep(0.2)
    print()


# Orchestration Pattern Implementation
class SagaState(Enum):
    STARTED = "STARTED"
    INVENTORY_RESERVED = "INVENTORY_RESERVED"
    PAYMENT_PROCESSED = "PAYMENT_PROCESSED"
    COMPLETED = "COMPLETED"
    COMPENSATING = "COMPENSATING"
    FAILED = "FAILED"


@dataclass
class SagaContext:
    saga_id: str
    order_id: str
    state: SagaState = SagaState.STARTED
    data: Dict[str, Any] = field(default_factory=dict)
    compensation_data: Dict[str, Any] = field(default_factory=dict)


class OrderSagaOrchestrator:
    """Orchestrateur de saga pour les commandes."""

    def __init__(self):
        self.sagas: Dict[str, SagaContext] = {}

    async def start_saga(self, order_data: Dict[str, Any]) -> SagaContext:
        """Démarre une nouvelle saga."""
        saga_id = str(uuid.uuid4())[:8]
        order_id = str(uuid.uuid4())[:8]

        context = SagaContext(
            saga_id=saga_id,
            order_id=order_id,
            data=order_data
        )
        self.sagas[saga_id] = context

        print(f"[Orchestrator] Starting saga {saga_id} for order {order_id}")

        try:
            # Step 1: Create Order
            await self._create_order(context)

            # Step 2: Reserve Inventory
            await self._reserve_inventory(context)

            # Step 3: Process Payment
            await self._process_payment(context)

            # Step 4: Complete
            context.state = SagaState.COMPLETED
            print(f"[Orchestrator] Saga {saga_id} completed successfully")

        except SagaCompensationRequired as e:
            print(f"[Orchestrator] Saga {saga_id} failed: {e}")
            await self._compensate(context)

        return context

    async def _create_order(self, context: SagaContext):
        """Étape 1: Créer la commande."""
        print(f"[Orchestrator] Step 1: Creating order {context.order_id}")
        # Simuler l'appel au service
        context.compensation_data["order_created"] = True

    async def _reserve_inventory(self, context: SagaContext):
        """Étape 2: Réserver l'inventaire."""
        print(f"[Orchestrator] Step 2: Reserving inventory")
        items = context.data.get("items", [])

        # Simuler vérification
        if any(item.get("quantity", 0) > 100 for item in items):
            raise SagaCompensationRequired("Insufficient inventory")

        context.compensation_data["inventory_reserved"] = True
        context.compensation_data["reserved_items"] = items
        context.state = SagaState.INVENTORY_RESERVED

    async def _process_payment(self, context: SagaContext):
        """Étape 3: Traiter le paiement."""
        print(f"[Orchestrator] Step 3: Processing payment")

        # Simuler échec de paiement pour démonstration
        if context.data.get("fail_payment"):
            raise SagaCompensationRequired("Payment declined")

        context.compensation_data["payment_processed"] = True
        context.state = SagaState.PAYMENT_PROCESSED

    async def _compensate(self, context: SagaContext):
        """Compenser les étapes réussies."""
        context.state = SagaState.COMPENSATING
        print(f"[Orchestrator] Starting compensation for saga {context.saga_id}")

        # Compensation en ordre inverse
        if context.compensation_data.get("payment_processed"):
            print("[Orchestrator] Compensating: Refunding payment")

        if context.compensation_data.get("inventory_reserved"):
            print("[Orchestrator] Compensating: Releasing inventory")

        if context.compensation_data.get("order_created"):
            print("[Orchestrator] Compensating: Cancelling order")

        context.state = SagaState.FAILED
        print(f"[Orchestrator] Compensation completed for saga {context.saga_id}")


class SagaCompensationRequired(Exception):
    """Exception pour déclencher la compensation."""
    pass


async def demo_orchestration():
    print("=== Orchestration Pattern Demo ===\n")

    orchestrator = OrderSagaOrchestrator()

    # Cas de succès
    print("--- Success Case ---")
    await orchestrator.start_saga({
        "user_id": "user-123",
        "items": [
            {"product_id": "prod-1", "quantity": 2}
        ]
    })

    print()

    # Cas d'échec avec compensation
    print("--- Failure Case (with compensation) ---")
    await orchestrator.start_saga({
        "user_id": "user-456",
        "items": [
            {"product_id": "prod-1", "quantity": 2}
        ],
        "fail_payment": True
    })


async def main():
    await demo_choreography()
    print()
    await demo_orchestration()


if __name__ == "__main__":
    asyncio.run(main())
```

## Bonnes Pratiques

1. **Event Immutability** - Les événements ne doivent jamais être modifiés
2. **Event Versioning** - Gérer l'évolution des schémas d'événements
3. **Idempotent Handlers** - Les handlers doivent être idempotents
4. **Event Ordering** - Garantir l'ordre quand nécessaire
5. **Dead Letter Queues** - Gérer les événements non traités
6. **Event Correlation** - Tracer les événements liés

## Anti-Patterns à Éviter

- **Event Payload Bloat** - Trop de données dans les événements
- **Missing Events** - Ne pas persister tous les événements importants
- **Temporal Coupling** - Dépendre de l'ordre de réception
- **Event Soup** - Trop d'événements sans structure claire
