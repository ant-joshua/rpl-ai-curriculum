---
title: "Latihan Modul 11: Prompt Challenge Coding Dasar"
exercise_type: practice
---

# 🎯 Latihan Modul 11: Prompt Challenge Coding Dasar

Latihan praktis untuk pemula coding yang ingin memanfaatkan AI sebagai pair programmer. Dari memahami kode sampai membangun CRUD app pertama!

> **Waktu total: ±120 menit** | **Total latihan: 7 aktivitas**
> **Catatan:** Gunakan browser untuk coding online (CodePen, JSFiddle, Replit) atau editor lokal (VS Code).

---

## 🔍 Latihan 1: Pahami 5 Snippet Kode dengan AI
**⭐ Kesulitan: Mudah** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar memahami kode orang lain dengan bantuan AI menjelaskan baris per baris.

### Snippet 1 — JavaScript
```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = doubled.filter(n => n % 2 === 0);
console.log(evens); // Output: ???
```

**Prompt:**
```
Jelaskan kode JavaScript ini baris per baris. Untuk setiap baris:
1. Apa yang dilakukan
2. Variabel apa yang terpengaruh
3. Output pada baris tersebut

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = doubled.filter(n => n % 2 === 0);
console.log(evens);

Setelah penjelasan, jawab: apa output terakhirnya?
```

### Snippet 2 — PHP
```php
<?php
function hitungFaktorial($n) {
    if ($n <= 1) return 1;
    return $n * hitungFaktorial($n - 1);
}
echo hitungFaktorial(5);
?>
```

**Prompt:**
```
Jelaskan kode PHP ini. Fokuskan pada:
1. Apa itu recursive function?
2. Trace execution dari hitungFaktorial(5) — langkah demi langkah
3. Apa output akhirnya?
4. Kapan function berhenti rekursi?

<?php
function hitungFaktorial($n) {
    if ($n <= 1) return 1;
    return $n * hitungFaktorial($n - 1);
}
echo hitungFaktorial(5);
?>
```

### Snippet 3 — HTML + CSS
```html
<div class="container">
  <h1 class="title">Hello World</h1>
  <p class="subtitle">Belajar CSS</p>
</div>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.title { color: white; font-size: 3rem; }
.subtitle { color: rgba(255,255,255,0.8); }
</style>
```

**Prompt:**
```
Jelaskan kode HTML/CSS ini. Jawab:
1. Apa yang dilakukan display: flex dengan kombinasi
   flex-direction, align-items, justify-content?
2. Apa visual effect dari linear-gradient?
3. min-height: 100vh artinya apa?
4. Bagaimana cara mengubah background jadi warna solid?
5. Apa yang terjadi jika saya hapus flex-direction: column?
```

### Snippet 4 — SQL
```sql
SELECT
    d.nama_departemen,
    COUNT(e.id) as jumlah_karyawan,
    AVG(e.gaji) as rata_rata_gaji
FROM karyawan e
JOIN departemen d ON e.departemen_id = d.id
GROUP BY d.nama_departemen
HAVING COUNT(e.id) > 5
ORDER BY rata_rata_gaji DESC;
```

**Prompt:**
```
Jelaskan query SQL ini secara detail:
1. Apa yang dilakukan setiap clause (SELECT, FROM, JOIN, 
   GROUP BY, HAVING, ORDER BY)?
2. Apa bedanya WHERE dan HAVING?
3. Membuat ilustrasi tabel input dan output
4. Bisakah saya tambahkan filter tahun masuk? Bagaimana caranya?
```

### Snippet 5 — Python
```python
students = [
    {"nama": "Andi", "nilai": 85},
    {"nama": "Budi", "nilai": 72},
    {"nama": "Citra", "nilai": 90},
    {"nama": "Dina", "nilai": 65},
    {"nama": "Eko", "nilai": 78}
]

lulus = [s for s in students if s["nilai"] >= 75]
rata_rata = sum(s["nilai"] for s in students) / len(students)

print(f"Lulus: {len(lulus)} dari {len(students)}")
print(f"Rata-rata: {rata_rata:.1f}")
```

