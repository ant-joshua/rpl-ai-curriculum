# 2. IndexedDB & Offline-First

## Kenapa IndexedDB?

Cache API bagus buat nyimpen file (HTML, CSS, JS, gambar). Tapi kalo butuh **nyimpen data terstruktur** (catatan, user data, transactions) — pake **IndexedDB**.

### Perbandingan Storage di Browser

| Storage | Tipe Data | Kapasitas | Query | Async | PWA cocok? |
|---------|-----------|-----------|-------|-------|-----------|
| localStorage | String key-value | ~10MB | ❌ | ❌ | ❌ (sync, blocking) |
| SessionStorage | String key-value | ~10MB | ❌ | ❌ | ❌ |
| Cache API | Request/Response | Banyak | ❌ | ✅ | Untuk file |
| **IndexedDB** | Object (apa aja) | Hampir unlimited | ✅ (indexes) | ✅ | **Untuk data** |
| Origin Private File System | File | Banyak | ❌ | ✅ | File besar |

### Kelebihan IndexedDB

- Nyimpen **object JavaScript langsung** (gak perlu JSON.stringify)
- **Indexed queries** — cari data berdasarkan field tertentu
- **Transaction-based** — atomic, bisa rollback
- **Large capacity** — ratusan MB sampai GB
- **Async** — gak blocking main thread

## Konsep IndexedDB

IndexedDB punya struktur hirarkis:

```
Database
  └── Object Store (mirip table di SQL)
        ├── Record 1 (key: 1, value: { title: "Catatan 1" })
        ├── Record 2 (key: 2, value: { title: "Catatan 2" })
        └── Index (mirip index di SQL)
              └── by title, by date, etc.
```

### API Native (raw) — paham konsep dulu

```javascript
// Buka / buat database
const request = indexedDB.open('NotesDB', 1);

// Upgrade — dipanggil pas pertama kali atau version berubah
request.onupgradeneeded = event => {
  const db = event.target.result;

  // Buat object store dengan auto-increment key
  const store = db.createObjectStore('notes', {
    keyPath: 'id',
    autoIncrement: true
  });

  // Buat index untuk query
  store.createIndex('by_title', 'title', { unique: false });
  store.createIndex('by_created', 'createdAt', { unique: false });

  console.log('[IDB] Database upgraded');
};

request.onsuccess = event => {
  const db = event.target.result;
  console.log('[IDB] Database opened:', db.name, 'v' + db.version);
};

request.onerror = event => {
  console.error('[IDB] Error:', event.target.error);
};
```

### CRUD dengan Native API

```javascript
// CREATE
function addNote(db, note) {
  const tx = db.transaction('notes', 'readwrite');
  const store = tx.objectStore('notes');
  const request = store.add({
    title: note.title,
    body: note.body,
    createdAt: new Date().toISOString(),
    synced: false
  });

  request.onsuccess = () => console.log('[IDB] Note added, id:', request.result);
  request.onerror = err => console.error('[IDB] Add error:', err);

  // Tunggu transaction selesai
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
  });
}

// READ — by key
function getNote(db, id) {
  const tx = db.transaction('notes', 'readonly');
  const store = tx.objectStore('notes');
  const request = store.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// READ — all with index
function getNotesByTitle(db, searchTerm) {
  const tx = db.transaction('notes', 'readonly');
  const store = tx.objectStore('notes');
  const index = store.index('by_title');

  // Range query: title mulai dari searchTerm
  const range = IDBKeyRange.bound(searchTerm, searchTerm + '\uffff');
  const request = index.openCursor(range);
  const results = [];

  return new Promise((resolve, reject) => {
    request.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// UPDATE
function updateNote(db, id, updates) {
  const tx = db.transaction('notes', 'readwrite');
  const store = tx.objectStore('notes');

  // Get dulu, merge, terus put
  store.get(id).onsuccess = event => {
    const note = event.target.result;
    const updated = { ...note, ...updates, updatedAt: new Date().toISOString() };
    store.put(updated);
  };

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// DELETE
function deleteNote(db, id) {
  const tx = db.transaction('notes', 'readwrite');
  const store = tx.objectStore('notes');
  store.delete(id);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
```

## Library `idb` (Recommended)

