# Quiz: Production-Ready Code

> Jawab pertanyaan di bawah dengan klik pilihan yang benar.

<div class="quiz">

**1. Library validasi input TypeScript-first yang digunakan di modul ini untuk membuat schema dan type inference?**

- [ ] Joi
- [ ] Yup
- [x] Zod
- [ ] Ajv

**2. Middleware Express apa yang menambahkan berbagai security headers HTTP (X-Frame-Options, CSP, dll)?**

- [ ] cors
- [x] helmet
- [ ] express-rate-limit
- [ ] morgan

**3. Endpoint health check mana yang mengecek apakah aplikasi **siap menerima traffic** (database dan dependensi lain terhubung)?**

- [ ] /healthz (liveness)
- [x] /readyz (readiness)
- [ ] /status
- [ ] /ping

**4. OS signal apa yang biasanya dikirim untuk memulai graceful shutdown (tunggu koneksi selesai, lalu exit)?**

- [ ] SIGINT
- [x] SIGTERM
- [ ] SIGKILL
- [ ] SIGHUP

**5. Menurut prinsip 12-Factor App nomor III, konfigurasi yang berbeda antar environment harus disimpan di?**

- [ ] File config.js
- [x] Environment variables
- [ ] Database
- [ ] package.json

**6. Library untuk membatasi jumlah request dari satu IP dalam jangka waktu tertentu?**

- [ ] helmet
- [x] express-rate-limit
- [ ] express-limiter
- [ ] rate-limit-redis

</div>
