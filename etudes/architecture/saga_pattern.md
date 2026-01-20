# Saga Pattern

## Vue d'ensemble

Le pattern Saga gère les transactions distribuées en décomposant une transaction longue en une séquence de transactions locales, chacune avec une action compensatoire.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Saga Pattern                                    │
│                                                                              │
│  Forward Flow (Success):                                                     │
│  ═══════════════════════                                                    │
│                                                                              │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐        │
│  │ Step 1 │───▶│ Step 2 │───▶│ Step 3 │───▶│ Step 4 │───▶│Complete│        │
│  │ T1     │    │ T2     │    │ T3     │    │ T4     │    │        │        │
│  └────────┘    └────────┘    └────────┘    └────────┘    └────────┘        │
│                                                                              │
│                                                                              │
│  Compensating Flow (Failure at Step 3):                                      │
│  ══════════════════════════════════════                                     │
│                                                                              │
│  ┌────────┐    ┌────────┐    ┌────────┐                                     │
│  │ Step 1 │───▶│ Step 2 │───▶│ Step 3 │──╳                                  │
│  │ T1     │    │ T2     │    │ T3     │  │ FAIL                             │
│  └────────┘    └────────┘    └────────┘  │                                  │
│       │              │                   │                                  │
│       │              │              ┌────┘                                  │
│       │              │              ▼                                       │
│       │              │        ┌──────────┐                                  │
│       │              │        │Compensate│                                  │
│       │              │        │   C3     │                                  │
│       │              │        └────┬─────┘                                  │
│       │              │             │                                        │
│       │              ▼             │                                        │
│       │        ┌──────────┐        │                                        │
│       │        │Compensate│◀───────┘                                        │
│       │        │   C2     │                                                 │
│       │        └────┬─────┘                                                 │
│       │             │                                                       │
│       ▼             │                                                       │
│  ┌──────────┐       │                                                       │
│  │Compensate│◀──────┘                                                       │
│  │   C1     │                                                               │
│  └────┬─────┘                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────┐                                                               │
│  │  FAILED  │                                                               │
│  └──────────┘                                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Types de Saga

### 1. Choreography-based Saga

```
┌─────────────────────────────────────────────────────────────────┐
│                    Choreography Saga                             │
│                                                                  │
│  ┌──────────┐  OrderCreated   ┌──────────┐  PaymentOK   ┌──────────┐
│  │  Order   │────────────────▶│ Payment  │─────────────▶│ Inventory│
│  │ Service  │                 │ Service  │              │ Service  │
│  └──────────┘                 └──────────┘              └──────────┘
│       │                            │                          │
│       │                            │                          │
│       │    PaymentFailed           │      StockReserved       │
│       │◀───────────────────────────│                          │
│       │                            │◀─────────────────────────│
│       │                            │                          │
│       │    InventoryFailed         │                          │
│       │◀─────────────────────────────────────────────────────│
│       │                            │                          │
│  Each service listens to events and reacts accordingly       │
│  No central coordinator                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Orchestration-based Saga

```
┌─────────────────────────────────────────────────────────────────┐
│                    Orchestration Saga                            │
│                                                                  │
│                    ┌─────────────────┐                          │
│                    │      Saga       │                          │
│                    │  Orchestrator   │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐               │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│   ┌──────────┐        ┌──────────┐        ┌──────────┐         │
│   │  Order   │        │ Payment  │        │ Inventory│         │
│   │ Service  │        │ Service  │        │ Service  │         │
│   └──────────┘        └──────────┘        └──────────┘         │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                    │
│                             ▼                                    │
│                    ┌─────────────────┐                          │
│                    │  Orchestrator   │                          │
│                    │   (decides)     │                          │
│                    └─────────────────┘                          │
│                                                                  │
│  Central coordinator manages the saga flow                      │
│  Services are commanded, not event-driven                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Implémentation Complète

### 1. Infrastructure de Base

