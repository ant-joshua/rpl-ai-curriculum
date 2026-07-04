# 🧠 Cheatsheet: Microservices Hands-On

> Referensi cepet — 1 halaman.

## Topik Utama

| Sesi | Topik | Durasi |
|------|-------|--------|
| 01 | Monolith to Microservices — bounded context, Strangler Fig | 120m |
| 02 | Docker Multi-Service — compose, network, health checks | 120m |
| 03 | Inter-Service Communication — REST, gRPC, RabbitMQ | 120m |
| 04 | API Gateway — Traefik routing, auth, rate limiting | 120m |

## 3 Services + Gateway

| Service | DB | Port |
|---------|----|------|
| User Service | PostgreSQL | 3001 |
| Product Service | MongoDB | 3002 |
| Order Service | MySQL | 3003 |
| API Gateway (Traefik) | — | 80 |

## Command / Sintaks Penting

**docker-compose multi-service:**
```yaml
version: '3.8'
services:
  user-service:
    build: ./services/user-service
    ports: ["3001:3001"]
    environment:
      - DB_HOST=user-db
      - RABBITMQ_URL=amqp://guest:***@rabbitmq:5672
    depends_on:
      user-db: { condition: service_healthy }
      rabbitmq: { condition: service_started }
    volumes: ["./services/user-service/src:/app/src"]
  user-db:
    image: postgres:16-alpine
    healthcheck: { test: ["CMD", "pg_isready"], interval: 5s, timeout: 5s, retries: 5 }
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]
```

**gRPC protobuf definition (`proto/user.proto`):**
```protobuf
syntax = "proto3";
package user;
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (ListUsersResponse);
  rpc StreamUsers (StreamUsersRequest) returns (stream User);
}
message GetUserRequest { string id = 1; }
message User { string id = 1; string name = 2; string email = 3; string role = 4; int64 created_at = 5; }
message ListUsersRequest { int32 page = 1; int32 limit = 2; string role_filter = 3; }
message ListUsersResponse { repeated User users = 1; int32 total = 2; int32 page = 3; }
```

**gRPC server:**
```typescript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String });
const proto = grpc.loadPackageDefinition(packageDefinition) as any;
const server = new grpc.Server();
server.addService(proto.user.UserService.service, { get getUserImpl });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => server.start());
```

**RabbitMQ commands:**
```typescript
import amqp from 'amqplib';
const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
const ch = await conn.createChannel();
await ch.assertExchange('events.topic', 'topic', { durable: true });
await ch.assertQueue('orders.create', { durable: true });
await ch.bindQueue('orders.create', 'events.topic', 'order.created');
ch.publish('events.topic', 'order.created', Buffer.from(JSON.stringify(data)), { persistent: true });
ch.consume('orders.create', async (msg) => { if (msg) { /* process */ ch.ack(msg); } });
```

**Traefik labels (Docker auto-discover):**
```yaml
services:
  user-service:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.user-service.rule=PathPrefix(`/api/users`) || PathPrefix(`/api/auth`)"
      - "traefik.http.routers.user-service.entrypoints=web"
      - "traefik.http.routers.user-service.middlewares=auth-middleware,rate-limit"
      - "traefik.http.services.user-service.loadbalancer.server.port=3001"
      - "traefik.http.middlewares.rate-limit.ratelimit.average=100"
      - "traefik.http.middlewares.rate-limit.ratelimit.period=1m"
  gateway:
    image: traefik:v3.0
    volumes: ["/var/run/docker.sock:/var/run/docker.sock"]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=PathPrefix(`/dashboard`)"
      - "traefik.http.routers.dashboard.service=api@internal"
```

## Tips & Trik
- **Internal vs public API:** `/internal/users` bypasses auth (caller already validated), `/users` has full middleware
- **Circuit breaker:** use `opossum` — wrap external calls, fallback on failure
- **Retry with exponential backoff:** `axios-retry`, 3 retries (400ms, 800ms, 1600ms)
- **Saga pattern:** for distributed transactions — choreography (event) or orchestration (central coordinator)
- **Health checks in compose:** each service should have `healthcheck` so `depends_on` can use condition

## Common Mistakes
- ❌ One giant docker-compose.yml without network isolation — use separate networks per domain
- ❌ gRPC without `protoLoader.loadSync()` options → fields parsed wrong type
- ❌ Bind queue to exchange with wrong routing key → messages lost
- ❌ No `exposedByDefault: false` in Traefik → all services exposed
- ❌ Forget `.ack(msg)` in consumer → RabbitMQ keeps redelivering

## Link Cepat
- [Module README](.)
- [Quiz](quiz.md)
