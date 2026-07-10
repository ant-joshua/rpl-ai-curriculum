# 08. Array & Index 🌱

**Level:** Mudah  
**Topik:** Array

## 🎯 Learning Objective
Membuat array dan mengakses elemen berdasarkan indeks.

## 📝 Problem
Buat array berisi 5 nama teman. Cetak nama pertama, ketiga, dan terakhir.

## 🧪 Starter Code

```javascript
let teman = ["...", "...", "...", "...", "..."];

console.log("Teman pertama:", ...);
console.log("Teman ketiga:", ...);
console.log("Teman terakhir:", ...);
```

## ✅ Expected Output

```
Teman pertama: Adi
Teman ketiga: Cici
Teman terakhir: Eka
```

## 💡 Hint
Indeks array dimulai dari 0. Panjang array: `array.length`.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let teman = ["Adi", "Budi", "Cici", "Dewi", "Eka"];

console.log("Teman pertama:", teman[0]);
console.log("Teman ketiga:", teman[2]);
console.log("Teman terakhir:", teman[teman.length - 1]);
```
</details>
