# 1.2 Control Flow — Ngatur Alur Program

Program jalan dari atas ke bawah. Control flow = cara **ngatur** alur itu: lompat, milih, ulang.

## If/Else — Percabangan

```javascript
const nilai = 85;

if (nilai >= 90) {
  console.log("Grade A — Excellent!");
} else if (nilai >= 75) {
  console.log("Grade B — Baik");
} else if (nilai >= 60) {
  console.log("Grade C — Cukup");
} else {
  console.log("Grade D — Remedial");
}
```

**Flowchart:**
```javascript
// Program nyari bilangan terbesar dari 3 angka
const a = 15, b = 27, c = 9;

let terbesar = a;
if (b > terbesar) terbesar = b;
if (c > terbesar) terbesar = c;

console.log(`Terbesar: ${terbesar}`); // 27
```

**Nested if (if di dalam if):**
```javascript
const umur = 20;
const punyaKTP = true;

if (umur >= 17) {
  if (punyaKTP) {
    console.log("Bisa bikin SIM");
  } else {
    console.log("Bikin KTP dulu");
  }
} else {
  console.log("Belum cukup umur");
}
```

## Ternary Operator — If/Else Satu Baris

Cara singet nulis if/else sederhana:

```javascript
// If biasa
let status;
if (umur >= 17) {
  status = "Bisa bikin SIM";
} else {
  status = "Belum cukup";
}

// Ternary (sama aja)
const statusSIM = umur >= 17 ? "Bisa bikin SIM" : "Belum cukup";
```

**Contoh real:**

```javascript
const nilai = 80;
const lulus = nilai >= 75 ? "🎉 Lulus" : "😢 Remedial";

// Nested ternary (jangan kebanyakan — susah dibaca)
const grade = nilai >= 90 ? "A" : nilai >= 75 ? "B" : nilai >= 60 ? "C" : "D";

// Ternary buat JSX (React)
// {isLoggedIn ? <Dashboard /> : <Login />}
```

## Switch — Banyak Kondisi Tetap

Berguna kalo lo ngebandingin **satu variable** dengan **banyak nilai**:

```javascript
const hari = "senin";

switch (hari) {
  case "senin":
    console.log("Mulai ngoding!");
    break;
  case "selasa":
    console.log("React project");
    break;
  case "rabu":
    console.log("Backend API");
    break;
  case "kamis":
    console.log("Database day");
    break;
  case "jumat":
    console.log("Alhamdulillah, review & deploy");
    break;
  default:
    console.log("Weekend — explorasi tech baru");
}
```

> **Penting:** Jangan lupa `break`. Kalo lupa → **fallthrough** (jalan terus ke case berikutnya). Kadang fallthrough dipake sengaja:

```javascript
// Fallthrough sengaja — grouping case
const nilaiAngka = 85;

switch (true) {
  case nilaiAngka >= 90:
    console.log("A");
    break;
  case nilaiAngka >= 75:
    console.log("B");
    break;
  case nilaiAngka >= 60:
    console.log("C");
    break;
  default:
    console.log("D");
}
```

## Loops — Ngulang Sepanjang Hayat

### For Loop — Paling sering dipake

```javascript
// Struktur: for (inisialisasi; kondisi; increment)
for (let i = 1; i <= 5; i++) {
  console.log(`Iterasi ke-${i}`);
}
// Output: 1, 2, 3, 4, 5

// Loop ke belakang
for (let i = 10; i >= 0; i--) {
  console.log(i);
}
// Output: 10, 9, 8 ... 0

// Step 2
for (let i = 0; i <= 10; i += 2) {
  console.log(i); // 0, 2, 4, 6, 8, 10
}

// Loop array (cara lama)
const fruits = ["Apel", "Mangga", "Jeruk"];
for (let i = 0; i < fruits.length; i++) {
  console.log(`${i}: ${fruits[i]}`);
}
```

### For...of — Loop Array Paling Gampang

```javascript
const fruits = ["Apel", "Mangga", "Jeruk"];
for (const fruit of fruits) {
  console.log(fruit);
}

// Dapet index juga?
for (const [index, fruit] of fruits.entries()) {
  console.log(`${index}: ${fruit}`);
}
```

### While — Loop Selama Kondisi True

```javascript
// Tebak angka — loop sampe ketemu
let tebakan = 0;
const jawaban = 7;

while (tebakan !== jawaban) {
  tebakan = Math.floor(Math.random() * 10);
  console.log(`Tebakan: ${tebakan}`);
}
console.log(`🎉 Benar! Jawabannya ${jawaban}`);

// Hati-hati infinite loop!
// while (true) { ... } — kalo ga ada break, jalan terus sampe komputer panas
```

### Do...While — Jalan Minimal Sekali

```javascript
// Beda dengan while: do-while jalan DULU, baru cek kondisi
let input;
do {
  input = prompt("Masukkan password:"); // Di browser
} while (input !== "rahasia123");
```

## Control Flow Tools

```javascript
// break — stop loop
for (const fruit of fruits) {
  if (fruit === "Mangga") break; // berhenti pas ketemu Mangga
  console.log(fruit); // Cuma "Apel" yang keprint
}

// continue — skip iterasi
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) continue; // skip angka genap
  console.log(i); // 1, 3, 5, 7, 9
}
```

## Short-Circuit Evaluation — &&, ||, ??

JavaScript evaluasi dari kiri ke kanan dan berhenti kalo hasil udah pasti:

