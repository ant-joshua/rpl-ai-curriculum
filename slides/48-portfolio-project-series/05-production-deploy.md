---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🚀 Portfolio Project Series"
footer: "Sesi 05: Production Deploy"
---

<!-- _class: title -->
# Sesi 05: Production Deployment

> **Project 5 dari 5** — Setup production-grade deployment dengan Docker, VPS, CI/CD, dan monitoring

---

## 🎯 Tujuan

- Mengkonfigurasi aplikasi dengan Docker dan Docker Compose
- Menyewa dan mengkonfigurasi VPS (DigitalOcean / Linode / Contabo)
- Setup Nginx reverse proxy + SSL (Let's Encrypt / Cloudflare)
- Setup CI/CD dengan GitHub Actions
- Implementasi monitoring dengan Sentry
- Production checklist: health check, logging, backup, rate limiting, security headers

---

## 📋 Deliverable

- Production-grade deployed app: `https://app.domainkamu.com`
- GitHub Actions CI/CD pipeline
- Monitoring dengan Sentry error tracking
- Docker Compose config (app + DB + cache)
- Backup & recovery script

---

## 🧰 Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Docker + Docker Compose | Containerization |
| VPS (Ubuntu 22.04) | Server |
| Nginx | Reverse proxy |
| Cloudflare | DNS + SSL + CDN |
| Let's Encrypt / Certbot | SSL certificate |
| PM2 | Process manager (Node.js) |
| Redis | Cache & session store |
| PostgreSQL | Database |
| Sentry | Error monitoring |
| GitHub Actions | CI/CD pipeline |
| Uptime Kuma | Uptime monitoring |
| Grafana + Prometheus | Metrics (opsional) |

---

## 🗺️ Arsitektur

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Browser   │────→│  Cloudflare  │────→│  VPS Server   │
└─────────────┘     │  (DNS+SSL)   │     │  (Ubuntu 22.04)│
                    └─────────────┘     └──────┬──────────┘
                                               │
                                    ┌──────────┴──────────┐
                                    │     Nginx (443)      │
                                    │  reverse proxy       │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────┴──────────┐
                                    │   Docker Compose     │
                                    │  ┌────────────────┐  │
                                    │  │  App Container  │  │
                                    │  │  (Node/PM2)     │  │
                                    │  ├────────────────┤  │
                                    │  │  Redis          │  │
                                    │  ├────────────────┤  │
                                    │  │  PostgreSQL     │  │
                                    │  └────────────────┘  │
                                    └──────────────────────┘
```

---

## 📝 Langkah 1: Docker Setup

### Langkah 1.1: Dockerfile

Buat `Dockerfile` di root project:

```dockerfile

---

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app


---

# Copy package files
COPY package*.json ./
RUN npm ci


---

# Copy source
COPY . .


---

# Build
RUN npm run build


---

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app


---

# Install PM2
RUN npm install -g pm2


---

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma


---

# Expose port
EXPOSE 3000


---

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1


---

# Start with PM2
CMD ["pm2-runtime", "dist/index.js", "--name", "app", "-i", "max"]
```

### Langkah 1.2: Docker Compose

Buat `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: todo-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - SENTRY_DSN=${SENTRY_DSN}
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    networks:
      - app-network
    volumes:
      - app-uploads:/app/uploads
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  postgres:
    image: postgres:16-alpine
    container_name: todo-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    image: redis:7-alpine
    container_name: todo-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - app-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres-data:
  redis-data:
  app-uploads:

networks:
  app-network:
    driver: bridge
```

### Langkah 1.3: .env.production

```env

---

# Database
DB_USER=todo_user
DB_PASSWORD=generate-strong-password-here
DB_NAME=todo_production


---

# JWT
JWT_SECRET=generate-strong-random-secret
JWT_EXPIRES_IN=7d


---

# Redis
REDIS_PASSWORD=another-strong-password


---

# URLs
FRONTEND_URL=https://app.domainkamu.com


---

# Sentry
SENTRY_DSN=https://your-dsn@sentry.io/your-project


---

# Rate Limit
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Langkah 1.4: .dockerignore

```
node_modules
.git
.gitignore
*.md
.env
.env.local
.env.development
dist
coverage
test
tests
```

---

## 📝 Langkah 2: VPS Setup

### Langkah 2.1: Sewa VPS

Rekomendasi provider:
- **Contabo** — Cloud VPS XS ($6.99/bulan): 2 vCPU, 4GB RAM, 100GB SSD
- **DigitalOcean** — Basic Droplet ($6/bulan): 1 vCPU, 1GB RAM, 25GB SSD
- **Linode** — Nanode 1GB ($5/bulan): 1 vCPU, 1GB RAM, 25GB SSD

> 💡 Contabo XS recommended untuk budget, cukup untuk app + DB + Redis

### Langkah 2.2: Initial Server Setup

SSH ke VPS:

```bash
ssh root@<server-ip>
```

Update & upgrade:

```bash
apt update && apt upgrade -y
```

Buat user non-root:

```bash
adduser deploy
usermod -aG sudo deploy
```

Setup SSH key:

```bash

---

# Dari local machine
ssh-copy-id deploy@<server-ip>
```

### Langkah 2.3: Install Docker

```bash

---

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh


---

# Install Docker Compose
sudo apt install -y docker-compose-plugin


---

# Add user to docker group
sudo usermod -aG docker $USER


---

# Test
docker --version
docker compose version
```

### Langkah 2.4: Firewall Setup

```bash

---

# UFW
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Untuk testing saja, nanti dihapus
ufw enable
ufw status
```

### Langkah 2.5: Swap Memory (untuk VPS kecil)

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 📝 Langkah 3: Nginx & SSL

### Langkah 3.1: Install Nginx

```bash
apt install -y nginx
```

### Langkah 3.2: Nginx Config

Buat `/etc/nginx/sites-available/todo-app`:

```nginx
server {
    listen 80;
    server_name app.domainkamu.com;

    # Redirect HTTP → HTTPS (setelah SSL terpasang)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.domainkamu.com;

    # SSL (akan diisi Certbot nanti)
    ssl_certificate /etc/letsencrypt/live/app.domainkamu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.domainkamu.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;";

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req zone=api burst=50 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint — no rate limit
    location /health {
        proxy_pass http://localhost:3000/health;
        limit_req off;
        access_log off;
    }

    # Static files cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Block access to sensitive files
    location ~ /\.env {
        deny all;
    }
    location ~ /\.git {
        deny all;
    }

    # Logs
    access_log /var/log/nginx/todo-app-access.log;
    error_log /var/log/nginx/todo-app-error.log;
}
```

Aktifkan site:

```bash
ln -s /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Langkah 3.3: SSL dengan Certbot

```bash
apt install -y certbot python3-certbot-nginx


---

# Dapatkan SSL certificate
certbot --nginx -d app.domainkamu.com --non-interactive --agree-tos -m email@domainkamu.com


---

# Test auto-renewal
certbot renew --dry-run
```

### Langkah 3.4: Setup dengan Cloudflare (Alternatif)

1. Domain → Cloudflare → DNS → tambah A record ke IP VPS (proxy: enabled)
2. Cloudflare SSL/TLS → Full (Strict)
3. Cloudflare menghandle SSL secara otomatis
4. Di Nginx, cukup listen 80 dan trust Cloudflare

```nginx
server {
    listen 80;
    server_name app.domainkamu.com;

    # Trust Cloudflare IPs
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    # ... (daftar lengkap IP Cloudflare)
    real_ip_header CF-Connecting-IP;

    location / {
        proxy_pass http://localhost:3000;
        ...
    }
}
```

---

## 📝 Langkah 4: Deploy App

### Langkah 4.1: Clone & Setup

```bash
cd /home/deploy
git clone https://github.com/namakamu/todo-app.git
cd todo-app


---

# Buat .env.production
nano .env.production

---

# Paste environment variables


---

# Build & start
docker compose build
docker compose up -d


---

# Check logs
docker compose logs -f app
```

### Langkah 4.2: Prisma Migration

```bash
docker compose exec app npx prisma migrate deploy
```

### Langkah 4.3: Verify

```bash
curl http://localhost:3000/health

---

# → {"status":"OK","timestamp":"2025-01-01T00:00:00.000Z"}

curl http://localhost:3000/api/books?limit=1

---

# → {"success":true,"data":[...],"meta":{...}}
```

> ![Screenshot](https://via.placeholder.com/800x400?text=Production+App+Running)

---

## 📝 Langkah 5: CI/CD dengan GitHub Actions

### Langkah 5.1: GitHub Secrets

Tambahkan di GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token |
| `SERVER_HOST` | VPS IP address |
| `SERVER_USERNAME` | `deploy` |
| `SSH_PRIVATE_KEY` | Private key untuk SSH ke VPS |
| `ENV_PRODUCTION` | Isi file .env.production (base64 encoded) |

### Langkah 5.2: GitHub Actions Workflow

Buat `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/todo-app:latest
            ${{ secrets.DOCKER_USERNAME }}/todo-app:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/todo-app:cache
          cache-to: type=inline

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/deploy/todo-app
            docker compose pull app
            docker compose up -d --force-recreate app
            docker image prune -f

      - name: Health check
        run: |
          sleep 15
          curl -f https://app.domainkamu.com/health || exit 1
```

---

## 📝 Langkah 6: Monitoring & Error Tracking

### Langkah 6.1: Sentry Setup

Backend — install Sentry:

```bash
npm install @sentry/node @sentry/profiling-node
```

`src/config/sentry.ts`:

```typescript
import * as Sentry from '@sentry/node';
import { env } from './env';

export function initSentry() {
  if (!env.sentryDsn) return;

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: env.nodeEnv === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 0.1,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: true }),
    ],
  });
}
```

Tambahkan ke `app.ts`:

```typescript
import { initSentry } from './config/sentry';

