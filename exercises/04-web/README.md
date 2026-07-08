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

### 23. Canvas — Interactive Drawing App
Buat drawing app sederhana pake HTML5 Canvas.

```html
<!-- Starter code -->
<style>
  canvas { border: 1px solid #ccc; cursor: crosshair; }
  .toolbar { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center; }
</style>

<div class="toolbar">
  <label>Color: <input type="color" id="color-picker" value="#000000" /></label>
  <label>Size: <input type="range" id="size-picker" min="1" max="20" value="3" /></label>
  <button id="clear-btn">Clear</button>
  <button id="undo-btn">Undo</button>
</div>
<canvas id="draw-canvas" width="800" height="500"></canvas>

<script>
  const canvas = document.getElementById('draw-canvas');
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let lastX = 0, lastY = 0;
  const undoStack = [];

  function saveState() {
    undoStack.push(canvas.toDataURL());
  }

  function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    saveState();
  }

  function draw(e) {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = document.getElementById('color-picker').value;
    ctx.lineWidth = document.getElementById('size-picker').value;
    ctx.lineCap = 'round';
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }

  function stopDrawing() { isDrawing = false; }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  document.getElementById('clear-btn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack.length = 0;
  });

  document.getElementById('undo-btn').addEventListener('click', () => {
    if (undoStack.length < 2) return;
    undoStack.pop();
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = undoStack[undoStack.length - 1];
  });

  // TODO: Tambah touch support untuk mobile
  // TODO: Tambah fill bucket tool
  // TODO: Tambah export PNG button
</script>
```

### 24. SVG — Interactive Data Chart
Buat chart batang interaktif pake SVG.

```html
<!-- Starter code -->
<style>
  .bar { fill: #4da6ff; transition: fill 0.3s; }
  .bar:hover { fill: #ff6b6b; }
  .axis text { font-size: 12px; fill: #666; }
  .tooltip { position: absolute; background: #333; color: white; padding: 0.5rem;
             border-radius: 4px; font-size: 14px; display: none; pointer-events: none; }
</style>

<div style="position: relative;">
  <svg width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4da6ff" />
        <stop offset="100%" stop-color="#2563eb" />
      </linearGradient>
    </defs>

    <!-- TODO: Generate bars dynamically from data -->
    <g class="bars">
      <!-- Example bar -->
      <rect x="50" y="250" width="40" height="100" class="bar" fill="url(#bar-grad)"
            data-value="50" data-label="Jan" rx="4" />
    </g>

    <!-- Y-axis labels -->
    <g class="axis y-axis">
      <line x1="40" y1="30" x2="40" y2="350" stroke="#ddd" />
      <!-- TODO: Tambah tick marks -->
    </g>

    <!-- X-axis labels -->
    <g class="axis x-axis">
      <line x1="40" y1="350" x2="560" y2="350" stroke="#ddd" />
    </g>
  </svg>

  <div class="tooltip" id="chart-tooltip"></div>
</div>

<script>
  const data = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 200 },
    { label: 'Mar', value: 150 },
    { label: 'Apr', value: 300 },
    { label: 'Mei', value: 250 },
    { label: 'Jun', value: 180 },
  ];

  // TODO: Render bars dynamically from data
  // - Scale values to fit SVG height (max 350, gap 30)
  // - Generate <rect> for each data point
  // - Tooltip on hover: show label + value
  // - Animate bars on load (transition: height)
  // - Responsive: adjust viewBox on resize
</script>
```

### 25. Web Workers — Heavy Calculation
Pindahkan kalkulasi berat ke thread terpisah pake Web Worker.

```js
// worker.js — file terpisah
self.onmessage = function (e) {
  const { numbers, operation } = e.data;
  let result;

  switch (operation) {
    case 'sum':
      result = numbers.reduce((a, b) => a + b, 0);
      break;
    case 'average':
      result = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      break;
    case 'fibonacci':
      // Fibonacci sequence: O(2^n) — slow
      function fib(n) { return n <= 1 ? n : fib(n - 1) + fib(n - 2); }
      result = numbers.map(n => ({ input: n, output: fib(n) }));
      break;
    case 'prime':
      function isPrime(n) {
        for (let i = 2, sqrt = Math.sqrt(n); i <= sqrt; i++)
          if (n % i === 0) return false;
        return n > 1;
      }
      result = numbers.filter(isPrime);
      break;
    case 'sort':
      result = numbers.sort((a, b) => a - b);
      break;
  }

  self.postMessage({ result, operation, duration: performance.now() - e.timeStamp });
};
```

