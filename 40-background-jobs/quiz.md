# Quiz: Background Jobs & Queue

<div class="quiz">

**1. Perbedaan utama antara synchronous dan asynchronous processing adalah…**

- [ ] Sync lebih cepat dari async
- [x] Sync memblokir eksekusi sampai selesai, sedangkan async melanjutkan eksekusi tanpa menunggu
- [ ] Async tidak bisa dipakai di Node.js
- [ ] Sync tidak memerlukan callback

**2. Komponen utama dalam sistem queue adalah…**

- [ ] Database, API, Frontend
- [x] Producer, Consumer, Broker (Redis/RabbitMQ), dan Job
- [ ] Server, Client, Router
- [ ] Docker, Kubernetes, Grafana

**3. Apa yang terjadi jika sebuah job di BullMQ gagal diproses (failure)?**

- [ ] Job langsung dihapus dari queue
- [x] Job akan di-retry sesuai konfigurasi (max attempts + backoff strategy)
- [ ] Seluruh worker berhenti
- [ ] Redis crash

**4. Redis digunakan sebagai broker di BullMQ karena…**

- [x] Redis mendukung struktur data list, pub/sub, dan persistence yang cocok untuk queue
- [ ] Redis adalah satu-satunya database yang bisa dipakai BullMQ
- [ ] Redis gratis untuk production
- [ ] Redis lebih cepat dari RAM

**5. Tahapan lifecycle sebuah job yang benar adalah…**

- [ ] Completed → Failed → Waiting → Active
- [x] Waiting → Active → Completed / Failed
- [ ] Active → Waiting → Completed → Delayed
- [ ] Failed → Waiting → Active → Completed

**6. Exponential backoff dalam retry job berarti…**

- [ ] Semua retry dilakukan setiap 1 detik
- [x] Interval retry semakin lama setelah setiap kegagalan (misal: 1s, 2s, 4s, 8s)
- [ ] Job hanya di-retry sekali
- [ ] Worker berhenti total setelah satu kegagalan

**7. Bull Board digunakan untuk…**

- [ ] Menulis kode queue
- [x] Dashboard visual monitoring queue, job status, dan retry
- [ ] Mengganti Redis
- [ ] Membuat worker baru

**8. Graceful shutdown pada queue worker diperlukan agar…**

- [ ] Server mati lebih cepat
- [x] Job yang sedang diproses tidak hilang saat worker dimatikan
- [ ] Redis tidak perlu di-restart
- [ ] Queue otomatis kosong

</div>
