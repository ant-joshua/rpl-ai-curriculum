# 24. Async — Timer 🔥

**Level:** Sedang  
**Topik:** setTimeout & Callback

## 🎯 Learning Objective
Menggunakan `setTimeout` untuk menjalankan kode setelah jeda waktu.

## 📝 Problem
Buat program yang mencetak:
1. "Mulai..." langsung
2. "Selesai!" setelah 2 detik (2000ms)
3. "Proses..." di tengah (1 detik setelah mulai)

## 🧪 Starter Code

```javascript
console.log("Mulai...");

setTimeout(function() {
  console.log("...");
}, ...);

setTimeout(function() {
  console.log("...");
}, ...);
```

## ✅ Expected Output

```
Mulai...
Proses...
Selesai!
```

(Output muncul dengan jeda 1 detik dan 2 detik)

## 💡 Hint
`setTimeout(callback, delayMs)` — delay dalam milidetik. 1 detik = 1000ms.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
console.log("Mulai...");

setTimeout(() => {
  console.log("Proses...");
}, 1000);

setTimeout(() => {
  console.log("Selesai!");
}, 2000);
```
</details>