```javascript
// && — balik value kedua kalo yang pertama truthy
console.log(true && "Halo");   // "Halo"
console.log(false && "Halo");  // false — stop di false
console.log("A" && "B" && "C"); // "C" — semua truthy

// || — balik value pertama yang truthy
console.log("" || "Default");  // "Default"
console.log("Budi" || "Default"); // "Budi" — stop karena truthy
console.log(null || undefined || 0 || "Aktif"); // "Aktif"

// Contoh real — conditional rendering
const user = { name: "Budi" };
const greeting = user.name && `Halo, ${user.name}!`; // "Halo, Budi!"

// Default value pake ||
function sapa(nama) {
  const name = nama || "Teman"; // kalo falsy (null/undefined/""), pake default
  return `Halo, ${name}!`;
}
console.log(sapa());       // "Halo, Teman!"
console.log(sapa(""));     // "Halo, Teman!" — HATI-HATI! empty string falsy

// Nullish Coalescing (??) — lebih aman dari ||
// ?? cuma fallback kalo null/undefined, bukan falsy values lainnya
const input = "";
const val1 = input || "Default";  // "Default" — karena "" falsy!
const val2 = input ?? "Default";  // "" — karena cuma null/undefined yang kena

console.log(val1); // "Default" — mungkin bukan yg diharapkan
console.log(val2); // "" — lebih bener untuk string kosong

// Kapan pake ?? vs ||:
// ?? — kalo mau fallback cuma untuk null/undefined
// || — kalo mau fallback untuk SEMUA falsy (0, "", false)
```

## Optional Chaining (?.) — Aman Akses Nested Property

Sering banget dapet error `Cannot read property of undefined` waktu akses nested object. Optional chaining solusinya:

```javascript
const user = {
  name: "Budi",
  address: null,
  // address: { city: "Jakarta" } — kalo ada
};

// ❌ ERROR kalo address null
// console.log(user.address.city); // TypeError: Cannot read properties of null

// ✅ Aman pake ?.
console.log(user.address?.city); // undefined — ga error
console.log(user.address?.city?.name ?? "Tidak ada"); // "Tidak ada"

// Optional chaining buat function call
const config = {
  getData: null,
  // getData: () => "data"
};
console.log(config.getData?.()); // undefined — ga dipanggil kalo null

// Di array
const arr = null;
console.log(arr?.[0]); // undefined

// Chaining semua
const user2 = {
  profile: {
    settings: {
      theme: "dark"
    }
  }
};
const theme = user2?.profile?.settings?.theme ?? "light";
console.log(theme); // "dark"

const noTheme = ({})?.profile?.settings?.theme ?? "light";
console.log(noTheme); // "light" — aman, ga error
```

## Pola Bintang — Latihan Klasik

```javascript
// Segitiga siku
// *
// **
// ***
// ****
for (let i = 1; i <= 5; i++) {
  let baris = "";
  for (let j = 1; j <= i; j++) {
    baris += "*";
  }
  console.log(baris);
}

// Segitiga sama kaki
//     *
//    ***
//   *****
//  *******
for (let i = 1; i <= 5; i++) {
  let spasi = " ".repeat(5 - i);
  let bintang = "*".repeat(2 * i - 1);
  console.log(spasi + bintang);
}

// Tabel perkalian
// 5 x 1 = 5
// 5 x 2 = 10
// ...
const angka = 5;
for (let i = 1; i <= 10; i++) {
  console.log(`${angka} x ${i} = ${angka * i}`);
}
```

## Latihan

1. **Kalkulator Sederhana**
   Buat program dengan variable `a = 12`, `b = 4`, `operator = "+"`.
   Pake switch buat handle 4 operasi (+, -, *, /). Output:
   ```
   12 + 4 = 16
   12 - 4 = 8
   12 * 4 = 48
   12 / 4 = 3
   ```

2. **FizzBuzz (Soal Wawancara!)**
   Loop dari 1 sampe 30:
   - Kelipatan 3 → print "Fizz"
   - Kelipatan 5 → print "Buzz"
   - Kelipatan 3 DAN 5 → print "FizzBuzz"
   - Selainnya → print angkanya

3. **Tebak Angka**
   Komputer random 1-100, user nebak (pake prompt di browser atau hardcode).
   Kasih petunjuk "Lebih besar" / "Lebih kecil". Hitung berapa kali tebak.

4. **Bilangan Prima**
   Loop 2-50, cek mana aja bilangan prima.
   Bilangan prima: cuma bisa dibagi 1 dan dirinya sendiri.
   Output: `2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47`

5. **Deret Fibonacci**
   Cetak 20 angka pertama Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...
   Rumus: `fib(n) = fib(n-1) + fib(n-2)` dengan `fib(0)=0, fib(1)=1`

6. **Password Validator**
   Cek apakah password valid:
   - Minimal 8 karakter
   - Mengandung angka
   - Mengandung huruf besar
   Output: "Valid ✅" atau "Invalid ❌" + alasan

7. **Star Pattern Challenge**
   Cetak diamond:
   ```
       *
      ***
     *****
    *******
   *********
    *******
     *****
      ***
       *
   ```

8. **Short-Circuit Debug**
   ```javascript
   // Tebak output tanpa jalanin:
   console.log("A" && "B" && null && "C");
   console.log(false || 0 || "Halo" || undefined);
   console.log(null ?? "Default");
   console.log(0 ?? "Default");
   console.log("" || "Fallback");
   console.log("" ?? "Fallback");
   ```

9. **Optional Chaining Refactor**
   ```javascript
   const data = {
     user: null
     // user: { profile: { name: "Budi", address: { city: "Jakarta" } } }
   };

   // Refactor kode berikut pake optional chaining + nullish coalescing:
   let city = "Tidak diketahui";
   if (data && data.user && data.user.profile && data.user.profile.address) {
     city = data.user.profile.address.city;
   }
   console.log(city);
   ```
