---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/270637/pexels-pho"
footer: "Sesi 03: Client Side Search"
---

<!-- _class: title -->
# 03. Client-Side Search

## Kapan Pake Client-Side Search?

Server-side search (PostgreSQL FTS / Meilisearch) biasanya pilihan utama. Tapi ada situasi client-side search lebih cocok:

| Skenario | Server-Side | Client-Side |
|----------|-------------|-------------|
| Dataset kecil (< 10k items) | ❌ Overkill | ✅ Simple |
| Data statis / jarang berubah | ❌ | ✅ Satu kali fetch |
| Pencarian real-time | ✅ | ❌ Kalau data besar |
| Autocomplete cepet | ✅ Kalo dedicated | ✅ Instant |
| Typo tolerance kompleks | ✅ | 🔶 Terbatas |
| Filter + facet | ✅ | 🔶 Manual JS |
| User offline mode | ❌ Butuh network | ✅ Bisa offline |

**Rule of thumb:** kalau dataset < 5.000 item dan gak real-time sync, client-side search lebih simpel.

## Fuse.js

Fuse.js adalah lightweight fuzzy-search library (gak punya dependency). Cocok buat client-side search di browser.

### Setup

```bash
npm install fuse.js
```

CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.basic.min.js"></script>
```

### Basic Usage

```js
import Fuse from 'fuse.js';

const items = [
  { id: 1, title: 'Kopi Robusta Aceh', category: 'Minuman', price: 45000 },
  { id: 2, title: 'Teh Hijau Jawa Barat', category: 'Minuman', price: 35000 },
  { id: 3, title: 'Keripik Singkong Pedas', category: 'Makanan', price: 15000 }
];

const fuse = new Fuse(items, {
  keys: ['title', 'category'],
  threshold: 0.4   // 0 = exact, 1 = semua match
});

const results = fuse.search('kopi');
console.log(results);
// [
//   { item: { id: 1, ... }, refIndex: 0, score: 0.081 },
//   { item: { id: 2, ... }, refIndex: 1, score: 0.4  }  -- "Teh" match "kopi"? threshold
// ]
```

### Fuse.js Configuration

```js
const fuse = new Fuse(items, {
  // --- Keys ---
  keys: ['title', 'description', 'tags'],
  
  // --- Fuzzy options ---
  threshold: 0.4,         // 0.0 = exact, 1.0 = match everything
  distance: 100,          // max distance for fuzzy matching (in characters)
  location: 0,            // where search starts in string
  findAllMatches: false,  // find all matches or just enough
  minMatchCharLength: 2,  // minimum length of match
  
  // --- Scoring ---
  useExtendedSearch: false, // enable AND/OR/NOT syntax
  ignoreLocation: false,    // ignore position in string
  ignoreFieldNorm: false,   // ignore field length norm
  
  // --- Threshold ---
  isCaseSensitive: false,
  shouldSort: true,
  includeScore: true,
  includeMatches: true,    // include match positions for highlighting
  
  // --- Weight ---
  // Array: { name: 'title', weight: 2 } — title 2x penting
  keys: [
    { name: 'title', weight: 2 },
    { name: 'description', weight: 1 },
    { name: 'tags', weight: 1.5 }
  ]
});
```

### Threshold Explained

| Threshold | Behavior | Use Case |
|-----------|----------|----------|
| 0.0 | Exact match only | Code / SKU search |
| 0.2 | Very strict, minor typo | Product codes |
| 0.4 | Moderate fuzzy | General search (default) |
| 0.6 | Loose fuzzy | Search suggestion |
| 0.8-1.0 | Almost everything match | Autocomplete broad |

### Extended Search

```js
const fuse = new Fuse(items, {
  keys: ['title'],
  useExtendedSearch: true
});

// AND
fuse.search("'kopi 'robusta");   // must have kopi AND robusta

// OR
fuse.search("kopi | teh");       // kopi OR teh

// NOT
fuse.search("!kopi");            // exclude kopi

