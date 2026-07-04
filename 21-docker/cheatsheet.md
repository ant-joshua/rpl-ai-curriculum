# 🧠 Cheatsheet: Docker

> Referensi cepet — 1 halaman.

## Topik Utama
- **Docker**: kemas app + dependensi jadi kontainer ringan (MB, bukan GB)
- **Image vs Container**: Image = template read-only; Container = instance jalan
- **Dockerfile**: FROM, WORKDIR, COPY, RUN, CMD, EXPOSE
- **Multi-stage Build**: stage build → stage produksi, image kecil (<50 MB)
- **docker-compose.yml**: orkestrasi multi-service (FE + BE + DB + Redis)
- **Networking**: bridge (default), host (cepat), custom (isolasi per service name)
- **Volumes vs Bind Mounts**: volume produksi, bind mount dev (hot-reload)
- **Registry**: Docker Hub (publik), private (self-hosted / cloud)

## Command / Sintaks Penting

```dockerfile
# Dockerfile multi-stage (Express TS)
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

```bash
# Image
docker build -t my-image:tag .
docker images
docker rmi my-image:tag

# Container
docker run -d --name myapp -p 3000:3000 my-image
docker ps
docker logs -f myapp
docker exec -it myapp sh
docker stop myapp && docker rm myapp

# Compose
docker compose up -d
docker compose down -v
docker compose logs -f

# Cleanup
docker system prune -a
```

```yaml
# docker-compose.yml (bagian)
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [db, redis]
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

## Tips & Trik
- **`.dockerignore`** — exclude node_modules, .git, .env biar build cepet.
- **`npm ci`** bukan `npm install` — reproducible, cepet.
- **Layer cache** — `COPY package*.json` dulu, baru `COPY . .`.
- **Jalankan non-root** — `RUN adduser appuser; USER appuser`.
- **Bind mount buat dev** — `-v $(pwd):/app` biar hot-reload.

## Common Mistakes
❌ Lupa `.dockerignore` — node_modules ikut di-copy, build lambat.
❌ `CMD node index.js` tanpa `WORKDIR` — file ga ketemu.
❌ Satu container buat banyak service — pisah per container.
❌ Image besar tanpa multi-stage — 1GB+ image produksi.
❌ Port ga di-expose — container jalan tapi ga bisa diakses.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [Docker Docs](https://docs.docker.com)
- [Docker Hub](https://hub.docker.com)
