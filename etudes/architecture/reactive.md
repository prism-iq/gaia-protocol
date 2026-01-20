# Architecture Reactive

## Vue d'ensemble

L'architecture reactive est basée sur le Reactive Manifesto: Responsive, Resilient, Elastic, et Message-Driven. Elle vise à créer des systèmes plus robustes et adaptables.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Reactive Manifesto                                  │
│                                                                              │
│                              ┌────────────────┐                             │
│                              │   RESPONSIVE   │                             │
│                              │  (Quick Reply) │                             │
│                              └───────┬────────┘                             │
│                                      │                                       │
│                     ┌────────────────┴────────────────┐                     │
│                     │                                 │                     │
│              ┌──────▼──────┐                   ┌──────▼──────┐              │
│              │  RESILIENT  │                   │   ELASTIC   │              │
│              │ (Fail-safe) │                   │ (Scalable)  │              │
│              └──────┬──────┘                   └──────┬──────┘              │
│                     │                                 │                     │
│                     └────────────────┬────────────────┘                     │
│                                      │                                       │
│                              ┌───────▼────────┐                             │
│                              │ MESSAGE-DRIVEN │                             │
│                              │   (Async I/O)  │                             │
│                              └────────────────┘                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Reactive Streams:
═════════════════

  Publisher ──────▶ Processor ──────▶ Processor ──────▶ Subscriber
      │                 │                 │                  │
      │    request(n)   │    request(n)   │    request(n)    │
      │◀────────────────│◀────────────────│◀─────────────────│
      │                 │                 │                  │
      │    onNext(x)    │    onNext(y)    │    onNext(z)     │
      │────────────────▶│────────────────▶│─────────────────▶│
      │                 │                 │                  │
      │   onComplete    │   onComplete    │   onComplete     │
      │────────────────▶│────────────────▶│─────────────────▶│

  Back-pressure: Subscriber controls flow rate
```

## Implémentation: Reactive Streams

### 1. Core Reactive Abstractions

```python
from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Callable, Optional, List, Any
from dataclasses import dataclass, field
import asyncio
from enum import Enum
import time
from collections import deque


T = TypeVar('T')
R = TypeVar('R')


class Subscription(ABC):
    """Interface pour gérer les souscriptions."""

    @abstractmethod
    def request(self, n: int) -> None:
        """Demande n éléments."""
        pass

    @abstractmethod
    def cancel(self) -> None:
        """Annule la souscription."""
        pass


class Subscriber(ABC, Generic[T]):
    """Interface pour les abonnés."""

    @abstractmethod
    def on_subscribe(self, subscription: Subscription) -> None:
        """Appelé lors de la souscription."""
        pass

    @abstractmethod
    def on_next(self, item: T) -> None:
        """Appelé pour chaque élément."""
        pass

    @abstractmethod
    def on_error(self, error: Exception) -> None:
        """Appelé en cas d'erreur."""
        pass

    @abstractmethod
    def on_complete(self) -> None:
        """Appelé à la fin du flux."""
        pass


class Publisher(ABC, Generic[T]):
    """Interface pour les publishers."""

    @abstractmethod
    def subscribe(self, subscriber: Subscriber[T]) -> None:
        """S'abonne au publisher."""
        pass


class Processor(Publisher[R], Subscriber[T], Generic[T, R]):
    """Combine Publisher et Subscriber pour transformer les données."""
    pass


# Implementations
class BaseSubscription(Subscription):
    """Implementation de base pour les subscriptions."""

    def __init__(self):
        self._requested = 0
        self._cancelled = False
        self._lock = asyncio.Lock()

    @property
    def requested(self) -> int:
        return self._requested

    @property
    def is_cancelled(self) -> bool:
        return self._cancelled

    def request(self, n: int) -> None:
        if n <= 0:
            raise ValueError("Request must be positive")
        if not self._cancelled:
            self._requested += n

    def cancel(self) -> None:
        self._cancelled = True

    def consume(self, n: int = 1) -> bool:
        """Consomme n demandes. Retourne True si possible."""
        if self._cancelled:
            return False
        if self._requested >= n:
            self._requested -= n
            return True
        return False