```html
<!-- index.html -->
<script>
  const worker = new Worker('worker.js');
  const resultDiv = document.getElementById('result');

  document.getElementById('calc-btn').addEventListener('click', () => {
    resultDiv.textContent = 'Calculating...';
    document.getElementById('spinner').style.display = 'block';

    const bigArray = Array.from({ length: 40 }, (_, i) => i + 1);
    worker.postMessage({ numbers: bigArray, operation: 'fibonacci' });
  });

  worker.onmessage = (e) => {
    document.getElementById('spinner').style.display = 'none';
    resultDiv.innerHTML = `
      <p>Operation: ${e.data.operation}</p>
      <p>Duration: ${e.data.duration.toFixed(2)}ms</p>
      <pre>${JSON.stringify(e.data.result, null, 2)}</pre>
    `;
  };

  worker.onerror = (err) => {
    console.error('Worker error:', err);
    resultDiv.textContent = 'Error occurred in worker';
  };

  // TODO: Tambah cancellation (worker.terminate())
  // TODO: Multiple workers for parallel computation
  // TODO: Progress reporting via worker.postMessage
</script>
```

### 26. Service Workers — Offline Cache
Buat service worker untuk cache halaman dan assets.

```js
// sw.js — service worker file
const CACHE_NAME = 'my-app-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached if available
      if (cached) return cached;

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Cache API responses for offline
        if (response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // If offline and not cached, show fallback
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
```

```html
<!-- Register SW dari main page -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered:', registration.scope);

        // Cek update
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('Versi baru tersedia. Refresh?')) {
                newWorker.postMessage({ action: 'skipWaiting' });
                window.location.reload();
              }
            }
          });
        });
      } catch (err) {
        console.error('SW registration failed:', err);
      }
    });
  }

  // TODO: Implementasikan strategi Network First untuk API calls
  // TODO: Background sync untuk form submission offline
  // TODO: Push notification
</script>
```

### 27. IndexedDB — Local Database
Simpan data kompleks di browser pake IndexedDB.

```html
<!-- Starter code -->
<script>
  // Buka database
  const DB_NAME = 'NotesApp';
  const DB_VERSION = 2;

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Buat object store
        if (!db.objectStoreNames.contains('notes')) {
          const store = db.createObjectStore('notes', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }

        // Version 2: tambah categories store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  // CRUD operations
  async function addNote(db, note) {
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    note.createdAt = new Date().toISOString();
    note.updatedAt = note.createdAt;
    return new Promise((resolve, reject) => {
      const request = store.add(note);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getAllNotes(db) {
    const tx = db.transaction('notes', 'readonly');
    const store = tx.objectStore('notes');
    const index = store.index('createdAt');
    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function searchByTag(db, tag) {
    const tx = db.transaction('notes', 'readonly');
    const store = tx.objectStore('notes');
    const index = store.index('tags');
    return new Promise((resolve, reject) => {
      const request = index.getAll(tag);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Usage
  (async () => {
    const db = await openDB();

    await addNote(db, {
      title: 'Belajar IndexedDB',
      content: 'IndexedDB adalah database NoSQL di browser...',
      tags: ['javascript', 'pwa'],
    });

    const notes = await getAllNotes(db);
    console.log('All notes:', notes);

    const jsNotes = await searchByTag(db, 'javascript');
    console.log('JS notes:', jsNotes);
  })();

  // TODO: Implementasi updateNote dan deleteNote
  // TODO: Tambah form UI untuk create/list/delete notes
  // TODO: Pagination dengan cursor
  // TODO: Full-text search dengan getAll + filter
</script>
```

### 28. Session Storage — Tab-Specific State
Gunakan sessionStorage untuk data yang spesifik per tab.

