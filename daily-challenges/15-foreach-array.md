# 15. ForEach Array 🌱

**Level:** Mudah  
**Topik:** Array forEach

## 🎯 Learning Objective
Menggunakan method `forEach()` untuk iterasi array.

## 📝 Problem
Diberikan array `["Apel", "Mangga", "Jeruk", "Anggur"]`, cetak setiap buah dengan format "Buah: [nama]".

## 🧪 Starter Code

```javascript
let buah = ["Apel", "Mangga", "Jeruk", "Anggur"];

buah.forEach(function(item) {
  console.log("Buah: " + ...);
});
```

## ✅ Expected Output

```
Buah: Apel
Buah: Mangga
Buah: Jeruk
Buah: Anggur
```

## 💡 Hint
`forEach` menerima callback function yang dipanggil untuk setiap elemen. Bisa juga pakai arrow function.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let buah = ["Apel", "Mangga", "Jeruk", "Anggur"];

buah.forEach(item => {
  console.log("Buah: " + item);
});
```
</details>