class Observable(Publisher[T], Generic[T]):
    """Publisher observable avec support des opérateurs."""

    def __init__(self, subscribe_func: Callable[[Subscriber[T]], None] = None):
        self._subscribe_func = subscribe_func
        self._subscribers: List[Subscriber[T]] = []

    def subscribe(self, subscriber: Subscriber[T]) -> None:
        self._subscribers.append(subscriber)
        if self._subscribe_func:
            self._subscribe_func(subscriber)

    # Factory methods
    @classmethod
    def just(cls, *items: T) -> "Observable[T]":
        """Crée un Observable à partir d'éléments."""
        def subscribe(subscriber: Subscriber[T]):
            subscription = BaseSubscription()
            subscriber.on_subscribe(subscription)

            for item in items:
                if subscription.is_cancelled:
                    break
                subscriber.on_next(item)

            if not subscription.is_cancelled:
                subscriber.on_complete()

        return cls(subscribe)

    @classmethod
    def from_iterable(cls, iterable) -> "Observable[T]":
        """Crée un Observable à partir d'un itérable."""
        return cls.just(*iterable)

    @classmethod
    def interval(cls, period: float) -> "Observable[int]":
        """Crée un Observable émettant à intervalles réguliers."""
        async def subscribe(subscriber: Subscriber[int]):
            subscription = BaseSubscription()
            subscriber.on_subscribe(subscription)

            count = 0
            while not subscription.is_cancelled:
                await asyncio.sleep(period)
                if not subscription.is_cancelled:
                    subscriber.on_next(count)
                    count += 1

        return AsyncObservable(subscribe)

    @classmethod
    def empty(cls) -> "Observable[T]":
        """Crée un Observable vide."""
        def subscribe(subscriber: Subscriber[T]):
            subscription = BaseSubscription()
            subscriber.on_subscribe(subscription)
            subscriber.on_complete()

        return cls(subscribe)

    @classmethod
    def error(cls, error: Exception) -> "Observable[T]":
        """Crée un Observable qui émet une erreur."""
        def subscribe(subscriber: Subscriber[T]):
            subscription = BaseSubscription()
            subscriber.on_subscribe(subscription)
            subscriber.on_error(error)

        return cls(subscribe)

    # Operators
    def map(self, mapper: Callable[[T], R]) -> "Observable[R]":
        """Transforme chaque élément."""
        source = self

        def subscribe(subscriber: Subscriber[R]):
            class MapSubscriber(Subscriber[T]):
                def on_subscribe(self, subscription: Subscription):
                    subscriber.on_subscribe(subscription)

                def on_next(self, item: T):
                    try:
                        result = mapper(item)
                        subscriber.on_next(result)
                    except Exception as e:
                        subscriber.on_error(e)

                def on_error(self, error: Exception):
                    subscriber.on_error(error)

                def on_complete(self):
                    subscriber.on_complete()

            source.subscribe(MapSubscriber())

        return Observable(subscribe)

    def filter(self, predicate: Callable[[T], bool]) -> "Observable[T]":
        """Filtre les éléments."""
        source = self

        def subscribe(subscriber: Subscriber[T]):
            class FilterSubscriber(Subscriber[T]):
                def on_subscribe(self, subscription: Subscription):
                    subscriber.on_subscribe(subscription)

                def on_next(self, item: T):
                    try:
                        if predicate(item):
                            subscriber.on_next(item)
                    except Exception as e:
                        subscriber.on_error(e)

                def on_error(self, error: Exception):
                    subscriber.on_error(error)

                def on_complete(self):
                    subscriber.on_complete()

            source.subscribe(FilterSubscriber())

        return Observable(subscribe)

    def flat_map(self, mapper: Callable[[T], "Observable[R]"]) -> "Observable[R]":
        """Transforme et aplatit les résultats."""
        source = self

        def subscribe(subscriber: Subscriber[R]):
            active_subscriptions = []
            completed_sources = [0]  # [source_completed, inner_count]
            inner_count = [0]

            class InnerSubscriber(Subscriber[R]):
                def on_subscribe(self, subscription: Subscription):
                    active_subscriptions.append(subscription)

                def on_next(self, item: R):
                    subscriber.on_next(item)

                def on_error(self, error: Exception):
                    subscriber.on_error(error)

                def on_complete(self):
                    inner_count[0] -= 1
                    if completed_sources[0] and inner_count[0] == 0:
                        subscriber.on_complete()

            class FlatMapSubscriber(Subscriber[T]):
                def on_subscribe(self, subscription: Subscription):
                    subscriber.on_subscribe(subscription)

                def on_next(self, item: T):
                    try:
                        inner_count[0] += 1
                        inner_observable = mapper(item)
                        inner_observable.subscribe(InnerSubscriber())
                    except Exception as e:
                        subscriber.on_error(e)

                def on_error(self, error: Exception):
                    subscriber.on_error(error)

                def on_complete(self):
                    completed_sources[0] = 1
                    if inner_count[0] == 0:
                        subscriber.on_complete()

            source.subscribe(FlatMapSubscriber())

        return Observable(subscribe)

    def take(self, count: int) -> "Observable[T]":
        """Prend les n premiers éléments."""
        source = self

        def subscribe(subscriber: Subscriber[T]):
            taken = [0]
            subscription_ref = [None]

            class TakeSubscriber(Subscriber[T]):
                def on_subscribe(self, subscription: Subscription):
                    subscription_ref[0] = subscription
                    subscriber.on_subscribe(subscription)

                def on_next(self, item: T):
                    taken[0] += 1
                    subscriber.on_next(item)
                    if taken[0] >= count:
                        subscription_ref[0].cancel()
                        subscriber.on_complete()

                def on_error(self, error: Exception):
                    subscriber.on_error(error)

                def on_complete(self):
                    subscriber.on_complete()

            source.subscribe(TakeSubscriber())

        return Observable(subscribe)

    def reduce(self, accumulator: Callable[[R, T], R],
               initial: R) -> "Observable[R]":
        """Réduit les éléments à une seule valeur."""
        source = self

        def subscribe(subscriber: Subscriber[R]):
            result = [initial]

            class ReduceSubscriber(Subscriber[T]):
                def on_subscribe(self, subscription: Subscription):
                    subscriber.on_subscribe(subscription)

                def on_next(self, item: T):
                    try:
                        result[0] = accumulator(result[0], item)
                    except Exception as e:
                        subscriber.on_error(e)

                def on_error(self, error: Exception):
                    subscriber.on_error(error)

                def on_complete(self):
                    subscriber.on_next(result[0])
                    subscriber.on_complete()

            source.subscribe(ReduceSubscriber())

        return Observable(subscribe)

    def buffer(self, size: int) -> "Observable[List[T]]":
        """Regroupe les éléments en lots."""
        source = self

        def subscribe(subscriber: Subscriber[List[T]]):
            buffer = []

            class BufferSubscriber(Subscriber[T]):
                def on_subscribe(self, subscription: Subscription):
                    subscriber.on_subscribe(subscription)

                def on_next(self, item: T):
                    buffer.append(item)
                    if len(buffer) >= size:
                        subscriber.on_next(buffer.copy())
                        buffer.clear()

                def on_error(self, error: Exception):
                    subscriber.on_error(error)

                def on_complete(self):
                    if buffer:
                        subscriber.on_next(buffer.copy())
                    subscriber.on_complete()

            source.subscribe(BufferSubscriber())

        return Observable(subscribe)

    def debounce(self, delay: float) -> "Observable[T]":
        """Émet après un délai sans nouvelle valeur."""
        source = self

        async def subscribe(subscriber: Subscriber[T]):
            last_item = [None]
            last_time = [0.0]
            subscription_ref = [None]

            class DebounceSubscriber(Subscriber[T]):
                def on_subscribe(self, subscription: Subscription):
                    subscription_ref[0] = subscription
                    subscriber.on_subscribe(subscription)

                def on_next(self, item: T):
                    last_item[0] = item
                    last_time[0] = time.time()

                    async def emit_after_delay():
                        await asyncio.sleep(delay)
                        if time.time() - last_time[0] >= delay:
                            subscriber.on_next(last_item[0])

                    asyncio.create_task(emit_after_delay())

                def on_error(self, error: Exception):
                    subscriber.on_error(error)

                def on_complete(self):
                    subscriber.on_complete()

            source.subscribe(DebounceSubscriber())

        return AsyncObservable(subscribe)