```html
<!-- Starter code -->
<style>
  .form-step { display: none; }
  .form-step.active { display: block; }
  .progress { height: 8px; background: #e0e0e0; border-radius: 4px; margin: 1rem 0; }
  .progress-bar { height: 100%; background: #4da6ff; border-radius: 4px;
                  transition: width 0.3s; }
</style>

<div class="wizard" data-wizard="checkout">
  <div class="progress"><div class="progress-bar" id="progress-bar" style="width: 25%"></div></div>

  <div class="form-step active" data-step="1">
    <h3>Step 1: Personal Info</h3>
    <input type="text" id="name" placeholder="Nama" />
    <input type="email" id="email" placeholder="Email" />
    <button class="next-btn">Next</button>
  </div>

  <div class="form-step" data-step="2">
    <h3>Step 2: Shipping</h3>
    <input type="text" id="address" placeholder="Alamat" />
    <input type="text" id="city" placeholder="Kota" />
    <button class="prev-btn">Back</button>
    <button class="next-btn">Next</button>
  </div>

  <div class="form-step" data-step="3">
    <h3>Step 3: Review & Submit</h3>
    <div id="review-data"></div>
    <button class="prev-btn">Back</button>
    <button id="submit-btn">Submit</button>
  </div>
</div>

<script>
  const WIZARD_KEY = 'checkout_form';

  function saveState() {
    const state = {
      step: document.querySelector('.form-step.active').dataset.step,
      name: document.getElementById('name')?.value || '',
      email: document.getElementById('email')?.value || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
    };
    sessionStorage.setItem(WIZARD_KEY, JSON.stringify(state));
  }

  function restoreState() {
    const saved = sessionStorage.getItem(WIZARD_KEY);
    if (!saved) return;
    const state = JSON.parse(saved);
    // Restore form fields
    if (state.name) document.getElementById('name').value = state.name;
    if (state.email) document.getElementById('email').value = state.email;
    if (state.address) document.getElementById('address').value = state.address;
    if (state.city) document.getElementById('city').value = state.city;
    // Restore step
    goToStep(parseInt(state.step));
  }

  function goToStep(step) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    document.getElementById('progress-bar').style.width = `${step * 25}%`;
    saveState();
  }

  // Auto-save on input change
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', saveState);
  });

  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = parseInt(document.querySelector('.form-step.active').dataset.step);
      goToStep(current + 1);
    });
  });

  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = parseInt(document.querySelector('.form-step.active').dataset.step);
      goToStep(current - 1);
    });
  });

  document.getElementById('submit-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem(WIZARD_KEY);
    alert('Form submitted!');
  });

  // Restore on page load
  restoreState();

  // TODO: Implement multi-tab sync (storage event)
  // TODO: Add form validation per step
  // TODO: Expire sessionStorage after 30 minutes
</script>
```

### 29. Drag & Drop — Kanban Board (Advanced)
Bikin Kanban board dengan drag & drop menggunakan Drag & Drop API.

```html
<!-- Starter code -->
<style>
  .kanban { display: flex; gap: 1rem; min-height: 400px; }
  .column { flex: 1; background: #f5f5f5; padding: 1rem; border-radius: 8px;
            min-height: 300px; transition: background 0.2s; }
  .column.drag-over { background: #e3f2fd; outline: 2px dashed #4da6ff; }
  .column h3 { margin-top: 0; display: flex; justify-content: space-between; }
  .card { background: white; padding: 0.75rem; margin: 0.5rem 0; border-radius: 6px;
          cursor: grab; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .card:active { cursor: grabbing; }
  .card.dragging { opacity: 0.5; transform: rotate(3deg); }
  .card-count { background: #ddd; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
</style>

<div class="kanban">
  <div class="column" data-status="todo">
    <h3>To Do <span class="card-count">0</span></h3>
  </div>
  <div class="column" data-status="progress">
    <h3>In Progress <span class="card-count">0</span></h3>
  </div>
  <div class="column" data-status="done">
    <h3>Done <span class="card-count">0</span></h3>
  </div>
</div>

<button id="add-card-btn">+ Add Card</button>

<script>
  const columns = document.querySelectorAll('.column');
  let dragSource = null;
  let cardCount = 0;

  // Add initial cards
  function createCard(text, status) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.textContent = text;
    card.dataset.id = `card-${++cardCount}`;

    card.addEventListener('dragstart', (e) => {
      dragSource = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.id);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      dragSource = null;
    });

    // Delete on double click
    card.addEventListener('dblclick', () => {
      card.remove();
      updateCounts();
    });

    document.querySelector(`[data-status="${status}"]`).appendChild(card);
    updateCounts();
  }

  // Add column drag events
  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      if (dragSource) {
        col.appendChild(dragSource);
        updateCounts();
        saveBoardState();
      }
    });
  });

  function updateCounts() {
    columns.forEach(col => {
      const count = col.querySelectorAll('.card').length;
      col.querySelector('.card-count').textContent = count;
    });
  }

  // Persist ke localStorage
  function saveBoardState() {
    const state = {};
    columns.forEach(col => {
      const status = col.dataset.status;
      state[status] = Array.from(col.querySelectorAll('.card')).map(c => c.textContent);
    });
    localStorage.setItem('kanban-board', JSON.stringify(state));
  }

  function loadBoardState() {
    const saved = localStorage.getItem('kanban-board');
    if (!saved) {
      // Default cards
      createCard('Buat login page', 'todo');
      createCard('Setup database', 'todo');
      createCard('Design landing page', 'todo');
      createCard('Implementasi API', 'progress');
      createCard('Setup CI/CD', 'done');
      return;
    }
    const state = JSON.parse(saved);
    Object.entries(state).forEach(([status, cards]) => {
      cards.forEach(text => createCard(text, status));
    });
  }

  document.getElementById('add-card-btn').addEventListener('click', () => {
    const text = prompt('Nama task:');
    if (text) {
      createCard(text, 'todo');
      saveBoardState();
    }
  });

  loadBoardState();
</script>
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

### 15. Canvas — Drawing App
Buat canvas sederhana untuk gambar bebas (freehand drawing).

```html
<canvas id="drawing-canvas" width="600" height="400" style="border:1px solid #ccc"></canvas>
<div>
  <button onclick="setColor('black')">Black</button>
  <button onclick="setColor('red')">Red</button>
  <button onclick="setColor('blue')">Blue</button>
  <button onclick="clearCanvas()">Clear</button>
  <input type="range" id="brush-size" min="1" max="20" value="5">
