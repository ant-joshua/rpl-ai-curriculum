# RPP Modul 16: Aplikasi Real-Time

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Membedakan polling, SSE, WebSocket
- Implementasi WebSocket dengan Socket.IO
- Membangun chat real-time dengan rooms
- Scaling WebSocket dengan Redis adapter

## Tools & Bahan

- Node.js, Express, Socket.IO
- Redis (opsional, untuk scaling)
- htmx atau React sederhana untuk client
- Postman / wscat untuk testing

---

## Sesi 1: WebSocket Fundamentals + Socket.IO (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Real-Time Transport** | Polling (boros, latency). SSE (1 arah, native). WebSocket (full-duplex, TCP). Socket.IO = WebSocket + fallback + rooms. |
| 45 menit | **Coding: Socket.IO Chat Server** | Live coding: server Socket.IO + client HTML. `io.on('connection')`, `socket.emit`, `socket.on`. Broadcast dengan `io.emit`. |
| 20 menit | **Latihan: Broadcast Chat** | Siswa bikin chat sederhana: pesan muncul di semua client. Handle connect/disconnect. |
| 10 menit | **Review** | Kenapa WebSocket lebih baik daripada polling? Kapan tetap pakai SSE? |

**Code demo:**

```typescript
// Server
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('chat-message', (msg) => {
    io.emit('chat-message', msg); // broadcast semua
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Client
const socket = io();
socket.on('chat-message', (msg) => {
  addMessage(msg);
});
```

**Checklist siswa:**
- [ ] Server Socket.IO jalan
- [ ] Client connect ke server
- [ ] Pesan broadcast ke semua client
- [ ] Handle disconnect

---

## Sesi 2: Rooms + Typing Indicator + Private Chat (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Rooms & Namespaces** | `socket.join(room)`, `io.to(room).emit()`. Namespaces untuk pisah concern. Typing indicator pattern. |
| 45 menit | **Coding: Chat Rooms + Typing** | Implementasi multi-room chat. Join/leave room. Typing indicator (emit typing → setTimeout stop-typing). |
| 20 menit | **Latihan: Group Chat App** | Siswa bikin group chat: create room, invite user, typing indicator, chat history per room. |
| 10 menit | **Review** | Debug: typing event spam. Bedanya `io.to(room)` vs `socket.broadcast.to(room)`? |

**Code demo:**

```typescript
// Join room
socket.on('join-room', (roomId) => {
  socket.join(roomId);
});

// Send to room
socket.on('room-message', ({ roomId, msg }) => {
  io.to(roomId).emit('room-message', { user: socket.id, msg });
});

// Typing indicator
socket.on('typing', (roomId) => {
  socket.to(roomId).emit('typing', socket.id);
  // clear di client via setTimeout
});
```

**Checklist siswa:**
- [ ] Join/leave room
- [ ] Pesan hanya ke room tertentu
- [ ] Typing indicator
- [ ] Chat history array (max 50)

---

## Sesi 3: Scaling + Production (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Scaling WebSocket** | Redis adapter untuk multi-instance. Rate limiting per socket. Monitoring koneksi. Graceful shutdown. |
| 45 menit | **Coding: Redis Adapter + Production** | Setup Redis adapter. Test 2 instance. Implement rate limit per socket. Graceful shutdown handler. |
| 20 menit | **Latihan: Production Hardening** | Siswa setup: Redis adapter, rate limit, health endpoint, disconnect cleanup. |
| 10 menit | **Review** | Apa yang terjadi tanpa Redis adapter di multi-instance? Bagaimana monitor 1000 concurrent connections? |

**Code demo:**

```typescript
// Redis adapter
import { createAdapter } from '@socket.io/redis-adapter';
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// Rate limit per socket
io.on('connection', (socket) => {
  let msgCount = 0;
  socket.on('chat-message', () => {
    msgCount++;
    if (msgCount > 30) return socket.emit('rate-limit');
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  io.close(() => process.exit(0));
});
```

**Checklist siswa:**
- [ ] Redis adapter berfungsi
- [ ] Rate limit per socket
- [ ] Graceful shutdown
- [ ] Health endpoint
- [ ] Disconnect cleanup

## Assessment

| Kriteria | Bobot |
|----------|-------|
| WebSocket + Socket.IO dasar | 25% |
| Rooms + typing indicator | 30% |
| Scaling + production hardening | 30% |
| Partisipasi | 15% |
