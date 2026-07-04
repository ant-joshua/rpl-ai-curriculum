# 🧠 Cheatsheet: LKS Competition Prep

> Referensi cepet — 1 halaman.

## Topik Utama

| Sesi | Judul | Durasi |
|------|-------|--------|
| 01 | LKS Mapping & Gap Analysis — standar WSC, mapping kurikulum | 120m |
| 02 | Competition Strategy — time management, scoring, mock simulation | 120m |
| 03 | Mock Projects — 3 soal mock LKS lengkap + answer key | 240m (+ 6h mock test) |

## LKS Scope (WorldSkills Standard)

| Area | Bobot | Sub-kompetensi |
|------|-------|----------------|
| 🎨 Web Design | 25% | Responsive, CSS Grid/Flexbox, UI consistency, aksesibilitas, cross-browser |
| 💻 Web Programming | 35% | DOM manipulation, async JS, backend routing, API integration, auth |
| 🗄️ Database | 25% | Schema design (1NF–3NF), SQL JOIN, indexing, prepared statements, migration |
| ⚙️ System Admin | 15% | Server setup, deployment, Git, security basics (XSS, SQLi) |

## Time Budget (6 Jam)

| Sesi | Waktu | Aktivitas |
|------|-------|-----------|
| Pembukaan | 15 menit | Baca soal, rencanakan strategi |
| Frontend | 90 menit | HTML struktur, CSS styling, responsive |
| Backend | 120 menit | Logic, routing, API, auth |
| Database | 60 menit | Schema, query, CRUD |
| Testing | 45 menit | Uji semua fitur, debug |
| Finalisasi | 30 menit | Polish UI, code cleanup, docs |

## Scoring Rubric

| Kriteria | Bobot | Alokasi waktu |
|----------|-------|---------------|
| Functional Correctness | 35% | ~126 menit |
| Code Quality | 20% | ~72 menit |
| Efficiency | 15% | ~54 menit |
| UI/UX | 15% | ~54 menit |
| Creativity | 10% | ~36 menit |
| Documentation | 5% | ~18 menit |

## Software List

| Tool | Kegunaan |
|------|----------|
| VS Code | Code editor utama |
| XAMPP / Laragon | Local web server + MySQL |
| MySQL Workbench / phpMyAdmin | Database management |
| draw.io / Figma | Perancangan layout & diagram |
| Postman / Thunder Client | API testing |
| Git + GitHub | Version control (opsional) |

## Checklist Lomba

**Sebelum mulai coding:**
- [ ] Baca soal (15m) — pahami halaman, fitur wajib, format output
- [ ] Buat mind map arsitektur → frontend → backend → database
- [ ] Identifikasi dependency antar fitur (mana yang blocking?)
- [ ] Prioritaskan core CRUD vs fitur bonus

**Selama coding:**
- [ ] Time boxing ketat — set alarm tiap sesi
- [ ] Jika mentok → skip, lanjut fitur lain
- [ ] Jangan over-invest di satu bagian
- [ ] Selalu validasi input (client + server side)

**Sebelum submit:**
- [ ] Test semua fitur utama (Functional Correctness = 35%)
- [ ] Responsive di 2 ukuran viewport (hp + desktop)
- [ ] Code cleanup — hapus console.log, komentar debugging
- [ ] README minimal: cara run, environment required
- [ ] Export DB jika diminta (SQL dump)

## Tips & Trik
- **Keywords penting soal:** "Wajib" (nilai 0 kalau tidak ada), "Minimal" (boleh lebih, jangan kurang), "Disarankan" (bonus)
- **Error aneh:** catat dulu, debugging terakhir. Jangan buang 30 menit di error yang tidak krusial
- **Prioritas:** jika waktu tinggal 2 jam dan backend belum selesai → core CRUD saja, skip bonus
- **Strategi if-then:** Waktu tinggal 30 menit → pastikan fitur utama jalan, jangan nambah fitur baru

## Common Mistakes
- ❌ Langsung coding tanpa baca soal — salah arah, wasted 1+ jam
- ❌ Terlalu fokus ke UI/UX (15%) sampai backend (35%) tidak selesai
- ❌ Tidak testing setelah finalisasi — fitur yang tadinya jalan bisa tiba-tiba error
- ❌ Mengabaikan prepared statements → SQL injection = 0 untuk security
- ❌ Hardcode data yang seharusnya dari database → "Dynamic" requirement gagal

## Link Cepat
- [Module README](.)
- [Quiz](quiz.md)
