# 🧠 Cheatsheet: Internationalization (i18n)

> Referensi cepet — 1 halaman. Modul 45: Multi-language React app — i18n concepts, react-i18next, RTL, production i18n.

## Topik Utama

| Sesi | Topik | Tools |
|------|-------|-------|
| 01 | i18n Concepts — locale, translation file, ICU message, pluralization, interpolation | — |
| 02 | React i18n — react-i18next, useTranslation, Trans, namespace, SSR | react-i18next, i18next |
| 03 | RTL & Backend — bidirectional layout, Accept-Language, DB multilingual | CSS Logical Properties |
| 04 | Production i18n — SaaS TMS, i18n linting, code splitting, SEO hreflang | i18next-scanner |

## Command / Sintaks Penting

```bash
npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend
npm install -D i18next-scanner
```

### i18n Concepts

**i18n vs l10n:**
| Istilah | Arti |
|---------|------|
| **i18n** (Internationalization) | Desain kode siap multi-bahasa — teknis |
| **l10n** (Localization) | Adaptasi konten ke bahasa spesifik — konten |

**Locale format (BCP 47):**
| Locale | Bahasa | Region | Direction |
|--------|--------|--------|-----------|
| `en-US` | English | United States | LTR |
| `id-ID` | Bahasa Indonesia | Indonesia | LTR |
| `ar-SA` | Arabic | Saudi Arabia | RTL |

### Locale Config (TypeScript)

```typescript
export const SUPPORTED_LOCALES = ['en', 'id', 'ar'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const localeConfig: Record<Locale, { label: string; dir: 'ltr' | 'rtl'; flag: string }> = {
  'en': { label: 'English', dir: 'ltr', flag: '🇺🇸' },
  'id': { label: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩' },
  'ar': { label: 'العربية', dir: 'rtl', flag: '🇸🇦' },
};
```

### Translation File Structure

```
public/locales/
├── en/
│   ├── common.json    # tombol, label, error umum
│   ├── home.json      # halaman home
│   └── auth.json      # login, register
├── id/
│   ├── common.json
│   ├── home.json
│   └── auth.json
└── ar/
    ├── common.json
    ├── home.json
    └── auth.json
```

**JSON format:**
```json
{
  "greeting": "Hello, {{name}}!",
  "items": "{{count}} item",
  "items_plural": "{{count}} items",
  "nav": {
    "home": "Home",
    "about": "About Us"
  }
}
```

### React i18next Setup

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: { escapeValue: false },  // React already escapes XSS
    defaultNS: 'common',
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'cookie', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

**Entry point (Vite):**
```typescript
// src/main.tsx — import SEBELUM komponen Root
import './i18n/config';
```

### useTranslation Hook

```typescript
import { useTranslation } from 'react-i18next';

function Welcome() {
  const { t, i18n } = useTranslation('common');  // namespace
  const dir = i18n.dir();  // 'ltr' | 'rtl'

  return (
    <div dir={dir}>
      <h1>{t('greeting', { name: 'Alice' })}</h1>
      <p>{t('items', { count: 5 })}</p>  {/* pluralization */}
    </div>
  );
}
```

### Language Switcher Component

```tsx
import { useTranslation } from 'react-i18next';
import { localeConfig, SUPPORTED_LOCALES } from '../i18n/config';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLang = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = localeConfig[lng as Locale]?.dir || 'ltr';
    document.documentElement.lang = lng;
  };

  return (
    <div className="lang-switcher">
      {SUPPORTED_LOCALES.map(lng => (
        <button key={lng} onClick={() => changeLang(lng)}
          className={i18n.language === lng ? 'active' : ''}>
          {localeConfig[lng].flag} {localeConfig[lng].label}
        </button>
      ))}
    </div>
  );
}
```

### RTL Support (CSS Logical Properties)

```css
/* ❌ Jangan pakai physical properties */
margin-left: 16px;
padding-right: 8px;
text-align: left;

/* ✅ Pakai logical properties — otomatis flip untuk RTL */
margin-inline-start: 16px;
padding-inline-end: 8px;
text-align: start;
border-inline-start: 3px solid blue;
```

