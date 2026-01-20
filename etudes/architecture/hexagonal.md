# Architecture Hexagonale (Ports & Adapters)

## Vue d'ensemble

L'architecture hexagonale isole le coeur métier (domaine) des préoccupations techniques via des ports (interfaces) et des adapters (implémentations).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Hexagonal Architecture                               │
│                                                                              │
│                          Primary Adapters                                    │
│                    (Driving/Input Adapters)                                  │
│         ┌───────────────┬───────────────┬───────────────┐                   │
│         │   REST API    │     CLI       │   GraphQL     │                   │
│         │   Adapter     │   Adapter     │   Adapter     │                   │
│         └───────┬───────┴───────┬───────┴───────┬───────┘                   │
│                 │               │               │                           │
│                 ▼               ▼               ▼                           │
│         ┌─────────────────────────────────────────────────┐                 │
│         │              Primary Ports                       │                 │
│         │         (Use Case Interfaces)                    │                 │
│         └─────────────────────┬───────────────────────────┘                 │
│                               │                                              │
│                               ▼                                              │
│         ┌─────────────────────────────────────────────────┐                 │
│         │                                                  │                 │
│         │              APPLICATION CORE                    │                 │
│         │                                                  │                 │
│         │   ┌─────────────────────────────────────────┐   │                 │
│         │   │           Domain Model                   │   │                 │
│         │   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │   │                 │
│         │   │  │Entities │  │  Value  │  │ Domain  │  │   │                 │
│         │   │  │         │  │ Objects │  │Services │  │   │                 │
│         │   │  └─────────┘  └─────────┘  └─────────┘  │   │                 │
│         │   └─────────────────────────────────────────┘   │                 │
│         │                                                  │                 │
│         │   ┌─────────────────────────────────────────┐   │                 │
│         │   │          Application Services            │   │                 │
│         │   │           (Use Cases)                    │   │                 │
│         │   └─────────────────────────────────────────┘   │                 │
│         │                                                  │                 │
│         └─────────────────────┬───────────────────────────┘                 │
│                               │                                              │
│                               ▼                                              │
│         ┌─────────────────────────────────────────────────┐                 │
│         │             Secondary Ports                      │                 │
│         │       (Repository/Gateway Interfaces)            │                 │
│         └─────────────────────┬───────────────────────────┘                 │
│                 │               │               │                           │
│                 ▼               ▼               ▼                           │
│         ┌───────────────┬───────────────┬───────────────┐                   │
│         │  PostgreSQL   │    Redis      │   RabbitMQ    │                   │
│         │   Adapter     │   Adapter     │   Adapter     │                   │
│         └───────────────┴───────────────┴───────────────┘                   │
│                         Secondary Adapters                                   │
│                    (Driven/Output Adapters)                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implémentation Complète

### 1. Domain Layer (Le Coeur)

