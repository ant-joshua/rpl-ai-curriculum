# Quiz: Advanced Database

<div class="quiz">

**1. Apa itu transaksi database?**

- [ ] Proses membackup database
- [x] Sekumpulan operasi database yang dieksekusi sebagai satu kesatuan (all or nothing)
- [ ] Query untuk menghapus data
- [ ] Proses migrasi skema database

**2. Sifat apa yang dijamin oleh transaksi (ACID)?**

- [ ] Atomicity, Consistency, Isolation, Durability
- [x] Atomicity, Consistency, Isolation, Durability
- [ ] Accuracy, Completeness, Integrity, Durability
- [ ] Atomicity, Concurrency, Isolation, Data Integrity

**3. Level isolasi transaksi terendah yang memungkinkan dirty read?**

- [ ] SERIALIZABLE
- [ ] REPEATABLE READ
- [x] READ UNCOMMITTED
- [ ] READ COMMITTED

**4. Apa yang dimaksud dengan phantom read?**

- [ ] Data yang dihapus oleh transaksi lain
- [x] Baris baru muncul di hasil query karena transaksi lain INSERT di antara dua query yang sama
- [ ] Data yang tidak pernah diakses
- [ ] Index yang corrupt

**5. Index database berguna untuk?**

- [ ] Membatasi akses user
- [x] Mempercepat pencarian data dengan menghindari full table scan
- [ ] Mengompres ukuran database
- [ ] Mengenkripsi kolom tertentu

**6. Tipe index yang umum digunakan di MySQL/PostgreSQL untuk pencarian cepat?**

- [ ] Hash index
- [x] B-Tree index
- [ ] Linked List index
- [ ] Array index

**7. Teknik pemisahan data secara horizontal ke beberapa database/server disebut?**

- [ ] Replication
- [x] Sharding
- [ ] Partitioning
- [ ] Clustering

**8. Perintah SQL untuk melihat rencana eksekusi query?**

- [ ] `SHOW TABLES`
- [ ] `DESCRIBE`
- [x] `EXPLAIN`
- [ ] `ANALYZE`

**9. Apa yang dimaksud dengan N+1 query problem?**

- [ ] Query dieksekusi N+1 kali karena relasi tidak di-join
- [x] Query yang mengambil data utama lalu query tambahan per baris data relasi
- [ ] Query dengan N+1 filter
- [ ] Error yang muncul ketika query ke-N gagal

**10. Konsep yang memastikan data konsisten meskipun banyak pengguna mengakses bersamaan?**

- [ ] Indexing
- [ ] Sharding
- [x] Concurrency Control / Locking
- [ ] Backup

</div>