```python
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Callable, Type
from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime
import uuid
import asyncio
import traceback


class SagaStatus(Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    COMPENSATING = "COMPENSATING"
    FAILED = "FAILED"
    COMPENSATED = "COMPENSATED"


class StepStatus(Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    COMPENSATING = "COMPENSATING"
    COMPENSATED = "COMPENSATED"
    SKIPPED = "SKIPPED"


@dataclass
class SagaStep:
    """Définition d'une étape de saga."""
    name: str
    execute: Callable[["SagaContext"], Any]
    compensate: Optional[Callable[["SagaContext"], Any]] = None
    retry_count: int = 3
    retry_delay: float = 1.0
    timeout: float = 30.0


@dataclass
class StepResult:
    """Résultat d'une étape."""
    step_name: str
    status: StepStatus
    result: Any = None
    error: Optional[str] = None
    started_at: datetime = None
    completed_at: datetime = None


@dataclass
class SagaContext:
    """Contexte partagé de la saga."""
    saga_id: str
    data: Dict[str, Any] = field(default_factory=dict)
    results: Dict[str, Any] = field(default_factory=dict)

    def set(self, key: str, value: Any) -> None:
        self.data[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        return self.data.get(key, default)

    def set_result(self, step_name: str, result: Any) -> None:
        self.results[step_name] = result

    def get_result(self, step_name: str) -> Any:
        return self.results.get(step_name)


@dataclass
class SagaState:
    """État persistable d'une saga."""
    saga_id: str
    saga_name: str
    status: SagaStatus
    current_step: int
    context: SagaContext
    step_results: List[StepResult]
    created_at: datetime
    updated_at: datetime
    error: Optional[str] = None


class SagaStore(ABC):
    """Interface pour la persistence des sagas."""

    @abstractmethod
    async def save(self, state: SagaState) -> None:
        pass

    @abstractmethod
    async def get(self, saga_id: str) -> Optional[SagaState]:
        pass

    @abstractmethod
    async def get_pending(self) -> List[SagaState]:
        pass


class InMemorySagaStore(SagaStore):
    """Store en mémoire pour les sagas."""

    def __init__(self):
        self._sagas: Dict[str, SagaState] = {}

    async def save(self, state: SagaState) -> None:
        state.updated_at = datetime.utcnow()
        self._sagas[state.saga_id] = state

    async def get(self, saga_id: str) -> Optional[SagaState]:
        return self._sagas.get(saga_id)

    async def get_pending(self) -> List[SagaState]:
        return [
            s for s in self._sagas.values()
            if s.status in [SagaStatus.RUNNING, SagaStatus.COMPENSATING]
        ]
```

### 2. Orchestration Saga