```python
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
from abc import ABC, abstractmethod
from decimal import Decimal
import uuid
from enum import Enum


# Value Objects
@dataclass(frozen=True)
class Money:
    """Value Object représentant une somme d'argent."""
    amount: Decimal
    currency: str = "EUR"

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("Amount cannot be negative")

    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Cannot add different currencies")
        return Money(self.amount + other.amount, self.currency)

    def subtract(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Cannot subtract different currencies")
        return Money(self.amount - other.amount, self.currency)

    def multiply(self, factor: int) -> "Money":
        return Money(self.amount * factor, self.currency)

    def __str__(self) -> str:
        return f"{self.amount:.2f} {self.currency}"


@dataclass(frozen=True)
class Email:
    """Value Object représentant un email."""
    value: str

    def __post_init__(self):
        if not self.value or "@" not in self.value:
            raise ValueError(f"Invalid email: {self.value}")

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True)
class Address:
    """Value Object représentant une adresse."""
    street: str
    city: str
    postal_code: str
    country: str

    def __str__(self) -> str:
        return f"{self.street}, {self.postal_code} {self.city}, {self.country}"


@dataclass(frozen=True)
class ProductId:
    """Value Object pour l'identifiant produit."""
    value: str

    @classmethod
    def generate(cls) -> "ProductId":
        return cls(f"PROD-{uuid.uuid4().hex[:8].upper()}")


@dataclass(frozen=True)
class CustomerId:
    """Value Object pour l'identifiant client."""
    value: str

    @classmethod
    def generate(cls) -> "CustomerId":
        return cls(f"CUST-{uuid.uuid4().hex[:8].upper()}")


@dataclass(frozen=True)
class OrderId:
    """Value Object pour l'identifiant commande."""
    value: str

    @classmethod
    def generate(cls) -> "OrderId":
        return cls(f"ORD-{uuid.uuid4().hex[:8].upper()}")


# Domain Entities
class OrderStatus(Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


@dataclass
class OrderLine:
    """Entité ligne de commande."""
    product_id: ProductId
    product_name: str
    quantity: int
    unit_price: Money

    @property
    def total(self) -> Money:
        return self.unit_price.multiply(self.quantity)


class Order:
    """Agrégat Order - Entité racine."""

    def __init__(self, order_id: OrderId, customer_id: CustomerId):
        self._id = order_id
        self._customer_id = customer_id
        self._lines: List[OrderLine] = []
        self._status = OrderStatus.PENDING
        self._shipping_address: Optional[Address] = None
        self._created_at = datetime.utcnow()
        self._domain_events: List["DomainEvent"] = []

    @property
    def id(self) -> OrderId:
        return self._id

    @property
    def customer_id(self) -> CustomerId:
        return self._customer_id

    @property
    def status(self) -> OrderStatus:
        return self._status

    @property
    def lines(self) -> List[OrderLine]:
        return self._lines.copy()

    @property
    def total(self) -> Money:
        if not self._lines:
            return Money(Decimal("0"))
        return sum(
            (line.total for line in self._lines),
            Money(Decimal("0"))
        )

    def add_line(self, product_id: ProductId, product_name: str,
                 quantity: int, unit_price: Money) -> None:
        """Ajoute une ligne à la commande."""
        if self._status != OrderStatus.PENDING:
            raise DomainError("Cannot modify non-pending order")

        if quantity <= 0:
            raise DomainError("Quantity must be positive")

        # Vérifier si le produit existe déjà
        existing = next(
            (line for line in self._lines if line.product_id == product_id),
            None
        )

        if existing:
            # Mettre à jour la quantité
            idx = self._lines.index(existing)
            self._lines[idx] = OrderLine(
                product_id=product_id,
                product_name=product_name,
                quantity=existing.quantity + quantity,
                unit_price=unit_price
            )
        else:
            self._lines.append(OrderLine(
                product_id=product_id,
                product_name=product_name,
                quantity=quantity,
                unit_price=unit_price
            ))

        self._domain_events.append(OrderLineAdded(
            order_id=self._id,
            product_id=product_id,
            quantity=quantity
        ))

    def set_shipping_address(self, address: Address) -> None:
        """Définit l'adresse de livraison."""
        if self._status != OrderStatus.PENDING:
            raise DomainError("Cannot modify non-pending order")
        self._shipping_address = address

    def confirm(self) -> None:
        """Confirme la commande."""
        if self._status != OrderStatus.PENDING:
            raise DomainError("Order is not pending")

        if not self._lines:
            raise DomainError("Cannot confirm empty order")

        if not self._shipping_address:
            raise DomainError("Shipping address required")

        self._status = OrderStatus.CONFIRMED
        self._domain_events.append(OrderConfirmed(
            order_id=self._id,
            total=self.total
        ))

    def ship(self) -> None:
        """Marque la commande comme expédiée."""
        if self._status != OrderStatus.CONFIRMED:
            raise DomainError("Order must be confirmed first")

        self._status = OrderStatus.SHIPPED
        self._domain_events.append(OrderShipped(order_id=self._id))

    def deliver(self) -> None:
        """Marque la commande comme livrée."""
        if self._status != OrderStatus.SHIPPED:
            raise DomainError("Order must be shipped first")

        self._status = OrderStatus.DELIVERED
        self._domain_events.append(OrderDelivered(order_id=self._id))

    def cancel(self, reason: str) -> None:
        """Annule la commande."""
        if self._status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
            raise DomainError("Cannot cancel shipped or delivered order")

        self._status = OrderStatus.CANCELLED
        self._domain_events.append(OrderCancelled(
            order_id=self._id,
            reason=reason
        ))

    def get_domain_events(self) -> List["DomainEvent"]:
        """Récupère et vide les événements du domaine."""
        events = self._domain_events.copy()
        self._domain_events.clear()
        return events


class Customer:
    """Entité Customer."""

    def __init__(self, customer_id: CustomerId, name: str, email: Email):
        self._id = customer_id
        self._name = name
        self._email = email
        self._addresses: List[Address] = []
        self._created_at = datetime.utcnow()

    @property
    def id(self) -> CustomerId:
        return self._id

    @property
    def name(self) -> str:
        return self._name

    @property
    def email(self) -> Email:
        return self._email

    @property
    def addresses(self) -> List[Address]:
        return self._addresses.copy()

    def add_address(self, address: Address) -> None:
        if address not in self._addresses:
            self._addresses.append(address)

    def update_email(self, new_email: Email) -> None:
        self._email = new_email


# Domain Events
@dataclass
class DomainEvent:
    occurred_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class OrderLineAdded(DomainEvent):
    order_id: OrderId = None
    product_id: ProductId = None
    quantity: int = 0


@dataclass
class OrderConfirmed(DomainEvent):
    order_id: OrderId = None
    total: Money = None


@dataclass
class OrderShipped(DomainEvent):
    order_id: OrderId = None


@dataclass
class OrderDelivered(DomainEvent):
    order_id: OrderId = None


@dataclass
class OrderCancelled(DomainEvent):
    order_id: OrderId = None
    reason: str = ""


# Domain Exceptions
class DomainError(Exception):
    """Exception du domaine."""
    pass


# Domain Services
class PricingService:
    """Service de domaine pour le calcul des prix."""

    def calculate_discount(self, order: Order, customer: Customer) -> Money:
        """Calcule une réduction basée sur des règles métier."""
        total = order.total

        # Règle: 10% de réduction si plus de 5 articles
        total_quantity = sum(line.quantity for line in order.lines)
        if total_quantity > 5:
            discount_amount = total.amount * Decimal("0.10")
            return Money(discount_amount, total.currency)

        return Money(Decimal("0"), total.currency)
```

