# 📝 04. Blog CMS Sederhana

> **Level:** 📐 Intermediate | **Estimasi:** 2-3 sesi | **Modul Terkait:** 04-Backend (Express), 02-TS

---

## 🎯 Tujuan

Membangun Content Management System (CMS) blog sederhana menggunakan **Express.js** di backend dengan **EJS** sebagai template engine. Projek ini fokus pada:

- **Server-Side Rendering (SSR)**: Merender halaman HTML dari server menggunakan EJS
- **Routing RESTful**: Struktur route Express yang bersih (GET, POST, PUT, DELETE)
- **File-based Storage**: Operasi CRUD pada file JSON sebagai database
- **Markdown Content**: Menulis konten blog dengan format Markdown, render ke HTML
- **Search & Filter**: Search post berdasarkan judul/tag
- **Middleware**: Body parser, static files, error handling

Projek ini adalah jembatan dari frontend-only ke full-stack. Kamu akan paham bagaimana website dinamis bekerja sebelum data sampai ke browser.

---

## 🛠 Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| **Node.js** | Runtime JavaScript di server |
| **Express.js** | Web framework untuk routing dan middleware |
| **EJS** | Embedded JavaScript template engine |
| **fs/path (Node native)** | Read/write file JSON |
| **marked** atau **markdown-it** | Render Markdown ke HTML |
| **UUID** | Generate ID unik untuk post |
| **CSS (vanilla/Bootstrap)** | Styling (opsional: Tailwind via CDN) |

> **No database needed.** Semua data disimpan di file `data/posts.json`. Ini cukup untuk belajar dan prototyping.

---

## 📋 Requirements

### Fungsional

| # | Fitur | Wajib / Bonus |
|---|-------|---------------|
| 1 | Halaman utama: daftar semua blog post (terbaru di atas) | Wajib |
| 2 | Halaman detail: lihat satu post lengkap dengan Markdown yang sudah di-render | Wajib |
| 3 | Buat post baru (form dengan title, content, tags) | Wajib |
| 4 | Edit post yang sudah ada (form pre-filled) | Wajib |
| 5 | Hapus post (dengan konfirmasi) | Wajib |
| 6 | Tags: setiap post punya tags, tampilkan sebagai badge | Wajib |
| 7 | Cari post berdasarkan judul atau konten (search bar) | Wajib |
| 8 | Filter post berdasarkan tag | Wajib |
| 9 | Markdown support: konten post ditulis di Markdown, dirender sebagai HTML | Wajib |
| 10 | Timestamp: tampilkan tanggal post dibuat/diedit | Wajib |
| 11 | Pagination (5-10 post per halaman) | Bonus |
| 12 | Draft / Publish status | Bonus |
| 13 | Image upload (multer) | Bonus |
| 14 | Session-based login (cookie session, no database) | Bonus |
| 15 | RSS Feed | Bonus |

### Non-Fungsional

- **Data integrity**: File JSON tidak corrupt saat dua request datang bersamaan (baca/tulis sinkron dengan lock sederhana)
- **Error handling**: 404 untuk post tidak ditemukan, 500 untuk server error, middleware error handler
- **SEO-friendly**: Meta tags, semantic HTML, URL slug (opsional)
- **Loading state**: Tampilkan skeleton/list saat pertama load (CSR) atau kirim HTML langsung (SSR)
- **XSS prevention**: Jangan render HTML mentah dari input user — gunakan library Markdown yang sudah di-sanitize

---

## 🚀 Starter Code

### Struktur Folder

```
blog-cms/
├── data/
│   └── posts.json          # File database (JSON array)
├── public/
│   └── style.css           # Static files (CSS, images, JS)
├── views/
│   ├── partials/
│   │   ├── header.ejs      # Header + navbar
│   │   └── footer.ejs      # Footer + scripts
│   ├── index.ejs            # Halaman daftar post
│   ├── show.ejs             # Halaman detail post
│   ├── new.ejs              # Form buat post
│   └── edit.ejs             # Form edit post
├── index.js                 # Entry point (server)
└── package.json
```

### File Utama (`index.js`)

