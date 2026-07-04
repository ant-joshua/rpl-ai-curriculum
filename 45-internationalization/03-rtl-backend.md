# Sesi 03: RTL Layout & Backend i18n

**Durasi:** 5 Jam

## 🎯 Tujuan Pembelajaran

Setelah sesi ini mahasiswa mampu:

- Mengimplementasikan RTL layout dengan `dir="rtl"`
- Menggunakan CSS logical properties untuk bidirectional styling
- Menangani pertimbangan tipografi Arab/Hebrew
- Membangun API translation dengan header `Accept-Language`
- Membuat i18n middleware Express
- Mendesain database schema untuk konten multilingual

---

## 📖 Materi

### 1. RTL Layout — `dir="rtl"`

HTML global attribute `dir`:

```html
<html lang="ar" dir="rtl">
```

**Efek:**
- Teks rata kanan secara default
- Arah kolom tabel terbalik
- Scrollbar di kiri (browser-dependent)
- Urutan kolom flex/grid berdasarkan direction

**React effect:**

```typescript
// Trigger saat ganti bahasa
const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir();
};
```

**Auto-direction via CSS logical properties:**

| Physical | Logical | Efek |
|----------|---------|------|
| `left` | `inline-start` | Kiri di LTR, kanan di RTL |
| `right` | `inline-end` | Kanan di LTR, kiri di RTL |
| `margin-left` | `margin-inline-start` | Margin arah awal |
| `padding-right` | `padding-inline-end` | Padding arah akhir |
| `border-left` | `border-inline-start` | Border sisi awal |
| `text-align: left` | `text-align: start` | Rata awal paragraf |
| `text-align: right` | `text-align: end` | Rata akhir paragraf |

**Contoh: dari physical → logical**

```css
/* ❌ Physical — rusak di RTL */
.card {
  margin-left: 1rem;
  padding-right: 0.5rem;
  text-align: left;
  border-left: 3px solid blue;
}

/* ✅ Logical — works both directions */
.card {
  margin-inline-start: 1rem;
  padding-inline-end: 0.5rem;
  text-align: start;
  border-inline-start: 3px solid blue;
}
```

**Flex/Grid auto-adjust:**

```css
.nav {
  display: flex;
  gap: 1rem;
  /* Urutan item otomatis terbalik di RTL */
  /* tidak perlu mengubah apapun */
}

/* Kecuali urutan visual harus tetap */
.nav .logo {
  order: 1;  /* force order regardless of dir */
}
```

### 2. Bidirectional Styling — Gambar & Icon

**Mirror icon untuk RTL:**

```css
/* Icon yang punya arah (arrow, chevron) */
.icon-arrow {
  /* default: pointer left */
}

[dir="rtl"] .icon-arrow {
  transform: scaleX(-1);  /* mirror horizontal */
}
```

**Background positioning:**

```css
.hero {
  background: url('/bg.jpg') no-repeat;
  background-position: left center;
}

[dir="rtl"] .hero {
  background-position: right center;
}
```

**CSS custom property approach (cleaner):**

```css
:root {
  --bg-pos: left center;
}

[dir="rtl"] {
  --bg-pos: right center;
}

.hero {
  background-position: var(--bg-pos);
}
```

### 3. Arabic/Hebrew Typography

**Font considerations untuk Arabic:**

```css
/* Font Arabic umum */
[lang="ar"] {
  font-family: 'Noto Naskh Arabic', 'Amiri', 'Traditional Arabic', serif;
  line-height: 1.8;  /* Arabic butuh line-height lebih besar */
  font-size: 1.05em; /* Arabic biasanya lebih kecil secara visual */
}

/* Fallback sans-serif untuk UI */
[lang="ar"] .ui-text {
  font-family: 'Noto Sans Arabic', 'Cairo', sans-serif;
}
```

**Perbedaan tipografi:**