### 2. Ports (Interfaces)

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from dataclasses import dataclass


# Primary Ports (Input - Use Cases)
class CreateOrderUseCase(ABC):
    """Port primaire pour créer une commande."""

    @abstractmethod
    async def execute(self, customer_id: str) -> str:
        """Crée une commande et retourne son ID."""
        pass


class AddOrderLineUseCase(ABC):
    """Port primaire pour ajouter une ligne."""

    @abstractmethod
    async def execute(self, order_id: str, product_id: str,
                      product_name: str, quantity: int,
                      unit_price: float) -> None:
        pass


class ConfirmOrderUseCase(ABC):
    """Port primaire pour confirmer une commande."""

    @abstractmethod
    async def execute(self, order_id: str) -> None:
        pass


class GetOrderUseCase(ABC):
    """Port primaire pour récupérer une commande."""

    @dataclass
    class OrderDTO:
        order_id: str
        customer_id: str
        status: str
        lines: List[dict]
        total: float
        currency: str

    @abstractmethod
    async def execute(self, order_id: str) -> Optional["GetOrderUseCase.OrderDTO"]:
        pass


# Secondary Ports (Output - Infrastructure Interfaces)
class OrderRepository(ABC):
    """Port secondaire pour la persistence des commandes."""

    @abstractmethod
    async def save(self, order: Order) -> None:
        pass

    @abstractmethod
    async def get(self, order_id: OrderId) -> Optional[Order]:
        pass

    @abstractmethod
    async def get_by_customer(self, customer_id: CustomerId) -> List[Order]:
        pass


