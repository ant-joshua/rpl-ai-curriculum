# Database Intro — Latihan

## Level 1: Dasar

### 1. Database vs Spreadsheet — Perbedaan Fundamental
**Pertanyaan:** Isi tabel perbandingan antara spreadsheet (Excel/Google Sheets) dengan database (PostgreSQL/MySQL):

| Aspek | Spreadsheet | Database |
|-------|------------|----------|
| Cara menyimpan data | ? | ? |
| Relasi antar data | ? | ? |
| Kapasitas data | ? | ? |
| Concurrent access | ? | ? |
| Keamanan & akses | ? | ? |
| Query & filter | ? | ? |

**Hint:** Spreadsheet = file, manual relation, limited rows, satu orang edit. Database = server, foreign keys, jutaan rows, banyak user concurrent, SQL query.

---

### 2. SQL — SELECT & WHERE
**Pertanyaan:** Diberikan tabel `products`:

| id | name | category | price | stock | created_at |
|----|------|----------|-------|-------|------------|
| 1 | Laptop Pro | Elektronik | 15000000 | 10 | 2024-01-15 |
| 2 | Mouse Wireless | Elektronik | 250000 | 50 | 2024-02-20 |
| 3 | Buku Python | Buku | 150000 | 100 | 2024-03-01 |
| 4 | Monitor 24" | Elektronik | 3500000 | 5 | 2024-01-10 |
| 5 | Keyboard Mechanical | Elektronik | 850000 | 0 | 2024-04-05 |

Tulis SQL query untuk:
1. Tampilkan semua produk beserta semua kolom
2. Tampilkan hanya nama dan harga produk dari kategori 'Elektronik'
3. Tampilkan produk dengan harga di atas 1.000.000
4. Tampilkan produk yang stoknya 0 (habis)
5. Tampilkan produk yang dibuat setelah 1 Februari 2024

**Hint:** `SELECT * FROM products`, `SELECT name, price FROM products WHERE category = 'Elektronik'`, `WHERE price > 1000000`, `WHERE stock = 0`, `WHERE created_at > '2024-02-01'`.

---

### 3. SQL — INSERT, UPDATE, DELETE
**Pertanyaan:** Gunakan tabel `products` yang sama dari soal sebelumnya. Tulis SQL untuk:

1. Tambah produk baru: name 'Tablet Android', category 'Elektronik', price 5000000, stock 15
2. Update harga 'Mouse Wireless' menjadi 200000
3. Tambah stok 'Monitor 24"' sebanyak 10 (stok sekarang jadi 15)
4. Hapus produk dengan stok 0 ('Keyboard Mechanical')
5. Hapus semua produk dari kategori 'Buku'

**Hint:** `INSERT INTO products (name, category, price, stock) VALUES (...)`, `UPDATE products SET price = 200000 WHERE name = 'Mouse Wireless'`, `UPDATE products SET stock = stock + 10 WHERE name = 'Monitor 24"'`, `DELETE FROM products WHERE stock = 0`, `DELETE FROM products WHERE category = 'Buku'`.

---

### 4. Data Types — Memilih Tipe Data yang Tepat
**Pertanyaan:** Tentukan tipe data SQL yang paling tepat untuk setiap field berikut:

| Field | Contoh Data | Tipe Data SQL |
|-------|------------|--------------|
| user_id | 1, 2, 1000 | ? |
| email | user@example.com | ? |
| age | 25, 30, 45 | ? |
| price | 15000.50 | ? |
| is_active | true, false | ? |
| bio | Teks panjang (500+ kata) | ? |
| created_at | 2024-01-15 10:30:00 | ? |
| avatar_url | https://example.com/avatar.jpg | ? |

**Hint:** INTEGER, VARCHAR(n), TEXT, BOOLEAN, DECIMAL(10,2), TIMESTAMP, TEXT. Pilih yang paling efisien.

---

