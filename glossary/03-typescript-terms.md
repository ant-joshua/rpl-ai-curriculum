# 🔷 TypeScript Terms

> Istilah-istilah TypeScript — JavaScript dengan type system biar error ketahuan dari awal.

---

### Type
Jenis data yang nentuin nilai apa yang boleh disimpen. TypeScript ngecek type di compile time.

```ts
// Type annotation eksplisit
let nama: string = "Budi";
let umur: number = 20;
let isActive: boolean = true;
let random: any = "apa aja"; // any = matiin type checking (hindari!)

// Type inference — TypeScript otomatis nebak
let kota = "Jakarta"; // TypeScript tau ini string
// kota = 123; // ❌ Error: Type 'number' is not assignable to type 'string'
```

### Interface
Cara mendefinisikan bentuk (shape) suatu object di TypeScript. Bisa di-extend dan di-implement.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;         // Optional (boleh ada atau gak)
  readonly createdAt: Date; // Cuma bisa dibaca, gak bisa diubah
}

// Pake interface
function greetUser(user: User): string {
  return `Halo ${user.name} (${user.email})`;
}

const budi: User = {
  id: 1,
  name: "Budi",
  email: "budi@email.com",
  createdAt: new Date()
};
console.log(greetUser(budi)); // Output: Halo Budi (budi@email.com)
```

### Type (type alias)
Alternatif dari interface. Bisa pake union, intersection, dan tipe primitif.

```ts
// Type alias untuk primitive
type ID = string | number;

// Type untuk object
type Product = {
  id: ID;
  name: string;
  price: number;
};

// Type untuk function signature
type GreetFn = (name: string) => string;
const greet: GreetFn = (name) => `Halo ${name}`;
```

### Generic
Parameter type di TypeScript. Bikin function/class/interface type-safe tanpa specify type spesifik.

```ts
// Generic function — type ditentuin pas dipanggil
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstElement([1, 2, 3]);     // Type: number
const str = firstElement(["a", "b"]);    // Type: string

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "Budi", email: "budi@email.com", createdAt: new Date() },
  status: 200,
  message: "Success"
};
```

### Enum
Kumpulan nilai tetap / konstanta yang punya nama. Enumerasi.

```ts
enum Status {
  Pending,    // 0
  Approved,   // 1
  Rejected,   // 2
}

enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

console.log(Status.Pending);      // Output: 0
console.log(Status[1]);           // Output: "Approved" (reverse mapping)
console.log(Direction.Up);        // Output: "UP"

// Pake enum di function
function processOrder(status: Status) {
  if (status === Status.Approved) {
    console.log("Pesanan disetujui");
  }
}
```

### Union Type
Tipe data yang bisa lebih dari satu jenis. Pake operator `|`.

```ts
type Result = string | number | boolean;

function printResult(val: Result) {
  console.log(`Nilai: ${val}`);
}

printResult("sukses");   // ✅
printResult(42);         // ✅
printResult(true);       // ✅
// printResult([1,2,3]); // ❌ Error

// Union dengan literal type
type Direction2 = "left" | "right" | "up" | "down";
function move(dir: Direction2) {
  console.log(`Gerak ${dir}`);
}
move("left"); // ✅
// move("diagonal"); // ❌ Error
```

### Intersection Type
Gabungin dua tipe jadi satu. Object harus punya semua property dari kedua tipe. Pake operator `&`.

```ts
interface Person {
  name: string;
  age: number;
}

interface Employee {
  employeeId: number;
  department: string;
}

type Staff = Person & Employee;

const staff: Staff = {
  name: "Budi",
  age: 30,
  employeeId: 123,
  department: "IT"
};
// Staff harus punya name, age, employeeId, AND department
```

### Decorator
Fitur eksperimental buat nambahin behavior ke class/method/property. Sering dipake di NestJS, TypeORM.

```ts
// Decorator function — jalan pas class didefinisikan
function Log(target: any, key: string) {
  let value = target[key];
  const getter = () => {
    console.log(`GET ${key}: ${value}`);
    return value;
  };
  const setter = (next: any) => {
    console.log(`SET ${key}: ${next}`);
    value = next;
  };
  Object.defineProperty(target, key, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true,
  });
}

class User {
  @Log
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

const user = new User("Budi");
user.name;      // Console: GET name: Budi
user.name = "Sari"; // Console: SET name: Sari
```

### Module
File kode yang di-export/import. Bikin kode terorganisir dan reusable.

```ts
// --- math.ts (module) ---
export function add(a: number, b: number): number {
  return a + b;
}

export const PI = 3.14159;

export interface CalcResult {
  value: number;
  operation: string;
}

// --- main.ts (import) ---
import { add, PI, type CalcResult } from './math.js';

const result: CalcResult = {
  value: add(5, 3),
  operation: "add"
};
console.log(result); // Output: { value: 8, operation: "add" }
```

### Type Inference
TypeScript otomatis nebak tipe data tanpa harus ditulis eksplisit.

```ts
let x = 10;        // TypeScript tau ini number
let y = "hello";   // Ini string
let z = true;      // Ini boolean

// Return type otomatis
function multiply(a: number, b: number) {
  return a * b;    // TypeScript tau return type-nya number
}

// Array type inference
const items = [1, 2, 3]; // Type: number[]
```

### Type Assertion
Ngasih tau TypeScript tipe data yang lebih spesifik. Pake `as` keyword.

```ts
const someValue: unknown = "Halo, TypeScript!";

// Type assertion — kita tau lebih spesifik daripada TypeScript
const strLength = (someValue as string).length;
console.log(strLength); // Output: 18

// Atau pake angle bracket syntax (gak bisa di JSX)
const strLength2 = (<string>someValue).length;
```

### Type Guard
Function/expression yang ngecek tipe data di runtime, biar TypeScript paham narrowing.

```ts
function process(value: string | number) {
  // typeof type guard
  if (typeof value === "string") {
    // Di sini TypeScript tau value pasti string
    console.log(value.toUpperCase());
  } else {
    // Di sini value pasti number
    console.log(value.toFixed(2));
  }
}

// Custom type guard
interface Cat { meow(): void }
interface Dog { bark(): void }

function isCat(pet: Cat | Dog): pet is Cat {
  return (pet as Cat).meow !== undefined;
}
```

### Utility Types
Type bawaan TypeScript buat transformasi type umum.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

// Partial — semua property jadi optional
const partial: Partial<User> = { name: "Budi" };

// Required — semua property jadi required (termasuk age)
const full: Required<User> = { id: 1, name: "B", email: "b@e.com", age: 20 };

// Pick — ambil beberapa property
const nameOnly: Pick<User, "name" | "email"> = { name: "Budi", email: "b@e.com" };

// Omit — exclude beberapa property
const noEmail: Omit<User, "email"> = { id: 1, name: "Budi", age: 20 };

// Record — object dengan key/value tertentu
const map: Record<string, number> = { "a": 1, "b": 2 };
```

---

*Next: [04-database-terms.md](04-database-terms.md) — Istilah Database*
