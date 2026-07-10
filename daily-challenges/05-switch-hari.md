# 05. Switch Hari 🌱

**Level:** Mudah  
**Topik:** Switch Statement

## 🎯 Learning Objective
Menggunakan `switch` untuk percabangan multi-kondisi.

## 📝 Problem
Buat program yang menerima angka 1–7 dan mengembalikan nama hari (Senin–Minggu). Jika di luar range, cetak "Hari tidak valid".

## 🧪 Starter Code

```javascript
let hari = 3;
let namaHari;

switch (hari) {
  case 1:
    namaHari = "...";
    break;
  case 2:
    namaHari = "...";
    break;
  // ... tambah case lainnya
  default:
    namaHari = "...";
}

console.log(namaHari);
```

## ✅ Expected Output

```
Rabu
```

## 💡 Hint
Jangan lupa `break` di setiap case untuk mencegah fall-through.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let hari = 3;
let namaHari;

switch (hari) {
  case 1: namaHari = "Senin"; break;
  case 2: namaHari = "Selasa"; break;
  case 3: namaHari = "Rabu"; break;
  case 4: namaHari = "Kamis"; break;
  case 5: namaHari = "Jumat"; break;
  case 6: namaHari = "Sabtu"; break;
  case 7: namaHari = "Minggu"; break;
  default: namaHari = "Hari tidak valid";
}

console.log(namaHari);
```
</details>