### 5. Primary Key & Auto Increment
**Pertanyaan:** Buat table `categories` dengan kolom:
- `id` — primary key, auto increment
- `name` — varchar(100), NOT NULL, unique
- `slug` — varchar(100), NOT NULL, unique
- `description` — text, nullable
- `created_at` — timestamp, default current timestamp

Tulis SQL CREATE TABLE lengkap. Jelaskan kenapa `id` dipakai sebagai PRIMARY KEY dan kenapa `name` diberi constraint UNIQUE.

**Hint:**
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  ...
);
```
SERIAL = auto increment integer di PostgreSQL. PRIMARY KEY = unique + NOT NULL + indexed.

---

### 6. Aggregate Functions — COUNT, SUM, AVG, MAX, MIN
**Pertanyaan:** Gunakan tabel `products` dari soal 2. Tulis SQL untuk:

1. Hitung total jumlah produk
2. Hitung total stok semua produk
3. Hitung rata-rata harga produk
4. Tampilkan harga termahal dan termurah
5. Hitung jumlah produk per kategori
6. Tampilkan kategori dengan rata-rata harga di atas 2.000.000

**Hint:** `COUNT(*)`, `SUM(stock)`, `AVG(price)`, `MAX(price)`, `MIN(price)`. `GROUP BY category`. `HAVING AVG(price) > 2000000`.

---

### 7. ORDER BY & LIMIT — Sorting Data
**Pertanyaan:** Gunakan tabel `products`. Tulis SQL untuk:

1. Tampilkan 3 produk termahal
2. Tampilkan 2 produk dengan stok paling banyak
3. Tampilkan 5 produk terbaru (berdasarkan created_at)
4. Tampilkan produk diurutkan berdasarkan kategori ASC, kemudian harga DESC

**Hint:** `ORDER BY price DESC LIMIT 3`, `ORDER BY stock DESC LIMIT 2`, `ORDER BY created_at DESC LIMIT 5`, `ORDER BY category ASC, price DESC`.

---

### 8. LIKE & Pattern Matching
**Pertanyaan:** Gunakan tabel `products`. Tulis SQL untuk mencari:

1. Produk yang namanya mengandung kata 'Pro'
2. Produk yang namanya diawali dengan 'Mouse'
3. Produk yang namanya diakhiri dengan 'ic'
4. Produk dengan nama yang mengandung minimal 10 karakter

**Hint:** `WHERE name LIKE '%Pro%'`, `WHERE name LIKE 'Mouse%'`, `WHERE name LIKE '%ic'`, `WHERE LENGTH(name) >= 10`. % = wildcard untuk 0+ karakter.

---

## Level 2: Intermediate

### 9. Table Relationships — 1:1, 1:N, N:M
**Pertanyaan:** Identifikasi tipe relationship untuk setiap pasangan tabel berikut dan jelaskan cara implementasinya:

1. **users** dan **profiles** — setiap user punya SATU profil
2. **categories** dan **products** — satu kategori punya BANYAK produk, satu produk masuk SATU kategori
3. **students** dan **courses** — satu student bisa ambil BANYAK course, satu course bisa diambil BANYAK student
4. **orders** dan **order_items** — satu order punya BANYAK item

Untuk N:M (students-courses), buat tabel junction (pivot) dan tulis SQL CREATE TABLE untuk tabel tersebut dengan foreign keys yang tepat.

**Hint:** 1:1 → foreign key di salah satu tabel + UNIQUE. 1:N → foreign key di tabel "child". N:M → junction table dengan 2 foreign keys. Junction: `student_id` → students, `course_id` → courses.

---

### 10. SQL JOIN — INNER, LEFT, RIGHT, FULL
**Pertanyaan:** Diberikan dua tabel:

**Tabel `users`:**
| id | name | email |
|----|------|-------|
| 1 | Andi | andi@mail.com |
| 2 | Budi | budi@mail.com |
| 3 | Citra | citra@mail.com |
| 4 | Dewi | dewi@mail.com |

**Tabel `orders`:**
| id | user_id | product | total |
|----|---------|---------|-------|
| 1 | 1 | Laptop | 15000000 |
| 2 | 1 | Mouse | 250000 |
| 3 | 3 | Monitor | 3500000 |
| 4 | NULL | Keyboard | 850000 |

Tulis query dan hasil untuk:
1. **INNER JOIN** — users yang punya order
2. **LEFT JOIN** — semua users, termasuk yang belum order
3. **RIGHT JOIN** — semua order, termasuk yang tanpa user
4. **FULL OUTER JOIN** — semua users dan semua orders

Jelaskan perbedaan hasil keempat JOIN di atas.

**Hint:** INNER JOIN = hanya yang cocok. LEFT JOIN = semua dari kiri, NULL di kanan jika tidak cocok. RIGHT JOIN = kebalikan. FULL OUTER JOIN = semua dari dua sisi.

---

### 11. Foreign Key — Referential Integrity
**Pertanyaan:** Buat dua tabel dengan foreign key constraint:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

-- Buat tabel orders dengan foreign key ke users
```

