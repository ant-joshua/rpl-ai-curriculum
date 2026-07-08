# 3.2 Object Types & Interfaces

Di TypeScript, object punya **shape** yang jelas — properti apa aja, tipe apa.

## Object Types — Dasar

```typescript
// Inline type — praktis buat sekali pake
let siswa: { name: string; age: number; isActive: boolean } = {
  name: "Budi",
  age: 17,
  isActive: true,
};

// Optional property (pake ?)
let config: { apiKey: string; port?: number } = {
  apiKey: "sk-xxx",
  // port optional — boleh ga diisi
};

// Readonly property
let user: { readonly id: string; name: string } = {
  id: "u001",
  name: "Budi"
};
// user.id = "u002"; // ❌ ERROR: cannot reassign readonly
```

## Interface — Cara Utama Describe Object

```typescript
interface Student {
  name: string;
  age: number;
  grade?: string;       // optional
  readonly id: string;  // readonly — ga bisa diubah
}

const budi: Student = { name: "Budi", age: 17, id: "STU001" };
const andi: Student = { name: "Andi", age: 18, grade: "XII", id: "STU002" };
```

### Interface Methods

```typescript
interface Calculator {
  add(a: number, b: number): number;
  subtract: (a: number, b: number) => number;  // Arrow function syntax
  readonly name: string;
}

const calc: Calculator = {
  name: "SimpleCalc",
  add(a, b) { return a + b; },
  subtract: (a, b) => a - b,
};

// Call signature — buat function dengan properti
interface Action {
  (input: string): number;
  description: string;
}

const fn: Action = (input: string) => input.length;
fn.description = "Hitung panjang string";
```

### Interface Extends — Inheritance

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: string;
  department: string;
  salary: number;
}

interface Manager extends Employee {
  teamSize: number;
  reports: Employee[];
}

const manager: Manager = {
  name: "Budi",
  age: 30,
  employeeId: "EMP001",
  department: "Engineering",
  salary: 15000000,
  teamSize: 5,
  reports: [
    { name: "Ani", age: 25, employeeId: "EMP002", department: "Engineering", salary: 10000000 },
  ],
};

// Multiple extends
interface HasEmail { email: string }
interface HasPhone { phone: string }
interface Contact extends HasEmail, HasPhone {
  name: string;
}

const kontak: Contact = { name: "Budi", email: "budi@email.com", phone: "08123456789" };
```

## Interface vs Type Alias

```typescript
// Interface — fokus object, bisa declaration merging
interface Car {
  brand: string;
  model: string;
}

// Declaration merging (cuma interface yang bisa!)
interface Car {
  year: number;
}
// Car sekarang punya 3 properti: brand, model, year

// Type — lebih fleksibel (union, tuple, primitive alias)
type ID = string | number;
type Point = [number, number];
type StatusCode = 200 | 201 | 400 | 401 | 404 | 500;
type Shape = { kind: "circle"; radius: number } | { kind: "rect"; w: number; h: number };
```

**Kapan pake mana:**

| Situasi | Interface | Type Alias |
|---------|-----------|------------|
| Object shape | ✅ Preferred | ✅ Bisa |
| Declaration merging | ✅ Bisa | ❌ |
| Union types | ❌ | ✅ |
| Tuple types | ❌ | ✅ |
| Extends | `extends` | `&` (intersection) |
| Computed properties | ❌ | ✅ |
| Performance | ✅ Lebih cepet | ⚠️ Kadang lebih lambat |

> **Golden rule:** Interface buat **object/public API**. Type buat **union/tuple/utility**.

## Discriminated Union — Pattern Paling Powerfull

```typescript
// Setiap varian punya properti 'type' yang beda
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

// TypeScript tau properti apa yang available di tiap case!
// shape.radius cuma ada di case "circle"

// Diskriminated union di React
type ApiState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function renderState(state: ApiState<string[]>) {
  switch (state.status) {
    case "idle": return <p>Mulai cari data</p>;
    case "loading": return <p>Loading...</p>;
    case "success": return <ul>{state.data.map(item => <li>{item}</li>)}</ul>;
    case "error": return <p className="error">{state.message}</p>;
  }
}
```

## Utility Types — Transformasi Tipe

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Partial — semua jadi optional
type PartialUser = Partial<User>;
// { id?: string; name?: string; ... }

// Pick — ambil sebagian
type UserPublic = Pick<User, "id" | "name" | "email">;
// { id: string; name: string; email: string }

// Omit — kecualikan sebagian
type UserWithoutPassword = Omit<User, "password">;
// { id: string; name: string; email: string; createdAt: Date }

// Required — semua jadi wajib
type RequiredUser = Required<PartialUser>;

// Readonly — semua jadi ga bisa diubah
type FrozenUser = Readonly<User>;

// Record — object dengan key-value pattern
type StudentMap = Record<string, Student>;
// { [key: string]: Student }

// Extract & Exclude — filter union
type Status = "pending" | "success" | "error" | "loading";
type FinalStates = Exclude<Status, "pending" | "loading">;
// "success" | "error"
type LoadingStates = Extract<Status, "pending" | "loading">;
// "pending" | "loading"

// ReturnType — ambil return type dari function
function createUser() { return { id: "1", name: "test" } as const; }
type CreatedUser = ReturnType<typeof createUser>;
// { readonly id: "1"; readonly name: "test" }

// Parameters — ambil parameter type
type CreateUserParams = Parameters<typeof createUser>;
// []
```

## Nested & Complex Objects

```typescript
interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string; // default: "Indonesia"
}

interface PaymentMethod {
  type: "bank_transfer" | "ewallet" | "credit_card";
  provider: string;
  accountNumber: string;
}

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    address: Address;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  payment: PaymentMethod;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
}

// TypeScript bisa handle nested objects dengan baik
function isExpressShipping(order: Order): boolean {
  return order.items.some(item => item.price > 500000);
}
```

## Latihan

1. **Product Interface** — buat interface `Product` dengan: `id(string)`, `name(string)`, `price(number)`, `category(optional string)`, `tags(string[])`. Bikin 3 contoh product.

2. **Cart System** — buat interface: `CartItem` (product: Product, quantity: number), `ShoppingCart` (items: CartItem[], totalPrice: number, discount?: number). Bikin function `calculateTotal(items: CartItem[]): number`.

3. **Discriminated Union** — buat type `Media` = `{ kind: "book"; pages: number } | { kind: "video"; duration: number; resolution: string } | { kind: "podcast"; episodes: number; platform: string }`. Bikin function `getDuration(media: Media): string` yang return deskripsi durasi beda tiap media.

4. **Generic Response** — buat interface `ApiResponse<T>` dengan properti: `success(boolean)`, `data(T | null)`, `error(string | null)`, `timestamp(Date)`. Implementasikan untuk endpoint: `GET /users`, `POST /products`, `GET /orders/:id`.

5. **Utility Types Practice** — dari interface `Employee` (id, name, email, salary, department, startDate), buat:
   - `EmployeePublic` (pake Pick — cuma name, email, department)
   - `EmployeeCreate` (pake Omit— tanpa id, startDate)
   - `EmployeePartial` (pake Partial — buat update)
   - `EmployeeMap` (pake Record — map<string, Employee>)