**Prompt:**
```
Jelaskan kode Python ini. Fokus pada:
1. Apa itu list comprehension? ([s for s in students if ...])
2. Apa itu generator expression? (sum(s["nilai"] for s in ...))
3. Apa arti :.1f di f-string?
4. Trace output dari kode ini
5. Buat versi yang sama tapi gunakan loop biasa (bukan comprehension)
```

### ✅ Cek Paham
- [ ] Bisa menjelaskan setiap baris kode untuk 5 snippet
- [ ] Bisa memprediksi output sebelum mengecek dengan AI
- [ ] Menyimpan penjelasan yang paling membantu pemahaman

---

## 🐛 Latihan 2: Debug 5 Error Berbeda
**⭐⭐ Kesulitan: Sedang** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar mengidentifikasi dan memperbaiki error kode menggunakan AI.

### Error #1 — JavaScript TypeError
```javascript
const user = null;
console.log(user.name);
// Error: Cannot read properties of null
```

**Prompt:**
```
Kode saya error "Cannot read properties of null (reading 'name')".
Kenapa ini terjadi dan bagaimana cara fix-nya?

const user = null;
console.log(user.name);

Juga berikan 3 cara berbeda untuk handle null safely
di JavaScript modern.
```

### Error #2 — PHP Undefined Index
```php
<?php
$data = ["nama" => "Budi", "umur" => 20];
echo $data["alamat"];
// Warning: Undefined array key "alamat"
?>
```

**Prompt:**
```
PHP saya muncul warning "Undefined array key". Kode saya:

<?php
$data = ["nama" => "Budi", "umur" => 20];
echo $data["alamat"];
?>

Bagaimana cara:
1. Cek apakah key ada sebelum diakses?
2. Berikan default value jika key tidak ada?
3. Gunakan null coalescing operator?
Tunjukkan semua cara dengan kode.
```

### Error #3 — CSS Layout Broken
```css
.parent {
  width: 100%;
  height: 300px;
}
.child {
  width: 200px;
  height: 100px;
  float: left;
  background: blue;
}
/* Parent tidak menampung child (height collapse) */
```

**Prompt:**
```
CSS saya ada masalah height collapse. Parent element tidak
menampung child yang di-float. 

.parent { width: 100%; height: 300px; }
.child { width: 200px; height: 100px; float: left; }

Berikan 4 cara untuk fix masalah float collapse:
1. Overflow method
2. Clearfix hack
3. Display: flow-root
4. Flexbox modern

Jelaskan kelebihan dan kekurangan masing-masing.
```

### Error #4 — Python IndentationError
```python
def hitung_total(items):
total = 0
for item in items:
total += item["harga"] * item["qty"]
return total
```

**Prompt:**
```
Python saya error IndentationError. Saya pakai VS Code.
Berikut kodenya:

def hitung_total(items):
total = 0
for item in items:
total += item["harga"] * item["qty"]
return total

Jelaskan:
1. Kenapa Python sangat strict soal indentation?
2. Perbedaan space vs tab?
3. Best practice indentation di Python?
4. Bagaimana konfigurasi VS Code agar selalu pakai space?
```

### Error #5 — JavaScript Async/Await
```javascript
async function getData() {
  const response = await fetch('https://api.example.com/data');
  const data = response.json();
  console.log(data);
}
getData();
```

**Prompt:**
```
Fetch data saya selalu return Promise, bukan data asli.
Kode saya:

async function getData() {
  const response = await fetch('https://api.example.com/data');
  const data = response.json();
  console.log(data);
}

Output: Promise {<pending>}

Apa yang salah? Kenapa response.json() juga perlu await?
Buatkan versi yang benar dengan error handling.
```

