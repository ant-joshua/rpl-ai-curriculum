---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/540518/pexels-pho"
footer: "Sesi 01: Architecture"
---

<!-- _class: title -->
# Sesi 1: Arsitektur Aplikasi & Jaringan

> **Topik:** Monolitik vs Microservice, DNS, HTTP/HTTPS, REST, Load Balancer, Deployment Strategies

---

## 1. Monolitik vs Microservices

### Monolitik

Satu kode buat semuanya — frontend, backend, database query, semuanya dalam satu repo, satu server.

```mermaid
graph TB
    subgraph Monolith["Aplikasi Monolitik"]
        A[Express Server<br/>/auth · /products · /orders · /api]
        B[Database Connector]
        C[(PostgreSQL)]
        A --> B --> C
    end
    D[Browser / Mobile] --> A
```

**Ciri-ciri:**
- Satu kode base, satu deployment
- Semua fitur dalam satu proses
- Scaling: tinggal clone server

**Kelebihan:**
| Pro | Keterangan |
|-----|------------|
| ✅ Gampang di-start | Cocok buat proyek sekolah / MVP |
| ✅ Testing sederhana | Cukup 1 integration test suite |
| ✅ Deployment mudah | Jalanin 1 service aja |
| ✅ Debugging langsung | Error di 1 tempat |

**Kekurangan:**
| Cons | Keterangan |
|------|------------|
| ❌ 1 error matiin semua | Bug di fitur A bisa bikin fitur B ikut down |
| ❌ Susah dipisah tim | 2 orang edit file sama → conflict |
| ❌ Build & deploy lambat | Semakin gede kode, semakin lama |

**Analogi:** Mall dengan 1 tenant raksasa. Semua toko dalam satu ruangan — kalau toko makanan error, toko baju ikut tutup.

### Microservices

Fitur dipisah jadi service-service kecil, masing-masing jalan sendiri.

```mermaid
graph LR
    subgraph Services["Microservices"]
        A[Auth Service<br/>Port 3001]
        B[Product Service<br/>Port 3002]
        C[Order Service<br/>Port 3003]
    end
    subgraph DBs["Databases"]
        D[(DB Auth)]
        E[(DB Product)]
        F[(DB Order)]
    end
    G[API Gateway<br/>Port 3000]
    H[Browser / Mobile App]

    A --> D
    B --> E
    C --> F
    H --> G --> A
    G --> B
    G --> C
```

**Ciri-ciri:**
- Tiap service punya database sendiri
- Komunikasi via HTTP/REST atau message broker
- Bisa pakai tech stack beda tiap service

**Kelebihan:**
| Pro | Keterangan |
|-----|------------|
| ✅ Isolasi error | Service A mati, B & C tetap jalan |
| ✅ Scaling per-service | Yang sibuk aja di-scale |
| ✅ Tim independen | Tiap tim pegang service beda |
| ✅ Build/deploy cepet | Kode kecil-kecil |

**Kekurangan:**
| Cons | Keterangan |
|------|------------|
| ❌ Kompleksitas tinggi | Perlu API Gateway, service discovery, monitoring |
| ❌ Debugging susah | Tracing request antar service |
| ❌ Data consistency rumit | Transaksi lintas service butuh saga pattern |

**Analogi:** Mall dengan tenant terpisah. Toko baju punya pintu sendiri, kasir sendiri. Kalau toko makanan renovasi, lo tetap belanja baju.

### Kapan Pilih Yang Mana?

```mermaid
graph TD
    Q1["Tim >5 orang?"] -->|Ya| Q2
    Q1 -->|Tidak| Mono1["Mulai dengan Monolitik"]
    Q2["Fitur >10?"] -->|Ya| Q3
    Q2 -->|Tidak| Mono1
    Q3["Ada fitur dengan traffic 10x lipat?"] -->|Ya| Micro["Pertimbangkan Microservices"]
    Q3 -->|Tidak| Mono1
    Micro --> Warning["⚠️ Microservices overkill untuk <50 user<br/>Mulai monolitik, migrasi kalau perlu"]
```

---

## 2. DNS Resolution

DNS (Domain Name System) = **buku telepon internet**. Ubah nama domain (`google.com`) jadi IP address (`142.250.64.78`).

```mermaid
sequenceDiagram
    participant User as Browser
    participant DNS as DNS Resolver
    participant Server as Web Server

    User->>DNS: "siapa IP-nya rpl-capstone.com?"
    DNS-->>User: "103.xxx.xxx.xxx"
    User->>Server: GET / HTTP/1.1
    Server-->>User: HTML response
```

