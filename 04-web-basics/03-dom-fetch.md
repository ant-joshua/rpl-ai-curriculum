# 4.3 DOM Manipulation + Events + Fetch API + Tampil Data

## DOM Manipulation

DOM (Document Object Model) — representasi HTML sebagai object JavaScript. Kita bisa ubah konten, atribut, style halaman secara dinamis.

**Konsep penting:** DOM itu berbentuk tree (pohon). Setiap elemen HTML adalah node. `document` adalah akar pohonnya. Dengan JavaScript, kita bisa:
- **Cari** node tertentu (seleksi)
- **Baca** isi node (text, atribut, style)
- **Ubah** isi node (text, atribut, style)
- **Buat** node baru (create)
- **Hapus** node (remove)

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

**Bedanya `querySelectorAll` vs `getElementsBy*`:**

| Method | Return Type | Live? | Cocok Untuk |
|--------|-------------|-------|-------------|
| `querySelectorAll` | NodeList (static) | ❌ Tidak | Seleksi berdasarkan CSS selector fleksibel |
| `getElementsByTagName` | HTMLCollection (live) | ✅ Ya | Performance tinggi, koleksi update otomatis |
| `getElementsByClassName` | HTMLCollection (live) | ✅ Ya | Sama, tapi by class |

"Live" artinya koleksi otomatis update kalo DOM berubah. "Static" artinya koleksi tetap (snapshot saat seleksi).

```javascript
// Contoh beda live vs static:
const liveItems = document.getElementsByClassName('item');  // HTMLCollection
const staticItems = document.querySelectorAll('.item');      // NodeList

const container = document.querySelector('.container');

// Tambah item baru
const newItem = document.createElement('div');
newItem.className = 'item';
newItem.textContent = 'Baru';
container.appendChild(newItem);

console.log(liveItems.length);  // 4 (naik otomatis karena live)
console.log(staticItems.length); // 3 (tetap, karena static — snapshot waktu seleksi)
```

### Ubah Konten

```javascript
const judul = document.querySelector('h1');

judul.textContent = 'Halo Dunia!';           // ganti teks (aman, gak parse HTML)
judul.innerHTML   = '<span>Halo</span>!';    // ganti teks + HTML (hati-hati XSS)
judul.innerText   = 'Teks lain';             // kayak textContent tapi respect CSS
```

**Peringatan `innerHTML`:** Kalo lo pake `innerHTML` dengan input dari user (misal dari form), lo rentan **XSS (Cross-Site Scripting)** — attacker bisa inject script jahat.

```javascript
// ❌ BERBAHAYA — jangan pernah gini kalo 'userInput' dari form/URL
const userInput = '<img src=x onerror="alert(\'Hacked!\')">';
document.querySelector('.output').innerHTML = userInput;

// ✅ Aman — pake textContent
document.querySelector('.output').textContent = userInput; // tampil sebagai teks biasa

// Alternatif aman kalo perlu HTML: sanitize dulu
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML; // ubah teks jadi HTML-safe
}
```

**`textContent` vs `innerText` — beda subtle tapi penting:**
- `textContent`: ambil SEMUA teks, termasuk yang di-hidden (display:none), termasuk teks di `<script>` dan `<style>`.
- `innerText`: respect CSS — cuma teks yang KELIHATAN di layar, gak include hidden elements. Lebih berat secara performance karena browser harus compute layout.

```html
<div id="demo">
  <p>Teks <span style="display:none">sembunyi</span> muncul</p>
  <script>var x = 1;</script>
</div>
<script>
  const el = document.getElementById('demo');
  console.log(el.textContent); // "Teks sembunyi munculvar x = 1;"
  console.log(el.innerText);   // "Teks muncul" (cuma yang keliatan)
</script>
```

**Saran:** Pake `textContent` kalo lo butuh teks mentah (lebih cepat, lebih predictable). Pake `innerText` cuma kalo lo bener-bener perlu tau teks yang visible (jarang).

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

**Kenapa classList lebih baik dari inline style?**

