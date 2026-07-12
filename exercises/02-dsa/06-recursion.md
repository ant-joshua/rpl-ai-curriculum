# Algoritma & Struktur Data — Exercise #6: Recursion

> **Level:** Intermediate
> **Topics:** recursion, base case, recursive case, call stack

## Instructions

Selesaikan masalah-masalah berikut menggunakan **rekursi** (tanpa loop!):

1. `factorial(n)` — hitung n! (n faktorial).
2. `fibonacci(n)` — hitung bilangan Fibonacci ke-n.
3. `power(base, exp)` — hitung base^exp.
4. `sumDigits(n)` — jumlahkan semua digit dari n.
5. `isPalindrome(str)` — cek palindrome secara rekursif.
6. `reverseString(str)` — balik string secara rekursif.
7. `binarySearch(arr, target, left, right)` — binary search rekursif.

## Starter Code

```javascript
function factorial(n) {
  // TODO: rekursif — base case n <= 1
}

function fibonacci(n) {
  // TODO: rekursif — fib(n) = fib(n-1) + fib(n-2)
}

function power(base, exp) {
  // TODO: rekursif — base^exp
}

function sumDigits(n) {
  // TODO: rekursif — jumlah digit
}

function isPalindrome(str) {
  // TODO: rekursif — cek palindrome
}

function reverseString(str) {
  // TODO: rekursif — balik string
}

function binarySearch(arr, target, left = 0, right = arr.length - 1) {
  // TODO: rekursif — binary search
}

console.log(factorial(5));        // 120
console.log(fibonacci(8));        // 21
console.log(power(2, 10));        // 1024
console.log(sumDigits(12345));     // 15
console.log(isPalindrome("racecar")); // true
console.log(reverseString("hello"));  // "olleh"
console.log(binarySearch([1, 3, 5, 7, 9], 7));  // 3
console.log(binarySearch([1, 3, 5, 7, 9], 2));  // -1
```

## Expected Output

```
120
21
1024
15
true
olleh
3
-1
```

## Test Cases

```javascript
console.log(factorial(0) === 1);          // true
console.log(factorial(5) === 120);        // true
console.log(fibonacci(0) === 0);          // true
console.log(fibonacci(1) === 1);          // true
console.log(fibonacci(10) === 55);        // true
console.log(power(3, 4) === 81);          // true
console.log(sumDigits(999) === 27);       // true
console.log(isPalindrome("a") === true);  // true
console.log(isPalindrome("ab") === false); // true
console.log(reverseString("abc") === "cba"); // true
```
