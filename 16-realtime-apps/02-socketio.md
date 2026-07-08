# 16.2 Socket.IO — Events, Rooms, Namespace

Socket.IO adalah library real-time yang dibangun di atas WebSocket dengan banyak fitur tambahan: fallback transport (long-polling), auto-reconnect, rooms, namespace, dan middleware.

## Setup Express + Socket.IO

### Instalasi

```bash
mkdir socketio-chat && cd socketio-chat
npm init -y
npm install express socket.io cors
npm install -D typescript @types/express @types/cors @types/node tsx
```

### Server Dasar dengan CORS

```typescript
// server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Socket.IO server running' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'reason:', reason);
  });
});

server.listen(3000, () => {
  console.log('Server jalan di http://localhost:3000');
});
```

### Client Setup (HTML Vanilla)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Client</title>
  <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
</head>
<body>
  <script>
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],  // force WebSocket aja, skip long-polling
      autoConnect: true           // default: langsung connect
    });

    socket.on('connect', () => {
      console.log('Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });
  </script>
</body>
</html>
```

### Client Setup (TypeScript/React)

```typescript
// client.ts
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3000', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;
```

---

## Events — Emit & On

### Event Dasar

```typescript
// Server
io.on('connection', (socket) => {
  // One-way — kirim event tanpa butuh ack
  socket.emit('welcome', 'Halo dari server!');

  // With acknowledgment — client harus ack
  socket.emit('question', 'Siapa nama kamu?', (answer: string) => {
    console.log('User menjawab:', answer);
  });

  // Listen event
  socket.on('message', (data: { user: string; text: string }) => {
    console.log(`${data.user}: ${data.text}`);
  });
});

// Client
socket.on('welcome', (msg) => console.log(msg));

socket.emit('question', 'Apa kabar?', (response) => {
  console.log('Server reply:', response);
});
```

### Data Types dengan Interface

```typescript
// types.ts
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface TypingEvent {
  userId: string;
  username: string;
  roomId: string;
}

// Server — emit dengan type
io.emit('new-message', {
  id: crypto.randomUUID(),
  userId: 'abc123',
  username: 'Budi',
  text: 'Halo semua!',
  timestamp: Date.now()
} satisfies ChatMessage);
```

---

## Rooms

Room adalah channel internal Socket.IO. Client bisa join/leave room, dan server bisa kirim pesan ke room tertentu. **Tidak perlu join room untuk kirim pesan ke room.**

### Join & Leave Room

```typescript
io.on('connection', (socket) => {
  // Join room
  socket.on('join-room', (roomId: string, username: string) => {
    socket.join(roomId);
    console.log(`${username} (${socket.id}) join room ${roomId}`);

    // Beri tau room lain
    socket.to(roomId).emit('user-joined', { userId: socket.id, username });
  });

  // Leave room
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', { userId: socket.id });
  });
});
```

### Kirim ke Room

```typescript
// Ke semua dalam room (termasuk pengirim)
io.to('game-room-1').emit('game-update', { score: 100 });

// Ke semua dalam room kecuali pengirim
socket.to('game-room-1').emit('player-move', { x: 10, y: 20 });

// Ke multiple rooms
io.to('room-1').to('room-2').emit('broadcast', 'Pesan ke dua room');

// Ke semua room kecuali room tertentu
io.except('room-admin').emit('public-announcement', { text: 'Maintenance nanti malam' });
```

### List Clients di Room

```typescript
io.on('connection', async (socket) => {
  // Dapatkan semua socket di room tertentu
  const sockets = await io.in('game-room-1').fetchSockets();
  console.log('Client di game-room-1:', sockets.length);

  // Dapatkan semua room yang active
  const rooms = io.sockets.adapter.rooms;
  console.log('Active rooms:', rooms);
});
```

---

## Namespace

Namespace adalah channel terpisah di Socket.IO. Bedanya namespace dengan room: namespace punya **connection sendiri**, event listener terisolasi, berbeda URL path.

### Kenapa Pakai Namespace?

- `/chat` — untuk fitur chat
- `/admin` — untuk monitoring/admin
- `/game` — untuk game state
- Setiap namespace punya middleware sendiri, room sendiri, koneksi sendiri

### Setup Namespace

```typescript
const server = http.createServer(app);
const io = new Server(server);

// Default namespace '/'
io.on('connection', (socket) => {
  console.log('Default namespace:', socket.id);
});

// Chat namespace
const chatNs = io.of('/chat');
chatNs.on('connection', (socket) => {
  console.log('Chat namespace:', socket.id);

  socket.on('send-message', (msg) => {
    chatNs.emit('new-message', msg);
  });
});

// Admin namespace
const adminNs = io.of('/admin');
adminNs.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);
  adminNs.emit('stats', { activeUsers: 42 });
});
```

### Client Connect ke Namespace

```javascript
// Client — connect ke namespace tertentu
const chatSocket = io('http://localhost:3000/chat');
const adminSocket = io('http://localhost:3000/admin');

