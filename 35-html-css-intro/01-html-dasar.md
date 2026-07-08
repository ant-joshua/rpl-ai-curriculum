# 1.1 HTML Dasar

## Struktur HTML

Setiap file HTML punya struktur dasar yang wajib ada:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Judul Halaman</title>
</head>
<body>
    <!-- Semua konten tampil disini -->
</body>
</html>
```

| Bagian | Fungsi |
|--------|--------|
| `<!DOCTYPE html>` | Ngasih tau browser ini pake HTML5 |
| `<html>` | Elemen root dari halaman |
| `<head>` | Meta data, title, link CSS (gak tampak) |
| `<body>` | Semua konten yang keliatan di browser |

## Heading & Paragraph

```html
<h1>Heading 1 — Paling Besar</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6 — Paling Kecil</h6>

<p>Ini paragraph. Bisa panjang banget, nanti otomatis wrap sendiri sama browser.</p>
<p>Paragraph baru pake &lt;p&gt; baru.</p>
```

## Link (Anchor)

```html
<a href="https://google.com">Google</a>
<a href="tentang.html">Halaman Tentang</a>
<a href="#section2">Lompat ke section 2</a>
<a href="mailto:email@example.com">Email Saya</a>
<a href="https://google.com" target="_blank">Buka di tab baru</a>
```

**Atribut penting:**
- `href` — tujuan link
- `target="_blank"` — buka tab baru
- `#id` — anchor ke elemen tertentu di halaman yang sama

## Gambar

```html
<img src="foto.jpg" alt="Deskripsi gambar" width="400" height="300">
<img src="https://via.placeholder.com/200" alt="Gambar placeholder">
```

**Atribut penting:**
- `src` — path atau URL gambar
- `alt` — teks alternatif (penting buat aksesibilitas & SEO)
- `width` / `height` — ukuran (bisa di-css nanti)

## List

### Ordered List (berurutan)

```html
<ol>
    <li>Bangun tidur</li>
    <li>Gosok gigi</li>
    <li>Mandi</li>
</ol>
```

### Unordered List (tidak berurutan)

```html
<ul>
    <li>Nasi Goreng</li>
    <li>Mie Ayam</li>
    <li>Sate</li>
</ul>
```

### Nested List

```html
<ul>
    <li>Makanan
        <ul>
            <li>Berat: Nasi, Mie</li>
            <li>Ringan: Cemilan, Buah</li>
        </ul>
    </li>
    <li>Minuman
        <ul>
            <li>Panas: Kopi, Teh</li>
            <li>Dingin: Jus, Soda</li>
        </ul>
    </li>
</ul>
```

## Table

```html
<table border="1">
    <tr>
        <th>Nama</th>
        <th>Kelas</th>
        <th>Nilai</th>
    </tr>
    <tr>
        <td>Budi</td>
        <td>X-RPL</td>
        <td>90</td>
    </tr>
    <tr>
        <td>Ani</td>
        <td>X-RPL</td>
        <td>85</td>
    </tr>
</table>
```

| Tag | Fungsi |
|-----|--------|
| `<table>` | Bungkus table |
| `<tr>` | Table row (baris) |
| `<td>` | Table data (kolom) |
| `<th>` | Table header (judul kolom) |

## Div & Span

```html
<div style="background: lightblue; padding: 10px;">
    <p>Div itu <strong>block</strong> — ambil satu baris penuh.</p>
    <p>Biasanya dipake buat grouping elemen.</p>
</div>

<p>Ini teks biasa, <span style="color: red;">ini teks merah pake span</span>, lanjut lagi.</p>
```

- `<div>` — block container (turun baru)
- `<span>` — inline container (nggak turun baru)

## Semantic HTML

Daripada pake `<div>` terus, pake tag semantic biar struktur jelas:

```html
<header>
    <h1>Website Saya</h1>
    <nav>
        <a href="index.html">Home</a>
        <a href="about.html">Tentang</a>
        <a href="contact.html">Kontak</a>
    </nav>
</header>

<main>
    <section>
        <h2>Artikel Terbaru</h2>
        <article>
            <h3>Belajar HTML Itu Gampang</h3>
            <p>HTML itu dasar web. Semua website pake HTML...</p>
        </article>
        <article>
            <h3>Tips Belajar Coding</h3>
            <p>Konsisten tiap hari, praktek langsung...</p>
        </article>
    </section>

    <aside>
        <h3>Sidebar</h3>
        <p>Link terkait, iklan, dsb.</p>
    </aside>
</main>

<footer>
    <p>&copy; 2025 Website Saya</p>
</footer>
```

**Tag semantic utama:**

| Tag | Fungsi |
|-----|--------|
| `<header>` | Kepala halaman / section |
| `<nav>` | Navigasi |
| `<main>` | Konten utama (cuma 1 per halaman) |
| `<section>` | Kelompok konten |
| `<article>` | Konten independen (artikel, post) |
| `<aside>` | Sidebar, konten sampingan |
| `<footer>` | Kaki halaman |

## Latihan

1. **Profile Page** — Bikin halaman HTML profil diri sendiri. Isi: foto (pake URL), nama, deskripsi singkat, list hobi, link ke IG/GitHub.

2. **Halaman Artikel** — Bikin artikel pendek (min 2 paragraf) pake heading h1-h3, ada gambar, dan list poin penting. Pake semantic tags.

3. **Table Jadwal** — Bikin table jadwal pelajaran 1 minggu (5 hari × 3 jam pelajaran). Kolom: jam, senin, selasa, rabu, kamis, jumat.

