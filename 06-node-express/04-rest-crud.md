# 6.4 REST CRUD — Full Implementation

## Arsitektur CRUD Lengkap

Di sesi sebelumnya kita udah belajar routing, database, dan repository secara terpisah. Sekarang kita gabung semuanya jadi endpoint CRUD yang **production-ready** dengan:

- Validasi input
- Error handling
- Repository pattern
- Testing dengan curl & Postman

```
Client → Router → Controller → Repository → Database
   │          │          │            │
   │     (validasi)  (business    (SQL query)
   │                  logic)
   ↓
 Response
```

---

## Struktur File

```
src/
├── index.ts                    # Entry point + middleware global
├── config.ts                   # Environment config
├── database/
│   ├── pool.ts                 # Koneksi PostgreSQL
│   └── todo.repository.ts      # SQL queries
├── routes/
│   └── todo.routes.ts          # Route definitions
├── controllers/
│   └── todo.controller.ts      # Business logic
├── middleware/
│   ├── error.middleware.ts     # Error handler
│   └── validate.middleware.ts  # Input validation
├── models/
│   └── todo.model.ts           # Type definitions
└── validators/
    └── todo.validator.ts       # Validation rules
```

---

## 1. Database Setup

`src/database/pool.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

export default pool;
```

`src/database/todo.repository.ts`:

```typescript
import pool from './pool';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

export const todoRepository = {
  async findAll(): Promise<Todo[]> {
    const result = await pool.query<Todo>(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findById(id: number): Promise<Todo | null> {
    const result = await pool.query<Todo>(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async create(input: CreateTodoInput): Promise<Todo> {
    const result = await pool.query<Todo>(
      `INSERT INTO todos (title, description)
       VALUES ($1, $2)
       RETURNING *`,
      [input.title, input.description || null]
    );
    return result.rows[0];
  },

  async update(id: number, input: UpdateTodoInput): Promise<Todo | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (input.title !== undefined) {
      setClauses.push(`title = $${paramIdx++}`);
      values.push(input.title);
    }
    if (input.description !== undefined) {
      setClauses.push(`description = $${paramIdx++}`);
      values.push(input.description);
    }
    if (input.is_completed !== undefined) {
      setClauses.push(`is_completed = $${paramIdx++}`);
      values.push(input.is_completed);
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query<Todo>(
      `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async remove(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
```

---

## 2. Types & Validators

`src/models/todo.model.ts`:

```typescript
export interface Todo {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTodoBody {
  title: string;
  description?: string;
}

export interface UpdateTodoBody {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```

`src/validators/todo.validator.ts`:

```typescript
import { CreateTodoBody, UpdateTodoBody } from '../models/todo.model';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateCreateTodo = (body: any): ValidationResult => {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Body request harus berupa JSON'] };
  }

  if (!body.title || typeof body.title !== 'string') {
    errors.push('Title wajib diisi dan harus berupa string');
  } else if (body.title.trim().length === 0) {
    errors.push('Title tidak boleh kosong');
  } else if (body.title.length > 200) {
    errors.push('Title maksimal 200 karakter');
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.push('Description harus berupa string');
    }
  }

  return { valid: errors.length === 0, errors };
};

export const validateUpdateTodo = (body: any): ValidationResult => {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Body request harus berupa JSON'] };
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('Title harus berupa string tidak kosong');
    } else if (body.title.length > 200) {
      errors.push('Title maksimal 200 karakter');
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.push('Description harus berupa string');
    }
  }

  if (body.is_completed !== undefined) {
    if (typeof body.is_completed !== 'boolean') {
      errors.push('Is completed harus boolean (true/false)');
    }
  }

  if (errors.length === 0 && body.title === undefined && body.description === undefined && body.is_completed === undefined) {
    errors.push('Minimal satu field (title/description/is_completed) harus diisi');
  }

  return { valid: errors.length === 0, errors };
};
```

---

## 3. Controller

`src/controllers/todo.controller.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { todoRepository } from '../database/todo.repository';
import { validateCreateTodo, validateUpdateTodo } from '../validators/todo.validator';

