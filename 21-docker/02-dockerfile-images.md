# 02 — Dockerfile & Images: Bikin Image Sendiri

> **Durasi:** 3 JP (135 menit)

---

## Tujuan Pembelajaran

Setelah sesi ini, siswa mampu:

- Menulis Dockerfile dengan instruksi dasar: FROM, RUN, COPY, CMD, EXPOSE, WORKDIR
- Membangun image dari Dockerfile dengan `docker build`
- Menerapkan multi-stage build untuk memperkecil ukuran image
- Menggunakan `.dockerignore` agar build lebih cepat dan aman
- Memahami image layers & caching untuk optimasi build
- Men-tag dan push image ke Docker Hub

---

## 1. Apa Itu Dockerfile?

`Dockerfile` adalah file teks berisi instruksi untuk membangun **image** Docker. Bayangkan Dockerfile sebagai **resep masakan** — instruksi langkah demi langkah untuk menghasilkan kue (image).

### Alur Kerja

```
[Dockerfile] ──→ docker build ──→ [Image] ──→ docker run ──→ [Container]
                      ↑
              Build Context (direktori proyek)
```

---

## 2. Instruksi Dasar Dockerfile

Berikut instruksi yang paling sering dipakai:

| Instruksi | Fungsi | Contoh |
|-----------|--------|--------|
| `FROM` | Base image (wajib) | `FROM node:20-alpine` |
| `WORKDIR` | Set direktori kerja | `WORKDIR /app` |
| `COPY` | Salin file dari host → kontainer | `COPY package*.json ./` |
| `RUN` | Eksekusi perintah saat build | `RUN npm ci` |
| `CMD` | Perintah jalan saat kontainer start | `CMD ["node", "index.js"]` |
| `EXPOSE` | Dokumentasi port (info aja) | `EXPOSE 3000` |
| `ENV` | Set environment variable | `ENV NODE_ENV=production` |
| `ARG` | Variable untuk build-time | `ARG VERSION=1.0` |
| `USER` | Ganti user yang jalanin proses | `USER appuser` |
| `ADD` | COPY + otomatis extract tar/URL | `ADD app.tar.gz /app` |

### Contoh Dockerfile Sederhana — Express.js

```dockerfile
# FROM — base image (wajib)
FROM node:20-alpine

# WORKDIR — set direktori kerja di dalam kontainer
WORKDIR /app

# COPY — salin file dari host ke kontainer
COPY package*.json ./

# RUN — eksekusi perintah saat build
RUN npm ci --omit=dev

# COPY source code
COPY . .

# EXPOSE — info port yang dibuka (dokumentasi, bukan buka port)
EXPOSE 3000

# CMD — perintah jalan saat kontainer start (hanya satu CMD)
CMD ["node", "index.js"]
```

### Cara Build & Run

```bash
# Build image dari Dockerfile
docker build -t my-express-app:latest .

# Jalanin kontainer dari image
docker run -d --name my-app -p 3000:3000 my-express-app:latest

# Cek log
docker logs my-app
```

---

## 3. Build Context & `.dockerignore`

### Build Context

**Build context** = direktori yang dikirim ke Docker daemon saat `docker build`. Semua file di dalam context tersedia untuk instruksi `COPY` dan `ADD`.

```bash
# Context = direktori saat ini (.)
docker build -t my-app .

# Context = ./frontend
docker build -t frontend ./frontend

# Context dengan Dockerfile di path berbeda
docker build -t my-app -f ./deploy/Dockerfile .
```

⚠️ **Peringatan:** Jangan jalankan `docker build` dari direktori besar (Desktop, home) — Docker kirim semua file ke daemon. Build bisa lambat bahkan gagal.

### `.dockerignore`

File `.dockerignore` kerja seperti `.gitignore` — file/folder di sini **tidak dikirim** ke build context. Bikin build lebih cepat dan lebih aman.

```dockerfile
# .dockerignore
node_modules
dist
.git
.env
*.md
.DS_Store
coverage
```

**Kenapa penting?**
- Build lebih cepat (nggak kirim `node_modules` yang GB-an)
- Image lebih kecil (file nggak masuk image)
- Aman (`.env`, kredensial nggak kebawa)

---

## 4. Image Layers & Caching

### Cara Kerja Layer

Setiap instruksi di Dockerfile bikin **layer** baru. Layer-layer ini di-cache dan di-reuse.

```dockerfile
FROM node:20-alpine        # Layer 1: base image
WORKDIR /app               # Layer 2: set direktori
COPY package*.json ./      # Layer 3: package.json
RUN npm ci                 # Layer 4: install dependencies
COPY . .                   # Layer 5: source code
CMD ["node", "index.js"]   # Layer 6: metadata (tipis)
```

### Strategi Cache Layer

**Layer caching** = Docker pake cache dari build sebelumnya kalau instruksi nggak berubah. Ini bikin build ulang super cepat.

