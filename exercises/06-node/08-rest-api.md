# Node.js — Exercise #8: REST API (Full CRUD with Express Router)

> **Level:** Intermediate
> **Topics:** Express Router, CRUD, modular routes, validation, file persistence

## Instructions

Buat REST API lengkap untuk Notes dengan arsitektur modular:

1. `routes/notes.js` — Express Router untuk semua route notes.
2. `models/note.js` — data access layer (CRUD operations on file).
3. `middleware/logger.js` — logging middleware.
4. `index.js` — entry point yang menggabungkan semuanya.

Gunakan file JSON sebagai database (persistence).

## Starter Code

```javascript
// === models/note.js ===
const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

async function getAll() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function getById(id) {
  const notes = await getAll();
  return notes.find(n => n.id === id) || null;
}

// TODO: create(note) — tambah note baru
// TODO: update(id, data) — update note
// TODO: remove(id) — hapus note

// === routes/notes.js ===
const express = require('express');
const router = express.Router();
const noteModel = require('../models/note');

// TODO: implement routes using noteModel

module.exports = router;

// === index.js ===
const express = require('express');
const notesRouter = require('./routes/notes');
const logger = require('./middleware/logger');

const app = express();
app.use(express.json());
app.use(logger);
app.use('/api/notes', notesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
```

## Expected Output

```
POST /api/notes → 201 Created
GET /api/notes → 200 (array of notes)
GET /api/notes/:id → 200 (single note) / 404
PUT /api/notes/:id → 200 (updated note) / 404
DELETE /api/notes/:id → 200 (success message) / 404
```

## Test Cases

```javascript
// Test CRUD operations via API
// Data tersimpan di file data/notes.json
// Setelah server restart, data tetap ada
```
