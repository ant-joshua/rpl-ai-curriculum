# 📁 Modul 42: File Upload & Storage

![File Upload Banner](https://images.pexels.com/photos/177598/pexels-photo-177598.jpeg)

> **Tingkat:** Mahir | **Estimasi Waktu:** 12 Jam | **Prasyarat:** Node.js + Express, Modul 6 (REST API)

## 📚 Deskripsi

Modul ini membahas implementasi file upload pada aplikasi Node.js — dari upload dasar menggunakan Multer hingga integrasi cloud storage (S3/R2), optimasi gambar, dan fitur production-grade seperti presigned URL, progress bar, serta drag-drop UI.

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan modul ini, peserta mampu:

1. Mengimplementasikan file upload server-side menggunakan Multer (disk & memory storage)
2. Memvalidasi file berdasarkan tipe MIME dan ukuran
3. Mengintegrasikan cloud storage (AWS S3 / Cloudflare R2 / MinIO)
4. Mengoptimalkan gambar dengan Sharp (resize, format conversion, compression)
5. Membuat thumbnail dan responsive images (srcset)
6. Mengimplementasikan upload client-side dengan progress bar
7. Menggunakan presigned URL untuk upload langsung ke S3
8. Menyimpan metadata file ke database

## 📋 Materi

| Sesi | Topik | Durasi |
|------|-------|--------|
| 1 | **Upload Basics with Multer** — disk vs memory storage, validasi file, single & multiple upload, error handling, serving static files | 3 Jam |
| 2 | **Cloud Storage** — S3/R2 concept, MinIO lokal, AWS SDK, presigned URL, bucket policy, CORS config | 3 Jam |
| 3 | **Image Optimization** — Sharp, resize, WebP/AVIF, kompresi, thumbnail, srcset, CDN | 3 Jam |
| 4 | **Production Upload** — Multer + S3 stream, drag-drop UI, presigned URL client-side, progress bar, metadata database | 3 Jam |

## 🛠️ Tools & Teknologi

- **Multer** — middleware multipart/form-data untuk Express
- **AWS SDK v3** — upload ke S3 & S3-compatible storage
- **Sharp** — image processing pipeline
- **MinIO** — S3-compatible local storage
- **Cloudflare R2** — free tier S3-compatible storage
- **Axios** — HTTP client with upload progress
- **PostgreSQL / SQLite** — metadata penyimpanan file

## 🎯 Output Akhir

Proyek akhir dari modul ini adalah **file upload API** dengan fitur:

- Upload single & multiple file dengan validasi
- Upload langsung ke S3/R2 dengan presigned URL
- Optimasi gambar (resize, WebP/AVIF, thumbnail)
- Progress bar real-time di client
- Metadata file tersimpan di database (name, size, type, url, thumbnail_url)

## 🤖 AI Prompt Exercises

Gunakan prompt ini untuk latihan dengan AI assistant:

```
"Buat Express middleware untuk validasi file upload — cek mimetype (hanya image/jpeg, image/png), 
maksimal ukuran 5MB, dengan error message yang jelas dalam Bahasa Indonesia."
```

```
"Generate kode Sharp pipeline untuk: resize gambar ke 300x300, konversi ke WebP dengan quality 80%, 
simpan sebagai thumbnail. Output dalam format async/await."
```

```
"Tulis fungsi untuk generate presigned URL S3 dengan expiry 1 jam, menggunakan AWS SDK v3. 
Sertakan contoh cara akses dari browser."
```

```
"Buat HTML + CSS + JS untuk drag-drop file upload dengan preview gambar dan progress bar real-time. 
Gunakan Axios dengan onUploadProgress."
```

---
**Next Module:** [Module 43 - WebSocket & Real-Time Apps](../43-websocket/README.md)
