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

/**
 * @openapi
 * /todos/{id}:
 *   get:
 *     tags: [Todos]
 *     summary: Ambil todo by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID todo
 *     responses:
 *       200:
 *         description: Todo ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo tidak ditemukan
 */
router.get('/todos/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ message: 'Todo tidak ditemukan' });
  res.json(todo);
});

/**
 * @openapi
 * /todos/{id}:
 *   put:
 *     tags: [Todos]
 *     summary: Update todo (replace seluruh resource)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Todo berhasil diupdate
 *       404:
 *         description: Todo tidak ditemukan
 */
router.put('/todos/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ message: 'Todo tidak ditemukan' });
  todo.title = req.body.title;
  todo.completed = req.body.completed ?? false;
  res.json(todo);
});

/**
 * @openapi
 * /todos/{id}:
 *   delete:
 *     tags: [Todos]
 *     summary: Hapus todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Todo berhasil dihapus
 *       404:
 *         description: Todo tidak ditemukan
 */
router.delete('/todos/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ message: 'Todo tidak ditemukan' });
  todos.splice(index, 1);
  res.status(204).send();
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

## OpenAPI Lanjutan — Fitur Tambahan

### Tags — Grouping Endpoint

```yaml
tags:
  - name: Todos
    description: Operasi CRUD untuk todos
  - name: Users
    description: Manajemen user
  - name: Auth
    description: Autentikasi dan otorisasi
```

Di JSDoc:

```typescript
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 */
```

### Security Schemes — Multiple Auth Types

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key
    cookieAuth:
      type: apiKey
      in: cookie
      name: session_id
```

### Reusable Parameters

```yaml
components:
  parameters:
    userId:
      name: id
      in: path
      required: true
      schema:
        type: integer
      description: ID user
    page:
      name: page
      in: query
      schema:
        type: integer
        default: 1
      description: Nomor halaman
    limit:
      name: limit
      in: query
      schema:
        type: integer
        default: 10
      description: Jumlah item per halaman
```

Pake di path:

```yaml
paths:
  /users/{id}:
    get:
      parameters:
        - $ref: '#/components/parameters/userId'
```

### Response Examples

```yaml
paths:
  /todos:
    get:
      responses:
        200:
          description: List todos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TodoList'
              example:
                - id: 1
                  title: "Belajar REST API"
                  completed: false
                - id: 2
                  title: "Setup Swagger"
                  completed: true
```

### Request Body Examples

```yaml
/todos:
  post:
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateTodo'
          example:
            title: "Belajar OpenAPI depth"
```

## API Testing dengan Postman & Insomnia

### Postman — Collection Setup

1. **Buat Collection** — New Collection → "Todo API"
2. **Set Variables** — Collection Variables:
   - `base_url`: `http://localhost:3000`
   - `api_prefix`: `/api/v1`
   - `token`: (kosong, isi dari login response)
3. **Auth** — Collection level Authorization → Bearer Token → `{{token}}`

### Postman — Request Examples

| Request | Method | URL | Body |
|---------|--------|-----|------|
| Get Todos | GET | `{{base_url}}{{api_prefix}}/todos` | — |
| Create Todo | POST | `{{base_url}}{{api_prefix}}/todos` | `{"title": "Test"}` |
| Login | POST | `{{base_url}}{{api_prefix}}/auth/login` | `{"email": "budi@mail.com", "password": "123456"}` |

### Pre-request Script — Auto Token

```javascript
// Di folder Auth → Login request → Tests tab
const response = pm.response.json();
if (pm.response.code === 200 && response.token) {
  pm.collectionVariables.set('token', response.token);
}
```

Ini auto-set token dari login ke collection variable, jadi request lain tinggal pake `{{token}}`.

### Postman — Test Scripts

```javascript
// Tests tab — validasi response
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response has data array", () => {
  const jsonData = pm.response.json();
  pm.expect(jsonData.data).to.be.an('array');
});

pm.test("Response time < 500ms", () => {
  pm.expect(pm.response.responseTime).to.be.below(500);
});

pm.test("Content-Type is JSON", () => {
  pm.response.to.have.header("Content-Type", "application/json; charset=utf-8");
});
```

### Postman — Environment Switching

Buat 3 environments:

| Environment | `base_url` | `api_prefix` |
|-------------|-----------|--------------|
| Development | `http://localhost:3000` | `/api/v1` |
| Staging | `https://staging-api.example.com` | `/api/v1` |
| Production | `https://api.example.com` | `/api/v1` |

### Postman — Collection Runner

```bash
# CLI — Newman
npm install -g newman

# Run collection
newman run Todo-API.postman_collection.json \
  -e Development.postman_environment.json \
  --reporters cli,junit \
  --reporter-junit-export results.xml

# Dengan data file
newman run Todo-API.postman_collection.json \
  -d test-data.csv \
  --delay-request 100
```

### Insomnia — Alternative

Insomnia mirip Postman tapi open-source. Kelebihan:

| Fitur | Postman | Insomnia |
|-------|---------|----------|
| GUI | ✅ Mature | ✅ Clean |
| CLI Runner | ✅ Newman | ✅ insomnia CLI |
| Git Sync | ❌ (butuh Cloud) | ✅ Built-in |
| GraphQL | ✅ | ✅ |
| OpenAPI Import | ✅ | ✅ |
| Harga | Freemium | Free & Open Source |

### API Testing Workflow

```
1. Manual: Test setiap endpoint di Postman/Insomnia
2. Collection: Group endpoints by feature
3. Variables: base_url, token → reuse
4. Tests: Assert status, body, timing
5. Environments: Dev → Staging → Prod
6. Automation: Newman/CI → test pas push
```

### Newman CI Integration

```yaml
# GitHub Actions — API test with Newman
- name: Run API Tests
  run: |
    npx newman run tests/api/Todo-API.postman_collection.json \
      --env-var "base_url=http://localhost:3000" \
      --env-var "api_prefix=/api/v1" \
      --reporters cli,junit \
      --reporter-junit-export results.xml

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: api-test-results
    path: results.xml
```

## Latihan

1. Dari route `GET /api/products` dan `POST /api/products`, tulis JSDoc OpenAPI annotation lengkap (parameter query untuk filter, request body, responses 200/201/400).

2. Tambahin schema `Product` di components/schemas dengan properti: id (integer), name (string), price (number), category (string), inStock (boolean). Pake JSDoc comment.

3. Setup swagger-jsdoc + swagger-ui-express di Express project. Include custom CSS buat hide topbar. Mount di `/docs`. Tulis kode setup lengkap (TypeScript).

4. Bikin endpoint `GET /api/users/:id` dengan JSDoc OpenAPI. Parameter path `id`, response 200 (User ditemukan), 404 (User not found). Include example values di schema.

5. **Reusable Parameters** — Bikin reusable parameter `id` di component `parameters` yang bisa dipake di beberapa endpoint. Dokumentasi cara pake `$ref` untuk referensi parameter reusable di JSDoc.

6. **Update & Delete JSDoc** — Dari route `PUT /api/products/:id` dan `DELETE /api/products/:id`, tulis JSDoc OpenAPI annotation lengkap. Include 200, 204, 400, 404 responses. Tambah parameter path `id`.

7. **Full CRUD OpenAPI YAML** — Tulis file `openapi.yaml` lengkap untuk resource Product. Include: schemas, parameters, paths (GET list, GET/:id, POST, PUT, DELETE), security scheme bearerAuth. Validasi pake tool `swagger-cli validate`.
