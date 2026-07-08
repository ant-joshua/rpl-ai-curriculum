# Sesi 2: Transaksi & Isolation Level

**Durasi:** 3 JP (135 menit)

---

## Tujuan Sesi

Setelah sesi ini, siswa mampu:
- Menjelaskan properti ACID dan pentingnya dalam transaksi database
- Menggunakan BEGIN, COMMIT, dan ROLLBACK dengan benar
- Membedakan 4 isolation level (Read Uncommitted hingga Serializable)
- Mendeteksi dan menangani deadlock
- Menerapkan optimistic vs pessimistic locking
- Memahami cara kerja MVCC di PostgreSQL

---

## 1. Konsep Transaksi

Transaksi adalah unit kerja yang **atomic** — semua berhasil atau semua gagal. Konsep ini disebut **ACID**:

| Properti | Arti | Analogi |
|----------|------|---------|
| **Atomicity** | Semua operasi dalam transaksi berhasil ATAU semua gagal | Transfer bank: uang keluar dari A harus masuk ke B |
| **Consistency** | Data selalu valid sebelum dan sesudah transaksi | Saldo tidak boleh negatif |
| **Isolation** | Transaksi berjalan seolah sendiri, tidak saling ganggu | Proses tarik dan transfer jalan bersamaan tanpa konflik |
| **Durability** | Data tersimpan permanen setelah COMMIT | Server mati setelah COMMIT, data tetap aman |

---

## 2. Sintaks Dasar Transaksi

### BEGIN / COMMIT / ROLLBACK

```sql
BEGIN;              -- mulai transaksi

UPDATE rekening SET saldo = saldo - 100000 WHERE id = 1;
UPDATE rekening SET saldo = saldo + 100000 WHERE id = 2;

COMMIT;             -- simpan permanen

-- atau jika gagal:
ROLLBACK;           -- batalkan semua perubahan
```

### Skenario Nyata: Transfer Bank

```sql
BEGIN;

UPDATE rekening SET saldo = saldo - 50000 WHERE id = 'A001';
-- jika listrik padam di sini, tanpa transaksi uang hilang

UPDATE rekening SET saldo = saldo + 50000 WHERE id = 'B002';

COMMIT;
-- hanya setelah COMMIT data benar-benar tersimpan
```

Jika ada error sebelum COMMIT, jalankan `ROLLBACK` untuk mengembalikan data ke keadaan awal.

### Savepoint

Sub-titik di dalam transaksi untuk rollback parsial:

```sql
BEGIN;
INSERT INTO log VALUES ('mulai');
SAVEPOINT sp1;
INSERT INTO log VALUES ('tahap_1');
-- ups, salah
ROLLBACK TO SAVEPOINT sp1;
-- log 'tahap_1' dihapus, 'mulai' tetap ada
COMMIT;
```

---

## 3. Isolation Levels

Isolation level mengontrol bagaimana transaksi "lihat" perubahan dari transaksi lain yang jalan bersamaan. Ada 4 level di PostgreSQL:

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Use Case |
|-------|-----------|---------------------|--------------|----------|
| `READ UNCOMMITTED` | ❌ (PG treat as RC) | ❌ | ❌ | Jarang dipakai |
| `READ COMMITTED` (default) | ✅ Aman | ❌ Bisa beda | ❌ Bisa beda | Web apps umum |
| `REPEATABLE READ` | ✅ Aman | ✅ Aman | ❌ Bisa beda | Laporan keuangan |
| `SERIALIZABLE` | ✅ Aman | ✅ Aman | ✅ Aman | Tabungan, transaksi kritis |

### 3.1 READ UNCOMMITTED

Di PostgreSQL, level ini diperlakukan sama seperti **READ COMMITTED**. PostgreSQL tidak memiliki dirty read bahkan di level terendah.

### 3.2 READ COMMITTED (Default)

Setiap query dalam transaksi hanya melihat data yang sudah di-COMMIT sebelum query dimulai.

**Masalah: Non-Repeatable Read**
```sql
-- Transaksi A                            -- Transaksi B
BEGIN;                                     BEGIN;
SELECT saldo FROM rekening WHERE id=1;    
-- saldo = 100rb                           
                                           UPDATE rekening SET saldo=50rb WHERE id=1;
                                           COMMIT;
SELECT saldo FROM rekening WHERE id=1;    
-- saldo = 50rb (beda!)                   
COMMIT;
```

### 3.3 REPEATABLE READ

Menjamin bahwa semua query dalam satu transaksi melihat **snapshot data yang sama** — data yang sudah di-COMMIT sebelum transaksi dimulai.