// Exact phrase
fuse.search('"kopi robusta"');   // exact phrase match
```

### Weighted Search

```js
const fuse = new Fuse(items, {
  keys: [
    { name: 'title', weight: 3 },       // title 3x lebih penting
    { name: 'tags', weight: 2 },
    { name: 'description', weight: 0.5 }
  ],
  threshold: 0.3
});
```

## lunr.js

Alternatif client-side search. Punya index building mirip Elasticsearch — lebih cocok buat dataset lumayan besar.

### Setup

```html
<script src="https://unpkg.com/lunr@2.3.9/lunr.min.js"></script>
```

```bash
npm install lunr
```

### Basic Usage

```js
import lunr from 'lunr';

// 1. Build index
const idx = lunr(function() {
  this.ref('id');
  this.field('title');
  this.field('description');
  this.field('tags');
  
  this.add({ id: 1, title: 'Kopi Robusta Aceh', 
             description: 'Kopi dengan cita rasa earthy', 
             tags: 'kopi robusta aceh' });
  this.add({ id: 2, title: 'Teh Hijau Jawa Barat', 
             description: 'Teh premium dari Gambung', 
             tags: 'teh hijau jawa' });
  this.add({ id: 3, title: 'Keripik Singkong Pedas', 
             description: 'Camilan pedas renyah', 
             tags: 'keripik singkong pedas' });
});

// 2. Search
const results = idx.search('kopi');
// [
//   { ref: '1', score: 1.386, matchData: { ... } },
//   { ref: '2', score: 0.446, ... }
// ]
```

### Perbandingan Fuse.js vs lunr.js

| Aspek | Fuse.js | lunr.js |
|-------|---------|---------|
| Algorithm | Bitap (fuzzy) | TF-IDF + inverted index |
| Fuzzy search | ✅ Built-in | ❌ Harus exact / wildcard |
| Index speed | O(n) linear | Build index dulu |
| Search speed | O(n) | O(1) lookup |
| Dataset besar | Lambat (>10k) | Cepet |
| Bundle size | ~15KB | ~30KB |
| Offline | ✅ | ✅ |

**Pilih Fuse.js** — dataset kecil, butuh fuzzy, instant setup.
**Pilih lunr.js** — dataset menengah (>5k), search cepet, butuh scoring.

## Search dengan Debounce

Jangan panggil API tiap user ngetik — nanti banjir request. Debounce nunggu user berhenti ngetik.

```html
<html>
<head>
  <title>Search Demo</title>
  <style>
    .search-container { max-width: 600px; margin: 40px auto; font-family: sans-serif; }
    #search-input { width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; }
    #search-results { margin-top: 12px; }
    .search-item { padding: 12px; border-bottom: 1px solid #eee; }
    .search-item h3 { margin: 0 0 4px 0; }
    .highlight { background: #fef08a; font-weight: 600; padding: 0 2px; border-radius: 2px; }
    .no-results { color: #666; text-align: center; padding: 20px; }
    .loading { color: #666; text-align: center; padding: 10px; }
    #autocomplete-list { position: absolute; width: 100%; background: white; border: 1px solid #ddd; 
                         border-top: none; max-height: 200px; overflow-y: auto; display: none; }
    .autocomplete-item { padding: 10px 12px; cursor: pointer; }
    .autocomplete-item:hover { background: #f0f0f0; }
  </style>
</head>
<body>
<div class="search-container">
  <h1>Search Products</h1>
  <div style="position: relative;">
    <input type="text" id="search-input" placeholder="Cari produk..." autocomplete="off">
    <div id="autocomplete-list"></div>
  </div>
  <div id="search-results"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.basic.min.js"></script>
<script>
// ---------- Debounce ----------
function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ---------- API Search ----------
async function searchProducts(query) {
  if (query.length < 2) {
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('autocomplete-list').style.display = 'none';
    return;
  }
  
  const resultsEl = document.getElementById('search-results');
  resultsEl.innerHTML = '<div class="loading">🔍 Mencari...</div>';
  
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
    const data = await res.json();
    renderResults(data.hits, query);
    renderAutocomplete(data.hits, query);
  } catch (err) {
    resultsEl.innerHTML = '<div class="no-results">Gagal mencari. Coba lagi.</div>';
  }
}

// Debounced version
const debouncedSearch = debounce(searchProducts, 300);

// ---------- Event Listener ----------
document.getElementById('search-input').addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('autocomplete-list').style.display = 'none';
  }
});