initSentry();

// Sentry handler harus paling awal
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... routes ...

// Error handler — Sentry
app.use(Sentry.Handlers.errorHandler());
```

### Langkah 6.2: Uptime Monitoring

Install **Uptime Kuma** di VPS terpisah atau Docker:

```bash
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  -v uptime-kuma-data:/app/data \
  --restart unless-stopped \
  louislam/uptime-kuma:latest
```

Buka `http://<vps-ip>:3001`, buat monitor untuk `https://app.domainkamu.com/health`.

### Langkah 6.3: Logging

Logging dengan Winston + daily rotate:

```bash
npm install winston winston-daily-rotate-file
```

`src/lib/logger.ts`:

```typescript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'todo-app' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export default logger;
```

---

## 📝 Langkah 7: Backup & Disaster Recovery

### Langkah 7.1: Database Backup Script

Buat `scripts/backup.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups"
DB_NAME="todo_production"
DB_USER="todo_user"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7


---

# Backup PostgreSQL
docker compose exec -T postgres pg_dump -U ${DB_USER} ${DB_NAME} | gzip > ${BACKUP_FILE}


---

# Backup Redis
docker compose exec -T redis redis-cli -a ${REDIS_PASSWORD} save
docker compose cp redis:/data/dump.rdb ${BACKUP_DIR}/redis_${TIMESTAMP}.rdb


---

# Hapus backup lebih dari RETENTION_DAYS
find ${BACKUP_DIR} -name "${DB_NAME}_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
find ${BACKUP_DIR} -name "redis_*.rdb" -mtime +${RETENTION_DAYS} -delete

echo "Backup selesai: ${BACKUP_FILE}"
```

