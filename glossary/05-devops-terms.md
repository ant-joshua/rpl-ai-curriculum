# 🐳 DevOps Terms

> Istilah-istilah DevOps — ngelola server, deploy, dan infrastruktur.

---

### Docker
Tools buat nge-pack aplikasi + semua dependencies jadi satu container. "Works on my machine" solved.

```dockerfile
# Dockerfile — resep bikin container
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build & run
docker build -t my-app .
docker run -d -p 3000:3000 --name my-app my-app

# Lihat container
docker ps
# Output: CONTAINER ID   IMAGE     STATUS        PORTS
#          abc12345      my-app    Up 2 hours    0.0.0.0:3000->3000/tcp
```

```yaml
# Docker Compose — jalanin beberapa container bareng
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret123
```

### CI/CD (Continuous Integration / Continuous Deployment)
Otomatisasi: tiap kali push kode ke GitHub, otomatis di-test dan di-deploy.

```yaml
# .github/workflows/deploy.yml — GitHub Actions
name: CI/CD Pipeline
on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test              # CI — auto test
      - run: npm run build          # Build
      - name: Deploy to Vercel
        run: npx vercel --prod      # CD — auto deploy
```

### Deployment
Proses naro aplikasi di server internet biar bisa diakses orang lain.

```bash
# Deploy pake Vercel CLI
vercel --prod

# Deploy pake rsync ke VPS
rsync -avz --exclude node_modules ./dist/ user@vps:/var/www/app/

# Deploy pake PM2 (Node.js)
pm2 deploy ecosystem.config.js production
```

### VPS (Virtual Private Server)
Server virtual yang bisa lo sewa. Kayak komputer pribadi di cloud. DigitalOcean, Linode, Vultr, AWS EC2.

```bash
# SSH ke VPS
ssh root@123.456.789.0

# Setup dasar
apt update && apt upgrade -y
apt install nginx nodejs postgresql
```

### Cloud
Infrastruktur yang bisa dipake on-demand. Gak perlu beli server fisik. AWS, Google Cloud, Azure.

```ts
// AWS S3 — nyimpen file di cloud
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'ap-southeast-1' });
await s3.send(new PutObjectCommand({
  Bucket: 'my-app-uploads',
  Key: `users/${userId}/avatar.jpg`,
  Body: fileBuffer,
  ContentType: 'image/jpeg'
}));
```

### Scaling
Nambah kapasitas server pas traffic naik. Vertikal (server digedein) vs Horizontal (server ditambah).

```yaml
# Horizontal scaling — tambah instance
# docker-compose scale
services:
  api:
    build: .
    deploy:
      replicas: 3  # 3 container jalan bareng
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

```yaml
# Kubernetes — auto scaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Monitoring
Ngawasin aplikasi 24/7 — tau kalo ada error atau slow response.

```ts
// Pake Sentry buat error tracking
import * as Sentry from '@sentry/node';

Sentry.init({ dsn: process.env.SENTRY_DSN });

// Semua error otomatis ke-report
app.get('/api/users', async (req, res) => {
  try {
    // ...
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({ error: 'Internal error' });
  }
});
```

### Logging
Catat semua kejadian di aplikasi. Debug issue, audit trail, analytics.

```ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty', // Biar enak dibaca
  }
});

logger.info({ userId: 123, action: 'login' }, 'User logged in');
// Output: [2024-01-01 12:00:00] INFO: User logged in
//          {"userId":123,"action":"login"}

logger.error({ err: new Error('DB timeout') }, 'Database error');
```

### Environment Variable
Konfigurasi yang beda per lingkungan (dev, staging, production). Isinya API key, DB URL.

```bash
# .env file
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
JWT_SECRET="super-secret-key-123"
API_KEY="sk-..."
NODE_ENV="development"
```

```ts
// Baca env variable
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV || 'development';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET missing!');
}
```

### Nginx
Web server + reverse proxy. Sering dipake di production buat serve static files + SSL.

```nginx
# /etc/nginx/sites-available/my-app
server {
    listen 80;
    server_name my-app.com;

    location / {
        proxy_pass http://localhost:3000;  # Forward ke Node.js
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /var/www/my-app/static/;  # Serve static langsung
        expires 30d;
    }
}
```

### Kubernetes (K8s)
Platform buat nge-manage container secara otomatis. Scaling, load balancing, self-healing.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
```

### Container vs VM

| | Container (Docker) | VM (Virtual Machine) |
|---|---|---|
| Berat | Ringan (MB) | Berat (GB) |
| Boot | Detik | Menit |
| OS | Pake OS host | OS sendiri |
| Isolasi | Process-level | Hardware-level |
| Use case | Microservices, dev | Legacy apps, full OS |

### Health Check
Endpoint buat ngecek apakah aplikasi masih hidup. Dipake sama load balancer / orchestrator.

```ts
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Response: {"status":"OK","timestamp":"2024-01-01T12:00:00.000Z","uptime":12345}
```

### GitHub Actions
CI/CD bawaan GitHub. Pipeline otomatis pas push, PR, atau jadwal.

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: postgres://postgres:testpass@localhost:5432/test
```

---

*Next: [06-ai-terms.md](06-ai-terms.md) — Istilah AI*
