# TypeScript — Exercise #3: Generics Basic

> **Level:** Intermediate
> **Topics:** generic functions, generic types, type parameters

## Instructions

Buat fungsi generic berikut:

1. `firstElement(arr)` — ambil elemen pertama dari array. Generic type `T`.
2. `lastElement(arr)` — ambil elemen terakhir dari array.
3. `reverseArray(arr)` — balik array. Generic type `T`.
4. `identity(value)` — return value yang sama. Generic type `T`.
5. `createPair(a, b)` — return tuple `[T, U]` dari dua nilai berbeda.

## Starter Code

```javascript
// TODO: buat fungsi generic
function firstElement(arr) {
  return arr[0];
}

function lastElement(arr) {
  return arr[arr.length - 1];
}

function reverseArray(arr) {
  return [...arr].reverse();
}

function identity(value) {
  return value;
}

function createPair(a, b) {
  return [a, b];
}

console.log(firstElement([1, 2, 3]));
console.log(firstElement(["a", "b", "c"]));
console.log(lastElement([1, 2, 3]));
console.log(reverseArray([1, 2, 3]));
console.log(identity(42));
console.log(identity("hello"));
console.log(createPair("nama", 17));
```

## Expected Output

```
1
a
3
[ 3, 2, 1 ]
42
hello
[ 'nama', 17 ]
```

## Test Cases

```javascript
console.log(firstElement([true, false]) === true);     // true
console.log(lastElement([1, 2, 3]) === 3);             // true
console.log(JSON.stringify(reverseArray([1, 2, 3])) === "[3,2,1]");  // true
console.log(identity(100) === 100);                    // true
console.log(JSON.stringify(createPair(1, "satu")) === '[1,"satu"]');  // true
```
