# RPP: System Design — Arsitektur Aplikasi

| Info | Detail |
|------|--------|
| Kode | RPL-AI-11 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Beginner → Intermediate |
| Prasyarat | Bisa bikin REST API (Express atau framework lain) |

## Pertemuan 1: Arsitektur Aplikasi & Jaringan

### Tujuan
- Membedakan monolitik vs microservices
- Memahami DNS, HTTP/HTTPS, load balancer
- Mengetahui deployment strategies

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Apersepsi**: "Gimana arsitektur Instagram?" — tebak-tebakan | Brainstorming | Whiteboard |
| 20' | **Monolitik vs Microservices**: kapan pake mana, trade-off | Ceramah + visual | Slide diagram |
| 15' | **DNS & HTTP**: cara DNS resolve, HTTPS handshake | Ceramah + demo | Slide + terminal (dig, curl) |
| 10' | **Load balancer**: distribusi traffic, round-robin | Ceramah + visual | Slide |
| 10' | **Deployment strategies**: rolling, blue-green, canary | Ceramah | Slide |
| 20' | **Praktik**: Gambar arsitektur aplikasi sederhana — client, CDN, API, DB, cache | Hands-on | draw.io / kertas |
| 5' | **Refleksi**: Aplikasi lo sekarang monolitik atau microservice? | Q&A | — |

### Bahan Ajar
- [Module 11 - Architecture](../11-system-design/01-architecture.md)

---

## Pertemuan 2: Database Design

### Tujuan
- Merancang database yang ternormalisasi (1NF/2NF/3NF)
- Menggunakan indexing yang tepat (B-tree, composite)
- Mengatasi N+1 problem

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review arsitektur** | Kuis | — |
| 20' | **Normalisasi**: 1NF, 2NF, 3NF — denormalisasi kapan perlu | Ceramah + contoh | Slide + diagram |
| 15' | **Indexing**: B-tree, composite, query plan, EXPLAIN ANALYZE | Ceramah + demo | Live code (psql) |
| 10' | **N+1 problem**: penyebab, deteksi, solusi (eager loading, join) | Ceramah + demo | Live code |
| 20' | **Migration strategies**: schema change tanpa downtime | Ceramah | Slide |
| 15' | **Praktik**: Normalisasi tabel students → courses → enrollments | Hands-on | dbdiagram.io |
| 5' | **Refleksi**: Kapan denormalisasi lebih baik? | Q&A | — |

### Bahan Ajar
- [Module 11 - Database Design](../11-system-design/02-database-design.md)

---

## Pertemuan 3: Caching & CAP Theorem

### Tujuan
- Memahami caching strategies (cache aside, write through, write behind)
- Mengenal Redis data types
- Memahami CAP theorem dan trade-off

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review database design** | Review | — |
| 20' | **Caching strategies**: cache aside, write through, write behind, TTL | Ceramah + visual | Slide diagram |
| 15' | **Redis**: string, list, set, sorted set — demo CLI | Ceramah + demo | Terminal + redis-cli |
| 10' | **CDN**: edge caching, static assets, cache invalidation | Ceramah | Slide |
| 15' | **CAP theorem**: Consistency, Availability, Partition tolerance — pilih 2 | Ceramah + visual | Slide + kasus nyata |
| 20' | **Praktik**: Desain caching strategy untuk aplikasi e-commerce (produk, keranjang) | Hands-on | Soal kasus |
| 5' | **Refleksi**: Cache invalidation = salah satu masalah tersulit di CS? | Q&A | — |

### Bahan Ajar
- [Module 11 - Caching & CAP](../11-system-design/03-caching-cap.md)

---

## Pertemuan 4: Message Queue, Hosting & CI/CD

### Tujuan
- Memahami message queue untuk komunikasi async antar service
- Membandingkan opsi hosting
- Merancang CI/CD pipeline

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Review caching & CAP** | Q&A | — |
| 15' | **Message Queue**: RabbitMQ/Redis pub/sub, event-driven, broker | Ceramah + visual | Slide diagram |
| 10' | **Event-driven architecture**: producer, consumer, topic | Ceramah + visual | Slide |
| 15' | **Hosting comparison**: Vercel vs Railway vs Biznet vs DOKS | Diskusi | Slide perbandingan |
| 15' | **CI/CD pipeline**: build, test, deploy stages | Ceramah | Slide + GitHub Actions |
| 20' | **Praktik**: Desain arsitektur lengkap capstone — diagram + penjelasan | Hands-on | draw.io / kertas |
| 5' | **Refleksi**: Satu konsep hari ini yang langsung kepake di project lo | Q&A | — |

### Bahan Ajar
- [Module 11 - Queue & Hosting](../11-system-design/04-queue-hosting.md)
