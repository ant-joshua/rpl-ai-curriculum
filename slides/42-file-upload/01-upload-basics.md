---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 📁 Modul 42: File Upload & Storage"
footer: "Sesi 01: Upload Basics"
---

<!-- _class: title -->
# Sesi 1: Upload Basics with Multer

> **Durasi:** 3 Jam | **Sub-Modul dari 42-File-Upload**

## 📌 Tujuan Sesi

Setelah sesi ini, peserta mampu:
- Setup Multer di aplikasi Express
- Membedakan disk storage vs memory storage
- Validasi file (mimetype, file size)
- Implementasi single & multiple file upload
- Menangani error upload (file too large, wrong type)
- Menyajikan file statis (serve uploaded files)

---

## 1. Apa itu Multer?

**Multer** adalah middleware `multipart/form-data` untuk Express. Digunakan untuk menangani upload file dari form HTML atau API client.

Cara kerja:
1. Client kirim form dengan `enctype="multipart/form-data"`
2. Multer parsing request body + file
3. File disimpan ke disk atau memory (buffer)

```
Client Form ──POST──> Express ──Multer──> Disk/Memory
```

---

## 2. Setup Multer

### Instalasi

```bash
npm install multer
```

### Konfigurasi Dasar

```javascript
const multer = require('multer');
const path = require('path');

// Disk storage — file disimpan ke folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
```

### Disk Storage vs Memory Storage

| Storage | Lokasi | Kelebihan | Kekurangan |
|---------|--------|-----------|------------|
| **Disk** | Folder lokal | Mudah diakses, langsung ke filesystem | I/O disk, tidak scalable |
| **Memory** | RAM (buffer) | Cepat, cocok untuk cloud upload | Boros RAM, perlu di-streaming |

```javascript
// Memory storage — file sebagai buffer
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

// Akses via req.file.buffer
```

---

## 3. File Validation

### Validasi Tipe File (Mimetype)

```javascript
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak didukung. Hanya JPEG, PNG, GIF, dan PDF.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
```

### Validasi Ukuran File

Ukuran maksimum dikonfigurasi via `limits.fileSize` (dalam bytes).

```javascript
// 10MB
limits: { fileSize: 10 * 1024 * 1024 }

// 1MB untuk avatar, 50MB untuk video
// Gunakan middleware berbeda untuk endpoint berbeda
```

---

## 4. Single vs Multiple Upload

### Single File Upload

```javascript
// Route handler
app.post('/upload/single', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file yang diupload.' });
  }
  
  res.json({
    message: 'File berhasil diupload',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    }
  });
});
```

**Test dengan curl:**
```bash
curl -X POST http://localhost:3000/upload/single \
  -F "file=@/path/to/image.jpg"
```

### Multiple File Upload

```javascript
// Maksimal 5 file, field name "files"
app.post('/upload/multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Tidak ada file yang diupload.' });
  }
  
  const filesInfo = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    mimetype: file.mimetype
  }));
  
  res.json({
    message: `${req.files.length} file berhasil diupload`,
    files: filesInfo
  });
});
```

### Multiple Fields (Form dengan banyak input file)

```javascript
app.post('/upload/fields', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 5 },
  { name: 'document', maxCount: 2 }
]), (req, res) => {
  console.log(req.files['avatar']);    // array, max 1 file
  console.log(req.files['gallery']);   // array, max 5 files
  console.log(req.files['document']);  // array, max 2 files
});
```

---

## 5. Error Handling

Multer melempar error spesifik yang perlu ditangani.

```javascript
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Hanya file gambar yang diizinkan!'), false);
    }
    cb(null, true);
  }
});

// Middleware error handler spesifik untuk upload
app.post('/upload/avatar', (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      // Multer error codes
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'File terlalu besar. Maksimal 2MB.'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          error: 'Terlalu banyak file atau field name salah.'
        });
      }
      // Custom error dari fileFilter
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Pilih file terlebih dahulu.' });
    }
    
    res.json({ message: 'Avatar berhasil diupload', file: req.file.filename });
  });
});
```

### Daftar Error Multer

