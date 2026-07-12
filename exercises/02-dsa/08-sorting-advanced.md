# Algoritma & Struktur Data — Exercise #8: Sorting Advanced (Merge Sort & Quick Sort)

> **Level:** Intermediate
> **Topics:** merge sort, quick sort, divide and conquer, recursion

## Instructions

Implementasikan dua algoritma sorting lanjutan:

1. `mergeSort(arr)` — divide and conquer: bagi array jadi dua, urutkan masing-masing, lalu gabung.
   - `merge(left, right)` — fungsi pembantu untuk menggabung dua array terurut.
2. `quickSort(arr)` — divide and conquer: pilih pivot, partisi array, urutkan secara rekursif.
   - `partition(arr, low, high)` — fungsi pembantu untuk partisi.

Kedua algoritma memiliki kompleksitas O(n log n) rata-rata.

## Starter Code

```javascript
function merge(left, right) {
  // TODO: gabung dua array terurut
}

function mergeSort(arr) {
  // TODO: merge sort rekursif
  // Base case: arr.length <= 1
}

function partition(arr, low, high) {
  // TODO: pilih pivot, partisi array
  // Return index pivot setelah partisi
}

function quickSort(arr, low = 0, high = arr.length - 1) {
  // TODO: quick sort rekursif
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
console.log(mergeSort([5, 4, 3, 2, 1]));
console.log(mergeSort([1]));
console.log(mergeSort([]));

console.log(quickSort([38, 27, 43, 3, 9, 82, 10]));
console.log(quickSort([5, 4, 3, 2, 1]));
console.log(quickSort([3, 0, 2, 5, -1, 4, 1]));
```

## Expected Output

```
[ 3, 9, 10, 27, 38, 43, 82 ]
[ 1, 2, 3, 4, 5 ]
[ 1 ]
[]
[ 3, 9, 10, 27, 38, 43, 82 ]
[ 1, 2, 3, 4, 5 ]
[ -1, 0, 1, 2, 3, 4, 5 ]
```

## Test Cases

```javascript
function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return true;
}

const testArr = [9, 3, 7, 5, 6, 4, 8, 2, 1, 0];
console.log(isSorted(mergeSort([...testArr])));   // true
console.log(isSorted(quickSort([...testArr])));   // true

// Duplicates
console.log(isSorted(mergeSort([4, 4, 3, 2, 2, 1])));  // true
console.log(isSorted(quickSort([4, 4, 3, 2, 2, 1])));  // true

// Negative numbers
console.log(isSorted(quickSort([-3, -1, -2, 0, 2])));   // true
```