1. **Separation of concerns** — Style di CSS, logic di JS. Kalo pake inline style, styling lo tersebar di HTML dan JS.
2. **Maintainability** — Ubah warna di satu tempat (CSS file), bukan di 10 tempat di JS.
3. **Specificity** — Class selector lebih mudah di-override daripada inline style (`!important`).
4. **Animasi & transition** — CSS transition bekerja mulus dengan class toggling. Inline style gak bisa ditransition.

```javascript
// ❌ Buruk: style campur aduk di JS
box.style.backgroundColor = 'red';
box.style.color = 'white';
box.style.borderRadius = '12px';
box.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

// ✅ Baik: pake class
box.classList.add('card', 'card--active');
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

**Atribut vs Property — bedanya apa?**

```javascript
// Atribut — yang ada di HTML asli
console.log(input.getAttribute('value')); // "default value" (nilai awal HTML)
input.setAttribute('disabled', '');

// Property — nilai JavaScript saat ini (bisa berubah)
console.log(input.value); // "Apa yang diketik user" (nilai terkini)
input.disabled = false;
```

Aturan praktis: pake **property** (langsung pake dot notation) kalo ada. Pake `setAttribute` cuma untuk atribut HTML yang gak punya property JavaScript (misal `aria-*`, `data-*`, atau `loading`).

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

**Metode append — mana yang dipake?**

| Method | Input | Posisi | Return |
|--------|-------|--------|--------|
| `appendChild(element)` | Element node | Sebagai child terakhir | Element yang ditambah |
| `append(elementOrString)` | Element atau string | Sebagai child terakhir | `undefined` |
| `prepend(elementOrString)` | Element atau string | Sebagai child pertama | `undefined` |
| `insertAdjacentHTML(pos, html)` | String HTML | 4 posisi (lihat bawah) | `undefined` |
| `before(element)` | Element | Sebelum element (sibling) | `undefined` |
| `after(element)` | Element | Sesudah element (sibling) | `undefined` |

**4 posisi `insertAdjacentHTML`:**
```javascript
// beforebegin — sebelum element itu sendiri (sibling sebelumnya)
// afterbegin — di dalam element, sebagai child pertama
// beforeend — di dalam element, sebagai child terakhir (paling umum)
// afterend — setelah element itu sendiri (sibling berikutnya)
element.insertAdjacentHTML('beforeend', '<p>Baris baru</p>');
```

**Performance tip:** Kalo lo bikin banyak element (misal 100 card), jangan `appendChild` satu-satu dalam loop. Pake `DocumentFragment` atau string:

```javascript
// ❌ Lambat: DOM diupdate setiap iterasi
data.forEach(item => {
  const el = document.createElement('div');
  el.textContent = item.name;
  container.appendChild(el);
});

// ✅ Cepat: 1x update DOM
const fragment = document.createDocumentFragment();
data.forEach(item => {
  const el = document.createElement('div');
  el.textContent = item.name;
  fragment.appendChild(el);
});
container.appendChild(fragment);

// ✅ Paling cepat (kalo banyak HTML): join string
container.innerHTML = data.map(item => `
  <div class="item">${item.name}</div>
`).join('');
```

### Hapus Element

```javascript
// Cara modern (ES6+)
const el = document.querySelector('.item');
el.remove(); // langsung hapus dari DOM

// Cara lama (masih banyak dipake)
el.parentNode.removeChild(el);
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

**Event listener bisa punya opsi ketiga:**
```javascript
btn.addEventListener('click', handler, { 
  once: true,      // otomatis remove setelah 1x jalan
  capture: true,   // jalan di fase capturing (bukan bubbling)
  passive: true    // optimasi scroll (gak pake preventDefault)
});
```

### Keyboard Events

```html
<input type="text" id="searchInput" placeholder="Ketik sesuatu...">
<p id="output"></p>

<script>
  document.getElementById('searchInput').addEventListener('keyup', (e) => {
    // e.key — karakter yang diketik
    // e.code — kode fisik keyboard (KeyA, ShiftLeft, dll)
    // e.ctrlKey, e.shiftKey, e.altKey — modifier keys
    
    if (e.key === 'Enter') {
      alert(`Mencari: ${e.target.value}`);
    } else {
      document.getElementById('output').textContent = 
        `Kamu ngetik: ${e.target.value}`;
    }
  });
</script>
```

