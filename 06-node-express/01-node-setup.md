# 6.1 Node.js Setup & Project Structure

## Apa itu Node.js?

**Node.js** — JavaScript runtime di sisi server. Sebelum Node.js, JavaScript cuma jalan di browser. Sekarang bisa jalan di server, terminal, bahkan IoT devices.

```
Browser          Server
┌─────────┐      ┌──────────────┐
│   JS    │      │  Node.js     │
│ V8 Engine│      │  V8 Engine   │
│ DOM API │      │  fs, http,   │
│ Window  │      │  path, os    │
└─────────┘      └──────────────┘
     │                  │
  Frontend          Backend
```

### Kenapa Node.js?

| Kelebihan | Penjelasan |
|-----------|-----------|
| **Non-blocking I/O** | Bisa handle ribuan koneksi tanpa nunggu satu selesai |
| **NPM** | Package manager terbesar — 2 juta+ package |
| **JavaScript everywhere** | Frontend & backend pake bahasa sama |
| **Ekosistem Express** | Framework minimalis, paling populer |
| **TypeScript support** | Type safety buat server-side code |

---

## Instalasi Node.js & npm

Cek versi Node.js dan npm di terminal:

```bash
node --version
# Contoh output: v20.11.0

npm --version
# Contoh output: 10.5.0
```

> **Catatan:** Gunakan LTS version (genap, seperti 18.x atau 20.x) untuk production. Hindari odd release (19, 21) yang unstable.

---

## `npm init` — Bikin Project Baru

```bash
mkdir todo-api
cd todo-api
npm init -y
```

File `package.json` terbuat:

```json
{
  "name": "todo-api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### package.json — Struktur

| Field | Fungsi |
|-------|--------|
| `name` | Nama project (lowercase, tanpa spasi) |
| `version` | SemVer — `major.minor.patch` |
| `description` | Deskripsi singkat |
| `main` | Entry point file |
| `scripts` | Perintah yang bisa dijalanin pake `npm run` |
| `dependencies` | Package untuk production |
| `devDependencies` | Package hanya untuk development |
| `type` | `"module"` kalau pake ES Modules (`import/export`) |

### Install Dependensi

```bash
# Production dependencies
npm install express dotenv

# Dev dependencies
npm install -D typescript @types/express @types/node ts-node nodemon
```

Hasil — `package.json` jadi:

```json
{
  "name": "todo-api",
  "version": "1.0.0",
  "description": "Todo REST API",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "nodemon": "^3.0.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

---

## TypeScript Setup — `tsconfig.json`

Generate file konfigurasi:

```bash
npx tsc --init
```

Edit `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

| Opsi | Fungsi |
|------|--------|
| `target` | Versi JS output — `ES2020` modern |
| `module` | Module system — `commonjs` buat Node.js |
| `outDir` | Folder hasil compile |
| `rootDir` | Folder source code |
| `strict` | Aktifin semua type checking strict |
| `esModuleInterop` | Biarin `import` dari CommonJS module |

---

## Nodemon — Auto Restart Saat Development

**Nodemon** — pantau perubahan file, restart otomatis server.

Install: `npm install -D nodemon`

Jalankan:

```bash
npx nodemon src/index.ts
```

Atau lewat npm script (udah ditambahin di `package.json`):

```bash
npm run dev
```

### Cara Kerja Nodemon

```
[Edit file] → [Nodemon detect change] → [Kill process] → [Restart] → [Log: restart due to changes...]
```

Tanpa nodemon — setiap ganti code harus `Ctrl+C` terus `node ...` lagi. Nodemon otomatis!

---

## Project Structure — Best Practices

```
todo-api/
├── src/
│   ├── index.ts              # Entry point — setup server
│   ├── routes/               # Route handlers
│   │   ├── todo.routes.ts
│   │   └── user.routes.ts
│   ├── controllers/          # Business logic
│   │   ├── todo.controller.ts
│   │   └── user.controller.ts
│   ├── models/               # Type definitions
│   │   ├── todo.model.ts
│   │   └── user.model.ts
│   ├── middleware/            # Express middleware
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   ├── database/             # DB config & queries
│   │   └── pool.ts
│   └── validators/           # Input validation
│       └── todo.validator.ts
├── dist/                     # Compiled JS (auto)
├── .env                      # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Kenapa Harus Terstruktur?

| Tanpa Struktur | Dengan Struktur |
|----------------|-----------------|
| Semua di 1 file | Terpisah per tanggung jawab |
| Susah dicari | Cepet nemuin file |
| Merge conflict gampang | Tim kerja parallel |
| Testing susah | Unit testing per file |
| Scaling gak mungkin | Scale dengan tambah file |

### File Entry Point Minimal

`src/index.ts`:

```typescript
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Todo API running 🚀' });
});

app.listen(PORT, () => {
  console.log(`Server nyala di http://localhost:${PORT}`);
});
```

### .gitignore

```
node_modules/
dist/
.env
*.log
```

### .env

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
NODE_ENV=development
```

---

## Scripts di package.json

| Script | Command | Kegunaan |
|--------|---------|----------|
| `npm run dev` | `nodemon src/index.ts` | Development — auto restart |
| `npm run build` | `tsc` | Compile TypeScript ke JS |
| `npm start` | `node dist/index.js` | Production — jalanin JS hasil build |
| `npm test` | `jest` | Run test |

---

## Latihan

**Latihan 1: Init Project**

1. Buat folder `contact-api`
2. `npm init -y`
3. Install: `express`, `dotenv`, `typescript`, `@types/express`, `@types/node`, `ts-node`, `nodemon`
4. Setup `tsconfig.json` dengan `outDir: "./dist"`, `rootDir: "./src"`
5. Buat `src/index.ts` — Express app minimal dengan GET `/` return `{ message: "Contact API" }`
6. Tambah script `dev`, `build`, dan `start` di package.json
7. Jalankan `npm run dev` dan akses `http://localhost:3000`

**Latihan 2: Struktur Folder**

Buat struktur folder untuk project `e-commerce-api`:

```
e-commerce-api/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── product.routes.ts
│   │   └── order.routes.ts
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── database/
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

Isi masing-masing file dengan komentar (belum perlu kode real — cuma planning).

**Latihan 3: .gitignore & .env**

Buat file `.gitignore` dan `.env` yang tepat untuk project Express + TypeScript + PostgreSQL.

**Latihan 4: NPM Script**

Tambah script berikut ke `package.json`:

- `"dev"` — jalanin `nodemon` dengan file `src/index.ts`
- `"build"` — compile TypeScript (`tsc`)
- `"start"` — jalanin hasil compile dari `dist/index.js`
- `"clean"` — hapus folder `dist`

Cek: setelah `npm run build`, folder `dist/` harus muncul dengan file `.js` hasil compile.
