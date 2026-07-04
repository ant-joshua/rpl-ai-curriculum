# 🧠 Cheatsheet: Digital Portfolio & Personal Branding

> Referensi cepet — 1 halaman. Modul 44: GitHub profile, portfolio website, LinkedIn optimization, tech community.

## Topik Utama

| Sesi | Topik | Tools |
|------|-------|-------|
| 01 | GitHub Profesional — Profile README, pinned repos, badge shields.io, project docs, GitHub Pages | Shields.io, GitHub Pages |
| 02 | Portfolio Website — Hero, about, project cards, skills, contact form, case study pages, deploy | Vercel, Netlify |
| 03 | LinkedIn & Career — Optimasi profil, headline, about, featured projects, CV ATS-friendly | LinkedIn |
| 04 | Tech Community — Blog teknis (Dev.to/Hashnode), problem-solution articles, open source PR, networking | Dev.to, Hashnode |

## Command / Sintaks Penting

### GitHub Profile README

```bash
# Buat repo special: username/username
mkdir username && cd username
# Buat README.md — ini jadi profile README

# Badge generator
# https://rahuldkjain.github.io/gh-profile-readme-generator/
# https://shields.io/
```

**Badge format:**
```markdown
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
```

**GitHub Stats:**
```markdown
![GitHub Stats](https://github-readme-stats.vercel.app/api?username=USERNAME&show_icons=true&theme=radical)
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=USERNAME&layout=compact&theme=radical)
![GitHub Streak](https://streak-stats.demolab.com?user=USERNAME)
```

**Pinned repos:**
```markdown
<!-- Pin 6 repos di GitHub profile settings -->
<!-- Tips: pin projek yang beda-beda tech stack -->
```

### Portfolio Website Structure

```
index.html          → Hero + About + Contact
projects.html       → Project cards grid
case-study/         → Individual project deep-dive
skills.html         → Skills progress bar
contact.html        → Contact form (Formspree/Formsubmit)
```

**Essential sections:**
```html
<!-- Hero Section -->
<section class="hero">
  <h1>Hi, I'm [Name] 👋</h1>
  <p>Full-stack developer specializing in [tech].</p>
  <a href="#projects">View My Work</a>
</section>

<!-- Project Card -->
<div class="project-card">
  <img src="project-screenshot.webp" alt="Project Name" loading="lazy">
  <h3>Project Name</h3>
  <p>Brief description. Problem solved.</p>
  <div class="tech-tags">
    <span>React</span><span>Node.js</span><span>PostgreSQL</span>
  </div>
  <div class="project-links">
    <a href="live-url">Live Demo</a>
    <a href="github-url">Source Code</a>
  </div>
</div>
```

### Deploy Portfolio

```bash
# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod

# GitHub Pages (gratis, khusus static)
# Settings → Pages → Source: main branch /docs folder
```

### LinkedIn Optimization

**Headline formula:**
```
[Role] | [Specialization] | [Impact/Value]
```
Contoh: `Full-Stack Developer | React & Node.js | Building Scalable Web Apps`

**About section structure:**
```
1. Hook (1-2 kalimat — siapa, apa yang bikin beda)
2. What I do (spesialisasi + tech stack)
3. Achievement (metrics: "reduced load time by 40%", "served 10k+ users")
4. What I'm looking for (open to opportunities / collaboration)
5. Call to action (email, portfolio link)
```

**CV ATS Tips:**
- Gunakan section headings standar: Experience, Education, Skills
- Hindari kolom/tables — ATS gak bisa baca
- Pakai action verbs: Built, Implemented, Optimized, Reduced
- Quantify achievements: "Improved API response time from 800ms to 200ms"
- File format: PDF (bukan DOCX yang formatting-nya bisa pecah)

### Tech Blog Structure

```markdown
# [Problem-Solving Article Title]

## The Problem
[1-2 paragraf: what problem you faced, context]

## The Solution
[Approach + why you chose this solution]

## Implementation
[Code snippets + explanation]

## Results
[Metrics, screenshots, demo link]

## Conclusion
[Key takeaways, what you'd do differently]
```

**Publish platforms:**
- **Dev.to** — community besar, markdown editor, dev-focused
- **Hashnode** — custom domain, SEO-friendly, newsletter
- **Medium** — audiens umum, paywall optional

### Open Source Contributions

```bash
# Cari issue "good first issue"
# https://github.com/topics/good-first-issue

# Fork → Clone → Branch → Code → PR
git fork https://github.com/owner/repo.git
git checkout -b fix/issue-123
# ... make changes ...
git commit -m "fix: resolve #123 — [description]"
git push origin fix/issue-123
# Create PR di GitHub
```

## Tips & Trik

- **GitHub README** = first impression — badge visual, stats, pinned repos yang beda-beda
- **Portfolio** harus live di URL profesional — `yourname.dev` > `github.io/username`
- **Case study > list** — ceritakan problem → approach → result, bukan cuma fitur
- **Mobile-first** — recruiter sering cek portfolio dari HP
- **Loading time < 3s** — optimasi gambar (WebP), lazy load, minimal JS
- **LinkedIn headline** = SEO keywords — recruiter search by keywords
- **Quantify everything** — "improved performance" vs "reduced API latency from 800ms to 200ms"
- **1 blog per 2 weeks** > 10 artikel sekaligus — konsistensi matters
- **Open source PR** — bahkan typo fix pun valid contribution

## Common Mistakes

- ❌ **README kosong** — missed opportunity untuk personal branding
- ❌ **Portfolio cuma screenshot** — gak ada link live atau source code
- ❌ **Gak ada CTA di portfolio** — recruiter harus tau cara contact kamu
- ❌ **LinkedIn headline default** — "Student at [University]" → gak SEO-friendly
- ❌ **CV 5 halaman** — 1-2 halaman max, ATS-friendly format
- ❌ **No metrics di achievement** — "Built an API" vs "Built REST API serving 50k req/day with 99.9% uptime"
- ❌ **Blog tanpa code** — tech articles butuh code demonstration
- ❌ **Portfolio gak responsive** — recruiter check dari HP
- ❌ **Gak update LinkedIn** — stale profile = invisible to recruiters
- ❌ **Waiting untuk "siap"** — ship portfolio sekarang, iterate nanti

## Link Cepat

- [Module README](.)
- [Sesi 01 — GitHub Profesional](01-github-profile.md)
- [Sesi 02 — Portfolio Website](02-portfolio-website.md)
- [Sesi 03 — LinkedIn & Career](03-linkedin-career.md)
- [Sesi 04 — Tech Community](04-tech-community.md)
- [Quiz](quiz.md)
- [GitHub Profile README Generator](https://rahuldkjain.github.io/gh-profile-readme-generator/)
- [Shields.io](https://shields.io/)
- [Vercel](https://vercel.com/)
- [Dev.to](https://dev.to/)
