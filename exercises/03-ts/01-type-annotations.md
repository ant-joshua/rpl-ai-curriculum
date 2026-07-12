# TypeScript — Exercise #1: Type Annotations

> **Level:** Beginner
> **Topics:** type annotations, function types, arrays, tuples

## Instructions

Lengkapi type annotations yang kosong di kode berikut. Semua fungsi harus memiliki tipe parameter dan return value yang tepat.

1. `introduce(name, umur)` — return string perkenalan.
2. `calculateTotal(prices)` — hitung total dari array number.
3. `getInitials(firstName, lastName)` — ambil inisial (huruf pertama masing-masing, uppercase).
4. `createUser(id, name, isActive)` — return object user dengan tipe yang tepat.

## Starter Code

```javascript
// Lengkapi type annotations
function introduce(name, umur) {
  return `Halo, nama saya ${name}, umur ${umur} tahun.`;
}

function calculateTotal(prices) {
  return prices.reduce((sum, p) => sum + p, 0);
}

function getInitials(firstName, lastName) {
  return (firstName[0] + lastName[0]).toUpperCase();
}

function createUser(id, name, isActive) {
  return { id, name, isActive };
}

console.log(introduce("Budi", 17));
console.log(calculateTotal([10000, 25000, 15000]));
console.log(getInitials("john", "doe"));
console.log(createUser(1, "Ani", true));
```

## Expected Output

```
Halo, nama saya Budi, umur 17 tahun.
50000
JD
{ id: 1, name: 'Ani', isActive: true }
```

## Test Cases

```javascript
console.log(introduce("Test", 20).includes("Test"));  // true
console.log(calculateTotal([1, 2, 3]) === 6);         // true
console.log(getInitials("", "") === "");               // true
console.log(getInitials("a", "b") === "AB");           // true
```
