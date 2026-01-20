# CQRS - Command Query Responsibility Segregation

## Vue d'ensemble

CQRS sépare les opérations de lecture (Query) des opérations d'écriture (Command), permettant d'optimiser chaque chemin indépendamment.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CQRS Architecture                           │
│                                                                      │
│                              ┌───────────┐                          │
│                              │   Client  │                          │
│                              └─────┬─────┘                          │
│                                    │                                │
│                    ┌───────────────┴───────────────┐                │
│                    │                               │                │
│              ┌─────▼─────┐                   ┌─────▼─────┐          │
│              │  Command  │                   │   Query   │          │
│              │   Side    │                   │   Side    │          │
│              └─────┬─────┘                   └─────┬─────┘          │
│                    │                               │                │
│              ┌─────▼─────┐                   ┌─────▼─────┐          │
│              │  Command  │                   │   Query   │          │
│              │  Handler  │                   │  Handler  │          │
│              └─────┬─────┘                   └─────┬─────┘          │
│                    │                               │                │
│              ┌─────▼─────┐                   ┌─────▼─────┐          │
│              │  Domain   │                   │   Read    │          │
│              │  Model    │                   │   Model   │          │
│              └─────┬─────┘                   └─────┬─────┘          │
│                    │                               │                │
│              ┌─────▼─────┐    Sync/Event    ┌─────▼─────┐          │
│              │   Write   │◄─────────────────│   Read    │          │
│              │    DB     │                  │    DB     │          │
│              └───────────┘                  └───────────┘          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Data Flow:
══════════

Commands (Write):
  Client ──▶ Command ──▶ Handler ──▶ Domain ──▶ Write DB
                                        │
                                        ▼
                                   Domain Event
                                        │
                                        ▼
Queries (Read):                    Event Handler
  Client ──▶ Query ──▶ Handler ──▶ Read Model ◀───┘
```

## Implementation Complète

### 1. Infrastructure de Base

```python
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Type, TypeVar, Generic, Callable
from abc import ABC, abstractmethod
from datetime import datetime
import uuid
import asyncio
from enum import Enum


# Base Classes
T = TypeVar('T')
TResult = TypeVar('TResult')


class Message(ABC):
    """Classe de base pour tous les messages."""

    def __init__(self):
        self.message_id = str(uuid.uuid4())
        self.timestamp = datetime.utcnow()
        self.metadata: Dict[str, Any] = {}


class Command(Message):
    """Classe de base pour les commandes."""
    pass


class Query(Message, Generic[TResult]):
    """Classe de base pour les queries."""
    pass


class DomainEvent(Message):
    """Classe de base pour les événements du domaine."""
    pass


class CommandHandler(ABC, Generic[T]):
    """Handler abstrait pour les commandes."""

    @abstractmethod
    async def handle(self, command: T) -> Any:
        pass


class QueryHandler(ABC, Generic[T, TResult]):
    """Handler abstrait pour les queries."""

    @abstractmethod
    async def handle(self, query: T) -> TResult:
        pass


class EventHandler(ABC, Generic[T]):
    """Handler abstrait pour les événements."""

    @abstractmethod
    async def handle(self, event: T) -> None:
        pass


class MessageBus:
    """Bus de messages central."""

    def __init__(self):
        self._command_handlers: Dict[Type, CommandHandler] = {}
        self._query_handlers: Dict[Type, QueryHandler] = {}
        self._event_handlers: Dict[Type, List[EventHandler]] = {}

    def register_command_handler(self, command_type: Type[Command],
                                  handler: CommandHandler) -> None:
        self._command_handlers[command_type] = handler

    def register_query_handler(self, query_type: Type[Query],
                                handler: QueryHandler) -> None:
        self._query_handlers[query_type] = handler

    def register_event_handler(self, event_type: Type[DomainEvent],
                                handler: EventHandler) -> None:
        if event_type not in self._event_handlers:
            self._event_handlers[event_type] = []
        self._event_handlers[event_type].append(handler)

    async def send_command(self, command: Command) -> Any:
        """Envoie une commande."""
        handler = self._command_handlers.get(type(command))
        if not handler:
            raise ValueError(f"No handler for command {type(command).__name__}")
        return await handler.handle(command)

    async def send_query(self, query: Query[TResult]) -> TResult:
        """Envoie une query."""
        handler = self._query_handlers.get(type(query))
        if not handler:
            raise ValueError(f"No handler for query {type(query).__name__}")
        return await handler.handle(query)

    async def publish_event(self, event: DomainEvent) -> None:
        """Publie un événement."""
        handlers = self._event_handlers.get(type(event), [])
        await asyncio.gather(*[h.handle(event) for h in handlers])


