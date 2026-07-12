# JavaScript — Exercise #5: Objects

> **Level:** Beginner
> **Topics:** objects, nested objects, property access

## Instructions

Buat fungsi berikut untuk bekerja dengan object:

1. `getAverageScore(student)` — menerima object student dengan properti `scores` ({ math, science, english }) dan mengembalikan rata-rata nilai.
2. `addProperty(obj, key, value)` — menambah properti baru ke object, return object yang sudah dimodifikasi.
3. `listKeys(obj)` — mengembalikan array berisi semua key dari object.
4. `countProperties(obj)` — menghitung jumlah properti dalam object.

## Starter Code

```javascript
function getAverageScore(student) {
  // TODO: hitung rata-rata dari math, science, english
}

function addProperty(obj, key, value) {
  // TODO: tambah properti baru ke object
}

function listKeys(obj) {
  // TODO: return array of keys
}

function countProperties(obj) {
  // TODO: hitung jumlah properti
}

const student = {
  name: "Budi",
  age: 17,
  scores: { math: 85, science: 90, english: 78 }
};

console.log(getAverageScore(student).toFixed(2));
console.log(addProperty({ nama: "Ani" }, "umur", 16));
console.log(listKeys(student));
console.log(countProperties(student));
```

## Expected Output

```
84.33
{ nama: 'Ani', umur: 16 }
[ 'name', 'age', 'scores' ]
3
```

## Test Cases

```javascript
const s1 = { scores: { math: 100, science: 100, english: 100 } };
console.log(getAverageScore(s1) === 100);  // true

const s2 = { scores: { math: 70, science: 80, english: 90 } };
console.log(getAverageScore(s2) === 80);   // true
```
