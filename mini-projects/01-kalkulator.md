# 🧮 01. Kalkulator Sederhana

> **Level:** 🌱 Beginner | **Estimasi:** 1-2 sesi | **Modul Terkait:** 01-JS Dasar, 03-Web Dasar

---

## 🎯 Tujuan

Membangun aplikasi kalkulator ilmiah berbasis web menggunakan HTML, CSS, dan JavaScript murni (vanilla). Projek ini dirancang untuk melatih:

- **DOM Manipulation**: Mengambil input dari tombol, menampilkan hasil ke layar display
- **Event Handling**: Menangani klik tombol dan keyboard events
- **Logika Aritmatika**: Mengevaluasi ekspresi matematika secara bertahap
- **State Management**: Mengelola history perhitungan dalam array
- **UI/UX Design**: Layout tombol responsif, transisi halus, tema gelap/terang

Setelah menyelesaikan projek ini, kamu akan paham cara kerja frontend interaktif murni tanpa framework — fondasi penting sebelum belajar React, Vue, atau Angular.

---

## 🛠 Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| **HTML5** | Struktur halaman, semantic elements |
| **CSS3** | Flexbox/Grid, custom properties, animasi |
| **Vanilla JS** | ES6+, DOM API, Event API, localStorage |
| **Optional** | Math.js CDN untuk fungsi ilmiah lanjutan |

> **No framework, no library.** Tujuannya bikin kamu paham dasar-dasar web tanpa abstraksi.

---

## 📋 Requirements

### Fungsional

| # | Fitur | Wajib / Bonus |
|---|-------|---------------|
| 1 | Tombol angka 0-9 dan titik desimal | Wajib |
| 2 | Operasi dasar: +, −, ×, ÷ | Wajib |
| 3 | Tombol sama dengan (=) untuk evaluasi | Wajib |
| 4 | Tombol clear (C) dan hapus satu karakter (⌫) | Wajib |
| 5 | Display yang menunjukkan input dan hasil | Wajib |
| 6 | Riwayat perhitungan (history panel) | Wajib |
| 7 | Keyboard support (tekan angka/operator dari keyboard) | Wajib |
| 8 | Fungsi ilmiah: sin, cos, tan, log, sqrt, pangkat | Bonus |
| 9 | Toggle tema gelap/terang | Bonus |
| 10 | Tombol memory: MC, MR, M+, M− | Bonus |
| 11 | Animasi tombol saat ditekan | Bonus |

### Non-Fungsional

- **Responsive**: Bekerja di HP (320px) sampai desktop
- **Error Handling**: Jangan crash pas input aneh seperti `5 ÷ 0` atau `2 ++ 3`
- **Zero dependency**: Semua logic ditulis manual, tidak pakai `eval()` kalau bisa
- **Accessibility**: Tombol punya `aria-label`, display readable untuk screen reader

---

