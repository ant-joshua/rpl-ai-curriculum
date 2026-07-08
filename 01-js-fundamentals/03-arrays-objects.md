# 1.3 Array & Object — Nyimpen Banyak Data

Variable cuma nyimpen satu nilai. Kalo butuh nyimpen 100 data? Pake **Array** (daftar) dan **Object** (entitas).

## Array — Daftar Berurutan

Array = variable yang bisa nyimpen **banyak nilai sekaligus**, diakses pake index (mulai dari 0).

```javascript
// Bikin array
const fruits = ["Apel", "Mangga", "Jeruk", "Pisang"];
const numbers = [1, 2, 3, 4, 5];
const mixed = ["Budi", 17, true, null]; // Boleh campur (tapi jarang)

// Akses
console.log(fruits[0]);    // "Apel" — index pertama
console.log(fruits[1]);    // "Mangga"
console.log(fruits[fruits.length - 1]); // "Pisang" — index terakhir
console.log(fruits[-1]);   // undefined — JS ga punya negative index
```

**Array Properties & Methods Dasar:**

```javascript
const arr = [3, 1, 4, 1, 5, 9];

console.log(arr.length);    // 6 — jumlah elemen
arr[3] = 100;               // Ubah index ke-3
console.log(arr);           // [3, 1, 4, 100, 5, 9]

// Tambah & hapus
arr.push(2);                // [..., 2] — tambah di akhir
arr.unshift(0);             // [0, ...] — tambah di awal
arr.pop();                  // [...] — hapus dari akhir
arr.shift();                // [...] — hapus dari awal
```

### Array Methods Modern (WAJIB KUASAI!)

Ini yang bikin JavaScript powerful buat data processing:

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map — transformasi: input array, output array SAMA PANJANG
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// filter — saring: input array, output array LEBIH PENDEK
const even = numbers.filter(n => n % 2 === 0);
// [2, 4, 6, 8, 10]

const big = numbers.filter(n => n > 5);
// [6, 7, 8, 9, 10]

// reduce — akumulasi: input array, output SATU NILAI
const sum = numbers.reduce((akumulator, current) => akumulator + current, 0);
// 55

// Chain — gabungin semua!
const result = numbers
  .filter(n => n % 2 !== 0)    // ambil ganjil: [1,3,5,7,9]
  .map(n => n * 3)              // kali 3: [3,9,15,21,27]
  .reduce((a, b) => a + b, 0);  // jumlahin: 75

console.log(result); // 75
```

**Lebih banyak method:**

```javascript
const siswa = ["Budi", "Ani", "Candra", "Dewi", "Eko"];

// find — cari SATU elemen
const cari = siswa.find(s => s.startsWith("C"));
console.log(cari); // "Candra"

// some & every — cek kondisi
console.log(siswa.some(s => s.length > 4));  // true (ada yang > 4)
console.log(siswa.every(s => s.includes("i"))); // false (Candra gak ada "i")

// includes — cek apakah ada
console.log(siswa.includes("Dewi")); // true

// sort — urutin (HATI-HATI!)
const angka = [3, 10, 1, 20, 2];
console.log(angka.sort()); // [1, 10, 2, 20, 3] — BUG! Sort by string!
// Fix: pake compare function
console.log(angka.sort((a, b) => a - b)); // [1, 2, 3, 10, 20]
console.log(angka.sort((a, b) => b - a)); // [20, 10, 3, 2, 1] — descending

// slice & splice
console.log(siswa.slice(1, 3)); // ["Ani", "Candra"] (tidak merubah array asli)
console.log(siswa.slice(-2));   // ["Dewi", "Eko"] dari belakang
```

## Object — Entitas dengan Properti

Object = kumpulan **key-value pairs**. Kayak data diri: ada nama, umur, alamat.

```javascript
const siswa = {
  nama: "Budi",
  umur: 17,
  kelas: "XII RPL 1",
  alamat: {
    kota: "Jakarta",
    provinsi: "DKI Jakarta"
  },
  hobi: ["Ngoding", "Game", "Baca"],
  sapa: function() {
    return `Halo, saya ${this.nama}`;
  }
};

