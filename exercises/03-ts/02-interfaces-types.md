# TypeScript — Exercise #2: Interfaces & Types

> **Level:** Beginner
> **Topics:** interfaces, type aliases, optional properties, readonly

## Instructions

Definisikan dan gunakan interface/type untuk object-object berikut:

1. `Student` — interface dengan `name` (string), `age` (number), `email?` (optional string), `readonly id` (number).
2. `Product` — type dengan `name`, `price`, `category`, `stock?` (optional).
3. `calculateDiscountedPrice(product, discountPercent)` — hitung harga setelah diskon.
4. `isProductAvailable(product)` — cek apakah stock > 0 (anggap tersedia jika stock undefined).

## Starter Code

```javascript
// TODO: definisikan interface Student
// TODO: definisikan type Product

function calculateDiscountedPrice(product, discountPercent) {
  // TODO: return price setelah diskon
  // price - (price * discountPercent / 100)
}

function isProductAvailable(product) {
  // TODO: return true jika stock > 0 atau undefined
}

const student = { id: 1, name: "Budi", age: 17, email: "budi@test.com" };
const product = { name: "Laptop", price: 15000000, category: "elektronik", stock: 5 };

console.log(student.name);
console.log(calculateDiscountedPrice(product, 10));
console.log(isProductAvailable(product));
console.log(isProductAvailable({ name: "Buku", price: 50000, category: "pendidikan", stock: 0 }));
```

## Expected Output

```
Budi
13500000
true
false
```

## Test Cases

```javascript
const s1 = { id: 10, name: "Ani", age: 16 };
console.log(s1.id !== undefined);                     // true (readonly di TS, di JS tetap bisa diakses)

console.log(calculateDiscountedPrice({ name: "X", price: 100000, category: "test" }, 20) === 80000);  // true
console.log(isProductAvailable({ name: "Y", price: 1000, category: "test", stock: 0 }) === false);   // true
console.log(isProductAvailable({ name: "Z", price: 1000, category: "test" }) === true);              // true
```
