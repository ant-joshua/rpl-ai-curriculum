# System Design — Latihan

## Level 1: Dasar

### Soal 1 — Diagram Komponen
Gambarkan (dalam bentuk ASCII / pseudo-diagram) arsitektur **e-commerce sederhana** yang terdiri dari:
- Client (web & mobile)
- API Gateway
- Service: Product, Order, Payment, User
- Database: PostgreSQL, Redis
- Message Queue

Tunjukkan arah alur data dari user checkout sampai konfirmasi pembayaran.

### Soal 2 — Database Design
Rancang skema tabel (SQL) untuk sistem **booking ruang meeting**:

- User bisa booking ruang dalam rentang waktu tertentu
- Satu ruang tidak boleh di-booking di jam yang sama
- Booking bisa dibatalkan (soft delete)
- Ada approval flow: booked → confirmed → cancelled

Tentukan primary keys, foreign keys, constraints, dan index yang relevan.

### Soal 3 — REST vs GraphQL
Anda membangun API untuk dashboard analytics yang menampilkan:
- Total revenue (dari 3 sumber data)
- Top 10 produk
- User growth line chart
- Real-time notification count

Jelaskan kapan REST lebih cocok dan kapan GraphQL lebih cocok untuk skenario di atas. Berikan argumentasi.

## Level 2: Intermediate

### Soal 4 — Caching Strategy
Desain caching untuk sistem **news feed** dengan karakteristik:
- 10 juta user aktif harian
- Feed bersifat personal (didasari follow + interest)
- Post bisa berupa text, image, video
- Latency target < 200ms

Jelaskan:
- Apa yang di-cache (pre-computed feed? potongan? metadata?)
- Cache key strategy
- Cache invalidation (write-through? write-behind? TTL?)
- Apa yang terjadi saat cache miss

### Soal 5 — CAP Trade-off
Skenario: Sistem **top-up dompet digital** (e-wallet) yang memproses 5000 transaksi/detik.

| Requirement | Deskripsi |
|-------------|-----------|
| Consistency | Saldo harus akurat, tidak boleh double-spend |
| Availability | User harus bisa top-up kapan saja |
| Partition Tolerance | Server bisa down kapan saja |

Pilih dua dari tiga (CA, CP, AP). Jelaskan trade-off yang Anda ambil dan bagaimana mitigasi risiko dari properti yang dikorbankan.

### Soal 6 — Rate Limiting & Throttling
Desain rate limiter untuk public API dengan skema berikut:

- 100 request/menit per API key (free tier)
- 1000 request/menit per API key (pro tier)
- Burst: 2x lipat dalam 10 detik pertama
- Response: `429 Too Many Requests` + header `Retry-After`

Implementasikan algoritma (Token Bucket atau Sliding Window) dalam pseudo-code. Jelaskan penyimpanan yang digunakan (Redis? In-memory?).

## Level 3: Challenge

### Soal 7 — Microservices Splitting
Anda ditugaskan me-refactor **monolith ERP** menjadi microservices. Monolith saat ini punya module:

```
User Management | Inventory | Order Processing | Payroll | Reporting
Customer CRM    | Shipping | Invoice          | HR      | Analytics Dashboard
```

Kelompokkan module-module di atas menjadi **5-6 microservices** yang kohesif. Jelaskan:
- Alasan pengelompokan (domain boundary)
- Bagaimana komunikasi antar-service (sync via REST/gRPC vs async via event bus)
- Bagaimana data consistency antar service (Saga pattern? Eventual consistency?)
- Bagian mana yang SEBAIKNYA tetap monolith dan kenapa

### Soal 8 — Scaling Database
Sistem **social media platform** dengan skala:

- Users: 50 juta
- Posts: 200 juta, tumbuh 1 juta/hari
- Comments: 2 miliar
- Reads: 100.000 QPS
- Writes: 10.000 QPS

Rancang strategi database scaling:

1. **Sharding key** — pilih dan jelaskan alasannya
2. **Replication** — read replicas? leader-follower? multi-leader?
3. **Denormalization** — field apa yang perlu di-denormalize dan kenapa
4. **Read/Write splitting** — bagaimana routing query
5. **Estimated cost trade-off** — performa vs konsistensi vs biaya infrastruktur
