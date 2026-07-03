# 1.4 Functions

## Arrow Function (Modern)

```javascript
// Satu parameter, satu baris
const sapa = nama => `Halo, ${nama}!`;

// Multiple params
const tambah = (a, b) => a + b;

// Multiple baris
const hitung = (a, b, operasi) => {
  switch (operasi) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b !== 0 ? a / b : "Error: bagi 0";
    default: return "Error";
  }
};
```

## Default Parameter

```javascript
const sapa = (nama = "Teman") => `Halo, ${nama}!`;
console.log(sapa());        // "Halo, Teman!"
console.log(sapa("Budi")); // "Halo, Budi!"
```

## Higher-Order Functions (callbacks)

```javascript
function prosesAngka(angka, callback) {
  return callback(angka);
}

const double = n => n * 2;
console.log(prosesAngka(5, double)); // 10

// Langsung:
console.log(prosesAngka(5, n => n * 2)); // 10
```

## Latihan

1. Bikin function: `generatePassword(length)` - return random password
2. Bikin function: `isPalindrome(str)` - cek palindrome
3. Bikin function: `validateEmail(email)` - validasi email
4. Bikin utility library dengan 10+ function
