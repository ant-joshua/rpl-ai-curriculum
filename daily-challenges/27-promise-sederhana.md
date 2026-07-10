# 27. Promise Sederhana 💀

**Level:** Sulit  
**Topik:** Promise & Async/Await

## 🎯 Learning Objective
Membuat dan menggunakan Promise dengan async/await.

## 📝 Problem
Buat fungsi `tunda(ms)` yang mengembalikan Promise yang resolve setelah `ms` milidetik. Lalu buat fungsi `jalan()` async yang menunggu 1 detik, cetak "Satu", tunggu 500ms, cetak "Dua", tunggu 200ms, cetak "Tiga".

## 🧪 Starter Code

```javascript
function tunda(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ...);
  });
}

async function jalan() {
  // Tulis kode async di sini
}

jalan();
```

## ✅ Expected Output

```
Satu
Dua
Tiga
```

(setiap baris muncul dengan jeda waktu)

## 💡 Hint
`new Promise(resolve => setTimeout(resolve, ms))`. Di async function, gunakan `await tunda(ms)`.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function tunda(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function jalan() {
  await tunda(1000);
  console.log("Satu");
  await tunda(500);
  console.log("Dua");
  await tunda(200);
  console.log("Tiga");
}

jalan();
```
</details>
