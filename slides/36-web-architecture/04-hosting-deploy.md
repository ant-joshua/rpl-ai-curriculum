---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/4439901/pexels-ph"
footer: "Sesi 04: Hosting Deploy"
---

<!-- _class: title -->
# 04. Hosting & Deployment

## Hosting Flow

```mermaid
graph TD
    A[Punya Code] --> B{Pilih Hosting}
    B -->|Frontend| C[Vercel / Netlify / GitHub Pages]
    B -->|Backend| D[Railway / Render / Fly.io]
    B -->|Database| E[Neon / Supabase / PlanetScale]
    C --> F[Push ke Git]
    D --> F
    E --> F
    F --> G[Auto Deploy!]
    G --> H[Live di Internet]
    style A fill:#e3f2fd
    style C fill:#c8e6c9
    style D fill:#fff9c4
    style E fill:#e1bee7
    style H fill:#ffccbc
```

---

## Static Hosting

### Vercel
- Cocok: Next.js, React, Vue, static HTML
- Fitur: Auto deploy dari GitHub, CDN global, custom domain, serverless functions
- Harga: Free tier generous (100GB bandwidth/bln)

### Netlify
- Cocok: Static site, Jamstack, Hugo, Gatsby
- Fitur: Forms, functions, split testing, deploy previews
- Harga: Free tier (100GB bandwidth/bln)

### GitHub Pages
- Cocok: Dokumentasi, portfolio, project pages
- Fitur: Gratis, auto deploy dari GitHub Actions
- Batasan: Gak bisa backend/server-side

