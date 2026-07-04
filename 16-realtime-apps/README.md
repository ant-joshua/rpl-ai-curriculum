<img src="https://images.pexels.com/photos/1181472/pexels-photo-1181472.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Real-Time" style="width:100%;border-radius:12px;margin:12px 0;">

# 16. Aplikasi Real-Time

> **Level:** 🚀 Intermediate  
> **Jam:** 8 (4 minggu × 2 sesi)  
> **Prasyarat:** REST API (express), JavaScript/TypeScript dasar  
> **Output:** Real-time chat app dengan WebSocket & Socket.IO + deployment siap scaling

---

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Paham perbedaan polling, SSE, dan WebSocket serta kapan pakai masing-masing
- Bikin WebSocket server & client pakai library `ws`
- Implementasi real-time chat dengan Socket.IO (emit, on, broadcast, rooms, namespace)
- Nambahin typing indicator, presence, dan notifikasi real-time
- Scaling WebSocket dengan Redis adapter
- Handle graceful shutdown, rate limiting, dan monitoring koneksi WebSocket

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | WebSocket Protocol & ws Library | [01-websocket-basics.md](01-websocket-basics.md) |
| 2 | Socket.IO — Events, Rooms, Namespace | [02-socketio.md](02-socketio.md) |
| 3 | Scaling & Production WebSocket | [03-scaling-production.md](03-scaling-production.md) |

---

## 1. Kenapa Perlu Real-Time?

HTTP request-response biasa sifatnya **client pull** — client minta, server kasih, koneksi putus. Kalau ada data baru di server, client nggak tau sampai dia request lagi.

Aplikasi real-time butuh **server push** — server kirim data ke client **tanpa diminta**. Contoh: chat, notifikasi, kolaborasi dokumen, live score.

Tiga teknik utama: **Polling**, **SSE** (Server-Sent Events), **WebSocket**.

---

## 2. Perbandingan: Polling vs SSE vs WebSocket

| Aspek | Polling (HTTP) | SSE | WebSocket |
|-------|----------------|-----|-----------|
| **Arah** | Client → Server (request) | Server → Client (1 arah) | Bidirectional (2 arah) |
| **Transport** | HTTP biasa | HTTP + stream | TCP (upgraded from HTTP) |
| **Latency** | Tinggi (tergantung interval) | Rendah | Sangat rendah |
| **Header per msg** | Penuh (HTTP headers) | Minimal | Minimal |
| **Reconnect otomatis** | ❌ | ✅ (built-in EventSource) | ❌ (butuh library) |
| **Dukungan browser** | Semua browser | Modern browser (kecuali IE) | Semua browser modern |
| **Kompleksitas** | Sederhana | Sedang | Agak kompleks |
| **Kasus pakai** | Fallback, legacy | Notifikasi 1 arah, feed | Chat, game, kolaborasi |

**Polling:** Client panggil endpoint tiap 1-5 detik. Boros bandwidth karena banyak request kosong.

**SSE:** Client buka satu koneksi HTTP, server kirim data kapan pun. Cocok untuk **notifikasi, feed berita, update harga saham**. Browser punya `EventSource` API native.

**WebSocket:** Koneksi TCP full-duplex. Client dan server bisa kirim data kapan saja. Standar untuk **chat, game real-time, kolaborasi**.

---

## 3. WebSocket Handshake (Penjelasan Sederhana)

WebSocket mulai sebagai permintaan HTTP biasa, lalu **di-upgrade** jadi koneksi WebSocket.

```
Client                           Server
  |                                |
  |--- GET /chat HTTP/1.1 -------→|
  |    Host: server.com            |
  |    Upgrade: websocket          |
  |    Connection: Upgrade         |
  |    Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ== |
  |    Sec-WebSocket-Version: 13   |
  |                                |
  |←-- HTTP/1.1 101 Switching ----|
  |    Upgrade: websocket          |
  |    Connection: Upgrade         |
  |    Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo= |
  |                                |
  |←===== koneksi WebSocket ======→|
  |   (full-duplex, frame biner)   |
```

**Langkah:**

