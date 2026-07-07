---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🧩 Microservices Hands-On"
footer: "Sesi 03: Inter Service Comm"
---

<!-- _class: title -->
# Sesi 03: Inter-Service Communication

**Durasi:** 120 menit  
**Prerequisites:** Sesi 01, Sesi 02

---

## 📌 Tujuan

- Merancang REST API internal antar service
- Implementasi gRPC untuk komunikasi performa tinggi
- Menggunakan message queue (RabbitMQ) untuk event-driven
- Menerapkan Saga pattern untuk distributed transaction
- Menangani failure dengan timeout, retry, circuit breaker

---

## 1. REST — Internal API Design

### 1.1 Internal vs Public API

```typescript
// ❌ JANGAN: Service internal pake API yang sama dengan public
// Public API: /api/users — lengkap dengan auth, rate limit, dll
// Internal API: /internal/users — langsung, tanpa overhead

// ✅ PISAHKAN: Internal endpoint
// user-service
router.get('/internal/users/:id', async (req, res) => {
  const user = await userService.findById(req.params.id);
  // Langsung return — tanpa auth check (sudah di-handle caller)
  res.json({ success: true, data: user });
});

router.get('/users/:id', authenticate, async (req, res) => {
  // Public endpoint — dengan auth, validasi, rate limit
  const user = await userService.findById(req.params.id);
  res.json({ success: true, data: user });
});
```

### 1.2 Timeout & Retry

```typescript
// services/order-service/src/clients/user-client.ts
import axios from 'axios';
import axiosRetry from 'axios-retry';

const userClient = axios.create({
  baseURL: 'http://user-service:3001',
  timeout: 5000,           // 5 detik — jangan sampai nunggu lama
  headers: {
    'X-Internal-Call': 'true',
    'X-Service-Name': 'order-service',
  },
});

// Retry logic — 3 kali, exponential backoff
axiosRetry(userClient, {
  retries: 3,
  retryDelay: (retryCount) => {
    return Math.pow(2, retryCount) * 200; // 400ms, 800ms, 1600ms
  },
  retryCondition: (error) => {
    // Retry cuma untuk transient errors
    return [
      'ECONNABORTED',  // timeout
      'ECONNRESET',    // connection reset
      'ERR_NETWORK',   // network error
    ].includes(error.code || '')
    || (error.response?.status ?? 0) >= 500; // server error
  },
});
```

### 1.3 Circuit Breaker

```typescript
// circuit-breaker.ts — Opossum implementation
import CircuitBreaker from 'opossum';

const options = {
  timeout: 3000,              // Timeout per request: 3 detik
  errorThresholdPercentage: 50, // Jika 50% request gagal → open circuit
  resetTimeout: 30000,        // Coba lagi setelah 30 detik
  name: 'user-service',
};

const breaker = new CircuitBreaker(async (userId: string) => {
  const response = await userClient.get(`/internal/users/${userId}`);
  return response.data;
}, options);

// Event listeners
breaker.on('open', () => console.warn('[CB] Circuit OPEN — user-service down'));
breaker.on('halfOpen', () => console.info('[CB] Circuit HALF-OPEN — testing...'));
breaker.on('close', () => console.info('[CB] Circuit CLOSED — user-service back'));

// Fallback — kalau circuit open
breaker.fallback(() => ({
  success: true,
  data: { id: 'unknown', name: 'Unknown User', email: 'unknown@fallback' },
  fromCache: true,
}));

// Usage
async function getUser(userId: string) {
  try {
    const result = await breaker.fire(userId);
    return result.data;
  } catch (error) {
    console.error('[CB] All retries exhausted', error);
    throw new Error('User service unavailable');
  }
}
```

### 1.4 Correlation ID

```typescript
// correlation-id.ts — trace request antar service
import { v4 as uuidv4 } from 'uuid';

// Middleware: inject correlation ID dari request masuk
function correlationMiddleware(req: any, res: any, next: any) {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  
  // Propagate ke downstream calls
  req.downstreamHeaders = {
    'X-Correlation-Id': correlationId,
    'X-Service-Name': process.env.SERVICE_NAME || 'unknown',
  };
  
  next();
}

// Axios interceptor: attach correlation ID ke semua outgoing request
axiosInstance.interceptors.request.use((config) => {
  const correlationId = getCurrentCorrelationId(); // dari AsyncLocalStorage
  config.headers['X-Correlation-Id'] = correlationId;
  return config;
});
```

---

## 2. gRPC — High-Performance Communication

