# Algoritma & Struktur Data — Exercise #7: Sorting Basic (Bubble, Selection, Insertion)

> **Level:** Intermediate
> **Topics:** bubble sort, selection sort, insertion sort, comparison

## Instructions

Implementasikan tiga algoritma sorting dasar:

1. `bubbleSort(arr)` — bandingkan dan tukar elemen bersebelahan secara berulang.
2. `selectionSort(arr)` — cari elemen terkecil, taruh di posisi yang tepat.
3. `insertionSort(arr)` — ambil elemen, sisipkan di posisi yang tepat di array yang sudah terurut.

Masing-masing fungsi harus memodifikasi array asli (in-place) dan juga mengembalikannya.

## Starter Code

```javascript
function bubbleSort(arr) {
  // TODO: bubble sort — O(n²)
}

function selectionSort(arr) {
  // TODO: selection sort — O(n²)
}

function insertionSort(arr) {
  // TODO: insertion sort — O(n²)
}

const arr1 = [64, 34, 25, 12, 22, 11, 90];
const arr2 = [64, 34, 25, 12, 22, 11, 90];
const arr3 = [64, 34, 25, 12, 22, 11, 90];

console.log("Bubble:", bubbleSort(arr1));
console.log("Selection:", selectionSort(arr2));
console.log("Insertion:", insertionSort(arr3));

// Edge cases
console.log(bubbleSort([]));        // []
console.log(selectionSort([1]));    // [1]
console.log(insertionSort([3, 1, 2])); // [1, 2, 3]
```

## Expected Output

```
Bubble: [ 11, 12, 22, 25, 34, 64, 90 ]
Selection: [ 11, 12, 22, 25, 34, 64, 90 ]
Insertion: [ 11, 12, 22, 25, 34, 64, 90 ]
[]
[1]
[1, 2, 3]
```

## Test Cases

```javascript
function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return true;
}

const t1 = [5, 3, 8, 1, 2];
console.log(isSorted(bubbleSort([...t1])));     // true
console.log(isSorted(selectionSort([...t1])));  // true
console.log(isSorted(insertionSort([...t1])));  // true

// Already sorted
console.log(isSorted(bubbleSort([1, 2, 3])));   // true
```
