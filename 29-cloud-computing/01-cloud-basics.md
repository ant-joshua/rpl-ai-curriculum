# 1. Cloud Basics: Models, Region, VPC & Provider Comparison

## Konsep Cloud Computing

Cloud computing = deliver computing resources (server, storage, database, networking) over internet. Bayar sesuai pemakaian (pay-as-you-go).

### Deployment Models

| Model | Deskripsi | Contoh |
|-------|-----------|--------|
| **Public Cloud** | Provider punya infrastruktur, dipakai banyak customer | AWS, GCP, Azure, DigitalOcean |
| **Private Cloud** | Infrastruktur khusus 1 organisasi | OpenStack, VMware on-prem |
| **Hybrid Cloud** | Gabungan public + private | AWS Outposts, Azure Arc |
| **Multi-cloud** | Pake >1 public cloud provider | AWS + GCP |

### Service Models

```
┌─────────────────────────────────────┐
│            On-Premises              │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐        │
│  │ IaaS     │  │ PaaS     │        │
│  │ VM,      │  │ Runtime, │        │
│  │ Storage, │  │ DB,      │        │
│  │ Network  │  │ Middleware│        │
│  ├──────────┤  ├──────────┤        │
│  │         SaaS                  │
│  │   Aplikasi siap pakai         │
│  └──────────────────────────────┘ │
└─────────────────────────────────────┘
```

| Model | Kamu Manage | Provider Manage | Contoh |
|-------|------------|----------------|--------|
| **IaaS** | OS, app, data | Server, network, storage fisik | AWS EC2, DigitalOcean Droplet |
| **PaaS** | App + data | OS, runtime, infra | Heroku, Railway, Vercel |
| **SaaS** | Hanya data | Semua | Google Workspace, Notion, Slack |

## Region & Availability Zone

- **Region**: Lokasi geografis data center (us-east-1, ap-southeast-1, ap-southeast-3)
- **Availability Zone (AZ)**: Data center terisolasi dalam 1 region (us-east-1a, us-east-1b)
- **Edge Location**: PoP (Point of Presence) untuk CDN — lebih dekat ke user

```
Region: ap-southeast-1 (Singapore)
├── AZ: ap-southeast-1a
├── AZ: ap-southeast-1b
└── AZ: ap-southeast-1c
        │
        └── Edge Locations: Jakarta, Manila, Bangkok, ...
```

**Penting**: Pilih region terdekat dengan target user untuk latency rendah.

## VPC (Virtual Private Cloud)

VPC = jaringan virtual terisolasi di cloud. Subnet, firewall, routing kamu atur sendiri.

```bash
# DigitalOcean VPC — CLI
doctl vpc create --name "my-vpc" --region "sgp1" --ip-range "10.10.0.0/16"
```

Komponen VPC:
- **Subnet**: Bagian IP range (public = internet access, private = internal)
- **Route Table**: Atur lalu lintas jaringan
- **Internet Gateway**: Gerbang ke internet
- **NAT Gateway**: Private subnet akses internet (keluar aja)
- **Security Group / Firewall**: Aturan allow/deny traffic

```bash
# Firewall rules — DigitalOcean
doctl compute firewall create \
  --name "web-firewall" \
  --inbound-rules "protocol:tcp,ports:80,address:0.0.0.0/0,protocol:tcp,ports:443,address:0.0.0.0/0,protocol:tcp,ports:22,address:YOUR_IP/32"
```

## Cloud Providers Comparison

| Fitur | AWS | GCP | Azure | DigitalOcean | Biznet Gio |
|-------|-----|-----|-------|-------------|------------|
| Compute | EC2 | Compute Engine | VM | Droplet | Gio VM |
| Serverless | Lambda | Cloud Functions | Azure Functions | Functions | — |
| Object Storage | S3 | Cloud Storage | Blob | Spaces | Gio Object |
| Managed DB | RDS | Cloud SQL | SQL DB | Managed DB | Gio DB |
| Container | ECS/EKS | GKE | AKS | DOKS | — |
| DNS + CDN | CloudFront + 53 | Cloud CDN | Azure CDN | DO DNS + CF | — |
| Free Tier | 12 bulan | 90 hari (kredit) | 12 bulan | $200 kredit 60hr | — |
| Harga VM (termurah) | ~$8.5/bln | ~$7/bln | ~$7/bln | ~$6/bln | ~$5/bln |
| Learning Curve | Tinggi | Sedang | Tinggi | Rendah | Rendah |