// Akses properti
console.log(siswa.nama);           // "Budi"
console.log(siswa["nama"]);        // "Budi" (cara bracket)
console.log(siswa.alamat.kota);    // "Jakarta"
console.log(siswa.hobi[0]);        // "Ngoding"
console.log(siswa.sapa());         // "Halo, saya Budi"
```

### CRUD Object

```javascript
// CREATE
const user = {
  id: 1,
  username: "budiganteng",
  email: "budi@email.com"
};

// READ
console.log(user.username);

// UPDATE
user.username = "budi_update";
user.email = "budi@newemail.com";

// DELETE
delete user.email;  // Hapus property email
console.log(user);  // { id: 1, username: "budi_update" }

// Cek property ada atau gak
console.log("username" in user); // true
console.log(user.hasOwnProperty("email")); // false
```

### Destructuring — Ekstrak Properti

```javascript
// Cara lama
const namaSiswa = siswa.nama;
const umurSiswa = siswa.umur;

// Destructuring — MODERN!
const { nama, umur, kelas } = siswa;
console.log(nama, umur, kelas); // "Budi" 17 "XII RPL 1"

// Rename
const { nama: fullName, alamat: { kota } } = siswa;
console.log(fullName, kota); // "Budi" "Jakarta"

// Array destructuring
const fruits = ["Apel", "Mangga", "Jeruk"];
const [pertama, kedua, ketiga] = fruits;
console.log(pertama); // "Apel"

// Skip element
const [a, , c] = fruits;
console.log(c); // "Jeruk"

// Rest
const [head, ...tail] = fruits;
console.log(head); // "Apel"
console.log(tail); // ["Mangga", "Jeruk"]
```

### Spread Operator — Copy & Gabung

```javascript
// Copy object
const siswaCopy = { ...siswa };

// Gabung object (merge)
const alamat = { kota: "Jakarta", provinsi: "DKI" };
const kontak = { email: "budi@email.com", telp: "08123456789" };
const profile = { ...siswa, ...alamat, ...kontak };

// Override property
const siswaBaru = { ...siswa, nama: "Andi" };

// Copy array
const arrAsli = [1, 2, 3];
const arrCopy = [...arrAsli];

// Gabung array
const arr1 = [1, 2];
const arr2 = [3, 4];
const gabung = [...arr1, ...arr2]; // [1, 2, 3, 4]

// Spread di function call
const angka = [1, 5, 2, 9, 3];
console.log(Math.max(...angka)); // 9
```

### Deep Clone — Copy Dalam

Ada 3 cara clone object, masing-masing beda depth:

```javascript
const original = {
  name: "Budi",
  address: { city: "Jakarta", zip: "12345" },
  hobbies: ["Ngoding", "Game"],
  date: new Date()
};

// 1. Spread Operator — SHALLOW CLONE
// ❌ Cuma copy level 1, nested object masih referensi sama
const shallow = { ...original };
shallow.address.city = "Bandung";
console.log(original.address.city); // "Bandung" — berubah! Karena referensi sama

// 2. JSON parse/stringify — DEEP CLONE (tapi ada batasan)
// ❌ Function, Date, undefined, Symbol ilang
const jsonClone = JSON.parse(JSON.stringify(original));
console.log(jsonClone.date); // string, bukan Date object!
console.log(jsonClone.name); // "Budi" ✅

// 3. structuredClone() — DEEP CLONE MODERN (Browser & Node 17+)
// ✅ Handle Date, Map, Set, ArrayBuffer, Blob
const deepClone = structuredClone(original);
deepClone.address.city = "Surabaya";
console.log(original.address.city); // "Jakarta" — aman, ga berubah
console.log(deepClone.address.city); // "Surabaya"
console.log(deepClone.date instanceof Date); // true — Date tetap Date!

// structuredClone juga handle circular reference
const circular = { name: "Eko" };
circular.self = circular; // circular reference!
const cloned = structuredClone(circular); // ✅ OK!
```

### Object.freeze & Object.seal

```javascript
const config = {
  API_URL: "https://api.example.com",
  TIMEOUT: 5000,
  retryCount: 3
};

