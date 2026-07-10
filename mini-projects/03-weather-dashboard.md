# 🌤 03. Weather Dashboard

> **Level:** 🌱 Beginner | **Estimasi:** 2 sesi | **Modul Terkait:** 02-TS, 03-Web Dasar, 06-API & Fetch

---

## 🎯 Tujuan

Membangun dashboard cuaca interaktif yang menampilkan informasi cuaca real-time dari API publik. Projek ini fokus pada:

- **API Integration**: Fetch data dari REST API (OpenWeatherMap / WeatherAPI), parsing JSON response
- **Async JavaScript**: Promise, async/await, error handling untuk network request
- **Responsive Design**: Layout cards yang adaptif di mobile dan desktop (CSS Grid / Flexbox)
- **User Input Handling**: Search city, form submission, input validation
- **Error & Loading States**: Skeleton loading, error message, retry mechanism
- **Data Visualization**: Menampilkan forecast 5 hari dengan kartu yang informatif

Setelah projek ini, kamu akan paham siklus lengkap aplikasi web yang bergantung pada data eksternal: fetch → loading → data/error → render.

---

## 🛠 Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| **HTML5** | Semantic structure, forms |
| **CSS3** | CSS Grid, Flexbox, custom properties, media queries |
| **Vanilla JS** | Fetch API, async/await, template literals |
| **Public Weather API** | OpenWeatherMap (free tier) atau WeatherAPI |
| **Optional** | Chart.js untuk grafik suhu |

