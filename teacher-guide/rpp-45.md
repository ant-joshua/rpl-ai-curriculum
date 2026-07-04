# RPP: Internasionalisasi (i18n) — Multi-Language React Application

| Info | Detail |
|------|--------|
| Kode | RPL-AI-45 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | Node.js, React, TypeScript dasar |

## Pertemuan 1: i18n Concepts — Locale, Translation File, ICU Message, Pluralization, Interpolation

### Tujuan
- Memahami konsep internasionalisasi (i18n) vs localization (l10n)
- Membuat struktur folder locale & translation JSON files
- Menggunakan ICU MessageFormat untuk pluralization & interpolation
- Setup i18n tanpa framework (vanilla JavaScript)

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo app bahasa Inggris saja, tanya kenapa perlu multi-language, contoh app dengan i18n (Twitter, WhatsApp) | Tanya jawab | Slide, browser |
| 20' | Materi inti: i18n vs l10n, locale identifier (en-US, id-ID), translation file struktur (JSON namespace), ICU MessageFormat (plural, select, ordinal), interpolation, number/date formatting, locale fallback | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup folder locales (en, id, ar) + buat translation JSON + implementasi i18n function vanilla JS + pluralization | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah translation namespace (common, home, auth) + implement number/date formatting per locale | Problem solving | Soal |
| 15' | Diskusi & refleksi: tantangan i18n (grammar berbeda, gender, konteks), perbedaan ICU vs sprintf vs template literal | Q&A | — |

### Bahan Ajar
- [Module README](../45-internationalization/)
- [i18n Concepts](../45-internationalization/01-i18n-concepts.md)

---

## Pertemuan 2: React i18n — react-i18next, useTranslation Hook, Trans Component, Namespace, SSR

### Tujuan
- Setup react-i18next di aplikasi React
- Mengintegrasikan useTranslation hook & Trans component
- Mengelola multiple namespace untuk translation files
- Implementasi server-side rendering (SSR) i18n dengan Next.js

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap i18n vanilla JS, demo React app perlu integration library | Tanya jawab | Slide, browser |
| 20' | Materi inti: react-i18next setup (i18n.ts config), useTranslation hook, Trans component untuk HTML interpolation, namespace splitting, language detector, i18n instance for SSR, Suspense fallback | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: install react-i18next + i18next-browser-languagedetector + buat LanguageSwitcher component + gunakan useTranslation di pages | Hands-on | Starter code |
| 20' | Latihan mandiri: implement Trans component dengan link/HTML di dalam translation + lazy load locale + loading fallback | Problem solving | Soal |
| 15' | Diskusi & refleksi: react-i18next vs react-intl vs next-intl, perbandingan bundle size & DX | Q&A | — |

### Bahan Ajar
- [Module README](../45-internationalization/)
- [React i18n](../45-internationalization/02-react-i18n.md)

---

## Pertemuan 3: RTL & Backend — Bidirectional Layout, CSS Logical Properties, Accept-Language Header, Database Multilingual

### Tujuan
- Mengimplementasi RTL layout dengan CSS logical properties
- Membuat Express middleware untuk deteksi Accept-Language
- Mendesain database multilingual (JSONB, translation table)
- Menyediakan API endpoint dengan locale support

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo app yang rusak di bahasa Arab, kenapa RTL butuh pendekatan berbeda | Tanya jawab | Slide, browser (Arabic website) |
| 20' | Materi inti: CSS logical properties (inset-inline-start, margin-inline-end), dir attribute, HTML bidirectional, Express middleware Accept-Language, database multilingual patterns (JSONB, translation table, EAV), locale-aware API response | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: build RTLWrapper component + CSS logical properties refactor + Express i18n middleware + bahasa endpoint | Hands-on | Starter code |
| 20' | Latihan mandiri: implement database multilingual dengan JSONB column + API sorting by locale | Problem solving | Soal |
| 15' | Diskusi & refleksi: CSS logical properties vs traditional direction, performa JSONB vs translation table, CDN & caching for localized content | Q&A | — |

### Bahan Ajar
- [Module README](../45-internationalization/)
- [RTL & Backend](../45-internationalization/03-rtl-backend.md)

---

## Pertemuan 4: Production i18n — SaaS TMS, i18n Linting, Code Splitting, SEO Hreflang, Translation Workflow

### Tujuan
- Mengintegrasikan Translation Management System (TMS) seperti Lokalise / POEditor
- Setup i18n linting & validation (i18next-scanner, i18next-parser)
- Implementasi code splitting per locale dengan React.lazy
- SEO hreflang tag & sitemap untuk multi-language
- Mendesain translation workflow (Dev → Translation → Review → Deploy)

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap i18n stack, diskusi masalah production: translation management, bundle size, SEO | Tanya jawab | Slide |
| 20' | Materi inti: TMS tools (Lokalise, Crowdin, POEditor), i18next-scanner/parser, code splitting per locale (React.lazy + import()), SEO hreflang & canonical, sitemap multi-language, translation workflow CI/CD, missing key fallback, i18n debugging tools | Ceramah + demo | Live code, TMS dashboard |
| 25' | Praktik terbimbing: setup i18next-scanner + auto-extract translation keys + implement code splitting per locale + hreflang tag | Hands-on | Starter code |
| 20' | Latihan mandiri: integrasi TMS (export/import translations) + setup translation workflow + i18n CI check | Problem solving | Soal |
| 15' | Refleksi & wrap-up: showcase final multi-language app (en, id, ar RTL), diskusi i18n roadmap & advanced topics (react-native i18n, i18n testing) | Presentasi | Browser live demo |

### Bahan Ajar
- [Module README](../45-internationalization/)
- [Production i18n](../45-internationalization/04-production-i18n.md)
