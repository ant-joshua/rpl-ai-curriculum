# Internationalization (i18n) — Latihan

## Level 1: Dasar

### 1. Translation JSON — Structure
**Pertanyaan:** Buat struktur translation JSON untuk aplikasi e-commerce:

```json
// === LENGKAPI: translations/id.json (Bahasa Indonesia) ===
{
  // === LENGKAPI ===
  // Buat minimal 20 key untuk section berikut:
  // 1. Navigation (home, products, cart, profile, orders, logout)
  // 2. Product listing (search placeholder, filter, sort, results count)
  // 3. Product detail (add to cart, price, stock, description)
  // 4. Cart (item count, subtotal, checkout, empty cart)
  // 5. Checkout (shipping, payment, confirm, success message)
  // 6. Common (loading, error, save, cancel, delete, confirm)
}

// === LENGKAPI: translations/en.json (English) ===
{
  // === LENGKAPI ===
  // Terjemahkan semua key dari id.json
}

// === LENGKAPI: translations/ja.json (Japanese) ===
{
  // === LENGKAPI ===
  // Terjemahkan semua key dari id.json
}
```

Rules:
- Gunakan nested structure untuk grouping
- Pluralization keys harus benar
- Interpolation menggunakan `{{variable}}` format
- Fallback language: English

**Hint:** Nested structure: `{ "nav": { "home": "Beranda", "products": "Produk" }, "cart": { "itemCount": "{{count}} item di keranjang" } }`. Pluralization: `{ "cart": { "itemCount_one": "{{count}} item", "itemCount_other": "{{count}} item" } }`. **PENTING**: jangan hardcode strings di code, selalu gunakan translation keys.

---

### 2. react-i18next — Basic Setup
**Pertanyaan:** Setup react-i18next di project React:

```typescript
// === LENGKAPI: i18n configuration ===
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// === LENGKAPI: Init i18n ===
i18n
  .use(Backend)        // Load translation files
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // React integration
  .init({
    // === LENGKAPI ===
    // 1. fallbackLng: 'id'
    // 2. debug: NODE_ENV === 'development'
    // 3. interpolation: { escapeValue: false }
    // 4. backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' }
    // 5. detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] }
    // 6. ns: ['common', 'products', 'cart', 'checkout']
    // 7. defaultNS: 'common'
  });

export default i18n;

// === LENGKAPI: Translation hook ===
import { useTranslation } from 'react-i18next';

function ProductCard({ product }: { product: Product }) {
  const { t, i18n } = useTranslation('products');
  
  return (
    <div>
      {/* === LENGKAPI: Gunakan t() untuk translations === */}
      {/* 1. Simple translation: t('addToCart') */}
      {/* 2. With interpolation: t('price', { amount: product.price }) */}
      {/* 3. Pluralization: t('itemCount', { count: product.stock }) */}
    </div>
  );
}

// === LENGKAPI: Language switcher component ===
function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];
  
  return (
    // === LENGKAPI ===
    // Dropdown untuk switch bahasa
    // Highlight bahasa aktif
    // Save pilihan ke localStorage
  );
}
```

**Hint:** `useTranslation(namespace)` return `{ t, i18n, ready }`. Interpolation: `t('greeting', { name: 'Budi' })` dengan key `"greeting": "Halo, {{name}}!"`. Pluralization: `t('items', { count: 5 })` dengan keys `items_one` dan `items_other`. LanguageDetector otomatis detect dari browser `navigator.language` dan localStorage.

---

### 3. Pluralization & Interpolation
**Pertanyaan:** Implementasi pluralization dan interpolation yang kompleks:

```json
// === LENGKAPI: Complex translations ===
{
  "cart": {
    // === LENGKAPI: Pluralization ===
    "itemCount_zero": "{{count}} item di keranjang",
    "itemCount_one": "{{count}} item di keranjang",
    "itemCount_other": "{{count}} item di keranjang",
    
    // === LENGKAPI: Interpolation dengan formatting ===
    "subtotal": "Subtotal: Rp {{amount, number}}",
    "discount": "Diskon: -Rp {{amount, number}}",
    
    // === LENGKAPI: Nested interpolation ===
    "checkoutMessage": "{{userName}}, keranjangmu berisi {{itemCount}} item dengan total Rp {{total}}. Lanjut ke pembayaran?"
  },
  
  "order": {
    // === LENGKAPI: Conditional translations ===
    "status": {
      "pending": "Menunggu Pembayaran",
      "paid": "Dibayar",
      "processing": "Diproses",
      "shipped": "Dikirim",
      "delivered": "Diterima",
      "cancelled": "Dibatalkan"
    },
    
    // === LENGKAPI: Date formatting ===
    "orderDate": "Tanggal Pesanan: {{date, datetime}}",
    "estimatedDelivery": "Estimasi Tiba: {{date, datetime}}"
  }
}
```

