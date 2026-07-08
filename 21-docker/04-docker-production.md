# 04 — Docker Production: Jaringan, Volume, & Best Practices

> **Durasi:** 3 JP (135 menit)

---

## Tujuan Pembelajaran

Setelah sesi ini, siswa mampu:

- Menjelaskan dan memilih mode networking Docker (bridge, host, none, custom)
- Menggunakan bind mount, named volume, dan tmpfs untuk persist data
- Menambahkan healthcheck pada Dockerfile dan compose
- Menerapkan restart policies yang sesuai
- Mengatur resource limits (memory & CPU) untuk kontainer
- Menerapkan production best practices untuk keamanan dan performa
- Memahami konsep docker-in-docker untuk CI/CD pipeline

---

## 1. Docker Networking

Docker punya beberapa mode network. Pilihan network menentukan bagaimana kontainer berkomunikasi satu sama lain dan dengan host.

### Bridge (Default)

Setiap kontainer dapat IP internal di jaringan `bridge`. Bisa saling akses via IP, tapi lebih baik pakai service name (di docker-compose) atau nama kontainer.

```bash
# Lihat network yang ada
docker network ls

# Inspect network bridge
docker inspect bridge

# Jalanin kontainer di network bridge (default)
docker run -d --name app1 nginx:alpine
docker run -d --name app2 nginx:alpine

# Cek IP kontainer
docker inspect app1 | grep IPAddress
```

### Host

Kontainer pakai network host langsung — port terbuka tanpa NAT. Cepat, tapi kurang isolasi. Cocok untuk workload yang butuh performa jaringan maksimal.

```yaml
services:
  app:
    network_mode: host
```

```bash
# Host mode — port kontainer langsung di host
docker run --network host nginx:alpine
# Akses langsung di http://localhost:80 (tanpa port mapping)
```

### None

Kontainer tanpa network interface sama sekali. Paling aman, cocok untuk job offline atau batch processing.

```yaml
services:
  batch-job:
    network_mode: none
```

```bash
docker run --network none alpine sleep 9999
# Kontainer ini nggak punya akses internet sama sekali
```

### Custom Network

Buat jaringan terisolasi sendiri. Di custom network, **service name = hostname** — container bisa akses satu sama lain pakai nama, bukan IP.

```bash
# Buat custom network
docker network create my-network

# Jalanin container di network yang sama
docker run -d --network my-network --name api my-api
docker run -d --network my-network --name db postgres:16-alpine

# API bisa akses DB dengan hostname "db" (bukan IP)
# Dari dalam kontainer: psql -h db -U user
```

Di docker-compose:

```yaml
services:
  backend:
    networks:
      - app-net

  db:
    networks:
      - app-net

networks:
  app-net:
    driver: bridge
```

### Network Commands Cheatsheet

```bash
docker network ls                    # Daftar network
docker network create net-name      # Buat custom network
docker network rm net-name          # Hapus network
docker network inspect net-name     # Detail network
docker network connect net-name kontainer   # Sambung kontainer ke network
docker network disconnect net-name kontainer # Putus kontainer dari network
```

---

## 2. Volumes & Bind Mounts

Keduanya untuk **persist data** — data tetap ada meski kontainer dihapus. Tapi ada perbedaan penting.

### Perbandingan

| Aspek | Volume | Bind Mount |
|-------|--------|------------|
| Lokasi | `docker volume inspect` (kelola Docker) | Path host (user-defined) |
| Manajemen | Docker yang urus | Manual (path host) |
| Backup | `docker run --rm -v volume:/data ...` | Langsung copy dari folder host |
| Kinerja | Lebih cepat | Tergantung OS |
| Cocok | Data DB, file aplikasi | Development, hot-reload |

### Named Volume

Dikelola sepenuhnya oleh Docker. Data disimpan di area khusus Docker.

```bash
# Buat volume
docker volume create my-data

# Lihat daftar volume
docker volume ls

# Detail volume (lokasi fisik)
docker volume inspect my-data

# Gunakan volume di kontainer
docker run -v my-data:/app/data my-image
docker run --mount source=my-data,target=/app/data my-image   # syntax baru
```

### Bind Mount

Mapping langsung ke path di host. File di host dan kontainer sinkron. Cocok untuk development — edit file di host, perubahan langsung terlihat di kontainer.

