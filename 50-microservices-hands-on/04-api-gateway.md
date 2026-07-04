# Sesi 04: API Gateway

**Durasi:** 120 menit  
**Prerequisites:** Sesi 01–03

---

## 📌 Tujuan

- Memahami fungsi API Gateway (routing, aggregation, auth, rate limit)
- Setup Traefik sebagai API Gateway
- Implementasi service discovery
- Circuit breaker di gateway level
- Log aggregation & correlation ID

---

## 1. API Gateway — Konsep

### 1.1 Tanpa vs Dengan Gateway

```
Tanpa API Gateway:

Client ──▶ POST /api/users        ──▶ User Service :3001
Client ──▶ POST /api/products     ──▶ Product Service :3002
Client ──▶ POST /api/orders       ──▶ Order Service :3003
Client ──▶ POST /api/auth/login   ──▶ User Service :3001
Client ──▶ POST /api/payments     ──▶ Order Service :3003

Masalah:
- Client tahu detail internal (port, host, protocol)
- Auth logic duplikasi di setiap service
- CORS, rate limit, logging harus di setiap service
- Hard to change: rename service? ganti port? semua client harus update
```

```
Dengan API Gateway:

                         ┌───────────────┐
Client ──▶ /api/users   │               │──▶ User Service :3001
Client ──▶ /api/products│  API Gateway  │──▶ Product Service :3002
Client ──▶ /api/orders  │  (Traefik)    │──▶ Order Service :3003
Client ──▶ /api/auth    │               │──▶ User Service :3001
                         └───────────────┘

Keuntungan:
- Client cuma tau satu endpoint (gateway)
- Auth centralized di gateway
- Rate limiting, logging, CORS satu tempat
- Service bisa ganti port/host tanpa client tahu
```

### 1.2 Fungsi Utama API Gateway

| Fungsi | Deskripsi | Contoh |
|--------|-----------|--------|
| Routing | Forward request ke service yang tepat | `/api/users` → user-service |
| Aggregation | Gabung response dari multiple service | Dashboard: user + orders |
| Auth | Validasi token sebelum request masuk | JWT verification |
| Rate Limiting | Batasi jumlah request per client | 100 req/min per IP |
| Load Balancing | Distribute request ke multiple instance | Round-robin ke 3 instance |
| Circuit Breaker | Stop request ke service yang down | Fallback response |
| Logging | Centralized request/response log | Correlation ID |

### 1.3 API Gateway Patterns

```typescript
// Pattern 1: Gateway Routing — simple proxy
// Client → Gateway → Service
// Gateway cuma forward, ga ubah request/response

// Pattern 2: Gateway Aggregation — composite response
// Client → Gateway → Service A + Service B → combine → Client
// Berguna untuk dashboard yang butuh data dari banyak service

async function getUserDashboard(userId: string) {
  const [user, orders, products] = await Promise.all([
    userService.getUser(userId),
    orderService.getOrders(userId),
    productService.getRecentProducts(),
  ]);
  
  return {
    profile: user,
    recentOrders: orders.slice(0, 5),
    recommendedProducts: products.slice(0, 3),
  };
}

// Pattern 3: Gateway Offloading — auth di gateway
// Gateway handle JWT validation, service terima user info sudah valid
// Service ga perlu tau soal token — trusted header dari gateway
```

---

## 2. Traefik API Gateway

### 2.1 Kenapa Traefik?

| Fitur | Traefik | Nginx | Express Gateway |
|-------|---------|-------|-----------------|
| Konfigurasi | Dynamic (auto-detect containers) | Static file | Static file |
| Service discovery | Docker, Kubernetes, Consul | Manual upstream | Manual |
| Hot reload | Yes (no restart) | No (reload config) | No (restart) |
| Dashboard GUI | ✅ | ❌ | ❌ |
| Let's Encrypt | Auto | Manual | Manual |
| Middleware | Built-in | Lua/3rd party | Plugin |

### 2.2 Traefik Configuration

```yaml
# gateway/traefik.yml — static configuration
api:
  dashboard: true
  debug: true

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false    # Hanya service dengan label traefik.enable=true
    swarmMode: false
    network: ms-backend

  file:
    filename: /etc/traefik/dynamic.yml
    watch: true

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /etc/traefik/acme.json
      httpChallenge:
        entryPoint: web

# Global middleware
log:
  level: INFO
  filePath: /var/log/traefik.log

accessLog:
  filePath: /var/log/access.log
  format: json
```

