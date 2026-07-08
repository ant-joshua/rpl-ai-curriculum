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

### Destructuring Parameters dengan Tipe

```typescript
// Destructuring di parameter
function printUser({ name, age }: { name: string; age: number }): string {
  return `${name} berumur ${age} tahun`;
}

// Destructuring dengan nested object
function printOrder({
  id,
  customer: { name },
  items,
}: Order): string {
  return `Pesanan #${id} oleh ${name} dengan ${items.length} item`;
}

// Destructuring dengan default value
function createUser({
  name,
  age = 17,
  isActive = true,
}: {
  name: string;
  age?: number;
  isActive?: boolean;
}): User {
  return { name, age, isActive };
}
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

// Named parameters dengan object + destructuring
function createProduct({
  name,
  price,
  category = "general",
  tags = [],
}: {
  name: string;
  price: number;
  category?: string;
  tags?: string[];
}): Product {
  return { id: crypto.randomUUID(), name, price, category, tags };
}
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

### Overload dengan Object Parameter

```typescript
// Overload untuk bedain tipe input
function sendMessage(type: "text", content: string): void;
function sendMessage(type: "image", url: string, caption?: string): void;
function sendMessage(type: "file", name: string, size: number): void;
function sendMessage(type: string, ...args: any[]): void {
  switch (type) {
    case "text":
      console.log(`Teks: ${args[0]}`);
      break;
    case "image":
      console.log(`Gambar: ${args[0]}, caption: ${args[1] || "-"}`);
      break;
    case "file":
      console.log(`File: ${args[0]}, ${args[1]} bytes`);
      break;
  }
}

sendMessage("text", "Halo!");     // ✅
sendMessage("image", "foto.jpg", "Liburan"); // ✅
// sendMessage("video", "clip.mp4"); // ❌ ERROR — 'video' gak ada di overload
```

### Overload — Generic vs Overload

```typescript
// Kadang generic lebih baik daripada overload
// ❌ Overload: repetitive
function first(arr: string[]): string;
function first<T>(arr: T[]): T;
function first(arr: any[]): any {
  return arr[0];
}

// ✅ Generic: lebih sederhana
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Tapi overload masih berguna kalo return type beda secara signifikan
function parse(input: string): JSONValue;
function parse<T>(input: string, reviver: (key: string, value: any) => any): T;
function parse<T>(input: string, reviver?: (key: string, value: any) => any): T | JSONValue {
  return JSON.parse(input, reviver);
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

// 3 type params
function triple<A, B, C>(a: A, b: B, c: C): [A, B, C] {
  return [a, b, c];
}
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

## Generic Default Types

```typescript
// Default type parameter
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

const arr1 = createArray(3, "a");   // string[]
const arr2 = createArray<number>(3, 5); // number[]
const arr3 = createArray(3, true);  // boolean[] (inferred)

// Generic dengan default di interface
interface ApiConfig<T = any> {
  baseUrl: string;
  timeout: number;
  transform?: (data: any) => T;
}

const config1: ApiConfig = { baseUrl: "/api", timeout: 5000 }; // T = any
const config2: ApiConfig<{ id: string }> = {
  baseUrl: "/api",
  timeout: 5000,
  transform: (data) => ({ id: data.id }),
};
```

## Variadic Tuple Types (TS 4.0+)

Generic dengan **rest elements** di tuple:

```typescript
// Type safe concat
function concat<T extends readonly unknown[], U extends readonly unknown[]>(
  arr1: [...T],
  arr2: [...U]
): [...T, ...U] {
  return [...arr1, ...arr2];
}

const result = concat([1, 2, 3] as const, ["a", "b"] as const);
// Type: readonly [1, 2, 3, "a", "b"]

// Type safe function dengan rest parameter
function partialCall<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Partial<Parameters<T>>
): any {
  return fn(...args);
}

const greetFull = (greeting: string, name: string, punctuation: string) =>
  `${greeting}, ${name}${punctuation}`;

