# 4.1 Form & Deploy

## HTML Form

Form buat ngirim data dari user ke server.

```html
<form action="/submit" method="POST">
    <!-- input fields disini -->
    <button type="submit">Kirim</button>
</form>
```

| Atribut | Fungsi |
|---------|--------|
| `action` | URL tujuan data dikirim |
| `method` | GET (kelihatan di URL) / POST (tersembunyi) |

## Input Types

```html
<!-- Text — input teks biasa -->
<label for="nama">Nama:</label>
<input type="text" id="nama" name="nama" placeholder="Masukkan nama">

<!-- Email — otomatis validasi format email -->
<label for="email">Email:</label>
<input type="email" id="email" name="email" placeholder="email@example.com">

<!-- Password — karakter tersembunyi -->
<label for="password">Password:</label>
<input type="password" id="password" name="password">

<!-- Number — cuma angka -->
<label for="umur">Umur:</label>
<input type="number" id="umur" name="umur" min="1" max="150">

<!-- Radio — pilih satu -->
<label>Jenis Kelamin:</label>
<input type="radio" id="pria" name="gender" value="pria">
<label for="pria">Pria</label>
<input type="radio" id="wanita" name="gender" value="wanita">
<label for="wanita">Wanita</label>

<!-- Checkbox — pilih banyak / ya-tidak -->
<input type="checkbox" id="setuju" name="setuju" checked>
<label for="setuju">Saya setuju dengan syarat & ketentuan</label>

<!-- Select / Dropdown -->
<label for="kota">Kota:</label>
<select id="kota" name="kota">
    <option value="">-- Pilih Kota --</option>
    <option value="jakarta">Jakarta</option>
    <option value="bandung">Bandung</option>
    <option value="surabaya">Surabaya</option>
</select>

<!-- Textarea — input teks panjang -->
<label for="pesan">Pesan:</label>
<textarea id="pesan" name="pesan" rows="5" cols="30" placeholder="Tulis pesan..."></textarea>
```

### Label

Label penting — ngasih tau user field ini buat apa. Klik label otomatis fokus ke input.

Cara 1 — `for`指向 `id`:
```html
<label for="email">Email:</label>
<input type="email" id="email" name="email">
```

Cara 2 — bungkus input:
```html
<label>
    Nama: <input type="text" name="nama">
</label>
```

### Button

```html
<button type="submit">Kirim</button>      <!-- submit form -->
<button type="reset">Reset</button>        <!-- reset form -->
<button type="button">Klik</button>        <!-- biasa, perlu JS -->
```

## Form Validation

Validation pake atribut HTML aja (NO JS):

```html
<form>
    <label for="nama">Nama Lengkap:</label>
    <input type="text" id="nama" name="nama" required>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <label for="password">Password (min 8 karakter):</label>
    <input type="password" id="password" name="password"
           minlength="8" required>

    <label for="telp">No Telepon:</label>
    <input type="text" id="telp" name="telp"
           pattern="[0-9]{10,15}"
           placeholder="08xxxxxxxxxx"
           title="Masukkan 10-15 digit angka">

    <label for="umur">Umur (18-100):</label>
    <input type="number" id="umur" name="umur"
           min="18" max="100" required>

    <button type="submit">Daftar</button>
</form>
```

| Atribut | Fungsi |
|---------|--------|
| `required` | Field wajib diisi |
| `minlength` / `maxlength` | Min / maks karakter |
| `min` / `max` | Min / maks angka |
| `pattern` | Regex pattern (contoh: `[0-9]{10,15}`) |
| `title` | Tooltip hint kalo pattern gak cocok |

