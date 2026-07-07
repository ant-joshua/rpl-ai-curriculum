---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🚀 Portfolio Project Series"
footer: "Sesi 02: Crud Api"
---

<!-- _class: title -->
# Sesi 02: Bookshelf CRUD API

> **Project 2 dari 5** — REST API untuk Bookshelf (manajemen buku) dengan Express, TypeScript, Prisma, dan PostgreSQL

---

## 🎯 Tujuan

- Membangun REST API dari nol dengan Express + TypeScript
- Menggunakan Prisma ORM untuk database PostgreSQL
- Implementasi validasi request dengan Zod
- Menangani error secara terpusat (error handler middleware)
- Mendeploy ke Railway

---

## 📋 Deliverable

- API Base URL: `https://bookshelf-api-production.up.railway.app`
- README dengan dokumentasi API lengkap
- GitHub repo: `github.com/namakamu/bookshelf-api`

---

## 🧰 Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Node.js + Express | HTTP server & routing |
| TypeScript | Type safety |
| Prisma ORM | Database management |
| PostgreSQL | Database relational |
| Zod | Request validation |
| Railway | Hosting & deploy |

---

## 📋 Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/books` | Ambil semua buku (dengan pagination & filter) |
| GET | `/api/books/:id` | Ambil detail buku |
| POST | `/api/books` | Tambah buku baru |
| PUT | `/api/books/:id` | Update data buku |
| DELETE | `/api/books/:id` | Hapus buku |

---

## 🗄️ Schema Database

```
Book
├── id: String (UUID)
├── title: String
├── author: String
├── isbn: String (unique)
├── publishedYear: Int
├── genre: String
├── description: String?
├── coverImage: String?
├── createdAt: DateTime
└── updatedAt: DateTime
```

---

## 📝 Langkah 1: Setup Proyek

```bash
mkdir bookshelf-api && cd bookshelf-api


---

# Init project
npm init -y


---

# Install dependencies
npm install express prisma @prisma/client zod dotenv cors


---

# Install dev dependencies
npm install -D typescript ts-node-dev @types/express @types/cors @types/node tsx


---

# Init TypeScript
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 📝 Langkah 2: Setup Prisma

```bash
npx prisma init
```

Ini akan buat `prisma/schema.prisma` dan file `.env`.

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bookshelf"
PORT=3000
```

> Ganti `user`, `password`, dan `localhost` dengan koneksi PostgreSQL kamu.
> Untuk development, bisa pakai [Supabase](https://supabase.com) free tier.

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Book {
  id            String   @id @default(uuid())
  title         String
  author        String
  isbn          String   @unique
  publishedYear Int
  genre         String
  description   String?
  coverImage    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

Jalankan migration:

```bash
npx prisma migrate dev --name init
```

---

## 📝 Langkah 3: Struktur Folder

```
src/
├── index.ts              # Entry point
├── app.ts                # Express app setup
├── config/
│   └── env.ts            # Environment variables
├── lib/
│   └── prisma.ts         # Prisma client instance
├── routes/
│   └── book.routes.ts    # Book routes
├── controllers/
│   └── book.controller.ts # Book handlers
├── services/
│   └── book.service.ts   # Business logic
├── schemas/
│   └── book.schema.ts    # Zod validation schemas
├── middlewares/
│   ├── error.middleware.ts  # Global error handler
│   └── validate.middleware.ts # Validation middleware
└── types/
    └── index.ts          # Shared types
```

Buat semua folder:

```bash
mkdir -p src/{config,lib,routes,controllers,services,schemas,middlewares,types}
```

---

## 📝 Langkah 4: Setup Express App

`src/config/env.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};
```

`src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

`src/app.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import bookRoutes from './routes/book.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/books', bookRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler (harus setelah routes)
app.use(errorMiddleware);

export default app;
```

`src/index.ts`:

```typescript
import app from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`🚀 Server running on http://localhost:${env.port}`);
});
```

---

## 📝 Langkah 5: Zod Validation Schema

`src/schemas/book.schema.ts`:

```typescript
import { z } from 'zod';

