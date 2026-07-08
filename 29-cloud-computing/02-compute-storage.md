# 2. Compute & Storage: EC2/Droplet, Auto Scaling, Object Storage, CDN, File Upload

## Compute Instance (VM di Cloud)

### DigitalOcean Droplet

```bash
# Create Droplet via doctl
doctl compute droplet create \
  --name "web-server" \
  --region "sgp1" \
  --size "s-1vcpu-1gb" \
  --image "ubuntu-24-04-x64" \
  --ssh-keys "YOUR_SSH_KEY_ID"

# SSH masuk
ssh root@<droplet-ip>
```

### AWS EC2

```bash
# Via AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name MyKeyPair \
  --security-group-ids sg-xxxx \
  --subnet-id subnet-xxxx

# SSH
ssh -i ~/.ssh/MyKeyPair.pem ec2-user@<public-ip>
```

### Setup Web Server (Ubuntu)

```bash
# install nginx
apt update && apt install -y nginx

# firewall
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable

# cek status
systemctl status nginx
curl http://localhost
```

## Auto Scaling

Auto Scaling = otomatis nambah/ngurang instance berdasarkan traffic.

```
                    ┌──────────────────┐
                    │   Load Balancer   │
                    └──────┬───────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
    │  Instance 1 │ │  Instance 2 │ │  Instance 3 │
    └─────────────┘ └─────────────┘ └─────────────┘
           ▲                                    ▲
           │                                    │
    ┌──────┴──────┐                    ┌────────┴────────┐
    │   Scaling   │                    │  Scaling        │
    │   Policy    │◄───────────────────│  (CPU > 70%)    │
    └─────────────┘                    └─────────────────┘
```

### Basic Setup — DigitalOcean

```bash
# 1. Buat snapshot Droplet sebagai base image
doctl compute droplet-action snapshot <droplet-id> --snapshot-name "web-snapshot"

# 2. Buat Load Balancer
doctl compute load-balancer create \
  --name "web-lb" \
  --region "sgp1" \
  --forwarding-rules "entry_protocol:http,entry_port:80,target_protocol:http,target_port:80"

# 3. Buat tag
doctl compute tag create "web-server"

# 4. Saat traffic naik, manual scale:
doctl compute droplet create \
  --name "web-server-2" \
  --region "sgp1" \
  --size "s-1vcpu-1gb" \
  --image "web-snapshot" \
  --tag-names "web-server"
```

### Auto Scaling — AWS (ASG)

```hcl
# Terraform — Auto Scaling Group
resource "aws_autoscaling_group" "web_asg" {
  name               = "web-asg"
  min_size           = 2
  max_size           = 10
  desired_capacity   = 2
  vpc_zone_identifier = ["subnet-xxx", "subnet-yyy"]

  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }
}

resource "aws_autoscaling_policy" "cpu_up" {
  name                   = "cpu-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  autoscaling_group_name = aws_autoscaling_group.web_asg.name
}
```

## Object Storage

### AWS S3

```bash
# buat bucket
aws s3 mb s3://my-app-storage-123

# upload file
aws s3 cp ./profile.jpg s3://my-app-storage-123/uploads/

# public access (static website)
aws s3 website s3://my-app-storage-123 \
  --index-document index.html \
  --error-document error.html
```

### DigitalOcean Spaces

```bash
# via s3cmd (S3-compatible)
s3cmd mb s3://my-app-storage \
  --access_key=$SPACES_KEY \
  --secret_key=$SPACES_SECRET \
  --host=sgp1.digitaloceanspaces.com \
  --host-bucket='%(bucket)s.sgp1.digitaloceanspaces.com'

# upload
s3cmd put ./profile.jpg s3://my-app-storage/uploads/ \
  --acl-public
```

### File Upload Handler — Node.js (Express)

```typescript
import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
  region: 'sgp1',
  endpoint: 'https://sgp1.digitaloceanspaces.com',
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY!,
    secretAccessKey: process.env.SPACES_SECRET_KEY!,
  },
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file!;
  const ext = file.originalname.split('.').pop();
  const key = `uploads/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: 'my-app-storage',
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  });

  await s3.send(command);

  const url = `https://my-app-storage.sgp1.digitaloceanspaces.com/${key}`;
  res.json({ url, key });
});

app.listen(3000, () => console.log('API running on :3000'));
```

### Upload via HTML Form

```html
<form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="file" accept="image/*" required>
  <button type="submit">Upload</button>