// Object.freeze — ga bisa diubah SAMA SEKALI
const frozen = Object.freeze(config);
frozen.API_URL = "https://evil.com"; // Silent fail di strict mode
// TypeError: Cannot assign to read-only property
console.log(frozen.API_URL); // "https://api.example.com" — aman!

// Object.seal — bisa ubah value existing, ga bisa nambah/hapus property
const sealed = Object.seal({ name: "Budi", age: 17 });
sealed.age = 18; // ✅ OK — bisa ubah
sealed.email = "budi@mail.com"; // ❌ Gagal — ga bisa nambah
delete sealed.name; // ❌ Gagal — ga bisa hapus
console.log(Object.isSealed(sealed)); // true
console.log(Object.isFrozen(frozen)); // true
```

## Set & Map — Struktur Data Tambahan

Selain Array dan Object, JavaScript punya Set dan Map:

```javascript
// SET — kumpulan nilai UNIK (ga boleh duplikat)
const fruits = new Set(["Apel", "Mangga", "Apel", "Jeruk"]);
console.log(fruits); // Set(3) { "Apel", "Mangga", "Jeruk" } — Apel cuma sekali

fruits.add("Pisang");
fruits.add("Mangga"); // Duplikat — diabaikan
console.log(fruits.has("Apel")); // true
console.log(fruits.size); // 4
fruits.delete("Jeruk");
console.log(fruits); // Set(3) { "Apel", "Mangga", "Pisang" }

// Loop Set
for (const fruit of fruits) {
  console.log(fruit);
}

// Convert Set ↔ Array
const arr = [...fruits]; // ["Apel", "Mangga", "Pisang"]
const set2 = new Set([1, 2, 2, 3, 3, 4]); // Set { 1, 2, 3, 4 }

// MAP — object dengan KEY BEBAS (bukan cuma string)
const userMap = new Map();
userMap.set("budi", { name: "Budi", age: 17 });
userMap.set(42, "Angka sebagai key");
userMap.set(true, "Boolean sebagai key");

console.log(userMap.get("budi")); // { name: "Budi", age: 17 }
console.log(userMap.get(42)); // "Angka sebagai key"
console.log(userMap.has(true)); // true
console.log(userMap.size); // 3

// Map lebih cepat daripada Object untuk frequent add/delete
// Loop Map
for (const [key, value] of userMap) {
  console.log(`${key}:`, value);
}

// Convert Object → Map
const obj = { a: 1, b: 2, c: 3 };
const mapFromObj = new Map(Object.entries(obj));
console.log(mapFromObj.get("a")); // 1

// Convert Map → Object
const objFromMap = Object.fromEntries(mapFromObj);
console.log(objFromMap); // { a: 1, b: 2, c: 3 }
```

### Object Methods Berguna

```javascript
const student = { nama: "Budi", umur: 17, kelas: "XII RPL" };

// Ambil semua keys
console.log(Object.keys(student));   // ["nama", "umur", "kelas"]

// Ambil semua values
console.log(Object.values(student)); // ["Budi", 17, "XII RPL"]

// Ambil semua entries (key + value)
console.log(Object.entries(student));
// [["nama", "Budi"], ["umur", 17], ["kelas", "XII RPL"]]

// Loop object
for (const [key, value] of Object.entries(student)) {
  console.log(`${key}: ${value}`);
}
// nama: Budi
// umur: 17
// kelas: XII RPL
```

## Array of Objects — Paling Real!

Data di dunia nyata: array yang berisi object-object.

```javascript
const siswa = [
  { id: 1, nama: "Budi", nilai: 85 },
  { id: 2, nama: "Ani", nilai: 92 },
  { id: 3, nama: "Candra", nilai: 78 },
  { id: 4, nama: "Dewi", nilai: 95 },
  { id: 5, nama: "Eko", nilai: 65 }
];

