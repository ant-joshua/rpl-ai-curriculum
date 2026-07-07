---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/374016/pexels-pho"
footer: "Sesi 03: Real World Queue"
---

<!-- _class: title -->
# 03. Real World Queue

## 1. Email Sending (Nodemailer + Queue)

Kirim email lewat API itu lambat dan gak bisa diandelin di request cycle. Queue jadi solusi.

### Setup Nodemailer

```bash
npm install nodemailer bullmq ioredis
```

### Producer — Queue Email

```javascript
// email-producer.js
const { Queue } = require('bullmq');
const connection = require('./connection');

const emailQueue = new Queue('email', { connection });

async function sendWelcomeEmail(user) {
  const job = await emailQueue.add('welcome-email', {
    to: user.email,
    subject: 'Selamat datang di Platform!',
    template: 'welcome',
    data: {
      name: user.name,
      verifyLink: `https://app.com/verify/${user.token}`,
    },
  });
  console.log(`Email job ${job.id} untuk ${user.email}`);
  return job;
}

async function sendResetPassword(email, resetToken) {
  await emailQueue.add('reset-password', {
    to: email,
    subject: 'Reset Password',
    template: 'reset',
    data: { resetToken },
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
}

module.exports = { sendWelcomeEmail, sendResetPassword };
```

### Worker — Kirim Email via Nodemailer

```javascript
// email-worker.js
const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const connection = require('./connection');

// Konfigurasi transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const templates = {
  'welcome': (data) => ({
    html: `<h1>Halo ${data.name}!</h1><p>Selamat datang. Verifikasi: <a href="${data.verifyLink}">${data.verifyLink}</a></p>`,
  }),
  'reset': (data) => ({
    html: `<h1>Reset Password</h1><p>Token: ${data.resetToken}</p>`,
  }),
};

const worker = new Worker('email', async (job) => {
  await job.updateProgress(10);

  const template = templates[job.data.template];
  if (!template) throw new Error(`Template ${job.data.template} gak ditemukan`);

  const mailOptions = {
    from: '"Platform" <noreply@platform.com>',
    to: job.data.to,
    subject: job.data.subject,
    ...template(job.data.data),
  };

  await job.updateProgress(50);

  // Kirim email
  const info = await transporter.sendMail(mailOptions);

  await job.updateProgress(100);
  return { messageId: info.messageId, accepted: info.accepted };

}, { connection, concurrency: 5 });

worker.on('completed', (job, result) => {
  console.log(`✅ Email ${job.id} terkirim: ${result.messageId}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Email ${job.id} gagal: ${err.message}`);
});

console.log('Email worker ready...');
```

### Auto-Retry Kalau SMTP Error

```javascript
// Saat add job
await emailQueue.add('critical-email', payload, {
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: false, // simpan history
});
```

---

## 2. PDF Generation (Puppeteer + Queue)

Generate PDF dari HTML itu CPU-intensive. Queue biar gak blocking server.

### Setup

```bash
npm install puppeteer bullmq ioredis
```

### Worker PDF

```javascript
// pdf-worker.js
const { Worker } = require('bullmq');
const puppeteer = require('puppeteer');
const path = require('path');
const connection = require('./connection');

const worker = new Worker('pdf', async (job) => {
  await job.updateProgress(10);

  const { html, outputPath, options } = job.data;

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  await job.updateProgress(30);

  try {
    const page = await browser.newPage();

    // Set konten HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await job.updateProgress(60);

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: options?.format || 'A4',
      margin: { top: '2cm', bottom: '2cm' },
      printBackground: true,
    });

    await job.updateProgress(90);

    console.log(`PDF generated: ${outputPath}`);
    return { path: outputPath, size: require('fs').statSync(outputPath).size };

  } finally {
    await browser.close();
    await job.updateProgress(100);
  }
}, {
  connection,
  concurrency: 2, // 2 aja — puppeteer berat
  limiter: {
    max: 10,
    duration: 60000, // max 10 PDF per menit
  },
});

