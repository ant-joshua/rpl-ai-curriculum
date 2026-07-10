# 19. Filter Array Ganjil 🔥

**Level:** Sedang  
**Topik:** Array Filter

## 🎯 Learning Objective
Menggunakan method `filter()` untuk menyaring elemen array.

## 📝 Problem
Buat fungsi `filterGanjil(arr)` yang mengembalikan array berisi hanya angka ganjil.

## 🧪 Starter Code

```javascript
function filterGanjil(arr) {
  // Gunakan method filter
}

console.log(filterGanjil([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(filterGanjil([12, 14, 15, 18, 21]));
```

## ✅ Expected Output

```
[1, 3, 5, 7, 9]
[15, 21]
```

## 💡 Hint
`arr.filter(callback)` — callback mengembalikan `true` untuk elemen yang dipertahankan. Cek ganjil: `num % 2 !== 0`.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function filterGanjil(arr) {
  return arr.filter(num => num % 2 !== 0);
}

console.log(filterGanjil([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(filterGanjil([12, 14, 15, 18, 21]));
```
</details>
