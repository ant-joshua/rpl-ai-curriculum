---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — Modul 44: Digital Portfolio & Personal Branding"
footer: "Sesi 02: Portfolio Website"
---

<!-- _class: title -->
# Sesi 2: Portfolio Website

> Bangun portfolio website responsif, lengkap dengan case study proyek, lalu deploy ke Vercel/Netlify.

**Durasi**: 4 jam | **Output**: Portfolio website live

---

## 2.1 Struktur Portfolio Website

Portfolio website profesional terdiri dari komponen berikut:

```
portfolio/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── projects/
│   ├── project-1.html
│   ├── project-2.html
│   └── project-3.html
├── assets/
│   ├── images/
│   │   ├── hero-bg.jpg
│   │   ├── profile.jpg
│   │   ├── project-1-screenshot.png
│   │   └── ...
│   └── resume.pdf
└── README.md
```

## 2.2 Komponen Portfolio

### Hero Section

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nama Kamu — Portfolio</title>
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body>
  <!-- Navigation -->
  <nav class="navbar">
    <div class="container">
      <a href="#" class="logo">Nama<span>Kamu</span></a>
      <ul class="nav-links" id="navLinks">
        <li><a href="#hero">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div class="hamburger" id="hamburger">
        <span></span><span></span><span></span>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section id="hero" class="hero">
    <div class="container">
      <div class="hero-content">
        <p class="hero-greeting">Hello, I'm</p>
        <h1 class="hero-name">Nama Kamu</h1>
        <h2 class="hero-title">Frontend Developer</h2>
        <p class="hero-description">
          Saya membangun aplikasi web modern dengan React, TypeScript, dan Tailwind CSS.
          Fokus pada performa, aksesibilitas, dan user experience.
        </p>
        <div class="hero-cta">
          <a href="#projects" class="btn btn-primary">Lihat Project</a>
          <a href="#contact" class="btn btn-secondary">Hubungi Saya</a>
        </div>
        <div class="hero-social">
          <a href="https://github.com/username"><i class="fab fa-github"></i></a>
          <a href="https://linkedin.com/in/username"><i class="fab fa-linkedin-in"></i></a>
          <a href="https://twitter.com/username"><i class="fab fa-twitter"></i></a>
          <a href="https://dev.to/username"><i class="fab fa-dev"></i></a>
        </div>
      </div>
      <div class="hero-image">
        <img src="assets/images/profile.jpg" alt="Nama Kamu" />
      </div>
    </div>
  </section>
```

### CSS Styling

```css
/* css/style.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6c63ff;
  --primary-dark: #5a52d5;
  --secondary: #ff6584;
  --dark: #1a1a2e;
  --gray: #6b7280;
  --light: #f3f4f6;
  --white: #ffffff;
  --transition: all 0.3s ease;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--dark);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark);
  text-decoration: none;
}

.logo span {
  color: var(--primary);
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--gray);
  font-weight: 500;
  transition: var(--transition);
}

.nav-links a:hover {
  color: var(--primary);
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: var(--dark);
  transition: var(--transition);
}

/* Hero Section */
.hero {
  padding: 8rem 0 4rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero .container {
  display: flex;
  align-items: center;
  gap: 4rem;
}

.hero-content {
  flex: 1;
}

.hero-greeting {
  font-size: 1.1rem;
  color: var(--primary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.hero-name {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-title {
  font-size: 1.8rem;
  color: var(--gray);
  font-weight: 400;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--gray);
  max-width: 500px;
  margin-bottom: 2rem;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
  display: inline-block;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(108, 99, 255, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-secondary:hover {
  background: var(--primary);
  color: var(--white);
}

.hero-social {
  display: flex;
  gap: 1rem;
}

.hero-social a {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dark);
  font-size: 1.2rem;
  transition: var(--transition);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.hero-social a:hover {
  background: var(--primary);
  color: var(--white);
  transform: translateY(-3px);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
}

.hero-image img {
  width: 350px;
  height: 350px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid var(--white);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* About Section */
#about {
  padding: 5rem 0;
  background: var(--white);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background: var(--primary);
  margin: 0.5rem auto;
  border-radius: 2px;
}

.about-content {
  display: flex;
  gap: 3rem;
  align-items: center;
}

.about-text {
  flex: 1;
  font-size: 1.1rem;
  color: var(--gray);
}

.about-text p {
  margin-bottom: 1rem;
}

.about-stats {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 2rem;
  background: var(--light);
  border-radius: 10px;
  transition: var(--transition);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary);
}

.stat-label {
  color: var(--gray);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Projects Section */
#projects {
  padding: 5rem 0;
  background: var(--light);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.project-card {
  background: var(--white);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: var(--transition);
}

.project-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.project-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.project-info {
  padding: 1.5rem;
}

.project-title {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.project-desc {
  color: var(--gray);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-tag {
  padding: 0.25rem 0.75rem;
  background: #e8e5ff;
  color: var(--primary);
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
}

.project-links {
  display: flex;
  gap: 1rem;
}

.project-links a {
  color: var(--gray);
  text-decoration: none;
  font-size: 0.9rem;
  transition: var(--transition);
}

.project-links a:hover {
  color: var(--primary);
}

/* Skills Section */
#skills {
  padding: 5rem 0;
  background: var(--white);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.skill-category {
  padding: 2rem;
  background: var(--light);
  border-radius: 10px;
}

.skill-category h3 {
  margin-bottom: 1.5rem;
  color: var(--dark);
}

.skill-item {
  margin-bottom: 1rem;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.skill-bar {
  height: 8px;
  background: #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 4px;
  transition: width 1s ease;
}

/* Contact Section */
#contact {
  padding: 5rem 0;
  background: var(--light);
}

.contact-container {
  display: flex;
  gap: 3rem;
}

.contact-form {
  flex: 1;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
}

.form-group textarea {
  height: 150px;
  resize: vertical;
}

.contact-info {
  flex: 1;
  padding: 2rem;
  background: var(--white);
  border-radius: 10px;
}

.contact-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.contact-item i {
  font-size: 1.5rem;
  color: var(--primary);
  width: 40px;
  text-align: center;
}

.contact-item p {
  color: var(--gray);
}

/* Footer */
footer {
  background: var(--dark);
  color: var(--white);
  text-align: center;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: var(--white);
    flex-direction: column;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .nav-links.active {
    display: flex;
  }

  .hamburger {
    display: flex;
  }

  .hero .container {
    flex-direction: column-reverse;
    text-align: center;
  }

  .hero-name {
    font-size: 2.5rem;
  }

  .hero-description {
    margin: 0 auto 2rem;
  }

  .hero-cta {
    justify-content: center;
  }

  .hero-social {
    justify-content: center;
  }

  .hero-image img {
    width: 250px;
    height: 250px;
  }

  .about-content {
    flex-direction: column;
    text-align: center;
  }

  .contact-container {
    flex-direction: column;
  }
}
```

### JavaScript (Mobile Menu, Smooth Scroll, Animasi)

```javascript
// js/main.js

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
  } else {
    navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  }
});

// Skill Bar Animation on Scroll
const skillBars = document.querySelectorAll('.skill-progress');

const animateSkills = () => {
  skillBars.forEach(bar => {
    const width = bar.getAttribute('data-progress') || bar.style.width;
    if (width) {
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = width;
      }, 200);
    }
  });
};

// Intersection Observer for Animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains('project-card')) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
      if (entry.target.id === 'skills') {
        animateSkills();
      }
    }
  });
}, { threshold: 0.1 });

