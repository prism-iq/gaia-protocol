# Domain-Driven Design (DDD)

## Vue d'ensemble

Le Domain-Driven Design est une approche de développement logiciel centrée sur le domaine métier. Elle vise à créer un modèle qui reflète fidèlement la complexité du domaine.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DDD Strategic Design                                 │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Problem Space                                │    │
│  │                                                                      │    │
│  │    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │    │
│  │    │  Subdomain   │    │  Subdomain   │    │  Subdomain   │        │    │
│  │    │    Core      │    │  Supporting  │    │   Generic    │        │    │
│  │    │  (Orders)    │    │ (Inventory)  │    │ (Payments)   │        │    │
│  │    └──────────────┘    └──────────────┘    └──────────────┘        │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Solution Space                                │    │
│  │                                                                      │    │
│  │    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │    │
│  │    │   Bounded    │    │   Bounded    │    │   Bounded    │        │    │
│  │    │   Context    │◀──▶│   Context    │◀──▶│   Context    │        │    │
│  │    │   (Orders)   │    │ (Inventory)  │    │ (Payments)   │        │    │
│  │    └──────────────┘    └──────────────┘    └──────────────┘        │    │
│  │           │                                       │                 │    │
│  │           └───────────────────────────────────────┘                 │    │
│  │                    Context Mapping                                   │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Tactical Patterns:
══════════════════

  ┌─────────────────────────────────────────────────────────────────────┐
  │                      Bounded Context                                 │
  │                                                                      │
  │   ┌─────────────────────────────────────────────────────────────┐  │
  │   │                    Aggregate                                 │  │
  │   │  ┌────────────────┐                                         │  │
  │   │  │  Aggregate     │  ┌─────────────┐  ┌─────────────┐      │  │
  │   │  │    Root        │◀─│   Entity    │  │   Entity    │      │  │
  │   │  │   (Order)      │  └─────────────┘  └─────────────┘      │  │
  │   │  └────────────────┘                                         │  │
  │   │         │                                                    │  │
  │   │         ▼                                                    │  │
  │   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │  │
  │   │  │Value Object │  │Value Object │  │Value Object │         │  │
  │   │  │ (OrderId)   │  │  (Money)    │  │ (Address)   │         │  │
  │   │  └─────────────┘  └─────────────┘  └─────────────┘         │  │
  │   └─────────────────────────────────────────────────────────────┘  │
  │                                                                      │
  │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
  │   │ Domain Service  │  │   Repository    │  │  Domain Event   │    │
  │   └─────────────────┘  └─────────────────┘  └─────────────────┘    │
  │                                                                      │
  └─────────────────────────────────────────────────────────────────────┘
```

## Implémentation Complète

### 1. Value Objects

```python
from dataclasses import dataclass
from typing import Any, Optional
from decimal import Decimal
from datetime import datetime
import re
import hashlib


@dataclass(frozen=True)
class ValueObject:
    """Classe de base pour les Value Objects."""

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        return self.__dict__ == other.__dict__

    def __hash__(self) -> int:
        return hash(tuple(sorted(self.__dict__.items())))


@dataclass(frozen=True)
class Email(ValueObject):
    """Value Object représentant un email."""
    value: str

    def __post_init__(self):
        if not self._is_valid(self.value):
            raise ValueError(f"Invalid email: {self.value}")

    @staticmethod
    def _is_valid(email: str) -> bool:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    @property
    def domain(self) -> str:
        return self.value.split('@')[1]


@dataclass(frozen=True)
class Money(ValueObject):
    """Value Object représentant une somme d'argent."""
    amount: Decimal
    currency: str = "EUR"

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("Amount cannot be negative")
        if len(self.currency) != 3:
            raise ValueError("Currency must be 3 characters (ISO 4217)")

    def add(self, other: "Money") -> "Money":
        self._ensure_same_currency(other)
        return Money(self.amount + other.amount, self.currency)

    def subtract(self, other: "Money") -> "Money":
        self._ensure_same_currency(other)
        new_amount = self.amount - other.amount
        if new_amount < 0:
            raise ValueError("Result would be negative")
        return Money(new_amount, self.currency)

    def multiply(self, factor: int) -> "Money":
        return Money(self.amount * factor, self.currency)

    def _ensure_same_currency(self, other: "Money") -> None:
        if self.currency != other.currency:
            raise ValueError(f"Cannot operate on different currencies: "
                           f"{self.currency} vs {other.currency}")

    def __str__(self) -> str:
        return f"{self.amount:.2f} {self.currency}"


