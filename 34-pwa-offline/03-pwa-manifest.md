# 3. Web App Manifest & Install Prompt

## Apa Itu Web App Manifest?

Manifest adalah file JSON yang ngasih tau browser tentang aplikasi web kamu. Isinya: nama, icon, warna tema, orientasi layar, dll. Tanpa manifest, browser gak tau kalo web kamu adalah **aplikasi**.

### Kenapa Manifest Penting?

| Fitur | Tanpa Manifest | Dengan Manifest |
|-------|---------------|-----------------|
| Install ke home screen | ❌ | ✅ |
| Nama aplikasi di launcher | ❌ (pake domain) | ✅ |
| Icon di launcher | ❌ (screenshot) | ✅ Custom icon |
| Splash screen | ❌ (blank putih) | ✅ Branded |
| Full screen mode | ❌ | ✅ (standalone) |
| Status bar theme | ❌ | ✅ (theme_color) |
| Orientation lock | ❌ | ✅ |
| App shortcuts | ❌ | ✅ |
| Share target | ❌ | ✅ |

## Struktur manifest.json

```json
{
  "name": "Notes App",
  "short_name": "Notes",
  "description": "Aplikasi catatan offline-first dengan PWA",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#007aff",
  "background_color": "#ffffff",
  "lang": "id-ID",
  "dir": "ltr",
  "categories": ["productivity", "utilities"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Halaman utama Notes App"
    },
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Tampilan desktop Notes App"
    }
  ],
  "shortcuts": [
    {
      "name": "Tambah Catatan Baru",
      "short_name": "Tambah",
      "description": "Buat catatan baru",
      "url": "/new-note",
      "icons": [{ "src": "/icons/shortcut-add.png", "sizes": "96x96" }]
    },
    {
      "name": "Catatan Terbaru",
      "short_name": "Terbaru",
      "description": "Lihat catatan terbaru",
      "url": "/recent",
      "icons": [{ "src": "/icons/shortcut-recent.png", "sizes": "96x96" }]
    }
  ],
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.example.notes"
    }
  ],
  "prefer_related_applications": false,
  "display_override": ["window-controls-overlay", "standalone", "minimal-ui"],
  "handle_links": "preferred",
  "launch_handler": {
    "client_mode": "focus-existing"
  },
  "edge_side_panel": {
    "preferred_width": 480
  }
}
```

### Penjelasan Key Properties

| Key | Wajib | Fungsi |
|-----|-------|--------|
| `name` | ✅ | Nama aplikasi yang muncul di launcher & splash screen |
| `short_name` | ✅ | Nama pendek (di icon, limited space) |
| `start_url` | ✅ | Halaman pertama pas aplikasi dibuka |
| `display` | ✅ | Mode tampilan: `fullscreen`, `standalone`, `minimal-ui`, `browser` |
| `icons` | ✅ | Array icon dengan berbagai ukuran |
| `scope` | ❌ | Batas URL yang dianggap bagian dari aplikasi |
| `theme_color` | ❌ | Warna status bar & toolbar |
| `background_color` | ❌ | Warna background splash screen |
| `orientation` | ❌ | Lock orientasi layar |
| `shortcuts` | ❌ | Context menu items di icon |
| `screenshots` | ❌ | Screenshot buat Play Store / app catalog |
| `categories` | ❌ | Kategori aplikasi |
| `description` | ❌ | Deskripsi (buat store listing) |

### Nilai `display`

```json
{
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"]
}
```

| Mode | Title Bar | URL Bar | Tab Bar | Cocok untuk |
|------|-----------|---------|---------|-------------|
| `fullscreen` | ❌ | ❌ | ❌ | Game, media player |
| `standalone` | ✅ (custom) | ❌ | ❌ | **Kebanyakan PWA** |
| `minimal-ui` | ✅ | ✅ (minimal) | ❌ | Utility apps |
| `browser` | ✅ | ✅ | ✅ | Fallback |

## Generate Icon PWA

### Tools

- **PWABuilder** — https://www.pwabuilder.com/imageGenerator
- **Real Favicon Generator** — https://realfavicongenerator.net/
- **Maskable.app** — https://maskable.app/

### Script Generate Icon (Node.js)

```bash
npm install sharp --save-dev
```

```javascript
// scripts/generate-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 192, 384, 512];
const INPUT = path.join(__dirname, '../public/logo-1024.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
  for (const size of SIZES) {
    await sharp(INPUT)
      .resize(size, size)
      .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));

    // Generate maskable version (10% padding)
    const maskableSize = Math.round(size * 0.8);
    const padding = Math.round(size * 0.1);
    await sharp(INPUT)
      .resize(maskableSize, maskableSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}-maskable.png`));
  }
  console.log(`[Icons] Generated ${SIZES.length * 2} icons`);
}

