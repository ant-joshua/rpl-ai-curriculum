# Cloud Computing — Latihan

## Level 1: Dasar

### 1. Cloud Service Models — IaaS vs PaaS vs SaaS
**Pertanyaan:** Cocokkan skenario berikut dengan model cloud yang tepat (IaaS, PaaS, atau SaaS):

| Skenario | Model |
|----------|-------|
| Tim DevOps manage VM sendiri, install OS, configure network | a. SaaS |
| Developer deploy code aja, nggak urus server atau OS | b. IaaS |
| User tinggal login pake browser, semua infra diurus vendor | c. PaaS |

**Hint:** IaaS = you manage OS/middleware. PaaS = you manage code only. SaaS = you manage nothing.

---

### 2. Deployment Model — Public vs Private vs Hybrid
**Pertanyaan:** Tentukan deployment model yang paling cocok:

1. Startup kecil, budget terbatas, mau scalable cepat
2. Bank dengan data sensitif, harus comply regulasi ketat
3. Perusahaan musiman (peak di Desember), mau gabung infrastruktur sendiri + cloud saat lonjakan

**Hint:** Public = shared infra. Private = dedicated infra. Hybrid = gabung keduanya.

---

### 3. Cloud Providers — Layanan Inti
**Pertanyaan:** Cocokkan layanan dengan provider cloud:

| Layanan | Provider |
|---------|----------|
| EC2, S3, Lambda | a. Google Cloud |
| Compute Engine, Cloud Storage, Cloud Functions | b. AWS |
| VM, Blob Storage, Azure Functions | c. Azure |

**Hint:** Tiap provider punya nama layanan yang mirip tapi berbeda.

---

### 4. Virtual Machine — Provisioning Dasar
**Pertanyaan:** Kamu perlu deploy VM untuk aplikasi web. Sebutkan minimal 4 hal yang harus dikonfigurasi saat provisioning VM (contoh: region, OS image).

**Hint:** Pikirkan tentang lokasi, sistem operasi, ukuran, dan akses.

---

### 5. Object Storage — S3 Basic Operations
**Pertanyaan:** Tulis perintah AWS CLI untuk:
1. Buat bucket bernama `my-app-assets`
2. Upload file `logo.png` ke bucket
3. Download file `config.json` dari bucket
4. Delete bucket (setelah kosong)

**Hint:** `aws s3 mb`, `aws s3 cp`, `aws s3 rb`.

---

### 6. Serverless — Fungsi Sederhana
```javascript
// AWS Lambda function
exports.handler = async (event) => {
  const { name } = event.queryStringParameters || {};
  return {
    statusCode: 200,
    body: `Halo, ${name || 'dunia'}!`
  };
};
```

**Pertanyaan:**
1. Apa yang terjadi kalau `event.queryStringParameters` null?
2. Ubah fungsi di atas supaya return 400 kalau `name` tidak ada
3. Tambahkan header `Content-Type: application/json` dan return JSON

**Hint:** Guard clause: `if (!name) return { statusCode: 400, body: JSON.stringify({ error: 'name required' }) }`.

---

### 7. Docker to Cloud — Build & Push Image
**Pertanyaan:** Tulis perintah Docker untuk:
1. Build image dari Dockerfile di direktori saat ini, tag `my-app:v1.0`
2. Tag image untuk push ke registry `gcr.io/my-project/my-app:v1.0`
3. Push image ke registry
4. Pull image dari registry ke server lain

**Hint:** `docker build -t my-app:v1.0 .`, `docker tag`, `docker push`, `docker pull`.

---

### 8. Environment Variables — 12-Factor App
**Pertanyaan:** Sebutkan 3 alasan kenapa konfigurasi aplikasi harus lewat environment variable, bukan hardcode di kode.

**Hint:** Baca prinsip 12-Factor App — terutama soal config, build, dan security.

---

## Level 2: Intermediate