// TypeScript validasi jumlah argumen
const greetBudi = partialCall(greetFull, "Halo"); // sisa 2 params
```

### Variadic Tuple — Curry Function

```typescript
// Generic curry dengan variadic tuple
function curry<T extends unknown[], R>(
  fn: (...args: T) => R
): (...args: Partial<T>) => (...args: any[]) => R {
  return (...args: Partial<T>) => {
    return (...remaining: any[]) => {
      return fn(...([...args, ...remaining] as any));
    };
  };
}

const add3 = (a: number, b: number, c: number) => a + b + c;
const curriedAdd = curry(add3);
const add5 = curriedAdd(5);
const add5And10 = add5(10);
console.log(add5And10(3)); // 18
```

## Template Literal Types di Generics

```typescript
// Generic dengan template literal constraint
type EventHandler<T extends string> = T extends `on${string}`
  ? (event: T) => void
  : never;

// function createHandler<T extends string>(name: T): EventHandler<T> {
//   return (event) => console.log(event);
// }

// CSS property type safe
type CSSProperty = "margin" | "padding" | "border";
type CSSDirection = "top" | "right" | "bottom" | "left";
type CSSRule<T extends CSSProperty> = `${T}-${CSSDirection}`;
// "margin-top" | "margin-right" | ... | "border-left"

function setStyle<T extends CSSProperty>(
  property: T,
  direction: CSSDirection,
  value: string
): string {
  return `${property}-${direction}: ${value}`;
}

const style = setStyle("margin", "top", "10px"); // "margin-top: 10px"
```

## `infer` Keyword — Type Inference di Conditional Types

`infer` ngambil tipe dari dalam tipe lain:

```typescript
// Extract return type
type ReturnTypeExtract<T> = T extends (...args: any[]) => infer R ? R : never;
type R1 = ReturnTypeExtract<() => string>; // string
type R2 = ReturnTypeExtract<(x: number) => boolean>; // boolean

// Extract element type dari array
type Flatten<T> = T extends (infer U)[] ? U : T;
type F1 = Flatten<string[]>; // string
type F2 = Flatten<number[][]>; // number[] (masih array)
type F3 = Flatten<number>; // number (bukan array)

// Extract Promise result
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type U1 = Unwrap<Promise<string>>; // string
type U2 = Unwrap<number>; // number

// Recursive infer
type DeepUnwrap<T> = T extends Promise<infer U> ? DeepUnwrap<U> : T;
type DU1 = DeepUnwrap<Promise<Promise<Promise<string>>>>; // string

// Function parameters
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type FA1 = FirstArg<(name: string, age: number) => void>; // string

// Constructor parameters
type ConstructorParams<T> = T extends new (...args: infer P) => any ? P : never;
class MyClass {
  constructor(a: string, b: number) {}
}
type CP = ConstructorParams<typeof MyClass>; // [string, number]
```

### infer di Real-World Types

```typescript
// Extract value type dari Promise
type PromiseValue<T> = T extends Promise<infer V> ? V : never;

// Extract error type dari Result pattern
type ExtractError<T> = T extends { error: infer E } ? E : never;

// Extract item type dari array-like
type ArrayItem<T> = T extends (infer U)[] ? U
  : T extends ReadonlyArray<infer U> ? U
  : never;

type Arr = ArrayItem<string[]>; // string
type ReadonlyArr = ArrayItem<readonly number[]>; // number
type NotArr = ArrayItem<number>; // number (fallback)

// Extract from function signature
type AsyncFunction<T> = (...args: any[]) => Promise<T>;
type AsyncResult<T extends AsyncFunction<any>> = T extends AsyncFunction<infer R> ? R : never;
type Fn = AsyncFunction<string>;
type R = AsyncResult<Fn>; // string
```

## Generic `this` Parameter

TypeScript bisa type-check `this` di function:

```typescript
// this parameter di object literal
const calculator = {
  value: 0,
  add(this: { value: number }, n: number) {
    this.value += n;
    return this;
  },
  multiply(this: { value: number }, n: number) {
    this.value *= n;
    return this;
  },
  getValue(this: { value: number }): number {
    return this.value;
  },
};

const result = calculator.add(5).multiply(2).getValue(); // 10

// this parameter di class
class Validator {
  constructor(private rules: Map<string, RegExp>) {}

  validate(this: Validator, key: string, value: string): boolean {
    const rule = this.rules.get(key);
    if (!rule) return true;
    return rule.test(value);
  }
}