```sql
BEGIN;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT SUM(saldo) FROM rekening WHERE user_id = 1;
-- 200rb

-- Transaksi lain transfer masuk 50rb & commit
-- Transaksi ini masih liat 200rb (konsisten)

SELECT SUM(saldo) FROM rekening WHERE user_id = 1;
-- Masih 200rb — REPEATABLE READ menjamin konsistensi

COMMIT;
-- Next query baru liat data terbaru
```

### 3.4 SERIALIZABLE

Level tertinggi — transaksi dieksekusi seolah **berurutan satu per satu**. PostgreSQL mendeteksi konflik dan bisa **menggagalkan transaksi** dengan error `40001`.

```sql
BEGIN;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

UPDATE rekening SET saldo = saldo - 50000 WHERE id = 1;
-- Jika tabrakan dengan transaksi lain, error 40001 muncul

COMMIT;
```

### Panduan Memilih Level

| Level | Recommended buat |
|-------|-----------------|
| `READ COMMITTED` | Default. Kebanyakan web app. |
| `REPEATABLE READ` | Laporan, histori, billing — butuh snapshot konsisten |
| `SERIALIZABLE` | Keuangan, antrian, race condition sensitif — tapi siap-siap retry |

> **⚠️ Makin tinggi isolation, makin banyak conflict/rollback.** SERIALIZABLE bisa nge-drop transaksi kalau detect konflik — harus pakai retry logic di aplikasi.

---

## 4. Deadlock Detection

Deadlock terjadi ketika dua transaksi saling menunggu resource satu sama lain.

### Skenario Deadlock

```sql
-- Transaksi A                             -- Transaksi B
BEGIN;                                      BEGIN;
UPDATE rekening SET saldo=0 WHERE id=1;     UPDATE rekening SET saldo=0 WHERE id=2;
                                            UPDATE rekening SET saldo=0 WHERE id=1;
UPDATE rekening SET saldo=0 WHERE id=2;     -- MENUNGGU A selesai...
-- MENUNGGU B selesai...                    -- DEADLOCK!
```

PostgreSQL secara otomatis mendeteksi deadlock setelah **deadlock_timeout** (default 1 detik) dan membatalkan salah satu transaksi.

```
ERROR:  deadlock detected
DETAIL:  Process 123 waits for ShareLock on transaction 456; blocked by process 789.
HINT:  Restart the transaction.
```

**Cara menghindari deadlock:**
- Akses tabel dalam urutan yang sama di semua transaksi
- Jaga transaksi tetap pendek
- Gunakan isolation level serendah mungkin

---

## 5. Optimistic vs Pessimistic Locking

### 5.1 Pessimistic Locking

Mengunci baris saat dibaca agar transaksi lain tidak bisa mengubahnya.

```sql
BEGIN;
-- Kunci baris id=1 untuk update (transaksi lain harus menunggu)
SELECT * FROM rekening WHERE id = 1 FOR UPDATE;

-- Proses data dengan aman (tidak ada perubahan dari luar)
UPDATE rekening SET saldo = saldo - 100000 WHERE id = 1;

COMMIT;  -- kunci dilepas
```

**Varian FOR UPDATE:**
| Klausa | Perilaku |
|--------|----------|
| `FOR UPDATE` | Kunci baris — transaksi lain tidak bisa update, delete, atau select FOR UPDATE |
| `FOR NO KEY UPDATE` | Lebih lemah — hanya blokir update yang mengubah nilai indexed column |
| `FOR SHARE` | Transaksi lain bisa baca, tapi tidak bisa update/delete |
| `FOR KEY SHARE` | Paling lemah — hanya blokir hapus/ubah primary key |

**Kapan pakai:** Data sering bertabrakan (high contention), sistem keuangan.

### 5.2 Optimistic Locking

Tidak mengunci — menggunakan **version column** untuk deteksi konflik saat commit.

```sql
-- Asumsi ada kolom `version` di tabel
SELECT id, saldo, version FROM rekening WHERE id = 1;
-- saldo = 100000, version = 3

-- Proses perubahan (tanpa kunci)
-- saldo baru = saldo - 50000 = 50000

UPDATE rekening
SET saldo = 50000, version = 4
WHERE id = 1 AND version = 3;
-- Jika version sudah berubah (transaksi lain update duluan),
-- baris tidak ter-update (affected rows = 0)
```

**Kapan pakai:** Data jarang bertabrakan (low contention), aplikasi dengan banyak baca.

