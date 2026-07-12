# Algoritma & Struktur Data — Exercise #1: Big O Identification

> **Level:** Beginner
> **Topics:** time complexity, Big O notation, algorithm analysis

## Instructions

Identifikasi kompleksitas waktu (Big O) dari setiap fungsi di bawah ini. Tulis jawaban sebagai komentar di atas setiap fungsi.

1. `soal1` — loop tunggal
2. `soal2` — nested loop
3. `soal3` — while loop dengan pembagian 2
4. `soal4` — nested loop dengan perbandingan
5. `soal5` — single loop dengan Map
6. `soal6` — rekursif fibonacci

## Starter Code

```javascript
// Tulis Big O sebagai komentar di atas setiap fungsi
// Contoh: // O(n)

function soal1(arr) {
  for (let i = 0; i < arr.length; i++) console.log(arr[i]);
}

function soal2(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}

function soal3(n) {
  let count = 0;
  while (n > 1) { n = Math.floor(n / 2); count++; }
  return count;
}

function soal4(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

function soal5(arr) {
  const map = new Map();
  for (const num of arr) {
    if (map.has(num)) return true;
    map.set(num, true);
  }
  return false;
}

function soal6(n) {
  if (n <= 1) return n;
  return soal6(n - 1) + soal6(n - 2);
}

// Test: jalankan untuk melihat output
console.log("soal1([1,2,3]): output 3 baris");
console.log("soal2([1,2]): output 4 baris");
console.log("soal3(16):", soal3(16));  // 4
console.log("soal4([1,2,1]):", soal4([1,2,1])); // true
console.log("soal5([1,2,1]):", soal5([1,2,1])); // true
console.log("soal6(10):", soal6(10)); // 55
```

## Expected Output

```
soal1([1,2,3]): output 3 baris
soal2([1,2]): output 4 baris
soal3(16): 4
soal4([1,2,1]): true
soal5([1,2,1]): true
soal6(10): 55
```

## Test Cases

```javascript
// Jawaban Big O:
// soal1: O(n)
// soal2: O(n²)
// soal3: O(log n)
// soal4: O(n²)
// soal5: O(n)
// soal6: O(2^n)

console.log(soal3(32) === 5);     // true
console.log(soal3(64) === 6);     // true
console.log(soal6(10) === 55);    // true
console.log(soal6(15) === 610);   // true
```
