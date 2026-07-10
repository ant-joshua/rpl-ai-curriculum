# 📜 JavaScript Terms

> Istilah-istilah penting di JavaScript — bahasa utama web development.

---

### Variable
Tempat nyimpen nilai di kode. Pake `let`, `const`, atau `var` (udah jarang dipake).

```ts
let nama = "Budi";     // Bisa diubah
const umur = 20;       // Gak bisa diubah (constant)
var oldWay = "jadul";  // Hindari — masalah scope
console.log(nama, umur); // Output: Budi 20
```

### Function
Blok kode yang bisa dipake berulang-ulang. Input → proses → output.

```ts
// Function declaration
function greet(nama: string): string {
  return `Halo, ${nama}!`;
}

// Arrow function (lebih modern)
const greet = (nama: string): string => `Halo, ${nama}!`;

console.log(greet("Budi")); // Output: Halo, Budi!
```

### Scope
Daerah akses suatu variable. Global (bisa diakses di mana aja), function scope (`var`), block scope (`let`/`const`).

```ts
let global = "saya global";

function test() {
  let local = "saya local";
  var functionScoped = "saya di function aja";
  if (true) {
    let blockScoped = "saya cuma di block ini";
    var stillHere = "var bocor keluar block"; // 🤯
  }
  console.log(global);       // ✅ Bisa
  console.log(local);        // ✅ Bisa
  console.log(stillHere);    // ✅ Bisa (var)
  // console.log(blockScoped); // ❌ Error: not defined
}
```

### Hoisting
JavaScript \"ngangkat\" deklarasi variable/function ke atas scope. `var` jadi `undefined`, `let`/`const` masuk Temporal Dead Zone (TDZ).

```ts
console.log(x); // Output: undefined (var di-hoist, tapi belum diisi)
var x = 5;

// console.log(y); // ❌ Error: Cannot access before initialization (TDZ)
let y = 10;

// Function declaration di-hoist sepenuhnya
sayHi(); // Output: Halo!
function sayHi() { console.log("Halo!"); }

// Arrow function gak di-hoist
// sayHello(); // ❌ Error: Cannot access before initialization
const sayHello = () => console.log("Halo!");
```

### Closure
Function yang \"mengingat\" scope tempat dia dibuat, bahkan setelah outer function selesai.

```ts
function counter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

const myCounter = counter();
console.log(myCounter()); // Output: 1
console.log(myCounter()); // Output: 2
console.log(myCounter()); // Output: 3
// Variable 'count' tetap diingat meski counter() udah selesai
```

### `this`
Kata kunci yang nunjuk ke object \"pemilik\" function. Nilainya beda tergantung cara function dipanggil.

```ts
// `this` di object method
const user = {
  name: "Budi",
  greet() {
    console.log(`Halo, saya ${this.name}`);
  }
};
user.greet(); // Output: Halo, saya Budi

// `this` di arrow function — ngambil dari scope luar
const user2 = {
  name: "Sari",
  greet: () => console.log(`Halo, saya ${this.name}`)
};
user2.greet(); // Output: Halo, saya undefined (arrow gak punya this sendiri)
```

### Promise
Object yang nunjukin operasi asynchronous bakal selesai (atau gagal) di masa depan.

```ts
function getUser(id: number): Promise<{ name: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 1) {
        resolve({ name: "Budi" });
      } else {
        reject(new Error("User not found"));
      }
    }, 1000);
  });
}

// Pake .then() / .catch()
getUser(1)
  .then(user => console.log(user.name))  // Output (after 1s): Budi
  .catch(err => console.error(err));
```

### Async/Await
Cara nulis kode asynchronous yang keliatannya kayak synchronous — lebih bersih daripada `.then()` chain.

```ts
async function displayUser(id: number) {
  try {
    const user = await getUser(id);  // await = tunggu promise selesai
    console.log(user.name);
  } catch (err) {
    console.error("Gagal:", err);
  }
}

displayUser(1); // Output (after 1s): Budi

// Async function always returns a Promise
const result = displayUser(2);
console.log(result); // Output: Promise { <pending> }
```

### Event Loop
Mekanisme JavaScript yang nge-handle async operations. Single-threaded tapi non-blocking.

```ts
console.log("1. Start");

setTimeout(() => console.log("2. Timeout"), 0); // Callback queue

Promise.resolve().then(() => console.log("3. Microtask")); // Microtask queue

console.log("4. End");

// Output:
// 1. Start
// 4. End
// 3. Microtask   (microtask queue dieksekusi duluan)
// 2. Timeout     (callback queue)
```

### Prototype
Mekanisme inheritance di JavaScript. Object bisa \"nurunin\" property/method ke object lain.

```ts
// Setiap object JS punya prototype (__proto__)
const animal = { breathe() { console.log("Bernafas..."); } };

const dog = { bark() { console.log("Guk guk!"); } };
dog.__proto__ = animal; // Dog mewarisi dari animal
// Atau pake Object.create()

dog.bark();   // Output: Guk guk!
dog.breathe(); // Output: Bernafas... (dari prototype)

// Prototype chain: dog → animal → Object.prototype → null
```

### Array
Tipe data yang nyimpen banyak nilai dalam satu variable, diurutkan pake index.

```ts
const fruits = ["Apel", "Mangga", "Jeruk"];
console.log(fruits[0]);      // Output: Apel
console.log(fruits.length);  // Output: 3

// Method method penting
fruits.push("Nanas");                // Tambah di akhir
const last = fruits.pop();           // Ambil dari akhir
const first = fruits.shift();        // Ambil dari awal
const index = fruits.indexOf("Mangga"); // Cari index
console.log(fruits.join(", "));      // Output: Mangga, Jeruk
```

### Destructuring
Cara nge-extract nilai dari object/array ke variable terpisah.

```ts
// Object destructuring
const user = { name: "Budi", age: 20, city: "Jakarta" };
const { name, age } = user;
console.log(name); // Output: Budi
console.log(age);  // Output: 20

// Array destructuring
const colors = ["merah", "kuning", "hijau"];
const [firstColor, ...rest] = colors;
console.log(firstColor); // Output: merah
console.log(rest);       // Output: ["kuning", "hijau"]

// Rename
const { name: userName } = user;
console.log(userName); // Output: Budi
```

### Spread Operator
`...` buat nyebarin nilai array/object.

```ts
// Spread array
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log(combined); // Output: [1, 2, 3, 4, 5, 6]

// Spread object
const base = { name: "Budi" };
const updated = { ...base, age: 20, name: "Budi Update" };
console.log(updated); // Output: { name: "Budi Update", age: 20 }

// Copy (shallow)
const copy = [...arr1];
```

### Callback
Function yang dikirim ke function lain, dipanggil setelah operasi selesai.

```ts
function processData(input: number, cb: (result: number) => void) {
  const result = input * 2;
  cb(result); // Panggil callback setelah selesai
}

processData(5, (res) => {
  console.log(`Hasil: ${res}`); // Output: Hasil: 10
});

// Callback hell — kenapa Promise/async-await ada
getUser(1, (user) => {
  getPosts(user.id, (posts) => {
    getComments(posts[0].id, (comments) => {
      // Makin dalem, makin susah dibaca 😵
    });
  });
});
```

---

*Next: [03-typescript-terms.md](03-typescript-terms.md) — Istilah TypeScript*
