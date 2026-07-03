# 09. Testing (Elektif)

> **Level:** Intermediate  
> **Jam:** 4 (2 sesi)  
> **Prasyarat:** Node.js & Express  
> **Output:** Unit test + integration test berjalan

## Kenapa Testing?

Tanpa test: Nambah fitur -> Takut yang lama rusak -> Stress
Pake test: Nambah fitur -> Jalanin test -> Aman

## Materi

| Sesi | Topik | Output |
|------|-------|--------|
| 1 | Unit test: Vitest | Test function + coverage |
| 2 | Integration test | Test Express endpoints |

## Contoh

```typescript
// calculator.ts
export const add = (a: number, b: number): number => a + b;

// calculator.test.ts
import { describe, it, expect } from 'vitest';
import { add } from './calculator';

describe('add', () => {
  it('adds 2+3=5', () => expect(add(2, 3)).toBe(5));
  it('adds negative', () => expect(add(-1, -2)).toBe(-3));
});
```

## Tools

- Vitest (TypeScript native)
- Supertest (HTTP assertions)
- Coverage: `vitest run --coverage`
