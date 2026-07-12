<img src="https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="TypeScript" style="width:100%;border-radius:12px;margin:12px 0;">

# 1. Dasar TypeScript

TypeScript = JavaScript + **static types**. Error ketangkep **pas ngetik** (compile time), bukan pas jalan (runtime).

```typescript
// JavaScript — error baru kelihatan pas diaplikasi jalan
function add(a, b) { return a + b; }
console.log(add("5", 10)); // "510" — bug yang sunyi!

// TypeScript — error langsung kelihatan di editor
function add(a: number, b: number): number { return a + b; }
console.log(add("5", 10)); // ❌ ERROR: Argument of type 'string' not assignable
```

**Manfaat TypeScript di dunia nyata:**

| Masalah | JavaScript | TypeScript |
|---------|-----------|------------|
| Typo property object | Runtime error | Compile error |
| Penelepon function lupa parameter | Undefined behavior | Error langsung |
| Refaktor ganti nama field | Manual cari semua | Auto-detect semua referensi |
| Autocomplete | Ga ada / asal nebak | Tepat dari tipe |
| Dokumentasi | JSDoc (tapi ga di-enforce) | Types sebagai dokumentasi nyata |

### TypeScript vs JavaScript — Studi Kasus Refactor

Bayangin lo punya kode JavaScript dengan object user dipake di 50 file. Tiba-tiba tim decide rename field `username` jadi `loginName`:

```javascript
// JavaScript — pake Ctrl+Shift+F, hope for the best
const user = { username: "budi123", email: "budi@mail.com" };
console.log(user.username); // Kalo kelewat ganti? Bug sunyi.
```

```typescript
// TypeScript — rename symbol, semua keupdate otomatis
interface User { username: string; email: string; }
const user: User = { username: "budi123", email: "budi@mail.com" };
// Refaktor: ganti username → loginName
// Semua referensi ke username otomatis error sampe diganti
```

Ini yang bikin TypeScript indispensable buat codebase besar. Refaktor yang di JS butuh 3 hari dan testing manual, di TS butuh 5 menit.

## Setup Project TypeScript

```bash
# Install TypeScript
npm install -g typescript
# atau kalo pake project:
npm install --save-dev typescript

# Bikin tsconfig.json
npx tsc --init

# Compile .ts ke .js
npx tsc              # Compile semua
npx tsc file.ts      # Compile satu file

# Watch mode (auto recompile pas ada perubahan)
npx tsc --watch
```

**`tsconfig.json` minimal:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Kenapa Strict Mode Wajib?

Tanpa `strict: true`, TypeScript jadi JavaScript dengan autocomplete dikit — type checking longgar, null bisa masuk sembarangan. Selalu aktifin strict mode di project baru.

## Tipe Dasar

```typescript
// Tipe primitif
let nama: string = "Budi";
let umur: number = 17;
let tinggi: number = 168.5;  // float sama number
let isActive: boolean = true;
let besarSekali: bigint = 9007199254740991n;

// Tipe spesial
let kosong: null = null;
let belumDiisi: undefined = undefined;

// JANGAN PAKE any — ini matiin type checking
let bebas: any = "apa aja";
bebas = 42;
bebas = true;
bebas.nemu(); // Ga error — bahaya!

// PAKE unknown kalo beneran gak tau tipenya
let aman: unknown = "string";
aman = 42;
// console.log(aman.toUpperCase()); // ERROR: harus di-check dulu
if (typeof aman === "string") {
  console.log(aman.toUpperCase()); // OK — udah di-validasi
}

// never — function yang ga pernah return
function throwError(msg: string): never {
  throw new Error(msg);
}

// void — function yang ga return apa-apa
function log(msg: string): void {
  console.log(msg);
}
```

### Bigint — Kapan Pake?

```typescript
// Number punya batas: MAX_SAFE_INTEGER = 9007199254740991
const besar: number = 9007199254740992;
console.log(besar === besar + 1); // true! — karena overflow

// Bigint aman buat angka raksasa
const amanBesar: bigint = 9007199254740992n;
console.log(amanBesar === amanBesar + 1n); // false ✅
```