console.log('PDF worker ready...');
```

### Producer PDF

```javascript
// pdf-producer.js
const { Queue } = require('bullmq');
const connection = require('./connection');

const pdfQueue = new Queue('pdf', { connection });

async function generateInvoicePdf(invoice) {
  const html = getInvoiceHtml(invoice); // fungsi render HTML

  await pdfQueue.add('invoice-pdf', {
    html,
    outputPath: `/tmp/invoices/invoice-${invoice.id}.pdf`,
    options: { format: 'A4' },
  }, {
    attempts: 2,
  });
}
```

---

## 3. Image Processing (Sharp + Queue)

Resize image, bikin thumbnail, compress — semua berat dan blocking.

### Setup

```bash
npm install sharp bullmq ioredis axios
```

### Worker Image Processing

```javascript
// image-worker.js
const { Worker } = require('bullmq');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const connection = require('./connection');

const worker = new Worker('image', async (job) => {
  await job.updateProgress(10);

  const { imageUrl, uploadDir, filename } = job.data;
  const inputPath = path.join('/tmp', `input-${filename}`);
  const outputPath = path.join(uploadDir, filename);

  // Download image
  const response = await axios({
    url: imageUrl,
    responseType: 'arraybuffer',
  });
  await fs.writeFile(inputPath, response.data);

  await job.updateProgress(30);

  // Resize ke berbagai ukuran
  const sizes = [
    { width: 150, suffix: 'thumb' },   // thumbnail
    { width: 600, suffix: 'medium' },   // medium
    { width: 1200, suffix: 'large' },   // large
  ];

  await job.updateProgress(50);

  for (const size of sizes) {
    const outputFilename = filename.replace('.', `-${size.suffix}.`);
    const outputFile = path.join(uploadDir, outputFilename);

    await sharp(inputPath)
      .resize(size.width)
      .jpeg({ quality: 80 })
      .toFile(outputFile);

    console.log(`Resized: ${outputFilename}`);
  }

  // Cleanup temp
  await fs.unlink(inputPath);

  await job.updateProgress(100);

  return {
    original: outputPath,
    sizes: sizes.map(s => ({
      suffix: s.suffix,
      width: s.width,
    })),
  };
}, {
  connection,
  concurrency: 3,
});

console.log('Image worker ready...');
```

### Producer Image

```javascript
// image-producer.js
const { Queue } = require('bullmq');
const connection = require('./connection');

const imageQueue = new Queue('image', { connection });

async function processUserAvatar(imageUrl, userId) {
  const filename = `avatar-${userId}-${Date.now()}.jpg`;

  await imageQueue.add('avatar-processing', {
    imageUrl,
    uploadDir: `/uploads/avatars/${userId}`,
    filename,
  });
}
```

---

## 4. Notification Batching

Daripada kirim notifikasi 1 per 1, batch beberapa jadi 1. Hemat resource.

### Queue per Notifikasi

```javascript
// notif-producer.js
const { Queue } = require('bullmq');
const connection = require('./connection');

const notifQueue = new Queue('notifications', { connection });

async function sendNotification(userId, type, message) {
  await notifQueue.add('single-notif', {
    userId, type, message, timestamp: Date.now(),
  });
}
```

### Worker dengan Batching Logic

```javascript
// notif-worker.js — batch scheduler
const { Worker, Queue } = require('bullmq');
const connection = require('./connection');

const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 detik

const worker = new Worker('notifications', async (job) => {
  // Worker per-job — gak di-batch disini
  // (langsung kirim notif individual)
}, { connection });

// Batching via cron job terpisah
const schedulerQueue = new Queue('notif-scheduler', { connection });

