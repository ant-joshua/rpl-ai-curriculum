# JavaScript — Exercise #7: Array Methods (Map, Filter, Reduce)

> **Level:** Beginner
> **Topics:** map, filter, reduce, method chaining

## Instructions

Gunakan method array (`map`, `filter`, `reduce`) untuk memproses data produk.

Buat fungsi:

1. `expensiveProducts(items)` — filter produk dengan harga > 10000.
2. `productNames(items)` — map untuk mengambil hanya nama produk.
3. `totalPrice(items)` — reduce untuk menghitung total harga semua produk.
4. `makananNames(items)` — chain filter category "makanan" lalu map nama.
5. `averagePrice(items)` — reduce untuk menghitung rata-rata harga.

## Starter Code

```javascript
const products = [
  { name: "Nasi", price: 5000, category: "makanan" },
  { name: "Telur", price: 2500, category: "makanan" },
  { name: "Kopi", price: 15000, category: "minuman" },
  { name: "Roti", price: 12000, category: "makanan" },
  { name: "Air Mineral", price: 3000, category: "minuman" },
];

function expensiveProducts(items) {
  // TODO: filter harga > 10000
}

function productNames(items) {
  // TODO: map ambil nama
}

function totalPrice(items) {
  // TODO: reduce hitung total
}

function makananNames(items) {
  // TODO: filter makanan lalu map nama
}

function averagePrice(items) {
  // TODO: reduce hitung rata-rata
}

console.log(expensiveProducts(products));
console.log(productNames(products));
console.log(totalPrice(products));
console.log(makananNames(products));
console.log(averagePrice(products));
```

## Expected Output

```
[
  { name: 'Kopi', price: 15000, category: 'minuman' },
  { name: 'Roti', price: 12000, category: 'makanan' }
]
[ 'Nasi', 'Telur', 'Kopi', 'Roti', 'Air Mineral' ]
37500
[ 'Nasi', 'Telur', 'Roti' ]
7500
```

## Test Cases

```javascript
console.log(totalPrice(products) === 37500);             // true
console.log(productNames(products).length === 5);        // true
console.log(makananNames(products).length === 3);        // true
console.log(expensiveProducts(products).length === 2);   // true
```