class AsyncObservable(Observable[T], Generic[T]):
    """Observable asynchrone."""

    def __init__(self, async_subscribe_func: Callable[[Subscriber[T]], Any]):
        super().__init__()
        self._async_subscribe_func = async_subscribe_func

    def subscribe(self, subscriber: Subscriber[T]) -> None:
        asyncio.create_task(self._async_subscribe_func(subscriber))
```

### 2. Backpressure et Flow Control

```python
class BackpressureStrategy(Enum):
    BUFFER = "buffer"        # Buffer tout
    DROP = "drop"            # Drop si buffer plein
    LATEST = "latest"        # Garde seulement le dernier
    ERROR = "error"          # Erreur si buffer plein


class FlowControlledPublisher(Publisher[T], Generic[T]):
    """Publisher avec contrôle de flux."""

    def __init__(self, source: Publisher[T],
                 strategy: BackpressureStrategy = BackpressureStrategy.BUFFER,
                 buffer_size: int = 256):
        self._source = source
        self._strategy = strategy
        self._buffer_size = buffer_size

    def subscribe(self, subscriber: Subscriber[T]) -> None:
        class FlowController(Subscriber[T]):
            def __init__(self, downstream: Subscriber[T], strategy, buffer_size):
                self._downstream = downstream
                self._strategy = strategy
                self._buffer: deque = deque(maxlen=buffer_size if strategy == BackpressureStrategy.BUFFER else None)
                self._buffer_size = buffer_size
                self._subscription: Optional[Subscription] = None
                self._requested = 0
                self._processing = False

            def on_subscribe(self, subscription: Subscription):
                self._subscription = subscription

                class ControlledSubscription(Subscription):
                    def __init__(self, controller):
                        self._controller = controller

                    def request(self, n: int):
                        self._controller._requested += n
                        self._controller._drain()

                    def cancel(self):
                        self._controller._subscription.cancel()

                self._downstream.on_subscribe(ControlledSubscription(self))
                # Request all from upstream
                subscription.request(self._buffer_size)

            def on_next(self, item: T):
                if len(self._buffer) >= self._buffer_size:
                    if self._strategy == BackpressureStrategy.DROP:
                        return  # Drop silently
                    elif self._strategy == BackpressureStrategy.LATEST:
                        self._buffer.clear()
                    elif self._strategy == BackpressureStrategy.ERROR:
                        self._downstream.on_error(
                            BufferOverflowError("Buffer overflow")
                        )
                        return

                self._buffer.append(item)
                self._drain()

            def _drain(self):
                if self._processing:
                    return
                self._processing = True

                while self._buffer and self._requested > 0:
                    item = self._buffer.popleft()
                    self._requested -= 1
                    self._downstream.on_next(item)

                self._processing = False

                # Request more from upstream if needed
                if len(self._buffer) < self._buffer_size // 2:
                    self._subscription.request(self._buffer_size - len(self._buffer))

            def on_error(self, error: Exception):
                self._downstream.on_error(error)

            def on_complete(self):
                # Drain remaining items
                while self._buffer:
                    if self._requested > 0:
                        item = self._buffer.popleft()
                        self._requested -= 1
                        self._downstream.on_next(item)
                    else:
                        break
                self._downstream.on_complete()

        controller = FlowController(subscriber, self._strategy, self._buffer_size)
        self._source.subscribe(controller)