```bash
# Build pertama — lama (semua dari awal)
docker build -t my-app .

# Build kedua — cepat (kalau source code doang yang berubah)
# Karena COPY package*.json dan RUN npm CI di-cache!
docker build -t my-app .
```

**Pola Golden Rule untuk Node.js:**

```dockerfile
FROM node:20-alpine
WORKDIR /app

# 🔥 PENTING: COPY package.json DULU, baru install
# Biar layer cache npm ci nggak rusak tiap kali edit code
COPY package*.json ./
RUN npm ci --omit=dev

# Baru COPY sisanya — layer ini sering berubah
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
```

Kalau `COPY . .` dulu, setiap edit code → cache `RUN npm ci` rusak → install ulang semua. Dengan pola di atas, `npm ci` hanya jalan ulang kalau `package.json` berubah.

---

## 5. Multi-stage Build

Multi-stage = pakai **banyak `FROM`** dalam satu Dockerfile. Stage awal buat build (dengan dev tools), stage akhir cuma ambil hasilnya. Image akhir jadi kecil banget.

### Kenapa Penting?

| Image | Ukuran |
|-------|--------|
| `node:20` | ~350 MB |
| `node:20-slim` | ~200 MB |
| `node:20-alpine` | ~120 MB |
| Produksi dengan multi-stage | **< 50 MB** |

Transfer lebih cepat, storage hemat, security lebih baik (nggak ada dev tools di produksi).

### Contoh — Express TypeScript

```dockerfile
# === Stage 1: Build & Compile ===
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY src/ ./src
RUN npm run build

# === Stage 2: Production ===
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Contoh — React (Nginx)

```dockerfile
# Stage 1: Build React
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve pakai Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `--from=` Flag

`COPY --from=stage_name` ambil file dari stage lain, bukan dari host.

```dockerfile
COPY --from=builder /app/dist ./dist   # dari stage builder
COPY --from=0 /app/dist ./dist         # dari stage index 0 (stage pertama)
```

---

## 6. Tagging & Push ke Docker Hub

### Tag Image

```bash
# Format: docker tag SOURCE_IMAGE TARGET_IMAGE
docker tag my-express-app:latest username/my-express-app:v1.0
docker tag my-express-app:latest username/my-express-app:latest

# Bisa langsung saat build
docker build -t username/my-express-app:v1.0 .
```

### Push ke Docker Hub

```bash
# Login ke Docker Hub
docker login

# Push image
docker push username/my-express-app:v1.0
docker push username/my-express-app:latest

# Pull di server lain
docker pull username/my-express-app:v1.0
```

### Alur: Build → Tag → Push → Pull → Run

```
lokal: build → tag → push
                       ↓
server: pull → run
```

### Private Registry

Untuk internal team. Bisa self-hosted atau cloud:

```bash
# Self-hosted registry (port 5000)
docker run -d -p 5000:5000 --name registry registry:2
docker tag my-image localhost:5000/my-image
docker push localhost:5000/my-image

# Cloud registry (GitHub Packages, AWS ECR, GitLab Registry)
# docker tag my-image ghcr.io/username/my-image:v1
# docker push ghcr.io/username/my-image:v1
```

---

## 7. Latihan

1. **Dockerfile sederhana:** Buat Dockerfile untuk Express app sederhana. Build dengan `docker build -t latihan-express .`. Run dengan `docker run -d -p 3000:3000 latihan-express`.
2. **Caching:** Edit source code (ubah message). Build ulang. Perhatikan baris mana yang pake cache.
3. **Multi-stage:** Tambah multi-stage ke Dockerfile. Ukur ukuran image sebelum & sesudah dengan `docker images`.
4. **.dockerignore:** Buat `.dockerignore`. Cek isi build context dengan `docker build -t test . 2>&1 | grep 'upload'`.
5. **Push ke Docker Hub:** Buat akun Docker Hub (kalau belum). Tag image kamu. Push.
6. **Private registry:** Jalanin registry lokal `registry:2`. Push image ke `localhost:5000`.

---

## Ringkasan

- **Dockerfile** = resep untuk build image — instruksi FROM, RUN, COPY, CMD, EXPOSE
- **Build context** = direktori yang dikirim ke Docker daemon
- **`.dockerignore`** = filter file yang nggak perlu masuk image
- **Layer caching** = COPY package.json dulu, baru npm ci — biar cache optimal
- **Multi-stage** = build besar, hasil kecil — ideal untuk produksi
- **Tag & Push** = `docker tag` + `docker push` → distribusi image

---
<table>
<tr>
<td align="center"><a href="01-docker-basics.md">← Sebelumnya: Docker Basics</a></td>
<td align="center"><a href="README.md">↑ Index Modul</a></td>
<td align="center"><a href="03-docker-compose.md">Lanjut ke Docker Compose →</a></td>
</tr>
</table>
