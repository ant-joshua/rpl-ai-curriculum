# 3.4 tsconfig & Project Setup

## Setup Project TypeScript dari Nol

```bash
# 1. Init project
mkdir my-ts-app && cd my-ts-app
npm init -y

# 2. Install TypeScript
npm install --save-dev typescript

# 3. Bikin tsconfig.json
npx tsc --init

# 4. Bikin struktur folder
mkdir src
touch src/index.ts

# 5. Compile & run
npx tsc
node dist/index.js
```

### Package Manager — NPM vs Yarn vs PNPM

```bash
# NPM
npm install --save-dev typescript

# Yarn
yarn add --dev typescript

# PNPM (lebih cepet, hemat disk)
pnpm add --save-dev typescript
```

PNPM recommended buat project besar karena:
- **Content-addressable storage** — package cuma di-download sekali
- **Strict node_modules** — gak bisa akses package yang bukan dependency
- **Lebih cepet** — install paralel

## tsconfig.json — Otak Project

File `tsconfig.json` ngontrol **gimana TypeScript di-compile**.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Penjelasan Option Wajib

| Option | Default | Recommended | Fungsi |
|--------|---------|-------------|--------|
| `target` | ES5 | ES2022 | Versi JS output (lebih tinggi = fitur modern) |
| `module` | commonjs | NodeNext/ESNext | Sistem module |
| `outDir` | ./ | ./dist | Folder hasil compile |
| `rootDir` | ./ | ./src | Folder source code |
| `strict` | false | true | Aktifin semua type checking ketat |

### Module Resolution — Cara TypeScript Cari Module

```typescript
// moduleResolution menentukan gimana TypeScript resolve import
// "classic" — legacy, cari file dengan ekstensi .ts/.d.ts
// "node" — mirip Node.js require(), cari index.ts, package.json types
// "node16"/"nodenext" — modern, bedain CJS dan ESM
// "bundler" — buat project pake bundler (webpack/vite), gak perlu cek exports
```

| mode | Cocok untuk | Kelebihan |
|------|-------------|-----------|
| `node` | Legacy Node.js projects | Backward compatible |
| `node16` / `nodenext` | Modern Node.js (ESM + CJS) | TypeScript module resolution sesuai Node |
| `bundler` | Vite/Webpack projects | Paling fleksibel, gak perlu .js extension |

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true
  }
}
```

### Option Penting Lain

```json
{
  "compilerOptions": {
    // Type Checking
    "strict": true,
    "noUnusedLocals": true,       // Error kalo ada variable ga dipake
    "noUnusedParameters": true,   // Error kalo parameter ga dipake
    "noImplicitReturns": true,    // Wajib return di semua path
    "noFallthroughCasesInSwitch": true, // Switch case must have break
    
    // Module Resolution
    "moduleResolution": "NodeNext",  // Cara cari module
    "baseUrl": ".",                   // Base path buat import
    "paths": {
      "@/*": ["./src/*"]            // Import alias: import x from "@/utils"
    },
    
    // Output
    "declaration": true,     // Generate .d.ts (type declaration)
    "declarationMap": true,  // Sourcemap buat .d.ts
    "sourceMap": true,       // Debug .ts langsung di browser/Node
    
    // Advanced
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,  // Hapus comments dari output JS
    
    // Library
    "lib": ["ES2022", "DOM"],  // Tipe built-in yang tersedia
    "resolveJsonModule": true,  // Import .json files
    "esModuleInterop": true     // Import CommonJS modules
  }
}
```

### Option Kompilasi Lanjutan

```json
{
  "compilerOptions": {
    // Source Maps
    "sourceMap": true,             // .js.map files
    "inlineSourceMap": false,      // Source map inline di JS (lebih besar)
    "inlineSources": true,         // Source .ts ikut di source map

    // Declaration Files
    "declaration": true,           // Generate .d.ts
    "declarationMap": true,        // Sourcemap buat .d.ts
    "emitDeclarationOnly": false,  // Hanya .d.tarif, gak .js

    // JavaScript Support
    "allowJs": true,              // Import .js files
    "checkJs": false,              // Type-check .js files (kalo allowJs true)
    "maxNodeModuleJsDepth": 0,    // Seberapa dalem check JS di node_modules

    // Emit
    "noEmit": true,                // Gak output file — cuma type-check
    "noEmitOnError": true,         // Gak output kalo ada error
    
    // Completeness
    "skipLibCheck": true,         // Skip type-check .d.ts
    "forceConsistentCasingInFileNames": true // Case-sensitive file names
  }
}
```

## Strict Mode Breakdown

`strict: true` === 7 aturan sekaligus. Yang paling penting:

```typescript
// 1. strictNullChecks — null & undefined ga bisa sembarangan
let name: string = "Budi";
// name = null;    // ❌ ERROR with strict
// name = undefined; // ❌ ERROR
let maybe: string | null = null; // OK — explicit

