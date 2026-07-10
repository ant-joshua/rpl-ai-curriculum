# 📖 Glossary — Istilah Teknis RPL

> Istilah-istilah yang sering dipake dalam kurikulum ini, dijelasin bahasa Indonesia.
> 200+ istilah dari A sampai W.

## 📚 Daftar Isi Berdasarkan Topik

Istilah-istilah sudah dikelompokkan ke file-file berikut biar lebih gampang dipelajari:

| # | File Topik | Cakupan |
|---|-----------|---------|
| 🌐 | [01-web-terminology.md](01-web-terminology.md) | HTTP, API, REST, DNS, CDN, SSL, URL, hosting, domain, browser, client/server |
| 📜 | [02-javascript-terms.md](02-javascript-terms.md) | Variable, function, closure, promise, async/await, event loop, hoisting, scope, this, prototype |
| 🔷 | [03-typescript-terms.md](03-typescript-terms.md) | Type, interface, generic, enum, union, intersection, decorator, module |
| 🗄️ | [04-database-terms.md](04-database-terms.md) | SQL, NoSQL, index, join, transaction, migration, ORM, shard, replica |
| 🐳 | [05-devops-terms.md](05-devops-terms.md) | Docker, CI/CD, deploy, VPS, cloud, scaling, monitoring, logging |
| 🤖 | [06-ai-terms.md](06-ai-terms.md) | LLM, prompt, token, RAG, fine-tuning, embedding, agent, tool calling |
| ⚛️ | [07-framework-terms.md](07-framework-terms.md) | SPA, SSR, SSG, hydration, component, reactive, webpack, Vite |

Setiap file topik punya kode contoh (TypeScript/JavaScript) dan output biar lebih gampang dipahami. Kalau mau liat semua istilah dalam satu halaman (A-Z), lanjut scroll aja di bawah 👇

---

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

### Algorithm
Langkah-langkah logis buat nyelesain masalah. Contoh: binary search, bubble sort.

### Accessibility (a11y)
Bikin website bisa dipake semua orang, termasuk difabel (tunanetra pake screen reader, dll).

### Anchor
Elemen HTML `<a>` buat bikin link. Juga istilah di HTML untuk jangkar.

### Argument
Nilai yang dikirim ke function waktu dipanggil.

### Attribute
Property tambahan di elemen HTML. Contoh: `class`, `id`, `src`.

### AWS (Amazon Web Services)
Cloud provider paling gede. Nyediain server, database, AI, dll.

## B

### Backend
Bagian server yang handle logic, database, autentikasi. Ga keliatan langsung sama user.

### Big O Notation
Cara ngukur seberapa cepet/efisien suatu algoritma jalan.

### Boolean
Tipe data yang cuma punya dua nilai: `true` atau `false`.

### Buffer
Tempat nyimpen data sementara di memory. Biasanya dipake buat binary data (file, stream).

### Bug
Error di kode. Bikin program gak jalan sesuai harapan.

### Bundle
File hasil build yang ukurannya lebih kecil. HTML, CSS, JS digabung plus di-minify.

### Byte
Unit data digital. 1 byte = 8 bits. 1 KB = 1024 bytes.

### Breakpoint
Titik di kode di mana debugger bakal pause. Juga istilah di CSS responsive design.

### Branch
Cabang di Git. Bikin branch baru = kerja terpisah tanpa ganggu branch utama (main).

## C

### CI/CD (Continuous Integration / Continuous Deployment)
Otomatisasi: tiap kali push kode ke GitHub, otomatis di-test dan di-deploy.

### CRUD (Create, Read, Update, Delete)
Empat operasi dasar di database dan API.

### CSS (Cascading Style Sheets)
Bahasa buat ngatur tampilan website (warna, layout, font).

### Cache
Nyimpen data sementara biar akses lebih cepet. Browser cache, Redis cache, CPU cache.

