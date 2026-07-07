---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/265087/pexels-pho"
footer: "Sesi 01: Chart Basics"
---

<!-- _class: title -->
# 33.1 Chart Basics: Types, Chart.js Setup & Configuration

## Chart Types Overview

| Chart Type | Use Case | Contoh |
|------------|----------|--------|
| **Line** | Tren sepanjang waktu | Revenue bulanan, temperature harian |
| **Bar** | Perbandingan antar kategori | Penjualan per produk, populasi per kota |
| **Pie / Doughnut** | Proporsi / persentase | Market share, budget allocation |
| **Scatter** | Korelasi 2 variabel | Height vs weight, price vs rating |
| **Area** | Volume sepanjang waktu, stacked comparison | Website traffic, resource usage |
| **Radar** | Multi-dimensi comparison | Skill matrix, product comparison |
| **Bubble** | 3 variabel (x, y, ukuran) | GDP vs population vs area |

### Kapan Pake Chart Apa?

```
Data trend time-series?         → Line chart
Bandingin kategori?             → Bar chart (horizontal kalo kategori panjang)
Persentase / pie of whole?      → Pie (maks 5 slice) atau stacked bar
Korelasi 2 numeric variable?    → Scatter plot
Distribusi data?                → Histogram (bar chart dengan bin)
Komposisi berubah waktu?        → Stacked area chart
```

## Chart.js Setup

### CDN — langsung di HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chart.js Basics</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    canvas { max-width: 100%; }
  </style>
</head>
<body>
  <h1>📊 Chart.js Demo</h1>
  <div style="width: 100%; max-width: 600px;">
    <canvas id="myChart"></canvas>
  </div>

  <script>
    const ctx = document.getElementById('myChart').getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
        datasets: [{
          label: 'Penjualan 2024',
          data: [12, 19, 15, 22, 28, 35],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Penjualan Bulanan' }
        }
      }
    });
  </script>
</body>
</html>
```

### NPM — untuk project modern

```bash
npm install chart.js
```

```typescript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ctx = document.getElementById('myChart') as HTMLCanvasElement;
new Chart(ctx, {
  type: 'bar',
  data: { /* ... */ },
  options: { /* ... */ },
});
```

## Datasets & Options

### Dataset Properties

```javascript
const dataset = {
  label: 'Revenue',
  data: [10, 20, 30],
  backgroundColor: 'rgba(59, 130, 246, 0.5)',   // fill color
  borderColor: '#3b82f6',                        // line/border color
  borderWidth: 2,
  pointBackgroundColor: '#fff',
  pointBorderColor: '#3b82f6',
  pointRadius: 4,
  tension: 0.4,                                  // curve smoothing (line)
  fill: true,                                    // fill area under line
  hidden: false,                                  // hide dataset (toggle legend)
};
```

### Global Options

```javascript
const options = {
  responsive: true,           // auto resize on window change
  maintainAspectRatio: true,  // maintain height/width ratio
  interaction: {
    mode: 'index',            // nearest point, index, dataset, x, y
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',        // top, bottom, left, right
      labels: { color: '#333' },
    },
    title: {
      display: true,
      text: 'Chart Title',
      font: { size: 18, weight: 'bold' },
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Bulan' },
      grid: { display: false },
    },
    y: {
      title: { display: true, text: 'Nilai' },
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
  },
};
```

## Responsive & Animations

```javascript
const options = {
  responsive: true,
  maintainAspectRatio: false,   // biar chart stretch sesuai container
  animation: {
    duration: 1000,             // ms
    easing: 'easeInOutQuart',   // easeOutBounce, easeInOutCubic, etc.
    delay: (context) => {
      // stagger animation per bar/point
      return context.dataIndex * 100;
    },
  },
  transitions: {
    show: {
      animations: { x: { from: 0 }, y: { from: 0 } }
    },
    hide: {
      animations: { x: { to: 0 }, y: { to: 0 } }
    }
  }
};
```

## Tooltip & Legend

### Custom Tooltip Callback

```javascript
const options = {
  plugins: {
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          return `${label}: Rp ${value.toLocaleString('id-ID')}`;
        },
        beforeLabel: (context) => {
          return `📊 ${context.dataIndex + 1}.`;
        },
        afterLabel: (context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const pct = ((context.parsed.y / total) * 100).toFixed(1);
          return `(${pct}%)`;
        },
      },
    },
    legend: {
      onClick: (event, legendItem, legend) => {
        // custom click — toggle visibility manual
        const index = legendItem.datasetIndex;
        const chart = legend.chart;
        const meta = chart.getDatasetMeta(index);
        meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
        chart.update();
      },
      labels: {
        usePointStyle: true,      // circle/square instead of rect
        pointStyle: 'circle',
        padding: 20,
        font: { size: 13 },
      },
    },
  },
};
```

## Multiple Datasets

```html
<canvas id="multiChart" style="max-height: 400px;"></canvas>