### Kapan Pilih Mana?

- **AWS**: Feature lengkap, market leader, banyak belajar resource
- **GCP**: AI/ML bagus, network kenceng, BigQuery
- **Azure**: Enterprise, integrasi Microsoft
- **DigitalOcean**: Developer friendly, harga predictable, cocok UKM
- **Biznet Gio**: Local (Indonesia), latency rendah, support Indonesia

## Cost Estimation

### AWS Calculator
https://calculator.aws

### DigitalOcean Pricing
```bash
# Cek harga Droplet
doctl compute size list

# Contoh: 1 Droplet basic ($6/bln) + 1 Spaces ($5/bln) + 1 Load Balancer ($12/bln)
# Total: ~$23/bln
```

### Free Tier Checklist

| Provider | Free Tier |
|----------|-----------|
| AWS | 750 jam EC2 t2.micro/bln, 5GB S3, 1GB RDS — 12 bulan |
| GCP | $300 kredit — 90 hari, Always Free: f1-micro (1 CPU, 614MB) |
| Azure | $200 kredit — 30 hari, 750 jam B1s VM — 12 bulan |
| DigitalOcean | $200 kredit — 60 hari |
| Cloudflare | Free tier: Workers 100k req/hari, R2 10GB, Pages unlimited, D1 5GB |

## Latihan

1. **Bandingkan Provider**: Pilih 3 provider (misal AWS vs DO vs Cloudflare). Buat tabel perbandingan untuk use case: "deploy REST API + database + CDN". Hitung estimasi biaya per bulan. Tulis argumen kenapa pilih provider A.

2. **VPC Setup**: Pakai DigitalOcean atau AWS free tier. Buat VPC dengan 2 subnet (public + private). Deploy 1 Droplet/EC2 di public subnet. Akses SSH cuma dari IP kamu. Screenshot hasil.

3. **Region Simulasi**: Pakai tool `ping` atau `cloudping.com`. Test latency dari lokasi kamu ke 3 region (Singapore, California, London). Catat hasilnya. Hitung rata-rata latency.

```bash
# Contoh test ping ke AWS region
ping -c 10 ec2.ap-southeast-1.amazonaws.com
ping -c 10 ec2.us-west-1.amazonaws.com
ping -c 10 ec2.eu-west-2.amazonaws.com
```

4. **Free Tier Challenge**: Daftar 2 provider free tier. Deploy 1 static HTML page di masing-masing (AWS S3 static hosting + Cloudflare Pages atau DigitalOcean App Platform). Catat prosesnya dan perbedaan UX.

5. **Cost optimization plan.** Ambil 1 aplikasi hipotetis (e-commerce dengan 3 server). Hitung biaya bulanan skenario "gak dioptimasi" vs "udah dioptimasi" (right-sizing + reserved instance + auto scaling). Tulis selisihnya.

6. **DR strategy proposal.** Bayangin aplikasi lo punya RTO 4 jam dan RPO 1 jam. Pilih DR strategy yang cocok. Tulis implementasi step-by-step: backup schedule, failover plan, testing schedule.

7. **Cloud migration plan.** Pilih 1 aplikasi (bisa punya sendiri atau fiktif). Tulis rencana migrasi pake 6 R's: assess, pilih strategy, timeline, validate, cutover, optimize. Sertakan diagram.

8. **Multi-cloud cost analysis.** Pilih 3 workload (web server, database, CDN). Hitung biaya di AWS vs DigitalOcean vs Cloudflare. Tentukan provider paling murah untuk tiap workload. Tulis kesimpulan.

---

## Cloud Cost Optimization — Jangan Boros