export const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    author: z.string().min(1, 'Author is required').max(100),
    isbn: z
      .string()
      .min(10, 'ISBN minimal 10 karakter')
      .max(13, 'ISBN maksimal 13 karakter'),
    publishedYear: z
      .number()
      .int()
      .min(1900, 'Tahun tidak valid')
      .max(new Date().getFullYear(), 'Tahun tidak boleh di masa depan'),
    genre: z.string().min(1, 'Genre is required'),
    description: z.string().max(2000).optional(),
    coverImage: z.string().url('Cover image harus URL valid').optional(),
  }),
});

export const updateBookSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    author: z.string().min(1).max(100).optional(),
    isbn: z.string().min(10).max(13).optional(),
    publishedYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear())
      .optional(),
    genre: z.string().min(1).optional(),
    description: z.string().max(2000).optional(),
    coverImage: z.string().url().optional(),
  }),
});

export const paramsSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID harus berupa UUID valid'),
  }),
});

export const querySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    genre: z.string().optional(),
    search: z.string().optional(),
  }),
});
```

---

## 📝 Langkah 6: Validation Middleware

`src/middlewares/validate.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
```

---

## 📝 Langkah 7: Service Layer

`src/services/book.service.ts`:

```typescript
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

interface GetBooksParams {
  page: number;
  limit: number;
  genre?: string;
  search?: string;
}

export const bookService = {
  async getAll(params: GetBooksParams) {
    const { page, limit, genre, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};

    if (genre) {
      where.genre = { equals: genre, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search } },
      ];
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      success: true,
      data: books,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundError('Buku tidak ditemukan');
    }
    return { success: true, data: book };
  },

  async create(data: Prisma.BookCreateInput) {
    // Cek duplikat ISBN
    const existing = await prisma.book.findUnique({
      where: { isbn: data.isbn },
    });
    if (existing) {
      throw new ConflictError('ISBN sudah terdaftar');
    }

    const book = await prisma.book.create({ data });
    return { success: true, data: book };
  },

  async update(id: string, data: Prisma.BookUpdateInput) {
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Buku tidak ditemukan');
    }

    const book = await prisma.book.update({
      where: { id },
      data,
    });
    return { success: true, data: book };
  },

  async delete(id: string) {
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Buku tidak ditemukan');
    }

    await prisma.book.delete({ where: { id } });
    return { success: true, message: 'Buku berhasil dihapus' };
  },
};

// Custom error classes
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
```

---

## 📝 Langkah 8: Controller

`src/controllers/book.controller.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services/book.service';

export const bookController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const genre = req.query.genre as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await bookService.getAll({ page, limit, genre, search });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.getById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.update(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
```

---

## 📝 Langkah 9: Routes

`src/routes/book.routes.ts`:

```typescript
import { Router } from 'express';
import { bookController } from '../controllers/book.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createBookSchema,
  updateBookSchema,
  paramsSchema,
  querySchema,
} from '../schemas/book.schema';

const router = Router();

router.get('/', validate(querySchema), bookController.getAll);
router.get('/:id', validate(paramsSchema), bookController.getById);
router.post('/', validate(createBookSchema), bookController.create);
router.put('/:id', validate(paramsSchema), validate(updateBookSchema), bookController.update);
router.delete('/:id', validate(paramsSchema), bookController.delete);

export default router;
```

---

## 📝 Langkah 10: Global Error Handler

`src/middlewares/error.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { NotFoundError, ConflictError } from '../services/book.service';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma known errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Database error',
    });
  }

  // Default 500
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
```

---

## 📝 Langkah 11: Scripts & Test

Update `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "npx prisma migrate dev",
    "db:push": "npx prisma db push",
    "db:studio": "npx prisma studio",
    "seed": "tsx prisma/seed.ts"
  }
}
```

Jalankan development server:

```bash
npm run dev
```

Test dengan curl:

```bash

---

# Create book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Atomic Habits",
    "author": "James Clear",
    "isbn": "9780735211292",
    "publishedYear": 2018,
    "genre": "Self-Improvement",
    "description": "An Easy & Proven Way to Build Good Habits & Break Bad Ones"
  }'