```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { marked } = require('marked');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');

// --- MIDDLEWARE ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// --- HELPERS ---
function readPosts() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writePosts(posts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

// --- ROUTES ---

// GET / — Daftar semua post (dengan search & tag filter)
app.get('/', (req, res) => {
  let posts = readPosts();
  const { search, tag } = req.query;

  // Filter by search
  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    );
  }

  // Filter by tag
  if (tag) {
    posts = posts.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  // Sort newest first
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.render('index', { posts, search: search || '', activeTag: tag || '' });
});

// GET /posts/:id — Detail satu post
app.get('/posts/:id', (req, res) => {
  const posts = readPosts();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).render('404', { message: 'Post tidak ditemukan' });

  // Render Markdown ke HTML
  const htmlContent = marked(post.content, { breaks: true });
  res.render('show', { post, htmlContent });
});

// GET /new — Form buat post baru
app.get('/new', (req, res) => {
  res.render('new', { post: null, errors: [] });
});

// POST /posts — Simpan post baru
app.post('/posts', (req, res) => {
  const { title, content, tags } = req.body;
  const errors = [];

  if (!title || !title.trim()) errors.push('Judul harus diisi');
  if (!content || !content.trim()) errors.push('Konten harus diisi');

  if (errors.length > 0) {
    return res.render('new', { post: { title, content, tags }, errors });
  }

  const posts = readPosts();
  const newPost = {
    id: uuidv4(),
    title: title.trim(),
    content: content.trim(),
    tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  posts.push(newPost);
  writePosts(posts);

  res.redirect(`/posts/${newPost.id}`);
});

// GET /posts/:id/edit — Form edit post
app.get('/posts/:id/edit', (req, res) => {
  const posts = readPosts();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).render('404', { message: 'Post tidak ditemukan' });
  res.render('edit', { post, errors: [] });
});

// PUT /posts/:id — Update post (via POST + _method=PUT)
app.post('/posts/:id', (req, res) => {
  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).render('404', { message: 'Post tidak ditemukan' });

  const { title, content, tags, _method } = req.body;

  // Support DELETE via POST with _method=DELETE
  if (_method === 'DELETE') {
    posts.splice(idx, 1);
    writePosts(posts);
    return res.redirect('/');
  }

  const errors = [];
  if (!title || !title.trim()) errors.push('Judul harus diisi');
  if (!content || !content.trim()) errors.push('Konten harus diisi');

  if (errors.length > 0) {
    return res.render('edit', {
      post: { ...posts[idx], title, content, tags },
      errors
    });
  }

  posts[idx] = {
    ...posts[idx],
    title: title.trim(),
    content: content.trim(),
    tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    updatedAt: new Date().toISOString(),
  };
  writePosts(posts);
  res.redirect(`/posts/${posts[idx].id}`);
});

// --- ERROR HANDLING ---
app.use((req, res) => {
  res.status(404).render('404', { message: 'Halaman tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('404', { message: 'Terjadi kesalahan server' });
});

// --- START ---
// Buat direktori data jika belum ada
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
  writePosts([]);
}

app.listen(PORT, () => {
  console.log(`🚀 Blog CMS running at http://localhost:${PORT}`);
});
```

### Template EJS (`views/index.ejs`)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog CMS</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <%- include('partials/header') %>

  <main class="container">
    <h1>📝 Blog Posts</h1>
    <a href="/new" class="btn btn-primary">+ Buat Post Baru</a>

    <!-- Search & Filter -->
    <form class="search-form" method="GET" action="/">
      <input type="text" name="search" placeholder="Cari post..." value="<%= search %>" />
      <button type="submit">🔍 Cari</button>
    </form>

    <!-- Post List -->
    <div class="posts">
      <% if (posts.length === 0) { %>
        <p class="empty">Belum ada post. <a href="/new">Buat yang pertama!</a></p>
      <% } %>

      <% posts.forEach(post => { %>
        <article class="post-card">
          <h2><a href="/posts/<%= post.id %>"><%= post.title %></a></h2>
          <div class="meta">
            <span class="date"><%= new Date(post.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) %></span>
            <div class="tags">
              <% post.tags.forEach(tag => { %>
                <a href="/?tag=<%= tag %>" class="tag">#<%= tag %></a>
              <% }) %>
            </div>
          </div>
          <p class="excerpt"><%= post.content.substring(0, 200) %>...</p>
          <a href="/posts/<%= post.id %>" class="read-more">Baca selengkapnya →</a>
        </article>
      <% }) %>
    </div>
  </main>

  <%- include('partials/footer') %>
</body>
</html>
```

