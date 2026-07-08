# 3.3 Functions & Generics — Type-Safe Functions

## Function Types

TypeScript nge-enforce tipe parameter dan return value — error kesedot sebelum runtime.

```typescript
// Basic function
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Void — ga return apa-apa
function logMessage(msg: string): void {
  console.log(msg);
}

// Never — ga pernah return (error / infinite loop)
function throwError(msg: string): never {
  throw new Error(msg);
}

// Function type signature — simpen tipe fungsi di variable
type MathOp = (a: number, b: number) => number;

const add2: MathOp = (x, y) => x + y;
const multiply2: MathOp = (x, y) => x * y;

// Function callback
function calculate(a: number, b: number, op: MathOp): number {
  return op(a, b);
}
console.log(calculate(10, 5, add));      // 15
console.log(calculate(10, 5, multiply)); // 50
console.log(calculate(10, 5, (x, y) => x - y)); // 5 (inline)
```

### Optional & Default Parameters

```typescript
// Optional — bisa ga diisi
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Halo"}, ${name}!`;
}
console.log(greet("Budi"));       // "Halo, Budi!"
console.log(greet("Budi", "Hey")); // "Hey, Budi!"

// Default — kalo ga dikasih, pake default
function createEmail(name: string, domain: string = "gmail.com"): string {
  return `${name}@${domain}`;
}
console.log(createEmail("budi"));           // budi@gmail.com
console.log(createEmail("budi", "yahoo.com")); // budi@yahoo.com

// Rest parameter — kumpulin sisa argumen
function sum(judul: string, ...numbers: number[]): string {
  const total = numbers.reduce((a, b) => a + b, 0);
  return `${judul}: ${total}`;
}
console.log(sum("Total", 1, 2, 3, 4, 5)); // "Total: 15"
```

### Overload — Multi Signature

Berguna kalo function punya beberapa bentuk panggilan:

```typescript
// Tulis overload signature dulu
function process(value: string): string[];
function process(value: number): number[];
// Terus implementasi (harus kompatibel sama semua signature)
function process(value: string | number): string[] | number[] {
  if (typeof value === "string") {
    return value.split("");
  }
  return Array.from({ length: value }, (_, i) => i + 1);
}

console.log(process("abc")); // ["a", "b", "c"]
console.log(process(5));     // [1, 2, 3, 4, 5]

// Real use: event handler
function on(event: "click", handler: (e: MouseEvent) => void): void;
function on(event: "keydown", handler: (e: KeyboardEvent) => void): void;
function on(event: string, handler: (e: Event) => void): void {
  document.addEventListener(event, handler);
}
```

## Generics — Type Safe untuk Semua Tipe

Generic = function/class/interface yang work dengan **tipe yang ditentukan oleh caller**.

```typescript
// Tanpa generic — pake any, type safety ilang
function firstElementBAD(arr: any[]): any {
  return arr[0];
}
const result = firstElementBAD([1, 2, 3]);
result.toUpperCase(); // Runtime error! Ga ada compile error!

// Pake generic — type safety terjaga
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}
const num = firstElement([1, 2, 3]);     // number
const str = firstElement(["a", "b"]);    // string
// num.toUpperCase(); // ❌ ERROR: number no toUpperCase
```

### Multiple Type Parameters

```typescript
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
const result = pair("Budi", 17); // [string, number]

function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return a.map((item, i) => [item, b[i]]);
}
const zipped = zip(["Budi", "Ani"], [17, 18]); // [string, number][]
```

### Generic Constraints

Batasi generic cuma buat tipe yang punya properti tertentu:

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): T {
  console.log(`Length: ${item.length}`);
  return item;
}

logLength("Hello");     // 5 — string punya length
logLength([1, 2, 3]);  // 3 — array punya length
// logLength(123);      // ❌ ERROR: number ga punya length

// Keyof constraint — ambil key dari object
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Budi", age: 17 };
console.log(getProperty(user, "name")); // "Budi" — type: string
console.log(getProperty(user, "age"));  // 17 — type: number
// console.log(getProperty(user, "email")); // ❌ ERROR
```

### Generic Interface & Class

```typescript
// Generic interface
interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

const userRes: ApiResponse<{ id: string; name: string }> = {
  status: 200,
  data: { id: "1", name: "Budi" },
  message: "Success",
};

const listRes: ApiResponse<string[]> = {
  status: 200,
  data: ["a", "b", "c"],
  message: "OK",
};

// Generic class
class Box<T> {
  constructor(private content: T) {}
  
  getValue(): T {
    return this.content;
  }
  
  setValue(value: T): void {
    this.content = value;
  }
}

const stringBox = new Box("hello");
console.log(stringBox.getValue()); // "hello" — type: string
// stringBox.setValue(42); // ❌ ERROR

const numberBox = new Box(42);
console.log(numberBox.getValue()); // 42 — type: number
```

### Generic Utility Patterns

```typescript
// 1. Generic mapper
function mapObject<T, U>(
  obj: Record<string, T>,
  fn: (value: T, key: string) => U
): Record<string, U> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value, key)])
  );
}
const double = mapObject({ a: 1, b: 2 }, n => n * 2);
// { a: 2, b: 4 }

// 2. Builder pattern
class QueryBuilder<T extends Record<string, any>> {
  private conditions: string[] = [];
  
  where<K extends keyof T>(field: K, value: T[K]): this {
    this.conditions.push(`${String(field)} = ${value}`);
    return this;
  }
  
  build(): string {
    return `SELECT * WHERE ${this.conditions.join(" AND ")}`;
  }
}

type UserRow = { id: number; name: string; age: number };
const query = new QueryBuilder<UserRow>()
  .where("name", "Budi")
  .where("age", 17)
  .build();
// SELECT * WHERE name = Budi AND age = 17
```

## Latihan

1. **identity<T>** — function yang return value yang sama persis dengan tipe yang dimasukkan. Test pake string, number, object.

2. **mergeObjects<T, U>** — gabung dua object. Return type harus intersection `T & U`:
   ```typescript
   const merged = mergeObjects({ name: "Budi" }, { age: 17 });
   // merged.name = "Budi"
   // merged.age = 17
   ```

3. **Overloaded format** — function `format` dengan overload:
   - `format(value: number, currency?: string): string` → "Rp10.000"
   - `format(value: Date): string` → "17-08-2025"

4. **Generic Stack<T>** — implement generic interface `Stack<T>` dengan push, pop, peek, isEmpty, size. Pake array-based.

5. **Keyof Practice** — buat function `pluck<T, K extends keyof T>(arr: T[], key: K): T[K][]` yang extract semua nilai properti tertentu dari array of objects. Test:
   ```typescript
   const names = pluck([{ name: "Budi" }, { name: "Ani" }], "name");
   // ["Budi", "Ani"]
   ```

6. **DeepReadonly** — buat type utility `DeepReadonly<T>` yang bikin semua properti (termasuk nested) jadi readonly. Hint: recursive conditional types.