generateIcons().catch(console.error);
```

### Link manifest di HTML

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notes App</title>

  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json">

  <!-- Apple touch icon (iOS fallback) -->
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png">

  <!-- Meta theme color -->
  <meta name="theme-color" content="#007aff">

  <!-- iOS splash screen meta -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Notes">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="app">
  <meta name="twitter:app:name:iphone" content="Notes App">

  <!-- Facebook / Open Graph -->
  <meta property="og:title" content="Notes App">
  <meta property="og:description" content="Aplikasi catatan offline-first">
  <meta property="og:type" content="website">
</head>
```

## Install Prompt (beforeinstallprompt)

### Cara Kerja

Browser otomatis nampilin install banner kalo:
1. ✅ Manifest valid (name, short_name, icons ≥ 192x192, display ≠ browser)
2. ✅ Service Worker terdaftar dan aktif
3. ✅ HTTPS (atau localhost)
4. ✅ User interaksi minimal 30 detik
5. ✅ Minimal 1 halaman dikunjungi

### Custom Install Button

```javascript
// main.js
let deferredPrompt = null;
const installButton = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', event => {
  // Cegah banner otomatis
  event.preventDefault();

  // Simpan event buat trigger nanti
  deferredPrompt = event;

  // Tampilkan tombol install kustom
  installButton.style.display = 'block';
  console.log('[Install] beforeinstallprompt fired — ready to install');

  // Analytics
  gtag('event', 'beforeinstallprompt', {
    platforms: event.platforms // ['web', 'play', 'windows', 'mac']
  });
});

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;

  // Tampilkan prompt install
  deferredPrompt.prompt();

  // Tunggu hasil user
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    console.log('[Install] User accepted');
    gtag('event', 'install_accepted');
  } else {
    console.log('[Install] User dismissed');
    gtag('event', 'install_dismissed');
  }

  // Reset — prompt cuma bisa sekali
  deferredPrompt = null;
  installButton.style.display = 'none';
});
```

### Track Install Status

```javascript
// Cek apakah PWA sudah terinstall
const isInstalled = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true; // iOS fallback

if (isInstalled) {
  console.log('[PWA] Running as installed app');
  document.body.classList.add('is-installed');
}

// Listen display mode changes
window.matchMedia('(display-mode: standalone)').addEventListener('change', event => {
  if (event.matches) {
    console.log('[PWA] App launched from home screen');
  }
});
```

### Desktop Install (ChromeOS, Windows, Mac, Linux)

```javascript
// Deteksi platform
function detectPlatform() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'windows';
  if (ua.includes('Mac OS')) return 'mac';
  if (ua.includes('Linux')) return 'linux';
  if (ua.includes('CrOS')) return 'chromeos';
  return 'other';
}

// Daftar platform yang support install prompt
const SUPPORTED_PLATFORMS = ['windows', 'mac', 'linux', 'chromeos'];

// Modifikasi UI per platform
if (SUPPORTED_PLATFORMS.includes(detectPlatform())) {
  console.log('[Install] Desktop PWA install supported');
  installButton.textContent = `Install di ${detectPlatform() === 'mac' ? 'Mac' : 'Desktop'}`;
}
```

## Splash Screen

Splash screen di PWA otomatis dari kombinasi:

- **background_color** → background
- **icons** (192x192) → center icon
- **name** → title text

### Customisasi Splash Screen

```json
{
  "name": "Notes App",
  "background_color": "#007aff",
  "theme_color": "#007aff",
  "icons": [
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

**Hasil:** Splash screen biru dengan icon putih di tengah + tulisan "Notes App"

> **Catatan:** iOS pake meta tag khusus, bukan manifest:
> ```html
> <link rel="apple-touch-startup-image" href="/splash.png" media="(device-width: 375px)">
> ```
> Tapi cara paling gampang — pake **PWACompat** library biar otomatis.

### PWACompat (iOS support)

```html
<!-- PWACompat — polyfill buat iOS & browser lama -->
<script async src="https://cdn.jsdelivr.net/npm/pwacompat@2.0.17/pwacompat.min.js"
  integrity="sha256-eK8Cz0RhFlbPmJb0v4Wh8N9lsMLe13dZyYmqgUGOl58="
  crossorigin="anonymous"></script>
```

## App Shortcuts

Shortcuts muncul pas user **long-press / right-click** icon aplikasi.

```json
{
  "shortcuts": [
    {
      "name": "Tambah Catatan",
      "short_name": "Tambah",
      "description": "Buka halaman tambah catatan",
      "url": "/new-note",
      "icons": [{ "src": "/icons/shortcut-add.png", "sizes": "96x96" }]
    },
    {
      "name": "Cari Catatan",
      "short_name": "Cari",
      "url": "/search?q=",
      "icons": [{ "src": "/icons/shortcut-search.png", "sizes": "96x96" }]
    }
  ]
}
```

### Handle Shortcut di Halaman

```javascript
// Detect shortcut launch
const launchParams = new URLSearchParams(window.location.search);

if (launchParams.get('source') === 'shortcut') {
  console.log('[PWA] Launched from shortcut');
  focusAppropriateSection(launchParams.get('action'));
}

