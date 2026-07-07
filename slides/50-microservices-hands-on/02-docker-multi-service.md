---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🧩 Microservices Hands-On"
footer: "Sesi 02: Docker Multi Service"
---

<!-- _class: title -->
# Sesi 02: Docker Multi-Service

**Durasi:** 120 menit  
**Prerequisites:** Modul 21 (Docker dasar)

---

## 📌 Tujuan

- Membangun Docker Compose multi-service
- Mengelola network isolation antar service
- Konfigurasi environment per service
- Volume mounts untuk persistent data
- Health checks & restart policy

---

## 1. Docker Compose Multi-Service

### 1.1 Arsitektur Layanan

Kita akan menjalankan 4 service:

```
┌─────────────────────────────────────────────────────┐
│                  docker-compose.yml                  │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  web      │  │  api     │  │  worker  │          │
│  │ (Next.js) │  │ (Express)│  │ (Bull)   │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │              │              │                │
│       └──────────────┼──────────────┘                │
│                      │                               │
│              ┌───────┴────────┐                      │
│              │   api-gateway  │                      │
│              │   (Traefik)    │                      │
│              └───────┬────────┘                      │
│                      │                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │ postgres │  │ mongodb  │  │  mysql   │  │ rmq  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────┘ │
└─────────────────────────────────────────────────────┘
```

### 1.2 docker-compose.yml — Struktur Dasar

```yaml

---

# docker-compose.yml
version: '3.8'

services:
  # =====================
  # User Service
  # =====================
  user-service:
    build:
      context: ./services/user-service
      dockerfile: Dockerfile
    container_name: ms-user-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DB_HOST=user-db
      - DB_PORT=5432
      - DB_NAME=users
      - DB_USER=user_service
      - DB_PASSWORD=${USER_DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    env_file:
      - ./services/user-service/.env
    depends_on:
      user-db:
        condition: service_healthy
      rabbitmq:
        condition: service_started
    volumes:
      - user-service-logs:/var/log/app
    networks:
      - backend
      - database
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  user-db:
    image: postgres:16-alpine
    container_name: ms-user-db
    environment:
      - POSTGRES_DB=users
      - POSTGRES_USER=user_service
      - POSTGRES_PASSWORD=${USER_DB_PASSWORD}
    volumes:
      - user-db-data:/var/lib/postgresql/data
      - ./services/user-service/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - database
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user_service -d users"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # =====================
  # Product Service
  # =====================
  product-service:
    build:
      context: ./services/product-service
      dockerfile: Dockerfile
    container_name: ms-product-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
      - DB_HOST=product-db
      - DB_PORT=27017
      - DB_NAME=products
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    env_file:
      - ./services/product-service/.env
    depends_on:
      product-db:
        condition: service_healthy
      rabbitmq:
        condition: service_started
    networks:
      - backend
      - database
    restart: unless-stopped

  product-db:
    image: mongo:7
    container_name: ms-product-db
    environment:
      - MONGO_INITDB_DATABASE=products
    volumes:
      - product-db-data:/data/db
    networks:
      - database
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh --quiet
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # =====================
  # Order Service
  # =====================
  order-service:
    build:
      context: ./services/order-service
      dockerfile: Dockerfile
    container_name: ms-order-service
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - PORT=3003
      - DB_HOST=order-db
      - DB_PORT=3306
      - DB_NAME=orders
      - DB_USER=order_service
      - DB_PASSWORD=${ORDER_DB_PASSWORD}
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    env_file:
      - ./services/order-service/.env
    depends_on:
      order-db:
        condition: service_healthy
      rabbitmq:
        condition: service_started
    networks:
      - backend
      - database
    restart: unless-stopped

  order-db:
    image: mysql:8
    container_name: ms-order-db
    environment:
      - MYSQL_DATABASE=orders
      - MYSQL_USER=order_service
      - MYSQL_PASSWORD=${ORDER_DB_PASSWORD}
      - MYSQL_RANDOM_ROOT_PASSWORD=yes
    volumes:
      - order-db-data:/var/lib/mysql
    networks:
      - database
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # =====================
  # Message Queue
  # =====================
  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    container_name: ms-rabbitmq
    ports:
      - "5672:5672"   # AMQP
      - "15672:15672" # Management UI
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - message-queue
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_port_connectivity"]
      interval: 15s
      timeout: 10s
      retries: 5
    restart: unless-stopped

  # =====================
  # API Gateway (Traefik)
  # =====================
  gateway:
    image: traefik:v3.0
    container_name: ms-gateway
    ports:
      - "80:80"       # HTTP
      - "443:443"     # HTTPS
      - "8080:8080"   # Dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./gateway/traefik.yml:/etc/traefik/traefik.yml
      - ./gateway/dynamic.yml:/etc/traefik/dynamic.yml
    networks:
      - backend
      - frontend
    depends_on:
      user-service:
        condition: service_started
      product-service:
        condition: service_started
      order-service:
        condition: service_started
    restart: unless-stopped


---

# =====================

---

# Networks

---

# =====================
networks:
  frontend:
    driver: bridge
    name: ms-frontend
  backend:
    driver: bridge
    internal: false
    name: ms-backend
  database:
    driver: bridge
    internal: true    # Database inaccessible dari luar
    name: ms-database
  message-queue:
    driver: bridge
    internal: true    # RabbitMQ internal-only
    name: ms-queue


---

# =====================

---

# Volumes

---

# =====================
volumes:
  user-db-data:
    name: ms-user-db-data
  product-db-data:
    name: ms-product-db-data
  order-db-data:
    name: ms-order-db-data
  rabbitmq-data:
    name: ms-rabbitmq-data
  user-service-logs:
    name: ms-user-logs
```

