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

## Latihan

1. **Init from zero** — `npm init`, install typescript, `tsc --init`. Set `rootDir: ./src`, `outDir: ./dist`. Bikin `src/index.ts` dengan console.log, compile, run.

2. **Strict mode fix** — aktifin `strict: true`. Coba kode yang error: null assignment ke string, implicit any, destructuring tanpa tipe. Fix setiap error.

3. **Module system** — bikin 3 file: `src/types/user.ts` (interface User), `src/utils/format.ts` (export function), `src/index.ts` (import & pake). Compile & run.

4. **Path alias** — set `baseUrl: "."` dan `paths: { "@/*": ["./src/*"] }`. Import pake `@/types/user`. Butuh `npm install --save-dev tsconfig-paths`.

5. **Scripts** — tambah scripts ke package.json: build, dev (tsx watch), typecheck (tsc --noEmit). Jalanin.

6. **Debug** — tambah `"sourceMap": true`. Compile. Jalanin `node --enable-source-maps dist/index.js`. Debug error di terminal langsung tunjuk ke file .ts.
