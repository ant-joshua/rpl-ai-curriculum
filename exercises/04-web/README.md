# 🌐 Latihan Web Development — HTML Semantic, CSS Flexbox/Grid, DOM, Fetch & localStorage

> Latihan dimulai dari markup dasar sampe web app interaktif. Semua starter code siap dibuka langsung di browser.

---

## Level 1: Basic — HTML Semantic & CSS Layout

### 1. Semantic HTML Landing Page
Bikin struktur halaman pake elemen semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).

```html
<!-- Starter code: index.html -->
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Landing Page Saya</title>
</head>
<body>
  <!-- TODO: Tambahin header dengan navigasi -->
  <header>
    <nav>
      <!-- link: Home, Tentang, Layanan, Kontak -->
    </nav>
  </header>

  <!-- TODO: Main content -->
  <main>
    <section id="hero">
      <h1>Selamat Datang</h1>
      <p>Deskripsi singkat...</p>
    </section>
    <section id="features">
      <!-- 3 article cards pake flexbox -->
    </section>
  </main>

  <!-- TODO: Footer -->
  <footer>
    <p>&copy; 2025 Namaku</p>
  </footer>
</body>
</html>
```

**Expected:** Struktur semantic valid — validator W3C no error.

### 2. CSS Flexbox — Navigation Bar
Buat navbar responsif pake flexbox.

```html
<!-- Starter code -->
<style>
  /* TODO: Flexbox layout */
  .navbar {
    display: ___;
    justify-content: ___; /* space-between */
    align-items: ___;
    background: #333;
    padding: 1rem 2rem;
  }

  .nav-links {
    display: ___;
    gap: ___;
    list-style: none;
  }

  .nav-links a {
    color: white;
    text-decoration: none;
  }

  /* Mobile: stack vertikal */
  @media (max-width: 768px) {
    .navbar {
      flex-direction: ___;
    }
    .nav-links {
      flex-direction: ___;
    }
  }
</style>

<nav class="navbar">
  <div class="logo">MyApp</div>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Services</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
```

### 3. CSS Grid — Card Gallery
Bikin responsive grid gallery untuk card produk.

```html
<!-- Starter code -->
<style>
  .gallery {
    display: ___;
    grid-template-columns: repeat(___, 1fr); /* responsive columns */
    gap: ___;
    padding: 2rem;
  }

  .card {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  /* 3 kolom di desktop, 2 di tablet, 1 di mobile */
  @media (max-width: 1024px) {
    .gallery { grid-template-columns: repeat(___, 1fr); }
  }
  @media (max-width: 768px) {
    .gallery { grid-template-columns: ___; }
  }
</style>

<div class="gallery">
  <div class="card"><h3>Produk 1</h3><p>Deskripsi...</p></div>
  <div class="card"><h3>Produk 2</h3><p>Deskripsi...</p></div>
  <div class="card"><h3>Produk 3</h3><p>Deskripsi...</p></div>
  <div class="card"><h3>Produk 4</h3><p>Deskripsi...</p></div>
  <div class="card"><h3>Produk 5</h3><p>Deskripsi...</p></div>
  <div class="card"><h3>Produk 6</h3><p>Deskripsi...</p></div>
</div>
```

### 4. CSS Positioning & Z-Index
Bikin modal overlay dengan absolute positioning.

```css
/* Starter code */
.modal-overlay {
  position: ___;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ___; /* harus di atas konten lain */
}

.modal-content {
  position: ___;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
}

.close-btn {
  position: ___;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
```

### 5. CSS Variables & Theming
Implementasi dark mode toggle pake CSS custom properties.

```css
/* Starter code */
:root {
  --bg: #ffffff;
  --text: #333333;
  --primary: #007bff;
  --card-bg: #f5f5f5;
  --transition: 0.3s ease;
}

[data-theme="dark"] {
  --bg: #1a1a2e;
  --text: #e0e0e0;
  --primary: #4da6ff;
  --card-bg: #16213e;
}

body {
  background: var(___);
  color: var(___);
  transition: var(___);
}

.card {
  background: var(___);
}
```

---

## Level 2: Intermediate — DOM Manipulation

### 6. DOM Selectors & Events
Buat counter app dengan tombol increment, decrement, reset.

