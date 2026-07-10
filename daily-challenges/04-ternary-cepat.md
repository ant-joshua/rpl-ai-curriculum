# 04. Ternary Cepat 🌱

**Level:** Mudah  
**Topik:** Ternary Operator

## 🎯 Learning Objective
Menggunakan ternary operator sebagai alternatif if-else satu baris.

## 📝 Problem
Gunakan ternary operator untuk menentukan "Genap" atau "Ganjil" dari sebuah angka.

## 🧪 Starter Code

```javascript
let angka = 7;
let hasil = ... ? "..." : "...";

console.log(angka + " adalah " + hasil);
```

## ✅ Expected Output

```
7 adalah Ganjil
```

## 💡 Hint
Operator modulo `%` mengembalikan sisa bagi. `angka % 2 === 0` berarti genap.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let angka = 7;
let hasil = angka % 2 === 0 ? "Genap" : "Ganjil";

console.log(angka + " adalah " + hasil);
```
</details>
