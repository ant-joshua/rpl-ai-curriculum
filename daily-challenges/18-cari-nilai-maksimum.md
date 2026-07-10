# 18. Cari Nilai Maksimum 🔥

**Level:** Sedang  
**Topik:** Array & Loops

## 🎯 Learning Objective
Mencari nilai terbesar dalam array menggunakan loop.

## 📝 Problem
Buat fungsi `cariMax(arr)` yang menerima array of numbers dan mengembalikan nilai terbesar.

## 🧪 Starter Code

```javascript
function cariMax(arr) {
  // Tulis logika di sini
}

console.log(cariMax([3, 7, 2, 9, 5]));
console.log(cariMax([-5, -2, -8, -1]));
console.log(cariMax([100]));
```

## ✅ Expected Output

```
9
-1
100
```

## 💡 Hint
Inisialisasi `max` dengan elemen pertama array, lalu bandingkan satu per satu.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function cariMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}

console.log(cariMax([3, 7, 2, 9, 5]));
console.log(cariMax([-5, -2, -8, -1]));
console.log(cariMax([100]));
```
</details>