### 9. IaC — Terraform Resource Definition
**Pertanyaan:** Tulis konfigurasi Terraform untuk:
1. Provider AWS di region `ap-southeast-1`
2. S3 bucket dengan nama unik (gunakan `random_id`)
3. EC2 instance tipe `t3.micro` dengan Amazon Linux 2 AMI
4. Security group yang allow HTTP (port 80) dari 0.0.0.0/0

**Hint:**
```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
}
```

---

### 10. Serverless — API Gateway + Lambda + DynamoDB
**Pertanyaan:** Desain arsitektur serverless untuk aplikasi catatan (notes app):

1. `POST /notes` — buat catatan baru (simpan ke DynamoDB)
2. `GET /notes/{id}` — ambil catatan by ID
3. `GET /notes` — list semua catatan (dengan pagination)
4. `DELETE /notes/{id}` — hapus catatan

Jelaskan:
- Peran API Gateway, Lambda, dan DynamoDB
- Bagaimana Lambda mengakses DynamoDB (IAM role)
- Bagaimana pagination bekerja di DynamoDB

**Hint:** DynamoDB pake `Scan` dengan `Limit` dan `ExclusiveStartKey` untuk pagination. Lambda butuh IAM role dengan policy `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:Scan`, `dynamodb:DeleteItem`.

---

### 11. Docker — Multi-stage Build
```dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Pertanyaan:**
1. Apa keuntungan multi-stage build dibanding single-stage?
2. Kenapa stage production pake `node:18-alpine` bukan `node:18`?
3. Apa isi final image? Apa yang TIDAK termasuk?

**Hint:** Alpine lebih kecil (~30MB vs ~300MB). Build tools nggak perlu di production.

---

### 12. Cloud Cost — Estimasi & Optimasi
**Pertanyaan:** Aplikasi kamu jalan di 3 EC2 `t3.medium` (24/7). Utilisasi CPU rata-rata 15%.

1. Hitung biaya bulanan estimasi (cari harga terbaru atau pake rate: ~$0.0416/jam per t3.medium)
2. Usul strategi optimasi biaya minimal 3 cara
3. Kapan cocok pake Reserved Instance vs Spot Instance?

**Hint:** 3 instance × 24 jam × 30 hari × $0.0416. Optimasi: downsizing, reserved instance, spot instance, auto-scaling schedule.

---

### 13. Auto Scaling — Target Tracking Policy
**Pertanyaan:** Konfigurasi Auto Scaling Group untuk API server:

1. Min 2 instance, max 10 instance, desired 2
2. Scale out saat CPU > 70% selama 3 menit (tambah 2 instance)
3. Scale in saat CPU < 30% selama 5 menit (kurangi 1 instance)
4. Health check grace period 60 detik

Tulis dalam bentuk AWS CLI atau Terraform.

**Hint:** `aws autoscaling put-scaling-policy` dengan `TargetTrackingConfiguration` atau Terraform `aws_autoscaling_policy` dengan `target_tracking_configuration`.

---

### 14. Cloud Monitoring — CloudWatch Metrics & Alarms
**Pertanyaan:** Buat CloudWatch alarm yang:
1. Monitor error rate 5xx dari Application Load Balancer
2. Trigger jika error rate > 5% dalam 2 periode 5 menit
3. Kirim notifikasi ke SNS topic

Tulis konfigurasi alarm dan jelaskan metrik yang dipakai.

**Hint:** Gunakan metric `HTTPCode_Target_5XX_Count` dibagi `RequestCount` dari `AWS/ApplicationELB`. Alarm actions: SNS.

---

## Level 3: Challenge

### 15. Full Infrastructure — Terraform + Docker + CI/CD
**Skenario:** Deploy aplikasi Next.js ke AWS ECS Fargate dengan pipeline CI/CD.

**Pertanyaan:** Desain dan tulis konfigurasi untuk:

1. **Terraform:** 
   - VPC dengan 2 public subnet, 2 private subnet
   - ECS cluster (Fargate)
   - ECR repository
   - Application Load Balancer
   - RDS PostgreSQL (db.t3.micro)
   - Security groups minimal

2. **Docker:** Multi-stage Dockerfile untuk Next.js (build → production)

3. **CI/CD (GitHub Actions):**
   - Trigger: push ke branch `main`
   - Job: test → build → push ke ECR → deploy ke ECS
   - Gunakan AWS credentials dari GitHub Secrets

**Hint:** ECS Fargate = serverless container — nggak perlu manage EC2. `aws_ecs_task_definition` perlu container definition JSON. GitHub Actions pake `aws-actions/configure-aws-credentials`.

---

### 16. Serverless — Image Processing Pipeline
**Skenario:** User upload gambar profil → harus di-resize ke 3 ukuran (original, thumbnail 150x150, medium 800x800) → simpan di S3 + database metadata.

**Pertanyaan:** Implementasi full pipeline:

1. S3 event notification trigger Lambda saat file diupload ke bucket `uploads/`
2. Lambda baca gambar dari S3, resize pakai Sharp (Node.js), simpan ke bucket `processed/`
3. Simpan metadata (original key, sizes, timestamp, user ID) ke DynamoDB
4. Return signed URL untuk diakses user

Tulis kode Lambda handler dan konfigurasi infrastruktur (Terraform atau AWS Console step-by-step).

**Hint:**
```javascript
const sharp = require('sharp');
const { S3 } = require('@aws-sdk/client-s3');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');