```html
<!-- Starter code -->
<div id="counter-app">
  <h2>Counter: <span id="count">0</span></h2>
  <button id="increment">+</button>
  <button id="decrement">-</button>
  <button id="reset">Reset</button>
</div>

<script>
  const countEl = document.getElementById('count');
  let count = 0;

  document.getElementById('increment').addEventListener('click', () => {
    count++;
    countEl.textContent = count;
  });

  // TODO: Tambah decrement & reset handler
</script>
```

### 7. Form Validation
Validasi form registrasi di client-side.

```html
<!-- Starter code -->
<form id="register-form">
  <div>
    <label>Nama:</label>
    <input type="text" id="name" required minlength="3" />
    <span class="error" id="name-error"></span>
  </div>
  <div>
    <label>Email:</label>
    <input type="email" id="email" required />
    <span class="error" id="email-error"></span>
  </div>
  <div>
    <label>Password (min 8 karakter):</label>
    <input type="password" id="password" required minlength="8" />
    <span class="error" id="password-error"></span>
  </div>
  <button type="submit">Daftar</button>
</form>

<script>
  const form = document.getElementById('register-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO: Validasi tiap field
    // - Nama: minimal 3 karakter
    // - Email: format valid (pake regex)
    // - Password: minimal 8 karakter
    // Kalo valid: show alert "Pendaftaran berhasil!"
  });
</script>
```

### 8. Dynamic List — Todo App DOM
Buat todo list yang bisa add, delete, dan toggle completed pake DOM.

```html
<!-- Starter code -->
<div id="todo-app">
  <input type="text" id="todo-input" placeholder="Tambah tugas..." />
  <button id="add-btn">Tambah</button>
  <ul id="todo-list"></ul>
</div>

<script>
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');
  const list = document.getElementById('todo-list');

  function addTodo() {
    const text = input.value.trim();
    if (!text) return;

    const li = document.createElement('li');
    // TODO: - Tambah checkbox untuk toggle selesai
    //       - Tombol delete
    //       - Text todo
  }

  addBtn.addEventListener('click', addTodo);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
</script>
```

### 9. Accordion / FAQ Component
Buat accordion yang bisa buka-tutup pake class toggle.

```html
<!-- Starter code -->
<div class="accordion">
  <div class="accordion-item">
    <button class="accordion-header">Apa itu TypeScript?</button>
    <div class="accordion-content">TypeScript adalah superset JavaScript...</div>
  </div>
  <div class="accordion-item">
    <button class="accordion-header">Apa itu Node.js?</button>
    <div class="accordion-content">Node.js adalah runtime JavaScript...</div>
  </div>
  <!-- TODO: Tambah 3 item lagi -->
</div>

<style>
  .accordion-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
  .accordion-content.active {
    max-height: ___; /* 500px */
  }
</style>

<script>
  // TODO: Click header -> toggle .active class di content
  // Hanya buka satu item dalam satu waktu (accordion behavior)
</script>
```

### 10. Tabs Component
Bikin tab switching component.

```html
<!-- Starter code -->
<div class="tabs">
  <div class="tab-buttons">
    <button class="tab-btn active" data-tab="html">HTML</button>
    <button class="tab-btn" data-tab="css">CSS</button>
    <button class="tab-btn" data-tab="js">JavaScript</button>
  </div>
  <div class="tab-content">
    <div id="html" class="tab-pane active">
      <p>HTML adalah struktur halaman web...</p>
    </div>
    <div id="css" class="tab-pane">
      <p>CSS untuk styling...</p>
    </div>
    <div id="js" class="tab-pane">
      <p>JavaScript untuk interaktivitas...</p>
    </div>
  </div>
</div>

<style>
  .tab-pane { display: none; }
  .tab-pane.active { display: block; }
  .tab-btn.active { background: #007bff; color: white; }
</style>

<script>
  // TODO: Click tab-btn -> switch active class
  // Gunakan data-tab attribute untuk mapping
</script>
```

---

## Level 3: Advanced — Fetch API, localStorage & Web Apps

### 11. Fetch API — GET Users
Ambil data dari JSONPlaceholder API dan tampilkan sebagai card.

```html
<!-- Starter code -->
<div id="user-container">
  <button id="load-users">Load Users</button>
  <div id="user-list"></div>
</div>

<script>
  const API = 'https://jsonplaceholder.typicode.com/users';

  document.getElementById('load-users').addEventListener('click', async () => {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const users = await response.json();
      const container = document.getElementById('user-list');
      // TODO: Render users sebagai card (name, email, phone, website)
    } catch (error) {
      // TODO: Tampilkan error message ke user
    }
  });
</script>
```