```bash
# Bind mount current directory ke /app
docker run -v $(pwd):/app my-image
docker run --mount type=bind,source=$(pwd),target=/app my-image

# Bind mount specific path
docker run -v /home/user/project:/app my-image
```

### tmpfs Mount

Data disimpan di RAM — cepat, hilang saat kontainer mati. Cocok untuk data sementara (cache, session).

```bash
# tmpfs mount — kecepatan RAM
docker run --tmpfs /app/cache my-image
docker run --mount type=tmpfs,target=/app/cache,tmpfs-size=100m my-image
```

### Di docker-compose — Kombinasi

```yaml
services:
  app:
    volumes:
      - ./src:/app/src              # bind mount — hot reload
      - ./uploads:/app/uploads      # bind mount
      - node_modules:/app/node_modules  # named volume
      - /tmp/app-cache:/app/cache   # bind mount (temp)

  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data  # named volume — data DB

volumes:
  node_modules:
  postgres_data:
```

---

## 3. Healthcheck

Healthcheck = Docker ngecek apakah aplikasi di dalam kontainer sehat (bisa serve request). Kalau healthcheck gagal, Docker bisa restart otomatis.

### Di Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "index.js"]
```

### Di docker-compose

```yaml
services:
  backend:
    build: .
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s

  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### depends_on dengan Healthcheck

Biar service nunggu sampai benar-benar siap:

```yaml
services:
  backend:
    depends_on:
      db:
        condition: service_healthy
```

---

## 4. Restart Policies

Kebijakan restart menentukan apa yang terjadi saat kontainer crash atau host restart.

| Policy | Perilaku |
|--------|----------|
| `no` | Jangan restart otomatis (default) |
| `always` | Selalu restart, termasuk saat Docker daemon restart |
| `unless-stopped` | Restart, kecuali di-stop manual |
| `on-failure` | Restart hanya kalau exit code != 0 |

```bash
# Contoh perintah
docker run -d --restart always nginx:alpine
docker run -d --restart on-failure:5 my-app   # max 5 kali retry
```

```yaml
services:
  app:
    restart: always          # produksi — auto recovery
  worker:
    restart: on-failure      # batch job — retry kalau gagal
  cron:
    restart: unless-stopped  # cron job
```

---

## 5. Resource Limits

Batasi memory dan CPU biar satu kontainer nggak boros resource host.

### Memory

```bash
# Batasi maks 512MB, swap 256MB
docker run -d --memory="512m" --memory-swap="768m" my-image
docker run -d --memory="1g" --memory-reservation="500m" my-image
```

### CPU

```bash
# Batasi 1.5 core
docker run -d --cpus="1.5" my-image

# Prioritaskan CPU shares
docker run -d --cpu-shares=512 my-image
docker run -d --cpu-shares=1024 my-important-image  # lebih prioritas
```

### Di docker-compose

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.75'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  db:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

---

## 6. Production Best Practices

### 1. Gunakan `.dockerignore`

Hindari file nggak perlu masuk image:

```dockerfile
# .dockerignore
node_modules
.git
.env
dist
*.md
.DS_Store
coverage
```

### 2. Pisahkan `COPY` untuk Optimasi Layer Cache

COPY package.json dulu, baru COPY source code. Biar cache npm ci nggak rusak.

```dockerfile
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
```

### 3. Gunakan `npm ci` bukan `npm install`

`npm ci` install sesuai lockfile — lebih cepat, reproducible, dan gagal kalau lockfile nggak sinkron.

### 4. Jalankan sebagai Non-root User

Default container jalan sebagai root — bahaya security.

