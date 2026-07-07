---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/574070/pexels-pho"
footer: "Sesi 02: Tailwind"
---

<!-- _class: title -->
# 4.2 Tailwind CSS + Dark Mode + Custom Config + Deploy

## Setup Tailwind via CDN (Cara Cepat)

Paling gampang buat latihan — tinggal tambahin tag `<script>` di HTML.

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind CDN</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
  <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
    <h1 class="text-2xl font-bold text-gray-800">Halo Tailwind!</h1>
    <p class="mt-2 text-gray-600">Gak perlu nulis CSS manual.</p>
    <button class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
      Klik Aku
    </button>
  </div>
</body>
</html>
```

---

## Utility Classes Wajib

### Spacing (margin/padding)

| Class | Value |
|-------|-------|
| `p-4` | padding: 16px |
| `px-6` | padding-x: 24px |
| `py-2` | padding-y: 8px |
| `m-0` | margin: 0 |
| `mx-auto` | margin-x: auto |
| `mt-8` | margin-top: 32px |
| `gap-4` | gap: 16px |

### Flexbox & Grid

```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-4">
  <div class="flex-1">Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="bg-white p-4 rounded shadow">Card 1</div>
  <div class="bg-white p-4 rounded shadow">Card 2</div>
  <div class="bg-white p-4 rounded shadow">Card 3</div>
</div>
```

### Typography

```html
<h1 class="text-3xl font-bold text-gray-900">Heading</h1>
<h2 class="text-2xl font-semibold text-gray-800">Subheading</h2>
<p class="text-base text-gray-600 leading-relaxed">
  Paragraf dengan line-height nyaman dibaca.
</p>
<span class="text-sm text-gray-400">Small text / caption</span>
```

### Responsive Prefix

Prefix `sm:` `md:` `lg:` `xl:` dipake di depan utility class:

```html
<!-- Mobile: 1 kolom, Desktop: 3 kolom -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">

<!-- Mobile: text kecil, Desktop: text besar -->
<p class="text-sm md:text-lg lg:text-xl">Responsive text</p>

<!-- Mobile: hidden, Desktop: show -->
<div class="hidden md:block">Sidebar desktop</div>
```

---

## Dark Mode

### 1. Aktifkan dark mode di config

Via CDN:

```html
<script>
  tailwind.config = {
    darkMode: 'class',  // pakai class strategy
  }
</script>
```

### 2. Toggle dark mode

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dark Mode</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' }
  </script>
</head>
<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen p-8 transition-colors">
  <div class="max-w-md mx-auto text-center">
    <h1 class="text-2xl font-bold mb-4">Dark Mode Demo</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">Toggle untuk ganti tema.</p>

    <button id="toggleDark"
      class="bg-gray-800 dark:bg-white text-white dark:text-gray-800 px-6 py-2 rounded-lg font-medium">
      🌙 Toggle Dark Mode
    </button>

    <div class="mt-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
      <p class="text-gray-700 dark:text-gray-300">Konten ini ikut tema.</p>
    </div>
  </div>

  <script>
    const btn = document.getElementById('toggleDark');
    btn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
    });
  </script>
</body>
</html>
```

### Dark Mode Classes

```html
<!-- Background -->
<div class="bg-white dark:bg-gray-800">

<!-- Text -->
<p class="text-gray-900 dark:text-gray-100">

<!-- Border -->
<div class="border border-gray-200 dark:border-gray-700">

<!-- Card -->
<div class="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900">
```

---

## Custom Config & Components

### Custom colors & fonts

```html
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          dark: {
            bg: '#0f172a',
            card: '#1e293b',
          }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        }
      }
    }
  }
</script>
```

### Bikin Komponen Sendiri (dengan @apply)

Buat file `style.css` kalo mau pake `@apply`:

```css
/* style.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-md p-6;
  }
  .badge {
    @apply inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full;
  }
}
```

---

## Deploy ke Vercel

### Manual (drag & drop)

1. Buka [vercel.com](https://vercel.com)
2. Login pake GitHub/GitLab/Email
3. Klik **Add New → Project**
4. Import repo atau seret folder project ke Vercel
5. **Build Command:** kosongin (kalo HTML statis)
6. **Output Directory:** `.` (root)
7. Klik **Deploy**

### Via CLI

```bash

---

# Install Vercel CLI
npm install -g vercel


---

# Deploy dari folder project
vercel --prod


---

# Follow prompts — tinggal enter-enter
```

Project lo bakal live di `namaproject.vercel.app`.

---

## Latihan

1. **Bikin landing page pribadi pake Tailwind** — Hero section (nama, tagline, CTA button), About section, Skills section (grid icons/badges). Responsive: 1 kolom mobile, 2 kolom tablet, 3 kolom desktop. Dark mode toggle.
2. **Bikin component library mini** — Pake `@apply` atau inline classes: Button (primary, secondary, outline), Card (dengan image placeholder, title, desc), Badge (info, success, warning, danger), Alert (success, error, info). Kumpulin semua dalam 1 halaman.
3. **Bikin pricing table** — 3 tier (Basic, Pro, Enterprise). Masing-masing ada harga, fitur list (dengan centang/cross), CTA button. Highlight tier "Popular" dengan warna beda. Responsive.
4. **Deploy ke Vercel** — Landing page dari latihan 1 di-deploy. Kirim URL hasilnya.
