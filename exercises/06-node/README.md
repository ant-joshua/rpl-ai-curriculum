# 🖥️ Latihan Node.js — Express Routes, Middleware, File I/O, Async, Database & Error Handling

> Latihan backend pake Node.js + Express. Starter code siap di-copy dan dijalanin.

---

## Level 1: Basic — Express Routes & Server Setup

### 1. Hello Express — Basic Server
Bikin server Express minimal dengan beberapa route.

```ts
// Starter code: src/index.ts
import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

// TODO: Buat route berikut:
// GET / -> "Hello, RPL AI!"
// GET /about -> { name: "RPL AI", version: "1.0.0" }
// GET /time -> { currentTime: new Date().toISOString() }

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
```

### 2. Route Parameters
Buat route dengan parameter dinamis.

```ts
// Starter code
app.get('/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  // TODO: Return { userId, message: "User ditemukan" }
});

app.get('/products/:category/:productId', (req, res) => {
  // TODO: Extract category & productId dari params
  // Return object dengan kedua parameter
});

// Test: GET /users/42 -> { userId: "42", message: "User ditemukan" }
```

### 3. Query Parameters & Filtering
Handle query parameters untuk filtering dan sorting.

```ts
// Starter code
const products = [
  { id: 1, name: 'Laptop', category: 'elektronik', price: 15000000 },
  { id: 2, name: 'Mouse', category: 'elektronik', price: 150000 },
  { id: 3, name: 'Buku', category: 'pendidikan', price: 50000 },
];

app.get('/products', (req: Request, res: Response) => {
  const { category, minPrice, maxPrice, sort } = req.query;

  let filtered = [...products];

  // TODO: Filter berdasarkan category (query param)
  // TODO: Filter minPrice & maxPrice (parse ke number)
  // TODO: Sorting: "asc" atau "desc" berdasarkan price

  res.json({ data: filtered, total: filtered.length });
});

// Test: GET /products?category=elektronik&minPrice=100000&sort=asc
```

### 4. POST Request & JSON Body
Terima data JSON dari request body.

```ts
// Starter code
app.use(express.json());

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

let notes: Note[] = [];
let nextId = 1;

app.post('/notes', (req: Request, res: Response) => {
  const { title, content } = req.body;

  // TODO: Validasi title & content wajib ada
  // TODO: Bikin object Note baru
  // TODO: Push ke array notes
  // TODO: Return status 201 + note yang dibuat
});

// Test: POST /notes dengan body { "title": "Belajar Express", "content": "Catatan..." }
```

### 5. PUT & DELETE — Full CRUD
Lengkapi CRUD untuk notes.

```ts
// Starter code
// GET /notes — ambil semua notes
app.get('/notes', (req: Request, res: Response) => {
  res.json({ data: notes, total: notes.length });
});

// GET /notes/:id — ambil satu note
app.get('/notes/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const note = notes.find(n => n.id === id);

  if (!note) {
    return res.status(404).json({ error: 'Note tidak ditemukan' });
  }
  res.json({ data: note });
});

// PUT /notes/:id — update note
app.put('/notes/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  // TODO: Cari note, update title & content
  // TODO: Kalo gak ketemu -> 404
});

// DELETE /notes/:id — hapus note
app.delete('/notes/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  // TODO: Filter array, hapus note dengan id tersebut
  // TODO: Kalo gak ketemu -> 404
  // TODO: Return { message: "Note berhasil dihapus" }
});
```

---

## Level 2: Intermediate — Middleware, File I/O, Async Patterns

### 6. Custom Middleware — Logger
Buat middleware logger yang catat method, URL, dan durasi request.

```ts
// Starter code
import { Request, Response, NextFunction } from 'express';

function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // TODO: Log method + URL

  res.on('finish', () => {
    const duration = Date.now() - start;
    // TODO: Log status code + durasi (ms)
    // Format: [METHOD] /path -> {statusCode} ({duration}ms)
  });

  next();
}

app.use(logger);
```

### 7. Error Handling Middleware
Buat error handler middleware yang terpusat.

