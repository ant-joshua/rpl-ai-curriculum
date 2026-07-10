# 11. Arrow Function 🌱

**Level:** Mudah  
**Topik:** Arrow Function

## 🎯 Learning Objective
Menulis fungsi menggunakan sintaks arrow function `=>`.

## 📝 Problem
Ubah fungsi `kaliDua` berikut ke arrow function.

## 🧪 Starter Code

```javascript
// Ubah ke arrow function
function kaliDua(a) {
  return a * 2;
}

console.log(kaliDua(5));
console.log(kaliDua(10));
console.log(kaliDua(100));
```

## ✅ Expected Output

```
10
20
200
```

## 💡 Hint
Arrow function: `const nama = (param) => expression;` Jika hanya satu parameter, tanda kurung bisa dihilangkan.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
const kaliDua = (a) => a * 2;
// Atau: const kaliDua = a => a * 2;

console.log(kaliDua(5));
console.log(kaliDua(10));
console.log(kaliDua(100));
```
</details>
