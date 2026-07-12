# JavaScript — Exercise #2: Strings & Numbers

> **Level:** Beginner
> **Topics:** string manipulation, number methods, type coercion

## Instructions

Buat dua fungsi:

1. `reverseString(str)` — membalik string tanpa menggunakan `.reverse()` atau array.
2. `isPalindrome(str)` — mengecek apakah sebuah string adalah palindrome (dibaca sama dari depan dan belakang). Abaikan huruf kapital.

## Starter Code

```javascript
function reverseString(str) {
  // TODO: balik string tanpa .reverse()
}

function isPalindrome(str) {
  // TODO: cek palindrome (case-insensitive)
}

console.log(reverseString("Hello"));
console.log(isPalindrome("katak"));
console.log(isPalindrome("mobil"));
console.log(isPalindrome("Kodok"));
```

## Expected Output

```
olleH
true
false
true
```

## Test Cases

```javascript
console.log(reverseString("Hello") === "olleH");    // true
console.log(reverseString("RPL AI") === "IA LPR");  // true
console.log(isPalindrome("katak"));                  // true
console.log(isPalindrome("mobil"));                  // false
console.log(isPalindrome("Kodok"));                  // true (case insensitive)
```
