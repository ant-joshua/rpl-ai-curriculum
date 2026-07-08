# 🏋️ Latihan JavaScript

> 20+ latihan JavaScript dari dasar sampai lanjutan. Setiap soal ada starter code dan expected output.
> Kerjakan dengan TypeScript, jalankan dengan `tsx` atau `ts-node`.

---

## 📋 Daftar Isi

| # | Topik | Level |
|---|-------|-------|
| 1 | Variable & Operator | 🌱 Beginner |
| 2 | Conditional (if-else) | 🌱 Beginner |
| 3 | Loops (Pattern) | 🌱 Beginner |
| 4 | Array Methods | 🌱 Beginner |
| 5 | String Manipulation | 🌱 Beginner |
| 6 | Object & Nested Object | 🌱 Beginner |
| 7 | Function — Return vs Void | 🌱 Beginner |
| 8 | Rest & Spread Operator | 🌱 Beginner |
| 9 | Array — Map, Filter, Reduce | 🌱 Beginner |
| 10 | Array — Sort & Search | 🌱 Beginner |
| 11 | Date & Time | 🌱 Beginner |
| 12 | Math & Random | 🌱 Beginner |
| 13 | Callback Function | 📐 Intermediate |
| 14 | Promise & Chaining | 📐 Intermediate |
| 15 | Async/Await & Fetch | 📐 Intermediate |
| 16 | Closure & Lexical Scope | 📐 Intermediate |
| 17 | Higher-Order Function | 📐 Intermediate |
| 18 | DOM Manipulation | 📐 Intermediate |
| 19 | Event Handling | 📐 Intermediate |
| 20 | LocalStorage | 📐 Intermediate |
| 21 | Error Handling (try/catch) | 📐 Intermediate |
| 22 | Debounce & Throttle | 🚀 Advanced |
| 23 | Currying & Partial Application | 🚀 Advanced |
| 24 | Prototype & Class | 🚀 Advanced |
| 25 | Async Iterator & Generator | 🚀 Advanced |

---

## 🌱 Beginner

### 1. Variable & Operator

```typescript
function celsiusToFahrenheit(celsius: number): number {
  // === KODE LO DISINI ===
  // Rumus: (celsius * 9/5) + 32
}
console.log(celsiusToFahrenheit(30)); // 86
console.log(celsiusToFahrenheit(0));   // 32
console.log(celsiusToFahrenheit(-10)); // 14
```

**Expected Output:**
```
86
32
14
```

---

### 2. Conditional (if-else)

```typescript
function getGrade(nilai: number): string {
  // >= 90: A, >= 80: B, >= 70: C, >= 60: D, < 60: E
  // === KODE LO DISINI ===
}
console.log(getGrade(85));  // "B"
console.log(getGrade(95));  // "A"
console.log(getGrade(60));  // "D"
console.log(getGrade(45));  // "E"
```

**Expected Output:**
```
B
A
D
E
```

---

### 3. Loops — Bintang

```typescript
function printStar(n: number): void {
  // Cetak pola segitiga:
  // *
  // **
  // ***
  // ****
  // *****
  // === KODE LO DISINI ===
}
printStar(5);
```

**Expected Output:**
```
*
**
***
****
*****
```

**Variasi:** Buat juga `printStarReverse(n)` yang mencetak pola terbalik.

---

### 4. String Manipulation

```typescript
function reverseString(str: string): string {
  // Balik string tanpa .reverse()
  // Contoh: "Hello" -> "olleH"
  // === KODE LO DISINI ===
}

function isPalindrome(str: string): boolean {
  // Cek apakah string adalah palindrome
  // "katak" -> true, "mobil" -> false
  // Hint: balik string, bandingkan
  // === KODE LO DISINI ===
}

console.log(reverseString("Hello"));   // "olleH"
console.log(isPalindrome("katak"));    // true
console.log(isPalindrome("mobil"));    // false
```

**Expected Output:**
```
olleH
true
false
```

---

### 5. Object & Nested Object

```typescript
interface Student {
  name: string;
  age: number;
  scores: { math: number; science: number; english: number };
}

function getAverageScore(student: Student): number {
  // Hitung rata-rata dari math, science, english
  // === KODE LO DISINI ===
}

const student: Student = {
  name: "Budi",
  age: 17,
  scores: { math: 85, science: 90, english: 78 },
};

console.log(getAverageScore(student)); // 84.33...
```