**Key event yang mana?**

| Event | Kapan Jalan | value input | Cocok |
|-------|-------------|-------------|-------|
| `keydown` | Tombol ditekan | BELUM berubah | Deteksi shortcut keyboard |
| `keypress` | Tombol ditekan (huruf) | BELUM berubah | **Deprecated** — jangan pake |
| `keyup` | Tombol dilepas | UDAH berubah | Live search, karakter counter |

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

**Event Bubbling — kenapa event delegation bisa bekerja?**

Kalo lo klik sebuah elemen, eventnya "naik" (bubble) dari element terdalam ke parent, grandparent, sampai `document`:

```html
<div class="list">     <!-- 3. sampai sini -->
  <div class="list-item">  <!-- 2. naik ke sini -->
    <span>Klik aku</span>  <!-- 1. mulai dari sini -->
  </div>
</div>
```

Tanpa event delegation: tiap `.list-item` butuh listener sendiri — boros memory, apalagi kalo item-nya dinamis.

Dengan event delegation: SATU listener di parent, cek `e.target`, jalanin logic sesuai. Item baru yang ditambah otomatis kena efek listener.

**Praktik baik:** Pake `e.target.closest('.selector')` bukan `e.target.matches('.selector')`. Kenapa? Karena `closest` naik ke parent kalo yang diklik adalah child element di dalam item:

```javascript
// ❌ Gagal kalo user klik <span> di dalam item
list.addEventListener('click', (e) => {
  if (e.target.matches('.item')) { ... }
});

// ✅ Berfungsi kalo user klik mana pun di dalam item
list.addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (item) { ... }
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

### Validasi Form Real-time

Form yang baik kasih feedback pas user ngetik, bukan pas submit aja:

```html
<form id="registForm">
  <div class="field">
    <label>Email</label>
    <input type="email" id="email" required placeholder="nama@email.com">
    <small class="error-msg" id="emailError"></small>
  </div>
  <div class="field">
    <label>Password (min 6 karakter)</label>
    <input type="password" id="password" required minlength="6">
    <small class="error-msg" id="passError"></small>
  </div>
  <button type="submit" id="submitBtn" disabled>Daftar</button>
</form>

<script>
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passError = document.getElementById('passError');
  const submitBtn = document.getElementById('submitBtn');

  function validate() {
    let valid = true;

    // Validasi email
    if (!email.value.includes('@')) {
      emailError.textContent = 'Email harus mengandung @';
      email.classList.add('error');
      valid = false;
    } else {
      emailError.textContent = '';
      email.classList.remove('error');
    }

    // Validasi password
    if (password.value.length < 6) {
      passError.textContent = 'Password minimal 6 karakter';
      password.classList.add('error');
      valid = false;
    } else {
      passError.textContent = '';
      password.classList.remove('error');
    }

    submitBtn.disabled = !valid;
  }

  email.addEventListener('input', validate);
  password.addEventListener('input', validate);

  document.getElementById('registForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Form valid! Data siap dikirim.');
  });
</script>
```

### Event Objects — Properti Penting

Event object (`e`) punya properti yang sering dipake:

```javascript
element.addEventListener('click', (e) => {
  e.target;        // Element yang memicu event (yang diklik)
  e.currentTarget; // Element tempat listener dipasang
  
  e.preventDefault();  // Cegah default behavior (reload, link, dll)
  e.stopPropagation(); // Hentikan bubbling ke parent
  
  // Mouse events
  e.clientX;       // Posisi X mouse relatif ke viewport
  e.clientY;       // Posisi Y mouse relatif ke viewport
  
  // Keyboard events
  e.key;           // Karakter yang diketik ('Enter', 'a', 'Shift')
  e.code;          // Kode fisik keyboard ('Enter', 'KeyA', 'ShiftLeft')
  e.ctrlKey;       // Apakah Ctrl ditekan? true/false
  
  // Touch events (mobile)
  e.touches;       // Semua sentuhan jari
  e.changedTouches; // Sentuhan yang berubah
});
```

---

## Fetch API & Tampil Data

### Fetch Data dari API Publik

API publik gratis buat latihan:
- `https://jsonplaceholder.typicode.com/users` — data user
- `https://jsonplaceholder.typicode.com/posts` — data post
- `https://api.github.com/users/{username}` — data GitHub user
- `https://api.coindesk.com/v1/bpi/currentprice.json` — harga Bitcoin
- `https://api.publicapis.org/entries` — daftar public API
- `https://restcountries.com/v3.1/all` — data negara
- `https://catfact.ninja/fact` — random fact tentang kucing
- `https://dog.ceo/api/breeds/image/random` — random gambar anjing

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