Requirements:
- `orders` punya foreign key `user_id` REFERENCES `users(id)`
- ON DELETE CASCADE — kalau user dihapus, order-nya ikut terhapus
- ON UPDATE CASCADE — kalau user id berubah, order ikut berubah

Tulis SQL CREATE TABLE `orders` dan jelaskan:
1. Apa yang terjadi jika INSERT order dengan user_id yang tidak ada di users?
2. Apa yang terjadi jika DELETE user yang masih punya order (dengan CASCADE vs RESTRICT)?
3. Kenapa CASCADE berbahaya? Kapan lebih baik pakai SET NULL?

**Hint:**
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ...
);
```
CASCADE = hapus otomatis. RESTRICT = cegah hapus. SET NULL = set foreign key jadi NULL.

---

### 12. Normalization — 1NF, 2NF, 3NF
**Pertanyaan:** Normalisasi tabel berikut sampai 3NF:

**Tabel awal (Unnormalized):**
| order_id | customer_name | customer_phone | products | total |
|----------|--------------|---------------|----------|-------|
| 1 | Andi | 08123456789 | Laptop, Mouse | 15250000 |
| 2 | Budi | 08129876543 | Monitor, Keyboard, Mouse | 4600000 |
| 3 | Andi | 08123456789 | Keyboard | 850000 |

Masalah:
- Kolom `products` berisi multiple values (melanggar 1NF)
- Data customer berulang (Andi muncul 2x dengan no telp sama)
- Total bisa dihitung dari harga produk (redundan)

Tulis hasil normalisasi sampai 3NF berupa:
- 1NF: Pisahkan products ke baris terpisah
- 2NF: Pisahkan data customer ke tabel sendiri
- 3NF: Pastikan tidak ada transitive dependency

**Hint:** 1NF = atomic values (satu nilai per kolom per baris). 2NF = 1NF + tidak ada partial dependency. 3NF = 2NF + tidak ada transitive dependency. Akhirnya punya: `customers`, `orders`, `order_items`, `products`.

---

### 13. ERD — Entity Relationship Diagram
**Pertanyaan:** Buat ERD (dalam bentuk text/tabel) untuk sistem perpustakaan dengan entitas:

- **Member** — id, name, email, phone, join_date
- **Book** — id, title, author, isbn, published_year, category_id
- **Category** — id, name
- **Loan** — id, member_id, book_id, loan_date, due_date, return_date, status

Tentukan:
1. Semua entitas dengan atribut dan tipe data
2. Primary key untuk tiap entitas
3. Foreign key dan relationship antar entitas
4. Cardinality (1:1, 1:N, N:M) untuk tiap relationship

**Hint:** Member 1:N Loan, Book 1:N Loan, Category 1:N Book. Loan adalah tabel junction antara Member dan Book dengan atribut tambahan (loan_date, due_date, etc.).

---

### 14. Indexing — Performance Optimization
**Pertanyaan:** Diberikan tabel `transactions` dengan 10 juta baris. Query berikut lambat:

```sql
-- Query 1: Cari transaksi berdasarkan user_id
SELECT * FROM transactions WHERE user_id = 1234;