**Expected Output:**
```
84.333...
```

---

### 6. Function — Return vs Void

```typescript
// Fungsi 1: hitungDiskon — return price setelah diskon
function hitungDiskon(price: number, discountPercent: number): number {
  // === KODE LO DISINI ===
}

// Fungsi 2: cetakStruk — void, console.log struk belanja
function cetakStruk(items: string[], total: number): void {
  // Cetak:
  // === STRUK BELANJA ===
  // 1. item1
  // 2. item2
  // Total: RpXXXX
  // === TERIMA KASIH ===
  // === KODE LO DISINI ===
}

console.log(hitungDiskon(50000, 20)); // 40000
cetakStruk(["Nasi Goreng", "Es Teh", "Pisang Goreng"], 45000);
```

**Expected Output:**
```
40000
=== STRUK BELANJA ===
1. Nasi Goreng
2. Es Teh
3. Pisang Goreng
Total: Rp45000
=== TERIMA KASIH ===
```

---

### 7. Rest & Spread Operator

```typescript
// Gabung dua array pake spread
function gabungArray<T>(arr1: T[], arr2: T[]): T[] {
  // === KODE LO DISINI ===
}

// Hitung rata-rata dari banyak angka pake rest parameter
function rataRata(...angka: number[]): number {
  // === KODE LO DISINI ===
}

// Clone object dan tambah properti baru
function cloneAndAdd<T extends object>(obj: T, key: string, value: unknown): object {
  // === KODE LO DISINI ===
}

console.log(gabungArray([1, 2], [3, 4]));        // [1, 2, 3, 4]
console.log(rataRata(10, 20, 30, 40));            // 25
console.log(cloneAndAdd({ nama: "Budi" }, "umur", 17));
// { nama: "Budi", umur: 17 }
```

**Expected Output:**
```
[1, 2, 3, 4]
25
{ nama: "Budi", umur: 17 }
```

---

### 8. Array — Map, Filter, Reduce

```typescript
const products = [
  { name: "Nasi", price: 5000, category: "makanan" },
  { name: "Telur", price: 2500, category: "makanan" },
  { name: "Kopi", price: 15000, category: "minuman" },
  { name: "Roti", price: 12000, category: "makanan" },
  { name: "Air Mineral", price: 3000, category: "minuman" },
];

// 8a. Filter produk yang harganya > 10000
function expensiveProducts(items: typeof products) {
  // === KODE LO DISINI ===
}

// 8b. Map: ambil nama produk aja
function productNames(items: typeof products): string[] {
  // === KODE LO DISINI ===
}

// 8c. Reduce: hitung total harga semua produk
function totalPrice(items: typeof products): number {
  // === KODE LO DISINI ===
}

// 8d. Chain: filter category makanan, lalu map nama
function makananNames(items: typeof products): string[] {
  // === KODE LO DISINI ===
}

console.log(expensiveProducts(products));
console.log(productNames(products));
console.log(totalPrice(products));
console.log(makananNames(products));
```

**Expected Output:**
```
[ { name: 'Kopi', price: 15000, category: 'minuman' }, { name: 'Roti', price: 12000, category: 'makanan' } ]
[ 'Nasi', 'Telur', 'Kopi', 'Roti', 'Air Mineral' ]
37500
[ 'Nasi', 'Telur', 'Roti' ]
```

---

### 9. Array — Sort & Search

```typescript
const students = [
  { name: "Ani", score: 85 },
  { name: "Budi", score: 92 },
  { name: "Cici", score: 78 },
  { name: "Dodi", score: 95 },
];

// Sort descending by score
function sortByScoreDesc(arr: typeof students): typeof students {
  // === KODE LO DISINI ===
}

// Cari student dengan score tertinggi
function findTopStudent(arr: typeof students): (typeof students)[0] | null {
  // === KODE LO DISINI ===
}

// Cari index student berdasarkan nama
function findStudentIndex(arr: typeof students, name: string): number {
  // === KODE LO DISINI ===
}

console.log(sortByScoreDesc(students));
console.log(findTopStudent(students));
console.log(findStudentIndex(students, "Cici"));
```