export const todoController = {
  // GET /api/todos
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const todos = await todoRepository.findAll();
      res.json({
        success: true,
        message: 'Data todos berhasil diambil',
        data: todos,
      });
    } catch (err) {
      next(err); // lempar ke error handler middleware
    }
  },

  // GET /api/todos/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID harus berupa angka',
        });
      }

      const todo = await todoRepository.findById(id);
      if (!todo) {
        return res.status(404).json({
          success: false,
          message: 'Todo tidak ditemukan',
        });
      }

      res.json({
        success: true,
        message: 'Data todo ditemukan',
        data: todo,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/todos
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = validateCreateTodo(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: validation.errors,
        });
      }

      const todo = await todoRepository.create({
        title: req.body.title.trim(),
        description: req.body.description?.trim(),
      });

      res.status(201).json({
        success: true,
        message: 'Todo berhasil dibuat',
        data: todo,
      });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/todos/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID harus berupa angka',
        });
      }

      const validation = validateUpdateTodo(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: validation.errors,
        });
      }

      const todo = await todoRepository.update(id, req.body);
      if (!todo) {
        return res.status(404).json({
          success: false,
          message: 'Todo tidak ditemukan',
        });
      }

      res.json({
        success: true,
        message: 'Todo berhasil diupdate',
        data: todo,
      });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/todos/:id
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID harus berupa angka',
        });
      }

      const deleted = await todoRepository.remove(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Todo tidak ditemukan',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Todo berhasil dihapus',
      });
    } catch (err) {
      next(err);
    }
  },
};
```

---

## 4. Routes

`src/routes/todo.routes.ts`:

```typescript
import { Router } from 'express';
import { todoController } from '../controllers/todo.controller';

const router = Router();

router.get('/', todoController.getAll);
router.get('/:id', todoController.getById);
router.post('/', todoController.create);
router.put('/:id', todoController.update);
router.delete('/:id', todoController.remove);

export default router;
```

---

## 5. Middleware

`src/middleware/error.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Handle PostgreSQL constraint errors
  const pgError = err as any;
  if (pgError.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Data duplikat — resource sudah ada',
    });
  }

  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV === 'development' && { detail: err.message }),
  });
};
```

`src/middleware/validate.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

// Middleware factory — validasi ID parameter
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID harus berupa angka',
    });
  }
  next();
};
```

---

## 6. Entry Point

`src/index.ts`:

```typescript
import express from 'express';
import dotenv from 'dotenv';
import todoRoutes from './routes/todo.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Global middleware
app.use(express.json());

// Logger sederhana
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Routes
app.use('/api/todos', todoRoutes);

// Error handler — PALING AKHIR
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
```

---

## Testing dengan curl

```bash
# CREATE — POST /api/todos
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Belajar Express","description":"Bikin REST API CRUD"}'

# Response: 201
# {
#   "success": true,
#   "message": "Todo berhasil dibuat",
#   "data": { "id": 1, "title": "Belajar Express", ... }
# }

# READ ALL — GET /api/todos
curl http://localhost:3000/api/todos

# READ ONE — GET /api/todos/:id
curl http://localhost:3000/api/todos/1

# UPDATE — PUT /api/todos/:id
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Belajar Express + PostgreSQL","is_completed":true}'

# DELETE — DELETE /api/todos/:id
curl -X DELETE http://localhost:3000/api/todos/1

# Test validasi — POST tanpa title
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"description":"gak pake title"}'
# Response: 400 — { "success": false, "message": "Validasi gagal", "errors": [...] }

# Test 404 — GET id yang gak ada
curl http://localhost:3000/api/todos/999
# Response: 404 — { "success": false, "message": "Todo tidak ditemukan" }
```

---

## Testing dengan Postman

### Setup Collection

1. Buka Postman → New Collection → `Todo API`
2. Tambah variable: `base_url = http://localhost:3000`

