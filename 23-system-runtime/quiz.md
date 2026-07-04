# Quiz: System Design & Runtime

<div class="quiz">

**1. Perbedaan utama antara Stack dan Heap dalam memori?**

- [ ] Stack lebih lambat dari Heap
- [x] Stack untuk data statis/fungsi (LIFO, otomatis), Heap untuk alokasi dinamis (manual)
- [ ] Heap hanya untuk object besar
- [ ] Stack bisa diakses dari thread mana saja

**2. Apa itu Garbage Collection (GC)?**

- [ ] Proses menghapus file sampah di hard disk
- [x] Mekanisme otomatis untuk membebaskan memori yang tidak lagi digunakan oleh program
- [ ] Proses kompilasi kode
- [ ] Backup memory secara periodik

**3. Event Loop di JavaScript/Node.js memungkinkan?**

- [ ] Multi-threading
- [x] Non-blocking I/O meskipun single-threaded
- [ ] Kompilasi JIT
- [ ] Akses langsung ke hardware

**4. Apa yang dimaksud dengan callback queue / task queue di Event Loop?**

- [ ] Tempat menyimpan error
- [x] Antrian callback yang siap dieksekusi setelah stack kosong
- [ ] Queue untuk HTTP request
- [ ] Database query queue

**5. Microtask (Promise.then) dieksekusi kapan dalam Event Loop?**

- [ ] Bersamaan dengan macrotask
- [x] Setelah setiap macrotask selesai, sebelum macrotask berikutnya
- [ ] Di awal event loop
- [ ] Microtask tidak ada di JavaScript

**6. Thread pool di Node.js digunakan untuk?**

- [ ] Menjalankan kode JavaScript
- [x] Menangani operasi I/O berat (filesystem, crypto) secara paralel di thread terpisah
- [ ] Render HTML
- [ ] Kompilasi TypeScript

**7. Keyword `async` pada function di JavaScript mengubah function menjadi?**

- [ ] Function biasa
- [x] Function yang selalu mengembalikan Promise
- [ ] Function synchronous
- [ ] Function yang tidak bisa dipanggil

**8. Perbedaan antara `Promise.all()` dan `Promise.allSettled()`?**

- [ ] Sama saja
- [x] `Promise.all()` reject jika satu promise reject, `Promise.allSettled()` tetap lanjut dan return semua hasil
- [ ] `Promise.allSettled()` lebih cepat
- [ ] `Promise.all()` hanya untuk array kosong

**9. Apa yang terjadi saat terjadi stack overflow?**

- [ ] Memory penuh di heap
- [x] Terlalu banyak frame fungsi di call stack (biasanya karena rekursi tak terbatas)
- [ ] Event loop berhenti
- [ ] Thread pool kehabisan thread

**10. Cara kerja `await` di JavaScript?**

- [ ] Memblokir thread sampai Promise selesai
- [x] Menangguhkan eksekusi function, yield control kembali ke event loop, lalu resume saat Promise selesai
- [ ] Menjalankan Promise secara synchronous
- [ ] Menghentikan semua proses

</div>
