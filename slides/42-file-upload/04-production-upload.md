---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 📁 Modul 42: File Upload & Storage"
footer: "Sesi 04: Production Upload"
---

<!-- _class: title -->
# Sesi 4: Production Upload — Stream, Drag-Drop, Progress Bar, Metadata

> **Durasi:** 3 Jam | **Sub-Modul dari 42-File-Upload**

## 📌 Tujuan Sesi

Setelah sesi ini, peserta mampu:
- Implementasi Multer + S3 direct upload (stream)
- Membuat drag-drop upload UI dengan preview
- Upload langsung dari client via presigned URL
- Progress bar real-time dengan Axios
- Menyimpan metadata file ke database
- SQL migration untuk tabel files

---

## 1. Multer + S3 Direct Upload (Stream)

Alih-alih menyimpan file ke disk dulu, kita stream langsung dari Multer ke S3.

### Konsep Stream

```
HTTP Request ──> Multer (memory) ──> Sharp (optimasi) ──> S3 Upload
                                                              │
                                                              ▼
                                                         Database (metadata)
```

### Implementasi

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({ /* config */ });
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload/stream', upload.single('file'), async (req, res) => {
  try {
    const id = uuidv4();
    const ext = path.extname(req.file.originalname);
    const key = `uploads/${id}${ext}`;

    // Opsional: optimasi dulu sebelum upload
    let buffer = req.file.buffer;
    if (req.file.mimetype.startsWith('image/')) {
      buffer = await sharp(buffer)
        .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Upload ke S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        'original-name': req.file.originalname,
        'upload-timestamp': Date.now().toString()
      }
    });

    await s3.send(command);

    // Simpan metadata ke database
    await db.query(
      `INSERT INTO files (id, original_name, key, mime_type, size, url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, req.file.originalname, key, req.file.mimetype, buffer.length,
       `https://cdn.example.com/${key}`]
    );

    res.json({
      id,
      url: `https://cdn.example.com/${key}`,
      size: buffer.length
    });
  } catch (error) {
    console.error('Stream upload error:', error);
    res.status(500).json({ error: 'Upload gagal.' });
  }
});
```

### Upload via Stream (PassThrough)

Untuk file besar, better stream langsung tanpa buffer penuh di memory.

```javascript
const { Upload } = require('@aws-sdk/lib-storage'); // Mulai v3
const { PassThrough } = require('stream');

app.post('/upload/large', (req, res) => {
  const uploadMulter = multer({ storage: multer.memoryStorage() });
  
  uploadMulter.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    
    const key = `large-files/${uuidv4()}-${req.file.originalname}`;
    
    const pass = new PassThrough();
    pass.end(req.file.buffer);
    
    const parallelUploads3 = new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: pass,
        ContentType: req.file.mimetype
      },
      queueSize: 4,      // parallel upload parts
      partSize: 5 * 1024 * 1024, // 5MB per part
      leavePartsOnError: false
    });
    
    parallelUploads3.on('httpUploadProgress', (progress) => {
      console.log(`Uploaded ${progress.loaded}/${progress.total}`);
    });
    
    await parallelUploads3.done();
    
    res.json({ url: `https://cdn.example.com/${key}` });
  });
});
```

---

## 2. Drag-Drop Upload UI

HTML5 Drag & Drop API + preview gambar.

### HTML

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <title>Upload File</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Upload File</h1>

    <!-- Drop Zone -->
    <div id="dropZone" class="drop-zone">
      <div class="drop-zone-content">
        <svg class="upload-icon" width="48" height="48" viewBox="0 0 24 24">
          <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" fill="currentColor"/>
        </svg>
        <p>Drag & drop file di sini</p>
        <p class="small">atau</p>
        <button id="browseBtn" type="button">Pilih File</button>
        <input type="file" id="fileInput" hidden multiple>
        <p class="small" id="fileInfo">Maksimal 10MB per file</p>
      </div>
    </div>

    <!-- Preview Area -->
    <div id="preview" class="preview-grid"></div>

    <!-- Progress Bar -->
    <div id="progressContainer" class="progress-container hidden">
      <div class="progress-info">
        <span id="progressText">Mengupload...</span>
        <span id="progressPercent">0%</span>
      </div>
      <div class="progress-bar">
        <div id="progressFill" class="progress-fill" style="width: 0%"></div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src="upload.js"></script>
</body>
</html>
```

