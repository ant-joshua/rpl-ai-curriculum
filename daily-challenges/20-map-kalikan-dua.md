# 20. Map — Kalikan Dua 🔥

**Level:** Sedang  
**Topik:** Array Map

## 🎯 Learning Objective
Menggunakan method `map()` untuk transformasi array.

## 📝 Problem
Buat fungsi `kaliDua(arr)` yang mengembalikan array baru dengan setiap elemen dikalikan 2.

## 🧪 Starter Code

```javascript
function kaliDua(arr) {
  // Gunakan method map
}

console.log(kaliDua([1, 2, 3, 4, 5]));
console.log(kaliDua([10, 20, 30]));
```

## ✅ Expected Output

```
[2, 4, 6, 8, 10]
[20, 40, 60]
```

## 💡 Hint
`arr.map(item => item * 2)` — map selalu mengembalikan array dengan panjang yang sama.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function kaliDua(arr) {
  return arr.map(item => item * 2);
}

console.log(kaliDua([1, 2, 3, 4, 5]));
console.log(kaliDua([10, 20, 30]));
```
</details>