```python
class SagaOrchestrator:
    """Orchestrateur de saga."""

    def __init__(self, name: str, store: SagaStore):
        self.name = name
        self.store = store
        self._steps: List[SagaStep] = []
        self._on_complete: Optional[Callable] = None
        self._on_failed: Optional[Callable] = None

    def step(self, name: str, execute: Callable,
             compensate: Callable = None,
             retry_count: int = 3,
             timeout: float = 30.0) -> "SagaOrchestrator":
        """Ajoute une étape à la saga."""
        self._steps.append(SagaStep(
            name=name,
            execute=execute,
            compensate=compensate,
            retry_count=retry_count,
            timeout=timeout
        ))
        return self

    def on_complete(self, callback: Callable) -> "SagaOrchestrator":
        """Définit le callback de succès."""
        self._on_complete = callback
        return self

    def on_failed(self, callback: Callable) -> "SagaOrchestrator":
        """Définit le callback d'échec."""
        self._on_failed = callback
        return self

    async def execute(self, initial_data: Dict[str, Any] = None) -> SagaState:
        """Exécute la saga."""
        saga_id = str(uuid.uuid4())
        context = SagaContext(saga_id=saga_id, data=initial_data or {})

        state = SagaState(
            saga_id=saga_id,
            saga_name=self.name,
            status=SagaStatus.RUNNING,
            current_step=0,
            context=context,
            step_results=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        await self.store.save(state)
        print(f"[Saga {saga_id[:8]}] Started: {self.name}")

        try:
            # Exécuter les étapes
            for i, step in enumerate(self._steps):
                state.current_step = i
                result = await self._execute_step(step, context, state)

                if result.status == StepStatus.FAILED:
                    state.status = SagaStatus.COMPENSATING
                    state.error = result.error
                    await self.store.save(state)

                    # Compensation
                    await self._compensate(state, context, i)

                    if self._on_failed:
                        await self._on_failed(state)

                    return state

            # Succès
            state.status = SagaStatus.COMPLETED
            await self.store.save(state)
            print(f"[Saga {saga_id[:8]}] Completed successfully")

            if self._on_complete:
                await self._on_complete(state)

        except Exception as e:
            state.status = SagaStatus.FAILED
            state.error = str(e)
            await self.store.save(state)
            print(f"[Saga {saga_id[:8]}] Failed: {e}")

        return state

    async def _execute_step(self, step: SagaStep,
                           context: SagaContext,
                           state: SagaState) -> StepResult:
        """Exécute une étape avec retry."""
        result = StepResult(
            step_name=step.name,
            status=StepStatus.RUNNING,
            started_at=datetime.utcnow()
        )
        state.step_results.append(result)

        for attempt in range(step.retry_count):
            try:
                print(f"[Saga {context.saga_id[:8]}] Executing: {step.name} (attempt {attempt + 1})")

                # Exécuter avec timeout
                step_result = await asyncio.wait_for(
                    step.execute(context),
                    timeout=step.timeout
                )

                result.status = StepStatus.COMPLETED
                result.result = step_result
                result.completed_at = datetime.utcnow()
                context.set_result(step.name, step_result)

                print(f"[Saga {context.saga_id[:8]}] Completed: {step.name}")
                await self.store.save(state)
                return result

            except asyncio.TimeoutError:
                result.error = f"Timeout after {step.timeout}s"
                print(f"[Saga {context.saga_id[:8]}] Timeout: {step.name}")

            except Exception as e:
                result.error = str(e)
                print(f"[Saga {context.saga_id[:8]}] Error in {step.name}: {e}")

            if attempt < step.retry_count - 1:
                await asyncio.sleep(step.retry_delay * (attempt + 1))

        result.status = StepStatus.FAILED
        result.completed_at = datetime.utcnow()
        return result

    async def _compensate(self, state: SagaState,
                         context: SagaContext,
                         failed_step_index: int) -> None:
        """Exécute les compensations."""
        print(f"[Saga {context.saga_id[:8]}] Starting compensation")

        # Compenser en ordre inverse
        for i in range(failed_step_index - 1, -1, -1):
            step = self._steps[i]
            step_result = state.step_results[i]

            if step.compensate and step_result.status == StepStatus.COMPLETED:
                try:
                    step_result.status = StepStatus.COMPENSATING
                    print(f"[Saga {context.saga_id[:8]}] Compensating: {step.name}")

                    await step.compensate(context)

                    step_result.status = StepStatus.COMPENSATED
                    print(f"[Saga {context.saga_id[:8]}] Compensated: {step.name}")

                except Exception as e:
                    print(f"[Saga {context.saga_id[:8]}] Compensation failed for {step.name}: {e}")
                    # Log mais continuer la compensation des autres étapes

        state.status = SagaStatus.COMPENSATED
        await self.store.save(state)
        print(f"[Saga {context.saga_id[:8]}] Compensation completed")
```

### 3. Choreography Saga

```python
from collections import defaultdict


@dataclass
class SagaEvent:
    """Événement de saga."""
    event_type: str
    saga_id: str
    step_name: str
    data: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)


class EventBus:
    """Bus d'événements simple pour la chorégraphie."""

    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = defaultdict(list)

    def subscribe(self, event_type: str, handler: Callable) -> None:
        self._handlers[event_type].append(handler)

    async def publish(self, event: SagaEvent) -> None:
        handlers = self._handlers.get(event.event_type, [])
        for handler in handlers:
            asyncio.create_task(handler(event))


class ChoreographySagaParticipant(ABC):
    """Participant à une saga chorégraphique."""

    def __init__(self, service_name: str, event_bus: EventBus):
        self.service_name = service_name
        self.event_bus = event_bus
        self._saga_data: Dict[str, Dict] = {}  # saga_id -> local data

    async def emit_success(self, saga_id: str, step_name: str,
                          data: Dict = None) -> None:
        """Émet un événement de succès."""
        await self.event_bus.publish(SagaEvent(
            event_type=f"{step_name}.completed",
            saga_id=saga_id,
            step_name=step_name,
            data=data or {}
        ))

    async def emit_failure(self, saga_id: str, step_name: str,
                          error: str) -> None:
        """Émet un événement d'échec."""
        await self.event_bus.publish(SagaEvent(
            event_type=f"{step_name}.failed",
            saga_id=saga_id,
            step_name=step_name,
            data={"error": error}
        ))

    async def emit_compensated(self, saga_id: str, step_name: str) -> None:
        """Émet un événement de compensation."""
        await self.event_bus.publish(SagaEvent(
            event_type=f"{step_name}.compensated",
            saga_id=saga_id,
            step_name=step_name
        ))

    @abstractmethod
    async def execute(self, event: SagaEvent) -> None:
        """Exécute l'action du participant."""
        pass

    @abstractmethod
    async def compensate(self, event: SagaEvent) -> None:
        """Exécute la compensation."""
        pass
```

