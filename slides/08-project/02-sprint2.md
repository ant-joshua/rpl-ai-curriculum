---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/3184291/pexels-ph"
footer: "Sesi 02: Sprint2"
---

<!-- _class: title -->
# Sprint 2 — Core Features (CRUD + Auth)

> **Sesi:** 21–22 | **Durasi:** 4 jam

## Tujuan

- Bikin CRUD API endpoints untuk entity utama
- Bikin halaman frontend (list, form, detail)
- Integrasi API client di frontend
- Implementasi autentikasi (register/login/logout)
- Middleware JWT untuk proteksi route

## CRUD API Endpoints

```typescript
// backend/src/routes/trips.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/trips — list semua trips user
router.get('/', async (req: Request, res: Response) => {
  const trips = await prisma.trip.findMany({
    where: { userId: req.user.id },
  });
  res.json(trips);
});

// POST /api/trips — buat trip baru
router.post('/', async (req: Request, res: Response) => {
  const { title, destination, startDate, endDate } = req.body;
  const trip = await prisma.trip.create({
    data: {
      title,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userId: req.user.id,
    },
  });
  res.status(201).json(trip);
});

// GET /api/trips/:id — detail trip
router.get('/:id', async (req: Request, res: Response) => {
  const trip = await prisma.trip.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(trip);
});

// PUT /api/trips/:id — update trip
router.put('/:id', async (req: Request, res: Response) => {
  const { title, destination, startDate, endDate } = req.body;
  const trip = await prisma.trip.update({
    where: { id: req.params.id },
    data: { title, destination, startDate, endDate },
  });
  res.json(trip);
});

// DELETE /api/trips/:id — hapus trip
router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.trip.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});

export default router;
```

## Auth Middleware

```typescript
// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Auth Controller

```typescript
// backend/src/controllers/auth.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.status(201).json({ token, user: { id: user.id, email: user.email } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, email: user.email } });
};
```

## Frontend — Halaman List

```tsx
// frontend/src/pages/TripList.tsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
}

export default function TripList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trips')
      .then((res) => setTrips(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Trips</h1>
      {trips.map((trip) => (
        <div key={trip.id} className="card">
          <h2>{trip.title}</h2>
          <p>{trip.destination}</p>
          <p>{trip.startDate}</p>
        </div>
      ))}
    </div>
  );
}
```

## Frontend — Form

```tsx
// frontend/src/pages/TripForm.tsx
import { useState } from 'react';
import { api } from '../api/client';

export default function TripForm() {
  const [form, setForm] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/trips', form);
      alert('Trip created!');
    } catch (err) {
      setError('Failed to create trip');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        placeholder="Destination"
        value={form.destination}
        onChange={(e) => setForm({ ...form, destination: e.target.value })}
      />
      <input
        type="date"
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
      />
      <input
        type="date"
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
      />
      <button type="submit">Create Trip</button>
    </form>
  );
}
```

## API Client

```typescript
// frontend/src/api/client.ts
import axios from 'axios';

const token = localStorage.getItem('token');

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
  },
});
```

## Latihan

1. **Bikin Endpoint CRUD** — Buat routes + controllers untuk entity kamu (trips/notes/quiz) minimal GET, POST, PUT, DELETE
2. **Bikin Halaman Form** — Buat komponen React form dengan validasi client-side
3. **Integrasi API** — Hubungkan frontend ke backend pakai axios, tampilkan data dari API
4. **Auth Flow** — Implement register → login → token disimpan di localStorage → dipake di setiap request
5. **Proteksi Route** — Tambah middleware auth ke endpoint, pastikan user yang belum login dapat 401
