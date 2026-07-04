# Sesi 2: Cloud Storage — S3, R2 & MinIO

> **Durasi:** 3 Jam | **Sub-Modul dari 42-File-Upload**

## 📌 Tujuan Sesi

Setelah sesi ini, peserta mampu:
- Memahami konsep object storage (S3-compatible)
- Setup MinIO untuk development lokal
- Upload file ke S3 menggunakan AWS SDK v3
- Generate presigned URL untuk akses/download
- Konfigurasi bucket policy & CORS
- Setup Cloudflare R2 (free tier S3-compatible)

---

## 1. Konsep Object Storage

Object storage berbeda dengan filesystem tradisional:

| Aspek | Filesystem | Object Storage (S3) |
|-------|-----------|---------------------|
| **Struktur** | Hierarki folder | Flat bucket + key |
| **Akses** | Path lokal | HTTP REST API |
| **Metadata** | Terbatas | Kaya (custom headers) |
| **Skalabilitas** | Terbatas | Virtual unlimited |
| **Harga** | Fixed | Pay-per-use |
| **Contoh** | Local disk, NFS | AWS S3, MinIO, R2 |

### Istilah Penting

```
Bucket  ──>  Folder / Container
Key     ──>  Nama file / path object
Region  ──>  Lokasi geografis bucket
Endpoint ──>  URL API object storage
```

---

## 2. MinIO — S3 Lokal untuk Development

MinIO adalah server object storage S3-compatible yang bisa jalan di lokal.

### Setup dengan Docker

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=password123 \
  quay.io/minio/minio server /data --console-address ":9001"
```

- **API**: `http://localhost:9000` (S3-compatible)
- **Console**: `http://localhost:9001` (web UI)

### Setup Tanpa Docker (Binary)

```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
./minio server /data
```

---

## 3. AWS SDK v3 — Upload File ke S3

### Instalasi

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Konfigurasi Client

```javascript
const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  // Untuk MinIO / R2 — pakai endpoint custom
  // endpoint: 'http://localhost:9000',
  // forcePathStyle: true  // diperlukan untuk MinIO
});
```

### Upload File (PutObject)

```javascript
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

async function uploadFile(filePath, bucket, key) {
  const fileStream = fs.createReadStream(filePath);
  const fileStats = fs.statSync(filePath);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
    ContentType: 'image/jpeg',
    ContentLength: fileStats.size,
    // Metadata custom
    Metadata: {
      'uploaded-by': 'rpl-ai',
      'original-name': path.basename(filePath)
    }
  });

  const result = await s3Client.send(command);
  return result;
}

// Upload dari buffer (misal dari Multer memory storage)
async function uploadBuffer(buffer, bucket, key, mimetype) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype
  });

  return await s3Client.send(command);
}
```

### Daftar & Hapus Object

```javascript
const { ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// List files
async function listFiles(bucket, prefix = '') {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix
  });
  const result = await s3Client.send(command);
  return result.Contents || [];
}

// Hapus file
async function deleteFile(bucket, key) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  });
  return await s3Client.send(command);
}
```

---

## 4. Presigned URL

Presigned URL memungkinkan akses sementara ke object tanpa credentials.

### Generate Presigned URL (Download)

```javascript
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

async function getPresignedUrl(bucket, key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

// Contoh penggunaan
// const url = await getPresignedUrl('my-bucket', 'photos/image.jpg', 3600);
// console.log('Download URL (valid 1 jam):', url);
```

### Generate Presigned URL (Upload dari Client)

Memungkinkan client browser upload langsung ke S3 tanpa melalui server.

```javascript
const { PutObjectCommand } = require('@aws-sdk/client-s3');

async function getPresignedUploadUrl(bucket, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 menit
  return url;
}
```

**Client-side upload dengan presigned URL:**
```javascript
// Di browser
async function uploadDirect(url, file) {
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type }
  });
  return response.ok;
}
```

---

## 5. Bucket Policy & CORS Config

### CORS Configuration

Agar client browser bisa upload langsung ke S3.

```javascript
const { PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const corsConfig = {
  CORSRules: [
    {
      AllowedOrigins: ['http://localhost:3000', 'https://app.example.com'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600
    }
  ]
};

await s3Client.send(new PutBucketCorsCommand({
  Bucket: 'my-bucket',
  CORSConfiguration: corsConfig
}));
```

