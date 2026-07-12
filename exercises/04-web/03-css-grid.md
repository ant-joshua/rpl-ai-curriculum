# Web Development — Exercise #3: CSS Grid

> **Level:** Beginner
> **Topics:** CSS Grid, grid-template-columns, gap, responsive columns, media queries

## Instructions

Buat responsive card gallery menggunakan CSS Grid.

Aturan:
1. Gallery menggunakan `display: grid`.
2. Desktop (> 1024px): 3 kolom.
3. Tablet (768px - 1024px): 2 kolom.
4. Mobile (< 768px): 1 kolom.
5. Gunakan `gap: 20px` antar card.

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Grid Gallery</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #f5f5f5; }

    .gallery {
      display: /* ? */;
      grid-template-columns: repeat(/* ? */, 1fr); /* 3 columns default */
      gap: /* ? */;
    }

    .card {
      background: white;
      border-radius: 10px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .card:hover {
      transform: translateY(-4px);
    }

    .card h3 { margin-bottom: 0.5rem; color: #6366f1; }
    .card p { color: #666; line-height: 1.6; }
    .card .price { font-size: 1.5rem; font-weight: bold; color: #333; margin-top: 1rem; }
    .card .category { display: inline-block; background: #eef; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; color: #6366f1; margin-top: 0.5rem; }

    @media (max-width: 1024px) {
      .gallery { grid-template-columns: repeat(/* ? */, 1fr); }
    }

    @media (max-width: 768px) {
      .gallery { grid-template-columns: /* ? */; }
    }
  </style>
</head>
<body>
  <h1 style="margin-bottom: 2rem;">Produk Kami</h1>
  <div class="gallery">
    <div class="card">
      <span class="category">Elektronik</span>
      <h3>Laptop Pro</h3>
      <p>Laptop dengan performa tinggi untuk coding dan desain.</p>
      <div class="price">Rp15.000.000</div>
    </div>
    <div class="card">
      <span class="category">Aksesoris</span>
      <h3>Mouse Wireless</h3>
      <p>Mouse ergonomis dengan koneksi Bluetooth.</p>
      <div class="price">Rp250.000</div>
    </div>
    <div class="card">
      <span class="category">Pendidikan</span>
      <h3>Buku Coding</h3>
      <p>Panduan lengkap belajar JavaScript dari dasar.</p>
      <div class="price">Rp85.000</div>
    </div>
    <div class="card">
      <span class="category">Elektronik</span>
      <h3>Monitor 4K</h3>
      <p>Monitor 27 inch dengan resolusi 4K UHD.</p>
      <div class="price">Rp4.500.000</div>
    </div>
    <div class="card">
      <span class="category">Aksesoris</span>
      <h3>Keyboard Mechanical</h3>
      <p>Keyboard mechanical dengan switch biru.</p>
      <div class="price">Rp750.000</div>
    </div>
    <div class="card">
      <span class="category">Pendidikan</span>
      <h3>Kursus Online</h3>
      <p>Akses premium ke semua materi coding.</p>
      <div class="price">Rp500.000</div>
    </div>
  </div>
</body>
</html>
```

## Expected Output

- Desktop (> 1024px): 3 kolom grid.
- Tablet (768-1024px): 2 kolom.
- Mobile (< 768px): 1 kolom.

## Test Cases

```javascript
// Test secara visual — resize browser
console.log("CSS Grid gallery siap. Cek responsive columns.");
```
