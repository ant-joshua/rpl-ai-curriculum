# LKS Web Technology — Competition Preparation — Latihan

## Level 1: Dasar

### 1. LKS Mapping — Standar Kompetensi
**Pertanyaan:** Petakan standar kompetensi LKS Web Technology terhadap kurikulum yang sudah dipelajari:

```markdown
# === LENGKAPI: Mapping kompetensi LKS ===

| Area Kompetensi | Bobot | Modul Terkait | Status Saya (✅/⚠️/❌) |
|----------------|-------|---------------|----------------------|
| HTML5 & CSS3   | 15%   | Modul 4, 35   | ? |
| JavaScript (Client-side) | 15% | Modul 1 | ? |
| Backend Development (PHP/Node) | 20% | ? | ? |
| Database (MySQL/PostgreSQL) | 15% | ? | ? |
| REST API | 10% | ? | ? |
| Security | 10% | ? | ? |
| Deployment | 10% | ? | ? |
| UI/UX & Responsive | 5% | ? | ? |

# === LENGKAPI: Gap analysis ===
# Identifikasi 3 area terlemah kamu dan buat rencana remedial:
# 1. Area lemah: ?
#    Rencana belajar: ?
#    Target waktu: ?
# 2. Area lemah: ?
#    Rencana belajar: ?
#    Target waktu: ?
# 3. Area lemah: ?
#    Rencana belajar: ?
#    Target waktu: ?
```

1. Lengkapi mapping tabel dengan modul terkait
2. Evaluasi status kamu (✅/⚠️/❌) untuk tiap area
3. Buat rencana belajar 2 minggu untuk area yang masih lemah

**Hint:** LKS Web Technology cakupan: HTML/CSS (layout, responsive, CSS3), JavaScript (DOM, ES6+, async), Backend (PHP/Node.js, session, file upload), Database (MySQL, query, JOIN, indexing), REST API (JSON, authentication), Security (SQL injection, XSS, CSRF), Deployment (domain, hosting, FTP/SSH). Bobot bisa beda tiap tahun — cek silabus LKS terbaru.

---

### 2. Time Management — Strategi Lomba
**Pertanyaan:** LKS Web Technology biasanya 6 jam. Buat strategi time management:

```markdown
# === LENGKAPI: Time management plan ===

Total waktu: 6 jam (360 menit)

## Fase 1: Planning (30 menit)
# === LENGKAPI: Checklist tahap planning ===
# 1. Baca semua soal dengan teliti
# 2. 
# 3. 

## Fase 2: Database (45 menit)
# === LENGKAPI: Buat target penyelesaian ===
# 1. Design ERD
# 2. 
# 3. 

## Fase 3: Backend (120 menit)
# === LENGKAPI: Prioritaskan fitur ===

## Fase 4: Frontend (120 menit)
# === LENGKAPI: ===

## Fase 5: Integration & Testing (30 menit)
# === LENGKAPI: ===

## Fase 6: Final check (15 menit)
# === LENGKAPI: ===
```

```
# === LENGKAPI: Scoring priority matrix ===
# Fitur A: Login & Auth (bobot 15) — Priority: ?
# Fitur B: CRUD Produk (bobot 20) — Priority: ?
# Fitur C: Responsive Design (bobot 10) — Priority: ?
# Fitur D: Search & Filter (bobot 8) — Priority: ?
# Fitur E: File Upload (bobot 5) — Priority: ?
# Fitur F: API Documentation (bobot 2) — Priority: ?
```

1. Buat time management per fase dengan estimasi waktu realistis
2. Tentukan prioritas fitur berdasarkan bobot penilaian
3. Tulis strategi kalau ketinggalan waktu (what to cut)

**Hint:** Prinsip: kerjakan fitur bobot tinggi duluan. Prioritaskan: fitur yang berfungsi penuh > fitur setengah jadi. Cut list: dokumentasi, fitur minor, polish. Kalau stuck > 15 menit di satu fitur → skip dulu, lanjut fitur lain. Save 30 menit terakhir untuk final check dan debugging.