## 🚀 Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kalkulator</title>
  <style>
    /* --- CSS Reset & Variables --- */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #f0f2f5;
      --display-bg: #fff;
      --text: #1a1a2e;
      --btn-bg: #e2e8f0;
      --btn-hover: #cbd5e1;
      --operator-bg: #f59e0b;
      --operator-text: #fff;
      --equal-bg: #10b981;
      --equal-text: #fff;
    }

    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: var(--bg);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }

    .calculator {
      background: var(--display-bg);
      border-radius: 1.5rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      padding: 1.5rem;
      max-width: 360px;
      width: 100%;
    }

    .display {
      background: var(--bg);
      border-radius: 1rem;
      padding: 1rem 1.25rem;
      text-align: right;
      margin-bottom: 1rem;
      min-height: 100px;
    }

    .display .expression {
      font-size: 1rem;
      color: #64748b;
      min-height: 1.5em;
      word-break: break-all;
    }

    .display .result {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text);
      min-height: 1.5em;
      word-break: break-all;
    }

    .buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.6rem;
    }

    button {
      padding: 1rem;
      font-size: 1.25rem;
      border: none;
      border-radius: 0.75rem;
      cursor: pointer;
      background: var(--btn-bg);
      color: var(--text);
      transition: all 0.15s ease;
      font-weight: 600;
    }

    button:hover { background: var(--btn-hover); transform: scale(0.96); }
    button:active { transform: scale(0.92); }

    .operator {
      background: var(--operator-bg);
      color: var(--operator-text);
    }

    .operator:hover { filter: brightness(1.1); }

    .equal {
      background: var(--equal-bg);
      color: var(--equal-text);
      grid-column: span 2;
    }

    .equal:hover { filter: brightness(1.1); }

    .clear { background: #ef4444; color: #fff; }
    .clear:hover { filter: brightness(1.1); }

    .span-two { grid-column: span 2; }
  </style>
</head>
<body>
  <div class="calculator">
    <!-- DISPLAY -->
    <div class="display">
      <div class="expression" id="expression"></div>
      <div class="result" id="result">0</div>
    </div>

    <!-- BUTTONS -->
    <div class="buttons">
      <button class="clear span-two" data-action="clear">C</button>
      <button data-action="backspace">⌫</button>
      <button class="operator" data-action="divide">÷</button>

      <button data-action="digit">7</button>
      <button data-action="digit">8</button>
      <button data-action="digit">9</button>
      <button class="operator" data-action="multiply">×</button>

      <button data-action="digit">4</button>
      <button data-action="digit">5</button>
      <button data-action="digit">6</button>
      <button class="operator" data-action="subtract">−</button>

      <button data-action="digit">1</button>
      <button data-action="digit">2</button>
      <button data-action="digit">3</button>
      <button class="operator" data-action="add">+</button>

      <button data-action="digit" class="span-two">0</button>
      <button data-action="decimal">,</button>
      <button class="equal" data-action="equals">=</button>
    </div>
  </div>

  <script>
    // --- STATE ---
    const state = {
      current: '0',       // Angka yang sedang diketik
      previous: '',       // Angka sebelumnya
      operation: null,    // Operator yang dipilih
      overwrite: false,   // Overwrite display setelah tekan operator?
      history: []         // Riwayat perhitungan
    };

    const displayExpr = document.getElementById('expression');
    const displayResult = document.getElementById('result');

    // --- HELPERS ---
    function updateDisplay() {
      displayResult.textContent = state.current;
    }

    function appendDigit(digit) {
      if (state.overwrite) {
        state.current = digit;
        state.overwrite = false;
      } else {
        state.current = state.current === '0' ? digit : state.current + digit;
      }
      updateDisplay();
    }

    function chooseOperation(op) {
      if (state.current === '') return;
      if (state.previous !== '') compute();
      state.operation = op;
      state.previous = state.current;
      state.overwrite = true;
      displayExpr.textContent = `${state.previous} ${op}`;
    }

    function compute() {
      let result;
      const prev = parseFloat(state.previous);
      const curr = parseFloat(state.current);
      if (isNaN(prev) || isNaN(curr)) return;

      switch (state.operation) {
        case '+': result = prev + curr; break;
        case '−': result = prev - curr; break;
        case '×': result = prev * curr; break;
        case '÷': result = curr === 0 ? 'Error' : prev / curr; break;
        default: return;
      }

      // Simpan ke history
      state.history.push(`${state.previous} ${state.operation} ${state.current} = ${result}`);

      state.current = String(result);
      state.operation = null;
      state.previous = '';
      state.overwrite = true;
      displayExpr.textContent = '';
      updateDisplay();
    }

    // --- EVENT HANDLING ---
    document.querySelector('.buttons').addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'digit') { appendDigit(btn.textContent); }
      else if (action === 'decimal') {
        if (!state.current.includes('.')) {
          state.current += '.';
          updateDisplay();
        }
      }
      else if (action === 'add') { chooseOperation('+'); }
      else if (action === 'subtract') { chooseOperation('−'); }
      else if (action === 'multiply') { chooseOperation('×'); }
      else if (action === 'divide') { chooseOperation('÷'); }
      else if (action === 'equals') { compute(); }
      else if (action === 'clear') {
        state.current = '0';
        state.previous = '';
        state.operation = null;
        state.overwrite = false;
        displayExpr.textContent = '';
        updateDisplay();
      }
      else if (action === 'backspace') {
        state.current = state.current.length > 1 ? state.current.slice(0, -1) : '0';
        updateDisplay();
      }
    });

    // --- KEYBOARD SUPPORT ---
    document.addEventListener('keydown', e => {
      if (e.key >= '0' && e.key <= '9') { appendDigit(e.key); }
      else if (e.key === '.') {
        if (!state.current.includes('.')) { state.current += '.'; updateDisplay(); }
      }
      else if (e.key === '+') { chooseOperation('+'); }
      else if (e.key === '-') { chooseOperation('−'); }
      else if (e.key === '*') { chooseOperation('×'); }
      else if (e.key === '/') { e.preventDefault(); chooseOperation('÷'); }
      else if (e.key === 'Enter' || e.key === '=') { compute(); }
      else if (e.key === 'Escape') {
        state.current = '0'; state.previous = ''; state.operation = null;
        state.overwrite = false; displayExpr.textContent = ''; updateDisplay();
      }
      else if (e.key === 'Backspace') {
        state.current = state.current.length > 1 ? state.current.slice(0, -1) : '0';
        updateDisplay();
      }
    });
  </script>
