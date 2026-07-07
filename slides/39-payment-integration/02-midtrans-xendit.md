---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — Modul 39: Payment Integration (Midtrans, Xendit, Stripe)"
footer: "Sesi 02: Midtrans Xendit"
---

<!-- _class: title -->
# Sesi 02: Midtrans Core API & Xendit

> **Tujuan:** Menguasai Midtrans Core API (charge, status, cancel, refund), Xendit API (invoice, VA, QRIS), transaction status mapping, webhook signature verification, dan error handling.

## 📖 Materi

### 1. Midtrans Core API

Core API memberikan kontrol penuh dibanding Snap. Kita handle UI sendiri, dan panggil API langsung.

#### 1.1 Charge — Proses Pembayaran

```javascript
// services/midtrans-core.js
const { coreApi } = require('../config/midtrans');

/**
 * Charge dengan Virtual Account (BCA)
 */
async function chargeVA(orderId, amount, customer) {
  const parameter = {
    payment_type: 'bank_transfer',
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    bank_transfer: {
      bank: 'bca',
      va_number: '12345678901',
    },
    customer_details: {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
    },
  };

  try {
    const chargeResponse = await coreApi.charge(parameter);
    return chargeResponse;
  } catch (error) {
    console.error('Midtrans charge VA error:', error);
    throw error;
  }
}

/**
 * Charge dengan QRIS
 */
async function chargeQRIS(orderId, amount, customer) {
  const parameter = {
    payment_type: 'gopay', // QRIS via GoPay
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
    },
  };

  const chargeResponse = await coreApi.charge(parameter);
  return chargeResponse;
}

module.exports = { chargeVA, chargeQRIS };
```

**Response VA Charge:**
```json
{
  "status_code": "201",
  "status_message": "Success, Bank Transfer transaction is created",
  "transaction_id": "9e9ed7b0-5d7b-4c5d-9a7b-8f1e2d3c4b5a",
  "order_id": "ORDER-1712345678901-abc123",
  "gross_amount": "150000.00",
  "payment_type": "bank_transfer",
  "transaction_time": "2025-01-15 10:30:00",
  "transaction_status": "pending",
  "va_numbers": [
    {
      "bank": "bca",
      "va_number": "12345678901"
    }
  ]
}
```

#### 1.2 Transaction Status

```javascript
async function getTransactionStatus(orderId) {
  try {
    const statusResponse = await coreApi.transaction.status(orderId);
    return statusResponse;
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
}

// Contoh penggunaan
// const status = await getTransactionStatus('ORDER-1712345678901-abc123');
// console.log(status.transaction_status); // 'settlement', 'pending', 'deny', dll
```

#### 1.3 Cancel Transaction

```javascript
async function cancelTransaction(orderId) {
  try {
    const cancelResponse = await coreApi.transaction.cancel(orderId);
    return cancelResponse;
  } catch (error) {
    if (error.http_code === 412) {
      console.log('Transaksi sudah di-refund, tidak bisa cancel');
    }
    throw error;
  }
}
```

#### 1.4 Refund Transaction

```javascript
/**
 * Refund — hanya untuk transaksi yang sudah settlement
 */
async function refundTransaction(orderId, amount, reason) {
  const parameter = {
    refund_key: `refund-${orderId}-${Date.now()}`,
    amount: amount,
    reason: reason,
  };

  try {
    const refundResponse = await coreApi.transaction.refund(orderId, parameter);
    return refundResponse;
  } catch (error) {
    console.error('Refund error:', error);
    throw error;
  }
}
```

### 2. Xendit API

Xendit cocok untuk pasar Indonesia dengan dukungan penuh VA, QRIS, dan Invoice.

#### 2.1 Setup Xendit Client

```bash
npm install xendit-node
```

```javascript
// config/xendit.js
const Xendit = require('xendit-node');

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

const { Invoice, VirtualAccount, QRCode } = xendit;

module.exports = { xendit, Invoice, VirtualAccount, QRCode };
```

```bash

---

# .env tambahan
XENDIT_SECRET_KEY=xnd_development_your-secret-key
```

#### 2.2 Create Invoice (Xendit)

