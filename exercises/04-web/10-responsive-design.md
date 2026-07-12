# Web Development — Exercise #10: Responsive Design

> **Level:** Advanced
> **Topics:** media queries, responsive layout, mobile-first, breakpoints, viewport

## Instructions

Buat landing page yang **mobile-first** dengan breakpoints:

1. **Mobile** (< 640px): 1 kolom, stacked layout.
2. **Tablet** (640px - 1024px): 2 kolom grid, sidebar muncul.
3. **Desktop** (> 1024px): 3 kolom grid + sidebar tetap.

Fitur:
- Header dengan navigasi hamburger menu di mobile.
- Grid card yang responsive.
- Sidebar yang muncul di tablet/desktop.
- Footer sticky.

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Landing Page</title>
  <style>
    /* TODO: Mobile-first styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }

    /* Mobile: stacked, 1 column */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    header {
      background: #6366f1;
      color: white;
      padding: 1rem 0;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .hamburger {
      display: block;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    nav {
      display: none; /* Hidden by default on mobile */
    }

    nav.open {
      display: block;
    }

    nav ul {
      list-style: none;
      margin-top: 1rem;
    }

    nav li { margin-bottom: 0.5rem; }

    nav a {
      color: white;
      text-decoration: none;
      display: block;
      padding: 0.5rem;
    }

    .layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem 0;
    }

    .main-content {
      flex: 1;
    }

    .sidebar {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr; /* 1 column on mobile */
      gap: 1rem;
    }

    .card {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .card h3 { color: #6366f1; margin-bottom: 0.5rem; }

    footer {
      background: #1a1a2e;
      color: white;
      text-align: center;
      padding: 1.5rem 0;
      margin-top: 2rem;
    }

    /* TODO: Tablet styles (640px+) */
    @media (min-width: 640px) {
      /* 2 columns */
    }

    /* TODO: Desktop styles (1024px+) */
    @media (min-width: 1024px) {
      /* 3 columns + sidebar */
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-content">
        <h1>MyApp</h1>
        <button class="hamburger" id="hamburger">☰</button>
      </div>
      <nav id="nav">
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <div class="container layout">
    <div class="main-content">
      <h2>Selamat Datang</h2>
      <p>Platform belajar coding interaktif. Akses materi, kerjakan latihan, dan dapatkan sertifikat.</p>

      <div class="grid" id="card-grid">
        <!-- TODO: 6 card items -->
        <div class="card">
          <h3>JavaScript</h3>
          <p>Dari variable sampai async/await. 25+ latihan interaktif.</p>
        </div>
        <div class="card">
          <h3>Algoritma & DSA</h3>
          <p>Big O, sorting, searching, tree, graph.</p>
        </div>
        <div class="card">
          <h3>TypeScript</h3>
          <p>Tipe statis, generics, utility types.</p>
        </div>
        <div class="card">
          <h3>Web Development</h3>
          <p>HTML semantic, CSS Grid, Fetch API, localStorage.</p>
        </div>
        <div class="card">
          <h3>Node.js</h3>
          <p>Express, middleware, REST API, database.</p>
        </div>
        <div class="card">
          <h3>Mastra AI</h3>
          <p>Framework AI: agents, tools, workflows, RAG.</p>
        </div>
      </div>
    </div>

    <aside class="sidebar">
      <h3>📊 Progress</h3>
      <p>0 dari 7 modul selesai</p>
      <hr style="margin: 1rem 0;">
      <h3>📅 Jadwal</h3>
      <p>Senin & Rabu: 19:00 - 21:00 WIB</p>
      <hr style="margin: 1rem 0;">
      <h3>🏆 Peringkat</h3>
      <p>Kamu berada di peringkat #42</p>
    </aside>
  </div>

  <footer>
    <div class="container">
      <p>&copy; 2025 RPL AI Curriculum. All rights reserved.</p>
    </div>
  </footer>

  <script>
    // TODO: hamburger menu toggle
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    hamburger.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  </script>
</body>
</html>
```

## Expected Output

- Mobile: 1 kolom, hamburger menu.
- Tablet (640px+): 2 kolom grid, sidebar muncul.
- Desktop (1024px+): 3 kolom grid + sidebar.

## Test Cases

```javascript
// Test dengan resize browser
console.log("Responsive page siap. Cek di berbagai ukuran layar.");
```
