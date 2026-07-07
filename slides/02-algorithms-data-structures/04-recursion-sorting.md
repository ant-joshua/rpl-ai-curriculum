---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 02. Algorithms & Data Structures"
footer: "Sesi 04: Recursion Sorting"
---

<!-- _class: title -->
# 2.4 Recursion & Sorting

## Recursion

**Function yang manggil dirinya sendiri.**

2 komponen WAJIB:
1. **Base case** — kapan berhenti
2. **Recursive case** — manggil diri sendiri dengan input lebih kecil

```typescript
// Factorial: n! = n * (n-1) * (n-2) * ... * 1
function factorial(n: number): number {
  // Base case
  if (n <= 1) return 1;
  // Recursive case
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120

// Call stack:
// factorial(5) = 5 * factorial(4)
//   factorial(4) = 4 * factorial(3)
//     factorial(3) = 3 * factorial(2)
//       factorial(2) = 2 * factorial(1)
//         factorial(1) = 1 ← base case!
//       = 2 * 1 = 2
//     = 3 * 2 = 6
//   = 4 * 6 = 24
// = 5 * 24 = 120
```

```typescript
// Fibonacci (NAIVE — jangan pake ini, O(2^n)!)
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Fibonacci (OPTIMAL — memoization)
function fibMemo(n: number, memo: Record<number, number> = {}): number {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}
// O(n) — simpan hasil yang udah dihitung
```

## Sorting

### Bubble Sort (O(n²)) — Jangan dipake di production

```typescript
function bubbleSort(arr: number[]): number[] {
  const result = [...arr];
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result.length - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
}
// Pahamin konsepnya aja, jangan pake beneran. .sort() built-in udah O(n log n)
```

### Merge Sort (O(n log n)) — Divide & Conquer

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
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  
  return [...result, ...left.slice(i), ...right.slice(j)];
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]
```

**Visual:** [Merge Sort Animation](https://visualgo.net/en/sorting)

### Quick Sort (O(n log n) average)

```typescript
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left: number[] = [];
  const right: number[] = [];
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}
```

## Latihan

1. Implement `factorial` pake recursion
2. Implement `power(base, exp)` — hitung pangkat pake recursion
3. Implement `fibonacci` pake memoization
4. Implement sorting array pake `.sort()` — kapan harus pake custom sort?
