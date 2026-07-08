# 📘 Latihan TypeScript — Tipe, Generics, Utility Types & Type Guards

> Kerjain latihan secara berurutan. Starter code ada di tiap soal — lengkapin bagian yang kosong.
> Semua latihan pake TypeScript strict mode. Jalanin pake `ts-node` atau `tsx`.

---

## Level 1: Basic — Type Annotations & Dasar TypeScript

### 1. Type Annotations Sederhana
Buat fungsi yang nerima nama (string) dan umur (number), trus return kalimat perkenalan.

```ts
// Starter code
function introduce(nama: ___, umur: ___): ___ {
  return `Halo, nama saya ${nama}, umur ${umur} tahun.`;
}

// Expected output
console.log(introduce("Budi", 17));
// "Halo, nama saya Budi, umur 17 tahun."
```

### 2. Array & Tuple
Buat array of students dan tuple untuk data nilai.

```ts
// Starter code
type Student = ___; // { name: string, score: number }

const students: ___ = [
  { name: "Ani", score: 85 },
  { name: "Budi", score: 92 },
];

// Tuple: [nama, nilai, lulus?]
type GradeTuple = [___, ___, ___];

const grades: GradeTuple[] = [
  ["Ani", 85, true],
  ["Budi", 45, false],
];
```

### 3. Union & Intersection Types
Buat type untuk `Admin` yang punya semua property `User` + tambahan `role`.

```ts
// Starter code
type User = { id: number; name: string; email: string };
type Admin = ___; // intersection with { role: 'admin' }

const admin: Admin = {
  id: 1,
  name: "Admin",
  email: "admin@test.com",
  role: "admin",
};

// Buat fungsi yang handle string | number
function format(input: ___): string {
  // kalo number -> "Rp. {input}"
  // kalo string -> input.toUpperCase()
}
```

### 4. Optional & Readonly Properties
Buat type untuk konfigurasi aplikasi dengan properti opsional.

```ts
// Starter code
interface AppConfig {
  apiUrl: string;
  port: ___; // optional number
  debugMode?: boolean;
  readonly version: ___; // string, gak bisa diubah
}

const config: AppConfig = {
  apiUrl: "https://api.example.com",
  version: "1.0.0",
};

config.version = "2.0.0"; // harus error!
```

### 5. Enum & Literal Types
Buat enum untuk status order dan literal type untuk kategori produk.

```ts
// Starter code
enum OrderStatus {
  Pending = "PENDING",
  Processing = "PROCESSING",
  Shipped = "SHIPPED",
  Delivered = ___,
  Cancelled = "CANCELLED",
}

type ProductCategory = ___ | ___ | ___; // "electronics" | "clothing" | "food"

interface Order {
  id: number;
  status: OrderStatus;
  items: ProductCategory[];
}

// Buat fungsi yang return warna badge berdasarkan status
function getStatusColor(status: OrderStatus): string {
  // PENDING -> yellow, SHIPPED -> blue, DELIVERED -> green, CANCELLED -> red
}
```

---

## Level 2: Intermediate — Generics & Utility Types

### 6. Generic Function — `firstElement`
Buat generic function yang ambil elemen pertama dari array.

```ts
// Starter code
function firstElement<T>(arr: ___): ___ {
  return arr[0];
}

const num = firstElement([1, 2, 3]); // tipe: number
const str = firstElement(["a", "b"]); // tipe: string
```

### 7. Generic Constraints
Buat generic yang cuma nerima object dengan property `.length`.

```ts
// Starter code
function logLength<T extends { length: number }>(item: ___): void {
  console.log(`Panjang: ${item.length}`);
}

logLength("Hello");      // 5
logLength([1, 2, 3]);    // 3
logLength({ length: 10 }); // 10
// logLength(123);        // harus error! number gak punya .length
```

### 8. Generic Interface — API Response
Buat generic wrapper buat API response.

```ts
// Starter code
interface ApiResponse<T> {
  success: ___;
  data: ___;
  message?: string;
  timestamp: ___; // number
}

// Contoh penggunaan
type UserResponse = ApiResponse<{ id: number; name: string }>;
type ProductListResponse = ApiResponse<Product[]>; // Product didefinisikan sendiri

// Expected
const response: UserResponse = {
  success: true,
  data: { id: 1, name: "Budi" },
  timestamp: Date.now(),
};
```

### 9. Generic Class — Stack
Implementasi generic Stack class (LIFO).

```ts
// Starter code
class Stack<T> {
  private items: ___ = [];

  push(item: ___): void {
    this.items.push(item);
  }

  pop(): ___ {
    return this.items.pop();
  }

  peek(): ___ {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === ___;
  }
}

// Test
const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
console.log(numStack.pop()); // 2
```