// this type di generic
interface Array<T> {
  filter<U extends T>(cb: (value: T, index: number, array: T[]) => value is U): U[];
}

// Type predicate + this
type ObjectWithId = { id: string };
function hasId<T extends object>(obj: T): obj is T & ObjectWithId {
  return "id" in obj && typeof (obj as any).id === "string";
}
```

## Mapped Types dengan Generics

```typescript
// Generic mapped type — transform keys
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type Service<T> = Getters<T> & Setters<T>;

interface Profile {
  name: string;
  age: number;
}

type ProfileService = Service<Profile>;
// {
//   getName: () => string;
//   setName: (value: string) => void;
//   getAge: () => number;
//   setAge: (value: number) => void;
// }

// Generic pick by type
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

interface Entity {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

type StringFields = PickByType<Entity, string>;
// { id: string; name: string }
type DateFields = PickByType<Entity, Date>;
// { createdAt: Date; updatedAt: Date }
```

## Covariance & Contravariance

TypeScript punya aturan tentang gimana generic parameter berelasi:

```typescript
// Covariance — List<Dog> adalah subtype List<Animal>?
// Array di TypeScript adalah covariant
class Animal { eat() {} }
class Dog extends Animal { bark() {} }
class Cat extends Animal { meow() {} }

const dogs: Dog[] = [new Dog()];
const animals: Animal[] = dogs; // ✅ OK — covariant (tapi gak type-safe!)
animals.push(new Cat()); // Runtime: dogs sekarang ada Cat!

// Function parameter — contravariant
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

const handler: AnimalHandler = (animal) => animal.eat();
const dogHandler: DogHandler = handler; // ❌ ERROR with strictFunctionTypes

// Kenapa? Kalo handler nerima Animal terus dipake sebagai DogHandler,
// caller bisa kirim Dog, tapi handler bisa nerima Animal lain (Cat) — error.

// Lebih aman: type alias dengan strict mode
type Handler<T> = (value: T) => void;
// Handler<Dog> is NOT assignable to Handler<Animal> -- contravariant
```

## Generic Function Patterns Praktis

### Pipeline / Compose

```typescript
function pipe<T>(value: T): T;
function pipe<T, A>(value: T, fn1: (v: T) => A): A;
function pipe<T, A, B>(value: T, fn1: (v: T) => A, fn2: (v: A) => B): B;
function pipe(value: any, ...fns: ((v: any) => any)[]): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

const result = pipe(
  5,
  (x) => x * 2,     // 10
  (x) => x.toString(), // "10"
  (x) => `Rp${x}`    // "Rp10"
);
```

### Builder / Fluent API

```typescript
class QueryBuilder<T extends Record<string, any>> {
  private selectFields: (keyof T)[] = [];
  private whereClauses: string[] = [];
  private orderField?: keyof T;

  select(...fields: (keyof T)[]): this {
    this.selectFields = fields;
    return this;
  }

  where(condition: Partial<T>): this {
    for (const [key, value] of Object.entries(condition)) {
      this.whereClauses.push(`${key} = ${JSON.stringify(value)}`);
    }
    return this;
  }

  orderBy(field: keyof T): this {
    this.orderField = field;
    return this;
  }

  build(): string {
    const fields = this.selectFields.length > 0
      ? this.selectFields.join(", ")
      : "*";
    const where = this.whereClauses.length > 0
      ? ` WHERE ${this.whereClauses.join(" AND ")}`
      : "";
    const order = this.orderField
      ? ` ORDER BY ${String(this.orderField)}`
      : "";
    return `SELECT ${fields} FROM table${where}${order}`;
  }
}

type Product = { id: number; name: string; price: number; category: string };
const sql = new QueryBuilder<Product>()
  .select("name", "price")
  .where({ category: "electronics", price: 100000 })
  .orderBy("name")
  .build();
// SELECT name, price FROM table WHERE category="electronics" AND price=100000 ORDER BY name
```

### Event Emitter Type-Safe

```typescript
type EventMap = {
  userLogin: { userId: string; timestamp: Date };
  userLogout: { userId: string };
  error: { message: string; code: number };
};

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners = new Map<keyof T, Set<(...args: any[]) => void>>();

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }

  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    this.listeners.get(event)?.delete(handler);
  }
}

