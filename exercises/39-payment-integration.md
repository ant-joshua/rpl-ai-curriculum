# Payment Integration — Latihan

## Level 1: Dasar

### 1. Midtrans Snap — Generate Token
**Pertanyaan:** Lengkapi kode berikut untuk generate Midtrans Snap token:

```typescript
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

interface OrderData {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

async function createSnapToken(order: OrderData): Promise<string> {
  // === LENGKAPI KODE INI ===
  // 1. Buat parameter object untuk Midtrans
  // 2. Set transaction_details, customer_details, item_details
  // 3. Handle error (invalid amount, duplicate order_id)
  // 4. Return snap token
}

// Contoh usage:
// const token = await createSnapToken({
//   orderId: 'ORDER-001',
//   amount: 150000,
//   customerName: 'Budi',
//   customerEmail: 'budi@example.com',
//   items: [{ id: 'p1', name: 'Laptop', price: 150000, quantity: 1 }]
// });
```

**Hint:** `snap.createTransaction(parameter)` mengembalikan `{ token, redirect_url }`. Parameter harus punya `transaction_details: { order_id, gross_amount }` dan `item_details` harus jumlahnya sesuai `gross_amount`. Handle `MidtransError` untuk error handling.

---

### 2. Webhook Signature — Validasi
**Pertanyaan:** Tulis kode untuk memvalidasi signature dari Midtrans webhook:

```typescript
import crypto from 'crypto';

interface MidtransNotification {
  order_id: string;
  status_code: string;
  transaction_status: string;
  gross_amount: string;
  signature_key: string;
}

function validateMidtransSignature(
  notification: MidtransNotification,
  serverKey: string
): boolean {
  // === LENGKAPI ===
  // 1. Buat string yang perlu di-hash
  // 2. Hitung SHA-512 hash
  // 3. Bandingkan dengan signature_key
}

// webhook endpoint
app.post('/api/webhook/midtrans', (req, res) => {
  const notification = req.body;
  
  // === VALIDASI SIGNATURE ===
  
  // === PROSES BERDASARKAN STATUS ===
  // transaction_status: capture, settlement = success
  // pending = belum dibayar
  // cancel, expire, deny = gagal
});
```

**Hint:** String format: `${orderId}${statusCode}${grossAmount}${serverKey}`. Hash: `crypto.createHash('sha512').update(str).digest('hex')`. Status mapping: `capture/settlement` = success (update order status), `pending` = waiting, `cancel/expire/deny` = failed. **PENTING**: validasi signature sebelum proses apapun untuk mencegah webhook palsu.

---