Bigint dipake buat kriptografi, blockchain, financial apps dengan presisi tinggi. Tapi gak bisa dicampur langsung dengan number — error TypeScript.

## Type Inference — Otomatis Deteksi

Lo ga **harus** nulis tipe setiap saat. TypeScript otomatis nebak:

```typescript
let nama = "Budi";       // TypeScript tau ini string
let umur = 17;           // number
let isActive = true;     // boolean

// nama = 42;  // ❌ ERROR: Type 'number' not assignable to type 'string'

// Return type juga di-infer
function add(a: number, b: number) {
  return a + b;
}
// TypeScript tau return-nya number

// Beda inference buat const
const konstanta = "hello";  // Tipe: "hello" (literal type), bukan string
let variable = "hello";     // Tipe: string
```

### Contextual Typing

TypeScript juga nebak tipe dari konteks:

```typescript
// TypeScript tau parameter e adalah MouseEvent dari konteks
document.addEventListener("click", function(e) {
  console.log(e.clientX); // ✅ TypeScript tau MouseEvent punya clientX
});

// Arrow function juga
const names = ["Budi", "Ani", "Citra"];
names.forEach((name, index) => {
  // name: string, index: number — otomatis!
  console.log(`${index}: ${name.toUpperCase()}`);
});
```

Ini disebut **contextual typing** — TypeScript pake konteks sekitar buat infer tipe tanpa lo harus nulis annotation.

## Array & Tuple

```typescript
// Array — dua cara nulis
let angka: number[] = [1, 2, 3];
let nama: Array<string> = ["Budi", "Andi"];  // syntax generic

// Multi-dimensional
let matrix: number[][] = [[1, 2], [3, 4]];
let tensor: number[][][] = [[[1, 2]], [[3, 4]]]; // 3 dimensi

// Array method tetep aman
const doubled = angka.map(n => n * 2);   // number[]
const filtered = angka.filter(n => n > 1); // number[]
angka.push(4);  // OK
// angka.push("5");  // ❌ ERROR: string ga bisa masuk number[]

// Tuple — array dengan panjang & tipe tetap
let siswa: [string, number, boolean] = ["Budi", 17, true];
console.log(siswa[0]); // string: "Budi"
console.log(siswa[1]); // number: 17

// Tuple dengan rest
let header: [string, ...number[]] = ["Header", 1, 2, 3, 4];

// Tuple labeled (TS 4.0+)
type Range = [start: number, end: number];
let range: Range = [0, 100];

// Readonly tuple
const point: readonly [number, number] = [10, 20];
// point[0] = 5;  // ❌ ERROR: readonly
```

### Array Method yang Type-Safe

```typescript
// reduce — tipe accumulator bisa beda
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
// sum: number — otomatis

// reduce dengan tipe kompleks
type Grouped = Record<string, number[]>;
const grouped = numbers.reduce<Grouped>((acc, n) => {
  const key = n % 2 === 0 ? "genap" : "ganjil";
  acc[key] = [...(acc[key] || []), n];
  return acc;
}, {});

// flatMap — map + flat sekaligus
const sentences = ["Halo dunia", "Belajar TypeScript"];
const words = sentences.flatMap(s => s.split(" "));
// words: string[] — ["Halo", "dunia", "Belajar", "TypeScript"]
```

## Union & Intersection Types

```typescript
// Union — bisa salah satu
let id: string | number;
id = "ABC123";  // OK
id = 123;       // OK
// id = true;   // ❌ ERROR

// Union in function
function formatId(id: string | number): string {
  return `ID: ${id}`;
}

// Union dengan type narrowing
function display(value: string | number): string {
  if (typeof value === "string") {
    // TypeScript tau: di sini value pasti string
    return `String: ${value.toUpperCase()}`;
  }
  // Di sini value pasti number
  return `Number: ${value.toFixed(2)}`;
}

// Intersection — gabungin dua tipe
interface HasName { name: string }
interface HasAge { age: number }

type Person = HasName & HasAge;
const budi: Person = { name: "Budi", age: 17 };
```

