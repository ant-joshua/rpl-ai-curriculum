# RPP: Node.js & Express + Database

| Info | Detail |
|------|--------|
| Kode | RPL-AI-06 |
| Durasi | 5 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | JavaScript Fundamentals, TypeScript Basics |

## Pertemuan 1: Node.js Runtime & Express Setup

### Tujuan
- Memahami runtime Node.js dan modul system
- Setup project Express + TypeScript
- Membuat route sederhana

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Apersepsi**: Bedah URL API publik — lihat response JSON | Tanya jawab | Browser, Postman |
| 20' | **Node.js runtime**: event loop, commonjs vs esm, global objects | Ceramah + demo | Live code |
| 15' | **Setup project**: init, install express, tsconfig, scripts | Tutorial | Terminal |
| 15' | **Express basic route**: app.get, app.listen, req, res | Ceramah + demo | Live code |
| 20' | **Praktik**: Bikin API hello world + route /api/users return array dummy | Hands-on | Starter code |
| 10' | **Refleksi**: Test API pake browser + Postman/Thunder Client | Demo + praktik | Postman |

### Bahan Ajar
- [Module 06 - Node & Express](../06-node-express/)

---

## Pertemuan 2: Middleware, Routing & Error Handling

### Tujuan
- Menggunakan dan membuat middleware
- Setup routing modular dengan Express Router
- Menangani error secara terpusat

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review express setup** | Cek project siswa | — |
| 20' | **Middleware**: json parser, logger, CORS, custom middleware | Ceramah + demo | Live code |
| 15' | **Router**: express.Router, file terpisah, app.use | Ceramah + demo | Live code |
| 15' | **Error handling**: try/catch di route, error middleware, custom error class | Ceramah + demo | Live code |
| 25' | **Praktik**: Refactor route ke router + tambah logger + centralized error handler | Hands-on | Starter project |
| 10' | **Refleksi**: Urutan middleware penting — kenapa? | Q&A | — |

### Bahan Ajar
- [Module 06 - Node & Express](../06-node-express/)

---

## Pertemuan 3: Database PostgreSQL — Setup, Schema & CRUD

### Tujuan
- Setup PostgreSQL dan koneksi dari Node.js
- Membuat migration dan schema
- CRUD operations via SQL

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Review middleware & error handler** | Review code | — |
| 15' | **PostgreSQL intro**: install, psql, create database, table | Ceramah + demo | Terminal, pgAdmin |
| 15' | **Koneksi Node + PG**: node-postgres, pool, query | Ceramah + demo | Live code |
| 20' | **Migration**: CREATE TABLE, ALTER, seed data | Ceramah + demo | SQL file |
| 25' | **Praktik**: Bikin tabel users, seed 5 data, query SELECT/INSERT | Hands-on | Starter + SQL |
| 5' | **Refleksi**: SQL injection — kenapa harus parameterized query? | Peringatan | — |

### Bahan Ajar
- [Module 06 - Node & Express](../06-node-express/)

---

## Pertemuan 4: REST API CRUD — Express + PostgreSQL

### Tujuan
- Membuat CRUD endpoints untuk notes/todos
- Validasi input request
- Menggabungkan Express route dengan database query

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Review SQL + pg connection** | Live code review | — |
| 20' | **REST CRUD pattern**: GET, POST, PUT, DELETE — mapping ke SQL | Ceramah + demo | Live code |
| 15' | **Validasi input**: express-validator / Zod basic | Ceramah + demo | Live code |
| 30' | **Praktik**: Bikin CRUD notes API — route + db query + validation | Hands-on | Starter project |
| 10' | **Test API**: Postman — test semua endpoint | Praktik | Postman |
| 5' | **Refleksi**: HTTP status code untuk tiap operasi CRUD | Q&A | — |

### Bahan Ajar
- [Module 06 - Node & Express](../06-node-express/)

---

## Pertemuan 5: Environment Variables, Deployment & API Review

### Tujuan
- Mengelola environment variable (.env)
- Deploy Express API ke Railway
- Review & dokumentasi API

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Review CRUD API** | Cek endpoint | — |
| 15' | **Environment variable**: dotenv, .env, .env.example | Ceramah + demo | Live code |
| 10' | **Production readiness**: CORS, helmet, rate limiting | Ceramah | Slide |
| 25' | **Deploy Railway**: connect GitHub, env vars, migrate DB | Demo + praktik | Railway |
| 20' | **API documentation**: README API atau auto-docs (swagger/scalar) | Ceramah + demo | Live code |
| 10' | **Refleksi & tindak lanjut**: Preview Modul 07 — Mastra AI | Q&A | — |

### Bahan Ajar
- [Module 06 - Node & Express](../06-node-express/)