| Error Code | Penyebab | HTTP Status |
|------------|----------|-------------|
| `LIMIT_FILE_SIZE` | File melebihi `limits.fileSize` | 413 |
| `LIMIT_FILE_COUNT` | Melebihi max count `upload.array()` | 400 |
| `LIMIT_UNEXPECTED_FILE` | Field name tidak sesuai | 400 |
| `LIMIT_PART_COUNT` | Terlalu banyak form parts | 400 |
| `LIMIT_FIELD_KEY` | Nama field terlalu panjang | 400 |

---

## 6. Serving Static Files

Agar file yang diupload bisa diakses via browser, kita perlu serve folder `uploads/` sebagai static.

```javascript
const express = require('express');
const app = express();

// Serve static files dari folder uploads
app.use('/uploads', express.static('uploads'));

// Sekarang file bisa diakses:
// http://localhost:3000/uploads/123456789-file.jpg
```

### Proteksi Akses (Opsional)

Untuk production, jangan expose folder uploads langsung. Gunakan endpoint dengan validasi:

```javascript
const fs = require('fs');

app.get('/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  
  // Validasi path traversal
  if (req.params.filename.includes('..')) {
    return res.status(403).json({ error: 'Akses ditolak.' });
  }
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File tidak ditemukan.' });
  }
  
  res.sendFile(filePath);
});
```

---

## 📝 Latihan

### Latihan 1: Upload Profile Picture
Buat endpoint `POST /api/profile/avatar` yang:
- Menerima satu file gambar (field name: `avatar`)
- Validasi hanya JPEG/PNG, maksimal 2MB
- Simpan dengan nama format `avatar-[userId]-[timestamp].ext`
- Kembalikan URL file

<details>
<summary>💡 Petunjuk</summary>

```javascript
// Gunakan req.userId dari auth middleware
const filename = `avatar-${req.userId}-${Date.now()}${ext}`;
// URL: /uploads/avatar-1-1700000000000.jpg
```
</details>

### Latihan 2: Gallery Upload
Buat endpoint `POST /api/gallery` yang:
- Menerima hingga 10 file (field name: `images`)
- Validasi semua harus gambar (JPEG, PNG, WebP)
- Maksimal 5MB per file
- Kembalikan array URL semua file
- Jika satu file gagal validasi, tolak semua (atomic)

<details>
<summary>💡 Petunjuk</summary>

Gunakan `upload.array('images', 10)` dan handle error di callback middleware.
Untuk atomic: proses file satu per satu, rollback jika ada yang gagal.
</details>

### Latihan 3: Document Validator
Buat middleware reusable `validateFile` yang:
- Menerima konfigurasi: `allowedTypes[]`, `maxSize`, `fieldName`
- Mengembalikan error terstruktur: `{ field, code, message }`
- Bisa digunakan di banyak route

<details>
<summary>💡 Petunjuk</summary>

```javascript
function validateFile(config) {
  return (req, res, next) => {
    const file = req.file || (req.files && req.files[0]);
    if (!file) return res.status(400).json({ field: config.fieldName, code: 'NO_FILE', message: '...' });
    // ... validasi
    next();
  };
}
```
</details>

### Latihan 4: Upload with Progress (Server-Sent Events)
Buat endpoint upload yang mengirim notifikasi real-time ke client via SSE:
- `POST /upload/stream` — upload file (via Multer)
- `GET /upload/status/:id` — SSE endpoint untuk progress
- Kirim event: `{ status: 'uploading'|'processing'|'done', percent: 50 }`

<details>
<summary>💡 Petunjuk</summary>

Gunakan EventEmitter atau library `progress-stream` untuk track bytes yang diterima.
Multer sendiri tidak emit progress — solusinya: gunakan raw multipart parser atau proxy.
Alternatif: gunakan client-side progress (lihat Sesi 4).
</details>

---

## ⚡ Rangkuman

| Konsep | Poin Kunci |
|--------|-----------|
| **Multer** | Middleware multipart/form-data untuk Express |
| **Storage** | Disk (file lokal) vs Memory (buffer) |
| **Validasi** | `fileFilter` untuk tipe, `limits.fileSize` untuk ukuran |
| **Single** | `upload.single('fieldName')` |
| **Multiple** | `upload.array('fieldName', maxCount)` |
| **Error** | `LIMIT_FILE_SIZE`, `LIMIT_UNEXPECTED_FILE`, custom filter |
| **Serve** | `express.static('uploads')` atau endpoint terproteksi |

---
**Lanjut ke:** [Sesi 2: Cloud Storage](./02-cloud-storage.md)
