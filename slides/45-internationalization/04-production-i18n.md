---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🌍 Internasionalisasi (i18n) — Multi-Language React Applicati"
footer: "Sesi 04: Production I18N"
---

<!-- _class: title -->
# Sesi 04: Production i18n — Manajemen, Linting, SEO, Workflow

**Durasi:** 5 Jam

## 🎯 Tujuan Pembelajaran

Setelah sesi ini mahasiswa mampu:

- Memilih Translation Management System (TMS): lokal vs SaaS
- Menggunakan i18next-scanner untuk i18n linting
- Mengimplementasikan typesafe-i18n
- Melakukan lazy loading translations per locale (code splitting)
- Mengimplementasikan SEO hreflang tags
- Mendesain translation workflow (Dev → Translation → Review → Deploy)

---

## 📖 Materi

### 1. Translation Management System (TMS)

| Approach | Tool | Kelebihan | Kekurangan |
|----------|------|-----------|------------|
| **Local** | JSON files + git | Sederhana, version control, no cost | Manual sync, translator perlu akses repo |
| **SaaS** | Lokalise | UI terjemahan, auto-sync, peran (translator/reviewer) | Berbayar, dependency |
| **SaaS** | Crowdin | Community translation, integrasi Crowdin CLI | Resource untuk setup |
| **SaaS** | Phrase (ex PhraseApp) | Screenshot context, API lengkap | Pricing per seat |

**Rekomendasi untuk skala:**
- **Kecil (1-5 bahasa):** JSON + git + PR review workflow
- **Medium (5-15 bahasa):** Lokalise atau Crowdin
- **Enterprise (>15 bahasa):** Phrase + dedicated localization team

### 2. i18n Linting — i18next-scanner

```bash
npm install --save-dev i18next-scanner
```

**Config:**

```javascript
// i18next-scanner.config.js
module.exports = {
  input: ['src/**/*.{ts,tsx}', '!src/**/*.test.*'],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['t', 'i18n.t'],    // fungsi yang memanggil t()
      extensions: ['.ts', '.tsx'],
    },
    trans: {
      component: 'Trans',       // komponen Trans
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.tsx'],
    },
    lngs: ['en', 'id', 'ar'],
    ns: ['common', 'home', 'auth'],
    defaultLng: 'en',
    resource: {
      loadPath: 'public/locales/{{lng}}/{{ns}}.json',
      savePath: 'public/locales/{{lng}}/{{ns}}.json',
    },
  },
};
```

**Jalankan:**

```bash
npx i18next-scanner
```

**Apa yang dilakukan:**
- Scan semua file ts/tsx
- Ekstrak key yang dipanggil `t('...')`
- Generate file JSON dengan key baru
- **TIDAK menghapus** key yang tidak terpakai (manual cleanup)

**Tambahkan script di package.json:**

```json
{
  "scripts": {
    "i18n:scan": "i18next-scanner --config i18next-scanner.config.js",
    "i18n:missing": "i18next-scanner --config i18next-scanner.config.js --fail-on-update"
  }
}
```

### 3. Typesafe i18n — typecheck translation keys

```bash
npm install typesafe-i18next
```

**Type definition:**

```typescript
// src/i18n/i18n.d.ts
import 'i18next';
import type common from '../../public/locales/en/common.json';
import type home from '../../public/locales/en/home.json';
import type auth from '../../public/locales/en/auth.json';

// Merge semua resources
interface Resources {
  common: typeof common;
  home: typeof home;
  auth: typeof auth;
}

// Extend i18next types
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: Resources;
  }
}
```

**Efek:** TypeScript akan complain jika:
- Key tidak ada di JSON → `t('nonexistent')` → error TS
- Interpolation parameter salah → `t('greeting', { nam: 'x' })` → error TS (harus `name`)
- Count type mismatch

```typescript
// ✅ OK
t('greeting', { name: 'Alice' });

// ❌ TypeScript error — properti 'nam' tidak ada di parameter greeting
t('greeting', { nam: 'Alice' });

// ❌ TypeScript error — key 'nonexistent' tidak ada
t('nonexistent');
```

### 4. Lazy Loading Translations — Code Splitting

**Problem:** Bundle semua locale JSON di entry point → bundle besar.

**Solusi:** Dynamic import per locale + React.lazy

