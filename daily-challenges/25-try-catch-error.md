# 25. Try-Catch Error 🔥

**Level:** Sedang  
**Topik:** Error Handling

## 🎯 Learning Objective
Menangani error dengan `try-catch-finally`.

## 📝 Problem
Buat fungsi `bagi(a, b)` yang mengembalikan hasil pembagian. Jika `b === 0`, throw error "Tidak bisa dibagi nol!". Tangani error dan cetak pesannya.

## 🧪 Starter Code

```javascript
function bagi(a, b) {
  if (b === 0) {
    throw new Error("...");
  }
  return a / b;
}

try {
  console.log(bagi(10, 2));
  console.log(bagi(10, 0));
} catch (error) {
  console.log("Terjadi error:", error.message);
} finally {
  console.log("Selesai mencoba.");
}
```

## ✅ Expected Output

```
5
Terjadi error: Tidak bisa dibagi nol!
Selesai mencoba.
```

## 💡 Hint
`error.message` mengambil pesan dari error. `finally` selalu dijalankan, error atau tidak.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function bagi(a, b) {
  if (b === 0) {
    throw new Error("Tidak bisa dibagi nol!");
  }
  return a / b;
}

try {
  console.log(bagi(10, 2));
  console.log(bagi(10, 0));
} catch (error) {
  console.log("Terjadi error:", error.message);
} finally {
  console.log("Selesai mencoba.");
}
```
</details>
