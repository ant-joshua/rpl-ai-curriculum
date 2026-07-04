# Quiz: Aplikasi Real-Time

<div class="quiz">

**1. Apa perbedaan utama WebSocket dengan HTTP biasa?**

- [ ] WebSocket lebih lambat dari HTTP
- [x] WebSocket adalah koneksi full-duplex persistent, HTTP request-response
- [ ] WebSocket hanya bisa digunakan di mobile
- [ ] HTTP lebih aman daripada WebSocket

**2. Protokol apa yang menjadi dasar transport WebSocket?**

- [ ] UDP
- [x] TCP
- [ ] IP
- [ ] SMTP

**3. Library JavaScript yang paling populer untuk implementasi WebSocket dengan fitur rooms dan broadcast?**

- [ ] ws
- [ ] axios
- [x] Socket.IO
- [ ] fetch

**4. Event di Socket.IO yang dipanggil ketika client baru terhubung ke server?**

- [ ] 'message'
- [x] 'connection'
- [ ] 'join'
- [ ] 'connect'

**5. Perbedaan antara `io.emit()` dan `socket.broadcast.emit()`?**

- [ ] Sama saja
- [x] `io.emit()` kirim ke semua client (termasuk pengirim), broadcast kirim ke semua kecuali pengirim
- [ ] broadcast hanya untuk room tertentu
- [ ] `io.emit()` lebih lambat

**6. Fungsi `socket.join('room-name')` di Socket.IO?**

- [ ] Membuat room baru di server
- [x] Menambahkan socket ke dalam room tertentu agar bisa menerima event spesifik room
- [ ] Menghapus socket dari semua room
- [ ] Mengirim pesan ke semua room

**7. Teknik komunikasi real-time yang menggunakan HTTP stream satu arah dari server ke client?**

- [ ] WebSocket
- [x] SSE (Server-Sent Events)
- [ ] Polling
- [ ] gRPC

**8. Apa fungsi Redis adapter pada aplikasi Socket.IO production?**

- [ ] Menyimpan chat history
- [x] Menangani broadcast antar instance server WebSocket yang berbeda
- [ ] Mengompres data pesan
- [ ] Mengenkripsi koneksi WebSocket

**9. Status code HTTP yang menandakan sukses upgrade ke WebSocket?**

- [ ] 200 OK
- [ ] 201 Created
- [x] 101 Switching Protocols
- [ ] 301 Moved Permanently

**10. Cara mengirim pesan ke satu client spesifik di Socket.IO?**

- [ ] `io.emit('event', data)`
- [x] `socket.emit('event', data)`
- [ ] `socket.broadcast.emit('event', data)`
- [ ] `io.to('room').emit('event', data)`

</div>