API native IndexedDB **ribet** — banyak boilerplate, event-based, gak pake Promise. **Lebih pake `idb`** — wrapper kecil yang pake Promise.

### Instalasi

```bash
npm install idb
# atau CDN
# import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/+esm'
```

### Setup dengan idb

```javascript
import { openDB } from 'idb';

const DB_NAME = 'NotesDB';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // Hapus store lama kalo ada perubahan schema
    if (oldVersion < 1) {
      const store = db.createObjectStore('notes', {
        keyPath: 'id',
        autoIncrement: true
      });
      store.createIndex('by_title', 'title');
      store.createIndex('by_created', 'createdAt');
      store.createIndex('by_synced', 'synced');
      store.createIndex('by_updated', 'updatedAt');
    }
  }
});
```

### CRUD dengan idb (jauh lebih simple)

```javascript
// CREATE
async function addNote(note) {
  const db = await dbPromise;
  const id = await db.add('notes', {
    title: note.title,
    body: note.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false
  });
  console.log('[idb] Note added:', id);
  return id;
}

// READ — by key
async function getNote(id) {
  const db = await dbPromise;
  return db.get('notes', id);
}

// READ — semua notes, sorted by date
async function getAllNotes() {
  const db = await dbPromise;
  const index = db.transaction('notes').store.index('by_created');
  return index.getAll(); // DESC pake .reverse()
}

// READ — query by index
async function searchNotes(searchTerm) {
  const db = await dbPromise;
  const index = db.transaction('notes').store.index('by_title');

  // IDBKeyRange — cari yang mulai dari searchTerm
  const range = IDBKeyRange.bound(
    searchTerm,
    searchTerm + '\uffff'
  );
  return index.getAll(range);
}

// UPDATE
async function updateNote(id, updates) {
  const db = await dbPromise;
  const note = await db.get('notes', id);
  if (!note) throw new Error('Note not found');

  const updated = {
    ...note,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  await db.put('notes', updated);
  return updated;
}

// DELETE
async function deleteNote(id) {
  const db = await dbPromise;
  await db.delete('notes', id);
}

// BULK — add many at once
async function addNotesBulk(notes) {
  const db = await dbPromise;
  const tx = db.transaction('notes', 'readwrite');
  const ids = await Promise.all(
    notes.map(note => tx.store.add({
      ...note,
      createdAt: new Date().toISOString(),
      synced: false
    }))
  );
  await tx.done;
  return ids;
}
```

## Offline-First Architecture

### Konsep

Offline-first artinya **aplikasi harus jalan dulu baru butuh internet** — bukan sebaliknya.

```
                    ┌──────────────────┐
                    │    User Action    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Local DB (IDB) │ ◄── Write lokal dulu
                    │   + Optimistic   │
                    │   UI Update      │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Online?        │
                    └────────┬─────────┘
                             │
               ┌─────────────┴─────────────┐
               ▼                           ▼
        ┌──────────────┐          ┌──────────────────┐
        │ Sync ke API  │          │ Queue di          │
        │ (fetch/POST) │          │ Background Sync   │
        └──────┬───────┘          └────────┬─────────┘
               │                           │
               ▼                           ▼
        ┌──────────────┐          ┌──────────────────┐
        │ Update sync  │          │ Otomatis sync    │
        │ status = true│          │ pas online balik  │
        └──────────────┘          └──────────────────┘
```

### Optimistic UI

**Rule #1 Offline-First:** Update UI duluan, sync ke server belakangan.

```javascript
// ❌ BURUK — nunggu server dulu baru update UI
async function saveNoteBad(title, body) {
  const response = await fetch('/api/notes', {
    method: 'POST',
    body: JSON.stringify({ title, body })
  });
  const saved = await response.json();
  renderedList.addNote(saved); // UI nunggu server
}

// ✅ BAIK — update UI langsung, sync belakangan
async function saveNoteGood(title, body) {
  const localNote = {
    id: `temp_${Date.now()}`,
    title,
    body,
    createdAt: new Date().toISOString(),
    synced: false
  };

  // Simpan ke IndexedDB dulu
  await addNote(localNote);

  // Update UI langsung (optimistic)
  renderedList.addNote(localNote);

  // Coba sync ke server (gagal gapapa — nanti di-retry)
  syncNoteToServer(localNote).catch(() => {
    console.log('[Sync] Gagal — akan di-retry nanti');
  });
}

async function syncNoteToServer(note) {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: note.title,
      body: note.body,
      clientId: note.id
    })
  });

  if (!response.ok) throw new Error('Sync failed');

  const serverNote = await response.json();

  // Update local note dengan ID server
  await updateNote(note.id, {
    id: serverNote.id,
    synced: true
  });
}
```