**RTL Wrapper component:**
```tsx
function RTLWrapper({ children }) {
  const { i18n } = useTranslation();
  return <div dir={i18n.dir()}>{children}</div>;
}
```

### Pluralization & ICU Messages

```json
{
  "cart": "{{count}} item in cart",
  "cart_plural": "{{count}} items in cart",
  "notification": "You have {{count}} unread message",
  "notification_plural": "You have {{count}} unread messages"
}
```

```typescript
// Usage
t('cart', { count: 1 })   // "1 item in cart"
t('cart', { count: 5 })   // "5 items in cart"
```

### Backend i18n Middleware (Express)

```typescript
// middleware/i18n.ts
export function i18nMiddleware(req, res, next) {
  const acceptLang = req.headers['accept-language'];
  if (acceptLang) {
    const primary = acceptLang.split(',')[0].split(';')[0];  // "id-ID" → "id"
    req.locale = SUPPORTED_LOCALES.includes(primary) ? primary : DEFAULT_LOCALE;
  } else {
    req.locale = DEFAULT_LOCALE;
  }
  next();
}

// Usage
app.use(i18nMiddleware);
// Access: req.locale in routes
```

### Database Multilingual (JSONB)

```sql
-- PostgreSQL JSONB approach
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name JSONB NOT NULL,  -- {"en": "Coffee", "id": "Kopi", "ar": "قهوة"}
  description JSONB,
  price DECIMAL(10,2)
);

-- Query by locale
SELECT name->>'en' AS name_en, name->>'id' AS name_id
FROM products;

-- Filter by locale content
SELECT * FROM products WHERE name->>'id' LIKE '%kopi%';
```

### SEO hreflang Tags

```html
<link rel="alternate" hreflang="en" href="https://example.com/page" />
<link rel="alternate" hreflang="id" href="https://example.com/id/page" />
<link rel="alternate" hreflang="ar" href="https://example.com/ar/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

### Lazy Load Translations (Code Splitting)

```typescript
// i18next-http-backend handles lazy loading automatically
// loadPath: '/locales/{{lng}}/{{ns}}.json'
// Only fetches JSON when namespace is first used

// Manual preload if needed:
i18n.loadNamespaces(['common', 'home']).then(() => {
  // namespaces ready
});
```

## Tips & Trik

- **i18n sejak awal** — migrasi existing app jauh lebih mahal dari mulai dengan i18n
- **CSS Logical Properties** — `margin-inline-start` bukan `margin-left` — RTL otomatis
- **`escapeValue: false`** — React sudah handle XSS, gak perlu double escape
- **Namespace separation** — `common.json`, `home.json`, `auth.json` — lazy load per page
- **Language detection order**: querystring > localStorage > navigator > cookie
- **`x-default` hreflang** — pointing ke default locale untuk search engine
- **ICU MessageFormat** — standard untuk pluralization kompleks
- **JSONB** approach untuk DB multilingual — lebih fleksibel dari column-per-locale
- **`i18next-scanner`** — detect unused keys + missing translations
- **Translation workflow**: Developer → Translator → Review → Deploy

## Common Mistakes

- ❌ **Hardcoded strings di komponen** — `"Submit"` harus jadi `t('submit')`
- ❌ **Gak pakai CSS logical properties** — RTL layout pecah kalau pakai `margin-left/right`
- ❌ **Satu file JSON besar** — split per namespace, lazy load per page
- ❌ **Gak handle fallback** — `fallbackLng: 'en'` wajib ada
- ❌ **Import i18n config di tengah file** — harus paling atas, sebelum komponen
- ❌ **Gak ada `hreflang`** — search engine gak tau ada versi multi-bahasa
- ❌ **Ignore pluralization** — "1 items" = bug, pakai `_plural` key
- ❌ **Gak test RTL** — Arabic layout beda, padding/margin harus di-flip
- ❌ **Translation keys as code** — `t('some.deeply.nested.key')` → refactor ke namespace

## Link Cepat

- [Module README](.)
- [Sesi 01 — i18n Concepts](01-i18n-concepts.md)
- [Sesi 02 — React i18n](02-react-i18n.md)
- [Sesi 03 — RTL & Backend](03-rtl-backend.md)
- [Sesi 04 — Production i18n](04-production-i18n.md)
- [Quiz](quiz.md)