### 3. Stripe Checkout — Session
**Pertanyaan:** Implementasi Stripe Checkout Session:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CreateCheckoutParams {
  items: Array<{
    name: string;
    price: number; // dalam cents
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
}

async function createCheckoutSession(params: CreateCheckoutParams): Promise<string> {
  // === LENGKAPI ===
  // 1. Convert items ke Stripe line_items format
  // 2. Buat checkout session
  // 3. Return checkout URL
}

// Stripe line_items format:
// {
//   price_data: {
//     currency: 'idr',
//     product_data: { name: 'Laptop' },
//     unit_amount: 15000000
//   },
//   quantity: 1
// }
```

**Hint:** `stripe.checkout.sessions.create({ mode: 'payment', line_items, success_url, cancel_url })`. Return `session.url`. Gunakan `price_data` untuk dynamic pricing atau `price` ID untuk fixed prices. Jangan lupa set `currency: 'idr'`.

---

### 4. Idempotency — Pencegahan Double Charge
**Pertanyaan:** Jelaskan konsep idempotency dan implementasi:

```
Skenario: User klik "Bayar" dua kali dalam 1 detik. 
Apa yang terjadi tanpa idempotency? Bagaimana mencegahnya?
```

```typescript
// Implementasi idempotency key
async function createPaymentWithIdempotency(
  orderId: string,
  amount: number
) {
  // === LENGKAPI ===
  // 1. Generate atau gunakan idempotency key dari request
  // 2. Cek apakah key sudah ada di database
  // 3. Jika ada, return result yang sama
  // 4. Jika tidak, proses pembayaran
  // 5. Simpan key + result ke database
}
```

**Hint:** Idempotency key biasanya `${orderId}-${endpoint}` atau dari header `Idempotency-Key`. Simpan di tabel `idempotency_keys` dengan TTL. Jika key sudah ada, return cached response. Jika belum, proses dan simpan. Key expires setelah 24-48 jam.

---

### 5. Transaction Database — Schema Design
**Pertanyaan:** Buat PostgreSQL schema untuk sistem pembayaran yang mendukung Midtrans dan Stripe:

```sql
-- === LENGKAPI CREATE TABLE INI ===

-- Tabel orders
-- - id (UUID, primary key)
-- - user_id (UUID, foreign key)
-- - status (enum: pending, paid, cancelled, refunded)
-- - total_amount (decimal)
-- - currency (varchar 3)
-- - created_at, updated_at

-- Tabel payments
-- - id (UUID, primary key)
-- - order_id (UUID, foreign key)
-- - provider (enum: midtrans, stripe)
-- - provider_payment_id (varchar, unique)
-- - amount (decimal)
-- - status (enum: pending, success, failed)
-- - raw_response (jsonb untuk simpan response dari provider)
-- - created_at, updated_at

-- Tabel payment_events
-- - id (UUID, primary key)
-- - payment_id (UUID, foreign key)
-- - event_type (varchar) -- settlement, capture, expire, dll
-- - payload (jsonb)
-- - created_at
```

Tulis CREATE TABLE lengkap dengan indexes yang tepat.

**Hint:** Indexes: `payments(provider_payment_id)` untuk lookup cepat, `payments(order_id)` untuk join, `payment_events(payment_id)` untuk history. Gunakan `ENUM` type untuk status. `raw_response` penting untuk debugging. `payment_events` untuk audit trail.

---

## Level 2: Menengah

### 6. Payment Flow — State Machine
**Pertanyaan:** Implementasi payment state machine:

```typescript
type PaymentStatus = 'initiated' | 'pending' | 'processing' | 'success' | 'failed' | 'refunded';

interface PaymentStateTransition {
  from: PaymentStatus;
  to: PaymentStatus;
  trigger: string; // event yang memicu transisi
}

// Definisikan valid transitions
const VALID_TRANSITIONS: PaymentStateTransition[] = [
  // === LENGKAPI SEMUA TRANSISI ===
  // initiated -> pending (user mulai bayar)
  // pending -> processing (payment provider memproses)
  // processing -> success (payment berhasil)
  // processing -> failed (payment gagal)
  // success -> refunded (user minta refund)
  // dll
];

function canTransition(currentStatus: PaymentStatus, newStatus: PaymentStatus): boolean {
  // === LENGKAPI ===
}

async function transitionPaymentStatus(
  paymentId: string,
  newStatus: PaymentStatus,
  metadata?: Record<string, any>
): Promise<void> {
  // === LENGKAPI ===
  // 1. Ambil current status dari DB
  // 2. Validasi transisi
  // 3. Update status di DB
  // 4. Log event di payment_events
  // 5. Trigger side effects (email, inventory update, dll)
}
```

**Hint:** State machine mencegah transisi invalid (misal: success langsung ke initiated). Log setiap transisi untuk audit. Side effects: success -> email confirmation + deduct inventory; failed -> restore inventory; refunded -> restore inventory + email notification.

---

### 7. Payment Notification Handler
**Pertanyaan:** Implementasi handler untuk notifikasi dari payment provider:

```typescript
// Handler untuk Midtrans notification
async function handleMidtransNotification(req: Request, res: Response) {
  const notification = req.body as MidtransNotification;
  
  // === LENGKAPI ===
  // 1. Validasi signature (soal 2)
  // 2. Decode notification (base64) jika perlu
  // 3. Proses berdasarkan transaction_status:
  //    - capture/settlement -> update order & payment, kirim email
  //    - pending -> log saja
  //    - deny/cancel/expire -> update status, kembalikan stok
  // 4. Return 200 OK ke Midtrans (WAJIB! kalau tidak, Midtrans akan retry)
  // 5. Handle error gracefully

  res.status(200).json({ status: 'ok' });
}

// Handler untuk Stripe webhook
async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  // === LENGKAPI ===
  // 1. Verify webhook signature dengan stripe.webhooks.constructEvent
  // 2. Handle event types:
  //    - checkout.session.completed -> update order
  //    - payment_intent.succeeded -> update payment
  //    - payment_intent.payment_failed -> update status
  // 3. Return 200
}
```

**Hint:** Midtrans: pastikan return 200, kalau error Midtrans akan retry sampai 5x dengan exponential backoff. Stripe: `stripe.webhooks.constructEvent(req.body, sig, endpointSecret)` — **PENTING**: gunakan `req.body` yang raw (bukan parsed JSON), set `express.raw()` untuk webhook route. Handle idempotency: cek event ID apakah sudah diproses.

---

## Level 3: Lanjutan

### 8. Reconciliation — Sinkronisasi Data
**Pertanyaan:** Implementasi reconciliation antara database internal dan payment provider:

```typescript
// Reconciliation job - jalan setiap jam
async function reconcilePayments() {
  // === LENGKAPI ===
  // 1. Ambil semua payment dengan status 'processing' yang lebih dari 1 jam
  // 2. Cek status ke payment provider (Midtrans/Stripe API)
  // 3. Update status lokal jika berbeda
  // 4. Flag discrepancy untuk review manual
}

