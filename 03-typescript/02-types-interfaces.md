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
  apiKey: "abc123",
  // port optional — boleh ga diisi
};

// Readonly property
let user: { readonly id: string; name: string } = {
  id: "u001",
  name: "Budi"
};
// user.id = "u002"; // ❌ ERROR: cannot reassign readonly
```

### Object Type Indeks Akses

```typescript
// Indexed access type buat object type inline
type Person = { name: string; age: number; city: string };
type PersonName = Person["name"]; // string
type PersonAgeOrCity = Person["age" | "city"]; // number | string

// Generic indexed access
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const p = { name: "Budi", age: 17 };
const name = getValue(p, "name"); // string
const age = getValue(p, "age");   // number
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

### Property Modifier — readonly vs Optional vs Index

```typescript
interface Config {
  readonly id: string;         // read-only — gak bisa diubah setelah inisialisasi
  name: string;                // required — wajib diisi
  description?: string;        // optional — boleh ada, boleh gak
  [key: string]: unknown;      // index signature — properti tambahan bebas
}

const cfg: Config = {
  id: "cfg-001",
  name: "App Config",
  description: "Optional field",
  extraField: "apapun",
};
// cfg.id = "baru"; // ❌ ERROR: readonly
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

### Generic Interface

```typescript
// Interface dengan generic parameter
interface Repository<T> {
  findAll(): T[];
  findById(id: string): T | undefined;
  create(data: Omit<T, 'id'>): T;
  update(id: string, data: Partial<T>): T | undefined;
  delete(id: string): boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

class UserRepository implements Repository<User> {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  create(data: Omit<User, 'id'>): User {
    const user: User = { id: String(this.users.length + 1), ...data };
    this.users.push(user);
    return user;
  }

  update(id: string, data: Partial<User>): User | undefined {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...data };
    return this.users[idx];
  }

  delete(id: string): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }
}
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

### Extends dengan Override Type

```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt: Date | null;
}

interface Product extends BaseEntity, SoftDeletable {
  name: string;
  price: number;
  category: string;
}

// Generic extends
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  total: number;
  totalPages: number;
}

interface UserResponse extends PaginatedResponse<User> {
  // data otomatis User[] dari generic
  activeFilters?: Record<string, string>;
}
```

## Declaration Merging — Fitur Paling Unik Interface

Deklarasi interface yang sama **otomatis digabung**:

```typescript
// File: types/user.ts
interface User {
  id: string;
  name: string;
}

// File B: types/user-extended.ts (beda file, nama sama)
interface User {
  email: string;
  role: "admin" | "user";
}

// Hasilnya — User punya 4 properti:
const user: User = {
  id: "1",
  name: "Budi",
  email: "budi@email.com",
  role: "admin",
};
```

### Declaration Merging di Library

Ini dipakai library buat nambah properti ke global types:

```typescript
// Express nambah properti ke Request
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
      startTime?: number;
    }
  }
}

// Di route handler:
app.get("/api/profile", (req, res) => {
  // req.user tersedia — type-safe
  console.log(req.startTime); // juga type-safe
});
```

### Module Augmentation

Nambah tipe ke library eksternal:

```typescript
// types/express-augment.d.ts
import "express";

declare module "express" {
  interface Request {
    user?: { id: string; role: string };
  }
}
```

### Merge Conflict — Hati-hati!

```typescript
interface User {
  name: string;
}

interface User {
  name: number; // ❌ ERROR: name harus sama tipe (string)
}
// TypeScript gak bisa merge property dengan tipe berbeda
// Kalo sama-sama function — jadi overload signature
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
| Mapped types | ❌ | ✅ |
| Performance | ✅ Lebih cepet | ⚠️ Kadang lebih lambat |

> **Golden rule:** Interface buat **object/public API**. Type buat **union/tuple/utility/mapped types**.

### Perbedaan Detail — extends vs intersection

```typescript
interface A { a: string }
interface B { b: number }

// Interface extends — lebih aman
interface C extends A, B { c: boolean }
// ✅ C: { a: string; b: number; c: boolean }

// Type intersection — mirip tapi beda kasus conflict
type D = A & B & { c: boolean };
// ✅ D: { a: string; b: number; c: boolean }

// Kalo ada conflict property:
interface X { val: string }
interface Y { val: number }
// interface Z extends X, Y {} // ❌ ERROR: val conflict

type Z = X & Y; // ✅ OK — tapi val jadi `never` (string & number = never)
```

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

### Exhaustive Check di Discriminated Union

```typescript
type PaymentMethod =
  | { type: "credit_card"; number: string; cvv: string }
  | { type: "bank_transfer"; bankName: string; accountNumber: string }
  | { type: "ewallet"; provider: string; phone: string };

