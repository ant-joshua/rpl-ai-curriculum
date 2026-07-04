<img src="https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Backend" style="width:100%;border-radius:12px;margin:12px 0;">

# 05. Node.js & Express + Database

> **Level:** 📐 Intermediate  
> **Jam:** 9 (4 minggu x 2 sesi + 1 sesi database)  
> **Prasyarat:** JavaScript Fundamentals, TypeScript Basics  
> **Output:** REST API production-ready + PostgreSQL

## Tujuan

- Paham runtime Node.js
- Bikin REST API pake Express + TypeScript
- Middleware, routing, error handling
- Koneksi database PostgreSQL
- CRUD operations

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
