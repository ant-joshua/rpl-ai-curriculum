# 🧠 Cheatsheet: JavaScript Fundamentals

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Variable**: `let` (bisa diubah), `const` (tetap), `var` (JANGAN)
- **Tipe Data**: string, number, boolean, undefined, null, object
- **Control Flow**: `if/else`, `switch`, `for`, `while`, `for...of`, `for...in`
- **Array**: `push`, `pop`, `map`, `filter`, `reduce`, `find`, `forEach`
- **Object**: `{ key: value }`, dot notation, bracket notation, destructuring
- **Function**: declaration, arrow function `() => {}`, callback
- **Async**: `async/await`, `fetch()`, `try/catch`, Promise

## Sintaks Penting

```javascript
// Variable
let name = "Budi";
const PI = 3.14;

// Template literal
console.log(`Halo ${name}`);

// Arrow function
const add = (a, b) => a + b;

// Async fetch
async function getData() {
  try {
    const res = await fetch('https://api.example.com/data');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

// Array methods
const doubled = arr.map(x => x * 2);
const evens = arr.filter(x => x % 2 === 0);
const sum = arr.reduce((acc, x) => acc + x, 0);
```

## Tips & Trik
- `===` lebih aman dari `==` (cek tipe juga)
- Destructuring: `const { name, age } = obj;` atau `const [a, b] = arr;`
- Spread operator: `[...arr]`, `{...obj}` buat copy
- `console.table(arr)` — tampilin array sebagai tabel

## Common Mistakes
- ❌ Lupa `await` di async function → dapet Promise pending
- ❌ `const` dipake buat reassign → TypeError
- ❌ Mutate object langsung tanpa copy

## Link Cepat
- [Module README](README.md)
- [Latihan](../exercises/01-js/)
- [Quiz](quiz.md)