function processPayment(method: PaymentMethod): string {
  switch (method.type) {
    case "credit_card":
      return `Kartu ${method.number.slice(-4)}`;
    case "bank_transfer":
      return `Transfer ke ${method.bankName} ${method.accountNumber}`;
    case "ewallet":
      return `${method.provider} ${method.phone}`;
    default:
      // exhaustive check — kalo ada type baru lupa ditangani, error!
      const _exhaustive: never = method;
      throw new Error(`Unknown type: ${_exhaustive}`);
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

// NonNullable — hapus null/undefined
type Maybe = string | null | undefined;
type Definite = NonNullable<Maybe>; // string
```

### Utility Types Lanjutan

```typescript
// Awaited — ambil tipe dari Promise (TS 4.5+)
type PromiseResult = Awaited<Promise<string>>; // string
type NestedResult = Awaited<Promise<Promise<number>>>; // number

// ThisParameterType — ambil tipe this dari function
function toArray(this: number, ...args: number[]) {
  return [this, ...args];
}
type ThisType = ThisParameterType<typeof toArray>; // number

// OmitThisParameter — hapus this dari function type
type NoThis = OmitThisParameter<typeof toArray>;
// (...args: number[]) => number[]

// Uppercase, Lowercase, Capitalize, Uncapitalize
type Greeting = "hello";
type Loud = Uppercase<Greeting>; // "HELLO"
type Capital = Capitalize<Greeting>; // "Hello"
```

### Implementasi Utility Types Manual (biar paham)

```typescript
// Partial manual
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Pick manual
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Readonly manual
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Record manual
type MyRecord<K extends string | number | symbol, V> = {
  [P in K]: V;
};

// Omit manual (pake Pick + Exclude)
type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Exclude manual
type MyExclude<T, U> = T extends U ? never : T;

// NonNullable manual
type MyNonNullable<T> = T extends null | undefined ? never : T;
```

### Utility Types — Use Cases Nyata

```typescript
// Form state — initial, dirty, errors
interface FormFields {
  username: string;
  email: string;
  password: string;
  age: number;
}

type FormState = {
  values: FormFields;
  errors: Partial<Record<keyof FormFields, string>>;
  touched: Record<keyof FormFields, boolean>;
  isSubmitting: boolean;
};

// API Response pattern
type ApiResponse<T> = {
  data: T;
  meta?: {
    page: number;
    total: number;
  };
};

// Event bus payloads
type EventPayloads = {
  userCreated: Pick<User, "id" | "name" | "email">;
  userDeleted: Pick<User, "id">;
  emailChanged: { userId: string; oldEmail: string; newEmail: string };
};
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

### Deep Nested dengan Type Aliases

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};

// Pake:
type ImmutableOrder = DeepReadonly<Order>;
// Semua level nested jadi readonly!

// Nullable nested
type DeepNullable<T> = {
  [K in keyof T]: T[K] extends object ? DeepNullable<T[K]> : T[K] | null;
};
```

## Branded Types — Nominal Typing Simulation

TypeScript pake **structural typing** (cocok bentuk = cocok tipe). Kadang perlu **nominal typing**:

```typescript
// Tanpa brand — dua tipe yang sama bentuknya dianggap sama
type UserId = string;
type ProductId = string;
function getUser(id: UserId) { return {}; }
getUser("abc" as ProductId); // ❌ Salah — tapi TypeScript gak error!

// Pake brand — bedain meskipun bentuk sama
type BrandedUserId = string & { __brand: "UserId" };
type BrandedProductId = string & { __brand: "ProductId" };

function createUserId(id: string): BrandedUserId {
  return id as BrandedUserId;
}

function getProduct(id: BrandedProductId) { return {}; }

const uid = createUserId("123");
// getProduct(uid); // ❌ ERROR: Type 'BrandedUserId' not assignable to 'BrandedProductId'
```

### Generic Brand

```typescript
type Brand<T, B> = T & { __brand: B };

type Email = Brand<string, "Email">;
type Phone = Brand<string, "Phone">;

function sendEmail(to: Email, message: string): void {
  console.log(`Sending to ${to}: ${message}`);
}

const email = "user@example.com" as Email;
const phone = "08123456789" as Phone;

sendEmail(email, "Hello"); // ✅ OK
// sendEmail(phone, "Hello"); // ❌ ERROR — phone bukan email!
```

### Branded Types di Entity ID

```typescript
type EntityId<T extends string> = Brand<string, T>;

type OrderId = EntityId<"Order">;
type CustomerId = EntityId<"Customer">;
type ProductId = EntityId<"Product">;

// Type-safe repositories
interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
}

interface CustomerRepository {
  findById(id: CustomerId): Promise<Customer | null>;
}

// Compile error kalo kecampur
// orderRepo.findById("abc" as CustomerId); // ❌ ERROR
```

## Recursive Types

Tipe yang refer ke dirinya sendiri:

```typescript
// Tree node recursive
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

const tree: TreeNode<number> = {
  value: 1,
  children: [
    {
      value: 2,
      children: [
        { value: 4 },
        { value: 5 },
      ],
    },
    {
      value: 3,
      children: [
        { value: 6 },
      ],
    },
  ],
};

// JSON type recursive
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

const data: JSONValue = {
  name: "Budi",
  age: 17,
  hobbies: ["coding", "gaming"],
  address: {
    city: "Jakarta",
    tags: ["rumah", "utama"],
  },
};
```

### Recursive Type — Comment Tree

```typescript
interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  replies?: Comment[];
}