### ✅ Cek Paham
- [ ] Bisa menjelaskan penyebab setiap error
- [ ] Bisa memberikan minimal 2 solusi berbeda per error
- [ ] Bisa mencegah error serupa di kode masa depan

---

## ⚙️ Latihan 3: Buat 5 Function Sederhana dari Deskripsi
**⭐⭐ Kesulitan: Sedang** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar menerjemahkan deskripsi bahasa manusia menjadi kode fungsi.

### Function #1 — Kalkulator Diskon
```
Buatkan function JavaScript:
- Nama: hitungDiskon(harga, persenDiskon)
- Input: harga (number), persenDiskon (number, 0-100)
- Output: harga setelah diskon (number)
- Handle error: harga tidak boleh negatif, diskon 0-100

Setelah dibuat, saya mau pakai:
hitungDiskon(100000, 20) → harusnya 80000
hitungDiskon(50000, 0) → harusnya 50000
hitungDiskon(-100, 10) → harusnya throw error
```

### Function #2 — Validasi Email
```
Buatkan function JavaScript:
- Nama: validasiEmail(email)
- Input: string email
- Output: object { valid: boolean, pesan: string }
- Validasi: format email benar, ada @, ada domain

Test cases:
validasiEmail("budi@gmail.com") → { valid: true, ... }
validasiEmail("budi") → { valid: false, pesan: "..." }
validasiEmail("") → { valid: false, pesan: "..." }
```

### Function #3 — Format Rupiah
```
Buatkan function JavaScript:
- Nama: formatRupiah(angka)
- Input: number (misal 1500000)
- Output: string format Indonesia (Rp 1.500.000)

Test cases:
formatRupiah(0) → "Rp 0"
formatRupiah(50000) → "Rp 50.000"
formatRupiah(1500000) → "Rp 1.500.000"
formatRupiah(1234567890) → "Rp 1.234.567.890"

Tunjukkan 2 cara berbeda (manual + toLocaleString)
```

### Function #4 — Sorting Siswa
```
Buatkan function JavaScript:
- Nama: urutkanSiswa(siswa, kunci, arah)
- Input: array objek siswa, kunci field, arah ('asc'/'desc')
- Output: array terurut

Data sample:
const siswa = [
  { nama: "Andi", nilai: 85 },
  { nama: "Budi", nilai: 72 },
  { nama: "Citra", nilai: 90 }
]

Test:
urutkanSiswa(siswa, "nilai", "desc") → Citra, Andi, Budi
urutkanSiswa(siswa, "nama", "asc") → Andi, Budi, Citra
```

### Function #5 — Generate Password
```
Buatkan function JavaScript:
- Nama: generatePassword(panjang, options)
- Input: panjang (number), options (object)
  options = { uppercase: true, lowercase: true, 
              numbers: true, symbols: true }
- Output: string password random

Contoh:
generatePassword(12, { uppercase: true, numbers: true })
→ "Xk9mP2nR4wQ7" (random)

Include penjelasan cara kerja Math.random() dan karakter pool.
```

### ✅ Cek Paham
- [ ] Semua 5 function bisa dijalankan tanpa error
- [ ] Setiap function memiliki minimal 3 test case
- [ ] Bisa menjelaskan cara kerja function kepada orang lain

---

## 📦 Latihan 4: Build CRUD App Pertama (Todo List)
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 20 menit**

### Tujuan
Membangun aplikasi Todo List pertama yang bisa Create, Read, Update, dan Delete data.

### Prompt Utama — Bangun dari Nol
```
Saya pemula ingin membuat Todo List app pertama saya dengan
HTML, CSS, dan JavaScript (vanilla, tanpa framework).

Fitur yang harus ada:
1. Tambah todo baru (input + tombol)
2. Tandai todo selesai (klik checkbox)
3. Hapus todo (tombol hapus)
4. Edit todo (klik teks untuk edit)
5. Filter: Semua / Aktif / Selesai
6. Counter: "X dari Y todo selesai"

Buat dalam 1 file HTML saja (inline CSS dan JS).

Instruksi:
- Tulis kode lengkap yang bisa langsung dijalankan di browser
- Berikan komentar di bagian penting
- Gunakan desain modern dan clean
- Responsive untuk mobile
```