@dataclass(frozen=True)
class Address(ValueObject):
    """Value Object représentant une adresse."""
    street: str
    city: str
    postal_code: str
    country: str

    def __post_init__(self):
        if not all([self.street, self.city, self.postal_code, self.country]):
            raise ValueError("All address fields are required")

    def format(self) -> str:
        return f"{self.street}\n{self.postal_code} {self.city}\n{self.country}"


@dataclass(frozen=True)
class CustomerId(ValueObject):
    """Identity Value Object pour Customer."""
    value: str

    def __post_init__(self):
        if not self.value or not self.value.startswith("CUST-"):
            raise ValueError(f"Invalid customer ID: {self.value}")

    @classmethod
    def generate(cls) -> "CustomerId":
        import uuid
        return cls(f"CUST-{uuid.uuid4().hex[:8].upper()}")


@dataclass(frozen=True)
class OrderId(ValueObject):
    """Identity Value Object pour Order."""
    value: str

    def __post_init__(self):
        if not self.value or not self.value.startswith("ORD-"):
            raise ValueError(f"Invalid order ID: {self.value}")

    @classmethod
    def generate(cls) -> "OrderId":
        import uuid
        return cls(f"ORD-{uuid.uuid4().hex[:8].upper()}")


@dataclass(frozen=True)
class ProductId(ValueObject):
    """Identity Value Object pour Product."""
    value: str

    @classmethod
    def generate(cls) -> "ProductId":
        import uuid
        return cls(f"PROD-{uuid.uuid4().hex[:8].upper()}")


@dataclass(frozen=True)
class Quantity(ValueObject):
    """Value Object pour les quantités."""
    value: int

    def __post_init__(self):
        if self.value < 0:
            raise ValueError("Quantity cannot be negative")

    def add(self, other: "Quantity") -> "Quantity":
        return Quantity(self.value + other.value)

    def subtract(self, other: "Quantity") -> "Quantity":
        if other.value > self.value:
            raise ValueError("Cannot subtract: would result in negative quantity")
        return Quantity(self.value - other.value)

    def is_zero(self) -> bool:
        return self.value == 0
```

### 2. Entities et Aggregates

```python
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class Entity(ABC):
    """Classe de base pour les entités."""

    def __init__(self, entity_id: ValueObject):
        self._id = entity_id
        self._created_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

    @property
    def id(self) -> ValueObject:
        return self._id

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        return self._id == other._id

    def __hash__(self) -> int:
        return hash(self._id)


class AggregateRoot(Entity):
    """Classe de base pour les racines d'agrégat."""

    def __init__(self, entity_id: ValueObject):
        super().__init__(entity_id)
        self._domain_events: List["DomainEvent"] = []
        self._version: int = 0

    def add_domain_event(self, event: "DomainEvent") -> None:
        self._domain_events.append(event)

    def clear_domain_events(self) -> List["DomainEvent"]:
        events = self._domain_events.copy()
        self._domain_events.clear()
        return events

    @property
    def version(self) -> int:
        return self._version


# Domain Events
class DomainEvent:
    """Classe de base pour les événements du domaine."""

    def __init__(self, aggregate_id: ValueObject):
        self.event_id = f"EVT-{datetime.utcnow().timestamp()}"
        self.aggregate_id = aggregate_id
        self.occurred_at = datetime.utcnow()


class OrderCreated(DomainEvent):
    def __init__(self, order_id: OrderId, customer_id: CustomerId):
        super().__init__(order_id)
        self.customer_id = customer_id


class OrderLineAdded(DomainEvent):
    def __init__(self, order_id: OrderId, product_id: ProductId,
                 quantity: Quantity, unit_price: Money):
        super().__init__(order_id)
        self.product_id = product_id
        self.quantity = quantity
        self.unit_price = unit_price


class OrderSubmitted(DomainEvent):
    def __init__(self, order_id: OrderId, total: Money):
        super().__init__(order_id)
        self.total = total


