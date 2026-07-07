---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/97077/pexels-phot"
footer: "Sesi 02: Sql Basics"
---

<!-- _class: title -->
# 1.2 SQL Basics

## SQL Syntax

SQL (Structured Query Language) — bahasa buat komunikasi sama database.

### Kategori SQL

| Kategori | Kepanjangan | Perintah |
|----------|-------------|----------|
| **DDL** | Data Definition Language | `CREATE`, `ALTER`, `DROP` — define struktur |
| **DML** | Data Manipulation Language | `SELECT`, `INSERT`, `UPDATE`, `DELETE` — manipulasi data |
| **DCL** | Data Control Language | `GRANT`, `REVOKE` — hak akses |
| **TCL** | Transaction Control Language | `COMMIT`, `ROLLBACK`, `BEGIN` — transaksi |

Di sesi ini kita fokus ke **DDL** (CREATE TABLE) dan **DML** (INSERT, SELECT, UPDATE, DELETE).

> **Aturan SQL:**
> - Case-insensitive: `SELECT` == `select` == `Select` (tapi uppercase biar jelas)
> - String pakai single quote: `'Budi'`, bukan `"Budi"`
> - Setiap statement diakhiri `;`
> - Komentar: `-- single line`, `/* multi line */`

---

## CREATE TABLE

Bikin table baru.

