# Sesi 1: Indexing & Optimasi Query

**Durasi:** 3 JP (135 menit)

---

## Tujuan Sesi

Setelah sesi ini, siswa mampu:
- Menjelaskan berbagai tipe index (B-tree, Hash, GIN, BRIN) dan penggunaannya
- Membuat dan mengelola index (single-column, composite, partial, covering)
- Membaca dan menganalisis rencana eksekusi query dengan `EXPLAIN ANALYZE`
- Mengidentifikasi slow query dan mengoptimalkannya
- Melakukan benchmark performa sebelum dan sesudah indexing

---

## 1. Jenis-Jenis Index di PostgreSQL

Index mempercepat pencarian dengan cara seperti **kamus** — daripada membaca seluruh buku (full table scan), langsung ke halaman kata yang dicari.

### 1.1 B-Tree Index

Jenis index **default** di PostgreSQL. Struktur pohon seimbang — semua leaf node di level yang sama, waktu pencarian **O(log n)**.

**Cocok untuk:**
- Operator `=`, `<`, `>`, `<=`, `>=`, `BETWEEN`
- `ORDER BY` dan `GROUP BY`
- `LIKE 'prefix%'` (bukan `'%suffix'`)

```sql
CREATE INDEX idx_siswa_nama ON siswa (nama);
```

### 1.2 Hash Index

Menggunakan fungsi hash untuk mencocokkan nilai. Hanya mendukung operator **equals (`=`)**.

```sql
CREATE INDEX idx_siswa_email ON siswa USING hash (email);
SELECT * FROM siswa WHERE email = 'budi@example.com';  -- pakai index
```

**Kelebihan:** Lebih kecil dari B-Tree untuk data unik.
**Kekurangan:** Tidak support range query, sorting, atau `LIKE`.

### 1.3 GIN Index (Generalized Inverted Index)

**Cocok untuk:** Data komposit — array, JSONB, full-text search.

```sql
-- Index untuk kolom array
CREATE INDEX idx_hobi ON siswa USING gin (hobi);

SELECT * FROM siswa WHERE hobi @> ARRAY['coding'];
```

**Kelebihan:** Mencari elemen di dalam array/JSONB sangat cepat.
**Kekurangan:** Lebih lambat saat update/insert dibanding B-Tree.

### 1.4 BRIN Index (Block Range Index)

**Cocok untuk:** Data yang **berurutan secara fisik** — kolom timestamp, log, serial ID.

```sql
CREATE INDEX idx_tanggal_transaksi ON transaksi USING brin (tanggal);
```

**Kelebihan:** Ukuran sangat kecil (ribuan kali lebih kecil dari B-Tree).
**Kekurangan:** Kurang efektif untuk data acak.

### 1.5 Ringkasan Tipe Index

| Tipe | Operator Didukung | Use Case Utama | Ukuran |
|------|-------------------|----------------|--------|
| B-Tree | =, <, >, <=, >=, BETWEEN, LIKE prefix | Default, general purpose | Sedang |
| Hash | = saja | Pencarian eksak, data unik | Kecil |
| GIN | @>, ?, ?&, ?\|, @@ | Array, JSONB, full-text | Besar |
| BRIN | =, <, >, <=, >= | Data terurut (log, timestamp) | Sangat kecil |

---

## 2. Strategi Index Lanjutan

### 2.1 Composite Index (Multi-Kolom)

Index pada lebih dari satu kolom. Urutan kolom **sangat penting**.

```sql
CREATE INDEX idx_kelas_tanggal ON pembayaran (kelas_id, tanggal_bayar);
```

**Aturan praktis:** Kolom yang paling sering difilter diletakkan di depan.

Query ini memanfaatkan index di atas:
```sql
SELECT * FROM pembayaran
WHERE kelas_id = 3 AND tanggal_bayar >= '2025-01-01';
```

Query ini **tidak** memanfaatkan index di atas:
```sql
SELECT * FROM pembayaran
WHERE tanggal_bayar >= '2025-01-01';
-- kolom pertama kelas_id tidak disebut, index tidak efektif
```

### 2.2 Partial Index

Index hanya untuk **sebagian baris** yang memenuhi kondisi tertentu.

```sql
-- Hanya index untuk siswa yang masih aktif
CREATE INDEX idx_siswa_aktif ON siswa (nama)
WHERE status = 'aktif';

-- Query ini pakai index partial
SELECT * FROM siswa WHERE status = 'aktif' AND nama = 'Budi';
```

**Kelebihan:** Ukuran index lebih kecil, performa lebih baik karena hanya mencakup data relevan.

### 2.3 Covering Index (Index with INCLUDE)

Menyertakan kolom **non-key** di index agar `Index Only Scan` bisa terjadi — query tidak perlu menyentuh tabel sama sekali.

```sql
-- Kolom 'kelas_id' di index key, 'nama' dan 'status' disertakan
CREATE INDEX idx_siswa_cover ON siswa (kelas_id) INCLUDE (nama, status);

-- Query ini bisa Index Only Scan
SELECT kelas_id, nama, status FROM siswa WHERE kelas_id = 3;
```

**Kelebihan:** Drastis mempercepat SELECT dengan kolom tertentu.
**Kekurangan:** Index lebih besar, write lebih lambat.

---

## 3. EXPLAIN ANALYZE

### 3.1 Cara Membaca

```sql
EXPLAIN ANALYZE SELECT * FROM siswa WHERE kelas_id = 3;
```

Output menunjukkan **rencana eksekusi** dan **waktu aktual**:

```
Seq Scan on siswa  (cost=0.00..35.50 rows=10 width=512)
                 (actual time=0.015..0.045 rows=10 loops=1)
  Filter: (kelas_id = 3)
  Rows Removed by Filter: 500
Planning Time: 0.080 ms
Execution Time: 0.055 ms
```

