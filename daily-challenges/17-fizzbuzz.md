# 17. FizzBuzz 🔥

**Level:** Sedang  
**Topik:** Loops & Conditionals

## 🎯 Learning Objective
Menggabungkan loop dan kondisi untuk problem klasik FizzBuzz.

## 📝 Problem
Cetak angka 1–50 dengan aturan:
- Jika kelipatan 3 → cetak "Fizz"
- Jika kelipatan 5 → cetak "Buzz"
- Jika kelipatan 3 dan 5 → cetak "FizzBuzz"
- Selain itu → cetak angkanya

## 🧪 Starter Code

```javascript
for (let i = 1; i <= 50; i++) {
  // Tulis logika di sini
}
```

## ✅ Expected Output (sebagian)

```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
...
```

## 💡 Hint
Cek kelipatan 3 DAN 5 terlebih dahulu (i % 15 === 0) sebelum cek yang lain.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
for (let i = 1; i <= 50; i++) {
  if (i % 15 === 0) {
    console.log("FizzBuzz");
  } else if (i % 3 === 0) {
    console.log("Fizz");
  } else if (i % 5 === 0) {
    console.log("Buzz");
  } else {
    console.log(i);
  }
}
```
</details>
