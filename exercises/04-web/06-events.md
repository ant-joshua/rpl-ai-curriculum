# Web Development — Exercise #6: Events

> **Level:** Intermediate
> **Topics:** event listeners, event object, form submit, click, keypress

## Instructions

Buat Accordion/FAQ Component yang bisa buka-tutup.

Fitur:
1. Klik header accordion → konten di bawahnya terbuka/tertutup.
2. Gunakan CSS transition untuk animasi smooth.
3. Hanya satu item yang terbuka dalam satu waktu (accordion behavior).
4. Item yang aktif punya indikator panah yang berputar.

Gunakan `addEventListener` dan `classList.toggle`.

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FAQ Accordion</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, sans-serif;
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .accordion-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }
    .accordion-header {
      width: 100%;
      padding: 1rem 1.25rem;
      background: #f8f9fa;
      border: none;
      text-align: left;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .accordion-header:hover {
      background: #e9ecef;
    }
    .accordion-header .arrow {
      transition: transform 0.3s ease;
    }
    .accordion-header.active .arrow {
      transform: rotate(180deg);
    }
    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
      padding: 0 1.25rem;
      background: white;
    }
    .accordion-content.active {
      max-height: 200px;
      padding: 1rem 1.25rem;
    }
  </style>
</head>
<body>
  <h1 style="margin-bottom: 1.5rem;">❓ FAQ</h1>

  <div class="accordion">
    <div class="accordion-item">
      <button class="accordion-header">
        Apa itu RPL AI Curriculum?
        <span class="arrow">▼</span>
      </button>
      <div class="accordion-content">
        <p>RPL AI Curriculum adalah program belajar coding dari dasar sampai AI, mencakup 7 modul mulai dari JavaScript, DSA, TypeScript, Web Dev, Git, Node.js, sampai Mastra AI Framework.</p>
      </div>
    </div>

    <div class="accordion-item">
      <button class="accordion-header">
        Berapa lama waktu belajarnya?
        <span class="arrow">▼</span>
      </button>
      <div class="accordion-content">
        <p>Total 14 minggu (1 semester) dengan jadwal 4 sesi per minggu. Setiap sesi sekitar 2-3 jam termasuk praktik.</p>
      </div>
    </div>

    <div class="accordion-item">
      <button class="accordion-header">
        Apa saja yang perlu diinstall?
        <span class="arrow">▼</span>
      </button>
      <div class="accordion-content">
        <p>Cukup install Node.js, VS Code, dan Git. Semua tools gratis. Untuk modul AI, diperlukan API key dari OpenAI atau Anthropic.</p>
      </div>
    </div>

    <div class="accordion-item">
      <button class="accordion-header">
        Apakah ada sertifikat?
        <span class="arrow">▼</span>
      </button>
      <div class="accordion-content">
        <p>Ya, peserta yang lulus semua modul dan menyelesaikan final project akan mendapatkan sertifikat kelulusan RPL AI Curriculum.</p>
      </div>
    </div>
  </div>

  <script>
    // TODO: 
    // 1. Seleksi semua accordion-header
    // 2. Tambah event listener click ke setiap header
    // 3. Saat diklik:
    //    - Toggle class 'active' di content yang sesuai
    //    - Toggle class 'active' di header (buat arrow)
    //    - Tutup item lain (hanya satu yang terbuka)
  </script>
</body>
</html>
```

## Expected Output

Accordion dengan animasi smooth, hanya satu item terbuka dalam satu waktu.

## Test Cases

```javascript
// Test di console
console.log("Accordion siap. Klik setiap header untuk tes.");
```
