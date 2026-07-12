# TypeScript — Exercise #6: Type Guards

> **Level:** Intermediate
> **Topics:** typeof, instanceof, user-defined type guards, in operator

## Instructions

Buat type guards dan fungsi yang menggunakannya:

1. `isString(value)` — type guard: return `value is string`.
2. `isNumber(value)` — type guard: return `value is number`.
3. `formatValue(value)` — handle `string | number`: uppercase string, format number ke rupiah.
4. `processShape(shape)` — discriminated union untuk `circle`, `rectangle`, `triangle`. Hitung luas.

## Starter Code

```javascript
// TODO: type guards
function isString(value) {
  return typeof value === "string";
}

function isNumber(value) {
  return typeof value === "number";
}

function formatValue(value) {
  // TODO: if string -> uppercase
  // if number -> "Rp. {number}" with thousands separator
}

function processShape(shape) {
  // shape: { kind: "circle", radius } | { kind: "rectangle", width, height } | { kind: "triangle", base, height }
  // TODO: hitung luas berdasarkan kind
}

console.log(formatValue("hello"));
console.log(formatValue(1500000));
console.log(processShape({ kind: "circle", radius: 7 }));
console.log(processShape({ kind: "rectangle", width: 10, height: 5 }));
console.log(processShape({ kind: "triangle", base: 8, height: 6 }));
```

## Expected Output

```
HELLO
Rp. 1.500.000
153.93804002589985
50
24
```

## Test Cases

```javascript
console.log(isString("test") === true);           // true
console.log(isString(123) === false);             // true
console.log(isNumber(42) === true);               // true
console.log(isNumber("42") === false);            // true

console.log(formatValue("abc") === "ABC");         // true
console.log(formatValue(1000) === "Rp. 1.000");    // true

console.log(processShape({ kind: "circle", radius: 10 }) > 314);  // true
console.log(processShape({ kind: "rectangle", width: 3, height: 4 }) === 12);  // true
console.log(processShape({ kind: "triangle", base: 4, height: 3 }) === 6);    // true
```
