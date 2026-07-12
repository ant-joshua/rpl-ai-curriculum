# Node.js — Exercise #4: Express Routes

> **Level:** Beginner
> **Topics:** Express.js, GET, POST, route params, query params, JSON body

## Instructions

Buat REST API sederhana dengan Express untuk mengelola notes (catatan).

Routes:
1. `GET /notes` — ambil semua notes.
2. `GET /notes/:id` — ambil satu note by id (404 jika tidak ditemukan).
3. `POST /notes` — tambah note baru (validasi title & content wajib).
4. `PUT /notes/:id` — update note (404 jika tidak ditemukan).
5. `DELETE /notes/:id` — hapus note (404 jika tidak ditemukan).

## Starter Code

```javascript
const express = require('express');
const app = express();

app.use(express.json());

let notes = [];
let nextId = 1;

// GET /notes
app.get('/notes', (req, res) => {
  // TODO: return semua notes
});

// GET /notes/:id
app.get('/notes/:id', (req, res) => {
  // TODO: cari note by id, 404 jika tidak ada
});

// POST /notes
app.post('/notes', (req, res) => {
  // TODO: validasi title & content, buat note baru, return 201
});

// PUT /notes/:id
app.put('/notes/:id', (req, res) => {
  // TODO: update note, 404 jika tidak ada
});

// DELETE /notes/:id
app.delete('/notes/:id', (req, res) => {
  // TODO: hapus note, 404 jika tidak ada
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
```

## Expected Output

```
POST /notes {"title":"Belajar Express","content":"Ini catatan..."}
→ 201 {"data":{"id":1,"title":"Belajar Express","content":"Ini catatan...","createdAt":"..."}}

GET /notes
→ 200 {"data":[{"id":1,...}],"total":1}

GET /notes/1
→ 200 {"data":{"id":1,...}}

PUT /notes/1 {"title":"Updated"}
→ 200 {"data":{"id":1,"title":"Updated",...}}

DELETE /notes/1
→ 200 {"message":"Note berhasil dihapus"}

GET /notes/999
→ 404 {"error":"Note tidak ditemukan"}
```

## Test Cases

```javascript
// Test dengan fetch
// POST
// fetch('http://localhost:3000/notes', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title:'Test', content:'Test'}) }).then(r => r.json()).then(console.log);
```
