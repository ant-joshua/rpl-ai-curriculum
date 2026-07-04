# 🏋️ Latihan Testing

## Level 1: Dasar

### 1. Unit Test — Calculator Functions

Setup Vitest dan tulis test untuk fungsi kalkulator:

```typescript
// calculator.ts
export const add = (a: number, b: number): number => a + b;
export const subtract = (a: number, b: number): number => a - b;
export const multiply = (a: number, b: number): number => a * b;
export const divide = (a: number, b: number): number => {
  if (b === 0) throw new Error("Cannot divide by zero");
  return a / b;
};
```

```typescript
// calculator.test.ts
import { describe, it, expect } from "vitest";
import { add, subtract, multiply, divide } from "./calculator";

// === KODE TEST LO DISINI ===

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("adds negative numbers", () => {
    // === KODE LO DISINI ===
    // expect(add(-1, -2)).toBe(-3);
  });

  it("adds zero", () => {
    // === KODE LO DISINI ===
  });
});

describe("subtract", () => {
  it("subtracts two numbers", () => {
    // === KODE LO DISINI ===
    // expect(subtract(10, 4)).toBe(6);
  });

  it("returns negative result", () => {
    // === KODE LO DISINI ===
  });
});

describe("multiply", () => {
  it("multiplies positive numbers", () => {
    // === KODE LO DISINI ===
  });

  it("multiplies by zero", () => {
    // === KODE LO DISINI ===
  });
});

describe("divide", () => {
  it("divides two numbers", () => {
    // === KODE LO DISINI ===
  });

  it("throws error when dividing by zero", () => {
    // === KODE LO DISINI ===
    // expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
  });
});
```

**Expected:** `npx vitest run` → 8 tests passed.

### 2. Matchers Practice

Testing berbagai matchers di Vitest.

```typescript
// matchers.test.ts
import { describe, it, expect } from "vitest";

describe("Vitest matchers", () => {
  it("toBe vs toEqual", () => {
    // === KODE LO DISINI ===
    // 1. Test primitive: expect(1 + 1).toBe(2)
    // 2. Test object: expect({ a: 1 }).toEqual({ a: 1 })  // toBe FAILS for objects
    // 3. Test array: expect([1, 2, 3]).toEqual([1, 2, 3])
  });

  it("toContain and toHaveLength", () => {
    const fruits = ["apple", "banana", "cherry"];
    // === KODE LO DISINI ===
    // expect(fruits).toContain("banana")
    // expect(fruits).toHaveLength(3)
  });

  it("toBeTruthy / toBeFalsy", () => {
    // === KODE LO DISINI ===
    // Test: 0, "", null, undefined, false are falsy
    // Test: 1, "a", [], {} are truthy
  });

  it("toThrow", () => {
    const throwError = () => { throw new Error("Something went wrong"); };
    const noError = () => "ok";
    // === KODE LO DISINI ===
    // expect(throwError).toThrow("Something went wrong")
    // expect(noError).not.toThrow()
  });

  it("toBeGreaterThan / toBeLessThan", () => {
    // === KODE LO DISINI ===
    // expect(100).toBeGreaterThan(50)
    // expect(50).toBeLessThan(100)
  });
});
```

**Expected:** Semua test pass.

### 3. Async Function Test

Test async function yang fetch data dari mock API.

```typescript
// userService.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: "Budi", email: "budi@test.com" },
  { id: 2, name: "Andi", email: "andi@test.com" },
];

export async function getUserById(id: number): Promise<User | null> {
  // Simulasi async fetch
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(users.find((u) => u.id === id) ?? null);
    }, 100);
  });
}
```

```typescript
// userService.test.ts
import { describe, it, expect } from "vitest";
import { getUserById } from "./userService";

// === KODE TEST LO DISINI ===

describe("getUserById", () => {
  it("returns user when found", async () => {
    // Hint: await + expect
    // expect(await getUserById(1)).toEqual({ id: 1, name: "Budi", email: "budi@test.com" });
  });

  it("returns null when not found", async () => {
    // === KODE LO DISINI ===
  });
});
```

