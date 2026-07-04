# 🧠 Cheatsheet: File Upload & Storage

> Referensi cepet — 1 halaman. Modul 42: Upload file ke server + cloud storage, optimasi gambar, production upload.

## Topik Utama

| Sesi | Topik | Tools |
|------|-------|-------|
| 01 | Upload Basics — Multer disk/memory storage, validasi file, single/multiple upload, error handling, serve static | Multer |
| 02 | Cloud Storage — S3/R2 concept, MinIO lokal, AWS SDK v3, presigned URL, bucket policy, CORS | AWS SDK v3, MinIO, Cloudflare R2 |
| 03 | Image Optimization — Sharp pipeline, resize, WebP/AVIF, kompresi, thumbnail, srcset, CDN | Sharp |
| 04 | Production Upload — Multer + S3 stream, drag-drop UI, presigned URL client-side, progress bar, metadata DB | Axios, UUID |

## Command / Sintaks Penting

```bash
npm install multer
npm install sharp
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install uuid

# MinIO (Docker)
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=password123 \
  quay.io/minio/minio server /data --console-address ":9001"
```

### Multer — Disk vs Memory Storage

```javascript
// Disk storage — file ke folder lokal
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Memory storage — file sebagai buffer (cocok upload ke S3)
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });
```

### File Validation

```javascript
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Tipe file tidak didukung'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
```

### Single & Multiple Upload

```javascript
app.post('/upload/single', upload.single('file'), (req, res) => {
  res.json({ filename: req.file.filename, size: req.file.size });
});

app.post('/upload/multiple', upload.array('files', 5), (req, res) => {
  const info = req.files.map(f => ({ filename: f.filename, size: f.size }));
  res.json({ files: info });
});
```

### Multer Error Handling

| Error Code | Penyebab | HTTP Status |
|------------|----------|-------------|
| `LIMIT_FILE_SIZE` | File melebihi `limits.fileSize` | 413 |
| `LIMIT_FILE_COUNT` | Melebihi max count `upload.array()` | 400 |
| `LIMIT_UNEXPECTED_FILE` | Field name tidak sesuai | 400 |

### AWS S3 — Upload & Presigned URL

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Client (R2: ganti region + endpoint)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY },
  // endpoint: 'http://localhost:9000', forcePathStyle: true  // untuk MinIO
});

// Upload dari buffer
async function uploadToS3(buffer, key, mimetype) {
  return await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET, Key: key, Body: buffer, ContentType: mimetype
  }));
}

// Presigned URL (download, expiry 1 jam)
async function getPresignedUrl(bucket, key) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return await getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

// Presigned URL (upload dari client, expiry 5 menit)
async function getPresignedUploadUrl(bucket, key, contentType) {
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return await getSignedUrl(s3, cmd, { expiresIn: 300 });
}
```

### Sharp — Image Processing Pipeline

```javascript
const sharp = require('sharp');

// Resize + convert ke WebP
await sharp(input.jpg).resize(800, 600).webp({ quality: 80 }).toFile('output.webp');

// Thumbnail generation
async function generateThumbnails(buffer, name) {
  const sizes = [{ width: 150, suffix: 'thumb' }, { width: 400, suffix: 'small' }, { width: 800, suffix: 'medium' }];
  return Promise.all(sizes.map(async s => {
    const out = await sharp(buffer).resize(s.width, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 }).toBuffer();
    return { size: s.suffix, buffer: out };
  }));
}

// Metadata
const meta = await sharp('input.jpg').metadata();
// { width, height, format, size, hasAlpha, space }
```

### Format Comparison

| Format | Size (1MB JPEG) | Browser Support |
|--------|----------------|-----------------|
| JPEG | 1MB (baseline) | Universal |
| WebP (q80) | ~250KB | Modern browsers |
| AVIF (q65) | ~150KB | Chrome, Firefox |

### Responsive Images (srcset + Picture)

```html
<img src="photo-800.webp"
  srcset="photo-400.webp 400w, photo-800.webp 800w, photo-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Photo" />

<picture>
  <source srcset="photo.avif" type="image/avif" />
  <source srcset="photo.webp" type="image/webp" />
  <img src="photo.jpg" alt="Photo" />
</picture>
```

### Drag-Drop + Progress Bar (Client)

```javascript
// Axios upload dengan progress
const formData = new FormData();
selectedFiles.forEach(f => formData.append('files', f));

await axios.post('/upload/multiple', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (e) => {
    const percent = Math.round((e.loaded * 100) / e.total);
    progressFill.style.width = percent + '%';
  }
});
```

### S3 + CORS Configuration

```javascript
await s3.send(new PutBucketCorsCommand({
  Bucket: 'my-bucket',
  CORSConfiguration: {
    CORSRules: [{
      AllowedOrigins: ['http://localhost:3000', 'https://app.example.com'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
      AllowedHeaders: ['*'],
      MaxAgeSeconds: 3600
    }]
  }
}));
```

## Tips & Trik

- **Memory storage** untuk upload ke S3 — file buffer langsung dikirim
- **Disk storage** untuk file lokal/dev — simpel, langsung ke filesystem
- **Presigned URL** = akses sementara tanpa credentials — client upload langsung ke S3
- **Sharp** berbasis libvips (native) — jauh lebih cepat dari ImageMagick/Jimp
- **WebP** kompresi 25-35% lebih baik dari JPEG — recommended untuk web
- **AVIF** kompresi ~50% lebih baik, tapi encoding lambat — pakai sebagai fallback
- **withoutEnlargement: true** — gambar kecil tidak di-upscale
- **R2** zero egress fee vs S3 ~$0.09/GB — murah untuk file besar
- **Cache-Control immutable** untuk gambar yang sudah di-hash — CDN cache sempurna

## Common Mistakes

- ❌ **Disk storage di production** — file di satu server, gak scalable, susah di-scale
- ❌ **Gak validasi file type/size** — user upload file berbahaya atau terlalu besar
- ❌ **Bucket public di production** — pakai presigned URL atau CDN, bukan public read
- ❌ **Upload source maps ke public** — expose source code
- ❌ **Gak handle Multer errors** — `LIMIT_FILE_SIZE` dll harus di-catch terpisah
- ❌ **Buffer semua file di RAM** — file besar pakai stream (`PassThrough`), jangan `memoryStorage`
- ❌ **Gak validasi path traversal** — `../` di filename bisa akses file sensitif
- ❌ **Missing CORS config** — browser block upload langsung ke S3 tanpa CORS
- ❌ **AVIF untuk semua** — encoding lambat, pakai WebP dulu, AVIF sebagai `<source>` fallback

## Link Cepat

- [Module README](.)
- [Sesi 01 — Upload Basics with Multer](01-upload-basics.md)
- [Sesi 02 — Cloud Storage](02-cloud-storage.md)
- [Sesi 03 — Image Optimization](03-image-optimization.md)
- [Sesi 04 — Production Upload](04-production-upload.md)
- [Quiz](quiz.md)
