# 14. Array Push & Pop 🌱

**Level:** Mudah  
**Topik:** Array Methods (push, pop)

## 🎯 Learning Objective
Menambah dan menghapus elemen array dengan `push()` dan `pop()`.

## 📝 Problem
Mulai dengan array `[1, 2, 3]`. Push angka 4 dan 5. Lalu pop satu elemen. Cetak array setelah setiap operasi.

## 🧪 Starter Code

```javascript
let arr = [1, 2, 3];
console.log("Awal:", arr);

arr.push(...);
console.log("Setelah push 4:", arr);

arr.push(...);
console.log("Setelah push 5:", arr);

let dihapus = arr.pop();
console.log("Setelah pop:", arr);
console.log("Elemen dihapus:", dihapus);
```

## ✅ Expected Output

```
Awal: [1, 2, 3]
Setelah push 4: [1, 2, 3, 4]
Setelah push 5: [1, 2, 3, 4, 5]
Setelah pop: [1, 2, 3, 4]
Elemen dihapus: 5
```

## 💡 Hint
`push()` menambah di akhir, `pop()` menghapus dari akhir dan mengembalikan elemen yang dihapus.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let arr = [1, 2, 3];
console.log("Awal:", arr);

arr.push(4);
console.log("Setelah push 4:", arr);

arr.push(5);
console.log("Setelah push 5:", arr);

let dihapus = arr.pop();
console.log("Setelah pop:", arr);
console.log("Elemen dihapus:", dihapus);
```
</details>