### Prompt Tambahan — Tingkatkan Fitur
```
Setelah todo list basic selesai, tambahkan fitur berikut:

1. localStorage: Data todo tersimpan di browser
   (tidak hilang saat refresh halaman)
2. Drag and drop: Bisa urutkan todo dengan drag
3. Dark mode toggle: Tombol untuk switch dark/light mode
4. Keyboard shortcut: Enter untuk tambah, Escape untuk batal

Tunjukkan kode tambahannya saja (bukan ulang dari awal).
Jelaskan kode baru yang ditambahkan.
```

### Prompt — Export ke JSON
```
Tambahkan tombol "Export" yang bisa download semua todo
dalam format JSON. Sertakan:
- Judul file: todo-list-[tanggal].json
- Data: array of todo objects
- Metadata: export date, total items
```

### Contoh Output yang Diharapkan
```
✅ Aplikasi Todo List yang berjalan di browser
✅ Bisa tambah, edit, hapus, dan tandai selesai todo
✅ Data tersimpan di localStorage
✅ Filter berfungsi dengan benar
✅ Tampilan responsive dan menarik
```

### Checklist Build
- [ ] Buat file `todo.html`
- [ ] Implement CRUD dasar
- [ ] Tambah styling yang menarik
- [ ] Implement localStorage
- [ ] Test semua fitur
- [ ] Coba di mobile browser

### ✅ Cek Paham
- [ ] Todo list berjalan tanpa error di browser
- [ ] Semua operasi CRUD berfungsi
- [ ] Data bertahan saat browser di-refresh
- [ ] Bisa menjelaskan flow data dari input sampai tampilan

---

## 🔨 Latihan 5: Refactor Kode Jelek Jadi Bersih
**⭐⭐ Kesulitan: Mudah** | **⏱️ Waktu: 10 menit**

### Tujuan
Belajar meningkatkan kualitas kode dengan teknik refactoring.

### Kode "Jelek" yang Perlu Di-refactor
```javascript
// Kode ini BERFUNGSI tapi jelek. Refactor jadi lebih bersih!

function p(a, b, c) {
  var x = "";
  if (c == "s") {
    for (var i = 0; i < b.length; i++) {
      if (b[i][2] >= a) {
        x = x + b[i][0] + " (" + b[i][1] + " tahun) - Nilai: " + b[i][2] + "\n";
      }
    }
  } else if (c == "n") {
    for (var i = 0; i < b.length; i++) {
      if (b[i][2] < a) {
        x = x + b[i][0] + " (" + b[i][1] + " tahun) - Nilai: " + b[i][2] + "\n";
      }
    }
  }
  return x;
}

// Contoh pakai:
var data = [["Andi", 20, 85], ["Budi", 21, 72], ["Citra", 19, 90]];
console.log(p(75, data, "s"));
```

### Prompt Refactoring
```
Berikut kode JavaScript yang berfungsi tapi jelek. Refactor
menjadi kode yang bersih dan profesional.

Aturan refactoring:
1. Nama variabel dan function harus deskriptif
2. Gunakan const/let, bukan var
3. Gunakan modern JS features (template literals, arrow fn)
4. Pisahkan logika yang berulang
5. Tambahkan error handling
6. Tambahkan komentar yang menjelaskan TUJUAN

Kode asli:
[tempel kode di atas]

Tunjukkan:
- Kode sebelum vs sesudah refactoring
- Penjelasan setiap perubahan
- Kenapa perubahan ini lebih baik
```