interface ReconciliationResult {
  checked: number;
  matched: number;
  mismatched: number;
  discrepancies: Array<{
    paymentId: string;
    localStatus: string;
    providerStatus: string;
    action: string;
  }>;
}
```

Tulis fungsi reconciliation lengkap yang:
- Cek status ke Midtrans API (`GET /v2/{order_id}/status`)
- Cek status ke Stripe API (`stripe.paymentIntents.retrieve`)
- Generate laporan discrepancy
- Auto-fix untuk kasus yang jelas (misal: provider success tapi local masih processing)

**Hint:** Midtrans: `GET https://api.sandbox.midtrans.com/v2/{order_id}/status` dengan header `Authorization: Basic base64(serverKey:)`. Reconciliation penting untuk mencegah order "hang" — user bayar tapi status tidak update karena webhook gagal. Auto-fix aman untuk: provider=success, local=processing -> update ke success. Manual review untuk: provider=failed, local=success (indikasi fraud atau error).

---

### 9. Multi-Currency & Exchange Rate
**Pertanyaan:** Implementasi multi-currency payment:

```typescript
interface CurrencyConfig {
  code: string; // IDR, USD, SGD
  symbol: string;
  decimalPlaces: number;
  minAmount: number;
  maxAmount: number;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  IDR: { code: 'IDR', symbol: 'Rp', decimalPlaces: 0, minAmount: 1000, maxAmount: 500000000 },
  USD: { code: 'USD', symbol: '$', decimalPlaces: 2, minAmount: 0.5, maxAmount: 10000 },
};

// === LENGKAPI ===
async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<{ convertedAmount: number; rate: number }> {
  // 1. Fetch exchange rate dari API (exchangerate-api.com atau similar)
  // 2. Convert amount
  // 3. Handle rounding sesuai decimalPlaces tujuan
  // 4. Cache exchange rate selama 1 jam
}

async function createMultiCurrencyPayment(
  orderId: string,
  amount: number,
  currency: string,
  targetCurrency: string = 'IDR'
) {
  // 1. Validate currency support
  // 2. Convert ke target currency jika perlu
  // 3. Create payment dengan amount yang sudah dikonversi
  // 4. Simpan original amount dan rate di database
}
```

**Hint:** Exchange rate API: fetch cache di Redis dengan TTL 1 jam. Untuk payment, biasanya provider (Midtrans) hanya terima IDR — konversi dilakukan di sisi application. Simpan `original_amount`, `original_currency`, `exchange_rate`, `converted_amount` di database untuk audit. Handle rate changes: gunakan rate saat payment dibuat, bukan saat reconciliation.

---

### 10. Refund & Dispute Handling
**Pertanyaan:** Implementasi sistem refund yang aman:

```typescript
interface RefundRequest {
  paymentId: string;
  amount: number; // partial atau full refund
  reason: string;
  requestedBy: string; // user_id atau admin_id
}

async function processRefund(request: RefundRequest): Promise<{
  refundId: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
}> {
  // === LENGKAPI ===
  // 1. Validasi payment eligible untuk refund:
  //    - Status harus 'success'
  //    - Belum ada refund sebelumnya atau partial refund
  //    - Amount tidak melebihi original amount - sudah direfund
  // 2. Cek refund policy (misal: hanya dalam 7 hari)
  // 3. Submit refund ke payment provider
  // 4. Update status di database
  // 5. Log semua transaksi untuk audit
  // 6. Kirim notifikasi ke user dan admin
}

// === BUAT QUERY ===
// Hitung total refund untuk sebuah order
// Cek apakah order bisa di-refund (belum exceed limit)
// Generate laporan refund bulanan
```

**Hint:** Penting: (1) Selalu validasi amount, (2) simpan status refund di tabel terpisah, (3) logging lengkap untuk audit, (4) admin approval untuk refund > Rp 1.000.000. Midtrans refund: `POST /refund`, Stripe refund: `stripe.refunds.create({ payment_intent })`. Handle race condition: gunakan database transaction untuk update status + refund record.