---

# Get all books
curl http://localhost:3000/api/books


---

# Get by ID (ganti dengan ID dari response create)
curl http://localhost:3000/api/books/<UUID>


---

# Update
curl -X PUT http://localhost:3000/api/books/<UUID> \
  -H "Content-Type: application/json" \
  -d '{"title": "Atomic Habits - Updated"}'


---

# Delete
curl -X DELETE http://localhost:3000/api/books/<UUID>
```

> ![Screenshot](https://via.placeholder.com/800x400?text=Bookshelf+API+Test+curl)

---

## 📝 Langkah 12: Seed Data (Opsional)

`prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const books = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    publishedYear: 2018,
    genre: 'Self-Improvement',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    publishedYear: 2008,
    genre: 'Technology',
    description: 'A Handbook of Agile Software Craftsmanship',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '9780062316097',
    publishedYear: 2015,
    genre: 'History',
    description: 'A Brief History of Humankind',
  },
];

async function main() {
  console.log('Seeding...');
  for (const book of books) {
    await prisma.book.create({ data: book });
  }
  console.log('Seeding done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Jalankan:

```bash
npx tsx prisma/seed.ts
```

---

## 📝 Langkah 13: Deploy ke Railway

1. Push ke GitHub:
```bash
git init
git add .
git commit -m "feat: bookshelf crud api"
git remote add origin https://github.com/namakamu/bookshelf-api.git
git push -u origin main
```

2. Buka [railway.app](https://railway.app) → New Project → Deploy from GitHub repo

3. Tambahkan PostgreSQL:
   - Railway: New → Database → PostgreSQL
   - Railway auto-inject `DATABASE_URL` ke env

4. Tambahkan perintah:
   - Railway dashboard → Settings
   - Start Command: `npm run db:migrate && npm start`

5. Railway akan build + deploy otomatis

> ![Screenshot](https://via.placeholder.com/800x400?text=Railway+Deploy+Success)

---

## 📝 Dokumentasi API (README)

Buat `README.md` di root project:

```markdown

---

# Bookshelf API

REST API untuk manajemen buku. Dibangun dengan Express + TypeScript + Prisma.

## Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM + PostgreSQL
- Zod Validation

## API Documentation

**Base URL:** `https://bookshelf-api-production.up.railway.app`

### Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/books` | List buku (pagination + filter) |
| GET | `/api/books/:id` | Detail buku |
| POST | `/api/books` | Tambah buku |
| PUT | `/api/books/:id` | Update buku |
| DELETE | `/api/books/:id` | Hapus buku |

### Query Parameters (GET /api/books)

| Param | Type | Default | Deskripsi |
|-------|------|---------|-----------|
| page | number | 1 | Halaman |
| limit | number | 10 | Item per halaman |
| genre | string | - | Filter genre |
| search | string | - | Cari judul/penulis |

### Contoh Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Atomic Habits",
      "author": "James Clear",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
```

---

## 🧪 Latihan

1. **Filter genres** — buat endpoint `GET /api/genres` yang return daftar genre unik
2. **Sorting** — tambahkan query param `sortBy` dan `sortOrder`
3. **Review model** — tambahkan model `Review` relasi ke `Book`, buat CRUD review
4. **Rate limiting** — implementasikan express-rate-limit untuk mencegah spam
5. **Swagger docs** — setup swagger-jsdoc + swagger-ui-express untuk dokumentasi API interaktif
6. **Unit test** — tulis test dengan Jest + Supertest untuk setiap endpoint

---

## ✅ Checklist

- [ ] Project TypeScript setup dengan Express
- [ ] Prisma schema + migration berhasil
- [ ] Semua 5 endpoint berfungsi
- [ ] Validation dengan Zod berjalan
- [ ] Error handler menangani NotFound, Conflict, Validation
- [ ] Pagination & filter bekerja
- [ ] Deploy ke Railway
- [ ] README dengan dokumentasi API lengkap

---

> **Project 2 selesai!** Lanjut ke [Sesi 03: Todo App with Auth](./03-fullstack-app.md)