// Drain queue tiap 5 detik — kumpulin & batch
async function drainQueue() {
  const queue = new Queue('notifications', { connection });

  let batch = [];
  let job;

  // Ambil job dari queue sampai kosong atau batch penuh
  while (batch.length < BATCH_SIZE) {
    job = await queue.getActive(); // ambil job yang active
    // simplified — real flow lebih kompleks
    break;
  }

  if (batch.length > 0) {
    // Kirim batch notification (FCM, push, dll)
    await sendBatchNotification(batch);
  }
}

// Jalankan drain tiap 5 detik
setInterval(drainQueue, BATCH_INTERVAL);
```

Batching cocok buat:
- Email marketing (kumpulin 100 dulu baru kirim)
- Push notification (FCM support batch)
- SMS gateway (biasanya rate-limited)
- Analytics event

---

## 5. Bulk Data Export

Export ribuan record ke CSV/Excel lewat queue — user gak nunggu.

### Queue Export

```javascript
// export-producer.js
const { Queue } = require('bullmq');
const connection = require('./connection');

const exportQueue = new Queue('export', { connection });

async function requestExport(userId, filters, format = 'csv') {
  const job = await exportQueue.add('data-export', {
    userId,
    filters,
    format,
    requestedAt: new Date().toISOString(),
  });

  return {
    jobId: job.id,
    message: 'Export sedang diproses. Notifikasi akan dikirim setelah selesai.',
  };
}
```

### Worker Export

```javascript
// export-worker.js
const { Worker } = require('bullmq');
const { createObjectCsvWriter } = require('csv-writer');
const ExcelJS = require('exceljs');
const connection = require('./connection');

const worker = new Worker('export', async (job) => {
  await job.updateProgress(10);
  const { userId, filters, format } = job.data;

  // Ambil data dari database (simulasi)
  const records = await queryDatabase(filters);
  await job.updateProgress(40);

  const outputPath = `/tmp/exports/${userId}-${Date.now()}.${format}`;

  if (format === 'csv') {
    await exportToCsv(records, outputPath);
  } else if (format === 'xlsx') {
    await exportToExcel(records, outputPath);
  }

  await job.updateProgress(80);

  // Upload ke storage (S3 / lokal)
  const fileUrl = await uploadToStorage(outputPath);

  await job.updateProgress(100);

  return { fileUrl, recordCount: records.length, format };
}, { connection, concurrency: 2 });

async function exportToCsv(records, outputPath) {
  const writer = createObjectCsvWriter({
    path: outputPath,
    header: Object.keys(records[0] || {}).map(key => ({ id: key, title: key })),
  });
  await writer.writeRecords(records);
}

async function exportToExcel(records, outputPath) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Export');

  sheet.columns = Object.keys(records[0] || {}).map(key => ({
    header: key, key, width: 20,
  }));

  sheet.addRows(records);
  await workbook.xlsx.writeFile(outputPath);
}

// Helper — query database
async function queryDatabase(filters) {
  // Simulasi query
  return Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    createdAt: new Date().toISOString(),
  }));
}
```

---

## Latihan

### Latihan 1: Email Queue System
Buat queue `email` dengan 2 tipe job: `welcome` dan `reset-password`. Worker kirim email via Nodemailer (pake Mailtrap.io atau ethereal.email). Tiap job punya retry 3x. Log messageId ke console.

### Latihan 2: PDF Invoice Generator
Buat queue `pdf-gen`. Producer terima data invoice (nomor, tanggal, items, total). Worker render HTML invoice → generate PDF pake Puppeteer. Simpan ke `/tmp/invoices/`. Return file path.

### Latihan 3: Image Thumbnail Pipeline
Buat queue `image-pipeline`. Worker download image dari URL (pake axios), resize ke 3 ukuran (150px, 600px, 1200px) pake Sharp. Simpan dengan suffix `-thumb`, `-medium`, `-large`. Return daftar file output.

### Latihan 4: Bulk CSV Export
Buat queue `bulk-export`. Worker generate CSV dari 1000 dummy records pake `csv-writer`. Update progress tiap 100 record. Setelah selesai, simpan path file di return value. Producer polling status sampai job completed.
