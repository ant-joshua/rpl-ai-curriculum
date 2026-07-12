# Algoritma & Struktur Data — Exercise #2: Array Operations (Two Sum)

> **Level:** Beginner
> **Topics:** arrays, hash map, two-pointer, nested loops

## Instructions

Selesaikan masalah klasik **Two Sum**: diberikan array `nums` dan `target`, temukan dua angka yang jika dijumlahkan sama dengan `target`. Kembalikan array berisi index kedua angka tersebut.

Buat tiga solusi dengan kompleksitas berbeda:

1. `twoSumBruteForce` — O(n²) menggunakan nested loop.
2. `twoSumHashMap` — O(n) menggunakan Map.
3. `twoSumTwoPointer` — O(n log n) menggunakan dua pointer (array harus diurutkan dulu).

## Starter Code

```javascript
function twoSumBruteForce(nums, target) {
  // TODO: O(n²) — coba semua pasangan
}

function twoSumHashMap(nums, target) {
  // TODO: O(n) — pake Map buat nyimpan angka yang udah dilihat
}

function twoSumTwoPointer(nums, target) {
  // TODO: O(n log n) — urutkan dulu, lalu pake dua pointer
  // Catatan: index berubah setelah sorting!
}

console.log(twoSumBruteForce([2, 7, 11, 15], 9));
console.log(twoSumHashMap([3, 2, 4], 6));
console.log(twoSumHashMap([3, 3], 6));
console.log(twoSumHashMap([1, 2, 3, 4, 5], 8));
```

## Expected Output

```
[ 0, 1 ]
[ 1, 2 ]
[ 0, 1 ]
[ 2, 4 ]
```

## Test Cases

```javascript
// Brute force
console.log(JSON.stringify(twoSumBruteForce([2,7,11,15], 9)) === "[0,1]");  // true

// HashMap
console.log(JSON.stringify(twoSumHashMap([3,2,4], 6)) === "[1,2]");        // true
console.log(JSON.stringify(twoSumHashMap([3,3], 6)) === "[0,1]");          // true
console.log(twoSumHashMap([1,2,3], 7));                                     // [] (tidak ada)
```
