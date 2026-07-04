# 🧠 Cheatsheet: Cloud Computing

> Referensi cepet — 1 halaman.

## Topik Utama

**Service Models:**
- **IaaS** — VM, storage, network (AWS EC2, DigitalOcean Droplet)
- **PaaS** — Runtime + infra managed (Heroku, Railway, Vercel)
- **SaaS** — Aplikasi siap pakai (Google Workspace, Notion)

**Deployment Models:** Public, Private, Hybrid, Multi-cloud

**Region & AZ:** Pilih region terdekat dengan user. AZ = data center terisolasi dalam 1 region.

**Compute:** EC2/Droplet, Auto Scaling, Load Balancer

**Storage:** S3/Spaces (object), CDN (Cloudflare, CloudFront), File upload handling

**Serverless:** Cloudflare Workers, Vercel Edge Functions, Railway

**IaC (Infrastructure as Code):** Terraform, Pulumi, CloudFormation

## Command / Sintaks Penting

```hcl
# Terraform — deploy EC2
resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "MyApp"
  }
}
```

```yaml
# GitHub Actions CI/CD
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_TOKEN }}
```

```javascript
// Cloudflare Workers serverless
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/hello") {
      return new Response(JSON.stringify({ msg: "Hello from edge!" }), {
        headers: { "content-type": "application/json" },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
};
```

## Tips & Trik

- **Env vars & secrets** — jangan hardcode, pake environment variables atau secret manager
- **CDN** — cache static assets di edge location (Cloudflare, CloudFront) untuk latency rendah
- **Auto Scaling** — set min/max instance, pakai load balancer
- **Serverless DB** — Turso (edge SQLite), Neon (serverless Postgres) — bagus buat Workers
- **Monitoring** — Uptime Robot, Grafana, Datadog, atau built-in cloud dashboard
- **Cost optimization** — reserved instances untuk workload stabil, spot instances untuk batch

## Common Mistakes

- **Region mismatch** — server di US, user di Indonesia = latency tinggi
- **No IaC** — manual setup = sulit reproduce / disaster recovery
- **Env vars di code** — commit secret ke git = security leak
- **No CDN** — semua request ke origin server = slow worldwide
- **No monitoring** — gak tau kalo server down sampe user complain
- **Over-provisioning** — beli instance gede dari awal, mending auto scale

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
