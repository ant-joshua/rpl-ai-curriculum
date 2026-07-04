# 🧠 Cheatsheet: Web Basics (HTML/CSS/Tailwind)

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **HTML Semantic**: `header`, `nav`, `main`, `section`, `article`, `footer`, `aside`
- **CSS Flexbox**: `display: flex`, `justify-content`, `align-items`, `flex-wrap`, `gap`
- **CSS Grid**: `display: grid`, `grid-template-columns`, `gap`
- **Responsive**: Media queries `@media (max-width: 768px)`
- **Tailwind**: Utility classes — `flex`, `grid`, `p-4`, `m-2`, `text-lg`, `bg-blue-500`
- **DOM**: `document.querySelector`, `addEventListener`, `innerHTML`
- **Fetch API**: `fetch(url)` → `response.json()` → render data

## Sintaks Penting

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
```

```css
/* Flexbox */
.container { display: flex; justify-content: center; align-items: center; gap: 16px; }

/* Grid */
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

/* Responsive */
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
```

```javascript
// Fetch + render
fetch('https://api.example.com/data')
  .then(res => res.json())
  .then(data => document.getElementById('root').innerHTML = renderHTML(data));
```

## Tips & Trik
- Flexbox buat 1 dimensi (row/column), Grid buat 2 dimensi
- Tailwind: pake `dark:` prefix buat dark mode: `bg-white dark:bg-gray-900`
- Deploy ke Vercel: connect GitHub → auto-deploy
- CSS custom properties: `--primary: #3b82f6;` — reusable

## Common Mistakes
- ❌ Lupa `<meta name="viewport">` → responsive broken
- ❌ Pake `<div>` doang tanpa semantic tags
- ❌ Fetch error: lupa `.json()`, lupa handle error

## Link Cepat
- [Module README](README.md)
- [Latihan](../exercises/04-web-basics.md)
- [Quiz](quiz.md)
