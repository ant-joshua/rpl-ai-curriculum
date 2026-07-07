---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🚀 Portfolio Project Series"
footer: "Sesi 01: Landing Page"
---

<!-- _class: title -->
# Sesi 01: Landing Page Portfolio

> **Project 1 dari 5** — Landing page personal portfolio dengan HTML, CSS, dan Tailwind CSS

---

## 🎯 Tujuan

- Membangun landing page personal portfolio dari nol
- Menguasai Tailwind CSS utility-first framework
- Membuat layout responsif (mobile-first)
- Menyusun section: Hero, About, Skills, Projects, Contact
- Mendeploy ke Vercel atau Netlify

---

## 📋 Deliverable

- Live URL: `https://namakamu.vercel.app` atau `namakamu.netlify.app`
- GitHub repo: `github.com/namakamu/portfolio`
- Domain custom (opsional)

---

## 🧰 Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| HTML5 | Struktur halaman |
| Tailwind CSS (CDN) | Styling utility |
| Font Awesome / Heroicons | Ikon skills & sosial media |
| Formspree / Netlify Forms | Contact form backend |
| Vercel / Netlify | Hosting & deploy |

---

## 🏗️ Wireframe

```
┌──────────────────────────────────────┐
│          NAVBAR (sticky)             │
│   Logo    Home│About│Skills│Projects│Contact  │
├──────────────────────────────────────┤
│                                      │
│            HERO SECTION              │
│     Nama · Tagline · CTA Button     │
│                                      │
├──────────────────────────────────────┤
│                                      │
│           ABOUT SECTION              │
│    Foto  │  Paragraf singkat        │
│                                      │
├──────────────────────────────────────┤
│                                      │
│           SKILLS SECTION             │
│    [Ikon] [Ikon] [Ikon] [Ikon]      │
│    [Ikon] [Ikon] [Ikon] [Ikon]      │
│                                      │
├──────────────────────────────────────┤
│                                      │
│          PROJECTS GRID               │
│    ┌──────┐  ┌──────┐  ┌──────┐    │
│    │Card 1│  │Card 2│  │Card 3│    │
│    └──────┘  └──────┘  └──────┘    │
│                                      │
├──────────────────────────────────────┤
│                                      │
│           CONTACT FORM               │
│    Nama│Email│Pesan │[Kirim]        │
│                                      │
├──────────────────────────────────────┤
│                                      │
│             FOOTER                   │
│   Sosial Media · Copyright          │
└──────────────────────────────────────┘
```

---

## 📝 Langkah 1: Setup Proyek

Buat folder dan file index.html:

```bash
mkdir portfolio && cd portfolio
touch index.html
```

Gunakan Tailwind via CDN — tambahkan di `<head>`:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nama Kamu — Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Heroicons CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
```

---

## 📝 Langkah 2: Navbar

Navbar sticky dengan backdrop blur:

```html
<nav class="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
    <div class="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" class="text-2xl font-bold text-gray-800">NamaKamu</a>
        <div class="hidden md:flex gap-8 text-gray-600 font-medium">
            <a href="#about" class="hover:text-blue-600 transition">About</a>
            <a href="#skills" class="hover:text-blue-600 transition">Skills</a>
            <a href="#projects" class="hover:text-blue-600 transition">Projects</a>
            <a href="#contact" class="hover:text-blue-600 transition">Contact</a>
        </div>
        <!-- Mobile hamburger -->
        <button id="menu-btn" class="md:hidden text-2xl">
            <i class="fas fa-bars"></i>
        </button>
    </div>
    <!-- Mobile menu -->
    <div id="mobile-menu" class="hidden md:hidden px-6 pb-4">
        <a href="#about" class="block py-2 text-gray-600">About</a>
        <a href="#skills" class="block py-2 text-gray-600">Skills</a>
        <a href="#projects" class="block py-2 text-gray-600">Projects</a>
        <a href="#contact" class="block py-2 text-gray-600">Contact</a>
    </div>
</nav>

<script>
    document.getElementById('menu-btn').addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
</script>
```

---

## 📝 Langkah 3: Hero Section

```html
<section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="text-center px-6">
        <img src="https://avatars.githubusercontent.com/u/12345678" alt="Foto Profil"
             class="w-32 h-32 rounded-full mx-auto mb-6 shadow-lg object-cover" />
        <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Halo, Saya <span class="text-blue-600">Nama Kamu</span>
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Fullstack Developer & AI Enthusiast. Saya membangun aplikasi web modern
            dengan dampak nyata.
        </p>
        <div class="flex gap-4 justify-center">
            <a href="#projects"
               class="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg">
                Lihat Project
            </a>
            <a href="#contact"
               class="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-blue-600 hover:text-blue-600 transition">
                Hubungi Saya
            </a>
        </div>
        <div class="flex gap-6 justify-center mt-8 text-2xl text-gray-500">
            <a href="#"><i class="fab fa-github hover:text-gray-900 transition"></i></a>
            <a href="#"><i class="fab fa-linkedin hover:text-blue-700 transition"></i></a>
            <a href="#"><i class="fab fa-twitter hover:text-blue-400 transition"></i></a>
        </div>
    </div>
