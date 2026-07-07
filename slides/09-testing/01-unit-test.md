---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/927022/pexels-pho"
footer: "Sesi 01: Unit Test"
---

<!-- _class: title -->
# 1. Unit Test dengan Vitest

## Setup Vitest

```bash
npm init -y
npm install -D vitest typescript @types/node
npx tsc --init
```

`package.json` — tambah script test:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Bikin file `calculator.ts`:

```typescript
export const add = (a: number, b: number): number => a + b;

export const divide = (a: number, b: number): number => {
  if (b === 0) throw new Error("Cannot divide by zero");
  return a / b;
};

export const getMax = (arr: number[]): number => {
  return Math.max(...arr);
};
```

## describe / it / expect

```typescript
// calculator.test.ts
import { describe, it, expect } from "vitest";
import { add, divide, getMax } from "./calculator";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("adds negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("adds zero", () => {
    expect(add(5, 0)).toBe(5);
  });
});
```

## Matchers

| Matcher | Fungsi |
|---------|--------|
| `toBe(val)` | `===` strict equality (primitives) |
| `toEqual(obj)` | Deep equality (object/array) |
| `toContain(item)` | Array/string contains |
| `toThrow(err?)` | Function throws |
| `toBeGreaterThan(n)` | `> n` |
| `toBeDefined()` | Not undefined |

```typescript
describe("matchers demo", () => {
  it("toEqual for objects", () => {
    expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
  });

  it("toContain in array", () => {
    expect([1, 2, 3]).toContain(2);
  });

  it("toThrow on error", () => {
    expect(() => divide(1, 0)).toThrow("Cannot divide by zero");
  });

  it("toBeGreaterThan", () => {
    expect(getMax([1, 5, 3])).toBeGreaterThan(4);
  });
});
```

## Mocking

`vi.fn()` — bikin spy function:

```typescript
import { vi, describe, it, expect } from "vitest";

describe("vi.fn", () => {
  it("tracks calls", () => {
    const mock = vi.fn((x: number) => x * 2);

    expect(mock(3)).toBe(6);
    expect(mock).toHaveBeenCalledWith(3);
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
```

`vi.mock()` — mock entire module:

```typescript
// userService.ts
import { db } from "./db";

export const getUser = async (id: string) => {
  return db.query("SELECT * FROM users WHERE id = $1", [id]);
};
```

```typescript
// userService.test.ts
import { vi, describe, it, expect } from "vitest";
import { getUser } from "./userService";

vi.mock("./db", () => ({
  db: {
    query: vi.fn().mockResolvedValue([{ id: "1", name: "Budi" }]),
  },
}));

describe("getUser", () => {
  it("returns user from mocked db", async () => {
    const user = await getUser("1");
    expect(user).toEqual([{ id: "1", name: "Budi" }]);
  });
});
```

## Testing Pure Functions

Pure function = input sama -> output sama, no side effects. Paling gampang di-test.

```typescript
// utils.ts
export const toRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

export const filterActive = <T extends { active: boolean }>(items: T[]): T[] => {
  return items.filter((item) => item.active);
};
```

```typescript
// utils.test.ts
import { describe, it, expect } from "vitest";
import { toRupiah, filterActive } from "./utils";

describe("toRupiah", () => {
  it("formats number to IDR", () => {
    expect(toRupiah(15000)).toBe("Rp15.000,00");
  });

  it("handles zero", () => {
    expect(toRupiah(0)).toBe("Rp0,00");
  });
});

describe("filterActive", () => {
  it("keeps only active items", () => {
    const items = [
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true },
    ];
    expect(filterActive(items)).toHaveLength(2);
  });

  it("returns empty array if none active", () => {
    expect(filterActive([{ id: 1, active: false }])).toEqual([]);
  });
});
```

## Async Tests

```typescript
// api.ts
export const fetchUser = async (id: number): Promise<{ name: string }> => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!res.ok) throw new Error("Network error");
  return res.json();
};
```

```typescript
// api.test.ts
import { describe, it, expect, vi } from "vitest";
import { fetchUser } from "./api";

describe("fetchUser", () => {
  it("returns user data on success", async () => {
    const mockData = { name: "Budi" };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const user = await fetchUser(1);
    expect(user).toEqual(mockData);
  });

  it("throws on network error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(fetchUser(1)).rejects.toThrow("Network error");
  });
});
```

## Latihan

1. **Calculator test lengkap** — Bikin function `multiply`, `subtract`, `isEven`. Test semua: positive, negative, zero, edge case (kalo isEven pake bilangan ganjil besar)

2. **Shopping cart test** — Bikin function `calculateTotal(items: {price: number, qty: number}[])` → total price. Test: cart kosong, cart isi 1 item, cart isi banyak item, kalo qty 0

3. **String utility test** — Bikin function `capitalizeWords(str: string): string`. Test: string kosong, satu kata, beberapa kata, all caps input, mixed case input

4. **Async user search** — Bikin function `searchUsers(keyword: string)` yang pake `fetch` ke dummy API. Test: mock fetch sukses return array, mock fetch kosong, mock fetch error. Pake `vi.spyOn` + `mockResolvedValueOnce`
