# Node.js — Exercise #1: File System (fs/promises)

> **Level:** Beginner
> **Topics:** fs/promises, readFile, writeFile, file I/O, async

## Instructions

Buat fungsi-fungsi untuk membaca dan menulis file menggunakan `fs/promises` (versi Promise-based dari Node.js `fs`).

1. `bacaFile(path)` — baca file dan return isinya sebagai string.
2. `tulisFile(path, konten)` — tulis konten ke file, return "Berhasil menulis file".
3. `hitungBaris(path)` — baca file dan hitung jumlah baris.
4. `buatFileCatatan(path, catatan)` — tulis array of objects ke file JSON.

## Starter Code

```javascript
const fs = require('fs/promises');
const path = require('path');

async function bacaFile(filePath) {
  // TODO: baca file, return isinya
  // Gunakan try/catch, return null jika error
}

async function tulisFile(filePath, konten) {
  // TODO: tulis konten ke file, return pesan sukses
}

async function hitungBaris(filePath) {
  // TODO: baca file, hitung jumlah baris
  // Split by newline, filter empty lines
}

async function buatFileCatatan(filePath, catatan) {
  // TODO: tulis array catatan ke file JSON (indent 2)
}

// Test (akan dijalankan di Node.js)
async function main() {
  const testFile = './test.txt';
  
  console.log(await tulisFile(testFile, 'Baris 1\nBaris 2\nBaris 3'));
  console.log(await bacaFile(testFile));
  console.log('Jumlah baris:', await hitungBaris(testFile));
  
  const catatan = [
    { judul: 'Belajar Node.js', selesai: false },
    { judul: 'Belajar Express', selesai: true }
  ];
  console.log(await buatFileCatatan('catatan.json', catatan));
}

// main();
```

## Expected Output

```
Berhasil menulis file
Baris 1
Baris 2
Baris 3
Jumlah baris: 3
Berhasil membuat file catatan
```

## Test Cases

```javascript
// Test di Node.js
const fs = require('fs/promises');
// bacaFile('nonexistent.txt').then(r => console.log(r === null));  // true
```
