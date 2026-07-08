<img src="https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Backend" style="width:100%;border-radius:12px;margin:12px 0;">

# 06. Node.js & Express + Database

> **Level:** 📐 Intermediate  
> **Jam:** 9 (4 minggu x 2 sesi + 1 sesi database)  
> **Prasyarat:** JavaScript Fundamentals, TypeScript Basics  
> **Output:** REST API production-ready + PostgreSQL

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Setup project Node.js dari nol — npm init, TypeScript config, folder structure, nodemon
- Bikin REST API dengan Express.js — routing (GET/POST/PUT/DELETE), request params/body, response status codes
- Paham konsep middleware Express — global middleware, route-specific middleware, error handler (4 params)
- Koneksi dan query PostgreSQL dari Node.js — pool, parameterized query, repository pattern
- Implementasi CRUD lengkap dengan validasi input, error handling terstruktur, dan testing API

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Node.js Setup — runtime, npm init, tsconfig, nodemon, project structure | [01-node-setup.md](01-node-setup.md) |
| 2 | Express API — routing, request/response, middleware, error handling | [02-express-api.md](02-express-api.md) |
| 3 | Database SQL — PostgreSQL, pg Pool, parameterized query, env vars, repository | [03-database.md](03-database.md) |
| 4 | REST CRUD — full CRUD endpoints, validasi, error handling, testing curl/Postman | [04-rest-crud.md](04-rest-crud.md) |

## Output Akhir Modul

> **Aplikasi TODO REST API** — Express/TypeScript API dengan CRUD lengkap, database PostgreSQL, validasi input, error handling middleware, pagination/filter/search, dan dokumentasi testing dengan curl/Postman. Siap di-deploy ke production.

## Contoh Express API

```typescript
import express from 'express';
const app = express();
app.use(express.json());

interface Note { id: number; title: string; content: string; }
const notes: Note[] = [];

app.get('/api/notes', (req, res) => res.json(notes));

app.post('/api/notes', (req, res) => {
  const { title, content } = req.body;
  const note: Note = { id: notes.length + 1, title, content };
  notes.push(note);
  res.status(201).json(note);
});

app.listen(3000, () => console.log('API di :3000'));
```

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Explain what this Express middleware does: `app.use((req, res, next) => { ... })`"
- "Generate a PostgreSQL schema for a todo app with categories and tags"
- "Write a parameterized SQL query to insert a user with validation"
- "Review this Express route — what error cases am I missing?"
- "Convert this Express route from JavaScript to TypeScript"
- "Generate curl commands to test this REST endpoint"
- "Explain the difference between global middleware and route-specific middleware in Express"
- "Create a custom error class hierarchy for API errors (validation, auth, not-found)"