---

## 6. Transaksi di Aplikasi (Node.js)

Pakai library `pg` — transaksi manual:

```typescript
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function transferMoney(fromId: number, toId: number, amount: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      'UPDATE rekening SET saldo = saldo - $1 WHERE id = $2',
      [amount, fromId]
    );
    
    // Kalau error di sini, ROLLBACK otomatis
    await client.query(
      'UPDATE rekening SET saldo = saldo + $1 WHERE id = $2',
      [amount, toId]
    );
    
    await client.query('COMMIT');
    console.log('Transfer berhasil');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transfer gagal, di-rollback:', err);
    throw err; // Lempar ke caller buat di-handle
  } finally {
    client.release(); // Kembalikan koneksi ke pool
  }
}
```

**Pattern: Transaction with retry on serialization error:**

```typescript
async function executeWithRetry<T>(
  fn: (client: PoolClient) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  const client = await pool.connect();
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err: any) {
      await client.query('ROLLBACK');
      // Cuma retry kalau error serialization (40001)
      if (err.code === '40001' && attempt < maxRetries) {
        const backoff = Math.min(100 * Math.pow(2, attempt - 1), 2000);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      throw err;
    } finally {
      client.release();
    }
  }
  throw new Error('Gagal setelah retry max');
}

// Pakai:
await executeWithRetry(async (client) => {
  await client.query('UPDATE ...');
  await client.query('UPDATE ...');
});
```

---

## 7. PostgreSQL MVCC (Multi-Version Concurrency Control)

PostgreSQL menggunakan **MVCC** sebagai fondasi transaksinya. Setiap transaksi melihat **snapshot data** pada saat transaksi dimulai.

### Cara Kerja MVCC

- Setiap baris data memiliki **xmin** (transaksi yang membuat versi ini) dan **xmax** (transaksi yang menghapus/mengubah versi ini)
- Saat UPDATE, PostgreSQL **tidak menimpa** data lama — melainkan membuat **versi baru** dari baris tersebut
- Data lama tetap ada sampai **VACUUM** membersihkannya

```
Baris id=1, saldo=100000, xmin=100, xmax=null
                        ↓ UPDATE oleh transaksi 200
Baris id=1, saldo=50000, xmin=200, xmax=null     ← versi baru
Baris id=1, saldo=100000, xmin=100, xmax=200     ← versi lama (dihapus vacuum)
```

**Keuntungan MVCC:**
- READ tidak pernah block WRITE, WRITE tidak pernah block READ
- Setiap transaksi punya snapshot konsisten tanpa kunci baca
- Rollback cepat — cukup buang versi baru

**Kekurangan MVCC:**
- Bisa bloated (tabel membesar karena data lama) — perlu `VACUUM` rutin
- Lebih banyak ruang disk

---

## 8. Best Practices Transaksi

- **Transaksi pendek.** Jangan ada input user atau API call di dalam transaksi.
- **Error handling wajib.** Setiap BEGIN harus ada COMMIT/ROLLBACK — pakai try/catch/finally.
- **Test isolation level.** Paling rendah yang cukup — jangan SERIALIZABLE kalau tidak perlu.
- **Retry serialization failure.** Kode `40001` — transaksi gagal karena konflik, tinggal ulang.
- **Jangan nested transaction.** PostgreSQL tidak punya nested transaction — pakai SAVEPOINT saja.
- **Akses tabel dalam urutan sama** untuk cegah deadlock.

---

## Latihan

1. Simulasikan transfer bank 250.000 dari rekening A ke B dalam satu transaksi. Sertakan pengecekan saldo dan ROLLBACK jika saldo A tidak mencukupi.

2. Buat dua sesi PostgreSQL. Di sesi A, mulai transaksi dengan isolation level REPEATABLE READ dan SELECT jumlah saldo. Di sesi B, lakukan UPDATE dan COMMIT. Tunjukkan bahwa sesi A tetap melihat data lama.

3. Tulis query yang menyebabkan deadlock antara dua transaksi. Amati bagaimana PostgreSQL mendeteksinya. Kemudian perbaiki query agar deadlock tidak terjadi.

4. Implementasikan optimistic locking pada tabel `produk` dengan kolom `stok` dan `version`. Proses pembelian harus mengecek stok dan decrement dengan aman.

5. Implementasikan fungsi `executeWithRetry` di aplikasi Node.js untuk transfer uang dengan retry logic pada error serialization (kode `40001`).

---

*"Transaksi yang baik adalah jembatan antara konsistensi data dan performa aplikasi."*