### Callback
Function yang dikirim ke function lain, dipanggil setelah operasi selesai.

### Class
Cetak biru buat bikin object di OOP (Object-Oriented Programming).

### CLI (Command Line Interface)
Antarmuka berbasis teks di terminal. Lawannya: GUI (grafis).

### Closure
Function yang "mengingat" scope tempat dia dibuat, bahkan setelah outer function selesai.

### Component
Bagian UI yang reusable di React/Next.js. Bisa diatur props-nya.

### Container
Paket aplikasi + semua dependencies-nya. Pake Docker. "Works on my machine" solved.

### Concurrent
Beberapa task jalan "bersamaan" (tapi gak selalu paralel). Async non-blocking.

### Cookie
Data kecil yang disimpan browser. Dipake buat session, tracking, preferensi.

### CORS (Cross-Origin Resource Sharing)
Kebijakan security browser yang ngeblok request dari domain beda.

### Currying
Teknik fungsi yang nerima argument satu per satu, bukan semua sekaligus.

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

### Data Type
Jenis data: string, number, boolean, object, array, null, undefined.

### DDL (Data Definition Language)
SQL buat definisi struktur: CREATE, ALTER, DROP.

### DML (Data Manipulation Language)
SQL buat manipulasi data: SELECT, INSERT, UPDATE, DELETE.

### DTO (Data Transfer Object)
Object yang ngebawa data antar layer aplikasi. Biasanya di API response.

### Dependency
Library yang dipake project. Dicatet di package.json.

### Destructuring
Cara nge-extract nilai dari object/array ke variable terpisah.
```js
const { name, age } = user;
```

### Developer Experience (DX)
Seberapa enak pengalaman ngoding pake suatu tools/framework.

### DNS (Domain Name System)
Penerjemah nama domain (google.com) ke IP address (142.250.x.x).

### Dynamic Programming
Teknik nyelesain masalah dengan nge-break jadi sub-problem, nyimpen hasilnya (memoization).

## E

### Express.js
Framework Node.js buat bikin REST API dengan cepet.

### Edge Case
Input yang jarang tapi harus ditangani. Contoh: array kosong, user tanpa data.

### ECMAScript (ES)
Standarisasi JavaScript. ES6 = versi 2015 yang nambahin banyak fitur.

### Encryption
Proses ngubah data jadi kode rahasia biar gak bisa dibaca tanpa kunci.

### Endpoint
URL spesifik di API. Contoh: `GET /api/users`, `POST /api/login`.

### Environment Variable (.env)
Konfigurasi yang beda per lingkungan (dev, staging, production). Isinya API key, DB URL.

### ESLint
Tools buat ngecek kualitas kode JavaScript/TypeScript. Cari error + enforce style.

### Event
Aksi yang terjadi di browser: klik, scroll, keydown, submit.

### Event Loop
Mekanisme JavaScript yang nge-handle async operations. Single-threaded tapi non-blocking.

### Export/Import
Cara bagi kode antar module di JavaScript/TypeScript.

## F

### Fetch API
Fungsi JavaScript buat ngambil data dari internet (API calls).

### Frontend
Bagian website yang dilihat dan diinteraksiin sama user (HTML/CSS/JS).

### Function
Blok kode yang bisa dipake berulang-ulang. Input -> proses -> output.

### Framework
Tools buat bikin aplikasi lebih cepet. Nyediain struktur + fitur bawaan.

### Formatter
Tools yang ngerapihin kode otomatis. Prettier = yang paling populer.

### Functional Programming
Paradigma coding yang fokus ke function murni (pure function), hindari side effect.

## G

### Git
Version control system. Nyimpen history perubahan kode. Bisa balik kapan aja.

### GitHub
Platform online buat nyimpen repo Git. Juga buat portfolio.

### Gateway (API Gateway)
Titik masuk tunggal buat semua API request. Handle auth, rate limit, routing.

