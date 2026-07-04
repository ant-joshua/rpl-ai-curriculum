# RPP: Cloud Computing

| Info | Detail |
|------|--------|
| Kode | RPL-AI-29 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Beginner → Intermediate |
| Prasyarat | Dasar programming (JavaScript/TypeScript), familiar dengan CLI |

## Pertemuan 1: Cloud Basics

### Tujuan
- Paham konsep cloud computing (IaaS/PaaS/SaaS)
- Bedain cloud providers dan model deployment
- Paham Region/AZ, VPC

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: IaaS/PaaS/SaaS, Region/AZ, VPC, provider comparison | Ceramah + demo | Slide |
| 25' | Praktik terbimbing: setup akun cloud provider & eksplorasi console | Hands-on | Cloud console |
| 20' | Latihan mandiri: diagram arsitektur cloud sederhana | Problem solving | Mermaid / Draw.io |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Module README](../29-cloud-computing/)
- [Cloud Basics](../29-cloud-computing/01-cloud-basics.md)

---

## Pertemuan 2: Compute & Storage

### Tujuan
- Deploy compute instance (EC2/Droplet)
- Manage storage (S3/Spaces) dan CDN
- Handle file upload

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: EC2/Droplet, Auto Scaling, S3/Spaces, CDN, file upload | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: deploy app ke VM & setup S3 bucket | Hands-on | Cloud console |
| 20' | Latihan mandiri: setup CDN & file upload handler | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Compute & Storage](../29-cloud-computing/02-compute-storage.md)

---

## Pertemuan 3: Serverless Functions

### Tujuan
- Nulis & deploy serverless functions (Cloudflare Workers, Vercel Edge)
- Integrasi serverless database (Turso/Neon)
- Manage environment variables dan secrets

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: Cloudflare Workers, Vercel Edge, Railway, serverless DB, secrets | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: deploy serverless function + serverless DB | Hands-on | Starter code |
| 20' | Latihan mandiri: bikin API endpoint serverless dengan env vars | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Serverless Functions](../29-cloud-computing/03-serverless-functions.md)

---

## Pertemuan 4: IaC & Deploy

### Tujuan
- Pake Infrastructure as Code (Terraform/Pulumi)
- Setup CI/CD pipeline ke cloud pakai GitHub Actions
- Monitor app yang udah di-deploy

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: Terraform, Docker, CI/CD GitHub Actions, monitoring | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: tulis Terraform script & setup GitHub Actions | Hands-on | Starter code |
| 20' | Latihan mandiri: setup monitoring & alerting | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [IaC & Deploy](../29-cloud-computing/04-iac-deploy.md)