**Expected Output:**
```
[ { name: 'Dodi', score: 95 }, { name: 'Budi', score: 92 }, { name: 'Ani', score: 85 }, { name: 'Cici', score: 78 } ]
{ name: 'Dodi', score: 95 }
2
```

---

### 10. Date & Time

```typescript
function formatDate(date: Date): string {
  // Format: "17 Agustus 2025"
  // Gunakan array nama bulan
  // === KODE LO DISINI ===
}

function daysUntilBirthday(birthday: Date): number {
  // Hitung berapa hari lagi dari hari ini ke birthday tahun depan
  // === KODE LO DISINI ===
}

function isWeekend(date: Date): boolean {
  // Cek apakah hari Sabtu atau Minggu
  // === KODE LO DISINI ===
}

console.log(formatDate(new Date(2025, 7, 17))); // "17 Agustus 2025"
console.log(isWeekend(new Date(2025, 6, 13)));   // true (Minggu)
```

**Expected Output:**
```
17 Agustus 2025
true
```

---

### 11. Math & Random

```typescript
// Generate random integer antara min dan max (inclusive)
function randomInt(min: number, max: number): number {
  // === KODE LO DISINI ===
}

// Generate array berisi n angka random unik
function randomUnique(n: number, min: number, max: number): number[] {
  // === KODE LO DISINI ===
}

// Hitung luas lingkaran (π = 3.14159)
function luasLingkaran(r: number): number {
  // === KODE LO DISINI ===
}

console.log(randomInt(1, 10));     // 3 (random)
console.log(luasLingkaran(7));     // 153.938...
```

**Expected Output:**
```
3       (nilai random, bisa beda)
153.938 (nilai fix)
```

---

## 📐 Intermediate

### 12. Callback Function

```typescript
// Filter array pake callback
function filterArray<T>(arr: T[], callback: (item: T) => boolean): T[] {
  // === KODE LO DISINI ===
}

// Map array pake callback
function mapArray<T, U>(arr: T[], callback: (item: T) => U): U[] {
  // === KODE LO DISINI ===
}

// forEach — jalanin callback buat tiap item
function forEachArray<T>(arr: T[], callback: (item: T, index: number) => void): void {
  // === KODE LO DISINI ===
}

const numbers = [1, 2, 3, 4, 5, 6];
console.log(filterArray(numbers, (n) => n % 2 === 0)); // [2, 4, 6]
console.log(mapArray(numbers, (n) => n * 2));           // [2, 4, 6, 8, 10, 12]
forEachArray(numbers, (n, i) => console.log(`[${i}]: ${n}`));
```

**Expected Output:**
```
[2, 4, 6]
[2, 4, 6, 8, 10, 12]
[0]: 1
[1]: 2
[2]: 3
[3]: 4
[4]: 5
[5]: 6
```

---

### 13. Promise & Chaining

```typescript
// Buat promise yang resolve setelah delay tertentu
function delay(ms: number): Promise<void> {
  // === KODE LO DISINI ===
}

// Simulasi fetch data user
function fetchUser(id: number): Promise<{ id: number; name: string }> {
  // === KODE LO DISINI ===
  // Promise yang resolve dengan object { id, name: "User " + id }
  // reject kalau id < 1
}

// Chain: fetch user 1 -> print nama -> delay 1 detik -> fetch user 2
fetchUser(1)
  .then((user) => {
    console.log("User 1:", user.name);
    return delay(1000);
  })
  .then(() => fetchUser(2))
  .then((user) => console.log("User 2:", user.name))
  .catch((err) => console.error("Error:", err));
```

**Expected Output (setelah 1 detik delay):**
```
User 1: User 1
User 2: User 2
```

---

### 14. Async/Await & Fetch

```typescript
// Fetch data dari public API
async function getQuote(): Promise<string> {
  const url = "https://api.quotable.io/random";
  // Fetch, parse JSON, return content
  // Pakai try/catch
  // === KODE LO DISINI ===
}

// Fetch multiple data parallel
async function getMultipleQuotes(count: number): Promise<string[]> {
  // Gunakan Promise.all untuk fetch count quotes sekaligus
  // === KODE LO DISINI ===
}

// getQuote().then(console.log);
// getMultipleQuotes(3).then(console.log);
```

