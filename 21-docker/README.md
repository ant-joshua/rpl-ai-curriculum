# Modul 21: Docker — Kontainer untuk Aplikasi Modern

![Docker Banner](https://www.docker.com/wp-content/uploads/2022/03/horizontal-logo-monochromatic-white.png)

**Target:** Siswa SMK RPL  \
**Level:** Pemula — Intermediate  \
**Durasi:** 11 JP (Sesi 1: 2 JP, Sesi 2-4: 3 JP masing-masing)  \
**Prasyarat:** Dasar Node.js / TypeScript, CLI Linux, Paham Client-Server  \
**Tools:** Docker Engine 24+, Docker Compose, VS Code, Terminal

---

## Tujuan Modul

Setelah menyelesaikan seluruh sesi, siswa mampu:

1. **Memahami** konsep container dan perbedaannya dengan virtual machine
2. **Menginstall** dan mengkonfigurasi Docker di sistem masing-masing
3. **Menulis** Dockerfile dengan instruksi dasar dan multi-stage build
4. **Mengelola** image Docker — build, tag, push, pull dari registry
5. **Mengorkestrasi** aplikasi multi-service dengan Docker Compose
6. **Mengkonfigurasi** jaringan, volume, dan resource limits Docker
7. **Menerapkan** production best practices (non-root, healthcheck, security)
8. **Menggunakan** Docker dalam pipeline CI/CD dengan Docker-in-Docker

---

## Sesi Pembelajaran

| # | Sesi | Deskripsi | Durasi |
|---|------|-----------|--------|
| 1 | [01 — Docker Basics](01-docker-basics.md) | Apa itu Docker, kontainer vs VM, arsitektur, install, hello-world, image vs container, perintah dasar (ps, images, pull, run, stop, rm) | 2 JP |
| 2 | [02 — Dockerfile & Images](02-dockerfile-images.md) | Dockerfile syntax (FROM, RUN, COPY, CMD, EXPOSE), build context, .dockerignore, image layers & caching, multi-stage build, tagging & push ke Docker Hub | 3 JP |
| 3 | [03 — Docker Compose](03-docker-compose.md) | docker-compose.yml, services, ports, volumes, environment, depends_on, multiple services (app + db + redis), perintah up/down/logs/exec, env file | 3 JP |
| 4 | [04 — Docker Production](04-docker-production.md) | Networking (bridge/host/none/custom), volumes (bind mount/named/tmpfs), healthcheck, restart policies, resource limits (memory/CPU), production best practices, Docker-in-Docker untuk CI | 3 JP |

### Alur Belajar

```
Sesi 01 ──→ Sesi 02 ──→ Sesi 03 ──→ Sesi 04
(Basics)    (Images)    (Compose)    (Production)
```

Setiap sesi membangun di atas sesi sebelumnya. Mulai dari dasar, naik ke orkestrasi, lalu ke production deployment.

---

## Output Akhir

Setelah menyelesaikan modul ini, siswa menghasilkan **satu proyek full-stack** yang di-dockerize secara profesional:

**Proyek Akhir:** Aplikasi Todo Full-stack (React + Express + PostgreSQL) dengan:
- ✅ Dockerfile multi-stage untuk frontend & backend (image < 100 MB)
- ✅ `.dockerignore` optimal
- ✅ Non-root user untuk security
- ✅ `docker-compose.yml` dengan frontend, backend, database, dan redis
- ✅ Named volume untuk persist data database
- ✅ Bind mount untuk hot-reload development
- ✅ Healthcheck pada setiap service
- ✅ Resource limits (memory & CPU)
- ✅ Environment variable via `.env` file
- ✅ Push image ke Docker Hub atau registry pribadi

Proyek ini bisa dijadikan portfolio dan siap dideploy ke VPS atau cloud.

---

## Quickstart — 5 Menit Pertama

Jalanin aplikasi multi-service langsung:

```bash
# 1. Clone project
git clone https://github.com/contoh/todo-app.git
cd todo-app

# 2. Build & start semua service
docker compose up -d --build

# 3. Cek status
docker compose ps

# 4. Lihat log
docker compose logs -f

# 5. Akses di browser
echo "Frontend: http://localhost:80"
echo "Backend:  http://localhost:3000"

# 6. Selesai — beresin
docker compose down -v
```

---

## Referensi Cepat Perintah Docker

### Image

```bash
docker build -t nama-image:tag .           # Build image
docker images                               # Daftar image
docker rmi nama-image:tag                   # Hapus image
docker pull node:20-alpine                  # Download image dari registry
docker push user/nama-image:tag             # Upload ke registry
```

### Kontainer

```bash
docker run -d --name myapp -p 3000:3000 my-image   # Jalankan container
docker ps                                           # Daftar container jalan
docker ps -a                                        # Semua container
docker stop myapp                                    # Stop
docker start myapp                                   # Start ulang
docker rm myapp                                      # Hapus
docker logs -f myapp                                 # Lihat log (follow)
docker exec -it myapp sh                             # Masuk shell container
docker cp file.txt myapp:/app/                       # Copy file ke container
```

### Docker Compose

```bash
docker compose up -d          # Build & jalankan semua service
docker compose down           # Stop & hapus container + network
docker compose down -v        # Juga hapus volume
docker compose logs -f        # Stream log semua service
docker compose ps             # Status service
docker compose build          # Build ulang image tanpa start
docker compose restart        # Restart semua service
```

### Volume & Network

```bash
docker volume create my-vol    # Buat volume
docker volume ls               # Daftar volume
docker network create net      # Buat network
docker network ls              # Daftar network
docker inspect myapp           # Info detail container (IP, mount, dll)
```

### Cleanup

```bash
docker system prune -a         # Hapus image/container/network tak terpakai
docker container prune         # Hapus container stop
docker image prune             # Hapus dangling image
```

---

## Ringkasan Modul

| Konsep | Inti |
|--------|------|
| **Docker** | Kemas aplikasi + dependensi jadi kontainer ringan |
| **Dockerfile** | Resep build image (FROM, WORKDIR, COPY, RUN, CMD, EXPOSE) |
| **Multi-stage** | Kecilkan ukuran image produksi |
| **docker-compose.yml** | Orkestrasi multi-service (FE + BE + DB + Redis) |
| **Networking** | Bridge (default), host (cepat), custom (isolasi) |
| **Volumes vs Bind Mounts** | Volume cocok produksi, bind mount cocok dev |
| **Registry** | Docker Hub / private registry — simpan & distribusi image |
| **Best Practices** | Multi-stage, .dockerignore, non-root, layer cache, healthcheck |

---

## Referensi & Tautan

- [Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Play with Docker](https://labs.play-with-docker.com/) — belajar Docker langsung di browser gratis
- [Docker Curriculum](https://docker-curriculum.com/) — tutorial Docker lengkap
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

> *"Works on my machine" — masalah selesai dengan Docker.*
