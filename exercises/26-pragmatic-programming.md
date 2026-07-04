# Pragmatic Programming — Latihan

## Level 1: Dasar

### 1. DRY — Duplikasi yang Nggak Perlu
```javascript
function hitungLuasPersegi(sisi) {
  return sisi * sisi;
}

function hitungLuasPersegiPanjang(panjang, lebar) {
  return panjang * lebar;
}

function volumeKubus(sisi) {
  return sisi * sisi * sisi;
}

function volumeBalok(panjang, lebar, tinggi) {
  return panjang * lebar * tinggi;
}
```

**Pertanyaan:** Kode di atas melanggar DRY. Kenapa? Tulis ulang supaya nggak ada duplikasi.

**Hint:** `sisi * sisi` dan `panjang * lebar` adalah pola yang sama. Fungsi `hitungLuasPersegi` bisa panggil `hitungLuasPersegiPanjang`.

---

### 2. KISS — Terlalu Rumit
```javascript
function cekGanjilGenap(angka) {
  if (typeof angka !== 'number') {
    return 'Input harus angka';
  }
  if (angka % 1 !== 0) {
    return 'Input harus bilangan bulat';
  }
  if (angka % 2 === 0) {
    return 'Genap';
  } else {
    return 'Ganjil';
  }
}
```

**Pertanyaan:** Fungsi di atas terlalu rumit untuk tugas sederhana. Tulis ulang versi yang lebih sederhana (KISS). Fungsi cuma perlu return "Genap" atau "Ganjil".

**Hint:** Kamu nggak perlu validasi untuk fungsi kecil. Asumsi input sudah bener.

---

### 3. YAGNI — Fitur yang Nggak Dibutuhkan
```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.loginHistory = [];
    this.preferences = {
      theme: 'light',
      language: 'id',
      notifications: true,
    };
    this.lastLogin = null;
  }

  trackLogin(date) {
    this.loginHistory.push(date);
    this.lastLogin = date;
  }

  resetPassword() {
    // TODO: implement nanti
  }
}
```

**Pertanyaan:** Fitur apa di class `User` di atas yang melanggar YAGNI? Sebutkan minimal 2 dan jelaskan kenapa.

**Hint:** YAGNI = You Aren't Gonna Need It. Kalau sekarang belum dipakai, jangan ditulis.

---

### 4. Naming — Nama Variabel yang Buruk
```javascript
function d(a, b) {
  let x = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (a[i] === b[j]) {
        x.push(a[i]);
      }
    }
  }
  return x;
}
```

**Pertanyaan:** Ganti nama fungsi, parameter, dan variabel dengan nama yang deskriptif. Fungsi ini mencari irisan dari dua array.

**Hint:** Nama harus jelasin *apa* yang dilakukan fungsi. `d` → `cariIrisanArray`.

---

### 5. Refactoring — Magic Number
```javascript
function hitungDiskon(total) {
  if (total > 100000) {
    return total * 0.1;
  }
  return 0;
}
```

**Pertanyaan:** `100000` dan `0.1` disebut *magic numbers*. Ubah jadi konstanta dengan nama deskriptif.

**Hint:** `const MIN_TOTAL_DISKON = 100000; const PERSEN_DISKON = 0.1;`

---

### 6. Code Review — Cari Masalah
```python
def process_data(x):
    y = []
    for i in range(len(x)):
        if x[i] % 2 == 0:
            y.append(x[i] * 2)
    return y
```

**Pertanyaan:** Kode di atas bisa diperbaiki. Sebutkan 2 cara untuk membuatnya lebih *pythonic* (idiomatik).

**Hint:** Python punya list comprehension dan iterasi langsung tanpa index.

---

### 7. Estimation — Tebak Waktu
**Pertanyaan:** Fitur "tambah halaman profil user" perlu:
- Desain UI (1 hari)
- Bikin API endpoint GET/PUT profile (2 hari)
- Bikin halaman frontend (2 hari)
- Integrasi dan testing (1 hari)

Estimasi total: 6 hari. Tapi ternyata ada:
- Library UI belum dipilih → butuh 1 hari riset
- API docs perlu direview tim security → +1 hari
- Kamu juga ada meeting 2 jam setiap hari

**Pertanyaan:** Hitung estimasi realistis pakai aturan *multiply by π* (kalikan estimasi awal dengan 3). Berapa hari sebenarnya?

**Hint:** Estimasi optimis selalu underestimate. Pengalaman programmer: estimasi × 2 atau × 3.

---

### 8. DRY — Duplikasi di Query
```sql
SELECT * FROM orders WHERE status = 'pending' AND created_at > '2024-01-01';
SELECT * FROM orders WHERE status = 'shipped' AND created_at > '2024-01-01';
SELECT * FROM orders WHERE status = 'delivered' AND created_at > '2024-01-01';
```