### 10. Keyof & Typeof
Gunakan `keyof` dan `typeof` untuk type-safe object access.

```ts
// Starter code
const user = {
  name: "Budi",
  age: 17,
  email: "budi@test.com",
};

type UserKeys = keyof ___; // "name" | "age" | "email"

function getProperty(obj: typeof user, key: ___): ___ {
  return obj[key];
}

console.log(getProperty(user, "name")); // "Budi"
// getProperty(user, "alamat"); // harus error!
```

### 11. Partial, Required & Pick
Gunakan TypeScript utility types untuk transformasi tipe.

```ts
// Starter code
interface Todo {
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

// Partial — semua properti opsional
function updateTodo(todo: ___, updates: ___): Todo {
  return { ...todo, ...updates };
}

// Pick — ambil properti tertentu
type TodoPreview = ___; // Pick title dan completed aja

// Required — semua properti wajib (termasuk yang tadinya optional)
type RequiredConfig = Required<{ port?: number; host?: string }>;
```

### 12. Record & Omit
Buat mapping object dengan Record dan hapus properti dengan Omit.

```ts
// Starter code
type UserRole = "admin" | "editor" | "viewer";
type RolePermissions = Record<___, string[]>;

const permissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
};

// Omit: buat type User tanpa field password
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

type PublicUser = ___; // Omit password
```

### 13. ReturnType & Parameters
Ekstrak tipe return dan parameter dari fungsi.

```ts
// Starter code
function createUser(name: string, age: number) {
  return { id: Math.random(), name, age, createdAt: new Date() };
}

type CreateUserFn = typeof ___;
type CreateUserReturn = ___; // ReturnType
type CreateUserParams = ___; // Parameters

// Gunakan untuk type-safe wrapper
async function wrapper(...args: CreateUserParams): Promise<CreateUserReturn> {
  return createUser(...args);
}
```

### 14. Conditional Types
Buat type conditional yang nentuin tipe berdasarkan input.

```ts
// Starter code
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>; // "yes"
type B = IsString<number>; // "no"

// ExtractArrayType: ambil tipe elemen array
type ExtractArrayType<T> = T extends (infer U)[] ? ___ : never;

type C = ExtractArrayType<string[]>; // string
type D = ExtractArrayType<number[]>; // number
type E = ExtractArrayType<boolean>;  // never
```

### 15. Template Literal Types
Buat tipe dari template literal untuk event handler.

```ts
// Starter code
type EventName = "click" | "focus" | "blur";
type HandlerName = `on${Capitalize<___>}`;
// HandlerName = "onClick" | "onFocus" | "onBlur"

type EventHandler = {
  [K in HandlerName]: (event: Event) => void;
};

// Implementasi
const handler: EventHandler = {
  onClick: (e) => console.log("clicked", e),
  onFocus: (e) => console.log("focused"),
  onBlur: (e) => console.log("blurred"),
};
```

---

## Level 3: Advanced — Type Guards, Mapped Types & Advanced Patterns

### 16. User-Defined Type Guards
Buat type guard untuk ngecek tipe di runtime.

```ts
// Starter code
interface Cat { meow(): void; }
interface Dog { bark(): void; }

type Animal = Cat | Dog;

function isCat(animal: ___): animal is ___ {
  return "meow" in animal;
}

function makeSound(animal: Animal) {
  if (isCat(animal)) {
    animal.meow();
  } else {
    animal.bark();
  }
}
```

### 17. Discriminated Unions
Gunakan discriminated union untuk handling berbagai bentuk data.

```ts
// Starter code
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
      return ___; // 0.5 * base * height
  }
}
```

### 18. Mapped Types — Readonly & Nullable
Buat mapped type sendiri untuk transformasi tipe.

```ts
// Starter code
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type MyNullable<T> = {
  [K in keyof T]: ___ | null;
};

interface Person {
  name: string;
  age: number;
  email: string;
}

type ReadonlyPerson = MyReadonly<Person>;
type NullablePerson = MyNullable<Person>;

// Test: coba ubah property ReadonlyPerson — harus error
const person: ReadonlyPerson = { name: "Budi", age: 17, email: "b@t.com" };
// person.name = "Andi"; // ❌ Error!
```

### 19. Branded Types — Nominal Typing
Simulasi nominal type di TypeScript pake brand.