1. Client kirim HTTP GET dengan header `Upgrade: websocket`.
2. Header `Sec-WebSocket-Key` berisi base64 random (mencegah cache proxy).
3. Server terima, hitung `Sec-WebSocket-Accept` (SHA-1 key + GUID, lalu base64).
4. Server balas status **101 Switching Protocols**.
5. Koneksi HTTP **mati**, diganti protokol WebSocket di TCP yang sama.
6. Data dikirim dalam **frame** — ringan, tanpa HTTP headers.

> Siswa nggak perlu ngoding handshake manual. **Socket.IO** (dan library WebSocket lain) urusin semua ini.

---

## 4. Socket.IO Setup + Express

Socket.IO = library WebSocket + fallback (long-polling kalau WebSocket diblokir). Ditambah fitur rooms, broadcast, namespace.

### 4.1 Instalasi

```bash
mkdir chat-app && cd chat-app
npm init -y
npm install express socket.io
```

### 4.2 Server Dasar

```typescript
// server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);  // attach Socket.IO ke HTTP server

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Event ketika client terhubung
io.on('connection', (socket) => {
  console.log('User terhubung:', socket.id);

  socket.on('disconnect', () => {
    console.log('User putus:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server jalan di http://localhost:3000');
});
```

### 4.3 Client Dasar (HTML + Socket.IO)

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head><title>Chat App</title></head>
<body>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();  // otomatis connect ke server yang sama
    console.log('Socket ID:', socket.id);
  </script>
</body>
</html>
```

> File `socket.io.js` disediakan otomatis oleh server Socket.IO di endpoint `/socket.io/socket.io.js`. Nggak perlu download terpisah.

---

## 5. Events: emit, on, broadcast, rooms

### 5.1 Emit & On (Kirim & Terima)

```typescript
// Server
io.on('connection', (socket) => {
  // Menerima event dari client
  socket.on('pesan', (data) => {
    console.log('Dari client:', data);
  });

  // Kirim event ke client tertentu
  socket.emit('halo', 'Halo dari server!');
});

// Client
socket.emit('pesan', { teks: 'Halo server!' });
socket.on('halo', (msg) => {
  console.log(msg);
});
```

### 5.2 Broadcast (Kirim ke Semua Kecuali Pengirim)

```typescript
// Server — kirim ke semua client kecuali pengirim
socket.broadcast.emit('user-mengetik', { user: 'Budi' });

// Server — kirim ke SEMUA client (termasuk pengirim)
io.emit('pesan-baru', { teks: 'Announcement!' });
```

### 5.3 Rooms (Grup)

```typescript
// Join room
socket.join('kelas-12-rpl');

// Kirim ke satu room aja
io.to('kelas-12-rpl').emit('tugas-baru', { judul: 'Buat REST API' });

// Keluar room
socket.leave('kelas-12-rpl');
```

**Diagram alur:**

```
io.emit()          → semua client
socket.emit()       → client itu aja
socket.broadcast.emit() → semua kecuali pengirim
io.to('room').emit() → semua di room itu
socket.broadcast.to('room').emit() → room lain kecuali pengirim
```

---

## 6. Build Simple Chat App (Step by Step)

### Step 1: Struktur Proyek

```
chat-app/
  ├── server.ts
  ├── package.json
  └── public/
      └── index.html
```

### Step 2: Server.ts Lengkap

```typescript
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const chatHistory: { id: number; user: string; teks: string; waktu: string }[] = [];

io.on('connection', (socket) => {
  console.log('User join:', socket.id);

  // Kirim history ke client baru
  socket.emit('chat-history', chatHistory);

  // Denger pesan baru
  socket.on('chat-message', (data: { user: string; teks: string }) => {
    const msg = {
      id: Date.now(),
      user: data.user,
      teks: data.teks,
      waktu: new Date().toLocaleTimeString()
    };

    chatHistory.push(msg);
    if (chatHistory.length > 50) chatHistory.shift();

    // Broadcast ke SEMUA client
    io.emit('chat-message', msg);
  });

  // Typing indicator
  socket.on('typing', (user: string) => {
    socket.broadcast.emit('user-typing', user);
  });

  socket.on('stop-typing', () => {
    socket.broadcast.emit('user-stop-typing');
  });

  socket.on('disconnect', () => {
    console.log('User leave:', socket.id);
    io.emit('user-offline', socket.id);
  });
});

