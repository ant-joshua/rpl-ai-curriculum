# Quiz: Resilience Patterns

<div class="quiz">

**1. Apa tujuan utama resilience patterns dalam microservices?**

- [ ] Membuat kode lebih kompleks
- [x] Mencegah kegagalan satu service menyebar dan merusak seluruh sistem
- [ ] Mempercepat response time
- [ ] Mengurangi jumlah service

**2. Pattern Retry digunakan untuk?**

- [ ] Memperlambat request
- [x] Mencoba ulang operasi yang gagal secara otomatis dengan harapan berhasil di percobaan berikutnya
- [ ] Membatalkan semua request
- [ ] Mengalihkan request ke server lain

**3. Strategi backoff yang paling baik untuk Retry pattern?**

- [ ] Fixed delay (selalu tunggu 1 detik)
- [x] Exponential backoff dengan jitter (delay naik eksponensial + random)
- [ ] Linear backoff
- [ ] Tanpa delay

**4. Apa itu Circuit Breaker pattern?**

- [ ] Mematikan server jika error
- [x] Mencegah request ke service yang gagal dengan membuka circuit, lalu mencoba lagi setelah cooldown
- [ ] Memperbaiki kode secara otomatis
- [ ] Mengganti service yang rusak

**5. Tiga state dalam Circuit Breaker?**

- [ ] Start, Run, Stop
- [x] Closed, Open, Half-Open
- [ ] On, Off, Standby
- [ ] Green, Yellow, Red

**6. Pattern Timeout digunakan untuk?**

- [ ] Mempercepat request
- [x] Membatasi waktu maksimal menunggu response dari service lain, agar tidak menggantung
- [ ] Mengulang request forever
- [ ] Menambah delay

**7. Apa yang dimaksud dengan Bulkhead pattern?**

- [ ] Membatasi total request ke semua service
- [x] Mengisolasi resource (thread pool, koneksi) per service agar kegagalan satu service tidak menghabiskan resource bersama
- [ ] Menggabungkan beberapa service
- [ ] Membagi service menjadi lebih kecil

**8. Rate Limiting membatasi apa?**

- [ ] Ukuran response
- [x] Jumlah request dalam periode waktu tertentu
- [ ] Jumlah user
- [ ] Ukuran database

**9. Saga pattern dalam distributed transactions berarti?**

- [ ] Transaksi database biasa
- [x] Rangkaian transaksi lokal dengan kompensasi (rollback) jika salah satu langkah gagal
- [ ] Transaksi tanpa rollback
- [ ] Semua service harus sukses atau semua gagal (XA transaction)

**10. Library Node.js yang populer untuk implementasi Circuit Breaker?**

- [ ] axios
- [x] opossum
- [ ] express
- [ ] lodash

</div>
