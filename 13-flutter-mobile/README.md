<img src="https://images.pexels.com/photos/7325498/pexels-photo-7325498.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Flutter Mobile" style="width:100%;border-radius:12px;margin:12px 0;">

# 13. Flutter Mobile — Dari Dart ke Play Store

> **Level:** ⚡ Intermediate  
> **Jam:** 8 (4 minggu × 2 sesi)  
> **Prasyarat:** TypeScript/JavaScript dasar, OOP  
> **Output:** Flutter app siap deploy (Android APK ke Play Store)

---

## Kenapa Flutter?

Flutter adalah framework UI **open-source** dari Google buat bikin aplikasi mobile, web, dan desktop dari **satu codebase**. Bahasa yang dipake: **Dart**.

**Flutter paling besar di Indonesia** — buktinya:

- **Gojek, Tokopedia, BCA Mobile, Lapak Gaming, Ralali** pake Flutter.
- Lebih dari **40% developer mobile** Indonesia pake Flutter (Survey IDS 2024).
- **Startup dan agensi** di Indonesia dominan Flutter karena biaya lebih murah (satu tim, dua platform: Android + iOS).
- **Komunitas Flutter Indonesia** aktif banget — Telegram, Discord, meetup tiap bulan.

Kalau lo udah bisa JavaScript/TypeScript, lo udah bekal. Tinggal belajar **sintaks Dart** dan mental **widget tree**.

---

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:

- Nulis kode Dart sendiri — variable, function, class, async
- Paham Widget Tree dan beda Stateless vs StatefulWidget
- Layout pake Row, Column, ListView, GridView
- Pake setState dan Provider buat state management
- Navigasi antar screen pake Navigator & named routes
- Panggil REST API + parse JSON pake http package
- Setup Firebase (Firestore + Auth)
- Build APK dan deploy ke Play Store

---

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Dart Syntax & Widget Dasar | [01-dart-widget.md](01-dart-widget.md) |
| 2 | Layout & State Management | [02-layout-state.md](02-layout-state.md) |
| 3 | Navigation & API Integration | [03-navigation-api.md](03-navigation-api.md) |
| 4 | Firebase & Deploy ke Play Store | [04-firebase-deploy.md](04-firebase-deploy.md) |

---

## Output Akhir Modul

> **Flutter app siap deploy** — aplikasi mobile dengan Firebase backend, upload APK ke Google Play Console.

---

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:

- "Explain this Flutter widget tree line by line"
- "Refactor this StatefulWidget to use Provider"
- "Convert this API call to use FutureBuilder"
- "Generate 3 test cases for this Dart function"
- "Find the bug in this widget state management code"
- "Convert this Firebase Firestore query to a paginated version"

---

## Rangkuman

| Konsep | Poin Penting |
|--------|-------------|
| **Dart** | Sintaks mirip TS, null safety default, `final`/`const` |
| **Widget** | Stateless (statis) vs Stateful (dinamis), `setState()` trigger rebuild |
| **Layout** | Row/Column/Expanded, ListView/GridView, EdgeInsets/Padding |
| **Navigasi** | `push`/`pop`, named routes, `onGenerateRoute` |
| **State Management** | `setState` buat lokal, **Provider** buat global |
| **API** | `http` package, `dart:convert`, `FutureBuilder` |
| **Firebase** | Firestore CRUD, Auth login/register, security rules |
| **Deploy** | Keystore → key.properties → `flutter build appbundle` → Play Console |

---

## Referensi

- [Flutter Documentation](https://docs.flutter.dev) — resmi dari Google
- [Dart Null Safety](https://dart.dev/null-safety) — wajib baca
- [Provider Package](https://pub.dev/packages/provider) — state management
- [Firebase Flutter Setup](https://firebase.flutter.dev) — integrasi Firebase
- [Komunitas Flutter Indonesia](https://t.me/FlutterIndonesia) — tanya-tanya di Telegram
- [Google Play Console](https://play.google.com/console) — deploy app

---

> **SMK Bisa!** Dengan Flutter, lo bisa bikin app Android + iOS sendirian. Modal laptop, koneksi internet, dan konsisten ngoding tiap hari. Mulai dari widget sederhana, API call, sampe publish ke Play Store.