### Union dengan Tipe Kompleks

```typescript
type ApiConfig = 
  | { mode: "development"; apiUrl: string; debug: boolean }
  | { mode: "production"; apiUrl: string; replicas: number; region: string }
  | { mode: "test"; mockData: boolean };

function setupApp(config: ApiConfig) {
  // narrowing by discriminant
  if (config.mode === "development") {
    console.log(config.debug); // ✅ aman — cuma ada di dev mode
  }
  if (config.mode === "production") {
    console.log(`Deploying to ${config.region} with ${config.replicas} replicas`);
  }
}
```

## Literal Types

Batasin value ke **nilai tertentu**, bukan cuma tipe:

```typescript
let warna: "merah" | "hijau" | "biru";
warna = "merah";  // OK
// warna = "kuning"; // ❌ ERROR

type Status = "pending" | "success" | "error";
let status: Status = "pending";

// Numeric literal
type Port = 3000 | 8080 | 443;

// Boolean literal
type Result = true | false;

// Real use: discriminated union
type Action = 
  | { type: "LOADING" }
  | { type: "SUCCESS"; data: string[] }
  | { type: "ERROR"; message: string };
```

### Literal Type di Configuration

```typescript
type Environment = "development" | "staging" | "production";
type LogLevel = "debug" | "info" | "warn" | "error";

interface AppConfig {
  env: Environment;
  logLevel: LogLevel;
  port: Port;
}

const config: AppConfig = {
  env: "development",
  logLevel: "debug",
  port: 3000,
};
// config.env = "testing"; // ❌ ERROR — "testing" gak ada di literal union
```

Ini mencegah typo dan nge-enforce cuma value yang valid — gak perlu runtime validation tambahan.

## Type Aliases — Nama Kustom

```typescript
type ID = string | number;
type Point = { x: number; y: number };
type Callback = (data: string) => void;

let userId: ID = "user_001";
let pos: Point = { x: 10, y: 20 };
let handler: Callback = (data) => console.log(data);

// Generic type alias
type Result<T> = { success: true; data: T } | { success: false; error: string };

// Pake:
let userResult: Result<{ name: string }> = {
  success: true,
  data: { name: "Budi" }
};
```

## Enum — Kumpulan Konstanta Bernama

```typescript
// Numeric enum (default mulai 0)
enum Direction {
  Up,     // 0
  Down,   // 1
  Left,   // 2
  Right   // 3
}
console.log(Direction.Up);    // 0
console.log(Direction[0]);    // "Up" (reverse mapping)

// String enum
enum HttpStatus {
  OK = "OK",
  NOT_FOUND = "NOT_FOUND",
  ERROR = "ERROR"
}

// Const enum (zero overhead — di-compile jadi value langsung)
const enum Color {
  Red, Green, Blue
}
// Di runtime jadi: const color = 0 (bukan object enum)
```

### Enum vs Union — Kapan Pake Mana?

```typescript
// Kasus 1: Enum — kalo butuh reverse mapping atau nilai numerik
enum Role {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST",
}
function checkAccess(role: Role): boolean {
  return role === Role.Admin;
}

// Kasus 2: Union — lebih ringan, gak ada runtime overhead
type Role2 = "admin" | "user" | "guest";
function checkAccess2(role: Role2): boolean {
  return role === "admin";
}
```

**Rekomendasi:** Pake union/types untuk большинства kasus. Pake enum kalo butuh reverse mapping, iterasi, atau numeric values.

## Type Guards — Narrowing Lanjutan

Type narrowing = mempersempit tipe di dalam blok kode.

### typeof Guard

```typescript
function process(value: string | number | boolean): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value ? "true" : "false"; // boolean
}
```

### instanceof Guard

```typescript
class ApiError {
  constructor(public status: number, public message: string) {}
}
class NetworkError {
  constructor(public code: string, public message: string) {}
}

function handleError(err: ApiError | NetworkError): string {
  if (err instanceof ApiError) {
    return `API Error ${err.status}: ${err.message}`;
  }
  return `Network Error ${err.code}: ${err.message}`;
}
```

