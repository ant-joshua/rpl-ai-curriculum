# 🧠 Cheatsheet: Node.js & Express + Database

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Node.js**: JavaScript runtime di server (bukan browser)
- **Express**: Framework HTTP buat bikin REST API
- **Routing**: `app.get()`, `app.post()`, `app.put()`, `app.delete()`
- **Middleware**: `app.use(express.json())`, custom middleware, error handler
- **Request/Response**: `req.params`, `req.query`, `req.body`, `res.json()`, `res.status()`
- **PostgreSQL**: Database SQL — `pg` atau `Prisma` ORM
- **CRUD**: Create (POST), Read (GET), Update (PUT/PATCH), Delete (DELETE)

## Sintaks Penting

```typescript
import express from 'express';
const app = express();
app.use(express.json());

// Routes
app.get('/api/items', async (req, res) => {
  const items = await db.query('SELECT * FROM items');
  res.json(items);
});

app.post('/api/items', async (req, res) => {
  const { name } = req.body;
  const item = await db.query('INSERT INTO items (name) VALUES ($1) RETURNING *', [name]);
  res.status(201).json(item);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, () => console.log('API di :3000'));
```

```bash
npm init -y
npm install express dotenv
npm install -D typescript @types/express @types/node
npx tsc --init
```

## Tips & Trik
- Route params: `app.get('/users/:id', ...)` → `req.params.id`
- Query string: `app.get('/search', ...)` → `req.query.q`
- Gunakan `express.Router()` buat modular routes
- Prisma ORM: `npx prisma generate` after schema change

## Common Mistakes
- ❌ Lupa `express.json()` middleware → `req.body` undefined
- ❌ Error handler ga pake 4 params → Express skip it
- ❌ SQL injection — selalu pake parameterized query `$1`
- ❌ Blocking event loop pake synchronous heavy operation

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
