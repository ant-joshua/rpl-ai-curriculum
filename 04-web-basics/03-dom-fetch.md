# 4.3 DOM Manipulation + Events + Fetch API + Tampil Data

## DOM Manipulation

DOM (Document Object Model) — representasi HTML sebagai object JavaScript. Kita bisa ubah konten, atribut, style halaman secara dinamis.

### Seleksi Element

```javascript
// Single element
const judul = document.getElementById('judul');
const hero = document.querySelector('.hero');        // selector CSS
const btn  = document.querySelector('#btn-submit');

// Multiple elements
const cards  = document.querySelectorAll('.card');   // NodeList
const parag  = document.getElementsByTagName('p');   // HTMLCollection
```

### Ubah Konten

```javascript
const judul = document.querySelector('h1');

judul.textContent = 'Halo Dunia!';           // ganti teks (aman, gak parse HTML)
judul.innerHTML   = '<span>Halo</span>!';    // ganti teks + HTML (hati-hati XSS)
judul.innerText   = 'Teks lain';             // kayak textContent tapi respect CSS
```

### Ubah Style

```javascript
const box = document.querySelector('.box');
box.style.backgroundColor = 'blue';
box.style.color = 'white';
box.style.padding = '20px';
box.style.borderRadius = '8px';

// Best practice: tambah/remove class, bukan inline style
box.classList.add('active');
box.classList.remove('hidden');
box.classList.toggle('dark-mode');
box.classList.contains('active'); // true/false
```

### Manipulasi Atribut

```javascript
const img = document.querySelector('img');
img.src = 'https://example.com/baru.jpg';
img.alt = 'Gambar baru';
img.setAttribute('loading', 'lazy');

const link = document.querySelector('a');
link.href = 'https://google.com';
link.target = '_blank';
```

### Create & Append Element

```javascript
// Bikin element baru
const card = document.createElement('div');
card.className = 'card';
card.textContent = 'Card baru';

// Tempelin ke parent
document.querySelector('.container').appendChild(card);

// Alternatif: insertAdjacentHTML (cepat buat banyak HTML)
document.querySelector('.list').insertAdjacentHTML('beforeend', `
  <li class="item">Item baru</li>
`);
```

---

## Events

### addEventListener

```javascript
const btn = document.querySelector('#btn');

btn.addEventListener('click', () => {
  alert('Tombol diklik!');
});

// Event types umum:
// click, dblclick, mouseover, mouseout
// keydown, keyup, keypress
// submit, change, input
// load, DOMContentLoaded, scroll, resize
```

### Contoh: Counter

```html
<button id="minus">-</button>
<span id="count">0</span>
<button id="plus">+</button>

<script>
  let count = 0;
  const display = document.getElementById('count');

  document.getElementById('plus').addEventListener('click', () => {
    count++;
    display.textContent = count;
  });

  document.getElementById('minus').addEventListener('click', () => {
    count--;
    display.textContent = count;
  });
</script>
```

### Event Delegation

Pake satu listener di parent — berguna buat element yang ditambah dinamis.

```javascript
document.querySelector('.list').addEventListener('click', (e) => {
  const item = e.target.closest('.list-item');
  if (item) {
    console.log('Klik:', item.textContent);
    item.classList.toggle('selected');
  }
});
```

### Form Handling

```html
<form id="myForm">
  <input type="text" name="nama" placeholder="Nama" required>
  <input type="email" name="email" placeholder="Email" required>
  <button type="submit">Kirim</button>
</form>
<div id="output"></div>

<script>
  document.getElementById('myForm').addEventListener('submit', (e) => {
    e.preventDefault(); // biar gak reload halaman

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData); // { nama: "...", email: "..." }

    document.getElementById('output').innerHTML = `
      <div class="alert alert-success">
        Halo ${data.nama}! Email kamu ${data.email}.
      </div>
    `;
  });
</script>
```

---

## Fetch API & Tampil Data

### Fetch Data dari API Publik

API publik gratis buat latihan:
- `https://jsonplaceholder.typicode.com/users` — data user
- `https://jsonplaceholder.typicode.com/posts` — data post
- `https://api.github.com/users/{username}` — data GitHub user
- `https://api.coindesk.com/v1/bpi/currentprice.json` — harga Bitcoin