-- Query 2: Cari transaksi dalam range tanggal
SELECT * FROM transactions WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31';

-- Query 3: Cari transaksi dengan status dan diurutkan
SELECT * FROM transactions WHERE status = 'pending' ORDER BY created_at DESC;
```

1. Buat index yang tepat untuk masing-masing query
2. Jelaskan perbedaan Clustered vs Non-Clustered index
3. Kapan index malah memperlambat query? (trade-offs)
4. Apa itu Composite Index dan kapan menggunakannya?
5. Gunakan EXPLAIN untuk menganalisis query — tulis contoh sintaksnya

**Hint:** `CREATE INDEX idx_user_id ON transactions(user_id)`, `CREATE INDEX idx_created_at ON transactions(created_at)`. Composite: `CREATE INDEX idx_status_created ON transactions(status, created_at)`. Trade-off: INSERT/UPDATE/DELETE lebih lambat karena index harus di-update.

---

## Level 3: Challenge

### 15. Database Design — E-commerce Full Schema
**Skenario:** Desain database lengkap untuk platform e-commerce.

**Pertanyaan:** Buat schema database untuk sistem e-commerce dengan fitur:

**Entitas & Requirements:**

1. **Users** — id, name, email, password_hash, role (customer/admin), address, phone, created_at
2. **Categories** — id, name, slug, parent_id (self-referencing untuk sub-kategori)
3. **Products** — id, name, slug, description, price, stock, category_id, image_urls (JSON array), is_active, created_at
4. **Carts** — id, user_id, created_at
5. **Cart Items** — id, cart_id, product_id, quantity, price_at_add
6. **Orders** — id, user_id, order_date, status (pending/paid/shipped/delivered/cancelled), total_amount, shipping_address, payment_method
7. **Order Items** — id, order_id, product_id, quantity, price_at_purchase
8. **Payments** — id, order_id, payment_method, payment_status, amount, transaction_id, paid_at
9. **Reviews** — id, product_id, user_id, rating (1-5), comment, created_at

**Tugas:**
1. Tulis semua SQL CREATE TABLE statements dengan:
   - Primary keys, foreign keys, constraints
   - Indexes untuk kolom yang sering di-query
   - Default values dan NOT NULL yang sesuai
2. Gambarkan ERD (text-based)
3. Tulis SQL queries untuk:
   - Produk terlaris bulan ini
   - Total pendapatan per bulan tahun ini
   - User dengan total belanja tertinggi
   - Produk yang belum pernah di-review
   - Rata-rata rating per kategori

**Hint:** Gunakan tipe data yang tepat: DECIMAL(12,2) untuk uang, TEXT untuk deskripsi panjang, JSONB untuk image_urls. Index foreign key columns. Enum atau VARCHAR dengan CHECK untuk status.

---

### 16. Complex SQL Queries — Subquery, CTE, Window Functions
**Skenario:** Gunakan schema e-commerce dari soal 15.

**Pertanyaan:** Tulis SQL query menggunakan teknik berikut:

**1. Subquery:**
Tampilkan produk yang harganya di atas rata-rata harga semua produk.

**2. Subquery dengan EXISTS:**
Tampilkan kategori yang memiliki minimal 1 produk aktif.

**3. CTE (Common Table Expression):**
Tampilkan peringkat 5 pelanggan dengan total belanja terbanyak beserta jumlah order mereka.

**4. Window Function — RANK:**
Tampilkan peringkat produk terlaris di setiap kategori (ranking 1-3 per kategori).

**5. Window Function — Running Total:**
Tampilkan total pendapatan kumulatif per bulan.

**6. Recursive CTE:**
Tampilkan hierarki kategori (parent → child → grandchild) untuk kategori 'Elektronik'.

**Hint:**
```sql
-- Subquery
SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);

