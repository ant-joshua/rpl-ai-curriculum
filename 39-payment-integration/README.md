# Modul 39: Payment Integration (Midtrans, Xendit, Stripe)

![Payment Integration](https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg)

> **Level:** Mahir  
> **Estimasi Waktu:** 12 jam  
> **Prasyararat:** Node.js + Express (Modul 6), pemahaman REST API & webhook  
> **Output Akhir:** Payment flow end-to-end: checkout → payment gateway → webhook → status update

## 📚 Materi

| Sesi | Topik | File |
|------|-------|------|
| 01 | Payment Basics — flow overview, gateway concepts, sandbox vs production, Midtrans Snap API | [view](01-payment-basics.md) |
| 02 | Midtrans Core API & Xendit — charge, status, cancel, refund, webhook signature, error handling | [view](02-midtrans-xendit.md) |
| 03 | Stripe Webhook — Checkout Session, Payment Intent, webhook security, idempotency | [view](03-stripe-webhook.md) |
| 04 | Production Payment — DB schema, idempotency & race condition, retry & reconciliation, PCI compliance | [view](04-production-payment.md) |

## 🎯 Output Akhir

Sistem payment end-to-end yang mencakup:

- **Flow checkout** — user pilih produk → hitung total → redirect ke payment gateway
- **Payment gateway integration** — Midtrans Snap, Midtrans Core API, Xendit Invoice, Stripe Checkout Session
- **Webhook handler** — verifikasi signature, update status transaksi, idempotency protection
- **Status update** — mapping status dari berbagai gateway ke status internal aplikasi
- **Reconciliation** — cron job sync status transaksi antara database dan payment gateway
- **Error handling & retry** — handle timeout, expired, denied, cancel scenarios

## 🤖 AI Prompt Exercises

Gunakan prompt ini di AI assistant seperti ChatGPT, Claude, atau Gemini untuk membantu pengembangan:

### Prompt 1: Generate CRUD payment endpoint
```
Buat Express endpoint POST /api/payments/checkout
- Terima { productId, quantity, paymentMethod }
- Hitung total dari database produk
- Generate transactionId unik
- Return Snap transaction token (Midtrans)
- Simpan transaction_id, amount, status='pending' ke tabel transactions
- Pakai error handling async wrapper
```

### Prompt 2: Generate webhook handler
```
Buat Express endpoint POST /api/payments/webhook/midtrans
- Verifikasi signature hash: sha512(order_id+status_code+gross_amount+server_key)
- Mapping status transaksi Midtrans ke status internal:
  settlement->success, capture->success, pending->pending,
  deny->failed, expire->expired, cancel->failed
- Update tabel transactions dengan status baru
- Return 200 OK
- Error handling: catch all, log, return 500
```

### Prompt 3: Generate reconciliation cron
```
Buat cron job harian untuk reconciliation payment:
- Ambil semua transaksi status pending yg > 24 jam
- Cek status real ke Midtrans API (transaction.status())
- Update status di database jika berbeda
- Log hasil reconciliation (matched, updated, failed)
- Pakai node-cron
```

### Prompt 4: Generate payment database schema
```
Buat migration SQL untuk tabel payments ecosystem:
- transactions: id, order_id, user_id, amount, status, payment_method,
  gateway, gateway_transaction_id, paid_at, created_at, updated_at
- refunds: id, transaction_id, amount, reason, status, gateway_refund_id,
  created_at
- invoices: id, transaction_id, invoice_number, due_date, paid_at,
  pdf_url, created_at
- Tambah index untuk order_id, gateway_transaction_id, status
- status enum: pending, success, failed, expired, refunded
```

### Prompt 5: Generate idempotency middleware
```
Buat Express middleware idempotency:
- Baca header Idempotency-Key dari request
- Cek di Redis/sql: jika key sudah ada, return response cached
- Jika baru, proses request dan simpan response
- Expire cache dalam 24 jam
- Handle race condition dengan database lock
- Return 409 Conflict jika key masih diproses
```