# Unit of Work Pattern
class UnitOfWork(ABC):
    """Pattern Unit of Work pour les transactions."""

    @abstractmethod
    async def __aenter__(self):
        pass

    @abstractmethod
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

    @abstractmethod
    async def commit(self):
        pass

    @abstractmethod
    async def rollback(self):
        pass


class InMemoryUnitOfWork(UnitOfWork):
    """Implementation en mémoire du Unit of Work."""

    def __init__(self, message_bus: MessageBus):
        self.message_bus = message_bus
        self._pending_events: List[DomainEvent] = []
        self._committed = False

    async def __aenter__(self):
        self._pending_events = []
        self._committed = False
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            await self.rollback()
        elif not self._committed:
            await self.commit()

    def add_event(self, event: DomainEvent):
        self._pending_events.append(event)

    async def commit(self):
        """Commit et publie les événements."""
        self._committed = True
        for event in self._pending_events:
            await self.message_bus.publish_event(event)
        self._pending_events = []

    async def rollback(self):
        """Annule les changements."""
        self._pending_events = []
```

### 2. Domain Model (Write Side)

```python
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid


class OrderStatus(Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    CONFIRMED = "CONFIRMED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


# Domain Events
@dataclass
class OrderCreated(DomainEvent):
    order_id: str = ""
    customer_id: str = ""

    def __post_init__(self):
        super().__init__()


@dataclass
class OrderItemAdded(DomainEvent):
    order_id: str = ""
    product_id: str = ""
    product_name: str = ""
    quantity: int = 0
    unit_price: float = 0.0

    def __post_init__(self):
        super().__init__()


@dataclass
class OrderSubmitted(DomainEvent):
    order_id: str = ""
    total_amount: float = 0.0
    submitted_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        super().__init__()


@dataclass
class OrderConfirmed(DomainEvent):
    order_id: str = ""
    confirmed_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        super().__init__()


@dataclass
class OrderCancelled(DomainEvent):
    order_id: str = ""
    reason: str = ""
    cancelled_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        super().__init__()


# Domain Entities
@dataclass
class OrderItem:
    product_id: str
    product_name: str
    quantity: int
    unit_price: float

    @property
    def total_price(self) -> float:
        return self.quantity * self.unit_price


class Order:
    """Agrégat Order (Write Model)."""

    def __init__(self, order_id: str, customer_id: str):
        self.id = order_id
        self.customer_id = customer_id
        self.items: List[OrderItem] = []
        self.status = OrderStatus.DRAFT
        self.created_at = datetime.utcnow()
        self.submitted_at: Optional[datetime] = None
        self.confirmed_at: Optional[datetime] = None
        self._events: List[DomainEvent] = []

    @classmethod
    def create(cls, customer_id: str) -> tuple["Order", DomainEvent]:
        """Factory pour créer une commande."""
        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        order = cls(order_id, customer_id)
        event = OrderCreated(order_id=order_id, customer_id=customer_id)
        order._events.append(event)
        return order, event

    @property
    def total_amount(self) -> float:
        return sum(item.total_price for item in self.items)

    def add_item(self, product_id: str, product_name: str,
                 quantity: int, unit_price: float) -> DomainEvent:
        """Ajoute un article."""
        if self.status != OrderStatus.DRAFT:
            raise ValueError("Cannot add items to non-draft order")

        if quantity <= 0:
            raise ValueError("Quantity must be positive")

        if unit_price <= 0:
            raise ValueError("Price must be positive")

        # Vérifier si l'article existe déjà
        existing = next((i for i in self.items if i.product_id == product_id), None)
        if existing:
            existing.quantity += quantity
        else:
            self.items.append(OrderItem(product_id, product_name, quantity, unit_price))

        event = OrderItemAdded(
            order_id=self.id,
            product_id=product_id,
            product_name=product_name,
            quantity=quantity,
            unit_price=unit_price
        )
        self._events.append(event)
        return event

    def submit(self) -> DomainEvent:
        """Soumet la commande."""
        if self.status != OrderStatus.DRAFT:
            raise ValueError("Order already submitted")

        if not self.items:
            raise ValueError("Cannot submit empty order")

        self.status = OrderStatus.SUBMITTED
        self.submitted_at = datetime.utcnow()

        event = OrderSubmitted(
            order_id=self.id,
            total_amount=self.total_amount,
            submitted_at=self.submitted_at
        )
        self._events.append(event)
        return event

    def confirm(self) -> DomainEvent:
        """Confirme la commande."""
        if self.status != OrderStatus.SUBMITTED:
            raise ValueError("Order must be submitted first")

        self.status = OrderStatus.CONFIRMED
        self.confirmed_at = datetime.utcnow()

        event = OrderConfirmed(
            order_id=self.id,
            confirmed_at=self.confirmed_at
        )
        self._events.append(event)
        return event

    def cancel(self, reason: str) -> DomainEvent:
        """Annule la commande."""
        if self.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
            raise ValueError("Cannot cancel shipped/delivered order")

        if self.status == OrderStatus.CANCELLED:
            raise ValueError("Order already cancelled")

        self.status = OrderStatus.CANCELLED

        event = OrderCancelled(
            order_id=self.id,
            reason=reason
        )
        self._events.append(event)
        return event

    def get_uncommitted_events(self) -> List[DomainEvent]:
        """Récupère les événements non persistés."""
        events = self._events.copy()
        self._events.clear()
        return events


# Repository (Write Side)
class OrderRepository:
    """Repository pour les commandes (Write)."""

    def __init__(self):
        self._orders: Dict[str, Order] = {}

    async def get(self, order_id: str) -> Optional[Order]:
        return self._orders.get(order_id)

    async def save(self, order: Order) -> None:
        self._orders[order.id] = order
```

### 3. Commands et Command Handlers

```python
# Commands
@dataclass
class CreateOrder(Command):
    customer_id: str


@dataclass
class AddOrderItem(Command):
    order_id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: float


@dataclass
class SubmitOrder(Command):
    order_id: str


@dataclass
class ConfirmOrder(Command):
    order_id: str


@dataclass
class CancelOrder(Command):
    order_id: str
    reason: str


# Command Handlers
class CreateOrderHandler(CommandHandler[CreateOrder]):
    """Handler pour créer une commande."""

    def __init__(self, repository: OrderRepository, uow: InMemoryUnitOfWork):
        self.repository = repository
        self.uow = uow

    async def handle(self, command: CreateOrder) -> str:
        async with self.uow:
            order, event = Order.create(command.customer_id)
            await self.repository.save(order)
            self.uow.add_event(event)
            print(f"[Command] Created order {order.id}")
            return order.id


class AddOrderItemHandler(CommandHandler[AddOrderItem]):
    """Handler pour ajouter un article."""

    def __init__(self, repository: OrderRepository, uow: InMemoryUnitOfWork):
        self.repository = repository
        self.uow = uow

    async def handle(self, command: AddOrderItem) -> None:
        async with self.uow:
            order = await self.repository.get(command.order_id)
            if not order:
                raise ValueError(f"Order {command.order_id} not found")

            event = order.add_item(
                command.product_id,
                command.product_name,
                command.quantity,
                command.unit_price
            )
            await self.repository.save(order)
            self.uow.add_event(event)
            print(f"[Command] Added item {command.product_name} to order {command.order_id}")


class SubmitOrderHandler(CommandHandler[SubmitOrder]):
    """Handler pour soumettre une commande."""

    def __init__(self, repository: OrderRepository, uow: InMemoryUnitOfWork):
        self.repository = repository
        self.uow = uow

    async def handle(self, command: SubmitOrder) -> None:
        async with self.uow:
            order = await self.repository.get(command.order_id)
            if not order:
                raise ValueError(f"Order {command.order_id} not found")

            event = order.submit()
            await self.repository.save(order)
            self.uow.add_event(event)
            print(f"[Command] Submitted order {command.order_id}")


class ConfirmOrderHandler(CommandHandler[ConfirmOrder]):
    """Handler pour confirmer une commande."""

    def __init__(self, repository: OrderRepository, uow: InMemoryUnitOfWork):
        self.repository = repository
        self.uow = uow

    async def handle(self, command: ConfirmOrder) -> None:
        async with self.uow:
            order = await self.repository.get(command.order_id)
            if not order:
                raise ValueError(f"Order {command.order_id} not found")

            event = order.confirm()
            await self.repository.save(order)
            self.uow.add_event(event)
            print(f"[Command] Confirmed order {command.order_id}")


class CancelOrderHandler(CommandHandler[CancelOrder]):
    """Handler pour annuler une commande."""

    def __init__(self, repository: OrderRepository, uow: InMemoryUnitOfWork):
        self.repository = repository
        self.uow = uow

    async def handle(self, command: CancelOrder) -> None:
        async with self.uow:
            order = await self.repository.get(command.order_id)
            if not order:
                raise ValueError(f"Order {command.order_id} not found")

            event = order.cancel(command.reason)
            await self.repository.save(order)
            self.uow.add_event(event)
            print(f"[Command] Cancelled order {command.order_id}")
```

### 4. Read Model et Queries

```python
from dataclasses import dataclass, field
from typing import List, Optional, Dict
from datetime import datetime


# Read Models (DTOs optimisés pour les queries)
@dataclass
class OrderSummaryDto:
    """DTO pour la liste des commandes."""
    order_id: str
    customer_id: str
    status: str
    item_count: int
    total_amount: float
    created_at: datetime
    submitted_at: Optional[datetime] = None


@dataclass
class OrderDetailDto:
    """DTO pour le détail d'une commande."""
    order_id: str
    customer_id: str
    status: str
    items: List[Dict[str, Any]]
    total_amount: float
    created_at: datetime
    submitted_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None


@dataclass
class CustomerOrdersDto:
    """DTO pour les commandes d'un client."""
    customer_id: str
    total_orders: int
    total_spent: float
    orders: List[OrderSummaryDto]


# Read Model Store (optimisé pour les lectures)
class OrderReadModel:
    """Store de lecture pour les commandes."""

    def __init__(self):
        # Index par order_id
        self._orders: Dict[str, Dict[str, Any]] = {}
        # Index par customer_id
        self._customer_orders: Dict[str, List[str]] = {}
        # Index par status
        self._status_index: Dict[str, List[str]] = {}

    def apply_order_created(self, event: OrderCreated) -> None:
        """Applique l'événement OrderCreated."""
        self._orders[event.order_id] = {
            "order_id": event.order_id,
            "customer_id": event.customer_id,
            "status": "DRAFT",
            "items": [],
            "total_amount": 0.0,
            "created_at": event.timestamp,
            "submitted_at": None,
            "confirmed_at": None
        }

        if event.customer_id not in self._customer_orders:
            self._customer_orders[event.customer_id] = []
        self._customer_orders[event.customer_id].append(event.order_id)

        if "DRAFT" not in self._status_index:
            self._status_index["DRAFT"] = []
        self._status_index["DRAFT"].append(event.order_id)

    def apply_order_item_added(self, event: OrderItemAdded) -> None:
        """Applique l'événement OrderItemAdded."""
        if event.order_id not in self._orders:
            return

        order = self._orders[event.order_id]

        # Chercher l'item existant
        existing_item = next(
            (i for i in order["items"] if i["product_id"] == event.product_id),
            None
        )

        if existing_item:
            existing_item["quantity"] += event.quantity
            existing_item["total_price"] = (
                existing_item["quantity"] * existing_item["unit_price"]
            )
        else:
            order["items"].append({
                "product_id": event.product_id,
                "product_name": event.product_name,
                "quantity": event.quantity,
                "unit_price": event.unit_price,
                "total_price": event.quantity * event.unit_price
            })

        order["total_amount"] = sum(i["total_price"] for i in order["items"])

    def apply_order_submitted(self, event: OrderSubmitted) -> None:
        """Applique l'événement OrderSubmitted."""
        if event.order_id not in self._orders:
            return

        order = self._orders[event.order_id]
        old_status = order["status"]

        order["status"] = "SUBMITTED"
        order["submitted_at"] = event.submitted_at

        # Mettre à jour les index
        if old_status in self._status_index:
            self._status_index[old_status].remove(event.order_id)

        if "SUBMITTED" not in self._status_index:
            self._status_index["SUBMITTED"] = []
        self._status_index["SUBMITTED"].append(event.order_id)

    def apply_order_confirmed(self, event: OrderConfirmed) -> None:
        """Applique l'événement OrderConfirmed."""
        if event.order_id not in self._orders:
            return

        order = self._orders[event.order_id]
        old_status = order["status"]

        order["status"] = "CONFIRMED"
        order["confirmed_at"] = event.confirmed_at

        if old_status in self._status_index:
            self._status_index[old_status].remove(event.order_id)

        if "CONFIRMED" not in self._status_index:
            self._status_index["CONFIRMED"] = []
        self._status_index["CONFIRMED"].append(event.order_id)

    def apply_order_cancelled(self, event: OrderCancelled) -> None:
        """Applique l'événement OrderCancelled."""
        if event.order_id not in self._orders:
            return

        order = self._orders[event.order_id]
        old_status = order["status"]

        order["status"] = "CANCELLED"

        if old_status in self._status_index:
            self._status_index[old_status].remove(event.order_id)

        if "CANCELLED" not in self._status_index:
            self._status_index["CANCELLED"] = []
        self._status_index["CANCELLED"].append(event.order_id)

    # Query Methods
    def get_order(self, order_id: str) -> Optional[OrderDetailDto]:
        """Récupère le détail d'une commande."""
        order = self._orders.get(order_id)
        if not order:
            return None

        return OrderDetailDto(
            order_id=order["order_id"],
            customer_id=order["customer_id"],
            status=order["status"],
            items=order["items"],
            total_amount=order["total_amount"],
            created_at=order["created_at"],
            submitted_at=order["submitted_at"],
            confirmed_at=order["confirmed_at"]
        )

    def get_orders_by_customer(self, customer_id: str) -> CustomerOrdersDto:
        """Récupère les commandes d'un client."""
        order_ids = self._customer_orders.get(customer_id, [])
        orders = [self._orders[oid] for oid in order_ids if oid in self._orders]

        summaries = [
            OrderSummaryDto(
                order_id=o["order_id"],
                customer_id=o["customer_id"],
                status=o["status"],
                item_count=len(o["items"]),
                total_amount=o["total_amount"],
                created_at=o["created_at"],
                submitted_at=o["submitted_at"]
            )
            for o in orders
        ]

        total_spent = sum(
            o["total_amount"] for o in orders
            if o["status"] not in ["DRAFT", "CANCELLED"]
        )

        return CustomerOrdersDto(
            customer_id=customer_id,
            total_orders=len(orders),
            total_spent=total_spent,
            orders=summaries
        )

    def get_orders_by_status(self, status: str) -> List[OrderSummaryDto]:
        """Récupère les commandes par status."""
        order_ids = self._status_index.get(status, [])

        return [
            OrderSummaryDto(
                order_id=o["order_id"],
                customer_id=o["customer_id"],
                status=o["status"],
                item_count=len(o["items"]),
                total_amount=o["total_amount"],
                created_at=o["created_at"],
                submitted_at=o["submitted_at"]
            )
            for oid in order_ids
            if (o := self._orders.get(oid))
        ]


# Queries
@dataclass
class GetOrderById(Query[Optional[OrderDetailDto]]):
    order_id: str


@dataclass
class GetCustomerOrders(Query[CustomerOrdersDto]):
    customer_id: str


@dataclass
class GetOrdersByStatus(Query[List[OrderSummaryDto]]):
    status: str


# Query Handlers
class GetOrderByIdHandler(QueryHandler[GetOrderById, Optional[OrderDetailDto]]):
    def __init__(self, read_model: OrderReadModel):
        self.read_model = read_model

    async def handle(self, query: GetOrderById) -> Optional[OrderDetailDto]:
        return self.read_model.get_order(query.order_id)


class GetCustomerOrdersHandler(QueryHandler[GetCustomerOrders, CustomerOrdersDto]):
    def __init__(self, read_model: OrderReadModel):
        self.read_model = read_model

    async def handle(self, query: GetCustomerOrders) -> CustomerOrdersDto:
        return self.read_model.get_orders_by_customer(query.customer_id)


class GetOrdersByStatusHandler(QueryHandler[GetOrdersByStatus, List[OrderSummaryDto]]):
    def __init__(self, read_model: OrderReadModel):
        self.read_model = read_model

    async def handle(self, query: GetOrdersByStatus) -> List[OrderSummaryDto]:
        return self.read_model.get_orders_by_status(query.status)


# Event Handlers pour synchroniser le Read Model
class OrderReadModelUpdater(EventHandler):
    """Met à jour le Read Model à partir des événements."""

    def __init__(self, read_model: OrderReadModel):
        self.read_model = read_model

    async def handle(self, event: DomainEvent) -> None:
        handler_name = f"apply_{type(event).__name__}"
        handler_name = handler_name.replace("__", "_").lower()

        # Chercher la méthode correspondante
        if isinstance(event, OrderCreated):
            self.read_model.apply_order_created(event)
        elif isinstance(event, OrderItemAdded):
            self.read_model.apply_order_item_added(event)
        elif isinstance(event, OrderSubmitted):
            self.read_model.apply_order_submitted(event)
        elif isinstance(event, OrderConfirmed):
            self.read_model.apply_order_confirmed(event)
        elif isinstance(event, OrderCancelled):
            self.read_model.apply_order_cancelled(event)

        print(f"[ReadModel] Updated from {type(event).__name__}")
```

### 5. Application Complète

```python
async def main():
    print("=" * 60)
    print("CQRS Demo - Order Management System")
    print("=" * 60)

    # Setup
    message_bus = MessageBus()
    order_repository = OrderRepository()
    read_model = OrderReadModel()
    uow = InMemoryUnitOfWork(message_bus)

    # Register Command Handlers
    message_bus.register_command_handler(
        CreateOrder, CreateOrderHandler(order_repository, uow)
    )
    message_bus.register_command_handler(
        AddOrderItem, AddOrderItemHandler(order_repository, uow)
    )
    message_bus.register_command_handler(
        SubmitOrder, SubmitOrderHandler(order_repository, uow)
    )
    message_bus.register_command_handler(
        ConfirmOrder, ConfirmOrderHandler(order_repository, uow)
    )
    message_bus.register_command_handler(
        CancelOrder, CancelOrderHandler(order_repository, uow)
    )

    # Register Query Handlers
    message_bus.register_query_handler(
        GetOrderById, GetOrderByIdHandler(read_model)
    )
    message_bus.register_query_handler(
        GetCustomerOrders, GetCustomerOrdersHandler(read_model)
    )
    message_bus.register_query_handler(
        GetOrdersByStatus, GetOrdersByStatusHandler(read_model)
    )

    # Register Event Handlers (Read Model Sync)
    read_model_updater = OrderReadModelUpdater(read_model)
    message_bus.register_event_handler(OrderCreated, read_model_updater)
    message_bus.register_event_handler(OrderItemAdded, read_model_updater)
    message_bus.register_event_handler(OrderSubmitted, read_model_updater)
    message_bus.register_event_handler(OrderConfirmed, read_model_updater)
    message_bus.register_event_handler(OrderCancelled, read_model_updater)

    # === Command Side ===
    print("\n--- COMMAND SIDE ---\n")

    # Créer une commande
    order_id = await message_bus.send_command(
        CreateOrder(customer_id="CUST-001")
    )

    # Ajouter des articles
    await message_bus.send_command(AddOrderItem(
        order_id=order_id,
        product_id="PROD-001",
        product_name="Laptop",
        quantity=1,
        unit_price=999.99
    ))

    await message_bus.send_command(AddOrderItem(
        order_id=order_id,
        product_id="PROD-002",
        product_name="Mouse",
        quantity=2,
        unit_price=29.99
    ))

    # Soumettre la commande
    await message_bus.send_command(SubmitOrder(order_id=order_id))

    # Confirmer la commande
    await message_bus.send_command(ConfirmOrder(order_id=order_id))

    # Créer une deuxième commande
    order_id_2 = await message_bus.send_command(
        CreateOrder(customer_id="CUST-001")
    )

    await message_bus.send_command(AddOrderItem(
        order_id=order_id_2,
        product_id="PROD-003",
        product_name="Keyboard",
        quantity=1,
        unit_price=149.99
    ))

    # === Query Side ===
    print("\n--- QUERY SIDE ---\n")

    # Récupérer le détail d'une commande
    order_detail = await message_bus.send_query(GetOrderById(order_id=order_id))
    if order_detail:
        print(f"Order Detail: {order_detail.order_id}")
        print(f"  Status: {order_detail.status}")
        print(f"  Items: {len(order_detail.items)}")
        for item in order_detail.items:
            print(f"    - {item['product_name']}: {item['quantity']} x ${item['unit_price']}")
        print(f"  Total: ${order_detail.total_amount:.2f}")

    print()

    # Récupérer les commandes d'un client
    customer_orders = await message_bus.send_query(
        GetCustomerOrders(customer_id="CUST-001")
    )
    print(f"Customer Orders: {customer_orders.customer_id}")
    print(f"  Total Orders: {customer_orders.total_orders}")
    print(f"  Total Spent: ${customer_orders.total_spent:.2f}")
    for order in customer_orders.orders:
        print(f"    - {order.order_id}: {order.status} (${order.total_amount:.2f})")

    print()

    # Récupérer les commandes par status
    confirmed_orders = await message_bus.send_query(
        GetOrdersByStatus(status="CONFIRMED")
    )
    print(f"Confirmed Orders: {len(confirmed_orders)}")
    for order in confirmed_orders:
        print(f"  - {order.order_id}: ${order.total_amount:.2f}")

    draft_orders = await message_bus.send_query(
        GetOrdersByStatus(status="DRAFT")
    )
    print(f"\nDraft Orders: {len(draft_orders)}")
    for order in draft_orders:
        print(f"  - {order.order_id}: ${order.total_amount:.2f}")


if __name__ == "__main__":
    asyncio.run(main())
```

## Diagramme de Flux CQRS Complet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CQRS Data Flow                                  │
│                                                                              │
│  ┌────────────┐                                          ┌────────────┐     │
│  │   Client   │                                          │   Client   │     │
│  │  (Write)   │                                          │   (Read)   │     │
│  └──────┬─────┘                                          └──────┬─────┘     │
│         │ CreateOrder                                           │ GetOrder  │
│         │ AddItem                                               │ ListOrders│
│         ▼                                                       ▼           │
│  ┌─────────────────┐                                    ┌─────────────────┐ │
│  │  Command Bus    │                                    │   Query Bus     │ │
│  └────────┬────────┘                                    └────────┬────────┘ │
│           │                                                      │          │
│           ▼                                                      ▼          │
│  ┌─────────────────┐                                    ┌─────────────────┐ │
│  │ Command Handler │                                    │  Query Handler  │ │
│  │  - Validation   │                                    │  - Optimization │ │
│  │  - Business     │                                    │  - Caching      │ │
│  └────────┬────────┘                                    └────────┬────────┘ │
│           │                                                      │          │
│           ▼                                                      ▼          │
│  ┌─────────────────┐                                    ┌─────────────────┐ │
│  │  Domain Model   │                                    │   Read Model    │ │
│  │  (Aggregates)   │                                    │    (DTOs)       │ │
│  └────────┬────────┘                                    └────────┬────────┘ │
│           │                                                      ▲          │
│           │ Domain Events                                        │          │
│           ▼                                                      │          │
│  ┌─────────────────┐         ┌─────────────────┐                │          │
│  │   Write Store   │────────▶│  Event Handler  │────────────────┘          │
│  │  (Event Store)  │ Events  │  (Projector)    │  Update Read Model        │
│  └─────────────────┘         └─────────────────┘                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Avantages de CQRS

1. **Optimisation indépendante** - Read et Write peuvent être optimisés séparément
2. **Scalabilité** - Lecture et écriture peuvent scaler indépendamment
3. **Sécurité** - Séparation claire des responsabilités
4. **Complexité maîtrisée** - Chaque côté reste simple

## Quand utiliser CQRS

- Applications avec ratio lecture/écriture asymétrique
- Domaines complexes nécessitant des modèles de lecture optimisés
- Systèmes nécessitant un audit complet (avec Event Sourcing)
- Applications à haute disponibilité
