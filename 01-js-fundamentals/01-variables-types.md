# 1.1 Variable & Tipe Data

## Variable — Cara Nyimpen Data

Variable = wadah buat nyimpen data di memory komputer. Anggap aja kaya **label kotak** — lo tulis "Buku" di luar kotak, isinya buku beneran.

```javascript
// let — bisa diubah kapan aja
let nama = "Budi";
nama = "Andi"; // OK, isi kotak diganti

// const — tetap, ga bisa diubah
const umur = 17;
umur = 18; // ERROR! TypeError: Assignment to constant variable

// var — JANGAN PAKAI (cara lama, bermasalah)
```

**Kapan pake `let` vs `const`?**

| Pake `const` | Pake `let` |
|---|---|
| Nilai gak bakal berubah | Nilai bakal berubah |
| Array/Object (isi bisa berubah, referensi tetap) | Counter, accumulator |
| Config, default value | Temporary variable dalam loop |
| Lebih aman — mencegah ketimpa | Hanya kalo perlu mutable |

> **Golden Rule:** Pake `const` secara default. Ganti `let` kalo emang perlu reassign.

## Tipe Data Dasar

JavaScript punya 7 tipe data primitif + 1 object:

| Tipe | Contoh | Keterangan |
|------|--------|------------|
| `string` | `"Halo"`, `'Halo'`, `` `Halo` `` | Teks — pake quotes / backtick |
| `number` | `42`, `3.14`, `-5`, `Infinity` | Angka — integer, float, negatif |
| `boolean` | `true`, `false` | True/false — buat logic |
| `undefined` | `let x;` | Variable belum diisi |
| `null` | `let x = null;` | Sengaja dikosongin |
| `bigint` | `9007199254740991n` | Angka gede banget (jarang dipake) |
| `symbol` | `Symbol("id")` | Identifier unik (jarang dipake) |
| `object` | `{nama: "Budi"}` | Kumpulan data (besok dibahas) |

```javascript
const nama = "Budi";
const umur = 17;
const isStudent = true;
const nilai = null; // Belum ada nilai
let alamat; // undefined

console.log(typeof nama);  // "string"
console.log(typeof umur);  // "number"
console.log(typeof isStudent); // "boolean"
console.log(typeof nilai); // "object" (quirks JS — null is object)
console.log(typeof alamat); // "undefined"
```

> `typeof null` balik `"object"` — ini **bug historic** JavaScript yang gak bisa diperbaiki karena bakal ngerusak ribuan website. Remember: null is null.

## String — Ngolah Teks

```javascript
const nama = "Budi";
const jurusan = 'RPL';

// Concatenation (cara lama — pake +)
const kalimatLama = nama + " belajar " + jurusan;

// Template Literal (cara modern — pake backtick)
const kalimatBaru = `${nama} belajar ${jurusan}`;
console.log(kalimatBaru); // "Budi belajar RPL"

// Method string yang berguna
const text = "  JavaScript itu Asik!  ";
console.log(text.length);          // 23 (spasi diitung)
console.log(text.trim());          // "JavaScript itu Asik!"
console.log(text.toLowerCase());   // "  javascript itu asik!  "
console.log(text.toUpperCase());   // "  JAVASCRIPT ITU ASIK!  "
console.log(text.includes("Asik")); // true
console.log(text.replace("Asik", "Keren")); // "  JavaScript itu Keren!  "
console.log(text.split(" "));      // ["", "", "JavaScript", "itu", "Asik!", "", ""]

// Chaining
const bersih = text.trim().replace("Asik", "Power").toLowerCase();
console.log(bersih); // "javascript itu power"
```

## Number — Ngitung

