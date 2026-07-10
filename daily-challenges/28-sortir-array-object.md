# 28. Sortir Array Object 💀

**Level:** Sulit  
**Topik:** Array Sort & Object

## 🎯 Learning Objective
Mengurutkan array of objects berdasarkan properti tertentu.

## 📝 Problem
Diberikan array produk, urutkan berdasarkan harga termurah ke termahal. Jika harga sama, urutkan berdasarkan nama A-Z.

## 🧪 Starter Code

```javascript
let produk = [
  { nama: "Buku", harga: 5000 },
  { nama: "Pensil", harga: 2000 },
  { nama: "Penggaris", harga: 3000 },
  { nama: "Penghapus", harga: 2000 },
  { nama: "Tas", harga: 50000 }
];

// Urutkan dengan sort()
produk.sort((a, b) => {
  // Tulis logika sorting
});

console.log(produk);
```

## ✅ Expected Output

```
[
  { nama: "Pensil", harga: 2000 },
  { nama: "Penghapus", harga: 2000 },
  { nama: "Penggaris", harga: 3000 },
  { nama: "Buku", harga: 5000 },
  { nama: "Tas", harga: 50000 }
]
```

## 💡 Hint
`sort()` menerima comparator: return negatif jika a < b, positif jika a > b. Untuk sorting multi-level, gunakan `||`.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let produk = [
  { nama: "Buku", harga: 5000 },
  { nama: "Pensil", harga: 2000 },
  { nama: "Penggaris", harga: 3000 },
  { nama: "Penghapus", harga: 2000 },
  { nama: "Tas", harga: 50000 }
];

produk.sort((a, b) => {
  if (a.harga !== b.harga) {
    return a.harga - b.harga;
  }
  return a.nama.localeCompare(b.nama);
});

console.log(produk);
```
</details>
