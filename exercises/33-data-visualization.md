# Data Visualization — Latihan

## Level 1: Dasar

### 1. Chart.js — Line Chart Sederhana
**Pertanyaan:** Buat line chart dengan Chart.js untuk data penjualan bulanan:

```javascript
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
const data = {
  labels: labels,
  datasets: [{
    label: 'Penjualan 2026',
    data: [65, 59, 80, 81, 56, 95],
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};
```

1. Tulis kode lengkap untuk render chart di `<canvas id="salesChart">`
2. Tambahkan title chart: "Penjualan Semester 1 2026"
3. Set Y-axis mulai dari 0

**Hint:**
```javascript
new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    plugins: { title: { display: true, text: '...' } },
    scales: { y: { beginAtZero: true } }
  }
});
```

---

### 2. Chart.js — Bar Chart & Styling
**Pertanyaan:** Buat bar chart untuk perbandingan populasi 5 kota:

| Kota | Populasi (juta) |
|------|----------------|
| Jakarta | 10.5 |
| Surabaya | 2.9 |
| Bandung | 2.4 |
| Medan | 2.1 |
| Semarang | 1.6 |

1. Tampilkan sebagai horizontal bar chart
2. Set warna bar gradient: biru untuk nilai tertinggi, turun ke abu-abu
3. Tampilkan label nilai di ujung tiap bar

**Hint:** `type: 'bar'` dengan `indexAxis: 'y'` untuk horizontal. `plugins.datalabels` untuk label di bar.

---

### 3. D3.js — Select & Manipulate DOM
**Pertanyaan:** Diberikan HTML:
```html
<div id="chart">
  <p class="data-point">100</p>
  <p class="data-point">200</p>
  <p class="data-point">150</p>
</div>
```

Tulis kode D3.js untuk:
1. Select semua `.data-point`, ubah text jadi "Data: [value]"
2. Tambahkan class `highlight` ke element yang nilainya > 150
3. Append element `<span>` dengan text "★" ke element yang nilainya tertinggi

**Hint:**
```javascript
d3.selectAll('.data-point')
  .text((d, i, nodes) => `Data: ${d3.select(nodes[i]).text()}`)
  .classed('highlight', (d, i, nodes) => +d3.select(nodes[i]).text() > 150);
```

---

### 4. D3.js — SVG Bar Chart
**Pertanyaan:** Buat bar chart sederhana dengan D3.js dan SVG:

Data: `[30, 80, 45, 60, 20, 90, 50]`

1. Buat `<svg width="500" height="300">`
2. Gambar bar untuk tiap data point
3. Tinggi bar proporsional dengan nilai (max = 250px)
4. Beri jarak antar bar 5px
5. Set warna bar ke `steelblue`

**Hint:**
```javascript
const svg = d3.select('body').append('svg').attr('width', 500).attr('height', 300);
const barWidth = 500 / data.length - 5;
svg.selectAll('rect')
  .data(data).enter().append('rect')
  .attr('x', (d, i) => i * (barWidth + 5))
  .attr('y', d => 300 - d * 2.5)
  .attr('width', barWidth)
  .attr('height', d => d * 2.5)
  .attr('fill', 'steelblue');
```

---

### 5. Chart.js — Pie & Doughnut
**Pertanyaan:** Buat doughnut chart untuk distribusi pengeluaran:

| Kategori | Anggaran (juta) |
|----------|----------------|
| Makanan | 3.5 |
| Transport | 1.2 |
| Hiburan | 0.8 |
| Tabungan | 2.0 |
| Lain-lain | 1.5 |

1. Tampilkan sebagai doughnut chart (bukan pie biasa)
2. Tampilkan label persentase di dalam chart
3. Set warna yang kontras antar kategori
4. Tambahkan legend di bawah chart

**Hint:** `type: 'doughnut'` dengan `plugins.legend.position: 'bottom'`. Pake `chartjs-plugin-datalabels` untuk persentase di dalam.

---

### 6. Data Loading — Fetch & Visualize
**Pertanyaan:** Fetch data dari API dan render chart:

```javascript
// API: https://jsonplaceholder.typicode.com/users
// Response: [{ id, name, email, address: { geo: { lat, lng } } }]
```

1. Fetch data users
2. Buat scatter chart (lat vs lng) dengan Chart.js
3. Tooltip menampilkan nama user
4. Label sumbu X: "Longitude", Y: "Latitude"