### 4. Exemple Complet: E-Commerce Order Saga

```python
# Services simulés
class OrderService:
    """Service de commandes."""

    def __init__(self):
        self.orders: Dict[str, Dict] = {}

    async def create_order(self, order_id: str, customer_id: str,
                          items: List[Dict]) -> Dict:
        order = {
            "order_id": order_id,
            "customer_id": customer_id,
            "items": items,
            "status": "PENDING",
            "total": sum(item["price"] * item["quantity"] for item in items)
        }
        self.orders[order_id] = order
        print(f"[OrderService] Created order {order_id}")
        return order

    async def confirm_order(self, order_id: str) -> None:
        if order_id in self.orders:
            self.orders[order_id]["status"] = "CONFIRMED"
            print(f"[OrderService] Confirmed order {order_id}")

    async def cancel_order(self, order_id: str) -> None:
        if order_id in self.orders:
            self.orders[order_id]["status"] = "CANCELLED"
            print(f"[OrderService] Cancelled order {order_id}")


class InventoryService:
    """Service d'inventaire."""

    def __init__(self, stock: Dict[str, int]):
        self.stock = stock.copy()
        self.reservations: Dict[str, List[Dict]] = {}

    async def reserve_items(self, order_id: str,
                           items: List[Dict]) -> bool:
        # Vérifier la disponibilité
        for item in items:
            available = self.stock.get(item["product_id"], 0)
            if available < item["quantity"]:
                raise ValueError(f"Insufficient stock for {item['product_id']}")

        # Réserver
        for item in items:
            self.stock[item["product_id"]] -= item["quantity"]

        self.reservations[order_id] = items
        print(f"[InventoryService] Reserved items for order {order_id}")
        return True

    async def release_reservation(self, order_id: str) -> None:
        if order_id in self.reservations:
            items = self.reservations[order_id]
            for item in items:
                self.stock[item["product_id"]] += item["quantity"]
            del self.reservations[order_id]
            print(f"[InventoryService] Released reservation for order {order_id}")


class PaymentService:
    """Service de paiement."""

    def __init__(self, should_fail: bool = False):
        self.payments: Dict[str, Dict] = {}
        self._should_fail = should_fail

    async def process_payment(self, order_id: str, amount: float,
                             payment_method: str) -> Dict:
        if self._should_fail:
            raise ValueError("Payment declined")

        payment = {
            "payment_id": f"PAY-{uuid.uuid4().hex[:8]}",
            "order_id": order_id,
            "amount": amount,
            "status": "COMPLETED"
        }
        self.payments[order_id] = payment
        print(f"[PaymentService] Processed payment for order {order_id}")
        return payment

    async def refund_payment(self, order_id: str) -> None:
        if order_id in self.payments:
            self.payments[order_id]["status"] = "REFUNDED"
            print(f"[PaymentService] Refunded payment for order {order_id}")


class ShippingService:
    """Service de livraison."""

    def __init__(self):
        self.shipments: Dict[str, Dict] = {}

    async def create_shipment(self, order_id: str,
                             address: Dict) -> Dict:
        shipment = {
            "shipment_id": f"SHIP-{uuid.uuid4().hex[:8]}",
            "order_id": order_id,
            "address": address,
            "status": "CREATED"
        }
        self.shipments[order_id] = shipment
        print(f"[ShippingService] Created shipment for order {order_id}")
        return shipment

    async def cancel_shipment(self, order_id: str) -> None:
        if order_id in self.shipments:
            self.shipments[order_id]["status"] = "CANCELLED"
            print(f"[ShippingService] Cancelled shipment for order {order_id}")


# Orchestration Saga Implementation
def create_order_saga(order_service: OrderService,
                     inventory_service: InventoryService,
                     payment_service: PaymentService,
                     shipping_service: ShippingService,
                     store: SagaStore) -> SagaOrchestrator:
    """Crée la saga de commande."""

    saga = SagaOrchestrator("CreateOrderSaga", store)

    # Step 1: Create Order
    async def create_order(ctx: SagaContext):
        order = await order_service.create_order(
            order_id=ctx.get("order_id"),
            customer_id=ctx.get("customer_id"),
            items=ctx.get("items")
        )
        ctx.set("order", order)
        return order

    async def cancel_order(ctx: SagaContext):
        await order_service.cancel_order(ctx.get("order_id"))

    saga.step("create_order", create_order, cancel_order)

    # Step 2: Reserve Inventory
    async def reserve_inventory(ctx: SagaContext):
        await inventory_service.reserve_items(
            order_id=ctx.get("order_id"),
            items=ctx.get("items")
        )
        return True

    async def release_inventory(ctx: SagaContext):
        await inventory_service.release_reservation(ctx.get("order_id"))

    saga.step("reserve_inventory", reserve_inventory, release_inventory)

    # Step 3: Process Payment
    async def process_payment(ctx: SagaContext):
        order = ctx.get("order")
        payment = await payment_service.process_payment(
            order_id=ctx.get("order_id"),
            amount=order["total"],
            payment_method=ctx.get("payment_method", "credit_card")
        )
        ctx.set("payment", payment)
        return payment

    async def refund_payment(ctx: SagaContext):
        await payment_service.refund_payment(ctx.get("order_id"))

    saga.step("process_payment", process_payment, refund_payment)

    # Step 4: Create Shipment
    async def create_shipment(ctx: SagaContext):
        shipment = await shipping_service.create_shipment(
            order_id=ctx.get("order_id"),
            address=ctx.get("shipping_address")
        )
        ctx.set("shipment", shipment)
        return shipment

    async def cancel_shipment(ctx: SagaContext):
        await shipping_service.cancel_shipment(ctx.get("order_id"))

    saga.step("create_shipment", create_shipment, cancel_shipment)

    # Step 5: Confirm Order
    async def confirm_order(ctx: SagaContext):
        await order_service.confirm_order(ctx.get("order_id"))
        return True

    saga.step("confirm_order", confirm_order)

    # Callbacks
    async def on_complete(state: SagaState):
        print(f"\n[Saga] Order {state.context.get('order_id')} completed successfully!")
        print(f"  Payment: {state.context.get('payment', {}).get('payment_id')}")
        print(f"  Shipment: {state.context.get('shipment', {}).get('shipment_id')}")

    async def on_failed(state: SagaState):
        print(f"\n[Saga] Order {state.context.get('order_id')} failed: {state.error}")
        print("  All compensations have been executed")

    saga.on_complete(on_complete)
    saga.on_failed(on_failed)

    return saga


# Choreography Implementation
class OrderParticipant(ChoreographySagaParticipant):
    """Participant Order pour la chorégraphie."""

    def __init__(self, event_bus: EventBus, order_service: OrderService):
        super().__init__("order", event_bus)
        self.order_service = order_service

        # S'abonner aux événements
        event_bus.subscribe("saga.started", self.execute)
        event_bus.subscribe("order.compensate", self.compensate)

    async def execute(self, event: SagaEvent) -> None:
        try:
            order = await self.order_service.create_order(
                order_id=event.saga_id,
                customer_id=event.data["customer_id"],
                items=event.data["items"]
            )
            self._saga_data[event.saga_id] = order
            await self.emit_success(event.saga_id, "order", {"order": order})

        except Exception as e:
            await self.emit_failure(event.saga_id, "order", str(e))

    async def compensate(self, event: SagaEvent) -> None:
        await self.order_service.cancel_order(event.saga_id)
        await self.emit_compensated(event.saga_id, "order")


class InventoryParticipant(ChoreographySagaParticipant):
    """Participant Inventory pour la chorégraphie."""

    def __init__(self, event_bus: EventBus,
                 inventory_service: InventoryService):
        super().__init__("inventory", event_bus)
        self.inventory_service = inventory_service

        event_bus.subscribe("order.completed", self.execute)
        event_bus.subscribe("inventory.compensate", self.compensate)

    async def execute(self, event: SagaEvent) -> None:
        try:
            items = event.data.get("order", {}).get("items", [])
            await self.inventory_service.reserve_items(event.saga_id, items)
            await self.emit_success(event.saga_id, "inventory", {})

        except Exception as e:
            await self.emit_failure(event.saga_id, "inventory", str(e))

    async def compensate(self, event: SagaEvent) -> None:
        await self.inventory_service.release_reservation(event.saga_id)
        await self.emit_compensated(event.saga_id, "inventory")


async def main():
    print("=" * 70)
    print("Saga Pattern Demo")
    print("=" * 70)

    # Services
    order_service = OrderService()
    inventory_service = InventoryService({
        "PROD-001": 100,
        "PROD-002": 50
    })
    payment_service = PaymentService(should_fail=False)
    shipping_service = ShippingService()

    # Saga Store
    store = InMemorySagaStore()

    print("\n--- ORCHESTRATION SAGA (Success Case) ---\n")

    saga = create_order_saga(
        order_service,
        inventory_service,
        payment_service,
        shipping_service,
        store
    )

    result = await saga.execute({
        "order_id": f"ORD-{uuid.uuid4().hex[:8]}",
        "customer_id": "CUST-001",
        "items": [
            {"product_id": "PROD-001", "quantity": 2, "price": 29.99},
            {"product_id": "PROD-002", "quantity": 1, "price": 49.99}
        ],
        "shipping_address": {
            "street": "123 Main St",
            "city": "Paris",
            "country": "France"
        }
    })

    print(f"\nFinal Status: {result.status.value}")

    print("\n" + "=" * 70)
    print("\n--- ORCHESTRATION SAGA (Failure Case - Payment Declined) ---\n")

    # Recréer avec paiement qui échoue
    payment_service_failing = PaymentService(should_fail=True)

    saga_fail = create_order_saga(
        order_service,
        inventory_service,
        payment_service_failing,
        shipping_service,
        store
    )

    result_fail = await saga_fail.execute({
        "order_id": f"ORD-{uuid.uuid4().hex[:8]}",
        "customer_id": "CUST-002",
        "items": [
            {"product_id": "PROD-001", "quantity": 1, "price": 99.99}
        ],
        "shipping_address": {
            "street": "456 Oak Ave",
            "city": "Lyon",
            "country": "France"
        }
    })

    print(f"\nFinal Status: {result_fail.status.value}")

    print("\n" + "=" * 70)
    print("\n--- CHOREOGRAPHY SAGA Demo ---\n")

    # Choreography setup
    event_bus = EventBus()
    inventory_service_2 = InventoryService({"PROD-001": 100})

    order_participant = OrderParticipant(event_bus, OrderService())
    inventory_participant = InventoryParticipant(event_bus, inventory_service_2)

    # Démarrer la saga
    saga_id = str(uuid.uuid4())[:8]
    await event_bus.publish(SagaEvent(
        event_type="saga.started",
        saga_id=saga_id,
        step_name="start",
        data={
            "customer_id": "CUST-003",
            "items": [{"product_id": "PROD-001", "quantity": 5, "price": 19.99}]
        }
    ))

    await asyncio.sleep(0.5)  # Laisser le temps aux événements


if __name__ == "__main__":
    asyncio.run(main())
```