```javascript
// services/xendit-invoice.js
const { Invoice } = require('../config/xendit');

async function createInvoice(orderId, amount, customer) {
  try {
    const invoice = await Invoice.create({
      external_id: orderId,
      amount: amount,
      payer_email: customer.email,
      description: `Pembayaran order ${orderId}`,
      customer: {
        given_names: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        mobile_number: customer.phone,
      },
      customer_notification_preference: {
        invoice_paid: ['email', 'whatsapp'],
        invoice_expired: ['email'],
      },
      success_redirect_url: 'https://yourapp.com/payment/success',
      failure_redirect_url: 'https://yourapp.com/payment/failed',
      currency: 'IDR',
    });

    return {
      id: invoice.id,
      invoice_url: invoice.invoice_url,
      external_id: invoice.external_id,
      amount: invoice.amount,
      status: invoice.status,
      expiry_date: invoice.expiry_date,
    };
  } catch (error) {
    console.error('Xendit create invoice error:', error);
    throw error;
  }
}
```

#### 2.3 Create Virtual Account (Xendit)

```javascript
async function createVA(externalId, amount, bank, customerName) {
  try {
    const va = await VirtualAccount.createFixedVA({
      external_id: externalId,
      bank_code: bank, // 'BCA', 'BNI', 'MANDIRI', 'BRI'
      name: customerName,
      is_single_use: true,
      expected_amount: amount,
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
    });

    return {
      id: va.id,
      bank: va.bank_code,
      va_number: va.account_number,
      external_id: va.external_id,
      amount: va.expected_amount,
      expiry: va.expiration_date,
    };
  } catch (error) {
    console.error('Xendit create VA error:', error);
    throw error;
  }
}
```

#### 2.4 Create QRIS (Xendit)

```javascript
async function createQRIS(externalId, amount) {
  try {
    const qrCode = await QRCode.create({
      external_id: externalId,
      type: 'DYNAMIC',
      amount: amount,
      callback_url: 'https://yourapp.com/api/webhook/xendit',
    });

    return {
      id: qrCode.id,
      qr_string: qrCode.qr_string,
      external_id: qrCode.external_id,
      amount: qrCode.amount,
    };
  } catch (error) {
    console.error('Xendit create QRIS error:', error);
    throw error;
  }
}
```

### 3. Transaction Status Mapping

Setiap payment gateway punya istilah status berbeda. Kita harus mapping ke status internal yang konsisten.

| Status Internal | Midtrans | Xendit | Stripe |
|----------------|----------|--------|--------|
| **pending** | `pending` | `PENDING` | `requires_payment_method` / `requires_action` |
| **success** | `settlement`, `capture` (fraud accept) | `PAID`, `SETTLED` | `succeeded`, `complete` |
| **failed** | `deny`, `cancel` | `FAILED` | `requires_payment_method` (failed attempt) |
| **expired** | `expire` | `EXPIRED` | — |
| **refund** | `refund`, `partial_refund` | — | `refunded` |
| **void** | — | `VOIDED` | `canceled` |

**Fungsi Mapping:**

```javascript
// utils/status-mapper.js
const PAYMENT_GATEWAYS = {
  MIDTRANS: 'midtrans',
  XENDIT: 'xendit',
  STRIPE: 'stripe',
};

const statusMap = {
  [PAYMENT_GATEWAYS.MIDTRANS]: {
    pending: 'pending',
    settlement: 'success',
    capture: (fraudStatus) =>
      fraudStatus === 'accept' ? 'success' : 'failed',
    deny: 'failed',
    expire: 'expired',
    cancel: 'failed',
    refund: 'refunded',
    partial_refund: 'partial_refund',
  },
  [PAYMENT_GATEWAYS.XENDIT]: {
    PENDING: 'pending',
    PAID: 'success',
    SETTLED: 'success',
    FAILED: 'failed',
    EXPIRED: 'expired',
    VOIDED: 'failed',
  },
};

function mapMidtransStatus(transactionStatus, fraudStatus) {
  const mapping = statusMap[PAYMENT_GATEWAYS.MIDTRANS][transactionStatus];
  if (typeof mapping === 'function') {
    return mapping(fraudStatus);
  }
  return mapping || 'unknown';
}

function mapXenditStatus(xenditStatus) {
  return statusMap[PAYMENT_GATEWAYS.XENDIT][xenditStatus] || 'unknown';
}

module.exports = { mapMidtransStatus, mapXenditStatus, PAYMENT_GATEWAYS };
```