```ts
// Starter code
type Brand<T, B> = T & { __brand: B };

type UserId = Brand<number, "UserId">;
type PostId = Brand<number, "PostId">;

function getUser(id: UserId): void {
  console.log(`Get user ${id}`);
}

function getPost(id: PostId): void {
  console.log(`Get post ${id}`);
}

const uid = 1 as UserId;
const pid = 2 as PostId;

getUser(uid);
getPost(pid);
// getUser(pid); // ❌ Error! Type 'PostId' is not assignable to type 'UserId'
// getUser(1);   // ❌ Error! number not assignable to UserId
```

### 20. Builder Pattern with Generics
Implementasi Builder Pattern type-safe pake generic chaining.

```ts
// Starter code
class QueryBuilder<T extends Record<string, any>> {
  private conditions: string[] = [];
  private orderField?: keyof T;
  private limitCount?: number;

  where<K extends keyof T>(field: ___, value: T[K]): this {
    this.conditions.push(`${String(field)} = ${value}`);
    return this;
  }

  orderBy(field: ___): this {
    this.orderField = field;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  build(): string {
    let query = "SELECT * FROM table";
    if (this.conditions.length) {
      query += ` WHERE ${this.conditions.join(" AND ")}`;
    }
    if (this.orderField) {
      query += ` ORDER BY ${String(this.orderField)}`;
    }
    if (this.limitCount) {
      query += ` LIMIT ${this.limitCount}`;
    }
    return query;
  }
}

// Test
interface User { id: number; name: string; email: string; age: number; }

const query = new QueryBuilder<User>()
  .where("age", 17)
  .where("name", "Budi")
  .orderBy("id")
  .limit(10)
  .build();
```

### 21. Deep Partial — Recursive Conditional Types
Buat utility type yang bikin semua nested properti jadi optional.

```ts
// Starter code
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? ___ : T[K];
};

interface NestedConfig {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  database: {
    url: string;
    pool: number;
  };
}

type PartialConfig = DeepPartial<NestedConfig>;

// Test — semua level jadi optional
const config: PartialConfig = {
  server: {
    ssl: { enabled: true }, // partial di semua level
  },
};
```

### 22. Function Overloading — Type-Safe Event Emitter
Buat fungsi overload untuk event emitter yang type-safe.

```ts
// Starter code
interface EventMap {
  "user:created": { id: number; name: string };
  "user:deleted": { id: number };
  "order:placed": { orderId: number; amount: number };
  "error": { message: string; code: number };
}

function emit<E extends keyof EventMap>(event: E, payload: ___): void;
function emit<E extends keyof EventMap>(event: E, payload: EventMap[E]): void {
  console.log(`[${event}]`, payload);
}

emit("user:created", { id: 1, name: "Budi" });
emit("error", { message: "Not found", code: 404 });
// emit("user:created", { id: 1 }); // ❌ Error! missing name
// emit("unknown", {}); // ❌ Error!
```

### 23. Flatten Type — Recursive Object Flatten
Buat type yang flatten object bersarang jadi dot-notation keys.

```ts
// Starter code
type Flatten<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? Flatten<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

interface Settings {
  app: {
    name: string;
    version: string;
  };
  ui: {
    theme: "light" | "dark";
    fontSize: number;
  };
}

// Flatten<Settings> = "app.name" | "app.version" | "ui.theme" | "ui.fontSize"
type SettingKey = Flatten<Settings>;
```

### 24. Tuple to Union — Advanced Inference
Konversi tuple type ke union type.

```ts
// Starter code
type TupleToUnion<T extends any[]> = T[number];

type Colors = ["red", "green", "blue"];
type Color = TupleToUnion<Colors>; // "red" | "green" | "blue"

// UnionToIntersection — kebalikan
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type A = { a: string } | { b: number };
type Intersected = UnionToIntersection<A>; // { a: string } & { b: number }
```

### 25. Async Wrapper — Type-Safe Error Handling
Implementasi wrapper async yang return tuple [error, data] type-safe.

```ts
// Starter code
type AsyncResult<T, E = Error> = Promise<[___, ___] | [null, T]>;

async function safeAsync<T, E = Error>(
  promise: Promise<T>
): AsyncResult<T, E> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error as E, null as T];
  }
}

// Usage
const [err, user] = await safeAsync<{ id: number }>(
  fetch("/api/user").then(r => r.json())
);
// err: Error | null, user: { id: number } | null — fully typed!
```

---

## 🧪 Cara Jalanin

```bash
# Install
npm install -g typescript tsx

# Run specific exercise
tsx exercises/03-ts/exercise-01.ts

# Atau compile + run
tsc exercises/03-ts/exercise-01.ts --strict
node exercises/03-ts/exercise-01.js
```

> Semua exercise wajib pake `strict: true` di tsconfig. No `any`!
