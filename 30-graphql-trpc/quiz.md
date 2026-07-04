# Quiz: GraphQL & tRPC

<div class="quiz">

**1. Apa kelebihan utama GraphQL dibandingkan REST?**

- [ ] Hanya bisa menggunakan metode GET
- [x] Client bisa meminta data spesifik yang dibutuhkan, mengurangi over-fetching
- [ ] Tidak perlu schema atau type definition
- [ ] Lebih cepat dari REST dalam semua kasus

**2. Dalam GraphQL, `resolver` bertugas untuk:**

- [ ] Mendefinisikan tipe data di schema
- [x] Mengimplementasikan logika untuk mengambil atau memutasi data setiap field
- [ ] Men-generate dokumentasi API
- [ ] Menyimpan data di cache

**3. Perbedaan `Query` dan `Mutation` di GraphQL:**

- [x] Query untuk mengambil data (read-only), Mutation untuk mengubah data (create/update/delete)
- [ ] Query lebih cepat dari Mutation
- [ ] Mutation hanya bisa dipanggil sekali
- [ ] Tidak ada perbedaan, hanya sintaks berbeda

**4. Subscription di GraphQL digunakan untuk:**

- [ ] Membuat endpoint REST tambahan
- [x] Mendengarkan event real-time dari server (misal WebSocket)
- [ ] Menyimpan data sementara
- [ ] Validasi input user

**5. DataLoader memecahkan masalah:**

- [ ] Over-fetching data
- [x] N+1 query problem dengan batching dan caching
- [ ] Autentikasi user
- [ ] Versioning schema

**6. tRPC berbeda dari GraphQL karena:**

- [ ] Menggunakan REST endpoint
- [x] Memberikan type safety end-to-end tanpa schema language — tipe langsung dari TypeScript
- [ ] Tidak mendukung mutations
- [ ] Hanya bisa dipakai dengan React

</div>
