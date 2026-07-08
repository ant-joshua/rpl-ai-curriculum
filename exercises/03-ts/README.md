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

### 26. Declaration Files — Ambient Type Declarations
Buat file deklarasi (.d.ts) untuk library JavaScript yang gak punya type sendiri.

```ts
// Starter code: types/weather-api.d.ts
declare module "weather-api" {
  export interface WeatherResponse {
    location: {
      city: string;
      country: string;
      lat: number;
      lon: number;
    };
    current: {
      temperature: number;
      condition: string;
      humidity: number;
      windSpeed: number;
      icon: string;
    };
    forecast?: Array<{
      date: string;
      tempHigh: number;
      tempLow: number;
      condition: string;
    }>;
  }

  export function getWeather(city: string): Promise<WeatherResponse>;
  export function getForecast(city: string, days: number): Promise<WeatherResponse>;
}

// usage.ts — setelah declare module, TypeScript auto kenali typing
import { getWeather } from "weather-api";

async function showWeather() {
  const data = await getWeather("Jakarta");
  console.log(`${data.location.city}: ${data.current.temperature}°C`);
}
```

### 27. Declaration Files — Augment Existing Module
Tambahkan type ke library yang sudah ada (module augmentation).

```ts
// Starter code: types/express-augment.d.ts
import "express";

// Tambah properti user ke Express Request
declare module "express" {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: "admin" | "user";
    };
    requestId?: string;
  }
}

// Sekarang req.user bisa diakses di route handler tanpa type cast
import { Request, Response } from "express";

app.get("/api/profile", (req: Request, res: Response) => {
  // req.user — sudah typed, no need to cast!
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ id: req.user.id, email: req.user.email });
});
```

### 28. Module Resolution — Path Aliases
Konfigurasi path alias di tsconfig untuk import yang lebih rapi.

```json
// tsconfig.json — configure paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@routes/*": ["src/routes/*"],
      "@services/*": ["src/services/*"],
      "@middleware/*": ["src/middleware/*"],
      "@db/*": ["src/db/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

```ts
// Test — import pake alias
import { UserService } from "@services/user.service"; // bukan ../../../services
import { authMiddleware } from "@middleware/auth";
import { db } from "@db/index";

// Jangan lupa install tsconfig-paths atau set NODE_PATH
// npm install -D tsconfig-paths
// node -r tsconfig-paths/register dist/index.js
```

### 29. Module Resolution — Barrel Export & Re-export
Buat barrel file untuk export terpusat.

```ts
// src/services/index.ts — barrel export
export { AuthService } from "./auth.service";
export { ArticleService } from "./article.service";
export { TagService } from "./tag.service";
export { AIService } from "./ai.service";
export { CacheService } from "./cache.service";

// src/middleware/index.ts
export { authenticate } from "./auth";
export { errorHandler } from "./error";
export { validate } from "./validation";
export { rateLimit } from "./rateLimit";

// Import jadi satu baris
import { AuthService, ArticleService, TagService } from "@services";
import { authenticate, errorHandler, validate } from "@middleware";

// Dynamic re-export — kondisional
export * from "./services";
export * from "./middleware";
// export { default } from "./utils/helpers";
```

### 30. Mapped Types — Deep Readonly & Nullable
Buat mapped type yang bekerja di nested object.

```ts
// Starter code
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};

type DeepNullable<T> = {
  [K in keyof T]: T[K] extends object
    ? DeepNullable<T[K]>
    : T[K] | null;
};

// Test
interface Config {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
      key: string;
    };
  };
  database: {
    url: string;
    pool: {
      min: number;
      max: number;
      timeout: number;
    };
  };
}

type ReadonlyConfig = DeepReadonly<Config>;
// Semua nested property jadi readonly

type NullableConfig = DeepNullable<Config>;
// Semua leaf property jadi T | null
```

### 31. Template Literal Types — Event System
Buat event system type-safe pakai template literal.

```ts
// Starter code
type EventName = "click" | "focus" | "blur" | "change" | "submit";
type EventPrefix = "on";
type HandlerName = `${EventPrefix}${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur" | "onChange" | "onSubmit"

// Event map dengan payload type
type EventPayload = {
  click: { x: number; y: number };
  focus: { targetId: string };
  blur: { targetId: string };
  change: { value: string; previousValue: string };
  submit: { formData: Record<string, string> };
};

type TypedEventListener = {
  [K in EventName as `on${Capitalize<K>}`]: 
    (payload: EventPayload[K]) => void;
};

// Implementasi
const listener: TypedEventListener = {
  onClick: (e) => console.log(`Clicked at ${e.x}, ${e.y}`),
  onFocus: (e) => console.log(`Focused on ${e.targetId}`),
  onChange: (e) => console.log(`Changed from ${e.previousValue} to ${e.value}`),
  onSubmit: (e) => console.log(`Submitted:`, e.formData),
  onBlur: (e) => console.log(`Blurred ${e.targetId}`),
};
```

