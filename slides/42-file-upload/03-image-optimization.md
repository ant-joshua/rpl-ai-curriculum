---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 📁 Modul 42: File Upload & Storage"
footer: "Sesi 03: Image Optimization"
---

<!-- _class: title -->
# Sesi 3: Image Optimization with Sharp

> **Durasi:** 3 Jam | **Sub-Modul dari 42-File-Upload**

## 📌 Tujuan Sesi

Setelah sesi ini, peserta mampu:
- Menggunakan Sharp untuk image processing pipeline
- Resize gambar ke berbagai dimensi
- Konversi format ke WebP dan AVIF
- Kompresi dan optimasi kualitas
- Generate thumbnail otomatis
- Membuat responsive images dengan srcset
- Integrasi CDN untuk delivery gambar

---

## 1. Apa itu Sharp?

**Sharp** adalah library image processing Node.js berkinerja tinggi. Menggunakan libvips (native) sehingga jauh lebih cepat dari ImageMagick atau Jimp.

```
Input (JPEG/PNG/WebP/GIF/TIFF/AVIF/SVG)
  │
  ▼
Sharp Pipeline ──resize──> convert ──> compress ──> output
  │
  ▼
Output (JPEG/PNG/WebP/AVIF + buffer/stream/file)
```

### Instalasi

```bash
npm install sharp
```

---

## 2. Operasi Dasar Sharp

### Membaca & Menulis File

```javascript
const sharp = require('sharp');

// Baca file, proses, simpan
await sharp('input.jpg')
  .resize(800, 600)
  .toFile('output.jpg');

// Proses dari buffer
const buffer = req.file.buffer; // dari Multer memory storage
const result = await sharp(buffer)
  .resize(400)
  .toBuffer();

// Output ke format berbeda
await sharp('input.jpg')
  .webp({ quality: 80 })
  .toFile('output.webp');
```

### Metadata Gambar

```javascript
const metadata = await sharp('input.jpg').metadata();
console.log({
  width: metadata.width,       // 1920
  height: metadata.height,      // 1080
  format: metadata.format,      // 'jpeg'
  size: metadata.size,          // bytes
  exif: metadata.exif,          // EXIF data (buffer)
  hasAlpha: metadata.hasAlpha,  // boolean (PNG transparency)
  space: metadata.space         // 'srgb'
});
```

---

## 3. Resize Gambar

### Resize dengan Maintain Aspect Ratio

```javascript
// Resize width 300px, height auto (aspect ratio terjaga)
await sharp('input.jpg')
  .resize(300)
  .toFile('thumb-300.jpg');

// Resize height 200px, width auto
await sharp('input.jpg')
  .resize({ height: 200 })
  .toFile('thumb-200.jpg');

// Fit dalam kotak 400x400
await sharp('input.jpg')
  .resize(400, 400, {
    fit: 'cover',   // crop untuk isi kotak
    position: 'centre'
  })
  .toFile('thumb-400.jpg');
```

### Mode Fit

| Fit | Deskripsi | Contoh |
|-----|-----------|--------|
| `cover` | Crop image agar memenuhi dimensi (default) | Kotak 400x400 dari landscape |
| `contain` | Seluruh gambar masuk, ada background | Gambar utuh dengan padding |
| `fill` | Stretch gambar ke dimensi, aspect ratio tidak terjaga | Distorsi |
| `inside` | Resize agar muat di dalam kotak (tidak lebih besar) | Thumbnail kecil |
| `outside` | Resize agar seluruh kotak terisi (bisa overflow) | Crop dengan ratio tertentu |

```javascript
// contain — gambar utuh dengan background putih
await sharp('input.png')
  .resize(200, 200, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  })
  .toFile('thumb-contained.png');
```

---

## 4. Format Conversion — WebP & AVIF

### WebP

WebP memberikan kompresi 25-35% lebih baik dari JPEG dengan kualitas setara.

```javascript
// Konversi JPEG ke WebP
await sharp('input.jpg')
  .webp({ quality: 80 })  // 0-100, default 80
  .toFile('output.webp');

// WebP dengan opsi
await sharp('input.png')
  .webp({
    quality: 75,
    lossless: false,       // true untuk lossless (PNG-like)
    nearLossless: false,   // near-lossless mode
    alphaQuality: 100,     // kualitas alpha channel
    effort: 6              // 0-6, higher = better compression
  })
  .toFile('output.webp');
```

