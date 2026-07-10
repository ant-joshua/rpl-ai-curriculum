# 22. Manipulasi Object 🔥

**Level:** Sedang  
**Topik:** Object Array & Loop

## 🎯 Learning Objective
Mengolah array of objects dengan loop.

## 📝 Problem
Diberikan array siswa dengan properti `nama` dan `nilai`. Hitung rata-rata nilai dan tentukan siapa yang lulus (nilai >= 70).

## 🧪 Starter Code

```javascript
let siswa = [
  { nama: "Adi", nilai: 85 },
  { nama: "Budi", nilai: 60 },
  { nama: "Cici", nilai: 75 },
  { nama: "Dewi", nilai: 45 },
  { nama: "Eka", nilai: 90 }
];

// Hitung rata-rata
let total = 0;
// ... loop

let rataRata = total / siswa.length;
console.log("Rata-rata:", rataRata);

// Cetak yang lulus
siswa.forEach(s => {
  if (s.nilai >= 70) {
    console.log(s.nama + " lulus");
  }
});
```

## ✅ Expected Output

```
Rata-rata: 71
Adi lulus
Cici lulus
Eka lulus
```

## 💡 Hint
Gunakan `for` atau `forEach` untuk mengakses setiap object dan properti `nilai`.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
let siswa = [
  { nama: "Adi", nilai: 85 },
  { nama: "Budi", nilai: 60 },
  { nama: "Cici", nilai: 75 },
  { nama: "Dewi", nilai: 45 },
  { nama: "Eka", nilai: 90 }
];

let total = 0;
for (let i = 0; i < siswa.length; i++) {
  total += siswa[i].nilai;
}

let rataRata = total / siswa.length;
console.log("Rata-rata:", rataRata);

siswa.forEach(s => {
  if (s.nilai >= 70) {
    console.log(s.nama + " lulus");
  }
});
```
</details>
