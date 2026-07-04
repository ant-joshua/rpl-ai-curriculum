# Web Architecture — Latihan

## Level 1: Dasar

### 1. Client-Server — Request-Response Cycle
**Pertanyaan:** Gambarkan dan jelaskan langkah-langkah yang terjadi ketika user mengetik `https://www.example.com` di browser sampai halaman tampil.

Tulis dalam bentuk langkah berurutan (minimal 5 langkah).

**Hint:** DNS lookup → TCP handshake → HTTP request → server process → HTTP response → browser render. Jangan lupa HTTPS/TLS.

---

### 2. HTTP Methods — Fungsi & Contoh
**Pertanyaan:** Cocokkan HTTP method dengan fungsinya:

| Method | Fungsi | Contoh Endpoint |
|--------|--------|-----------------|
| GET | a. Mengirim data baru | ? |
| POST | b. Menghapus resource | ? |
| PUT | c. Mengambil data | ? |
| DELETE | d. Mengupdate data (replacement) | ? |
| PATCH | e. Update sebagian data | ? |

Isi kolom "Contoh Endpoint" dengan path API yang sesuai untuk aplikasi toko online (contoh: `/products`, `/products/1`).

**Hint:** GET /products, POST /products, PUT /products/1, DELETE /products/1, PATCH /products/1.

---

### 3. HTTP Status Codes — Kategori & Arti
**Pertanyaan:** Kelompokkan status code berikut ke kategori yang benar (1xx, 2xx, 3xx, 4xx, 5xx) dan jelaskan artinya:

- 200, 201, 204
- 301, 302, 304
- 400, 401, 403, 404, 409, 429
- 500, 502, 503

**Hint:** 2xx = sukses, 3xx = redirect, 4xx = client error, 5xx = server error. 200 OK, 201 Created, 204 No Content, 301 Moved Permanently, 302 Found, 304 Not Modified, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Too Many Requests, 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.

---

### 4. URL Structure — Komponen URL
**Pertanyaan:** Uraikan URL berikut menjadi komponen-komponennya:

```
https://api.toko-online.com:8080/v1/products?category=elektronik&page=2#reviews
```

Sebutkan: protocol, subdomain, domain, port, path, query parameters, fragment.

**Hint:** `https` = protocol, `api` = subdomain, `toko-online.com` = domain, `8080` = port, `/v1/products` = path, `category=elektronik&page=2` = query, `reviews` = fragment.

---

### 5. Frontend vs Backend — Tugas & Teknologi
**Pertanyaan:** Kelompokkan tugas dan teknologi berikut ke Frontend, Backend, atau Keduanya:

| Tugas/Teknologi | FE / BE / Keduanya |
|-----------------|-------------------|
| HTML, CSS, JavaScript | ? |
| Node.js, Python, Go | ? |
| Database design & query | ? |
| Menjaga keamanan data user | ? |
| UI/UX design | ? |
| REST API design | ? |
| Browser rendering | ? |
| Session management | ? |

**Hint:** Frontend = apa yang user lihat. Backend = logic, database, server. Ada yang overlap (keduanya).

---

### 6. HTTP Headers — Request & Response
**Pertanyaan:** Cocokkan header berikut dengan fungsinya:

| Header | Fungsi |
|--------|--------|
| `Content-Type` | a. Mengirim token autentikasi |
| `Authorization` | b. Format data yang dikirim/diterima |
| `Accept` | c. Domain asal request |
| `Origin` | d. Format data yang bisa diterima |
| `Set-Cookie` | e. Mencegah browser caching |
| `Cache-Control` | f. Server menyuruh browser simpan cookie |

**Hint:** Request headers: `Authorization`, `Accept`, `Origin`. Response headers: `Content-Type`, `Set-Cookie`, `Cache-Control`.

---

### 7. Hosting — Static vs Dynamic vs Database
**Pertanyaan:** Tentukan jenis hosting yang tepat untuk setiap skenario:

1. Landing page perusahaan (5 halaman, HTML+CSS aja, nggak perlu backend)
2. Aplikasi web dengan user login dan database MySQL
3. API backend yang nyambung ke database PostgreSQL
4. Website berita dengan admin panel dan konten dinamis

Pilih dari: Static Hosting (Vercel/Netlify), VPS (DigitalOcean/AWS EC2), PaaS (Heroku/Railway), atau Serverless (AWS Lambda).

**Hint:** Static = file HTML aja. Dynamic = butuh server yang jalanin kode. Database = butuh DBMS terpisah.

---

### 8. DevTools Network Tab — Debugging Request
**Pertanyaan:** Kamu buka website dan ada gambar yang nggak muncul. Jelaskan langkah-langkah untuk debug pakai browser DevTools Network tab:

1. Cara buka DevTools (shortcut keyboard)
2. Tab/panel apa yang harus dilihat
3. Status code apa yang menandakan gambar gagal dimuat
4. Bagaimana cara lihat detail request dan response headers
5. Bagaimana cara filter request berdasarkan tipe (images, XHR, CSS)

**Hint:** F12 / Ctrl+Shift+I. Network tab. 404 atau 500. Klik nama file. Filter bar: "Img", "XHR", "Doc", "CSS".

---

## Level 2: Intermediate

### 9. REST API Design — Endpoint Planning
**Pertanyaan:** Desain REST API untuk aplikasi manajemen tugas (Todo App) dengan resource:
- `users` — data user
- `tasks` — tugas (setiap tugas punya user_id, title, description, status, due_date)
- `categories` — kategori tugas (work, personal, dll.)

Buat tabel endpoint lengkap dengan:

| Method | Endpoint | Deskripsi | Auth? |
|--------|----------|-----------|-------|
| GET | /users | ? | ? |
| POST | /users | ? | ? |
| ... | ... | ... | ... |

Minimal 10 endpoint. Perhatikan REST conventions: plural nouns, nested routes untuk relasi.

**Hint:** Contoh: `GET /users/:id/tasks` (ambil semua task milik user tertentu), `POST /tasks` (buat task baru). Auth diperlukan untuk operasi yang mengubah data.

---

### 10. HTTP Methods — Idempotent & Safe
**Pertanyaan:** Klasifikasikan HTTP methods berdasarkan dua properti:

1. **Safe** — tidak mengubah state server (read-only)
2. **Idempotent** — request berulang memberikan hasil yang sama

Buat tabel:

| Method | Safe? | Idempotent? | Contoh Respons Berkali-kali |
|--------|-------|-------------|---------------------------|
| GET | ? | ? | ? |
| POST | ? | ? | ? |
| PUT | ? | ? | ? |
| DELETE | ? | ? | ? |
| PATCH | ? | ? | ? |

Jelaskan: kenapa POST tidak idempotent? Kapan DELETE bisa dianggap idempotent?

**Hint:** GET selalu aman dan idempotent. POST bikin resource baru tiap kali. DELETE setelah resource dihapus, panggil lagi return 404 — tetap idempotent karena state server sama (resource tetap tidak ada).

---

### 11. API Response Format — JSON Best Practices
**Pertanyaan:** Kembangkan response format standar untuk API:

1. **Sukses:** Buat response JSON untuk `GET /api/users/1` yang mengembalikan data user (id, name, email, createdAt)
2. **Error validasi:** Buat response untuk `POST /api/users` dengan field email kosong
3. **Pagination:** Buat response untuk `GET /api/users?page=2&limit=10` yang mencakup data + metadata pagination
4. **Error server:** Buat response untuk error 500

Gunakan format response standar:

```json
{
  "success": true/false,
  "data": { ... },
  "message": "...",
  "errors": [ ... ]  // optional
}
```

**Hint:** Konsisten: sukses → `success: true, data: {...}`, gagal → `success: false, message: '...', errors: [...]`. Pagination meta: `page, limit, totalPages, totalItems`.

