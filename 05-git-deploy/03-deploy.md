# 1.3 Deploy — Frontend & Backend

Deploy = **mindahin** kode dari laptop ke server biar bisa diakses publik. Setelah belajar Git & GitHub, sekarang waktunya GitHub + Deploy = portfolio lo live!

## Deploy Frontend ke Vercel

Vercel = platform deploy frontend (HTML statis, React, Next.js, Vue, dll). Gratis, support custom domain, HTTPS otomatis.

### Persiapan Landing Page

Bikin project frontend (statis):

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
4. Settings default (Vercel detect HTML otomatis). Kalo project React/Next.js, Vercel auto-detect framework
5. Klik **Deploy**
6. Selesai! Dapet URL: `https://landing-page.vercel.app`

**Auto-deploy:** Tiap lo push ke `main`, Vercel otomatis re-deploy. Gak perlu ngapa-ngapain lagi.

### Deploy React / Next.js ke Vercel

Kalo project pake framework, ada langkah tambahan:

```bash
# Bikin Next.js project
npx create-next-app@latest my-app
cd my-app

# Bikin vercel.json (optional — konfigurasi)
cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
EOF

git init
git add .
git commit -m "feat: next.js app"
git remote add origin https://github.com/username/my-app.git
git push -u origin main
```

Buka Vercel → Add New → Project → Import `my-app` → Deploy. Vercel langsung detect Next.js.

### Environment Variable di Vercel

Dashboard project → **Settings** → **Environment Variables** → isi key-value:

```
SITE_NAME=Portfolio Saya
API_URL=https://api-saya.up.railway.app
```

Baca di frontend (Next.js):

```javascript
// pages/index.js (Next.js)
export async function getStaticProps() {
  return {
    props: {
      siteName: process.env.SITE_NAME,
      apiUrl: process.env.API_URL
    }
  }
}
```

## Deploy Frontend ke Cloudflare Pages

Alternative Vercel — Cloudflare Pages juga gratis, CDN global, unlimited bandwidth.

```bash
# Sama persis — push landing page ke GitHub

# Dashboard Cloudflare
```

