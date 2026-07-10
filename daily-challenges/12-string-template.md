# 12. String Template 🌱

**Level:** Mudah  
**Topik:** Template Literal

## 🎯 Learning Objective
Menggunakan template literal (backtick) untuk string interpolation.

## 📝 Problem
Gunakan template literal untuk membuat kalimat: "Halo, nama saya [nama]. Saya [umur] tahun. Hobi saya [hobi]."

## 🧪 Starter Code

```javascript
let nama = "Dewi";
let umur = 16;
let hobi = "membaca";

let kalimat = `...`;  // gunakan template literal
console.log(kalimat);
```

## ✅ Expected Output

```
Halo, nama saya Dewi. Saya 16 tahun. Hobi saya membaca.
```

## 💡 Hint
Gunakan `${variabel}` di dalam backtick untuk menyisipkan nilai variabel.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let nama = "Dewi";
let umur = 16;
let hobi = "membaca";

let kalimat = `Halo, nama saya ${nama}. Saya ${umur} tahun. Hobi saya ${hobi}.`;
console.log(kalimat);
```
</details>
