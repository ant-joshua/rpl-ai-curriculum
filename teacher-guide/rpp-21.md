# RPP Modul 21: Docker

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Membuat Dockerfile + multi-stage build
- Menjalankan container dengan bind mount & volume
- Mengorkestrasi multi-service dengan docker-compose
- Optimasi image size & build cache

## Tools & Bahan

- Docker Desktop / Docker Engine
- Node.js project (Express)
- PostgreSQL image
- docker-compose

---

## Sesi 1: Dockerfile + Image + Container (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Docker Concept** | Image vs Container. Dockerfile: FROM, WORKDIR, COPY, RUN, CMD, EXPOSE. Layer caching. |
| 45 menit | **Coding: Dockerfile Express** | Live coding: bikin Dockerfile untuk Express app. Build image. Run container. Bind mount untuk dev hot-reload. |
| 20 menit | **Latihan: Containerize Existing App** | Siswa bikin Dockerfile untuk project Express mereka. Build, run, test di browser. |
| 10 menit | **Review** | Kenapa layer order penting? Bedanya CMD vs RUN? Apa itu image layer? |

**Code demo:**

```dockerfile
# Dockerfile — single stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

```bash
# Build & run
docker build -t my-app:1.0 .
docker run -d --name my-app -p 3000:3000 -v $(pwd):/app my-app:1.0
docker logs -f my-app
docker exec -it my-app sh
```

**Checklist siswa:**
- [ ] Dockerfile berfungsi
- [ ] Build image sukses
- [ ] Container jalan di port
- [ ] Bind mount untuk hot-reload
- [ ] .dockerignore

---

## Sesi 2: Multi-Stage Build + Docker Compose (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Multi-Stage + Compose** | Multi-stage: stage build → stage prod. Image kecil (<50 MB). docker-compose.yml: FE + BE + DB + Redis. |
| 45 menit | **Coding: Multi-Stage + Compose** | Refactor Dockerfile ke multi-stage (build TS → run). Bikin docker-compose.yml: app + postgres + redis. |
| 20 menit | **Latihan: Full Stack Compose** | Siswa bikin compose: React FE + Express BE + PostgreSQL + Redis. Test koneksi antar service. |
| 10 menit | **Review** | Kenapa multi-stage penting? Bagaimana komunikasi antar service di compose? |

**Code demo:**

```dockerfile
# Multi-stage Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [db, redis]
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
volumes:
  pgdata:
```

**Checklist siswa:**
- [ ] Multi-stage build < 100 MB
- [ ] docker-compose multi-service
- [ ] Service communication (app → db, app → redis)
- [ ] Volume untuk persistence

---

## Sesi 3: Networking + Registry + Production (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Docker Networking + Registry** | Bridge, host, custom network. Docker Hub. Private registry. Container registry di cloud. |
| 45 menit | **Coding: Network + Push to Registry** | Setup custom network. Push image ke Docker Hub / GHCR. Pull & run di VPS. Docker system prune. |
| 20 menit | **Latihan: Production Deploy** | Siswa push image ke registry. Deploy container di VPS / local production. Setup restart policy. |
| 10 menit | **Review** | Bridge vs host network? Bagaimana security container? Restart policy? |

**Code demo:**

```bash
# Custom network
docker network create myapp-network
docker run --network myapp-network --name db postgres:16-alpine
docker run --network myapp-network --name app -p 3000:3000 my-app

# Push to registry
docker tag my-app:1.0 ghcr.io/username/my-app:latest
docker push ghcr.io/username/my-app:latest

# Production run
docker run -d --restart unless-stopped -p 3000:3000 my-app

# Cleanup
docker system prune -a
```

**Checklist siswa:**
- [ ] Custom network
- [ ] Push image ke registry
- [ ] Pull & run dari registry
- [ ] Restart policy
- [ ] docker system prune

## Assessment

| Kriteria | Bobot |
|----------|-------|
| Dockerfile + image + container | 25% |
| Multi-stage + docker-compose | 30% |
| Networking + registry + production | 30% |
| Partisipasi | 15% |