### 2.1 Protobuf Service Definition

```protobuf
// proto/user.proto
syntax = "proto3";

package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (ListUsersResponse);
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc UpdateUser (UpdateUserRequest) returns (User);
  
  // Server streaming: kirim list user satu per satu
  rpc StreamUsers (StreamUsersRequest) returns (stream User);
  
  // Bidirectional streaming: chat antar service
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);
}

message GetUserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  string role = 4;
  int64 created_at = 5;  // Unix timestamp
}

message ListUsersRequest {
  int32 page = 1;
  int32 limit = 2;
  string role_filter = 3;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
  int32 page = 3;
}

message StreamUsersRequest {
  string role = 1;
}

message ChatMessage {
  string from_service = 1;
  string to_service = 2;
  string message = 3;
  int64 timestamp = 4;
}
```

### 2.2 gRPC Server (TypeScript)

```typescript
// services/user-service/src/grpc/server.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { UserService } from './services/user-service';

const PROTO_PATH = __dirname + '/../../../proto/user.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;

function startGrpcServer() {
  const server = new grpc.Server();
  
  server.addService(userProto.UserService.service, {
    GetUser: async (call: any, callback: any) => {
      try {
        const user = await UserService.findById(call.request.id);
        callback(null, user);
      } catch (error) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: `User ${call.request.id} not found`,
        });
      }
    },
    
    ListUsers: async (call: any, callback: any) => {
      const { page, limit, role_filter } = call.request;
      const result = await UserService.findAll({ page, limit, role: role_filter });
      callback(null, result);
    },
    
    // Server streaming
    StreamUsers: (call: any) => {
      const { role } = call.request;
      const stream = UserService.streamUsers(role);
      
      stream.on('data', (user: any) => {
        call.write(user); // kirim satu per satu
      });
      
      stream.on('end', () => {
        call.end(); // selesai streaming
      });
    },
    
    // Bidirectional streaming
    Chat: (call: any) => {
      call.on('data', (message: any) => {
        console.log(`[Chat] ${message.from_service} -> ${message.to_service}: ${message.message}`);
        
        // Echo back — atau forward ke service lain
        call.write({
          ...message,
          timestamp: Date.now(),
        });
      });
      
      call.on('end', () => call.end());
    },
  });
  
  const address = `0.0.0.0:${process.env.GRPC_PORT || 50051}`;
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`[gRPC] Server listening on ${address}`);
    server.start();
  });
}
```

### 2.3 gRPC Client

```typescript
// services/order-service/src/clients/user-grpc-client.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = __dirname + '/../../../../proto/user.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;

class UserGrpcClient {
  private client: any;
  
  constructor() {
    this.client = new userProto.UserService(
      'user-service:50051',
      grpc.credentials.createInsecure()
    );
  }
  
  // Unary call — mirip REST
  async getUser(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetUser({ id }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }
  
  // Server streaming — dengerin stream
  streamUsers(role?: string): AsyncIterable<any> {
    const call = this.client.StreamUsers({ role: role || '' });
    
    return {
      [Symbol.asyncIterator]: () => ({
        next: () => new Promise((resolve) => {
          call.on('data', (user: any) => resolve({ value: user, done: false }));
          call.on('end', () => resolve({ value: undefined, done: true }));
        }),
      }),
    };
  }
  
  // Bidirectional streaming
  createChat() {
    const call = this.client.Chat();
    
    return {
      send: (toService: string, message: string) => {
        call.write({
          from_service: 'order-service',
          to_service: toService,
          message,
          timestamp: Date.now(),
        });
      },
      onMessage: (handler: Function) => {
        call.on('data', handler);
      },
      close: () => call.end(),
    };
  }
}
```

---

## 3. Message Queue — RabbitMQ

### 3.1 Kapan Pakai Message Queue

| Situasi | Pakai REST? | Pakai Queue? |
|---------|------------|--------------|
| Butuh response langsung (get user) | ✅ | ❌ |
| Butuh reliability (order harus diproses) | ❌ | ✅ |
| Satu event → banyak listener | ❌ | ✅ |
| Butuh retry & dead letter | ❌ | ✅ |
| Latency rendah | ✅ | ❌ |

### 3.2 RabbitMQ Setup