<script>
  const ctx = document.getElementById('multiChart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Produk A',
          data: [15, 22, 18, 30],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
        },
        {
          label: 'Produk B',
          data: [10, 18, 25, 28],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
        },
        {
          label: 'Produk C',
          data: [8, 12, 20, 22],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.3,
        },
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        title: { display: true, text: 'Perbandingan Produk per Kwartal', font: { size: 16 } },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
</script>
```

## Bar Chart & Pie Chart

### Bar Chart

```javascript
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta'],
    datasets: [{
      label: 'Populasi (juta)',
      data: [10.56, 2.44, 2.97, 2.11, 0.42],
      backgroundColor: [
        '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'
      ],
    }]
  },
  options: {
    indexAxis: 'y',    // horizontal bar
    scales: { x: { beginAtZero: true } },
  },
});
```

### Pie / Doughnut

```javascript
new Chart(ctx, {
  type: 'doughnut',   // atau 'pie'
  data: {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [{
      data: [55, 35, 10],
      backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b'],
      borderWidth: 2,
    }]
  },
  options: {
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return `${ctx.label}: ${pct}%`;
          },
        },
      },
    },
  },
});
```

## Scatter Plot

```javascript
new Chart(ctx, {
  type: 'scatter',
  data: {
    datasets: [{
      label: 'Harga vs Rating',
      data: [
        { x: 15000, y: 4.5 },
        { x: 25000, y: 4.2 },
        { x: 5000,  y: 3.8 },
        { x: 35000, y: 4.7 },
        { x: 12000, y: 3.5 },
      ],
      backgroundColor: '#3b82f6',
      pointRadius: 6,
    }]
  },
  options: {
    scales: {
      x: { title: { display: true, text: 'Harga (Rp)' } },
      y: { title: { display: true, text: 'Rating' }, min: 0, max: 5 },
    },
  },
});
```

## Latihan

1. **Multi-Chart Dashboard**: Bikin 1 HTML dengan 3 chart (line, bar, pie) dalam satu halaman. Data: penjualan bulanan (Jan–Dec) untuk 2 produk. Line chart tampilkan tren, bar chart bandingin per bulan, pie chart tampilkan total per produk. Semua responsive.

2. **Custom Tooltip Currency**: Bikin chart bar untuk data pengeluaran bulanan (makan: 2.5jt, transport: 1.2jt, hiburan: 800rb, tagihan: 1.5jt, lainnya: 600rb). Tooltip harus format Rupiah (Rp 2.500.000) dan tampilkan persentase dari total. Tambah legend horizontal bar.

3. **Animated Scatter Plot**: Bikin scatter plot dengan 30 data point random (x: 0-100, y: 0-100). Color points berdasarkan cluster (3 warna random). Tambah animasi stagger — tiap point muncul dengan delay 50ms. Gunakan `animation.delay` callback.

4. **Horizontal Stacked Bar**: Data: penjualan per kwartal (Q1-Q4) untuk 3 produk. Bikin horizontal stacked bar chart (`indexAxis: 'y'`). Setiap bar adalah 1 kwartal, stacked oleh 3 produk. Tambah tooltip yang show semua produk di kwartal itu.
