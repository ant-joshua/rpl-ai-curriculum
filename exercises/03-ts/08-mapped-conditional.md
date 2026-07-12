# TypeScript — Exercise #8: Mapped & Conditional Types

> **Level:** Advanced
> **Topics:** mapped types, conditional types, infer, template literal types

## Instructions

Buat mapped dan conditional types berikut:

1. `MyReadonly<T>` — mapped type yang bikin semua properti readonly.
2. `MyNullable<T>` — mapped type yang bikin semua properti nullable (`T[K] | null`).
3. `IsString<T>` — conditional type: `T extends string ? "yes" : "no"`.
4. `ExtractArrayType<T>` — conditional type dengan `infer`: ambil tipe elemen array.
5. `DeepPartial<T>` — recursive mapped type: bikin semua nested object jadi optional.

## Starter Code

```javascript
// TODO: implementasi mapped & conditional types

// Test MyReadonly
const person = { name: "Budi", age: 17, email: "budi@test.com" };

// person.name = "Andi"; // Harusnya error kalau readonly!

// Test MyNullable
const nullablePerson = { name: "Budi", age: null, email: "test@test.com" };
console.log(nullablePerson.age);  // null

// Test IsString (simulasi di JS)
function checkType(value) {
  // if string -> return "yes", else -> return "no"
  return typeof value === "string" ? "yes" : "no";
}

// Test ExtractArrayType
function getFirstElement(arr) {
  return arr[0];
}

// Test DeepPartial
function mergeConfig(base, override) {
  // Merge nested objects deeply
  const result = {};
  for (const key in base) {
    if (typeof base[key] === "object" && base[key] !== null && override[key] !== undefined) {
      result[key] = { ...base[key], ...override[key] };
    } else {
      result[key] = override[key] !== undefined ? override[key] : base[key];
    }
  }
  return result;
}

console.log(checkType("hello"));        // "yes"
console.log(checkType(42));             // "no"
console.log(checkType(true));           // "no"

console.log(getFirstElement([1, 2, 3]));  // 1
console.log(getFirstElement(["a", "b"])); // "a"

console.log(JSON.stringify(mergeConfig(
  { server: { host: "localhost", port: 3000 }, debug: false },
  { server: { port: 5000 } }
)));
```

## Expected Output

```
yes
no
no
1
a
{"server":{"host":"localhost","port":5000},"debug":false}
```

## Test Cases

```javascript
console.log(checkType("") === "yes");      // true
console.log(checkType(0) === "no");        // true
console.log(checkType(null) === "no");     // true

console.log(getFirstElement([true, false]) === true);           // true
console.log(getFirstElement([]) === undefined);                 // true

const merged = mergeConfig({ a: { b: 1, c: 2 } }, { a: { b: 10 } });
console.log(merged.a.b === 10);   // true
console.log(merged.a.c === 2);    // true (c retained)
```
