# 01. 💛 JavaScript Fundamentals

## Variabel
```js
let nama = "Budi";     // mutable, block-scoped
const PI = 3.14;       // immutable, block-scoped
var lama = "jangan";   // function-scoped, hindari
```

## Tipe Data
- **Primitif**: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`
- **Object**: `{}`, `[]`, `function`, `Date`, `Map`

## Operator
```js
=== // strict equality (tipe + nilai)
!== // strict inequality
&&  // AND
||  // OR
??  // nullish coalescing (null/undefined → default)
?.  // optional chaining (obj?.prop)
```

## Conditionals
```js
if (nilai >= 70) { lulus = true; }
else if (nilai >= 50) { lulus = false; }
else { remedial = true; }

let status = nilai >= 70 ? "Lulus" : "Tidak Lulus";

switch (hari) {
  case 1: console.log("Senin"); break;
  default: console.log("Unknown");
}
```

## Loops
```js
for (let i = 0; i < 5; i++) { }
for (let item of arr) { }
for (let key in obj) { }
while (kondisi) { }
do { } while (kondisi);
```

## Functions
```js
// Declaration
function tambah(a, b) { return a + b; }

// Expression
const kali = function(a, b) { return a * b; };

// Arrow
const bagi = (a, b) => a / b;

// Default param
const sapa = (nama = "Dunia") => `Halo ${nama}`;

// Rest param
const sum = (...nums) => nums.reduce((a, b) => a + b);
```

## Array Methods
| Method | Kegunaan | Contoh |
|--------|----------|--------|
| `push()` | Tambah akhir | `arr.push(4)` |
| `pop()` | Hapus akhir | `arr.pop()` |
| `shift()` | Hapus awal | `arr.shift()` |
| `unshift()` | Tambah awal | `arr.unshift(0)` |
| `map()` | Transform | `arr.map(x => x*2)` |
| `filter()` | Saring | `arr.filter(x => x>5)` |
| `reduce()` | Agregasi | `arr.reduce((a,b) => a+b, 0)` |
| `find()` | Cari pertama | `arr.find(x => x > 5)` |
| `some()` | Ada yg cocok? | `arr.some(x => x>5)` |
| `every()` | Semua cocok? | `arr.every(x => x>0)` |
| `includes()` | Ada nilai? | `arr.includes(3)` |
| `sort()` | Urutkan | `arr.sort((a,b) => a-b)` |

## String Methods
```js
"teks".length            // 4
"teks".toUpperCase()     // "TEKS"
"teks".toLowerCase()     // "teks"
"teks".trim()            // hapus spasi pinggir
"teks".split("")         // ['t','e','k','s']
"teks".includes("ek")    // true
"teks".replace("e","a")  // "taks"
```

## Async
```js
// Callback
setTimeout(() => console.log("done"), 1000);

// Promise
fetch("url")
  .then(res => res.json())
  .catch(err => console.log(err));

// Async/Await
async function getData() {
  try {
    let res = await fetch("url");
    let data = await res.json();
  } catch (err) { console.log(err); }
}
```

## Error Handling
```js
try {
  // kode yang mungkin error
  JSON.parse("invalid");
} catch (error) {
  console.log(error.message);
} finally {
  console.log("selalu jalan");
}
```

## Common Pitfalls
- ❌ `==` vs `===` — selalu pakai `===`
- ❌ Lupa `await` di async function → Promise pending
- ❌ Mutasi array/object di dalam `map`/`filter`
- ❌ `const` untuk array — referensi tetap, isi bisa berubah
- ❌ Hoisting dengan `var` — pakai `let`/`const`

## Related Links
- [02 Algorithms](02-algorithms.md)
- [03 TypeScript](03-typescript.md)