```ts
// Starter code
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Route yang sengaja error
app.get('/error-test', (req: Request, res: Response) => {
  throw new AppError(400, 'Ini error test!');
});

// Async error wrapper
function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Global error handler middleware (4 parameters!)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // TODO: Kalo AppError -> return statusCode + message
  // TODO: Kalo error biasa -> 500 Internal Server Error
  // TODO: Log error ke console
  // TODO: Jangan sampe server crash
});
```

### 8. File I/O — Read & Write JSON File
Baca dan tulis data dari file JSON (simulasi database).

```ts
// Starter code
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(__dirname, '..', 'data', 'notes.json');

async function readNotes(): Promise<Note[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // TODO: Kalo file belum ada, return array kosong
    return [];
  }
}

async function writeNotes(notes: Note[]): Promise<void> {
  // TODO: Write array notes ke file JSON dengan format rapi (indent 2)
}

// Ganti CRUD operations pake file-based persistence
app.get('/notes', async (req: Request, res: Response) => {
  const notes = await readNotes();
  res.json({ data: notes });
});

// TODO: Implement GET /notes/:id, POST, PUT, DELETE pake file I/O
```

### 9. Express Router — Modular Routes
Pisahkan route ke file terpisah pake Express Router.

```ts
// Starter code: src/routes/notes.ts
import { Router, Request, Response } from 'express';

const router = Router();

// Pindahin semua route notes ke sini
router.get('/', async (req: Request, res: Response) => {
  // ...
});

// POST, PUT, DELETE juga pindah ke sini

export default router;

// --- src/index.ts ---
import notesRouter from './routes/notes';
app.use('/api/notes', notesRouter);
```

### 10. Environment Variables & Configuration
Setup konfigurasi pake environment variables.

```ts
// Starter code: src/config.ts
import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  corsOrigin: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

export default config;

// --- .env ---
// PORT=3000
// NODE_ENV=development
// DATABASE_URL=postgresql://localhost:5432/rpl_ai
// CORS_ORIGIN=http://localhost:5173
```

### 11. CORS & Security Headers
Setup CORS dan security headers.

```ts
// Starter code
import cors from 'cors';
import helmet from 'helmet';

// CORS — izinin origin tertentu
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Helmet — security headers
app.use(helmet());

// TODO: Rate limiting pake express-rate-limit
// TODO: 100 request per 15 menit per IP
```

### 12. File Upload — Multer
Handle file upload pake Multer.

```ts
// Starter code
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // TODO: Generate unique filename: Date.now() + original extension
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // TODO: Hanya izinin image (jpeg, png, gif, webp)
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File tidak valid' });
  }
  res.json({
    message: 'Upload berhasil',
    filename: req.file.filename,
    size: req.file.size,
  });
});
```

---

## Level 3: Advanced — Database, Auth, WebSocket & Production

### 13. PostgreSQL Connection — pg library
Koneksi ke PostgreSQL dan query sederhana.

```ts
// Starter code: src/db.ts
import { Pool } from 'pg';
import config from './config';

const pool = new Pool({
  connectionString: config.databaseUrl,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`Query executed in ${duration}ms`);
  return result;
}

// --- src/routes/notes.ts ---
router.get('/', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM notes ORDER BY created_at DESC');
  res.json({ data: result.rows });
});

// TODO: Implement POST (INSERT), PUT (UPDATE), DELETE
// TODO: Error handling untuk database errors
```

### 14. Prisma ORM — Database Migration & CRUD
Setup Prisma untuk type-safe database operations.

```ts
// Starter code: schema.prisma
// generator client {
//   provider = "prisma-client-js"
// }
// 
// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }
// 
// model Note {
//   id        Int      @id @default(autoincrement())
//   title     String
//   content   String?
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// TODO: Implement CRUD notes pake Prisma
// create, findMany, findUnique, update, delete

router.post('/', async (req: Request, res: Response) => {
  const { title, content } = req.body;

  const note = await prisma.note.create({
    data: { title, content },
  });

  res.status(201).json({ data: note });
});
```

### 15. JWT Authentication
Implementasi login/register dengan JWT.