### Request List

| Method | URL | Body (JSON) | Expected |
|--------|-----|-------------|----------|
| POST | `{{base_url}}/api/todos` | `{ "title": "Belajar Express" }` | 201 |
| POST | `{{base_url}}/api/todos` | `{ "description": "no title" }` | 400 |
| GET | `{{base_url}}/api/todos` | — | 200, array |
| GET | `{{base_url}}/api/todos/1` | — | 200, object |
| GET | `{{base_url}}/api/todos/999` | — | 404 |
| PUT | `{{base_url}}/api/todos/1` | `{ "is_completed": true }` | 200 |
| PUT | `{{base_url}}/api/todos/1` | `{}` | 400 (empty body) |
| DELETE | `{{base_url}}/api/todos/1` | — | 200 |
| DELETE | `{{base_url}}/api/todos/999` | — | 404 |

### Test Script di Postman

Buat test otomatis di tab "Tests":

```javascript
// Test sukses 200
pm.test("Status code 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response punya success field", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property("success");
});

// Test 201 create
pm.test("Status code 201", () => {
  pm.response.to.have.status(201);
});

pm.test("Data todo punya id", () => {
  const json = pm.response.json();
  pm.expect(json.data).to.have.property("id");
});

// Test 400 validasi
pm.test("Status code 400", () => {
  pm.response.to.have.status(400);
});

pm.test("Error message ada", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property("errors");
});
```

---

## Error Scenarios — Lengkap

| Skenario | Status | Response |
|----------|--------|----------|
| Body bukan JSON | 400 | `{ "errors": ["Body request harus berupa JSON"] }` |
| Title kosong | 400 | `{ "errors": ["Title tidak boleh kosong"] }` |
| Title > 200 chars | 400 | `{ "errors": ["Title maksimal 200 karakter"] }` |
| ID bukan angka | 400 | `{ "message": "ID harus berupa angka" }` |
| Todo gak ditemukan | 404 | `{ "message": "Todo tidak ditemukan" }` |
| Duplikat data (DB) | 409 | `{ "message": "Data duplikat" }` |
| Server error | 500 | `{ "message": "Terjadi kesalahan pada server" }` |

---

## Latihan

**Latihan 1: CRUD Categories**

Bikin CRUD endpoint untuk `categories`:

- `GET /api/categories` — list kategori
- `GET /api/categories/:id` — detail kategori
- `POST /api/categories` — buat kategori (validasi: name wajib, unique)
- `PUT /api/categories/:id` — update kategori
- `DELETE /api/categories/:id` — hapus kategori

Ikuti pola yang sama: repository → controller → route.

**Latihan 2: Validation Middleware**

Buat middleware `validateRequest(schema)` yang reusable:

```typescript
const validateCreateTodo = validateRequest({
  title: { type: 'string', required: true, maxLength: 200 },
  description: { type: 'string', required: false },
});

app.post('/api/todos', validateCreateTodo, todoController.create);
```

Implementasikan validasi sederhana tanpa library tambahan.

**Latihan 3: Filter & Pagination**

Tambah query params ke `GET /api/todos`:

- `?is_completed=true` — filter by status
- `?search=express` — cari berdasarkan title
- `?page=1&limit=10` — pagination

Response tambah field: `total`, `page`, `limit`, `totalPages`.

**Latihan 4: Testing dengan curl**

Buat file `test.sh` yang berisi 10+ curl command untuk test semua skenario:

1. CREATE — 201 (valid)
2. CREATE — 400 (title kosong)
3. GET ALL — 200
4. GET BY ID — 200
5. GET BY ID — 404
6. UPDATE — 200
7. UPDATE — 400 (id bukan angka)
8. UPDATE — 404 (gak ditemukan)
9. DELETE — 200
10. DELETE — 404

Jalankan dan pastikan semua response sesuai.