</form>
```

## CDN (Content Delivery Network)

CDN = cache static assets di edge location dekat user → faster load time.

```
User (Jakarta) ──→ Edge (CGK) ── cache hit? ──→ serve from edge
                               └── cache miss ──→ Origin (SGP) ──→ cache & serve
```

### Cloudflare CDN

```bash
# 1. Daftar Cloudflare, add domain
# 2. Ubah nameserver ke Cloudflare
# 3. Set proxy mode (orange cloud) di DNS → otomatis CDN aktif
```

Pro tip: Pasang Cloudflare di depan DO Spaces / S3 untuk bandwidth gratis + caching.

```bash
# CNAME record:
cdn.example.com → my-bucket.sgp1.digitaloceanspaces.com
# Set proxy: ON (orange cloud)
```

### Output size — Image Optimization

```typescript
import sharp from 'sharp';

// Resize & compress sebelum upload
async function processUpload(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(800, 800, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
}

// simpan dengan thumbnail
// key: uploads/xxx.jpg
// key: uploads/thumb/xxx.jpg (200px)
```

---

## Container Orchestration — EKS / GKE / DOKS

Container orchestration = ngatur banyak container secara otomatis. Scaling, load balancing, rolling update, self-healing.

### Kubernetes — Standar Industri

Kubernetes (K8s) = orkestrator container paling populer. Cloud provider punya managed version:

| Provider | Managed K8s | Harga Control Plane |
|----------|------------|---------------------|
| AWS | EKS | $0.10/jam (~$73/bln) |
| GCP | GKE | Gratis (kecuali node) |
| Azure | AKS | Gratis |
| DigitalOcean | DOKS | Gratis |

### Kenapa Pake Kubernetes?

- **Self-healing** — container mati, ganti otomatis
- **Auto-scaling** — nambah container kalo traffic naik
- **Rolling update** — deploy tanpa downtime
- **Service discovery** — container bisa nemu satu sama lain
- **Secret management** — nyimpen API key, password

### Konsep Dasar Kubernetes

```
┌─────────────────────────────────────┐
│           Kubernetes Cluster         │
│  ┌──────────┐  ┌──────────┐         │
│  │  Node 1   │  │  Node 2   │         │
│  │ ┌──────┐ │  │ ┌──────┐ │         │
│  │ │ Pod  │ │  │ │ Pod  │ │         │
│  │ │(App) │ │  │ │(App) │ │         │
│  │ └──────┘ │  │ └──────┘ │         │
│  └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

### Deploy ke DOKS (DigitalOcean Kubernetes)

```bash
# 1. Buat cluster
doctl kubernetes cluster create my-cluster \
  --region sgp1 \
  --node-pool "name=web-pool;size=s-2vcpu-2gb;count=3;auto-scale=true;min-nodes=3;max-nodes=10"

# 2. Download kubeconfig
doctl kubernetes cluster kubeconfig save my-cluster

# 3. Cek cluster
kubectl get nodes
kubectl get pods --all-namespaces
```

### Deploy App ke Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: myusername/my-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

```bash
# Deploy
kubectl apply -f deployment.yaml

# Cek status
kubectl get pods
kubectl get services

# Scale manual
kubectl scale deployment api-server --replicas=5

# Rolling update (ganti image)
kubectl set image deployment/api-server api=myusername/my-api:v2

# Rollback
kubectl rollout undo deployment/api-server

# Logs
kubectl logs -l app=api --tail=100 -f
```

### Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

```bash
kubectl apply -f hpa.yaml
kubectl get hpa -w  # watch auto scaling
```

### Deploy ke GKE (Google Kubernetes Engine)

```bash
# 1. Setup gcloud
gcloud auth login
gcloud config set project my-project

# 2. Buat cluster
gcloud container clusters create my-cluster \
  --zone asia-southeast1-a \
  --num-nodes 3 \
  --machine-type e2-standard-2

# 3. Dapet kubeconfig
gcloud container clusters get-credentials my-cluster

# 4. Deploy (sama kayak DOKS — pake kubectl)
kubectl apply -f deployment.yaml
```

### Deploy ke EKS (AWS Elastic Kubernetes Service)

```bash
# 1. Buat cluster (via eksctl — tool khusus EKS)
eksctl create cluster \
  --name my-cluster \
  --region ap-southeast-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10

# 2. Deploy (sama, pake kubectl)
kubectl apply -f deployment.yaml

# 3. AWS Load Balancer Controller (opsional)
# Biar Service type LoadBalancer bikin ALB
eksctl utils associate-iam-oidc-provider --cluster my-cluster --approve
```

---

## Infrastructure as Code — Terraform & Pulumi

Bahas lebih detail tentang IaC tools.

### Terraform — HCL

Terraform pake HCL (HashiCorp Configuration Language). Deklaratif — lo bilang "apa yang diinginkan", Terraform urus "gimana caranya".

**State file:** Terraform nyimpen status infra di `terraform.tfstate`. Jangan hapus file ini!

```bash
# Workflow Terraform
terraform init          # Download provider plugins
terraform plan          # Liat rencana perubahan
terraform apply         # Terapkan perubahan
terraform destroy       # Hapus semua infra
```

### Pulumi — TypeScript/Python/Go

Pulumi beda — lo pake bahasa pemrograman beneran. Lebih fleksibel.

```typescript
import * as aws from '@pulumi/aws';

// Bikin VPC
const vpc = new aws.ec2.Vpc('main', {
  cidrBlock: '10.0.0.0/16',
  tags: { Name: 'main-vpc' },
});

// Bikin subnet
const subnet = new aws.ec2.Subnet('public', {
  vpcId: vpc.id,
  cidrBlock: '10.0.1.0/24',
  mapPublicIpOnLaunch: true,
});

// Bikin security group
const sg = new aws.ec2.SecurityGroup('web-sg', {
  vpcId: vpc.id,
  ingress: [
    { protocol: 'tcp', fromPort: 80, toPort: 80, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 443, toPort: 443, cidrBlocks: ['0.0.0.0/0'] },
  ],
});

export const vpcId = vpc.id;
```

### Perbandingan IaC Tools

| Aspek | Terraform | Pulumi | AWS CDK | CloudFormation |
|-------|-----------|--------|---------|----------------|
| Language | HCL | TS/Python/Go | TS/Python | YAML/JSON |
| State management | State file | Service managed | Service managed | AWS managed |
| Multi-cloud | ✅ | ✅ | ❌ (AWS only) | ❌ (AWS only) |
| Learning curve | Sedang | Rendah (kalo udah bisa TS) | Rendah | Tinggi |
| Community | Besar | Sedang | Sedang | Besar |
| Modularity | Modules | Packages | Constructs | Nested stacks |

## Latihan

1. **Deploy Web Server**: Launch Droplet/EC2 (free tier). Install Nginx + Node.js. Deploy simple Express API yang return JSON `{ status: "ok", timestamp }`. Screenshot hasil curl.

2. **Object Storage Upload**: Buat Spaces / S3 bucket. Bikin HTML form + Express handler (contoh di atas) untuk upload file. Upload gambar, pastikan bisa diakses public. Screenshot upload sukses.

3. **CDN Setup**: Register domain (atau pake domain gratis Freenom / nip.io). Arahkan ke Cloudflare. Set proxy mode. Test curl dengan dan tanpa Cloudflare, ukur perbedaan waktu.

```bash
# tanpa CDN (langsung ke droplet)
curl -w "%{time_total}\n" -o /dev/null -s http://<droplet-ip>/image.jpg

# via CDN
curl -w "%{time_total}\n" -o /dev/null -s https://cdn.example.com/image.jpg
```

4. **Auto Scaling Flow**: Tulis script bash / Terraform yang:
   - Deploy 1 Droplet + install app
   - Buat snapshot
   - Buat Load Balancer
   - Scale out ke 2 instance
   - Cek load balancer akses
   - Catat hasil di README

5. **Kubernetes deploy.** Bikin file YAML deployment untuk API sederhana (image: nginx atau node app). Tentukan: 3 replicas, resource limits, health check, LoadBalancer service. Apply ke cluster (atau dokumentasi command). Screenshoot kubectl get pods.

6. **Pulumi IaC.** Bikin script Pulumi (TypeScript) untuk deploy 1 VM + security group di provider pilihan (AWS/DigitalOcean). Run `pulumi up`, screenshoot hasil. Catat state file lokasi.

7. **IaC comparison report.** Pilih 2 IaC tools (misal Terraform vs Pulumi). Deploy infra yang sama (1 VM + firewall) pake kedua tool. Bandingkan: syntax, workflow, state management, error handling. Tulis kesimpulan mana yang lebih cocok untuk proyek SMK.
