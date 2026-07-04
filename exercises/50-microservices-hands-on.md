# Microservices Hands-On — Latihan

## Level 1: Dasar

### 1. Bounded Context — Monolith to Microservices
**Pertanyaan:** Pecah monolith e-commerce menjadi microservices berdasarkan bounded context:

```typescript
// === LENGKAPI: Identifikasi bounded context ===
// Monolith saat ini handle semua fitur:
// - User management (register, login, profile)
// - Product catalog (CRUD products, categories, search)
// - Shopping cart (add, remove, checkout)
// - Order management (create, track, history)
// - Payment processing (Midtrans, GoPay, transfer)
// - Shipping (calculate cost, track delivery)
// - Review & rating
// - Notification (email, push, SMS)

// === LENGKAPI: Bagi ke microservices ===
// Tentukan service apa aja yang perlu dibuat
// Service 1: ?
// Service 2: ?
// Service 3: ?
// ...
// Masing-masing dengan database sendiri

// === LENGKAPI: Database per service ===
// Tentukan database yang tepat tiap service (PostgreSQL, MongoDB, Redis?)
// Service 1 -> Database: ? (kenapa?)
// Service 2 -> Database: ? (kenapa?)
```

```
// === LENGKAPI: API endpoints per service ===
// Buat daftar endpoint untuk tiap service
// Format: METHOD /path -> Deskripsi
```

1. Identifikasi minimal 5 bounded context
2. Tentukan database strategy per service
3. Gambar arsitektur komunikasi antar service

**Hint:** Bounded context = area bisnis yang punya ubiquitous language sendiri. User Service: PostgreSQL (relational, ACID). Product Catalog: PostgreSQL atau MongoDB (full-text search). Cart: Redis (fast, temporary). Order: PostgreSQL (transactional). Payment: PostgreSQL (financial, audit trail). Notification: MongoDB (high write volume). Communication: REST untuk synchronous (query), RabbitMQ untuk asynchronous (events).

---

### 2. Docker Compose — Multi-Service Setup
**Pertanyaan:** Setup docker-compose untuk 3 microservices + database + message queue:

```yaml
# === LENGKAPI: docker-compose.yml ===
version: '3.8'

services:
  user-service:
    build: ./services/user-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@user-db:5432/users
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    # === LENGKAPI: depends_on, restart, healthcheck ===
    depends_on:
      user-db:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
  
  product-service:
    build: ./services/product-service
    ports:
      - "3002:3002"
    # === LENGKAPI: environment + depends_on ===
  
  order-service:
    build: ./services/order-service
    ports:
      - "3003:3003"
    # === LENGKAPI: environment + depends_on ===
  
  user-db:
    image: postgres:16-alpine
    # === LENGKAPI: volume, environment, healthcheck ===
  
  product-db:
    image: postgres:16-alpine
    # === LENGKAPI ===
  
  order-db:
    image: postgres:16-alpine
    # === LENGKAPI ===
  
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"   # AMQP
      - "15672:15672" # Management UI
    # === LENGKAPI: healthcheck ===
  
  # === LENGKAPI: Tambah network configuration ===
  # Buat network internal untuk service communication
```

1. Lengkapi docker-compose untuk semua service
2. Setup health check untuk setiap dependency
3. Buat Dockerfile untuk tiap service (multi-stage, production)
4. Test: `docker compose up` dan verifikasi semua service connected

**Hint:** Network: `networks: { internal: {} }`, service pakai `networks: [internal]`. Healthcheck untuk PostgreSQL: `test: ["CMD-SHELL", "pg_isready -U user -d users"]`. RabbitMQ healthcheck: `test: ["CMD", "rabbitmq-diagnostics", "check_port_connectivity"]`. Depends_on: `condition: service_healthy` untuk nunggu dependency beneran siap.

---

### 3. gRPC Service — Inter-Service Communication
**Pertanyaan:** Implementasi gRPC service untuk komunikasi antar microservices:

```protobuf
// === LENGKAPI: Proto definition ===
// proto/user.proto
syntax = "proto3";

package user;

// === LENGKAPI: User service definition ===
service UserService {
  // Get user by ID
  rpc GetUser (GetUserRequest) returns (GetUserResponse);
  
  // === LENGKAPI: Tambah RPC berikut ===
  // 1. ValidateUser — validasi user exists + role
  // 2. GetUsersByIds — batch get users (untuk order service)
  // 3. UpdateUserStatus — update user status (active/suspended)
}

message GetUserRequest {
  string user_id = 1;
}

message GetUserResponse {
  // === LENGKAPI: Field definition ===
  // id, email, name, role, status, createdAt
  string id = 1;
  // ...
}
```

```typescript
// === LENGKAPI: gRPC server implementation ===
// services/user-service/src/grpc/server.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

// === LENGKAPI: ===
// 1. Load proto file
// 2. Implement service methods
// 3. Start gRPC server di port 50051

const packageDefinition = protoLoader.loadSync('./proto/user.proto');
const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;

// === LENGKAPI: Implement UserService ===
const server = new grpc.Server();
server.addService(userProto.UserService.service, {
  getUsersByIds: async (call, callback) => {
    // === LENGKAPI: Batch get users by IDs ===
  },
  // ...
});
```

1. Lengkapi proto definition untuk UserService
2. Implementasi gRPC server dan client
3. Test komunikasi: order-service call user-service via gRPC

**Hint:** gRPC vs REST: gRPC pakai Protocol Buffers (binary, lebih cepat), HTTP/2 (streaming), typed contract. Proto: `string`, `int32`, `repeated` untuk array. Server: `server.bindAsync('0.0.0.0:50051', ...)`. Client: `new userProto.UserService('user-service:50051', grpc.credentials.createInsecure())`. Deadline: `call.setDeadline(new Date(Date.now() + 5000))`.

---

## Level 2: Intermediate

### 4. RabbitMQ — Pub/Sub Pattern
**Pertanyaan:** Setup RabbitMQ untuk event-driven communication:

```typescript
// === LENGKAPI: Event publisher ===
// services/order-service/src/events/publisher.ts
import amqp from 'amqplib';

export class EventPublisher {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  
  async connect() {
    // === LENGKAPI: ===
    // 1. Connect ke RabbitMQ
    // 2. Create channel
    // 3. Assert exchange: 'order.events' tipe 'topic'
    // 4. Handle connection close & reconnect
  }
  
  async publishOrderCreated(order: Order) {
    // === LENGKAPI: ===
    // 1. Routing key: 'order.created'
    // 2. Message: order data (JSON)
    // 3. Persistent delivery mode
    // 4. Log published event
  }
  
  // === LENGKAPI: Tambah method ===
  // publishOrderShipped(order)
  // publishOrderCancelled(order, reason)
}
```

```typescript
// === LENGKAPI: Event consumer ===
// services/notification-service/src/events/consumer.ts
export class EventConsumer {
  async consume() {
    // === LENGKAPI: ===
    // 1. Connect ke RabbitMQ
    // 2. Create channel
    // 3. Assert exchange: 'order.events' tipe 'topic'
    // 4. Create queue: 'notification.order.created'
    // 5. Bind queue ke exchange dengan routing key 'order.created'
    // 6. Consume messages
    // 7. Acknowledge setelah sukses, reject kalau gagal
    // 8. Handle dead letter untuk failed messages
    
    const channel = await this.connection.createChannel();
    await channel.assertExchange('order.events', 'topic', { durable: true });
    const queue = await channel.assertQueue('notification.order.created', { 
      durable: true,
      // === LENGKAPI: Dead letter configuration ===
    });
    
    await channel.bindQueue(queue.queue, 'order.events', 'order.created');
    channel.consume(queue.queue, async (msg) => {
      try {
        const order = JSON.parse(msg.content.toString());
        await this.sendEmailNotification(order);
        // === LENGKAPI: Acknowledge message ===
        channel.ack(msg);
      } catch (error) {
        // === LENGKAPI: Handle failure (reject or dead letter) ===
      }
    });
  }
}
```

1. Lengkapi publisher dan consumer
2. Setup dead letter queue untuk failed messages
3. Test: buat order → cek queue → verifikasi consumer terima event
4. Monitor RabbitMQ Management UI di http://localhost:15672

