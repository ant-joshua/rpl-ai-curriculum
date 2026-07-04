# 🧠 Cheatsheet: Aplikasi Real-Time

> Referensi cepet — 1 halaman.

## Topik Utama
- **Polling**: client request tiap N detik — boros, latency tinggi (fallback)
- **SSE**: server→client 1 arah, EventSource native — notifikasi, feed
- **WebSocket**: full-duplex TCP — chat, game, kolaborasi
- **Socket.IO**: WebSocket + fallback long-polling + rooms + broadcast
- **Events**: `emit` kirim, `on` terima, `broadcast` kecuali pengirim
- **Rooms**: grup chat (`io.to('room').emit(...)`)
- **Namespaces**: pisah endpoint (`/chat`, `/notif`) di 1 server
- **Scaling**: Redis adapter buat multi-instance Socket.IO

## Command / Sintaks Penting

```bash
npm install express socket.io
npm install @socket.io/redis-adapter    # scaling
```

```typescript
// Server Socket.IO
const io = new Server(httpServer);

io.on('connection', (socket) => {
  // Terima + broadcast
  socket.on('chat-message', (data) => {
    io.emit('chat-message', msg);        // semua
    socket.broadcast.emit('typing', u);  // kecuali pengirim
  });

  // Rooms
  socket.join('room-1');
  io.to('room-1').emit('event', data);
});

// Client
const socket = io();  // auto-connect
socket.emit('event', payload);
socket.on('response', (data) => { ... });
```

## Tips & Trik
- **Typing indicator**: emit('typing') di input → clear timeout 1 detik → emit('stop-typing')
- **Chat history**: simpan array (max 50), kirim saat user baru join
- **User-specific notification**: join room `user-${userId}` setelah login
- **Graceful shutdown**: `socket.on('disconnect', ...)` cleanup user state
- **Production**: Redis adapter, rate limiting per socket, monitoring koneksi

## Common Mistakes
❌ Lupa handle `disconnect` — user tetap dianggap online.
❌ Emit event tanpa validasi — attacker bisa spam event.
❌ Broadcast ke semua padahal cuma perlu room tertentu.
❌ Scaling tanpa Redis adapter — state tiap instance ga sinkron.
❌ Ga pake `try/catch` di async event handler — crash tanpa pesan.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [Socket.IO Docs](https://socket.io/docs/v4/)
