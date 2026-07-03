# 📖 Cara Pakai Repo Ini

## 🌐 Baca sebagai Website (Docsify)

```bash
# Install docsify global
npm install -g docsify-cli

# Serve
cd rpl-ai-curriculum
docsify serve .

# Buka http://localhost:3000
```

Atau buka `index.html` langsung di browser (perlu koneksi internet — load CDN).

## 📄 Export sebagai PDF

```bash
# Opsi 1: md-to-pdf
npx md-to-pdf README.md

# Opsi 2: Pandoc
sudo apt install pandoc
pandoc README.md -o kurikulum.pdf --from markdown --to pdf --metadata title="RPL AI Curriculum"
```

## 🖥️ Baca di GitHub

Repo ini pure Markdown — render otomatis di GitHub.
Mulai dari [README.md](README.md).

## 📁 Struktur Repo

```
rpl-ai-curriculum/
├── README.md
├── index.html         ← Docsify entry
├── _sidebar.md        ← Navigasi
├── _coverpage.md      ← Cover
├── SETUP.md           ← Panduan ini
├── paths/             ← Jalur belajar (roadmap)
├── 01-js-fundamentals/
├── 02-typescript/
├── 03-web-basics/
├── 04-git-deploy/
├── 05-node-express/
├── 06-mastra-ai/
├── 07-project/
├── electives/
└── assets/
```