---

### 3. Common Pitfalls — Yang Sering Mengurangi Skor
**Pertanyaan:** Identifikasi dan perbaiki common pitfalls:

```typescript
// === LENGKAPI: Perbaiki setiap masalah ===

// PITFALL 1: SQL Injection
// Problem:
const username = req.body.username;
const query = `SELECT * FROM users WHERE username = '${username}'`;

// Fix:
// === LENGKAPI: Gunakan parameterized query ===

// PITFALL 2: XSS
// Problem:
res.send(`<h1>Welcome, ${req.query.name}</h1>`);

// Fix:
// === LENGKAPI: Sanitize output ===

// PITFALL 3: Hardcoded credentials
// Problem:
const dbPassword = 'admin123';

// Fix:
// === LENGKAPI: Gunakan environment variables ===

// PITFALL 4: No input validation
// Problem:
app.post('/api/users', (req, res) => {
  db.query('INSERT INTO users SET ?', req.body);  // Langsung insert tanpa validasi
});

// Fix:
// === LENGKAPI: Validasi input ===

// PITFALL 5: Tidak ada error handling
// Problem:
app.get('/api/users/:id', async (req, res) => {
  const user = await db.query(`SELECT * FROM users WHERE id = ?`, [req.params.id]);
  res.json(user[0]);
});

// Fix:
// === LENGKAPI: Tambah try-catch dan 404 handling ===
```

```
# === LENGKAPI: List 5 pitfall lainnya ===
# 1. ?
# 2. ?
# 3. ?
# 4. ?
# 5. ?
```

1. Perbaiki semua kode bermasalah
2. Tambah 5 common pitfalls lain yang sering muncul di LKS
3. Buat checklist final yang dicek sebelum submit

**Hint:** Pitfall lain: (1) Tidak responsive — layout broken di mobile, (2) Gambar terlalu besar — loading lambat, (3) Tidak ada session management — user bisa akses halaman admin tanpa login, (4) File upload tanpa validasi tipe — bisa upload .php/.exe, (5) Query N+1 — terlalu banyak query database. Final check: cek di browser (bukan cuma coding), test semua link, test di mobile viewport.

---

## Level 2: Intermediate

### 4. Mock Project — Aplikasi Manajemen Inventaris
**Pertanyaan:** Buat aplikasi manajemen inventaris untuk LKS mock test:

```sql
# === LENGKAPI: Database schema ===
# Buat database untuk sistem manajemen inventaris
# Entities: categories, products, suppliers, stock_mutations, users

CREATE DATABASE inventory_db;
USE inventory_db;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# === LENGKAPI: Buat tabel products ===
# Fields: id, category_id (FK), name, sku (UNIQUE), price, stock, min_stock, supplier_id (FK), image, created_at, updated_at

# === LENGKAPI: Buat tabel stock_mutations ===
# Fields: id, product_id (FK), type (IN/OUT), quantity, notes, user_id (FK), created_at

# === LENGKAPI: Buat tabel suppliers ===
# Fields: id, name, contact_person, phone, email, address, created_at
```

```html
<!-- === LENGKAPI: Dashboard page === -->
<!-- Fitur yang harus ada: -->
<!-- 1. Summary cards: total produk, total kategori, stok menipis, total supplier -->
<!-- 2. Table produk terbaru (5 item) -->
<!-- 3. Alert: produk dengan stok di bawah min_stock -->
<!-- 4. Chart: stok per kategori (bootstrap chart atau canvas) -->
```

1. Buat database schema lengkap dengan foreign keys dan indexes
2. Implementasi halaman dashboard dengan data summary
3. Buat halaman CRUD produk (list, add, edit, delete, search)
4. Implementasi fitur stock mutation (in/out) dengan history

**Hint:** Stock alert: `SELECT * FROM products WHERE stock <= min_stock`. Stock mutation: setiap transaksi update stock di tabel products. Validasi: stok tidak boleh negatif. Index: `INDEX idx_product_category (category_id)`, `INDEX idx_product_sku (sku)`. Pagination: `LIMIT 10 OFFSET ?`. Search: `WHERE name LIKE '%?%' OR sku LIKE '%?%'`.