### 4. Webhook Signature Verification

#### 4.1 Midtrans Webhook Verification

Midtrans mengirim signature dalam body notifikasi. Kita verifikasi dengan `SHA512(order_id + status_code + gross_amount + server_key)`.

```javascript
// middleware/verify-midtrans.js
const crypto = require('crypto');

function verifyMidtransWebhook(req, res, next) {
  // Webhook endpoint harus pakai express.raw() — body masih buffer
  const notification = JSON.parse(req.body.toString());
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
  } = notification;

  // Generate signature untuk verifikasi
  const hash = crypto
    .createHash('sha512')
    .update(order_id + status_code + gross_amount + serverKey)
    .digest('hex');

  if (hash !== signature_key) {
    console.error('Invalid signature — possible fraud:', {
      order_id,
      expected: hash,
      received: signature_key,
    });
    return res.status(403).json({
      message: 'Invalid signature',
    });
  }

  console.log('Signature verified for order:', order_id);
  req.notification = notification;
  next();
}

module.exports = verifyMidtransWebhook;
```

#### 4.2 Xendit Webhook Verification

Xendit menggunakan callback token yang diset di dashboard.

```javascript
// middleware/verify-xendit.js
function verifyXenditWebhook(req, res, next) {
  const callbackToken = req.headers['x-callback-token'];
  const expectedToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;

  if (!callbackToken) {
    return res.status(403).json({ message: 'Missing callback token' });
  }

  if (callbackToken !== expectedToken) {
    console.error('Invalid Xendit callback token');
    return res.status(403).json({ message: 'Invalid callback token' });
  }

  req.notification = req.body;
  next();
}

module.exports = verifyXenditWebhook;
```

#### 4.3 Webhook Handler Lengkap

```javascript
// routes/webhook.js (lengkap)
const express = require('express');
const router = express.Router();
const verifyMidtrans = require('../middleware/verify-midtrans');
const { mapMidtransStatus } = require('../utils/status-mapper');

// Midtrans Webhook
router.post('/midtrans', verifyMidtrans, async (req, res) => {
  try {
    const notification = req.notification;
    const { order_id, transaction_status, fraud_status } = notification;

    const newStatus = mapMidtransStatus(transaction_status, fraud_status);

    // Update database
    // await db('transactions').where({ order_id }).update({ status: newStatus });

    console.log(`[Midtrans] Order ${order_id}: ${transaction_status} → ${newStatus}`);

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Tetap return 200 — jangan 500, karena Midtrans akan retry
    res.status(200).json({ status: 'ok', message: 'received but error' });
  }
});

// Xendit Webhook
router.post('/xendit', async (req, res) => {
  try {
    const notification = req.body;
    
    // Xendit kirim berbagai event
    // invoice: { status: 'PAID', external_id: '...', amount: ... }
    // va:   { status: 'ACTIVE', ... }
    // qris: { status: 'COMPLETED', ... }
    
    if (notification.status === 'PAID' || notification.status === 'SETTLED') {
      // const status = mapXenditStatus(notification.status);
      // await db('transactions').where({ order_id: notification.external_id }).update({ status });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Xendit webhook error:', error);
    res.status(200).json({ status: 'ok' });
  }
});

module.exports = router;
```

### 5. Error Handling

