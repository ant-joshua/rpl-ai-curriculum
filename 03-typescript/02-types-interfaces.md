# 3.2 Object Types & Interfaces

## Object Types

Cara ngetik object di TypeScript.

```typescript
let siswa: { name: string; age: number } = {
  name: "Budi",
  age: 17,
};
```

## Interface

Interface adalah cara utama buat describe object shape.

```typescript
interface Student {
  name: string;
  age: number;
  grade?: string; // optional
}

const budi: Student = { name: "Budi", age: 17 };

// Extended interface
interface Graduate extends Student {
  graduationYear: number;
}

const andi: Graduate = {
  name: "Andi",
  age: 22,
  graduationYear: 2025,
};
```

## Type Alias vs Interface

Keduanya mirip, ada beda tipis.

```typescript
// Type alias — bisa buat union, tuple, primitive
type ID = string | number;
type Point = { x: number; y: number };

// Interface — lebih cocok buat object, bisa declaration merging
interface Car {
  brand: string;
  model: string;
}

// Declaration merging (interface doang)
interface Car {
  year: number;
}
// Sekarang Car punya brand + model + year
```

Table bedanya:

| Fitur | Interface | Type Alias |
|-------|-----------|------------|
| Object shape | ✅ Ya | ✅ Ya |
| Declaration merging | ✅ Bisa | ❌ Ga bisa |
| Union / Tuple | ❌ | ✅ |
| Extends | `extends` | Intersection (`&`) |
| Computed properties | ❌ | ✅ |

## Optional & Readonly

```typescript
interface Config {
  readonly apiKey: string;  // gabisa diubah setelah inisialisasi
  port?: number;            // optional — boleh ga diisi
  debug: boolean;
}

const config: Config = {
  apiKey: "abc123",
  debug: true,
  // port optional, ga harus diisi
};

// config.apiKey = "newkey"; // ERROR: readonly
```

## Intersection Types

Gabungin beberapa tipe pake `&`.

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee {
  employeeId: string;
  department: string;
}

type WorkerPerson = Person & Employee;

const worker: WorkerPerson = {
  name: "Budi",
  age: 17,
  employeeId: "EMP001",
  department: "Engineering",
};
```

## Nested Objects

```typescript
interface Address {
  street: string;
  city: string;
  postalCode: string;
}

interface StudentWithAddress {
  name: string;
  age: number;
  address: Address;
}

const student: StudentWithAddress = {
  name: "Budi",
  age: 17,
  address: {
    street: "Jl. Merdeka No. 1",
    city: "Jakarta",
    postalCode: "10110",
  },
};
```

## Latihan

1. Bikin interface `Product` dengan properti: id (string), name (string), price (number), category (optional string). Bikin 2 object Product
2. Bikin interface `CartItem` yang punya product (Product), quantity (number). Bikin interface `ShoppingCart` yang punya items (CartItem[]) dan totalPrice (number)
3. Bikin type `Shape` yang union dari `Circle` (radius: number) dan `Rectangle` (width: number, height: number) pake intersection & discriminated union
4. Bikin 2 interface `Teacher` dan `Student`, terus bikin intersection type `Mentor` dari keduanya. Tambah properti `mentorSince: Date`