### 3.2 Istilah Penting

| Istilah | Arti |
|---------|------|
| `Seq Scan` | Full table scan — baca semua baris (lambat untuk tabel besar) |
| `Index Scan` | Scan via index (cepat) |
| `Index Only Scan` | Semua data sudah di index, tidak perlu baca tabel |
| `cost` | Perkiraan biaya (units) — `first..total` |
| `actual time` | Waktu real dalam ms — `start..end` |
| `rows` | Perkiraan vs actual jumlah baris |
| `loops` | Berapa kali node dieksekusi |

### 3.3 Indikasi Masalah

**Seq Scan di tabel besar tanpa index:**
```
Seq Scan on transaksi (cost=0.00..4350.00 rows=1 width=48)
```
**Solusi:** Tambah index pada kolom yang difilter.

**Perbedaan besar antara estimated dan actual rows:**
```
rows=10 vs actual rows=5000
```
**Solusi:** Jalankan `ANALYZE` untuk update statistik.

**Nested Loop dengan banyak baris:**
```
Nested Loop (actual time=0.05..150.00 rows=5000 loops=1)
  -> Seq Scan on a (rows=500)
  -> Index Scan on b (rows=10 loops=500)
```
**Solusi:** Mungkin butuh `Hash Join` atau `Merge Join`.

---

## 4. Slow Query Log

PostgreSQL bisa mencatat query lambat secara otomatis:

```bash
# Di postgresql.conf
log_min_duration_statement = 1000  # log query > 1 detik
log_line_prefix = '%t [%p]: '       # format log
log_directory = 'pg_log'
```

Setelah diaktifkan, semua query yang jalan lebih dari 1 detik tercatat di file log — database untuk analisis lebih lanjut.

---

## 5. Optimasi Praktis

```sql
-- 1. Update statistik agar planner akurat
ANALYZE;

-- 2. Index untuk kolom yang sering di WHERE
CREATE INDEX idx_transaksi_tanggal ON transaksi (tanggal);

-- 3. Hindari SELECT * — ambil kolom yang dibutuhkan saja
SELECT id, nama FROM siswa;

-- 4. Gunakan LIMIT jika hanya perlu beberapa baris
SELECT * FROM transaksi WHERE id_user = 5 LIMIT 20;

-- 5. Partitioning untuk tabel sangat besar (milliaran baris)
CREATE TABLE transaksi_2025 PARTITION OF transaksi
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### Workflow Diagnosa

```
1. Query lambat? → EXPLAIN ANALYZE
2. Ada Seq Scan di tabel besar? → Tambah index
3. Estimate meleset? → ANALYZE
4. Masih lambat? → Cek Nested Loop, coba rewrite query
5. Masih lambat? → Cek hardware: RAM, disk I/O, CPU
```

---

## 6. Benchmark Sebelum & Sesudah Index

### Sebelum Index

```sql
EXPLAIN ANALYZE SELECT * FROM transaksi WHERE id_user = 42;
-- Seq Scan on transaksi  (cost=0.00..4350.00 rows=1 width=48)
-- Execution Time: 45.200 ms
```

### Sesudah Index

```sql
CREATE INDEX idx_transaksi_user ON transaksi (id_user);

EXPLAIN ANALYZE SELECT * FROM transaksi WHERE id_user = 42;
-- Index Scan using idx_transaksi_user  (cost=0.28..8.29 rows=1 width=48)
-- Execution Time: 0.045 ms
```

**Hasil:** Dari **45.2 ms** menjadi **0.045 ms** — percepatan **1000x lipat**.

---

## 7. Kapan TIDAK Perlu Index

| Situasi | Alasan |
|---------|--------|
| Tabel kecil (< 1000 baris) | Full scan lebih cepat dari index lookup |
| Kolom dengan sedikit nilai unik (boolean, status) | Index tidak selektif |
| Kolom sering di-INSERT/UPDATE/DELETE | Index memperlambat write |
| Query `LIKE '%kata%'` (wildcard depan) | Index tidak bisa dipakai |
| Tabel jarang di-query | Biaya maintenance tidak sebanding |

---

## Latihan

1. Buat tabel `transaksi(id, id_user, jumlah, tanggal)` dengan 100.000 baris data dummy. Buat index B-Tree pada `id_user` dan BRIN pada `tanggal`. Bandingkan performa query dengan `EXPLAIN ANALYZE`.

2. Diberikan query berikut:
   ```sql
   SELECT * FROM pembayaran WHERE bulan = 1 AND tahun = 2025 AND status = 'lunas';
   ```
   Rancang composite index yang paling efisien untuk query di atas. Jelaskan urutan kolomnya.

3. Analisis output EXPLAIN ANALYZE berikut dan sebutkan masalahnya:
   ```
   Seq Scan on orders  (cost=0.00..4350.00 rows=1 width=48)
                    (actual time=0.015..45.200 rows=5000 loops=1)
     Filter: (status = 'pending')
   ```

4. Buat partial index untuk query yang hanya mencari siswa dengan status `'aktif'` dan nilai di atas 80.

5. Benchmark query berikut sebelum dan sesudah indexing:
   ```sql
   SELECT * FROM transaksi WHERE YEAR(tanggal) = 2025;
   ```
   > **Tip:** Fungsi `YEAR()` di WHERE membuat index tidak bisa dipakai. Pakai range: `WHERE tanggal >= '2025-01-01' AND tanggal < '2026-01-01'`.

---

*"Query yang lambat bukan salah database — tapi salah kita yang tidak memberi index yang tepat."*