```javascript
// Aritmatika dasar
let a = 10 + 5;   // 15 (tambah)
let b = 10 - 5;   // 5 (kurang)
let c = 10 * 5;   // 50 (kali)
let d = 10 / 5;   // 2 (bagi)
let e = 10 % 3;   // 1 (modulus — sisa bagi, penting!)
let f = 2 ** 3;   // 8 (pangkat/exponentiation)

// Modulus — sering dipake buat cek genap/ganjil
console.log(10 % 2); // 0 → genap
console.log(11 % 2); // 1 → ganjil

// Operator pintar
let nilai = 10;
nilai += 5;   // nilai = 15
nilai -= 3;   // nilai = 12
nilai *= 2;   // nilai = 24
nilai++;      // nilai = 25 (increment)
nilai--;      // nilai = 24 (decrement)

// Hati-hati: float precision
console.log(0.1 + 0.2); // 0.30000000000000004 (bukan 0.3!)
// Solusi: pake Math.round()
console.log(Math.round((0.1 + 0.2) * 100) / 100); // 0.3
```

## Comparison & Logical Operators

```javascript
// Perbandingan — SELALU pake === (strict), jangan ==
console.log(10 > 5);   // true
console.log(10 < 5);   // false
console.log(10 >= 10); // true
console.log(10 === 10); // true (strict — tipe & value sama)
console.log(10 === "10"); // false (number vs string!)
console.log(10 == "10");  // true (loose — JANGAN DIPAKE)

// Logical
const umur = 17;
const punyaSIM = true;

console.log(umur >= 17 && punyaSIM);  // true (AND — dua-duanya harus true)
console.log(umur >= 17 || punyaSIM);  // true (OR — salah satu true)
console.log(!punyaSIM);               // false (NOT — kebalikan)

// Truthy & Falsy — penting buat conditional
// Falsy values: false, 0, "", null, undefined, NaN
// Sisanya truthy

if ("") console.log("Jalan");     // Gak jalan — string kosong falsy
if ("Halo") console.log("Jalan"); // Jalan — string isi truthy
if (0) console.log("Jalan");     // Gak jalan
if (1) console.log("Jalan");     // Jalan
```

## Type Coercion — Hati-hati!

JavaScript suka otomatis ngerubah tipe. Kadang berguna, kadang nyebelin:

```javascript
// String + Number = String
console.log("5" + 3);     // "53" (angka 3 dirubah jadi string)
console.log("5" + 3 + 2); // "532" (string terus)
console.log(5 + 3 + "2"); // "82" (5+3 dulu = 8, baru concat)

// Operasi lain = Number
console.log("5" - 3);     // 2 (string "5" dirubah jadi number)
console.log("5" * "3");   // 15
console.log("hello" - 1); // NaN (Not a Number)

// Boolean coercion
console.log(Boolean(1));    // true
console.log(Boolean(0));    // false
console.log(Boolean(""));   // false
console.log(Boolean("a"));  // true
console.log(Boolean(null)); // false
console.log(Boolean(undefined)); // false

// Cara aman convert
const angka = Number("42");  // 42
const teks = String(42);     // "42"
const logika = Boolean(1);   // true
```

## Latihan

1. **Biodata Variable**
   Buat variable `nama`, `umur`, `kelas`, `jurusan`, `isLulus`. Print pake template literal:
   ```
   Halo, nama saya Budi (17 tahun). Saya kelas XII RPL. Status lulus: true.
   ```

2. **Kalkulator Sederhana**
   Bikin 3 variable: `a = 25`, `b = 7`. Hitung dan print:
   - Hasil tambah
   - Hasil bagi (sampe desimal)
   - Sisa bagi (modulus)
   - `a` pangkat `b`

3. **String Manipulation**
   ```javascript
   const data = "  budi@GMAIL.COM  ";
   // Gunakan method string buat menghasilkan: "budi@gmail.com"
   ```

4. **Konversi Suhu**
   Program: input Celsius → output Fahrenheit.
   Rumus: `F = (C * 9/5) + 32`
   Test: `30°C = 86°F`

5. **Tenary Challenge**
   ```javascript
   const nilai = 78;
   // Pake ternary: output "Lulus" kalo >= 75, "Remedial" kalo kurang
   ```

6. **Type Coercion Quiz**
   Tebak outputnya tanpa jalanin:
   ```javascript
   console.log(1 + "2" + 3);
   console.log(1 + 2 + "3");
   console.log("5" - "3" + 2);
   console.log(!"false" == !false); // Hmm...
   console.log(null + 1);
   console.log(undefined + 1);
   ```