> **Note**: Semua static hosting support custom domain + HTTPS otomatis (pake Let's Encrypt).

### Deploy Static Site — Langkah Praktis

**Via Vercel:**
```bash

---

# 1. Install Vercel CLI
npm i -g vercel


---

# 2. Deploy dari folder
vercel --prod


---

# 3. Ikutin wizard — selesai!
```

**Via GitHub Pages:**
1. Bikin repo GitHub
2. Push HTML/CSS ke `main` branch
3. Settings → Pages → pilih `main` → Save
4. Selesai! `https://username.github.io/repo/`

---

## Backend Hosting

### Railway
- Cocok: Node.js, Python, Go, Docker
- Fitur: Auto deploy dari GitHub, environment variables, database add-on
- Harga: Free tier 500 jam/bln

### Render
- Cocok: Web services, cron jobs, static sites
- Fitur: Auto HTTPS, custom domain, persistent disk
- Harga: Free tier (slow spin-up — cold start)

### Fly.io
- Cocok: Docker apps, edge deployment
- Fitur: Deploy dekat user (edge), IPv6, global
- Harga: Free tier 3 VMs

```javascript
// Contoh deploy minimal — Express.js buat Railway/Render
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Railway!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Database Hosting

### Neon (PostgreSQL)
- Fitur: Serverless Postgres, branching, auto-scale
- Harga: Free tier 500MB storage
- Cocok: Aplikasi modern, serverless

### Supabase (PostgreSQL + Backend)
- Fitur: Database + Auth + Storage + Realtime
- Harga: Free tier 500MB
- Cocok: Full-stack app pengganti Firebase

### PlanetScale (MySQL-compatible)
- Fitur: Branching database (kayak git!), auto-scale
- Harga: Free tier 1GB storage
- Cocok: Aplikasi MySQL dengan branching workflow

---

## Custom Domain & DNS

### Cara Kerja DNS

```mermaid
graph LR
    A[User] -->|ketik: mywebsite.com| B[DNS Resolver]
    B -->|tanya: dimana mywebsite.com?| C[DNS Server]
    C -->|jawab: IP 192.0.2.1| B
    B -->|arahkan ke| D[Hosting Server]
    D -->|kirim HTML| A
    style A fill:#bbdefb
    style C fill:#fff9c4
    style D fill:#c8e6c9
```

### DNS Records

| Record | Fungsi | Contoh |
|--------|--------|--------|
| **A** | Domain → IPv4 | `@` → `76.76.21.21` |
| **AAAA** | Domain → IPv6 | `@` → `2600:...` |
| **CNAME** | Domain → Domain lain | `www` → `myapp.vercel.app` |
| **MX** | Domain → Mail server | `@` → `mail.google.com` |
| **TXT** | Teks verifikasi | SPF, DKIM, domain verification |

### Setup Custom Domain

1. Beli domain dari registrar (Niagahoster, Namecheap, Cloudflare)
2. Arahkan DNS ke hosting provider
3. Di hosting (Vercel/Netlify): add custom domain
4. Tunggu propagasi DNS (5 menit — 24 jam)
5. HTTPS otomatis aktif

```bash

---

# Cek propagasi DNS
dig mywebsite.com +short
nslookup mywebsite.com
```

---

## Environment Variables

Environment variable (env vars) = konfigurasi rahasia yang gak ikut ke code.

| Variable | Contoh | Kenapa Rahasia |
|----------|--------|----------------|
| `DATABASE_URL` | `postgres://user:pass@host:5432/db` | Kredensial DB |
| `API_KEY` | `sk-abc123...` | Token API eksternal |
| `JWT_SECRET` | `supersecret123` | Signature token |
| `PORT` | `3000` | Port server (bukan rahasia) |

### Cara Pake

```bash

---

# File: .env (jangan di-commit!)
DATABASE_URL=postgres://user:pass@neon.tech/db
API_KEY=sk-test123
PORT=3000
```

```javascript
// Di code
require('dotenv').config();

const db = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;
```

> **⚠️ Jangan commit `.env`!** Tambahin ke `.gitignore`.

Di hosting (Railway/Render/Vercel), set env vars lewat dashboard → Settings → Environment Variables.

---

## Deployment Workflow (CI/CD)

**CI/CD = Continuous Integration / Continuous Deployment**

```mermaid
graph LR
    A[Push Code] -->|GitHub| B[CI Pipeline]
    B -->|Tes otomatis| C{Tests Pass?}
    C -->|Ya| D[Build]
    D --> E[Deploy ke Production]
    C -->|Tidak| F[Fix Bug]
    F --> A
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style D fill:#c8e6c9
    style E fill:#a5d6a7
    style F fill:#ffcdd2
```

### GitHub Actions Contoh

```yaml

---

# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Basic Deployment Checklist

| Step | Detail |
|------|--------|
| 1 | Code ready, tested locally |
| 2 | Push ke GitHub |
| 3 | CI run tests (lint, build, unit test) |
| 4 | Build production |
| 5 | Set environment variables di dashboard |
| 6 | Deploy (auto/ manual) |
| 7 | Test production URL |
| 8 | Setup custom domain |
| 9 | Enable HTTPS |
| 10 | Monitor (error, traffic, uptime) |

---

## Rangkuman

| Konsep | Inti |
|--------|------|
| Static Hosting | Vercel/Netlify/GitHub Pages — deploy dari Git, auto HTTPS |
| Backend Hosting | Railway/Render/Fly — jalanin server code |
| DB Hosting | Neon/Supabase/PlanetScale — database managed |
| DNS | Domain → IP, pake A/CNAME/MX records |
| Env Vars | Konfigurasi rahasia di `.env`, gak ikut code |
| CI/CD | Push → Test → Build → Deploy otomatis |

---

## Latihan

### 1. Deploy Static Site
Buat halaman portfolio sederhana (HTML + CSS) dan deploy ke **salah satu**:
- Vercel (paling gampang)
- GitHub Pages
- Netlify

Hasil: URL live bisa diakses publik.

**Template minimal:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Portfolio</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: auto; }
  </style>
</head>
<body>
  <h1>Halo, saya [Nama]</h1>
  <p>Ini portfolio pertama saya yang di-host di internet!</p>
</body>
</html>
```

### 2. Setup Custom Domain
(Bonus — klo punya domain)
- Beli domain murah (Rp 15-20rb di Niagahoster)
- Arahkan DNS ke Vercel/Netlify
- Screenshot hasil DNS records + HTTPS active

### 3. Environment Variables
Buat file `.env` untuk aplikasi todo sederhana. Isi dengan:
- `DATABASE_URL` — URL koneksi database (fake)
- `JWT_SECRET` — secret key (fake)
- `PORT` — port server
- `NODE_ENV` — environment mode

Jelaskan kenapa env vars gak boleh di-commit ke GitHub.

### 4. CI/CD Diagram
Bikin diagram Mermaid deployment pipeline untuk aplikasi fullstack:
- Developer push code ke GitHub
- GitHub Actions run tests
- Build frontend + backend
- Deploy frontend ke Vercel
- Deploy backend ke Railway
- Migrasi database di Neon
- Notifikasi ke Slack/Email

Sertain penjelasan tiap tahap.