-- CTE
WITH top_customers AS (
  SELECT user_id, SUM(total_amount) as total_spent
  FROM orders WHERE status != 'cancelled'
  GROUP BY user_id ORDER BY total_spent DESC LIMIT 5
) SELECT ...;

-- Window Function
SELECT *, RANK() OVER (PARTITION BY category_id ORDER BY total_sold DESC) as rank
FROM product_sales;
```

---

### 17. Migration Script — Schema Versioning
**Skenario:** Aplikasi sudah production. Kamu perlu mengubah schema database tanpa downtime.

**Pertanyaan:** Buat migration script untuk perubahan berikut:

**Migrasi 1 — Add kolom:**
Tambah kolom `phone` (VARCHAR(20)) dan `avatar_url` (TEXT) ke tabel `users`.

**Migrasi 2 — Add table:**
Buat tabel `wishlists` (id, user_id, product_id, created_at) dengan foreign keys.

**Migrasi 3 — Add index:**
Tambah composite index di `orders(user_id, status)`.

**Migrasi 4 — Rename kolom:**
Ubah kolom `orders.total_amount` menjadi `orders.grand_total`.

**Migrasi 5 — Change data type:**
Ubah `products.price` dari INTEGER menjadi DECIMAL(12,2).

Tiap migrasi harus:
1. TULIS SQL untuk perubahan (ALTER TABLE, CREATE INDEX, dll.)
2. TULIS SQL untuk ROLLBACK (supaya bisa undo)
3. Jelaskan apakah migrasi ini safe dilakukan di production tanpa downtime

**Hint:** Add column = safe (nilai baru NULL untuk existing rows). Add table = safe. Add index = bisa lock table di production (gunakan CONCURRENTLY di PostgreSQL). Rename column = butuh koordinasi karena kode yang masih pake nama lama. Change data type = bisa rewrite entire table. Always test di staging dulu.

---

### 18. Query Optimization — Slow Query Analysis
**Skenario:** Tim melaporkan query berikut sangat lambat di production:

```sql
-- Query A: Dashboard report
SELECT 
  u.name,
  u.email,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as total_spent,
  MAX(o.order_date) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
  AND u.role = 'customer'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 50;

-- Query B: Product search (full-text)
SELECT * FROM products 
WHERE name ILIKE '%laptop%' OR description ILIKE '%laptop%'
ORDER BY created_at DESC;

-- Query C: Nested aggregation
SELECT 
  c.name as category_name,
  AVG(p.price) as avg_price,
  (SELECT COUNT(*) FROM order_items oi 
   JOIN orders o ON oi.order_id = o.id 
   WHERE oi.product_id IN (SELECT id FROM products WHERE category_id = c.id)
   AND o.status = 'delivered') as total_sold
FROM categories c
JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name;
```

**Pertanyaan:** Untuk setiap query:

1. Identifikasi masalah performa (full table scan?, missing index?, N+1?, dll.)
2. Usulkan perbaikan (index, rewrite query, materialized view, dll.)
3. Tulis query hasil optimasi
4. Jelaskan cara mengukur dampak optimasi (EXPLAIN ANALYZE, timing)

**Hint:** Query A: butuh index di `users(role, created_at)`, `orders(user_id)`. Query B: ILIKE dengan wildcard diawal tidak bisa pake index B-tree — perlu trigram index (pg_trgm) atau full-text search (tsvector). Query C: correlated subquery dieksekusi per baris — rewrite pakai JOIN + GROUP BY atau window function. Gunakan `EXPLAIN (ANALYZE, BUFFERS)` untuk lihat execution plan.