### Generator
Function yang bisa di-pause dan di-resume. Pake `function*` dan `yield`.

### Generic
Parameter type di TypeScript. Bikin function/class type-safe tanpa specify type spesifik.

### GraphQL
Alternatif REST API. Client bisa milih data apa aja yang mau diambil. Dikembangin Meta.

### Guard Clause
Early return di awal function kalau kondisi gak terpenuhi. Ngurangin if bersarang.

### GUI (Graphical User Interface)
Antarmuka grafis. Lawannya: CLI.

## H

### Hash Table / Map
Struktur data yang nyimpen data pake key-value pair. Akses O(1) — cepet banget.

### Hoisting
JavaScript "ngangkat" deklarasi variable/function ke atas scope. `var` → undefined, `let`/`const` → TDZ.

### HTTP (Hypertext Transfer Protocol)
Protokol komunikasi antara browser dan server. Dasar dari web.

### HTTPS
HTTP + SSL/TLS. Data dienkripsi antara browser dan server.

### Hook (React)
Function bawaan React: useState, useEffect, useRef, useMemo, useCallback.

### HOC (Higher-Order Component)
Component yang nerima component lain dan return component baru. Pattern React.

## I

### Interface (TypeScript)
Cara mendefinisikan bentuk suatu object di TypeScript.
```ts
interface User { name: string; age: number; }
```

### Immutable
Data yang gak bisa diubah setelah dibuat. Kalau "diubah", sebenernya dibuat baru.

### Index
Struktur data di database yang mempercepat pencarian. Kayak indeks di buku.

### Inheritance
Konsep OOP: class anak bisa pake property/method dari class induk.

### Input Validation
Proses ngecek apakah input user valid sebelum diproses.

### Instance
Object hasil dari class. `const user = new User()` — user adalah instance dari class User.

### Iteration / Iterate
Proses ngelompok data satu per satu. Loop: for, forEach, map, filter.

### IDE (Integrated Development Environment)
Aplikasi buat nulis kode. VS Code, WebStorm, IntelliJ.

### IIFE (Immediately Invoked Function Expression)
Function yang langsung dijalanin pas dibuat.
```js
(function() { console.log("run"); })();
```

## J

### JavaScript
Bahasa pemrograman utama buat web. Jalan di browser dan server (Node.js).

### JSON (JavaScript Object Notation)
Format data yang paling umum dipake di API. Mirip object JS.

### JWT (JSON Web Token)
Token buat autentikasi. Isinya header, payload (data user), signature.

### JOIN (SQL)
Nggabungin tabel berdasarkan relasi. INNER JOIN, LEFT JOIN, RIGHT JOIN.

## K

### Key-Value Store
Database yang nyimpen data sebagai pasangan key-value. Contoh: Redis.

### Keyword
Kata kunci di bahasa pemrograman yang punya arti khusus. `if`, `for`, `return`, `class`.

### Kubernetes (K8s)
Platform buat nge-manage container secara otomatis. Scaling, load balancing, self-healing.

## L

### LeetCode
Platform latihan coding interview. Problem dari easy sampai hard.

### Loop
Perulangan: ngejalanin kode berulang kali. `for`, `while`, `forEach`.

### Library
Kumpulan function siap pake. Lebih kecil dari framework.

### Linter
Tools buat ngecek kualitas kode otomatis. ESLint, Biome.

### LINQ (Language Integrated Query)
Fitur C# buat query data pake syntax mirip SQL, langsung di kode.

### Load Balancer
Mendistribusikan traffic ke beberapa server biar gak overload.

### Lazy Loading
Teknik loading cuma pas dibutuhin. Biar website makin cepet.

### Local Storage
Penyimpanan di browser yang gak ilang meski tab ditutup. Kapasitas ~5MB.

## M

### Mastra
TypeScript AI framework buat bikin AI agents dengan tools, memory, RAG.