**Expected:** Kedua test async pass.

## Level 2: Intermediate

### 4. Mocking — External API

Test fungsi yang panggil API eksternal — mock fetch-nya.

```typescript
// weatherService.ts
export interface Weather {
  city: string;
  temperature: number;
  condition: string;
}

export async function getWeather(city: string): Promise<Weather> {
  const res = await fetch(`https://api.weather.com/v1/${city}`);
  if (!res.ok) throw new Error(`Failed to fetch weather for ${city}`);
  return res.json();
}
```

```typescript
// weatherService.test.ts
import { describe, it, expect, vi } from "vitest";

// === KODE TEST LO DISINI ===

describe("getWeather", () => {
  it("returns weather data on success", async () => {
    // 1. Mock global fetch
    // vi.spyOn(global, "fetch").mockImplementation(...)
    // 2. Mock return { city: "Jakarta", temperature: 32, condition: "Cerah" }
    // 3. Panggil getWeather("Jakarta")
    // 4. Assert hasilnya sesuai
    // 5. Assert fetch dipanggil dengan URL yang bener
    // 6. Restore mock
  });

  it("throws error on API failure", async () => {
    // 1. Mock fetch return ok: false
    // 2. Assert getWeather throws error
  });
});
```

**Expected:**
- Test pertama: weather data sesuai mock, fetch dipanggil dengan URL `https://api.weather.com/v1/Jakarta`
- Test kedua: error thrown kalo API return non-OK

### 5. Parameterized Test (test.each)

Pake `test.each` buat test multiple cases dengan satu fungsi.

```typescript
// gradeCalculator.ts
export function calculateGrade(score: number): string {
  if (score < 0 || score > 100) throw new Error("Invalid score");
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
}
```

```typescript
// gradeCalculator.test.ts
import { describe, it, expect } from "vitest";
import { calculateGrade } from "./gradeCalculator";

// === KODE TEST LO DISINI ===

describe("calculateGrade", () => {
  // Pake test.each:
  // test.each([
  //   [95, "A"],
  //   [90, "A"],
  //   [85, "B"],
  //   [80, "B"],
  //   [75, "C"],
  //   [70, "C"],
  //   [65, "D"],
  //   [60, "D"],
  //   [50, "E"],
  //   [0, "E"],
  // ])("score %i returns %s", (score, expectedGrade) => {
  //   expect(calculateGrade(score)).toBe(expectedGrade);
  // });

  it("throws error for invalid scores", () => {
    // === KODE LO DISINI ===
    // Test: -1 → error
    // Test: 101 → error
  });
});
```

**Expected:** 12 tests (10 parameterized + 2 edge case) semua pass.

### 6. Integration Test — Express API

Tulis integration test buat Express API Todo list pake supertest.

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
  const id = parseInt(req.params.id);
  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  todo.done = req.body.done ?? todo.done;
  todo.title = req.body.title ?? todo.title;
  res.json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ error: "Todo not found" });
  todos.splice(index, 1);
  res.status(204).send();
});

export { app };
```

```typescript
// app.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./app";

// === KODE TEST LO DISINI ===