## Background Sync API

Background Sync nunda action sampe koneksi internet balik — bahkan kalo user udah nutup tab.

### Register Sync di SW

```javascript
// Di halaman utama
async function registerSync() {
  const registration = await navigator.serviceWorker.ready;

  try {
    await registration.sync.register('sync-notes');
    console.log('[Sync] Registered background sync');
  } catch (err) {
    console.log('[Sync] Background Sync not supported:', err.message);
  }
}
```

### Handle Sync Event di SW

```javascript
// sw.js
self.addEventListener('sync', event => {
  if (event.tag === 'sync-notes') {
    console.log('[SW Sync] Triggered');
    event.waitUntil(syncUnsyncedNotes());
  }
});

async function syncUnsyncedNotes() {
  // Ambil semua data yang belum sync dari IDB
  // (pake idb import atau postMessage)

  // Kirim message ke halaman terbuka buat minta data
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'GET_UNSYNCED_NOTES' });
  });
}
```

### Periodik Background Sync (opsional)

```javascript
// Cuma support di Chrome ≥ 80 (HTTPS + PWA installed)
const status = await navigator.permissions.query({
  name: 'periodic-background-sync'
});

if (status.state === 'granted') {
  const registration = await navigator.serviceWorker.ready;
  await registration.periodicSync.register('periodic-sync', {
    minInterval: 24 * 60 * 60 * 1000 // sekali sehari
  });
}
```

## Conflict Resolution

Pas online balik, data lokal dan server mungkin beda. Butuh strategi conflict resolution.

### Strategi Conflict Resolution

| Strategi | Cara | Cocok untuk |
|----------|------|-------------|
| **Last-Write-Wins (LWW)** | Timestamp terakhir yang menang | Catatan sederhana |
| **Manual Merge** | Tampilin dua versi, user milih | Dokumen, edit konten |
| **CRDT** | Merge otomatis tanpa conflict | Collaborative editing |
| **Version Vector** | Tracking perubahan per node | Multi-device sync |

### Implementasi LWW

```javascript
async function syncNotes() {
  const db = await dbPromise;
  const localNotes = await db.getAll('notes');

  for (const local of localNotes) {
    const response = await fetch(`/api/notes/${local.id}`, {
      headers: { 'If-Unmodified-Since': local.updatedAt }
    });

    if (response.status === 409) {
      // Conflict — server punya versi lebih baru
      const serverNote = await response.json();

      // LWW: timestamps
      if (serverNote.updatedAt > local.updatedAt) {
        // Server menang — update local
        await db.put('notes', { ...serverNote, synced: true });
      } else {
        // Local menang — overwrite server
        await fetch(`/api/notes/${local.id}`, {
          method: 'PUT',
          body: JSON.stringify(local)
        });
      }
    }
  }
}
```

### Manual Merge (better UX)

```javascript
async function handleConflict(serverNote, localNote) {
  // Kirim dua versi ke UI buat dipilih user
  const choice = await showMergeDialog({
    local: localNote,
    server: serverNote
  });

  if (choice === 'local') {
    // Pakai versi lokal
    await fetch(`/api/notes/${localNote.id}`, {
      method: 'PUT',
      body: JSON.stringify(localNote)
    });
  } else if (choice === 'server') {
    // Pakai versi server
    const db = await dbPromise;
    await db.put('notes', { ...serverNote, synced: true });
  } else if (choice === 'merge') {
    // Merge manual — user edit sendiri
    const merged = mergeNotes(serverNote, localNote);
    await fetch(`/api/notes/${merged.id}`, {
      method: 'PUT',
      body: JSON.stringify(merged)
    });
  }
}
```

