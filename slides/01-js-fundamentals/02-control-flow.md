---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/7325498/pexels-ph"
footer: "Sesi 02: Control Flow"
---

<!-- _class: title -->
# 1.2 Control Flow

## If/Else

```javascript
const nilai = 85;

if (nilai >= 90) {
  console.log("Grade A");
} else if (nilai >= 75) {
  console.log("Grade B");
} else if (nilai >= 60) {
  console.log("Grade C");
} else {
  console.log("Grade D - Remedial");
}
```

## Ternary Operator (if/else pendek)

```javascript
const umur = 17;
const status = umur >= 17 ? "Bisa bikin SIM" : "Belum bisa";
```

## Switch

```javascript
const hari = "senin";

switch (hari) {
  case "senin":
    console.log("Mulai ngoding");
    break;
  case "jumat":
    console.log("Alhamdulillah");
    break;
  default:
    console.log("Ngoding aja");
}
```

## Loops

```javascript
// For loop
for (let i = 1; i <= 5; i++) {
  console.log(`Iterasi ke-${i}`);
}

// While loop
let tebakan = 0;
const jawaban = 7;
while (tebakan !== jawaban) {
  tebakan = Math.floor(Math.random() * 10);
  console.log(`Tebakan: ${tebakan}`);
}

// Array loop
const fruits = ["Apel", "Mangga", "Jeruk"];
for (const fruit of fruits) {
  console.log(fruit);
}
```

## Latihan

1. Program kalkulator sederhana (+, -, *, /)
2. Program tebak angka (komputer random 1-10, user nebak)
3. Program tabel perkalian (input 5 -> output 5x1 sampai 5x10)
4. Program cetak pola bintang
```
*
**
***
****
*****
```
