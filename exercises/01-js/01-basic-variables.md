# JavaScript — Exercise #1: Variable & Operator

> **Level:** Beginner
> **Topics:** variables, let, const, operators

## Instructions

Buat fungsi `celsiusToFahrenheit` yang mengonversi suhu dari Celsius ke Fahrenheit menggunakan rumus: `(celsius * 9/5) + 32`.

Function menerima satu parameter `celsius` (number) dan mengembalikan suhu dalam Fahrenheit (number).

## Starter Code

```javascript
function celsiusToFahrenheit(celsius) {
  // TODO: implementasikan konversi Celsius ke Fahrenheit
  // Rumus: (celsius * 9/5) + 32
}

console.log(celsiusToFahrenheit(30));
console.log(celsiusToFahrenheit(0));
console.log(celsiusToFahrenheit(-10));
```

## Expected Output

```
86
32
14
```

## Test Cases

```javascript
console.log(celsiusToFahrenheit(30) === 86);    // true
console.log(celsiusToFahrenheit(0) === 32);     // true
console.log(celsiusToFahrenheit(-10) === 14);   // true
console.log(celsiusToFahrenheit(100) === 212);  // true
```
