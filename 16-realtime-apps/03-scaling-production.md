# 16.3 Scaling & Production WebSocket

WebSocket itu **stateful** — server nyimpen koneksi client di memory. Kalau scale ke multiple server, client yang connect ke server A **nggak bisa** dapet pesan dari server B. Solusi: **Redis adapter**.

## Redis Adapter untuk Socket.IO

Redis Adapter bikin semua instance Socket.IO share state via Redis Pub/Sub. Pesan dari server mana pun diteruskan ke semua server lain.

### Arsitektur

```
         Client A          Client B          Client C
            |                 |                 |
        ┌───┴───┐        ┌───┴───┐        ┌───┴───┐
        │  SVR 1 │        │  SVR 2 │        │  SVR 3 │
        └───┬───┘        └───┬───┘        └───┬───┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                        ┌─────┴─────┐
                        │   Redis   │
                        │  Pub/Sub  │
                        └───────────┘
```

- Socket.IO server A broadcast → publish ke Redis channel
- Redis kirim ke semua subscriber (termasuk server B, C)
- Server B & C terima, emit ke client mereka masing-masing

### Instalasi

```bash
npm install @socket.io/redis-adapter ioredis
npm install -D @types/ioredis
```

### Setup Redis Adapter

```typescript
// server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Koneksi Redis
const pubClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD
});

const subClient = pubClient.duplicate(); // koneksi terpisah untuk subscribe

// Pasang Redis adapter
io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'on server:', process.pid);

  socket.on('send-message', (msg) => {
    // Broadcast ke semua server via Redis
    io.emit('new-message', msg);
  });
});

server.listen(3000, () => {
  console.log(`Server ${process.pid} jalan di http://localhost:3000`);
});
```

### Verifikasi Redis Adapter

```bash
# Terminal 1 — server port 3001
REDIS_HOST=localhost PORT=3001 node server.js

# Terminal 2 — server port 3002
REDIS_HOST=localhost PORT=3002 node server.js

# Kedua server share state via Redis
# Client connect ke server mana pun, dapet pesan dari semua
```

### Redis Adapter Options

```typescript
io.adapter(createAdapter(pubClient, subClient, {
  // Key prefix di Redis (biar gak bentrok dengan app lain)
  key: 'chat-app:socket.io',

  // Requests key-value store di Redis (untuk fetchSockets dll)
  requestsTimeout: 5000  // default 5000ms
}));
```

---

## Sticky Sessions vs Redis Adapter

### Masalahnya

WebSocket upgrade request harus ke **server yang sama** yang handle HTTP request pertama. Kalau load balancer kirim ke server berbeda, handshake gagal.

### Solusi 1: Sticky Sessions (Cookie-based)

Load balancer kirim semua request dari satu client ke server yang sama berdasarkan cookie.

**Nginx config:**

```nginx
upstream socket_backend {
    ip_hash;  # Hash based on IP — sticky session
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name chat.example.com;

    location / {
        proxy_pass http://socket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;  # 24 jam — koneksi WebSocket
    }
}
```

### Solusi 2: Redis Adapter (Recommended)

Redis adapter ngasih **horizontal scaling tanpa sticky sessions**. Load balancer pake round-robin aja.

```nginx
upstream socket_backend {
    # Round-robin — tanpa sticky session
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name chat.example.com;

    location /socket.io/ {
        proxy_pass http://socket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### Perbandingan

| Aspek | Sticky Sessions | Redis Adapter |
|-------|----------------|---------------|
| **Setup** | Konfigurasi LB aja | Butuh Redis server |
| **State sharing** | ❌ Tiap server punya state sendiri | ✅ State terpusat di Redis |
| **Failure handling** | Kalau server mati, client di server itu disconnect semua | Redis handle failover |
| **Scaling** | Bisa scale, tapi client terpaku ke server tertentu | Scale horizontal mulus |
| **Resource** | 0 tambahan | Butuh memory Redis |
| **Recommended** | Prototype / dev | **Production** |

---

## Monitoring Koneksi WebSocket

### Metrics dengan socket.io-prometheus

```bash
npm install @socket.io/prometheus
```

```typescript
import { Server } from 'socket.io';
import { Instrumentation } from '@socket.io/prometheus';

const io = new Server(server);
const instrumentation = new Instrumentation(io, {
  metrics: {
    connectedClients: true,
    events: true,
    rooms: true
  }
});

// Endpoint metrics — dipanggil Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', instrumentation.contentType);
  res.end(await instrumentation.metrics());
});
```

### Manual Metrics

```typescript
import { Server } from 'socket.io';

class SocketMonitor {
  private stats = {
    totalConnections: 0,
    activeConnections: 0,
    messagesSent: 0,
    messagesReceived: 0,
    rooms: 0
  };

  constructor(private io: Server) {
    io.engine.on('connection', () => {
      this.stats.totalConnections++;
      this.stats.activeConnections++;
    });

    io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        this.stats.activeConnections--;
      });

      // Track messages per socket
      socket.on('*', (event: string, ...args: any[]) => {
        this.stats.messagesReceived++;
      });
    });
  }

  getStats() {
    return {
      ...this.stats,
      currentClients: this.io.engine.clientsCount,
      rooms: this.io.sockets.adapter.rooms.size,
      uptime: process.uptime()
    };
  }
}

// Expose via HTTP
app.get('/stats', (req, res) => {
  res.json(monitor.getStats());
});
```

### Logging Event

```typescript
io.on('connection', (socket) => {
  // Log semua event yang masuk (debug mode)
  socket.use(([event, ...args], next) => {
    console.log(`[${new Date().toISOString()}] ${socket.id}: ${event}`, args);
    next();
  });
});
```

---

## Graceful Shutdown

Pas server mati (deploy baru, restart), WebSocket client harus dikasih tau biar reconnect ke server lain.

```typescript
import { Server } from 'socket.io';

const io = new Server(server);

function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully...`);

    // 1. Stop terima koneksi baru
    server.close();

    // 2. Kirim notifikasi ke semua client
    io.emit('server-shutdown', {
      message: 'Server akan restart dalam 5 detik',
      reconnectAfter: 5000
    });

    // 3. Disconnect semua socket dengan delay
    setTimeout(async () => {
      const sockets = await io.fetchSockets();
      for (const socket of sockets) {
        socket.disconnect(true);
      }

      // 4. Close Redis adapter
      // pubClient.quit();
      // subClient.quit();

      process.exit(0);
    }, 5000); // kasih waktu client reconnect
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

setupGracefulShutdown();
```

### Client Handle Shutdown

```javascript
// Client
socket.on('server-shutdown', (data) => {
  console.log('Server akan restart:', data.message);

  // Tampilkan pesan ke user
  showToast('Server maintenance, reconnect otomatis...');

  // Socket.IO auto-reconnect akan connect ke server baru
  // setelah delay sesuai data.reconnectAfter
  socket.io.opts.reconnectionDelay = data.reconnectAfter;
});
```

---

## Rate Limiting WebSocket

WebSocket bisa di-spam — client kirim ribuan pesan per detik. Harus di-rate limit.

### Per-Socket Rate Limiter

```typescript
import { Socket } from 'socket.io';

class RateLimiter {
  private clients = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private maxRequests: number = 50,    // max pesan per window
    private windowMs: number = 10000     // window 10 detik
  ) {}

  check(socketId: string): boolean {
    const now = Date.now();
    const entry = this.clients.get(socketId);

    if (!entry || now > entry.resetAt) {
      this.clients.set(socketId, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false; // rate limited
    }

    entry.count++;
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [id, entry] of this.clients) {
      if (now > entry.resetAt) this.clients.delete(id);
    }
  }
}

