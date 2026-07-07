---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/177598/pexels-pho"
footer: "Sesi 02: Compute Storage"
---

<!-- _class: title -->
# 2. Compute & Storage: EC2/Droplet, Auto Scaling, Object Storage, CDN, File Upload

## Compute Instance (VM di Cloud)

### DigitalOcean Droplet

```bash

---

# Create Droplet via doctl
doctl compute droplet create \
  --name "web-server" \
  --region "sgp1" \
  --size "s-1vcpu-1gb" \
  --image "ubuntu-24-04-x64" \
  --ssh-keys "YOUR_SSH_KEY_ID"


---

# SSH masuk
ssh root@<droplet-ip>
```

### AWS EC2

```bash

---

# Via AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name MyKeyPair \
  --security-group-ids sg-xxxx \
  --subnet-id subnet-xxxx


---

# SSH
ssh -i ~/.ssh/MyKeyPair.pem ec2-user@<public-ip>
```

### Setup Web Server (Ubuntu)

```bash

---

# install nginx
apt update && apt install -y nginx


---

# firewall
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable


---

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

---

# 1. Buat snapshot Droplet sebagai base image
doctl compute droplet-action snapshot <droplet-id> --snapshot-name "web-snapshot"


---

# 2. Buat Load Balancer
doctl compute load-balancer create \
  --name "web-lb" \
  --region "sgp1" \
  --forwarding-rules "entry_protocol:http,entry_port:80,target_protocol:http,target_port:80"


---

# 3. Buat tag
doctl compute tag create "web-server"


---

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

---

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

---

# buat bucket
aws s3 mb s3://my-app-storage-123


---

# upload file
aws s3 cp ./profile.jpg s3://my-app-storage-123/uploads/


---

# public access (static website)
aws s3 website s3://my-app-storage-123 \
  --index-document index.html \
  --error-document error.html
```

### DigitalOcean Spaces

```bash

---

# via s3cmd (S3-compatible)
s3cmd mb s3://my-app-storage \
  --access_key=$SPACES_KEY \
  --secret_key=$SPACES_SECRET \
  --host=sgp1.digitaloceanspaces.com \
  --host-bucket='%(bucket)s.sgp1.digitaloceanspaces.com'


---

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

---

# 1. Daftar Cloudflare, add domain

---

# 2. Ubah nameserver ke Cloudflare

---

# 3. Set proxy mode (orange cloud) di DNS → otomatis CDN aktif
```

Pro tip: Pasang Cloudflare di depan DO Spaces / S3 untuk bandwidth gratis + caching.

```bash

---

# CNAME record:
cdn.example.com → my-bucket.sgp1.digitaloceanspaces.com

---

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

## Latihan

1. **Deploy Web Server**: Launch Droplet/EC2 (free tier). Install Nginx + Node.js. Deploy simple Express API yang return JSON `{ status: "ok", timestamp }`. Screenshot hasil curl.

2. **Object Storage Upload**: Buat Spaces / S3 bucket. Bikin HTML form + Express handler (contoh di atas) untuk upload file. Upload gambar, pastikan bisa diakses public. Screenshot upload sukses.

3. **CDN Setup**: Register domain (atau pake domain gratis Freenom / nip.io). Arahkan ke Cloudflare. Set proxy mode. Test curl dengan dan tanpa Cloudflare, ukur perbedaan waktu.

```bash

---

# tanpa CDN (langsung ke droplet)
curl -w "%{time_total}\n" -o /dev/null -s http://<droplet-ip>/image.jpg


---

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