| Aspek | Latin | Arabic |
|-------|-------|--------|
| Writing direction | LTR | RTL |
| Cursive | Tidak | Ya (connected) |
| Letter case | Upper/lower | No case |
| Numerals | 0-9 (Western) | ٠-٩ (Arabic-Indic) |
| Font size | Normal | Slightly larger needed |
| Line height | 1.5 | 1.6-1.8 |
| Font weight | Medium (400) | Regular (400) works fine |

**Arabic numerals formatting:**

```typescript
// Intl.NumberFormat untuk Arabic
const price = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
}).format(1000);
// → "ر.س. ١٬٠٠٠٫٠٠" (Arabic-Indic digits)
```

### 4. API Translation — Accept-Language Header

**Client request:**

```typescript
// fetch API dengan Accept-Language
const response = await fetch('/api/posts', {
  headers: {
    'Accept-Language': i18n.language,  // 'id' atau 'en'
  },
});
```

**Express middleware:**

```typescript
// src/backend/middleware/i18n.ts
import { Request, Response, NextFunction } from 'express';

const SUPPORTED_LOCALES = ['en', 'id', 'ar'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'en';

// Parse Accept-Language: "id-ID,id;q=0.9,en;q=0.8"
function parseAcceptLanguage(header: string): Locale[] {
  return header
    .split(',')
    .map((entry) => {
      const [lang, qPart] = entry.split(';');
      const q = qPart ? parseFloat(qPart.split('=')[1]) : 1.0;
      return { lang: lang.trim().split('-')[0], q }; // ambil base language
    })
    .sort((a, b) => b.q - a.q)        // sort by quality
    .map(({ lang }) => lang)
    .filter((l): l is Locale =>
      SUPPORTED_LOCALES.includes(l as Locale)
    );
}

export function i18nMiddleware(req: Request, _res: Response, next: NextFunction) {
  const acceptHeader = req.headers['accept-language'] || '';
  const locales = parseAcceptLanguage(acceptHeader);

  req.locale = locales[0] ?? DEFAULT_LOCALE;
  next();
}
```

**Extend Express Request type:**

```typescript
// src/types/express.d.ts
declare namespace Express {
  interface Request {
    locale: 'en' | 'id' | 'ar';
  }
}
```

**Route handler:**

```typescript
router.get('/posts', async (req, res) => {
  const locale = req.locale;
  const posts = await Post.find().populate('translations');

  // ambil translasi sesuai locale
  const result = posts.map((post) => ({
    id: post._id,
    title: post.translations[locale]?.title ?? post.translations['en']?.title,
    body: post.translations[locale]?.body ?? post.translations['en']?.body,
  }));

  res.json(result);
});
```

### 5. Database Schema untuk Multilingual Content

**PostgreSQL — JSONB field:**

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  translations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- contoh data
INSERT INTO posts (slug, translations) VALUES (
  'hello-world',
  '{
    "en": {"title": "Hello World", "body": "This is English content."},
    "id": {"title": "Halo Dunia", "body": "Ini konten Bahasa Indonesia."},
    "ar": {"title": "مرحبا بالعالم", "body": "هذا المحتوى بالعربية."}
  }'
);
```

**Query by locale:**

```sql
SELECT
  slug,
  translations->'en'->>'title' AS title_en,
  translations->'id'->>'title' AS title_id,
  translations->'ar'->>'title' AS title_ar
FROM posts;
```

**Index untuk JSONB access:**

```sql
CREATE INDEX idx_posts_translations ON posts USING GIN (translations);
```

**Alternatif: Separate translation table (normalized)**

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL CHECK (locale IN ('en', 'id', 'ar')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  UNIQUE(post_id, locale)
);
```

**Kapan pakai JSONB vs separate table:**

| JSONB | Separate Table |
|-------|----------------|
| Sederhana, 1 tabel | Query per locale lebih cepat (index) |
| Update bulk translation | Translator bisa edit per bahasa |
| Schema flexible | Foreign key integrity |
| Cocok: < 5 bahasa, rare update | Cocok: banyak bahasa, frequent partial update |