### CSS

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

h1 {
  font-size: 24px;
  margin-bottom: 24px;
  color: #1a1a1a;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.drop-zone.dragover {
  border-color: #4f46e5;
  background: #eef2ff;
  transform: scale(1.01);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon { color: #6b7280; }
.dragover .upload-icon { color: #4f46e5; }

.small {
  font-size: 13px;
  color: #9ca3af;
}

button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

button:hover { background: #4338ca; }

/* Preview Grid */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.preview-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background: #f3f4f6;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-item .file-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  color: white;
  font-size: 11px;
  padding: 4px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-item .remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Progress Bar */
.progress-container {
  margin-top: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  border-radius: 99px;
  transition: width 0.3s ease;
}

.hidden { display: none; }
```

### JavaScript (upload.js)

```javascript
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const preview = document.getElementById('preview');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');

let selectedFiles = [];

// ===== DRAG & DROP =====
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

// ===== HANDLE FILES =====
function handleFiles(files) {
  selectedFiles = Array.from(files);
  showPreview();
  uploadFiles();
}

// ===== PREVIEW =====
function showPreview() {
  preview.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const div = document.createElement('div');
    div.className = 'preview-item';

    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      div.appendChild(img);
    }

    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = file.name;
    div.appendChild(name);

    const remove = document.createElement('button');
    remove.className = 'remove-btn';
    remove.textContent = '×';
    remove.onclick = () => {
      selectedFiles.splice(index, 1);
      showPreview();
    };
    div.appendChild(remove);

    preview.appendChild(div);
  });
}

// ===== UPLOAD WITH PROGRESS =====
async function uploadFiles() {
  if (selectedFiles.length === 0) return;

  progressContainer.classList.remove('hidden');
  const formData = new FormData();

  selectedFiles.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await axios.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        progressFill.style.width = percent + '%';
        progressPercent.textContent = percent + '%';

        if (percent < 100) {
          progressText.textContent = 'Mengupload...';
        } else {
          progressText.textContent = 'Memproses...';
        }
      }
    });

    // Selesai
    progressFill.style.width = '100%';
    progressPercent.textContent = '100%';
    progressText.textContent = 'Upload berhasil! ✓';
    progressFill.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';

    console.log('Upload response:', response.data);
    alert(`✅ ${response.data.message || 'Upload berhasil!'}`);
  } catch (error) {
    progressText.textContent = 'Upload gagal! ✗';
    progressFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    console.error('Upload error:', error);
    alert('❌ Gagal upload: ' + (error.response?.data?.error || error.message));
  }
}
```

---

## 3. Presigned URL Upload (Client-Side)

Server hanya generate URL, client upload langsung ke S3/R2.

### Server: Generate Presigned Upload URL

```javascript
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

app.post('/api/upload/presign', async (req, res) => {
  const { fileName, contentType } = req.body;

  if (!fileName || !contentType) {
    return res.status(400).json({ error: 'fileName dan contentType diperlukan.' });
  }

  const id = uuidv4();
  const key = `uploads/${id}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 menit

  res.json({
    uploadUrl,
    key,
    id,
    publicUrl: `https://cdn.example.com/${key}`
  });
});
```

### Client: Upload Langsung ke S3

```javascript
async function uploadDirect(file) {
  // 1. Minta presigned URL dari server
  const { data } = await axios.post('/api/upload/presign', {
    fileName: file.name,
    contentType: file.type
  });

  // 2. Upload langsung ke S3
  const response = await fetch(data.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type }
  });

  if (!response.ok) {
    throw new Error('Gagal upload ke S3');
  }

  // 3. Simpan metadata ke server
  await axios.post('/api/files/confirm', {
    id: data.id,
    key: data.key,
    originalName: file.name,
    size: file.size,
    mimeType: file.type
  });

  return data.publicUrl;
}
```

### Keuntungan Presigned Upload

| Aspek | Upload via Server | Upload Langsung |
|-------|------------------|-----------------|
| **Server Load** | Tinggi (handle buffer) | Minimal (hanya generate URL) |
| **Kecepatan** | Lambat (2x hop) | Cepat (langsung ke S3) |
| **Scalability** | Terbatas bandwidth server | Unlimited (S3 handles) |
| **Progress** | Bisa di-track | Via S3 events |
| **Security** | Full control | Perlu validasi post-upload |

---

## 4. Progress Bar — Multiple File

Untuk upload multiple file, kalkulasi progress total dari semua file.

```javascript
async function uploadMultipleWithProgress(files) {
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  let uploadedSize = 0;

  const uploadPromises = files.map(async (file) => {
    const { data } = await axios.post('/api/upload/presign', {
      fileName: file.name,
      contentType: file.type
    });

    await axios.put(data.uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (progressEvent) => {
        // Track progress per-file
        const fileProgress = progressEvent.loaded;
        // Hitung total
        const totalProgress = uploadedSize + fileProgress;
        const percent = Math.round((totalProgress * 100) / totalSize);
        updateProgressBar(percent);
      }
    });

    uploadedSize += file.size;
    return data;
  });

  return await Promise.all(uploadPromises);
}
```

### Variasi: Progress Bar dengan CSS Animation

```css
.progress-fill.indeterminate {
  width: 30%;
  animation: indeterminate 1.5s infinite ease-in-out;
}