```sql
-- Syntax dasar
CREATE TABLE nama_table (
    column1 tipe_data [constraints],
    column2 tipe_data [constraints],
    ...
);

-- Contoh: table products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Common Constraints

| Constraint | Maksud | Contoh |
|------------|--------|--------|
| `NOT NULL` | Wajib diisi | `name VARCHAR(100) NOT NULL` |
| `UNIQUE` | Tidak boleh duplikat | `email VARCHAR(255) UNIQUE` |
| `PRIMARY KEY` | NOT NULL + UNIQUE | `id SERIAL PRIMARY KEY` |
| `DEFAULT` | Nilai default | `stock INT DEFAULT 0` |
| `CHECK` | Validasi kondisi | `price DECIMAL(10,2) CHECK (price > 0)` |

```sql
-- CREATE TABLE dengan semua constraint
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0 CHECK (sort_order >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## INSERT

Nambah data ke table.

```sql
-- Syntax
INSERT INTO nama_table (column1, column2, ...)
VALUES (value1, value2, ...);

-- Insert satu baris
INSERT INTO products (name, price, stock, category)
VALUES ('Kopi Arabika 250gr', 45000, 50, 'Kopi');

-- Insert banyak baris
INSERT INTO products (name, price, stock, category) VALUES
    ('Kopi Robusta 250gr', 35000, 30, 'Kopi'),
    ('Teh Hijau 50gr', 25000, 20, 'Teh'),
    ('Gula Aren 500gr', 18000, 100, 'Gula');

-- Insert dengan return (PostgreSQL)
INSERT INTO products (name, price, stock)
VALUES ('Kopi Luwak 100gr', 150000, 5)
RETURNING *;
-- Balikin baris yang baru diinsert beserta id-nya
```

### INSERT tanpa specified columns

```sql
-- Kalau sebut column, urutan bebas
INSERT INTO products (name, price, stock) VALUES ('Test', 1000, 5);

-- Kalau tidak sebut column, WAJIB urutan sesuai schema
INSERT INTO products VALUES (DEFAULT, 'Test', 1000, 5, NULL, true, 'now');
-- DEFAULT = ambil default value
-- NULL/true/'now' = isi manual
```

> **Best practice:** Selalu sebut column names. Lebih jelas dan nggak rentan error kalau struktur table berubah.

---

## SELECT

Mengambil data dari table.

```sql
-- Syntax dasar
SELECT column1, column2, ...
FROM nama_table
WHERE kondisi
ORDER BY column [ASC|DESC]
LIMIT jumlah
OFFSET lompat;

-- SELECT semua column
SELECT * FROM products;

-- SELECT spesifik column
SELECT name, price FROM products;

-- SELECT dengan alias
SELECT name AS nama_produk, price AS harga FROM products;

-- SELECT dengan perhitungan
SELECT name, price, price * 1.11 AS harga_ppn FROM products;
```

### WHERE — Filter data

```sql
-- Operator perbandingan (=, <, >, <=, >=, <>)
SELECT * FROM products WHERE price < 50000;
SELECT * FROM products WHERE stock >= 10;
SELECT * FROM products WHERE category = 'Kopi';
SELECT * FROM products WHERE category <> 'Teh';  -- <> = tidak sama

-- LIKE — pencarian teks (case-insensitive di PostgreSQL)
SELECT * FROM products WHERE name LIKE '%Kopi%';     -- mengandung "Kopi"
SELECT * FROM products WHERE name LIKE 'Kopi%';      -- diawali "Kopi"
SELECT * FROM products WHERE name LIKE '%250gr';     -- diakhiri "250gr"
-- % = wildcard (0 atau lebih karakter)
-- _ = wildcard 1 karakter

-- IN — filter beberapa nilai
SELECT * FROM products WHERE category IN ('Kopi', 'Teh', 'Gula');

-- BETWEEN — range
SELECT * FROM products WHERE price BETWEEN 20000 AND 50000;
SELECT * FROM products WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- IS NULL — cek null
SELECT * FROM products WHERE category IS NULL;
SELECT * FROM products WHERE description IS NOT NULL;
```

### Logical Operators

```sql
-- AND — semua kondisi harus true
SELECT * FROM products
WHERE category = 'Kopi'
  AND price < 50000
  AND stock > 0;

-- OR — salah satu kondisi true
SELECT * FROM products
WHERE category = 'Kopi'
   OR category = 'Teh';

-- Kombinasi AND + OR — pake parentheses biar jelas
SELECT * FROM products
WHERE (category = 'Kopi' OR category = 'Teh')
  AND price < 50000;

-- NOT — kebalikan
SELECT * FROM products
WHERE NOT category = 'Teh';
```

### ORDER BY — Sorting

```sql
-- ASC = ascending (A-Z, kecil-besar) — default
-- DESC = descending (Z-A, besar-kecil)

SELECT name, price FROM products ORDER BY price ASC;
SELECT name, price FROM products ORDER BY price DESC;
SELECT * FROM products ORDER BY category ASC, price DESC;
-- Sort category A-Z, lalu dalam tiap category sort price besar-kecil
```

### LIMIT & OFFSET — Pagination

```sql
-- LIMIT: ambil N baris
SELECT * FROM products LIMIT 5;

-- LIMIT + OFFSET: loncati N baris dulu
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 0;   -- halaman 1
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 10;  -- halaman 2
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 20;  -- halaman 3
```

---

## UPDATE

Edit data existing.

```sql
-- Syntax
UPDATE nama_table
SET column1 = value1, column2 = value2, ...
WHERE kondisi;

-- Update satu baris (pasti pake WHERE id)
UPDATE products
SET price = 48000, updated_at = NOW()
WHERE id = 1;

-- Update banyak baris
UPDATE products
SET price = price * 1.1
WHERE category = 'Kopi';
-- Naikin 10% harga semua produk kopi

-- Update dengan RETURNING (PostgreSQL)
UPDATE products
SET stock = stock + 10
WHERE category = 'Teh'
RETURNING id, name, stock;
```

> **⚠️ PERINGATAN:** `UPDATE` tanpa `WHERE` = update SEMUA baris. Selalu double check WHERE clause sebelum execute!

---

## DELETE

Hapus data.

```sql
-- Syntax
DELETE FROM nama_table
WHERE kondisi;

-- Hapus satu baris
DELETE FROM products WHERE id = 5;

-- Hapus dengan kondisi
DELETE FROM products
WHERE stock = 0 AND is_active = false;

-- Hapus dengan RETURNING (PostgreSQL)
DELETE FROM products
WHERE category IS NULL
RETURNING id, name;
```

> **⚠️ PERINGATAN:** `DELETE` tanpa `WHERE` = hapus SEMUA data. Sama berbahayanya sama UPDATE tanpa WHERE.

---

## Aggregate Functions

Fungsi yang operasi di sekelompok baris dan balikin satu nilai.

| Function | Kegunaan | Contoh |
|----------|----------|--------|
| `COUNT()` | Hitung jumlah baris | `COUNT(*)` = total baris, `COUNT(column)` = non-null |
| `SUM()` | Total nilai | `SUM(price)` |
| `AVG()` | Rata-rata | `AVG(price)` |
| `MIN()` | Nilai minimum | `MIN(price)` |
| `MAX()` | Nilai maksimum | `MAX(price)` |

```sql
-- COUNT
SELECT COUNT(*) AS total_produk FROM products;
SELECT COUNT(DISTINCT category) AS total_kategori FROM products;
-- DISTINCT = hitung unik

-- SUM
SELECT SUM(stock) AS total_stok FROM products;
SELECT SUM(price * stock) AS total_nilai_inventaris FROM products;

-- AVG
SELECT AVG(price) AS harga_rata_rata FROM products;

-- MIN & MAX
SELECT MIN(price) AS termurah, MAX(price) AS termahal FROM products;

-- Kombinasi
SELECT
    COUNT(*) AS total_produk,
    AVG(price)::DECIMAL(10,2) AS rata_harga,
    MIN(price) AS harga_min,
    MAX(price) AS harga_max,
    SUM(stock) AS total_stok
FROM products
WHERE is_active = true;
```

---

## GROUP BY & HAVING

`GROUP BY` — kelompokkan baris berdasarkan nilai yang sama, lalu apply aggregate.

```sql
-- Syntax
SELECT column, aggregate_function(column)
FROM nama_table
WHERE kondisi
GROUP BY column
HAVING kondisi_group
ORDER BY column;

-- Jumlah produk per kategori
SELECT
    category,
    COUNT(*) AS jumlah_produk,
    AVG(price)::DECIMAL(10,2) AS rata_harga
FROM products
GROUP BY category;

-- Total stok per kategori
SELECT
    category,
    SUM(stock) AS total_stok
FROM products
GROUP BY category
ORDER BY total_stok DESC;

-- Rata-rata harga per kategori — hanya kategori dengan > 1 produk
SELECT
    category,
    COUNT(*) AS jumlah_produk,
    AVG(price)::DECIMAL(10,2) AS rata_harga
FROM products
GROUP BY category
HAVING COUNT(*) > 1;

-- Filter dulu WHERE, baru GROUP BY, baru HAVING
SELECT
    category,
    COUNT(*) AS active_products,
    AVG(price)::DECIMAL(10,2) AS rata_harga
FROM products
WHERE is_active = true            -- filter baris sebelum grouping
GROUP BY category
HAVING COUNT(*) >= 2              -- filter hasil grouping
ORDER BY active_products DESC;
```

**Urutan eksekusi SQL (logis, bukan urutan nulis):**

1. `FROM` — ambil data dari table
2. `WHERE` — filter baris
3. `GROUP BY` — kelompokkan
4. `HAVING` — filter kelompok
5. `SELECT` — pilih column + aggregate
6. `ORDER BY` — sorting
7. `LIMIT / OFFSET` — pagination

---

## Contoh Query Lengkap

```sql
-- Setup table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed data
INSERT INTO products (name, price, stock, category, is_active) VALUES
    ('Kopi Arabika 250gr', 45000, 50, 'Kopi', true),
    ('Kopi Robusta 250gr', 35000, 30, 'Kopi', true),
    ('Teh Hijau 50gr', 25000, 20, 'Teh', true),
    ('Teh Melati 40gr', 22000, 0, 'Teh', true),
    ('Gula Aren 500gr', 18000, 100, 'Gula', true),
    ('Gula Pasir 1kg', 15500, 0, 'Gula', false),
    ('Kopi Luwak 100gr', 150000, 5, 'Kopi', true),
    ('Teh Tarik 3in1 10sachet', 12000, 40, 'Teh', true);

-- 1. Produk aktif dengan harga di atas rata-rata
SELECT name, price, category
FROM products
WHERE is_active = true
  AND price > (SELECT AVG(price) FROM products);

-- 2. Kategori dengan total stok > 30
SELECT
    category,
    SUM(stock) AS total_stok,
    COUNT(*) AS jumlah_produk
FROM products
WHERE is_active = true
GROUP BY category
HAVING SUM(stock) > 30
ORDER BY total_stok DESC;

-- 3. Produk terlaris (stok abis)
SELECT name, category, price
FROM products
WHERE stock = 0 AND is_active = true;

-- 4. Cari produk berdasarkan kata kunci
SELECT *
FROM products
WHERE name ILIKE '%kopi%'  -- ILIKE = case-insensitive LIKE (PostgreSQL)
   OR name ILIKE '%teh%';
```

---

## Latihan

**Latihan 1: Bikin Table Product**
Buat table `products` dengan kolom:
- `id` — primary key auto increment
- `name` — varchar 200, not null
- `price` — decimal 10,2, not null
- `stock` — integer, default 0
- `category` — varchar 100
- `is_active` — boolean, default true
- `description` — text, nullable
- `created_at` — timestamp dengan timezone, default now

**Latihan 2: Insert Data**
Insert 10 produk fiktif ke table products, dengan variasi:
- 3 kategori berbeda
- Harga dari 5000 sampai 200000
- Stok ada yang 0, ada yang banyak
- 2 produk tidak aktif

**Latihan 3: Query dengan Kondisi**
Tulis query untuk:
1. Tampilkan semua produk aktif, urut termurah ke termahal
2. Tampilkan produk yang stoknya habis (0) tapi masih aktif
3. Tampilkan produk dengan harga antara 20000 dan 100000, dari kategori Kopi atau Teh
4. Cari produk yang namanya mengandung kata "Gula"
5. Tampilkan 5 produk termahal yang aktif
6. Tampilkan produk dari halaman 2 (pagination 5 per halaman)

**Latihan 4: Aggregation Report**
Tulis query untuk:
1. Total stok semua produk aktif
2. Rata-rata harga per kategori (tampilkan kategori, rata-rata, jumlah produk)
3. Kategori yang punya total nilai inventaris (price × stock) di atas 1 juta
4. Produk termahal, termurah, dan rata-rata harga semua produk aktif
