# 07. While Loop Mundur 🌱

**Level:** Mudah  
**Topik:** While Loop

## 🎯 Learning Objective
Menggunakan `while` loop dengan logika mundur (decrement).

## 📝 Problem
Cetak angka 10 sampai 1 (mundur) menggunakan `while` loop.

## 🧪 Starter Code

```javascript
let i = ...;
while (i ...) {
  console.log(...);
  ...;
}
```

## ✅ Expected Output

```
10
9
8
7
6
5
4
3
2
1
```

## 💡 Hint
Mulai dari 10, kurangi `i--` setiap iterasi, berhenti saat `i >= 1`.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let i = 10;
while (i >= 1) {
  console.log(i);
  i--;
}
```
</details>
