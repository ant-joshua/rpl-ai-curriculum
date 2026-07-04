# 3.3 Functions & Generics

## Function Types

Nulis tipe buat parameter dan return value.

```typescript
// Basic function dengan tipe
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => {
  return a * b;
};

// Void — fungsi yang ga return apa-apa
function logMessage(msg: string): void {
  console.log(msg);
}
```

## Optional & Default Parameters

```typescript
// Optional parameter
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Halo"}, ${name}!`;
}

// Default parameter
function createEmail(name: string, domain: string = "gmail.com"): string {
  return `${name}@${domain}`;
}

console.log(createEmail("budi"));           // budi@gmail.com
console.log(createEmail("budi", "yahoo.com")); // budi@yahoo.com
```

## Function Type Signatures

Simpen tipe fungsi di variable atau parameter.

```typescript
// Type buat fungsi
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (x, y) => x + y;
const subtract: MathOperation = (x, y) => x - y;

// Fungsi yang nerima fungsi lain (callback)
function calculate(a: number, b: number, op: MathOperation): number {
  return op(a, b);
}

console.log(calculate(10, 5, add));      // 15
console.log(calculate(10, 5, subtract)); // 5
```

## Overload

Bikin beberapa signature buat fungsi yang sama.

```typescript
function process(value: string): string[];
function process(value: number): number[];
function process(value: string | number): string[] | number[] {
  if (typeof value === "string") {
    return value.split("");
  }
  return Array.from({ length: value }, (_, i) => i + 1);
}

console.log(process("abc")); // ["a", "b", "c"]
console.log(process(5));      // [1, 2, 3, 4, 5]
```

## Generics

Fungsi yang work dengan berbagai tipe tanpa kehilangan type safety.

```typescript
// Generic function
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstElement([1, 2, 3]);     // number
const str = firstElement(["a", "b"]);    // string
// TypeScript tau return type sesuai input
```

## Multiple Generic Types

```typescript
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

const result = pair("Budi", 17); // [string, number]
```

## Generic Constraints

Batasin generic pake `extends`.

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): T {
  console.log(`Length: ${item.length}`);
  return item;
}

logLength("Hello");     // OK — string punya length
logLength([1, 2, 3]);  // OK — array punya length
// logLength(123);      // ERROR — number ga punya length
```

## Generic Interface

```typescript
interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

// Pake interface generic
const userResponse: ApiResponse<{ id: string; name: string }> = {
  status: 200,
  data: { id: "1", name: "Budi" },
  message: "Success",
};

const listResponse: ApiResponse<string[]> = {
  status: 200,
  data: ["a", "b", "c"],
  message: "OK",
};
```

## Latihan

1. Bikin fungsi `identity<T>` yang return value yang sama persis dengan tipenya. Test pake string dan number
2. Bikin fungsi `mergeObjects<T, U>` yang gabungin dua object. Return type harus intersection dari T & U
3. Bikin fungsi overloaded `format` — kalo nerima number return string dengan format "Rp <number>", kalo nerima Date return string "DD-MM-YYYY"
4. Bikin generic interface `Stack<T>` dengan method push(item: T), pop(): T | undefined, peek(): T | undefined. Implementasiin simple array-based
