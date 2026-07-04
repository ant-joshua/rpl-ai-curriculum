# Portfolio & Personal Branding — Latihan

## Level 1: Dasar

### 1. GitHub Profile — README.md
**Pertanyaan:** Buat GitHub profile README yang menarik:

```
Buat file README.md untuk repository profil GitHub (username/username).
Repository ini otomatis ditampilkan di profil GitHub.
```

Requirements:
- Header dengan nama dan tagline
- "About Me" section
- Tech stack badges (menggunakan shields.io)
- GitHub stats (menggunakan github-readme-stats)
- Recent activity
- Contact links (email, LinkedIn, website)

```markdown
<!-- === LENGKAPI README.md DI SINI === -->
<!-- Gunakan format markdown yang menarik -->
<!-- Contoh tech stack: JavaScript, TypeScript, React, Node.js, PostgreSQL -->
```

**Hint:** GitHub stats: `![Your GitHub stats](https://github-readme-stats.vercel.app/api?username=USERNAME&show_icons=true&theme=radical)`. Tech badges: `![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black)`. WakaTime: `![WakaTime](https://github-readme-stats.vercel.app/api/wakatime?username=USERNAME)`. Gunakan sections berbeda untuk visual hierarchy.

---

### 2. Portfolio Page — Landing
**Pertanyaan:** Buat landing page portfolio menggunakan HTML + CSS:

```html
<!-- === LENGKAPI: Portfolio Landing Page === -->
<!-- Requirements: -->
<!-- 1. Hero section dengan nama, tagline, CTA button -->
<!-- 2. About section dengan foto dan bio singkat -->
<!-- 3. Projects section dengan grid layout -->
<!-- 4. Skills section dengan visual representation -->
<!-- 5. Contact form -->
<!-- 6. Footer dengan social links -->
<!-- 7. Responsive design -->
<!-- 8. Dark mode support -->
```

Tulis HTML lengkap dengan:
- Semantic HTML
- CSS custom properties untuk theming
- Mobile-first responsive design
- Smooth scroll navigation
- Dark/light mode toggle

**Hint:** CSS custom properties: `:root { --bg: #fff; --text: #333; } [data-theme="dark"] { --bg: #1a1a1a; --text: #fff; }`. Grid: `display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));`. Smooth scroll: `html { scroll-behavior: smooth; }`. Dark mode toggle: JavaScript `document.documentElement.dataset.theme`.

---

### 3. LinkedIn — Headline Optimization
**Pertanyaan:** Optimasi profil LinkedIn untuk developer:

**Pertanyaan:** Tulis LinkedIn headline yang menarik untuk 3 tipe developer:

1. **Fresh graduate** — baru lulus, belum banyak pengalaman kerja
2. **Mid-level developer** — 3 tahun pengalaman, spesialis frontend
3. **Full-stack developer** — 5 tahun pengalaman, open to work

Untuk masing-masing, tulis:
- Headline (maks 220 karakter)
- About section (maks 2600 karakter, paragraph pertama yang hook)
- 3 experience entries yang compelling

**Hint:** Headline formula: `[Role] | [Speciality] | [Impact/Value] | [CTA]`. Contoh: "Full-Stack Developer | React & Node.js | Building scalable web apps | Open to opportunities". About section: mulai dengan hook yang kuat, bukan "I am a developer". Experience: gunakan action verbs (built, led, implemented, improved) dan quantify impact (improved performance by 40%, handled 10K daily users).

---

### 4. Tech Blog Post
**Pertanyaan:** Tulis blog post teknis:

**Pertanyaan:** Tulis blog post tentang "Membangun Real-time Chat dengan Socket.io dan React" dengan struktur:

```
1. Judul yang SEO-friendly
2. Meta description (maks 160 karakter)
3. Opening paragraph yang menarik (hook)
4. Prerequisites
5. Step-by-step tutorial dengan code blocks
6. Penjelasan konsep (bukan cuma copy-paste kode)
7. Common pitfalls
8. Conclusion dengan call-to-action
9. Tags/keywords
```

Pastikan blog post:
- Menggunakan code highlighting (markdown code blocks)
- Menjelaskan "kenapa" bukan cuma "bagaimana"
- Memiliki screenshot atau diagram (dalam format markdown image)
- SEO-optimized (gunakan heading hierarchy H1 > H2 > H3)

