# 🧠 Cheatsheet: TypeScript Basics

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Static Types**: Tangkap error pas ngetik, bukan pas runtime
- **Tipe Dasar**: `string`, `number`, `boolean`, `null`, `undefined`, `any`, `void`
- **Array/Tuple**: `number[]`, `[string, number]` (tuple)
- **Union/Literal**: `string | number`, `"yes" | "no"`
- **Interface**: `interface User { name: string; age?: number; }`
- **Type Alias**: `type ID = string | number;`
- **Generics**: `<T>` — reusable function with any type
- **tsconfig.json**: Konfigurasi compiler TS

## Sintaks Penting

```typescript
// Tipe dasar
let nama: string = "Budi";
let umur: number = 17;
let isActive: boolean = true;

// Interface
interface User {
  id: number;
  name: string;
  email?: string;  // optional
  readonly createdAt: Date;
}

// Type alias
type Status = "active" | "inactive" | "pending";

// Generic function
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Enum
enum Color { Red = "RED", Green = "GREEN" }
```

```bash
# Compile & run
npx tsc --init       # Generate tsconfig.json
npx tsc              # Compile ke JS
npx ts-node file.ts  # Langsung jalanin TS
```

## Tips & Trik
- Type inference: TS otomatis nebak tipe — nggak perlu tulis kalo udah jelas
- `strict: true` di tsconfig — nyalain semua type checking
- `interface` bisa extend, `type` bisa union/intersection
- `any` = matiin type checking — hindari

## Common Mistakes
- ❌ Pake `any` terlalu sering — rugi pake TS
- ❌ Lupa `?` buat optional field → error pas akses undefined
- ❌ Bedain `interface` vs `type` — interface bisa declaration merging

## Link Cepat
- [Module README](README.md)
- [Latihan](../exercises/03-typescript.md)
- [Quiz](quiz.md)
