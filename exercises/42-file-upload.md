# File Upload — Latihan

## Level 1: Dasar

### 1. Multer — Basic Upload
**Pertanyaan:** Setup Multer untuk file upload di Express:

```typescript
import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// === LENGKAPI: Storage configuration ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // === LENGKAPI ===
    // Tentukan folder berdasarkan tipe file:
    // - image -> uploads/images/
    // - document -> uploads/documents/
    // - other -> uploads/misc/
  },
  filename: (req, file, cb) => {
    // === LENGKAPI ===
    // Generate filename unik: {userId}-{timestamp}-{random}.{ext}
    // Contoh: user123-1705312000-a1b2c3d4.jpg
  }
});

// === LENGKAPI: File filter ===
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // === LENGKAPI ===
  // 1. Allow: jpg, jpeg, png, gif, webp, pdf, docx
  // 2. Max size: 5MB
  // 3. Reject dengan pesan error yang jelas
};

// === LENGKAPI: Multer instance ===
const upload = multer({
  storage,
  fileFilter,
  // === LENGKAPI: limits ===
  // limits: { fileSize: ?, files: ?, fieldSize: ? }
});

// === LENGKAPI: Routes ===
// Single file upload
app.post('/api/upload/avatar', upload.single('avatar'), (req, res) => {
  // === LENGKAPI ===
  // 1. Cek file exists
  // 2. Return file info (path, size, mimetype)
  // 3. Simpan path ke database
});

// Multiple files upload
app.post('/api/upload/gallery', upload.array('photos', 10), (req, res) => {
  // === LENGKAPI ===
  // 1. Loop semua files
  // 2. Validate each file
  // 3. Return array of file info
});

// Mixed files (different fields)
app.post('/api/upload/product', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'gallery', maxCount: 5 },
  { name: 'documents', maxCount: 3 }
]), (req, res) => {
  // === LENGKAPI ===
  // Handle different file types per field
});
```

**Hint:** Multer config: `{ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 10, fields: 5 } }`. File filter: `cb(null, true)` untuk accept, `cb(new Error('Message'), false)` untuk reject. Error handling: tambah error middleware yang handle `MulterError`. `req.file` untuk single, `req.files` untuk multiple (array atau fields).

---

### 2. Sharp — Image Optimization
**Pertanyaan:** Implementasi image optimization dengan Sharp:

```typescript
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// === LENGKAPI: Image processor ===
interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: ImageOptions = {}
): Promise<{ width: number; height: number; size: number }> {
  // === LENGKAPI ===
  // 1. Baca metadata gambar (format, dimensions)
  // 2. Apply resize sesuai options
  // 3. Convert ke format yang diinginkan
  // 4. Apply quality/compression
  // 5. Simpan ke outputPath
  // 6. Return metadata hasil
}

// === LENGKAPI: Generate thumbnails ===
async function generateThumbnails(
  inputPath: string,
  outputDir: string,
  sizes: Array<{ name: string; width: number; height: number }>
): Promise<Array<{ name: string; path: string; width: number; height: number }>> {
  // === LENGKAPI ===
  // Generate multiple thumbnail sizes:
  // - 'small': 150x150
  // - 'medium': 300x300
  // - 'large': 600x600
  // Return array of generated thumbnails
}

// === LENGKAPI: Image pipeline ===
async function processUploadedImage(filePath: string, userId: string) {
  // === LENGKAPI ===
  // 1. Validate image (bukan corrupt)
  // 2. Strip EXIF data (privacy!)
  // 3. Optimize (compress tanpa loss kualitas signifikan)
  // 4. Generate thumbnails
  // 5. Simpan metadata ke database
  // 6. Return paths
}

// === LENGKAPI: WebP conversion ===
async function convertToWebP(inputPath: string, outputPath: string, quality: number = 80) {
  // === LENGKAPI ===
  // Convert image ke WebP format
  // WebP: 25-34% lebih kecil dari JPEG
}
```