**Mongoose (MongoDB) schema:**

```typescript
const postSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  translations: {
    type: Map,
    of: {
      title: { type: String, required: true },
      body: { type: String, required: true },
    },
    default: {},
  },
}, { timestamps: true });

// method helper
postSchema.methods.translate = function (locale: string) {
  return this.translations.get(locale) ?? this.translations.get('en');
};
```

---

## 💻 Kode Praktik

### RTLWrapper Component

```typescript
// src/components/RTLWrapper.tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function RTLWrapper({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.dir();
    const lang = i18n.language;

    document.documentElement.dir = dir;
    document.documentElement.lang = lang;

    // update CSS custom property untuk bg position dll
    document.documentElement.style.setProperty(
      '--dir-start',
      dir === 'rtl' ? 'right' : 'left'
    );
    document.documentElement.style.setProperty(
      '--dir-end',
      dir === 'rtl' ? 'left' : 'right'
    );
  }, [i18n.language]);

  return <>{children}</>;
}
```

### Express Server Lengkap

```bash
npm install express cors
```

```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import { i18nMiddleware } from './middleware/i18n';

const app = express();
app.use(cors());
app.use(express.json());
app.use(i18nMiddleware);

app.get('/api/greeting', (req, res) => {
  const locale = req.locale;
  const greetings: Record<string, string> = {
    en: 'Hello!',
    id: 'Halo!',
    ar: 'مرحبا!',
  };
  res.json({
    message: greetings[locale] ?? greetings['en'],
    locale,
  });
});

app.listen(3001, () => console.log('Server on :3001'));
```

---

## 🧠 AI Prompt Exercises

### Latihan 1: CSS Logical Properties

**Prompt untuk AI:**

> "Saya punya komponen Card React dengan avatar (kiri), judul, deskripsi, dan action button (kanan). Refactor CSS dari physical (left/right) ke logical properties (inline-start/inline-end). Sertakan layout flex dengan gap. Test: harus sama baik di LTR maupun RTL. Berikan CSS asli dan versi logical."

**Kriteria:** Semua `left`/`right` hilang, ganti `start`/`end`. border, margin, padding, text-align semua logical.

### Latihan 2: Express i18n Middleware + Testing

**Prompt untuk AI:**

> "Tulis Express middleware i18n yang: (1) parse Accept-Language header, (2) set req.locale, (3) set response header Content-Language. Juga buat route GET /api/articles yang return data multilingual dari JSONB PostgreSQL. Sertakan test manual dengan curl."

**Kriteria:** Handle q value fallback, Content-Language header, error jika locale tidak supported.

### Latihan 3: Database Translasi Normalized

**Prompt untuk AI:**

> "Bantu saya desain schema PostgreSQL untuk blog multilingual dengan separate translation table. Buat: posts, categories, post_translations, category_translations. Juga buat query untuk mendapatkan semua post dengan title di locale tertentu beserta category name-nya."

**Kriteria:** Foreign key, unique constraint per locale, index pada locale, query efisien.

### Latihan 4: RTL Image Mirroring

**Prompt untuk AI:**

> "Buat komponen React RTLImage yang otomatis mirror image secara horizontal di RTL mode. Gunakan CSS transform: scaleX(-1). Tapi hanya untuk image yang punya arah (panah, gesture, directional icon). Kasih prop `directional={true}` untuk kontrol. Sertakan contoh: arrow-left.svg, hand-pointing.svg."

**Kriteria:** Conditional mirror, animasi smooth untuk transisi RTL↔LTR, type safety.

---

## 📝 Evaluasi

| Indikator | Deskripsi |
|-----------|-----------|
| RTL layout | html dir berubah, layout adjust otomatis |
| CSS logical | No hardcoded left/right, pakai start/end |
| Accept-Language | Parse, fallback, Content-Language header |
| DB schema | JSONB atau separate table, query per locale |
| Arabic typography | Font, line-height, numeral handling |
