# PWA & Offline — Latihan

## Level 1: Dasar

### 1. Service Worker — Lifecycle
**Pertanyaan:** Sebutkan 4 tahap lifecycle Service Worker dan jelaskan tiap tahap terjadi kapan.

**Hint:** Install → Activate → (idle) → Fetch. Service Worker nggak punya akses ke DOM, jalan di thread terpisah.

---

### 2. Service Worker — Register
**Pertanyaan:** Tulis kode untuk mendaftarkan Service Worker di aplikasi web:

1. Register file `sw.js` dari scope `/app/`
2. Handle error kalau browser nggak support
3. Log status registrasi (installing, active, waiting)

**Hint:**
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/app/' })
    .then(reg => console.log('SW registered:', reg.scope))
    .catch(err => console.log('SW registration failed:', err));
}
```

---

### 3. Cache API — Simpan & Ambil Asset
**Pertanyaan:** Tulis Service Worker yang:

1. Saat `install`: cache file `/index.html`, `/style.css`, `/app.js`, `/logo.png` dengan cache name `v1`
2. Saat `fetch`: cek di cache dulu, kalau ada return dari cache, kalau nggak fetch dari network

**Hint:**
```javascript
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => cache.addAll(['/index.html', '/style.css', '/app.js', '/logo.png']))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
```

---

### 4. Cache Strategy — Cache First vs Network First
**Pertanyaan:** Cocokkan skenario dengan strategi cache yang tepat:

| Skenario | Strategi |
|----------|----------|
| Halaman HTML utama | a. Cache First |
| API request saldo akun | b. Network First |
| Logo perusahaan (jarang berubah) | c. Stale-While-Revalidate |
| Avatar user (sering ganti) | d. Network Only |

**Hint:** Cache First = cepat, mungkin basi. Network First = selalu fresh, lebih lambat. Stale-While-Revalidate = instant + update background.

---

### 5. Cache Strategy — Stale-While-Revalidate
**Pertanyaan:** Implementasi strategi stale-while-revalidate di Service Worker:

1. Return dari cache (kalau ada)
2. Fetch dari network (update cache)
3. Kalau nggak ada di cache, tunggu fetch selesai
4. Kalau network error, return cache yang ada (walaupun basi)

**Hint:**
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        caches.open('v1').then(cache => cache.put(event.request, response.clone()));
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
```

---

### 6. IndexedDB — Open Database & Object Store
**Pertanyaan:** Tulis kode IndexedDB untuk:

1. Buka database `NotesDB` versi 1
2. Buat object store `notes` dengan key path `id`
3. Buat index `by_title` pada field `title`

**Hint:**
```javascript
const request = indexedDB.open('NotesDB', 1);
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const store = db.createObjectStore('notes', { keyPath: 'id' });
  store.createIndex('by_title', 'title', { unique: false });
};
```

---

### 7. IndexedDB — CRUD Operations
**Pertanyaan:** Tulis fungsi CRUD untuk object store `notes`:

1. `addNote(db, note)` — tambah note baru
2. `getNote(db, id)` — ambil note by id
3. `getAllNotes(db)` — ambil semua notes
4. `updateNote(db, note)` — update note
5. `deleteNote(db, id)` — hapus note

**Hint:**
```javascript
function addNote(db, note) {
  const tx = db.transaction('notes', 'readwrite');
  const store = tx.objectStore('notes');
  store.add(note);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
```

---

### 8. Web App Manifest — Dasar
**Pertanyaan:** Buat file `manifest.json` yang mencakup:

1. `name`: "CatatanKu", `short_name`: "CatKu"
2. `start_url`: "/", `display`: "standalone"
3. `background_color`: "#ffffff", `theme_color`: "#6200ee"
4. Ikon: 192x192 dan 512x512
5. `description`: "Aplikasi catatan offline-first"

