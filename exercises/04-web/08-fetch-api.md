# Web Development — Exercise #8: Fetch API

> **Level:** Advanced
> **Topics:** fetch, async/await, JSON, error handling, DOM rendering

## Instructions

Buat aplikasi yang mengambil data dari JSONPlaceholder API dan menampilkannya.

Fitur:
1. Tombol **"Load Users"** — fetch data users dari `https://jsonplaceholder.typicode.com/users`.
2. Tampilkan setiap user sebagai card (name, email, phone, website).
3. Loading state saat fetch sedang berlangsung.
4. Error handling jika fetch gagal (tampilkan pesan error ke user).
5. Tombol **"Load Posts"** — fetch posts dan tampilkan dalam daftar.

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fetch API Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, sans-serif;
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    h1 { margin-bottom: 1rem; }
    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 1.5rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    #load-users { background: #6366f1; color: white; }
    #load-posts { background: #22c55e; color: white; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    .card h3 { color: #6366f1; margin-bottom: 0.5rem; }
    .card p { color: #666; margin-bottom: 0.25rem; }
    .post-item {
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    .post-item h3 { font-size: 1rem; color: #333; }
    .post-item p { font-size: 0.9rem; color: #666; }
    .loading {
      text-align: center;
      padding: 2rem;
      color: #999;
    }
    .error-msg {
      background: #fef2f2;
      color: #ef4444;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    #content { min-height: 200px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌐 Fetch API Demo</h1>
    <div class="toolbar">
      <button id="load-users">👥 Load Users</button>
      <button id="load-posts">📝 Load Posts</button>
    </div>
    <div id="content">
      <p style="color: #999;">Klik tombol untuk memuat data...</p>
    </div>
  </div>

  <script>
    const API = 'https://jsonplaceholder.typicode.com';
    const loadUsersBtn = document.getElementById('load-users');
    const loadPostsBtn = document.getElementById('load-posts');
    const content = document.getElementById('content');

    async function fetchData(endpoint) {
      // TODO: tampilkan loading state
      // TODO: fetch data dari API
      // TODO: handle error (response.ok, try/catch)
      // TODO: return parsed JSON
    }

    function renderUsers(users) {
      // TODO: render users sebagai card
      // Setiap card: name, email, phone, website
    }

    function renderPosts(posts) {
      // TODO: render posts sebagai list
      // Setiap item: title, body (truncated)
    }

    // TODO: tambah event listeners

    loadUsersBtn.addEventListener('click', async () => {
      // TODO: fetch users dan render
    });

    loadPostsBtn.addEventListener('click', async () => {
      // TODO: fetch posts dan render
    });
  </script>
</body>
</html>
```

## Expected Output

- Klik "Load Users" → muncul card users.
- Klik "Load Posts" → muncul daftar posts.
- Loading state terlihat saat fetch.
- Error ditampilkan jika fetch gagal.

## Test Cases

```javascript
// Test di browser
console.log("Fetch API app siap. Klik tombol untuk load data.");
```