exports.handler = async (event) => {
  // Parse S3 event record
  // Read image from source bucket
  // Resize with sharp
  // Upload to destination bucket
  // Save metadata to DynamoDB
  // Return signed URLs
};
```

Lambda perlu IAM policy untuk akses S3 (GetObject, PutObject) dan DynamoDB (PutItem).

---

### 17. Disaster Recovery — Multi-Region Strategy
**Skenario:** Aplikasi e-commerce dengan RDS database dan S3 storage. Target RTO = 1 jam, RPO = 15 menit.

**Pertanyaan:** Desain strategi disaster recovery mencakup:

1. **Database:** Bagaimana replicate RDS ke region lain? Biaya vs RPO?
   - Opsi: Multi-AZ, Read Replica cross-region, atau backup restore?
2. **Storage:** Gimana S3 replication?
3. **Compute:** Gimana failover EC2/ECS?
4. **DNS:** Route53 health check + failover routing
5. **Testing:** Gimana test DR plan tanpa ganggu production?

**Hint:** RDS Cross-Region Read Replica (RPO detik). S3 Cross-Region Replication (RPO menit). Route53 failover routing record. Simulasi DR: matikan resource di region primary, verifikasi secondary handle traffic.

---

### 18. IaC Challenge — Modular Terraform with Remote State
**Skenario:** Tim kamu manage 3 environment (dev, staging, production) dengan infrastruktur yang mirip. Semua state harus disimpan di S3 dengan DynamoDB locking.

**Pertanyaan:** Buat struktur folder Terraform dan konfigurasi untuk:

1. **Modular structure:**
   ```
   terraform/
     modules/
       networking/     # VPC, subnets, NAT gateway
       compute/        # ECS cluster, task definition, service
       database/       # RDS instance
       storage/        # S3 buckets
     environments/
       dev/
       staging/
       production/
   ```

2. **Remote state:** Tiap environment punya state file terpisah di S3, lock pake DynamoDB

3. **Variables:** Tiap environment punya `terraform.tfvars` berbeda (instance size, replica count, dll.)

4. **Workspace atau folder?** Jelaskan kenapa kamu milih salah satu

**Hint:** Folder-based lebih simpel untuk perbedaan environment yang signifikan. Workspace cocok untuk environment yang identik. `backend "s3"` dengan `key = "env:${terraform.workspace}/terraform.tfstate"`.