## CSS Styling Form

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Styled Form</title>
    <style>
        * { box-sizing: border-box; }

        body {
            font-family: Arial, sans-serif;
            background: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }

        .form-container {
            background: white;
            padding: 32px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 480px;
        }

        .form-container h2 {
            text-align: center;
            color: #1a1a2e;
            margin-top: 0;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            font-weight: bold;
            margin-bottom: 6px;
            color: #333;
        }

        input, select, textarea {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #4a90d9;
        }

        input:invalid {
            border-color: #e74c3c;
        }

        input:valid {
            border-color: #2ecc71;
        }

        .radio-group, .checkbox-group {
            display: flex;
            gap: 16px;
            align-items: center;
        }

        .radio-group label, .checkbox-group label {
            font-weight: normal;
            margin-bottom: 0;
        }

        input[type="radio"],
        input[type="checkbox"] {
            width: auto;
        }

        button {
            width: 100%;
            padding: 12px;
            background: #4a90d9;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
        }

        button:hover {
            background: #357abd;
        }

        .error-message {
            color: #e74c3c;
            font-size: 14px;
            margin-top: 4px;
            display: none;
        }

        input:invalid + .error-message {
            display: block;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Registrasi</h2>
        <form>
            <div class="form-group">
                <label for="nama">Nama Lengkap</label>
                <input type="text" id="nama" name="nama" required placeholder="Masukkan nama">
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required placeholder="email@example.com">
            </div>

            <div class="form-group">
                <label for="password">Password (min 8 karakter)</label>
                <input type="password" id="password" name="password" minlength="8" required>
            </div>

            <div class="form-group">
                <label>Jenis Kelamin</label>
                <div class="radio-group">
                    <input type="radio" id="pria" name="gender" value="pria">
                    <label for="pria">Pria</label>
                    <input type="radio" id="wanita" name="gender" value="wanita">
                    <label for="wanita">Wanita</label>
                </div>
            </div>

            <div class="form-group">
                <label for="kota">Kota</label>
                <select id="kota" name="kota" required>
                    <option value="">-- Pilih --</option>
                    <option value="jakarta">Jakarta</option>
                    <option value="bandung">Bandung</option>
                    <option value="surabaya">Surabaya</option>
                </select>
            </div>

            <div class="form-group">
                <label for="pesan">Pesan</label>
                <textarea id="pesan" name="pesan" rows="4" placeholder="Tulis pesan..."></textarea>
            </div>

            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="setuju" name="setuju" required>
                    <label for="setuju">Saya setuju dengan syarat & ketentuan</label>
                </div>
            </div>

            <button type="submit">Daftar</button>
        </form>
    </div>
</body>
</html>
```

## Deploy ke Vercel / Netlify

Bisa deploy static website GRATIS pake drag-drop.

### Vercel

1. Buka [vercel.com](https://vercel.com)
2. Login pake GitHub / Google
3. Klik **Add New → Project**
4. Upload folder project atau connect dari GitHub
5. Klik **Deploy** — selesai!
6. Dapet URL: `namaproject.vercel.app`

Atau drag-drop:

1. Bikin folder project dengan `index.html`
2. Buka [vercel.com/new](https://vercel.com/new)
3. Drag folder ke area upload
4. Auto deploy

### Netlify

1. Buka [netlify.com](https://netlify.com)
2. Login pake GitHub / Google
3. Klik **Sites → Add new site → Deploy manually**
4. Drag folder project (isi: `index.html`, `style.css`, dll)
5. Dapet URL: `namaproject.netlify.app`

### Struktur Folder untuk Deploy

```
project-ku/
├── index.html
├── about.html
├── contact.html
├── style.css
└── assets/
    └── foto.jpg
```

> **Pastikan ada file `index.html`** — itu halaman utama yang bakal dibuka pertama.

## Latihan

1. **Registration Form** — Bikin form registrasi dengan field: nama, email, password, konfirmasi password, tanggal lahir, jenis kelamin (radio), hobi (checkbox minimal 3), kota (select). Semua required.

2. **Survey Form** — Bikin form survey: nama, umur (number), puas/tidak puas (radio), saran (textarea), rating 1-5 (select). Pake validation HTML.

3. **Styled Form + Validation** — Ambil form registrasi dari latihan 1, kasih CSS lengkap. Form di tengah halaman pake flexbox. Ada efek hover & focus. Input invalid border merah, valid border hijau.

4. **Deploy** — Bikin folder project berisi halaman form (dari latihan 3) + halaman index (homepage sederhana). Deploy ke Vercel atau Netlify. Kirim link hasil deploy.

5. **FormData + Fetch.** Bikin form kontak dengan 4 field. Kirim data pake JavaScript FormData + Fetch API. Tampilkan response di halaman (gak reload). Sertakan loading spinner.

6. **File upload with preview.** Bikin form upload foto dengan preview sebelum upload. Validasi: file extension (jpg/png/webp), max size (2MB). Tampilkan error message kalo file gak sesuai.

7. **Custom validation.** Bikin form registrasi dengan validasi JavaScript kustom: username (3-20 karakter, alfanumerik), email (format valid), password (min 8, 1 uppercase, 1 number, 1 special char), konfirmasi password (sama). Style error merah di border + error message. Gak pake HTML5 validation attributes.

8. **Dialog + form.** Bikin halaman dengan tombol "Tambah Data". Pas diklik, muncul modal `<dialog>` dengan form input. Submit form tutup modal dan tampilkan data di tabel. Pake JavaScript.

---

## HTML Form Advanced — FormData & File Upload

Form bisa kirim data tanpa reload pake JavaScript FormData.

### FormData API

```html
<form id="myForm">
  <input type="text" name="nama" placeholder="Nama">
  <input type="email" name="email" placeholder="Email">
  <textarea name="pesan" placeholder="Pesan"></textarea>
  <button type="submit">Kirim</button>
</form>
<div id="result"></div>
```

```javascript
document.getElementById('myForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  // Kirim ke API
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById('result').textContent = result.message;
});
```

### File Upload

```html
<form id="uploadForm" enctype="multipart/form-data">
  <label for="avatar">Pilih foto profil:</label>
  <input type="file" id="avatar" name="avatar" accept="image/*" required>

  <label for="doc">Upload dokumen (PDF max 5MB):</label>
  <input type="file" id="doc" name="doc" accept=".pdf" multiple>

  <button type="submit">Upload</button>