chatSocket.emit('send-message', { text: 'Halo' });
adminSocket.on('stats', (data) => console.log(data));
```

---

## Middleware — Authentication

### Auth Middleware per Connection

```typescript
import { Socket } from 'socket.io';

// Middleware — jalan SETIAP ada koneksi baru
io.use((socket: Socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    // Verify token (contoh: JWT sederhana)
    const decoded = verifyToken(token);
    socket.data.user = decoded;  // simpan di socket.data
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('Authenticated user:', socket.data.user?.username);
  socket.emit('welcome', `Selamat datang ${socket.data.user?.username}!`);
});
```

### Client Kirim Auth Token

```javascript
// Client — kirim token saat connect
const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt-token-123'
  }
});

socket.on('connect_error', (err) => {
  console.error('Gagal connect:', err.message);
});
```

### Per-Namespace Middleware

```typescript
const adminNs = io.of('/admin');

adminNs.use((socket, next) => {
  const role = socket.handshake.auth?.role;
  if (role !== 'admin') {
    return next(new Error('Only admins allowed'));
  }
  next();
});

adminNs.on('connection', (socket) => {
  socket.emit('admin-panel', { secret: 'classified' });
});
```

---

## Full Chat App — Socket.IO Version

### Struktur

```
socketio-chat/
  ├── server.ts
  ├── client/
  │   └── index.html
  └── package.json
```

### server.ts

```typescript
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.static('client'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  roomId: string;
}

const messages = new Map<string, Message[]>(); // roomId → messages

// Auth middleware
io.use((socket, next) => {
  const username = socket.handshake.auth?.username;
  if (!username || username.length < 2) {
    return next(new Error('Username minimal 2 karakter'));
  }
  socket.data.username = username;
  next();
});

io.on('connection', (socket: Socket) => {
  const username = socket.data.username;
  console.log(`${username} connected (${socket.id})`);

  socket.on('join-room', (roomId: string) => {
    // Leave previous rooms
    for (const room of socket.rooms) {
      if (room !== socket.id) socket.leave(room);
    }

    socket.join(roomId);
    socket.data.roomId = roomId;

    // Kirim history room
    const roomMessages = messages.get(roomId) || [];
    socket.emit('room-history', roomMessages);

    // Notify room
    socket.to(roomId).emit('user-joined', { username, userId: socket.id });
    io.to(roomId).emit('room-users', getUsersInRoom(io, roomId));
  });

  socket.on('send-message', (text: string) => {
    const roomId = socket.data.roomId;
    if (!roomId || !text.trim()) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      username,
      text: text.trim(),
      timestamp: Date.now(),
      roomId
    };

    // Simpan history (max 100 per room)
    if (!messages.has(roomId)) messages.set(roomId, []);
    const roomMsgs = messages.get(roomId)!;
    roomMsgs.push(msg);
    if (roomMsgs.length > 100) roomMsgs.shift();

    io.to(roomId).emit('new-message', msg);
  });

  socket.on('typing', () => {
    const roomId = socket.data.roomId;
    if (roomId) socket.to(roomId).emit('user-typing', username);
  });

  socket.on('stop-typing', () => {
    const roomId = socket.data.roomId;
    if (roomId) socket.to(roomId).emit('user-stop-typing', username);
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      socket.to(roomId).emit('user-left', { username, userId: socket.id });
      io.to(roomId).emit('room-users', getUsersInRoom(io, roomId));
    }
    console.log(`${username} disconnected`);
  });
});

function getUsersInRoom(io: Server, roomId: string): string[] {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];
  const users: string[] = [];
  for (const socketId of room) {
    const sock = io.sockets.sockets.get(socketId);
    if (sock?.data?.username) users.push(sock.data.username);
  }
  return [...new Set(users)];
}