```typescript
// shared/message-bus.ts
import amqp from 'amqplib';

class MessageBus {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;
  
  async connect(url: string = process.env.RABBITMQ_URL || 'amqp://localhost') {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    
    // Graceful shutdown
    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
  }
  
  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }
  
  // ================
  // Exchange & Queue
  // ================
  
  async setupExchanges() {
    // Direct exchange: routing by exact routing key
    await this.channel.assertExchange('orders.direct', 'direct', { durable: true });
    
    // Topic exchange: routing by pattern
    await this.channel.assertExchange('events.topic', 'topic', { durable: true });
    
    // Fanout exchange: broadcast to all queues
    await this.channel.assertExchange('notifications.fanout', 'fanout', { durable: true });
  }
  
  async setupQueues() {
    // Order queues
    await this.channel.assertQueue('orders.create', { durable: true });
    await this.channel.assertQueue('orders.payment', { durable: true });
    await this.channel.assertQueue('orders.shipping', { durable: true });
    
    // Dead letter queue
    await this.channel.assertQueue('orders.dlq', { durable: true });
    
    // Bind queues
    await this.channel.bindQueue('orders.create', 'orders.direct', 'order.created');
    await this.channel.bindQueue('orders.payment', 'orders.direct', 'order.paid');
    await this.channel.bindQueue('orders.shipping', 'orders.direct', 'order.shipped');
  }
  
  // ================
  // Publish
  // ================
  
  async publish<T>(exchange: string, routingKey: string, message: T) {
    const correlationId = getCurrentCorrelationId();
    
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        headers: {
          'x-correlation-id': correlationId,
          'x-service': process.env.SERVICE_NAME,
        },
      }
    );
    
    console.log(`[MQ] Published ${routingKey} (correlationId: ${correlationId})`);
  }
  
  // ================
  // Consume
  // ================
  
  async consume(queue: string, handler: (msg: any) => Promise<void>) {
    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const content = JSON.parse(msg.content.toString());
        console.log(`[MQ] Consumed ${msg.fields.routingKey}`);
        
        await handler(content);
        
        // Acknowledge — message sukses diproses
        this.channel.ack(msg);
      } catch (error) {
        console.error(`[MQ] Error processing ${msg.fields.routingKey}:`, error);
        
        // Reject — kirim ke DLQ setelah 3 retry
        const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;
        
        if (retryCount >= 3) {
          console.warn(`[MQ] Sending to DLQ after ${retryCount} retries`);
          this.channel.reject(msg, false); // false = no requeue → masuk DLQ
        } else {
          // Retry dengan delay
          const delayMs = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            this.channel.publish(
              msg.fields.exchange,
              msg.fields.routingKey,
              msg.content,
              { headers: { 'x-retry-count': retryCount } }
            );
            this.channel.ack(msg); // ack yang lama
          }, delayMs);
        }
      }
    });
  }
}

export const messageBus = new MessageBus();
```

### 3.3 Event Schema

```typescript
// shared/events.ts — semua event dalam sistem

// Setiap event punya schema yang strict
interface BaseEvent {
  id: string;           // UUID — unique
  type: string;         // Event type
  source: string;       // Service name
  correlationId: string;
  timestamp: number;    // Unix ms
  version: number;      // Schema version
}

// User Events
interface UserCreatedEvent extends BaseEvent {
  type: 'user.created';
  data: {
    userId: string;
    email: string;
    name: string;
    role: 'customer' | 'admin';
  };
}

// Product Events
interface ProductStockChangedEvent extends BaseEvent {
  type: 'product.stock.changed';
  data: {
    productId: string;
    oldStock: number;
    newStock: number;
    change: number; // negatif = sold
  };
}

// Order Events
interface OrderCreatedEvent extends BaseEvent {
  type: 'order.created';
  data: {
    orderId: string;
    userId: string;
    items: { productId: string; quantity: number; price: number }[];
    total: number;
  };
}

interface OrderPaidEvent extends BaseEvent {
  type: 'order.paid';
  data: {
    orderId: string;
    paymentId: string;
    amount: number;
    paidAt: string;
  };
}

type AppEvent = UserCreatedEvent | ProductStockChangedEvent | OrderCreatedEvent | OrderPaidEvent;
```

### 3.4 Idempotency

```typescript
// idempotency.ts — pastikan event ga diproses 2x

class IdempotencyStore {
  private processed = new Set<string>();
  private ttl = 3600000; // 1 jam
  
  async isProcessed(eventId: string): Promise<boolean> {
    // Redis: SETNX eventId → 1 EX 3600
    const result = await redis.set(eventId, '1', 'NX', 'EX', this.ttl / 1000);
    return result === null; // null = sudah ada sebelumnya
  }
}

// Usage di consumer
async function handleOrderCreated(event: OrderCreatedEvent) {
  if (await idempotency.isProcessed(event.id)) {
    console.log(`[Idempotency] Event ${event.id} already processed, skipping`);
    return;
  }
  
  // Process event ...
  await processOrder(event.data);
}
```

