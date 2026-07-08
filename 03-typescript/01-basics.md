# 3.1 Tipe Dasar TypeScript

## Kenapa TypeScript?

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

## Array & Tuple

```typescript
// Array — dua cara nulis
let angka: number[] = [1, 2, 3];
let nama: Array<string> = ["Budi", "Andi"];  // syntax generic

// Multi-dimensional
let matrix: number[][] = [[1, 2], [3, 4]];

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

## Latihan

1. **Tipe Dasar** — buat variable: `nama` (string), `umur` (number), `hobi` (array of strings), `profile` (tuple [nama, umur, status]). Coba assign value salah — lihat error TypeScript.
2. **Union Function** — buat function `formatInput` yang nerima `string | number`. Kalo string → uppercase, kalo number → fixed 2 desimal. Pake type narrowing.
3. **Status Machine** — buat type `OrderStatus` = "pending" | "processing" | "shipped" | "delivered" | "cancelled". Bikin function `getNextStatus(current: OrderStatus): OrderStatus` yang return status berikutnya.
4. **Generic Result** — buat type `ApiResponse<T>` dengan properti: `status` (number), `data` (T | null), `error` (string | null). Pake buat response user dan product.
5. **Enum Direction** — buat function `move(direction: "up" | "down" | "left" | "right", steps: number): string` yang return "Moving up 5 steps" dsb.
