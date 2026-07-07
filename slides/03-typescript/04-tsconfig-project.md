---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/546819/pexels-pho"
footer: "Sesi 04: Tsconfig Project"
---

<!-- _class: title -->
# 3.4 tsconfig & Project Setup

## Setup Project

Install TypeScript dan inisialisasi.

```bash
npm init -y
npm install --save-dev typescript
npx tsc --init
```

Ini bikin file `tsconfig.json` — otak dari project TypeScript.

## tsconfig.json — Dasar

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

Penjelasan:

| Option | Fungsi |
|--------|--------|
| `target` | Versi JS output (ES5, ES2020, ESNext) |
| `module` | Module system (commonjs, ES2020, ESNext) |
| `outDir` | Folder hasil compile |
| `rootDir` | Folder source code |
| `strict` | Aktifin semua type checking ketat |
| `esModuleInterop` | Biarin `import` dari CommonJS module |

## Strict Mode

`strict: true` ngaktifin beberapa aturan sekaligus.

```typescript
// strictNullChecks — ga bisa assign null/undefined sembarangan
// Dengan strict:
let name: string = "Budi";
// name = null; // ERROR

// noImplicitAny — harus kasih tipe explicit
// function add(a, b) { return a + b; } // ERROR: parameter 'a' implicitly has 'any'

// strictFunctionTypes — function parameter covariance check lebih ketat
```

## Compiling

```bash

---

# Compile sekali
npx tsc


---

# Watch mode — compile otomatis tiap ada perubahan
npx tsc --watch


---

# Compile specific file
npx tsc src/index.ts --outDir dist
```

## Struktur Folder

```
project/
├── src/
│   ├── index.ts
│   ├── utils.ts
│   └── types.ts
├── dist/          # hasil compile — ga perlu di-commit
├── tsconfig.json
├── package.json
└── .gitignore
```

## .gitignore

```gitignore
node_modules/
dist/
*.js
!*.config.js
```

## Project References

Buat project besar, split jadi beberapa sub-project.

```json
// root tsconfig.json
{
  "references": [
    { "path": "./shared" },
    { "path": "./frontend" },
    { "path": "./backend" }
  ]
}
```

Masing-masing sub-project punya tsconfig sendiri:

```json
// shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

## Type Declaration Files (.d.ts)

File `.d.ts` describes tipe buat JavaScript library yang ga punya type sendiri.

```typescript
// myLib.d.ts
declare function myLib(message: string): void;
declare namespace myLib {
  function version(): string;
}

// Kalo library punya DefinitelyTyped:
// npm install --save-dev @types/nama-library
```

## Debugging

```bash

---

# Generate source maps biar bisa debug TypeScript langsung

---

# tambah di tsconfig:

---

# "sourceMap": true


---

# Run langsung pake ts-node (ga perlu compile dulu)
npx ts-node src/index.ts


---

# Atau pake tsx (lebih cepet)
npx tsx src/index.ts
```

## Latihan

1. Init project TypeScript dari 0: `npm init`, install typescript, `tsc --init`. Set `rootDir` ke `./src` dan `outDir` ke `./dist`. Bikin `src/index.ts` dengan console log, jalanin `npx tsc`, jalanin hasilnya pake node
2. Aktifin `strict: true`. Coba tulis kode yang error karena strict (null assignment, implicit any, dll). Fix error-nya
3. Bikin 3 file: `src/types.ts` (interface), `src/utils.ts` (generic function), `src/index.ts` (main). Import antar file. Compile dan jalanin
4. Install `@types/node`. Bikin script yang pake `process.argv` untuk baca CLI arguments. Compile dan jalanin dari terminal