describe("Todo API", () => {
  describe("GET /api/todos", () => {
    it("returns empty array initially", async () => {
      // const res = await request(app).get("/api/todos");
      // expect(res.status).toBe(200);
      // expect(res.body).toEqual([]);
    });
  });

  describe("POST /api/todos", () => {
    it("creates a new todo", async () => {
      // const res = await request(app)
      //   .post("/api/todos")
      //   .send({ title: "Belajar Testing" });
      // expect(res.status).toBe(201);
      // expect(res.body.title).toBe("Belajar Testing");
      // expect(res.body.done).toBe(false);
      // expect(res.body.id).toBeDefined();
    });

    it("returns 400 when title missing", async () => {
      // === KODE LO DISINI ===
    });
  });

  describe("PUT /api/todos/:id", () => {
    it("updates a todo", async () => {
      // 1. Create todo dulu
      // 2. Update todo (done: true)
      // 3. Assert response
    });

    it("returns 404 for non-existent todo", async () => {
      // === KODE LO DISINI ===
    });
  });

  describe("DELETE /api/todos/:id", () => {
    it("deletes a todo", async () => {
      // 1. Create dulu
      // 2. Delete
      // 3. Assert status 204
      // 4. Assert GET list kosong
    });

    it("returns 404 for non-existent todo", async () => {
      // === KODE LO DISINI ===
    });
  });
});
```

**Expected:** `npx vitest run` → 7 integration tests pass.

## Level 3: Challenge

### 7. Mocking Database — Integration Test with Prisma

Test service layer yang pake Prisma — mock Prisma client.

```typescript
// userService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateUserInput {
  name: string;
  email: string;
}

export async function createUser(data: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already exists");

  return prisma.user.create({ data });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true },
  });
}
```

```typescript
// userService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// === KODE TEST LO DISINI ===
// 1. Mock PrismaClient
//    vi.mock("@prisma/client", () => ({
//      PrismaClient: vi.fn(() => ({
//        user: {
//          findUnique: vi.fn(),
//          create: vi.fn(),
//          findMany: vi.fn(),
//        },
//      })),
//    }));

// 2. Import setelah mock
import { createUser, getAllUsers } from "./userService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new user", async () => {
    // Mock findUnique return null (email belum dipake)
    // Mock create return { id: 1, name: "Budi", email: "budi@test.com" }
    // === KODE LO DISINI ===
  });

  it("throws error when email already exists", async () => {
    // Mock findUnique return existing user
    // Assert createUser throws "Email already exists"
    // Assert prisma.user.create NOT called
    // === KODE LO DISINI ===
  });

  it("returns all users sorted by createdAt desc", async () => {
    // Mock findMany return array of users
    // Assert getAllUsers return expected data
    // Assert prisma.user.findMany dipanggil dengan argumen yang bener
    // === KODE LO DISINI ===
  });
});
```

**Expected:**
- Test create sukses: user beneran di-create lewat mock
- Test duplicate email: error thrown, create() gak pernah dipanggil
- Test getAllUsers: return data sesuai mock, argument findMany bener (orderBy, select)

### 8. CI/CD Pipeline — GitHub Actions

Buat GitHub Actions workflow yang:

1. **Trigger:** push ke branch `main` dan `develop`, pull request ke `main`
2. **Jobs:**
   - `test`: jalanin unit test + integration test
   - `lint`: jalanin ESLint
   - `build`: compile TypeScript
3. **Matrix:** test di Node.js 18, 20, 22
4. **Services:** PostgreSQL container buat integration test
5. **Coverage:** upload coverage report
6. **Caching:** cache node_modules
7. **Notification:** kirim Discord webhook kalo test gagal (opsional — tulis aja confignya)

```yaml
# .github/workflows/test.yml
# === KODE YAML LO DISINI ===

name: CI

on:
  # === TRIGGER LO DISINI ===

jobs:
  test:
    # === KONFIGURASI LO DISINI ===
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    services:
      postgres:
        # PostgreSQL container buat integration test
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      # === STEPS LO DISINI ===
      # 1. Checkout
      # 2. Setup Node
      # 3. Cache npm
      # 4. Install dependencies
      # 5. Run lint
      # 6. Run test with coverage
      # 7. Upload coverage

  lint:
    # === KODE LO DISINI ===

  build:
    # === KODE LO DISINI ===
```

**Pertanyaan (jawab di komentar YAML):**

1. Kenapa pake `matrix` untuk node version?
2. Apa fungsi `services.postgres`?
3. Kenapa perlu cache dependencies?
4. Gimana cara workflow notify kalo ada test failure?
