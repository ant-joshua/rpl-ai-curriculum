---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🏆 LKS Web Technology — Competition Preparation"
footer: "Sesi 01: Lks Mapping"
---

<!-- _class: title -->
# 📍 Sesi 01 — LKS Mapping & Gap Analysis

> **Durasi:** 120 menit  
> **Tujuan:** Memahami standar LKS Web Technology dan memetakan kompetensi yang sudah dikuasai vs yang perlu diperkuat

---

## 1. Standar Kompetensi LKS Web Technology

LKS Web Technology (berdasarkan WorldSkills Standard) terbagi atas 4 area utama:

### 🎨 Web Design (25%)
| Sub-kompetensi | Detail |
|----------------|--------|
| Responsive Design | Mobile-first, breakpoints, fluid layout |
| CSS Architecture | Flexbox, Grid, custom properties, animations |
| UI Consistency | Color system, typography, spacing, component design |
| Accessibility | ARIA labels, semantic HTML, keyboard navigation, contrast |
| Cross-browser | Vendor prefixes, fallbacks, progressive enhancement |

### 💻 Web Programming (35%)
| Sub-kompetensi | Detail |
|----------------|--------|
| Frontend Logic | DOM manipulation, event handling, async JS |
| Backend Logic | Server-side scripting, middleware, routing |
| API Integration | RESTful endpoints, JSON handling, fetch/AJAX |
| Form Handling | Validation (client + server), sanitization, file upload |
| Authentication | Session management, JWT, password hashing |

### 🗄️ Database (25%)
| Sub-kompetensi | Detail |
|----------------|--------|
| Schema Design | Normalization (1NF–3NF), ERD, relationships |
| SQL Queries | SELECT, JOIN, GROUP BY, subquery, indexing |
| CRUD Operations | Create, Read, Update, Delete via backend |
| Data Integrity | Constraints, transactions, prepared statements |
| Migration | Schema versioning, seeding, rollback |

### ⚙️ System Administration (15%)
| Sub-kompetensi | Detail |
|----------------|--------|
| Server Setup | Local dev environment, hosting configuration |
| Deployment | FTP/SSH, environment variables, domain config |
| Version Control | Git init, commit, branch, merge, conflict resolution |
| Security Basics | SQL injection prevention, XSS protection, HTTPS |

---

## 2. Mapping Kurikulum ke Standar LKS

### Modul yang Relevan

| Modul | Topik | Coverage LKS |
|-------|-------|-------------|
| Modul 04 | HTML & CSS Dasar | Web Design 40% — butuh CSS Grid/Flexbox + responsive |
| Modul 06 | JavaScript Dasar | Web Programming 30% — butuh async, fetch, error handling |
| Modul 11 | PHP & MySQL | Web Programming 40%, Database 50% — butuh prepared stmt |
| Modul 46 | Database Design | Database 60% — butuh normalisasi + indexing |

### Gap Matrix

| Kompetensi LKS | Status | Keterangan |
|----------------|--------|------------|
| Responsive Design | 🔴 Gap | Belum dibahas secara mendalam |
| CSS Grid & Flexbox | 🟡 Partial | Hanya dasar |
| Async JavaScript | 🔴 Gap | Belum ada materi fetch/AJAX |
| REST API | 🔴 Gap | Belum ada materi backend API |
| Prepared Statements | 🟡 Partial | Disebut sekilas |
| Authentication | 🔴 Gap | Belum ada session/JWT |
| Normalization | 🟡 Partial | Konsep dasar ada |
| Deployment | 🔴 Gap | Belum ada |
| Version Control | 🟡 Partial | Git init saja |
| Accessibility | 🔴 Gap | Belum disentuh |

### Prioritas Belajar

| Prioritas | Kompetensi | Alasan |
|-----------|------------|--------|
| 🔴 P0 | REST API + AJAX | Paling sering muncul di soal LKS |
| 🔴 P0 | Responsive Design | Wajib untuk semua soal |
| 🟡 P1 | Authentication | Sering di soal backend |
| 🟡 P1 | Prepared Statements | Keamanan database |
| 🟢 P2 | Deployment | Opsional, poin bonus |
| 🟢 P2 | Accessibility | Opsional, differentiation |

---

## 3. Sub-Kompetensi Detail per Area