### Middleware
Function di Express yang jalan di antara request dan response. Buat auth, logging, dll.

### Microservices
Arsitektur di mana aplikasi dipecah jadi service-service kecil yang jalan independen.

### Migration
Perubahan struktur database. Biasanya pake file migration biar ke-track Git.

### Module
File kode yang di-export/import. Bikin kode terorganisir.

### Monorepo
Satu repository yang nyimpen beberapa project (frontend, backend, shared library).

### MVC (Model View Controller)
Pattern arsitektur: Model (data), View (UI), Controller (logic).

### Mutation
Perubahan data di state management (Redux, Zustand). Immutable = gak boleh mutasi langsung.

## N

### Node.js
Runtime JavaScript di server. Jalanin JS di luar browser.

### npm (Node Package Manager)
Tempat download library JavaScript. `npm install express`.

### Normalization
Proses merapikan struktur database biar gak redundant. 1NF, 2NF, 3NF.

### Null
Nilai yang artinya "gak ada" / kosong. Bedanya dengan `undefined`: null sengaja dikasih, undefined belum diisi.

### Namespace
Cara ngelompokin kode biar gak bentrok nama. Di TypeScript: module.

### Nginx
Web server + reverse proxy. Sering dipake di production buat serve static files + SSL.

### Nullable
Type yang bisa null. Di TypeScript: `string | null`.

## O

### Object
Tipe data yang nyimpen pasangan key-value.

### Ollama
Tools buat jalanin AI model lokal (Mistral, Llama) di laptop sendiri.

### ORM (Object Relational Mapping)
Library yang nge-map database table ke object di kode. Prisma, Sequelize, TypeORM.

### OOP (Object-Oriented Programming)
Paradigma coding pake object. 4 pilar: Encapsulation, Inheritance, Polymorphism, Abstraction.

### Open Source
Kode yang bisa dilihat, dipake, dimodifikasi sama siapa aja. Contoh: React, VS Code, Linux.

### Overload
Function dengan nama sama tapi parameter beda. Di TypeScript: function overloading.

### Override
Nimpa method dari parent class di child class.

## P

### PostgreSQL
Database SQL open source yang paling canggih.

### Promise
Object yang nunjukin operasi asynchronous bakal selesai (atau gagal) di masa depan.

### Package
Library yang di-publish di npm.

### Parameter
Variable yang diterima function waktu didefinisikan.

### Polyfill
Kode yang nambahin fitur baru ke browser lama. Contoh: `core-js`, `@babel/polyfill`.

### Preprocessor
Tools yang "ngubah" kode jadi CSS/JS. Contoh: SASS (CSS), TypeScript (JS).

### Primitive
Tipe data sederhana: string, number, boolean, null, undefined, symbol, bigint.

### Props
Data yang dikirim dari parent component ke child component di React.

### Pseudocode
Menulis logika algoritma pake bahasa manusia, bukan syntax programming.

### Pure Function
Function yang: (1) return sama untuk input sama, (2) gak punya side effect.

## Q

### Query
Perintah buat ambil/modifikasi data di database. SQL query: `SELECT * FROM users`.

### Queue
Struktur data FIFO (First In, First Out). Kayak antrian kasir.

### Query Builder
Library buat nulis SQL query pake method chain. Contoh: Knex.js.

## R

### RAG (Retrieval Augmented Generation)
Teknik biar AI bisa jawab berdasarkan dokumen yang dikasih, bukan cuma dari training data.

### REST API
API yang pake HTTP method: GET (baca), POST (buat), PUT (update), DELETE (hapus).

### Route
URL endpoint di API. Contoh: `/api/users`, `/api/products`.

### Recursion
Function yang manggil dirinya sendiri. Butuh base case biar gak infinite loop.

### Refactor
Ngubah kode tanpa ngubah behavior. Biar lebih bersih, efisien, maintainable.

