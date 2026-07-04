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