**Hint:**
```json
{
  "name": "CatatanKu",
  "short_name": "CatKu",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6200ee",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Level 2: Intermediate

### 9. Service Worker — Cache Versioning & Cleanup
**Pertanyaan:** Implementasi cache versioning:

1. Cache name: `my-app-v1`, `my-app-v2`, dst
2. Saat `activate`, hapus semua cache yang bukan versi terbaru
3. Pastikan halaman yang lama nggak pakai cache yang udah dihapus (`clients.claim()`)

**Hint:**
```javascript
const CACHE_NAME = 'my-app-v3';
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => clients.claim())
  );
});
```

---

### 10. IndexedDB — Search & Filter
**Pertanyaan:** Tambahkan fungsi pencarian ke IndexedDB notes:

1. `searchNotes(db, query)` — cari notes yang title-nya mengandung kata kunci (case-insensitive)
2. `getNotesByDate(db, startDate, endDate)` — filter notes dalam range tanggal

**Hint:**
```javascript
function searchNotes(db, query) {
  const tx = db.transaction('notes', 'readonly');
  const store = tx.objectStore('notes');
  const index = store.index('by_title');
  const range = IDBKeyRange.bound(query.toLowerCase(), query.toLowerCase() + '\uffff');
  const results = [];
  return new Promise((resolve) => {
    index.openCursor(range).onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) { results.push(cursor.value); cursor.continue(); }
      else resolve(results);
    };
  });
}
```

---

### 11. Push Notification — Subscribe & Send
**Pertanyaan:** Implementasi push notification:

**Client:**
1. Minta permission notifikasi
2. Subscribe ke push service dengan VAPID public key
3. Kirim subscription object ke server
4. Handle push event di Service Worker → tampilkan notifikasi

**Server:**
5. Endpoint `POST /api/push/subscribe` — simpan subscription
6. Endpoint `POST /api/push/send` — kirim notifikasi ke semua subscriber

**Hint:**
```javascript
// Client
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
});
await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
```

```javascript
// Server (web-push library)
const webpush = require('web-push');
webpush.setVapidDetails('mailto:admin@example.com', vapidPublicKey, vapidPrivateKey);
await webpush.sendNotification(subscription, JSON.stringify({ title: 'Catatan Baru', body: '...' }));
```

---

### 12. Background Sync — Offline Actions
**Pertanyaan:** Implementasi background sync untuk form submit offline:

1. Saat user submit form offline, simpan data ke IndexedDB (queue)
2. Daftarkan `sync` event: `registration.sync.register('sync-notes')`
3. Service Worker tangkap `sync` event → kirim data yang terqueue ke server
4. Kalau berhasil, hapus dari queue
5. Tampilkan notifikasi kalau sync berhasil

**Hint:**
```javascript
// Client
async function submitNoteOffline(note) {
  await saveToQueue(note); // IndexedDB
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-notes');
}

