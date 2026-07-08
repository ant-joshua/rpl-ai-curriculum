# 2. Integration Test dengan Supertest

## Bedanya Unit Test vs Integration Test

| Unit Test | Integration Test |
|-----------|-----------------|
| Test satu function | Test alur antar komponen |
| Mock semua dependensi | Pake dependensi beneran (atau lightweight) |
| Cepet (ms) | Lebih lambat (detik) |
| Ga kena DB/file system | Kena DB/file system |
| Error = function salah | Error = komunikasi antar komponen salah |

Integration test = **test sistem secara vertikal** — route → controller → middleware → DB.

## Setup

```bash
npm install express
npm install -D vitest supertest @types/express @types/supertest
```

## Testing Express Routes

Bikin Express app minimal:

```typescript
// app.ts
import express from "express";

const app = express();
app.use(express.json());

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

let todos: Todo[] = [];
let nextId = 1;

app.get("/api/todos", (_req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }
  const todo: Todo = { id: nextId++, title, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.put("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ error: "Not found" });
  todo.done = req.body.done ?? todo.done;
  todo.title = req.body.title ?? todo.title;
  res.json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  todos.splice(idx, 1);
  res.status(204).send();
});

export { app };
```

Test pakai supertest:

```typescript
// app.test.ts
import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { app } from "./app";

const request = supertest(app);

describe("GET /api/todos", () => {
  it("returns empty array initially", async () => {
    const res = await request.get("/api/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/todos", () => {
  it("creates a new todo", async () => {
    const res = await request.post("/api/todos").send({ title: "Belajar testing" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Belajar testing");
    expect(res.body.done).toBe(false);
    expect(res.body.id).toBeDefined();
  });

  it("rejects empty title", async () => {
    const res = await request.post("/api/todos").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });
});
```

> **PENTING:** Antar-test bisa saling ganggu kalo pake shared state (array `todos`). Solusi: reset tiap test.

## Reset State Antar Test

Karena module-level state, export fungsi reset:

```typescript
// app.ts — tambah di akhir
export const resetTodos = () => {
  todos = [];
  nextId = 1;
};
```

```typescript
// app.test.ts — tambah setup
import { beforeAll, afterEach } from "vitest";
import { app, resetTodos } from "./app";

beforeAll(() => resetTodos());

afterEach(() => resetTodos()); // reset tiap test biar independen
```

## Supertest Tips

```typescript
// Kirim header
request.get("/api/protected").set("Authorization", "Bearer token");

// Kirim query params
request.get("/api/users").query({ page: 1, limit: 10 });

// Upload file
request.post("/api/upload").attach("file", "path/to/file.pdf");

// Parsing response
request.get("/api/todos").expect("Content-Type", /json/).expect(200);
```

## Testing DB dengan SQLite In-Memory

Paling praktis buat integration test DB:

```typescript
// db.ts
import Database from "better-sqlite3";

// Di production pake file, di test pake ':memory:'
export const createDb = (filename: string = ":memory:") => {
  const db = new Database(filename);
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER DEFAULT 0
    )
  `);
  return db;
};
```

```typescript
// todoRepository.ts
import Database from "better-sqlite3";

export class TodoRepository {
  constructor(private db: Database.Database) {}

  findAll() {
    return this.db.prepare("SELECT * FROM todos").all();
  }

  create(title: string) {
    const stmt = this.db.prepare("INSERT INTO todos (title) VALUES (?)");
    const info = stmt.run(title);
    return this.db.prepare("SELECT * FROM todos WHERE id = ?").get(info.lastInsertRowid);
  }

  findById(id: number) {
    return this.db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  }

  deleteById(id: number) {
    return this.db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  }
}
```

```typescript
// todoRepository.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { TodoRepository } from "./todoRepository";
import { createDb } from "./db";

describe("TodoRepository", () => {
  let db: Database.Database;
  let repo: TodoRepository;

  beforeEach(() => {
    db = createDb(); // fresh in-memory DB tiap test
    repo = new TodoRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it("findAll returns empty initially", () => {
    expect(repo.findAll()).toEqual([]);
  });

  it("create inserts a todo", () => {
    const todo = repo.create("Belajar testing");
    expect(todo).toHaveProperty("id");
    expect(todo).toHaveProperty("title", "Belajar testing");
    expect(todo).toHaveProperty("done", 0);
  });

  it("findAll returns created todos", () => {
    repo.create("Todo A");
    repo.create("Todo B");
    expect(repo.findAll()).toHaveLength(2);
  });

  it("findById returns specific todo", () => {
    const created = repo.create("Find me");
    const found = repo.findById(created.id);
    expect(found.title).toBe("Find me");
  });

  it("deleteById removes todo", () => {
    const created = repo.create("Delete me");
    repo.deleteById(created.id);
    expect(repo.findAll()).toHaveLength(0);
  });
});
```

## Auth Test

```typescript
// auth.ts
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token || token !== "Bearer valid-token") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};
```

```typescript
// auth.test.ts
import { describe, it, expect } from "vitest";
import supertest from "supertest";
import express from "express";
import { authMiddleware } from "./auth";