class BufferOverflowError(Exception):
    pass
```

### 3. Reactive Circuit Breaker

```python
from enum import Enum
import time


class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class ReactiveCircuitBreaker:
    """Circuit breaker réactif."""

    def __init__(self, failure_threshold: int = 5,
                 success_threshold: int = 3,
                 timeout: float = 30.0):
        self._failure_threshold = failure_threshold
        self._success_threshold = success_threshold
        self._timeout = timeout

        self._state = CircuitState.CLOSED
        self._failures = 0
        self._successes = 0
        self._last_failure_time = 0.0

        self._state_changes: Observable[CircuitState] = self._create_state_observable()

    def _create_state_observable(self) -> Observable[CircuitState]:
        """Crée un observable pour les changements d'état."""
        self._state_subscribers: List[Subscriber[CircuitState]] = []

        def subscribe(subscriber: Subscriber[CircuitState]):
            subscription = BaseSubscription()
            subscriber.on_subscribe(subscription)
            self._state_subscribers.append(subscriber)
            # Emit current state
            subscriber.on_next(self._state)

        return Observable(subscribe)

    def _notify_state_change(self, new_state: CircuitState):
        """Notifie les subscribers du changement d'état."""
        self._state = new_state
        for subscriber in self._state_subscribers:
            subscriber.on_next(new_state)

    def wrap(self, observable: Observable[T]) -> Observable[T]:
        """Enveloppe un observable avec le circuit breaker."""
        circuit = self

        def subscribe(subscriber: Subscriber[T]):
            # Check circuit state
            if circuit._state == CircuitState.OPEN:
                if time.time() - circuit._last_failure_time >= circuit._timeout:
                    circuit._notify_state_change(CircuitState.HALF_OPEN)
                    circuit._successes = 0
                else:
                    subscriber.on_error(CircuitOpenError("Circuit is open"))
                    return

            class CircuitBreakerSubscriber(Subscriber[T]):
                def on_subscribe(self, subscription: Subscription):
                    subscriber.on_subscribe(subscription)

                def on_next(self, item: T):
                    subscriber.on_next(item)
                    circuit._on_success()

                def on_error(self, error: Exception):
                    circuit._on_failure()
                    subscriber.on_error(error)

                def on_complete(self):
                    subscriber.on_complete()

            observable.subscribe(CircuitBreakerSubscriber())

        return Observable(subscribe)

    def _on_success(self):
        """Enregistre un succès."""
        if self._state == CircuitState.HALF_OPEN:
            self._successes += 1
            if self._successes >= self._success_threshold:
                self._notify_state_change(CircuitState.CLOSED)
                self._failures = 0

        elif self._state == CircuitState.CLOSED:
            self._failures = 0

    def _on_failure(self):
        """Enregistre un échec."""
        self._failures += 1
        self._last_failure_time = time.time()

        if self._state == CircuitState.HALF_OPEN:
            self._notify_state_change(CircuitState.OPEN)

        elif self._state == CircuitState.CLOSED:
            if self._failures >= self._failure_threshold:
                self._notify_state_change(CircuitState.OPEN)

    @property
    def state_changes(self) -> Observable[CircuitState]:
        """Observable des changements d'état."""
        return self._state_changes