// Service Worker
self.addEventListener('sync', event => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});
async function syncNotes() {
  const notes = await getQueue();
  for (const note of notes) {
    try {
      await fetch('/api/notes', { method: 'POST', body: JSON.stringify(note) });
      await removeFromQueue(note.id);
    } catch (e) {
      // Will retry next sync
    }
  }
}
```

---

### 13. Manifest — Advanced Configuration
**Pertanyaan:** Tambahkan konfigurasi lanjutan ke manifest.json:

1. `orientation: "portrait-primary"` — kunci orientasi
2. `scope: "/app/"` — batasi scope PWA
3. `categories: ["productivity", "utilities"]`
4. `screenshots`: tambahkan 2 screenshot (1280x720 dan 720x1280)
5. `description` dan `lang: "id-ID"`
6. `iarc_rating_id: "e2a9a8b0-..."`

Jelaskan fungsi tiap properti.

**Hint:** Screenshots dipakai Google Play Store untuk PWA di Play Store. Scope membatasi halaman mana yang dianggap bagian dari PWA.

---

### 14. Offline Fallback — Custom Offline Page
**Pertanyaan:** Implementasi offline fallback page:

1. Buat `/offline.html` — halaman offline dengan pesan ramah + tombol retry
2. Di Service Worker, kalau request halaman gagal (network error), return `/offline.html`
3. Cache `/offline.html` saat install
4. Tambahkan informasi: "Kamu sedang offline. Perubahan akan disimpan dan dikirim saat online."
5. Deteksi online/offline di client → tampilkan banner

**Hint:**
```javascript
// Service Worker
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
  }
});
```

```javascript
// Client
window.addEventListener('online', () => { document.getElementById('offline-banner').style.display = 'none'; });
window.addEventListener('offline', () => { document.getElementById('offline-banner').style.display = 'block'; });
```

---

## Level 3: Challenge

### 15. Full PWA — Offline-first Notes App
**Skenario:** Bangun aplikasi catatan offline-first lengkap.

**Pertanyaan:** Implementasi aplikasi web dengan fitur:

**Frontend (HTML + CSS + JS):**
1. CRUD catatan (title, body, tags, createdAt, updatedAt)
2. Markdown support untuk body
3. Search & filter by tags
4. Dark mode

**Offline-first:**
5. IndexedDB sebagai primary data store
6. Background sync untuk upload catatan baru saat online
7. Service Worker dengan strategi:
   - Static assets: Cache First
   - API requests: Network First dengan fallback IndexedDB
8. Conflict resolution: timestamp-based (yang terbaru menang)
9. PWA manifest + install prompt

**Service Worker:**
10. Cache versioning + cleanup
11. Offline page fallback
12. Push notifications (reminder untuk nulis catatan tiap hari)

**Persyaratan teknis:**
- Zero framework (vanilla JS)
- Semua halaman dalam 1 HTML file (SPA)
- Ukuran total < 100kB (termasuk CSS + JS inline)

Tulis kode lengkap (HTML + CSS + JS + SW).

**Hint:**
```javascript
// Data flow offline-first
async function saveNote(note) {
  note.updatedAt = Date.now();
  note.syncStatus = 'pending';
  await idbSave(note); // IndexedDB
  if (navigator.onLine) {
    try {
      await apiSave(note);
      note.syncStatus = 'synced';
      await idbUpdate(note);
    } catch (e) {
      registerSync();
    }
  } else {
    registerSync();
  }
}
```

---

### 16. PWA E-commerce — Offline Product Catalog
**Skenario:** Toko online butuh akses katalog produk walau offline.

**Pertanyaan:** Implementasi:

**Data Layer:**
1. IndexedDB store: `products`, `categories`, `cart`
2. Store produk lengkap (nama, harga, gambar, deskripsi, stok) untuk browsing offline
3. Cart berfungsi offline (simpan di IndexedDB)
4. Checkout: kalau offline, simpan order di queue → submit saat online

**Service Worker:**
5. Cache First untuk gambar produk (100 item cache max, LRU eviction)
6. Stale-While-Revalidate untuk data produk
7. Background sync untuk order submission
8. Push notification: "Pesananmu sudah terkirim!" setelah sukses

**UX:**
9. Badge cart count update walau offline (pakai IndexedDB observer atau custom event)
10. Halaman offline yang menampilkan produk terakhir dilihat
11. Progress indicator: "3 pesanan menunggu dikirim" saat online balik
12. Optimistic UI: tambah item ke cart langsung muncul, sync di background

**Hint:** LRU cache: gunakan Map dengan insertion order. Saat cache penuh, hapus item yang paling lama diakses. IndexedDB punya `getAll()` — bisa dipake untuk render full catalog offline.

---

### 17. Real-time Collaboration — CRDT + P2P + PWA
**Skenario:** Aplikasi dokumen kolaboratif real-time yang berfungsi offline.

**Pertanyaan:** Implementasi arsitektur:

**Data Synchronization:**
1. Gunakan CRDT (Conflict-free Replicated Data Type) untuk merge conflict otomatis
2. Local IndexedDB sebagai primary store
3. Saat online, sync via WebSocket ke server (broadcast ke client lain)
4. Saat offline, simpan perubahan di local → sync saat online
5. Server hanya relay (tidak simpan state)

**PWA Features:**
6. Service Worker cache static assets
7. Background sync untuk perubahan yang terlewat
8. Push notification: "Dokumen telah diubah oleh UserX" (kalau perlu)

**CRDT Implementation (sederhana):**
9. Tiap operasi punya: `{ userId, timestamp, position, insert/delete, content }`
10. Urutkan operasi berdasarkan `[timestamp, userId]` untuk konsistensi
11. Merge: aplikasikan operasi yang belum pernah diaplikasikan

**Pertanyaan:**
- Desain struktur data CRDT untuk dokumen teks
- Implementasi fungsi merge untuk 2 versi dokumen
- Desain protokol sync (WebSocket message format)
- Gimana handle conflict kalau 2 user edit kata yang sama di posisi sama?

**Hint:**
```javascript
// CRDT operation
const op = { id: 'uuid', userId: 'user1', timestamp: Date.now(), type: 'insert', pos: 5, content: 'a', version: 3 };
// Merge: sort by timestamp, apply in order
function merge(localOps, remoteOps) {
  const all = [...localOps, ...remoteOps].sort((a, b) => a.timestamp - b.timestamp || a.userId.localeCompare(b.userId));
  // Deduplicate by id, apply in order
}
```

---

### 18. Full PWA Workflow — CI/CD + Audit + Deploy
**Skenario:** Pipeline otomatis untuk PWA dari development ke production.

**Pertanyaan:** Desain dan implementasi:

**Lighthouse CI:**
1. Audit PWA checklist:
   - `installable`: true
   - `service-worker`: true
   - `offline-start-url`: 200
   - `splash-screen`: true
   - `themed-omnibox`: true
   - `content-width`: true
   - `viewport`: true
2. Target skor PWA ≥ 90
3. Budget: JS ≤ 50kB, HTML ≤ 10kB

**Workbox Config:**
4. Implementasi Service Worker dengan Workbox (webpack plugin):
   - Precaching static assets
   - Runtime caching: images (CacheFirst), API (NetworkFirst), pages (NetworkFirst with offline fallback)
   - Skip waiting + clients claim

**Deploy:**
5. Deploy ke Cloudflare Pages atau Vercel
6. Konfigurasi custom domain + HTTPS
7. Cache headers di edge (max-age 1 tahun untuk assets hashed)

**Monitoring:**
8. Web Vitals RUM (Real User Monitoring)
9. Online/offline event tracking (Google Analytics custom event)
10. Push notification success rate tracking

Tulis:
- `.github/workflows/pwa-audit.yml` — jalanin Lighthouse CI di tiap PR
- `webpack.config.js` — dengan Workbox plugin
- `wrangler.toml` atau `vercel.json` — konfigurasi deploy
- Service Worker (Workbox generateSW atau injectManifest)

**Hint:**
```javascript
// webpack.config.js
const { InjectManifest } = require('workbox-webpack-plugin');
module.exports = {
  plugins: [
    new InjectManifest({
      swSrc: './src/sw.js',
      swDest: 'sw.js',
      maximumFileSizeToCacheInBytes: 5000000,
    })
  ]
};
```

```yaml
# .github/workflows/pwa-audit.yml
name: PWA Audit
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - name: Run Lighthouse CI
        run: npx lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_TOKEN }}
```