// Cari siswa dengan nilai tertinggi
const terbaik = siswa.reduce((best, s) => s.nilai > best.nilai ? s : best);
console.log(`Terbaik: ${terbaik.nama} (${terbaik.nilai})`);

// Filter yang lulus (>= 75)
const lulus = siswa.filter(s => s.nilai >= 75);
console.log(`Lulus: ${lulus.length} siswa`);

// Map ke format baru
const rapor = siswa.map(s => ({
  nama: s.nama,
  status: s.nilai >= 75 ? "Lulus" : "Remedial",
  grade: s.nilai >= 90 ? "A" : s.nilai >= 75 ? "B" : "C"
}));

// Sort by nilai descending
const ranking = [...siswa].sort((a, b) => b.nilai - a.nilai);
console.log(ranking[0].nama); // "Dewi" — nilai tertinggi
```

## Latihan

1. **Daftar Belanja**
   Buat array `belanja = ["Beras", "Gula", "Minyak", "Telur"]`. Lakukan:
   - Tambah "Kopi" di akhir
   - Tambah "Sabun" di awal
   - Hapus item terakhir
   - Cek apakah "Gula" ada
   - Tampilkan semua item pake loop

2. **Filter Harga**
   ```javascript
   const products = [
     { name: "Beras", price: 15000 },
     { name: "Gula", price: 12000 },
     { name: "Minyak", price: 25000 },
     { name: "Telur", price: 8000 },
     { name: "Kopi", price: 5000 }
   ];
   ```
   - Filter produk dengan harga > 10000
   - Map ke format: `{name, price, tax: price*0.11}`
   - Hitung total belanja (reduce)
   - Sort from cheapest to most expensive

3. **Contact Book**
   ```javascript
   const contacts = [];
   // Buat function:
   // addContact(nama, telp) — tambah kontak
   // findContact(nama) — cari kontak by nama
   // deleteContact(nama) — hapus kontak
   // listContacts() — tampilkan semua (urut abjad)
   ```

4. **Nilai Rata-rata**
   Array of 5 siswa (nama + nilai). Hitung:
   - Rata-rata kelas
   - Nilai tertinggi & terendah
   - Jumlah yang lulus (>=75)
   - Ranking from highest to lowest

5. **Group by Category**
   ```javascript
   const items = [
     { name: "Keyboard", category: "Elektronik", price: 250000 },
     { name: "Meja", category: "Furniture", price: 500000 },
     { name: "Mouse", category: "Elektronik", price: 100000 },
     { name: "Kursi", category: "Furniture", price: 750000 },
     { name: "Monitor", category: "Elektronik", price: 2000000 }
   ];
   // Group items by category
   // Output: { Elektronik: [...], Furniture: [...] }
   // Hint: pake reduce + object
   ```

6. **Deep Clone vs Shallow Copy**
   ```javascript
   const original = { a: 1, b: { c: 2 } };
   const shallow = { ...original };
   const deep = JSON.parse(JSON.stringify(original));
   
   shallow.b.c = 999; // Berubah? Cek original.b.c
   deep.b.c = 999;    // Berubah?
   ```
   Jelaskan kenapa beda.

7. **Set vs Array Performance**
   ```javascript
   const items = Array.from({ length: 10000 }, (_, i) => i % 100);
   // Ukur waktu filter unik pake Array vs Set:
   // Method 1: array filter + indexOf
   // Method 2: [...new Set(items)]
   // Method 3: reduce pake accumulator object
   // Catet waktunya pake console.time() — mana paling cepet?
   ```

8. **Map as Cache**
   ```javascript
   function memoize(fn) {
     const cache = new Map();
     return function(arg) {
       if (cache.has(arg)) {
         console.log("Cache hit!");
         return cache.get(arg);
       }
       const result = fn(arg);
       cache.set(arg, result);
       return result;
     };
   }
   const factorial = memoize(n => n <= 1 ? 1 : n * factorial(n - 1));
   console.log(factorial(5)); // Hitung
   console.log(factorial(5)); // Cache hit — langsung
   console.log(factorial(6)); // Sebagian dari cache
   ```
