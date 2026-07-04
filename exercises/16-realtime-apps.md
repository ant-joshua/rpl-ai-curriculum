# Real-Time Apps — Latihan

## Level 1: Dasar

### Soal 1 — WebSocket Events
Buat diagram alur untuk koneksi WebSocket pada aplikasi **chat room**. Tunjukkan event-event berikut:

- Client → Server: `join_room`, `send_message`, `typing`, `leave_room`
- Server → Client: `user_joined`, `new_message`, `user_typing`, `user_left`
- Lifecycle: connect → auth → join → messaging → disconnect

Tulis payload JSON untuk setiap event.

### Soal 2 — Simple Echo Server
Buat WebSocket server menggunakan **Socket.IO** (Node.js) yang:

1. Menerima koneksi dari client
2. Jika client mengirim event `ping`, server membalas `pong`
3. Log setiap koneksi dan disconnect ke console
4. Berjalan di port 3000

Tulis juga client-side HTML minimal untuk menguji (input teks + tombol kirim + log area).

### Soal 3 — Room Management
Buat server Socket.IO yang mendukung:

- Client bisa **create room** (join room dengan nama unik)
- Client bisa **join room** dengan room ID
- Setiap room maksimal 5 user
- Jika room penuh, kirim error `room_full` ke client
- Jika client disconnect, hapus dari room

Gunakan Map untuk menyimpan state room.

## Level 2: Intermediate

### Soal 4 — Real-Time Collaborative Whiteboard
Desain arsitektur real-time untuk **collaborative whiteboard**:

Feature:
- Multiple users menggambar di canvas yang sama
- Setiap stroke (brush, color, path) di-broadcast ke semua user di room
- Cursor position masing-masing user terlihat oleh yang lain
- Undo/redo per user (bukan global)
- Persistence: state disimpan ke DB tiap 30 detik

Jelaskan:
- Event structure (what events, what payload)
- Bagaimana handle late joiner (user yang join setelah ada gambar) — perlu replay state?
- Bagaimana conflict resolution jika dua user menggambar bersamaan?
- Optimasi bandwidth (apakah kirim full path atau delta?)

### Soal 5 — Socket.IO with Redis Adapter
Anda perlu men-scale Socket.IO ke **multi-instance** (horizontal scaling):

```
Client → Load Balancer (Round Robin) → Server A (Socket.IO)
                                      → Server B (Socket.IO)
                                      → Server C (Socket.IO)
```

Tanpa adapter, user di Server A tidak bisa menerima event dari user di Server B.

1. Implementasikan **Redis Adapter** untuk Socket.IO
2. Jelaskan bagaimana Redis Adapter bekerja di bawah hood (pub/sub mechanism)
3. Bagaimana handle sticky session? Apakah perlu? Kenapa?
4. Tulis konfigurasi untuk 3 instance dengan Redis

### Soal 6 — Real-Time Notification System
Desain sistem notifikasi real-time untuk aplikasi **e-commerce**:

Trigger notifikasi:
- Order confirmed → notif ke buyer
- Payment received → notif ke seller
- Chat message → notif ke penerima
- Admin broadcast → notif ke semua user

Requirements:
- 100.000 concurrent connections
- Latency < 500ms
- Notifikasi harus sampai meskipun user offline (store & forward)
- Push notification (FCM) jika user tidak terhubung WebSocket

Buat arsitektur lengkap: WebSocket server, queue, DB schema, FCM integration.

## Level 3: Challenge

### Soal 7 — Live Location Tracking (Ride-Hailing)
Desain backend real-time untuk **live location tracking** seperti Gojek/Grab:

Feature:
- 50.000 driver online simultan
- Broadcast location setiap 3 detik ke user yang menonton
- User bisa melihat driver bergerak di peta (real-time)
- ETA update tiap detik
- Geofence: hanya driver dalam radius yang menerima order

Challenge:
- **Bandwidth**: 50.000 driver × 1 request/3 detik = ~16.667 writes/detik. Optimasi.
- **Geohashing**: bagaimana filter driver dalam radius tertentu tanpa scan semua driver?
- **Scaling**: bagaimana handle lonjakan (jam sibuk vs malam hari)?

Implementasikan pseudo-code untuk:
- Location update handler
- Nearby driver query (gunakan geohash atau grid system)
- ETA calculation using distance matrix

### Soal 8 — WebRTC Video Conference
Implementasikan **video call group** menggunakan WebRTC dengan arsitektur **SFU (Selective Forwarding Unit)**:

Component:
1. **Signaling server** (Socket.IO) — handle offer/answer/ICE candidate exchange
2. **SFU server** — menerima stream dari publisher, forward ke subscriber yang relevan
3. **Client** — capture local media, render remote streams

Untuk SFU, gunakan `mediasoup` atau `livekit` (pilih salah satu, jelaskan alasannya).

Tulis:
- Flow: user A create room → user B join → koneksi WebRTC terbentuk
- Bagaimana handle mute/unmute, video off
- Simulcast: apa itu dan kapan perlu?
- Adaptive bitrate: turunkan kualitas jika jaringan buruk
- Scaling: bagaimana handle 100+ participant dalam satu room?