```typescript
// src/i18n/lazy-loader.ts
import i18n from 'i18next';

const localeLoaders: Record<string, () => Promise<Record<string, object>>> = {
  en: () => import('../locales/en'),
  id: () => import('../locales/id'),
  ar: () => import('../locales/ar'),
};

export async function loadLocale(locale: string, ns: string = 'common') {
  const loader = localeLoaders[locale];
  if (!loader) throw new Error(`Locale ${locale} not supported`);

  const resources = await loader();
  const module = resources[ns];

  if (module) {
    i18n.addResourceBundle(locale, ns, module, true, true);
  }
}
```

**Dengan React.lazy + Suspense:**

```typescript
// src/i18n/I18nProvider.tsx
import { Suspense, useEffect, useState } from 'react';
import i18n from './config';

export function I18nSuspense({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!ready) {
      i18n.on('initialized', () => setReady(true));
    }
  }, [ready]);

  if (!ready) {
    return <div className="spinner">Loading translations...</div>;
  }

  return <Suspense fallback={<div className="spinner" />}>{children}</Suspense>;
}
```

**Vite chunk splitting:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // separate locale files
          if (id.includes('/locales/')) {
            return 'locale-' + id.split('/locales/')[1].split('/')[0];
          }
        },
      },
    },
  },
});
```

### 5. SEO & hreflang Tags

**hreflang — memberitahu Google versi bahasa halaman:**

```html
<link rel="alternate" hreflang="en" href="https://example.com/en" />
<link rel="alternate" hreflang="id" href="https://example.com/id" />
<link rel="alternate" hreflang="ar" href="https://example.com/ar" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en" />
```

**React component:**

```typescript
// src/components/HreflangTags.tsx
import { Helmet } from 'react-helmet-async';

const locales = ['en', 'id', 'ar'];

interface Props {
  currentPath: string; // e.g. /blog/hello-world
  siteUrl: string;     // e.g. https://example.com
}

export function HreflangTags({ currentPath, siteUrl }: Props) {
  return (
    <Helmet>
      {locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hreflang={locale}
          href={`${siteUrl}/${locale}${currentPath}`}
        />
      ))}
      <link
        rel="alternate"
        hreflang="x-default"
        href={`${siteUrl}/en${currentPath}`}
      />
    </Helmet>
  );
}
```

**Next.js App Router — metadata:**

```typescript
// app/[locale]/layout.tsx
export async function generateMetadata({ params: { locale } }: Props) {
  return {
    alternates: {
      languages: {
        'en': '/en',
        'id': '/id',
        'ar': '/ar',
        'x-default': '/en',
      },
    },
  };
}
```

**SEO best practices i18n:**
- Gunakan subdirectory (`/en`, `/id`, `/ar`) — lebih disukai Google
- **Jangan** gunakan query param (`?lang=en`) — crawling buruk
- Satu canonical URL per locale
- Hindari duplikat konten — hreflang + canonical
- Sitemap terpisah per locale atau annotate satu sitemap

### 6. Translation Workflow

```
[Dev]                          [Translator]              [Reviewer]
  │                                │                        │
  ├─ Tulis kode dengan key baru    │                        │
  ├─ Jalankan i18next-scanner      │                        │
  ├─ Commit → PR                   │                        │
  │                                │                        │
  ├────────────────────────────────┤                        │
  │    CI: extract keys →          │                        │
  │    push ke TMS (Lokalise API)  │                        │
  │                                ├────────────────────────┤
  │                                │  Translator mengerjakan │
  │                                │  di UI TMS             │
  │                                ├────────────────────────┤
  │                                │                        ├── Review &
  │                                │                        │   approve
  │                                ├────────────────────────┤
  │    CI: pull dari TMS →         │                        │
  │    PR update translation       │                        │
  │                                │                        │
  ├─ QA: test di staging           │                        │
  ├─ Deploy                        │                        │
```

**Automation script:**

```bash
#!/bin/bash

---

# scripts/sync-translations.sh

---

# Pull latest translations from Lokalise

LOKALISE_TOKEN=${LOKALISE_TOKEN}
PROJECT_ID=${PROJECT_ID}

echo "Pulling translations from Lokalise..."
lokalise2 file download \
  --token $LOKALISE_TOKEN \
  --project-id $PROJECT_ID \
  --format json \
  --unzip-to ./public/locales/