```typescript
// === LENGKAPI: Usage ===
function CartSummary({ cart }: { cart: Cart }) {
  const { t } = useTranslation('cart');
  
  return (
    <div>
      {/* === LENGKAPI === */}
      {/* 1. t('itemCount', { count: cart.items.length }) */}
      {/* 2. t('subtotal', { amount: cart.subtotal }) */}
      {/* 3. t('checkoutMessage', { userName: cart.user.name, itemCount: cart.items.length, total: cart.total }) */}
    </div>
  );
}

// === LENGKAPI: Number formatting ===
// Format angka sesuai locale:
// id: 1.500.000 (titik sebagai thousand separator)
// en: 1,500,000 (koma sebagai thousand separator)
// ja: 1,500,000 (koma sebagai thousand separator)

// === LENGKAPI: Date formatting ===
// Format tanggal sesuai locale:
// id: 15 Januari 2024
// en: January 15, 2024
// ja: 2024年1月15日
```

**Hint:** Pluralization keys: `{name}_zero`, `{name}_one`, `{name}_other`. Number formatting: gunakan `Intl.NumberFormat('id', { style: 'currency', currency: 'IDR' })`. Date formatting: gunakan `Intl.DateTimeFormat('id', { dateStyle: 'full' })`. Interpolation bisa nested: `{{userName}}`, `{{amount, number}}`, `{{date, datetime}}`.

---

### 4. RTL Layout Support
**Pertanyaan:** Implementasi RTL (Right-to-Left) layout support:

```css
/* === LENGKAPI: RTL CSS === */
/* 1. Gunakan logical CSS properties (start/end bukan left/right) */

/* ❌ SEBELUM: hardcode direction */
.nav-item { margin-left: 16px; }
.card { text-align: left; }
.sidebar { float: left; }

/* === LENGKAPI: AFTER: logical properties === */
/* Gunakan: margin-inline-start, margin-inline-end, text-align: start, float: inline-start */
.nav-item { /* === LENGKAPI === */ }
.card { /* === LENGKAPI === */ }
.sidebar { /* === LENGKAPI === */ }

/* === LENGKAPI: RTL-specific overrides === */
[dir="rtl"] {
  /* === LENGKAPI === */
  /* Override untuk elemen yang tidak bisa pakai logical properties */
}
```

```typescript
// === LENGKAPI: RTL component ===
function RTLWrapper({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'he';
  
  return (
    // === LENGKAPI ===
    // Set dir="rtl" atau dir="ltr" berdasarkan language
    // Set lang attribute
    // Apply RTL-specific classes
  );
}

// === LENGKAPI: RTL-aware icon component ===
function IconArrow({ direction }: { direction: 'left' | 'right' }) {
  // === LENGKAPI ===
  // Auto-flip arrow icons untuk RTL:
  // 'left' -> RTL jadi 'right'
  // 'right' -> RTL jadi 'left'
  // Gunakan CSS transform: scaleX(-1) atau SVG flip
}
```

**Hint:** Logical properties: `margin-inline-start` (bukan `margin-left`), `padding-inline-end` (bukan `padding-right`), `text-align: start` (bukan `left`). `dir="rtl"` di root element. CSS: `[dir="rtl"] .sidebar { float: right; }`. Icons: `transform: scaleX(-1)` untuk flip horizontal. Flexbox/Grid: otomatis handle RTL dengan logical properties. **PENTING**: test dengan Arabic atau Hebrew content untuk pastikan RTL bekerja.

---

## Level 2: Menengah

### 5. Locale Detection & Persistence
**Pertanyaan:** Implementasi deteksi bahasa otomatis:

```typescript
// === LENGKAPI: Locale detection strategy ===
interface LocaleConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  cookieName: string;
  localStorageKey: string;
}

const config: LocaleConfig = {
  defaultLocale: 'id',
  supportedLocales: ['id', 'en', 'ja', 'ar'],
  fallbackLocale: 'en',
  cookieName: 'NEXT_LOCALE',
  localStorageKey: 'preferred-locale'
};

// === LENGKAPI: Detection priority ===
// 1. URL path: /en/products (highest priority)
// 2. Cookie: NEXT_LOCALE=en
// 3. localStorage: preferred-locale
// 4. Accept-Language header: en-US,en;q=0.9
// 5. Default locale (lowest priority)

function detectLocale(req?: Request): string {
  // === LENGKAPI ===
  // 1. Check URL path
  // 2. Check cookie
  // 3. Check Accept-Language header
  // 4. Return detected locale atau default
}

// === LENGKAPI: Locale persistence ===
function saveLocale(locale: string) {
  // === LENGKAPI ===
  // 1. Save ke localStorage
  // 2. Set cookie (server-side)
  // 3. Update i18n instance
}

// === LENGKAPI: Next.js middleware untuk locale ===
// middleware.ts
export function middleware(request: NextRequest) {
  // === LENGKAPI ===
  // 1. Check if URL sudah punya locale prefix
  // 2. Jika belum, detect locale dan redirect
  // 3. Handle: /products -> /id/products atau /en/products
  // 4. Skip locale prefix untuk static files dan API routes
}

// === LENGKAPI: Next.js i18n config ===
// next.config.js
module.exports = {
  // === LENGKAPI ===
  // i18n: {
  //   locales: ['id', 'en', 'ja', 'ar'],
  //   defaultLocale: 'id',
  //   localeDetection: false // handle manual
  // }
};
```

**Hint:** Detection priority: URL > Cookie > localStorage > Browser > Default. Next.js middleware: `export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] }`. Cookie: `response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 365 * 24 * 60 * 60 })`. **PENTING**: jangan redirect loops! Cek apakah URL sudah punya locale prefix sebelum redirect.

---

### 6. Translation Management
**Pertanyaan:** Setup translation management workflow:

```typescript
// === LENGKAPI: Translation validation ===
// Script untuk validate translation files

interface TranslationFile {
  [key: string]: string | TranslationFile;
}

function validateTranslations(
  base: TranslationFile,    // English (reference)
  target: TranslationFile,  // Bahasa target
  targetLang: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingKeys: string[] = [];
  const extraKeys: string[] = [];
  
  // === LENGKAPI ===
  // 1. Check missing keys (ada di base, tidak ada di target)
  // 2. Check extra keys (ada di target, tidak ada di base)
  // 3. Check interpolation variables match
  // 4. Check length limits (misal: judul max 50 chars)
  // 5. Return validation result
}

// === LENGKAPI: Auto-generate translation file ===
async function generateTranslation(
  baseLang: string,
  targetLang: string,
  baseTranslations: TranslationFile
): Promise<TranslationFile> {
  // === LENGKAPI ===
  // 1. Baca base translations
  // 2. Translate setiap string menggunakan AI/translation API
  // 3. Validate hasil
  // 4. Return translated file
}

// === LENGKAPI: Sync check ===
function checkSync(
  idTranslations: TranslationFile,
  enTranslations: TranslationFile,
  jaTranslations: TranslationFile
): SyncReport {
  // === LENGKAPI ===
  // Compare semua files, find:
  // - Keys yang ada di id tapi tidak di en
  // - Keys yang ada di en tapi tidak di id
  // - Interpolation yang berbeda
  // - Return detailed report
}
```

**Hint:** Validation: recursive traverse JSON, compare keys. Interpolation: regex `/{{(\w+)}}/g` untuk extract variables, compare antar bahasa. Length limits: character count untuk labels. Auto-translate: gunakan Google Translate API atau AI API (OpenAI). **PENTING**: jangan auto-translate tanpa human review — machine translation sering kurang natural.

---

### 7. Date & Number Formatting
**Pertanyaan:** Implementasi locale-aware formatting:

```typescript
// === LENGKAPI: Date formatter ===
function formatDate(
  date: Date,
  locale: string,
  style: 'full' | 'long' | 'medium' | 'short' = 'medium'
): string {
  // === LENGKAPI ===
  // Gunakan Intl.DateTimeFormat
  // id: "15 Januari 2024"
  // en: "January 15, 2024"  
  // ja: "2024年1月15日"
  // ar: "١٥ يناير ٢٠٢٤"
}

// === LENGKAPI: Time formatter ===
function formatTime(
  date: Date,
  locale: string,
  use24Hour: boolean = false
): string {
  // === LENGKAPI ===
  // id: "14.30" atau "2:30 PM"
  // en: "2:30 PM" atau "14:30"
  // ja: "14:30"
}

// === LENGKAPI: Currency formatter ===
function formatCurrency(
  amount: number,
  currency: string,
  locale: string
): string {
  // === LENGKAPI ===
  // Gunakan Intl.NumberFormat
  // id + IDR: "Rp 1.500.000"
  // en + USD: "$1,500.00"
  // ja + JPY: "¥150,000"
}

// === LENGKAPI: Relative time formatter ===
function formatRelativeTime(
  date: Date,
  locale: string
): string {
  // === LENGKAPI ===
  // 5 detik lalu / 5 seconds ago
  // 3 menit lalu / 3 minutes ago
  // 2 jam lalu / 2 hours ago
  // kemarin / yesterday
  // 3 hari lalu / 3 days ago
  // Gunakan Intl.RelativeTimeFormat
}

// === LENGKAPI: Plural rules ===
function formatItemCount(
  count: number,
  locale: string
): string {
  // === LENGKAPI ===
  // id: "0 item", "1 item", "5 item" (sama semua)
  // en: "0 items", "1 item", "5 items"
  // ar: "٠ عنصر", "عنصر واحد", "٥ عناصر" (complex plural)
  // Gunakan Intl.PluralRules
}
```

**Hint:** `Intl.DateTimeFormat('id', { dateStyle: style })` — otomatis handle format sesuai locale. `Intl.NumberFormat('id', { style: 'currency', currency: 'IDR' })` — otomatis format currency. `Intl.RelativeTimeFormat('id', { numeric: 'auto' })` — `rtf.format(-1, 'day')` = "kemarin". `Intl.PluralRules('id')` — `rules.select(0)` = "other", `rules.select(1)` = "other" (bahasa Indonesia tidak punya plural khusus).

---

## Level 3: Lanjutan

### 8. Server-Side i18n
**Pertanyaan:** Implementasi i18n untuk server-side rendering:

```typescript
// === LENGKAPI: Server-side i18n ===
// Next.js App Router dengan server components

// === LENGKAPI: Server-side translation loader ===
async function getServerTranslations(locale: string, namespace: string) {
  // === LENGKAPI ===
  // 1. Load translation file dari filesystem
  // 2. Cache di Redis (TTL: 1 jam)
  // 3. Return translation object
  // 4. Handle missing translations (fallback ke English)
}

// === LENGKAPI: Server component usage ===
async function ProductPage({ params }: { params: { id: string; locale: string } }) {
  const { locale } = params;
  const t = await getServerTranslations(locale, 'products');
  
  return (
    // === LENGKAPI ===
    // Gunakan server translations di JSX
    // ProductPage server component dengan translations
  );
}

// === LENGKAPI: API route dengan i18n ===
// app/api/products/route.ts
export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const t = await getServerTranslations(locale, 'products');
  
  // === LENGKAPI ===
  // Return error messages yang sudah di-translate
  // Contoh: { error: t('errors.productNotFound') }
}

// === LENGKAPI: Database content i18n ===
// Schema untuk multi-language content
interface LocalizedProduct {
  id: string;
  // Per-language fields
  name_id: string;
  name_en: string;
  name_ja: string;
  description_id: string;
  description_en: string;
  description_ja: string;
  // Non-localized fields
  price: number;
  category: string;
}

// === LENGKAPI: Query helper ===
async function getLocalizedProduct(id: string, locale: string) {
  // === LENGKAPI ===
  // Query hanya kolom yang sesuai dengan locale
  // Fallback ke default locale jika kolom kosong
}
```

**Hint:** Server-side: load translations saat build time atau request time. Cache: gunakan Redis untuk避免 repeatedly read files. Fallback: `translations[locale][key] || translations['en'][key] || key`. Database: gunakan `_locale` suffix untuk localized fields (PostgreSQL: bisa juga pakai JSONB column `name: { id: "...", en: "...", ja: "..." }`). **PENTING**: server components bisa langsung `await`, client components perlu `useTranslation()` hook.

---

### 9. SEO for Multi-Language
**Pertanyaan:** Implementasi SEO untuk multi-language site:

```typescript
// === LENGKAPI: hreflang tags ===
// SEO: beritahu Google ada versi bahasa berbeda

function generateHreflangTags(currentPath: string, locales: string[]): string {
  // === LENGKAPI ===
  // Generate HTML tags:
  // <link rel="alternate" hreflang="id" href="https://example.com/id/products" />
  // <link rel="alternate" hreflang="en" href="https://example.com/en/products" />
  // <link rel="alternate" hreflang="ja" href="https://example.com/ja/products" />
  // <link rel="alternate" hreflang="x-default" href="https://example.com/en/products" />
}

// === LENGKAPI: Multi-language sitemap ===
function generateSitemap(baseUrls: string[], locales: string[]): string {
  // === LENGKAPI ===
  // Generate sitemap dengan semua locale variants:
  // <url>
  //   <loc>https://example.com/id/products</loc>
  //   <xhtml:link rel="alternate" hreflang="id" href="..." />
  //   <xhtml:link rel="alternate" hreflang="en" href="..." />
  // </url>
}

// === LENGKAPI: Structured data per locale ===
function generateProductSchema(product: Product, locale: string) {
  // === LENGKAPI ===
  // Generate JSON-LD dengan locale yang benar:
  // {
  //   "@type": "Product",
  //   "name": "Product Name", // translated
  //   "description": "...", // translated
  //   "inLanguage": "id"
  // }
}

// === LENGKAPI: Meta tags per locale ===
function generateMetaTags(product: Product, locale: string) {
  // === LENGKAPI ===
  // Generate locale-specific meta tags:
  // <title>translated title</title>
  // <meta name="description" content="translated description" />
  // <meta property="og:locale" content="id_ID" />
  // <meta property="og:locale:alternate" content="en_US" />
}
```

**Hint:** Hreflang: wajib untuk multi-language SEO. `x-default`: fallback version untuk languages yang tidak didukung. Sitemap: include semua locale variants. OG locale: `id_ID`, `en_US`, `ja_JP`. Structured data: gunakan `inLanguage` property. **PENTING**: pastikan setiap halaman punya canonical URL yang benar, hindari duplicate content penalty.

---

### 10. i18n Testing
**Pertanyaan:** Implementasi testing untuk i18n:

```typescript
// === LENGKAPI: Unit tests untuk translations ===

// 1. Test: semua keys ada di semua bahasa
describe('Translation Completeness', () => {
  const locales = ['id', 'en', 'ja'];
  const translations = loadAllTranslations(locales);
  
  locales.forEach(locale => {
    it(`${locale} should have all required keys`, () => {
      // === LENGKAPI ===
      // Compare keys dengan reference (English)
      // Fail jika ada missing keys
    });
  });
});

// 2. Test: interpolation variables match
describe('Interpolation Consistency', () => {
  locales.forEach(locale => {
    it(`${locale} interpolation variables should match English`, () => {
      // === LENGKAPI ===
      // Extract {{variable}} dari semua keys
      // Compare dengan English version
    });
  });
});

// 3. Test: RTL layout
describe('RTL Layout', () => {
  it('should apply dir="rtl" for Arabic', () => {
    // === LENGKAPI ===
    // Mount component dengan Arabic locale
    // Assert dir="rtl" pada root element
  });
  
  it('should flip icons for RTL', () => {
    // === LENGKAPI ===
    // Assert arrow icons flipped
  });
});

// 4. Test: language switcher
describe('Language Switcher', () => {
  it('should change language on click', () => {
    // === LENGKAPI ===
    // Render LanguageSwitcher
    // Click English option
    // Assert i18n.language === 'en'
    // Assert page content updated
  });
  
  it('should persist language choice', () => {
    // === LENGKAPI ===
    // Switch language
    // Reload page
    // Assert language still same
  });
});

// === LENGKAPI: E2E test ===
describe('Multi-language E2E', () => {
  it('should show correct language from URL', async () => {
    // === LENGKAPI ===
    // Navigate to /en/products
    // Assert page content in English
    // Navigate to /id/products
    // Assert page content in Indonesian
  });
  
  it('should redirect to default locale', async () => {
    // === LENGKAPI ===
    // Navigate to /products (no locale)
    // Assert redirect to /id/products
  });
});
```

**Hint:** Use Vitest for unit tests, Playwright for E2E. Translation completeness: recursive key comparison. Interpolation: regex `/{{(\w+)}}/g` untuk extract variables. RTL: `screen.getByRole('button', { dir: 'rtl' })`. Language switcher: fire click event, assert `i18n.language`. **PENTING**: test semua supported locales, bukan cuma default. Test fallback behavior saat translation key tidak ada.
