# 🧩 Microservices Hands-On

![Microservices Architecture](https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg)

> **Level:** Advanced  
> **Prerequisites:** Modul 6 (Node.js Express), Modul 21 (Docker)  
> **Output:** 3 microservices + API Gateway

---

## 📋 Deskripsi

Modul ini memberikan pengalaman hands-on membangun arsitektur microservices dari nol. Mulai dari memecah monolith menjadi service-service terpisah, mengelola komunikasi antar service (REST, gRPC, message queue), hingga menyatukan semuanya di belakang API Gateway.

Peserta akan membangun 3 microservices (User Service, Product Service, Order Service) yang saling berkomunikasi, masing-masing dengan database sendiri, plus sebuah API Gateway sebagai entry point terpusat.

---

## 🎯 Tujuan Pembelajaran

- Memahami prinsip bounded context dan pemecahan monolith
- Mampu mengelola multi-service dengan Docker Compose
- Mengimplementasikan komunikasi REST, gRPC, dan message queue
- Membangun API Gateway dengan routing, auth, dan rate limiting

---

## 📚 Sesi

| Sesi | Judul | File | Durasi |
|------|-------|------|--------|
| 01 | Monolith to Microservices | [view](01-monolith-to-micro.md) | 120 menit |
| 02 | Docker Multi-Service | [view](02-docker-multi-service.md) | 120 menit |
| 03 | Inter-Service Communication | [view](03-inter-service-comm.md) | 120 menit |
| 04 | API Gateway | [view](04-api-gateway.md) | 120 menit |

**Total durasi:** 480 menit (8 jam)

---

## 🛠 Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Runtime | Node.js + TypeScript |
| Container | Docker + Docker Compose |
| Database | PostgreSQL (User), MongoDB (Product), MySQL (Order) |
| Message Queue | RabbitMQ |
| API Gateway | Traefik |
| Service Discovery | DNS / Consul |
| Monitoring | Centralized logging (winston + ELK)

---

## 📁 Struktur Repository

```
50-microservices-hands-on/
├── README.md
├── 01-monolith-to-micro.md
├── 02-docker-multi-service.md
├── 03-inter-service-comm.md
├── 04-api-gateway.md
└── projects/
    ├── user-service/
    ├── product-service/
    ├── order-service/
    └── gateway/
```

---

## ✅ Output Akhir

1. **User Service** — auth, profil, manajemen user (PostgreSQL)
2. **Product Service** — katalog, stok, harga (MongoDB)
3. **Order Service** — checkout, riwayat pesanan (MySQL)
4. **API Gateway** — routing, rate limiting, auth gateway (Traefik)

Semua service berjalan di container Docker, saling berkomunikasi via REST internal + message queue, dengan API Gateway sebagai single entry point.