### Template EJS (`views/show.ejs`)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%= post.title %> — Blog CMS</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <%- include('partials/header') %>

  <main class="container">
    <article class="post-full">
      <h1><%= post.title %></h1>
      <div class="meta">
        <span class="date"><%= new Date(post.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) %></span>
        <div class="tags">
          <% post.tags.forEach(tag => { %>
            <a href="/?tag=<%= tag %>" class="tag">#<%= tag %></a>
          <% }) %>
        </div>
      </div>

      <div class="content">
        <%- htmlContent %>
      </div>

      <div class="actions">
        <a href="/posts/<%= post.id %>/edit" class="btn btn-secondary">✏️ Edit</a>
        <form method="POST" action="/posts/<%= post.id %>" style="display:inline;">
          <input type="hidden" name="_method" value="DELETE" />
          <button type="submit" class="btn btn-danger" onclick="return confirm('Yakin ingin menghapus post ini?')">🗑 Hapus</button>
        </form>
        <a href="/" class="btn">← Kembali</a>
      </div>
    </article>
  </main>

  <%- include('partials/footer') %>
</body>
</html>
```

### Setup project

```bash
mkdir blog-cms && cd blog-cms
npm init -y
npm install express ejs uuid marked
mkdir -p data views/partials public
touch index.js
```

---

## 🖼 Expected Output

Blog CMS akan berjalan di `http://localhost:3000` dengan tampilan:

**Halaman Utama (`/`)**:
- Navbar dengan judul "Blog CMS"
- Tombol "+ Buat Post Baru" di kanan atas
- Search bar untuk mencari post
- Daftar post dalam bentuk card: judul (link), tanggal, tags (badge), excerpt 200 karakter
- Kalau belum ada post: pesan kosong dengan link buat post

**Halaman Detail (`/posts/:id`)**:
- Judul post besar di atas
- Meta info: tanggal + tags
- Konten post yang sudah di-render dari Markdown (heading, bold, code block, list, gambar)
- Tombol Edit dan Hapus (dengan konfirmasi)

**Halaman New/Edit**:
- Form dengan input title, textarea content, input tags (dipisah koma)
- Kalau ada error validasi, muncul pesan error merah di atas form
- Nilai input tetap terisi (tidak hilang)

**Data persistence**: Semua post tersimpan di `data/posts.json`. Restart server tidak menghilangkan data.

---

## 💡 Latihan Tambahan

1. **Authentication**: Cookie-session login sederhana (admin: admin / password: admin)
2. **Draft/Publish**: Tambah status post — draft tidak muncul di halaman utama
3. **Image Upload**: Gunakan `multer` untuk upload gambar, simpan di `public/uploads/`
4. **Pagination**: Tambah query `?page=2` — 5 post per halaman
5. **Slug URL**: Ganti ID dengan slug dari judul (`/posts/judul-post`)
6. **RSS Feed**: Route `/rss.xml` yang generate XML feed
7. **Comment**: Simpan komentar di file JSON terpisah (`data/comments.json`)
8. **API Endpoint**: Tambah route `/api/posts` yang return JSON (REST API)
9. **Markdown Editor**: Tambah WYSIWYG atau editor Markdown di frontend (CodeMirror, SimpleMDE)
10. **Tailwind CSS**: Ganti styling vanilla dengan Tailwind via CDN

---

## 📝 Rubrik Penilaian

| Kriteria | Belum (0) | Cukup (1) | Baik (2) | Istimewa (3) |
|----------|-----------|-----------|----------|--------------|
| **Routing** | < 3 route | GET/POST untuk list + detail | + CRUD lengkap (GET/POST/PUT/DELETE) | + Error handler 404/500 |
| **CRUD Post** | Kurang dari 3 operasi | Create + Read | + Update + Delete | + Validasi form + error state |
| **Markdown** | Tidak support | Render basic (heading, bold) | + Code block + list + link | + Sanitize HTML + syntax highlight |
| **Tags & Search** | Tidak ada | Tags sebagai teks | + Filter by tag | + Search + filter + pagination |
| **UI/UX** | HTML polos | Layout rapi + CSS | + Responsive + navbar | + Dark mode + animasi |
| **Data Storage** | In-memory | JSON file (read/write) | + Pretty print + backup | + Atomic write (tidak corrupt) |

---

## 📚 Referensi

- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [EJS Docs](https://ejs.co/#docs)
- [marked Library](https://marked.js.org/)
- [MDN: fs module](https://nodejs.org/api/fs.html)
- [UUID npm](https://www.npmjs.com/package/uuid)