</form>
<div id="preview"></div>
```

```javascript
// Preview gambar sebelum upload
document.getElementById('avatar').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.maxWidth = '200px';
      document.getElementById('preview').innerHTML = '';
      document.getElementById('preview').appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

// Upload pake FormData
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,  // Content-Type otomatis multipart/form-data
  });

  alert('Upload berhasil!');
});
```

### Validasi Custom JavaScript

```html
<style>
  .error { border-color: #e74c3c !important; }
  .error-text { color: #e74c3c; font-size: 14px; display: none; }
  .visible { display: block; }
</style>

<form id="registerForm">
  <div class="form-group">
    <label for="username">Username (min 3 karakter, huruf/angka doang)</label>
    <input type="text" id="username" name="username">
    <span class="error-text" id="usernameError">Username minimal 3 karakter, huruf dan angka saja</span>
  </div>

  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email">
    <span class="error-text" id="emailError">Email tidak valid</span>
  </div>

  <div class="form-group">
    <label for="password">Password (min 8 karakter, 1 huruf besar, 1 angka)</label>
    <input type="password" id="password" name="password">
    <span class="error-text" id="passwordError">Password harus 8+ karakter, 1 huruf besar, 1 angka</span>
  </div>

  <button type="submit">Daftar</button>
</form>
```

```javascript
function validateUsername(username) {
  return /^[a-zA-Z0-9]{3,}$/.test(username);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[0-9]/.test(password);
}

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  // Username
  const username = document.getElementById('username');
  if (!validateUsername(username.value)) {
    username.classList.add('error');
    document.getElementById('usernameError').classList.add('visible');
    valid = false;
  } else {
    username.classList.remove('error');
    document.getElementById('usernameError').classList.remove('visible');
  }

  // Email
  const email = document.getElementById('email');
  if (!validateEmail(email.value)) {
    email.classList.add('error');
    document.getElementById('emailError').classList.add('visible');
    valid = false;
  } else {
    email.classList.remove('error');
    document.getElementById('emailError').classList.remove('visible');
  }

  // Password
  const password = document.getElementById('password');
  if (!validatePassword(password.value)) {
    password.classList.add('error');
    document.getElementById('passwordError').classList.add('visible');
    valid = false;
  } else {
    password.classList.remove('error');
    document.getElementById('passwordError').classList.remove('visible');
  }

  if (valid) {
    alert('Form valid! Data siap dikirim.');
    // e.target.submit();  // kirim beneran
  }
});
```

---

## HTML Advanced APIs

### Dialog Element

```html
<!-- Modal native — gak perlu JavaScript (tapi butuh dikit buat open/close) -->
<dialog id="myModal">
  <h2>Konfirmasi</h2>
  <p>Apakah kamu yakin ingin menghapus data ini?</p>
  <form method="dialog">
    <button value="cancel">Batal</button>
    <button value="confirm">Hapus</button>
  </form>
</dialog>

<button id="openModal">Buka Modal</button>
<button id="closeModal">Tutup Modal</button>

<script>
  const modal = document.getElementById('myModal');
  document.getElementById('openModal').onclick = () => modal.showModal();
  document.getElementById('closeModal').onclick = () => modal.close();
</script>
```

### Details / Summary

```html
<details>
  <summary>Klik untuk lihat detail</summary>
  <p>Ini konten yang tersembunyi. Klik summary di atas untuk buka/tutup.</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
</details>

<details open>
  <summary>Sudah terbuka dari awal</summary>
  <p>Kalo pake atribut `open`, defaultnya udah kebuka.</p>
</details>
```

### Output Element

```html
<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
  <input type="range" id="a" value="50" min="0" max="100">
  <input type="range" id="b" value="50" min="0" max="100">
  <output name="result" for="a b">100</output>
</form>
```

---

## Form Security Basics

### Cross-Site Scripting (XSS)

```javascript
// ❌ Jangan — bisa kena XSS
document.getElementById('output').innerHTML = userInput;

// ✅ Aman — pake textContent
document.getElementById('output').textContent = userInput;
```

### CSRF Protection

```html
<!-- Server kirim token CSRF di form -->
<form method="POST" action="/transfer">
  <input type="hidden" name="csrf_token" value="abc123xyz">
  <input type="number" name="amount" placeholder="Jumlah">
  <input type="text" name="to_account" placeholder="Rekening tujuan">
  <button type="submit">Transfer</button>
</form>
```

### Sanitasi Input

```javascript
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const userInput = '<script>alert("xss")</script>';
console.log(sanitizeHTML(userInput));
// Output: &lt;script&gt;alert("xss")&lt;/script&gt;
```
