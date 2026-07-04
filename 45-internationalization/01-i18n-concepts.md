# Sesi 01: Konsep Dasar Internasionalisasi (i18n)

**Durasi:** 5 Jam

## 🎯 Tujuan Pembelajaran

Setelah sesi ini mahasiswa mampu:

- Membedakan i18n dan l10n
- Memahami format locale (en-US, id-ID, ar-SA)
- Menyusun struktur file translasi JSON (nested keys)
- Mengimplementasikan interpolation & pluralization
- Menggunakan ICU Message Format untuk translasi kompleks

---

## 📖 Materi

### 1. i18n vs l10n

| Istilah | Arti | Contoh |
|---------|------|--------|
| **i18n** (Internationalization) | Proses desain aplikasi agar siap diadaptasi ke berbagai bahasa/region | Memisahkan string dari kode, pakai locale IDs |
| **l10n** (Localization) | Proses adaptasi konten ke bahasa/lokal spesifik | Menerjemahkan string ke Bahasa Indonesia |

> i18n = kerangka teknis. l10n = konten terjemahan.

**Best practice:** Tulis kode dg i18n sejak awal. Migrasi aplikasi existing ke i18n jauh lebih mahal.

### 2. Format Locale

Standar: **BCP 47** — `language-REGION`

| Locale | Bahasa | Region | Catatan |
|--------|--------|--------|---------|
| `en-US` | English | United States | default |
| `en-GB` | English | United Kingdom | colour vs color |
| `id-ID` | Bahasa Indonesia | Indonesia | LTR |
| `ar-SA` | Arabic | Saudi Arabia | RTL |
| `zh-CN` | Chinese (Simplified) | China | |
| `ja-JP` | Japanese | Japan | |

```typescript
// locale constant
export const SUPPORTED_LOCALES = ['en-US', 'id-ID', 'ar-SA'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en-US';

export const localeConfig: Record<Locale, {
  label: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}> = {
  'en-US': { label: 'English', dir: 'ltr', flag: '🇺🇸' },
  'id-ID': { label: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩' },
  'ar-SA': { label: 'العربية', dir: 'rtl', flag: '🇸🇦' },
};
```

### 3. Struktur File Translasi

Rekomendasi: **JSON flat dengan namespaces.**

```
public/locales/
├── en/
│   ├── common.json    # tombol, label, error umum
│   ├── home.json      # halaman home
│   └── auth.json      # login, register, logout
├── id/
│   ├── common.json
│   ├── home.json
│   └── auth.json
└── ar/
    ├── common.json
    ├── home.json
    └── auth.json
```

**Format JSON — nested keys:**

```json
{
  "greeting": "Hello",
  "nav": {
    "home": "Home",
    "about": "About Us",
    "contact": "Contact"
  },
  "error": {
    "notFound": "Page not found",
    "serverError": "Something went wrong. Please try again later."
  }
}
```

**Akses via dot notation:** `t('greeting')`, `t('nav.home')`, `t('error.notFound')`

### 4. Interpolation & Pluralization

#### Interpolation

```json
{
  "welcomeUser": "Welcome, {{name}}!",
  "itemsInCart": "You have {{count}} items in your cart."
}
```

```javascript
t('welcomeUser', { name: 'Alice' });
// → "Welcome, Alice!"
t('itemsInCart', { count: 3 });
// → "You have 3 items in your cart."
```

#### Pluralization — ICU MessageFormat

```json
{
  "cows": "{count, plural, one {# cow} other {# cows}}",
  "apples": "{count, plural, =0 {No apples} one {# apple} other {# apples}}"
}
```

```javascript
t('cows', { count: 1 });  // → "1 cow"
t('cows', { count: 5 });  // → "5 cows"
t('apples', { count: 0 }); // → "No apples"
```

**Plural rule per locale:** ICU otomatis deteksi cardinal plural rule CLDR. Bahasa Indonesia pakai `other` aja — nggak punya `one`/`few`/`many`.

```json
{
  "buku": "{count, plural, other {# buku}}"
}
```

### 5. ICU Message Format — Fitur Lengkap

#### Select (gender, pronoun)

```json
{
  "partyInvitation": "{name} {gender, select, male {invited you to his party} female {invited you to her party} other {invited you to their party}}"
}
```

#### Nested plural + select

```json
{
  "notification": "You have {count, plural, =0 {no notifications} one {# notification} other {# notifications}}. {count, plural, =0 {} one {{gender, select, male {He} female {She} other {They}} liked your post} other {{gender, select, male {He} female {She} other {They}} liked your posts}}"
}
```

#### Number formatting

```json
{
  "price": "The price is {price, number, ::currency/USD}"
}
```