---

## 2. Network Isolation

### 2.1 Jenis Network

| Network | Driver | Internal | Akses | Service di Dalamnya |
|---------|--------|----------|-------|-------------------|
| frontend | bridge | no | Public | gateway |
| backend | bridge | no | Service-to-service | user-service, product-service, order-service, gateway |
| database | bridge | **yes** | Service DB only | user-db, product-db, order-db, user-service, product-service, order-service |
| message-queue | bridge | **yes** | Queue only | rabbitmq, semua service |

### 2.2 Kenapa Internal Network?

```yaml

---

# Database dan Queue TIDAK perlu akses dari luar
database:
  internal: true   # Container di network ini cuma bisa diakses dari
                   # container lain yang juga di network yang sama


---

# Tanpa internal: database bisa diakses dari host → risk langsung dari luar

---

# Dengan internal: database cuma bisa diakses via service layer
```

### 2.3 Service Terhubung ke Multiple Network

```yaml

---

# user-service ada di 2 network: backend + database
services:
  user-service:
    networks:
      - backend    # → komunikasi REST antar service + gateway
      - database   # → akses ke user-db (PostgreSQL)


---

# Ini penting: database di internal network, tapi service bisa akses

---

# karena mereka satu network. Tapi dari host/luar ga bisa.
```

---

## 3. Environment per Service

### 3.1 Tiga Level Konfigurasi

```yaml
services:
  user-service:
    # Level 1: environment langsung (override .env file)
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DB_HOST=user-db

    # Level 2: env_file (default values, versioned)
    env_file:
      - ./services/user-service/.env

    # Level 3: .env file project-level (rahasia, tidak versioned)
    # Di root project: .env — docker-compose auto-load
```

### 3.2 .env File per Service

```bash

---

# services/user-service/.env — versioned, default values
DB_PORT=5432
DB_NAME=users
DB_USER=user_service
REDIS_URL=redis://redis:6379
LOG_LEVEL=info


---

# services/user-service/.env.local — NOT versioned, actual secrets
DB_PASSWORD=s3cr3t_local_dev_only
JWT_SECRET=change_me_in_production
```

### 3.3 Variable Substitution

```bash

---

# Root .env — shared across all services
USER_DB_PASSWORD=dev_password_123
ORDER_DB_PASSWORD=dev_password_456
JWT_SECRET=dev_jwt_secret
```

```yaml

---

# docker-compose.yml — referensi ke root .env
services:
  user-service:
    environment:
      - DB_PASSWORD=${USER_DB_PASSWORD}
  order-service:
    environment:
      - DB_PASSWORD=${ORDER_DB_PASSWORD}
```

---

## 4. Volume Mounts

### 4.1 Persistent Data

