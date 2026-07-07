---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/1181472/pexels-ph"
footer: "Sesi 01: Websocket Basics"
---

<!-- _class: title -->
# 16.1 WebSocket Protocol & ws Library

## WebSocket Protocol

WebSocket adalah protokol komunikasi **full-duplex** di atas TCP. Bedanya dengan HTTP: sekali koneksi terbuka, client dan server bisa kirim data kapan aja tanpa overhead HTTP headers tiap request.

### Frame WebSocket

Data WebSocket dikirim dalam **frame** — unit data kecil dengan struktur:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Extended payload length continued (if payload len==127)   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|               Masking-key (if MASK set to 1)                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Payload Data (variable length)                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Opcode penting:**
| Opcode | Arti |
|--------|------|
| `0x1` | Text frame (UTF-8) |
| `0x2` | Binary frame |
| `0x8` | Connection close |
| `0x9` | Ping |
| `0xA` | Pong |

**Flow koneksi:**
1. TCP handshake → HTTP upgrade → WebSocket terbuka
2. Kirim-terima frame (text/binary)
3. Ping/pong buat jaga koneksi tetap hidup (keepalive)
4. Close frame — salah satu pihak kirim frame close, diterima, koneksi ditutup

### Connection Lifecycle

```
Client                          Server
  |                               |
  |--- HTTP Upgrade Request -----→|  — Handshake
  |←-- 101 Switching Protocols ---|  
  |                               |
  |=== WebSocket connection ======|  — Active
  |←--- Ping (opcode 0x9) -------|
  |--- Pong (opcode 0xA) -------→|
  |--- Text message (opcode 0x1)→|
  |←-- Text message (opcode 0x1)-|
  |                               |
  |--- Close frame (opcode 0x8) →|  — Closing
  |←-- Close frame (opcode 0x8) -|
  |     TCP connection closed     |  — Closed
```

---

## ws Library — WebSocket di Node.js

Library `ws` adalah implementasi WebSocket paling populer di Node.js. Ringan, cepat, tanpa overhead library tambahan.

### Instalasi

```bash
mkdir ws-chat && cd ws-chat
npm init -y
npm install ws typescript @types/ws tsx
```

### WebSocket Server Sederhana

```typescript
// server.ts
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server jalan di ws://localhost:8080');

wss.on('connection', (ws, req) => {
  console.log('Client terhubung dari:', req.socket.remoteAddress);

  // Kirim pesan ke client ini
  ws.send('Selamat datang di WebSocket server!');

  // Terima pesan dari client
  ws.on('message', (data) => {
    console.log('Terima:', data.toString());
    // Echo balik
    ws.send(`Server echo: ${data}`);
  });

  ws.on('close', () => {
    console.log('Client putus');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});
```

### WebSocket Client

```typescript
// client.ts
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Terhubung ke server');
  ws.send('Halo dari client!');
});

ws.on('message', (data) => {
  console.log('Dari server:', data.toString());
});

ws.on('close', () => {
  console.log('Koneksi ditutup');
});

ws.on('error', (err) => {
  console.error('Error:', err.message);
});

// Kirim pesan tiap 3 detik
setInterval(() => {
  ws.send(`Pesan otomatis ${Date.now()}`);
}, 3000);
```

Jalankan:

```bash

---

# Terminal 1 — server
npx tsx server.ts


---

# Terminal 2 — client
npx tsx client.ts
```

### Broadcasting — Kirim ke Semua Client

```typescript
// broadcast-server.ts
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client baru. Total:', wss.clients.size);

  ws.on('message', (data) => {
    const message = data.toString();

    // Broadcast ke SEMUA client termasuk pengirim
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Pesan: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client pergi. Total:', wss.clients.size);
  });
});
```

### Broadcast Tanpa Pengirim

```typescript
ws.on('message', (data) => {
  const message = data.toString();

  wss.clients.forEach((client) => {
    // Kirim ke semua kecuali pengirim
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(`User lain: ${message}`);
    }
  });
});
```

### Ping/Pong Keepalive

```typescript
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    // Kirim ping — client harus balas pong dalam 10 detik
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000); // tiap 30 detik

wss.on('connection', (ws) => {
  let isAlive = true;

  ws.on('pong', () => {
    isAlive = true;
  });

  // Terminate client yang mati
  const check = setInterval(() => {
    if (!isAlive) {
      console.log('Client mati, terminate');
      ws.terminate();
      clearInterval(check);
      return;
    }
    isAlive = false;
    ws.ping();
  }, 10000);
});

wss.on('close', () => clearInterval(interval));
```

### WebSocket dengan HTTP Server Bersama

```typescript
// hybrid-server.ts
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('HTTP server jalan\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket client terhubung');

  ws.on('message', (data) => {
    ws.send(`Echo: ${data}`);
  });
});

server.listen(3000, () => {
  console.log('Server jalan di http://localhost:3000 dan ws://localhost:3000');
});
```

---

## Latihan

1. **Chat server with ws:** Bikin WebSocket server yang bisa handle multiple client. Server broadcast semua pesan ke semua client. Setiap client punya username unik. Format: `{ user: string, message: string, time: string }`.

2. **Private message:** Tambah fitur DM — client kirim pesan dengan target ID `{ to: "socket-id", message: "halo" }`. Server forward cuma ke socket target.

3. **WebSocket ping monitor:** Bikin server yang track round-trip time (RTT) tiap client. Catat waktu kirim ping, hitung selisih pas pong balik. Log client yang RTT-nya > 500ms.

4. **Room system manual:** Implementasi room system tanpa library — client kirim `{ command: "join", room: "lobby" }`. Server track client per room. Broadcast dalam room aja. Client bisa join multiple rooms.