### in Operator Guard

```typescript
interface Bird { fly(): void; layEggs(): void; }
interface Fish { swim(): void; layEggs(): void; }

function move(animal: Bird | Fish): void {
  // Cek properti yang unik
  if ("fly" in animal) {
    animal.fly(); // TypeScript tau ini Bird
  } else {
    animal.swim(); // TypeScript tau ini Fish
  }
}
```

### Custom Type Guard — `is`

Kadang typeof/instanceof gak cukup. Bikin function yang return `value is Type`:

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
}

interface Order {
  orderId: string;
  items: Product[];
  total: number;
}

// Custom type guard
function isProduct(item: Product | Order): item is Product {
  return "price" in item && typeof (item as Product).price === "number";
}

function describe(item: Product | Order): string {
  if (isProduct(item)) {
    // TypeScript tau item adalah Product
    return `Produk: ${item.name} — Rp${item.price}`;
  }
  return `Pesanan #${item.orderId}: ${item.items.length} item`;
}
```

### Assertion Function

TypeScript 3.7+ punya **assertion functions** — function yang throw kalo kondisi gak terpenuhi:

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Value harus string!");
  }
}

function processInput(input: unknown): string {
  assertIsString(input);
  // Sekarang input pasti string — TypeScript tau
  return input.toUpperCase();
}

// Assertion dengan kondisi
function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function divide(a: number, b: number): number {
  assert(b !== 0, "Pembagi tidak boleh 0!");
  return a / b;
}
```

### Type Guard Array — Filter Type-Safe

```typescript
// filter(Boolean) — sering dipake tapi type-nya kurang tepat
const mixed: (string | null | undefined)[] = ["a", null, "b", undefined];
const filtered = mixed.filter(Boolean);
// Tipe: (string | null | undefined)[] — masih includes null/undefined!

// Type guard di filter — bener
function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
const benar = mixed.filter(isDefined);
// Tipe: string[] ✅ — null/undefined terfilter!

// Generic isNotNull
function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
```

## satisfies Operator (TS 4.9+)

`satisfies` ngecek kalo value cocok sama tipe TANPA mengubah tipe inferred:

```typescript
// Tanpa satisfies — tipe jadi string[]
const warna1 = ["merah", "hijau", "biru"];
// warna1.map(w => w.) // autocomplete string methods ✅

// Kalo dikasih type annotation — tipe jadi string[] tapi kehilangan literal
const warna2: string[] = ["merah", "hijau", "biru"];
// warna2.push("kuning") // OK

// Pake satisfies — tipe tetap literal, tapi divalidasi
const warna3 = ["merah", "hijau", "biru"] satisfies string[];
// warna3.push(123) // ❌ ERROR: number not assignable to string
```

Contoh lebih real:

```typescript
type Color = "merah" | "hijau" | "biru";

// Tanpa satisfies — properti bisa value ilegal
const palette1: Record<string, Color> = {
  primary: "merah",
  secondary: "hijau",
  // tertiary: "kuning", // ❌ ERROR (kalo dicoba)
};

// Pake satisfies — validasi + type narrowing
const palette2 = {
  primary: "merah",
  secondary: "hijau",
  accent: "biru",
} satisfies Record<string, Color>;

// TypeScript tau tiap properti adalah literal specific
// palette2.primary — type: "merah" (bukan Color)
```

### satisfies di Real Code

```typescript
// Config object — mau validasi shape tapi tetap pake literal type
type EnvVar = string | number | boolean;

const env = {
  NODE_ENV: "development",
  PORT: 3000,
  DEBUG: true,
  API_URL: "http://localhost:3000",
} satisfies Record<string, EnvVar>;

// env.NODE_ENV — tipe: "development" (bukan string)
// env.PORT — tipe: 3000 (bukan number)
// Tapi kalo ada value ilegal, error:
// const bad = { SECRET: Symbol() } satisfies Record<string, EnvVar>;
// ❌ ERROR: Symbol not assignable to EnvVar
```

## Mapped Types — Transformasi Tipe