// Close autocomplete on click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    document.getElementById('autocomplete-list').style.display = 'none';
  }
});
</script>
</body>
</html>
```

## Autocomplete Dropdown

```js
function renderAutocomplete(hits, query) {
  const list = document.getElementById('autocomplete-list');
  
  if (!hits || hits.length === 0 || query.length < 2) {
    list.style.display = 'none';
    return;
  }
  
  const suggestions = hits.slice(0, 5);
  list.innerHTML = suggestions.map((hit, i) => {
    const title = highlightText(hit.name || hit.title, query);
    return `<div class="autocomplete-item" 
                  onclick="selectSuggestion('${hit.name || hit.title}')"
                  data-index="${i}">
              ${title}
            </div>`;
  }).join('');
  
  list.style.display = 'block';
}

function selectSuggestion(value) {
  document.getElementById('search-input').value = value;
  document.getElementById('autocomplete-list').style.display = 'none';
  searchProducts(value); // trigger full search
}

// Keyboard navigation for autocomplete
document.getElementById('search-input').addEventListener('keydown', (e) => {
  const list = document.getElementById('autocomplete-list');
  const items = list.querySelectorAll('.autocomplete-item');
  if (items.length === 0) return;
  
  let selectedIndex = -1;
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    // find currently selected
    items.forEach((item, i) => {
      if (item.style.background === 'rgb(240, 240, 240)') selectedIndex = i;
    });
    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    updateSelection(items, selectedIndex);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    items.forEach((item, i) => {
      if (item.style.background === 'rgb(240, 240, 240)') selectedIndex = i;
    });
    selectedIndex = Math.max(selectedIndex - 1, 0);
    updateSelection(items, selectedIndex);
  } else if (e.key === 'Enter' && selectedIndex >= 0) {
    e.preventDefault();
    items[selectedIndex].click();
  }
});

function updateSelection(items, index) {
  items.forEach((item, i) => {
    item.style.background = i === index ? '#f0f0f0' : 'white';
  });
}
```

## Search Result Highlighting

```js
function highlightText(text, query) {
  if (!text || !query) return text || '';
  
  // Escape regex special chars
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Split query into words, highlight each
  const words = escaped.split(/\s+/).filter(Boolean);
  let result = String(text);
  
  for (const word of words) {
    const regex = new RegExp(`(${word})`, 'gi');
    result = result.replace(regex, '<span class="highlight">$1</span>');
  }
  
  return result;
}

function renderResults(hits, query) {
  const resultsEl = document.getElementById('search-results');
  
  if (!hits || hits.length === 0) {
    resultsEl.innerHTML = '<div class="no-results">😕 Tidak ada hasil untuk "' + query + '"</div>';
    return;
  }
  
  resultsEl.innerHTML = hits.map(hit => `
    <div class="search-item">
      <h3>${highlightText(hit.name || hit.title, query)}</h3>
      <p>${highlightText(hit.description || hit.body?.substring(0, 150), query)}</p>
      <small>Kategori: ${hit.category} | Harga: Rp ${(hit.price || 0).toLocaleString()}</small>
    </div>
  `).join('');
}
```

## Lazy Load Search Index

Buat dataset besar, jangan load index di awal. Fetch pas user siap search.

```js
let fuseInstance = null;
let loading = false;

async function getFuse() {
  if (fuseInstance) return fuseInstance;
  if (loading) return null; // still loading
  
  loading = true;
  
  try {
    // Fetch index data from server (JSON)
    const res = await fetch('/api/search-index');
    const items = await res.json();
    
    fuseInstance = new Fuse(items, {
      keys: ['title', 'description', 'tags'],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true
    });
    
    loading = false;
    return fuseInstance;
  } catch (err) {
    loading = false;
    throw err;
  }
}

async function searchLocal(query) {
  const fuse = await getFuse();
  if (!fuse) return [];
  
  const results = fuse.search(query);
  return results.slice(0, 20).map(r => ({
    ...r.item,
    score: r.score,
    matches: r.matches
  }));
}
```

### Optimasi: Compress Index JSON

```js
// Server: generate pre-built index
// /api/search-index → return array of { id, title, description, tags, category, price }