</section>
```

---

## 📝 Langkah 4: About Section

```html
<section id="about" class="py-20 px-6 max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-4">Tentang Saya</h2>
    <div class="w-20 h-1 bg-blue-600 mx-auto mb-12 rounded"></div>
    <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
            <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600"
                 alt="Working" class="rounded-2xl shadow-lg" />
        </div>
        <div>
            <p class="text-gray-600 leading-relaxed mb-4">
                Saya adalah seorang developer dengan pengalaman dalam membangun aplikasi web
                dari frontend hingga backend. Saya percaya teknologi harus memberikan solusi,
                bukan sekadar pamer fitur.
            </p>
            <p class="text-gray-600 leading-relaxed mb-6">
                Saat ini saya fokus pada fullstack JavaScript/TypeScript, cloud deployment,
                dan AI integration. Saya selalu ingin belajar hal baru dan berbagi ilmu.
            </p>
            <a href="#" class="text-blue-600 font-semibold hover:underline">
                Download CV →
            </a>
        </div>
    </div>
</section>
```

---

## 📝 Langkah 5: Skills Section

Gunakan grid ikon dengan label:

```html
<section id="skills" class="py-20 bg-gray-50">
    <div class="max-w-5xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-4">Skills & Tools</h2>
        <div class="w-20 h-1 bg-blue-600 mx-auto mb-12 rounded"></div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div class="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
                <i class="fab fa-html5 text-5xl text-orange-500 mb-3"></i>
                <p class="font-semibold text-gray-700">HTML</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
                <i class="fab fa-css3-alt text-5xl text-blue-500 mb-3"></i>
                <p class="font-semibold text-gray-700">CSS</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
                <i class="fab fa-js text-5xl text-yellow-500 mb-3"></i>
                <p class="font-semibold text-gray-700">JavaScript</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
                <i class="fab fa-react text-5xl text-cyan-500 mb-3"></i>
                <p class="font-semibold text-gray-700">React</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
                <i class="fab fa-node text-5xl text-green-600 mb-3"></i>
                <p class="font-semibold text-gray-700">Node.js</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
                <i class="fab fa-python text-5xl text-blue-600 mb-3"></i>
                <p class="font-semibold text-gray-700">Python</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
                <i class="fas fa-database text-5xl text-gray-700 mb-3"></i>
                <p class="font-semibold text-gray-700">PostgreSQL</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition">
                <i class="fab fa-docker text-5xl text-blue-400 mb-3"></i>
                <p class="font-semibold text-gray-700">Docker</p>
            </div>
        </div>
    </div>
</section>
```

---

## 📝 Langkah 6: Projects Grid

```html
<section id="projects" class="py-20 px-6 max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-4">Project Terbaru</h2>
    <div class="w-20 h-1 bg-blue-600 mx-auto mb-12 rounded"></div>
    <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop"
                 alt="Project 1" class="w-full h-48 object-cover" />
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Project 1</h3>
                <p class="text-gray-600 mb-4">Deskripsi singkat project pertama.</p>
                <div class="flex gap-2 mb-4">
                    <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">React</span>
                    <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Tailwind</span>
                </div>
                <a href="#" class="text-blue-600 font-semibold hover:underline">Lihat Detail →</a>
            </div>
        </div>
        <!-- Ulangi untuk project 2 dan 3 -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop"
                 alt="Project 2" class="w-full h-48 object-cover" />
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Project 2</h3>
                <p class="text-gray-600 mb-4">Deskripsi singkat project kedua.</p>
                <div class="flex gap-2 mb-4">
                    <span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">Express</span>
                    <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">Prisma</span>
                </div>
                <a href="#" class="text-blue-600 font-semibold hover:underline">Lihat Detail →</a>
            </div>
        </div>
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop"
                 alt="Project 3" class="w-full h-48 object-cover" />
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Project 3</h3>
                <p class="text-gray-600 mb-4">Deskripsi singkat project ketiga.</p>
                <div class="flex gap-2 mb-4">
                    <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Next.js</span>
                    <span class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">Mastra AI</span>
                </div>
                <a href="#" class="text-blue-600 font-semibold hover:underline">Lihat Detail →</a>
            </div>
        </div>
    </div>