### Regular Expression (Regex)
Pattern buat nyocokin teks. Contoh: `^\w+@\w+\.\w+$` buat validasi email.

### Repository
Tempat nyimpen kode. Git repository = folder project + history Git.

### Re-render
Proses React nge-render ulang component karena state/props berubah.

### Redis
In-memory database buat caching, session, pub/sub. Cepet banget.

### Responsive Design
Desain website yang otomatis menyesuaikan ukuran layar (HP, tablet, desktop).

### Runtime
Lingkungan jalanin kode. Node.js = JavaScript runtime.

## S

### SQL (Structured Query Language)
Bahasa buat ngomong sama database relational.
```sql
SELECT * FROM users WHERE age > 17;
```

### Stack (Data Structure)
LIFO — Last In, First Out. Kayak tumpukan piring.

### State
Data yang berubah selama aplikasi jalan.

### Schema
Struktur database: table apa aja, kolom apa, tipe data, relasi.

### Scope
Daerah akses suatu variable. Global, function, block scope.

### Semantic HTML
Pake tag HTML sesuai makna, bukan cuma tampilan. `<header>`, `<nav>`, `<main>`, `<footer>`.

### Server
Komputer yang jalanin aplikasi backend. Nerima request, kirim response.

### Session
Data sementara yang nyimpen state user selama interaksi (login, cart). Bisa di memory atau database.

### Set
Struktur data yang cuma nyimpen nilai unik (gak ada duplikat).

### Side Effect
Operasi yang ngubah state di luar function. Contoh: nulis ke database, console.log.

### Singleton
Pattern di mana cuma ada 1 instance dari sebuah class di seluruh aplikasi.

### SPA (Single Page Application)
Aplikasi web yang gak perlu reload halaman. React, Vue, Angular.

### Spread Operator
`...` buat nyebarin nilai array/object.
```js
const newArr = [...oldArr, newItem];
```

### SQL Injection
Serangan dengan nyisipin query SQL jahat lewat input user.

### SSL/TLS
Protokol keamanan buat enkripsi data antara browser dan server. HTTPS pake ini.

### Static Typing
Tipe data didefinisikan di kode (compile time). TypeScript, Go, Java.

### Streaming
Data dikirim sedikit demi sedikit (chunks), bukan semua sekaligus.

### String
Tipe data teks. Diapit kutip: `"hello"`, `'hello'`, `` `hello` ``.

### Subquery
Query di dalem query SQL. SELECT di dalem SELECT.

## T

### TypeScript
JavaScript + type system. Error kelihatan pas ngetik, bukan pas dijalanin.

### Tree Shaking
Fitur bundler yang ngehapus kode yang gak dipake biar file size lebih kecil.

### Tailwind CSS
Framework CSS utility-first. Nulis styling pake class di HTML, bukan file CSS terpisah.

### Third-party
Library/layanan dari pihak ketiga. Contoh: OpenAI API, Google Maps API.

### Thread
Unit eksekusi terkecil di CPU. JavaScript single-threaded (tapi pake event loop).

### Token
String unik buat autentikasi. JWT token, CSRF token, session token.

### Try/Catch
Blok kode buat nangani error. `try { ... } catch (err) { ... }`.

### Tuple
Array dengan jumlah element tetap, tiap element punya tipe tertentu. Di TypeScript: `[string, number]`.

### Type Assertion
Ngasih tau TypeScript tipe data yang lebih spesifik. Pake `as` keyword.

### Type Guard
Function/expression yang ngecek tipe data di runtime. `typeof`, `instanceof`, custom type guard.

### Type Inference
TypeScript otomatis nebak tipe data tanpa harus ditulis eksplisit.

## U

### URL (Uniform Resource Locator)
Alamat website. Contoh: `https://github.com/nama/repo`.

### UNIX
Sistem operasi dasar. Linux = turunan UNIX. Terminal commands pake standar UNIX.

### useState
React hook buat nyimpen state di functional component.