@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
```

---

## 5. File Metadata in Database

### SQL Migration

```sql
-- migrations/001_create_files.sql
CREATE TABLE IF NOT EXISTS files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  key         VARCHAR(500) NOT NULL UNIQUE,       -- S3 key / path
  mime_type   VARCHAR(100) NOT NULL,
  size        BIGINT NOT NULL,                     -- bytes
  url         TEXT NOT NULL,                       -- public URL
  thumbnail_url TEXT,                              -- thumbnail URL (jika ada)
  width       INTEGER,                             -- dimensi gambar (jika image)
  height      INTEGER,
  format      VARCHAR(10),                         -- jpeg, png, webp, avif
  metadata    JSONB DEFAULT '{}',                  -- metadata tambahan
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_created_at ON files(created_at DESC);
CREATE INDEX idx_files_mime_type ON files(mime_type);

-- Trigger untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
```

### Insert Metadata

```javascript
async function saveFileMetadata({ id, userId, originalName, key, mimeType, size, url, thumbnailUrl, width, height, format }) {
  const result = await db.query(
    `INSERT INTO files (id, user_id, original_name, key, mime_type, size, url, thumbnail_url, width, height, format)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [id, userId, originalName, key, mimeType, size, url, thumbnailUrl, width, height, format]
  );
  return result.rows[0];
}
```

### Query Files by User

```javascript
// List files milik user dengan pagination
app.get('/api/files', async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await db.query(
    `SELECT id, original_name, mime_type, size, url, thumbnail_url, 
            width, height, format, created_at
     FROM files
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const count = await db.query(
    `SELECT COUNT(*) FROM files WHERE user_id = $1`,
    [userId]
  );

  res.json({
    files: result.rows,
    page,
    limit,
    total: parseInt(count.rows[0].count)
  });
});
```

---

## 6. Complete Flow: Production Upload

### Full Architecture

```
[Client Browser]
     │
     ├── (1) Pilih file (drag-drop)
     │
     ├── (2) Preview gambar
     │
     ├── (3) Request presigned URL → Express
     │                               │
     │                               ├── Generate URL (5 menit expiry)
     │                               └── Return { uploadUrl, id }
     │
     ├── (4) PUT file langsung ke S3/R2
     │         └── Progress bar via onUploadProgress
     │
     ├── (5) POST /api/files/confirm → Express
     │                               │
     │                               ├── Validasi file di S3
     │                               ├── Generate thumbnail (Sharp)
     │                               ├── Upload thumbnail ke S3
     │                               └── Insert metadata ke DB
     │
     └── (6) Tampilkan hasil (URL, size, thumbnail)
