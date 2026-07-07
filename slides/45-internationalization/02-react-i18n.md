---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🌍 Internasionalisasi (i18n) — Multi-Language React Applicati"
footer: "Sesi 02: React I18N"
---

<!-- _class: title -->
# Sesi 02: React i18n dengan react-i18next

**Durasi:** 5 Jam

## 🎯 Tujuan Pembelajaran

Setelah sesi ini mahasiswa mampu:

- Mengintegrasikan react-i18next ke aplikasi React
- Menggunakan `useTranslation` hook di komponen
- Merender HTML di translasi dengan `Trans` component
- Membuat language switcher interaktif
- Mengelola multiple namespaces (common, home, auth)
- Mengimplementasikan SSR dengan i18n (Next.js)

---

## 📖 Materi

### 1. Setup react-i18next

```bash
npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

**Konfigurasi i18n:**

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LOCALES = ['en', 'id', 'ar'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

i18n
  .use(Backend)                          // load JSON via HTTP
  .use(LanguageDetector)                 // auto-detect browser locale
  .use(initReactI18next)                 // bind ke React
  .init({
    fallbackLng: DEFAULT_LOCALE,
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,  // React already escapes XSS
    },

    // namespace default
    defaultNS: 'common',

    // backend config
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // language detector config
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'cookie', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

**Initialisasi di entry point:**

```typescript
// src/main.tsx — Vite
import './i18n/config';  // import i18n sebelum React

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**Catatan:** Import i18n config SEBELUM komponen Root — pastikan translation siap saat render pertama.

### 2. useTranslation Hook

```typescript
import { useTranslation } from 'react-i18next';

function Welcome() {
  const { t, i18n } = useTranslation('common');
  //               ^^  instance i18n — ganti bahasa, dll

  const currentLang = i18n.language;   // 'en' | 'id' | 'ar'
  const dir = i18n.dir();              // 'ltr' | 'rtl'

  return (
    <div>
      <h1>{t('greeting', { name: 'Alice' })}</h1>
      <p>{t('items', { count: 5 })}</p>
      <p>Direction: {dir}</p>
    </div>
  );
}
```

**Multiple namespaces:**

```typescript
const { t } = useTranslation(['common', 'home', 'auth']);

t('common:greeting');   // prefix namespace
t('home:title');
t('auth:login.btn');
```

**Default namespace tidak perlu prefix:**

```typescript
const { t } = useTranslation(['common', 'home']);
// common adalah defaultNS → t('greeting') cukup
// home harus explicit → t('home:title')
```

### 3. Trans Component — HTML di Translations

Gunakan `Trans` saat value translasi mengandung HTML atau React elements.

```json
{
  "readMore": "Read <link>more about i18n</link> on our blog.",
  "terms": "I agree to the <1>Terms of Service</1> and <2>Privacy Policy</2>."
}
```

```typescript
import { Trans } from 'react-i18next';

function BlogPost() {
  return (
    <p>
      <Trans i18nKey="readMore">
        Read <a href="/blog">more about i18n</a> on our blog.
      </Trans>
    </p>
  );
}
```

**Dengan components:**

```typescript
function TermsCheckbox() {
  return (
    <label>
      <Trans
        i18nKey="terms"
        components={[
          <a key="1" href="/terms" />,
          <a key="2" href="/privacy" />,
        ]}
      />
    </label>
  );
}
```

**Tag <1>, <2> di JSON** — urut sesuai array components.

### 4. Language Switcher

```typescript
// src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // optional: set html lang & dir
    document.documentElement.lang = lng;
    document.documentElement.dir = i18n.dir();
  };

  return (
    <div className="language-switcher">
      {languages.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => changeLanguage(code)}
          disabled={i18n.language === code}
          className={
            i18n.language === code ? 'active' : ''
          }
        >
          {flag} {label}
        </button>
      ))}
    </div>
  );
}
```

**CSS:**

```css
.language-switcher {
  display: flex;
  gap: 0.5rem;
}
.language-switcher button.active {
  font-weight: bold;
  border-bottom: 2px solid currentColor;
}
```

### 5. Namespace Strategy

