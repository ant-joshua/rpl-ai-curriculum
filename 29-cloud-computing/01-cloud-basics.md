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
