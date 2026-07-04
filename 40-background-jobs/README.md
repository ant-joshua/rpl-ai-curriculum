<img src="https://images.pexels.com/photos/374016/pexels-photo-374016.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Background Jobs" style="width:100%;border-radius:12px;margin:12px 0;">

# 40. Background Jobs & Queue

> **Level:** 🔧 Intermediate  
> **Jam:** 8 (4 sesi)  
> **Prasyarat:** Paham Node.js, Express, Redis dasar  
> **Output:** Queue-powered app — email notification system

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:

- Paham masalah sync vs async processing dan kenapa queue dibutuhin
- Ngerti konsep queue: producer, consumer, broker, job
- Setup BullMQ + Redis buat job processing
- Handle job scheduling, retry, concurrency, dan progress reporting
- Implementasi use case nyata: email, PDF, image processing
- Deploy queue system production-ready dengan dashboard & monitoring

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Queue Concepts — sync vs async, Redis, BullMQ setup, job lifecycle | [01-queue-concepts.md](01-queue-concepts.md) |
| 2 | BullMQ Advanced — scheduling, concurrency, retry, events, sandbox | [02-bullmq-advanced.md](02-bullmq-advanced.md) |
| 3 | Real World Queue — email, PDF, image, notification batching, bulk export | [03-real-world-queue.md](03-real-world-queue.md) |
| 4 | Queue Production — Bull Board, dead letter, scaling, graceful shutdown | [04-queue-production.md](04-queue-production.md) |

## Output Akhir Modul

> **Queue-Powered Notification System** — aplikasi yang antre dan proses task async pake BullMQ + Redis. Bisa kirim email, generate PDF report, resize image, dan monitoring via dashboard. Semua job punya retry logic, progress tracking, dan graceful shutdown.

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:

- "Compare synchronous vs asynchronous processing with sequence diagrams"
- "Explain how Redis pub/sub and list data structures can implement a job queue"
- "Generate BullMQ code for a job that sends welcome email with retry logic of 3 attempts and exponential backoff"
- "What happens to incomplete jobs if my Node worker crashes? How do I recover them?"
- "Design a queue architecture for a platform that needs PDF invoice generation, image thumbnails, and batch email — including error handling and scaling strategy"