</div>

<script>
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

// TODO: mouse event — mousedown mulai drawing
// TODO: mousemove — gambar line ke posisi kursor
// TODO: mouseup / mouseleave — stop drawing
// TODO: setColor(color) — ganti warna brush
// TODO: clearCanvas() — clear seluruh canvas
// TODO: brush size slider — ganti lineWidth
// Bonus: tambah undo (save snapshot)
</script>
```

### 16. SVG — Interactive Diagram
Buat diagram interaktif pake SVG native.

```html
<svg width="600" height="400" viewBox="0 0 600 400">
  <!-- TODO: Flowchart nodes (rect + text) -->
  <!-- TODO: Arrow connections (line + marker) -->
  <!-- TODO: Click handler — show info about node -->
  <!-- TODO: Drag node ke posisi baru -->
  <!-- Bonus: zoom + pan -->
</svg>
```

### 17. Drag & Drop — Sortable List
Buat list yang itemnya bisa di-drag untuk reorder.

```html
<ul id="sortable-list">
  <li draggable="true" data-id="1">Item 1</li>
  <li draggable="true" data-id="2">Item 2</li>
  <li draggable="true" data-id="3">Item 3</li>
  <li draggable="true" data-id="4">Item 4</li>
</ul>

<script>
const list = document.getElementById('sortable-list');

// TODO: dragstart — simpan data-id item yg di-drag
// TODO: dragover — prevent default + add visual indicator
// TODO: drop — insert item di posisi baru
// TODO: Simpan urutan baru ke localStorage
// TODO: Load urutan dari localStorage saat page load
</script>
```

### 18. Web Workers — Background Computation
Jalankan kalkulasi berat di thread terpisah biar UI gak freeze.

```js
// worker.js
self.onmessage = function(e) {
  const { numbers } = e.data;
  // TODO: Hitung prime numbers dari array
  // TODO: Hitung factorial untuk setiap number
  // TODO: Sort numbers descending
  // TODO: Kirim hasil balik ke main thread
};

// main.js
const worker = new Worker('worker.js');
worker.postMessage({ numbers: [100, 500, 1000, 5000] });
worker.onmessage = function(e) {
  console.log('Hasil:', e.data);
};
```

### 19. Service Workers — Offline PWA
Buat service worker untuk caching dan offline support.

```js
// sw.js
const CACHE_NAME = 'rpl-cache-v1';
const urlsToCache = ['/', '/index.html', '/style.css', '/app.js'];

// TODO: Install event — cache semua urlsToCache
// TODO: Fetch event — serve from cache, fallback to network
// TODO: Activate event — clean old caches
// TODO: Background sync — retry failed requests saat online
// Bonus: push notification via service worker
```

### 20. IndexedDB — Local Database
Simpan dan query data kompleks di browser pake IndexedDB.

```js
// TODO: Buka database 'RPLApp' versi 1
// TODO: Buat object store 'notes' dengan keyPath id
// TODO: CRUD operations — add, get, getAll, put, delete
// TODO: Index by 'category' — query notes by category
// TODO: Search notes by title (pake index atau cursor)

// Starter
const request = indexedDB.open('RPLApp', 1);
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  // TODO: Buat object store + index
};