**Pertanyaan:** Tiga query ini duplikasi. Tulis ulang jadi 1 parameterized query yang bisa diganti status-nya.

**Hint:** `SELECT * FROM orders WHERE status = ? AND created_at > ?`

---

## Level 2: Intermediate

### 9. Refactoring — Fungsi yang Melanggar SRP
```javascript
function generateReport(users) {
  // Hitung statistik
  let total = users.length;
  let aktif = users.filter(u => u.active).length;
  let rataRataUsia = users.reduce((sum, u) => sum + u.age, 0) / total;

  // Format laporan
  let laporan = `Total User: ${total}\n`;
  laporan += `User Aktif: ${aktif}\n`;
  laporan += `Rata-rata Usia: ${rataRataUsia}\n`;

  // Simpan ke file
  const fs = require('fs');
  fs.writeFileSync('report.txt', laporan);

  // Kirim email
  console.log('Email terkirim ke admin');

  return laporan;
}
```

**Pertanyaan:** Fungsi ini ngelakuin terlalu banyak hal. Pisahkan jadi beberapa fungsi kecil sesuai *Single Responsibility Principle*. Masing-masing fungsi cuma punya 1 tanggung jawab.

**Hint:** Minimal ada: `hitungStatistikUser`, `formatLaporan`, `simpanLaporanKeFile`, `kirimLaporanKeEmail`.

---

### 10. Refactoring — Bersihin Kode Spaghetti
```python
def checkout(cart, user):
    total = 0
    for item in cart:
        total += item['price'] * item['qty']
    if user['type'] == 'vip':
        total = total * 0.8
    elif user['type'] == 'member':
        if total > 500000:
            total = total * 0.9
    if total > 1000000:
        total = total * 0.95  # diskon tambahan
    if user.get('coupon'):
        total = total - 50000
    if total < 0:
        total = 0
    # apply tax
    total = total * 1.11
    return total
```

**Pertanyaan:** Refactor kode ini dengan:
1. Ekstrak logika diskon ke fungsi terpisah
2. Pakai constants untuk angka ajaib
3. Tambah komentar yang jelas untuk tiap aturan bisnis

**Hint:** Setiap aturan bisnis (diskon VIP, diskon member, diskon total, kupon) adalah *business rule* yang harus terisolasi.

---

### 11. Code Review Simulation — Banyak Masalah
```javascript
// review.js — Tolong review kode ini
function getStuff(id) {
  var d = fetch('https://api.example.com/data/' + id);
  var r = JSON.parse(d);
  if (r != null) {
    for (var i = 0; i < r.items.length; i++) {
      console.log(r.items[i].name);
    }
    return r.items;
  }
}
```

**Pertanyaan:** Temukan minimal 5 masalah dalam kode di atas. Untuk tiap masalah sebutkan:
1. Baris ke berapa
2. Masalahnya apa
3. Cara memperbaikinya

**Hint:** Cari masalah di: async, error handling, naming, null check, tipe data.

---

### 12. Estimation — Planning Poker
**Pertanyaan:** Kamu dan tim pakai *Planning Poker* untuk estimasi. Untuk user story berikut, tentukan story point-nya (gunakan Fibonacci: 1, 2, 3, 5, 8, 13):

> "Sebagai admin, saya ingin bisa export laporan transaksi bulanan dalam format PDF dan CSV, dengan filter tanggal dan kategori."

**Pertanyaan:** 
1. Berapa story point estimasi kamu? Jelaskan kenapa.
2. Sebutkan 3 risiko/ketidakpastian yang bikin estimasi ini bisa meleset.
3. Gimana cara mengurangi ketidakpastian itu?

**Hint:** Gunakan *reference story* yang sudah pernah dikerjakan tim sebagai patokan.

---

### 13. Naming — Refactoring Class
```java
public class M {
  private List<Map<String, Object>> d;

  public M(List<Map<String, Object>> d) {
    this.d = d;
  }

  public void p() {
    for (Map<String, Object> item : d) {
      Object n = item.get("name");
      Object v = item.get("value");
      System.out.println(n + ": " + v);
    }
  }

  public Map<String, Object> g(String k, Object v) {
    for (Map<String, Object> item : d) {
      if (item.containsKey(k) && item.get(k).equals(v)) {
        return item;
      }
    }
    return null;
  }
}
```

**Pertanyaan:** Ganti semua nama yang nggak deskriptif. Class ini sebenarnya merepresentasikan kumpulan konfigurasi key-value. Tulis ulang dengan nama yang jelas.

