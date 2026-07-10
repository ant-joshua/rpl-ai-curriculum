# 10. Fungsi Sederhana 🌱

**Level:** Mudah  
**Topik:** Function Declaration

## 🎯 Learning Objective
Mendefinisikan dan memanggil fungsi.

## 📝 Problem
Buat fungsi `sapa` yang menerima parameter `nama` dan mengembalikan string "Halo, [nama]!". Panggil dengan 3 nama berbeda.

## 🧪 Starter Code

```javascript
function sapa(nama) {
  return "... " + nama + "...";
}

console.log(sapa("..."));
console.log(sapa("..."));
console.log(sapa("..."));
```

## ✅ Expected Output

```
Halo, Adi!
Halo, Budi!
Halo, Cici!
```

## 💡 Hint
Gunakan `return` untuk mengembalikan nilai dari fungsi.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function sapa(nama) {
  return "Halo, " + nama + "!";
}

console.log(sapa("Adi"));
console.log(sapa("Budi"));
console.log(sapa("Cici"));
```
</details>
