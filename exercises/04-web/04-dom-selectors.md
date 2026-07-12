# Web Development — Exercise #4: DOM Selectors

> **Level:** Intermediate
> **Topics:** DOM, getElementById, querySelector, querySelectorAll, textContent

## Instructions

Buat counter app interaktif menggunakan DOM selectors dan event listeners.

Fitur:
1. Tampilkan angka counter yang bisa berubah.
2. Tombol **+** untuk increment.
3. Tombol **-** untuk decrement.
4. Tombol **Reset** untuk mengembalikan ke 0.
5. Angka berwarna merah jika negatif, hijau jika positif, hitam jika 0.

Gunakan `document.getElementById` atau `document.querySelector` untuk seleksi elemen.

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Counter App</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #1a1a2e;
    }
    #counter-app {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    #count {
      font-size: 4rem;
      font-weight: bold;
      display: block;
      margin: 1rem 0;
      transition: color 0.3s;
    }
    .buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    button {
      font-size: 1.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.1s;
    }
    button:hover { transform: scale(1.05); }
    #increment { background: #22c55e; color: white; }
    #decrement { background: #ef4444; color: white; }
    #reset { background: #6b7280; color: white; }
  </style>
</head>
<body>
  <div id="counter-app">
    <h1>Counter</h1>
    <span id="count">0</span>
    <div class="buttons">
      <button id="decrement">−</button>
      <button id="reset">Reset</button>
      <button id="increment">+</button>
    </div>
  </div>

  <script>
    // TODO: Seleksi elemen dengan DOM selectors
    const countEl = document.getElementById('count');
    let count = 0;

    function updateDisplay() {
      countEl.textContent = count;
      // TODO: ubah warna berdasarkan nilai
      // positif -> hijau (#22c55e)
      // negatif -> merah (#ef4444)
      // nol -> hitam
    }

    // TODO: tambah event listeners untuk tombol
    // increment: count++, updateDisplay()
    // decrement: count--, updateDisplay()
    // reset: count = 0, updateDisplay()
  </script>
</body>
</html>
```

## Expected Output

Counter dengan 3 tombol yang berfungsi. Angka berubah warna sesuai nilai.

## Test Cases

```javascript
// Test di console browser
console.log("Counter app siap. Klik tombol + dan - untuk tes.");
```
