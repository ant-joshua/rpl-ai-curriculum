---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — Modul 44: Digital Portfolio & Personal Branding"
footer: "Sesi 01: Github Profile"
---

<!-- _class: title -->
# Sesi 1: GitHub Profesional

> Buat profil GitHub yang menonjol, dokumentasi proyek yang rapi, dan site GitHub Pages.

**Durasi**: 4 jam | **Output**: GitHub profile lengkap + project docs

---

## 1.1 GitHub Profile README

Buat repositori khusus dengan nama **username GitHub kamu** (contoh: `github.com/username/username`). Repositori ini spesial — konten README-nya muncul di halaman profil GitHub kamu.

### Struktur Profile README

```markdown
<!-- Header / Banner -->
<h1 align="center">Hi 👋, I'm Nama Kamu</h1>
<h3 align="center">Frontend Developer | React Enthusiast | Open Source Lover</h3>

<!-- Typing Animation -->
<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&width=435&lines=Welcome+to+my+profile!;I+love+building+cool+stuff;Let's+code+together!" />
</p>

<!-- Social Links -->
<p align="center">
  <a href="https://twitter.com/username"><img src="https://img.shields.io/badge/Twitter-1DA1F2?logo=twitter&logoColor=white" /></a>
  <a href="https://linkedin.com/in/username"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white" /></a>
  <a href="https://dev.to/username"><img src="https://img.shields.io/badge/dev.to-0A0A0A?logo=dev.to&logoColor=white" /></a>
  <a href="https://medium.com/@username"><img src="https://img.shields.io/badge/Medium-000000?logo=medium&logoColor=white" /></a>
</p>

---

<!-- About Me -->
## 🚀 About Me

- 🔭 **Current project:** [Project Name](link)
- 🌱 **Learning:** Next.js, TypeScript, Tailwind CSS
- 👯 **Looking to collaborate:** Open source React projects
- 💬 **Ask me about:** Frontend, UI/UX, Career switching to tech
- 📫 **Reach me:** email@example.com
- ⚡ **Fun fact:** Suka ngopi sambil debug di jam 2 pagi

---

<!-- Tech Stack Badges -->
## 🛠 Tech Stack

### Languages
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)

### Tools
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?logo=visualstudiocode&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?logo=figma&logoColor=white)

---

<!-- GitHub Stats -->
## 📊 GitHub Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=username&show_icons=true&theme=tokyonight" width="48%" />
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=username&theme=tokyonight" width="48%" />
</p>

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=username&layout=compact&theme=tokyonight" width="40%" />
</p>

---

<!-- Pinned Projects -->
## 📌 Pinned Projects

### [Project 1](https://github.com/username/project1)
![Repo Card](https://github-readme-stats.vercel.app/api/pin/?username=username&repo=project1&theme=tokyonight)

### [Project 2](https://github.com/username/project2)
![Repo Card](https://github-readme-stats.vercel.app/api/pin/?username=username&repo=project2&theme=tokyonight)

---

<!-- Contribution Graph -->
## 📈 Contribution Graph

![GitHub Activity Graph](https://github-readme-activity-graph.vercel.app/graph?username=username&theme=tokyo-night)

---

<!-- Visitor Count -->
<p align="center">
  <img src="https://visitcount.itsvg.in/api?id=username&label=Profile%20Views&color=6&icon=5&pretty=true" />
</p>
```

## 1.2 Shields.io Badges