### 3.5 Outbox Pattern

```typescript
// outbox.ts — atomic DB write + event publish

// Problem: DB write sukses, tapi event gagal publish
// Atau: Event terkirim, tapi DB write gagal
// → Outbox pattern solves this

async function createOrder(orderData: CreateOrderDTO) {
  const transaction = await sequelize.transaction();
  
  try {
    // Step 1: Insert order ke database
    const order = await Order.create(orderData, { transaction });
    
    // Step 2: Insert event ke outbox table (table yang sama!)
    await OutboxEvent.create({
      id: uuidv4(),
      type: 'order.created',
      payload: order.toJSON(),
      status: 'pending',
      createdAt: new Date(),
    }, { transaction });
    
    // Step 3: Commit — DB write + event write atomic
    await transaction.commit();
    
    // Step 4: Publish event (diluar transaction — bisa gagal, ga masalah)
    try {
      await messageBus.publish('orders.direct', 'order.created', order.toJSON());
      
      // Update outbox status jadi published
      await OutboxEvent.update(
        { status: 'published', publishedAt: new Date() },
        { where: { type: 'order.created', status: 'pending' } }
      );
    } catch (publishError) {
      // Event gagal publish — outbox masih pending
      // Outbox publisher akan retry nanti
      console.error('[Outbox] Publish failed, will retry:', publishError);
    }
    
    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Outbox Publisher — cron job yang publish ulang event pending
async function processOutbox() {
  const pendingEvents = await OutboxEvent.findAll({
    where: { status: 'pending' },
    limit: 100,
  });
  
  for (const event of pendingEvents) {
    try {
      await messageBus.publish('orders.direct', event.type, event.payload);
      event.status = 'published';
      event.publishedAt = new Date();
      await event.save();
    } catch (error) {
      event.retryCount += 1;
      event.lastError = (error as Error).message;
      await event.save();
      
      if (event.retryCount >= 10) {
        event.status = 'failed';
        await event.save();
      }
    }
  }
}
```

---

## 4. Saga Pattern

### 4.1 Choreography Saga

Setiap service publish event, service lain react. No central coordinator.

```
Skenario: User checkout order

1. Order Service: create order → publish "OrderCreated"
2. Payment Service: listen "OrderCreated" → process payment → publish "PaymentProcessed"
3. Inventory Service: listen "PaymentProcessed" → reduce stock → publish "StockUpdated"
4. Shipping Service: listen "StockUpdated" → schedule shipping → publish "OrderShipped"
5. Notification Service: listen "OrderShipped" → send email

Jika Payment gagal:
2. Payment Service: publish "PaymentFailed"
3. Order Service: listen "PaymentFailed" → cancel order
4. Inventory Service: listen "PaymentFailed" → tidak perlu rollback (stock belum dikurangi)
```

```typescript
// order-service/saga/order-saga.ts — Choreography
class OrderSaga {
  async start(orderData: OrderData) {
    const order = await Order.create(orderData);
    
    // Publish event — service lain yang akan react
    await messageBus.publish('orders.direct', 'order.created', {
      orderId: order.id,
      userId: order.userId,
      items: order.items,
      total: order.total,
    });
    
    // Listen untuk compensation events
    await messageBus.consume('orders.payment-failed', async (event) => {
      // Compensation: cancel order
      await Order.update(
        { status: 'cancelled', cancelReason: 'Payment failed' },
        { where: { id: event.data.orderId } }
      );
    });
  }
}
```

### 4.2 Orchestration Saga

Satu service (Orchestrator) yang mengontrol flow. Setiap service hanya menjalankan perintah.

```
Skenario: User checkout order

Orchestrator (Order Service):
1. → Order Service: create order (pending)
2. → Payment Service: process payment
3. ❌ Payment gagal → → Order Service: cancel order (compensation)
4. ✓ Payment sukses → → Inventory Service: reduce stock
5. ❌ Stock habis → → Payment Service: refund (compensation)
6. ✓ Stock cukup → → Shipping Service: schedule shipping
7. → Selesai
```

