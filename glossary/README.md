# 📖 Glossary — Istilah Teknis RPL

> Istilah-istilah yang sering dipake dalam kurikulum ini, dijelasin bahasa Indonesia.

## A

### API (Application Programming Interface)
Jembatan antara dua aplikasi. Kayak pelayan restoran: lo pesan (request), dia antar (response).

### Array
Tipe data yang nyimpen banyak nilai dalam satu variable, diurutkan pake index.
```ts
const fruits = ["Apel", "Mangga", "Jeruk"];
fruits[0]; // "Apel"
```

### Async/Await
Cara nulis kode asynchronous yang keliatannya kayak synchronous. Pake `await` buat nunggu promise selesai.

## B

### Backend
Bagian server yang handle logic, database, autentikasi. Ga keliatan langsung sama user.

### Big O Notation
Cara ngukur seberapa cepet/efisien suatu algoritma jalan.

### Boolean
Tipe data yang cuma punya dua nilai: `true` atau `false`.

## C

### CI/CD (Continuous Integration / Continuous Deployment)
Otomatisasi: tiap kali push kode ke GitHub, otomatis di-test dan di-deploy.

### CRUD (Create, Read, Update, Delete)
Empat operasi dasar di database dan API.

### CSS (Cascading Style Sheets)
Bahasa buat ngatur tampilan website (warna, layout, font).

## D

### Database
Tempat nyimpen data terstruktur. Kayak Excel tapi lebih canggih.

### Debugging
Proses nyari dan ngilangin bug/error di kode.

### Deployment
Proses naro aplikasi di server internet biar bisa diakses orang lain.

### DOM (Document Object Model)
Representasi HTML di JavaScript. Yang bikin web bisa interaktif.

### Docker
Tools buat nge-pack aplikasi + dependencies jadi satu container. "Works on my machine" solved.

## E

### Express.js
Framework Node.js buat bikin REST API dengan cepet.

## F

### Fetch API
Fungsi JavaScript buat ngambil data dari internet (API calls).

### Frontend
Bagian website yang dilihat dan diinteraksiin sama user (HTML/CSS/JS).

### Function
Blok kode yang bisa dipake berulang-ulang. Input -> proses -> output.

## G

### Git
Version control system. Nyimpen history perubahan kode. Bisa balik kapan aja.

### GitHub
Platform online buat nyimpen repo Git. Juga buat portfolio.

## H

### Hash Table / Map
Struktur data yang nyimpen data pake key-value pair. Akses O(1) — cepet banget.

## I

### Interface (TypeScript)
Cara mendefinisikan bentuk suatu object di TypeScript.
```ts
interface User { name: string; age: number; }
```

## J

### JavaScript
Bahasa pemrograman utama buat web. Jalan di browser dan server (Node.js).

### JSON (JavaScript Object Notation)
Format data yang paling umum dipake di API. Mirip object JS.

## L

### LeetCode
Platform latihan coding interview. Problem dari easy sampai hard.

### Loop
Perulangan: ngejalanin kode berulang kali. `for`, `while`, `forEach`.

## M

### Mastra
TypeScript AI framework buat bikin AI agents dengan tools, memory, RAG.

### Middleware
Function di Express yang jalan di antara request dan response. Buat auth, logging, dll.

## N

### Node.js
Runtime JavaScript di server. Jalanin JS di luar browser.

### npm (Node Package Manager)
Tempat download library JavaScript. `npm install express`.

## O

### Object
Tipe data yang nyimpen pasangan key-value.

### Ollama
Tools buat jalanin AI model lokal (Mistral, Llama) di laptop sendiri.

## P

### PostgreSQL
Database SQL open source yang paling canggih.

### Promise
Object yang nunjukin operasi asynchronous bakal selesai (atau gagal) di masa depan.

## R

### RAG (Retrieval Augmented Generation)
Teknik biar AI bisa jawab berdasarkan dokumen yang dikasih, bukan cuma dari training data.

### REST API
API yang pake HTTP method: GET (baca), POST (buat), PUT (update), DELETE (hapus).

### Route
URL endpoint di API. Contoh: `/api/users`, `/api/products`.

## S

### SQL (Structured Query Language)
Bahasa buat ngomong sama database relational.
```sql
SELECT * FROM users WHERE age > 17;
```

### Stack (Data Structure)
LIFO — Last In, First Out. Kayak tumpukan piring.

## T

### TypeScript
JavaScript + type system. Error kelihatan pas ngetik, bukan pas dijalanin.

## V

### Variable
Tempat nyimpen nilai di kode. `let nama = "Budi"`.

### Vercel
Platform deploy frontend gratis. Connect dari GitHub.

## W

### Workflow (Mastra)
Multi-step agent pipeline. Agent jalanin langkah demi langkah.

---

## Istilah Programming Umum

| Istilah | Arti |
|---------|------|
| Argument | Nilai yang dikirim ke function |
| Bug | Error di kode |
| Callback | Function yang dikirim ke function lain |
| Class | Cetak biru buat bikin object (OOP) |
| Console | Terminal buat debug |
| Dependency | Library yang dipake project |
| Edge case | Input yang jarang tapi harus ditangani |
| Error handling | Cara nanganin error biar ga crash |
| Framework | Tools buat bikin aplikasi lebih cepet |
| Immutable | Ga bisa diubah |
| Library | Kumpulan function siap pake |
| Migration | Perubahan struktur database |
| Module | File kode yang di-export/import |
| Package | Library yang di-publish di npm |
| Parameter | Variable yang diterima function |
| Refactor | Ngubah kode tanpa ngubah behavior |
| Runtime | Lingkungan jalanin kode |
| Schema | Struktur database |
| Scope | Daerah akses suatu variable |
| State | Data yang berubah selama aplikasi jalan |
| Syntax | Aturan nulis kode |
| Type | Jenis data (string, number, boolean) |