// Observe elements
document.querySelectorAll('.project-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'all 0.5s ease';
  observer.observe(card);
});

observer.observe(document.querySelector('#skills'));
```

## 2.3 Tech Stack Badges untuk Portfolio

Gunakan baris berikut di bagian About atau Skills:

```html
<div class="tech-stack">
  <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" />
</div>
```

## 2.4 Project Case Study Pages

Buat halaman detail untuk setiap proyek — format ini mirip case study portofolio profesional.

### Template Case Study

```html
<!-- projects/project-1.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Project Name — Case Study</title>
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <style>
    .case-study {
      padding: 8rem 0 4rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .case-study h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .case-study h2 { font-size: 1.8rem; margin: 2rem 0 1rem; }
    .case-study p { color: var(--gray); margin-bottom: 1rem; line-height: 1.8; }
    .case-study img { width: 100%; border-radius: 10px; margin: 1.5rem 0; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
    .case-study .meta { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .case-study .meta a { padding: 0.5rem 1.5rem; border-radius: 50px; text-decoration: none; font-weight: 600; }
    .case-study .meta .live { background: var(--primary); color: white; }
    .case-study .meta .repo { background: var(--dark); color: white; }
    .case-study ul { padding-left: 1.5rem; margin-bottom: 1rem; }
    .case-study ul li { color: var(--gray); margin-bottom: 0.5rem; }
    .tech-badge { display: inline-block; padding: 0.3rem 0.8rem; background: #e8e5ff; color: var(--primary); border-radius: 5px; font-size: 0.85rem; margin: 0.25rem; }
  </style>
</head>
<body>
  <!-- Navbar (sama seperti index.html) -->
  <nav class="navbar">
    <div class="container">
      <a href="../index.html" class="logo">Nama<span>Kamu</span></a>
      <ul class="nav-links">
        <li><a href="../index.html#hero">Home</a></li>
        <li><a href="../index.html#projects">Projects</a></li>
        <li><a href="../index.html#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <!-- Case Study Content -->
  <div class="container">
    <article class="case-study">
      <h1>Nama Proyek</h1>

      <div class="meta">
        <a href="https://project-demo.vercel.app" class="live" target="_blank"><i class="fas fa-external-link-alt"></i> Live Demo</a>
        <a href="https://github.com/username/project" class="repo" target="_blank"><i class="fab fa-github"></i> Source Code</a>
      </div>

      <img src="../assets/images/project-screenshot.png" alt="Project Screenshot" />

      <h2>📌 Latar Belakang</h2>
      <p>
        Jelaskan masalah yang ingin diselesaikan. Ceritakan konteksnya — kenapa proyek ini dibuat,
        siapa target user, apa pain point yang dijawab.
      </p>

      <h2>🎯 Tujuan</h2>
      <p>
        Apa goals dari proyek ini? Misal: mengurangi waktu loading, meningkatkan engagement,
        mengotomatisasi workflow tertentu.
      </p>

      <h2>⚙️ Solusi</h2>
      <p>
        Jelaskan pendekatan teknis yang dipakai. Arsitektur, stack pilihan, alasan kenapa
        memilih teknologi tertentu.
      </p>

      <h2>🛠 Tech Stack</h2>
      <div>
        <span class="tech-badge">React</span>
        <span class="tech-badge">TypeScript</span>
        <span class="tech-badge">Tailwind CSS</span>
        <span class="tech-badge">Firebase</span>
        <span class="tech-badge">Vercel</span>
      </div>

      <h2>📸 Screenshot & Demo</h2>
      <img src="../assets/images/project-feature-1.png" alt="Feature 1" />
      <p>Deskripsi fitur 1.</p>
      <img src="../assets/images/project-feature-2.png" alt="Feature 2" />
      <p>Deskripsi fitur 2.</p>

      <h2>📊 Hasil & Dampak</h2>
      <ul>
        <li>✅ Waktu loading turun 40% setelah optimasi</li>
        <li>✅ 500+ pengguna aktif dalam 2 bulan pertama</li>
        <li>✅ 95% Lighthouse performance score</li>
      </ul>

      <h2>💡 Pelajaran</h2>
      <p>
        Refleksi — apa yang dipelajari, tantangan terbesar, apa yang akan dilakukan berbeda
        jika mengulang dari awal.
      </p>

      <h2>🔗 Links</h2>
      <ul>
        <li>Live: <a href="https://project-demo.vercel.app">https://project-demo.vercel.app</a></li>
        <li>Repo: <a href="https://github.com/username/project">https://github.com/username/project</a></li>
      </ul>
    </article>
  </div>

  <!-- Footer -->
  <footer>
    <p>&copy; 2026 Nama Kamu. Built with ❤️</p>
  </footer>
</body>
</html>
```

## 2.5 Deployment ke Vercel / Netlify

### Vercel (Recommended)

1. Push kode ke GitHub
2. Buka [vercel.com](https://vercel.com) → Login with GitHub
3. Klik **Add New → Project**
4. Pilih repo portfolio kamu
5. Settings defaults — langsung **Deploy**
6. Selesai! URL: `https://portfolio-xyz.vercel.app`

### Netlify

1. Push kode ke GitHub
2. Buka [netlify.com](https://netlify.com) → Login with GitHub
3. Klik **Add new site → Import an existing project**
4. Pilih repo → **Deploy site**
5. Selesai! URL: `https://random-name.netlify.app`

### Custom Domain

1. Beli domain di Niagahoster / Namecheap / Cloudflare
2. Di dashboard Vercel/Netlify:
   - Vercel: Project → Settings → Domains → add domain
   - Netlify: Site settings → Domain management → add custom domain
3. Update nameservers/ DNS records sesuai petunjuk
4. Tunggu propagasi DNS (5 menit - 24 jam)

---

## ✍️ Latihan

### Latihan 1: Hero + About Section

Buat halaman portfolio dengan:

- Navbar sticky dengan link navigasi
- Hero section: nama, title, deskripsi, CTA buttons, sosial media links
- About section: bio singkat, stat cards (pengalaman, proyek, sertifikasi)
- Styling responsive mobile-first

**Kriteria**: Layout menggunakan flexbox/grid, mobile responsive, navbar transparan di atas lalu solid saat scroll.

### Latihan 2: Project Cards + Skills

Tambahkan ke portfolio:

- Projects section dengan grid 3 project cards
- Masing-masing card: gambar, judul, deskripsi, tech tags, link repo + live
- Skills section dengan progress bar animasi
- Minimal 2 kategori skill (Frontend, Backend, Tools, dll)

**Kriteria**: Project cards ada hover effect (scale/translate), skill bar animasi muncul saat discroll.

### Latihan 3: Contact Form + Case Study Page

Buat:

- Contact form dengan nama, email, subjek, pesan
- Style form yang konsisten dengan tema portfolio
- Footer dengan copyright
- Minimal 1 halaman case study proyek lengkap (problem → solusi → hasil → link)

**Kriteria**: Form input ada focus state styling, case study page memiliki semua section (latar belakang, tujuan, solusi, tech stack, hasil, pelajaran).

### Latihan 4: Deploy Portfolio + Custom Domain

- Push portfolio ke GitHub repo
- Deploy ke Vercel atau Netlify
- (Opsional) Hubungkan custom domain
- Kirim link portfolio yang sudah live

**Kriteria**: Portfolio live dan bisa diakses publik, semua link (navigasi, sosial media, project, contact) berfungsi, layout responsif di mobile & desktop.
