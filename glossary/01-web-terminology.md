# 🌐 Web Terminology

> Istilah-istilah dasar tentang web, internet, dan komunikasi client-server.

---

### HTTP (Hypertext Transfer Protocol)
Protokol komunikasi antara browser dan server. Dasar dari web. Client kirim request, server balas response.

```ts
// Contoh HTTP request pake Fetch API (client-side)
const response = await fetch('https://api.example.com/users', {
  method: 'GET',
  headers: { 'Accept': 'application/json' }
});
const data = await response.json();
console.log(data);
// Output: [{ id: 1, name: "Budi" }, { id: 2, name: "Sari" }]
```

### HTTPS
HTTP + SSL/TLS. Data dienkripsi antara browser dan server. Wajib di production — lihat gembok 🔒 di address bar.

### URL (Uniform Resource Locator)
Alamat website. Struktur: `protokol://domain/path?query#hash`.

```ts
// Parse URL pake built-in URL API
const url = new URL('https://shop.example.com/products?page=2&sort=price#reviews');
console.log(url.protocol);  // "https:"
console.log(url.hostname);  // "shop.example.com"
console.log(url.pathname);  // "/products"
console.log(url.searchParams.get('page')); // "2"
console.log(url.hash);      // "#reviews"
```

### DNS (Domain Name System)
Penerjemah nama domain (google.com) ke IP address (142.250.x.x). Kayak buku telepon internet.

```ts
// Cek DNS resolution pake CLI (jalan di terminal, bukan browser)
// $ nslookup google.com
// Output:
// Name:    google.com
// Address: 142.250.184.78
```

### Domain
Nama unik buat website. Contoh: `google.com`, `github.com`. Dibeli lewat registrar (Niagahoster, Namecheap).

### Hosting
Tempat nyimpen file website di server biar bisa diakses online. Shared hosting, VPS, cloud hosting.

### Client / Server
**Client** = browser / aplikasi yang minta data. **Server** = komputer yang nyimpen data dan ngeladenin request.

```ts
// Client-side: JavaScript di browser
async function getUsers() {
  const res = await fetch('/api/users'); // client kirim request
  return res.json();
}

// Server-side: Express.js handle request
import express from 'express';
const app = express();
app.get('/api/users', (req, res) => {   // server terima request
  res.json([{ id: 1, name: "Budi" }]);  // server kirim response
});
```

### REST API
API yang pake HTTP method: GET (baca), POST (buat), PUT (update), DELETE (hapus). Setiap resource punya endpoint sendiri.

```ts
// REST API — CRUD operations
// GET    /api/users      → ambil semua user
// POST   /api/users      → buat user baru
// GET    /api/users/:id   → ambil 1 user
// PUT    /api/users/:id   → update user
// DELETE /api/users/:id   → hapus user

// Contoh pake fetch
const newUser = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: "Budi", age: 20 })
});
```

### Browser
Program buat ngakses web. Chrome, Firefox, Safari, Edge. Ngerender HTML/CSS/JS jadi halaman interaktif.

### CDN (Content Delivery Network)
Jaringan server di banyak lokasi yang nyimpen file statis (gambar, CSS, JS) biar load lebih cepet.

```ts
// Load library dari CDN (di HTML, bukan JS)
// <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css">
```

### SSL / TLS
Protokol keamanan buat enkripsi data antara browser dan server. HTTPS pake ini. Tanpa SSL, data bisa dibaca orang tengah (man-in-the-middle).

### Status Code
Kode response HTTP yang ngasih tau hasil request.

```ts
const res = await fetch('/api/users');
console.log(res.status);
// 200 OK          → sukses
// 201 Created     → berhasil buat data
// 400 Bad Request → input salah
// 401 Unauthorized → belum login
// 404 Not Found   → data gak ada
// 500 Server Error → error di server
```

### Cookie
Data kecil yang disimpan browser. Dipake buat session login, tracking, preferensi user.

```ts
// Baca cookie dari browser
console.log(document.cookie);
// Output: "sessionId=abc123; theme=dark"

// Set cookie (via server response)
// Set-Cookie: sessionId=abc123; HttpOnly; Secure
```

### CORS (Cross-Origin Resource Sharing)
Kebijakan security browser yang ngeblok request dari domain beda. Server harus izinin lewat header.

```ts
// Server Express — izinin CORS
import cors from 'cors';
app.use(cors({ origin: 'https://frontend-saya.com' }));

// Kalau gak di-set, browser bakal error:
// Access to fetch at 'https://api.lain.com' has been blocked by CORS policy
```

### WebSocket
Protokol komunikasi dua arah real-time. Chat, notifikasi, live update — server bisa kirim data kapan aja tanpa ditunggu client.

```ts
// Client-side WebSocket
const ws = new WebSocket('wss://chat.example.com');
ws.onmessage = (event) => {
  console.log('Pesan baru:', event.data);
  // Output: Pesan baru: {"user":"Budi","text":"Halo!"}
};
ws.send(JSON.stringify({ text: "Halo juga!" }));
```

### Endpoint
URL spesifik di API. Contoh: `GET /api/users`, `POST /api/login`.

### API Gateway
Titik masuk tunggal buat semua API request. Handle auth, rate limit, routing ke service yang tepat.

### Load Balancer
Mendistribusikan traffic ke beberapa server biar gak overload. Kayak satpam yang ngatur antrian.

### Cache
Nyimpen data sementara biar akses lebih cepet. Browser cache, Redis cache, CDN cache.

```ts
// HTTP Cache header di response server
// Cache-Control: public, max-age=3600
// Artinya: browser boleh simpen response ini 1 jam
```

---

*Next: [02-javascript-terms.md](02-javascript-terms.md) — Istilah JavaScript*