Jadwalkan dengan cron:

```bash
chmod +x scripts/backup.sh
crontab -e

---

# Tambahkan: 0 3 * * * /home/deploy/todo-app/scripts/backup.sh
```

### Langkah 7.2: Restore Script

`scripts/restore.sh`:

```bash
#!/bin/bash
set -e

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  exit 1
fi

gunzip -c ${BACKUP_FILE} | docker compose exec -T postgres psql -U ${DB_USER} ${DB_NAME}

echo "Restore selesai dari: ${BACKUP_FILE}"
```

---

## 📝 Langkah 8: Production Checklist

### ✅ Security

| Item | Status | Keterangan |
|------|--------|------------|
| SSH key-only auth | ☐ | Nonaktifkan password SSH |
| UFW firewall | ☐ | Hanya buka 22, 80, 443 |
| Fail2ban | ☐ | Proteksi brute force SSH |
| Auto security updates | ☐ | `unattended-upgrades` |
| HTTPS (SSL) | ☐ | Cloudflare atau Certbot |
| Security headers | ☐ | Nginx config |
| Rate limiting | ☐ | Nginx `limit_req` |
| CORS | ☐ | Batasi origin di backend |
| Environment secrets | ☐ | Jangan commit .env |
| Docker non-root | ☐ | Jangan jalankan container sebagai root |

### ✅ Reliability

| Item | Status | Keterangan |
|------|--------|------------|
| Health endpoint | ☐ | `/health` |
| Auto-restart | ☐ | Docker `restart: unless-stopped` |
| Resource limits | ☐ | Docker `mem_limit`, `cpus` |
| Graceful shutdown | ☐ | SIGTERM handler di app |
| Database connection pool | ☐ | Prisma `connection_limit` |

### ✅ Data

| Item | Status | Keterangan |
|------|--------|------------|
| Automated DB backup | ☐ | Script cron harian |
| Off-site backup | ☐ | Upload ke S3/Backblaze |
| Backup retention | ☐ | Minimal 7 hari |
| Encrypted backups | ☐ | GPG encrypt |

### ✅ Monitoring

