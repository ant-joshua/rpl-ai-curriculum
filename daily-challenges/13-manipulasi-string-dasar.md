# 13. Manipulasi String Dasar 🌱

**Level:** Mudah  
**Topik:** String Methods

## 🎯 Learning Objective
Menggunakan method string seperti `toUpperCase()`, `toLowerCase()`, `length`, `trim()`.

## 📝 Problem
Buat program yang menerima teks "   JavaScript itu Menyenangkan   " lalu cetak:
1. Panjang string (termasuk spasi)
2. String setelah di-trim (hapus spasi depan/belakang)
3. String uppercase
4. String lowercase

## 🧪 Starter Code

```javascript
let teks = "   JavaScript itu Menyenangkan   ";

console.log("Panjang:", ...);
console.log("Trim:", ...);
console.log("Uppercase:", ...);
console.log("Lowercase:", ...);
```

## ✅ Expected Output

```
Panjang: 36
Trim: JavaScript itu Menyenangkan
Uppercase: JAVASCRIPT ITU MENYENANGKAN
Lowercase: javascript itu menyenangkan
```

## 💡 Hint
Method-method string bisa dirantai (chained): `teks.trim().toUpperCase()`.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let teks = "   JavaScript itu Menyenangkan   ";

console.log("Panjang:", teks.length);
console.log("Trim:", teks.trim());
console.log("Uppercase:", teks.trim().toUpperCase());
console.log("Lowercase:", teks.trim().toLowerCase());
```
</details>
