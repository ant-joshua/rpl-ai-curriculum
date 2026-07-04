# RPP: Payment Integration (Midtrans, Xendit, Stripe)

| Info | Detail |
|------|--------|
| Kode | RPL-AI-39 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Mahir |
| Prasyarat | Node.js + Express, REST API & webhook |

## Pertemuan 1: Payment Basics & Midtrans Snap

### Tujuan
- Memahami flow payment end-to-end (checkout → gateway → webhook → status)
- Membedakan sandbox vs production environment
- Integrasi Midtrans Snap API untuk checkout flow

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: tanya pengalaman belanja online, breakdown flow pembayaran | Tanya jawab | Slide |
| 20' | Materi inti: payment gateway overview, sandbox vs production, Midtrans Snap flow, transaction token | Ceramah + demo | Slide, dashboard Midtrans |
| 25' | Praktik terbimbing: setup akun Midtrans sandbox + implement Snap checkout endpoint | Hands-on | Starter code, dashboard |
| 20' | Latihan mandiri: generate CRUD payment endpoint — checkout dengan Midtrans Snap | Problem solving | Soal |
| 15' | Diskusi & refleksi: perbandingan gateway di Indonesia | Q&A | — |

### Bahan Ajar
- [Module README](../39-payment-integration/)

---

## Pertemuan 2: Midtrans Core API & Xendit

### Tujuan
- Integrasi Midtrans Core API untuk transaksi langsung
- Menggunakan Xendit Invoice API
- Menangani webhook signature verification & error handling

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap Snap flow, bedanya Snap vs Core API | Tanya jawab | Slide |
| 20' | Materi inti: Midtrans Core API charge, Xendit Invoice, webhook signature, error scenarios | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implement charge API + webhook handler dengan signature verification | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah Xendit invoice flow + webhook error handling | Problem solving | Soal |
| 15' | Diskusi & refleksi: tantangan integrasi multi-gateway | Q&A | — |

### Bahan Ajar
- [Module README](../39-payment-integration/)

---

## Pertemuan 3: Stripe Webhook — Checkout Session, Payment Intent

### Tujuan
- Integrasi Stripe Checkout Session & Payment Intent
- Mengamankan Stripe webhook dengan signature verification
- Implementasi idempotency untuk mencegah duplikasi

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap Midtrans vs Stripe, kenapa Stripe populer global | Tanya jawab | Slide |
| 20' | Materi inti: Stripe Checkout Session, Payment Intent, webhook security, idempotency key | Ceramah + demo | Live code, Stripe dashboard |
| 25' | Praktik terbimbing: setup Stripe Checkout Session + webhook handler idempotent | Hands-on | Starter code |
| 20' | Latihan mandiri: implement Payment Intent flow + idempotency middleware | Problem solving | Soal |
| 15' | Diskusi & refleksi: perbandingan Stripe vs Midtrans/Xendit untuk pasar Indonesia | Q&A | — |

### Bahan Ajar
- [Module README](../39-payment-integration/)

---

## Pertemuan 4: Production Payment — DB Schema, Reconciliation, PCI Compliance

### Tujuan
- Mendesain database schema untuk payment ecosystem
- Implementasi reconciliation cron job & race condition handling
- Memahami PCI compliance & retry mechanism

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap webhook & idempotency, diskusi production concerns | Tanya jawab | Slide |
| 20' | Materi inti: DB schema transactions/refunds/invoices, reconciliation cron, race condition, PCI DSS | Ceramah + demo | Live code, diagram |
| 25' | Praktik terbimbing: implement payment DB migration + reconciliation cron job | Hands-on | Starter code |
| 20' | Latihan mandiri: setup idempotency middleware + retry mechanism untuk failed transactions | Problem solving | Soal |
| 15' | Refleksi & wrap-up: best practices production payment, checklist go-live | Q&A | — |

### Bahan Ajar
- [Module README](../39-payment-integration/)