Bayar cloud bisa membengkak kalo gak diatur. Ini cara hematnya.

### Right-Sizing

Pilih ukuran instance yang pas, jangan over-provision.

| Kondisi | Masalah | Solusi |
|---------|---------|--------|
| CPU pake <10% selama sebulan | Instance terlalu besar | Turunkan ke size lebih kecil |
| RAM terpakai < 30% | Instance kebesaran | Pilih tipe memory-optimized lebih kecil |
| Disk 500GB terisi 10GB | Storage mubazir | Turunkan ke 50GB |

```bash
# Cek utilisasi instance di DigitalOcean
doctl compute droplet list --format "ID,Name,Memory,VCPUs,Disk,Region,Status"

# Monitor pake DO Monitoring atau AWS CloudWatch
# Rule: CPU >70% selama 1 jam → scale up
# Rule: CPU <20% selama 24 jam → scale down
```

### Reserved Instances

Bayar di muka untuk diskon besar:

| Commitment | Diskon (AWS) | Cocok buat |
|------------|-------------|------------|
| 1 year (no upfront) | ~30% | Produksi stabil |
| 1 year (partial) | ~40% | Produksi, ada budget |
| 3 year (all upfront) | ~60% | Workload tetap, long-term |
| Spot instances | ~70-90% | Batch job, stateless |

### Auto Scaling untuk Hemat

```yaml
# Jalanin 2 instance minimum, scale ke 10 kalo perlu
# Dibanding 10 instance nyala 24/7 — hemat 80%
min: 2
max: 10
target_cpu: 60%
```

### Storage Tiering

| Tier | Biaya/GB/bln | Akses | Cocok |
|------|-------------|-------|-------|
| Hot (S3 Standard) | ~$0.023 | Milidetik | Data sering diakses |
| Cool (S3 Infrequent Access) | ~$0.0125 | Milidetik | Data jarang diakses |
| Cold (S3 Glacier) | ~$0.004 | Menit-jam | Backup, archive |
| Deep Archive | ~$0.001 | 12 jam | Data hukum, compliance |

### Budget Alert

```bash
# AWS Budget — notifikasi kalau > 80% budget
aws budgets create-budget \
  --account-id 123456789 \
  --budget '{
    "BudgetName": "monthly-budget",
    "BudgetLimit": { "Amount": "100", "Unit": "USD" },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }'

# DigitalOcean — set alert di dashboard
# Billing → Alerts → "Alert me when spending exceeds $50"
```

---

## Multi-Cloud Strategy — Jangan Taruh Semua Telur di Satu Keranjang

Pake >1 cloud provider untuk redundancy, best-of-breed, atau negosiasi harga.

### Kenapa Multi-Cloud?

| Alasan | Contoh |
|--------|--------|
| **Avoid vendor lock-in** | Pake Terraform biar bisa pindah provider kapan aja |
| **Best-of-breed** | Compute di AWS, AI/ML di GCP, CDN di Cloudflare |
| **Redundancy** | Kalo AWS down, traffic pindah ke GCP |
| **Negosiasi harga** | Pake multi-cloud sebagai leverage |
| **Compliance** | Data di region tertentu harus pake provider lokal |

### Arsitektur Multi-Cloud

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   AWS        │    │   GCP        │    │  Cloudflare   │
│              │    │              │    │              │
│  EC2 + RDS   │    │  GKE + BigQuery│  │ Workers + R2 |
│  (compute)   │    │  (analytics)  │    │  (edge)      │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                      │
                ┌──────┴──────┐
                │  Terraform  │ ← Single source of truth
                └─────────────┘