### useEffect
React hook buat side effects: fetch data, subscription, DOM manipulation.

### UUID (Universally Unique Identifier)
ID unik global. Contoh: `550e8400-e29b-41d4-a716-446655440000`.

### Unit Test
Test buat ngecek unit (function/class) terkecil di kode.

### Union Type
Tipe data yang bisa lebih dari satu jenis. Di TypeScript: `string | number`.

### UTF-8
Standard encoding karakter. Support semua bahasa (termasuk emoji 😊).

## V

### Variable
Tempat nyimpen nilai di kode. `let nama = "Budi"`.

### Vercel
Platform deploy frontend gratis. Connect dari GitHub.

### Virtual DOM
Representasi ringan dari DOM di memory. React pake ini buat optimasi rendering.

### Vite
Build tool modern. Cepet banget dibanding Webpack.

### Versioning
Nomer versi software: `major.minor.patch` (SemVer). Contoh: `v2.1.3`.

### View (SQL)
Query yang disimpen kayak table virtual. Buat laporan / akses data terbatas.

### Vue.js
Frontend framework alternatif React. Lebih ringan, learning curve lebih landai.

## W

### Workflow (Mastra)
Multi-step agent pipeline. Agent jalanin langkah demi langkah.

### WebSocket
Protokol komunikasi dua arah real-time. Chat, notifikasi, live update.

### Webpack
Module bundler. Gabungin semua JS, CSS, gambar jadi file bundle.

### Webhook
Cara server ngasih tau server lain kalo ada event. "Panggil URL ini kalau ada update."

### Wrapper
Function/class yang "membungkus" function/class lain buat nambahin fungsionalitas.

### White-box Testing
Test yang tau detail implementasi internal kode.

### Wildcard
Karakter `*` yang nyocokin apapun. Di Git: `*.log` = semua file .log.

---

## Istilah Programming Umum