class CircuitOpenError(Exception):
    pass
```

### 4. Event Sourcing Reactive

```python
from typing import Dict


@dataclass
class Event:
    event_id: str
    aggregate_id: str
    event_type: str
    data: Dict[str, Any]
    timestamp: float = field(default_factory=time.time)


class ReactiveEventStore:
    """Event store réactif."""

    def __init__(self):
        self._events: List[Event] = []
        self._subscribers: List[Subscriber[Event]] = []

    def append(self, event: Event) -> None:
        """Ajoute un événement et notifie les subscribers."""
        self._events.append(event)
        for subscriber in self._subscribers:
            subscriber.on_next(event)

    def events_for(self, aggregate_id: str) -> Observable[Event]:
        """Retourne les événements d'un agrégat."""
        return Observable.from_iterable([
            e for e in self._events
            if e.aggregate_id == aggregate_id
        ])

    def all_events(self) -> Observable[Event]:
        """Retourne tous les événements."""
        return Observable.from_iterable(self._events)

    def subscribe_to_new_events(self) -> Observable[Event]:
        """S'abonne aux nouveaux événements."""
        store = self

        def subscribe(subscriber: Subscriber[Event]):
            subscription = BaseSubscription()
            subscriber.on_subscribe(subscription)
            store._subscribers.append(subscriber)

        return Observable(subscribe)


