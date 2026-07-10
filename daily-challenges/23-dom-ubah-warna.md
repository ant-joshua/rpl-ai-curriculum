# 23. DOM — Ubah Warna 🔥

**Level:** Sedang  
**Topik:** DOM Manipulation

## 🎯 Learning Objective
Memanipulasi elemen HTML dengan JavaScript (DOM).

## 📝 Problem
Buat halaman HTML dengan sebuah heading `<h1 id="judul">Halo Dunia</h1>` dan sebuah tombol. Saat tombol diklik, teks heading berubah menjadi "Berubah!" dan warnanya menjadi biru.

## 🧪 Starter Code

```html
<!DOCTYPE html>
<html>
<head><title>DOM Challenge</title></head>
<body>
  <h1 id="judul">Halo Dunia</h1>
  <button id="tombol">Klik Saya</button>

  <script>
    document.getElementById("tombol").addEventListener("click", function() {
      let judul = document.getElementById("...");
      judul.textContent = "...";
      judul.style.color = "...";
    });
  </script>
</body>
</html>
```

## ✅ Expected Output
Saat tombol diklik: heading berubah jadi "Berubah!" dengan warna biru.

## 💡 Hint
Gunakan `document.getElementById()` untuk memilih elemen, lalu ubah `textContent` dan `style.color`.

<details>
<summary>Klik untuk lihat solusi</summary>

```html
<!DOCTYPE html>
<html>
<head><title>DOM Challenge</title></head>
<body>
  <h1 id="judul">Halo Dunia</h1>
  <button id="tombol">Klik Saya</button>

  <script>
    document.getElementById("tombol").addEventListener("click", function() {
      let judul = document.getElementById("judul");
      judul.textContent = "Berubah!";
      judul.style.color = "blue";
    });
  </script>
</body>
</html>
```
</details>