```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

### 5. Minimalisir Layer

Gabung RUN yang berkaitan:

```bash
# ❌ Kurang efisien — banyak layer
RUN apt update
RUN apt install -y curl
RUN rm -rf /var/lib/apt/lists/*

# ✅ Lebih baik — satu layer
RUN apt update && apt install -y curl && rm -rf /var/lib/apt/lists/*
```

### 6. Gunakan Specific Tag

Jangan pakai `latest` di produksi — bisa bikin image beda tiap build.

```dockerfile
# ❌ Hindari
FROM node:latest

# ✅ Pakai
FROM node:20-alpine
```

### 7. Scan Image untuk Vulnerability

```bash
# Gunakan Docker Scout
docker scout quickview my-image

# Atau Trivy (open source)
trivy image my-image
```

### 8. Jangan Simpan Secret di Image

Gunakan environment variable atau secret manager — jangan hardcode di Dockerfile.

```dockerfile
# ❌ JANGAN
ENV DB_PASSWORD=supersecret123

# ✅ Pakai ENV dari compose atau runtime
ENV DB_PASSWORD=${DB_PASSWORD}
```

---

## 7. Docker-in-Docker (DinD) untuk CI/CD

Di pipeline CI/CD (GitHub Actions, GitLab CI), seringkali kita perlu build & push image Docker. Masalahnya: pipeline berjalan di kontainer, tapi `docker` command perlu akses ke Docker daemon.

### Solusi 1: Bind Mount Docker Socket

Pasang socket Docker host ke kontainer CI. Kontainer CI bisa panggil daemon host.

```yaml
# di GitLab CI / GitHub Actions
services:
  docker:
    image: docker:24-cli
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

### Solusi 2: Docker-in-Docker (DinD)

Jalanin Docker daemon di dalam kontainer. Isolasi penuh — cocok untuk multi-tenant CI.

```bash
# Jalanin DinD
docker run --privileged -d --name dind docker:24-dind

# Di dalam kontainer, pakai Docker seperti biasa
docker exec dind docker build -t my-app .
docker exec dind docker push my-app
```

### docker-compose untuk CI

```yaml
version: '3.8'

services:
  dind:
    image: docker:24-dind
    privileged: true
    environment:
      DOCKER_TLS_CERTDIR: ""
    volumes:
      - dind-cache:/var/lib/docker

  app:
    image: docker:24-cli
    depends_on:
      - dind
    environment:
      DOCKER_HOST: tcp://dind:2375
    volumes:
      - .:/app
    working_dir: /app
    command: >
      sh -c "docker build -t my-app . && docker images"

volumes:
  dind-cache:
```

---

## 8. Latihan

1. **Network exploration:** Buat 2 kontainer. Satu di bridge default, satu di host network. Bandingkan kemampuan akses jaringan.
2. **Custom network:** Buat custom network. Jalanin 2 kontainer di network yang sama. Verifikasi bisa ping pakai nama kontainer.
3. **Bind mount dev:** Bind mount direktori proyek ke kontainer. Edit file di host, cek perubahan di kontainer.
4. **Named volume:** Buat volume untuk data PostgreSQL. `docker compose down -v` dan pastikan data hilang. Bandingkan dengan `docker compose down` (tanpa `-v`).
5. **Healthcheck:** Tambah healthcheck ke Express app. Verifikasi dengan `docker ps` lihat status health.
6. **Resource limits:** Jalanin kontainer dengan `--memory=100m --cpus=0.5`. Test dengan stress tool: `docker run --memory=100m alpine sh -c "yes > /dev/null & yes > /dev/null & wait"`.
7. **Non-root user:** Tambah `USER appuser` ke Dockerfile. Build dan run. Cek user dengan `whoami` via exec.
8. **CI simulation:** Coba bind mount socket Docker: `docker run -v /var/run/docker.sock:/var/run/docker.sock docker:24-cli docker ps`. Bandingkan dengan DinD.

---

## Ringkasan

- **Network:** bridge (default), host (cepat), none (isolasi), custom (service name = hostname)
- **Volume:** named volume (produksi), bind mount (dev), tmpfs (RAM/session)
- **Healthcheck:** `HEALTHCHECK` di Dockerfile atau compose — pastikan app benar-benar siap
- **Restart:** `always`, `unless-stopped`, `on-failure` — pilih sesuai kebutuhan
- **Resource limits:** `--memory`, `--cpus` — cegah satu kontainer boros semua resource
- **Best practices:** `.dockerignore`, non-root user, specific tag, layer cache, scan vulnerability
- **DinD:** Docker-in-Docker untuk CI/CD pipeline
- **Monitoring:** Selalu pantau resource usage kontainer dengan `docker stats` untuk mendeteksi bottleneck sejak dini

---
<table>
<tr>
<td align="center"><a href="03-docker-compose.md">← Sebelumnya: Docker Compose</a></td>
<td align="center"><a href="README.md">↑ Index Modul</a></td>
</tr>
</table>
