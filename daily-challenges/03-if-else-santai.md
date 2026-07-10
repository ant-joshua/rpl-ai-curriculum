# 03. If-Else Santai 🌱

**Level:** Mudah  
**Topik:** Conditionals (if/else)

## 🎯 Learning Objective
Menggunakan percabangan `if-else` untuk mengambil keputusan.

## 📝 Problem
Buat program yang menerima variabel `nilai` (0–100). Cetak "Lulus" jika nilai >= 70, "Tidak Lulus" jika < 70.

## 🧪 Starter Code

```javascript
let nilai = 85;
let status = ...;

if (...) {
  status = "...";
} else {
  status = "...";
}

console.log(status);
```

## ✅ Expected Output

```
Lulus
```

## 💡 Hint
Operator perbandingan: `>=` (lebih besar atau sama dengan).

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let nilai = 85;
let status;

if (nilai >= 70) {
  status = "Lulus";
} else {
  status = "Tidak Lulus";
}

console.log(status);
```
</details>