### HTML/CSS
- Semantic HTML5 (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`)
- CSS Grid layout 2D + complex layouts
- Flexbox untuk 1D alignment + distribution
- Custom properties (CSS variables) untuk theming
- Media queries + responsive breakpoints
- CSS animations & transitions untuk micro-interactions
- BEM methodology untuk class naming

### JavaScript
- DOM manipulation: querySelector, createElement, event delegation
- ES6+: arrow functions, destructuring, spread, template literals
- Async JS: fetch API, async/await, Promise, error handling
- Form validation: constraint validation API, custom validation
- localStorage / sessionStorage untuk client-side data
- Module pattern: import/export

### Backend (PHP / Node.js)
- Routing: parameterized routes, 404 handling
- Middleware: auth check, logging, CORS
- Form handling: POST data, file upload, validation
- Session management: login/logout, session flash messages
- REST API: GET/POST/PUT/DELETE endpoints, JSON response
- Error handling: try-catch, error pages, logging

### Database Query
- SELECT with JOIN (INNER, LEFT, RIGHT)
- GROUP BY + HAVING + aggregate functions
- Subquery (correlated and non-correlated)
- Indexing untuk performance
- Prepared statement untuk SQL injection prevention
- Transaction: BEGIN, COMMIT, ROLLBACK

### Deployment
- Environment variable untuk konfigurasi
- .gitignore untuk file sensitif
- Database migration script
- File permission basics (Linux)
- Domain + subdomain setup

---

## 4. Software & Tools LKS

| Software | Versi Umum | Fungsi |
|----------|-----------|--------|
| VS Code | Latest | Code editor utama |
| XAMPP | 8.x | Apache + MySQL + PHP lokal |
| MySQL / MariaDB | 8.x / 10.x | Database server |
| phpMyAdmin | Latest | DB visual management |
| draw.io | Web/Desktop | ERD & diagram |
| Git | 2.x | Version control |
| Google Chrome / Firefox | Latest | Testing + DevTools |
| Postman | Latest | API testing |
| Node.js | 18+ LTS | Runtime (untuk Express) |

> **Catatan:** Saat lomba, software sudah terinstall di komputer peserta. Pastikan familiar dengan shortcut dan fitur masing-masing.

---

## 5. Latihan: Mapping & Gap Analysis

### Latihan 1: Identifikasi Gap

Buka proyek web yang pernah kamu buat sebelumnya (dari modul 4, 6, 11, atau 46). Analisis:

```
1. Dari 4 area LKS (Web Design, Programming, Database, Admin),
   area mana yang paling kuat dari proyek kamu? Mengapa?

2. Area mana yang paling lemah? Berikan contoh spesifik.

3. Dari sub-kompetensi di tabel gap matrix di atas,
   berapa banyak yang sudah kamu kuasai? (hitung dengan jujur)

4. Buat rencana 2 minggu untuk menutup 3 gap terbesar kamu.
```

### Latihan 2: Scoring Criteria Analysis

Ambil 1 soal dari mock test di sesi 03. Sebelum mengerjakan:

```
1. Baca rubrik penilaian. Tulis ulang dengan bahasamu sendiri.

2. Identifikasi 5 hal yang paling menentukan skor tinggi.

3. Berapa waktu ideal untuk tiap bagian? (frontend, backend, database)

4. Fitur apa yang bisa kamu skip jika waktu mepet?
```

### Latihan 3: Tool Familiarity

Timer: 15 menit

```
1. Buka VS Code. Praktikkan shortcut:
   - Ctrl+P (Quick Open)
   - Ctrl+Shift+P (Command Palette)
   - Ctrl+D (Select next match)
   - Ctrl+/ (Toggle comment)
   - Alt+Up/Down (Move line)

2. Buka Chrome DevTools:
   - Elements tab: inspect dan edit HTML/CSS live
   - Console tab: test JS code
   - Network tab: lihat request/response
   - Application tab: lihat localStorage + cookies

3. Buka phpMyAdmin / MySQL Workbench:
   - Buat database baru
   - Jalankan query SELECT dengan JOIN
   - Export database ke SQL file
```

### Latihan 4: Dokumentasi Gap

Buat file `gap-report.md` di folder proyek kamu:

```markdown

---

# Gap Report — [Nama Kamu]

## Kekuatan
- [ ] Web Design — [nilai 1-5]
- [ ] Web Programming — [nilai 1-5]
- [ ] Database — [nilai 1-5]
- [ ] System Admin — [nilai 1-5]

## Top 3 Gap
1. ...
2. ...
3. ...

## Rencana Aksi (2 Minggu)
| Minggu | Target | Metode Belajar |
|--------|--------|----------------|
| 1 | ... | ... |
| 2 | ... | ... |

## Catatan
...
```

---

## 6. Checklist Sesi 01

- [ ] Paham 4 area standar LKS & sub-kompetensinya
- [ ] Sudah mapping modul yang dipelajari ke standar LKS
- [ ] Tahu gap kompetensi prioritas (P0, P1, P2)
- [ ] Familiar dengan software LKS
- [ ] Selesai minimal 2 latihan mapping
- [ ] Membuat gap-report.md pribadi

---

**Next → Sesi 02: LKS Competition Strategy**
