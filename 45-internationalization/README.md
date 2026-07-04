# 🌍 Internasionalisasi (i18n) — Multi-Language React Application

![Pexels Banner](https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg)

**Level:** Mahir  
**Total Jam:** 20 Jam (4 sesi × 5 jam)  
**Prasyarat:** Node.js, React/framework modern (Modul 20), TypeScript dasar  
**Tipe Modul:** Baru — Internationalization khusus frontend + backend

## 📚 Materi

| Sesi | Topik | Durasi |
|------|-------|--------|
| 01 | i18n Concepts — locale, translation file, ICU message, pluralization | 5 jam |
| 02 | React i18n — react-i18next, useTranslation, Trans, namespace, SSR | 5 jam |
| 03 | RTL & Backend — bidirectional layout, Accept-Language, DB multilingual | 5 jam |
| 04 | Production i18n — SaaS TMS, i18n linting, code splitting, SEO hreflang | 5 jam |

## 🎯 Output Akhir

Aplikasi React multi-language dengan dukungan:

- **English (en-US)** — default
- **Bahasa Indonesia (id-ID)** — LTR locale
- **Arabic (ar-SA)** — RTL locale, full bidirectional styling

Fitur:
- Runtime language switching tanpa reload
- RTL layout otomatis (CSS logical properties)
- Pluralization & interpolation (ICU MessageFormat)
- Lazy-loaded translation per locale (code splitting)
- i18n middleware backend Express
- Database multilingual (PostgreSQL JSONB)
- SEO hreflang tag
- Translation workflow (Dev → Translation → Review → Deploy)

## 🧠 AI Prompt Exercises

Setiap sesi menyertakan 4 latihan berbasis AI prompt. Mahasiswa mengerjakan langsung dengan bantuan AI (ChatGPT, Claude, GitHub Copilot) sebagai pair programmer.

**Contoh prompt per sesi:**

1. "Bantu saya setup folder locales dengan struktur JSON untuk 3 bahasa: en, id, ar. Sertakan namespace common, home, auth dengan 5 key masing-masing."
2. "Tulis komponen LanguageSwitcher React dengan react-i18next yang menampilkan flag emoji + nama bahasa. Gunakan useTranslation hook."
3. "Buat middleware Express yang mendeteksi Accept-Language header dan menyediakan locale di req object."
4. "Implementasi lazy loading translations dengan React.lazy + Suspense per locale. Beri fallback loading spinner."

## 📦 Struktur Proyek Akhir

```
project/
├── public/
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   ├── home.json
│       │   └── auth.json
│       ├── id/
│       │   ├── common.json
│       │   ├── home.json
│       │   └── auth.json
│       └── ar/
│           ├── common.json
│           ├── home.json
│           └── auth.json
├── src/
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── i18n.d.ts
│   │   └── locale-detector.ts
│   ├── components/
│   │   ├── LanguageSwitcher.tsx
│   │   └── RTLWrapper.tsx
│   ├── pages/
│   └── backend/
│       ├── middleware/i18n.ts
│       └── models/locale.ts
└── i18next-scanner.config.js
```