1. Buka [pages.cloudflare.com](https://pages.cloudflare.com), login
2. Klik **Create a project** → **Connect to Git**
3. Pilih repo `landing-page`
4. **Build settings:**
   - Framework preset: **None** (buat HTML statis)
   - Build command: kosongin (kalo statis)
   - Build output: root folder `/`
5. Klik **Save and Deploy**
6. Dapet URL: `https://landing-page.pages.dev`

**Keunggulan Cloudflare Pages:**
- Unlimited bandwidth (gak kayak Vercel yang 100 GB/bulan)
- Instant rollback (1 klik)
- Global CDN di 300+ kota
- Cloudflare Workers integration

**Environment variable di Cloudflare Pages:**
Dashboard → project → **Settings** → **Environment Variables** → Add variable.

## Deploy Backend ke Railway

Railway = platform deploy backend (Node.js, Python, Go, Ruby, dll). Gratis dengan batasan, support env vars, custom domain.

### Persiapan API

Bikin API sederhana pake Node.js + Express:

```bash
mkdir api-saya
cd api-saya
npm init -y
npm install express cors dotenv
```

Bikin `index.js`:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/halo', (req, res) => {
  res.json({ 
    pesan: 'Halo dari Railway!',
    appName: process.env.APP_NAME || 'API Saya'
  });
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
# Output: {"pesan":"Halo dari Railway!","appName":"API Saya"}
```

### Deploy Python Backend ke Railway

```bash
mkdir api-python
cd api-python

# Bikin requirements.txt
echo "flask
gunicorn" > requirements.txt

# Bikin app.py
cat > app.py << 'EOF'
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/api/halo')
def halo():
    return jsonify({"pesan": "Halo dari Railway!"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
EOF

# Bikin Procfile (buat Railway tahu cara jalanin)
echo "web: gunicorn app:app" > Procfile

git init
git add .
git commit -m "feat: flask api"
git remote add origin https://github.com/username/api-python.git
git push -u origin main
```

### Railway Features

| Feature | Cara |
|---------|------|
| Auto-deploy | Push ke branch → auto deploy |
| Environment variables | Dashboard → Variables |
| `.env` upload | Drag file `.env` ke dashboard |
| Custom domain | Settings → Domains |
| Private networking | Antar project Railway bisa saling panggil |
| Volume | Persistent storage (database file, upload) |
| Health check | Otomatis restart kalo crash |
| Logs | Dashboard → Deployments → View logs |

## Docker Deploy — Portable & Konsisten

Docker = bungkus aplikasi + environment jadi 1 container. Jamin jalan sama di laptop manapun.

### Dockerfile Dasar

```dockerfile
# Dockerfile — letakkan di root project
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

### Build & Run Lokal

```bash
# Build image
docker build -t api-saya .

# Run container
docker run -p 3000:3000 api-saya
# Buka http://localhost:3000

# Test
curl http://localhost:3000/api/halo
```

### Deploy Docker ke Railway

Railway detect Dockerfile otomatis — tinggal push repo yang ada Dockerfile.

```bash
# Push ke GitHub sama kayak biasa
git add Dockerfile
git commit -m "chore: tambah Dockerfile"
git push origin main
```

Railway akan:
1. Baca Dockerfile
2. Build image
3. Jalanin container
4. Expose port 3000

### Deploy Docker ke Platform Lain

| Platform | Cara | Harga |
|----------|------|-------|
| **Railway** | Push repo with Dockerfile | Gratis limited |
| **Fly.io** | `fly launch` + `fly deploy` | Gratis 3 VM |
| **Render** | Connect GitHub, select Docker | Gratis 750 jam |
| **Google Cloud Run** | `gcloud run deploy` | Pay per use |
| **AWS ECS** | Push ke ECR + deploy | Berbayar, kompleks |

## Environment Variable Management

### Jangan Hardcode!

```javascript
// ❌ SALAH — jangan hardcode secret di kode!
const DB_PASS = 'rahasia123';
const API_KEY = 'sk-abcdef';

// ✅ BENAR — pake environment variable
const DB_PASS = process.env.DB_PASS;
const API_KEY = process.env.API_KEY;
```

### Local Development

Bikin `.env` (jangan di-commit — masukin .gitignore):

```env
# .env
DB_HOST=localhost
DB_USER=admin
DB_PASS=rahasia123
API_KEY=sk-xxx
APP_NAME=Portfolio API
NODE_ENV=development
```

Baca di code:

```javascript
// Pakai dotenv (install: npm install dotenv)
require('dotenv').config();

const dbPass = process.env.DB_PASS;
const apiKey = process.env.API_KEY;
const appName = process.env.APP_NAME || 'Default';
```

### Production — 3 Lingkungan Standar

| Environment | Tujuan | .env file |
|-------------|--------|-----------|
| **development** | Local laptop | `.env` |
| **staging** | Mirror produksi buat test | `.env.staging` |
| **production** | Live, real user | `.env.production` |

```javascript
// Load env sesuai NODE_ENV
const env = process.env.NODE_ENV || 'development';
require('dotenv').config({ path: `.env.${env}` });
// Kalo NODE_ENV=production, load .env.production
```

### Secret Management di Cloud

**Jangan commit .env ke GitHub!** Pake fitur secret management platform:

| Platform | Lokasi |
|----------|--------|
| Vercel | Dashboard → Settings → Environment Variables |
| Railway | Dashboard → Variables |
| Cloudflare | Dashboard → Environment Variables |
| GitHub | Repo → Settings → Secrets and variables → Actions |

```bash
# Alternatif: GitHub CLI + gh secret
gh secret set DB_PASS --body "rahasia123"
gh secret set API_KEY --body "sk-xxx"
```

## CI/CD Pipeline — Otomatis Deploy

CI/CD = **Continuous Integration / Continuous Deployment**. Tiap push ke main → auto test → auto deploy.

### GitHub Actions + Vercel

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

Dapatkan `VERCEL_TOKEN`: Vercel → Settings → Tokens → Create token.
Dapatkan `VERCEL_ORG_ID` & `VERCEL_PROJECT_ID`: `vercel pull` di project lokal.

### GitHub Actions + Railway

```yaml
# .github/workflows/deploy-railway.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Deploy
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

Dapatkan `RAILWAY_TOKEN`: Railway → Dashboard → Account → Tokens.

### CI Pipeline — Test Dulu, Baru Deploy

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test        # Jalanin test dulu
      - run: npm run lint     # Cek format kode

  deploy:
    needs: test               # Gak akan jalan kalo test gagal
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Rollback Strategies — Balik ke Versi Sebelumnya

### Git Revert — Kembalikan Kode

```bash
# Bikin commit baru yang "membatalkan" commit rusak
git revert abc123
git push origin main
# Ini aman — history tetap utuh, gak ada force push
```

### Vercel Rollback

1. Dashboard Vercel → project → Deployments
2. Scroll ke deployment yang stabil
3. Klik ⋮ (3 titik) → **Promote to Production**
4. Done — rollback dalam detik

### Railway Rollback

1. Dashboard Railway → project → Deployments
2. Pilih deployment yang mau di-restore
3. Klik **Redeploy** → rollback ke versi itu

### Cloudflare Pages Rollback

1. Dashboard Cloudflare Pages → project → Deployments
2. Cari deployment stabil
3. Klik ⋮ → **Rollback to this version**

### Strategi Rollback

| Strategi | Cara | Kecepatan | Risiko |
|----------|------|-----------|--------|
| **Git revert** | Commit baru yang balikin perubahan | Menit | Rendah — history rapi |
| **Platform rollback** | 1 klik di dashboard Vercel/Railway | Detik | Rendah — langsung |
| **Feature flag** | Matiin fitur dari dashboard tanpa deploy | Detik | Rendah — gak perlu rollback |
| **Blue-green deploy** | 2 environment, tinggal switch traffic | Detik | Rendah — tapi butuh infra lebih |
| **Database migration rollback** | `migrate:undo` | Menit | Tinggi kalo data udah berubah |

### Blue-Green Deployment

```
Sebelum deploy:
[Live] v1.0 (Blue)  ← user
[Standby] v1.0 (Green)

Sesudah deploy:
[Standby] v1.0 (Blue)
[Live] v1.1 (Green) ← user

Kalo error:
[Live] v1.0 (Blue) ← user (balik)
```

Implementasi simpel di Railway:
1. Deploy ke **Staging** environment
2. Test
3. Promote Staging ke Production
4. Kalo error, balikin Production ke versi lama

## Monitoring — Pantau Aplikasi Live

### Uptime Monitoring

```bash
# Pake curl di cron job
curl -I https://landing-page.vercel.app
# HTTP/2 200 — artinya hidup

# Better: pake uptimerobot.com (gratis)
# Atau betterstack.com/uptime
```

### Health Check Endpoint

Bikin endpoint `/api/health` di backend:

```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

Platform kaya Railway pake health check buat restart otomatis kalo app crash.

## Custom Domain

### Vercel

Dashboard project → **Settings** → **Domains** → masukin domain kamu (misal `portofolio-saya.com`) → ikutin instruksi DNS (CNAME record).

```dns
# DNS record
Tipe: CNAME
Nama: @ (atau www)
Target: cname.vercel-dns.com
```

### Railway

Dashboard project → **Settings** → **Domains** → **Custom Domain** → ikutin instruksi DNS.

### Cloudflare Pages

Dashboard → project → **Custom domains** → **Set up a custom domain** → masukkan domain → ikutin instruksi.

### Rekomendasi Domain Gratis / Murah

- [Niagahoster](https://niagahoster.co.id) — .com ~150rb/thn
- [Cloudflare Registrar](https://cloudflare.com) — harga modal (+- 90rb/thn)
- [Freenom](https://freenom.com) — .tk, .ml, .ga (gratis, kadang bermasalah)
- [Vercel subdomain](https://vercel.com) — `namamu.vercel.app` (gratis)
- [Railway subdomain](https://railway.com) — `project.up.railway.app` (gratis)
- [Cloudflare Pages subdomain](https://pages.cloudflare.com) — `project.pages.dev` (gratis)

## Troubleshooting Deploy

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Build gagal | Missing dependency | Cek `package.json` / `requirements.txt` |
| 404 after deploy | Routing salah | Vercel: pake `vercel.json` rewrite |
| CORS error | Backend gak izinin frontend | Tambah `cors()` middleware |
| Env variable undefined | Gak di-set di cloud | Cek dashboard → Environment Variables |
| Port not binding | PORT env gak dibaca | Pastiin `process.env.PORT` |
| 502 Bad Gateway | App crash on start | Cek logs di dashboard platform |
| SSL error | Cert belum propagate | Tunggu 5-30 menit |
| Rate limited | API kena batas | Tambah delay / cache |

## Latihan

1. **Landing Page** — bikin landing page (HTML+CSS+JS), push ke GitHub, deploy ke Vercel
2. **React / Next.js** — bikin project Next.js sederhana, deploy ke Vercel
3. **Express API** — bikin Express API dengan 2 endpoint, deploy ke Railway, test pake curl
4. **Python API** — bikin Flask API, deploy ke Railway
5. **Cloudflare Pages** — deploy ulang landing page ke Cloudflare Pages
6. **Environment Variable** — tambah env variable `SITE_NAME` di Vercel, pake di landing page, re-deploy
7. **CI/CD Pipeline** — bikin GitHub Actions workflow: push → test otomatis → deploy ke Vercel
8. **Docker Deploy** — tambah Dockerfile ke project API, deploy ke Railway pake Docker
9. **Rollback Simulation** — deploy versi error, rollback di Vercel/Railway
10. **Custom Domain** — hubungin subdomain gratisan (`namamu.vercel.app`) atau domain beli
11. **Health Check** — tambah endpoint `/api/health` ke API, deploy
12. **Blue-Green Simulasi** — Railway: 2 environment (staging + production), deploy ke staging dulu, promote
