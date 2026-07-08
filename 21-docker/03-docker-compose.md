# 03 — Docker Compose: Orkestrasi Multi-Kontainer

> **Durasi:** 3 JP (135 menit)

---

## Tujuan Pembelajaran

Setelah sesi ini, siswa mampu:

- Menulis file `docker-compose.yml` untuk aplikasi multi-service
- Menjelaskan key dalam compose: services, ports, volumes, environment, depends_on
- Membuat konfigurasi untuk aplikasi full-stack (FE + BE + DB + Redis)
- Menggunakan perintah docker compose: up, down, logs, exec, ps, build
- Mengelola environment variable dengan `env_file` dan `environment`

---

## 1. Kenapa Docker Compose?

Kalau aplikasi butuh lebih dari satu service — misalnya backend + database + redis — naikin satu-satu dengan `docker run` itu repot. Harus bikin network manual, urus port forwarding, atur dependensi.

**Docker Compose** = alat buat **mendefinisikan dan menjalankan aplikasi multi-kontainer** dalam satu file YAML.

**Tanpa Compose:**
```bash
docker network create app-net
docker run -d --network app-net --name db -e POSTGRES_PASSWORD=secret postgres:16-alpine
docker run -d --network app-net --name redis redis:7-alpine
docker run -d --network app-net --name app -p 3000:3000 my-app
```

**Dengan Compose — satu file, satu perintah:**
```bash
docker compose up -d
```

---

## 2. Struktur Dasar `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## 3. Key dalam docker-compose.yml

### `version`

Versi format file Compose. Untuk Docker Engine 19+, pakai `'3.8'` ke atas.

### `services`

Daftar kontainer (service) yang akan dijalankan. Setiap service punya konfigurasi sendiri.

### `build`

Path ke direktori yang berisi Dockerfile (build context). Kalau menggunakan image siap pakai, pakai `image` sebagai gantinya.

```yaml
services:
  app:
    build: .                     # Dockerfile di direktori yang sama
    build:
      context: ./backend         # build context di ./backend
      dockerfile: Dockerfile.prod # Dockerfile dengan nama khusus
```

### `image`

Pakai image yang sudah ada — dari Docker Hub atau registry lain.

```yaml
services:
  db:
    image: postgres:16-alpine    # dari Docker Hub
  redis:
    image: my-registry.com/redis:custom
```

### `ports`

Forward port dari host ke kontainer. Format: `"host:container"`.

```yaml
ports:
  - "3000:3000"      # host:3000 → container:3000
  - "8080:80"        # host:8080 → container:80
  - "3000"           # random port host → container:3000
  - "443:443/tcp"    # spesifik protocol
```

### `volumes`

Persist data — bisa berupa bind mount atau named volume.

```yaml
volumes:
  - ./src:/app/src                    # bind mount (path host)
  - pgdata:/var/lib/postgresql/data   # named volume
  - /absolute/path/data:/app/data     # absolute path bind mount
```

### `environment` / `env_file`

Set environment variable di kontainer. Dua cara:

```yaml
# Cara 1: langsung (environment)
environment:
  NODE_ENV: production
  DB_HOST: db
  DB_PORT: "5432"

# Cara 2: .env file
env_file: .env

# Bisa juga array
environment:
  - NODE_ENV=production
  - DB_HOST=db
```

### `depends_on`

Urutan start service. Docker Compose jalanin service sesuai depends_on.

```yaml
depends_on:
  - db          # app baru jalan setelah db start
  - redis       # app baru jalan setelah redis start
```

> ⚠️ `depends_on` cek **service sudah start**, bukan sudah siap terima koneksi. Kalau butuh nunggu database siap, perlu `healthcheck` (dibahas di sesi 04).

### `restart`

Kebijakan restart kontainer:

```yaml
restart: no           # default — nggak restart otomatis
restart: always       # restart selalu (kecuali di-stop manual)
restart: unless-stopped  # restart, kecuali di-stop manual
restart: on-failure   # restart kalau exit code != 0
```

---

## 4. Contoh Full-stack — FE (React) + BE (Express) + DB (PostgreSQL) + Redis

Struktur direktori proyek:

```
project/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   └── ...
├── backend/
│   ├── Dockerfile
│   ├── .env
│   └── ...
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:3000

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file: ./backend/.env
    depends_on:
      - db
      - redis
    volumes:
      - ./backend/uploads:/app/uploads

  db:
    image: postgres:16-alpine
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: p4ssw0rd
      POSTGRES_DB: app_db

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    command: redis-server --requirepass redispass

volumes:
  postgres_data:
```

### Cara Jalankan

```bash
# Build & start semua service
docker compose up -d

# Streaming log dari semua service
docker compose logs -f

# Lihat status
docker compose ps

# Lihat log service tertentu
docker compose logs backend

# Eksekusi perintah di service yang jalan
docker compose exec backend sh

# Masuk ke database
docker compose exec db psql -U app_user -d app_db

# Build ulang image tanpa restart
docker compose build backend

# Restart service tertentu
docker compose restart backend

# Stop semua
docker compose down

# Stop & hapus volume juga (⚠️ data hilang!)
docker compose down -v
```

---

## 5. Environment Variable & .env File

### File `.env` (di root proyek)

Buat file `.env` di samping `docker-compose.yml`:

```
DB_PASSWORD=supersecret
APP_PORT=3000
DEBUG=false
```

Gunakan di docker-compose.yml:

```yaml
services:
  backend:
    environment:
      DB_PASSWORD: ${DB_PASSWORD}   # baca dari .env file
      APP_PORT: ${APP_PORT}
```

### Variable Interpolation

Compose support variable substitution:

```yaml
services:
  app:
    image: myapp:${TAG:-latest}    # default: latest
    ports:
      - "${APP_PORT:-3000}:3000"
```

---

## 6. Perintah Docker Compose Lengkap

| Perintah | Fungsi |
|----------|--------|
| `docker compose up -d` | Build & start semua service (background) |
| `docker compose up --build -d` | Paksa build ulang, baru start |
| `docker compose down` | Stop & hapus container + network |
| `docker compose down -v` | Juga hapus volume (⚠️ data hilang) |
| `docker compose logs -f` | Stream log semua service |
| `docker compose logs backend` | Log service tertentu |
| `docker compose ps` | Status service |
| `docker compose build` | Build ulang image tanpa start |
| `docker compose build --no-cache` | Build dari awal (no cache) |
| `docker compose restart` | Restart semua service |
| `docker compose restart backend` | Restart service tertentu |
| `docker compose exec backend sh` | Masuk shell ke service |
| `docker compose exec db psql ...` | Jalanin perintah di service |
| `docker compose stop` | Stop service tanpa hapus |
| `docker compose start` | Start ulang service yang di-stop |
| `docker compose rm` | Hapus service yang di-stop |

---

## 7. Latihan

1. **Single service:** Buat `docker-compose.yml` dengan 1 service `app` yang build dari Dockerfile Express sederhana. Jalankan dengan `docker compose up -d`.
2. **Tambah database:** Tambah service `db` dengan image `postgres:16-alpine`. Tambah `depends_on` di service app. Verifikasi app bisa connect ke DB.
3. **Environment variable:** Pindah variable ke file `.env`. Pakai `${VAR}` di compose file.
4. **Volume data:** Tambah named volume untuk data PostgreSQL. Pastikan data persist setelah `docker compose down` lalu `up` lagi.
5. **Log & exec:** Stream log dengan `docker compose logs -f`. Exec ke service backend dan cek environment variable.
6. **Full-stack:** Clone repo React + Express sederhana. Buat compose file lengkap dengan frontend, backend, postgres, dan redis.

---

## Ringkasan

- **Docker Compose** = definisikan multi-service dalam satu file YAML
- Key penting: `services`, `build`, `image`, `ports`, `volumes`, `environment`, `depends_on`
- `depends_on` = urutan start; `restart` = kebijakan restart
- File `.env` untuk variable yang bisa di-substitute di compose file
- Perintah: `up -d`, `down`, `logs -f`, `exec`, `ps`, `build`

---
<table>
<tr>
<td align="center"><a href="02-dockerfile-images.md">← Sebelumnya: Dockerfile & Images</a></td>
<td align="center"><a href="README.md">↑ Index Modul</a></td>
<td align="center"><a href="04-docker-production.md">Lanjut ke Production →</a></td>
</tr>
</table>
