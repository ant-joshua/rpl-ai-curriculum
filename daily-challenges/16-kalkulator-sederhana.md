# 16. Kalkulator Sederhana 🔥

**Level:** Sedang  
**Topik:** Function dengan Switch

## 🎯 Learning Objective
Menggabungkan fungsi dan switch untuk membuat kalkulator CLI.

## 📝 Problem
Buat fungsi `kalkulator(angka1, angka2, operator)` yang menerima dua angka dan operator (`+`, `-`, `*`, `/`). Kembalikan hasil perhitungan. Jika operator tidak dikenal, kembalikan "Operator tidak valid".

## 🧪 Starter Code

```javascript
function kalkulator(a, b, op) {
  // Gunakan switch untuk menentukan operasi
}

console.log(kalkulator(10, 5, "+"));
console.log(kalkulator(10, 5, "-"));
console.log(kalkulator(10, 5, "*"));
console.log(kalkulator(10, 5, "/"));
console.log(kalkulator(10, 5, "%"));
```

## ✅ Expected Output

```
15
5
50
2
Operator tidak valid
```

## 💡 Hint
Gunakan `switch(op)` dengan case `"+"`, `"-"`, dll. Jangan lupa `break` atau `return` langsung.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function kalkulator(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return a / b;
    default: return "Operator tidak valid";
  }
}

console.log(kalkulator(10, 5, "+"));
console.log(kalkulator(10, 5, "-"));
console.log(kalkulator(10, 5, "*"));
console.log(kalkulator(10, 5, "/"));
console.log(kalkulator(10, 5, "%"));
```
</details>