```

### Server: Confirm & Process Endpoint

```javascript
app.post('/api/files/confirm', upload.none(), async (req, res) => {
  const { id, key, originalName, size, mimeType } = req.body;

  try {
    // Validasi: cek apakah file benar ada di S3
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    });
    const headResult = await s3.send(headCommand);

    let thumbnailUrl = null;
    let width = null;
    let height = null;
    let format = null;

    // Jika gambar, generate thumbnail
    if (mimeType.startsWith('image/')) {
      // Download dari S3
      const getCommand = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key
      });
      const { Body } = await s3.send(getCommand);
      const chunks = [];
      for await (const chunk of Body) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Proses dengan Sharp
      const metadata = await sharp(buffer).metadata();
      width = metadata.width;
      height = metadata.height;
      format = metadata.format;

      // Generate thumbnail
      const thumbBuffer = await sharp(buffer)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

      const thumbKey = `thumbnails/${id}.webp`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: 'image/webp'
      }));

      thumbnailUrl = `https://cdn.example.com/${thumbKey}`;
    }

    // Simpan metadata
    const file = await saveFileMetadata({
      id,
      userId: req.user.id,
      originalName,
      key,
      mimeType,
      size,
      url: `https://cdn.example.com/${key}`,
      thumbnailUrl,
      width,
      height,
      format
    });

    res.json({
      message: 'File berhasil diproses',
      file
    });
  } catch (error) {
    console.error('Confirm error:', error);
    // Rollback: hapus file dari S3 jika gagal proses
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    }));
    res.status(500).json({ error: 'Gagal memproses file.' });
  }
});
```

---

## 📝 Latihan

### Latihan 1: Drag-Drop with Preview
Buat halaman upload dengan fitur:
- Drag-drop zone dengan efek visual
- Preview gambar (thumbnail) sebelum upload
- Tombol hapus per-item
- Upload multiple file

<details>
<summary>💡 Petunjuk</summary>

Gunakan `URL.createObjectURL()` untuk preview.
Event `dragover`, `drop`, `change` untuk handle file.
Array `selectedFiles` untuk manage state.
</details>

### Latihan 2: Progress Bar dengan Presigned URL
Implementasi upload flow:
1. Server: endpoint `POST /api/upload/presign` (generate URL)
2. Client: upload ke S3 via `fetch()` atau Axios
3. Progress bar real-time dengan `onUploadProgress`
4. Success state dengan animasi hijau

<details>
<summary>💡 Petunjuk</summary>

Axios `onUploadProgress` memberikan `loaded` dan `total`.
Untuk presigned upload, gunakan Axios PUT request.
Hitung persentase: `(loaded / total) * 100`.
</details>

### Latihan 3: Files Table + Metadata
Buat migration SQL dan implementasi:
- Tabel `files` dengan kolom lengkap (lihat migration di atas)
- INSERT metadata setelah upload sukses
- GET `/api/files` dengan pagination
- GET `/api/files/:id` detail file
- DELETE `/api/files/:id` — hapus file + metadata

<details>
<summary>💡 Petunjuk</summary>

Gunakan `db.query` dengan parameterized query (`$1, $2`).
Untuk DELETE, hapus dari S3 dulu baru dari database.
Tambahkan index untuk query performance.
</details>

### Latihan 4: Full Production Upload Flow
Gabungkan semua komponen jadi satu sistem:
1. Drag-drop UI (HTML/CSS/JS)
2. Backend: presigned URL generation
3. Client-side: upload langsung ke S3 + progress bar
4. Backend: confirm + thumbnail generation (Sharp) + metadata DB
5. Tampilkan hasil: file URL, thumbnail, size, type

<details>
<summary>💡 Petunjuk</summary>

Arsitektur:
```
POST /api/upload/presign  → { uploadUrl, id }
PUT  {uploadUrl}          → langsung ke S3
POST /api/files/confirm   → { id, key, ... } → proses + simpan
GET  /api/files           → list file user
```
Buat file `.env.example` untuk konfigurasi:
```
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=rpl-uploads
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
DATABASE_URL=postgresql://user:pass@localhost:5432/rpl
```
</details>

---

## ⚡ Rangkuman

| Konsep | Poin Kunci |
|--------|-----------|
| **Stream Upload** | Multer memory → langsung ke S3, tanpa disk I/O |
| **Drag-Drop** | HTML5 API: `dragover`, `drop`, `File` object |
| **Presigned URL** | Upload langsung dari client ke S3, server tidak load |
| **Progress Bar** | `axios.onUploadProgress` + CSS transition |
| **Metadata DB** | `files` table: name, size, type, url, thumbnail |
| **Confirm Flow** | Validasi → thumbnail → metadata → response |
| **Rollback** | Hapus dari S3 jika proses gagal |

---
**Selesai!** 🎉 Anda telah menyelesaikan Modul 42: File Upload & Storage.

Lanjut ke: [Module 43 - WebSocket & Real-Time Apps](../43-websocket/README.md)