const app = express();
app.get("/api/protected", authMiddleware, (_req, res) => {
  res.json({ message: "Secret data" });
});

const request = supertest(app);

describe("authMiddleware", () => {
  it("allows valid token", async () => {
    const res = await request
      .get("/api/protected")
      .set("Authorization", "Bearer valid-token");
    expect(res.status).toBe(200);
  });

  it("rejects missing token", async () => {
    const res = await request.get("/api/protected");
    expect(res.status).toBe(401);
  });

  it("rejects wrong token", async () => {
    const res = await request
      .get("/api/protected")
      .set("Authorization", "Bearer wrong-token");
    expect(res.status).toBe(401);
  });
});
```

## Test Fixtures — Data Factory

Biar ga nulis data manual tiap test:

```typescript
// fixtures.ts
export const buildTodo = (overrides?: Partial<{ title: string; done: boolean }>) => ({
  id: 1,
  title: "Default task",
  done: false,
  ...overrides,
});

export const buildTodoList = (count: number) =>
  Array.from({ length: count }, (_, i) => buildTodo({
    id: i + 1,
    title: `Task ${i + 1}`,
  }));

export const buildUser = (overrides?: Partial<{ name: string; email: string }>) => ({
  id: crypto.randomUUID(),
  name: "Budi",
  email: "budi@example.com",
  active: true,
  ...overrides,
});
```

```typescript
// fixtures.test.ts
import { describe, it, expect } from "vitest";
import { buildTodo, buildTodoList } from "./fixtures";

describe("buildTodo", () => {
  it("creates todo with defaults", () => {
    const todo = buildTodo();
    expect(todo.title).toBe("Default task");
  });

  it("overrides fields", () => {
    const todo = buildTodo({ title: "Custom", done: true });
    expect(todo.title).toBe("Custom");
    expect(todo.done).toBe(true);
  });
});

describe("buildTodoList", () => {
  it("creates N todos", () => {
    expect(buildTodoList(5)).toHaveLength(5);
  });

  it("creates sequential tasks", () => {
    const list = buildTodoList(3);
    expect(list[1].title).toBe("Task 2");
  });
});
```

## Pitfalls Integration Test

1. **Shared DB state** — Test pake DB yang sama bikin data bentrok. Solusi: fresh DB tiap test (in-memory / transaction rollback)
2. **Test too slow** — Kalo >10 detik, test jadi males dijalanin. Pake parallel execution
3. **Ga test error path** — Test cuma response 200, skip 400/404/500
4. **Order-dependent test** — Test 1 insert data, Test 2 expect data itu ada. Kalo jalan sendiri-sendiri, Test 2 fail
5. **Hardcoded port** — Pake supertest tanpa port (langsung pass Express app), bukan `app.listen()`

## Latihan

1. **User API CRUD test** — Bikin Express app dengan routes: `GET /api/users`, `POST /api/users`, `GET /api/users/:id`, `DELETE /api/users/:id`. Pake array in-memory. Test semua endpoint termasuk edge case (user not found, duplicate validation, empty body)

2. **Auth-protected todo API** — Gabungin auth middleware + todo CRUD. Test: request tanpa token ditolak (401), request dengan token valid bisa create/read/update/delete. Pastikan test tiap route di-protect

3. **Error handler test** — Bikin global error handler middleware Express. Test: route yang throw error, route dengan invalid JSON body, route dengan parameter invalid (misal `id` bukan angka). Pastikan response punya format error konsisten: `{ error: string, status: number }`

4. **Product repository dengan SQLite** — Bikin `ProductRepository` (create, findAll, findByCategory, updateStock). Pake SQLite in-memory + fixtures. Test: insert product, find by category, update stock jadi 0, hapus product

5. **Pagination integration test** — Bikin endpoint `GET /api/items?page=1&limit=10`. Test: page valid, page melebihi data, limit default, limit maksimum. Pastikan response format: `{ data: [], meta: { page, limit, total, totalPages } }`
