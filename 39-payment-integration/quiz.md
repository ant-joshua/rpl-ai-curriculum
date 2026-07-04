# Quiz: Payment Integration

<div class="quiz">

**1. Urutan yang benar dalam alur pembayaran (payment flow) adalah…**

- [ ] Webhook → Checkout → Payment Gateway → Status Update
- [x] Checkout → Payment Gateway → Webhook → Status Update
- [ ] Payment Gateway → Checkout → Status Update → Webhook
- [ ] Status Update → Checkout → Webhook → Payment Gateway

**2. Untuk memverifikasi notifikasi webhook dari Midtrans, kita perlu…**

- [ ] Mengecek IP address pengirim
- [x] Memvalidasi signature hash menggunakan `order_id`, `status_code`, `gross_amount`, dan `server_key`
- [ ] Membandingkan data dengan database secara manual
- [ ] Memanggil API Midtrans setiap kali menerima notifikasi

**3. Apa fungsi dari header `Idempotency-Key` dalam integrasi payment?**

- [ ] Mempercepat proses checkout
- [x] Mencegah duplikasi pemrosesan request yang sama
- [ ] Mengenkripsi data pembayaran
- [ ] Menentukan metode pembayaran

**4. Dalam Stripe Checkout Session, setelah pembayaran berhasil, Stripe akan mengirim notifikasi ke…**

- [ ] Email developer
- [x] Webhook endpoint yang sudah dikonfigurasi
- [ ] Dashboard Stripe saja
- [ ] Database aplikasi secara langsung

**5. Tujuan reconciliation dalam payment system adalah…**

- [ ] Menghapus transaksi yang gagal
- [x] Menyinkronkan status transaksi antara database aplikasi dan payment gateway
- [ ] Mengganti payment gateway
- [ ] Membatalkan semua transaksi pending

**6. Metode aman untuk menyimpan `server_key` atau `API key` Midtrans di kode adalah…**

- [ ] Hardcode di file JavaScript
- [ ] Simpan di database
- [x] Gunakan environment variable (`.env`)
- [ ] Simpan di public repository

**7. Mapping status Midtrans `settlement` ke status internal sebaiknya…**

- [ ] `pending`
- [x] `success`
- [ ] `failed`
- [ ] `expired`

**8. Dalam production payment, penanganan race condition pada update status transaksi sebaiknya menggunakan…**

- [ ] setTimeout
- [x] Database lock atau idempotency key
- [ ] Promise.all
- [ ] async/await biasa

</div>
