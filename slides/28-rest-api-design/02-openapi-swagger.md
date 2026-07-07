---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/1181467/pexels-ph"
footer: "Sesi 02: Openapi Swagger"
---

<!-- _class: title -->
# 28.2 OpenAPI & Swagger

## Kenapa Dokumentasi API Penting?

- Frontend/dev lain tau endpoint apa aja yang tersedia
- Bisa auto-generate client library (OpenAPI Generator)
- Testing jadi lebih gampang (Swagger UI punya "Try it out")
- Contract antara backend & frontend

## OpenAPI 3.0 Structure

OpenAPI spec file (YAML atau JSON) punya struktur:

```yaml
openapi: "3.0.3"
info:
  title: "Todo API"
  description: "API manajemen todo sederhana"
  version: "1.0.0"
  contact:
    name: "Tim RPL"
    email: "rpl@sekolah.id"
servers:
  - url: "http://localhost:3000/api/v1"
    description: "Development server"
paths:
  /todos:
    get:
      summary: "Ambil semua todos"
      responses:
        "200":
          description: "List todos"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/TodoList"
components:
  schemas:
    Todo:
      type: object
      properties:
        id:
          type: integer
        title:
          type: string
        completed:
          type: boolean
    TodoList:
      type: array
      items:
        $ref: "#/components/schemas/Todo"
```

## Komponen Utama OpenAPI

| Bagian | Fungsi |
|--------|--------|
| `openapi` | Version spec (3.0.0 / 3.0.3 / 3.1.0) |
| `info` | Metadata API — title, version, description |
| `servers` | Base URL server (bisa multiple: dev/staging/prod) |
| `paths` | Definisi endpoint & operasi |
| `components/schemas` | Reusable data models (DRY) |
| `parameters` | Reusable parameters (query, path, header) |
| `security` | Security scheme (API key, JWT, etc) |

## Setup swagger-jsdoc + swagger-ui-express di Express

Install:

```bash
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

### 1. Define OpenAPI spec dengan JSDoc comments

```typescript
// src/docs/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description: 'API manajemen todo sederhana',
      contact: {
        name: 'Tim RPL',
        email: 'rpl@sekolah.id',
      },
    },
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'], // scan file routes buat JSDoc
};

export const swaggerSpec = swaggerJsdoc(options);
```

### 2. JSDoc annotations di route files

```typescript
// src/routes/todos.ts
import { Router, Request, Response } from 'express';

const router = Router();

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

let todos: Todo[] = [
  { id: 1, title: 'Belajar REST API', completed: false },
];

/**
 * @openapi
 * /todos:
 *   get:
 *     tags: [Todos]
 *     summary: Ambil semua todos
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status completed
 *     responses:
 *       200:
 *         description: List todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
router.get('/todos', (req: Request, res: Response) => {
  let result = todos;
  if (req.query.completed !== undefined) {
    const completed = req.query.completed === 'true';
    result = todos.filter(t => t.completed === completed);
  }
  res.json(result);
});

/**
 * @openapi
 * /todos:
 *   post:
 *     tags: [Todos]
 *     summary: Buat todo baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Todo berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Title wajib diisi
 */
router.post('/todos', (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title wajib diisi' });
  }
  const newTodo: Todo = {
    id: todos.length + 1,
    title,
    completed: false,
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

export default router;
```

### 3. Schema definitions

```typescript
// src/docs/schemas.ts
/**
 * @openapi
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Belajar REST API"
 *         completed:
 *           type: boolean
 *           example: false
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Resource not found"
 */
export {};
```

### 4. Mount Swagger UI

```typescript
// src/app.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import todoRoutes from './routes/todos';

const app = express();
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Todo API Docs',
}));

// JSON version spec (buat consume programmatically)
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use('/api/v1', todoRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
  console.log(`Docs: http://localhost:${PORT}/api-docs`);
});
```

### 5. Hasil

Buka `http://localhost:3000/api-docs` — Swagger UI siap dipake. Bisa "Try it out" langsung dari browser.

## Latihan

1. Dari route `GET /api/products` dan `POST /api/products`, tulis JSDoc OpenAPI annotation lengkap (parameter query untuk filter, request body, responses 200/201/400).

2. Tambahin schema `Product` di components/schemas dengan properti: id (integer), name (string), price (number), category (string), inStock (boolean). Pake JSDoc comment.

3. Setup swagger-jsdoc + swagger-ui-express di Express project. Include custom CSS buat hide topbar. Mount di `/docs`. Tulis kode setup lengkap (TypeScript).

4. Bikin endpoint `GET /api/users/:id` dengan JSDoc OpenAPI. Parameter path `id`, response 200 (User ditemukan), 404 (User not found). Include example values di schema.
