# 03. 🔷 TypeScript

## Basic Types
```ts
let nama: string = "Budi";
let umur: number = 17;
let aktif: boolean = true;
let random: any = "apa aja";     // hindari
let kosong: null = null;
let belum: undefined = undefined;
let list: number[] = [1, 2, 3];
let tuple: [string, number] = ["Budi", 17];
```

## Interfaces
```ts
interface User {
  id: number;
  nama: string;
  email?: string;       // optional
  readonly createdAt: Date;  // hanya baca
}

// Extend
interface Admin extends User {
  role: "admin" | "superadmin";
}
```

## Types
```ts
type ID = string | number;

type Status = "active" | "inactive" | "pending";

type User = {
  name: string;
  age: number;
};

// Intersection
type PersonWithRole = User & { role: string };
```

## Generics
```ts
function identity<T>(arg: T): T {
  return arg;
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
}

// Generic constraint
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}
```

## Utility Types
```ts
Partial<User>        // semua properti jadi optional
Required<User>       // semua properti jadi required
Pick<User, "id" | "name">  // ambil subset properti
Omit<User, "email">  // hapus properti
Record<K, V>         // object dengan key-value tertentu
Readonly<User>       // semua properti readonly
ReturnType<typeof fn> // tipe return function
```

## Type Narrowing
```ts
function process(input: string | number) {
  if (typeof input === "string") {
    // input: string
  } else {
    // input: number (narrowed)
  }
}
```

## Enums
```ts
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right    // 3
}
```

## Common Pitfalls
- ❌ `any` — tujuannya menghilangkan manfaat TypeScript
- ❌ Interface vs Type — interface bisa extend, type bisa union/intersection
- ❌ Lupa `?` untuk optional → strict check error
- ❌ `null`/`undefined` tidak otomatis ditangani (aktifkan `strict: true`)

## Related Links
- [01 JS Fundamentals](01-js-fundamentals.md)