```yaml
# gateway/dynamic.yml — dynamic routing rules
http:
  routers:
    # =====================
    # User Service Routes
    # =====================
    user-service-api:
      rule: "PathPrefix(`/api/users`) || PathPrefix(`/api/auth`)"
      service: user-service
      entryPoints:
        - web
      middlewares:
        - auth-middleware
        - rate-limit
        - cors-headers
      priority: 10

    user-service-health:
      rule: "PathPrefix(`/health/user`)"
      service: user-service
      entryPoints:
        - web
      middlewares: []
      # No auth untuk health check

    # =====================
    # Product Service Routes
    # =====================
    product-service-api:
      rule: "PathPrefix(`/api/products`)"
      service: product-service
      entryPoints:
        - web
      middlewares:
        - auth-middleware
        - rate-limit
        - cors-headers
      priority: 10

    # =====================
    # Order Service Routes
    # =====================
    order-service-api:
      rule: "PathPrefix(`/api/orders`)"
      service: order-service
      entryPoints:
        - web
      middlewares:
        - auth-middleware
        - rate-limit
        - cors-headers
      priority: 10

    # =====================
    # Dashboard (Traefik)
    # =====================
    dashboard:
      rule: "PathPrefix(`/api/dashboard`) || PathPrefix(`/dashboard`)"
      service: api@internal
      entryPoints:
        - web
      middlewares:
        - dashboard-auth
      priority: 1

  # =====================
  # Middleware Definitions
  # =====================
  middlewares:
    # Auth — validasi JWT
    auth-middleware:
      forwardAuth:
        address: "http://user-service:3001/internal/verify-token"
        trustForwardHeader: true
        authResponseHeaders:
          - X-User-Id
          - X-User-Role
          - X-User-Email

    # Rate Limiting
    rate-limit:
      rateLimit:
        average: 100       # 100 request per...
        period: 1m         # ...menit
        burst: 10          # burst allowance
        sourceCriterion:
          ipStrategy:
            depth: 1

    # CORS
    cors-headers:
      headers:
        accessControlAllowOriginList:
          - "http://localhost:3000"
          - "https://app.example.com"
        accessControlAllowMethods:
          - GET
          - POST
          - PUT
          - DELETE
          - PATCH
        accessControlAllowHeaders:
          - Authorization
          - Content-Type
          - X-Correlation-Id
        accessControlExposeHeaders:
          - X-Correlation-Id
          - X-Request-Id
        accessControlAllowCredentials: true

    # Dashboard basic auth
    dashboard-auth:
      basicAuth:
        users:
          - "admin:$2y$10$..."  # bcrypt hash

  # =====================
  # Services (Backends)
  # =====================
  services:
    user-service:
      loadBalancer:
        servers:
          - url: "http://user-service:3001"
        healthCheck:
          path: /health
          interval: 30s
          timeout: 5s

    product-service:
      loadBalancer:
        servers:
          - url: "http://product-service:3002"
        healthCheck:
          path: /health
          interval: 30s
          timeout: 5s

    order-service:
      loadBalancer:
        servers:
          - url: "http://order-service:3003"
        healthCheck:
          path: /health
          interval: 30s
          timeout: 5s
```

### 2.3 Docker Compose Labels (Auto-Discovery)

Alternatif — tanpa dynamic.yml, bisa pakai Docker labels langsung:

```yaml
# docker-compose.yml — Traefik auto-discover via labels
services:
  user-service:
    image: user-service:latest
    labels:
      - "traefik.enable=true"
      
      # Router
      - "traefik.http.routers.user-service.rule=PathPrefix(`/api/users`) || PathPrefix(`/api/auth`)"
      - "traefik.http.routers.user-service.entrypoints=web"
      - "traefik.http.routers.user-service.middlewares=auth-middleware,rate-limit"
      
      # Service
      - "traefik.http.services.user-service.loadbalancer.server.port=3001"
      
      # Middleware (global, shared via file provider)
      - "traefik.http.middlewares.rate-limit.ratelimit.average=100"
      - "traefik.http.middlewares.rate-limit.ratelimit.period=1m"

  gateway:
    image: traefik:v3.0
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=PathPrefix(`/dashboard`)"
      - "traefik.http.routers.dashboard.service=api@internal"
```

---

## 3. Service Discovery

### 3.1 DNS-Based Discovery

Paling sederhana — Docker Compose built-in DNS.

```typescript
// Setiap container bisa akses service lain via service name
const USER_SERVICE_URL = 'http://user-service:3001';
const PRODUCT_SERVICE_URL = 'http://product-service:3002';
const ORDER_SERVICE_URL = 'http://order-service:3003';

// Docker DNS otomatis resolve nama service ke IP container
// Tanpa perlu hardcode IP!
```

### 3.2 Consul Service Discovery

Untuk produksi — dynamic registration & health check.