function renderComments(comments: Comment[], depth = 0): string {
  return comments
    .map(comment => {
      const indent = "  ".repeat(depth);
      let html = `${indent}<div class="comment">`;
      html += `<strong>${comment.author}</strong>: ${comment.content}`;
      if (comment.replies && comment.replies.length > 0) {
        html += renderComments(comment.replies, depth + 1);
      }
      html += `</div>`;
      return html;
    })
    .join("\n");
}

// Linked list recursive
type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};

const list: LinkedList<number> = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: null,
    },
  },
};
```

## Function Type Properties

### Index Signatures untuk Object Dinamis

```typescript
// String index signature
interface StringMap {
  [key: string]: string;
}

const env: StringMap = {
  NODE_ENV: "development",
  PORT: "3000", // Harus string — number gak bisa!
};

// Number index signature (kayak array)
interface NumberMap {
  [index: number]: string;
}

const days: NumberMap = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
};

// Mix fixed + dynamic
interface Config {
  name: string;
  version: number;
  [key: string]: string | number; // Harus compatible dengan fixed
}

const cfg: Config = {
  name: "app",
  version: 1,
  customKey: "value",
  anotherNumber: 42,
};
```

### Excess Property Check

TypeScript ngecek properti tambahan yang gak didefinisikan:

```typescript
interface Person {
  name: string;
  age: number;
}

// ✅ OK
const budi: Person = { name: "Budi", age: 17 };

// ❌ ERROR: 'hobby' not in Person — excess property check!
// const andi: Person = { name: "Andi", age: 18, hobby: "coding" };

// Tapi kalo lewat variable, excess property check gak jalan:
const data = { name: "Andi", age: 18, hobby: "coding" };
const andi: Person = data; // ✅ OK — excess property check cuma buat literal
```

## Interface vs Abstract Class

```typescript
// Interface — cuma kontrak, gak ada implementasi
interface Drawable {
  draw(): void;
  resize(factor: number): void;
}

// Abstract class — bisa punya implementasi partial
abstract class Shape {
  abstract area(): number;

  describe(): string {
    return `Shape with area ${this.area()}`;
  }
}

class Circle extends Shape implements Drawable {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  draw(): void {
    console.log(`Drawing circle with radius ${this.radius}`);
  }

  resize(factor: number): void {
    this.radius *= factor;
  }
}
```

### Interface untuk Function Types

```typescript
// Interface sebagai function type
interface Comparator<T> {
  (a: T, b: T): number;
}

const sortByName: Comparator<{ name: string }> = (a, b) =>
  a.name.localeCompare(b.name);

const sortByAge: Comparator<{ age: number }> = (a, b) =>
  a.age - b.age;

// Interface sebagai constructor type
interface Constructor<T> {
  new (...args: any[]): T;
}

function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
  return new ctor(...args);
}

class MyService {
  constructor(public name: string) {}
}

const service = createInstance(MyService, "TestService");
```

### Interface dengan Generic Default

```typescript
// Generic default parameter
interface ApiConfig<T = any> {
  baseUrl: string;
  timeout: number;
  transform?: (data: any) => T;
}

const defaultConfig: ApiConfig = {
  baseUrl: "/api",
  timeout: 5000,
};

const userConfig: ApiConfig<User> = {
  baseUrl: "/api",
  timeout: 5000,
  transform: (data) => ({
    id: data.id,
    name: data.name,
    email: data.email,
  }),
};
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

6. **Branded Types** — buat branded type `OrderId` dan `CustomerId`. Bikin function `getOrder(id: OrderId)` dan `getCustomer(id: CustomerId)`. Demonstrasikan bahwa string biasa gak bisa dipake sembarangan.

7. **Declaration Merging** — buat interface `AppConfig` di 2 file terpisah (atau 2 blok): satu dengan properti `apiUrl: string`, `port: number`, satu lagi dengan `debug: boolean`, `version: string`. Bikin object yang pake semua properti.

8. **DeepReadonly** — implementasikan `DeepReadonly<T>` untuk tipe `Project` yang punya: `name: string`, `team: { members: { name: string; role: string }[]; lead: string }`. Verifikasi semua level nested jadi readonly.

9. **Index Signature** — buat type `Dictionary<T>` dengan index signature. Implementasikan class `Storage<T>` yang punya methods: `set(key: string, value: T)`, `get(key: string): T | undefined`, `keys(): string[]`. Gunakan generic.

10. **Recursive JSON** — buat type `JSONSchema` yang recursive: `{ type: "string" | "number" | "object"; properties?: Record<string, JSONSchema>; items?: JSONSchema }`. Bikin function `validate(data: JSONValue, schema: JSONSchema): boolean`.

11. **Exhaustive Check** — buat discriminated union `Transaction` dengan tipe: "transfer", "payment", "topup". Setiap tipe punya data beda. Implementasi function `processTransaction` dengan exhaustive check pake `never`.

12. **Repository Pattern** — implementasikan generic interface `Repository<T>` dengan method CRUD. Buat implementasi untuk `User` dan `Product` entities. Demonstrasikan type safety di semua operasi.
