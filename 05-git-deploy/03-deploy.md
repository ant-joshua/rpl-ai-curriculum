# 1.3 Deploy — Frontend & Backend

## Deploy Frontend ke Vercel

### Persiapan

Bikin project frontend (statis atau React/Next.js):

```bash
# Bikin folder landing page
mkdir landing-page
cd landing-page

# Bikin file index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Saya</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Halo! Saya <span id="nama">Budi</span></h1>
  <p>Ini landing page pertama saya 🚀</p>
  <script src="script.js"></script>
</body>
</html>
EOF

# Bikin style.css
cat > style.css << 'EOF'
body {
  font-family: system-ui, sans-serif;
  max-width: 640px;
  margin: 80px auto;
  text-align: center;
  background: #0f172a;
  color: #f8fafc;
}
h1 { font-size: 2.5rem; }
span { color: #38bdf8; }
EOF

# Bikin script.js
cat > script.js << 'EOF'
const namaSpan = document.getElementById('nama');
const nama = prompt('Siapa nama kamu?') || 'Budi';
namaSpan.textContent = nama;
EOF
```

### Push ke GitHub

```bash
git init
git add .
git commit -m "feat: landing page portfolio"
# Ganti dengan username & repo kamu
git remote add origin https://github.com/username/landing-page.git
git push -u origin main
```

### Deploy di Vercel

1. Buka [vercel.com](https://vercel.com), login pake GitHub
2. Klik **Add New** → **Project**
3. Pilih repo `landing-page`
4. Settings default (Vercel detect HTML otomatis)
5. Klik **Deploy**
6. Selesai! Dapet URL: `https://landing-page.vercel.app`

## Deploy Backend ke Railway

### Persiapan

Bikin API sederhana pake Node.js + Express:

```bash
mkdir api-saya
cd api-saya
npm init -y
npm install express cors
```

Bikin `index.js`:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/halo', (req, res) => {
  res.json({ pesan: 'Halo dari Railway!' });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, nama: 'Budi' },
    { id: 2, nama: 'Andi' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
```

Bikin `start` script di `package.json`:

```json
"scripts": {
  "start": "node index.js"
}
```

Bikin `.gitignore`:

```
node_modules/
.env
```

### Push & Deploy

```bash
git init
git add .
git commit -m "feat: api express sederhana"
git remote add origin https://github.com/username/api-saya.git
git push -u origin main
```

1. Buka [railway.com](https://railway.com), login pake GitHub
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repo `api-saya`
4. Railway auto-detect Node.js, jalanin `npm install` + `start`
5. Dapet URL: `https://api-saya.up.railway.app`

Test API:
```bash
curl https://api-saya.up.railway.app/api/halo
# Output: {"pesan":"Halo dari Railway!"}
```

## Environment Variable

Jangan pernah hardcode secret di kode! Pake env variable.

### Local Development

Bikin `.env` (jangan di-commit — masukin .gitignore):

```
DB_HOST=localhost
DB_USER=admin
DB_PASS=rahasia123
API_KEY=sk-xxx
```

Baca di code:

```javascript
// Pakai dotenv (install: npm install dotenv)
require('dotenv').config();

const dbPass = process.env.DB_PASS;
const apiKey = process.env.API_KEY;

console.log(dbPass); // rahasia123
```

### Di Vercel

Dashboard project → **Settings** → **Environment Variables** → isi key-value.

### Di Railway

Dashboard project → **Variables** → **New Variable** → isi key-value.

Railway juga bisa upload `.env` file langsung.

## Custom Domain

### Vercel

Dashboard project → **Settings** → **Domains** → masukin domain kamu (misal `portofolio-saya.com`)→ ikutin instruksi DNS (CNAME record).

### Railway

Dashboard project → **Settings** → **Domains** → **Custom Domain** → ikutin instruksi DNS.

### Rekomendasi Domain Gratis / Murah

- [Niagahoster](https://niagahoster.co.id) — .com ~150rb/thn
- [Cloudflare Registrar](https://cloudflare.com) — harga modal (+- 90rb/thn)
- [Freenom](https://freenom.com) — .tk, .ml, .ga (gratis, kadang bermasalah)

## Latihan

1. Bikin landing page (HTML+CSS+JS), push ke GitHub, deploy ke Vercel
2. Bikin Express API dengan 2 endpoint, deploy ke Railway, test pake curl
3. Tambah env variable `SITE_NAME` di Vercel, pake di landing page, re-deploy
4. Hubungin custom domain (bisa pake subdomain gratisan kaya `namamu.vercel.app`)
