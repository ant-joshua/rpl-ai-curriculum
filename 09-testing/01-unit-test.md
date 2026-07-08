# 1. Unit Test dengan Vitest

## Apa itu Unit Test?

Unit test = test fungsi **individual** — kode terkecil di aplikasi. Konsep: pisahin kode dari dependensi eksternal (DB, API, file system) biar test cepet & deterministik.

Rule of thumb:
- Satu `it()` = satu **behavior**, bukan satu function
- Test harus **independen** — urutan jalan ga ngaruh
- Kode test = dokumentasi hidup — kalo senior baca test lo, ngerti behavior kode

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

`vitest.config.ts` — (opsional) biar konfigurasi rapi:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,        // describe/it/expect tanpa import
    environment: "node",
  },
});
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

**Struktur AAA:** Arrange → Act → Assert
```typescript
it("divides positive numbers", () => {
  // Arrange — siapin input/output
  const a = 10, b = 2, expected = 5;
  
  // Act — panggil function
  const result = divide(a, b);
  
  // Assert — verifikasi
  expect(result).toBe(expected);
});
```

## Matchers — Toolbox

| Matcher | Fungsi |
|---------|--------|
| `toBe(val)` | `===` strict equality (primitives) |
| `toEqual(obj)` | Deep equality (object/array) |
| `toContain(item)` | Array/string contains |
| `toThrow(err?)` | Function throws |
| `toBeGreaterThan(n)` | `> n` |
| `toBeDefined()` | Not undefined |
| `toHaveLength(n)` | Array/string length |
| `toHaveProperty(key, val?)` | Object punya property |

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

  it("toHaveLength for array", () => {
    expect([1, 2, 3]).toHaveLength(3);
  });

  it("toHaveProperty for objects", () => {
    expect({ id: 1, name: "test" }).toHaveProperty("name");
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

  it("tracks multiple calls", () => {
    const mock = vi.fn();
    mock("a");
    mock("b");
    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock.mock.calls).toEqual([["a"], ["b"]]);
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

**Mocking best practices:**
- Mock **external** dependencies (API, DB, file system), bukan internal functions
- Kalo bisa pake dependency injection daripada mock module
- Reset mock antar test pake `beforeEach(() => vi.clearAllMocks())`

## Testing Pure Functions

Pure function = input sama → output sama, no side effects. Paling gampang di-test.

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

export const calculateDiscount = (price: number, percent: number): number => {
  if (percent < 0 || percent > 100) throw new Error("Invalid percent");
  return price - (price * percent) / 100;
};
```

```typescript
// utils.test.ts
import { describe, it, expect } from "vitest";
import { toRupiah, filterActive, calculateDiscount } from "./utils";

describe("toRupiah", () => {
  it("formats number to IDR", () => {
    expect(toRupiah(15000)).toBe("Rp15.000,00");
  });

  it("handles zero", () => {
    expect(toRupiah(0)).toBe("Rp0,00");
  });

  it("handles large numbers", () => {
    expect(toRupiah(1000000)).toBe("Rp1.000.000,00");
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

  it("returns all items if all active", () => {
    const items = [{ id: 1, active: true }, { id: 2, active: true }];
    expect(filterActive(items)).toHaveLength(2);
  });
});

describe("calculateDiscount", () => {
  it("calculates 10% discount", () => {
    expect(calculateDiscount(100000, 10)).toBe(90000);
  });

  it("throws on invalid percent", () => {
    expect(() => calculateDiscount(100, 150)).toThrow("Invalid percent");
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

  it("throws on network exception", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network timeout"));

    await expect(fetchUser(1)).rejects.toThrow("Network timeout");
  });
});
```

## beforeEach & afterEach — Setup & Teardown

Biar test ga saling ganggu, reset state tiap test:

```typescript
describe("counter", () => {
  let counter: number;

  beforeEach(() => {
    counter = 0; // reset tiap test
  });

  it("starts at 0", () => {
    expect(counter).toBe(0);
  });

  it("can increment", () => {
    counter++;
    expect(counter).toBe(1);
  });
  // Test 2 ga kena efek Test 1 karena beforeEach reset
});
```

## Pitfalls Yang Sering Kejadian

1. **Test saling ganggu** — Shared state antar test (array, object) harus di-reset di `beforeEach`
2. **Test too broad** — Satu `it()` test 3-4 behavior beda. Pisahin!
3. **Mock overuse** — Mock terlalu banyak bikin test fragile. Kalo ganti implementasi, test ikutan rusak padahal behavior sama
4. **Ga test edge case** — Kebanyakan coba "happy path" doang, lupa null/undefined/empty/negative
5. **Test pake real network** — API call di unit test bikin lambat & flaky. Pake mock

## Latihan

1. **Calculator test lengkap** — Bikin function `multiply`, `subtract`, `isEven`. Test semua: positive, negative, zero, edge case (kalo isEven pake bilangan ganjil besar)

2. **Shopping cart test** — Bikin function `calculateTotal(items: {price: number, qty: number}[])` → total price. Test: cart kosong, cart isi 1 item, cart isi banyak item, kalo qty 0

3. **String utility test** — Bikin function `capitalizeWords(str: string): string`. Test: string kosong, satu kata, beberapa kata, all caps input, mixed case input

4. **Async user search** — Bikin function `searchUsers(keyword: string)` yang pake `fetch` ke dummy API. Test: mock fetch sukses return array, mock fetch kosong, mock fetch error. Pake `vi.spyOn` + `mockResolvedValueOnce`

5. **Date formatter** — Bikin `formatDate(date: Date, format: 'short' | 'long' | 'iso'): string`. Test: valid date di berbagai format, invalid date (throw error), leap year date, epoch