// Atau pake LaunchQueue API (Chrome)
if ('launchQueue' in window) {
  launchQueue.setConsumer(params => {
    console.log('[PWA] Launch consumer:', params);
    if (params.targetURL?.includes('/new-note')) {
      openNewNoteForm();
    }
  });
}
```

## PWA Audit dengan Lighthouse

### Cara Menggunakan Lighthouse

1. **Chrome DevTools** → Lighthouse tab → PWA category → Generate report
2. **CLI:** `npx lighthouse https://sitekamu.com --view`
3. **CI/CD:** `npx lighthouse https://sitekamu.com --output json --output-path ./reports/lighthouse.json`

### Checklist PWA Audit

#### Wajib (Score mempengaruhi)

| Kriteria | Requirement |
|----------|-------------|
| ✅ Register SW | SW terdaftar dengan `install` dan `fetch` event |
| ✅ Offline fallback | Halaman offline atau response 200 saat offline |
| ✅ Valid manifest | Manifest valid & terpasang |
| ✅ HTTPS | Semua resource via HTTPS (kecuali localhost) |
| ✅ Precache HTML | Halaman harus di-precache di SW |
| ✅ Icons ≥ 192px | Minimal icon 192x192 dan 512x512 di manifest |
| ✅ Maskable icon | Minimal satu icon dengan `purpose: maskable` |

#### Opsional (Bonus)

| Kriteria | Requirement |
|----------|-------------|
| ✅ Splash screen | `background_color` + icon di manifest |
| ✅ Theme color | `theme_color` di manifest & `<meta name="theme-color">` |
| ✅ Content width | Cocok dengan viewport (pakai `<meta name="viewport">`) |
| ✅ Apple touch icon | `<link rel="apple-touch-icon">` |
| ✅ Install prompt | `beforeinstallprompt` bisa di-trigger |
| ✅ Fast loading | First paint < 5 detik di 3G |
| ✅ Shortcuts | Minimal 1 shortcut di manifest |

### Lighthouse Scoring

```
PWA Score:
  ┌─────────────────────────────────────┐
  │ ✅ Installable          100/100     │
  │ ✅ PWA Optimized        100/100     │
  │ ───────────────────────────────── │
  │ Total                    100/100     │
  └─────────────────────────────────────┘
```

### Otomatis Audit dengan CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse PWA Audit
on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

      # Start server di background
      - run: npm run serve & sleep 3

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
          temporaryPublicStorage: true
          budgetPath: ./lighthouse-budget.json
```

```json
// lighthouse-budget.json
{
  "performance": 80,
  "accessibility": 90,
  "pwa": 100,
  "best-practices": 85
}
```

## Full Setup Flow

```bash
# 1. Buat manifest.json
# 2. Generate icons (pake PWABuilder atau sharp)
# 3. Link manifest di <head>
# 4. Daftarkan Service Worker
# 5. Test install prompt
# 6. Audit dengan Lighthouse
# 7. Fix semua issue
# 8. Deploy
```

### Verifikasi Manual

```javascript
// DevTools utility — cek manifest
(async function checkManifest() {
  // 1. Cek manifest link
  const links = document.querySelectorAll('link[rel="manifest"]');
  console.log('[Manifest] Link tags:', links.length);

  // 2. Fetch & display manifest content
  for (const link of links) {
    const response = await fetch(link.href);
    const manifest = await response.json();
    console.table({
      name: manifest.name,
      short_name: manifest.short_name,
      display: manifest.display,
      icons: manifest.icons?.length,
      theme_color: manifest.theme_color,
      start_url: manifest.start_url
    });
  }

  // 3. Check SW registration
  const registrations = await navigator.serviceWorker.getRegistrations();
  console.log('[SW] Registrations:', registrations.length);

  // 4. Check installability
  if ('onbeforeinstallprompt' in window) {
    console.log('[Install] beforeinstallprompt supported');
  }
})();
```

## Latihan

1. **Buat manifest.json lengkap** — Isi semua field wajib (name, short_name, start_url, display, icons, theme_color, background_color). Generate icon 192x192 dan 512x512 (pake PWABuilder atau sharp). Link manifest di HTML. Verifikasi di DevTools > Application > Manifest.

2. **Custom install button** — Tampilkan tombol "Install Aplikasi" yang muncul pas `beforeinstallprompt`. Log user choice (accepted/dismissed) ke console. Sembunyikan tombol kalo udah terinstall. Test dengan Lighthouse.

3. **Splash screen + App shortcuts** — Set `background_color` dan `theme_color` di manifest. Tambah 2 shortcuts: "Tambah Catatan" → `/new-note` dan "Cari" → `/search`. Pastikan splash screen muncul pas PWA di-launch dari home screen.

4. **Lighthouse audit & fix** — Jalankan Lighthouse PWA audit. Target score ≥ 90. Dokumentasikan:
   - Yang lolos ✅
   - Yang gagal ❌
   - Perbaikan yang dilakukan
   - Screenshot hasil audit
