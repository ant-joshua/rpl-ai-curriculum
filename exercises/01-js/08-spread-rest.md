# JavaScript — Exercise #8: Spread & Rest Operator

> **Level:** Beginner
> **Topics:** spread operator, rest parameters, object spread

## Instructions

Gunakan spread operator (`...`) dan rest parameters untuk menyelesaikan fungsi berikut:

1. `gabungArray(arr1, arr2)` — gabung dua array menggunakan spread.
2. `rataRata(...angka)` — hitung rata-rata dari banyak angka (gunakan rest parameter).
3. `cloneAndAdd(obj, key, value)` — clone object dan tambah properti baru menggunakan spread.
4. `gabungkanUser(...users)` — gabung beberapa object user menjadi satu menggunakan rest + spread.
5. `maxValue(...angka)` — cari nilai terbesar dari angka-angka yang diberikan.

## Starter Code

```javascript
function gabungArray(arr1, arr2) {
  // TODO: gabung dua array pake spread
}

function rataRata(...angka) {
  // TODO: hitung rata-rata dari semua argumen
}

function cloneAndAdd(obj, key, value) {
  // TODO: clone objek dan tambah properti baru
}

function gabungkanUser(...users) {
  // TODO: gabung semua object user jadi satu
}

function maxValue(...angka) {
  // TODO: cari nilai maksimum
}

console.log(gabungArray([1, 2], [3, 4]));
console.log(rataRata(10, 20, 30, 40));
console.log(cloneAndAdd({ nama: "Budi" }, "umur", 17));
console.log(gabungkanUser({ nama: "Budi" }, { umur: 17 }, { hobi: "coding" }));
console.log(maxValue(3, 7, 2, 9, 5));
```

## Expected Output

```
[ 1, 2, 3, 4 ]
25
{ nama: 'Budi', umur: 17 }
{ nama: 'Budi', umur: 17, hobi: 'coding' }
9
```

## Test Cases

```javascript
console.log(JSON.stringify(gabungArray([1], [2])) === "[1,2]");   // true
console.log(rataRata(1, 2, 3, 4, 5) === 3);                       // true
console.log(maxValue(1, 2, 3) === 3);                              // true
console.log(maxValue(-5, -2, -10) === -2);                        // true
```