**Hint:** Gunakan `fetch()` atau `d3.json()`. Scatter chart di Chart.js pake `type: 'scatter'`.

---

### 7. Chart Configuration — Options Penting
**Pertanyaan:** Untuk tiap konfigurasi Chart.js berikut, jelaskan fungsinya:

```javascript
options: {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    tooltip: { enabled: true },
    legend: { display: false }
  },
  animation: {
    duration: 0 // ?
  }
}
```

Apa efek `animation.duration: 0`? Kapan perlu dipake?

**Hint:** Responsive → auto-resize. Interaction mode 'index' → tooltip semua dataset di index yang sama. Animation duration 0 untuk performance di dataset besar.

---

### 8. Real-time Data — Set Interval Update
**Pertanyaan:** Update chart setiap 2 detik dengan data baru:

```javascript
function getRandomData() {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
}
```

Tulis kode untuk:
1. Buat line chart dengan data awal (7 titik)
2. Update chart tiap 2 detik: shift data lama (hapus pertama), push data baru
3. Animasi transisi yang smooth

**Hint:**
```javascript
setInterval(() => {
  chart.data.datasets[0].data.shift();
  chart.data.datasets[0].data.push(getRandomData()[0]);
  chart.update();
}, 2000);
```

---

## Level 2: Intermediate

### 9. D3.js — Bar Chart dengan Axes & Scale
**Pertanyaan:** Upgrade bar chart dari soal #4 dengan sumbu dan skala yang proper:

Data: `[{ name: 'A', value: 30 }, { name: 'B', value: 80 }, { name: 'C', value: 45 }, { name: 'D', value: 60 }]`

1. Gunakan `d3.scaleLinear()` untuk skala Y
2. Gunakan `d3.scaleBand()` untuk skala X
3. Tambahkan sumbu X dan Y pake `d3.axisBottom()` dan `d3.axisLeft()`
4. Tambahkan label nilai di atas tiap bar
5. Pastikan chart responsive (pakai viewBox)

**Hint:**
```javascript
const xScale = d3.scaleBand().domain(data.map(d => d.name)).range([0, width]).padding(0.2);
const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.value)]).range([height, 0]);
svg.append('g').call(d3.axisLeft(yScale));
svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale));
```

---

### 10. Chart.js — Mixed Chart (Bar + Line)
**Pertanyaan:** Buat mixed chart yang menampilkan data suhu dan curah hujan:

| Bulan | Suhu (°C) | Curah Hujan (mm) |
|-------|-----------|-----------------|
| Jan | 28 | 320 |
| Feb | 28 | 290 |
| Mar | 29 | 250 |
| Apr | 30 | 180 |
| Mei | 31 | 120 |
| Jun | 31 | 90 |

1. Bar chart untuk curah hujan (sumbu Y kiri)
2. Line chart untuk suhu (sumbu Y kanan)
3. Warna biru untuk hujan, merah untuk suhu
4. Legend untuk membedakan

**Hint:** Gunakan `type: 'bar'` dengan multiple datasets, dataset suhu pake `yAxisID: 'y1'`. Konfigurasi `scales: { y: { position: 'left' }, y1: { position: 'right', grid: { drawOnChartArea: false } } }`.

---

### 11. D3.js — Data Join & Transition
**Pertanyaan:** Buat chart interaktif yang update setiap kali user klik tombol:

```javascript
const data = [10, 20, 30, 40, 50];
// Tombol "Acak" → generate data baru [5, 35, 15, 45, 25]
```

Implementasi:
1. Bar chart dengan D3.js (pake enter-update-exit pattern)
2. Animasi transisi saat data berubah: bar baru masuk dari bawah, bar lama naik/turun ke posisi baru
3. Durasi transisi: 500ms
4. Warna bar berubah berdasarkan nilai: < 20 = merah, 20-40 = kuning, > 40 = hijau

**Hint:**
```javascript
function update(data) {
  const bars = svg.selectAll('rect').data(data);
  bars.enter().append('rect').attr('y', height).merge(bars)
    .transition().duration(500)
    .attr('y', d => yScale(d))
    .attr('height', d => height - yScale(d))
    .attr('fill', d => d < 20 ? 'red' : d < 40 ? 'gold' : 'green');
  bars.exit().remove();
}
```

---

### 12. Chart.js — Plugin Custom
**Pertanyaan:** Buat plugin Chart.js custom yang:

1. Menambahkan garis horizontal di nilai rata-rata dataset
2. Label di ujung kanan garis: "Rata-rata: [value]"
3. Warna garis: merah putus-putus