> **API Key**: Daftar gratis di [OpenWeatherMap](https://openweathermap.org/api) atau [WeatherAPI](https://www.weatherapi.com/) — keduanya punya free tier yang cukup.

---

## 📋 Requirements

### Fungsional

| # | Fitur | Wajib / Bonus |
|---|-------|---------------|
| 1 | Input untuk mencari kota | Wajib |
| 2 | Tampilkan cuaca saat ini: suhu, deskripsi, ikon | Wajib |
| 3 | Tampilkan detail: kelembaban (%), kecepatan angin (km/h), tekanan udara | Wajib |
| 4 | Forecast 5 hari (suhu min/max, ikon, deskripsi) | Wajib |
| 5 | Kartu forecast yang responsif (1 baris di desktop, stacked di HP) | Wajib |
| 6 | Ikon cuaca berupa emoji (☀️🌧❄️) atau dari API | Wajib |
| 7 | Loading skeleton / spinner saat fetching | Wajib |
| 8 | Error handling: kota tidak ditemukan, network error | Wajib |
| 9 | History pencarian (localStorage, max 5 kota) | Bonus |
| 10 | Toggle °C / °F | Bonus |
| 11 | Background berubah sesuai kondisi cuaca | Bonus |
| 12 | Grafik suhu harian dengan Chart.js | Bonus |
| 13 | Deteksi lokasi otomatis (Geolocation API) | Bonus |
| 14 | Offline fallback dengan data terakhir yang di-cache | Bonus |

### Non-Fungsional

- **Fast first load**: Tampilkan UI skeleton bukan blank screen
- **Responsive**: Grid 4 kolom di desktop, 2 di tablet, 1 di HP
- **Accessibility**: Alt text pada ikon, ARIA labels, focus management
- **Error resilience**: Jangan crash total — user bisa coba kota lain tanpa reload
- **Rate limit aware**: Baca error 429 (too many requests) dan kasih tahu user

---

## 🚀 Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weather Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem 1rem;
      color: #1e293b;
      transition: background 0.5s ease;
    }
    .container { max-width: 900px; margin: 0 auto; }

    h1 { text-align: center; color: #fff; margin-bottom: 2rem; font-size: 2rem; }
    h1 span { display: inline-block; }

    /* SEARCH */
    .search-box {
      display: flex; gap: 0.5rem; margin-bottom: 2rem;
      max-width: 500px; margin-left: auto; margin-right: auto;
    }
    .search-box input {
      flex: 1; padding: 0.8rem 1.2rem; border: none; border-radius: 1rem;
      font-size: 1rem; outline: none; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .search-box button {
      padding: 0.8rem 1.5rem; background: #fff; border: none; border-radius: 1rem;
      font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.15s;
    }
    .search-box button:hover { transform: scale(1.05); }

    /* CURRENT WEATHER CARD */
    .current-weather {
      background: rgba(255,255,255,0.95);
      border-radius: 1.5rem; padding: 2rem;
      margin-bottom: 2rem;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 1rem;
      backdrop-filter: blur(10px);
    }
    .weather-main { display: flex; align-items: center; gap: 1.5rem; }
    .weather-icon { font-size: 4rem; }
    .temperature { font-size: 3.5rem; font-weight: 700; line-height: 1; }
    .description { font-size: 1.1rem; color: #64748b; text-transform: capitalize; }
    .weather-details {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
      text-align: center;
    }
    .detail-item { padding: 0.5rem 1rem; background: #f1f5f9; border-radius: 0.75rem; }
    .detail-item .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; }
    .detail-item .value { font-size: 1.25rem; font-weight: 600; }

    /* FORECAST */
    .forecast-title { color: #fff; font-size: 1.25rem; margin-bottom: 1rem; }
    .forecast-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.75rem;
    }
    .forecast-card {
      background: rgba(255,255,255,0.9);
      border-radius: 1rem; padding: 1rem;
      text-align: center;
      backdrop-filter: blur(10px);
    }
    .forecast-card .day { font-weight: 600; margin-bottom: 0.3rem; }
    .forecast-card .icon { font-size: 2rem; }
    .forecast-card .temp {
      display: flex; justify-content: center; gap: 0.5rem; font-size: 0.9rem;
    }
    .forecast-card .temp-max { font-weight: 600; }
    .forecast-card .temp-min { color: #64748b; }

    /* SKELETON */
    .skeleton {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 0.75rem;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .skeleton-h2 { height: 2.5rem; width: 200px; margin-bottom: 1rem; }
    .skeleton-card { height: 120px; }
    .skeleton-detail { height: 60px; }

    /* ERROR */
    .error-message {
      background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 1rem;
      text-align: center; margin-bottom: 1rem; font-weight: 500;
    }

    /* RESPONSIVE */
    @media (max-width: 640px) {
      .forecast-grid { grid-template-columns: repeat(3, 1fr); }
      .weather-details { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 480px) {
      .forecast-grid { grid-template-columns: repeat(2, 1fr); }
      .current-weather { flex-direction: column; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌤 Weather Dashboard</h1>

    <!-- SEARCH -->
    <div class="search-box">
      <input type="text" id="cityInput" placeholder="Cari kota... (contoh: Jakarta, Tokyo)" />
      <button id="searchBtn">🔍 Cari</button>
    </div>

    <!-- ERROR -->
    <div id="errorContainer"></div>

    <!-- CURRENT WEATHER -->
    <div id="currentWeather">
      <div class="current-weather">
        <div style="flex:1; text-align:center;">
          <div class="skeleton skeleton-h2" style="margin:0 auto;"></div>
        </div>
      </div>
    </div>

    <!-- FORECAST -->
    <h2 class="forecast-title">📅 Prakiraan 5 Hari</h2>
    <div id="forecastContainer">
      <div class="forecast-grid">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    </div>
  </div>

  <script>
    // --- CONFIG ---
    const API_KEY = 'YOUR_API_KEY'; // 🚨 GANTI dengan API key kamu
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';

    // --- DOM REFS ---
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const currentWeatherEl = document.getElementById('currentWeather');
    const forecastContainer = document.getElementById('forecastContainer');
    const errorContainer = document.getElementById('errorContainer');

    // --- HELPERS ---
    function getWeatherEmoji(iconCode) {
      const map = {
        '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
        '09d': '🌧', '09n': '🌧', '10d': '🌦', '10n': '🌧',
        '11d': '⛈', '11n': '⛈', '13d': '❄️', '13n': '❄️',
        '50d': '🌫', '50n': '🌫'
      };
      return map[iconCode] || '🌡️';
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function showError(msg) {
      errorContainer.innerHTML = `<div class="error-message">❌ ${msg}</div>`;
    }

    function clearError() { errorContainer.innerHTML = ''; }

    // --- FETCH ---
    async function fetchWeather(city) {
      try {
        // Current weather
        const currentRes = await fetch(
          `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );
        if (!currentRes.ok) {
          if (currentRes.status === 404) throw new Error('Kota tidak ditemukan');
          if (currentRes.status === 401) throw new Error('API Key tidak valid');
          throw new Error('Gagal mengambil data cuaca');
        }
        const currentData = await currentRes.json();

        // Forecast
        const forecastRes = await fetch(
          `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );
        if (!forecastRes.ok) throw new Error('Gagal mengambil data forecast');
        const forecastData = await forecastRes.json();

        return { current: currentData, forecast: forecastData };
      } catch (err) {
        throw err;
      }
    }

    // --- RENDER ---
    function renderCurrentWeather(data) {
      const { name, main, weather, wind } = data;
      const icon = weather[0].icon;
      const desc = weather[0].description;
      const emoji = getWeatherEmoji(icon);

      currentWeatherEl.innerHTML = `
        <div class="current-weather">
          <div class="weather-main">
            <div class="weather-icon">${emoji}</div>
            <div>
              <div class="temperature">${Math.round(main.temp)}°C</div>
              <div class="description">${capitalize(desc)}</div>
              <div style="font-weight:600;margin-top:0.3rem;">${name}</div>
            </div>
          </div>
          <div class="weather-details">
            <div class="detail-item">
              <div class="label">Kelembaban</div>
              <div class="value">${main.humidity}%</div>
            </div>
            <div class="detail-item">
              <div class="label">Angin</div>
              <div class="value">${Math.round(wind.speed * 3.6)} km/h</div>
            </div>
            <div class="detail-item">
              <div class="label">Tekanan</div>
              <div class="value">${main.pressure} hPa</div>
            </div>
          </div>
        </div>
      `;

      // Dynamic background based on weather
      const body = document.body;
      const iconCode = weather[0].icon;
      if (iconCode.includes('d') && (iconCode === '01d' || iconCode === '02d')) {
        body.style.background = 'linear-gradient(135deg, #f6d365, #fda085)';
      } else if (iconCode.includes('n')) {
        body.style.background = 'linear-gradient(135deg, #0c0c1d, #1a1a3e)';
      } else if (['09d','09n','10d','10n','11d','11n'].includes(iconCode)) {
        body.style.background = 'linear-gradient(135deg, #4b6cb7, #182848)';
      } else {
        body.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
      }
    }

    function renderForecast(data) {
      // Ambil 1 data per hari (setiap 8 data = 24 jam)
      const daily = data.list.filter((item, idx) => idx % 8 === 0).slice(0, 5);

      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

      forecastContainer.innerHTML = `
        <div class="forecast-grid">
          ${daily.map(item => {
            const date = new Date(item.dt * 1000);
            const dayName = days[date.getDay()];
            const icon = item.weather[0].icon;
            const emoji = getWeatherEmoji(icon);
            return `
              <div class="forecast-card">
                <div class="day">${dayName}</div>
                <div class="icon">${emoji}</div>
                <div class="temp">
                  <span class="temp-max">${Math.round(item.main.temp_max)}°</span>
                  <span class="temp-min">${Math.round(item.main.temp_min)}°</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function showSkeleton() {
      currentWeatherEl.innerHTML = `
        <div class="current-weather">
          <div style="flex:1; text-align:center;">
            <div class="skeleton skeleton-h2" style="margin:0 auto;"></div>
          </div>
        </div>
      `;
      forecastContainer.innerHTML = `
        <div class="forecast-grid">
          ${Array(5).fill('<div class="skeleton skeleton-card"></div>').join('')}
        </div>
      `;
    }

    // --- MAIN ---
    async function searchCity(city) {
      if (!city.trim()) { showError('Masukkan nama kota'); return; }
      clearError();
      showSkeleton();

      try {
        const data = await fetchWeather(city.trim());
        renderCurrentWeather(data.current);
        renderForecast(data.forecast);
      } catch (err) {
        showError(err.message);
        // Restore empty state
        currentWeatherEl.innerHTML = '';
        forecastContainer.innerHTML = '';
      }
    }

    // --- EVENTS ---
    searchBtn.addEventListener('click', () => searchCity(cityInput.value));
    cityInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') searchCity(cityInput.value);
    });

    // --- AUTO LOAD default city ---
    searchCity('Jakarta');
  </script>
</body>
</html>
```

> **Sebelum running:** Daftar di [OpenWeatherMap](https://openweathermap.org/), dapatkan API Key gratis, ganti `YOUR_API_KEY` di kode.

---

## 🖼 Expected Output

Halaman weather dashboard akan menampilkan:

**Search bar** di tengah atas dengan input text + tombol 🔍 Cari.

Setelah user mengetik kota dan menekan Enter/klik:

1. **Loading state**: Card-card skeleton abu-abu dengan animasi shimmer
2. **Current weather card**:
   - Emoji cuaca besar (☀️⛅🌧❄️)
   - Suhu dalam °C (contoh: `32°C`)
   - Deskripsi cuaca (contoh: `Cerah berawan`)
   - Nama kota
3. **Detail grid**: Kelembaban (%), kecepatan angin (km/h), tekanan (hPa)
4. **Forecast 5 hari**: 5 kartu horizontal — setiap kartu berisi nama hari, emoji cuaca, suhu max/min
5. **Dynamic background**:
   - Cerah: gradien kuning-oranye
   - Malam: gradien biru gelap
   - Hujan: gradien biru-abu
   - Default: gradien ungu
6. **Error state**: Jika kota tidak ditemukan, muncul pesan merah "❌ Kota tidak ditemukan"

Semua card punya efek glassmorphism (backdrop-filter: blur). Layout beradaptasi di HP.

---

## 💡 Latihan Tambahan

1. **Chart Suhu**: Tambah Chart.js untuk line chart suhu 5 hari
2. **Geolocation**: Gunakan `navigator.geolocation.getCurrentPosition()` untuk deteksi otomatis
3. **°C / °F Toggle**: Tombol toggle yang mengkonversi semua suhu
4. **Search History**: Simpan 5 kota terakhir di localStorage, tampilkan sebagai chip/button
5. **More Details**: Tambah UV index, visibility, sunrise/sunset (dari API)
6. **PWA**: Service worker + manifest.json — installable di HP
7. **Animasi**: Transisi halus saat card muncul (CSS keyframes + opacity)
8. **Perbandingan**: Form untuk bandingkan cuaca 2 kota sekaligus
9. **Peta**: Integrasi Leaflet.js untuk map lokasi kota

---

## 📝 Rubrik Penilaian

| Kriteria | Belum (0) | Cukup (1) | Baik (2) | Istimewa (3) |
|----------|-----------|-----------|----------|--------------|
| **API Integration** | Tidak connect | Fetch + display data | + Forecast + error handling | + Retry + rate limit handling |
| **UI & Visual** | List polos | Cards + icon | + Dynamic background + skeleton | + Animasi + glassmorphism + responsive |
| **Forecast** | Tidak ada | 1-2 hari | 5 hari dengan kartu | + Chart suhu + ikon emoji |
| **Error Handling** | Crash saat error | try-catch basic | + Pesan error user-friendly | + Skeleton → error transisi mulus |
| **Search** | Hardcoded city | Input + submit | + Enter key + loading state | + History + geolocation |
| **Code Quality** | Spaghetti | Fungsi terpisah | + Modular async pattern | + JSDoc + TypeScript |

---

## 📚 Referensi

- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [WeatherAPI Docs](https://www.weatherapi.com/docs/)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN: Using the Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [CSS Glassmorphism](https://css-tricks.com/glassmorphism-in-css/)