**Alur lengkap DNS lookup:**
1. **Browser cache** — cek dulu di local cache browser
2. **OS cache** — cek di `/etc/hosts` atau cache OS
3. **DNS Resolver** — tanya ke ISP (biasanya pake Google DNS `8.8.8.8` atau Cloudflare `1.1.1.1`)
4. **Root DNS** → **TLD DNS** (.com, .org) → **Authoritative DNS** (provider hosting lo)
5. Balikin IP address

**Kenapa lo peduli?**
- DNS lookup butuh waktu 20-120ms — kena ke tiap request pertama
- Pake DNS caching biar cepet (TTL biasanya 300-86400 detik)
- Cloudflare DNS `1.1.1.1` lebih cepet dari ISP default

---

## 3. HTTP / HTTPS / TLS

### HTTP (Hypertext Transfer Protocol)

Protokol buat komunikasi browser ↔ server. Format request-response.

```http
GET /api/products HTTP/1.1
Host: rpl-capstone.com
User-Agent: Mozilla/5.0
Accept: application/json

---

HTTP/1.1 200 OK
Content-Type: application/json

[{ "id": 1, "name": "Buku A" }]
```

### HTTPS = HTTP + TLS (SSL)

Data dikirim dalam bentuk **terenkripsi** — gak bisa dibaca orang di tengah jalan.

```mermaid
graph LR
    subgraph TanpaHTTPS["HTTP — Plain Text"]
        A1[Browser] -->|"GET /login<br/>password: rahasia123"| B1[Server]
        C1[Attacker] -.->|"BISA BACA ❌"| A1
    end
    subgraph DenganHTTPS["HTTPS — Encrypted"]
        A2[Browser] -->|"🔒 ENCRYPTED<br/>can't read"| B2[Server]
        C2[Attacker] -.->|"GABISA BACA ✅"| A2
    end
```

**Cara kerja TLS (simplified):**
1. Client minta koneksi HTTPS
2. Server kirim **SSL Certificate** (berisi public key)
3. Client verifikasi certificate (apakah valid, gak expired)
4. Client & server bikin **session key** (symmetric encryption)
5. Semua data dienkripsi pake session key itu

**TL;DR buat lo:**
- HTTPS **WAJIB** buat production — apalagi kalau ada login / payment
- Pake **Let's Encrypt** (gratis) atau Cloudflare
- HTTP cuma buat local development

---

## 4. REST Principles

REST (Representational State Transfer) = gaya arsitektur API yang paling populer.

### 6 Prinsip REST (lo cukup paham 4 yang bold)

| Prinsip | Maksud | Contoh |
|---------|--------|--------|
| **Client-Server** | Frontend & backend pisah | React panggil API Express |
| **Stateless** | Tiap request berdiri sendiri, gak perlu tahu request sebelumnya | JWT token dikirim tiap request |
| **Cacheable** | Response bisa di-cache | `Cache-Control: max-age=3600` |
| **Uniform Interface** | Endpoint konsisten | `/products`, `/products/1`, `/products/1/reviews` |
| Layered System | Client gak peduli di belakang ada apa aja | Bisa ada API Gateway, load balancer, dll |
| Code on Demand (optional) | Server kirim code executable | Jarang dipake |

### RESTful API Design

```javascript
// ✅ RESTful — endpoint ngikut resource
GET    /api/products          // list products
GET    /api/products/1        // detail product
POST   /api/products          // buat product baru
PUT    /api/products/1        // update product
DELETE /api/products/1        // hapus product

// ❌ BUKAN RESTful — endpoint pake verb
GET    /api/getProducts
POST   /api/createProduct
POST   /api/deleteProduct?id=1
```

**HTTP Status Codes yang sering kepake:**

| Kode | Arti | Kapan |
|------|------|-------|
| 200 | OK | Success GET, PUT, PATCH |
| 201 | Created | Success POST (data baru) |
| 204 | No Content | Success DELETE |
| 400 | Bad Request | Input gak valid |
| 401 | Unauthorized | Belum login |
| 403 | Forbidden | Gak punya akses |
| 404 | Not Found | Resource gak ada |
| 429 | Too Many Requests | Kena rate limit |
| 500 | Internal Server Error | Server error |

---

## 5. Load Balancer

**Load Balancer (LB)** = alat yang ngedistribusikan traffic ke beberapa server.

```mermaid
graph TB
    Internet["🌐 Internet"] --> LB["⚖️ Load Balancer"]
    LB --> Web1["Web Server 1"]
    LB --> Web2["Web Server 2"]
    LB --> Web3["Web Server 3"]
    Web1 --> DB[(Database)]
    Web2 --> DB
    Web3 --> DB
```

### Kenapa Perlu?

- 1 server bisa handle ~500-2000 request/detik
- Kalau user 10.000, 1 server jebol
- Dengan LB: traffic dibagi ke 3 server → masing-masing handle ~3.333 request

### Algoritma Load Balancing