## Diagramme de Décision

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Orchestration vs Choreography                             │
│                                                                              │
│  ┌───────────────────────────────┬───────────────────────────────┐          │
│  │       ORCHESTRATION           │        CHOREOGRAPHY           │          │
│  ├───────────────────────────────┼───────────────────────────────┤          │
│  │ + Flux centralisé             │ + Services découplés          │          │
│  │ + Facile à comprendre         │ + Pas de SPOF                 │          │
│  │ + Modifications localisées    │ + Scalabilité naturelle       │          │
│  │                               │                               │          │
│  │ - Single point of failure     │ - Flux difficile à suivre     │          │
│  │ - L'orchestrateur peut être   │ - Risque de cyclic deps       │          │
│  │   un goulot d'étranglement    │ - Debugging complexe          │          │
│  ├───────────────────────────────┼───────────────────────────────┤          │
│  │ Idéal pour:                   │ Idéal pour:                   │          │
│  │ - Sagas complexes             │ - Sagas simples               │          │
│  │ - Logique métier centrale     │ - Services très autonomes     │          │
│  │ - Besoin de monitoring        │ - Haute disponibilité         │          │
│  └───────────────────────────────┴───────────────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Bonnes Pratiques

1. **Idempotence** - Chaque étape doit être idempotente
2. **Timeouts** - Définir des timeouts pour chaque étape
3. **Retry avec backoff** - Réessayer avec délai exponentiel
4. **Logging détaillé** - Tracer chaque étape de la saga
5. **Persistence d'état** - Sauvegarder l'état pour la reprise
6. **Compensations atomiques** - Les compensations doivent être fiables
