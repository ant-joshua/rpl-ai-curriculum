# 4. IaC & Deploy: Terraform, Docker, CI/CD, Monitoring

## Infrastructure as Code (IaC)

IaC = manage infrastructure pakai code (bukan klik-klik UI). Version controlled, repeatable, auditable.

### Kenapa IaC?

- **Reproducible** — infra yang sama tiap deploy
- **Version controlled** — track perubahan infra
- **Reviewable** — PR untuk perubahan firewall? Bisa!
- **Automated** — ga ada human error klik salah

## Terraform

Terraform = de facto IaC tool. HCL (HashiCorp Configuration Language). Support semua provider.

### Install

```bash
# Linux/WSL
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

### DigitalOcean — Deploy Droplet + Firewall

```hcl
# main.tf
terraform {
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_droplet" "web" {
  image    = "ubuntu-24-04-x64"
  name     = "web-server"
  region   = "sgp1"
  size     = "s-1vcpu-1gb"
  ssh_keys = [data.digitalocean_ssh_key.main.id]

  user_data = <<-EOF
    #cloud-config
    packages:
      - nginx
    runcmd:
      - systemctl enable nginx
      - systemctl start nginx
  EOF
}

resource "digitalocean_firewall" "web" {
  name = "web-firewall"

  droplet_ids = [digitalocean_droplet.web.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = [var.my_ip]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

data "digitalocean_ssh_key" "main" {
  name = "my-key"
}

variable "do_token" {
  type = string
}

variable "my_ip" {
  type = string
}

output "droplet_ip" {
  value = digitalocean_droplet.web.ipv4_address
}
```

```bash
# Run
terraform init
terraform plan -var="do_token=$DO_TOKEN" -var="my_ip=$(curl -s ifconfig.me)/32"
terraform apply -var="do_token=$DO_TOKEN" -var="my_ip=$(curl -s ifconfig.me)/32"
terraform destroy  # cleanup!
```

## Pulumi

Pulumi = IaC pakai programming language beneran (TypeScript, Python, Go, C#).

```typescript
import * as digitalocean from "@pulumi/digitalocean";

const droplet = new digitalocean.Droplet("web", {
  image: "ubuntu-24-04-x64",
  region: "sgp1",
  size: "s-1vcpu-1gb",
  userData: `#cloud-config
packages:
  - nginx
runcmd:
  - systemctl enable nginx
  - systemctl start nginx`,
});

export const ip = droplet.ipv4Address;
```

```bash
pulumi up
```

## Docker + Cloud

### Dockerfile untuk Production

```dockerfile
# Gunakan multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Deploy Docker ke DigitalOcean App Platform

```yaml
# .do/app.yaml
name: my-api
region: sgp1
services:
  - name: api
    http_port: 3000
    image:
      registry_type: DOCKER_HUB
      registry: username/my-api
      registry_credentials: false
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: DATABASE_URL
        value: ${DATABASE_URL}
        type: SECRET
```

## CI/CD ke Cloud (GitHub Actions)

### Deploy ke DigitalOcean Droplet via SSH

```yaml
# .github/workflows/deploy.yml
name: Deploy to DO

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Droplet via SSH
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.DO_HOST }}
          username: root
          key: ${{ secrets.DO_SSH_KEY }}
          source: "dist/,package.json,package-lock.json"
          target: "/root/app"

      - name: Restart app
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DO_HOST }}
          username: root
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /root/app
            npm ci --production
            pm2 restart api || pm2 start dist/index.js --name api
```

### Deploy ke Cloudflare Workers

```yaml
# .github/workflows/deploy-worker.yml
name: Deploy Worker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
```

### Deploy Docker ke Railway

```yaml
# .github/workflows/deploy-railway.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Railway
        run: npm i -g @railway/cli

      - name: Deploy
        run: railway up --service my-api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Monitoring

### Uptime Monitoring

```bash
# Simple ping script
while true; do
  status=$(curl -s -o /dev/null -w "%{http_code}" https://your-app.com/health)
  echo "$(date) - Status: $status"
  if [ "$status" != "200" ]; then
    echo "ALERT: App down!"
    # send notification (telegram, email, slack)
  fi
  sleep 60
done
```

### BetterStack / UptimeRobot

- **BetterStack**: 5 monitor gratis, check 30 detik, status page
- **UptimeRobot**: 50 monitor gratis, check 5 menit
- **Checkly**: Browser check + API check (bisa pake Playwright)

### Logging & Metrics

```bash
# simple log monitoring — journalctl
journalctl -u nginx --since "1 hour ago" --no-pager | grep error

# tail log app
pm2 logs my-api

# structured logging (better)
```

```typescript
// Winston logger — recommended
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// di production, kirim ke: Axiom, Datadog, Grafana, atau BetterStack
```

### Health Check Endpoint

```typescript
app.get('/health', async (req, res) => {
  const dbOk = await checkDatabase();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
```

## Output Akhir Sesi

Di sesi ini kamu harus punya:
- ✅ Terraform script untuk deploy infra
- ✅ Dockerfile untuk app
- ✅ GitHub Actions workflow deploy otomatis
- ✅ Health check endpoint
- ✅ Monitoring sederhana

## Well-Architected Framework — Panduan Arsitektur Cloud

AWS Well-Architected Framework = 6 pilar buat ngevaluasi arsitektur cloud:

### 6 Pillars

| Pilar | Fokus | Contoh Implementasi |
|-------|-------|---------------------|
| **Operational Excellence** | Operasi dan monitoring | IaC (Terraform), observability, CI/CD |
| **Security** | Proteksi data & sistem | IAM, enkripsi S3, network ACL |
| **Reliability** | Recovery dari failure | Multi-AZ, backup, health check |
| **Performance Efficiency** | Efisien pake resource | Auto scaling, right-sizing instance |
| **Cost Optimization** | Bayar sesuai pemakaian | Reserved instances, spot instances |
| **Sustainability** | Ramah lingkungan | Efisiensi energi, minimal idle resources |

### Operational Excellence — Runbook

Buat runbook untuk operasional harian:

```bash
# Runbook: Deploy aplikasi
1. git pull origin main
2. npm ci
3. npm run build
4. pm2 restart api
5. curl http://localhost:3000/health
6. Confirm status: healthy

# Runbook: Rollback
1. git revert HEAD
2. git push origin main
3. Ulang deploy steps

# Runbook: Scaling
1. Cek CPU usage: htop
2. Cek memory: free -m
3. Cek disk: df -h
4. Kalo perlu: doctl compute droplet create ...
```

### Security Pillar — Checklist

| Item | Status |
|------|--------|
| ✅ SSH key only (no password) | |
| ✅ Firewall restrict port 22 ke IP tertentu | |
| ✅ HTTPS with Let's Encrypt | |
| ✅ Database tidak public-facing | |
| ✅ Secrets via environment variables | |
| ✅ Regular backup database | |
| ✅ IAM least privilege | |
| ✅ S3 bucket not public (kecuali perlu) | |

### Reliability Pillar — Health Check Lancar

```typescript
// Health check endpoint — komprehensif
app.get('/health', async (req, res) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage().heapUsed,
    database: null as boolean | null,
    redis: null as boolean | null,
    disk: null as boolean | null,
  };

  try {
    await db.raw('SELECT 1');
    checks.database = true;
  } catch {
    checks.database = false;
    checks.status = 'degraded';
  }

  try {
    await redis.ping();
    checks.redis = true;
  } catch {
    checks.redis = false;
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(checks);
});
```

### Performance Efficiency — Load Testing

```bash
# Install k6
brew install k6  # or: docker run -i grafana/k6

# Test endpoint
k6 run --vus 10 --duration 30s - <<EOF
import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const res = http.get('http://localhost:3000/api/products');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
EOF
```

### Cost Optimization — Pricing Calculator

```bash
# Estimasi biaya bulanan (1 VM + database + storage)
AWS:     EC2 t3.micro ($8.5) + RDS db.t3.micro ($15) + S3 ($1) = ~$24.5
DO:      Droplet s-1vcpu-1gb ($6) + Managed DB ($15) + Spaces ($5) = ~$26
Cloudflare: Workers ($0) + R2 10GB ($0) + Pages ($0) = $0 (free tier)

# Optimasi: reserved instance 1 year → diskon ~30%
# Optimasi: spot instance buat batch job → diskon ~70%
```

## Observability — Logging, Metrics, Tracing

### Structured Logging

```typescript
// Format JSON log — biar gampang di-parse
{"level":"info","time":"2024-07-08T10:00:00Z","msg":"request completed","method":"GET","path":"/api/users","status":200,"duration":45}
{"level":"error","time":"2024-07-08T10:00:01Z","msg":"database connection failed","error":"ECONNREFUSED","retry":3}
```

### Log Aggregasi

| Tool | Free Tier | Fitur |
|------|-----------|-------|
| **Axiom** | 500GB/bulan | Log search, dashboard, alert |
| **BetterStack** | 15GB/bulan | Log + uptime monitoring |
| **Grafana Loki** | Self-hosted | Open-source, pake Grafana |
| **Datadog** | 1-day retention | Enterprise, mahal |

### Metrics — Key Indicators (KPI)

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Response time (p95) | <200ms | >500ms | >2s |
| Error rate | <0.1% | >1% | >5% |
| CPU usage | <60% | >80% | >95% |
| Memory usage | <70% | >85% | >95% |
| Disk usage | <70% | >85% | >95% |
| Uptime | 99.9% | <99.5% | <99% |

### Alerting — Notifikasi

```bash
# Webhook notification — Telegram
curl -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
  -d "chat_id=$CHAT_ID" \
  -d "text=🚨 ALERT: App down! Response: 503 at $(date)"

# Atau Discord webhook
curl -H "Content-Type: application/json" \
  -X POST "$DISCORD_WEBHOOK_URL" \
  -d '{"content": "🚨 App is down!"}'
```

### Dashboard — Grafana / BetterStack

Bikin dashboard yang nampilin:
1. **Response time** — p50, p95, p99
2. **Error rate** — 4xx vs 5xx
3. **Traffic** — request per second
4. **Resource usage** — CPU, memory, disk
5. **Up time** — 24h, 7d, 30d
6. **Cost** — billing per service

## Latihan

1. **Terraform Deploy**: Pakai Terraform untuk deploy 1 Droplet + firewall + SSH key. App nginx auto terinstall via user_data atau cloud-config. Output IP droplet. Screenshot `terraform apply` sukses.

2. **Dockerize App**: Buat Dockerfile (multi-stage) untuk API dari sesi 2. Build image, run lokal, test. Push ke Docker Hub atau GitHub Container Registry. Dokumentasi step.

3. **CI/CD Pipeline**: Setup GitHub Actions workflow yang:
   - Build app
   - Jalankan test
   - Deploy ke Cloudflare Workers (free tier)
   - Trigger tiap push ke main
   Screenshot workflow sukses di GitHub Actions tab.

4. **Full Monitoring**: Bikin health check endpoint (`/health`). Setelah deploy, setup BetterStack atau UptimeRobot monitor. Cek status page. Simulasikan down (stop app), pastikan alert terkirim. Catat response time selama 1 jam.

5. **Terraform state management.** Bikin Terraform backend remote pake DigitalOcean Spaces atau AWS S3 untuk nyimpen state file. Konfigurasi `backend "s3" {}` atau backend DigitalOcean. Catat perbedaan local vs remote state. Screenshot state file di cloud storage.

6. **CI/CD pipeline comparison.** Setup 2 pipeline berbeda untuk deploy app yang sama: (1) GitHub Actions → SSH ke Droplet, (2) GitHub Actions → Cloudflare Workers. Bandingkan: kecepatan deploy, complexity, biaya. Tulis tabel perbandingan.

7. **Full IaC stack.** Pake Terraform untuk deploy stack lengkap: VPC + 2 subnet (public/private) + security group + 1 instance + load balancer. Output IP load balancer. Pastikan `terraform destroy` bisa hapus semua tanpa sisa. Screenshoot `terraform apply` dan `terraform destroy`.