Mapped types = bikin tipe baru dengan ngiterasi properti dari tipe lain:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Bikin semua properti jadi readonly
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
  // { readonly id: string; readonly name: string; ... }
};

// Bikin semua properti jadi optional
type OptionalUser = {
  [K in keyof User]?: User[K];
  // { id?: string; name?: string; ... }
};

// Bikin semua nilai jadi string
type StringifyUser = {
  [K in keyof User]: string;
  // { id: string; name: string; email: string; age: string }
};

// Mapping dengan modifier
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
  // Hapus readonly
};

type Required<T> = {
  [K in keyof T]-?: T[K];
  // Hapus optional
};
```

### Mapped Types — Filter & Transform Keys

```typescript
// Filter keys dengan conditional
type Methods<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

interface Service {
  start(): void;
  stop(): void;
  name: string;
  port: number;
}

type ServiceMethods = Methods<Service>;
// { start: () => void; stop: () => void }

// Rename keys dengan template literal
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
```

### Mapped Types dengan Template Literal (TS 4.1+)

```typescript
interface Person {
  name: string;
  age: number;
  email: string;
}

// Bikin getter methods otomatis
type Getters = {
  [K in keyof Person as `get${Capitalize<string & K>}`]: () => Person[K];
};
// { getName: () => string; getAge: () => number; getEmail: () => string }

// Filter keys dengan kondisional
type Methods<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

interface Service {
  start(): void;
  stop(): void;
  name: string;
  port: number;
}

type ServiceMethods = Methods<Service>;
// { start: () => void; stop: () => void }
```

## Conditional Types — Tipe yang Bergantung Kondisi

Conditional types = ternary operator buat tipe:

```typescript
// Syntax: T extends U ? X : Y

type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<42>;      // false

// Conditional dengan infer
type ElementType<T> = T extends (infer U)[] ? U : T;
type C = ElementType<string[]>; // string
type D = ElementType<number>;   // number (not array)

// Function return type
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
type E = ReturnOf<() => string>; // string
type F = ReturnOf<(x: number) => boolean>; // boolean

// Distributed conditional types
type ToArray<T> = T extends any ? T[] : never;
type G = ToArray<string | number>;
// string[] | number[] (bukan (string | number)[])
```

### Conditional Types Praktis

```typescript
// Extract nullable fields
type NullableKeys<T> = {
  [K in keyof T]: T[K] extends null | undefined ? K : never;
}[keyof T];

interface Config {
  name: string;
  timeout?: number | null;
  retries: number | null;
  debug: boolean;
}

type NullableConfigKeys = NullableKeys<Config>;
// "timeout" | "retries"

// Deep partial — recursive conditional
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface DeepUser {
  name: string;
  address: {
    street: string;
    city: string;
    geo: { lat: number; lng: number };
  };
}

type PartialDeepUser = DeepPartial<DeepUser>;
// Semua level jadi optional
```

### Conditional Types — Extract Types by Condition

```typescript
// Extract keys by value type
type PickByType<T, Type> = {
  [K in keyof T as T[K] extends Type ? K : never]: T[K];
};

interface Entity {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

type StringFields = PickByType<Entity, string>;
// { name: string }
type DateFields = PickByType<Entity, Date>;
// { createdAt: Date; updatedAt: Date }

// Exclude null/undefined keys
type NonNullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? never
    : undefined extends T[K] ? never
    : K;
}[keyof T];

interface FormData {
  name: string;
  email: string | null;
  phone?: string;
  age: number;
}

type RequiredFormKeys = NonNullableKeys<FormData>;
// "name" | "age"
```

## Template Literal Types (TS 4.1+)

Gabungin literal types pake template literal syntax:

```typescript
type EventName = "click" | "focus" | "blur";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"

// Kombinasi
type Vertical = "top" | "bottom";
type Horizontal = "left" | "right";
type Position = `${Vertical}-${Horizontal}`;
// "top-left" | "top-right" | "bottom-left" | "bottom-right"

