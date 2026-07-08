# 2.4 Recursion & Sorting

## Recursion — Function Panggil Diri Sendiri

Recursion terjadi kalo **sebuah function memanggil dirinya sendiri**.

```typescript
// Komponen recursion:
function recursion() {
  // 1. Base case — kapan berhenti (WAJIB!)
  if (kondisi) return; 
  
  // 2. Recursive case — panggil diri sendiri
  recursion();
}
```

**Kenapa pake recursion?** Kode lebih bersih buat masalah yang punya struktur berulang (tree, graph, divide & conquer).

**Kenapa HATI-HATI?** Bisa stack overflow kalo base case lupa.

```typescript
// Tanpa Base Case → STACK OVERFLOW!
function loopMati() {
  console.log("Jalan terus...");
  loopMati(); // RangeError: Maximum call stack size exceeded
}
```

### Contoh Klasik

```typescript
// 1. Faktorial
// 5! = 5 × 4 × 3 × 2 × 1 = 120

function factorial(n: number): number {
  if (n <= 1) return 1; // Base case
  return n * factorial(n - 1); // Recursive case
}
console.log(factorial(5)); // 120

// Visual:
// factorial(5) → 5 * factorial(4)
//             → 5 * 4 * factorial(3)
//             → 5 * 4 * 3 * factorial(2)
//             → 5 * 4 * 3 * 2 * factorial(1)
//             → 5 * 4 * 3 * 2 * 1 = 120

// 2. Fibonacci
// 0, 1, 1, 2, 3, 5, 8, 13, 21...

function fib(n: number): number {
  if (n <= 1) return n; // Base case
  return fib(n - 1) + fib(n - 2); // Recursive case
}
console.log(fib(6)); // 8

// CATATAN: fib(40) bakal lambat — O(2^n). 
// Pake memoization buat optimization!
function fibFast(n: number, memo: Record<number, number> = {}): number {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fibFast(n - 1, memo) + fibFast(n - 2, memo);
  return memo[n];
}
console.log(fibFast(50)); // 12586269025 — INSTANT!
```

### Recursion Patterns

```typescript
// 1. Power of Two
function isPowerOfTwo(n: number): boolean {
  if (n === 1) return true;
  if (n < 1 || n % 2 !== 0) return false;
  return isPowerOfTwo(n / 2);
}

// 2. Sum Array
function sumArray(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr[0] + sumArray(arr.slice(1));
}

// 3. Reverse String
function reverseString(str: string): string {
  if (str === "") return "";
  return reverseString(str.slice(1)) + str[0];
}
console.log(reverseString("halo")); // "olah"
```

### Recursion in Real Code: Tree Traversal

```typescript
// File system browser
interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
}

function printTree(node: FileNode, indent = ""): void {
  console.log(`${indent}${node.type === "folder" ? "📁" : "📄"} ${node.name}`);
  
  if (node.children) {
    for (const child of node.children) {
      printTree(child, indent + "  ");
    }
  }
}

const project: FileNode = {
  name: "my-app",
  type: "folder",
  children: [
    { name: "src", type: "folder", children: [
      { name: "index.ts", type: "file" },
      { name: "utils.ts", type: "file" },
    ]},
    { name: "package.json", type: "file" },
  ]
};

printTree(project);
// 📁 my-app
//   📁 src
//     📄 index.ts
//     📄 utils.ts
//   📄 package.json
```

## Sorting — Ngurutin Data

### Bubble Sort — O(n²) (PELAN!)
Cocok: **ga pernah**. Cuma buat belajar.

```typescript
function bubbleSort(arr: number[]): number[] {
  const result = [...arr];
  const n = result.length;
  
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    
    for (let j = 0; j < n - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    
    if (!swapped) break; // Optimization: udah terurut
  }
  
  return result;
}
// Best: O(n), Worst: O(n²), Memory: O(1)
```

### Quick Sort — O(n log n) (CEPAT!)
Cocok: **default sorting** — paling balanced.

```typescript
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left: number[] = [];
  const right: number[] = [];
  
  // Partition
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}
// Best/Average: O(n log n), Worst: O(n²), Memory: O(log n)
```

### Merge Sort — O(n log n) (STABIL!)
Cocok: **butuh stabil** atau **data besar** (worst case tetep O(n log n)).

```typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return [...result, ...left.slice(i), ...right.slice(j)];
}
// Best/Worst: O(n log n), Memory: O(n)
```

### Sorting Comparison

| Algoritma | Best | Average | Worst | Memory | Stabil |
|-----------|------|---------|-------|--------|--------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| Built-in `.sort()` | O(n log n) | O(n log n) | O(n log n) | Varies | ✅ |

```typescript
// Di TypeScript/JavaScript: PAKE BUILT-IN .sort()!
const arr = [3, 1, 4, 1, 5, 9, 2, 6];

// Default: sort by STRING (BUG!)
console.log(arr.sort()); // [1, 1, 2, 3, 4, 5, 6, 9] — OK somehow

// TAPI kalo ada 2 digit:
const nums = [3, 10, 1, 20];
console.log(nums.sort()); // [1, 10, 20, 3] — SALAH!

// Always pakai compare function!
console.log(nums.sort((a, b) => a - b)); // [1, 3, 10, 20] ✅
console.log(nums.sort((a, b) => b - a)); // [20, 10, 3, 1] ✅ Descending
```

## Latihan

1. **Countdown** — bikin function countdown(n) pake recursion: `countdown(5)` → 5, 4, 3, 2, 1, "Go!"
2. **Sum of Digits** — `sumDigits(123)` → 1+2+3 = 6 (pake recursion)
3. **Power Calculator** — `power(2, 5)` → 32 (pake recursion)
4. **Binary Search** — cari angka di array terurut pake recursion (O(log n))
5. **Quick Sort String** — implement quick sort buat array of string (case-insensitive)
6. **Find All Paths** — di matrix 3×3, cari semua path dari (0,0) ke (2,2), cuma bisa ke kanan & bawah
7. **Tower of Hanoi** — pindahin 3 cakram dari tiang A ke C, dengan bantuan B. Output setiap langkah
