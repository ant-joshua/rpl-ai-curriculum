# RPP: Microservices Hands-On

| Info | Detail |
|------|--------|
| Kode | RPL-AI-50 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | Modul 6 (Node.js Express), Modul 21 (Docker) |

## Pertemuan 1: Monolith to Microservices

### Tujuan
- Memahami prinsip bounded context dan pemecahan monolith
- Mengidentifikasi service boundaries dari aplikasi monolith
- Mendesain arsitektur microservices: User Service, Product Service, Order Service
- Setup proyek dasar dengan TypeScript

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi: demo monolith app, diskusi masalah: "kenapa satu codebase besar susah di-scale?" | Brainstorming | Slide, diagram |
| 20' | Materi inti: monolith vs microservices, bounded context (Domain-Driven Design), service decomposition patterns, database per service, eventual consistency | Ceramah + diagram | Whiteboard, slide |
| 25' | Praktik terbimbing: analisis monolith e-commerce, identifikasi bounded context (user, product, order), breakdown ke 3 service, buat folder structure TypeScript | Hands-on | Starter monolith code |
| 20' | Materi lanjutan: shared library (types, validation), monorepo vs polyrepo, ORM per service, service template | Ceramah + demo | Live code |
| 10' | Latihan mandiri: buat service template dengan Express + TypeScript, shared types package | Problem solving | Soal |
| 5' | Refleksi: bounded context — kapan suatu fitur layak jadi service sendiri? | Q&A | — |

### Bahan Ajar
- [Module README](../50-microservices-hands-on/README.md)
- [Monolith to Microservices](../50-microservices-hands-on/01-monolith-to-micro.md)

---

## Pertemuan 2: Docker Multi-Service

### Tujuan
- Membuat Dockerfile untuk setiap service
- Setup Docker Compose multi-service (user, product, order + database masing-masing)
- Mengelola network, volume, environment variables antar service
- Menggunakan health check di Compose

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | Review: service decomposition, containerize service | Q&A | — |
| 20' | Materi inti: Dockerfile per service (multi-stage), Docker Compose (services, networks, volumes, env_file), depends_on dengan health check | Ceramah + demo | Live code |
| 30' | Praktik terbimbing: buat Dockerfile untuk User, Product, Order service. Setup docker-compose.yml dengan PostgreSQL (User), MongoDB (Product), MySQL (Order), network bridge | Hands-on | Starter code |
| 20' | Materi lanjutan: Compose health check (test: curl, interval, retries), environment variable inheritance, .env file, volume for data persistence, .dockerignore | Ceramah + demo | Terminal |
| 10' | Latihan mandiri: tambah health check di tiap service, test service discovery via service name, volume persistence | Problem solving | Soal |
| 5' | Refleksi: Docker Compose vs Kubernetes — kapan pakai yang mana? | Q&A | — |

### Bahan Ajar
- [Module README](../50-microservices-hands-on/README.md)
- [Docker Multi-Service](../50-microservices-hands-on/02-docker-multi-service.md)

---

## Pertemuan 3: Inter-Service Communication

### Tujuan
- Mengimplementasikan komunikasi REST antar service
- Setup message queue dengan RabbitMQ
- Menerapkan API Gateway pattern awal
- Menangani eventual consistency

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Review: multi-service Docker, bagaimana service saling bicara? | Q&A | Diagram |
| 20' | Materi inti: synchronous (REST, gRPC) vs asynchronous (message queue), RabbitMQ concepts (exchange, queue, routing key), event-driven architecture, eventual consistency patterns (Saga, Outbox) | Ceramah + diagram | Slide, whiteboard |
| 25' | Praktik terbimbing: setup REST communication: User Service panggil Product Service via HTTP internal, setup RabbitMQ + publisher/consumer di Order Service | Hands-on | Starter code, RabbitMQ UI |
| 20' | Materi lanjutan: gRPC vs REST vs message queue perbandingan, service discovery (DNS/Consul), retry & circuit breaker antar service, idempotency | Ceramah + demo | Live code |
| 10' | Latihan mandiri: implement event "order.created" → Product Service update stock, handle failure | Problem solving | Soal |
| 5' | Refleksi: kapan sync vs async communication? Trade-off complexity vs consistency | Q&A | — |

### Bahan Ajar
- [Module README](../50-microservices-hands-on/README.md)
- [Inter-Service Communication](../50-microservices-hands-on/03-inter-service-comm.md)

---

## Pertemuan 4: API Gateway

### Tujuan
- Setup API Gateway dengan Traefik
- Routing ke masing-masing service
- Implementasi rate limiting, auth gateway, CORS terpusat
- Monitoring dengan centralized logging

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | Review: inter-service comm, semua service butuh entry point terpusat | Q&A | — |
| 20' | Materi inti: API Gateway pattern (routing, auth, rate limiting, aggregation), Traefik vs Nginx vs Kong, Traefik concepts (router, middleware, service), dynamic configuration | Ceramah + demo | Slide, diagram |
| 30' | Praktik terbimbing: setup Traefik di Docker Compose (static config, dynamic config via labels), routing: /users → User Service, /products → Product Service, /orders → Order Service, auth middleware (JWT validation at gateway) | Hands-on | Starter code |
| 20' | Materi lanjutan: rate limiting di gateway (per service), CORS terpusat, centralized logging (winston + ELK stack / Loki), request tracing (correlation ID via header) | Ceramah + demo | Traefik dashboard, logs |
| 10' | Latihan mandiri: setup rate limit berbeda per route, correlation ID propagation, test end-to-end flow | Problem solving | Soal |
| 5' | Refleksi: API Gateway as single point of failure — mitigasi (HA, multiple instance) | Q&A | — |

### Bahan Ajar
- [Module README](../50-microservices-hands-on/README.md)
- [API Gateway](../50-microservices-hands-on/04-api-gateway.md)
