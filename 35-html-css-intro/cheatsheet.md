# 🧠 Cheatsheet: HTML & CSS Intro

> Referensi cepet — 1 halaman.

## Topik Utama

**HTML Structure:** `<!DOCTYPE html>`, `<html>`, `<head>` (meta, title, link CSS), `<body>` (content)

**HTML Elements:**
- **Semantic:** `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
- **Text:** `<h1>`-`<h6>`, `<p>`, `<strong>`, `<em>`, `<a>`, `<ul>`, `<ol>`, `<li>`
- **Media:** `<img>` (always use `alt`), `<video>`, `<audio>`
- **Table:** `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`

**CSS Basics:** Selectors (class, id, element, attribute), Box Model (margin, border, padding, content)

**CSS Layout:**
- **Flexbox** — 1D layout (row atau column). `display: flex`, `justify-content`, `align-items`, `gap`
- **Grid** — 2D layout (row + column). `display: grid`, `grid-template-columns`, `gap`

**Forms:** `<form>`, `<input>` (text, email, password, number, date, file, checkbox, radio), `<select>`, `<textarea>`, `<button>`

**Responsive:** Media queries `@media (max-width: 768px)`, `viewport` meta tag

## Command / Sintaks Penting

```html
<!-- HTML boilerplate -->
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Judul Halaman</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav><a href="/">Home</a> <a href="/about">About</a></nav>
    </header>
    <main>
        <article>
            <h1>Hello World</h1>
            <p>Paragraph pertama.</p>
        </article>
    </main>
    <footer><p>&copy; 2024</p></footer>
</body>
</html>
```

```css
/* Flexbox layout */
.container {
  display: flex;
  justify-content: space-between;  /* horizontal */
  align-items: center;             /* vertical */
  gap: 16px;
  flex-wrap: wrap;
}
.child { flex: 1; } /* equal width */

/* Grid layout */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 kolom equal */
  gap: 20px;
}
@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; } /* 1 kolom di mobile */
}

/* Box model */
.box {
  width: 300px;
  padding: 16px;      /* inside border */
  border: 1px solid #ccc;
  margin: 8px;        /* outside border */
  box-sizing: border-box; /* width includes padding + border */
}

/* Form styling */
input[type="email"]:valid { border-color: green; }
input[type="email"]:invalid { border-color: red; }
label { display: block; margin-bottom: 4px; font-weight: 600; }
```

## Tips & Trik

- **`box-sizing: border-box`** — biar `width` termasuk padding + border
- **Flexbox untuk navbar**, Grid untuk page layout
- **`alt` wajib** di `<img>` — accessibility + SEO
- **Semantic HTML** — screen reader & SEO lebih baik
- **`<meta viewport>`** — wajib agar responsive di mobile
- **Form validation** — pake `required`, `pattern`, `type` di HTML, tambah JS validation
- **Deploy:** push ke Git → Vercel/Netlify auto-deploy

## Common Mistakes

- **Missing `<meta viewport>`** — responsive CSS gak jalan di mobile
- **Div-itis** — semua pake `<div>`, padahal ada semantic tag yang lebih tepat
- **No `alt` di images** — accessibility violation
- **`width` tanpa `box-sizing: border-box`** — layout break karena padding
- **Inline styles everywhere** — pake CSS file, jangan `style=""`
- **No semantic structure** — screen reader gak bisa navigate
- **Flexbox vs Grid confusion** — Flexbox = 1D, Grid = 2D

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
