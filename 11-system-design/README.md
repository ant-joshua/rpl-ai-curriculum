<img src="https://images.pexels.com/photos/540518/pexels-photo-540518.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="System Design" style="width:100%;border-radius:12px;margin:12px 0;">

# Modul 11: System Design — Arsitektur Aplikasi untuk Pemula

> **Level:** 🌱 Beginner → 🌿 Intermediate  
> **Jam:** 8 (4 minggu × 1 sesi)  
> **Prasyarat:** Bisa bikin REST API pakai Express.js atau framework lain  
> **Output:** System design diagram + dokumentasi arsitektur untuk proyek capstone  

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Membedakan arsitektur monolitik vs microservices dan kapan pake masing-masing
- Merancang database yang ternormalisasi dengan indexing yang tepat
- Memahami caching strategies (Redis, CDN) dan kapan pakainya
- Menjelaskan CAP theorem dan milih trade-off yang tepat
- Merancang message queue sederhana untuk komunikasi antar service
- Membandingkan opsi hosting dan memahami CI/CD pipeline

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Arsitektur Aplikasi & Jaringan — monolitik vs microservice, DNS, HTTP/HTTPS, REST, load balancer, deployment strategies | [01-architecture.md](01-architecture.md) |
| 2 | Database Design — normalisasi (1NF/2NF/3NF), indexing (B-tree, composite), N+1 problem, migration strategies | [02-database-design.md](02-database-design.md) |
| 3 | Caching & CAP Theorem — caching strategies (cache aside, write through, write behind), Redis data types, CDN, CAP theorem, consistency models | [03-caching-cap.md](03-caching-cap.md) |
| 4 | Message Queue & Hosting — RabbitMQ/Redis pub/sub, event-driven architecture, hosting comparison (Vercel/Railway/Biznet/DOKS), CI/CD pipeline | [04-queue-hosting.md](04-queue-hosting.md) |

## Output Akhir Modul

> **System Design Document** — diagram arsitektur capstone lengkap dengan penjelasan: pilihan arsitektur, desain database, strategi caching, dan rencana deployment.

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Explain this architecture diagram and suggest improvements"
- "Find the bottleneck in this system design"
- "Compare monolithic vs microservices for this use case"
- "Generate a normalized database schema for this requirement"
- "Which caching strategy fits this scenario and why?"
- "Design a CI/CD pipeline for this tech stack"

---

## Catatan

Modul ini nge-cover konsep system design yang langsung kepake di proyek capstone. Fokus ke praktik — lo gak perlu hafal teori akademik. Tiap sesi ada file sendiri dengan penjelasan detail, kode contoh, dan latihan.

---
*Ditulis untuk siswa SMK RPL — fokus ke praktik, minimal teori akademik yang gak penting.*