// String manipulation helpers
type Greeting = "hello";
type LoudGreeting = Uppercase<Greeting>;     // "HELLO"
type QuietGreeting = Lowercase<LoudGreeting>; // "hello"
type CapitalGreeting = Capitalize<Greeting>;  // "Hello"
type Uncap = Uncapitalize<"World">;           // "world"

// Practical: API endpoint types
type Resource = "users" | "products" | "orders";
type Operation = "list" | "get" | "create" | "update" | "delete";
type ApiEndpoint = `${Operation}${Capitalize<Resource>}`;
// "listUsers" | "getUsers" | "createUsers" | ... | "deleteOrders"

// Dengan params
type ApiPath<T extends string> = `/api/v1/${T}`;
type UserPath = ApiPath<"users">; // "/api/v1/users"
type ProductPath = ApiPath<"products">; // "/api/v1/products"
```

## const Assertions

`as const` bikin inferred type jadi paling literal dan readonly:

```typescript
// Tanpa as const
const colors = ["merah", "hijau", "biru"];
// Tipe: string[]

// Dengan as const
const colorsConst = ["merah", "hijau", "biru"] as const;
// Tipe: readonly ["merah", "hijau", "biru"]

// Objek dengan as const
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
} as const;
// Tipe: { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000; readonly retries: 3 }
// Setiap properti jadi literal type, bukan string/number

// Enum alternative dengan as const
export const Direction = {
  Up: "UP",
  Down: "DOWN",
  Left: "LEFT",
  Right: "RIGHT",
} as const;
type Direction = (typeof Direction)[keyof typeof Direction];
// "UP" | "DOWN" | "LEFT" | "RIGHT"
```

### as const di React Patterns

```typescript
// Action types untuk Reducer — type-safe
export const ActionTypes = {
  ADD_TODO: "ADD_TODO",
  TOGGLE_TODO: "TOGGLE_TODO",
  DELETE_TODO: "DELETE_TODO",
} as const;

type ActionType = (typeof ActionTypes)[keyof typeof ActionTypes];
// "ADD_TODO" | "TOGGLE_TODO" | "DELETE_TODO"

// Generic function untuk bikin action creator
function createAction<T extends ActionType>(type: T, payload?: any) {
  return { type, payload } as const;
}
```

## Index Signatures

Buat object dengan properti dinamis:

```typescript
// Index signature — key string, value number
interface NumberDictionary {
  [key: string]: number;
}

const scores: NumberDictionary = {
  budi: 85,
  ani: 92,
  citra: 78,
};

// Mixed dengan fixed properties
interface StudentGrades {
  name: string;
  [subject: string]: string | number; // Index signature harus cocok dengan fixed
}

const rapor: StudentGrades = {
  name: "Budi",
  matematika: 85,
  bahasaIndonesia: 90,
  ipa: 88,
};

// keyof dengan index
type DictionaryValues<T> = T extends Record<string, infer V> ? V : never;
type ScoreValue = DictionaryValues<NumberDictionary>; // number
```

### Template Literal + Index Signature

```typescript
// Event map dengan pattern
type EventMap = {
  [K in `on${Capitalize<string>}`]: (...args: any[]) => void;
};

// CSS custom properties
type CSSVariables = {
  [K in `--${string}`]: string;
};

const theme: CSSVariables = {
  "--primary-color": "#3498db",
  "--secondary-color": "#2ecc71",
  "--font-size": "16px",
};
```

## Type Queries — keyof, typeof

```typescript
// keyof — ambil keys jadi union
interface Person {
  name: string;
  age: number;
  email: string;
}
type PersonKeys = keyof Person; // "name" | "age" | "email"

// typeof — ambil tipe dari value runtime
const person = { name: "Budi", age: 17 };
type PersonType = typeof person;
// { name: string; age: number }

// indexed access type
type PersonNameType = Person["name"]; // string
type PersonProperties = Person["name" | "email"]; // string
type PersonAllValues = Person[keyof Person]; // string | number