class ReactiveAggregate:
    """Agrégat réactif."""

    def __init__(self, aggregate_id: str, event_store: ReactiveEventStore):
        self._id = aggregate_id
        self._event_store = event_store
        self._version = 0

    def load(self) -> Observable["ReactiveAggregate"]:
        """Charge l'agrégat depuis les événements."""
        aggregate = self

        def subscribe(subscriber: Subscriber["ReactiveAggregate"]):
            class LoadSubscriber(Subscriber[Event]):
                def on_subscribe(self, subscription: Subscription):
                    pass

                def on_next(self, event: Event):
                    aggregate._apply_event(event)

                def on_error(self, error: Exception):
                    subscriber.on_error(error)

                def on_complete(self):
                    subscriber.on_next(aggregate)
                    subscriber.on_complete()

            aggregate._event_store.events_for(aggregate._id).subscribe(LoadSubscriber())

        return Observable(subscribe)

    def _apply_event(self, event: Event) -> None:
        """Applique un événement à l'état."""
        self._version += 1
        # Override in subclass

    def emit(self, event: Event) -> None:
        """Émet un nouvel événement."""
        self._event_store.append(event)
        self._apply_event(event)
```

### 5. Reactive Web Service

```python
@dataclass
class HttpRequest:
    method: str
    path: str
    headers: Dict[str, str]
    body: Optional[str] = None


@dataclass
class HttpResponse:
    status: int
    headers: Dict[str, str]
    body: str


class ReactiveHttpHandler:
    """Handler HTTP réactif."""

    def __init__(self):
        self._routes: Dict[str, Callable[[HttpRequest], Observable[HttpResponse]]] = {}

    def route(self, method: str, path: str):
        """Décorateur pour enregistrer une route."""
        def decorator(handler: Callable[[HttpRequest], Observable[HttpResponse]]):
            key = f"{method}:{path}"
            self._routes[key] = handler
            return handler
        return decorator

    def handle(self, request: HttpRequest) -> Observable[HttpResponse]:
        """Traite une requête."""
        key = f"{request.method}:{request.path}"

        if key not in self._routes:
            return Observable.just(HttpResponse(
                status=404,
                headers={"Content-Type": "application/json"},
                body='{"error": "Not found"}'
            ))

        handler = self._routes[key]
        return handler(request)


class ReactiveWebServer:
    """Serveur web réactif."""

    def __init__(self, handler: ReactiveHttpHandler):
        self._handler = handler
        self._request_count = 0

    def process_request(self, request: HttpRequest) -> Observable[HttpResponse]:
        """Traite une requête avec métriques."""
        self._request_count += 1
        start_time = time.time()

        return self._handler.handle(request).map(
            lambda response: self._add_metrics(response, start_time)
        )

    def _add_metrics(self, response: HttpResponse, start_time: float) -> HttpResponse:
        """Ajoute les métriques à la réponse."""
        duration = time.time() - start_time
        response.headers["X-Response-Time"] = f"{duration:.3f}s"
        return response

    @property
    def metrics(self) -> Observable[Dict[str, Any]]:
        """Observable des métriques."""
        return Observable.just({
            "request_count": self._request_count
        })
```

### 6. Application Complète

```python
class PrintSubscriber(Subscriber[T], Generic[T]):
    """Subscriber qui imprime les éléments."""

    def __init__(self, name: str = ""):
        self._name = name
        self._subscription: Optional[Subscription] = None

    def on_subscribe(self, subscription: Subscription):
        self._subscription = subscription
        subscription.request(100)  # Request initial batch
        print(f"[{self._name}] Subscribed")

    def on_next(self, item: T):
        print(f"[{self._name}] Received: {item}")

    def on_error(self, error: Exception):
        print(f"[{self._name}] Error: {error}")

    def on_complete(self):
        print(f"[{self._name}] Completed")