```ts
// Starter code
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-default-ganti-di-prod';

interface UserPayload {
  userId: number;
  email: string;
  role: string;
}

function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string): UserPayload {
  return jwt.verify(token, JWT_SECRET) as UserPayload;
}

// Auth middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}

// TODO: POST /register — hash password, simpan user, return token
// TODO: POST /login — cek email & password, return token
// TODO: GET /me — route terproteksi, return user info
```

### 16. Zod Validation — Request Validation
Validasi request body pake Zod schema.

```ts
// Starter code
import { z } from 'zod';

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi').max(200),
  content: z.string().min(1, 'Content wajib diisi').optional(),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
});

function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validasi gagal',
        details: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };
}

router.post('/', validate(createNoteSchema), async (req, res) => {
  // req.body sudah tervalidasi + typed
  const { title, content } = req.body;
  // ...
});
```

### 17. WebSocket — Real-Time Chat
Implementasi WebSocket server dengan `ws` atau `socket.io`.

```ts
// Starter code
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

wss.on('connection', (ws: WebSocket) => {
  console.log('Client terhubung');

  // Broadcast ke semua client lain
  ws.on('message', (data: Buffer) => {
    const message: ChatMessage = JSON.parse(data.toString());

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          ...message,
          timestamp: new Date().toISOString(),
        }));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client terputus');
  });
});
```

### 18. Testing with Supertest
Test Express routes pake Vitest + Supertest.

```ts
// Starter code: src/__tests__/notes.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Notes API', () => {
  it('GET /api/notes - return empty array', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('POST /api/notes - create new note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Test Note', content: 'Test content' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test Note');
    expect(res.body.data).toHaveProperty('id');
  });

  // TODO: Test GET /api/notes/:id
  // TODO: Test PUT /api/notes/:id
  // TODO: Test DELETE /api/notes/:id
  // TODO: Test 404 untuk note yang gak ada
  // TODO: Test validasi error (title kosong)
});

describe('Error Handling', () => {
  it('GET /api/notes/999 - return 404', async () => {
    const res = await request(app).get('/api/notes/999');
    expect(res.status).toBe(404);
  });
});
```

### 19. Rate Limiting & Pagination
Implementasi rate limiting dan pagination di API.

```ts
// Starter code
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // max 100 request per window
  message: { error: 'Terlalu banyak request, coba lagi nanti' },
});

app.use('/api', limiter);

// Pagination middleware
function paginate(req: Request, res: Response, next: NextFunction) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  (req as any).pagination = { page, limit, skip };
  next();
}

router.get('/', paginate, async (req: Request, res: Response) => {
  const { page, limit, skip } = (req as any).pagination;

  const [data, total] = await Promise.all([
    prisma.note.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.note.count(),
  ]);

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
```

### 20. Graceful Shutdown & Logging
Setup graceful shutdown dan structured logging.

```ts
// Starter code
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully...`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 30s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

### 21. Dependency Injection Pattern
Implementasi dependency injection untuk testability.

```ts
// Starter code
interface NoteRepository {
  findAll(): Promise<Note[]>;
  findById(id: number): Promise<Note | null>;
  create(data: CreateNoteDto): Promise<Note>;
  update(id: number, data: UpdateNoteDto): Promise<Note>;
  delete(id: number): Promise<boolean>;
}

class PrismaNoteRepository implements NoteRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.note.findMany();
  }
  // ... implementasi lainnya
}

class NoteService {
  constructor(private repository: NoteRepository) {}

  async getAllNotes() {
    return this.repository.findAll();
  }
  // ...
}
```

### 22. Docker Compose — App + Database
Dockerize aplikasi Express + PostgreSQL.

```dockerfile
# Starter code: Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
# Starter code: docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:***@db:5432/rpl_ai
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: rpl_ai
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### 23. WebSocket Chat — Real-time Messaging
Buat chat room sederhana pake `ws` library.

```ts
// Starter code
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// TODO: Simpan daftar client
// TODO: Broadcast pesan ke semua client
// TODO: Handle client disconnect
```

**Bonus:** Tambah fitur username, typing indicator, room separation.

### 24. File Upload — Multer + Validation
Upload file gambar pake Multer. Validasi tipe file, ukuran max.

```ts
import multer from 'multer';
import path from 'path';
import express from 'express';

const app = express();

