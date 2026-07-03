# 1.3 Array & Object

## Array

```javascript
// Bikin array
const fruits = ["Apel", "Mangga", "Jeruk", "Pisang"];

// Akses
console.log(fruits[0]); // "Apel"
console.log(fruits.length); // 4

// Manipulasi
fruits.push("Anggur");   // Tambah di akhir
fruits.pop();            // Hapus dari akhir
```

## Array Methods (Modern, Penting!)

```javascript
const numbers = [1, 2, 3, 4, 5];

// map - transformasi
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter - saring
const even = numbers.filter(n => n % 2 === 0);
// [2, 4]

// reduce - akumulasi
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 15
```

## Object

```javascript
const siswa = {
  nama: "Budi",
  umur: 17,
  kelas: "XII RPL",
  nilai: {
    matematika: 85,
    bahasa: 90,
  },
};

// Akses
console.log(siswa.nama);  // "Budi"
console.log(siswa.nilai.matematika); // 85

// Destructuring
const { nama, umur } = siswa;
console.log(nama, umur);

// Spread operator
const siswaBaru = { ...siswa, nama: "Andi" };
```

## Latihan

1. Array: buat daftar belanja, tambah item, hapus item, tampilkan
2. Array: filter harga > 10000 dari array produk
3. Object: buat data 5 siswa, hitung rata-rata nilai
4. Object + Array: contact book (tambah, cari, hapus kontak)