```json
// Service registration — dijalankan saat service start
{
  "ID": "user-service-1",
  "Name": "user-service",
  "Address": "10.0.1.5",
  "Port": 3001,
  "Tags": ["api", "v1"],
  "Check": {
    "HTTP": "http://10.0.1.5:3001/health",
    "Interval": "10s",
    "Timeout": "5s"
  }
}
```

```typescript
// consul-client.ts — dynamic service resolution
import Consul from 'consul';

const consul = new Consul({ host: 'consul', port: 8500 });

async function discoverService(serviceName: string): Promise<string> {
  const services = await consul.agent.service.list();
  
  const instances = Object.values(services).filter(
    (s: any) => s.Service === serviceName && s.Checks.every((c: any) => c.Status === 'passing')
  );
  
  if (instances.length === 0) {
    throw new Error(`No healthy instances of ${serviceName}`);
  }
  
  // Load balancing: random instance
  const instance = instances[Math.floor(Math.random() * instances.length)] as any;
  return `http://${instance.Address}:${instance.Port}`;
}

// Usage — resolve setiap request
async function callUserService(path: string) {
  const url = await discoverService('user-service');
  const response = await axios.get(`${url}${path}`);
  return response.data;
}
```

### 3.3 Kubernetes Service Discovery

```yaml
# Kubernetes — built-in DNS
# Service dns: <service-name>.<namespace>.svc.cluster.local

# otomatis load balance ke semua pod
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - port: 80
      targetPort: 3001
```

```typescript
// K8s — tinggal pake service name
const USER_SERVICE_URL = 'http://user-service.default.svc.cluster.local';
```

---

## 4. Circuit Breaker di Gateway

### 4.1 Traefik Circuit Breaker

```yaml
# Traefik circuit breaker — di service definition
services:
  user-service:
    loadBalancer:
      servers:
        - url: "http://user-service:3001"
      healthCheck:
        path: /health
        interval: 5s
      # Circuit breaker
      serversTransport:
        # Timeout per request
        responseForwarding:
          flushInterval: 100ms
      sticky:
        cookie:
          name: user_service_sticky
```

### 4.2 Opossum — Application-Level Circuit Breaker

```typescript
// gateway/src/middleware/circuit-breaker.ts
import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';

const breakers = new Map<string, CircuitBreaker>();

function createServiceBreaker(serviceName: string, baseUrl: string) {
  const breaker = new CircuitBreaker(async (req: Request) => {
    const response = await axios({
      method: req.method,
      url: `${baseUrl}${req.path}`,
      data: req.body,
      headers: req.headers,
      timeout: 5000,
    });
    return response.data;
  }, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    name: serviceName,
  });
  
  // Fallback
  breaker.fallback(() => ({
    success: false,
    error: `${serviceName} is currently unavailable. Please try again later.`,
    errorCode: 'SERVICE_UNAVAILABLE',
  }));
  
  // Log state changes
  breaker.on('open', () => console.warn(`[CB] ${serviceName} circuit OPEN`));
  breaker.on('halfOpen', () => console.info(`[CB] ${serviceName} circuit HALF-OPEN`));
  breaker.on('close', () => console.info(`[CB] ${serviceName} circuit CLOSED`));
  
  return breaker;
}

// Middleware
function circuitBreakerMiddleware(services: Record<string, string>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const serviceName = extractServiceName(req.path);
    const baseUrl = services[serviceName];
    
    if (!baseUrl) return next(); // Pass through if unknown
    
    if (!breakers.has(serviceName)) {
      breakers.set(serviceName, createServiceBreaker(serviceName, baseUrl));
    }
    
    const breaker = breakers.get(serviceName)!;
    
    breaker.fire(req)
      .then((data) => res.json(data))
      .catch((err) => {
        res.status(503).json({
          success: false,
          error: `Service ${serviceName} unavailable`,
          circuitStatus: breaker.status,
        });
      });
  };
}
```

---

## 5. Log Aggregation & Correlation ID

### 5.1 Centralized Logging

```typescript
// shared/logger.ts — structured logging dengan correlation ID
import winston from 'winston';
import { AsyncLocalStorage } from 'async_hooks';