**Hint:** SEO: judul harus mengandung keyword utama. Meta description: ringkas, mengandung keyword, mengundang klik. Heading hierarchy: H1 = judul, H2 = section, H3 = sub-section. Code blocks: gunakan language identifier (`typescript`, `bash`). Internal linking: refer ke artikel terkait. External linking: refer ke dokumentasi resmi. Panjang ideal: 1500-2500 kata.

---

## Level 2: Menengah

### 5. Project Case Study
**Pertanyaan:** Tulis case study untuk project portfolio:

**Pertanyaan:** Buat case study untuk project e-commerce yang pernah kamu buat:

```
Project: Toko Online XYZ
Stack: Next.js, Prisma, PostgreSQL, Midtrans, Tailwind CSS
Duration: 3 bulan
Role: Full-Stack Developer
```

Format case study:
1. **Problem Statement** — masalah yang diselesaikan
2. **My Role** — tanggung jawab spesifik
3. **Process** — flow development
4. **Technical Decisions** — kenapa pilih tech tertentu
5. **Challenges** — masalah yang dihadapi dan solusinya
6. **Results** — dampak yang dihasilkan (metric)
7. **Lessons Learned** — apa yang dipelajari
8. **Live Demo / GitHub Link** — bukti nyata

**Hint:** Case study harus data-driven: "mengurangi waktu loading dari 3.2s ke 1.2s" lebih baik dari "membuat website lebih cepat". Gunakan STAR format: Situation, Task, Action, Result. Visual: sertakan screenshot, architecture diagram, atau before/after comparison. Panjang: 800-1500 kata. Tone: professional tapi personable.

---

### 6. GitHub Project Showcase
**Pertanyaan:** Optimasi GitHub repository untuk showcase:

```markdown
<!-- === LENGKAPI: Project README.md template === -->
<!-- Gunakan template ini untuk semua project portfolio -->

# Project Name

![Project Banner](banner.png)

> One-line description yang menarik

## 🎯 About

<!-- === LENGKAPI === -->
<!-- 2-3 paragraf tentang project ini -->
<!-- Apa masalah yang diselesaikan? -->
<!-- Kenapa project ini penting? -->

## 🚀 Features

<!-- === LENGKAPI === -->
<!-- List fitur utama dengan icon -->
<!-- Minimum 5 fitur -->

## 🛠️ Tech Stack

<!-- === LENGKAPI === -->
<!-- Gunakan shields.io badges -->
<!-- Frontend: ... -->
<!-- Backend: ... -->
<!-- Database: ... -->
<!-- Deployment: ... -->

## 📸 Screenshots

<!-- === LENGKAPI === -->
<!-- Screenshot atau GIF demo -->

## 🏁 Getting Started

<!-- === LENGKAPI === -->
<!-- 1. Prerequisites -->
<!-- 2. Clone & Install -->
<!-- 3. Environment variables -->
<!-- 4. Run development server -->

## 📁 Project Structure

<!-- === LENGKAPI === -->
<!-- Tree structure folder utama -->

## 🧪 Testing

<!-- === LENGKAPI -->
<!-- Cara menjalankan tests -->

## 🚢 Deployment

<!-- === LENGKAPI -->
<!-- Link ke live demo -->
<!-- Cara deploy sendiri -->

## 📄 License

<!-- === LENGKAPI -->
<!-- Pilih license: MIT, ISC, dll -->
```

**Hint:** Project README harus: (1) bisa di-clone dan di-run dalam 5 menit, (2) punya clear description, (3) tech stack visible, (4) screenshots/GIF, (5) deployment link. Gunakan shields.io badges untuk visual: build status, coverage, license. **PENTING**: .env.example wajib ada. CONTRIBUTING.md dan CHANGELOG.md untuk project besar.

---

### 7. Personal Website — SEO
**Pertanyaan:** Optimasi SEO untuk personal website:

```html
<!-- === LENGKAPI: SEO meta tags === -->
<head>
  <!-- === LENGKAPI === -->
  <!-- 1. Basic meta tags (title, description, keywords) -->
  <!-- 2. Open Graph tags (untuk social media sharing) -->
  <!-- 3. Twitter Card tags -->
  <!-- 4. Canonical URL -->
  <!-- 5. Structured data (JSON-LD) -->
  <!-- 6. Favicon dan apple-touch-icon -->
  <!-- 7. Sitemap reference -->
  <!-- 8. Robots meta tag -->
</head>

<!-- === LENGKAPI: Structured Data === -->
<script type="application/ld+json">
{
  // === LENGKAPI ===
  // Person schema untuk developer profile
  // Include: name, jobTitle, sameAs (social links),
  // knowsAbout (tech skills), alumniOf
}
</script>

<!-- === LENGKAPI: Sitemap generation === -->
<!-- Buat sitemap.xml sederhana untuk personal website -->
<!-- Include: home, about, projects (setiap project), blog posts, contact -->
```