| Item | Status | Keterangan |
|------|--------|------------|
| Error tracking (Sentry) | ☐ | Production errors |
| Uptime monitoring | ☐ | Uptime Kuma |
| Server monitoring | ☐ | `htop`, `docker stats` |
| Log rotation | ☐ | Winston daily rotate |
| Alert (email/telegram) | ☐ | Sentry + Uptime Kuma alerts |

### ✅ Performance

| Item | Status | Keterangan |
|------|--------|------------|
| Nginx gzip | ☐ | Kompresi response |
| Static file caching | ☐ | Cache headers |
| Redis cache | ☐ | Cache query results |
| Database indexing | ☐ | Index kolom yang sering di-query |
| Load testing | ☐ | k6 atau autocannon |

### ✅ CI/CD

| Item | Status | Keterangan |
|------|--------|------------|
| Tests on push | ☐ | GitHub Actions |
| Auto lint | ☐ | ESLint |
| Type check | ☐ | TypeScript strict |
| Docker build | ☐ | CI build |
| Deploy on main | ☐ | Auto deploy |
| Rollback plan | ☐ | Deploy ulang tag sebelumnya |

---

## 📝 Langkah 9: Load Testing (Opsional)

Install k6 dan test:

```bash

---

# Install k6
sudo apt install -y k6


---

# Test file: loadtest.js
cat > loadtest.js << 'EOF'
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://app.domainkamu.com/health');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

k6 run loadtest.js
```

---

## 📝 Langkah 10: Rollback Plan

Jika deploy bermasalah:

```bash

---

# Di VPS
cd /home/deploy/todo-app


---

# Rollback ke tag sebelumnya
docker compose stop app
docker compose up -d app  # atau pull versi sebelumnya


---

# Atau rollback docker image
docker compose down
git checkout <previous-tag>
docker compose build
docker compose up -d
```

Untuk rollback cepat di GitHub Actions:

```yaml

---

# Tambahkan workflow manual rollback
name: Rollback
on:
  workflow_dispatch:
    inputs:
      tag:
        description: 'Image tag to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy specific tag
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/deploy/todo-app
            TAG=${{ github.event.inputs.tag }}
            sed -i "s|image:.*|image: ${{ secrets.DOCKER_USERNAME }}/todo-app:${TAG}|" docker-compose.yml
            docker compose up -d app
```

---

## 🧪 Latihan

1. **Tambah monitoring Grafana + Prometheus** — kumpulkan metrics container dengan cAdvisor
2. **Setup staging environment** — buat `docker-compose.staging.yml` dengan database terpisah
3. **Implementasi rate limiting di backend** — tambahkan express-rate-limit dengan Redis store
4. **Database connection pooling** — konfigurasi Prisma connection pool untuk production
5. **SSH hardening** — implementasikan 2FA, port knocking, atau Wireguard tunnel
6. **S3 file uploads** — ganti local file storage dengan S3/MinIO untuk file uploads
7. **Webhook alerts** — kirim notifikasi ke Telegram/Discord ketika backup gagal
8. **Zero-downtime deployment** — implementasikan blue-green deployment dengan load balancer

---

## ✅ Final Checklist

- [ ] Dockerfile multi-stage build
- [ ] Docker Compose (app + PostgreSQL + Redis)
- [ ] VPS: SSH, Docker, Nginx installed
- [ ] Firewall configured (UFW)
- [ ] Domain pointed to VPS (Cloudflare)
- [ ] SSL certificate (Let's Encrypt / Cloudflare)
- [ ] Nginx reverse proxy with security headers
- [ ] App running (docker compose up)
- [ ] Prisma migration executed
- [ ] Health check passes
- [ ] GitHub Actions: test → build → deploy
- [ ] Sentry error tracking active
- [ ] Uptime monitoring active
- [ ] Database backup script + cron
- [ ] Rate limiting configured
- [ ] Production checklist all checked

---

> **🎉 Selamat! Kamu sudah menyelesaikan semua 5 project portfolio!**
>
> Kamu sekarang memiliki:
> 1. Landing page portfolio sendiri (Vercel/Netlify)
> 2. REST API production-ready dengan dokumentasi (Railway)
> 3. Fullstack Todo App dengan JWT + OAuth (Railway + Vercel)
> 4. AI Chat Assistant dengan Mastra AI (Vercel)
> 5. Production-grade deployment dengan Docker + VPS + CI/CD
>
> **5 project nyata = portfolio yang kuat untuk melamar kerja sebagai fullstack developer.**
>
> Jangan lupa update landing page project 1 dengan link ke semua project lainnya!

> Kembali ke [README](./README.md)
