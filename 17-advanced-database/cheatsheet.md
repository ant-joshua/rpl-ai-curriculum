# 🧠 Cheatsheet: Database Lanjutan

> Referensi cepet — 1 halaman.

## Topik Utama
- **JOIN**: INNER (irisan), LEFT (semua kiri + cocok), RIGHT (semua kanan + cocok), FULL (semua), SELF (tabel sendiri)
- **Subquery vs CTE**: subquery di WHERE/FROM; CTE `WITH` lebih rapi, reusable, recursive
- **Window Functions**: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD()`, agregat window
- **Transaksi**: `BEGIN` → `COMMIT` / `ROLLBACK`, ACID, Isolation Levels, Savepoint
- **Indexing**: B-Tree, composite index, `EXPLAIN ANALYZE`
- **Connection Pooling**:复用 koneksi, kurangi overhead buka-tutup

## Command / Sintaks Penting

```sql
-- JOIN
SELECT s.nama, k.nama_kelas
FROM siswa s
INNER JOIN kelas k ON s.kelas_id = k.id;

-- CTE
WITH rata_rata AS (
  SELECT AVG(gaji) AS avg FROM karyawan
)
SELECT nama FROM karyawan, rata_rata
WHERE gaji > rata_rata.avg;

-- Window
SELECT nama, nilai,
  RANK() OVER (ORDER BY nilai DESC) AS ranking
FROM rapor;

-- Transaksi
BEGIN;
UPDATE rekening SET saldo = saldo - 50000 WHERE id = 'A001';
UPDATE rekening SET saldo = saldo + 50000 WHERE id = 'B002';
COMMIT;
-- atau ROLLBACK; kalo error

-- Index
CREATE INDEX idx_siswa_nama ON siswa (nama);
EXPLAIN ANALYZE SELECT * FROM siswa WHERE nama = 'Budi';
```

## Tips & Trik
- **Komposit index**: kolom paling sering difilter di depan.
- **Isolation level**: `READ COMMITTED` default web app. `REPEATABLE READ` buat laporan. `SERIALIZABLE` transaksi kritis.
- **Transaksi pendek** — jangan ada API call / input user di dalam transaksi.
- **Retry serialization error** (kode 40001) — backoff exponential.
- **CTE > Subquery** kalo nested 3+ level atau perlu reuse.

## Common Mistakes
❌ Index di kolom dengan sedikit nilai unik (boolean, status) — ga efektif.
❌ Transaksi tanpa error handling — data bisa corrupt.
❌ Subquery nested dalem tanpa CTE — susah dibaca, ga bisa reuse.
❌ `LIKE '%kata'` — index ga kepake (wildcard depan).
❌ Lupa `client.release()` di Node.js — connection pool bocor.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