```

### Tantangan Multi-Cloud

| Tantangan | Solusi |
|-----------|--------|
| Complexity tinggi | Standardisasi: semua pake Kubernetes |
| Data transfer antar cloud mahal | Design data local, jangan bolak-balik |
| Skill tim terpecah | Fokus 1 primary cloud + 1 secondary |
| Security fragmented | Pake centralized IAM (Okta, Auth0) |

---

## Cloud Migration Strategies — 6 R's

Mindahin aplikasi dari on-prem atau cloud lain ke cloud target.

| Strategy | Arti | Kapan Pake |
|----------|------|------------|
| **Rehost** (Lift & Shift) | Pindahin VM apa adanya | Cepat, minimal perubahan |
| **Replatform** (Lift & Reshape) | Pindah + optimasi dikit | Mau dapet benefit cloud tanpa rewrite |
| **Refactor** (Re-architect) | Tulis ulang pake cloud-native | Butuh scalability maksimal |
| **Repurchase** | Ganti ke SaaS | Ada produk SaaS yang cocok |
| **Retire** | Matiin aplikasi | Aplikasi gak dipake lagi |
| **Retain** | Biarin di on-prem | Belum siap pindah |

### Contoh: Lift & Shift vs Re-architect

```typescript
// ❌ Lift & Shift: VM pake Node.js biasa
// Sama aja kayak di on-prem, cuma pindah server

// ✅ Re-architect: Pake serverless
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Lambda!' }),
  };
};
```

### Migration Steps

```
1. Assess — Audit aplikasi: dependensi, traffic, data size
2. Plan — Pilih strategy (6 R's), buat timeline
3. Migrate — Pindahin data + app
4. Validate — Test: sama gak outputnya?
5. Cutover — Aliihin traffic ke cloud
6. Optimize — Matiin server lama, right-size resource
```

---

## Disaster Recovery (DR) — Persiapan Kalo Cloud Mati

Bencana gak cuma gempa — juga human error (hapus DB), ransomware, atau provider down.

### DR Metrics

| Metrik | Arti | Target |
|--------|------|--------|
| **RPO** (Recovery Point Objective) | Berapa banyak data yang boleh ilang | 1 jam → 24 jam |
| **RTO** (Recovery Time Objective) | Berapa lama aplikasi harus balik | 1 jam → 72 jam |

### DR Strategies

| Strategy | RTO | RPO | Biaya | Setup |
|----------|-----|-----|-------|-------|
| Backup & Restore | 24-72 jam | 24 jam | $ | Backup harian ke S3 |
| Pilot Light | 4-8 jam | 1 jam | $$ | Core services jalan minimal |
| Warm Standby | 1-4 jam | 5 menit | $$$ | Copy data real-time, app scaled down |
| Multi-site Active-Active | <1 menit | Detik | $$$$ | Full replication, load balanced |

### DR Implementation

```bash
# Backup database harian
# 0 2 * * * pg_dump mydb | gzip > /backups/mydb-$(date +%Y%m%d).sql.gz

# Upload backup ke cloud
# 0 3 * * * aws s3 cp /backups/mydb-$(date +%Y%m%d).sql.gz s3://my-backups/

# Simpan di region berbeda (DR)
# 0 4 * * * aws s3 cp s3://my-backups/ s3://my-backups-dr/ --recursive
```

### DR Testing — Game Day

Simulasi bencana setahun sekali:

```
1. Matiin primary server
2. Catat start time → RTO mulai
3. Aktifkan DR site
4. Test: bisa akses aplikasi?
5. Catat end time → bandingkan dengan RTO target
6. Catat data loss → bandingkan dengan RPO target
7. Tulis after-action report: apa yang gagal, apa yang diperbaiki
```

### Terraform DR — Infra as Code

```hcl
# Primary region
resource "aws_instance" "app_primary" {
  provider = aws.primary
  ami      = "ami-xxx"
  instance_type = "t3.micro"
}

# DR region — infra yang sama, region beda
resource "aws_instance" "app_dr" {
  provider = aws.secondary
  ami      = "ami-yyy"
  instance_type = "t3.micro"
}

# Route53 — failover DNS
resource "aws_route53_record" "app" {
  zone_id = "Z123"
  name    = "app.example.com"
  type    = "A"

  failover_routing_policy {
    type = "PRIMARY"
  }
  set_identifier = "primary"
  ttl            = 60
  records        = [aws_instance.app_primary.public_ip]
}
```
