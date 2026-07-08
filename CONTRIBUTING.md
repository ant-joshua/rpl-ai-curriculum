# 🫶 Kontribusi — RPL AI Curriculum

Terima kasih udah mau berkontribusi! Kurikulum ini open untuk feedback, perbaikan, dan pengembangan bareng.

> **Bahasa utama:** Bahasa Indonesia. Semua konten, issue, dan diskusi pake Bahasa Indonesia ya.

---

## 📋 Daftar Isi

- [Laporkan Masalah](#laporkan-masalah)
- [Pull Request Workflow](#pull-request-workflow)
- [Commit Message Convention](#commit-message-convention)
- [Content Guidelines](#content-guidelines)
- [Development Setup](#development-setup)
- [Code of Conduct](#code-of-conduct)

---

## Laporkan Masalah

Kamu bisa buka [GitHub Issues](https://github.com/midory/rpl-ai-curriculum/issues) buat:

### 🐛 Bug
Ada link broken, gambar gagal load, atau modul yang gak bisa diikutin? Buka issue dengan label `bug`.

### ✏️ Typo / Error Konten
Nemuin typo, grammar salah, atau kode contoh yang gak jalan? Buka issue dengan label `typo` atau langsung bikin PR.

### 💡 Saran Konten
Punya ide modul baru, contoh project, atau cara ngajar yang lebih baik? Buka issue dengan label `enhancement`.

**Template issue:**
```
## Judul
(ringkas, jelaskan masalah)

## Lokasi
(file path / modul / baris)

## Deskripsi
(apa yang salah / kurang)

## Saran Perbaikan
(gimana menurut lo seharusnya)

## Screenshot (opsional)
...
```

---

## Pull Request Workflow

Alur standar kontribusi:

1. **Fork** repo ini ke akun GitHub lo.
2. **Clone** fork ke lokal:
   ```bash
   git clone https://github.com/<username>/rpl-ai-curriculum.git
   cd rpl-ai-curriculum
   ```
3. **Buat branch** baru dari `main`:
   ```bash
   git checkout -b feat/tambah-modul-xx
   ```
   Nama branch: `<type>/<deskripsi-singkat>` — misal `fix/typo-modul-1`, `docs/tambah-glossary`.
4. **Commit** perubahan (lihat konvensi di bawah).
5. **Push** ke fork lo:
   ```bash
   git push origin feat/tambah-modul-xx
   ```
6. Buka **Pull Request** ke `main` repo ini.
   - Judul PR ikut commit convention.
   - Deskripsi PR jelasin apa yang diubah dan kenapa.
   - Kalo PR nyelesain issue, tulis `Closes #<nomor-issue>`.

> PR kecil (1-2 file, typo fix) bakal direview cepat. PR besar (modul baru, restruktur) diskusi dulu lewat issue ya.

### Review Process
- Maintainer bakal review dalam 3-7 hari kerja.
- Mungkin ada minta revisi — jangan kaget, itu wajar.
- Diskusi dilakukan langsung di PR thread biar transparan.
- Setelah approve, maintainer yang merge.
- PR yang udah 30 hari gak ada aktivitas bakal ditutup otomatis.

---

## Commit Message Convention

Kita pake [Conventional Commits](https://www.conventionalcommits.org/) biar history rapi dan bisa auto-generate changelog.

Format:

```
<type>: <deskripsi singkat>
```

| Type | Kapan Dipake |
|------|--------------|
| `feat` | Nambah fitur / modul baru |
| `fix` | Perbaiki bug, typo, atau konten salah |
| `docs` | Update dokumentasi, README, glossary |
| `style` | Perbaiki format, whitespace, struktur markdown |
| `refactor` | Ubah struktur tanpa ngubah konten |
| `chore` | Update dependensi, CI, config |

Contoh:

```
feat: tambah modul 99 tentang kubernetes
fix: perbaiki link express.js di modul 6
docs: update tabel prasyarat di README
style: rapihin alignment tabel modul
```

> **PENTING:** Tiap commit cuma satu perubahan logis. Jangan campur typo fix sama fitur baru dalam satu commit.

---

## Content Guidelines

### Bahasa
- **Wajib Bahasa Indonesia** (kecuali istilah teknis yang gak ada terjemahan: `variable`, `function`, `array`, dll).
- Pake bahasa sehari-hari yang santai tapi tetap informatif. Anggap lo ngajar temen sendiri.
- Campur dikit slang/tidak baku gapapa, asal gak mengurangi kejelasan.

### Struktur File
- Tiap modul di folder sendiri: `NN-nama-modul/`.
- README.md tiap modul: penjelasan, contoh kode, latihan.
- Kode contoh di subfolder `examples/` atau inline di README.
- Latihan di `exercises/` (file `.md` atau `.ts`/`.js`).

### Format
- Markdown murni — Docsify friendly.
- Kode pake fenced code block dengan bahasa:
  ````md
  ```javascript
  console.log("hello");
  ```
  ````
- Tabel pake pipe `|` alignment.
- Link ke file lokal pake relative path.
- External link pake full URL.
- Gambar dari Pexels/Unsplash; sertakan alt text deskriptif.

### Konten Baru
- Kalo nambah modul: update juga `README.md` tabel Modul + daftar di `_sidebar.md`.
- Kalo nambah capstone: update tabel Capstone Projects di README.
- Pastikan gak ada link broken.
- Jaga konsistensi tone: santai, direct, praktikal.
- Setiap modul harus punya: (1) Tujuan belajar, (2) Materi inti dengan contoh kode, (3) Latihan/tugas, (4) Referensi lanjutan.
- Kalo lo ngerasa modul yang ada udah outdated, jangan sungkan buat usul revisi — teknologi berubah cepet.

### Images & Media
- Gambar dari source free-to-use (Pexels, Unsplash, atau buatan sendiri).
- Format: JPEG/WebP buat foto, PNG buat screenshot/graphic.
- Tambahin alt text deskriptif buat aksesibilitas.
- Jangan pake gambar yang terlalu besar (>500KB kalo bisa).

---

## Development Setup

### Prasyarat
- [Node.js](https://nodejs.org) 18+ (buat Docsify)
- Git

### Jalankan Docsify Locally

```bash
# Install docsify CLI
npm install -g docsify-cli

# Atau pake npx (gak perlu install global)
npx docsify serve .

# Buka http://localhost:3000
```

Docsify jalanin semua file `.md` di folder jadi website. Setiap perubahan langsung kelihatan (hot reload).

### Preview Sebelum PR

Selalu cek hasil render lokal sebelum commit:

```bash
npx docsify serve .
# Buka browser, navigasi ke halaman yang lo ubah
```

### Validasi Link

Pastikan semua internal link jalan:

```bash
# Pake find + grep buat cek internal links
grep -roP '\]\([^)]+' *.md | grep -v 'http' | head -20
# Manual check via Docsify local juga cukup
```

---

## Code of Conduct

Kita komit buat jaga lingkungan yang terbuka dan ramah buat semua orang.

### Singkatnya:
- **Pake bahasa yang sopan dan inklusif.**
- `Toleransi` — latar belakang, gender, pengalaman beda itu wajar.
- **Kritik dikemas sebagai saran**, bukan serangan personal.
- **Gak tolerir**:
  - Pelecehan, ujaran kebencian, diskriminasi.
  - Konten NSFW di luar tempat semestinya.
  - Spam, trolling, atau flame war.

Pelanggaran berat: kontributor di-ban dari repo. Kalo ada masalah, laporkan ke maintainer via issue atau DM.

---

## ❓ FAQ

**Gak bisa JavaScript / TypeScript — boleh kontribusi?**
Boleh banget! Banyak kontribusi non-kode: typo fix, nulis ulang penjelasan, nambah gambar, nerjemahin glossary. Semua dihargai.

**Modul favorit gue kurang lengkap — gimana cara nambahin?**
Buka issue dulu dengan label `enhancement`, diskusiin apa yang kurang. Kalo udah OK, lanjut bikin PR.

**Boleh kontribusi pake AI kayak ChatGPT buat bantu nulis?**
Boleh, asal: (1) lo review & edit hasil AI biar akurat dan sesuai tone, (2) lo tanggung jawab sama konten yang lo commit. AI itu alat, bukan penulis.

**Gue mau bantu tapi bingung mulai dari mana — ada yang beginner-friendly?**
Cek label `good first issue` di Issues — itu khusus buat kontributor baru.

---

## 🚀 Mulai Kontribusi

1. Cek [Issues](https://github.com/midory/rpl-ai-curriculum/issues) yang available.
2. Kalo mau ngerjain sesuatu, komentar di issue biar gak tabrakan.
3. Ikutin workflow di atas.

**Malu bertanya sesat di jalan.** Buka [Discussion](https://github.com/midory/rpl-ai-curriculum/discussions) kalo bingung — kita bantu.

---

Terima kasih udah bikin kurikulum ini makin baik! 🙌