class CollectSubscriber(Subscriber[T], Generic[T]):
    """Subscriber qui collecte les éléments."""

    def __init__(self):
        self.items: List[T] = []
        self.completed = False
        self.error: Optional[Exception] = None

    def on_subscribe(self, subscription: Subscription):
        subscription.request(1000)

    def on_next(self, item: T):
        self.items.append(item)

    def on_error(self, error: Exception):
        self.error = error

    def on_complete(self):
        self.completed = True


async def main():
    print("=" * 70)
    print("Reactive Architecture Demo")
    print("=" * 70)

    print("\n--- Basic Observable Operations ---\n")

    # Create and transform observables
    numbers = Observable.just(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

    # Map
    print("Map (x * 2):")
    collector = CollectSubscriber()
    numbers.map(lambda x: x * 2).subscribe(collector)
    print(f"  Result: {collector.items}")

    # Filter
    print("\nFilter (x > 5):")
    collector = CollectSubscriber()
    numbers.filter(lambda x: x > 5).subscribe(collector)
    print(f"  Result: {collector.items}")

    # Combined
    print("\nCombined (filter > 3, then map * 10):")
    collector = CollectSubscriber()
    numbers.filter(lambda x: x > 3).map(lambda x: x * 10).subscribe(collector)
    print(f"  Result: {collector.items}")

    # Take
    print("\nTake (first 3):")
    collector = CollectSubscriber()
    numbers.take(3).subscribe(collector)
    print(f"  Result: {collector.items}")

    # Reduce
    print("\nReduce (sum):")
    collector = CollectSubscriber()
    numbers.reduce(lambda acc, x: acc + x, 0).subscribe(collector)
    print(f"  Result: {collector.items}")

    # Buffer
    print("\nBuffer (size 3):")
    collector = CollectSubscriber()
    numbers.buffer(3).subscribe(collector)
    print(f"  Result: {collector.items}")

    print("\n--- Reactive Event Store ---\n")

    event_store = ReactiveEventStore()

    # Subscribe to new events
    print("Subscribing to new events...")

    event_store.subscribe_to_new_events().subscribe(
        PrintSubscriber("EventListener")
    )

    # Append events
    event_store.append(Event(
        event_id="evt-1",
        aggregate_id="order-123",
        event_type="OrderCreated",
        data={"customer_id": "cust-456"}
    ))

    event_store.append(Event(
        event_id="evt-2",
        aggregate_id="order-123",
        event_type="ItemAdded",
        data={"product_id": "prod-789", "quantity": 2}
    ))

    await asyncio.sleep(0.1)

    print("\n--- Reactive Web Server ---\n")

    handler = ReactiveHttpHandler()

    @handler.route("GET", "/users")
    def get_users(request: HttpRequest) -> Observable[HttpResponse]:
        users = [
            {"id": 1, "name": "Alice"},
            {"id": 2, "name": "Bob"}
        ]
        return Observable.just(HttpResponse(
            status=200,
            headers={"Content-Type": "application/json"},
            body=str(users)
        ))

    @handler.route("GET", "/health")
    def health_check(request: HttpRequest) -> Observable[HttpResponse]:
        return Observable.just(HttpResponse(
            status=200,
            headers={"Content-Type": "application/json"},
            body='{"status": "healthy"}'
        ))

    server = ReactiveWebServer(handler)

    # Simulate requests
    requests = [
        HttpRequest("GET", "/users", {}),
        HttpRequest("GET", "/health", {}),
        HttpRequest("GET", "/unknown", {})
    ]

    for req in requests:
        print(f"Request: {req.method} {req.path}")
        server.process_request(req).subscribe(PrintSubscriber("Response"))

    await asyncio.sleep(0.1)

    print("\n--- Circuit Breaker ---\n")

    circuit_breaker = ReactiveCircuitBreaker(
        failure_threshold=3,
        success_threshold=2,
        timeout=5.0
    )

    # Subscribe to state changes
    circuit_breaker.state_changes.subscribe(PrintSubscriber("CircuitBreaker"))

    # Simulate failures
    for i in range(5):
        try:
            if i < 3:
                # Simulate failure
                failing_obs = Observable.error(Exception("Service unavailable"))
                circuit_breaker.wrap(failing_obs).subscribe(PrintSubscriber(f"Attempt-{i}"))
            else:
                # Circuit should be open now
                success_obs = Observable.just("Success!")
                circuit_breaker.wrap(success_obs).subscribe(PrintSubscriber(f"Attempt-{i}"))
        except Exception as e:
            print(f"  Caught: {e}")

    await asyncio.sleep(0.1)

    print("\n--- Reactive Patterns Summary ---\n")
    print("""
    Reactive Streams Components:
    - Publisher: Source of data
    - Subscriber: Consumer of data
    - Subscription: Connection between Publisher and Subscriber
    - Processor: Both Publisher and Subscriber

    Operators Implemented:
    - map: Transform each element
    - filter: Filter elements
    - flatMap: Transform and flatten
    - take: Take first n elements
    - reduce: Reduce to single value
    - buffer: Group into batches
    - debounce: Emit after quiet period

    Backpressure Strategies:
    - BUFFER: Buffer all items
    - DROP: Drop items if buffer full
    - LATEST: Keep only latest item
    - ERROR: Error if buffer overflows

    Advanced Patterns:
    - Circuit Breaker: Protect against cascading failures
    - Event Sourcing: Store events reactively
    - Reactive Web Server: Handle requests reactively
    """)


if __name__ == "__main__":
    asyncio.run(main())
```

## Diagramme d'Architecture Reactive

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Reactive System Architecture                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                          API Gateway                                     ││
│  │                    (Reactive HTTP Server)                                ││
│  └────────────────────────────┬────────────────────────────────────────────┘│
│                               │                                              │
│                    ┌──────────┴──────────┐                                  │
│                    ▼                     ▼                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                  │
│  │     Service A           │  │     Service B           │                  │
│  │  ┌───────────────────┐  │  │  ┌───────────────────┐  │                  │
│  │  │ Circuit Breaker   │  │  │  │ Circuit Breaker   │  │                  │
│  │  └─────────┬─────────┘  │  │  └─────────┬─────────┘  │                  │
│  │            │            │  │            │            │                  │
│  │  ┌─────────▼─────────┐  │  │  ┌─────────▼─────────┐  │                  │
│  │  │  Event Stream     │  │  │  │  Event Stream     │  │                  │
│  │  │  Processing       │  │  │  │  Processing       │  │                  │
│  │  └─────────┬─────────┘  │  │  └─────────┬─────────┘  │                  │
│  │            │            │  │            │            │                  │
│  │  ┌─────────▼─────────┐  │  │  ┌─────────▼─────────┐  │                  │
│  │  │   Backpressure    │  │  │  │   Backpressure    │  │                  │
│  │  │    Control        │  │  │  │    Control        │  │                  │
│  │  └───────────────────┘  │  │  └───────────────────┘  │                  │
│  └────────────┬────────────┘  └────────────┬────────────┘                  │
│               │                            │                                │
│               └────────────┬───────────────┘                                │
│                            ▼                                                │
│              ┌─────────────────────────────┐                               │
│              │    Message Broker           │                               │
│              │  (Reactive Event Bus)       │                               │
│              └──────────────┬──────────────┘                               │
│                             │                                               │
│              ┌──────────────┴──────────────┐                               │
│              ▼                             ▼                               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                  │
│  │   Event Store           │  │   Read Models           │                  │
│  │  (Reactive Storage)     │  │  (Projections)          │                  │
│  └─────────────────────────┘  └─────────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Avantages de l'Architecture Reactive

1. **Responsiveness** - Temps de réponse prévisibles
2. **Resilience** - Récupération automatique des erreurs
3. **Elasticity** - Scale automatique selon la charge
4. **Message-Driven** - Découplage via messages asynchrones

## Quand Utiliser

- Applications temps réel (trading, IoT, gaming)
- Systèmes à haute disponibilité
- Applications avec charge variable
- Architectures microservices