class OrderConfirmed(DomainEvent):
    def __init__(self, order_id: OrderId):
        super().__init__(order_id)


class OrderShipped(DomainEvent):
    def __init__(self, order_id: OrderId, tracking_number: str):
        super().__init__(order_id)
        self.tracking_number = tracking_number


class OrderCancelled(DomainEvent):
    def __init__(self, order_id: OrderId, reason: str):
        super().__init__(order_id)
        self.reason = reason


# Order Aggregate
class OrderStatus(Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    CONFIRMED = "CONFIRMED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class OrderLine(Entity):
    """Entité ligne de commande (fait partie de l'agrégat Order)."""

    def __init__(self, line_id: str, product_id: ProductId,
                 product_name: str, quantity: Quantity, unit_price: Money):
        super().__init__(ValueObject())  # Simplified
        self._line_id = line_id
        self._product_id = product_id
        self._product_name = product_name
        self._quantity = quantity
        self._unit_price = unit_price

    @property
    def product_id(self) -> ProductId:
        return self._product_id

    @property
    def product_name(self) -> str:
        return self._product_name

    @property
    def quantity(self) -> Quantity:
        return self._quantity

    @property
    def unit_price(self) -> Money:
        return self._unit_price

    @property
    def total(self) -> Money:
        return self._unit_price.multiply(self._quantity.value)

    def update_quantity(self, new_quantity: Quantity) -> None:
        self._quantity = new_quantity


class Order(AggregateRoot):
    """Agrégat Order - Racine d'agrégat."""

    def __init__(self, order_id: OrderId, customer_id: CustomerId):
        super().__init__(order_id)
        self._customer_id = customer_id
        self._lines: Dict[str, OrderLine] = {}
        self._status = OrderStatus.DRAFT
        self._shipping_address: Optional[Address] = None
        self._submitted_at: Optional[datetime] = None
        self._tracking_number: Optional[str] = None

        self.add_domain_event(OrderCreated(order_id, customer_id))

    @classmethod
    def create(cls, customer_id: CustomerId) -> "Order":
        """Factory method pour créer une commande."""
        return cls(OrderId.generate(), customer_id)

    @property
    def customer_id(self) -> CustomerId:
        return self._customer_id

    @property
    def status(self) -> OrderStatus:
        return self._status

    @property
    def lines(self) -> List[OrderLine]:
        return list(self._lines.values())

    @property
    def total(self) -> Money:
        if not self._lines:
            return Money(Decimal("0"))

        total = Money(Decimal("0"))
        for line in self._lines.values():
            total = total.add(line.total)
        return total

    def add_line(self, product_id: ProductId, product_name: str,
                 quantity: Quantity, unit_price: Money) -> None:
        """Ajoute ou met à jour une ligne de commande."""
        self._ensure_draft_status()

        key = product_id.value
        if key in self._lines:
            existing = self._lines[key]
            new_quantity = existing.quantity.add(quantity)
            existing.update_quantity(new_quantity)
        else:
            line_id = f"{self._id.value}-{len(self._lines) + 1}"
            self._lines[key] = OrderLine(
                line_id, product_id, product_name, quantity, unit_price
            )

        self.add_domain_event(OrderLineAdded(
            self._id, product_id, quantity, unit_price
        ))

    def remove_line(self, product_id: ProductId) -> None:
        """Supprime une ligne de commande."""
        self._ensure_draft_status()

        key = product_id.value
        if key not in self._lines:
            raise DomainException(f"Product {product_id.value} not in order")

        del self._lines[key]

    def set_shipping_address(self, address: Address) -> None:
        """Définit l'adresse de livraison."""
        self._ensure_draft_status()
        self._shipping_address = address

    def submit(self) -> None:
        """Soumet la commande."""
        self._ensure_draft_status()

        if not self._lines:
            raise DomainException("Cannot submit empty order")

        if not self._shipping_address:
            raise DomainException("Shipping address is required")

        self._status = OrderStatus.SUBMITTED
        self._submitted_at = datetime.utcnow()

        self.add_domain_event(OrderSubmitted(self._id, self.total))

    def confirm(self) -> None:
        """Confirme la commande (après paiement)."""
        if self._status != OrderStatus.SUBMITTED:
            raise DomainException("Order must be submitted first")

        self._status = OrderStatus.CONFIRMED
        self.add_domain_event(OrderConfirmed(self._id))

    def ship(self, tracking_number: str) -> None:
        """Expédie la commande."""
        if self._status != OrderStatus.CONFIRMED:
            raise DomainException("Order must be confirmed first")

        self._status = OrderStatus.SHIPPED
        self._tracking_number = tracking_number

        self.add_domain_event(OrderShipped(self._id, tracking_number))

    def deliver(self) -> None:
        """Marque comme livrée."""
        if self._status != OrderStatus.SHIPPED:
            raise DomainException("Order must be shipped first")

        self._status = OrderStatus.DELIVERED

    def cancel(self, reason: str) -> None:
        """Annule la commande."""
        if self._status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
            raise DomainException("Cannot cancel shipped or delivered order")

        self._status = OrderStatus.CANCELLED
        self.add_domain_event(OrderCancelled(self._id, reason))

    def _ensure_draft_status(self) -> None:
        if self._status != OrderStatus.DRAFT:
            raise DomainException("Order can only be modified in draft status")


class DomainException(Exception):
    """Exception du domaine."""
    pass
```

### 3. Domain Services

```python
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import List


class PricingPolicy(ABC):
    """Interface pour les politiques de prix."""

    @abstractmethod
    def calculate_discount(self, order: Order) -> Money:
        pass


class StandardPricingPolicy(PricingPolicy):
    """Politique de prix standard."""

    def calculate_discount(self, order: Order) -> Money:
        return Money(Decimal("0"), order.total.currency)


class VolumeDiscountPolicy(PricingPolicy):
    """Politique de réduction sur volume."""

    def __init__(self, threshold: int, discount_percent: Decimal):
        self._threshold = threshold
        self._discount_percent = discount_percent

    def calculate_discount(self, order: Order) -> Money:
        total_quantity = sum(line.quantity.value for line in order.lines)

        if total_quantity >= self._threshold:
            discount = order.total.amount * (self._discount_percent / 100)
            return Money(discount, order.total.currency)

        return Money(Decimal("0"), order.total.currency)


class LoyaltyDiscountPolicy(PricingPolicy):
    """Politique de réduction fidélité."""

    def __init__(self, customer_repository: "CustomerRepository"):
        self._customer_repository = customer_repository

    def calculate_discount(self, order: Order) -> Money:
        # Logique basée sur l'historique client
        # Simplifié pour l'exemple
        return Money(Decimal("0"), order.total.currency)


class OrderPricingService:
    """Domain Service pour le calcul des prix."""

    def __init__(self, policies: List[PricingPolicy]):
        self._policies = policies

    def calculate_final_price(self, order: Order) -> Money:
        """Calcule le prix final avec toutes les réductions."""
        total = order.total
        total_discount = Money(Decimal("0"), total.currency)

        for policy in self._policies:
            discount = policy.calculate_discount(order)
            total_discount = total_discount.add(discount)

        return total.subtract(total_discount)


class OrderValidationService:
    """Domain Service pour la validation des commandes."""

    def __init__(self, inventory_service: "InventoryService"):
        self._inventory_service = inventory_service

    async def validate_order(self, order: Order) -> List[str]:
        """Valide une commande et retourne les erreurs."""
        errors = []

        # Vérifier la disponibilité des produits
        for line in order.lines:
            available = await self._inventory_service.check_availability(
                line.product_id, line.quantity
            )
            if not available:
                errors.append(
                    f"Product {line.product_name} not available in quantity {line.quantity.value}"
                )

        return errors


class ShippingCostCalculator:
    """Domain Service pour le calcul des frais de livraison."""

    def calculate(self, order: Order, destination: Address) -> Money:
        """Calcule les frais de livraison."""
        base_cost = Decimal("5.99")

        # Coût par article
        item_cost = Decimal("0.50") * sum(
            line.quantity.value for line in order.lines
        )

        # Supplément international
        if destination.country != "France":
            base_cost += Decimal("10.00")

        # Livraison gratuite au-delà de 50 EUR
        if order.total.amount >= Decimal("50.00"):
            return Money(Decimal("0"), order.total.currency)

        return Money(base_cost + item_cost, order.total.currency)
```

### 4. Repositories

```python
from abc import ABC, abstractmethod
from typing import List, Optional


class Repository(ABC):
    """Interface de base pour les repositories."""
    pass


class OrderRepository(Repository):
    """Repository pour les commandes."""

    @abstractmethod
    async def save(self, order: Order) -> None:
        pass

    @abstractmethod
    async def get(self, order_id: OrderId) -> Optional[Order]:
        pass

    @abstractmethod
    async def get_by_customer(self, customer_id: CustomerId) -> List[Order]:
        pass

    @abstractmethod
    async def delete(self, order_id: OrderId) -> None:
        pass


class CustomerRepository(Repository):
    """Repository pour les clients."""

    @abstractmethod
    async def save(self, customer: "Customer") -> None:
        pass

    @abstractmethod
    async def get(self, customer_id: CustomerId) -> Optional["Customer"]:
        pass

    @abstractmethod
    async def get_by_email(self, email: Email) -> Optional["Customer"]:
        pass


# In-Memory Implementation
class InMemoryOrderRepository(OrderRepository):
    """Implémentation en mémoire du repository."""

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

    async def delete(self, order_id: OrderId) -> None:
        if order_id.value in self._orders:
            del self._orders[order_id.value]
```

### 5. Application Services (Use Cases)

```python
from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateOrderCommand:
    customer_id: str
    items: List[Dict[str, Any]]
    shipping_address: Dict[str, str]


@dataclass
class CreateOrderResult:
    order_id: str
    total: float
    currency: str


class CreateOrderUseCase:
    """Use case pour créer une commande."""

    def __init__(self, order_repository: OrderRepository,
                 customer_repository: CustomerRepository,
                 pricing_service: OrderPricingService,
                 event_publisher: "EventPublisher"):
        self._order_repo = order_repository
        self._customer_repo = customer_repository
        self._pricing_service = pricing_service
        self._event_publisher = event_publisher

    async def execute(self, command: CreateOrderCommand) -> CreateOrderResult:
        # Vérifier que le client existe
        customer_id = CustomerId(command.customer_id)
        customer = await self._customer_repo.get(customer_id)
        if not customer:
            raise DomainException(f"Customer {command.customer_id} not found")

        # Créer la commande
        order = Order.create(customer_id)

        # Ajouter les lignes
        for item in command.items:
            order.add_line(
                product_id=ProductId(item["product_id"]),
                product_name=item["name"],
                quantity=Quantity(item["quantity"]),
                unit_price=Money(Decimal(str(item["price"])))
            )

        # Définir l'adresse
        address = Address(
            street=command.shipping_address["street"],
            city=command.shipping_address["city"],
            postal_code=command.shipping_address["postal_code"],
            country=command.shipping_address["country"]
        )
        order.set_shipping_address(address)

        # Calculer le prix final
        final_price = self._pricing_service.calculate_final_price(order)

        # Sauvegarder
        await self._order_repo.save(order)

        # Publier les événements
        events = order.clear_domain_events()
        for event in events:
            await self._event_publisher.publish(event)

        return CreateOrderResult(
            order_id=order.id.value,
            total=float(final_price.amount),
            currency=final_price.currency
        )


@dataclass
class SubmitOrderCommand:
    order_id: str


class SubmitOrderUseCase:
    """Use case pour soumettre une commande."""

    def __init__(self, order_repository: OrderRepository,
                 validation_service: OrderValidationService,
                 event_publisher: "EventPublisher"):
        self._order_repo = order_repository
        self._validation_service = validation_service
        self._event_publisher = event_publisher

    async def execute(self, command: SubmitOrderCommand) -> None:
        # Récupérer la commande
        order_id = OrderId(command.order_id)
        order = await self._order_repo.get(order_id)

        if not order:
            raise DomainException(f"Order {command.order_id} not found")

        # Valider
        errors = await self._validation_service.validate_order(order)
        if errors:
            raise DomainException(f"Validation failed: {', '.join(errors)}")

        # Soumettre
        order.submit()

        # Sauvegarder
        await self._order_repo.save(order)

        # Publier les événements
        events = order.clear_domain_events()
        for event in events:
            await self._event_publisher.publish(event)
```

### 6. Bounded Context et Context Mapping

```python
# Anti-Corruption Layer
class ExternalPaymentGateway:
    """Passerelle de paiement externe."""

    async def charge(self, card_token: str, amount_cents: int,
                    currency: str) -> Dict[str, Any]:
        # Simule un appel externe
        return {
            "transaction_id": "ext-txn-123",
            "status": "completed",
            "charged_amount": amount_cents
        }


class PaymentACL:
    """Anti-Corruption Layer pour les paiements."""

    def __init__(self, external_gateway: ExternalPaymentGateway):
        self._gateway = external_gateway

    async def process_payment(self, order: Order,
                             payment_method: str) -> "PaymentResult":
        """Adapte le modèle externe au modèle du domaine."""
        # Convertir Money en cents
        amount_cents = int(order.total.amount * 100)

        # Appeler le service externe
        external_result = await self._gateway.charge(
            card_token=payment_method,
            amount_cents=amount_cents,
            currency=order.total.currency
        )

        # Traduire le résultat
        return PaymentResult(
            transaction_id=PaymentTransactionId(external_result["transaction_id"]),
            success=external_result["status"] == "completed",
            amount=order.total
        )


@dataclass(frozen=True)
class PaymentTransactionId(ValueObject):
    value: str


@dataclass
class PaymentResult:
    transaction_id: PaymentTransactionId
    success: bool
    amount: Money


# Shared Kernel Example
class SharedKernel:
    """Éléments partagés entre bounded contexts."""

    # Types partagés
    Money = Money
    Address = Address

    # Événements partagés
    @dataclass
    class OrderPaid(DomainEvent):
        order_id: str
        amount: Money
        transaction_id: str


# Context Map Relationships
"""
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Context Map                                        │
│                                                                              │
│   ┌──────────────┐                              ┌──────────────┐            │
│   │    Orders    │                              │   Shipping   │            │
│   │   Context    │───── Customer/Supplier ─────▶│   Context    │            │
│   │  (Upstream)  │                              │ (Downstream) │            │
│   └──────────────┘                              └──────────────┘            │
│          │                                                                   │
│          │ Shared Kernel                                                     │
│          │ (Money, Address)                                                  │
│          ▼                                                                   │
│   ┌──────────────┐                              ┌──────────────┐            │
│   │   Payments   │◀──── Conformist ────────────│   External   │            │
│   │   Context    │                              │   Gateway    │            │
│   │              │        ACL                   │              │            │
│   └──────────────┘                              └──────────────┘            │
│                                                                              │
│   Relationship Types:                                                        │
│   ─────────────────                                                         │
│   • Customer/Supplier: Upstream provides, downstream consumes               │
│   • Shared Kernel: Common code/models                                       │
│   • Conformist: Downstream conforms to upstream model                       │
│   • ACL: Anti-corruption layer protects domain                              │
│   • Open Host Service: API published for multiple consumers                 │
│   • Published Language: Standard communication format                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
"""
```

### 7. Application Complète

```python
import asyncio
from decimal import Decimal


# Customer Aggregate (simplifié)
class Customer(AggregateRoot):
    def __init__(self, customer_id: CustomerId, name: str, email: Email):
        super().__init__(customer_id)
        self._name = name
        self._email = email
        self._addresses: List[Address] = []

    @property
    def name(self) -> str:
        return self._name

    @property
    def email(self) -> Email:
        return self._email

    def add_address(self, address: Address) -> None:
        self._addresses.append(address)


class InMemoryCustomerRepository(CustomerRepository):
    def __init__(self):
        self._customers: Dict[str, Customer] = {}
        self._email_index: Dict[str, str] = {}

    async def save(self, customer: Customer) -> None:
        self._customers[customer.id.value] = customer
        self._email_index[customer.email.value] = customer.id.value

    async def get(self, customer_id: CustomerId) -> Optional[Customer]:
        return self._customers.get(customer_id.value)

    async def get_by_email(self, email: Email) -> Optional[Customer]:
        cid = self._email_index.get(email.value)
        return self._customers.get(cid) if cid else None


class ConsoleEventPublisher:
    async def publish(self, event: DomainEvent) -> None:
        print(f"[Event] {event.__class__.__name__}: {event.aggregate_id.value}")


class MockInventoryService:
    async def check_availability(self, product_id: ProductId,
                                quantity: Quantity) -> bool:
        return True  # Toujours disponible pour la démo


async def main():
    print("=" * 70)
    print("Domain-Driven Design Demo")
    print("=" * 70)

    # Setup repositories
    order_repo = InMemoryOrderRepository()
    customer_repo = InMemoryCustomerRepository()
    event_publisher = ConsoleEventPublisher()

    # Setup domain services
    pricing_service = OrderPricingService([
        StandardPricingPolicy(),
        VolumeDiscountPolicy(threshold=5, discount_percent=Decimal("10"))
    ])

    validation_service = OrderValidationService(MockInventoryService())

    # Setup use cases
    create_order_use_case = CreateOrderUseCase(
        order_repo, customer_repo, pricing_service, event_publisher
    )
    submit_order_use_case = SubmitOrderUseCase(
        order_repo, validation_service, event_publisher
    )

    # Create a customer
    customer = Customer(
        CustomerId("CUST-00000001"),
        "Alice Martin",
        Email("alice@example.com")
    )
    customer.add_address(Address(
        street="123 Rue de la Paix",
        city="Paris",
        postal_code="75001",
        country="France"
    ))
    await customer_repo.save(customer)

    print("\n--- Creating Order ---\n")

    # Create an order
    result = await create_order_use_case.execute(CreateOrderCommand(
        customer_id="CUST-00000001",
        items=[
            {"product_id": "PROD-001", "name": "Laptop", "quantity": 1, "price": "999.99"},
            {"product_id": "PROD-002", "name": "Mouse", "quantity": 2, "price": "29.99"},
            {"product_id": "PROD-003", "name": "Keyboard", "quantity": 1, "price": "79.99"}
        ],
        shipping_address={
            "street": "123 Rue de la Paix",
            "city": "Paris",
            "postal_code": "75001",
            "country": "France"
        }
    ))

    print(f"\nOrder created: {result.order_id}")
    print(f"Total: {result.total} {result.currency}")

    print("\n--- Order Details ---\n")

    order = await order_repo.get(OrderId(result.order_id))
    if order:
        print(f"Order ID: {order.id.value}")
        print(f"Status: {order.status.value}")
        print(f"Customer: {order.customer_id.value}")
        print("Lines:")
        for line in order.lines:
            print(f"  - {line.product_name}: {line.quantity.value} x {line.unit_price} = {line.total}")
        print(f"Total: {order.total}")

    print("\n--- Submitting Order ---\n")

    await submit_order_use_case.execute(SubmitOrderCommand(
        order_id=result.order_id
    ))

    order = await order_repo.get(OrderId(result.order_id))
    print(f"New status: {order.status.value}")

    print("\n--- Domain Concepts Summary ---\n")
    print("""
    Value Objects:
    - Email, Money, Address, CustomerId, OrderId, ProductId, Quantity

    Entities:
    - OrderLine (child entity)

    Aggregates:
    - Order (root), Customer (root)

    Domain Events:
    - OrderCreated, OrderLineAdded, OrderSubmitted, OrderConfirmed...

    Domain Services:
    - OrderPricingService, OrderValidationService, ShippingCostCalculator

    Repositories:
    - OrderRepository, CustomerRepository

    Application Services:
    - CreateOrderUseCase, SubmitOrderUseCase
    """)


if __name__ == "__main__":
    asyncio.run(main())
```

## Bonnes Pratiques DDD

1. **Ubiquitous Language** - Utilisez le même vocabulaire que les experts métier
2. **Bounded Contexts** - Définissez clairement les limites de chaque contexte
3. **Aggregates** - Gardez-les petits et cohésifs
4. **Value Objects** - Préférez les Value Objects aux types primitifs
5. **Domain Events** - Utilisez les événements pour la communication inter-agrégats
6. **Repositories** - Une interface par agrégat racine

## Quand Utiliser DDD

- Domaines complexes avec beaucoup de règles métier
- Projets à long terme avec évolutions fréquentes
- Équipes travaillant avec des experts métier
- Applications où le modèle métier est central