**Catatan:** API quotable mungkin berubah. Alternatif: gunakan JSONPlaceholder.

---

### 15. Closure & Lexical Scope

```typescript
// Buat counter function pake closure
function createCounter(): () => number {
  let count = 0;
  // === KODE LO DISINI ===
  // Return function yang increment dan return count
}

// Buat function yang bisa ngasih akses terbatas ke variable private
function createBankAccount(initialBalance: number) {
  let balance = initialBalance;
  return {
    deposit: (amount: number) => { balance += amount; return balance; },
    withdraw: (amount: number) => {
      if (amount > balance) return "Saldo tidak cukup";
      balance -= amount;
      return balance;
    },
    checkBalance: () => balance,
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

const account = createBankAccount(100000);
console.log(account.deposit(50000));   // 150000
console.log(account.withdraw(20000));  // 130000
console.log(account.checkBalance());   // 130000
console.log(account.withdraw(200000)); // "Saldo tidak cukup"
```

**Expected Output:**
```
1
2
3
150000
130000
130000
Saldo tidak cukup
```

---

### 16. Higher-Order Function

```typescript
// Function yang return function (currying style)
function multiplyBy(factor: number): (num: number) => number {
  // === KODE LO DISINI ===
}

// Function composition: gabung dua function
function compose<T>(f: (x: T) => T, g: (x: T) => T): (x: T) => T {
  // === KODE LO DISINI ===
}

// Debounce helper (versi sederhana)
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const double = multiplyBy(2);
const triple = multiplyBy(3);
console.log(double(5));  // 10
console.log(triple(5));  // 15

const add1 = (x: number) => x + 1;
const times2 = (x: number) => x * 2;
const add1ThenTimes2 = compose(times2, add1);
console.log(add1ThenTimes2(5)); // (5+1)*2 = 12
```

**Expected Output:**
```
10
15
12
```

---

### 17. DOM Manipulation

> Soal ini jalan di browser. Gunakan HTML terpisah.

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<body>
  <div id="app">
    <h1>Todo App</h1>
    <input id="todoInput" type="text" placeholder="Tambah todo..." />
    <button id="addBtn">Tambah</button>
    <ul id="todoList"></ul>
  </div>
  <script src="dom-exercise.ts"></script>
</body>
</html>
```

```typescript
// Tugas: Manipulasi DOM
// 1. Ambil referensi input, button, dan ul
// 2. Saat button diklik: baca value input, buat <li>, append ke ul
// 3. Setiap <li> punya tombol hapus
// 4. Input kosong setelah tambah

// === KODE LO DISINI ===
```

**Expected Behavior:**
- Ketik "Belajar JS" di input → klik Tambah → muncul `<li>Belajar JS <button>Hapus</button></li>`
- Klik Hapus → item hilang
- Input kosong lagi setelah tambah

---

### 18. Event Handling

```typescript
// === KODE LO DISINI ===

// Tugas:
// 1. Buat form login sederhana (dengan DOM)
// 2. Handle submit event — prevent default
// 3. Validasi: email harus mengandung '@', password min 6 karakter
// 4. Tampilkan error message di <p id="error">
// 5. Kalau valid, tampilkan alert("Login berhasil!")

// Gunakan:
// document.getElementById, addEventListener, preventDefault
```

---

### 19. LocalStorage

```typescript
// === KODE LO DISINI ===

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

// Tugas:
// 1. Buat function saveNotes(notes: Note[]): void — simpan ke localStorage
// 2. Buat function loadNotes(): Note[] — baca dari localStorage
// 3. Buat function addNote(title: string, content: string): void
// 4. Buat function deleteNote(id: string): void
// 5. Buat function renderNotes(): void — tampilkan di DOM

// Contoh penggunaan:
// addNote("Belajar TS", "TypeScript itu keren!");
// console.log(loadNotes()); // [{ id: "...", title: "Belajar TS", ... }]
```

---

### 20. Error Handling (try/catch)

```typescript
// Fungsi yang sengaja throw error
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Pembagian dengan nol!");
  if (typeof a !== "number" || typeof b !== "number") throw new TypeError("Harus number!");
  // === KODE LO DISINI ===
}

