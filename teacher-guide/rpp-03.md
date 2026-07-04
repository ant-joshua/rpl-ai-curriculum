# RPP: TypeScript Basics

| Info | Detail |
|------|--------|
| Kode | RPL-AI-03 |
| Durasi | 2 pertemuan × 90 menit |
| Level | Beginner |
| Prasyarat | JavaScript Fundamentals (Modul 01) |

## Pertemuan 1: Type Basics, Types & Interfaces

### Tujuan
- Memahami kenapa TypeScript dan bedanya dengan JS
- Menulis tipe dasar: string, number, boolean, union, literal
- Membuat interface & type alias

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Apersepsi**: Demo error JS yang bisa dicegah TS — "kenapa ngetik string malah diproses sebagai number?" | Demo + tanya jawab | Slide |
| 15' | **Setup**: Install TypeScript, init tsconfig, compile pertama | Tutorial | Terminal, VS Code |
| 20' | **Type basics**: annotation, inference, union, literal, any vs unknown | Ceramah + live code | Live code |
| 15' | **Interface & Type alias**: object types, optional, readonly, extends | Ceramah + demo | Live code |
| 20' | **Praktik**: Tulis interface untuk data user, product, API response | Hands-on | Starter code (JS → TS) |
| 10' | **Refleksi**: "TypeScript itu ribet atau nyelamatin? Debat singkat" | Diskusi | — |

### Bahan Ajar
- [Module 03 - Type Basics](../03-typescript/01-basics.md)
- [Module 03 - Types & Interfaces](../03-typescript/02-types-interfaces.md)

---

## Pertemuan 2: Functions, Generics, tsconfig & Refactor Project

### Tujuan
- Menulis function types, overload, dan generic
- Mengkonfigurasi tsconfig.json
- Merefactor project JavaScript ke TypeScript

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review interface & type** | Kuis | — |
| 20' | **Function types & overload**: parameter type, return type, overload signature | Ceramah + demo | Live code |
| 20' | **Generics**: `<T>`, generic function, constraints, kenapa generics | Ceramah + demo | Live code |
| 10' | **tsconfig**: strict mode, target, module, outDir | Ceramah | Live code + tsconfig.json |
| 25' | **Praktik**: Refactor project JS (CLI todo) ke TypeScript — tambah tipe, interface, generic | Hands-on | Starter project JS |
| 10' | **Presentasi**: 2 siswa demo hasil refactor | Show & tell | Projector |
| 5' | **Refleksi**: Error TypeScript yang paling sering muncul | Q&A | — |

### Bahan Ajar
- [Module 03 - Functions & Generics](../03-typescript/03-functions-generics.md)
- [Module 03 - tsconfig & Project](../03-typescript/04-tsconfig-project.md)
