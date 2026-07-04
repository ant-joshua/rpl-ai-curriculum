# RPP: Background Jobs & Queue

| Info | Detail |
|------|--------|
| Kode | RPL-AI-40 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | Node.js, Express, Redis dasar |

## Pertemuan 1: Queue Concepts — Sync vs Async, Redis, BullMQ Setup, Job Lifecycle

### Tujuan
- Memahami masalah sync vs async processing dan kenapa queue dibutuhkan
- Mengerti konsep queue: producer, consumer, broker, job
- Setup BullMQ + Redis untuk job processing dasar

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo website lambat karena proses berat, kenapa perlu async | Tanya jawab | Slide, browser |
| 20' | Materi inti: sync vs async, queue pattern (producer-consumer-broker), Redis data structures, job lifecycle | Ceramah + demo | Slide, diagram |
| 25' | Praktik terbimbing: install Redis + setup BullMQ + bikin job producer & consumer pertama | Hands-on | Starter code, terminal |
| 20' | Latihan mandiri: implement queue untuk proses simulate email sending | Problem solving | Soal |
| 15' | Diskusi & refleksi: use case queue di dunia nyata (email, notifikasi, export) | Q&A | — |

### Bahan Ajar
- [Module README](../40-background-jobs/)
- [Queue Concepts](../40-background-jobs/01-queue-concepts.md)

---

## Pertemuan 2: BullMQ Advanced — Scheduling, Concurrency, Retry, Events, Sandbox

### Tujuan
- Mengelola job scheduling & concurrency control
- Mengimplementasi retry logic dengan exponential backoff
- Memantau job lifecycle via events & sandbox workers

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap job lifecycle, diskusi error handling | Tanya jawab | Slide |
| 20' | Materi inti: job scheduling (repeatable), concurrency, retry strategies, events, sandbox workers | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implement scheduled job + retry dengan exponential backoff + event listener | Hands-on | Starter code |
| 20' | Latihan mandiri: bikin sandbox worker + progress reporting | Problem solving | Soal |
| 15' | Diskusi & refleksi: tradeoff concurrency tinggi vs resource | Q&A | — |

### Bahan Ajar
- [Module README](../40-background-jobs/)
- [BullMQ Advanced](../40-background-jobs/02-bullmq-advanced.md)

---

## Pertemuan 3: Real World Queue — Email, PDF, Image, Notification Batching, Bulk Export

### Tujuan
- Mengimplementasi queue untuk use case nyata: email notification system
- Memproses PDF generation & image processing via queue
- Notification batching & bulk export pattern

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap scheduling & retry, diskusi use case real | Tanya jawab | Slide |
| 20' | Materi inti: email queue pattern, PDF generation queue, image resize queue, notification batching, bulk export | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: build email notification system — welcome email + retry + template | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah PDF invoice generation & image thumbnail processing | Problem solving | Soal |
| 15' | Diskusi & refleksi: strategi batching untuk notifikasi massal | Q&A | — |

### Bahan Ajar
- [Module README](../40-background-jobs/)
- [Real World Queue](../40-background-jobs/03-real-world-queue.md)

---

## Pertemuan 4: Queue Production — Bull Board, Dead Letter, Scaling, Graceful Shutdown

### Tujuan
- Setup Bull Board dashboard untuk monitoring queue
- Mengelola dead letter queue & failed job recovery
- Scaling workers & graceful shutdown production-ready

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap queue use case, production concerns | Tanya jawab | Slide |
| 20' | Materi inti: Bull Board setup, dead letter queue, worker scaling, graceful shutdown, production monitoring | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Bull Board dashboard + implement graceful shutdown | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah dead letter handler + worker scaling config | Problem solving | Soal |
| 15' | Refleksi & output showcase: demo queue-powered notification system | Presentasi | Browser, dashboard |

### Bahan Ajar
- [Module README](../40-background-jobs/)
- [Queue Production](../40-background-jobs/04-queue-production.md)