### 32. Conditional Types — Filter & Extract Properties
Filter properti object berdasarkan tipe value.

```ts
// Starter code
// Ambil properti yang tipenya string
type StringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// Ambil properti yang tipenya number
type NumberProps<T> = {
  [K in keyof T as T[K] extends number ? K : never]: T[K];
};

// Ambil properti yang tipenya function
type FunctionProps<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updateStock(quantity: number): void;
  calculateDiscount(percent: number): number;
}

type ProductStrings = StringProps<Product>;
// { name: string; description: string; }

type ProductNumbers = NumberProps<Product>;
// { id: number; price: number; stock: number; }

type ProductFunctions = FunctionProps<Product>;
// { updateStock: (qty: number) => void; calculateDiscount: (pct: number) => number; }
```

### 33. Declaration Files — Global Types & Namespace
Buat global type declarations untuk menambahkan tipe ke window object atau library global.

```ts
// types/global.d.ts — tipe akan tersedia global tanpa import

// Extend Window interface
interface Window {
  __APP_CONFIG__: {
    apiUrl: string;
    environment: 'development' | 'staging' | 'production';
    version: string;
    sentryDsn?: string;
  };
  analytics: {
    track(event: string, data?: Record<string, unknown>): void;
    identify(userId: string, traits?: Record<string, unknown>): void;
  };
}

// Extend global scope (Node.js)
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    OPENAI_API_KEY?: string;
  }
}

// Global function
declare function formatCurrency(amount: number, locale?: string): string;

// Sekarang semua bisa diakses tanpa import
const env = process.env.NODE_ENV; // typed!
const apiUrl = window.__APP_CONFIG__.apiUrl;
formatCurrency(50000); // "Rp50.000"
```

### 34. Module Resolution — ESM vs CJS Interop
Pahami perbedaan module system dan cara interop.

```ts
// CommonJS module (cjs-lib.js)
// module.exports = { greet: (name) => `Hello ${name}` };

// ESM import (dengan default export)
import greet from 'cjs-lib'; // default interop

// namespace import
import * as cjsLib from 'cjs-lib';

// config untuk interop
// tsconfig.json
{
  "compilerOptions": {
    "module": "NodeNext", // atau "Node16"
    "moduleResolution": "NodeNext",
    "esModuleInterop": true, // default interop CJS → ESM
    "allowSyntheticDefaultImports": true
  }
}

// Conditional export di package.json
// {
//   "exports": {
//     ".": {
//       "import": "./dist/index.mjs",
//       "require": "./dist/index.cjs"
//     }
//   }
// }
```

### 35. Practical — Zod Schema from TypeScript Type
Gunakan conditional types untuk generate Zod schema type.

```ts
// Starter code
import { z } from 'zod';

// Tipe data
interface UserInput {
  username: string;
  email: string;
  age: number;
  role: 'admin' | 'user' | 'viewer';
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// TODO: Buat Zod schema yang validasi UserInput
const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  age: z.number().int().min(13).max(120),
  role: z.enum(['admin', 'user', 'viewer']),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Infer TypeScript type dari Zod schema
type UserInputFromSchema = z.infer<typeof userSchema>;
// Sama dengan UserInput di atas

// Validasi
const result = userSchema.safeParse({
  username: 'budi',
  email: 'budi@test.com',
  age: 17,
  role: 'user',
});

if (!result.success) {
  console.log(result.error.errors);
} else {
  console.log('Valid:', result.data);
}

// TODO: Buat fungsi generic yang terima Zod schema dan data
// function validate<T>(schema: z.ZodType<T>, data: unknown): T
// TODO: Implementasi partial update schema
// TODO: Custom error messages dalam Bahasa Indonesia
```

### 36. Practical — OpenAPI Schema Generation dari TypeScript
Generate OpenAPI spec dari TypeScript types untuk dokumentasi API.

