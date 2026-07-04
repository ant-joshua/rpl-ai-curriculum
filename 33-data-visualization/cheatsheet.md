# 🧠 Cheatsheet: Data Visualization

> Referensi cepet — 1 halaman.

## Topik Utama

**Chart Types:**
- **Line** — tren sepanjang waktu (revenue bulanan)
- **Bar** — perbandingan kategori (penjualan per produk)
- **Pie/Doughnut** — proporsi (market share), maks 5 slice
- **Scatter** — korelasi 2 variabel (price vs rating)
- **Area** — volume + stacked comparison (website traffic)
- **Radar** — multi-dimensi (skill matrix)

**Chart.js 4:** Canvas-based, CDN `chart.umd.min.js`, responsive by default, plugins untuk zoom/annotation.

**D3.js:** SVG-based, low-level control. Core: `select`, `data join` (enter/update/exit), `scale`, `axis`, `transition`.

**Dashboard:** CSS Grid layout, dark mode, real-time data via WebSocket, filtering, date range picker.

**Chart.js vs D3.js:** Chart.js = quick charts, D3.js = custom viz, full control.

## Command / Sintaks Penting

```html
<!-- Chart.js CDN setup -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
```

```javascript
// Chart.js — Line chart
const ctx = document.getElementById('myChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [{
      label: 'Revenue 2024',
      data: [12000, 19000, 15000, 22000, 28000, 35000],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  },
});
```

```javascript
// D3.js — Bar chart from scratch
const data = [{ name: 'A', value: 30 }, { name: 'B', value: 50 }, { name: 'C', value: 20 }];
const svg = d3.select('#chart').append('svg').attr('width', 400).attr('height', 200);
const x = d3.scaleBand().domain(data.map(d => d.name)).range([0, 400]).padding(0.1);
const y = d3.scaleLinear().domain([0, 50]).range([200, 0]);
svg.selectAll('rect').data(data).enter().append('rect')
  .attr('x', d => x(d.name))
  .attr('y', d => y(d.value))
  .attr('width', x.bandwidth())
  .attr('height', d => 200 - y(d.value))
  .attr('fill', '#3b82f6');
```

```javascript
// Real-time update — Chart.js + WebSocket
const ws = new WebSocket('ws://localhost:8080/data');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  chart.data.datasets[0].data.push(data.value);
  chart.data.labels.push(data.time);
  chart.update('none'); // no animation for real-time
};
```

## Tips & Trik

- **Chart.js** untuk quick charts, **D3.js** untuk custom/bespoke visualization
- Pie chart: maks 5 slice, lebih dari itu pake bar/stacked bar
- **Bar chart horizontal** kalau label kategori panjang
- **CSS Grid** untuk dashboard layout — responsive tanpa media query
- **WebSocket** untuk real-time charts — push data, jangan poll
- **Dark mode** di dashboard: `@media (prefers-color-scheme: dark)` + chart color adjustment
- **Multiple charts sync** — shared date range filter across all charts

## Common Mistakes

- **Pie chart dengan 10+ slice** — gak readable, pake bar chart instead
- **No animation/transition** — perubahan data gak keliatan
- **Chart.js + massive dataset** — Canvas lags, pake D3 + SVG atau WebGL
- **No data labels/legend** — user gak tau angka berapa
- **Fixed colors** — gak accessible (colorblind), pake pattern + color combo
- **No responsive sizing** — chart overflow di mobile

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