class CustomerRepository(ABC):
    """Port secondaire pour la persistence des clients."""

    @abstractmethod
    async def save(self, customer: Customer) -> None:
        pass

    @abstractmethod
    async def get(self, customer_id: CustomerId) -> Optional[Customer]:
        pass

    @abstractmethod
    async def get_by_email(self, email: Email) -> Optional[Customer]:
        pass


class EventPublisher(ABC):
    """Port secondaire pour la publication d'événements."""

    @abstractmethod
    async def publish(self, event: DomainEvent) -> None:
        pass

    @abstractmethod
    async def publish_all(self, events: List[DomainEvent]) -> None:
        pass


class NotificationService(ABC):
    """Port secondaire pour les notifications."""

    @abstractmethod
    async def send_order_confirmation(self, order: Order,
                                      customer: Customer) -> None:
        pass

    @abstractmethod
    async def send_shipping_notification(self, order: Order,
                                         customer: Customer) -> None:
        pass


class PaymentGateway(ABC):
    """Port secondaire pour les paiements."""

    @dataclass
    class PaymentResult:
        success: bool
        transaction_id: Optional[str] = None
        error_message: Optional[str] = None

    @abstractmethod
    async def process_payment(self, order: Order,
                              payment_method: str) -> "PaymentGateway.PaymentResult":
        pass
```

### 3. Application Services (Use Case Implementation)

```python
from typing import Optional, List
from decimal import Decimal


class CreateOrderService(CreateOrderUseCase):
    """Implémentation du use case CreateOrder."""

    def __init__(self, order_repository: OrderRepository,
                 customer_repository: CustomerRepository,
                 event_publisher: EventPublisher):
        self._order_repository = order_repository
        self._customer_repository = customer_repository
        self._event_publisher = event_publisher

    async def execute(self, customer_id: str) -> str:
        # Vérifier que le client existe
        customer = await self._customer_repository.get(CustomerId(customer_id))
        if not customer:
            raise ValueError(f"Customer {customer_id} not found")

        # Créer la commande
        order = Order(
            order_id=OrderId.generate(),
            customer_id=CustomerId(customer_id)
        )

        # Sauvegarder
        await self._order_repository.save(order)

        # Publier les événements
        events = order.get_domain_events()
        await self._event_publisher.publish_all(events)

        return order.id.value


class AddOrderLineService(AddOrderLineUseCase):
    """Implémentation du use case AddOrderLine."""

    def __init__(self, order_repository: OrderRepository,
                 event_publisher: EventPublisher):
        self._order_repository = order_repository
        self._event_publisher = event_publisher

    async def execute(self, order_id: str, product_id: str,
                      product_name: str, quantity: int,
                      unit_price: float) -> None:
        # Récupérer la commande
        order = await self._order_repository.get(OrderId(order_id))
        if not order:
            raise ValueError(f"Order {order_id} not found")

        # Ajouter la ligne
        order.add_line(
            product_id=ProductId(product_id),
            product_name=product_name,
            quantity=quantity,
            unit_price=Money(Decimal(str(unit_price)))
        )

        # Sauvegarder
        await self._order_repository.save(order)

        # Publier les événements
        events = order.get_domain_events()
        await self._event_publisher.publish_all(events)