### 12. POST Data — Form to API
Kirim data form ke API pake method POST.

```html
<!-- Starter code -->
<form id="post-form">
  <input type="text" id="title" placeholder="Judul" required />
  <textarea id="body" placeholder="Isi post..." required></textarea>
  <button type="submit">Kirim Post</button>
</form>
<div id="result"></div>

<script>
  document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const postData = {
      title: document.getElementById('title').value,
      body: document.getElementById('body').value,
      userId: 1,
    };

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: '___',
        headers: { 'Content-Type': '___' },
        body: ___,
      });

      if (!response.ok) throw new Error('Gagal kirim post');
      const result = await response.json();

      // TODO: Tampilkan result.id + "Post berhasil dibuat!"
    } catch (error) {
      // TODO: Tampilkan error
    }
  });
</script>
```

### 13. localStorage — Theme Persistence
Simpan preferensi theme ke localStorage, pulihkan saat reload.

```html
<!-- Starter code -->
<style>
  body { transition: background 0.3s, color 0.3s; }
  body.light { background: white; color: #333; }
  body.dark { background: #1a1a2e; color: #eee; }
</style>

<button id="theme-toggle">Toggle Theme</button>

<script>
  function applyTheme(theme) {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }

  // TODO: - Cek localStorage pas load, apply theme
  //       - Toggle dark/light pas tombol diklik
  //       - Kalo gak ada di localStorage, default light

  const savedTheme = ___;
  applyTheme(savedTheme || 'light');
</script>
```

### 14. localStorage — Todo List Persistence
Todo list yang datanya tersimpan di localStorage.

```html
<!-- Starter code -->
<script>
  let todos = JSON.parse(localStorage.getItem('todos') || '[]');

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function renderTodos() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';
    todos.forEach((todo, index) => {
      // TODO: Render tiap todo + checkbox + delete button
    });
  }

  function addTodo() {
    const text = document.getElementById('todo-input').value.trim();
    if (!text) return;
    todos.push({ text, completed: false });
    saveTodos();
    renderTodos();
    document.getElementById('todo-input').value = '';
  }

  // Toggle completed & delete function...
  // TODO: Implement toggleTodo(index) dan deleteTodo(index)

  renderTodos();
</script>
```

### 15. Weather Dashboard — Fetch + Async
Ambil data cuaca dari OpenWeatherMap / API publik gratis.

```html
<!-- Starter code -->
<div id="weather-app">
  <input type="text" id="city-input" placeholder="Masukkan kota..." />
  <button id="search-weather">Cari</button>
  <div id="weather-result">
    <!-- Isi: icon, suhu, deskripsi, humidity, wind speed -->
  </div>
</div>

<script>
  const API_KEY = 'YOUR_API_KEY'; // Ganti pake API key sendiri
  const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  async function getWeather(city) {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Kota tidak ditemukan');

      const data = await response.json();
      // TODO: Tampilkan suhu, deskripsi, icon, kelembaban, kecepatan angin
    } catch (error) {
      // TODO: Tampilkan error
    }
  }

  document.getElementById('search-weather').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city) getWeather(city);
  });
</script>
```

### 16. Infinite Scroll — Intersection Observer
Load data lebih banyak waktu scroll sampe bawah.

```html
<!-- Starter code -->
<div id="post-list"></div>
<div id="loader">Loading...</div>

<script>
  let page = 1;
  const limit = 10;
  let loading = false;

  async function loadPosts() {
    if (loading) return;
    loading = true;
    document.getElementById('loader').style.display = 'block';

    try {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`
      );
      const posts = await res.json();
      // TODO: Render posts ke #post-list
      page++;
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
      document.getElementById('loader').style.display = 'none';
    }
  }

  // Intersection Observer untuk detect scroll sampe bawah
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadPosts();
  });
  observer.observe(document.getElementById('loader'));

  loadPosts();
</script>
```

### 17. Search & Filter — Real-Time Filtering
Filter data dari API berdasarkan input search.

```html
<!-- Starter code -->
<input type="text" id="search-input" placeholder="Cari user..." />
<ul id="user-list"></ul>