### Kode "Jelek" #2 — Callback Hell
```javascript
function getData(userId, callback) {
  setTimeout(function() {
    var user = {id: userId, name: "Andi"};
    setTimeout(function() {
      var posts = [{id: 1, title: "Hello"}];
      setTimeout(function() {
        var comments = [{id: 1, text: "Nice!"}];
        callback(user, posts, comments);
      }, 500);
    }, 500);
  }, 500);
}
```

**Prompt:**
```
Ubah kode callback hell di atas menjadi modern JavaScript
menggunakan:
1. Promise
2. async/await
3. Error handling dengan try-catch
4. Tambahkan log untuk setiap step
```

### ✅ Cek Paham
- [ ] Kode setelah refactor lebih mudah dibaca
- [ ] Nama variabel dan function lebih deskriptif
- [ ] Menggunakan fitur JavaScript modern

---

## 🔎 Latihan 6: Code Review — Minta AI Review Kode Kamu
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar melakukan code review profesional dengan bantuan AI.

### Prompt Code Review
```
Lakukan code review untuk kode saya. Evaluasi aspek:

1. CORRECTNESS — Apakah kode berfungsi dengan benar?
2. READABILITY — Apakah kode mudah dibaca dan dipahami?
3. PERFORMANCE — Ada bottleneck performa?
4. SECURITY — Ada potensi vulnerability?
5. BEST PRACTICES — Sudah sesuai standar industri?
6. MAINTAINABILITY — Mudah diubah/ditambah fitur?

Untuk setiap issue, berikan:
- Severity: 🔴 Critical / 🟡 Warning / 🔵 Info
- Lokasi: baris ke-berapa
- Penjelasan masalah
- Saran perbaikan (dengan kode)
- Contoh kode yang lebih baik

Kode saya:
```

### Buat Kode untuk Di-review
Buat kode sederhana (misal: function validasi form login) lalu minta AI review:

```javascript
function login(username, password) {
  if (username == "admin" && password == "admin123") {
    return true;
  } else {
    return false;
  }
}

function showDashboard(user) {
  document.getElementById("content").innerHTML = 
    "Welcome " + user.username + "!";
}

function handleLogin() {
  var u = document.getElementById("user").value;
  var p = document.getElementById("pass").value;
  if (login(u, p)) {
    showDashboard({username: u});
  } else {
    alert("Salah!");
  }
}
```

### Prompt Follow-up
```
Berdasarkan review di atas, buatkan versi kode yang sudah
diperbaiki. Juga buatkan:
1. Test cases untuk function login()
2. Versi yang menggunakan form validation
3. Tambahkan loading state saat login
4. Buatkan komentar JSDoc untuk setiap function
```

### ✅ Cek Paham
- [ ] Bisa mengidentifikasi minimal 5 issue dari kode sendiri
- [ ] Bisa menjelaskan severity setiap issue
- [ ] Kode versi review lebih baik dari versi awal

---

## 🌐 Latihan 7: Buat API Sederhana dengan AI
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 30 menit**

### Tujuan
Belajar membuat REST API sederhana dengan Node.js/Express atau Python/Flask.

### Prompt API dengan Node.js
```
Saya ingin membuat REST API sederhana dengan Node.js dan
Express untuk data Mahasiswa.

API yang harus dibuat:
GET    /api/mahasiswa         — List semua mahasiswa
GET    /api/mahasiswa/:id     — Detail 1 mahasiswa
POST   /api/mahasiswa         — Tambah mahasiswa baru
PUT    /api/mahasiswa/:id     — Update mahasiswa
DELETE /api/mahasiswa/:id     — Hapus mahasiswa

Data model Mahasiswa:
- id (auto increment)
- nama (string)
- nim (string, unique)
- jurusan (string)
- semester (number)
- createdAt (timestamp)

Instruksi:
1. Tulis kode lengkap (server.js)
2. Gunakan array in-memory (tanpa database dulu)
3. Setiap endpoint harus return JSON
4. Sertakan error handling
5. Tambahkan validasi input
6. Berikan instruksi cara menjalankan (npm init, install, dll)
7. Berikan contoh testing dengan curl
```