**Hint:** Meta tags: `<title>John Doe — Full-Stack Developer | React, Node.js</title>`. OG tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`. JSON-LD: `@type: "Person"`, `@context: "https://schema.org"`. Sitemap: gunakan `next-sitemap` atau generate manual. Robots: `<meta name="robots" content="index, follow" />`. **PENTING**: image di OG tags harus 1200x630px untuk optimal display di social media.

---

## Level 3: Lanjutan

### 8. Content Strategy
**Pertanyaan:** Buat content strategy untuk developer branding:

**Pertanyaan:** Rencanakan content strategy 3 bulan untuk membangun personal brand sebagai developer:

```
Target audience: Junior developers yang ingin belajar web development
Platform: Medium, dev.to, Twitter/X, LinkedIn
Goal: Dikenal sebagai expert di React/Node.js ecosystem
```

Tulis rencana content:

1. **Week 1-4 (Month 1)** — Establish presence
   - Topik apa yang harus ditulis?
   - Berapa frekuensi posting?
   - Platform mana yang diprioritaskan?

2. **Week 5-8 (Month 2)** — Build authority
   - Content type apa yang efektif?
   - Cara engage dengan komunitas?
   - Collaboration opportunities?

3. **Week 9-12 (Month 3)** — Expand reach
   - Cross-platform strategy?
   - Content repurposing?
   - Measuring success?

**Hint:** Content calendar: batch writing (tulis 4 artikel sekaligus, publish 1 per minggu). Platform strategy: Medium untuk long-form, dev.to untuk tutorial, Twitter untuk quick tips, LinkedIn untuk professional updates. Engagement: comment on other developers' posts, join discussions, answer questions. Metrics: followers, article views, comments, shares, profile visits. Repurpose: artikel blog -> Twitter thread -> LinkedIn post -> video tutorial.

---

### 9. Networking Strategy
**Pertanyaan:** Buat networking strategy untuk career growth:

**Pertanyaan:** Rencanakan networking strategy selama 6 bulan:

1. **Online Presence**
   - GitHub activity strategy
   - Open source contributions
   - Conference talks proposal
   - Community involvement

2. **Offline Networking**
   - Meetup attendance plan
   - Conference preparation
   - Local community involvement
   - Mentorship (give & receive)

3. **Relationship Building**
   - Follow-up strategy
   - Value-first approach
   - Informational interviews
   - Collaboration opportunities

4. **Career Advancement**
   - LinkedIn networking targets
   - Industry connections
   - Referral strategy
   - Job market positioning

**Hint:** GitHub: contribute ke open source projects yang kamu pakai. Conference: ajukan talk proposal di meetup lokal dulu, naik ke conference. Mentorship: jadi mentor di komunitas lokal, cari mentor senior di industry. Follow-up: kirim pesan personal setelah meet, bukan generic "nice to meet you". Value-first: bantu orang lain sebelum minta bantuan.

---

### 10. Interview Preparation — Portfolio Demo
**Pertanyaan:** Persiapan demo project untuk interview:

**Pertanyaan:** Persiapkan demo project untuk technical interview:

```
Project: E-commerce API + Dashboard
Duration: 3 bulan
Stack: Next.js, Prisma, PostgreSQL, BullMQ, Midtrans
```

Tulis:
1. **Demo Script** — step-by-step presentasi (5 menit)
2. **Technical Deep-Dive Points** — topik yang harus bisa dijelaskan
3. **Architecture Overview** — high-level diagram dan penjelasan
4. **Challenges & Solutions** — 3 tantangan terbesar dan solusinya
5. **Testing Strategy** — bagaimana kamu test project ini
6. **Performance Optimizations** — optimasi yang dilakukan
7. **Security Considerations** — keamanan yang diterapkan
8. **Scalability Plan** — bagaimana scale jika user naik 10x

**Hint:** Demo script: mulai dengan problem statement, lalu demo fitur utama,akhiri dengan technical decisions. Deep-dive: bisa ditanya tentang database design, caching strategy, error handling, deployment. Architecture: sertakan diagram sederhana. Challenges: pilih yang menunjukkan problem-solving skills. Metrics: "mengurangi response time dari 500ms ke 50ms" lebih kuat dari "menambahkan caching".