<script>
  let users = [];

  async function loadUsers() {
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    users = await res.json();
    renderUsers(users);
  }

  function renderUsers(filteredUsers) {
    const list = document.getElementById('user-list');
    list.innerHTML = filteredUsers.map(user => `
      <li>${user.name} — ${user.email}</li>
    `).join('');
  }

  function filterUsers(query) {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    renderUsers(filtered);
  }

  document.getElementById('search-input').addEventListener('input', (e) => {
    filterUsers(e.target.value);
  });

  loadUsers();
</script>
```

### 18. Modal Component — Dynamic Open/Close
Bikin modal yang bisa dibuka dari tombol manapun.

```html
<!-- Starter code -->
<style>
  .modal { display: none; position: fixed; ... }
  .modal.open { display: flex; }
</style>

<button data-modal="modal-1">Buka Modal 1</button>
<button data-modal="modal-2">Buka Modal 2</button>

<div id="modal-1" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Modal 1</h2>
    <p>Isi modal pertama...</p>
  </div>
</div>

<div id="modal-2" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Modal 2</h2>
    <p>Isi modal kedua...</p>
  </div>
</div>

<script>
  // TODO: - Click button -> buka modal sesuai data-modal attribute
  //       - Click .close -> tutup modal
  //       - Click overlay -> tutup modal
  //       - Escape key -> tutup modal
</script>
```

### 19. Drag & Drop — Kanban Board
Bikin simple Kanban board dengan drag & drop.

```html
<!-- Starter code -->
<style>
  .kanban { display: flex; gap: 1rem; }
  .column { flex: 1; background: #f0f0f0; padding: 1rem; min-height: 300px; }
  .card { background: white; padding: 0.5rem; margin: 0.5rem 0; cursor: grab; }
  .card.dragging { opacity: 0.5; }
</style>

<div class="kanban">
  <div class="column" data-status="todo">
    <h3>To Do</h3>
    <div class="card" draggable="true">Buat login page</div>
    <div class="card" draggable="true">Setup database</div>
  </div>
  <div class="column" data-status="progress">
    <h3>In Progress</h3>
  </div>
  <div class="column" data-status="done">
    <h3>Done</h3>
  </div>
</div>

<script>
  // TODO: Implement drag & drop
  // - dragstart: tambah class dragging + data
  // - dragover: preventDefault
  // - drop: pindah card ke column baru
</script>
```

### 20. Fetch with AbortController
Cancel fetch request yang udah gak relevan (misal pas user search cepat).

```html
<!-- Starter code -->
<script>
  let abortController = null;

  async function searchProducts(query) {
    // Cancel request sebelumnya kalo ada
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();

    try {
      const response = await fetch(
        `https://api.example.com/products?q=${encodeURIComponent(query)}`,
        { signal: abortController.signal }
      );
      const products = await response.json();
      renderProducts(products);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request dibatalkan');
        return;
      }
      console.error('Error:', error);
    }
  }

  let debounceTimer;
  document.getElementById('search').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => searchProducts(e.target.value), 300);
  });
</script>
```

### 21. CSS Animation — Loading Spinner
Buat loading spinner pake CSS animation.

```css
/* Starter code */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: ___;
  animation: spin ___; /* 1s linear infinite */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(___); }
}

/* TODO: Bikin pulse animation juga */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: ___; }
}
```

### 22. Web Component — Custom Element
Buat custom HTML element pake Web Component API.

```js
// Starter code
class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const name = this.getAttribute('name');
    const email = this.getAttribute('email');
    const avatar = this.getAttribute('avatar') || 'https://via.placeholder.com/50';

    this.shadowRoot.innerHTML = `
      <style>
        .card { display: flex; align-items: center; gap: 1rem; padding: 1rem;
                border: 1px solid #ddd; border-radius: 8px; }
        img { width: 50px; height: 50px; border-radius: 50%; }
        .name { font-weight: bold; }
        .email { color: #666; }
      </style>
      <div class="card">
        <img src="${avatar}" alt="${name}" />
        <div>
          <div class="name">${name}</div>
          <div class="email">${email}</div>
        </div>
      </div>
    `;
  }
}

customElements.define('user-card', UserCard);

// Usage: <user-card name="Budi" email="budi@test.com"></user-card>
```

---

## 🧪 Cara Jalanin

1. Bikin file `.html` di folder `exercises/04-web/`
2. Buka langsung pake browser (double click)
3. Atau pake Live Server di VS Code

```bash
# Kalo pake VS Code:
code exercises/04-web/exercise-01.html
# Klik kanan > Open with Live Server
```
