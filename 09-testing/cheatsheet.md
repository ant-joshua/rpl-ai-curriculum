# 🧠 Cheatsheet: Testing (Elektif)

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Test Mindset**: Testing bukan opsional — jaminan kode jalan
- **Unit Test**: Test fungsi terkecil (function/component) — Vitest
- **Integration Test**: Test interaksi antar komponen (API + DB) — Supertest
- **Matchers**: `toBe()`, `toEqual()`, `toContain()`, `toThrow()`
- **Mocking**: Palsuin function/module biar test ga kena side effects
- **CI/CD**: GitHub Actions auto-run test tiap push / PR

## Sintaks Penting

```typescript
// calculator.test.ts
import { describe, it, expect } from "vitest";
import { add, divide } from "./calculator";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
  it("handles negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });
});

describe("divide", () => {
  it("throws on divide by zero", () => {
    expect(() => divide(1, 0)).toThrow("Cannot divide by zero");
  });
});
```

```typescript
// Integration test with supertest
import request from "supertest";
import app from "../app";

describe("POST /api/notes", () => {
  it("creates a new note", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Test", content: "Hello" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test");
  });
});
```

```bash
npm install -D vitest supertest @types/supertest
# package.json: "test": "vitest run", "test:watch": "vitest"
```

## Tips & Trik
- `describe` = grup test, `it` = test case individual
- `test.each` buat parameterized test — coba banyak input sekali
- Mock: `vi.mock('../module')` + `vi.fn()` buat spies
- Coverage: `vitest run --coverage` — liat bagian mana yg belum di-test

## Common Mistakes
- ❌ Test API tanpa supertest — manual testing = wasted time
- ❌ Mock berlebihan — test jadi ga realistis
- ❌ Ga test edge cases (empty, null, invalid) — cuma happy path
- ❌ Lupa tambah script test di CI → PR merge tanpa test jalan

## Link Cepat
- [Module README](README.md)
- [Latihan](../exercises/09-testing.md)
- [Quiz](quiz.md)