### AVIF

AVIF memberikan kompresi ~50% lebih baik dari JPEG, tapi encoding lebih lambat.

```javascript
// Konversi ke AVIF
await sharp('input.jpg')
  .avif({ quality: 65 })
  .toFile('output.avif');

// AVIF opsi
await sharp('input.jpg')
  .avif({
    quality: 65,
    lossless: false,
    speed: 5  // 0-8, higher = faster but larger
  })
  .toFile('output.avif');
```

### Perbandingan Format

| Format | Size (1MB JPEG) | Kecepatan Encode | Browser Support |
|--------|----------------|-------------------|-----------------|
| JPEG | 1MB (baseline) | - | Universal |
| WebP (q80) | ~250KB | Cepat | Modern browsers |
| AVIF (q65) | ~150KB | Lambat | Chrome, Firefox |
| PNG | 2-5MB | Sedang | Universal |

---

## 5. Quality Compression

### JPEG Compression

```javascript
await sharp('input.jpg')
  .jpeg({
    quality: 80,          // 1-100, default 80
    progressive: true,    // progressive JPEG (render bertahap)
    chromaSubsampling: '4:2:0',  // subsampling, '4:4:0' untuk kualitas lebih
    trellisQuantisation: true,
    overshootDeringing: true,
    optimiseScans: true
  })
  .toFile('optimized.jpg');
```

### PNG Compression

```javascript
await sharp('input.png')
  .png({
    compressionLevel: 9,  // 0-9, lebih tinggi = lebih kecil
    palette: true,        // quantize ke palette (cocok untuk logo/icon)
    quality: 80,
    adaptiveFiltering: true
  })
  .toFile('optimized.png');
```

---

## 6. Thumbnail Generation

Pipeline: upload → resize multiple sizes → save semua

```javascript
async function generateThumbnails(inputPath, outputName) {
  const sizes = [
    { width: 150, suffix: 'thumb' },
    { width: 400, suffix: 'small' },
    { width: 800, suffix: 'medium' },
    { width: 1200, suffix: 'large' }
  ];

  const results = [];

  for (const size of sizes) {
    const outputPath = `${outputName}-${size.suffix}.webp`;
    
    await sharp(inputPath)
      .resize(size.width, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    results.push({
      size: size.suffix,
      width: size.width,
      path: outputPath
    });
  }

  return results;
}
```

### Integrasi dengan Multer + S3

```javascript
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload/with-thumbnails', upload.single('image'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const name = Date.now().toString();
    
    // Original ke S3
    await uploadToS3(buffer, `originals/${name}.jpg`, 'image/jpeg');
    
    // Generate thumbnail
    const thumbBuffer = await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
    
    await uploadToS3(thumbBuffer, `thumbnails/${name}-thumb.webp', 'image/webp');
    
    res.json({
      original: `https://cdn.example.com/originals/${name}.jpg`,
      thumbnail: `https://cdn.example.com/thumbnails/${name}-thumb.webp`
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memproses gambar.' });
  }
});
```

---

## 7. Responsive Images (srcset)

HTML5 `srcset` memungkinkan browser memilih ukuran gambar yang tepat.

```html
<img
  src="photo-800.webp"
  srcset="
    photo-400.webp 400w,
    photo-800.webp 800w,
    photo-1200.webp 1200w
  "
  sizes="(max-width: 600px) 400px,
         (max-width: 1200px) 800px,
         1200px"
  alt="Photo"
