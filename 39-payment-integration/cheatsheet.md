# 🧠 Cheatsheet: Payment Integration (Midtrans, Xendit, Stripe)

> Referensi cepet — 1 halaman. Modul 39: Integrasi payment gateway end-to-end.

## Topik Utama

| Sesi | Topik | Gateway |
|------|-------|---------|
| 01 | Payment Basics — flow, sandbox vs production, Midtrans Snap API | Midtrans Snap |
| 02 | Midtrans Core API & Xendit — charge, status, cancel, refund, webhook signature | Midtrans Core, Xendit |
| 03 | Stripe Webhook — Checkout Session, Payment Intent, idempotency | Stripe |
| 04 | Production Payment — DB schema, race condition, retry, reconciliation, PCI compliance | All |

## Command / Sintaks Penting

```bash
# Install gateway SDKs
npm install midtrans-client
npm install xendit-node
npm install stripe
```

### Midtrans Snap — Checkout Token

```javascript
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const transaction = await snap.createTransaction({
  transaction_details: {
    order_id: orderId,
    gross_amount: grossAmount,
  },
  credit_card: { secure: true },
  customer_details: { first_name, last_name, email, phone },
});
// return { token, redirect_url }
```

### Webhook Signature Verification — Midtrans

```javascript
const hash = crypto
  .createHash('sha512')
  .update(order_id + status_code + gross_amount + serverKey)
  .digest('hex');

if (hash !== signature_key) return res.status(403).json({ message: 'Invalid signature' });
```

### Webhook Signature — Stripe

```javascript
event = stripe.webhooks.constructEvent(req.body, sigHeader, endpointSecret);
```

### Transaction Status Mapping

| Status Internal | Midtrans | Xendit | Stripe |
|----------------|----------|--------|--------|
| **pending** | `pending` | `PENDING` | `requires_payment_method` |
| **success** | `settlement`, `capture` (fraud accept) | `PAID`, `SETTLED` | `succeeded`, `complete` |
| **failed** | `deny`, `cancel` | `FAILED` | `requires_payment_method` (failed) |
| **expired** | `expire` | `EXPIRED` | — |
| **refunded** | `refund`, `partial_refund` | — | `refunded` |

### DB Schema — Transactions Table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id),
  amount BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
  status transaction_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  gateway payment_gateway NOT NULL,
  gateway_transaction_id VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Idempotency — Optimistic Lock

```sql
UPDATE transactions
SET status = $1, updated_at = NOW()
WHERE order_id = $2 AND status = $3   -- cek status sebelumnya
RETURNING id;
```

## Tips & Trik

- **Webhook endpoint WAJIB pake `express.raw()`** — signature verification butuh body mentah
- **Jangan return 500 dari webhook** — gateway akan retry. Return 200 walau error
- **Pisah rute webhook** dari rute API biasa — beda middleware parsing body
- **Sandbox**: pake kartu test `4111 1111 1111 1111` buat Midtrans
- **Race condition**: pake optimistic lock (`WHERE status = 'pending'`) + transaction SQL
- **Reconciliation**: cron job harian sync status transaksi pending > 24 jam dengan gateway
- **Simpan `gateway_response` (JSONB)** — audit trail dan debugging
- **PCI compliance**: jangan simpan nomor kartu/CSV. Pake token dari gateway

## Common Mistakes

- ❌ **express.json() di route webhook** — signature verifikasi gagal. Pake `express.raw()`
- ❌ **Gak verifikasi signature webhook** — rawan fraud, attacker bisa fake notifikasi
- ❌ **Return 500 dari webhook** — gateway retry flood, tambah chaos
- ❌ **Gak handle idempotency** — duplicate webhook event update status double
- ❌ **Status mapping hardcode per gateway** — mapping beda tiap gateway, pake mapper function
- ❌ **Simpan amount tanpa satuan** — simpan dalam sen (IDR 15000 → 1500000) biar presisi

## Link Cepat

- [Module README](.)
- [Sesi 01 — Payment Basics & Midtrans Snap](01-payment-basics.md)
- [Sesi 02 — Midtrans Core & Xendit](02-midtrans-xendit.md)
- [Sesi 03 — Stripe Webhook](03-stripe-webhook.md)
- [Sesi 04 — Production Payment](04-production-payment.md)