```typescript
// order-service/saga/orchestrator.ts
enum SagaStep {
  CREATE_ORDER = 'CREATE_ORDER',
  PROCESS_PAYMENT = 'PROCESS_PAYMENT',
  REDUCE_STOCK = 'REDUCE_STOCK',
  SCHEDULE_SHIPPING = 'SCHEDULE_SHIPPING',
}

interface SagaState {
  orderId: string;
  currentStep: SagaStep;
  status: 'running' | 'completed' | 'compensating';
  data: any;
}

class SagaOrchestrator {
  async execute(orderData: OrderData) {
    const saga: SagaState = {
      orderId: uuidv4(),
      currentStep: SagaStep.CREATE_ORDER,
      status: 'running',
      data: orderData,
    };
    
    try {
      await this.stepCreateOrder(saga);
      await this.stepProcessPayment(saga);
      await this.stepReduceStock(saga);
      await this.stepScheduleShipping(saga);
      
      saga.status = 'completed';
      console.log(`[Saga] Order ${saga.orderId} completed successfully`);
      
    } catch (error) {
      console.error(`[Saga] Order ${saga.orderId} failed, compensating...`);
      saga.status = 'compensating';
      await this.compensate(saga);
    }
  }
  
  private async stepCreateOrder(saga: SagaState) {
    const order = await orderClient.createOrder(saga.data);
    saga.data.orderId = order.id;
    saga.currentStep = SagaStep.PROCESS_PAYMENT;
  }
  
  private async stepProcessPayment(saga: SagaState) {
    await paymentClient.processPayment({
      orderId: saga.data.orderId,
      amount: saga.data.total,
    });
    saga.currentStep = SagaStep.REDUCE_STOCK;
  }
  
  private async compensate(saga: SagaState) {
    // Reverse steps in reverse order
    switch (saga.currentStep) {
      case SagaStep.SCHEDULE_SHIPPING:
        await shippingClient.cancelShipping({ orderId: saga.data.orderId });
      case SagaStep.REDUCE_STOCK:
        await inventoryClient.restoreStock({ orderId: saga.data.orderId });
      case SagaStep.PROCESS_PAYMENT:
        await paymentClient.refundPayment({ orderId: saga.data.orderId });
      case SagaStep.CREATE_ORDER:
        await orderClient.cancelOrder({ orderId: saga.data.orderId });
    }
  }
}
```

### 4.3 Choreography vs Orchestration

| Aspek | Choreography | Orchestration |
|-------|-------------|---------------|
| Kompleksitas | Low (no central service) | High (orchestrator logic) |
| Coupling | Event coupling (loose) | Command coupling (tight) |
| Tracing | Hard (event chain panjang) | Easy (single flow) |
| Failure handling | Distributed (event-based) | Centralized (orchestrator) |
| Cocok untuk | Simple flow, few services | Complex flow, many services |

---

## 5. Latihan: REST + Message Queue

### Studi Kasus

Buat komunikasi antara **Order Service** dan **Inventory Service**:

**Order Service** (REST API):
- `POST /api/orders` — checkout order
- Panggil Inventory Service via REST untuk cek stock

**Inventory Service** (REST API + MQ):
- `GET /internal/stock/:productId` — cek stock
- Consume event `order.created` untuk update stock
- Publish event `stock.updated` setelah update

### Tugas

1. **REST sync call**: Order Service cek stock ke Inventory Service via REST
2. **Async event**: Order Service publish `order.created` ke RabbitMQ
3. **Consumer**: Inventory Service consume event, update stock
4. **Failure handling**: Jika stock kurang → publish `order.stock_insufficient`
5. **Idempotency**: Pastikan event ga diproses 2x

### Template Jawaban

```typescript
// order-service/src/services/checkout.ts
async function checkout(userId: string, items: CartItem[]) {
  // 1. Cek stock via REST
  for (const item of items) {
    const stock = await inventoryClient.checkStock(item.productId);
    if (stock < item.quantity) throw new Error(`Insufficient stock for ${item.productId}`);
  }
  
  // 2. Buat order
  const order = await Order.create({ userId, items, status: 'pending' });
  
  // 3. Publish event
  await messageBus.publish('orders.direct', 'order.created', {
    orderId: order.id,
    items,
  });
  
  return order;
}

// inventory-service/src/consumers/order-consumer.ts
// TODO: consume 'order.created', update stock, handle insufficient
```

---

## 📖 Referensi

- [gRPC Official Guide](https://grpc.io/docs/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Saga Pattern — Microsoft](https://docs.microsoft.com/en-us/azure/architecture/patterns/saga)
- [Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html)
- [Opossum Circuit Breaker](https://github.com/nodeshift/opossum)