// Fungsi safe wrapper
function safeDivide(a: number, b: number): { success: boolean; result?: number; error?: string } {
  // Wrap divide dalam try/catch, return object dengan success status
  // === KODE LO DISINI ===
}

// Custom error class
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateUser(data: { name?: string; age?: number }): void {
  const errors: string[] = [];
  if (!data.name) errors.push("Nama wajib diisi");
  if (!data.age || data.age < 0) errors.push("Umur tidak valid");
  if (errors.length > 0) throw new ValidationError("user", errors.join(", "));
}

console.log(safeDivide(10, 2));       // { success: true, result: 5 }
console.log(safeDivide(10, 0));       // { success: false, error: "Pembagian dengan nol!" }
console.log(safeDivide("a" as any, 2)); // { success: false, error: "Harus number!" }

try {
  validateUser({ name: "" });
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(`${e.field}: ${e.message}`);
  }
}
```

**Expected Output:**
```
{ success: true, result: 5 }
{ success: false, error: "Pembagian dengan nol!" }
{ success: false, error: "Harus number!" }
user: Nama wajib diisi
```

---

## 🚀 Advanced

### 21. Debounce & Throttle

```typescript
// === KODE LO DISINI ===

// Implementasi debounce
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Implementasi throttle
function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// Test
const logDebounced = debounce((msg: string) => console.log("Debounced:", msg), 500);
const logThrottled = throttle((msg: string) => console.log("Throttled:", msg), 1000);

logDebounced("test"); // jalan setelah 500ms idle
logThrottled("test"); // jalan langsung, lalu delay 1s
```

---

### 22. Currying & Partial Application

```typescript
// === KODE LO DISINI ===

// Curried function: ubah fungsi 3 parameter jadi chain
function curry3(fn: (a: number, b: number, c: number) => number) {
  return (a: number) => (b: number) => (c: number) => fn(a, b, c);
}

// Partial application: fix parameter pertama
function partial<T extends any[], U extends any[], R>(
  fn: (...args: [...T, ...U]) => R,
  ...presetArgs: T
): (...args: U) => R {
  return (...laterArgs: U) => fn(...presetArgs, ...laterArgs);
}

const sum = (a: number, b: number, c: number) => a + b + c;
const curriedSum = curry3(sum);
console.log(curriedSum(1)(2)(3)); // 6

const add5 = partial(sum, 5);
console.log(add5(10, 15)); // 30 (5 + 10 + 15)
```

**Expected Output:**
```
6
30
```

---

### 23. Prototype & Class

```typescript
// === KODE LO DISINI ===

// Buat class Animal dengan method speak()
// Buat class Dog yang extends Animal, override speak()
// Buat class Cat yang extends Animal, override speak()

class Animal {
  constructor(public name: string) {}
  speak(): string {
    return `${this.name} bersuara`;
  }
}

class Dog extends Animal {
  constructor(name: string) {
    super(name);
  }
  speak(): string {
    return `${this.name} menggonggong: GUK GUK!`;
  }
}

class Cat extends Animal {
  constructor(name: string) {
    super(name);
  }
  speak(): string {
    return `${this.name} mengeong: MEOW!`;
  }
}

// Static method
class MathUtil {
  static PI = 3.14159;
  static circleArea(r: number): number {
    return this.PI * r * r;
  }
}

// Private field (#)
class BankAccount {
  #balance: number = 0;

  constructor(initial: number) {
    this.#balance = initial;
  }

  deposit(amount: number): void {
    this.#balance += amount;
  }

  getBalance(): number {
    return this.#balance;
  }
}

const dog = new Dog("Rex");
const cat = new Cat("Kitty");
console.log(dog.speak()); // "Rex menggonggong: GUK GUK!"
console.log(cat.speak()); // "Kitty mengeong: MEOW!"
console.log(MathUtil.circleArea(7)); // 153.938...

const acc = new BankAccount(1000);
acc.deposit(500);
console.log(acc.getBalance()); // 1500
// console.log(acc.#balance); // ERROR: private field
```

**Expected Output:**
```
Rex menggonggong: GUK GUK!
Kitty mengeong: MEOW!
153.938...
1500
```

---

### 24. Async Iterator & Generator

```typescript
// === KODE LO DISINI ===