// Generic indexed access
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const nama = getProperty(person, "name"); // string
```

## Utility Types — Daftar Lengkap

TypeScript punya utility types built-in yang ngelakuin transformasi tipe umum:

| Utility | Fungsi | Contoh |
|---------|--------|--------|
| `Partial<T>` | Semua properti optional | `Partial<User>` |
| `Required<T>` | Semua properti required | `Required<Config>` |
| `Readonly<T>` | Semua properti readonly | `Readonly<State>` |
| `Pick<T, K>` | Ambil subset keys | `Pick<User, "id" | "name">` |
| `Omit<T, K>` | Kecualikan keys | `Omit<User, "password">` |
| `Record<K, V>` | Object dengan key-value pattern | `Record<string, User>` |
| `Exclude<T, U>` | Hapus tipe dari union | `Exclude<Status, "error">` |
| `Extract<T, U>` | Ambil tipe tertentu dari union | `Extract<Status, "success" | "error">` |
| `NonNullable<T>` | Hapus null/undefined | `NonNullable<string \| null>` |
| `ReturnType<T>` | Ambil return type function | `ReturnType<typeof fn>` |
| `Parameters<T>` | Ambil parameter types | `Parameters<typeof fn>` |
| `Awaited<T>` | Unwrap Promise | `Awaited<Promise<string>>` |

### Implementasi Manual Utility Types

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

// Exclude manual
type MyExclude<T, U> = T extends U ? never : T;

// Extract manual
type MyExtract<T, U> = T extends U ? T : never;
```

## Latihan

1. **Tipe Dasar** — buat variable: `nama` (string), `umur` (number), `hobi` (array of strings), `profile` (tuple [nama, umur, status]). Coba assign value salah — lihat error TypeScript.

2. **Union Function** — buat function `formatInput` yang nerima `string | number`. Kalo string → uppercase, kalo number → fixed 2 desimal. Pake type narrowing.

3. **Status Machine** — buat type `OrderStatus` = "pending" | "processing" | "shipped" | "delivered" | "cancelled". Bikin function `getNextStatus(current: OrderStatus): OrderStatus` yang return status berikutnya.

4. **Generic Result** — buat type `ApiResponse<T>` dengan properti: `status` (number), `data` (T | null), `error` (string | null). Pake buat response user dan product.

5. **Enum Direction** — buat function `move(direction: "up" | "down" | "left" | "right", steps: number): string` yang return "Moving up 5 steps" dsb.

6. **Custom Type Guard** — buat interface `Car` (brand, fuelType) dan `Motorcycle` (brand, hasSidecar). Bikin custom type guard `isCar(vehicle: Car | Motorcycle): vehicle is Car`. Implementasi function `describeVehicle` yang pake guard tersebut.

7. **Mapped Types Practice** — dari interface `Employee` (id, name, salary, department, startDate), buat:
   - `ReadonlyEmployee` — semua field readonly pake mapped type manual
   - `NullableEmployee` — semua field jadi `T | null`
   - `StringifyEmployee` — semua field jadi string
   - `EmployeeGetters` — mapped dengan template literal: `getId`, `getName`, dll

8. **Conditional Types** — buat type `ExtractPropsByType<T, U>` yang extract keys dari T yang valuenya extends U. Contoh: `ExtractPropsByType<{ a: string; b: number; c: string }, string>` → "a" | "c".

9. **Template Literal API** — buat type `ApiEndpoint<Resource>` yang generate endpoint path seperti `/api/v1/users`, `/api/v1/products`. Implementasi function `createEndpoint` dengan generic constraint.

10. **satisfies Operator** — buat object `theme` dengan properti colors (Record<string, string>) dan spacing (Record<string, number>). Pake `satisfies` biar TypeScript validasi tanpa mengubah tipe literal value.

11. **Assertion Function** — buat function `assertDefined<T>(value: T | null | undefined): asserts value is T`. Implementasi function `processUser` yang nerima `User | null`, panggil assertion, terus akses properti user tanpa optional chaining.

12. **Index Signature Map** — buat type `SafeObject<T>` dengan index signature dan method `get<K extends string>(key: K): T | undefined`. Implementasi class `EventBus` yang pake pattern ini untuk type-safe event handling.