</section>
```

---

## 📝 Langkah 7: Contact Form

Gunakan Formspree sebagai backend form:

```html
<section id="contact" class="py-20 bg-gray-50">
    <div class="max-w-2xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-4">Hubungi Saya</h2>
        <div class="w-20 h-1 bg-blue-600 mx-auto mb-12 rounded"></div>
        <form action="https://formspree.io/f/yourFormID" method="POST"
              class="bg-white p-8 rounded-2xl shadow-md">
            <div class="mb-6">
                <label for="name" class="block text-gray-700 font-medium mb-2">Nama</label>
                <input type="text" id="name" name="name" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
            </div>
            <div class="mb-6">
                <label for="email" class="block text-gray-700 font-medium mb-2">Email</label>
                <input type="email" id="email" name="_replyto" required
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
            </div>
            <div class="mb-6">
                <label for="message" class="block text-gray-700 font-medium mb-2">Pesan</label>
                <textarea id="message" name="message" rows="5" required
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"></textarea>
            </div>
            <button type="submit"
                    class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
                Kirim Pesan
            </button>
        </form>
    </div>
</section>
```

> **Catatan:** Daftar di [Formspree](https://formspree.io) dapatkan form ID, ganti `yourFormID`.

---

## 📝 Langkah 8: Footer

```html
<footer class="bg-gray-900 text-white py-8">
    <div class="max-w-5xl mx-auto px-6 text-center">
        <div class="flex gap-6 justify-center mb-4 text-2xl">
            <a href="#" class="hover:text-blue-400 transition"><i class="fab fa-github"></i></a>
            <a href="#" class="hover:text-blue-400 transition"><i class="fab fa-linkedin"></i></a>
            <a href="#" class="hover:text-blue-400 transition"><i class="fab fa-twitter"></i></a>
            <a href="#" class="hover:text-blue-400 transition"><i class="fab fa-instagram"></i></a>
        </div>
        <p class="text-gray-400">© 2025 Nama Kamu. All rights reserved.</p>
    </div>
</footer>
```

---

## 📝 Langkah 9: Deploy ke Vercel

1. Push ke GitHub:
```bash
git init
git add .
git commit -m "feat: portfolio landing page"
git remote add origin https://github.com/namakamu/portfolio.git
git push -u origin main
```

2. Buka [vercel.com](https://vercel.com) → Import GitHub repo

3. Vercel auto-detect static HTML → deploy selesai dalam 30 detik

4. Dapatkan URL: `https://portfolio-xxx.vercel.app`

> ![Screenshot](https://via.placeholder.com/800x400?text=Vercel+Deploy+Success)

---

## 📝 Langkah 10: Deploy ke Netlify (Alternatif)

1. Push ke GitHub
2. Buka [netlify.com](https://netlify.com) → Add new site → Import from GitHub
3. Deploy settings: Branch `main`, Publish directory `/`
4. Deploy

---

## 🔧 Custom Domain (Opsional)

1. Beli domain di Niagahoster / Cloudflare
2. Di Vercel: Project → Settings → Domains → tambah domain
3. Di Netlify: Site settings → Domain management → Add custom domain
4. Setting DNS: A record atau CNAME sesuai petunjuk

---

## 📸 Screenshot Final

> ![Portfolio Desktop](https://via.placeholder.com/1200x800?text=Portfolio+Desktop+View)
>
> ![Portfolio Mobile](https://via.placeholder.com/400x800?text=Portfolio+Mobile+View)

---

## 🧪 Latihan

1. **Tambahkan animasi scroll** — gunakan [AOS Library](https://michalsnik.github.io/aos/)
2. **Dark mode toggle** — implementasikan dengan `class="dark"` dan Tailwind `dark:` prefix
3. **Testimonial section** — tambahkan section testimoni dengan layout carousel
4. **Blog section** — hubungkan dengan dev.to API untuk menampilkan artikel terbaru
5. **SEO meta tags** — tambahkan Open Graph dan Twitter Card meta tags
6. **Performance** — ukur dengan Lighthouse, target score 90+

---

## ✅ Checklist

- [ ] Hero section dengan nama, tagline, CTA
- [ ] About section dengan foto dan deskripsi
- [ ] Skills section dengan ikon dan label
- [ ] Projects grid minimal 3 card
- [ ] Contact form dengan Formspree
- [ ] Navbar sticky + mobile responsive
- [ ] Footer dengan sosial media
- [ ] Deploy ke Vercel/Netlify
- [ ] GitHub repo dengan README

---

> **Project 1 selesai!** Lanjut ke [Sesi 02: Bookshelf CRUD API](./02-crud-api.md)