| Istilah | Arti |
|---------|------|
| Array | Kumpulan data terurut |
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
| Argument | Input ke function |
| Async | Operasi yang gak blocking |
| Boolean | true / false |
| Clone | Copy repository |
| Commit | Simpan perubahan di Git |
| Config | Pengaturan / konfigurasi |
| Constants | Nilai tetap yang gak berubah |
| Constructor | Function khusus yang dipanggil pas bikin object |
| Context | Data global di React (React Context) |
| Data binding | Nyambungin data ke UI |
| Default parameter | Nilai default kalo argument gak dikirim |
| Export | Ngirim function/variable ke module lain |
| Fork | Copy repo orang lain ke akun sendiri |
| Fragment | `<></>` — wrapper tanpa DOM element |
| Global | Bisa diakses dari mana aja |
| Hosting | Tempat nyimpen file website |
| Index | Posisi di array (mulai dari 0) |
| Infinity | Nilai tak terhingga di JS |
| Input | Data masuk ke program |
| Instance | Object hasil dari class |
| Integer | Bilangan bulat |
| Integration test | Test gabungan beberapa komponen |
| Interface | Kontrak type di TypeScript |
| Key | Property unik di React list |
| Late binding | Penentuan method dipanggil pas runtime |
| Local | Cuma diakses di scope tertentu |
| Log | Catatan (console.log, error log) |
| Loop | Perulangan |
| Memory leak | Memory yang gak ke-free meski gak dipake |
| Method | Function yang ada di object/class |
| Mixin | Kumpulan method yang bisa dipake class lain |
| Mock | Object palsu buat testing |
| Module | File JS/TS yang di-export-import |
| Namespace | Cara ngelompokin kode |
| Nested | Bersarang |
| Null | Nilai kosong (sengaja) |
| Number | Tipe angka di JS |
| Object | Kumpulan key-value |
| Operator | Simbol operasi: +, -, *, /, === |
| Optimasi | Bikin kode lebih cepet/efisien |
| Override | Nimpa method parent |
| Package | Kumpulan module |
| Pagination | Bagi data jadi halaman |
| Parsing | Ngubah string jadi data terstruktur |
| Path | Alamat file/direktori |
| Payload | Data yang dikirim di request/response |
| Pipeline | Rangkaian langkah otomatis |
| Placeholder | Teks sementara di input |
| Plugin | Tambahan fitur |
| Pointer | Reference ke memory address |
| Polymorphism | Banyak bentuk — method beda untuk class beda |
| Port | Nomor gerbang koneksi (3000, 8080, 5432) |
| Production | Lingkungan beneran dipake user |
| Property | Nilai di dalam object |
| Protocol | Aturan komunikasi (HTTP, TCP, WebSocket) |
| Provider | Penyedia layanan (cloud, AI, database) |
| Proxy | Perantara antara client dan server |
| Public | Bisa diakses dari mana aja |
| Push | Ngirim commit ke GitHub |
| Query | Pertanyaan ke database |
| Queue | Antrian FIFO |
| Race condition | 2 proses berebut data yang sama |
| Readability | Seberapa gampang kode dibaca |
| Recursion | Function panggil diri sendiri |
| Reducer | Function yang ngubah state (Redux) |
| Regex | Pattern buat nyari teks |
| Release | Versi yang dirilis ke publik |
| Render | Proses ngubah komponen jadi HTML |
| Repository | Tempat kode (Git repo) |
| Request | Minta data ke server |
| Resolve | Promise berhasil |
| Response | Jawaban dari server |
| REST | Arsitektur API pake HTTP methods |
| Retry | Coba ulang kalo gagal |
| Return | Nilai yang dikembalikan function |
| Root | Direktori utama |
| Route | URL endpoint |
| Runtime | Saat program dijalanin |
| Sandbox | Lingkungan terisolasi buat testing |
| Sanitize | Bersihin input berbahaya |
| Scaffold | Generator struktur project |
| Scope | Area akses variable |
| Script | File yang dijalanin |
| Scroll | Gulir halaman |
| SDK | Library buat pake API tertentu |
| Search | Cari data |
| Security | Keamanan aplikasi |
| Seed | Data awal buat testing |
| Segment | Bagian dari kode/analytics |
| Select | Pilih data (SQL) |
| Self-hosted | Jalanin sendiri di server sendiri |
| Semantic | Berdasarkan makna |
| Serialize | Ubah object jadi string (JSON) |
| Server | Komputer yang ngeladenin request |
| Session | Data sementara user |
| Setter | Method buat ngubah nilai property |
| Shadow DOM | DOM terisolasi di Web Components |
| Shell | Antarmuka terminal |
| Short-circuit | Evaluasi AND/OR yang berhenti duluan |
| Shorthand | Cara singkat nulis kode |
| Side effect | Operasi di luar function |
| Signature | Definisi function (nama + parameter) |
| Slice | Potongan array |
| Slug | URL yang gampang dibaca (`/my-article`) |
| Snapshot | Rekaman kondisi tertentu |
| Snippet | Potongan kode kecil |
| Sort | Urutin data |
| Source map | File yang nge-map kode build ke source asli |
| Spam | Pesan gak penting |
| SPA | Single Page Application |
| Spread | `...` operator nyebarin nilai |
| SQL injection | Serangan lewat input SQL |
| Stable | Versi yang stabil (gak beta) |
| Stage | Area sebelum commit (git add) |
| Standalone | Bisa jalan sendiri |
| Stateless | Gak nyimpen state |
| Statement | Satu baris perintah |
| Static | Gak berubah (static file, static typing) |
| Status code | Kode response HTTP (200, 404, 500) |
| Store | Tempat state (Redux store) |
| Stream | Data yang dikirim bertahap |
| Strict mode | Mode ketat TypeScript / React |
| String | Tipe teks |
| Structure | Struktur kode/folder |
| Style | Tampilan (CSS) |
| Subclass | Class anak |
| Subscriber | Yang nerima event/notification |
| Sugar (syntactic) | Syntax yang bikin kode lebih enak dibaca |
| Suite | Kumpulan test |
| Support | Dukungan (browser support, technical support) |
| Suspend | Tunda eksekusi |
| Sync | Berurutan (blocking) |
| Syntax | Aturan nulis kode |
| System | Gabungan komponen yang kerja sama |
| Table | Struktur data di database (baris + kolom) |
| Tag | Elemen HTML: `<div>`, `<p>`, `<h1>` |
| Target | Tujuan (target browser, target directory) |
| Task | Tugas |
| TCP | Protokol koneksi yang reliable |
| Template | Kerangka kode |
| Terminal | Command line interface |
| Ternary | Operator 3 nilai: `condition ? a : b` |
| Test case | Skenario test spesifik |
| Third-party | Pihak ketiga |
| Thread | Unit eksekusi |
| Throttle | Batasi frekuensi eksekusi |
| Throw | Ngirim error: `throw new Error()` |
| Ticket | Issue / task |
| Timeout | Waktu maksimal nunggu |
| Timezone | Zona waktu |
| Title | Judul |
| Toggle | Switch on/off |
| Token | String unik buat auth |
| Tooltip | Info yg muncul pas hover |
| Top-level | Level teratas |
| Trace | Jejak eksekusi |
| Track | Lacak (tracking event) |
| Traffic | Data yang lewat (network traffic) |
| Transaction | Kumpulan operasi database yang atomic |
| Transform | Ubah bentuk data |
| Trigger | Pemicu |
| Truncate | Potong / kosongin table (SQL) |
| Trust | Kepercayaan (trusted source) |
| Truthy | Nilai yang dianggap true di boolean context |
| Try | Coba jalanin kode (try/catch) |
| Tuple | Array dengan type tetap per posisi |
| Tutorial | Panduan belajar |
| Two-way binding | Data binding dua arah (Vue v-model) |
| Type guard | Cek type di runtime |
| Type inference | TypeScript nebak type otomatis |
| Typo | Salah ketik |
| UAT (User Acceptance Testing) | Test sama user beneran |
| UI (User Interface) | Tampilan yang dilihat user |
| UID (User ID) | ID unik user |
| UML (Unified Modeling Language) | Diagram standar buat desain software |
| Uncaught | Error yang gak ditangani |
| Undefined | Nilai yang belum diisi |
| Unicode | Standard karakter universal |
| Union | Gabungan type (TypeScript) |
| Unique | Unik, gak ada duplikat |
| Unit test | Test terkecil (function/class) |
| Unix | Sistem operasi |
| Unmount | Hapus component dari DOM |
| Unshift | Tambah element di awal array |
| Update | Perbarui |
| Upload | Kirim file ke server |
| URI (Uniform Resource Identifier) | Identifikasi resource |
| URL | Alamat web |
| URL encoding | Ngubah karakter spesial di URL |
| Usage | Penggunaan |
| Use case | Skenario pemakaian |
| User | Pengguna |
| User agent | Browser / client identifier |
| UTF-8 | Encoding karakter universal |
| Utility | Fungsi bantuan |
| UUID | ID unik universal |
| Valid | Sah / benar |
| Validation | Proses ngecek validitas |
| Value | Nilai |
| Variable | Tempat nyimpen data |
| Vendor | Penyedia library/alat |
| Verb | HTTP method (GET, POST, PUT, DELETE) |
| Verify | Verifikasi |
| Version | Versi |
| View | Tampilan / SQL view |
| Virtual | Maya / gak fisik |
| Visibility | Visibilitas (CSS visibility) |
| Void | Tidak return nilai |
| Volume | Penyimpanan (Docker volume) |
| Vulnerability | Celah keamanan |

---

Selamat belajar! 📖