server.listen(3000, () => console.log('Chat server jalan di http://localhost:3000'));
```

### client/index.html

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Socket.IO Chat</title>
  <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; display: flex; height: 100vh; }
    #sidebar { width: 250px; background: #f5f5f5; padding: 20px; border-right: 1px solid #ddd; }
    #main { flex: 1; display: flex; flex-direction: column; }
    #messages { flex: 1; overflow-y: auto; padding: 20px; }
    #input-area { display: flex; padding: 10px; border-top: 1px solid #ddd; }
    #msgInput { flex: 1; padding: 10px; font-size: 16px; }
    #sendBtn { padding: 10px 20px; background: #0066ff; color: white; border: none; cursor: pointer; }
    #rooms { list-style: none; }
    #rooms li { padding: 8px; cursor: pointer; border-radius: 4px; margin: 2px 0; }
    #rooms li:hover { background: #ddd; }
    #rooms li.active { background: #0066ff; color: white; }
    .msg { margin: 8px 0; padding: 8px; border-radius: 8px; background: #f0f0f0; max-width: 70%; }
    .msg.own { background: #0066ff; color: white; margin-left: auto; }
    .msg .user { font-size: 12px; font-weight: bold; }
    .msg .time { font-size: 10px; color: #666; }
    .msg.own .time { color: #ccc; }
    #typing { height: 24px; padding: 0 20px; font-style: italic; color: #666; }
  </style>
</head>
<body>
  <div id="sidebar">
    <h3>Rooms</h3>
    <ul id="rooms">
      <li data-room="umum" class="active"># umum</li>
      <li data-room="rpl"># rpl</li>
      <li data-room="ngoding"># ngoding</li>
    </ul>
    <h4>Online (<span id="online-count">0</span>)</h4>
    <ul id="online-users"></ul>
  </div>

  <div id="main">
    <div id="messages"></div>
    <div id="typing"></div>
    <div id="input-area">
      <input type="text" id="msgInput" placeholder="Ketik pesan..." />
      <button id="sendBtn">Kirim</button>
    </div>
  </div>

  <script>
    const username = prompt('Masukkan username:') || 'User-' + Math.random().toString(36).substr(2,4);
    const socket = io('http://localhost:3000', {
      auth: { username }
    });

    let currentRoom = 'umum';

    socket.on('connect_error', (err) => {
      alert('Gagal connect: ' + err.message);
    });

    socket.on('connect', () => {
      socket.emit('join-room', currentRoom);
    });

    // Room switching
    document.querySelectorAll('#rooms li').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelector('#rooms li.active')?.classList.remove('active');
        el.classList.add('active');
        currentRoom = el.dataset.room;
        document.getElementById('messages').innerHTML = '';
        socket.emit('join-room', currentRoom);
      });
    });

    // Messages
    socket.on('room-history', (msgs) => {
      const container = document.getElementById('messages');
      container.innerHTML = '';
      msgs.forEach(addMessage);
    });

    socket.on('new-message', addMessage);

    function addMessage(msg) {
      const div = document.createElement('div');
      div.className = 'msg' + (msg.username === username ? ' own' : '');
      div.innerHTML = `
        <div class="user">${msg.username}</div>
        <div>${msg.text}</div>
        <div class="time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
      `;
      document.getElementById('messages').appendChild(div);
      div.scrollIntoView({ behavior: 'smooth' });
    }

    // Send
    function sendMessage() {
      const input = document.getElementById('msgInput');
      if (input.value.trim()) {
        socket.emit('send-message', input.value);
        input.value = '';
        socket.emit('stop-typing');
      }
    }
    document.getElementById('sendBtn').onclick = sendMessage;
    document.getElementById('msgInput').onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };

    // Typing
    let typingTimer;
    document.getElementById('msgInput').oninput = () => {
      socket.emit('typing');
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => socket.emit('stop-typing'), 1000);
    };

    socket.on('user-typing', (user) => {
      document.getElementById('typing').textContent = `${user} sedang mengetik...`;
    });
    socket.on('user-stop-typing', (user) => {
      document.getElementById('typing').textContent = '';
    });

    // Online users
    socket.on('room-users', (users) => {
      document.getElementById('online-count').textContent = users.length;
      document.getElementById('online-users').innerHTML = users.map(u => `<li>🟢 ${u}</li>`).join('');
    });

    socket.on('user-joined', ({ username }) => {
      console.log(`${username} join room`);
    });

    socket.on('user-left', ({ username }) => {
      console.log(`${username} left room`);
    });
  </script>
</body>
</html>
```

---

## Latihan

1. **Typing indicator per room:** Modifikasi typing indicator supaya broadcast cuma di dalam room yang sama (bukan semua namespace). Pakai `socket.to(roomId).emit()`.

2. **Admin monitoring dashboard:** Bikin namespace `/admin` yang nampilin: total connected clients, jumlah client per room, pesan per detik. Pakai `io.engine.clientsCount` dan event counter.

3. **Direct message (DM):** Implementasi DM di atas Socket.IO. Client kirim `{ to: "socketId", text: "halo" }`. Server forward ke target. Hint: pakai `io.to(socketId).emit()`.

4. **File sharing via Base64:** Tambah fitur kirim gambar di chat. Client baca file → `FileReader.readAsDataURL()` → emit `send-image` → server broadcast ke room sebagai `<img src="data:...">`.

> **Tips:** Saat mengirim file lewat Socket.IO, perhatikan ukuran maksimal yang diizinkan oleh `maxHttpBufferSize` (default 1 MB). Untuk file besar, gunakan upload terpisah dan kirim URL-nya saja melalui event Socket.IO agar tidak membebani koneksi real-time.