server.listen(3000);
```

### Step 3: Client HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Chat RPL</title>
  <style>
    body { font-family: Arial; max-width: 600px; margin: auto; padding: 20px; }
    #messages { border: 1px solid #ccc; height: 300px; overflow-y: auto; padding: 10px; margin-bottom: 10px; }
    #typing { font-style: italic; color: #666; height: 20px; }
    input[type="text"] { width: 70%; padding: 8px; }
    button { padding: 8px 16px; }
  </style>
</head>
<body>
  <h2>Chat Room — RPL</h2>
  <div id="messages"></div>
  <div id="typing"></div>
  <input type="text" id="msgInput" placeholder="Ketik pesan..." autofocus />
  <button id="sendBtn">Kirim</button>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    const user = 'User-' + Math.random().toString(36).substr(2, 4);

    function addMessage(msg) {
      const div = document.getElementById('messages');
      const el = document.createElement('div');
      el.innerHTML = `<strong>${msg.user}</strong> <small>${msg.waktu}</small><br>${msg.teks}`;
      div.appendChild(el);
      div.scrollTop = div.scrollHeight;
    }

    socket.on('chat-history', (history) => {
      history.forEach(addMessage);
    });

    socket.on('chat-message', addMessage);

    function sendMessage() {
      const input = document.getElementById('msgInput');
      if (input.value.trim() === '') return;
      socket.emit('chat-message', { user, teks: input.value });
      input.value = '';
    }

    document.getElementById('sendBtn').onclick = sendMessage;
    document.getElementById('msgInput').onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };

    let typingTimer;
    document.getElementById('msgInput').oninput = () => {
      socket.emit('typing', user);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => socket.emit('stop-typing'), 1000);
    };

    socket.on('user-typing', (user) => {
      document.getElementById('typing').textContent = `${user} sedang mengetik...`;
    });

    socket.on('user-stop-typing', () => {
      document.getElementById('typing').textContent = '';
    });
  </script>
</body>
</html>
```

### Step 4: Jalankan

```bash
npx tsx server.ts
# Buka http://localhost:3000 di dua tab browser
```

**Cara kerja:**

1. Client kirim `chat-message` berisi `{ user, teks }`.
2. Server terima, simpan ke history, broadcast `io.emit('chat-message', msg)`.
3. Semua client (termasuk pengirim) dapet event dan render pesan.
4. Input kosong setelah kirim, scroll otomatis ke bawah.

---

## 7. Real-Time Notifications

Notifikasi berbeda dari chat — biasanya muncul sebagai **toast/popup** atau **badge counter**.

```typescript
// Server — kirim notifikasi ke room tertentu
function kirimNotif(userId: string, judul: string, body: string) {
  io.to(`user-${userId}`).emit('notifikasi', {
    id: Date.now(),
    judul,
    body,
    icon: 'bell',
    waktu: new Date().toISOString()
  });
}

// Contoh: notifikasi tugas baru
kirimNotif('budi123', 'Tugas Baru', 'Buat presentasi RPL hari Jumat');
```

```javascript
// Client — tangani notifikasi
socket.on('notifikasi', (notif) => {
  // Tampilkan sebagai toast
  tampilkanToast(notif.judul, notif.body);

  // Update badge counter
  notifCount++;
  document.getElementById('notifBadge').textContent = notifCount;

  // Opsional: simpan di localStorage
  simpanNotif(notif);
});
```

### Tips Notifikasi

- **User-specific:** join room `user-${userId}` setelah login agar notifikasi cuma ke orang tertentu.
- **Read/unread:** simpan status read di database, kirim unread count saat user connect.
- **Sound:** mainkan audio pendek (`new Audio('/notif.mp3').play()`) saat notifikasi masuk.

```typescript
// Client — join room berdasarkan user setelah connect
socket.on('connect', () => {
  const userId = localStorage.getItem('userId');
  socket.emit('join-user-room', userId);
});

// Server
socket.on('join-user-room', (userId: string) => {
  socket.join(`user-${userId}`);
});
```