**Response object — properti penting:**
```javascript
fetch(url).then(res => {
  res.ok;         // true kalo status 200-299
  res.status;     // 200, 404, 500, dll
  res.statusText; // "OK", "Not Found", "Internal Server Error"
  res.headers;    // response headers
  res.url;        // URL final (setelah redirect)
  
  // Method untuk parse body:
  res.json();     // parse sebagai JSON
  res.text();     // parse sebagai teks biasa
  res.blob();     // parse sebagai binary (gambar, file)
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

**Kenapa async/await lebih baik dari .then() chain?**
1. **Lebih mudah dibaca** — Kode terlihat sinkron (line-by-line), bukan nested callback chain.
2. **Error handling** — Pake `try/catch` seperti biasa, gak perlu `.catch()` terpisah.
3. **Debugging** — Stack trace lebih jelas, breakpoint bekerja normal.
4. **Conditional logic** — Gampang: kalo A gagal, jangan fetch B.

```javascript
// Contoh: fetch berantai dengan async/await
async function getUserPosts(username) {
  try {
    // Step 1: Cari user berdasarkan username
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error('User tidak ditemukan');
    const user = await userRes.json();
    
    // Step 2: Ambil repositori user
    const reposRes = await fetch(user.repos_url);
    const repos = await reposRes.json();
    
    // Step 3: Sort by stars (descending)
    const topRepos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);
    
    return { user, topRepos };
  } catch (err) {
    console.error('Gagal:', err.message);
    return null;
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

**Praktik baik loading state:**

1. **Tampilkan skeleton** — Daripada "Loading...", kasih placeholder abu-abu yang mirip bentuk konten asli. UX lebih baik karena user tau kontennya bakal kayak gimana.

```html
<!-- Skeleton loader untuk card -->
<div class="skeleton-card">
  <div class="skeleton-line h-4 w-3/4 mb-2 bg-gray-200 rounded animate-pulse"></div>
  <div class="skeleton-line h-3 w-1/2 mb-2 bg-gray-200 rounded animate-pulse"></div>
  <div class="skeleton-line h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
</div>
```

2. **Error yang informatif** — Jangan cuma "Error!". Kasih tau apa yang salah dan langkah selanjutnya:
   - "Koneksi internet terputus. Coba refresh halaman."
   - "User tidak ditemukan (404). Periksa username."
   - "Server sedang sibuk. Coba lagi nanti."

3. **Retry button** — Kasih tombol "Coba Lagi" kalo fetch gagal. Jangan paksa user reload halaman.

```javascript
function renderError(message) {
  container.innerHTML = `
    <div class="text-center py-8">
      <p class="text-red-500 mb-4">❌ ${message}</p>
      <button onclick="fetchData()" 
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
        Coba Lagi
      </button>
    </div>
  `;
}
```

### Filtering Data di Client

Setelah fetch data, sering kita perlu filter di sisi client:

```javascript
async function loadPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  const posts = await res.json();
  
  // Filter by userId
  const userPosts = posts.filter(p => p.userId === 1);
  
  // Search by keyword
  const keyword = 'javascript';
  const searchResults = posts.filter(p => 
    p.title.toLowerCase().includes(keyword)
  );
  
  // Sort by title
  const sorted = posts.sort((a, b) => a.title.localeCompare(b.title));
  
  // Pagination (halaman 1, 10 item per halaman)
  const page = 1;
  const perPage = 10;
  const paginated = posts.slice((page - 1) * perPage, page * perPage);
}
```

### Debugging Fetch

Kalo fetch gagal, cara debug sistematis:

1. **Cek di console browser** — Buka DevTools (F12) → Console. Error fetch muncul di sini.
2. **Cek Network tab** — DevTools → Network → filter "Fetch/XHR". Lihat:
   - Status code (200 = OK, 404 = not found, 500 = server error)
   - Response body (preview tab)
   - Headers (content-type harus application/json)
3. **Cek URL** — Copy paste URL ke browser. Kalo di browser muncul datanya, berarti URL bener. Kalo error, berarti URL salah atau API mati.
4. **Cek CORS** — Kalo fetch dari domain beda, kadang kena CORS error. API publik biasanya udah allow semua origin.
5. **Cek format response** — `response.json()` bakal error kalo response-nya bukan JSON valid. Pake `response.text()` dulu buat debug.

### Kesalahan Umum Fetch

1. **Lupa `await` atau `.then()`** — Fetch itu ASYNC. Kalo lo panggil `fetch(url)` tanpa await, lo dapet Promise, bukan data. Hasilnya `undefined` atau `[object Promise]`.

2. **Lupa check `response.ok`** — Fetch gak throw error buat 404/500. Cuma throw error kalo NETWORK error (no internet, DNS fail). Selalu check `response.ok` atau `response.status`.

3. **JSON.parse response dua kali** — `response.json()` SUDAH parse JSON. Jangan `JSON.parse(await res.json())` — itu error.

4. **Not handling loading state** — User lihat layar kosong selama fetch berjalan. Selalu tampilkan loading indicator.

5. **Gak pake try/catch di async function** — Kalo fetch gagal (network error), error-nya unhandled. Selalu wrap di try/catch.

6. **Menampilkan data mentah tanpa sanitasi** — Kalo lo pake `innerHTML` dengan data dari API yang lo gak kontrol (third-party API), lo risiko XSS. API publik JSONPlaceholder aman, tapi secara umum: sanitasi atau pake `textContent`.

---

## Latihan

1. **Todo List App** — Input buat nambah todo, tombol delete, toggle selesai/belum. Pake `createElement`, `classList.toggle`, `addEventListener`. Data disimpen di array local (belum localStorage).

2. **GitHub User Search** — Input username, fetch `https://api.github.com/users/{username}`, tampilin avatar, name, bio, public repos, followers/following. Handle error kalo user gak ditemukan (404).

3. **Dashboard API dengan filter** — Fetch dari `/users` dan `/posts`. Bikin filter: users by city, posts by userId. Tampilin loading spinner, handle error, tampilin jumlah data yang difilter.

4. **Deploy dashboard ke Vercel** — Ambil salah satu latihan di atas, deploy ke Vercel. Pastiin loading & error state berfungsi. Kirim URL.

5. **Bikin image gallery dengan infinite scroll** — Fetch dari `https://jsonplaceholder.typicode.com/photos`. Tampilkan 10 foto pertama. Kalo user scroll ke bawah, tambah 10 lagi. Pake event `scroll` atau `IntersectionObserver`. (Gunakan `data.slice(0, loadedCount)` untuk simulasi pagination.)

6. **Bikin catatan cuaca sederhana** — Fetch dari `https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&current_weather=true` (data cuaca Jakarta). Tampilkan: suhu, kecepatan angin, deskripsi cuaca. Tampilkan icon cuaca sesuai kondisi (cerah, berawan, hujan). Tambah tombol refresh. Handle error.

7. **Bikin CRUD notes app** — Form input: judul + isi notes. Tiap notes ada tombol edit dan delete. List semua notes dengan kartu. Data disimpen di array (belum API/server). Fitur: search notes by judul, sort by tanggal (terbaru dulu). Pake event delegation buat tombol edit/delete.

8. **Bikin kanban board sederhana** — 3 kolom: To Do, In Progress, Done. Pake drag events (dragstart, dragover, drop) buat mindahin card antar kolom. Data disimpen di array of objects. Tiap card: title + deskripsi singkat. Form buat nambah card baru. Styling pake Tailwind via CDN.