**Hint:** Topic exchange: routing key pattern `order.*` atau `order.created`. Persistent: `{ persistent: true }`. Acknowledge: `channel.ack(msg)` sukses, `channel.nack(msg, false, false)` gagal → dead letter. Dead letter: `arguments: { 'x-dead-letter-exchange': 'order.dlx' }`. Reconnect: `connection.on('close', () => setTimeout(connect, 5000))`.

---

### 5. API Gateway — Traefik Setup
**Pertanyaan:** Setup Traefik sebagai API Gateway untuk microservices:

```yaml
# === LENGKAPI: traefik/traefik.yml ===
# Static configuration
api:
  dashboard: true

entryPoints:
  web:
    address: ":80"
  # === LENGKAPI: HTTPS entry point ===

providers:
  docker:
    exposedByDefault: false
  # === LENGKAPI: File provider untuk custom routes ===

# === LENGKAPI: ===
# 1. Let's Encrypt certificate resolver
# 2. Rate limiting middleware
# 3. Authentication middleware (basic auth untuk dashboard)
```

```yaml
# === LENGKAPI: Docker Compose dengan Traefik ===
services:
  traefik:
    image: traefik:v3.0
    ports:
      - "80:80"
      - "443:443"  # HTTPS
      - "8080:8080"  # Dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik/traefik.yml:/traefik.yml:ro
    # === LENGKAPI: Labels untuk routing ===
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`traefik.example.com`)"
  
  user-service:
    build: ./services/user-service
    # === LENGKAPI: Traefik labels ===
    # 1. Expose service
    # 2. Route: Host(`api.example.com`) && PathPrefix(`/api/users`)
    # 3. Load balancer
    # 4. Rate limit: 100 req/min
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.users.rule=Host(`api.example.com`) && PathPrefix(`/api/users`)"
      # === LENGKAPI ===
  
  product-service:
    build: ./services/product-service
    # === LENGKAPI: Route /api/products ===
  
  order-service:
    build: ./services/order-service
    # === LENGKAPI: Route /api/orders ===
```