class ConfirmOrderService(ConfirmOrderUseCase):
    """Implémentation du use case ConfirmOrder."""

    def __init__(self, order_repository: OrderRepository,
                 customer_repository: CustomerRepository,
                 payment_gateway: PaymentGateway,
                 notification_service: NotificationService,
                 event_publisher: EventPublisher):
        self._order_repository = order_repository
        self._customer_repository = customer_repository
        self._payment_gateway = payment_gateway
        self._notification_service = notification_service
        self._event_publisher = event_publisher

    async def execute(self, order_id: str) -> None:
        # Récupérer la commande
        order = await self._order_repository.get(OrderId(order_id))
        if not order:
            raise ValueError(f"Order {order_id} not found")

        # Récupérer le client
        customer = await self._customer_repository.get(order.customer_id)
        if not customer:
            raise ValueError(f"Customer not found")

        # Utiliser la première adresse comme adresse de livraison
        if customer.addresses:
            order.set_shipping_address(customer.addresses[0])
        else:
            raise ValueError("Customer has no address")

        # Traiter le paiement
        payment_result = await self._payment_gateway.process_payment(
            order, "credit_card"
        )

        if not payment_result.success:
            raise ValueError(f"Payment failed: {payment_result.error_message}")

        # Confirmer la commande
        order.confirm()

        # Sauvegarder
        await self._order_repository.save(order)

        # Publier les événements
        events = order.get_domain_events()
        await self._event_publisher.publish_all(events)

        # Envoyer la notification
        await self._notification_service.send_order_confirmation(order, customer)


class GetOrderService(GetOrderUseCase):
    """Implémentation du use case GetOrder."""

    def __init__(self, order_repository: OrderRepository):
        self._order_repository = order_repository

    async def execute(self, order_id: str) -> Optional[GetOrderUseCase.OrderDTO]:
        order = await self._order_repository.get(OrderId(order_id))
        if not order:
            return None

        return GetOrderUseCase.OrderDTO(
            order_id=order.id.value,
            customer_id=order.customer_id.value,
            status=order.status.value,
            lines=[
                {
                    "product_id": line.product_id.value,
                    "product_name": line.product_name,
                    "quantity": line.quantity,
                    "unit_price": float(line.unit_price.amount),
                    "total": float(line.total.amount)
                }
                for line in order.lines
            ],
            total=float(order.total.amount),
            currency=order.total.currency if order.lines else "EUR"
        )
```

### 4. Secondary Adapters (Infrastructure)

```python
from typing import Dict, List, Optional
import asyncio


# In-Memory Repository Adapter
class InMemoryOrderRepository(OrderRepository):
    """Adapter pour la persistence en mémoire."""

    def __init__(self):
        self._orders: Dict[str, Order] = {}

    async def save(self, order: Order) -> None:
        self._orders[order.id.value] = order

    async def get(self, order_id: OrderId) -> Optional[Order]:
        return self._orders.get(order_id.value)

    async def get_by_customer(self, customer_id: CustomerId) -> List[Order]:
        return [
            order for order in self._orders.values()
            if order.customer_id == customer_id
        ]


class InMemoryCustomerRepository(CustomerRepository):
    """Adapter pour la persistence des clients en mémoire."""

    def __init__(self):
        self._customers: Dict[str, Customer] = {}
        self._email_index: Dict[str, str] = {}

    async def save(self, customer: Customer) -> None:
        self._customers[customer.id.value] = customer
        self._email_index[str(customer.email)] = customer.id.value

    async def get(self, customer_id: CustomerId) -> Optional[Customer]:
        return self._customers.get(customer_id.value)

    async def get_by_email(self, email: Email) -> Optional[Customer]:
        customer_id = self._email_index.get(str(email))
        if customer_id:
            return self._customers.get(customer_id)
        return None


# Event Publisher Adapter
class ConsoleEventPublisher(EventPublisher):
    """Adapter qui publie les événements dans la console."""

    async def publish(self, event: DomainEvent) -> None:
        print(f"[Event Published] {event.__class__.__name__}: {event}")

    async def publish_all(self, events: List[DomainEvent]) -> None:
        for event in events:
            await self.publish(event)