| Namespace | Isi | Contoh Key |
|-----------|-----|------------|
| `common` | Global: nav, footer, error, button | `nav.home`, `error.general` |
| `home` | Halaman utama | `hero.title`, `features.list` |
| `auth` | Login, register, reset password | `login.btn`, `register.emailLabel` |
| `dashboard` | (jika ada) | `stats.title`, `chart.label` |

**Alasan namespace:** (1) Code splitting — load per page, (2) Translator dapat fokus per domain, (3) Conflict key berkurang.

### 6. SSR dengan i18n (Next.js App Router)

```typescript
// app/[locale]/layout.tsx — Next.js App Router
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

const locales = ['en', 'id', 'ar'];

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Static Generation:**

```typescript
// generateStaticParams
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

---

## 💻 Kode Praktik

### Setup Vite + react-i18next (langkah lengkap)

```bash
npm create vite@latest i18n-app -- --template react-ts
cd i18n-app
npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

### Struktur file setelah setup

```
src/
├── i18n/
│   └── config.ts
├── components/
│   ├── LanguageSwitcher.tsx
│   └── Greeting.tsx
├── App.tsx
└── main.tsx
public/
└── locales/
    ├── en/common.json
    ├── en/home.json
    ├── id/common.json
    ├── id/home.json
    ├── ar/common.json
    └── ar/home.json
```

### Contoh: `src/components/Greeting.tsx`

```typescript
import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

export function Greeting() {
  const { t } = useTranslation('common');
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>{t('greeting', { name: 'World' })}</h1>

      <p>{t('items', { count })}</p>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <button onClick={() => setCount((c) => Math.max(0, c - 1))}>-</button>

      <p>
        <Trans i18nKey="learnMore">
          Learn more at <a href="https://react.i18next.com">react.i18next.com</a>
        </Trans>
      </p>
    </div>
  );
}
```

---

## 🧠 AI Prompt Exercises

### Latihan 1: Setup i18n Config

**Prompt untuk AI:**

> "Bantu saya setup react-i18next di aplikasi React Vite TypeScript. Konfigurasi: fallback ke 'en', support en/id/ar, deteksi browser via localStorage, load path '/locales/{{lng}}/{{ns}}.json', namespace default 'common'. Tulis file i18n/config.ts lengkap."

**Kriteria:** Import urutan benar, debug mode hanya di development, escapeValue: false.

### Latihan 2: Komponen Form Multi-Bahasa

**Prompt untuk AI:**

> "Buat komponen React LoginForm dengan react-i18next. Input: email, password. Tombol: login. Semua label dan placeholder dari translasi namespace 'auth'. Tampilkan error validasi juga dari translasi. Gunakan useTranslation hook."

**Kriteria:** Label, placeholder, error message, tombol — semua dari JSON. Fallback jika key tidak ditemukan.

### Latihan 3: Trans Component untuk Rich Text

**Prompt untuk AI:**

> "Buat komponen Footer yang menggunakan Trans component. Di dalamnya ada link ke About, Privacy Policy, Terms of Service — semuanya dari string translasi. Gunakan component mapping dengan tag <1>, <2>, <3>."

**Kriteria:** Tiga link berbeda di satu kalimat translasi. Link terbuka di tab baru. Styling inline atau Tailwind.

### Latihan 4: Namespace Loading + Skeleton

**Prompt untuk AI:**

> "Saya punya namespace 'dashboard' yang besar — tidak mau di-load di awal. Buat pola lazy loading namespace: ketika komponen Dashboard mount, panggil i18n.loadNamespaces(['dashboard']). Tampilkan skeleton loading selama namespace belum siap."

**Kriteria:** Gunakan state, loading skeleton komponen terpisah, error boundary jika gagal load.

---

## 📝 Evaluasi

| Indikator | Deskripsi |
|-----------|-----------|
| Setup i18n | Backend, detector, React binding benar |
| useTranslation | Interpolation, pluralization, namespace berfungsi |
| Trans component | HTML/component di translasi render benar |
| Language switcher | Ganti bahasa tanpa reload, update html lang/dir |
| Lazy namespace | Code splitting per namespace, loading state |
