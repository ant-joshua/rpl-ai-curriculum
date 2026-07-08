# 1.4 Functions — Bikin Kode yang Bisa Dipake Ulang

Function = blok kode dengan nama, bisa dipanggil kapan aja. Prinsip **DRY (Don't Repeat Yourself)**.

## Deklarasi Function

```javascript
// Cara 1: Function Declaration
function sapa(nama) {
  return `Halo, ${nama}!`;
}
console.log(sapa("Budi")); // "Halo, Budi!"

// Cara 2: Function Expression (disimpen di variable)
const sapaV2 = function(nama) {
  return `Halo, ${nama}!`;
};

// Cara 3: Arrow Function (MODERN — favorit!)
const sapaV3 = (nama) => {
  return `Halo, ${nama}!`;
};

// Cara 4: Arrow Function (satu baris, return implisit)
const sapaV4 = nama => `Halo, ${nama}!`;
```

## Function Declaration vs Arrow Function

| Aspek | Function Declaration | Arrow Function |
|-------|---------------------|----------------|
| Syntax | `function()` | `() =>` |
| `this` | Dynamic (nge-this dari caller) | Lexical (nge-this dari sekitar) |
| Hoisting | Diangkat ke atas | Tidak |
| `arguments` object | Ada | Tidak (pake rest parameter) |
| Bisa jadi constructor | Ya (`new`) | Tidak |

```javascript
// Hoisting — function declaration bisa dipanggil SEBELUM deklarasi
console.log(kuadrat(5)); // 25 — HOISTING works!
function kuadrat(n) {
  return n * n;
}

/// Arrow tidak di-hoist
// console.log(kali(5, 2)); // ReferenceError: Cannot access before initialization
const kali = (a, b) => a * b;
```

## Parameter & Arguments

```javascript
// Multiple parameter
function tambah(a, b) {
  return a + b;
}

// Default parameter — kalo ga dikasih argumen
function sapa(nama = "Teman") {
  return `Halo, ${nama}!`;
}
console.log(sapa());        // "Halo, Teman!"
console.log(sapa("Budi")); // "Halo, Budi!"

// Rest parameter — kumpulin sisa argumen
function jumlahin(judul, ...angka) {
  const total = angka.reduce((a, b) => a + b, 0);
  return `${judul}: ${total}`;
}
console.log(jumlahin("Total", 1, 2, 3, 4, 5)); // "Total: 15"

// Named parameter pake destructuring
function createUser({ nama, umur = 17, kelas = "XII RPL" }) {
  return { nama, umur, kelas, createdAt: new Date() };
}
const user = createUser({ nama: "Budi" });
console.log(user); // { nama: "Budi", umur: 17, kelas: "XII RPL", ... }
```

## Higher-Order Functions (HOF) — Function dalam Function

HOF = function yang **menerima function sebagai argumen** atau **me-return function**.

```javascript
// 1. Callback — function sebagai argumen
function prosesAngka(angka, callback) {
  return callback(angka);
}

const double = n => n * 2;
console.log(prosesAngka(5, double)); // 10

// Langsung (inline)
console.log(prosesAngka(5, n => n * 2)); // 10

// 2. Function Factory — me-return function
function buatKalkulator(operasi) {
  return (a, b) => {
    switch (operasi) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 ? a / b : "Error: bagi 0";
      default: return "Operasi ga dikenal";
    }
  };
}

const tambah = buatKalkulator("+");
const kali = buatKalkulator("*");
console.log(tambah(10, 5)); // 15
console.log(kali(3, 4));    // 12

// 3. Closure — function inget variable dari scope luar
function counter() {
  let count = 0; // Private variable!
  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count
  };
}

const myCounter = counter();
console.log(myCounter.increment()); // 1
console.log(myCounter.increment()); // 2
console.log(myCounter.decrement()); // 1
console.log(myCounter.getValue());  // 1
```

## Pure Function vs Side Effects

```javascript
// Pure function — input sama → output sama, ga ngaruh ke luar
function tambahPure(a, b) {
  return a + b;
}

// Impure function — punya side effect
let total = 0;
function tambahImpure(n) {
  total += n; // Side effect: ngubah variable luar!
  return total;
}
```

**Kenapa pure function penting?** Predictable, gampang di-test, gampang di-debug.

## Method Chaining

Function yang me-return `this` (object-nya sendiri) sehingga bisa dirantai:

```javascript
const kalkulator = {
  nilai: 0,
  tambah(n) { this.nilai += n; return this; },
  kurang(n) { this.nilai -= n; return this; },
  kali(n) { this.nilai *= n; return this; },
  bagi(n) { if (n !== 0) this.nilai /= n; return this; },
  hasil() { console.log(`Hasil: ${this.nilai}`); return this; }
};

kalkulator
  .tambah(10)
  .kali(2)
  .kurang(5)
  .bagi(3)
  .hasil(); // Hasil: 5
```

## Error Handling in Functions

```javascript
function bagi(a, b) {
  // Guard clause — cek dulu, kalo error langsung return/throw
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Input harus number");
  }
  if (b === 0) {
    throw new Error("Pembagian dengan nol!");
  }
  return a / b;
}

// Try-catch
try {
  const result = bagi(10, 0);
  console.log(result);
} catch (error) {
  console.error(`Error: ${error.message}`);
} finally {
  console.log("Kode ini jalan terus");
}
```

## Latihan

1. **Utility Library**
   Bikin 10 function dalam satu module:
   - `generatePassword(length)` — random password (huruf + angka + simbol)
   - `isPalindrome(str)` — cek palindrome (kasur rusak → true)
   - `validateEmail(email)` — validasi format email (pake regex)
   - `formatRupiah(number)` — 1000000 → "Rp1.000.000"
   - `capitalize(str)` — "budi" → "Budi"
   - `reverseString(str)` — "halo" → "olah"
   - `countVowels(str)` — hitung huruf vokal
   - `isPrime(n)` — cek bilangan prima
   - `factorial(n)` — faktorial (5! = 5*4*3*2*1)
   - `shuffleArray(arr)` — acak array (Fisher-Yates)

2. **Function Composition**
   ```javascript
   const pipe = (...functions) => (input) => 
     functions.reduce((acc, fn) => fn(acc), input);
   
   // Bikin:
   const toLowerCase = str => str.toLowerCase();
   const removeSpaces = str => str.replace(/\s/g, "");
   const reverse = str => str.split("").reverse().join("");
   
   const transform = pipe(toLowerCase, removeSpaces, reverse);
   console.log(transform("Halo Dunia")); // ?
   ```

3. **Mini Project: Todo List**
   ```javascript
   const todoList = {
     items: [],
     add(task) { /* implement */ },
     remove(id) { /* implement */ },
     toggle(id) { /* implement */ },
     list() { /* tampilkan semua */ },
     getStats() { /* total, selesai, pending */ }
   };
   ```

4. **Recursion — Function panggil diri sendiri**
   ```javascript
   // Faktorial pake recursion
   function factorial(n) {
     if (n <= 1) return 1; // Base case
     return n * factorial(n - 1); // Recursive case
   }
   console.log(factorial(5)); // 120
   
   // Fibonacci pake recursion
   function fib(n) {
     if (n <= 1) return n;
     return fib(n - 1) + fib(n - 2);
   }
   // Catatan: ini slow untuk n besar — ada optimization (memoization)
   ```

5. **Debounce & Throttle**
   ```javascript
   // Debounce — nunggu jeda dulu baru jalan
   function debounce(fn, delay) {
     let timer;
     return (...args) => {
       clearTimeout(timer);
       timer = setTimeout(() => fn(...args), delay);
     };
   }
   
   // Throttle — jalan maksimal sekali per interval
   function throttle(fn, limit) {
     let inThrottle = false;
     return (...args) => {
       if (!inThrottle) {
         fn(...args);
         inThrottle = true;
         setTimeout(() => inThrottle = false, limit);
       }
     };
   }
   ```