/>
```

### Generator srcset JSON

```javascript
async function generateSrcset(inputPath, baseName) {
  const breakpoints = [400, 800, 1200, 1920];
  const sources = [];

  for (const width of breakpoints) {
    const key = `${baseName}-${width}.webp`;
    
    await sharp(inputPath)
      .resize(width, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(`public/images/${key}`);

    sources.push({
      src: `/images/${key}`,
      width: width
    });
  }

  return {
    src: `/images/${baseName}-800.webp`,
    srcset: sources.map(s => `${s.src} ${s.width}w`).join(', '),
    sizes: '(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px'
  };
}
```

### Picture Element (Format Fallback)

```html
<picture>
  <!-- AVIF untuk browser yang support -->
  <source srcset="photo.avif" type="image/avif" />
  <!-- WebP fallback -->
  <source srcset="photo.webp" type="image/webp" />
  <!-- JPEG fallback terakhir -->
  <img src="photo.jpg" alt="Photo" />
</picture>
```

---

## 8. CDN Integration

CDN mempercepat delivery gambar ke pengguna global.

### Cloudflare Images / Imgix

```
// Cloudflare Images
https://images.example.com/cdn-cgi/image/width=400,quality=80/https://example.com/photo.jpg

// Imgix
https://your-account.imgix.net/photo.jpg?w=400&q=80&auto=format
```

### Self-Hosted dengan Sharp + CDN

```javascript
// Upload + optimasi + push ke CDN
async function processAndDeliver(buffer, filename) {
  // Optimasi
  const optimized = await sharp(buffer)
    .resize(1200)
    .webp({ quality: 82 })
    .toBuffer();

  // Upload ke origin storage (S3/R2)
  const key = `images/${filename}.webp`;
  await uploadToR2(optimized, key, 'image/webp');

  // URL CDN
  const cdnUrl = `https://cdn.example.com/${key}`;
  return cdnUrl;
}
```

### Cache Headers

```javascript
// Set Cache-Control untuk gambar di S3
const command = new PutObjectCommand({
  Bucket: bucket,
  Key: key,
  Body: optimizedBuffer,
  ContentType: 'image/webp',
  CacheControl: 'public, max-age=31536000, immutable'
});
```

---

## 📝 Latihan

### Latihan 1: Image Processing Pipeline
Buat fungsi `processAvatar(buffer)` yang:
- Resize ke 200x200 (cover)
- Konversi ke WebP quality 85
- Output buffer
- Return metadata (width, height, size, format)

<details>
<summary>💡 Petunjuk</summary>

```javascript
async function processAvatar(buffer) {
  const result = await sharp(buffer)
    .resize(200, 200, { fit: 'cover', position: 'centre' })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });
  
  return {
    buffer: result.data,
    metadata: result.info
  };
}
```
</details>

### Latihan 2: Multi-Format Upload
Buat endpoint upload yang menghasilkan 3 varian:
- `original.jpg` — file asli (simpan langsung)
- `photo.webp` — WebP quality 80
- `photo.avif` — AVIF quality 65
- Kembalikan URL ketiganya

<details>
<summary>💡 Petunjuk</summary>

Gunakan `.clone()` atau proses buffer sequential.
Untuk AVIF, set quality lebih rendah dari WebP karena kompresinya lebih efisien.
</details>

### Latihan 3: Thumbnail Grid Generator
Buat endpoint `POST /upload/gallery` yang:
- Terima 1-10 file gambar
- Untuk setiap file, generate: large (1200px), medium (600px), thumb (150px)
- Simpan semua varian ke S3/R2
- Return array object dengan struktur:

```json
{
  "id": "photo-1",
  "urls": {
    "large": "https://cdn.example.com/photo-1-lg.webp",
    "medium": "https://cdn.example.com/photo-1-md.webp",
    "thumb": "https://cdn.examplen.com/photo-1-thumb.webp"
  }
}
```

<details>
<summary>💡 Petunjuk</summary>

Gunakan `Promise.all` untuk memproses semua variant secara paralel.
Atur `withoutEnlargement: true` agar gambar kecil tidak di-upscale.
</details>

### Latihan 4: Programmatic CDN
Buat fungsi yang menghasilkan HTML `<picture>` element dari satu file upload:

```javascript
function generatePictureElement(imageName, alt) {
  // Return string HTML dengan
  // - AVIF source
  // - WebP source  
  // - JPEG fallback
  // - srcset untuk 400w, 800w, 1200w
}
```

<details>
<summary>💡 Petunjuk</summary>

Generate semua format dan ukuran dulu, baru buat string HTML.
Gunakan template literal untuk HTML.
</details>

---

## ⚡ Rangkuman

| Konsep | Poin Kunci |
|--------|-----------|
| **Sharp** | Image processing Node.js, berbasis libvips, cepat |
| **Resize** | `resize(width, height, {fit, position})` |
| **WebP** | Kompresi 25-35% lebih baik dari JPEG |
| **AVIF** | Kompresi ~50% lebih baik, encoding lambat |
| **Thumbnail** | Multiple sizes dari satu source |
| **srcset** | Browser pilih ukuran sesuai viewport |
| **CDN** | Cache-Control, Cloudflare, Imgix |

---
**Lanjut ke:** [Sesi 4: Production Upload](./04-production-upload.md)