// Generator function: yield angka genap
function* evenNumbers(limit: number): Generator<number> {
  for (let i = 2; i <= limit; i += 2) {
    yield i;
  }
}

// Generator function: Fibonacci
function* fibonacci(limit: number): Generator<number> {
  let a = 0, b = 1;
  while (a <= limit) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Async generator: simulasi pagination
async function* paginate<T>(
  fetchPage: (page: number) => Promise<T[]>,
  maxPages: number
): AsyncGenerator<T[]> {
  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchPage(page);
    yield data;
    if (data.length === 0) break;
  }
}

// Test generator
const evens = evenNumbers(10);
console.log([...evens]); // [2, 4, 6, 8, 10]

const fib = fibonacci(50);
console.log([...fib]); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

**Expected Output:**
```
[2, 4, 6, 8, 10]
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

### 25. Async Data Pipeline (Integrasi)

```typescript
// === KODE LO DISINI ===

// Gabungan: fetch, transform, filter, sort
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

async function fetchPosts(): Promise<Post[]> {
  // Fetch dari https://jsonplaceholder.typicode.com/posts
  // === KODE LO DISINI ===
}

// Langkah 2: filter posts by userId
function filterByUser(posts: Post[], userId: number): Post[] {
  // === KODE LO DISINI ===
}

// Langkah 3: ambil title aja, batasi panjang
function summarizeTitles(posts: Post[]): string[] {
  // Map ke title, potong jadi max 30 karakter
  // === KODE LO DISINI ===
}

// Langkah 4: grouping by userId
function groupByUser(posts: Post[]): Record<number, Post[]> {
  // === KODE LO DISINI ===
}

// Pipeline
async function main() {
  const posts = await fetchPosts();
  console.log("Total posts:", posts.length);
  console.log("User 1 posts:", filterByUser(posts, 1).length);
  console.log("Titles:", summarizeTitles(posts.slice(0, 3)));
}

// main();
```

---

## 💡 Tips Mengerjakan

1. **Jangan liat jawaban dulu** — coba kerjakan sendiri sampai 15 menit
2. **Gunakan `console.log`** untuk debug
3. **TypeScript strict mode** — error di editor itu bantuan, bukan musuh
4. **Kalau stuck**: baca hint di bagian bawah, atau tanya di grup
5. **Bonus**: tambahin validasi atau edge case handling

## 🔍 Hint

| # | Hint |
|---|------|
| 1 | `(celsius * 9/5) + 32` |
| 2 | `if-else if-else` chain |
| 3 | Nested loop: `for (let i=1; i<=n; i++)` + `for (let j=1; j<=i; j++)` |
| 4 | `str.split('').reverse().join('')` |
| 5 | `student.scores.math + student.scores.science + student.scores.english / 3` |
| 6 | Return `price - (price * discountPercent / 100)` |
| 7 | `[...arr1, ...arr2]`, `arr.reduce((a,b)=>a+b, 0) / arr.length`, `{...obj, [key]: value}` |
| 8 | `filter()`, `map()`, `reduce()`, `chain` |
| 9 | `sort((a,b)=>b.score-a.score)`, `reduce((max, s) => s.score > max.score ? s : max)` |
| 10 | `Date.getMonth()`, `Date.getDay()` (0=Minggu, 6=Sabtu) |
| 11 | `Math.random() * (max - min + 1) + min`, `Math.PI` |
| 12 | `for` loop + call callback tiap iterasi |
| 13 | `new Promise((resolve) => setTimeout(resolve, ms))` |
| 14 | `await fetch(url)`, `await response.json()` |
| 15 | Inner function akses variable outer function — udah closure |
| 16 | `return (num) => num * factor` |
| 17 | `document.createElement('li')`, `appendChild` |
| 18 | `form.addEventListener('submit', (e) => e.preventDefault())` |
| 19 | `localStorage.setItem('key', JSON.stringify(data))` |
| 20 | `try { ... } catch (e) { ... }` |
| 21 | `clearTimeout` / `setTimeout` |
| 22 | Return function yang return function sampai semua argumen terpenuhi |
| 23 | `class X extends Y { ... }`, `super()` |
| 24 | `function* gen() { yield value; }` |
| 25 | `Promise.all()` + chain |

---

Selamat ngoding! 🚀