// 2. noImplicitAny — harus kasih tipe explicit
// function add(a, b) { return a + b; }
// ❌ Parameter 'a', 'b' implicitly has 'any' type

// 3. strictFunctionTypes — function parameter variance check
type Logger = (msg: string) => void;
let log: Logger = (msg: string | number) => {}; // ❌ ERROR with strict
```

### 7 Rules Strict Mode

```typescript
// 1. strictNullChecks — null/undefined bukan anggota tipe lain
// 2. noImplicitAny — parameter/return harus explicit type
// 3. strictFunctionTypes — function parameter contravariance
// 4. strictBindCallApply — bind/call/apply type-checked
// 5. alwaysStrict — "use strict" otomatis
// 6. noImplicitThis — this harus explicit type
// 7. useUnknownInCatchVariables — catch variable jadi unknown, bukan any
```

### noUnusedLocals & noUnusedParameters

```typescript
// ❌ Error kalo ada variable gak kepake
function calculateTotal(items: number[]): number {
  const taxRate = 0.1; // ❌ ERROR: 'taxRate' is declared but never used
  const total = items.reduce((sum, item) => sum + item, 0);
  return total;
}

// ✅ Pake underscore prefix buat parameter yang sengaja gak dipake
function onClick(_event: MouseEvent, element: HTMLElement): void {
  console.log("Clicked:", element);
}
```

## Struktur Folder yang Bener

```
my-ts-project/
├── src/
│   ├── index.ts          # Entry point
│   ├── types/
│   │   ├── index.ts      # Re-export semua type
│   │   ├── user.ts       # User interfaces
│   │   └── api.ts        # API response types
│   ├── utils/
│   │   ├── format.ts     # Formatting functions
│   │   └── validate.ts   # Validation functions
│   └── services/
│       ├── user-service.ts
│       └── auth-service.ts
├── dist/                 # Hasil compile (gitignored)
├── node_modules/         # Dependencies (gitignored)
├── tsconfig.json
├── package.json
└── .gitignore
```

### Struktur Multi-Package (Monorepo)

```
my-monorepo/
├── packages/
│   ├── shared/           # Shared types + utils
│   │   ├── src/
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── server/           # Backend
│   │   ├── src/
│   │   └── tsconfig.json
│   └── client/           # Frontend
│       ├── src/
│       └── tsconfig.json
├── tsconfig.base.json    # Base config — shared options
├── tsconfig.json         # Root — project references
└── package.json
```

## .gitignore untuk TypeScript

```gitignore
node_modules/
dist/
coverage/
.env
.env.local
*.log
.DS_Store
```

## Running & Debugging

```bash
# Cara 1: compile + node
npx tsc
node dist/index.js

# Cara 2: ts-node (compile on the fly)
npm install --save-dev ts-node
npx ts-node src/index.ts

# Cara 3: tsx (lebih cepet — recommended!)
npm install --save-dev tsx
npx tsx src/index.ts

# Watch mode — auto compile pas ada perubahan
npx tsc --watch

# Run with source maps (debugging)
# Pastiin "sourceMap": true di tsconfig
node --enable-source-maps dist/index.js
```

### Debugging di VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug TypeScript",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "runtimeArgs": ["--loader", "ts-node/esm"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  }
}
```

### Script Penjelasan

| Script | Perintah | Fungsi |
|--------|----------|--------|
| `build` | `tsc` | Compile TypeScript ke JavaScript |
| `build:watch` | `tsc --watch` | Auto recompile pas file berubah |
| `start` | `node dist/index.js` | Jalanin hasil compile |
| `dev` | `tsx watch src/index.ts` | Development mode — auto restart |
| `typecheck` | `tsc --noEmit` | Type-check aja tanpa output |
| `clean` | `rm -rf dist` | Bersihin hasil build |

## Type Declaration Files (.d.ts)

File `.d.ts` describe tipe buat JavaScript library yang ga punya type sendiri:

```typescript
// myLib.d.ts
declare function myLib(message: string): void;
declare namespace myLib {
  function version(): string;
  const VERSION: string;
}
```

Kalo library populer, pake DefinitelyTyped:

```bash
npm install --save-dev @types/node
npm install --save-dev @types/express
```

### Bikin Declaration File Sendiri

```typescript
// types/my-custom-lib.d.ts
declare module "my-custom-lib" {
  export interface Config {
    apiKey: string;
    timeout: number;
  }

  export function initialize(config: Config): Promise<void>;

  export class Client {
    constructor(config: Config);
    request<T>(method: string, path: string, data?: unknown): Promise<T>;
  }
}

// Kalo library tanpa types — declare module
declare module "untyped-library" {
  export function doSomething(input: string): void;
  export const VERSION: string;
}
```

### Global Declaration

