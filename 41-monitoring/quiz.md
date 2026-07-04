# Quiz: Monitoring & Error Tracking

<div class="quiz">

**1. Keuntungan utama menggunakan structured logging (JSON) dibandingkan log biasa adalah…**

- [ ] File log jadi lebih kecil
- [x] Log bisa diparsing, difilter, dan dianalisis dengan tools seperti Elasticsearch atau Loki
- [ ] Tidak perlu konfigurasi
- [ ] Hanya bisa dipakai di production

**2. Sentry DSN (Data Source Name) digunakan untuk…**

- [ ] Menyimpan password database
- [x] Menghubungkan aplikasi ke project Sentry agar error bisa dikirim dan dilacak
- [ ] Mengganti API key
- [ ] Membuat endpoint baru

**3. Perbedaan endpoint `/healthz` (liveness) dan `/readyz` (readiness) adalah…**

- [ ] Tidak ada perbedaan
- [x] Liveness mengecek apakah aplikasi masih hidup, readiness mengecek apakah aplikasi siap menerima traffic
- [ ] Readiness untuk database, liveness untuk cache
- [ ] Liveness hanya untuk Kubernetes

**4. Apa yang dimaksud dengan APM (Application Performance Monitoring)?**

- [ ] Tools untuk menulis kode lebih cepat
- [x] Tools untuk melacak performa aplikasi, termasuk response time, throughput, dan bottleneck
- [ ] Database monitoring
- [ ] Server load balancing

**5. Saat error rate melebihi threshold, tindakan alerting yang tepat adalah…**

- [ ] Menunggu user melapor
- [x] Mengirim notifikasi ke Slack/Discord/Email dan memicu incident response
- [ ] Restart server secara otomatis
- [ ] Hapus semua log

**6. Breadcrumbs dalam Sentry berguna untuk…**

- [ ] Membuat dokumentasi otomatis
- [x] Menyediakan jejak langkah (events) sebelum error terjadi, membantu debugging
- [ ] Membersihkan database
- [ ] Mengganti stack trace

**7. Graceful shutdown pada production Express app sebaiknya menangani…**

- [ ] Hanya HTTP server
- [x] HTTP server, koneksi database, queue worker, dan koneksi lain secara tertib
- [ ] Restart otomatis
- [ ] Hanya koneksi database

**8. Tools berikut yang cocok untuk uptime monitoring dan alerting adalah…**

- [ ] BullMQ
- [ ] Midtrans
- [x] Uptime Kuma atau Better Uptime
- [ ] Cline

</div>
