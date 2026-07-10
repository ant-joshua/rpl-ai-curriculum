# 21. Reduce — Jumlah Total 🔥

**Level:** Sedang  
**Topik:** Array Reduce

## 🎯 Learning Objective
Menggunakan method `reduce()` untuk mengagregasi nilai array.

## 📝 Problem
Buat fungsi `jumlahTotal(arr)` yang menjumlahkan semua elemen array menggunakan `reduce()`.

## 🧪 Starter Code

```javascript
function jumlahTotal(arr) {
  // Gunakan method reduce
}

console.log(jumlahTotal([1, 2, 3, 4, 5]));
console.log(jumlahTotal([100, 200, 300]));
console.log(jumlahTotal([7]));
```

## ✅ Expected Output

```
15
600
7
```

## 💡 Hint
`arr.reduce((acc, curr) => acc + curr, 0)` — parameter kedua `0` adalah nilai awal akumulator.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function jumlahTotal(arr) {
  return arr.reduce((acc, curr) => acc + curr, 0);
}

console.log(jumlahTotal([1, 2, 3, 4, 5]));
console.log(jumlahTotal([100, 200, 300]));
console.log(jumlahTotal([7]));
```
</details>