---

### 5. Mock Project — Sistem Peminjaman Buku Perpustakaan
**Pertanyaan:** Buat sistem peminjaman buku perpustakaan:

```sql
# === LENGKAPI: Database library system ===
# Entities: books, members, loans

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  publisher VARCHAR(100),
  year INT,
  stock INT DEFAULT 1,
  available_stock INT DEFAULT 1,
  shelf_location VARCHAR(20)
);

# === LENGKAPI: Buat tabel members ===
# Fields: id, member_id (UNIQUE), name, phone, email, address, join_date, status (active/suspended)

# === LENGKAPI: Buat tabel loans ===
# Fields: id, book_id (FK), member_id (FK), loan_date, due_date, return_date, status (borrowed/returned/late), fine_amount
```

```php
<!-- === LENGKAPI: Proses peminjaman === -->
<?php
// === LENGKAPI: Validasi peminjaman ===
// 1. Cek member aktif (tidak suspended)
// 2. Cek buku tersedia (available_stock > 0)
// 3. Cek member tidak punya buku telat (> 3 buku atau ada yang overdue)
// 4. Kurangi available_stock
// 5. Insert loan record
// 6. Set due_date: loan_date + 7 hari
// 7. Kalau ada error: rollback transaction
?>
```

1. Lengkapi database schema
2. Implementasi proses peminjaman dengan validasi lengkap
3. Implementasi pengembalian dengan kalkulasi denda
4. Buat halaman laporan: buku paling sering dipinjam, member aktif, denda terkumpul

**Hint:** Fine calculation: `DATEDIFF(CURDATE(), due_date) * 1000` (Rp 1000/hari keterlambatan). Transaction: `START TRANSACTION` → `COMMIT` / `ROLLBACK`. Report: `SELECT b.title, COUNT(l.id) as loan_count FROM loans l JOIN books b ON l.book_id = b.id GROUP BY b.id ORDER BY loan_count DESC LIMIT 10`. Status check: member bisa suspended kalau > 3 kali telat.

---

### 6. Mock Project — Aplikasi Kuesioner Online
**Pertanyaan:** Buat aplikasi kuesioner online:

```sql
# === LENGKAPI: Database survey system ===
CREATE TABLE surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status ENUM('draft', 'active', 'closed') DEFAULT 'draft',
  start_date DATETIME,
  end_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# === LENGKAPI: Buat tabel questions ===
# Fields: id, survey_id (FK), type (text/radio/checkbox/rating), question_text, options (JSON untuk multiple choice), order_number, required (boolean)

# === LENGKAPI: Buat tabel responses ===
# Fields: id, survey_id (FK), respondent_id (FK), answer (JSON), submitted_at

# === LENGKAPI: Buat tabel respondents ===
# Fields: id, email (UNIQUE), name, phone
```

```javascript
// === LENGKAPI: Dynamic form builder ===
// Fitur: generate form dinamis berdasarkan tipe question
function renderQuestion(question) {
  // === LENGKAPI: ===
  // 1. Render input sesuai tipe (text/radio/checkbox/rating)
  // 2. Kalau required: tambah validasi
  // 3. Kalau radio: render radio buttons dari options
  // 4. Kalau rating: render 1-5 stars
  // 5. Return HTML element
}
```

1. Lengkapi database schema
2. Buat dynamic form renderer berdasarkan tipe question
3. Implementasi survey creation (admin) dan survey submission (respondent)
4. Tampilkan hasil survey dalam bentuk chart (per question)

**Hint:** Options JSON: `["Sangat Puas", "Puas", "Cukup", "Kurang", "Sangat Kurang"]`. Rating: 1-5 stars menggunakan CSS atau library. Chart: bisa pake Chart.js CDN. Validation: semua required question harus diisi sebelum submit. Export: tambah button export ke CSV. Survey status: 'active' hanya dalam range start_date - end_date.

---