// TODO: Konfigurasi storage destination + filename
// TODO: Filter hanya image (jpeg, png, webp, gif)
// TODO: Limit ukuran file 5MB
// TODO: Route POST /api/upload — handle single file
// TODO: Route GET /api/uploads/:filename — serve static
```

### 25. JWT Authentication — Login + Protected Routes
Implementasi JWT auth dari scratch. Refresh token, role-based access.

```ts
// Starter: auth middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

// TODO: Middleware verifyToken — parse token dari Authorization header
// TODO: Middleware requireRole('admin') — cek role user
// TODO: Route POST /api/login — generate access + refresh token
// TODO: Route POST /api/refresh — regenerate access token
// TODO: Blacklist token pas logout (redis atau in-memory set)
```

### 26. Rate Limiting — Prevent Abuse
Implementasi rate limiter pake `express-rate-limit`.

```ts
import rateLimit from 'express-rate-limit';

// TODO: Rate limit 100 request per 15 menit per IP
// TODO: Rate limit khusus untuk /api/auth — 5 request per menit
// TODO: Custom error message ketika kena limit
// TODO: Skip rate limit untuk IP tertentu (whitelist)
// TODO: Simpan hit count di Redis untuk production
```

### 27. Integration Testing — Supertest + Vitest
Tulis integration test untuk Express API pake supertest.

```ts
import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/app';

// TODO: Test GET /api/notes return array
// TODO: Test POST /api/notes return 201 + note object
// TODO: Test POST /api/notes tanpa body return 400
// TODO: Test GET /api/notes/:id return single note
// TODO: Test DELETE /api/notes/:id return 204
// TODO: Test protected route tanpa token return 401
```

### 28. Background Job — Queue + Worker
Proses task berat di background pake BullMQ + Redis.

```ts
import { Queue, Worker } from 'bullmq';

// TODO: Buat queue untuk email sending
// TODO: Buat worker yang proses job dari queue
// TODO: Job retry kalau gagal (max 3 kali)
// TODO: Job scheduling — kirim report setiap jam
// TODO: Monitor queue status via API endpoint
```

---



```bash
# Setup
cd exercises/06-node
npm init -y
npm install express typescript tsx @types/express
npx tsc --init

# Run
npx tsx src/index.ts

# Test pake curl
curl http://localhost:3000
curl -X POST http://localhost:3000/notes -H "Content-Type: application/json" -d '{"title":"Test"}'
```

## 🚀 Advanced Patterns

### 29. Error Handling Middleware — Centralized
```ts
import { Request, Response, NextFunction } from "express";

class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// TODO: Buat error handler middleware (err, req, res, next)
// TODO: Handle AppError vs unknown error beda response
// TODO: Development: return stack trace, Production: jangan
// TODO: Log error ke file/console
// TODO: Handle async errors tanpa try-catch manual (wrapper)
```

### 30. Database Migration — Drizzle ORM
```ts
// TODO: Definisikan schema pake Drizzle
// TODO: Generate migration file
// TODO: Run migration up/down
// TODO: Seed data awal
// TODO: Migration test di CI/CD
```


### 31. Webhook Handler — Stripe Integration
```ts
import express from "express";

const app = express();
// TODO: Parse raw body untuk webhook signature verification
// TODO: Verify Stripe signature pake Stripe library
// TODO: Handle event: checkout.session.completed
// TODO: Handle event: customer.subscription.updated
// TODO: Update database sesuai event type
// TODO: Return 200 ASAP, process async
```

### 32. GraphQL API — Apollo Server
```ts
import { ApolloServer, gql } from "apollo-server-express";

// TODO: Define schema (typeDefs) untuk Note + User
// TODO: Implement resolvers: Query, Mutation
// TODO: Add context untuk auth
// TODO: DataLoader untuk N+1 problem
// TODO: Subscription untuk real-time
```

### 33. Server-Sent Events (SSE) — Push Notification
```ts
// TODO: Endpoint GET /api/events — keep-alive connection
// TODO: Kirim event every 5 detik (heartbeat)
// TODO: Broadcast event ke semua connected client
// TODO: Handle client disconnect
// TODO: Filter event by user ID
```