Tulis plugin lengkap dan cara menggunakannya.

**Hint:**
```javascript
const averageLinePlugin = {
  id: 'averageLine',
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const avg = chart.data.datasets[0].data.reduce((a, b) => a + b, 0) / chart.data.datasets[0].data.length;
    const yAvg = scales.y.getPixelForValue(avg);
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'red';
    ctx.moveTo(chartArea.left, yAvg);
    ctx.lineTo(chartArea.right, yAvg);
    ctx.stroke();
    ctx.fillStyle = 'red';
    ctx.fillText(`Rata-rata: ${avg.toFixed(1)}`, chartArea.right + 5, yAvg + 4);
    ctx.restore();
  }
};
Chart.register(averageLinePlugin);
```

---

### 13. Large Dataset — Performance Optimization
**Pertanyaan:** Kamu perlu menampilkan 100.000 data point di line chart.

1. Apa masalah performa yang bakal muncul?
2. Sebutkan 3 strategi optimasi:

   a. **Decimation** — kurangi jumlah titik yang di-render
   b. **Canvas rendering** — langsung pake Canvas API, bukan SVG
   c. **Web Worker** — proses data di background thread

3. Implementasi decimation: hanya tampilkan 1 titik per N pixel. Tulis fungsi decimation-nya.

**Hint:**
```javascript
function decimate(data, threshold = 1000) {
  if (data.length <= threshold) return data;
  const step = Math.floor(data.length / threshold);
  return data.filter((_, i) => i % step === 0);
}
```
Chart.js punya plugin decimation bawaan: `plugin.decimation`.

---

### 14. Dashboard — Multi-chart Layout
**Pertanyaan:** Bangun layout dashboard dengan grid charts:

```
┌─────────────┬─────────────┐
│  Line Chart  │  Bar Chart   │
│  (Penjualan) │  (Kategori)  │
├─────────────┼─────────────┤
│  Doughnut   │  Table Data  │
│  (Market    │  (Top 10)    │
│   Share)    │             │
└─────────────┴─────────────┘
```

1. CSS Grid layout (2×2)
2. Tiap chart di inisialisasi di `<canvas>` masing-masing
3. Responsif: jadi 1 kolom di mobile
4. Semua chart pakai data yang sinkron (ambil dari 1 API call)
5. Loading state: skeleton loading sebelum chart muncul

**Hint:** CSS Grid: `grid-template-columns: 1fr 1fr`. Media query: `@media (max-width: 768px) { grid-template-columns: 1fr }`. Fetch data di `Promise.all()`.

---

## Level 3: Challenge

### 15. Real-time Dashboard — Crypto Price Monitor
**Skenario:** Dashboard monitoring harga crypto real-time dengan WebSocket.

**Pertanyaan:** Implementasi:

1. **WebSocket connection** ke `wss://stream.binance.com:9443/ws/btcusdt@trade`
   - Parse data: `{ price, quantity, time }`
   - Simpan di buffer (max 100 data point)

2. **Line chart (Chart.js):** update real-time
   - X-axis: waktu
   - Y-axis: harga (float, 2 desimal)
   - Line color: hijau kalau harga naik, merah kalau turun dari tick sebelumnya

3. **Stats panel:**
   - Harga saat ini (besar + warna)
   - Change 24h (% + warna hijau/merah)
   - High / Low 24h
   - Volume 24h

4. **Order book (D3.js):**
   - Visualisasi depth chart (bid/ask)
   - Sumbu X: price, Y: cumulative quantity
   - Warna biru untuk bid, merah untuk ask

5. **Alert system:**
   - User bisa set alert price
   - Kalau harga mencapai target, flash notifikasi di dashboard

Tulis kode lengkap (HTML + CSS + JS). Untuk simulasi, gunakan setInterval yang generate fake trade data.

**Hint:**
```javascript
// Fake WebSocket data
setInterval(() => {
  const lastPrice = prices[prices.length - 1] || 50000;
  const newPrice = lastPrice + (Math.random() - 0.5) * 200;
  const trade = { price: newPrice, quantity: Math.random() * 10, time: Date.now() };
  // Update chart, stats, check alert
}, 1000);
```

---

### 16. D3.js — Interactive Choropleth Map
**Skenario:** Visualisasi peta Indonesia dengan data populasi per provinsi.

**Pertanyaan:** Buat choropleth map interaktif:

1. **TopoJSON/GeoJSON:** Load data peta Indonesia (bisa dari `https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia.geojson` atau gunakan data palsu)

2. **Scale warna:** 
   - Gunakan `d3.scaleQuantize()` atau `d3.scaleThreshold()`
   - Warna: kuning (populasi rendah) → merah (populasi tinggi)

3. **Tooltip:**
   - Hover provinsi → tampilkan nama provinsi + populasi
   - Tooltip ikut kursor

4. **Legend:**
   - Color legend di pojok kanan bawah

5. **Zoom & Pan:**
   - Gunakan `d3.zoom()` untuk drag dan zoom
   - Double-click untuk reset

**Hint:**
```javascript
const projection = d3.geoMercator().fitSize([width, height], data);
const path = d3.geoPath().projection(projection);

svg.selectAll('path')
  .data(data.features).enter().append('path')
  .attr('d', path)
  .attr('fill', d => colorScale(d.properties.populasi))
  .on('mouseover', (event, d) => tooltip.show(d, event))
  .on('mouseout', () => tooltip.hide());
```

---

### 17. Custom Chart Library — D3.js + React
**Skenario:** Bangun komponen chart reusable dengan React + D3.js.

**Pertanyaan:** Buat komponen `BarChart` dengan API:

```jsx
<BarChart
  data={[
    { label: 'Senin', value: 100 },
    { label: 'Selasa', value: 200 },
    { label: 'Rabu', value: 150 },
    { label: 'Kamis', value: 180 },
    { label: 'Jumat', value: 90 },
  ]}
  width={600}
  height={400}
  color="steelblue"
  animate={true}
  onBarClick={(item) => console.log(item)}
/>
```

Persyaratan:
1. Render SVG dengan D3.js di dalam `useEffect` + `useRef`
2. Responsive: prop width/height opsional, default ke container size
3. Animasi: bar muncul dengan transisi height dari 0
4. Tooltip: hover bar → tampilkan label + value
5. Click handler: `onBarClick` callback
6. Cleanup: destroy chart saat komponen unmount
7. Aksesibilitas: tambahkan `<title>` di tiap bar untuk screen reader

Tulis kode komponen lengkap.

**Hint:**
```jsx
const BarChart = ({ data, width: propWidth, height: propHeight, color = 'steelblue', animate = true, onBarClick }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: propWidth || 600, height: propHeight || 400 });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (!propWidth) setDimensions(d => ({ ...d, width: entries[0].contentRect.width }));
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // D3 code here
    return () => svg.selectAll('*').remove();
  }, [data, dimensions, color]);

  return <div ref={containerRef} style={{ width: '100%' }}><svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg></div>;
};
```

---

### 18. Dashboard — Full Stack Analytics
**Skenario:** Bangun full-stack analytics dashboard dari server ke visualisasi.

**Pertanyaan:** Implementasi:

**Backend (Express):**
1. `GET /api/analytics/sales` — return data penjualan per bulan:
   ```json
   { "months": ["Jan","Feb",...], "values": [1000, 1200, ...], "growth": [5, 8, -2, ...] }
   ```
2. `GET /api/analytics/categories` — return distribusi per kategori
3. `GET /api/analytics/top-products?limit=10` — return top 10 produk
4. `GET /api/analytics/summary` — return ringkasan: total sales, growth %, active users, conversion rate
5. Semua endpoint support query `?startDate=...&endDate=...`
6. Cache response selama 5 menit (pakai `memory-cache` atau Redis)

**Frontend (React + Chart.js/D3.js):**
7. Layout dashboard dengan grid (summary cards di atas, chart di bawah)
8. Date range picker → refetch semua data
9. Summary cards: Total Sales, Growth %, Active Users, Conversion Rate (masing-masing dengan icon + sparkline mini chart)
10. Sales trend: line chart
11. Category distribution: doughnut chart
12. Top products: horizontal bar chart (ranked)
13. Export to PNG: `html2canvas` atau `chart.toBase64Image()`
14. Dark mode toggle

Tulis kode backend dan frontend.

**Hint:**
```javascript
// Backend caching
const cache = new Map();
app.get('/api/analytics/sales', (req, res) => {
  const cacheKey = `sales:${req.query.startDate}:${req.query.endDate}`;
  if (cache.has(cacheKey) && Date.now() - cache.get(cacheKey).timestamp < 300000) {
    return res.json(cache.get(cacheKey).data);
  }
  const data = queryDatabase(req.query.startDate, req.query.endDate);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  res.json(data);
});
```
