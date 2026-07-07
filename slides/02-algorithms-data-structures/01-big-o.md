---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 02. Algorithms & Data Structures"
footer: "Sesi 01: Big O"
---

<!-- _class: title -->
# 2.1 Big O Notation

**Big O = cara ngukur seberapa cepet kode jalan, dalam jumlah langkah (bukan detik).**

## Analogi

> "Cari buku 'JavaScript' di rak 1000 buku."

| Cara | Langkah | Big O |
|------|---------|-------|
| Baca satu-satu dari awal | 1000 langkah | O(n) |
| Mulai dari tengah (rak berurutan abjad) | ~10 langkah | O(log n) |
| Tau persis posisinya | 1 langkah | O(1) |

## Jenis Big O (dari paling cepet)

```
O(1)      → Constant   — Ga peduli seberapa besar input
O(log n)  → Logarithmic — Makin besar input, tambahannya dikit
O(n)      → Linear      — Proporsional sama input
O(n log n)→ Linearithmic — Sorting efficient
O(n²)     → Quadratic   — Loop di dalem loop (LAMBAT!)
O(2^n)    → Exponential — Jangan dipake (fibonacci rekursif)
```

## Contoh Kode

```typescript
// O(1) — Constant: langsung akses index
function getFirst(arr: number[]): number {
  return arr[0]; // 1 langkah, berapapun size arr
}

// O(n) — Linear: iterasi semua item
function findMax(arr: number[]): number {
  let max = -Infinity;
  for (const num of arr) {  // n langkah
    if (num > max) max = num;
  }
  return max;
}

// O(n²) — Quadratic: nested loop
function findDuplicates(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {       // n
    for (let j = i + 1; j < arr.length; j++) {  // n
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}
// Input 10 item → 100 langkah. Input 1000 → 1.000.000 langkah. NGERI!
```

## Aturan Sederhana

1. **Drop constants:** O(2n) = O(n). O(100) = O(1)
2. **Drop non-dominants:** O(n + n²) = O(n²). Ambil yang paling gede
3. **Different inputs → different variables:** Input a dan b → O(a + b), bukan O(2n)

## Space Complexity

```typescript
// O(1) — ga pake memory tambahan
function sum(arr: number[]): number {
  let total = 0;  // cuma 1 variable
  for (const n of arr) total += n;
  return total;
}

// O(n) — bikin array baru sebesar input
function double(arr: number[]): number[] {
  return arr.map(n => n * 2);  // array baru sepanjang arr
}
```

## Latihan Big O

Tentukan Big O dari:

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
```

**Jawaban:** Soal 1 = O(1), Soal 2 = O(n), Soal 3 = O(n²)