```javascript
fetch('https://jsonplaceholder.typicode.com/users')
  .then(response => {
    if (!response.ok) throw new Error('Network error');
    return response.json();
  })
  .then(data => {
    console.log(data); // array of users
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
```

### Async/Await (lebih modern)

```javascript
async function getUsers() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const users = await res.json();
    return users;
  } catch (err) {
    console.error('Gagal fetch:', err);
    return [];
  }
}
```

### Tampilin ke Halaman

```html
<div id="user-list" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>

<script>
  async function loadUsers() {
    const container = document.getElementById('user-list');
    container.innerHTML = '<p class="text-gray-500">Loading...</p>';

    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await res.json();

      container.innerHTML = users.map(user => `
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="font-bold text-lg">${user.name}</h3>
          <p class="text-gray-600 text-sm">@${user.username}</p>
          <p class="text-gray-500 mt-2">${user.email}</p>
          <p class="text-gray-400 text-sm">${user.company.name}</p>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    }
  }

  loadUsers();
</script>
```

### Contoh: Dashboard Lengkap

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard API</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-8">
  <div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <!-- Controls -->
    <div class="flex gap-4 mb-6">
      <button id="btnUsers" class="bg-blue-500 text-white px-4 py-2 rounded">Tampilkan Users</button>
      <button id="btnPosts" class="bg-green-500 text-white px-4 py-2 rounded">Tampilkan Posts</button>
    </div>

    <!-- Loading indicator -->
    <div id="loading" class="hidden text-gray-500 mb-4">Memuat data...</div>

    <!-- Output -->
    <div id="output" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
  </div>

  <script>
    const output   = document.getElementById('output');
    const loading  = document.getElementById('loading');

    async function fetchData(endpoint) {
      loading.classList.remove('hidden');
      output.innerHTML = '';

      try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/${endpoint}`);
        const data = await res.json();

        loading.classList.add('hidden');

        if (endpoint === 'users') {
          output.innerHTML = data.map(u => `
            <div class="bg-white rounded-xl shadow p-4">
              <h3 class="font-bold text-lg">${u.name}</h3>
              <p class="text-gray-600">@${u.username}</p>
              <p class="text-sm text-gray-500">${u.email}</p>
              <p class="text-xs text-gray-400 mt-2">${u.address.city}</p>
            </div>
          `).join('');
        } else {
          output.innerHTML = data.slice(0, 12).map(p => `
            <div class="bg-white rounded-xl shadow p-4">
              <h3 class="font-bold">${p.title.slice(0, 40)}...</h3>
              <p class="text-sm text-gray-600 mt-2">${p.body.slice(0, 80)}...</p>
            </div>
          `).join('');
        }
      } catch (err) {
        loading.classList.add('hidden');
        output.innerHTML = `<p class="text-red-500 col-span-3">Error: ${err.message}</p>`;
      }
    }

    document.getElementById('btnUsers').addEventListener('click', () => fetchData('users'));
    document.getElementById('btnPosts').addEventListener('click', () => fetchData('posts'));
  </script>
</body>
</html>
```

### Loading & Error State

Selalu handle 3 state:
1. **Loading** — tampilin spinner/"Memuat..."
2. **Success** — tampilin data
3. **Error** — tampilin pesan error

```javascript
function renderStates() {
  // Loading
  container.innerHTML = `<div class="spinner">Loading...</div>`;

  // Success
  container.innerHTML = data.map(item => `<div>${item.name}</div>`).join('');

  // Error
  container.innerHTML = `<div class="error">Gagal memuat: ${err.message}</div>`;
}
```

---

## Latihan

1. **Todo List App** — Input buat nambah todo, tombol delete, toggle selesai/belum. Pake `createElement`, `classList.toggle`, `addEventListener`. Data disimpen di array local (belum localStorage).
2. **GitHub User Search** — Input username, fetch `https://api.github.com/users/{username}`, tampilin avatar, name, bio, public repos, followers/following. Handle error kalo user gak ditemukan (404).
3. **Dashboard API dengan filter** — Fetch dari `/users` dan `/posts`. Bikin filter: users by city, posts by userId. Tampilin loading spinner, handle error, tampilin jumlah data yang difilter.
4. **Deploy dashboard ke Vercel** — Ambil salah satu latihan di atas, deploy ke Vercel. Pastiin loading & error state berfungsi. Kirim URL.
