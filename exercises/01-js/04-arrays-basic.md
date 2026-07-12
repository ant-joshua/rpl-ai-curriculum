# JavaScript — Exercise #4: Arrays Basic

> **Level:** Beginner
> **Topics:** arrays, push, pop, shift, unshift, index

## Instructions

Buat fungsi-fungsi berikut untuk memanipulasi array:

1. `addItem(arr, item)` — tambah item ke akhir array, return array baru.
2. `removeLast(arr)` — hapus item terakhir, return item yang dihapus.
3. `removeFirst(arr)` — hapus item pertama, return item yang dihapus.
4. `findIndex(arr, item)` — cari index dari item, return -1 jika tidak ditemukan.
5. `mergeArrays(arr1, arr2)` — gabung dua array tanpa menggunakan spread operator (gunakan loop).

## Starter Code

```javascript
function addItem(arr, item) {
  // TODO: return array baru dengan item ditambahkan di akhir
}

function removeLast(arr) {
  // TODO: hapus dan return item terakhir
}

function removeFirst(arr) {
  // TODO: hapus dan return item pertama
}

function findIndex(arr, item) {
  // TODO: cari index item, return -1 jika tidak ada
}

function mergeArrays(arr1, arr2) {
  // TODO: gabung dua array (tanpa spread/concat)
}

const fruits = ["apel", "mangga", "jeruk"];
console.log(addItem(fruits, "pisang"));
console.log(removeLast(fruits));
console.log(removeFirst(fruits));
console.log(findIndex(fruits, "mangga"));
console.log(findIndex(fruits, "durian"));
console.log(mergeArrays([1, 2, 3], [4, 5, 6]));
```

## Expected Output

```
[ 'apel', 'mangga', 'jeruk', 'pisang' ]
jeruk
apel
1
-1
[ 1, 2, 3, 4, 5, 6 ]
```

## Test Cases

```javascript
console.log(findIndex([1, 2, 3], 2) === 1);      // true
console.log(findIndex([1, 2, 3], 5) === -1);     // true
console.log(removeLast([1, 2, 3]) === 3);         // true
console.log(removeFirst([1, 2, 3]) === 1);        // true
```