---

### 12. DNS — Cara Kerja & Record Types
**Pertanyaan:** Jelaskan:

1. Apa yang terjadi saat browser melakukan DNS lookup untuk `blog.example.com`?
2. Bedakan A record, CNAME record, MX record, dan TXT record
3. Kapan pakai A record vs CNAME record?
4. Apa fungsi TTL (Time To Live) di DNS?

Beri contoh konfigurasi DNS untuk domain `example.com` yang:
- Website utama di IP `203.0.113.10`
- Subdomain `blog` di IP `203.0.113.20`
- Email mail server di `mail.example.com`
- Verifikasi domain (TXT record) untuk Google Workspace

**Hint:** A → IPv4, CNAME → alias ke domain lain, MX → mail server, TXT → text info. TTL = cache duration. Root domain biasanya pake A record, subdomain bisa CNAME atau A.

---

### 13. HTTPS & TLS — Handshake & Certificate
**Pertanyaan:** 

1. Jelaskan perbedaan HTTP dan HTTPS (minimal 3 perbedaan)
2. Gambarkan langkah-langkah TLS handshake:
   - Client Hello
   - Server Hello + Certificate
   - Key Exchange
   - Secure Connection Established
3. Apa itu SSL/TLS certificate? Bedakan DV, OV, dan EV certificate
4. Bagaimana cara mendapatkan free SSL certificate? (contoh: Let's Encrypt)

**Hint:** HTTPS = HTTP + TLS. TLS handshake: client kirim supported cipher → server balas certificate + public key → client verify → generate session key → encrypted communication. Let's Encrypt = free automated SSL via Certbot.

---

### 14. CDN — Content Delivery Network
**Pertanyaan:**

1. Apa fungsi CDN dalam arsitektur web?
2. Bagaimana CDN mempercepat loading website?
3. Sebutkan minimal 3 provider CDN populer
4. Kapan sebaiknya pakai CDN? Kapan TIDAK perlu CDN?
5. Jelaskan konsep: edge server, origin server, cache hit, cache miss, purge cache

**Hint:** CDN cache static assets di edge server dekat user. Cache hit = cepat (dari edge), cache miss = ambil dari origin. Purge = hapus cache. Contoh: Cloudflare, AWS CloudFront, Fastly.

---

## Level 3: Challenge

### 15. Full Architecture Design — E-commerce Platform
**Skenario:** Kamu adalah System Architect yang diminta mendesain arsitektur untuk platform e-commerce skala besar. Fitur: catalog produk, user auth, keranjang, checkout, pembayaran, order tracking, search, rekomendasi.

**Pertanyaan:** Buat arsitektur lengkap meliputi:

1. **Diagram arsitektur** (deskripsi textual atau Mermaid):
   - Client (Web, Mobile)
   - CDN
   - Load Balancer
   - API Gateway
   - Microservices (Product Service, User Service, Order Service, Payment Service, Search Service)
   - Message Queue (RabbitMQ/Kafka)
   - Database per service (PostgreSQL, Redis, Elasticsearch)
   - Object Storage (untuk gambar produk)

2. **Alur request** untuk skenario "User mencari produk lalu checkout":
   - Dari browser → CDN → API Gateway → service mana aja?
   - Service mana yang pake cache, mana yang langsung ke database?

3. **Pola komunikasi:** Kapan pakai synchronous (REST) vs asynchronous (event-driven)?

4. **Security:** Dimana letak WAF, rate limiting, authentication?

**Hint:** API Gateway sebagai single entry point. Microservices komunikasi via REST untuk query, event bus untuk state changes. Redis cache untuk catalog. Elasticsearch untuk search. Payment pake async (biar nggak blocking).

---

### 16. Debug Real-World — Network Issue Analysis
**Skenario:** Pengguna melaporkan website lambat. Kamu diminta troubleshooting.

**Pertanyaan:** Analisis skenario berikut dan berikan solusi:

**Skenario A — Slow Page Load:**
- Page load time: 8.5 detik
- Breakdown dari Network tab:
  - HTML: 200ms
  - CSS (3 files, total 180KB): 2.1s
  - JS (2 files, total 2.3MB): 4.2s
  - Images (12 files, total 4.5MB): 5.8s (pararel loading)
  - API response: 1.2s

Identifikasi bottleneck utama dan usulkan minimal 4 optimasi.

**Skenario B — API Timeout:**
- `GET /api/products` kadang timeout (30s)
- Saat dicek, query database mengambil 50.000 rows dan nggak di-paginate
- Response JSON size > 10MB

Apa yang salah? Usulkan perbaikan.

**Skenario C — CORS Error:**
```
Access to fetch at 'https://api.example.com/data' from origin 'https://frontend.example.com' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

Jelaskan penyebab dan cara memperbaikinya.

**Hint:** A: kompresi gambar, code splitting, lazy loading, minify CSS/JS, HTTP/2 multiplexing. B: pagination, select kolom yang dibutuhkan aja, gzip response, indexing database. C: server harus set header `Access-Control-Allow-Origin: https://frontend.example.com`.

---

### 17. Deploy Pipeline — CI/CD Architecture
**Skenario:** Tim kamu develop Next.js app + Express API + PostgreSQL. Setup CI/CD dari nol.

**Pertanyaan:** Desain pipeline deployment lengkap:

1. **Version Control:** Branch strategy (Git Flow / GitHub Flow) — jelaskan pilihan
2. **CI Pipeline (GitHub Actions):**
   - Trigger: push ke `develop` dan `main`
   - Stages: lint → test → build → security scan
3. **CD Pipeline:**
   - Staging: auto-deploy dari `develop`
   - Production: manual approval dari `main` → deploy
   - Zero-downtime deployment strategy (blue-green atau rolling update)
4. **Infrastructure:**
   - Frontend: Vercel atau static hosting
   - Backend: Docker container di AWS ECS Fargate atau Railway
   - Database: RDS PostgreSQL dengan automated backup
   - Environment variables: GitHub Secrets → CI inject ke deployment
5. **Monitoring & Rollback:**
   - Health check endpoint
   - Automated rollback jika health check gagal
   - Logging (CloudWatch / Sentry)

Tulis pipeline dalam bentuk diagram langkah dan konfigurasi GitHub Actions YAML (minimal untuk stage build & deploy).

**Hint:**
```yaml
name: Deploy API
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
      - run: docker build -t api .
      - run: echo "Deploy ke production..."
```

---

### 18. Performance Optimization — Web Vitals & Core Web Vitals
**Skenario:** Website kamu punya skor Lighthouse rendah: Performance 45, Accessibility 70, SEO 80.

**Pertanyaan:** Analisis dan berikan solusi untuk masing-masing metrik Core Web Vitals:

**1. LCP (Largest Contentful Paint) — saat ini 4.2s (target: < 2.5s)**
- Penyebab: hero image besar (2MB), font loading blocking render
- Solusi: ?

**2. FID (First Input Delay) — saat ini 180ms (target: < 100ms)**
- Penyebab: JavaScript bundle besar (500KB), long tasks di main thread
- Solusi: ?

**3. CLS (Cumulative Layout Shift) — saat ini 0.35 (target: < 0.1)**
- Penyebab: image tanpa width/height, ads injecting late, web font FOIT/FOUT
- Solusi: ?

Untuk tiap metrik, berikan minimal 3 teknik optimasi spesifik. Jelaskan cara mengukur dan memonitor Core Web Vitals di production.

**Hint:** LCP: kompresi image (WebP/AVIF), preload hero image, optimize TTFB. FID: code splitting, lazy load JS, web worker. CLS: set width/height di img, gunakan `font-display: swap`, reserve space untuk ads/embeds. Alat ukur: Lighthouse, PageSpeed Insights, Chrome UX Report, web-vitals library.
