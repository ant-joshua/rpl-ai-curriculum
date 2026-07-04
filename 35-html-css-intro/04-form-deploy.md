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