class InMemoryEventPublisher(EventPublisher):
    """Adapter qui stocke les événements en mémoire."""

    def __init__(self):
        self._events: List[DomainEvent] = []
        self._handlers: Dict[type, List[callable]] = {}

    def subscribe(self, event_type: type, handler: callable) -> None:
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)

    async def publish(self, event: DomainEvent) -> None:
        self._events.append(event)
        handlers = self._handlers.get(type(event), [])
        for handler in handlers:
            await handler(event)

    async def publish_all(self, events: List[DomainEvent]) -> None:
        for event in events:
            await self.publish(event)

    def get_events(self) -> List[DomainEvent]:
        return self._events.copy()


# Notification Service Adapter
class ConsoleNotificationService(NotificationService):
    """Adapter qui affiche les notifications dans la console."""

    async def send_order_confirmation(self, order: Order,
                                      customer: Customer) -> None:
        print(f"[Email] Order confirmation sent to {customer.email}")
        print(f"  Order: {order.id.value}")
        print(f"  Total: {order.total}")

    async def send_shipping_notification(self, order: Order,
                                         customer: Customer) -> None:
        print(f"[Email] Shipping notification sent to {customer.email}")
        print(f"  Order: {order.id.value}")


# Payment Gateway Adapter (Mock)
class MockPaymentGateway(PaymentGateway):
    """Adapter mock pour les paiements."""

    def __init__(self, should_succeed: bool = True):
        self._should_succeed = should_succeed

    async def process_payment(self, order: Order,
                              payment_method: str) -> PaymentGateway.PaymentResult:
        await asyncio.sleep(0.1)  # Simuler la latence

        if self._should_succeed:
            return PaymentGateway.PaymentResult(
                success=True,
                transaction_id=f"TXN-{order.id.value}"
            )
        else:
            return PaymentGateway.PaymentResult(
                success=False,
                error_message="Payment declined"
            )


# PostgreSQL Adapter (exemple)
class PostgreSQLOrderRepository(OrderRepository):
    """Adapter pour PostgreSQL (exemple simplifié)."""

    def __init__(self, connection_string: str):
        self._connection_string = connection_string
        # En réalité: initialiser le pool de connexions

    async def save(self, order: Order) -> None:
        # En réalité: INSERT/UPDATE SQL
        print(f"[PostgreSQL] Saving order {order.id.value}")

    async def get(self, order_id: OrderId) -> Optional[Order]:
        # En réalité: SELECT SQL
        print(f"[PostgreSQL] Getting order {order_id.value}")
        return None

    async def get_by_customer(self, customer_id: CustomerId) -> List[Order]:
        # En réalité: SELECT SQL avec WHERE
        print(f"[PostgreSQL] Getting orders for customer {customer_id.value}")
        return []
```

### 5. Primary Adapters (Controllers)

```python
from dataclasses import dataclass
from typing import Optional
import json


# REST API Adapter
@dataclass
class HttpRequest:
    method: str
    path: str
    body: Optional[dict] = None
    headers: dict = None


@dataclass
class HttpResponse:
    status_code: int
    body: dict


