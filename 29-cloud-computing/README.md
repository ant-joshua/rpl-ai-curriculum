<img src="https://images.pexels.com/photos/177598/pexels-photo-177598.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Cloud Computing" style="width:100%;border-radius:12px;margin:12px 0;">

# 29. Cloud Computing

> **Level:** 🌱 Beginner → 🌿 Intermediate  
> **Jam:** 8 (4 minggu × 2 sesi)  
> **Prasyarat:** Dasar programming (javascript/typescript), familiar dengan CLI  
> **Output:** App yang di-deploy ke cloud dengan CI/CD pipeline

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Paham konsep cloud computing (IaaS/PaaS/SaaS) dan model deployment
- Bedain cloud providers dan pilih yang sesuai kebutuhan
- Deploy compute instance (EC2/Droplet) dan manage storage (S3/Spaces)
- Pake CDN dan file upload handling
- Nulis & deploy serverless functions (Cloudflare Workers, Vercel Edge)
- Integrasi serverless database (Turso/Neon)
- Manage environment variables dan secrets
- Pake Infrastructure as Code (Terraform/Pulumi)
- Setup CI/CD pipeline ke cloud pakai GitHub Actions
- Monitor app yang udah di-deploy

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Cloud Basics: IaaS/PaaS/SaaS, Region/AZ, VPC, Provider Comparison | [01-cloud-basics.md](01-cloud-basics.md) |
| 2 | Compute & Storage: EC2/Droplet, Auto Scaling, S3/Spaces, CDN, File Upload | [02-compute-storage.md](02-compute-storage.md) |
| 3 | Serverless Functions: Cloudflare Workers, Vercel Edge, Railway, Serverless DB, Secrets | [03-serverless-functions.md](03-serverless-functions.md) |
| 4 | IaC & Deploy: Terraform, Docker, CI/CD GitHub Actions, Monitoring | [04-iac-deploy.md](04-iac-deploy.md) |

## Output Akhir Modul

> **App deployed on cloud with CI/CD** — REST API atau static site yang di-deploy ke DigitalOcean / Cloudflare, dengan pipeline otomatis dari GitHub

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Explain the difference between IaaS, PaaS, and SaaS with examples"
- "Generate a CloudFormation/Terraform script for a VPC with two subnets"
- "Debug this serverless function: it times out on large requests"
- "Compare pricing between AWS Lambda and Cloudflare Workers for 1M requests/month"
- "Write a GitHub Actions workflow to deploy to DigitalOcean App Platform"