### 7. Mock Project — Aplikasi Pengaduan Masyarakat
**Pertanyaan:** Buat aplikasi pengaduan masyarakat (public complaint system):

```sql
# === LENGKAPI: Database complaint system ===
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50)  # FontAwesome icon class
);

INSERT INTO categories (name, icon) VALUES
  ('Infrastruktur', 'fa-road'),
  ('Kebersihan', 'fa-trash'),
  ('Keamanan', 'fa-shield');
# === LENGKAPI: Tambah 3 kategori lain ===

CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(20) UNIQUE NOT NULL,  # Format: CMP-2024-0001
  category_id INT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  image VARCHAR(255),
  status ENUM('reported', 'verified', 'processing', 'resolved', 'rejected') DEFAULT 'reported',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  # === LENGKAPI: Tambah field yang diperlukan ===
);
```

```php
<?php
// === LENGKAPI: File upload untuk bukti foto ===
// Validasi:
// 1. Tipe file: hanya JPG, PNG, WEBP
// 2. Ukuran: maks 5MB
// 3. Rename: ticket_id + timestamp
// 4. Simpan di folder uploads/complaints/
// 5. Simpan path ke database
?>
```

1. Lengkapi database dengan fitur tracking status
2. Implementasi form pengaduan dengan upload gambar + validasi
3. Implementasi tracking page: input ticket_id → lihat status
4. Buat halaman admin: list semua pengaduan, update status, beri tanggapan

**Hint:** Ticket ID: `CMP-` + tahun + auto-increment `CMP-2024-0001`. Status flow: reported → verified → processing → resolved. Bisa juga rejected dari reported/verified. Image validation: `$_FILES['image']['type']`, `$_FILES['image']['size']`. Tracking: input field ticket_id → query ke database → tampilkan status dengan timeline visual (CSS steps). Admin auth: login session sederhana.

---

### 8. Submission Checklist — Final Check Sebelum Submit
**Pertanyaan:** Buat checklist final yang harus dicek sebelum submit lomba:

```markdown
# === LENGKAPI: Final submission checklist ===

## Functionality (Prioritas 1)
- [ ] Login/logout berfungsi dengan benar
- [ ] Session berfungsi (halaman terproteksi)
- [ ] Semua CRUD berfungsi (create, read, update, delete)
- [ ] 
- [ ] 

## Security (Prioritas 2)
- [ ] SQL injection: semua query pake parameterized
- [ ] XSS: semua output di-escape
- [ ] 
- [ ] 

## Frontend (Prioritas 3)
- [ ] Layout responsive (cek di mobile viewport)
- [ ] 
- [ ] 

## Code Quality (Prioritas 4)
- [ ] Tidak ada hardcoded credentials
- [ ] 
- [ ] 

## Deployment (Kalau ada)
- [ ] Konfigurasi database benar
- [ ] 
- [ ] 
```

```bash
# === LENGKAPI: Script final check ===
#!/bin/bash
# Script untuk melakukan final check sebelum submit

echo "=== Final Check ==="

# 1. Check hardcoded credentials
# === LENGKAPI: grep untuk password/token hardcoded ===

# 2. Check error log
# === LENGKAPI: cek apakah ada error/warning di log ===

# 3. Check semua link
# === LENGKAPI: cek broken links ===

# 4. Check file permissions
# === LENGKAPI: pastikan file sensitif tidak readable public ===

# 5. Check database connection
# === LENGKAPI: pastikan koneksi database work ===

echo "=== Final Check Complete ==="
```

1. Lengkapi checklist dengan minimal 20 item
2. Buat script final check otomatis
3. Tulis prosedur kalau ada yang gagal di final check

**Hint:** Priority matrix: Functionality > Security > Frontend > Code Quality. Jangan buang waktu untuk perfect code — pastikan fitur jalan dulu. Kalau waktu mepet: cut semua non-essensial (animasi, efek, dokumentasi). Yang paling sering gagal: (1) koneksi database, (2) path file upload, (3) session tidak jalan, (4) relative URL broken setelah deploy. Final check harus selesai dalam 15 menit.