### Network-Aware Helper

```javascript
function isOnline() {
  return navigator.onLine;
}

// Listen perubahan koneksi
window.addEventListener('online', () => {
  console.log('[Network] Online — trigger sync');
  syncNotes();
});

window.addEventListener('offline', () => {
  console.log('[Network] Offline — semua perubahan lokal');
  showOfflineBanner();
});

// Detection lebih reliable — ping server
async function checkServerReachable() {
  try {
    const response = await fetch('/api/health', { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
```

## Full Offline-First Flow

```javascript
// notes-app.js — implementasi lengkap
import { openDB } from 'idb';

class NotesApp {
  constructor() {
    this.dbPromise = this.initDB();
    this.setupListeners();
  }

  async initDB() {
    return openDB('NotesDB', 1, {
      upgrade(db) {
        const store = db.createObjectStore('notes', {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('by_synced', 'synced');
        store.createIndex('by_updated', 'updatedAt');
        store.createIndex('by_deleted', 'deleted');
      }
    });
  }

  setupListeners() {
    window.addEventListener('online', () => this.syncAll());
    window.addEventListener('offline', () =>
      document.body.classList.add('offline')
    );

    // Coba sync pas halaman pertama kali load
    window.addEventListener('load', () => {
      if (navigator.onLine) this.syncAll();
    });
  }

  async addNote(title, body) {
    const db = await this.dbPromise;
    const note = {
      title,
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
      deleted: false
    };

    const id = await db.add('notes', note);
    this.renderNote({ ...note, id });
    this.trySync();
  }

  async trySync() {
    if (!navigator.onLine) return;

    try {
      await this.syncAll();
    } catch {
      // Register background sync buat retry
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-notes');
    }
  }

  async syncAll() {
    const db = await this.dbPromise;
    const unsynced = await db.getAllFromIndex('notes', 'by_synced', false);

    for (const note of unsynced) {
      try {
        const response = await fetch('/api/notes' + (note.deleted ? `/${note.id}` : ''), {
          method: note.deleted ? 'DELETE' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: note.deleted ? undefined : JSON.stringify(note)
        });

        if (response.ok) {
          const updated = await db.get('notes', note.id);
          updated.synced = true;

          if (note.deleted) {
            await db.delete('notes', note.id);
          } else {
            await db.put('notes', updated);
          }
        } else if (response.status === 409) {
          await this.resolveConflict(note, await response.json());
        }
      } catch (err) {
        console.log('[Sync] Failed for note', note.id, err);
      }
    }
  }

  renderNote(note) {
    // UI rendering logic
    console.log('[UI] Rendering note:', note.title);
  }

  showOfflineBanner() {
    // Tampilkan banner "Kamu offline"
  }

  async resolveConflict(local, server) {
    // LWW strategy — yang paling baru menang
    if (server.updatedAt > local.updatedAt) {
      const db = await this.dbPromise;
      await db.put('notes', { ...server, synced: true });
    } else {
      await fetch(`/api/notes/${local.id}`, {
        method: 'PUT',
        body: JSON.stringify(local)
      });
    }
  }
}
```

## Latihan

1. **Setup IndexedDB dengan idb** — Inisialisasi database `NotesDB` dengan object store `notes`, index `by_created` dan `by_synced`. Tulis fungsi addNote dan getAllNotes. Verifikasi data persist setelah refresh.

2. **Optimistic CRUD** — Bikin form tambah catatan yang langsung update UI tanpa nunggu server. Simpan ke IndexedDB dulu, baru coba POST ke `/api/notes`. Kalo gagal, catat di queue untuk sync nanti.

3. **Background Sync** — Integrasi Background Sync API. Pas user offline, register sync tag `sync-notes`. Di Service Worker, handle event sync dengan fetch semua unsynced data dari IndexedDB dan kirim ke server. Test dengan matikan jaringan, buat catatan, hidupkan jaringan — catatan harus otomatis tersync.

4. **Conflict Resolution UI** — Simulasi conflict: buka dua tab dengan data berbeda, sync dua arah. Implementasi LWW + modal merge. Tampilkan dua versi catatan dan kasih user pilihan: "Pakai versi lokal", "Pakai versi server", atau "Gabung manual".