```javascript
// utils/payment-error.js
class PaymentError extends Error {
  constructor(message, code, gateway, rawError) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;           // 'TIMEOUT', 'INVALID_AMOUNT', 'DUPLICATE'
    this.gateway = gateway;     // 'midtrans', 'xendit', 'stripe'
    this.rawError = rawError;
  }
}

function handleMidtransError(error) {
  const { http_code, status_code, status_message } = error;

  if (http_code === 400) {
    return new PaymentError('Bad request — parameter tidak valid', 'INVALID_PARAMS', 'midtrans', error);
  }
  if (http_code === 401) {
    return new PaymentError('Unauthorized — server key salah', 'UNAUTHORIZED', 'midtrans', error);
  }
  if (http_code === 404) {
    return new PaymentError('Transaksi tidak ditemukan', 'NOT_FOUND', 'midtrans', error);
  }
  if (http_code === 412) {
    return new PaymentError('Transaksi sudah di-refund/cancel', 'ALREADY_CANCELLED', 'midtrans', error);
  }
  if (http_code === 500 || http_code === 504) {
    return new PaymentError('Midtrans server error', 'GATEWAY_ERROR', 'midtrans', error);
  }

  return new PaymentError(
    status_message || 'Unknown error',
    `MIDTRANS_${status_code}`,
    'midtrans',
    error
  );
}

module.exports = { PaymentError, handleMidtransError };
```

**Contoh penggunaan:**

```javascript
// routes/payment.js — cancel dengan error handling
router.post('/cancel/:orderId', async (req, res) => {
  try {
    const result = await cancelTransaction(req.params.orderId);
    res.json({ success: true, data: result });
  } catch (error) {
    const paymentError = handleMidtransError(error);
    
    if (paymentError.code === 'ALREADY_CANCELLED') {
      return res.status(409).json({ success: false, message: 'Transaksi sudah di-cancel' });
    }
    if (paymentError.code === 'GATEWAY_ERROR') {
      return res.status(502).json({ success: false, message: 'Midtrans sedang bermasalah, coba lagi' });
    }

    res.status(500).json({ success: false, message: paymentError.message });
  }
});
```

## 🧪 Latihan

### Latihan 1: Charge VA Midtrans

Buat endpoint POST `/api/payments/charge-va`:

1. Terima `{ orderId, amount, bank, customer }`
2. Panggil `coreApi.charge()` dengan payment_type `bank_transfer`
3. Pilih bank: `bca`, `bni`, `mandiri`, `bri`
4. Return VA number dan detail pembayaran
5. Simpan transaksi status 'pending'

**Output:** Endpoint return VA number, user bisa transfer ke VA tersebut.

### Latihan 2: Xendit Invoice & VA

Buat 3 endpoint Xendit:

1. POST `/api/payments/xendit/invoice` — create Xendit invoice, return invoice_url
2. POST `/api/payments/xendit/va` — create fixed VA dengan expiry 24 jam
3. POST `/api/payments/xendit/qris` — create QRIS dinamis

**Output:** 3 endpoint siap, bisa generate invoice/VA/QRIS dari Xendit.

### Latihan 3: Webhook Signature Verification

Implementasi verifikasi webhook:

1. Midtrans: verifikasi `signature_key` dengan SHA512
2. Xendit: verifikasi `x-callback-token` header
3. Return 403 jika signature tidak valid
4. Return 200 dengan `{ status: 'ok' }` jika valid

**Output:** Webhook hanya diproses jika signature valid. Request palsu ditolak.

### Latihan 4: Transaction Status Check & Mapping

Buat endpoint GET `/api/payments/status/:orderId`:

1. Cek status via Midtrans API (`transaction.status()`)
2. Map status Midtrans ke status internal menggunakan fungsi mapper
3. Bandingkan dengan status di database
4. Jika berbeda, update database dengan status terbaru
5. Handle error: 404 jika transaksi tidak ditemukan di gateway

**Output:** Status transaksi bisa dicek real-time dari Midtrans, otomatis update DB jika ada perubahan.

## 📝 Ringkasan

- Core API: kontrol penuh atas charge, status, cancel, refund
- Xendit: alternatif kuat untuk pasar Indonesia (Invoice, VA, QRIS)
- Status mapping: setiap gateway punya istilah berbeda → mapping ke status internal konsisten
- Signature verification: kritis untuk keamanan webhook
- Error handling: bedakan error berdasarkan http_code untuk response yang tepat

**Next:** Sesi 03 — Stripe Webhook (Checkout Session, Payment Intent, webhook security, idempotency).