</body>
</html>
```

> **Cara pakai:** Simpan sebagai `index.html`, buka di browser. Langsung jalan.

---

## 🖼 Expected Output

Kalkulator akan tampil sebagai card di tengah layar dengan:

- **Display** dua baris: baris atas untuk ekspresi (`12 + 5`), baris bawah untuk hasil (`17`)
- **Grid tombol** 4 kolom: angka 0-9, operator (+, −, ×, ÷), C, ⌫, dan tombol sama dengan (=)
- **Warna berbeda**: operator oranye, sama dengan hijau, clear merah
- **Hover/active effect**: tombol mengecil saat diklik (feedback taktil visual)
- **Keyboard**: semua input bisa via keyboard — Esc untuk clear, Enter untuk hitung

Setelah user menekan `=`, hasil muncul di display. Kalau user menekan angka lagi, display reset dan mulai input baru (mode overwrite).

---

## 💡 Latihan Tambahan

1. **Fungsi Ilmiah**: Tambah tombol sin, cos, tan, log, sqrt, x², x³ menggunakan `Math.*`
2. **Tema Gelap/Terang**: Tambah toggle switch yang ganti CSS variables
3. **Riwayat (History Panel)**: Side panel atau dropdown yang menampilkan semua perhitungan sebelumnya
4. **Memory Functions**: MC (clear), MR (recall), M+ (add), M− (subtract) — simpan nilai memory di variable terpisah
5. **Keyboard Visual Feedback**: Highlight tombol yang sesuai saat tombol keyboard ditekan
6. **Persentase**: Tombol `%` untuk hitung persentase
7. **Notasi Ilmiah**: Tampilkan hasil besar/kecil dalam format eksponensial (1.5e+10)
8. **Unit Test**: Tes dengan Vitest atau manual test case untuk setiap operasi

---

## 📝 Rubrik Penilaian

| Kriteria | Belum (0) | Cukup (1) | Baik (2) | Istimewa (3) |
|----------|-----------|-----------|----------|--------------|
| **Operasi dasar** | Tidak bisa hitung | 2 operasi berhasil | Semua 4 operasi (+ − × ÷) | + Error handling (÷0) + decimal |
| **Display & UI** | HTML polos tanpa CSS | Layout tombol rapi | + Hover/active effect | + Animasi + responsive mobile |
| **History** | Tidak ada | Console.log saja | Panel history di halaman | + Persist ke localStorage |
| **Keyboard** | Tidak support | Sebagian tombol | Full keyboard support | + Visual highlight tombol |
| **Code quality** | Satu fungsi panjang | Dipisah per fungsi | + State object + data-action | + Unit test + komentar JSDoc |
| **Ekstra** | — | Fungsi ilmiah (1-2) | Fungsi ilmiah (3-4) | + Theme toggle + memory + riwayat persist |

---

## 📚 Referensi

- [MDN: KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [CSS Grid Layout](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Math.js Library](https://mathjs.org/) — alternatif untuk fungsi ilmiah
- [Preventing eval() pitfalls](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!)