class OrderController:
    """Adapter REST API pour les commandes."""

    def __init__(self, create_order: CreateOrderUseCase,
                 add_line: AddOrderLineUseCase,
                 confirm_order: ConfirmOrderUseCase,
                 get_order: GetOrderUseCase):
        self._create_order = create_order
        self._add_line = add_line
        self._confirm_order = confirm_order
        self._get_order = get_order

    async def handle_request(self, request: HttpRequest) -> HttpResponse:
        """Route les requêtes vers les use cases."""
        try:
            if request.method == "POST" and request.path == "/orders":
                return await self._handle_create_order(request)

            elif request.method == "POST" and "/orders/" in request.path and "/lines" in request.path:
                return await self._handle_add_line(request)

            elif request.method == "POST" and "/orders/" in request.path and "/confirm" in request.path:
                return await self._handle_confirm(request)

            elif request.method == "GET" and "/orders/" in request.path:
                return await self._handle_get_order(request)

            return HttpResponse(404, {"error": "Not found"})

        except ValueError as e:
            return HttpResponse(400, {"error": str(e)})
        except Exception as e:
            return HttpResponse(500, {"error": "Internal server error"})

    async def _handle_create_order(self, request: HttpRequest) -> HttpResponse:
        customer_id = request.body.get("customer_id")
        order_id = await self._create_order.execute(customer_id)
        return HttpResponse(201, {"order_id": order_id})

    async def _handle_add_line(self, request: HttpRequest) -> HttpResponse:
        # Extraire order_id du path
        parts = request.path.split("/")
        order_id = parts[2]

        await self._add_line.execute(
            order_id=order_id,
            product_id=request.body["product_id"],
            product_name=request.body["product_name"],
            quantity=request.body["quantity"],
            unit_price=request.body["unit_price"]
        )
        return HttpResponse(200, {"status": "ok"})

    async def _handle_confirm(self, request: HttpRequest) -> HttpResponse:
        parts = request.path.split("/")
        order_id = parts[2]

        await self._confirm_order.execute(order_id)
        return HttpResponse(200, {"status": "confirmed"})

    async def _handle_get_order(self, request: HttpRequest) -> HttpResponse:
        parts = request.path.split("/")
        order_id = parts[2]

        order = await self._get_order.execute(order_id)
        if order:
            return HttpResponse(200, {
                "order_id": order.order_id,
                "customer_id": order.customer_id,
                "status": order.status,
                "lines": order.lines,
                "total": order.total,
                "currency": order.currency
            })
        return HttpResponse(404, {"error": "Order not found"})


# CLI Adapter
class OrderCLI:
    """Adapter CLI pour les commandes."""

    def __init__(self, create_order: CreateOrderUseCase,
                 add_line: AddOrderLineUseCase,
                 get_order: GetOrderUseCase):
        self._create_order = create_order
        self._add_line = add_line
        self._get_order = get_order

    async def run(self, args: List[str]) -> str:
        if not args:
            return "Usage: order <command> [args]"

        command = args[0]

        if command == "create":
            customer_id = args[1] if len(args) > 1 else None
            if not customer_id:
                return "Usage: order create <customer_id>"
            order_id = await self._create_order.execute(customer_id)
            return f"Order created: {order_id}"

        elif command == "add-line":
            if len(args) < 6:
                return "Usage: order add-line <order_id> <product_id> <name> <qty> <price>"
            await self._add_line.execute(
                order_id=args[1],
                product_id=args[2],
                product_name=args[3],
                quantity=int(args[4]),
                unit_price=float(args[5])
            )
            return "Line added"

        elif command == "show":
            order_id = args[1] if len(args) > 1 else None
            if not order_id:
                return "Usage: order show <order_id>"
            order = await self._get_order.execute(order_id)
            if order:
                return f"Order: {order.order_id}\nStatus: {order.status}\nTotal: {order.total} {order.currency}"
            return "Order not found"

        return f"Unknown command: {command}"
