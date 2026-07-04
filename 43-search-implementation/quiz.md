# Quiz: Search Implementation

> Jawab pertanyaan di bawah dengan klik pilihan yang benar.

<div class="quiz">

**1. PostgreSQL full-text search menggunakan tipe data dan index berikut?**

- [ ] TEXT + B-tree index
- [x] tsvector/tsquery + GIN index
- [ ] JSONB + Hash index
- [ ] ARRAY + GiST index

**2. Meilisearch adalah search engine yang dikenal karena fitur...**

- [ ] Hanya bisa dijalankan di cloud
- [x] Typo tolerance secara default tanpa konfigurasi rumit
- [ ] Membutuhkan Elasticsearch sebagai dependency
- [ ] Tidak mendukung filter

**3. Fuse.js digunakan dalam skenario...**

- [ ] Search real-time dengan jutaan dokumen
- [x] Client-side fuzzy search untuk dataset kecil-sedang
- [ ] Full-text search di database
- [ ] Search engine terdistribusi

**4. Untuk memberikan rekomendasi yang relevan saat user mengetik, digunakan fitur...**

- [ ] Pagination
- [ ] Sorting
- [x] Autocomplete / search-as-you-type
- [ ] Caching

**5. Arsitektur hybrid search menggabungkan...**

- [ ] Dua database berbeda untuk satu query
- [x] PostgreSQL FTS untuk query akurat + Meilisearch untuk typo-tolerant cepat
- [ ] Client-side dan server-side rendering
- [ ] REST API dan GraphQL

**6. Cara paling efisien untuk menyinkronkan data dari PostgreSQL ke Meilisearch secara near real-time?**

- [ ] Full reindex tiap jam
- [x] Change Data Capture (CDC) atau webhook setelah insert/update
- [ ] Copy tabel manual setiap hari
- [ ] Menggunakan cron job setiap 30 detik tanpa penanda perubahan

</div>
