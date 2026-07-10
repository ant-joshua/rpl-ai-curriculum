# 02. ⚙️ Algoritma & Struktur Data

## Big O Notation
- **O(1)** — Constant: akses array `arr[0]`
- **O(log n)** — Logarithmic: binary search
- **O(n)** — Linear: loop satu tingkat
- **O(n log n)** — Linearithmic: merge sort, quick sort
- **O(n²)** — Quadratic: nested loop
- **O(2ⁿ)** — Exponential: Fibonacci naif

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)
```

## Searching
```js
// Linear Search — O(n)
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// Binary Search — O(log n) — array HARUS terurut
function binarySearch(arr, target) {
  let kiri = 0, kanan = arr.length - 1;
  while (kiri <= kanan) {
    let mid = Math.floor((kiri + kanan) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) kiri = mid + 1;
    else kanan = mid - 1;
  }
  return -1;
}
```

## Sorting
```js
// Built-in sort()
arr.sort((a, b) => a - b);  // ascending numbers

// Bubble Sort — O(n²)
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j+1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
      }
    }
  }
  return arr;
}
```

## Recursion
```js
// Base case + recursive case
function faktorial(n) {
  if (n <= 1) return 1;      // base case
  return n * faktorial(n-1); // recursive case
}

// Fibonacci
function fib(n) {
  if (n <= 1) return n;
  return fib(n-1) + fib(n-2);
}
```

## Stack & Queue
| Struktur | Prinsip | Method |
|----------|---------|--------|
| Stack | LIFO | `push()` / `pop()` |
| Queue | FIFO | `push()` / `shift()` |

```js
// Stack
let stack = []; stack.push(1); stack.pop();

// Queue
let queue = []; queue.push(1); queue.shift();
```

## Common Pitfalls
- ❌ Lupa base case → stack overflow (recursion)
- ❌ Array tidak terurut untuk binary search
- ❌ Modifikasi array saat iterasi
- ❌ `sort()` default urut alfabet (butuh comparator)

## Related Links
- [01 JS Fundamentals](01-js-fundamentals.md)