echo "Checking for missing keys..."
npx i18next-scanner --config i18next-scanner.config.js

echo "Committing changes..."
git add public/locales/
git commit -m "chore(i18n): sync translations from Lokalise"
```

**CI/CD pipeline snippet (GitHub Actions):**

```yaml

---

# .github/workflows/i18n-sync.yml
name: i18n Sync
on:
  push:
    branches: [main]
    paths: ['src/**/*.ts', 'src/**/*.tsx']

jobs:
  extract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx i18next-scanner --config i18next-scanner.config.js
      - name: Push keys to Lokalise
        run: |
          lokalise2 file upload \
            --token ${{ secrets.LOKALISE_TOKEN }} \
            --project-id ${{ secrets.LOKALISE_PROJECT_ID }} \
            --file public/locales/en/common.json \
            --lang-iso en
```

---

## 💻 Kode Praktik

### Integration: Lazy Load + hreflang

```typescript
// App.tsx — full flow
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nSuspense } from './i18n/I18nProvider';
import { RTLWrapper } from './components/RTLWrapper';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { HreflangTags } from './components/HreflangTags';
import Home from './pages/Home';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <I18nSuspense>
          <RTLWrapper>
            <LanguageSwitcher />
            <HreflangTags
              currentPath="/"
              siteUrl="https://example.com"
            />
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </RTLWrapper>
        </I18nSuspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}
```

### Lokalise CLI Setup

```bash

---

# Install lokalise CLI
brew install lokalise/tap/lokalise2

---

# atau download dari https://github.com/lokalise/lokalise-cli-2-go


---

# Auth
export LOKALISE_TOKEN=your_api_token


---

# Download translations
lokalise2 file download \
  --project-id 123.abc \
  --format json \
  --unzip-to ./public/locales/


---

# Upload new keys
lokalise2 file upload \
  --file public/locales/en/common.json \
  --lang-iso en
```

---

## 🧠 AI Prompt Exercises

### Latihan 1: i18next-scanner Setup

**Prompt untuk AI:**

> "Bantu saya setup i18next-scanner untuk React TypeScript project. Ekstrak key dari fungsi t() dan komponen Trans. Namespace: common, home, auth, dashboard. Locale: en, id, ar. Output langsung ke public/locales/. Juga buat GitHub Actions workflow untuk auto-scan di setiap PR."

**Kriteria:** Exclude test files, fail on update mode di CI, report missing keys sebagai PR comment.

### Latihan 2: Typesafe Translation

**Prompt untuk AI:**

> "Saya punya file translasi common.json dengan struktur: greeting ({{name}}), items ({{count}} plural), and nav (objek dengan home, about). Buat type declaration i18n.d.ts untuk membuat i18next type-safe. Sertakan contoh error TypeScript jika key salah atau parameter salah."

**Kriteria:** Resource interface auto-generate dari JSON (atau manual), defaultNS common, interpolasi strict.

### Latihan 3: Lazy Loading + Bundle Analyzer

**Prompt untuk AI:**

> "Implementasi lazy loading translations dengan code splitting di Vite. Gunakan dynamic import tiap locale. Validasi bundle size dengan vite-bundle-analyzer. Target: masing-masing locale chunk < 5 KB gzipped. Sertakan visual report sebelum/ sesudah implementasi."

**Kriteria:** Routes untuk en/id/ar, loading skeleton, manualChunks di vite.config.ts, analisis size.

### Latihan 4: Translation Workflow Automation

**Prompt untuk AI:**

> "Desain translation workflow lengkap untuk tim 2 developer + 1 translator + 1 reviewer. Tools: GitHub, Lokalise, i18next-scanner. Buat: (1) git branch strategy, (2) Lokalise project structure, (3) GitHub Actions workflow untuk auto sync, (4) PR template untuk translation update."

**Kriteria:** Branch protection, auto-assign ke translator, review approval required, deploy hanya setelah review.

---

## 📝 Evaluasi

| Indikator | Deskripsi |
|-----------|-----------|
| i18next-scanner | Scan, extract, generate JSON otomatis |
| Type safety | TypeScript compile error untuk key invalid |
| Code splitting | Lazy loading per locale, bundle terpisah |
| SEO hreflang | Link alternate semua locale + x-default |
| Workflow | CI/CD pipeline, TMS sync, PR review |
| Bundle size | Masing-masing locale chunk termonitor |