Gunakan [Shields.io](https://shields.io/) untuk badge skill, sosial media, dan status proyek.

### Format Badge Dasar

```
https://img.shields.io/badge/LABEL-MESSAGE-COLOR?logo=logoname&logoColor=white
```

### Contoh Badge Populer

| Badge | URL |
|-------|-----|
| React | `![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)` |
| JavaScript | `![JS](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)` |
| TypeScript | `![TS](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)` |
| Node.js | `![Node](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)` |
| Python | `![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)` |
| License | `![License](https://img.shields.io/badge/license-MIT-blue)` |
| Build Status | `![Build](https://img.shields.io/badge/build-passing-brightgreen)` |

### Badge Dinamis (dari GitHub API)

```markdown
![GitHub stars](https://img.shields.io/github/stars/username/repo?style=social)
![GitHub forks](https://img.shields.io/github/forks/username/repo?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/username/repo)
```

## 1.3 Dokumentasi Proyek (README Template)

Setiap repositori butuh README yang baik. Gunakan template ini:

```markdown

---

# Nama Proyek

![Banner](link-to-banner-image)

## 📋 Deskripsi

Jelaskan secara singkat: apa yang dibangun, kenapa, dan untuk siapa.

## 🚀 Fitur

- ✅ Fitur 1 — deskripsi singkat
- ✅ Fitur 2 — deskripsi singkat  
- ✅ Fitur 3 — deskripsi singkat

## 🛠 Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| React | Frontend framework |
| Tailwind CSS | Styling |
| Firebase | Backend & database |
| Vercel | Deployment |

## 📸 Screenshot

![Screenshot](link-to-screenshot.png)

## 🔗 Link Demo

[Live Demo](https://your-app.vercel.app)

## 🚀 Cara Install

```bash
git clone https://github.com/username/repo.git
cd repo
npm install
npm run dev
```

## 📄 Lisensi

Distributed under the MIT License.
```

## 1.4 GitHub Pages Site

GitHub Pages hosting static site gratis dari repositori GitHub.

### Cara Setup

1. Buka repo → **Settings** → **Pages**
2. Pilih branch (biasanya `main` atau `gh-pages`)
3. Pilih folder root `/` atau `/docs`
4. Klik **Save**
5. Tunggu 1-2 menit — site live di `https://username.github.io/repo-name/`

### Untuk User/Organization Site

Buat repo bernama `username.github.io` → isi HTML/CSS/JS → langsung live di `https://username.github.io`

### Struktur Folder GitHub Pages

```
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   └── images/
└── README.md
```

### Contoh HTML untuk GitHub Pages

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Portfolio</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <header>
    <h1>Hello, I'm [Nama]</h1>
    <p>Frontend Developer</p>
    <a href="https://github.com/username">GitHub</a>
    <a href="https://linkedin.com/in/username">LinkedIn</a>
  </header>
  <main>
    <section id="projects">
      <h2>Projects</h2>
      <div class="project-card">
        <h3>Project 1</h3>
        <p>Deskripsi singkat project</p>
        <a href="https://github.com/username/project1">Repo</a>
        <a href="https://project1.vercel.app">Live</a>
      </div>
    </section>
  </main>
  <footer>
    <p>&copy; 2026 [Nama]</p>
  </footer>
</body>
</html>
```

---

## ✍️ Latihan

### Latihan 1: Profile README Dasar

Buat repositori `username/username` (ganti dengan username GitHub kamu). Isi dengan README yang mencakup:

- Header dengan nama dan title
- Social links (minimal GitHub + LinkedIn)
- About Me section (3-5 bullet points)
- Tech stack badges (minimal 5 badge berbeda)
- Visitor counter

**Kriteria**: Repo terlihat di profil GitHub, semua link berfungsi.

### Latihan 2: Statistik & Badge Dinamis

Tambahkan ke profile README:

- GitHub stats card (gunakan `github-readme-stats`)
- Streak stats (gunakan `github-readme-streak-stats`)
- Top languages card
- Contribution activity graph
- Badge dinamis untuk followers, repositori, stars

**Kriteria**: Semua card menampilkan data real dari akun GitHub kamu.

### Latihan 3: Dokumentasi Proyek

Pilih salah satu proyek yang pernah kamu buat (atau buat proyek dummy). Buat README lengkap dengan:

- Nama & deskripsi proyek
- Fitur (minimal 3 bullet)
- Tech stack table
- Screenshot (bisa screenshot dummy)
- Link demo (bisa link ke GitHub Pages)
- Cara install & run
- License badge

**Kriteria**: README minimal 300 kata, ada table dan code block.

### Latihan 4: GitHub Pages Site

Buat landing page pribadi menggunakan GitHub Pages:

1. Buat repo `username.github.io`
2. Buat `index.html` dengan:
   - Hero section (nama, title, tagline)
   - About section (foto/avatar, bio singkat)
   - Projects section (3 project cards)
   - Contact section (email, sosial media)
   - Footer
3. Styling dengan CSS (minimal 50 baris CSS)
4. Deploy ke GitHub Pages

**Kriteria**: Site live di `https://username.github.io`, responsif di mobile, semua link berfungsi.