```typescript
// types/global.d.ts
// Nambahin tipe ke global scope
declare global {
  interface Window {
    __APP_CONFIG__: {
      apiUrl: string;
      environment: string;
    };
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      DATABASE_URL: string;
      JWT_SECRET: string;
    }
  }
}

// Export kosong biar TypeScript treat ini sebagai module
export {};
```

### Triple-Slash Directives

```typescript
// Kadang perlu pake triple-slash directive buat reference types
/// <reference types="vite/client" />
/// <reference path="./types/global.d.ts" />

// Ini jarang dipake di code modern — lebih baik pake tsconfig.json
```

## Project References — Monorepo TypeScript

Buat project besar, split jadi sub-project dengan referensi:

```json
// root tsconfig.json
{
  "compilerOptions": { "target": "ES2022" },
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/server" },
    { "path": "./packages/client" }
  ]
}
```

Tiap sub-package punya tsconfig sendiri dengan `composite: true`:

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

Build semua: `npx tsc --build`

### Keuntungan Project References

1. **Build incremental** — hanya rebuild yang berubah
2. **Isolasi tipe** — error di satu package gak ngerusak yang lain
3. **Output terpisah** — tiap package punya `dist/` sendiri
4. **Type declarations** — `.d.ts` otomatis direferensi

```bash
# Build semua project
npx tsc --build

# Build specific project
npx tsc --build packages/shared

# Clean semua build
npx tsc --build --clean
```

### Base Config untuk Monorepo

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}

// packages/shared/tsconfig.json — extends base
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src"]
}
```

## tsconfig — Strategi Multiple Config

```json
// tsconfig.json — default (production build)
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "removeComments": true
  },
  "include": ["src"]
}

// tsconfig.dev.json — development
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "sourceMap": true,
    "removeComments": false
  },
  "include": ["src", "tests"]
}
```

```bash
# Pake config spesifik
npx tsc -p tsconfig.dev.json
```

## Troubleshooting Umum

### 1. Module not found

```bash
# Error: Cannot find module 'express' or its corresponding type declarations
npm install --save-dev @types/express

# Kalo library gak punya types — declare sendiri
```

### 2. Path alias gak work di runtime

```json
// tsconfig.json — tapi runtime error
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Butuh tambahan di runtime:

```bash
npm install --save-dev tsconfig-paths
npx ts-node -r tsconfig-paths/register src/index.ts
```

Atau pake bundler (webpack/vite) yang handle path resolution.

### 3. "Cannot use import statement outside a module"

```json
// Fix: set module ke ESM
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
// Dan di package.json:
{
  "type": "module"
}
```

## Latihan

1. **Init from zero** — `npm init`, install typescript, `tsc --init`. Set `rootDir: ./src`, `outDir: ./dist`. Bikin `src/index.ts` dengan console.log, compile, run.

2. **Strict mode fix** — aktifin `strict: true`. Coba kode yang error: null assignment ke string, implicit any, destructuring tanpa tipe. Fix setiap error.

3. **Module system** — bikin 3 file: `src/types/user.ts` (interface User), `src/utils/format.ts` (export function), `src/index.ts` (import & pake). Compile & run.

4. **Path alias** — set `baseUrl: "."` dan `paths: { "@/*": ["./src/*"] }`. Import pake `@/types/user`. Butuh `npm install --save-dev tsconfig-paths`.

5. **Scripts** — tambah scripts ke package.json: build, dev (tsx watch), typecheck (tsc --noEmit). Jalanin.

6. **Debug** — tambah `"sourceMap": true`. Compile. Jalanin `node --enable-source-maps dist/index.js`. Debug error di terminal langsung tunjuk ke file .ts.

7. **Declaration File** — buat file `.d.ts` untuk library JavaScript sederhana `math-utils.js` (functions: add, subtract, multiply, divide). Tulis type declaration lengkap.

8. **Global Types** — buat file `types/env.d.ts` yang extend `ProcessEnv` dengan properti: `DATABASE_URL`, `REDIS_URL`, `AWS_SECRET_KEY`. Demonstrasikan type checking di file .ts.

9. **Multiple tsconfig** — buat `tsconfig.json` (production) dan `tsconfig.dev.json` (development). Production: removeComments true, sourceMap false. Development: sourceMap true, strict false. Tambah script `build:dev` di package.json.

10. **Project References** — setup monorepo kecil dengan 3 package: `shared`, `server`, `client`. Shared punya interface User. Server import dari shared. Client juga import dari shared. Pake `composite: true` dan `tsc --build`.

11. **Strict Config** — cari kode JavaScript project lo atau project temen. Porting ke TypeScript dengan strict mode. Catat berapa banyak error yang muncul dan gimana cara fix-nya.

12. **Module Resolution** — bikin 2 file: satu pake `moduleResolution: "node"`, satu pake `"bundler"". Catat perbedaan behavior. Coba import file tanpa ekstensi `.js` di ESM mode — liat error yang muncul.
