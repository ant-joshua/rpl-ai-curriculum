# Basic TypeScript Starter

Template starter minimal untuk project TypeScript. Cocok buat lu yang baru belajar TypeScript atau但 butuh boilerplate cepat tanpa framework.

## Stack

| Komponen      | Versi      |
|---------------|------------|
| TypeScript    | ^5.7       |
| tsx           | ^4.19      |
| Node.js       | >= 18      |

## Struktur Folder

```
basic-ts/
├── src/
│   └── index.ts        # Entry point utama
├── package.json        # Dependencies & scripts
├── tsconfig.json       # Konfigurasi TypeScript
└── README.md           # Dokumentasi (ini)
```

## Cara Pake

```bash
# 1. Clone template ini ke project baru
npx degit path/ke/basic-ts my-project
cd my-project

# 2. Install dependencies
npm install

# 3. Jalankan mode development (hot-reload)
npm run dev

# 4. Build ke JavaScript
npm run build

# 5. Jalankan hasil build
npm start
```

## Scripts yang Tersedia

| Script    | Perintah                    | Fungsi                              |
|-----------|-----------------------------|-------------------------------------|
| `dev`     | `tsx watch src/index.ts`    | Run dengan hot-reload (development) |
| `build`   | `tsc`                       | Compile TS ke JS di folder `dist/`  |
| `start`   | `node dist/index.js`        | Jalankan hasil build                |

## Penjelasan TypeScript Setup

Template ini pake konfigurasi TypeScript yang umum dipake di project modern:

- **`target: ES2022`** — Compile ke JavaScript versi terbaru (async/await, optional chaining, dll native).
- **`module: NodeNext`** — Support ES modules (`import`/`export`) di Node.js.
- **`strict: true`** — Aktifkan semua type-checking strict. No `any` lolos sembarangan.
- **`esModuleInterop: true`** — Biar bisa `import express from 'express'` tanpa `* as`.
- **`outDir: ./dist`** — Hasil compile masuk folder `dist/`, `rootDir` adalah `src/`.

Kenapa pake **tsx** instead of `ts-node`? tsx 10x lebih cepat karena pake esbuild di belakangnya. Langsung jalan tanpa config tambahan.

## TypeScript Fundamentals yang Dipake di Starter

Template ini nge-demo beberapa konsep dasar TypeScript yang penting dipahami:

1. **Type annotations** — `const nama: string = "RPL"`. TypeScript bisa infer type, tapi lebih baik explicit.
2. **Interface** — Definisi bentuk object `Mahasiswa` dengan properti yang udah ditentuin tipenya.
3. **Generic** — Fungsi `ambilPertama<T>(arr: T[])` yang type-safe tanpa peduli tipe data array-nya.
4. **Async/Await** — `async function fetchData(): Promise<string>` — fungsi async dengan return type.
5. **Array methods** — `reduce`, `map`, `filter` semua kena type checking, jadi ga bisa asal pencet.
6. **Map & Set** — Data structures dengan tipe key-value yang ketat.

## Kenapa Harus TypeScript?

Dibanding JavaScript biasa, TypeScript ngasih:
- **Type checking** — error ketangkep pas compile, bukan pas runtime
- **Auto-complete** — IDE ngerti struktur data lo
- **Self-documenting** — interface jadi dokumentasi hidup
- **Refactoring aman** — rename variable, ubah shape object, semua kena tracking
- **Better DX** — developer experience jauh lebih enak

## Testing

Starter ini belum include testing framework. Tambah sendiri sesuai kebutuhan:
- **Vitest** — Unit test (ringan, cepat)
- **Jest** — Unit test klasik
- **Node:test** — Built-in Node.js test runner (ga perlu install)

## Catatan

- Udah include `@types/node` buat auto-complete API Node.js.
- File `.ts` langsung di-run pake `tsx`, ga perlu compile dulu pas development.
- Build pake `tsc` hasilnya pure JS siap deploy.

Happy coding!