```ts
// Starter code
import { z } from 'zod';

// Schema definisi
const CreateUserSchema = z.object({
  username: z.string().min(3).describe('Nama pengguna, minimal 3 karakter'),
  email: z.string().email().describe('Alamat email valid'),
  password: z.string().min(8).describe('Password minimal 8 karakter'),
  role: z.enum(['admin', 'user']).default('user').describe('Role pengguna'),
});

const UserResponseSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
  createdAt: z.string().datetime(),
});

// Type inference
type CreateUserDto = z.infer<typeof CreateUserSchema>;
type UserResponse = z.infer<typeof UserResponseSchema>;

// TODO: Generate OpenAPI JSON dari schema
function schemaToOpenApiProperty(schema: z.ZodTypeAny): object {
  // Map Zod types to OpenAPI types
  if (schema instanceof z.ZodString) return { type: 'string' };
  if (schema instanceof z.ZodNumber) return { type: 'number' };
  if (schema instanceof z.ZodBoolean) return { type: 'boolean' };
  if (schema instanceof z.ZodArray) return {
    type: 'array',
    items: schemaToOpenApiProperty(schema.element),
  };
  if (schema instanceof z.ZodEnum) return {
    type: 'string',
    enum: schema.options,
  };
  if (schema instanceof z.ZodObject) {
    const properties: Record<string, object> = {};
    const shape = schema.shape;
    for (const key in shape) {
      properties[key] = {
        ...schemaToOpenApiProperty(shape[key]),
        description: shape[key].description || key,
      };
    }
    return {
      type: 'object',
      properties,
      required: Object.keys(shape),
    };
  }
  return {};
}

// Gunakan untuk auto-generate API docs
console.log(JSON.stringify({
  openapi: '3.0.0',
  paths: {
    '/api/users': {
      post: {
        summary: 'Buat user baru',
        requestBody: {
          content: { 'application/json': { schema: schemaToOpenApiProperty(CreateUserSchema) } },
        },
        responses: {
          '201': { description: 'User created', content: { 'application/json': { schema: schemaToOpenApiProperty(UserResponseSchema) } } },
        },
      },
    },
  },
}, null, 2));
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

### 20. Template Literal Types — Event System
Buat type-safe event system pake template literal types.

```ts
// Starter code
type EventName = 'click' | 'hover' | 'focus';
type ElementType = 'button' | 'input' | 'div';

// TODO: Buat tipe `EventKey` yang gabung EventName + ElementType
// contoh: "button:click" | "button:hover" | "input:focus"

type EventKey = `${ElementType}:${EventName}`;

// TODO: Buat tipe `EventHandlerMap` — mapping EventKey ke function
type EventHandlerMap = {
  [K in EventKey]: () => void;
};

// TODO: Implement class EventBus<T extends EventName>
// - on(event: T, cb: () => void): void
// - emit(event: T): void
// - off(event: T): void
```

### 21. Declaration Files — .d.ts untuk Library
Buat declaration file untuk library JS tanpa types.

```ts
// my-math-lib.js (kamu ga kontrol file ini)
export function add(a, b) { return a + b; }
export function multiply(arr, factor) { return arr.map(x => x * factor); }

// TODO: Buat my-math-lib.d.ts dengan type declarations
// - add(a: number, b: number): number
// - multiply(arr: number[], factor: number): number[]
// - Tambah JSDoc biar muncul di IDE intellisense
```

### 22. Module Augmentation — Extend Third-Party Types
Tambah properti baru ke tipe dari library eksternal.

```ts
import 'express';

// TODO: Tambah properti `user` ke Express Request
// interface Request { user?: { id: string; role: string } }

// TODO: Buat middleware yang inject user ke request
// TODO: Akses req.user di route handler tanpa type error
```

### 23. Conditional Types — Extract/Exclude/NonNullable
```ts
// Starter code
type ApiResponse<T> = { status: 'success'; data: T } | { status: 'error'; message: string };

// TODO: Ekstrak tipe data dari ApiResponse<T> pake conditional type
type ExtractData<T> = T extends { data: infer D } ? D : never;

// TODO: Buat tipe IsString<T> — returns true jika T extends string
// TODO: Buat tipe DeepReadonly<T> — recursive readonly
// TODO: Buat tipe PickByValue<T, V> — pick keys yg valuenya extends V
```

### 24. Mapped Types — Deep Partial
```ts
// Starter code
interface Config {
  server: { host: string; port: number; ssl: boolean };
  database: { url: string; pool: number; timeout: number };
  cache: { ttl: number; redis: { host: string; port: number } };
}

// TODO: Buat DeepPartial<T> — semua properti jadi optional recursive
// TODO: Buat DeepRequired<T> — semua properti jadi required recursive
// TODO: Gunakan DeepPartial<Config> untuk update partial config
```