```

### 6. Composition Root (Dependency Injection)

```python
async def main():
    print("=" * 60)
    print("Hexagonal Architecture Demo")
    print("=" * 60)

    # Infrastructure (Secondary Adapters)
    order_repository = InMemoryOrderRepository()
    customer_repository = InMemoryCustomerRepository()
    event_publisher = ConsoleEventPublisher()
    notification_service = ConsoleNotificationService()
    payment_gateway = MockPaymentGateway(should_succeed=True)

    # Application Services (Use Case Implementations)
    create_order_service = CreateOrderService(
        order_repository, customer_repository, event_publisher
    )
    add_line_service = AddOrderLineService(
        order_repository, event_publisher
    )
    confirm_order_service = ConfirmOrderService(
        order_repository, customer_repository,
        payment_gateway, notification_service, event_publisher
    )
    get_order_service = GetOrderService(order_repository)

    # Primary Adapter (REST Controller)
    controller = OrderController(
        create_order_service,
        add_line_service,
        confirm_order_service,
        get_order_service
    )

    # Setup: Create a customer
    customer = Customer(
        customer_id=CustomerId("CUST-001"),
        name="John Doe",
        email=Email("john@example.com")
    )
    customer.add_address(Address(
        street="123 Main St",
        city="Paris",
        postal_code="75001",
        country="France"
    ))
    await customer_repository.save(customer)

    print("\n--- Simulating REST API Calls ---\n")

    # Create order
    response = await controller.handle_request(HttpRequest(
        method="POST",
        path="/orders",
        body={"customer_id": "CUST-001"}
    ))
    print(f"POST /orders -> {response.status_code}: {response.body}")
    order_id = response.body["order_id"]

    # Add lines
    response = await controller.handle_request(HttpRequest(
        method="POST",
        path=f"/orders/{order_id}/lines",
        body={
            "product_id": "PROD-001",
            "product_name": "Laptop",
            "quantity": 1,
            "unit_price": 999.99
        }
    ))
    print(f"POST /orders/{order_id}/lines -> {response.status_code}")

    response = await controller.handle_request(HttpRequest(
        method="POST",
        path=f"/orders/{order_id}/lines",
        body={
            "product_id": "PROD-002",
            "product_name": "Mouse",
            "quantity": 2,
            "unit_price": 29.99
        }
    ))
    print(f"POST /orders/{order_id}/lines -> {response.status_code}")

    # Get order before confirmation
    response = await controller.handle_request(HttpRequest(
        method="GET",
        path=f"/orders/{order_id}"
    ))
    print(f"GET /orders/{order_id} -> {response.status_code}: {json.dumps(response.body, indent=2)}")

    # Confirm order
    response = await controller.handle_request(HttpRequest(
        method="POST",
        path=f"/orders/{order_id}/confirm"
    ))
    print(f"POST /orders/{order_id}/confirm -> {response.status_code}")

    # Get order after confirmation
    response = await controller.handle_request(HttpRequest(
        method="GET",
        path=f"/orders/{order_id}"
    ))
    print(f"GET /orders/{order_id} -> {response.status_code}: {json.dumps(response.body, indent=2)}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

## Règles de Dépendance

```
┌──────────────────────────────────────────────────────────────┐
│                    Dependency Rules                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Adapters Layer                        │ │
│  │  - Can depend on Application & Domain                    │ │
│  │  - Implements Ports                                      │ │
│  └────────────────────────┬────────────────────────────────┘ │
│                           │                                   │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  Application Layer                       │ │
│  │  - Can depend on Domain only                             │ │
│  │  - Implements Use Cases                                  │ │
│  │  - Uses Ports (interfaces)                               │ │
│  └────────────────────────┬────────────────────────────────┘ │
│                           │                                   │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Domain Layer                          │ │
│  │  - No external dependencies                              │ │
│  │  - Contains business logic                               │ │
│  │  - Defines Ports (interfaces)                            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Arrow direction = Dependency direction                       │
│  Inner layers have NO knowledge of outer layers              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Avantages

1. **Testabilité** - Le domaine peut être testé isolément
2. **Flexibilité** - Les adapters sont interchangeables
3. **Indépendance** - Le métier ne dépend pas de la technique
4. **Maintenabilité** - Séparation claire des responsabilités

## Quand Utiliser

- Applications avec logique métier complexe
- Projets à long terme nécessitant évolutivité
- Systèmes devant supporter plusieurs interfaces
- Équipes pratiquant le DDD