### Prompt API dengan Python/Flask
```
Saya ingin membuat REST API sederhana dengan Python dan
Flask untuk data Buku Perpustakaan.

API yang harus dibuat:
GET    /api/buku              — List semua buku
GET    /api/buku/:id          — Detail 1 buku
POST   /api/buku              — Tambah buku baru
PUT    /api/buku/:id          — Update buku
DELETE /api/buku/:id          — Hapus buku
GET    /api/buku/search?q=    — Search buku

Data model:
- id, judul, pengarang, penerbit, tahun, stok

Instruksi lengkap dari setup sampai test.
```

### Prompt — Testing dengan curl
```
Setelah API selesai dibuat, buatkan script testing lengkap:

1. Curl untuk setiap endpoint
2. Jalankan semua test secara berurutan
3. Harus menunjukkan semua operasi CRUD berhasil
4. Test juga error cases (data tidak ditemukan, input invalid)

Tampilkan output yang diharapkan dari setiap curl command.
```

### Contoh Output yang Diharapkan
```
$ node server.js
🚀 Server running on port 3000

$ curl http://localhost:3000/api/mahasiswa
{
  "status": "success",
  "data": [
    {"id": 1, "nama": "Andi", "nim": "2023001", ...}
  ],
  "total": 1
}

$ curl -X POST http://localhost:3000/api/mahasiswa \
  -H "Content-Type: application/json" \
  -d '{"nama":"Budi","nim":"2023002","jurusan":"TI","semester":3}'
{
  "status": "success",
  "message": "Mahasiswa berhasil ditambahkan",
  "data": {"id": 2, ...}
}
```

### ✅ Cek Paham
- [ ] API berjalan tanpa error
- [ ] Semua 5+ endpoint berfungsi
- [ ] Bisa menjelaskan perbedaan GET, POST, PUT, DELETE
- [ ] Bisa menguji API dengan curl atau Postman

---

## 💡 Tips Sukses Latihan Coding

### Cara Belajar Coding dengan AI
- **Pahami dulu konsepnya** sebelum minta AI buatkan kode
- **Jangan copy-paste mentah** — ketik ulang sambil baca
- **Ubah variabel/fungsi** untuk memahami flow
- **Jalankan kode** langsung di browser/terminal
- **Modifikasi** kode AI untuk fitur tambahan

### Strategi Debugging
1. Baca error message dengan seksama
2. Cari baris yang disebutkan di error
3. Cek variabel di baris tersebut
4. Minta AI bantu jelaskan error
5. Fix satu error, test, lanjut ke error berikut

### Error yang Sering Terjadi
| Error | Penyebab Umum | Fix |
|-------|---------------|-----|
| TypeError | Akses property null/undefined | Cek dulu sebelum akses |
| ReferenceError | Variabel belum didefinisikan | Cek spelling & scope |
| SyntaxError | Kurung/koma/titik koma salah | Cek struktur kode |
| IndentationError | Indentasi tidak konsisten | Gunakan auto-format |

---

## 🏆 Penilaian Diri

| Latihan | Selesai? | Kualitas (1-5) | Waktu (menit) |
|---------|----------|-----------------|---------------|
| 1. Pahami Kode | ☐ | ___ | ___ |
| 2. Debug Error | ☐ | ___ | ___ |
| 3. Buat Function | ☐ | ___ | ___ |
| 4. Build CRUD App | ☐ | ___ | ___ |
| 5. Refactor Kode | ☐ | ___ | ___ |
| 6. Code Review | ☐ | ___ | ___ |
| 7. Buat API | ☐ | ___ | ___ |

**Refleksi:**
1. Latihan mana yang paling menantang? Kenapa?
2. Skill coding apa yang paling meningkat setelah latihan ini?
3. Apa project coding pertama yang mau kamu buat setelah ini?

---

> **⬅️ Kembali ke Materi Modul 11** | **Selanjutnya: Modul 12 ➡️**