const emitter = new TypedEventEmitter<EventMap>();
emitter.on("userLogin", (data) => {
  console.log(`User ${data.userId} login at ${data.timestamp}`);
  // data.userId ✅ type-safe
  // data.message ❌ ERROR — gak ada di userLogin
});
emitter.emit("userLogin", { userId: "123", timestamp: new Date() });
```

### Async Generic — Fetch Wrapper

```typescript
// Generic fetch wrapper
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new ApiError(response.status, error.message);
  }

  return response.json();
}

// Pake — tipe otomatis
interface User {
  id: number;
  name: string;
  email: string;
}

const users = await apiFetch<User[]>("/api/users");
// users: User[] — type-safe!

const user = await apiFetch<User>("/api/users/1");
// user: User — type-safe!
```

### Generic State Machine

```typescript
// Type-safe state machine
type StateMachine<States extends string, Transitions extends Record<string, string>> = {
  current: States;
  transition(action: keyof Transitions & string): void;
};

function createMachine<States extends string, T extends Record<string, string>>(
  initialState: States,
  transitions: T
): StateMachine<States, T> {
  let current = initialState;
  return {
    get current() { return current; },
    transition(action: keyof T & string) {
      const next = transitions[action];
      if (next) {
        current = next as States;
      } else {
        throw new Error(`Invalid transition: ${String(action)}`);
      }
    },
  };
}

// Order state machine
const orderMachine = createMachine("pending", {
  confirm: "confirmed",
  ship: "shipped",
  deliver: "delivered",
  cancel: "cancelled",
});

orderMachine.transition("confirm"); // pending → confirmed
console.log(orderMachine.current); // "confirmed"
// orderMachine.transition("invalid"); // ❌ ERROR: not in transitions
```

### Generic Deep Merge

```typescript
// Type-safe deep merge
type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof T
    ? K extends keyof U
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : T[K]
    : K extends keyof U
      ? U[K]
      : never;
};

function merge<T extends object, U extends object>(
  target: T,
  source: U
): DeepMerge<T, U> {
  const result = { ...target };
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      result[key as keyof T] = {
        ...(target as any)[key],
        ...(source as any)[key],
      };
    } else {
      (result as any)[key] = source[key];
    }
  }
  return result as DeepMerge<T, U>;
}

const defaults = { theme: "light", pagination: { pageSize: 10 } };
const overrides = { pagination: { pageSize: 20 }, showFooter: true };
const config = merge(defaults, overrides);
// config.pagination.pageSize = 20
// config.showFooter = true
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

7. **Pipeline Function** — implementasikan generic `pipe` function yang nerima input value dan beberapa transform function. TypeScript harus tau tipe output dari tiap tahap. Test dengan chain: number → string → boolean.

8. **Generic Repository** — buat interface `Repository<T>` dengan method: `findAll(): T[]`, `findById(id: string): T | undefined`, `create(data: Omit<T, 'id'>): T`, `update(id: string, data: Partial<T>): T | undefined`, `delete(id: string): boolean`. Implementasi untuk entity `User` dan `Product`.

9. **PickByType Utility** — buat type `PickByType<T, U>` yang hanya ngambil keys dari T yang tipe valuenya extends U. Test dengan interface `Entity` yang punya field string, number, Date.

10. **Typed Event Emitter** — buat class `EventEmitter<T>` dengan method `on`, `emit`, `off` yang type-safe. Definisikan event map: `userRegister`, `orderPlaced`, `paymentFailed`. Demonstrasikan type checking di handler dan emit.

11. **Type-Safe Fetch** — buat generic function `apiFetch<T>(url, options?): Promise<T>` yang handle error response. Test dengan endpoint JSONPlaceholder: `GET /users` return `User[]`, `GET /users/1` return `User`.

12. **Variadic Concat** — buat function `mergeArrays` dengan variadic tuple types yang nerima 2 array dengan tipe berbeda dan return tuple gabungan dengan tipe yang tepat. Contoh: `mergeArrays([1,2], ["a","b"])` → `[number, number, string, string]`.