// Middleware rate limit per event
const limiter = new RateLimiter(30, 10000); // 30 pesan per 10 detik
setInterval(() => limiter.cleanup(), 60000);

io.on('connection', (socket) => {
  socket.use(([event, ...args], next) => {
    if (event === 'send-message' || event === 'typing') {
      if (!limiter.check(socket.id)) {
        socket.emit('rate-limited', 'Terlalu cepat! Tunggu sebentar.');
        return; // BLOCK event
      }
    }
    next();
  });
});
```

### Token Bucket Algorithm

```typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,   // bucket capacity
    private refillRate: number,  // token per detik
    private refillInterval: number = 1000
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  consume(count: number = 1): boolean {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / this.refillInterval) * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// Pakai di middleware
const buckets = new Map<string, TokenBucket>();

io.on('connection', (socket) => {
  buckets.set(socket.id, new TokenBucket(20, 5)); // 20 burst, 5/sec refill

  socket.on('send-message', (data) => {
    const bucket = buckets.get(socket.id);
    if (!bucket?.consume()) {
      return socket.emit('rate-limited', 'Slow down!');
    }
    // Proses pesan
    io.emit('new-message', data);
  });

  socket.on('disconnect', () => buckets.delete(socket.id));
});
```

---

## Production Checklist

- [ ] **Redis adapter** terpasang dan terverifikasi (kirim pesan dari server A, terima di server B)
- [ ] **Graceful shutdown** — client bisa reconnect tanpa kehilangan data
- [ ] **Rate limiting** — cegah spam per socket
- [ ] **Monitoring** — metrics (connected clients, events/sec, error rate)
- [ ] **Logging** — log connection/disconnection dengan timestamp + reason
- [ ] **CORS** — batasi origin yang boleh connect
- [ ] **Auth middleware** — validasi token tiap koneksi
- [ ] **Timeout** — `pingTimeout` dan `pingInterval` di Socket.IO
- [ ] **Max clients** — batasi max koneksi per server
- [ ] **HTTPS/WSS** — WebSocket harus pakai TLS di production

### Recommended Socket.IO Config

```typescript
const io = new Server(server, {
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true
  },

  // Ping/pong
  pingInterval: 25000,     // Kirim ping tiap 25 detik
  pingTimeout: 20000,      // Anggap mati kalau 20 detik gak ada pong

  // Transport
  transports: ['websocket', 'polling'],  // polling sebagai fallback

  // Max
  maxHttpBufferSize: 1e6,  // 1 MB max message size

  // Allow request
  allowRequest: (req, callback) => {
    // Filter request berdasarkan origin atau header
    const origin = req.headers.origin;
    if (origin && !origin.includes('example.com')) {
      return callback(null, false); // reject
    }
    callback(null, true);
  }
});
```

---

## Latihan

1. **Multi-server chat dengan Redis:** Bikin 2 instance server Socket.IO (port 3001, 3002) dengan Redis adapter. Client connect ke port random. Kirim pesan dari client A, verifikasi client B terima meskipun beda server.

2. **Rate limiter dashboard:** Bikin monitoring yang nampilin: jumlah client per server, total pesan per detik, client yang kena rate limit. Pakai Redis buat aggregate stats.

3. **Graceful shutdown + auto-reconnect:** Simulasi shutdown server. Client harus otomatis reconnect ke server lain dalam < 2 detik. Tampilkan counter reconnect di client.

4. **Health check endpoint:** Bikin endpoint `/health` yang return status server: uptime, connected clients, memory usage, Redis connection status. Pakai `process.memoryUsage()` dan ping Redis.