// Browser: cache with localStorage
async function getSearchIndex() {
  const CACHE_KEY = 'app_search_index';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 menit
  
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const res = await fetch('/api/search-index');
  const data = await res.json();
  
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
}
```

## Full Demo — Client-Side Search dengan Fuse.js

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fuse.js Search Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; }
    h1 { margin-bottom: 20px; color: #1e293b; }
    .search-wrapper { position: relative; margin-bottom: 24px; }
    #search-input {
      width: 100%; padding: 14px 18px; font-size: 16px;
      border: 2px solid #e2e8f0; border-radius: 12px;
      outline: none; transition: border-color 0.2s;
    }
    #search-input:focus { border-color: #3b82f6; }
    
    .autocomplete-list {
      position: absolute; top: 100%; left: 0; right: 0;
      background: white; border: 1px solid #e2e8f0;
      border-top: none; border-radius: 0 0 12px 12px;
      max-height: 240px; overflow-y: auto; display: none;
      z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .autocomplete-item {
      padding: 10px 18px; cursor: pointer; font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
    }
    .autocomplete-item:last-child { border-bottom: none; }
    .autocomplete-item:hover, .autocomplete-item.active { background: #eff6ff; }
    .autocomplete-item .highlight { color: #2563eb; font-weight: 600; }
    
    #search-meta { font-size: 13px; color: #64748b; margin-bottom: 12px; }
    .search-hit {
      background: white; border-radius: 10px; padding: 16px 20px;
      margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .search-hit h3 { margin-bottom: 4px; color: #1e293b; }
    .search-hit p { font-size: 14px; color: #475569; margin-bottom: 6px; line-height: 1.5; }
    .search-hit .meta { font-size: 12px; color: #94a3b8; }
    .highlight { background: #fef08a; font-weight: 600; padding: 0 2px; border-radius: 2px; }
    .no-results { text-align: center; padding: 40px; color: #94a3b8; }
    .loading { text-align: center; padding: 20px; color: #64748b; }
  </style>
</head>
<body>
<div class="container">
  <h1>🔍 Cari Produk</h1>
  
  <div class="search-wrapper">
    <input type="text" id="search-input" placeholder="Ketik nama produk..." autocomplete="off">
    <div class="autocomplete-list" id="autocomplete-list"></div>
  </div>
  
  <div id="search-meta"></div>
  <div id="search-results"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.basic.min.js"></script>
<script>
// ===== Data =====
const DATA = [
  { id: 1, name: 'Kopi Robusta Aceh', desc: 'Kopi robusta asli dataran tinggi Gayo, Aceh. Rasa earthy dengan body tebal.', cat: 'Minuman', price: 45000 },
  { id: 2, name: 'Teh Hijau Jawa Barat', desc: 'Teh hijau premium dari perkebunan Gambung, Ciwidey. Aroma segar.', cat: 'Minuman', price: 35000 },
  { id: 3, name: 'Kopi Arabika Toraja', desc: 'Kopi arabika specialty dari Toraja, Sulawesi. Rasa fruity kompleks.', cat: 'Minuman', price: 65000 },
  { id: 4, name: 'Keripik Singkong Pedas', desc: 'Keripik singkong homemade dengan bumbu pedas level 5.', cat: 'Makanan', price: 15000 },
  { id: 5, name: 'Madu Hutan Sumbawa', desc: 'Madu hutan murni langsung dari Sumbawa. Kaya manfaat.', cat: 'Makanan', price: 85000 },
  { id: 6, name: 'Keripik Pisang Coklat', desc: 'Keripik pisang balut coklat Belgia. Cocok buat cemilan.', cat: 'Makanan', price: 20000 },
  { id: 7, name: 'Kopi Liberika Riau', desc: 'Kopi liberika langka asal Riau. Cita rasa unik dengan aroma buah.', cat: 'Minuman', price: 75000 },
  { id: 8, name: 'Teh Melati Nusantara', desc: 'Teh melati harum dengan campuran bunga melati asli.', cat: 'Minuman', price: 28000 },
  { id: 9, name: 'Abon Sapi Super', desc: 'Abon sapi asli 100% tanpa campuran. Gurih dan tahan lama.', cat: 'Makanan', price: 55000 },
  { id: 10, name: 'Coklat Papua Asli', desc: 'Coklat murni dari biji kakao Papua. Single origin.', cat: 'Makanan', price: 95000 },
];

// ===== Fuse.js Init =====
const fuse = new Fuse(DATA, {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'desc', weight: 1 },
    { name: 'cat', weight: 1 }
  ],
  threshold: 0.4,
  distance: 100,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2
});

// ===== Helpers =====
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text, query) {
  if (!text || !query) return text || '';
  const words = query.trim().split(/\s+/).filter(Boolean);
  let result = String(text);
  for (const word of words) {
    result = result.replace(new RegExp(`(${escapeRegex(word)})`, 'gi'), '<span class="highlight">$1</span>');
  }
  return result;
}

// ===== Render =====
function renderAutocomplete(results, query) {
  const list = document.getElementById('autocomplete-list');
  if (!results.length || query.length < 2) {
    list.style.display = 'none';
    return;
  }
  const top = results.slice(0, 5);
  list.innerHTML = top.map(r => 
    `<div class="autocomplete-item">${highlight(r.item.name, query)}</div>`
  ).join('');
  list.style.display = 'block';
  
  // Click handler
  list.querySelectorAll('.autocomplete-item').forEach((el, i) => {
    el.addEventListener('click', () => {
      document.getElementById('search-input').value = top[i].item.name;
      list.style.display = 'none';
      doSearch(top[i].item.name);
    });
  });
}

function renderResults(results, query) {
  const resultsEl = document.getElementById('search-results');
  const metaEl = document.getElementById('search-meta');
  
  if (!results.length) {
    metaEl.textContent = '';
    resultsEl.innerHTML = `<div class="no-results">😕 Tidak ada hasil untuk "<strong>${query}</strong>"</div>`;
    return;
  }
  
  metaEl.textContent = `${results.length} hasil untuk "${query}"`;
  resultsEl.innerHTML = results.map(r => `
    <div class="search-hit">
      <h3>${highlight(r.item.name, query)}</h3>
      <p>${highlight(r.item.desc, query)}</p>
      <div class="meta">${r.item.cat} · Rp ${r.item.price.toLocaleString()} · Skor: ${(1 - r.score).toFixed(2)}</div>
    </div>
  `).join('');
}

function doSearch(query) {
  if (query.trim().length < 2) {
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-meta').textContent = '';
    return;
  }
  const results = fuse.search(query.trim());
  renderResults(results, query.trim());
}

const debouncedSearch = debounce(doSearch, 250);
const debouncedAutocomplete = debounce(renderAutocomplete, 150);

// ===== Event =====
document.getElementById('search-input').addEventListener('input', (e) => {
  const q = e.target.value;
  if (q.length >= 2) {
    debouncedSearch(q);
    const results = fuse.search(q);
    debouncedAutocomplete(results.slice(0, 5), q);
  } else {
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-meta').textContent = '';
    document.getElementById('autocomplete-list').style.display = 'none';
  }
});

document.getElementById('search-input').addEventListener('focus', (e) => {
  if (e.target.value.length >= 2) {
    document.getElementById('autocomplete-list').style.display = 'block';
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrapper')) {
    document.getElementById('autocomplete-list').style.display = 'none';
  }
});

document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('autocomplete-list').style.display = 'none';
  }
});
</script>
</body>
</html>
```

## Latihan

### Latihan 1: Fuse.js Setup
Ambil data 20 produk (buat dummy JSON). Setup Fuse.js dengan keys: name (weight 2), description (weight 1), tags (weight 1.5). Threshold 0.3. Uji search "kopi", "teh manis", "keripik". Buat tabel perbandingan hasil.

### Latihan 2: Debounce + Autocomplete
Buat HTML page dengan search input. Implement debounce 300ms. Tampilkan autocomplete dropdown 5 saran teratas pas user ngetik. Navigasi pake arrow keys + enter. Highlight text match di dropdown.

### Latihan 3: Search Result Highlighting
Dari hasil search Fuse.js, tampilkan 10 hasil dengan:
- Judul di-highlight (span.highlight)
- Deskripsi snippet 100 karakter + highlight
- Score relevansi (1 - score) ditampilkan
- Kalo gak ada hasil, tampilkan "Tidak ada hasil untuk [query]"

### Latihan 4: Lazy Load + lunr.js
Implementasi client-side search pake lunr.js. Data 100 item di-fetch dari API `/api/products-index`. Lazy load: index di-build pas pertama kali user search. Cache index di localStorage (5 menit). Bandingkan performance Fuse.js vs lunr.js buat 100 item.