### Bucket Policy (Public Read)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::my-bucket/uploads/*"]
    }
  ]
}
```

> ⚠️ **Peringatan:** Jangan set bucket public untuk production. Gunakan presigned URL atau CDN.

---

## 6. Cloudflare R2 — Free Tier S3-Compatible

R2 adalah object storage dari Cloudflare dengan free tier generous dan **zero egress fee**.

### Setup

1. Buat akun Cloudflare
2. Buat R2 bucket di Dashboard
3. Generate API Token dengan permission **Object Read & Write**

### Konfigurasi AWS SDK untuk R2

```javascript
const s3ClientR2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  },
  requestHandler: {
    // R2 membutuhkan bucket name di path, bukan subdomain
    // forcePathStyle: true  // tergantung konfigurasi
  }
});

// Upload ke R2 — sama seperti S3
async function uploadToR2(buffer, key, mimetype) {
  const command = new PutObjectCommand({
    Bucket: 'my-r2-bucket',
    Key: key,
    Body: buffer,
    ContentType: mimetype
  });
  return await s3ClientR2.send(command);
}
```

### Perbandingan S3 vs R2

| Fitur | AWS S3 | Cloudflare R2 |
|-------|--------|---------------|
| **Free Tier** | 5GB (12 bulan) | 10GB (permanent) |
| **Egress Fee** | ~$0.09/GB | $0 |
| **API** | S3 | S3-compatible |
| **Class A Ops** | $0.005/1k | $4.50/1M |
| **Global CDN** | CloudFront | Built-in (Cloudflare) |

---

## 7. Integrasi dengan Express + Multer

Flow lengkap: Multer (memory) → S3/R2

```javascript
const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const key = `uploads/${Date.now()}-${req.file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });
    
    await s3.send(command);
    
    res.json({
      message: 'Upload berhasil',
      url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Gagal upload ke cloud storage.' });
  }
});
```

---

## 📝 Latihan

### Latihan 1: Setup MinIO + Upload
1. Jalankan MinIO dengan Docker
2. Buat bucket `rpl-files` via console web
3. Buat endpoint Express `POST /upload/minio` yang upload file ke MinIO
4. Akses file via MinIO console

<details>
<summary>💡 Petunjuk</summary>

Gunakan endpoint `http://localhost:9000` dengan `forcePathStyle: true`.
Credentials: `admin` / `password123`.
</details>

### Latihan 2: Presigned URL Download
Buat endpoint `GET /files/:key/signed` yang:
- Generate presigned URL dengan expiry 30 menit
- Redirect user ke URL tersebut
- Handle error jika file tidak ada

<details>
<summary>💡 Petunjuk</summary>

```javascript
app.get('/files/:key/signed', async (req, res) => {
  try {
    const url = await getPresignedUrl(
      process.env.S3_BUCKET, 
      req.params.key, 
      1800
    );
    res.redirect(url);
  } catch (err) {
    res.status(404).json({ error: 'File tidak ditemukan.' });
  }
});
```
</details>

### Latihan 3: Direct Upload via Presigned URL
Implementasi dua endpoint:
- `POST /api/upload/request` — generate presigned upload URL (return URL + key)
- Client-side HTML untuk upload langsung ke S3 menggunakan URL tersebut

<details>
<summary>💡 Petunjuk</summary>

Server: generate URL dengan expiry pendek (5 menit).
Client: gunakan `fetch(url, { method: 'PUT', body: file })`.
Keuntungan: server tidak perlu handle file buffer — file langsung ke S3.
</details>

### Latihan 4: R2 Integration
Migrasi dari S3 ke Cloudflare R2:
1. Buat akun Cloudflare R2 (free tier)
2. Generate API token
3. Update konfigurasi AWS SDK untuk pakai endpoint R2
4. Upload file dan verifikasi di dashboard R2
5. Catat perbedaan: endpoint, region, auth

<details>
<summary>💡 Petunjuk</summary>

R2 pakai `region: 'auto'` dan endpoint spesifik akun.
Token minimal perlu permission: `object_read_write`.
Cek dashboard R2 untuk melihat file yang terupload.
</details>

---

## ⚡ Rangkuman

| Konsep | Poin Kunci |
|--------|-----------|
| **Object Storage** | Bucket + Key, REST API, scalable |
| **AWS SDK v3** | `S3Client`, `PutObjectCommand`, `getSignedUrl` |
| **Presigned URL** | Akses sementara tanpa credentials, bisa upload/download |
| **CORS** | Wajib untuk browser upload langsung |
| **MinIO** | S3 lokal untuk development (Docker) |
| **R2** | S3-compatible, free tier, zero egress |

---
**Lanjut ke:** [Sesi 3: Image Optimization](./03-image-optimization.md)
