# JavaScript — Exercise #3: Conditions & Loops

> **Level:** Beginner
> **Topics:** if-else, loops, pattern printing

## Instructions

Buat tiga fungsi:

1. `getGrade(nilai)` — mengembalikan grade berdasarkan nilai: >= 90 = "A", >= 80 = "B", >= 70 = "C", >= 60 = "D", < 60 = "E".
2. `printStar(n)` — mencetak pola segitiga bintang dengan tinggi `n`.
3. `printStarReverse(n)` — mencetak pola segitiga bintang terbalik.

## Starter Code

```javascript
function getGrade(nilai) {
  // TODO: tentukan grade berdasarkan nilai
}

function printStar(n) {
  // TODO: cetak pola segitiga:
  // *
  // **
  // ***
  // ****
  // *****
}

function printStarReverse(n) {
  // TODO: cetak pola segitiga terbalik
}

console.log(getGrade(85));
console.log(getGrade(95));
console.log(getGrade(60));
console.log(getGrade(45));

printStar(5);
console.log("---");
printStarReverse(5);
```

## Expected Output

```
B
A
D
E
*
**
***
****
*****
---
*****
****
***
**
*
```

## Test Cases

```javascript
console.log(getGrade(90) === "A");   // true
console.log(getGrade(82) === "B");   // true
console.log(getGrade(75) === "C");   // true
console.log(getGrade(60) === "D");   // true
console.log(getGrade(45) === "E");   // true
```