| Metode | Cara Kerja | Analogi |
|--------|-----------|---------|
| **Round Robin** | Giliran: server 1 → 2 → 3 → 1 | Kasir bank: nomor antrian dibagi rata |
| **Least Connections** | Kirim ke server dengan koneksi paling sedikit | Pilih kasir antriannya paling pendek |
| **IP Hash** | Client yang sama selalu ke server yang sama | Siswa ke ruang kelas yang sama tiap hari |

### Untuk Capstone

Lo gak butuh load balancer beneran buat proyek sekolah. Tapi pahamin konsepnya:

- `pm2 start app.js -i max` → **cluster mode** — Node.js jalan pake semua CPU core
- Nanti di kerja beneran pake **NGINX** atau **AWS ALB**

```mermaid
graph LR
    subgraph TanpaLB["Tanpa LB"]
        A["Server<br/>1 core CPU"] --> B["😰 Kewalahan"]
    end
    subgraph DenganPM2["Dengan PM2 Cluster"]
        C["Server<br/>4 core CPU"] --> D["Proses 1"]
        C --> E["Proses 2"]
        C --> F["Proses 3"]
        C --> G["Proses 4"]
        D --> H["😎 Bagi-bagi request"]
        E --> H
        F --> H
        G --> H
    end
```

---

## 6. Deployment Strategies

### Big Bang Deployment

```mermaid
graph LR
    A["v1.0 (Lama)"] --> B["🚀 Deploy Langsung"] --> C["v2.0 (Baru)"]
    D["User"] --> C
    style A fill:#ff9999
    style C fill:#99ff99
```

**+** Paling sederhana  
**-** Kalau error, semua user kena

### Rolling Deployment

Update server satu per satu — gak semua kena downtime.

```mermaid
graph TB
    subgraph Tahap1["Tahap 1: 1 server di-update"]
        S1["✅ v2.0"] --> LB["Load Balancer"]
        S2["🔄 v1.0"] --> LB
        S3["🔄 v1.0"] --> LB
    end
    subgraph Tahap2["Tahap 2: 2 server di-update"]
        S1_2["✅ v2.0"] --> LB_2["Load Balancer"]
        S2_2["✅ v2.0"] --> LB_2
        S3_2["🔄 v1.0"] --> LB_2
    end
    subgraph Selesai["Selesai: Semua v2.0"]
        S1_3["✅ v2.0"] --> LB_3["Load Balancer"]
        S2_3["✅ v2.0"] --> LB_3
        S3_3["✅ v2.0"] --> LB_3
    end
```

### Blue-Green Deployment

Dua lingkungan identik. Blue = live. Green = versi baru. Test dulu, baru switch.

```mermaid
graph LR
    LB["Load Balancer"] -->|"🔵 LIVE"| Blue["Blue Env (v1.0)"]
    LB -.->|"🔴 STANDBY"| Green["Green Env (v2.0)"]
    
    subgraph After["Setelah Switch"]
        LB2["Load Balancer"] -->|"🔵 LIVE"| Green2["Green Env (v2.0)"]
        LB2 -.->|"🔴 STANDBY"| Blue2["Blue Env (v1.0)"]
    end
```

**+** Rollback instan — tinggal switch balik  
**-** Butuh 2x resource (2 lingkungan)

### Canary Deployment

Kirim versi baru ke **sebagian kecil user** dulu. Kalau aman, rollout ke semua.

```mermaid
graph TB
    LB["Load Balancer"] -->|"90% user"| Stable["Stable (v1.0)"]
    LB -->|"10% user"| Canary["Canary (v2.0)"]
    Canary --> Monitor["📊 Monitor error rate"]
    Monitor -->|"✅ Aman"| Full["Rollout ke 100%"]
    Monitor -->|"❌ Error tinggi"| Rollback["Rollback ke v1.0"]
```

---

## Latihan

1. **Diagram arsitektur:** Gambar arsitektur monolitik untuk aplikasi capstone lo (minimal: server, database, client). Terus gambar versi microservices-nya. Apa aja yang berubah?

2. **DNS & HTTPS:** Cek domain (atau IP) aplikasi capstone lo pake `nslookup` atau `dig`. Terus cek apakah udah pake HTTPS. Kalau belum, cari tau gimana cara pasang SSL pake Let's Encrypt.

3. **Desain REST API:** Dari fitur capstone lo, buat daftar endpoint REST yang lo butuhin. Tulis method (GET/POST/PUT/DELETE), path, dan status code response untuk tiap endpoint. Jangan lupa grouping berdasarkan resource.

4. **Strategi deployment:** Kalau lo deploy aplikasi capstone ke Vercel + Railway, termasuk strategi deployment apa (big bang, rolling, blue-green, canary)? Jelaskan kenapa.
