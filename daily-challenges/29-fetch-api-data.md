# 29. Fetch API Data 💀

**Level:** Sulit  
**Topik:** Fetch API & Async

## 🎯 Learning Objective
Menggunakan `fetch()` untuk mengambil data dari API eksternal secara async.

## 📝 Problem
Ambil data dari `https://jsonplaceholder.typicode.com/posts/1` menggunakan `fetch()`. Cetak `title` dan `body` dari response. Tangani error jika fetch gagal.

## 🧪 Starter Code

```javascript
async function ambilData() {
  try {
    let response = await fetch("...");
    let data = await response.json();
    console.log("Judul:", ...);
    console.log("Isi:", ...);
  } catch (error) {
    console.log("Gagal mengambil data:", ...);
  }
}

ambilData();
```

## ✅ Expected Output

```
Judul: sunt aut facere repellat provident occaecati excepturi optio reprehenderit
Isi: quia et suscipit...
```

## 💡 Hint
`fetch(url)` mengembalikan Promise. Gunakan `await` atau `.then()`. Response perlu di-parse dengan `.json()`.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
async function ambilData() {
  try {
    let response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    let data = await response.json();
    console.log("Judul:", data.title);
    console.log("Isi:", data.body);
  } catch (error) {
    console.log("Gagal mengambil data:", error.message);
  }
}

ambilData();
```
</details>