const asyncStorage = new AsyncLocalStorage<{ correlationId: string; service: string }>();

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'unknown',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, correlationId, service, ...meta }) => {
          const cid = correlationId || asyncStorage.getStore()?.correlationId || '-';
          return `${timestamp} [${service}] [${cid}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: `/var/log/app/${process.env.SERVICE_NAME}.log`,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Wrapper dengan async context
export function log(level: string, message: string, meta: Record<string, any> = {}) {
  const store = asyncStorage.getStore();
  logger.log(level, message, {
    ...meta,
    correlationId: store?.correlationId,
  });
}

export const logInfo = (msg: string, meta?: any) => log('info', msg, meta);
export const logError = (msg: string, meta?: any) => log('error', msg, meta);
export const logWarn = (msg: string, meta?: any) => log('warn', msg, meta);
```

### 5.2 Correlation ID Propagation

```typescript
// gateway/src/middleware/correlation.ts
import { v4 as uuidv4 } from 'uuid';

function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Ambil dari header incoming, atau buat baru
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  
  // Simpan di async context
  const store = { correlationId, service: 'api-gateway' };
  
  asyncStorage.run(store, () => {
    // Set response header
    res.setHeader('X-Correlation-Id', correlationId);
    
    // Attach ke outgoing request (axios interceptor)
    req.correlationId = correlationId;
    req.outgoingHeaders = {
      'X-Correlation-Id': correlationId,
    };
    
    next();
  });
}

// Axios global interceptor — auto attach correlation ID
axios.interceptors.request.use((config) => {
  const store = asyncStorage.getStore();
  if (store?.correlationId) {
    config.headers['X-Correlation-Id'] = store.correlationId;
  }
  return config;
});
```

### 5.3 ELK Stack Integration

```yaml
# docker-compose — logging infrastructure
services:
  # Filebeat — collect logs from all services
  filebeat:
    image: docker.elastic.co/beats/filebeat:8.12.0
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./gateway/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
    depends_on:
      - elasticsearch

  # Elasticsearch — store & index logs
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  # Kibana — visualize logs
  kibana:
    image: docker.elastic.co/kibana/kibana:8.12.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

### 5.4 Tracing Correlation ID Across Services

Request flow dengan correlation ID:

```
Client                          Gateway                       User Service              Order Service
  │                               │                              │                         │
  │  POST /api/orders             │                              │                         │
  │ X-Correlation-Id: abc-123    │                              │                         │
  │──────────────────────────────▶│                              │                         │
  │                               │ Generate correlation ID     │                         │
  │                               │ abc-123 (dari header)        │                         │
  │                               │                              │                         │
  │                               │  GET /internal/users/42      │                         │
  │                               │  X-Correlation-Id: abc-123   │                         │
  │                               │─────────────────────────────▶│                         │
  │                               │                              │ Log: correlation=abc-123│
  │                               │  <── user data ─────────────│                         │
  │                               │                              │                         │
  │                               │  POST /internal/orders       │                         │
  │                               │  X-Correlation-Id: abc-123   │                         │
  │                               │────────────────────────────────────────────────────────▶│
  │                               │                              │                         │
  │                               │                              │                         │ Log: correlation=abc-123
  │                               │  <── order created ───────────────────────────────────│
  │                               │                              │                         │
  │  <── 201 Created ────────────│                              │                         │
  │ X-Correlation-Id: abc-123    │                              │                         │
  │                               │                              │                         │
```

**Debugging**: Cari semua log dengan `correlationId=abc-123` → lihat seluruh perjalanan request.

---

## 6. Latihan: Setup Traefik API Gateway

### Studi Kasus

Setup Traefik sebagai API Gateway untuk microservices yang sudah ada (User, Product, Order Service).

### Spesifikasi

1. **Routing Rules**:
   - `/api/users/*` → user-service:3001
   - `/api/products/*` → product-service:3002
   - `/api/orders/*` → order-service:3003

2. **Middleware**:
   - Auth: forward auth ke user-service `/internal/verify-token`
   - Rate limit: 50 request/menit per IP
   - CORS: izinkan localhost:3000

3. **Health Check**:
   - Setiap service punya health check endpoint
   - Traefik detect service health auto

4. **Dashboard**:
   - Traefik dashboard di `/dashboard`
   - Protected dengan basic auth

### Tugas

1. Buat `gateway/traefik.yml` (static config)
2. Buat `gateway/dynamic.yml` (routing rules)
3. Update `docker-compose.yml` — tambah service gateway + label
4. Test routing: `curl localhost/api/users/health` → response dari user-service

### Template Jawaban

```yaml
# gateway/traefik.yml
# TODO: static configuration

# gateway/dynamic.yml
# TODO: routers, middlewares, services
```

---

## 📖 Referensi

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [API Gateway Pattern — AWS](https://microservices.io/patterns/apigateway.html)
- [Opossum Circuit Breaker](https://github.com/nodeshift/opossum)
- [Correlation ID Pattern](https://www.enterpriseintegrationpatterns.com/patterns/messaging/CorrelationIdentifier.html)
- [ELK Stack — Elastic](https://www.elastic.co/what-is/elk-stack)
