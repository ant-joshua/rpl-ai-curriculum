---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/196646/pexels-pho"
footer: "Sesi 01: Html Dasar"
---

<!-- _class: title -->
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
