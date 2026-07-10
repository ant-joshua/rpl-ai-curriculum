# 02. Tipe Data Dasar 🌱

**Level:** Mudah  
**Topik:** Tipe Data (String, Number, Boolean)

## 🎯 Learning Objective
Mengenal dan membedakan tipe data primitif di JavaScript.

## 📝 Problem
Buat empat variabel dengan tipe berbeda: `string`, `number`, `boolean`, dan `null`. Cetak tipe setiap variabel menggunakan `typeof`.

## 🧪 Starter Code

```javascript
let nama = "...";        // string
let umur = ...;           // number
let aktif = ...;          // boolean
let kosong = ...;         // null

console.log(typeof nama);
console.log(typeof umur);
console.log(typeof aktif);
console.log(typeof kosong);
```

## ✅ Expected Output

```
string
number
boolean
object
```

## 💡 Hint
`typeof null` mengembalikan `"object"` — ini bug historis JavaScript yang sudah terkenal.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let nama = "Budi";
let umur = 17;
let aktif = true;
let kosong = null;

console.log(typeof nama);
console.log(typeof umur);
console.log(typeof aktif);
console.log(typeof kosong);
```
</details>