ICU memungkinkan kombinasi kompleks — hindari nested berlebihan di kode, pecah jadi beberapa key.

---

## 💻 Kode Praktik

### Setup Folder Proyek

```bash
mkdir -p public/locales/{en,id,ar}
```

### Contoh File: `public/locales/en/common.json`

```json
{
  "app": {
    "name": "MyApp",
    "tagline": "Built for everyone"
  },
  "nav": {
    "home": "Home",
    "about": "About",
    "language": "Language"
  },
  "greeting": "Hello, {{name}}!",
  "items": "{count, plural, =0 {No items} one {# item} other {# items}}",
  "notification": {
    "title": "Notifications",
    "new": "You have {count, plural, =0 {no new notifications} one {# new notification} other {# new notifications}}"
  }
}
```

### Contoh File: `public/locales/id/common.json`

```json
{
  "app": {
    "name": "MyApp",
    "tagline": "Dibangun untuk semua"
  },
  "nav": {
    "home": "Beranda",
    "about": "Tentang",
    "language": "Bahasa"
  },
  "greeting": "Halo, {{name}}!",
  "items": "{count, plural, other {# item}}",
  "notification": {
    "title": "Notifikasi",
    "new": "Anda memiliki {count, plural, other {# notifikasi baru}}"
  }
}
```

### Deteksi Locale Browser

```typescript
// src/i18n/locale-detector.ts
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from './config';

export function detectBrowserLocale(): Locale {
  const locales = navigator.languages ?? [navigator.language];

  for (const lang of locales) {
    // exact match: en-US, id-ID
    if (SUPPORTED_LOCALES.includes(lang as Locale)) {
      return lang as Locale;
    }
    // partial match: en → en-US
    const base = lang.split('-')[0];
    const match = SUPPORTED_LOCALES.find((l) => l.startsWith(base));
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}
```

### Format ICU di JavaScript Native (opsional)

```javascript
// tanpa library — Intl.PluralRules
const pr = new Intl.PluralRules('id-ID');
console.log(pr.select(0)); // "other"
console.log(pr.select(1)); // "other"
console.log(pr.select(2)); // "other"

const prEn = new Intl.PluralRules('en-US');
console.log(prEn.select(0)); // "other"
console.log(prEn.select(1)); // "one"
console.log(prEn.select(2)); // "other"
```

---

## 🧠 AI Prompt Exercises

### Latihan 1: Struktur Locale Folder

**Prompt untuk AI:**

> "Saya perlu setup folder locales untuk aplikasi React multi-bahasa. Buatkan struktur folder public/locales/{en,id,ar} dengan namespace: common, home, auth. Masing-masing minimal 10 key. Gunakan nested JSON. Sertakan interpolation ({{name}}, {{count}}) dan pluralization ICU."

**Kriteria:** Semua file valid JSON, konsisten antar bahasa, mencakup greeting, nav, error, button, form label.

### Latihan 2: Format ICU Kompleks

**Prompt untuk AI:**

> "Bantu saya membuat key translasi ICU untuk skenario: notifikasi undangan pesta. Harus kombinasi plural (jumlah tamu), gender (host gender), dan waktu relatif (hari ini, kemarin). Gunakan ICU MessageFormat select dan plural.

**Kriteria:** Satu key tunggal, minimal 4 varian output berbeda tergantung parameter.

### Latihan 3: Locale Detector & Validator

**Prompt untuk AI:**

> "Tulis fungsi TypeScript yang menerima Accept-Language header string (contoh: 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7') dan mengembalikan locale terbaik dari daftar ['en-US', 'id-ID', 'ar-SA']. Implementasikan quality value (q) parsing dan fallback ke default."

**Kriteria:** Handle edge case (no match, malformed q value), gunakan generic type.

### Latihan 4: Number & Date Formatter

**Prompt untuk AI:**

> "Buat utility function TypeScript untuk memformat number (mata uang) dan date (long, short, relative) berdasarkan locale. Gunakan Intl.NumberFormat dan Intl.DateTimeFormat native. Dukung locale: en-US, id-ID, ar-SA."

**Kriteria:** Output sesuai locale (ID: Rp 1.000, EN: $1,000, AR: ر.س. ١٬٠٠٠). Tanggal pakai format lokal.

---

## 📝 Evaluasi

| Indikator | Deskripsi |
|-----------|-----------|
| Struktur file JSON | Hierarki benar, namespace terpisah, valid JSON |
| ICU format | Select, plural, interpolation berfungsi |
| Locale detection | Prioritas navigator.languages, fallback default |
| Code splitting siap | Namespace per domain (common, home, auth) |