---

## 8. Live Collaboration Features

### 8.1 Typing Indicator

Sudah diimplementasi di chat app di atas. Prinsipnya:

```
Client: [input aktif] → emit('typing', username)
                     → setelah 1 detik tidak mengetik → emit('stop-typing')
Server: broadcast('user-typing') kecuali pengirim
Client: tampilkan teks "X sedang mengetik..."
```

### 8.2 Cursor Position (Live Cursor)

Berguna di dokumen kolaboratif (Google Docs-like). Kirim posisi kursor tiap kali user gerakin mouse/klik.

```typescript
// Client — kirim posisi cursor
document.addEventListener('mousemove', (e) => {
  if (lastCursorSend && Date.now() - lastCursorSend < 50) return;
  lastCursorSend = Date.now();

  socket.emit('cursor-move', {
    x: e.clientX,
    y: e.clientY,
    user: username
  });
});

// Client — render cursor orang lain
const cursors: Record<string, HTMLElement> = {};

socket.on('cursor-update', (data) => {
  if (!cursors[data.user]) {
    const el = document.createElement('div');
    el.className = 'remote-cursor';
    el.textContent = '🖱️ ' + data.user;
    el.style.position = 'fixed';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
    cursors[data.user] = el;
  }

  cursors[data.user].style.left = data.x + 'px';
  cursors[data.user].style.top = data.y + 'px';
});

// Server
socket.on('cursor-move', (data) => {
  socket.broadcast.emit('cursor-update', data);
});

// Hapus cursor saat user disconnect
socket.on('disconnect', () => {
  io.emit('cursor-remove', socket.username);
});
```

```css
.remote-cursor {
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px 6px;
  transition: left 0.1s, top 0.1s;
}
```

### 8.3 Presence (Online/Offline)

```typescript
// Server — track user online
const onlineUsers = new Map<string, string>();

io.on('connection', (socket) => {
  socket.on('user-online', (username: string) => {
    onlineUsers.set(socket.id, username);
    io.emit('presence-update', Array.from(onlineUsers.values()));
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('presence-update', Array.from(onlineUsers.values()));
  });
});
```

```javascript
// Client
socket.emit('user-online', username);

socket.on('presence-update', (users) => {
  document.getElementById('online-count').textContent = users.length;
  document.getElementById('online-list').innerHTML = users.map(u => `<li>🟢 ${u}</li>`).join('');
});
```

---

## 9. Kesimpulan

| Konsep | Intinya |
|--------|---------|
| **Polling vs SSE vs WS** | Polling sederhana tapi boros. SSE 1 arah ringan. WebSocket full-duplex. |
| **WebSocket handshake** | HTTP di-upgrade ke TCP full-duplex lewat header Upgrade. |
| **Socket.IO** | Library yang bikin WebSocket gampang + fallback otomatis. |
| **emit/on** | Kirim & terima event real-time. |
| **broadcast** | Kirim ke semua client kecuali pengirim. |
| **rooms** | Grup channel untuk chat privat atau per-kelas. |
| **Chat app** | Server denger `chat-message`, broadcast `io.emit`, client render. |
| **Notifikasi** | User-specific room, tampilkan toast + badge. |
| **Collaboration** | Cursor position, typing indicator, presence — semua pakai event real-time. |

## Output Akhir Modul

> **Real-Time Chat App** — aplikasi chat real-time dengan WebSocket yang bisa discale secara horizontal pakai Redis adapter. Fitur: multiple rooms, typing indicator, presence, notifikasi, dan monitoring koneksi.

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Explain this WebSocket handshake step by step"
- "Debug this Socket.IO event — client emits but server doesn't receive"
- "Refactor this chat server to use TypeScript interfaces"
- "Generate load test script for this WebSocket server with 100 concurrent connections"
- "Review this Redis adapter config for production readiness"

---

*Modul ini ditulis untuk siswa SMK RPL yang sudah familiar dengan Express dan REST API. Selanjutnya: deployment WebSocket ke production (Redis adapter, sticky sessions, scaling).*
