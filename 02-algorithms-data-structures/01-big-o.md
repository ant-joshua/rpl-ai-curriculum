# 2.1 Big O Notation — Ukur Kecepatan Kode

**Big O = bahasa buat ngomongin "seberapa cepet" kode jalan**, dalam jumlah langkah, bukan detik. Detik beda-beda tergantung komputer. Langkah = absolut.

## Kenapa Big O Penting?

```typescript
// Dua function sama-sama cari nilai max — mana yang lebih cepet?

// Function A: O(n²) — 1.000.000 langkah buat input 1000
function findMaxSlow(arr: number[]): number {
  let max = arr[0];
  for (let i = 0; i < arr.length; i++) {
    let isMax = true;
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] > arr[i]) isMax = false;
    }
    if (isMax) return arr[i];
  }
  return max;
}

// Function B: O(n) — 1000 langkah buat input 1000
function findMaxFast(arr: number[]): number {
  let max = arr[0];
  for (const num of arr) {
    if (num > max) max = num;
  }
  return max;
}

// Bedanya: 1000x lebih cepet. Makin gede input, makin kerasa bedanya!
```

## Analogi Sederhana

> **"Cari buku 'JavaScript' di rak 1000 buku."**

| Cara | Langkah | Big O | Julukan |
|------|---------|-------|---------|
| Baca satu-satu dari awal | 1000 langkah | O(n) | Linear |
| Mulai dari tengah (rak urut abjad) | ~10 langkah | O(log n) | Logaritmik |
| Tau persis posisinya | 1 langkah | O(1) | Konstan |
| Cari pasangan buku: cocokin semua mungkin | 1.000.000 langkah | O(n²) | Quadratic |

## Jenis Big O (Dari Paling Cepet)

```typescript
// O(1) — CONSTANT: Ga peduli seberapa besar input, langkah tetap!
function getFirst(arr: number[]): number {
  return arr[0]; // 1 langkah, mau array 10 atau 10 juta item
}

// O(log n) — LOGARITHMIC: Input 2x lipat, langkah nambah dikit
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
// Input 1000 → ~10 langkah. Input 1.000.000 → ~20 langkah.
// Setiap kali input 2x lipat, langkah cuma nambah 1!

// O(n) — LINEAR: Input 2x lipat, langkah 2x lipat
function findMax(arr: number[]): number {
  let max = -Infinity;
  for (const num of arr) {  // n langkah
    if (num > max) max = num;
  }
  return max;
}

// O(n log n) — LINEARRITHMIC: Sorting efficient (Merge Sort, Quick Sort)
// Gabungan linear + logarithmic. Paling umum buat sorting.

// O(n²) — QUADRATIC: Input 2x lipat, langkah 4x lipat! PELAN!
function findDuplicates(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {       // n
    for (let j = i + 1; j < arr.length; j++) {  // n
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}
// Input 10 → 45 langkah. Input 100 → 4950 langkah. Input 1000 → 499500 langkah!

// O(2^n) — EXPONENTIAL: JANGAN DIPAKE kalo ga ada optimasi!
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
// fib(40) = 331.160.281 langkah! Lama banget.
```

## Grafik Visual

```
Langkah
  ^
  |                O(n²) = 📈📈📈
  |              /
  |         O(n log n) = 📈📈
  |        /
  |   O(n) = 📈
  |  /
  | O(log n) = _
  | O(1) = —
  +------------------------> Input size
```

## Aturan Sederhana

### 1. Drop Constants — O(2n) = O(n)
```typescript
function minMax(arr: number[]): [number, number] {
  let min = Infinity, max = -Infinity;
  for (const n of arr) { if (n < min) min = n; }  // n
  for (const n of arr) { if (n > max) max = n; }  // n
  // Total: 2n → O(2n) → O(n)
  return [min, max];
}

// Better: satu loop, tetep O(n)
function minMaxBetter(arr: number[]): [number, number] {
  let min = Infinity, max = -Infinity;
  for (const n of arr) {
    if (n < min) min = n;
    if (n > max) max = n;
  }
  return [min, max];
}
// Dua-duanya O(n). Constants gak ngaruh.
```

### 2. Drop Non-Dominants — O(n + n²) = O(n²)
```typescript
function process(arr: number[]): void {
  for (const n of arr) { console.log(n); }  // O(n)
  
  for (let i = 0; i < arr.length; i++) {     // O(n²)
    for (let j = 0; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}
// Total: O(n + n²) → O(n²). Yang gede doang yang diitung.
```

### 3. Different Inputs → Different Variables
```typescript
// Input a dan b → O(a + b), bukan O(2n)!
function processTwo(arr1: number[], arr2: number[]): void {
  for (const n of arr1) console.log(n);  // O(a)
  for (const n of arr2) console.log(n);  // O(b)
  // Total: O(a + b)
}

// Nested tapi different inputs → O(a * b)
function crossProduct(arr1: number[], arr2: number[]): void {
  for (const a of arr1) {      // O(a)
    for (const b of arr2) {    // O(b)
      console.log(a, b);        // O(a * b)
    }
  }
}
```

## Space Complexity — Memory Juga Penting

Big O bukan cuma waktu — juga **memory** yang dipake.

```typescript
// O(1) — ga pake memory tambahan
function sum(arr: number[]): number {
  let total = 0;  // Cuma 1 variable, ga peduli besar arr
  for (const n of arr) total += n;
  return total;
}

// O(n) — bikin array baru sebesar input
function double(arr: number[]): number[] {
  return arr.map(n => n * 2);  // Array baru sepanjang arr
}

// O(n) — string concatenation
function reverseString(str: string): string {
  let reversed = "";
  for (const char of str) {
    reversed = char + reversed;  // String baru terus
  }
  return reversed;
}
```

## Cheatsheet Cepet

| Big O | Nama | Contoh | 100 item | 10.000 item |
|-------|------|--------|---------|------------|
| O(1) | Constant | Akses array index, hash table lookup | 1 langkah | 1 langkah |
| O(log n) | Logarithmic | Binary search, Balanced BST | ~7 langkah | ~14 langkah |
| O(n) | Linear | Looping array, Linear search | 100 langkah | 10.000 langkah |
| O(n log n) | Linearithmic | Merge sort, Quick sort | ~700 langkah | ~132.877 langkah |
| O(n²) | Quadratic | Nested loop, Bubble sort | 10.000 langkah | 100.000.000 langkah |
| O(2^n) | Exponential | Fibonacci rekursif | 1.27e30 langkah | 2^10000 = ∞ |

## Latihan

Tentukan Big O dari function berikut:

```typescript
// Soal 1
function mystery(arr: number[]) {
  console.log(arr[0]);
  console.log(arr[Math.floor(arr.length / 2)]);
  console.log(arr[arr.length - 1]);
}

// Soal 2
function containsPair(arr: number[], target: number): boolean {
  const seen = new Set<number>();
  for (const num of arr) {
    if (seen.has(target - num)) return true;
    seen.add(num);
  }
  return false;
}

// Soal 3
function printPairs(arr: number[]) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}

// Soal 4
function printUnorderedPairs(arr: number[]) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}

// Soal 5
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// Soal 6
function allFib(n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    result.push(fib(i));
  }
  return result;
}
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
```

**Jawaban:** Soal 1 = O(1), Soal 2 = O(n), Soal 3 = O(n²), Soal 4 = O(n²) (dengan note O(n²/2) → O(n²)), Soal 5 = O(n), Soal 6 = O(2^n) karena fib dipanggil di loop
