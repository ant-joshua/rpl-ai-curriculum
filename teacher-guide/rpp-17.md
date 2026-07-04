# RPP Modul 17: Database Lanjutan

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Menulis JOIN (INNER, LEFT, RIGHT, FULL, SELF)
- Menggunakan CTE vs subquery
- Memanfaatkan window functions (RANK, ROW_NUMBER, LAG, LEAD)
- Mengelola transaksi + ACID
- Optimasi query dengan indexing + EXPLAIN ANALYZE

## Tools & Bahan

- PostgreSQL
- pgAdmin / psql / DBeaver
- Sample dataset (siswa, nilai, kelas, karyawan)
- Node.js pg client

---

## Sesi 1: JOIN + Subquery + CTE (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: JOIN Types** | INNER, LEFT, RIGHT, FULL, SELF JOIN. Diagram Venn. Subquery di WHERE vs FROM. CTE dengan `WITH`. |
| 45 menit | **Coding: JOIN + CTE Practice** | Setup sample DB. Query JOIN multi-tabel. CTE untuk query kompleks (rata-rata gaji per departemen). |
| 20 menit | **Latihan: Report Query** | Siswa bikin report: ranking siswa per kelas, total nilai per guru, history transaksi. |
| 10 menit | **Review** | Kapan CTE lebih baik dari subquery? Kenapa `LEFT JOIN` berbeda hasilnya dengan `INNER JOIN`? |

**Code demo:**

```sql
-- INNER JOIN
SELECT s.nama, k.nama_kelas
FROM siswa s
INNER JOIN kelas k ON s.kelas_id = k.id;

-- CTE
WITH rata_rata AS (
  SELECT AVG(gaji) AS avg FROM karyawan
)
SELECT nama FROM karyawan, rata_rata
WHERE gaji > rata_rata.avg;

-- LEFT JOIN
SELECT s.nama, n.nilai
FROM siswa s
LEFT JOIN nilai n ON s.id = n.siswa_id;
```

**Checklist siswa:**
- [ ] INNER, LEFT, RIGHT JOIN berfungsi
- [ ] CTE dengan `WITH` untuk query kompleks
- [ ] Subquery di WHERE
- [ ] SELF JOIN (karyawan + manager)

---

## Sesi 2: Window Functions + Transaksi (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Window Functions & ACID** | `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD()`. ACID: Atomicity, Consistency, Isolation, Durability. Transaksi: BEGIN, COMMIT, ROLLBACK. |
| 45 menit | **Coding: Ranking + Transaksi** | Window functions: ranking nilai, running total, difference from previous row. Transaksi: transfer bank dengan error handling. |
| 20 menit | **Latihan: Sales Dashboard** | Siswa buat query: ranking sales per region, month-over-month growth, running revenue. |
| 10 menit | **Review** | Apa beda RANK vs DENSE_RANK? Kenapa transaksi harus pendek? |

**Code demo:**

```sql
-- Window functions
SELECT nama, nilai,
  RANK() OVER (ORDER BY nilai DESC) AS ranking,
  DENSE_RANK() OVER (ORDER BY nilai DESC) AS dense_ranking,
  LAG(nilai) OVER (ORDER BY tgl) AS nilai_sebelumnya
FROM rapor;

-- Transaksi
BEGIN;
UPDATE rekening SET saldo = saldo - 50000 WHERE id = 'A001';
UPDATE rekening SET saldo = saldo + 50000 WHERE id = 'B002';
COMMIT;
-- ROLLBACK; kalo error
```

**Checklist siswa:**
- [ ] ROW_NUMBER, RANK, DENSE_RANK
- [ ] LAG / LEAD untuk comparison
- [ ] Transaksi BEGIN → COMMIT
- [ ] Transaksi dengan error handling → ROLLBACK
- [ ] ACID principles

---

## Sesi 3: Indexing + Performance (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Indexing + EXPLAIN** | B-Tree index. Composite index. `EXPLAIN ANALYZE`. Connection pooling. Query optimization. |
| 45 menit | **Coding: EXPLAIN ANALYZE + Optimization** | Query tanpa index → EXPLAIN → tambah index → EXPLAIN lagi. Bandingkan cost & timing. Setup connection pool di Node.js. |
| 20 menit | **Latihan: Optimasi Query Slow** | Siswa dikasih query lambat, harus analisa pakai EXPLAIN, kasih rekomendasi index, test hasilnya. |
| 10 menit | **Review** | Kapan index tidak efektif? Kenapa `LIKE '%kata'` ga pake index? |

**Code demo:**

```sql
-- Tanpa index
EXPLAIN ANALYZE SELECT * FROM siswa WHERE nama = 'Budi';

-- Tambah index
CREATE INDEX idx_siswa_nama ON siswa (nama);

-- Dengan index
EXPLAIN ANALYZE SELECT * FROM siswa WHERE nama = 'Budi';

-- Composite index
CREATE INDEX idx_siswa_kelas_nama ON siswa (kelas_id, nama);

-- Connection pool (Node.js)
const pool = new Pool({ max: 20, idleTimeoutMillis: 30000 });
const { rows } = await pool.query('SELECT * FROM siswa');
```

**Checklist siswa:**
- [ ] `EXPLAIN ANALYZE` sebelum & sesudah index
- [ ] Composite index dengan kolom tepat
- [ ] Connection pool di Node.js
- [ ] Identifikasi slow query

## Assessment

| Kriteria | Bobot |
|----------|-------|
| JOIN + CTE + Subquery | 25% |
| Window functions + Transaksi | 30% |
| Indexing + Query optimization | 30% |
| Partisipasi | 15% |