**Hint:** Sharp pipeline: `sharp(input).resize(width, height, { fit: 'cover' }).jpeg({ quality: 80 }).toFile(output)`. EXIF strip: `sharp(input).withMetadata({ exif: {} }).toFile(output)` atau `sharp(input).toFile(output)` (otomatis strip kecuali `keepMetadata()`). WebP: `.webp({ quality, effort: 4 })`. Metadata: `await sharp(input).metadata()` return `{ format, width, height, size, density, channels }`.

---

### 3. Presigned URL — S3 Upload
**Pertanyaan:** Implementasi presigned URL untuk upload langsung ke S3:

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// === LENGKAPI: Generate presigned upload URL ===
async function generateUploadUrl(
  fileName: string,
  contentType: string,
  userId: string
): Promise<{ uploadUrl: string; fileKey: string; expiresIn: number }> {
  // === LENGKAPI ===
  // 1. Generate unique file key
  //    Pattern: uploads/{userId}/{YYYY-MM-DD}/{uuid}.{ext}
  // 2. Create PutObjectCommand
  // 3. Set metadata (userId, originalName)
  // 4. Generate presigned URL (expires 15 menit)
  // 5. Return uploadUrl, fileKey, expiresIn
}

// === LENGKAPI: Generate presigned download URL ===
async function generateDownloadUrl(fileKey: string): Promise<string> {
  // === LENGKAPI ===
  // Generate presigned URL untuk download
  // Expires 1 jam
  // Cache-Control header untuk CDN
}

// === LENGKAPI: Upload endpoint ===
app.post('/api/upload/presign', async (req, res) => {
  const { fileName, contentType } = req.body;
  
  // === LENGKAPI ===
  // 1. Validate file type (hanya allow tertentu)
  // 2. Validate file size (max 10MB)
  // 3. Generate presigned URL
  // 4. Return URL ke client
});

// === LENGKAPI: Confirm upload callback ===
app.post('/api/upload/confirm', async (req, res) => {
  const { fileKey, originalName, size, mimeType } = req.body;
  
  // === LENGKAPI ===
  // 1. Verifikasi file ada di S3
  // 2. Simpan metadata ke database
  // 3. Generate thumbnail jika image
  // 4. Return file record
});
```

**Hint:** Presigned URL: `getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType, Metadata }), { expiresIn: 900 })`. 900 detik = 15 menit. File key: `uploads/${userId}/${format(new Date(), 'yyyy-MM-dd')}/${crypto.randomUUID()}.${ext}`. **PENTING**: validate contentType di server, jangan percaya client. Confirm callback: cek file exists di S3 sebelum save ke database.

---

### 4. Drag & Drop UI — Frontend
**Pertanyaan:** Implementasi drag & drop file upload UI:

```tsx
// === LENGKAPI: Drag & Drop Component ===
import { useState, useRef, DragEvent } from 'react';

interface FileUploadProps {
  accept?: string[];
  maxSize?: number; // bytes
  multiple?: boolean;
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
}

