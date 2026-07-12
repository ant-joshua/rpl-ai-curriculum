# Web Development — Exercise #7: Forms & Validation

> **Level:** Intermediate
> **Topics:** form validation, regex, event.preventDefault, error messages

## Instructions

Buat form registrasi dengan validasi client-side:

1. **Nama** — minimal 3 karakter, wajib diisi.
2. **Email** — format email valid (gunakan regex sederhana).
3. **Password** — minimal 8 karakter, harus mengandung huruf dan angka.
4. **Konfirmasi Password** — harus sama dengan password.
5. Tampilkan pesan error di bawah masing-masing field jika validasi gagal.
6. Jika semua valid, tampilkan alert "Pendaftaran berhasil!".

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Registrasi</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, sans-serif;
      max-width: 450px;
      margin: 2rem auto;
      padding: 0 1rem;
      background: #f5f5f5;
    }
    form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    h1 { margin-bottom: 1.5rem; color: #333; }
    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }
    input.error {
      border-color: #ef4444;
    }
    .error-message {
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: none;
    }
    .error-message.visible {
      display: block;
    }
    button {
      width: 100%;
      padding: 0.85rem;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { background: #5558e6; }
  </style>
</head>
<body>
  <form id="register-form">
    <h1>📝 Registrasi</h1>

    <div class="form-group">
      <label for="name">Nama Lengkap</label>
      <input type="text" id="name" placeholder="Minimal 3 karakter">
      <span class="error-message" id="name-error">Nama harus minimal 3 karakter</span>
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="contoh@email.com">
      <span class="error-message" id="email-error">Format email tidak valid</span>
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" placeholder="Minimal 8 karakter, huruf dan angka">
      <span class="error-message" id="password-error">Password minimal 8 karakter dengan huruf dan angka</span>
    </div>

    <div class="form-group">
      <label for="confirm-password">Konfirmasi Password</label>
      <input type="password" id="confirm-password" placeholder="Ketik ulang password">
      <span class="error-message" id="confirm-error">Password tidak cocok</span>
    </div>

    <button type="submit">Daftar</button>
  </form>

  <script>
    const form = document.getElementById('register-form');

    // TODO: fungsi validasi
    function validateName(name) {
      // minimal 3 karakter
    }

    function validateEmail(email) {
      // regex: harus mengandung @ dan domain
    }

    function validatePassword(password) {
      // minimal 8 karakter, mengandung huruf dan angka
    }

    function validateConfirm(password, confirm) {
      // harus sama
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm-password').value;

      let isValid = true;

      // TODO: validasi setiap field
      // Jika error: tambah class 'error' ke input, dan class 'visible' ke error message
      // Jika valid: hapus class error/visible

      if (isValid) {
        alert('✅ Pendaftaran berhasil!');
        form.reset();
      }
    });
  </script>
</body>
</html>
```

## Expected Output

Form dengan validasi real-time. Error muncul di bawah field yang salah. Submit hanya berhasil jika semua valid.

## Test Cases

```javascript
// Test di console browser
console.log("Form registrasi siap. Coba submit dengan data invalid lalu valid.");
```