```yaml

---

# Data yang TIDAK boleh hilang saat container restart
volumes:
  user-db-data:               # named volume — dikelola Docker
    name: ms-user-db-data

  product-db-data:
    name: ms-product-db-data

services:
  user-db:
    volumes:
      - user-db-data:/var/lib/postgresql/data  # data PostgreSQL
```

### 4.2 Config Mounts (Bind Mount)

```yaml
services:
  gateway:
    volumes:
      # Config file dari host ke container (bind mount)
      - ./gateway/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./gateway/dynamic.yml:/etc/traefik/dynamic.yml:ro
      
      # Docker socket — Traefik butuh untuk service discovery
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

### 4.3 Init Scripts

```yaml
services:
  user-db:
    volumes:
      # SQL init — dijalankan sekali saat pertama container start
      - ./services/user-service/init.sql:/docker-entrypoint-initdb.d/init.sql
```

### 4.4 Log Volume

```yaml
services:
  user-service:
    volumes:
      - user-service-logs:/var/log/app   # log persist meski container restart

volumes:
  user-service-logs:
    name: ms-user-logs
```

---

## 5. Health Checks & Restart Policy

### 5.1 Health Check per Service

```yaml
services:
  user-db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user_service -d users"]
      interval: 10s      # cek tiap 10 detik
      timeout: 5s        # timeout 5 detik
      retries: 5         # after 5 gagal → mark unhealthy
      start_period: 30s  # grace period sebelum mulai cek

  user-service:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 5.2 depends_on with Condition

```yaml
services:
  user-service:
    depends_on:
      user-db:
        condition: service_healthy   # Tunggu sampai DB sehat
      rabbitmq:
        condition: service_started   # Tunggu container start (tidak harus sehat)
```

**Catatan:** `condition: service_healthy` baru tersedia di Compose v3.8+. Docker Compose v2+ support ini.

### 5.3 Restart Policy

```yaml
services:
  user-service:
    restart: unless-stopped
  # Nilai lain:
  # "no"         — tidak restart otomatis (default)
  # "always"     — selalu restart, termasuk setelah docker restart
  # "on-failure" — restart hanya jika exit code != 0
  # "unless-stopped" — restart kecuali dihentikan manual
```

### 5.4 Healthcheck di Dockerfile

```dockerfile

---

# services/user-service/Dockerfile
FROM node:20-alpine


---

# Install curl untuk healthcheck
RUN apk add --no-cache curl

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3001
CMD ["node", "dist/server.js"]


---

# HEALTHCHECK di Dockerfile (alternatif dari compose)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1
```

---

## 6. Latihan: docker-compose dengan 4 Service

### Studi Kasus

Buat docker-compose.yml untuk sistem **Blog Platform** dengan:

| Service | Teknologi | Port | Database |
|---------|-----------|------|----------|
| Blog API | Express + TypeScript | 4000 | PostgreSQL |
| Comment API | Express + TypeScript | 4001 | MongoDB |
| Notification Worker | Node.js + Bull | - | Redis |
| API Gateway | Traefik | 80 | - |

### Spesifikasi

1. **Blog API** — CRUD artikel, depend on: postgres (healthy), redis (started)
2. **Comment API** — CRUD komentar, depend on: mongo (healthy)
3. **Notification Worker** — process queue dari Redis, depend on: redis (healthy)
4. **API Gateway** — routing /api/blog→Blog API, /api/comment→Comment API

### Persyaratan

- Gunakan 3 network: `frontend` (public), `backend` (service-to-service), `data` (internal)
- Named volumes untuk semua database
- Health check untuk setiap database
- Restart policy `unless-stopped`
- Environment variable via `.env` file per service
- Bagian comment memiliki volume untuk MongoDB init script

### Template Jawaban

```yaml

---

# docker-compose.yml
version: '3.8'

services:
  blog-api:
    # ...

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
  data:
    driver: bridge
    internal: true

volumes:
  postgres-data:
  mongo-data:
```

---

## 📖 Referensi

- [Docker Compose Overview](https://docs.docker.com/compose/)
- [Docker Networking Overview](https://docs.docker.com/network/)
- [Health Check in Docker](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Compose File Version 3 Reference](https://docs.docker.com/compose/compose-file/compose-file-v3/)
