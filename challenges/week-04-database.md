# Week 04: Database — SQL Query Challenge

## Tujuan

Menyelesaikan **10 soal SQL** berdasarkan sample database relasional (produk, pelanggan, pesanan). Challenge ini menguji kemampuan menulis query SELECT, JOIN, filtering, aggregasi, dan subquery.

## Acceptance Criteria

- [ ] Semua query ditulis dalam satu file `queries.sql`
- [ ] Setiap query diawali komentar nomor soal dan deskripsi
- [ ] Query berjalan tanpa error di SQLite atau MySQL
- [ ] Menggunakan JOIN minimal di 3 soal
- [ ] Menggunakan GROUP BY + HAVING minimal di 2 soal
- [ ] Menggunakan subquery minimal di 1 soal
- [ ] Hasil query ditampilkan sebagai komentar di sebelah query (untuk soal yang hasilnya tetap)

## Step-by-Step

1. **Buat folder submission**
   ```bash
   mkdir -p challenges/submissions/week-04/nama-kamu
   ```
2. **Buat file** `queries.sql`
3. **Buat dan insert sample data** (atau download dari repositori). Struktur tabel:
4. **Tulis 10 query sesuai soal**

### Struktur Database

```sql
CREATE TABLE produk (
  id INTEGER PRIMARY KEY,
  nama VARCHAR(100),
  kategori VARCHAR(50),
  harga DECIMAL(10,2),
  stok INTEGER
);

CREATE TABLE pelanggan (
  id INTEGER PRIMARY KEY,
  nama VARCHAR(100),
  email VARCHAR(100),
  kota VARCHAR(50),
  tgl_daftar DATE
);

CREATE TABLE pesanan (
  id INTEGER PRIMARY KEY,
  pelanggan_id INTEGER REFERENCES pelanggan(id),
  tgl_pesan DATE,
  total DECIMAL(10,2),
  status VARCHAR(20)
);

CREATE TABLE detail_pesanan (
  id INTEGER PRIMARY KEY,
  pesanan_id INTEGER REFERENCES pesanan(id),
  produk_id INTEGER REFERENCES produk(id),
  jumlah INTEGER,
  harga_satuan DECIMAL(10,2)
);
```

### 10 Soal

1. **Tampilkan semua produk** dengan harga lebih dari 50.000, urutkan dari termahal ke termurah.

2. **Tampilkan nama pelanggan** yang pernah melakukan pesanan dengan status "selesai". (Gunakan JOIN)

3. **Hitung total pendapatan** (total harga) per kategori produk. Tampilkan kategori dan total_pendapatan. Urutkan dari terbesar.

4. **Tampilkan 5 produk paling laris** (berdasarkan total jumlah terjual di detail_pesanan).

5. **Cari pelanggan yang tidak pernah memesan** sama sekali. (Gunakan LEFT JOIN atau subquery)

6. **Tampilkan rata-rata nilai pesanan** per pelanggan. Hanya pelanggan dengan rata-rata > 100.000. (GROUP BY + HAVING)

7. **Tampilkan daftar pesanan** yang berisi lebih dari 3 jenis produk berbeda.

8. **Cari produk yang stoknya habis** (stok = 0) tapi pernah dipesan sebelumnya. (Subquery)

9. **Buat view** `laporan_penjualan_bulanan` yang menampilkan total penjualan per bulan.

10. **Tampilkan pelanggan dengan total belanja tertinggi** beserta totalnya. Gunakan window function atau subquery.

### Format Output di File

```sql
-- Soal 1: Produk dengan harga > 50.000
SELECT nama, harga
FROM produk
WHERE harga > 50000
ORDER BY harga DESC;

-- Hasil:
-- | nama          | harga    |
-- | Laptop        | 15000000 |
-- | Monitor       | 3500000  |
-- | ...           | ...      |
```

## Bonus (Optional)

- ✅ Index untuk optimasi query (sertakan `EXPLAIN QUERY PLAN`)
- ✅ Trigger untuk update stok otomatis saat pesanan dibuat
- ✅ Buat dump file SQL lengkap dengan data sample (min 20 produk, 10 pelanggan, 30 pesanan)

## Submission

```
challenges/submissions/week-04/nama-kamu/
├── queries.sql
└── dump_data.sql (bonus)
```

Buat Pull Request dengan judul `[Week 04] SQL Challenge - Nama Kamu`.
