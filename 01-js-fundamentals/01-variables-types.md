# 1.1 Variable & Tipe Data

## Variable

```javascript
// let — bisa diubah
let nama = "Budi";
nama = "Andi"; // OK

// const — tidak bisa diubah
const umur = 17;
umur = 18; // ERROR!

// var — JANGAN PAKAI (old)
```

## Tipe Data

| Tipe | Contoh | Keterangan |
|------|--------|------------|
| `string` | `"Halo"`, `'Halo'`, `\`Halo\`` | Teks |
| `number` | `42`, `3.14`, `-5` | Angka |
| `boolean` | `true`, `false` | Benar/salah |
| `undefined` | `let x;` | Belum diisi |
| `null` | `let x = null;` | Sengaja kosong |
| `object` | `{nama: "Budi"}` | Kumpulan data |

```javascript
const nama = "Budi";
const umur = 17;
const isStudent = true;

console.log(typeof nama); // `string`
console.log(typeof umur); // `number`
```

## Template Literals

```javascript
const nama = "Budi";
const nilai = 85;

// Old way
console.log("Nama: " + nama + ", Nilai: " + nilai);

// Modern (template literal)
console.log(`Nama: ${nama}, Nilai: ${nilai}`);
```

## Operator

```javascript
// Aritmatika
let a = 10 + 5;  // 15
let b = 10 - 5;  // 5
let c = 10 * 5;  // 50
let d = 10 / 5;  // 2
let e = 10 % 3;  // 1 (modulus / sisa bagi)

// Perbandingan
console.log(10 > 5);  // true
console.log(10 === 10); // true (=== strict equal)
console.log(10 == "10"); // true (loose, jangan dipake)
console.log(10 === "10"); // false

// Logical
console.log(true && false); // false (AND)
console.log(true || false); // true (OR)
console.log(!true); // false (NOT)
```

## Latihan

1. Bikin variable nama, umur, hobi. Print pakai template literal
2. Program konversi suhu: Celsius -> Fahrenheit
3. Program hitung luas lingkaran (input jari-jari)
4. Cek apakah angka genap/ganjil pake modulus