4. **Homepage Semantic** — Bikin homepage lengkap pake `header`, `nav`, `main`, `section`, `aside`, `footer`. Isi bebas — bisa tentang diri sendiri, hobi, atau topik favorit.

5. **Canvas drawing app.** Bikin halaman HTML dengan canvas. Gambar: 3 persegi warna berbeda, 2 garis, 1 lingkaran, dan teks. Sertakan tombol "Clear" yang nge-reset canvas.

6. **SVG icon set.** Bikin 3 ikon SVG: search (🔍), menu (☰), dan close (✕). Masing-masing ukuran 24×24px. Bisa di-hover berubah warna. Kumpulkan dalam 1 halaman HTML.

7. **Drag & drop to-do.** Bikin halaman to-do list dengan 3 kolom: To Do, In Progress, Done. Item bisa di-drag antar kolom. Style pake CSS. Sertakan minimal 4 item.

---

## HTML Canvas — Gambar Pake JavaScript

Canvas adalah elemen HTML buat gambar grafis pake JavaScript. Cocok buat game, chart, animasi, atau edit foto.

```html
<canvas id="myCanvas" width="400" height="300"></canvas>
```

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Gambar persegi
ctx.fillStyle = '#3498db';
ctx.fillRect(20, 20, 150, 100);

// Gambar garis
ctx.beginPath();
ctx.moveTo(50, 50);
ctx.lineTo(200, 150);
ctx.strokeStyle = '#e74c3c';
ctx.lineWidth = 3;
ctx.stroke();

// Gambar lingkaran
ctx.beginPath();
ctx.arc(200, 150, 50, 0, Math.PI * 2);
ctx.fillStyle = '#2ecc71';
ctx.fill();

// Teks
ctx.font = '20px Arial';
ctx.fillStyle = '#333';
ctx.fillText('Halo Canvas!', 50, 250);
```

### Canvas Animation

```javascript
let x = 0;
const speed = 2;

function animate() {
  ctx.clearRect(0, 0, 400, 300);  // Hapus canvas

  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(x, 150, 30, 0, Math.PI * 2);
  ctx.fill();

  x += speed;
  if (x > 400) x = 0;

  requestAnimationFrame(animate);  // Loop
}
animate();
```

---

## SVG — Scalable Vector Graphics

SVG = gambar vektor di HTML. Gak pecah meski di-zoom.

```html
<!-- Lingkaran -->
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40"
    stroke="#3498db" stroke-width="4" fill="transparent" />
</svg>

<!-- Persegi dengan sudut melengkung -->
<svg width="200" height="100">
  <rect x="10" y="10" width="180" height="80" rx="10"
    fill="#2ecc71" />
</svg>

<!-- Path (bentuk bebas) -->
<svg width="200" height="200">
  <path d="M 10 10 L 50 10 L 30 50 Z" fill="#e74c3c" />
</svg>

<!-- SVG + CSS -->
<style>
  .icon:hover circle { fill: #3498db; transition: fill 0.3s; }
</style>
<svg class="icon" width="50" height="50">
  <circle cx="25" cy="25" r="20" fill="#95a5a6" />
</svg>
```

### SVG vs Canvas

| Aspek | SVG | Canvas |
|-------|-----|--------|
| Type | Vector (shape-based) | Pixel (raster-based) |
| Scaling | Gak pecah | Pecah kalo diperbesar |
| Performance | Lambat kalo banyak elemen | Cepat buat banyak objek |
| Interaktivitas | Bisa CSS, event listener | Manual hitung koordinat |
| Cocok buat | Ikon, logo, ilustrasi | Game, chart real-time, filter |

---

## Drag & Drop API

HTML5 punya API drag & drop native — gak perlu library.

### Elemen yang Bisa Di-drag

```html
<div draggable="true" id="item1" class="drag-item">Item 1</div>
<div draggable="true" id="item2" class="drag-item">Item 2</div>

<div id="dropZone" class="drop-zone">Drop here</div>
```

```javascript
const items = document.querySelectorAll('.drag-item');
const dropZone = document.getElementById('dropZone');

items.forEach(item => {
  item.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
  });

  item.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
  });
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();  // Wajib biar bisa drop
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const draggedElement = document.getElementById(id);
  dropZone.appendChild(draggedElement);
  dropZone.classList.remove('drag-over');
});
```

### Contoh: To-Do List Drag & Drop

```html
<style>
  .todo-column {
    min-height: 200px;
    border: 2px dashed #ccc;
    padding: 16px;
    margin: 8px;
  }
  .todo-item {
    padding: 8px;
    margin: 4px;
    background: #f0f0f0;
    cursor: grab;
    border-radius: 4px;
  }
</style>

<div style="display: flex;">
  <div class="todo-column" id="todo" ondrop="drop(event)" ondragover="allowDrop(event)">
    <h3>To Do</h3>
    <div class="todo-item" draggable="true" ondragstart="drag(event)">Belajar HTML</div>
    <div class="todo-item" draggable="true" ondragstart="drag(event)">Buat Project</div>
  </div>
  <div class="todo-column" id="done" ondrop="drop(event)" ondragover="allowDrop(event)">
    <h3>Done</h3>
  </div>
</div>

<script>
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData('text', ev.target.outerHTML); ev.target.remove(); }
function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData('text');
  const el = document.createElement('div');
  el.innerHTML = data;
  el.firstChild.setAttribute('draggable', 'true');
  el.firstChild.addEventListener('dragstart', drag);
  ev.target.appendChild(el.firstChild);
}
</script>
```
