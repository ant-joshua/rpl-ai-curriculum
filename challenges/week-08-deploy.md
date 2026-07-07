# Week 08: Deploy — Dockerize & Deploy ke Railway/Vercel

## Tujuan

Melakukan **deployment** aplikasi Express (dari Week 03 atau Week 06) ke cloud menggunakan **Docker** dan salah satu platform: Railway, Render, atau Vercel.

## Acceptance Criteria

- [ ] **Dockerfile** yang valid untuk aplikasi Express
- [ ] **.dockerignore** file
- [ ] Image bisa di-build dan dijalankan lokal tanpa error
- [ ] Aplikasi bisa diakses via `http://localhost:3000` dari container
- [ ] **Deploy ke Railway** (atau Render / Vercel)
- [ ] Endpoint bisa diakses dari browser/curl (`https://app-anda.railway.app`)
- [ ] **Deploy URL** disertakan di README
- [ ] Environment variables dipisah (tidak hardcoded)
- [ ] README berisi: deskripsi, cara run lokal, cara deploy, endpoint list

## Step-by-Step

1. **Pilih aplikasi yang akan di-deploy**
   - Bisa API dari Week 03 (CRUD Buku) atau Week 06 (Auth)
   - Copy ke folder submission
2. **Buat Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3000
   CMD ["node", "app.js"]
   ```
3. **Buat .dockerignore**
   ```
   node_modules
   npm-debug.log
   .env
   .git
   ```
4. **Build & test image lokal**
   ```bash
   docker build -t rpl-api .
   docker run -p 3000:3000 rpl-api
   curl http://localhost:3000/buku   # harus jalan
   ```
5. **Setup akun Railway**
   - Buka [railway.app](https://railway.app)
   - Login with GitHub
   - Create New Project → Deploy from GitHub repo
6. **Push ke GitHub**
   - Buat repo baru, push kode
   - Hubungkan ke Railway
7. **Konfigurasi Railway**
   - Build command: biarkan default (detect Dockerfile)
   - Start command: biarkan default
   - Tambahkan environment variables di dashboard Railway
8. **Deploy**
   - Railway auto-deploy setelah connect
   - Tunggu build selesai
   - Buka URL yang diberikan Railway
9. **Test endpoint**
   ```bash
   curl https://your-app.up.railway.app/buku
   ```

## Bonus (Optional)

- ✅ **Docker Compose**: tambah database PostgreSQL/MariaDB sebagai service terpisah
- ✅ **CI/CD**: GitHub Actions auto-build & push ke Docker Hub
- ✅ **Custom domain** (jika punya)
- ✅ **Health check endpoint** `GET /health`

## Submission

```
challenges/submissions/week-08/nama-kamu/
├── Dockerfile
├── .dockerignore
├── (source code aplikasi)
└── README.md   (berisi deploy URL)
```

Buat Pull Request dengan judul `[Week 08] Deploy - Nama Kamu`. Sertakan **deploy URL** yang bisa diakses publik sebagai output.

> **Output:** Dockerfile + deploy URL
