# RPP: File Upload & Storage

| Info | Detail |
|------|--------|
| Kode | RPL-AI-42 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | Node.js & Express, REST API (Modul 6) |

## Pertemuan 1: Upload Basics — Multer, Disk vs Memory Storage, File Validation, Single & Multiple Upload, Error Handling, Serve Static Files

### Tujuan
- Setup Multer middleware di Express (disk & memory storage)
- Memvalidasi file berdasarkan tipe MIME dan ukuran
- Implementasi single & multiple file upload dengan error handling
- Menyajikan file statis via Express

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo form upload HTML, tanya pengalaman upload file di web, kenapa perlu middleware khusus | Tanya jawab | Slide, browser |
| 20' | Materi inti: multipart/form-data, Multer disk vs memory storage, fileFilter, limits, single vs multiple upload, Multer error codes, express.static | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Multer + upload single file + validasi MIME & ukuran + error handler | Hands-on | Starter code |
| 20' | Latihan mandiri: implement multiple file upload + custom filename generator | Problem solving | Soal |
| 15' | Diskusi & refleksi: perbandingan disk vs memory storage untuk berbagai use case | Q&A | — |

### Bahan Ajar
- [Module README](../42-file-upload/)
- [Upload Basics](../42-file-upload/01-upload-basics.md)

---

## Pertemuan 2: Cloud Storage — Object Storage Concepts, MinIO Lokal, AWS SDK v3, Presigned URL, Bucket Policy, CORS, Cloudflare R2

### Tujuan
- Memahami konsep object storage (S3-compatible)
- Setup MinIO lokal untuk development
- Upload file ke S3/R2 via AWS SDK v3
- Generate presigned URL untuk upload & download langsung

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap upload basics, keterbatasan disk storage, kenapa butuh cloud storage | Tanya jawab | Slide |
| 20' | Materi inti: object storage vs filesystem, MinIO Docker, AWS SDK v3 (S3Client, PutObjectCommand), presigned URL, bucket policy, CORS, Cloudflare R2 | Ceramah + demo | Live code, Docker |
| 25' | Praktik terbimbing: setup MinIO Docker + upload file via AWS SDK + generate presigned download URL | Hands-on | Starter code, terminal |
| 20' | Latihan mandiri: implement presigned upload URL + upload langsung dari client (fetch PUT) | Problem solving | Soal |
| 15' | Diskusi & refleksi: S3 vs R2 vs MinIO untuk production vs development, cost comparison | Q&A | — |

### Bahan Ajar
- [Module README](../42-file-upload/)
- [Cloud Storage](../42-file-upload/02-cloud-storage.md)

---

## Pertemuan 3: Image Optimization — Sharp Pipeline, Resize, WebP/AVIF, Kompresi, Thumbnail, Responsive Images, CDN

### Tujuan
- Menggunakan Sharp untuk image processing pipeline
- Resize, konversi format (WebP/AVIF), dan kompresi gambar
- Generate thumbnail otomatis & responsive images (srcset)
- Integrasi CDN untuk delivery gambar

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: diskusi masalah performa gambar besar di web, ukuran file vs kualitas | Tanya jawab | Slide, browser |
| 20' | Materi inti: Sharp API (resize, toFormat, jpeg/webp/avif options, metadata), thumbnail strategy, responsive images HTML, CDN image delivery | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: build Sharp pipeline — upload → resize → WebP convert → save thumbnail | Hands-on | Starter code |
| 20' | Latihan mandiri: implement srcset generation + AVIF fallback + CDN URL builder | Problem solving | Soal |
| 15' | Diskusi & refleksi: WebP vs AVIF browser support, tradeoff ukuran vs kualitas, CDN caching strategy | Q&A | — |

### Bahan Ajar
- [Module README](../42-file-upload/)
- [Image Optimization](../42-file-upload/03-image-optimization.md)

---

## Pertemuan 4: Production Upload — Multer + S3 Stream, Drag-Drop UI, Presigned URL Client, Progress Bar Axios, Metadata Database

### Tujuan
- Implementasi Multer memory storage + stream langsung ke S3
- Membuat drag-drop upload UI dengan preview gambar
- Progress bar real-time dengan Axios onUploadProgress
- Menyimpan metadata file ke database (SQL migration)

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap cloud storage + image optimization, demo full upload flow production | Tanya jawab | Slide, browser |
| 20' | Materi inti: Multer → S3 stream pattern, drag-drop HTML5 API, presigned URL client upload flow, Axios progress, metadata database schema (name, size, type, url, thumbnail_url) | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: build drag-drop upload UI + presigned URL client upload + progress bar + save metadata ke database | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah multiple file drag-drop + thumbnail preview grid + delete file endpoint | Problem solving | Soal |
| 15' | Refleksi & wrap-up: presentasi final upload feature, diskusi production considerations (rate limit, virus scan, backup) | Presentasi | Browser live demo |

### Bahan Ajar
- [Module README](../42-file-upload/)
- [Production Upload](../42-file-upload/04-production-upload.md)