1. Lengkapi Traefik static configuration
2. Setup routing untuk semua service
3. Tambahkan middleware: rate limiting, CORS, authentication
4. Test: akses API via gateway (http://localhost/api/users)

**Hint:** Traefik labels: `traefik.http.routers.<name>.rule`, `traefik.http.services.<name>.loadbalancer.server.port`. PathPrefix: `PathPrefix(\`/api/users\`)` akan route semua request mulai `/api/users/*`. Middleware: `traefik.http.middlewares.rateLimit.rateLimit.average=100, traefik.http.middlewares.rateLimit.rateLimit.burst=50`. Dashboard: akses port 8080, tambah basic auth.

---

### 6. Service Discovery — With Consul
**Pertanyaan:** Setup service discovery dengan Consul:

```yaml
# === LENGKAPI: Docker Compose dengan Consul ===
services:
  consul:
    image: consul:1.15
    ports:
      - "8500:8500"  # UI
      - "8600:8600/udp"  # DNS
    command: agent -server -bootstrap-expect=1 -ui -client=0.0.0.0
    # === LENGKAPI: health check untuk Consul ===
  
  user-service:
    build: ./services/user-service
    # === LENGKAPI: Auto-register ke Consul ===
    # Set environment: CONSUL_HOST=consul, SERVICE_NAME=user-service, SERVICE_PORT=3001
  
  # === LENGKAPI: Service discovery client ===
```

```typescript
// === LENGKAPI: Consul service registration ===
// shared/consul.ts
import Consul from 'consul';

export async function registerService(serviceName: string, port: number) {
  const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
  });
  
  // === LENGKAPI: ===
  // 1. Register service dengan ID unik, name, port
  // 2. Set health check endpoint (/healthz)
  // 3. Set check interval: 10s
  // 4. Add tags: version, environment
  // 5. Deregister on shutdown
  
  await consul.agent.service.register({
    id: `${serviceName}-${process.env.HOSTNAME}`,
    name: serviceName,
    port: port,
    // === LENGKAPI ===
  });
}
```

1. Lengkapi Consul service registration
2. Setup health check untuk auto-healing
3. Implementasi service discovery client (cari service by name)
4. Test: scale service → Consul detect otomatis

**Hint:** Consul: distributed key-value store + service discovery + health checking. DNS: `user-service.service.consul` resolve ke IP. HTTP API: `GET /v1/catalog/service/user-service`. Auto-register: panggil `registerService()` di startup. Deregister: `consul.agent.service.deregister(id)` di graceful shutdown. Health check: `check: { http: 'http://host:port/healthz', interval: '10s' }`.

---

### 7. Distributed Tracing — OpenTelemetry
**Pertanyaan:** Setup distributed tracing dengan OpenTelemetry:

```typescript
// === LENGKAPI: OpenTelemetry setup ===
// shared/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// === LENGKAPI: ===
// 1. Init resource dengan service name dan version
// 2. Setup OTLP exporter (send ke Jaeger/Grafana Tempo)
// 3. Add auto-instrumentations (HTTP, gRPC, database)
// 4. Setup sampler (always sample in dev, ratio in prod)

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME,
    // === LENGKAPI ===
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTLP_ENDPOINT || 'http://jaeger:4317',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // === LENGKAPI: Configure specific instrumentations ===
      '@opentelemetry/instrumentation-http': { /* ... */ },
      '@opentelemetry/instrumentation-express': { /* ... */ },
    }),
  ],
});

sdk.start();
```

```yaml
# === LENGKAPI: Docker Compose tracing stack ===
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # UI
      - "4317:4317"    # OTLP gRPC
      - "4318:4318"    # OTLP HTTP
    # === LENGKAPI: environment variables ===
```

1. Lengkapi OpenTelemetry setup
2. Setup Jaeger untuk visualize traces
3. Trace request yang melewati 3 services (user → order → payment)
4. Analisis waterfall timing di Jaeger UI

**Hint:** OpenTelemetry: vendor-agnostic observability framework. Context propagation: trace header otomatis di-pass antar service via HTTP/gRPC. Jaeger UI: http://localhost:16686 — search by service, view trace waterfall. Sampler: `AlwaysOnSampler()` for dev, `TraceIdRatioBased(0.1)` for prod (10% sampling). Auto-instrumentations: otomatis capture HTTP request/response, database queries, gRPC calls.

---

### 8. Resilience — Circuit Breaker & Retry
**Pertanyaan:** Implementasi circuit breaker dan retry pattern:

```typescript
// === LENGKAPI: Circuit breaker ===
// shared/resilience/circuit-breaker.ts
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly successThreshold: number = 2,
    private readonly timeout: number = 30000
  ) {}
  
  // === LENGKAPI: ===
  // 1. Call method — execute function with circuit breaker
  // 2. Kalau circuit OPEN: throw error (fast fail)
  // 3. Kalau circuit HALF_OPEN: allow limited requests
  // 4. Track success/failure, switch state
  // 5. Reset failure count on success
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // === LENGKAPI: Check if timeout expired → HALF_OPEN ===
      // === LENGKAPI: If still OPEN → throw CircuitBreakerOpenError ===
    }
    
    try {
      const result = await fn();
      // === LENGKAPI: Track success ===
      return result;
    } catch (error) {
      // === LENGKAPI: Track failure ===
      throw error;
    }
  }
}
```

```typescript
// === LENGKAPI: Retry with exponential backoff ===
// shared/resilience/retry.ts
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    retryableErrors?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // === LENGKAPI: ===
      // 1. Check if error is retryable
      // 2. Calculate delay with exponential backoff + jitter
      // 3. Wait before next attempt
      // 4. Log retry attempt
    }
  }
}
```

1. Lengkapi circuit breaker implementation
2. Implementasi retry with exponential backoff + jitter
3. Integrasikan di service-to-service calls
4. Test: matikan dependency → circuit harus OPEN → service tetap responsif

**Hint:** Circuit states: CLOSED (normal) → OPEN (failure threshold exceeded) → HALF_OPEN (timeout expired, allow test request) → CLOSED (success threshold met). Exponential backoff: `delay = min(baseDelay * Math.pow(2, attempt - 1), maxDelay)`. Jitter: `delay * (0.5 + Math.random() * 0.5)`. Retryable: 5xx, network error. Non-retryable: 4xx (client error).