export default function FileUpload({
  accept = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSize = 5 * 1024 * 1024,
  multiple = true,
  maxFiles = 5,
  onUpload
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // === LENGKAPI: Drag handlers ===
  const handleDragEnter = (e: DragEvent) => {
    // === LENGKAPI ===
    // Prevent default, set isDragging
  };
  
  const handleDragLeave = (e: DragEvent) => {
    // === LENGKAPI ===
    // Check if leaving container (bukan child element)
  };
  
  const handleDragOver = (e: DragEvent) => {
    // === LENGKAPI ===
    // Prevent default
  };
  
  const handleDrop = (e: DragEvent) => {
    // === LENGKAPI ===
    // 1. Prevent default
    // 2. Extract files dari DataTransfer
    // 3. Validate files (type, size, count)
    // 4. Add valid files ke state
    // 5. Show errors untuk invalid files
  };
  
  // === LENGKAPI: File validation ===
  const validateFiles = (newFiles: FileList | File[]): {
    valid: File[];
    errors: string[];
  } => {
    // === LENGKAPI ===
    // 1. Check file type
    // 2. Check file size
    // 3. Check total count (existing + new)
    // 4. Return valid files dan error messages
  };
  
  // === LENGKAPI: Upload handler ===
  const handleUpload = async () => {
    // === LENGKAPI ===
    // 1. Set uploading state
    // 2. Upload ke presigned URL atau server
    // 3. Track progress per file
    // 4. Handle success/error
    // 5. Clear files setelah sukses
  };
  
  // === LENGKAPI: Render ===
  return (
    // === LENGKAPI ===
    // 1. Drop zone dengan border styling saat dragging
    // 2. File list dengan preview (thumbnail untuk image)
    // 3. Progress bar per file
    // 4. Error messages
    // 5. Upload button
    // 6. Clear all button
  );
}
```

**Hint:** Drag events: `e.preventDefault()` di semua handler. `handleDragLeave`: cek `e.currentTarget.contains(e.relatedTarget)` untuk ignore child elements. File preview: `URL.createObjectURL(file)` untuk image preview. Progress: gunakan XMLHttpRequest untuk track upload progress atau fetch dengan ReadableStream. Styling: border biru saat dragging, border abu-abu normal.

---

## Level 2: Menengah

### 5. Upload Pipeline — Server-Side Processing
**Pertanyaan:** Implementasi upload pipeline yang memproses file setelah upload:

```typescript
// === LENGKAPI: Upload pipeline ===

interface PipelineStep {
  name: string;
  process: (file: UploadedFile) => Promise<UploadedFile>;
  onError: 'skip' | 'fail';
}

// === LENGKAPI: Pipeline steps ===
const uploadPipeline: PipelineStep[] = [
  {
    name: 'validate',
    process: async (file) => {
      // === LENGKAPI ===
      // 1. Check file magic bytes (bukan extension saja)
      // 2. Validate dimensions (min 100x100, max 4000x4000)
      // 3. Check for malware (basic: file size vs dimensions ratio)
    },
    onError: 'fail'
  },
  {
    name: 'strip-metadata',
    process: async (file) => {
      // === LENGKAPI ===
      // 1. Remove EXIF data
      // 2. Remove GPS coordinates
      // 3. Remove camera info
      // Privacy: jangan simpan data sensitif dari EXIF
    },
    onError: 'skip'
  },
  {
    name: 'optimize',
    process: async (file) => {
      // === LENGKAPI ===
      // 1. Compress image (WebP/AVIF)
      // 2. Resize jika terlalu besar
      // 3. Generate thumbnails
      // 4. Return processed file paths
    },
    onError: 'skip'
  },
  {
    name: 'scan',
    process: async (file) => {
      // === LENGKAPI ===
      // 1. Basic virus scan (ClamAV integration)
      // 2. Check file content validity
      // 3. Quarantine jika suspicious
    },
    onError: 'fail'
  },
  {
    name: 'store',
    process: async (file) => {
      // === LENGKAPI ===
      // 1. Upload ke S3
      // 2. Save metadata ke database
      // 3. Return final file record
    },
    onError: 'fail'
  }
];

// === LENGKAPI: Execute pipeline ===
async function executePipeline(
  file: Express.Multer.File,
  pipeline: PipelineStep[]
): Promise<UploadResult> {
  // === LENGKAPI ===
  // 1. Execute each step sequentially
  // 2. Handle errors per step (skip atau fail)
  // 3. Log each step execution
  // 4. Return final result
}
```

**Hint:** Magic bytes: cek header file untuk verify format (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, PDF: `25 50 44 46`). Pipeline pattern: loop steps, try/catch per step, handle based on `onError`. Logging: `console.log(`Step ${step.name}: ${duration}ms`)`. ClamAV: `clamdscan` CLI atau `clamscan` library.

---

### 6. Progress Tracking — Real-Time Upload
**Pertanyaan:** Implementasi real-time upload progress:

```typescript
// === LENGKAPI: Server-side progress tracking ===

// 1. Upload progress endpoint (untuk polling)
app.get('/api/upload/:uploadId/progress', async (req, res) => {
  // === LENGKAPI ===
  // Return:
  // {
  //   uploadId: "abc-123",
  //   status: "uploading" | "processing" | "completed" | "failed",
  //   files: [
  //     { name: "photo1.jpg", progress: 75, status: "uploading" },
  //     { name: "photo2.png", progress: 100, status: "processing" },
  //   ],
  //   totalProgress: 50, // persentase total
  //   estimatedTimeRemaining: 30 // detik
  // }
});

// === LENGKAPI: WebSocket progress ===
// Alternative: gunakan WebSocket untuk real-time progress
const wss = new WebSocket.Server({ path: '/ws/upload' });

wss.on('connection', (ws) => {
  // === LENGKAPI ===
  // 1. Client kirim uploadId
  // 2. Subscribe ke progress updates
  // 3. Kirim updates setiap ada perubahan
  // 4. Cleanup saat disconnect
});

// === LENGKAPI: Progress storage ===
class UploadProgress {
  private progress: Map<string, UploadProgressData>;
  
  constructor() {
    this.progress = new Map();
  }
  
  updateProgress(uploadId: string, fileId: string, progress: number) {
    // === LENGKAPI ===
    // Update progress untuk file tertentu
    // Recalculate total progress
    // Notify subscribers
  }
  
  updateStatus(uploadId: string, fileId: string, status: string) {
    // === LENGKAPI ===
    // Update status file
    // Jika semua selesai, update upload status ke completed
  }
  
  getProgress(uploadId: string): UploadProgressData {
    // === LENGKAPI ===
  }
}
```

**Hint:** Progress: gunakan `XMLHttpRequest` di client untuk upload (support `onprogress`). Server-side: track progress via S3 multipart upload events atau polling. WebSocket: `ws.send(JSON.stringify({ type: 'progress', uploadId, fileId, progress }))`. Cleanup: hapus progress data setelah 1 jam. Cache progress di Redis untuk multi-instance support.

---

## Level 3: Lanjutan

### 7. Large File — Chunked Upload
**Pertanyaan:** Implementasi chunked upload untuk file besar (> 100MB):

```typescript
// === LENGKAPI: Chunked upload system ===

interface ChunkedUploadSession {
  uploadId: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  status: 'uploading' | 'assembling' | 'completed' | 'failed';
  createdAt: Date;
  expiresAt: Date;
}

// === LENGKAPI: Init upload ===
app.post('/api/upload/chunked/init', async (req, res) => {
  const { fileName, fileSize, chunkSize = 5 * 1024 * 1024 } = req.body; // default 5MB per chunk
  
  // === LENGKAPI ===
  // 1. Generate uploadId
  // 2. Hitung totalChunks = Math.ceil(fileSize / chunkSize)
  // 3. Simpan session ke Redis/DB
  // 4. Return { uploadId, totalChunks, chunkSize }
});

// === LENGKAPI: Upload chunk ===
app.put('/api/upload/chunked/:uploadId/:chunkIndex', async (req, res) => {
  // === LENGKAPI ===
  // 1. Validate uploadId exists
  // 2. Validate chunkIndex
  // 3. Simpan chunk ke temporary location
  // 4. Update progress (tambah chunkIndex ke uploadedChunks)
  // 5. Return { received: true, totalUploaded: N }
});

// === LENGKAPI: Complete upload ===
app.post('/api/upload/chunked/:uploadId/complete', async (req, res) => {
  // === LENGKAPI ===
  // 1. Validasi semua chunks sudah diterima
  // 2. Gabungkan chunks ke file lengkap
  // 3. Verify checksum (MD5/SHA256)
  // 4. Move ke final location (S3)
  // 5. Cleanup temporary chunks
  // 6. Return file info
});

// === LENGKAPI: Resume failed upload ===
app.get('/api/upload/chunked/:uploadId/status', async (req, res) => {
  // === LENGKAPI ===
  // 1. Cek session status
  // 2. Return uploadedChunks (client bisa skip yang sudah upload)
  // 3. Check expiry (session expires setelah 1 jam)
});
```

**Hint:** Chunked upload flow: init -> upload chunks (parallel OK) -> complete. Storage: simpan chunks di temporary folder `/tmp/chunked-uploads/{uploadId}/`. Assembly: `pipe` chunks ke writable stream. Checksum: `crypto.createHash('md5').update(fileBuffer).digest('hex')`. Resume: return array `uploadedChunks`, client skip index yang sudah ada. **PENTING**: cleanup expired sessions (max 1 jam) untuk hindari storage leak.

---

### 8. File Virus Scanning
**Pertanyaan:** Implementasi virus scanning untuk uploaded files:

```typescript
// === LENGKAPI: Virus scanning integration ===
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// === LENGKAPI: Scan function ===
async function scanFile(filePath: string): Promise<{
  safe: boolean;
  virus?: string;
  scanTime: number;
}> {
  // === LENGKAPI ===
  // 1. Run ClamAV scan
  // 2. Parse output
  // 3. Handle timeout (max 30 detik)
  // 4. Handle errors
}

// === LENGKAPI: Scan middleware ===
function virusScanMiddleware(req: Request, res: Response, next: NextFunction) {
  // === LENGKAPI ===
  // 1. Scan semua uploaded files
  // 2. Jika virus ditemukan:
  //    - Quarantine file
  //    - Log incident
  //    - Kirim alert ke admin
  //    - Return 400 ke user
  // 3. Jika clean, continue
}

// === LENGKAPI: Quarantine system ===
async function quarantineFile(filePath: string, reason: string) {
  // === LENGKAPI ===
  // 1. Move file ke quarantine folder
  // 2. Rename dengan prefix "QUARANTINED-"
  // 3. Log: file path, reason, timestamp, user
  // 4. Set permissions (read-only)
  // 5. Notify admin
}

// === LENGKAPI: Scan report ===
app.get('/api/admin/scan-report', async (req, res) => {
  // === LENGKAPI ===
  // Return:
  // - Total files scanned today
  // - Clean / Infected count
  // - Average scan time
  // - Recent infections (last 24 hours)
  // - Quarantine list
});
```

**Hint:** ClamAV: `clamdscan --no-summary ${filePath}` atau `clamscan --no-summary ${filePath}`. Parse output: `stdout.includes('OK')` = clean, `stdout.includes('FOUND')` = infected. Timeout: `{ timeout: 30000 }` (30 detik). Quarantine: `fs.rename(filePath, quarantinePath)`. **PENTING**: scan sebelum file diproses lebih lanjut (optimize, store). Rate limit: max 10 scans concurrent untuk hindari CPU exhaustion.

---

### 9. Upload API — Rate Limiting & Quota
**Pertanyaan:** Implementasi rate limiting dan storage quota untuk uploads:

```typescript
// === LENGKAPI: User storage quota ===

interface StorageQuota {
  userId: string;
  usedBytes: number;
  maxBytes: number; // default 1GB
  fileCount: number;
  maxFiles: number; // default 100
  lastUploadAt: Date;
}

// === LENGKAPI: Check quota ===
async function checkUploadQuota(
  userId: string,
  fileSize: number
): Promise<{ allowed: boolean; reason?: string; quota?: StorageQuota }> {
  // === LENGKAPI ===
  // 1. Get current usage dari Redis/DB
  // 2. Check: usedBytes + fileSize <= maxBytes?
  // 3. Check: fileCount < maxFiles?
  // 4. Check: lastUploadAt cooldown (min 1 detik antar upload)
  // 5. Return allowed + reason jika ditolak
}

// === LENGKAPI: Rate limiting ===
const uploadRateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkUploadRateLimit(
  userId: string,
  maxUploads: number = 10,
  windowMs: number = 60000 // 1 menit
): boolean {
  // === LENGKAPI ===
  // Sliding window rate limit
  // Max 10 uploads per menit per user
  // Return true jika allowed
}

// === LENGKAPI: Update quota after upload ===
async function updateStorageQuota(userId: string, fileSize: number) {
  // === LENGKAPI ===
  // 1. Increment usedBytes
  // 2. Increment fileCount
  // 3. Update lastUploadAt
  // 4. Cache di Redis untuk fast access
}

// === LENGKAPI: Delete file dan update quota ===
async function deleteFile(userId: string, fileKey: string) {
  // === LENGKAPI ===
  // 1. Verify ownership
  // 2. Delete dari S3
  // 3. Delete dari database
  // 4. Decrement quota
  // 5. Log deletion
}

// === LENGKAPI: Quota management API ===
app.get('/api/user/storage/quota', async (req, res) => {
  // Return current quota usage
});

app.post('/api/user/storage/quota/upgrade', async (req, res) => {
  // Upgrade quota (misal: free 1GB -> pro 10GB)
  // Verifikasi payment
});
```

**Hint:** Quota storage: Redis `HINCRBY` untuk atomic increment. Rate limit: sliding window dengan `Redis MULTI/EXEC`. Cooldown: `Date.now() - lastUploadAt < 1000` -> reject. **PENTING**: atomic operation untuk quota update (race condition jika user upload bersamaan). Cleanup: periodic job untuk scan S3 dan sync quota.

---

### 10. Image CDN — Multi-Resolution
**Pertanyaan:** Implementasi image CDN dengan dynamic resizing:

```typescript
// === LENGKAPI: Image CDN endpoint ===
// URL pattern: /images/{fileKey}?w=300&h=200&fit=cover&format=webp&quality=80

app.get('/images/:fileKey', async (req, res) => {
  const { fileKey } = req.params;
  const { w, h, fit, format, quality } = req.query;
  
  // === LENGKAPI ===
  // 1. Parse dan validate query params
  // 2. Check cache (Redis/CDN)
  // 3. Jika tidak ada cache:
  //    a. Fetch original dari S3
  //    b. Apply resize/format changes
  //    c. Cache hasil (1 minggu)
  // 4. Return image dengan cache headers
});

// === LENGKAPI: Responsive image component ===
interface ResponsiveImageProps {
  src: string; // original fileKey
  alt: string;
  sizes: Array<{ width: number; breakpoint: string }>;
  // Contoh: [{ width: 320, breakpoint: 'sm' }, { width: 640, breakpoint: 'md' }]
}

// === LENGKAPI: Image variants generator ===
async function generateImageVariants(
  originalPath: string,
  variants: ImageVariant[]
): Promise<Record<string, string>> {
  // === LENGKAPI ===
  // Generate multiple variants:
  // - thumbnail: 150x150
  // - card: 400x300
  // - hero: 1200x600
  // - avatar: 200x200
  // Return map: { thumbnail: 's3://path', card: 's3://path', ... }
}

// === LENGKAPI: Cache strategy ===
interface CacheConfig {
  maxAge: number; // seconds
  staleWhileRevalidate: number;
  immutable: boolean;
}

const CACHE_CONFIG: Record<string, CacheConfig> = {
  // === LENGKAPI ===
  // original: immutable, maxAge 1 tahun
  // resized: maxAge 1 minggu
  // avatar: maxAge 1 hari
};
```

**Hint:** CDN URL: `/images/uploads/user123/photo.jpg?w=300&h=200&fit=cover&format=webp`. Cache key: hash of fileKey + params. Cache-Control: `public, max-age=31536000, immutable` untuk original. Resize cache: `max-age=604800` (1 minggu). Sharp pipeline: `sharp(original).resize(w, h, { fit }).toFormat(format).toBuffer()`. **PENTING**: validate w/h params (max 2000px), format params (only webp/avif/jpeg/png), dan fit params untuk hindari abuse.