**Hint:** `M` → `KonfigurasiStore`, `d` → `dataKonfigurasi`, `p` → `cetakSemua`, `g` → `cariBerdasarkan`.

---

## Level 3: Challenge

### 14. DRY + Refactoring — Duplikasi di Middleware
```javascript
// auth middleware — ada 3 file terpisah

// adminAuth.js
function adminAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// userAuth.js — sama persis except cek role 'user'
function userAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== 'user') return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// modAuth.js — sama persis except cek role 'moderator'
```

**Pertanyaan:** 
1. Ada duplikasi besar di sini. Tulis ulang jadi 1 fungsi middleware yang reusable. Gunakan *higher-order function*.
2. Sebutkan prinsip pragmatic programming mana saja yang dilanggar oleh kode aslinya.

**Hint:** `function requireRole(...roles) { return (req, res, next) => { ... } }`

---

### 15. YAGNI vs Future-Proofing — Dilema
**Skenario:** Kamu bikin sistem pembayaran. Saat ini cuma support transfer bank. Tapi kamu tahu nanti akan ada e-wallet dan kartu kredit.

**Pertanyaan:** 
1. Apakah membuat *abstract class* `PaymentMethod` dengan subclass dari sekarang termasuk YAGNI atau future-proofing yang bijak? Jelaskan.
2. Kode minimal seperti apa yang cukup untuk kebutuhan *sekarang* tanpa over-engineering?
3. Kapan waktu yang tepat untuk refactor ke pattern yang lebih extensible?

**Hint:** *Rule of three*: kalau pattern yang sama muncul 3 kali, baru refactor jadi abstraksi.

---

### 16. Code Review — Hidden Bug
```javascript
function hitungTotalHarga(items, diskonPersen, kodePromo) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].harga * items[i].jumlah;
  }

  if (kodePromo === 'DISKON10') {
    total = total * 0.9;
  } else if (kodePromo === 'DISKON20') {
    if (total > 200000) {
      total = total - 50000;
    } else {
      total = total * 0.8;
    }
  } else if (kodePromo === 'GRATISONGKIR') {
    // ongkir sudah include di harga item
  }

  if (diskonPersen > 0) {
    total = total - (total * diskonPersen / 100);
  }

  if (total < 0) total = 0;
  return total;
}
```

**Pertanyaan:** 
1. Temukan 3 bug serius di kode ini.
2. Apakah ada aturan bisnis yang membingungkan / ambigu?
3. Tulis ulang dengan logika yang jelas dan testable.

**Hint:** Perhatikan urutan diskon. Apakah kode promo dan diskon persen bisa ditumpuk? Apakah itu sesuai aturan bisnis?

---

### 17. Refactoring Besar — Monolitik ke Modular
```javascript
// userController.js — 1 file 300 baris
function registerUser(req, res) { /* validasi, hash password, simpan DB, kirim email, log aktivitas */ }
function loginUser(req, res) { /* cari user, cek password, buat token, log aktivitas */ }
function updateProfile(req, res) { /* validasi, update DB, log aktivitas */ }
function resetPassword(req, res) { /* generate token, kirim email, simpan token, log aktivitas */ }
function deleteUser(req, res) { /* cek hak akses, hapus DB, kirim notifikasi, log aktivitas */ }
```

**Pertanyaan:** 
1. Identifikasi semua tanggung jawab yang tercampur dalam controller ini.
2. Rancang struktur folder/file yang memisahkan: **controller**, **service**, **repository**, **validator**, **email**, dan **logger**.
3. Tulis ulang fungsi `registerUser` dengan struktur baru (pseudo-code boleh).

**Hint:** Controller cuma urus request/response. Logika bisnis di service. Akses DB di repository.

---

### 18. Estimation Challenge — Proyek Tak Terduga
**Skenario:** Tim kamu ditanya: "Kapan fitur X selesai?" Kamu nggak punya cukup informasi:

- Spesifikasi fitur: 1 kalimat doang
- Teknologi: belum diputuskan (React/Vue? SQL/NoSQL?)
- Kamu harus kerja sambil nge-handle produksi (incident bisa kapan aja)
- Ada 2 orang di tim, satunya masih baru (baru 1 minggu)

**Pertanyaan:** 
1. Berikan estimasi dalam format *range* (optimis-pesimis).
2. Sebutkan *confidence level* kamu (0-100%).
3. Tulis *conditional phrasing* yang tepat untuk menjawab PM tanpa memberikan false promise. Contoh: *"Kalau X dan Y terpenuhi, estimasi Z hari."*
4. Langkah konkret apa yang kamu lakukan di minggu pertama untuk mengurangi ketidakpastian?

**Hint:** Makin sedikit info, makin lebar range. *"Between 2 weeks and 2 months"* lebih jujur dari *"2 minggu."*
