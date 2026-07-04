# Cybersecurity — Latihan

## Level 1: Dasar

### Soal 1 — SQL Injection Detection
Periksa kode berikut. Apakah rentan SQL Injection? Jelaskan dan perbaiki.

```php
$username = $_POST['username'];
$password = $_POST['password'];
$query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
$result = mysqli_query($conn, $query);
if (mysqli_num_rows($result) > 0) {
    echo "Login berhasil";
} else {
    echo "Login gagal";
}
```

Tulis ulang menggunakan **prepared statement** (MySQLi atau PDO).

### Soal 2 — XSS Prevention
Kode berikut menampilkan komentar user di halaman web:

```javascript
function renderComment(comment) {
  document.getElementById('comments').innerHTML += 
    '<div class="comment">' + comment.text + '</div>';
}
```

Jelaskan jenis XSS apa yang mungkin terjadi. Berikan 3 cara berbeda untuk memitigasi serangan ini.

### Soal 3 — Password Storage
Seorang developer menyimpan password user seperti ini:

```javascript
// Database
users: [
  { username: "alice", password: "password123" },
  { username: "bob", password: "qwerty" }
]
```

Identifikasi **minimal 4 masalah keamanan**. Implementasikan solusi yang benar menggunakan bcrypt (pseudo-code atau Node.js code). Sertakan penjelasan tentang salt dan cost factor.

## Level 2: Intermediate

### Soal 4 — JWT Authentication
Implementasikan **access token + refresh token** flow menggunakan JWT:

1. **Login endpoint** — validasi credential, return access token (15 menit) + refresh token (7 hari)
2. **Refresh endpoint** — terima refresh token, return access token baru
3. **Middleware** — validasi access token di setiap request protected route
4. **Blacklist** — handle logout dengan blacklist refresh token di Redis

Gunakan Express.js atau pseudo-code. Jelaskan cara menyimpan token di client-side (httpOnly cookie vs localStorage) dan trade-off masing-masing.

### Soal 5 — CSRF Protection
Jelaskan serangan CSRF pada endpoint berikut:

```html
<!-- Halaman jahat -->
<img src="https://bank.com/api/transfer?to=attacker&amount=1000000" />
```

1. Mengapa serangan ini bisa berhasil?
2. Implementasikan **3 mekanisme pertahanan CSRF**:
   - Synchronizer Token Pattern
   - SameSite Cookie
   - Custom Header / Origin check
3. Mana yang paling efektif untuk SPA? Jelaskan.

### Soal 6 — Input Validation & Sanitization
Endpoint API menerima input JSON untuk membuat user:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "role": "admin",
  "age": -5,
  "profile": {
    "bio": "<script>alert('xss')</script>",
    "website": "javascript:alert(1)"
  }
}
```

Buat **validation schema** (gunakan Joi, Zod, atau manual) yang:
- Username: alphanumeric + underscore, 3-20 karakter, tidak boleh "admin" atau "root"
- Email: valid email format
- Role: hanya "user" atau "moderator" (tidak bisa daftar sebagai admin)
- Age: integer, 13-120
- Bio: sanitasi HTML tags
- Website: hanya http/https, valid URL

## Level 3: Challenge

### Soal 7 — Security misconfiguration & Hardening
Audit konfigurasi server Express.js berikut:

```javascript
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.listen(3000);
app.disable('x-powered-by');
```

Temukan minimal **6 security misconfiguration**. Berikan konfigurasi yang benar dengan:
- Helmet.js
- CORS (hanya domain tertentu)
- Rate limiting
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Error handling (jangan bocor stack trace)
- Directory listing protection

### Soal 8 — Zero Trust Architecture Proposal
Anda ditugaskan mendesain arsitektur Zero Trust untuk perusahaan dengan 500 karyawan yang saat ini menggunakan **VPN-based corporate network**.

Komponen:
1. **Identity**: SSO + MFA (Okta/Azure AD)
2. **Device**: device compliance check (MDM)
3. **Network**: micro-segmentation, tidak ada trusted zone
4. **Application**: setiap request harus diautentikasi + diotorisasi
5. **Data**: encryption at rest & in transit, DLP

Buat diagram arsitektur dan jelaskan:
- Bagaimana user mengakses aplikasi internal tanpa VPN
- Policy enforcement point (PEP) dan policy decision point (PDP)
- Logging & monitoring (SIEM integration)
- Incident response plan jika terjadi breach
- Migration path dari VPN ke Zero Trust (phased approach)
