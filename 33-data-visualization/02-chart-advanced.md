# 33.2 Chart Advanced: Mixed Charts, Time Series, Plugins & Export

## Mixed Charts

Chart.js support multiple chart types dalam 1 canvas pake `mixed` type.

```html
<canvas id="mixedChart" style="max-height: 400px;"></canvas>

<script>
  new Chart(document.getElementById('mixedChart'), {
    type: 'bar',   // default type
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          type: 'bar',
          data: [30, 45, 38, 52, 48, 62],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          order: 2,
        },
        {
          label: 'Target',
          type: 'line',
          data: [40, 40, 40, 50, 50, 50],
          borderColor: '#ef4444',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#ef4444',
          tension: 0,
          order: 1,
        },
        {
          label: 'Profit Margin (%)',
          type: 'line',
          yAxisID: 'y1',
          data: [22, 18, 25, 30, 28, 33],
          borderColor: '#22c55e',
          borderDash: [5, 5],
          pointRadius: 4,
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Revenue vs Target vs Profit Margin', font: { size: 16 } },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        y: {
          position: 'left',
          title: { display: true, text: 'Revenue (jt)' },
          beginAtZero: true,
        },
        y1: {
          position: 'right',
          title: { display: true, text: 'Margin (%)' },
          grid: { drawOnChartArea: false },
          min: 0,
          max: 50,
        },
      },
    },
  });
</script>
```

## Time Series

Chart.js pake adapter date library buat time series.

```bash
npm install chart.js chartjs-adapter-date-fns
# atau CDN:
# https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3/dist/chartjs-adapter-date-fns.bundle.min.js
```

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3/dist/chartjs-adapter-date-fns.bundle.min.js"></script>

<canvas id="timeChart"></canvas>

<script>
  // Generate hourly data for 7 days
  const now = new Date();
  const points = [];
  for (let i = 24 * 7; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000);
    points.push({
      x: date,
      y: Math.floor(Math.random() * 50) + 20 + Math.sin(i / 12) * 15,
    });
  }

  new Chart(document.getElementById('timeChart'), {
    type: 'line',
    data: {
      datasets: [{
        label: 'CPU Usage (%)',
        data: points,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,      // hide points for clean look
      }],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'CPU Usage — Last 7 Days', font: { size: 16 } },
        legend: { display: false },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              hour: 'HH:mm',
              day: 'dd MMM',
              week: 'dd MMM',
            },
            tooltipFormat: 'dd MMM yyyy HH:mm',
          },
          title: { display: true, text: 'Waktu' },
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: 'CPU %' },
        },
      },
    },
  });
</script>
```

### Time Units

| Unit | Contoh Format | Kapan Pake |
|------|--------------|------------|
| `millisecond` | `HH:mm:ss.SSS` | Real-time high freq |
| `second` | `HH:mm:ss` | Per detik |
| `minute` | `HH:mm` | Per menit |
| `hour` | `HH:mm` / `dd HH:mm` | Intra-day |
| `day` | `dd MMM` | Harian |
| `week` | `dd MMM` | Mingguan |
| `month` | `MMM yyyy` | Bulanan |
| `quarter` | `QQQ yyyy` | Kwartal |
| `year` | `yyyy` | Tahunan |

## Zoom & Pan

Plugin `chartjs-plugin-zoom`.

```bash
npm install chartjs-plugin-zoom
```

```html
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2/dist/chartjs-plugin-zoom.min.js"></script>

<canvas id="zoomChart"></canvas>

<script>
  new Chart(document.getElementById('zoomChart'), {
    type: 'line',
    data: {
      labels: Array.from({ length: 100 }, (_, i) => `Point ${i + 1}`),
      datasets: [{
        label: 'Noisy Signal',
        data: Array.from({ length: 100 }, () => Math.random() * 100),
        borderColor: '#8b5cf6',
        tension: 0.2,
        pointRadius: 1,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',        // x, y, xy
          },
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            drag: {
              enabled: true,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderColor: '#8b5cf6',
              borderWidth: 1,
            },
            mode: 'x',
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true },
      },
    },
  });
</script>
```

## Annotations

Plugin `chartjs-plugin-annotation` buat nambah garis / label di chart.

```bash
npm install chartjs-plugin-annotation
```

```javascript
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [30, 45, 38, 52, 48, 62],
      borderColor: '#3b82f6',
      fill: false,
    }],
  },
  options: {
    plugins: {
      annotation: {
        annotations: {
          targetLine: {
            type: 'line',
            yMin: 50,
            yMax: 50,
            borderColor: '#ef4444',
            borderWidth: 2,
            borderDash: [6, 3],
            label: {
              display: true,
              content: 'Target 50jt',
              position: 'end',
            },
          },
          eventMarker: {
            type: 'point',
            xValue: 'Mar',
            yValue: 38,
            backgroundColor: '#f59e0b',
            radius: 8,
            label: {
              display: true,
              content: '📉 Turun',
              position: 'bottom',
            },
          },
          regionHighlight: {
            type: 'box',
            xMin: 'Feb',
            xMax: 'Apr',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderWidth: 0,
          },
        },
      },
    },
  },
});
```

## Custom Tooltips (HTML Tooltip)

Tooltip kustom render pake HTML — full control styling.

```javascript
const options = {
  plugins: {
    tooltip: {
      enabled: false,   // disable default
      external: (context) => {
        const { chart, tooltip } = context;
        let container = chart.canvas.parentNode.querySelector('.custom-tooltip');

        if (!container) {
          container = document.createElement('div');
          container.className = 'custom-tooltip';
          container.style.cssText = `
            position: absolute;
            background: #1e293b;
            color: white;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transition: opacity 0.15s;
            z-index: 100;
          `;
          chart.canvas.parentNode.appendChild(container);
        }

        if (tooltip.opacity === 0) {
          container.style.opacity = '0';
          return;
        }

        // Build content
        const title = tooltip.title?.[0] || '';
        const body = tooltip.body?.map(b => b.lines.join(', ')).join('<br>') || '';

        container.innerHTML = `
          <div style="font-weight:600;margin-bottom:4px;">${title}</div>
          <div>${body}</div>
        `;

        const pos = chart.canvas.getBoundingClientRect();
        container.style.left = tooltip.caretX + 'px';
        container.style.top = tooltip.caretY - container.offsetHeight - 10 + 'px';
        container.style.opacity = '1';
      },
    },
  },
};
```

## Chart.js Plugins

### Register Plugin Global

```javascript
import { Chart } from 'chart.js';

const backgroundPlugin = {
  id: 'customCanvasBackground',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

Chart.register(backgroundPlugin);
```

### Plugin buat Draw Line at Value

```javascript
const horizontalLinePlugin = {
  id: 'horizontalLine',
  afterDraw: (chart, args, options) => {
    const { ctx, chartArea, scales } = chart;
    const yValue = options.value || 0;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(chartArea.left, scales.y.getPixelForValue(yValue));
    ctx.lineTo(chartArea.right, scales.y.getPixelForValue(yValue));
    ctx.strokeStyle = options.color || '#ef4444';
    ctx.lineWidth = options.lineWidth || 1;
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.restore();
  },
};

// pake plugin
new Chart(ctx, {
  type: 'line',
  data: { /* ... */ },
  plugins: [horizontalLinePlugin],
  options: {
    plugins: {
      horizontalLine: {
        value: 50,
        color: '#ef4444',
        lineWidth: 2,
      },
    },
  },
});
```

## Export Chart as Image

```javascript
// Export ke PNG
function exportChart(chart, filename = 'chart.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = chart.toBase64Image('image/png', 1);  // type, quality
  link.click();
}

// Export ke JPEG
function exportJPEG(chart) {
  const link = document.createElement('a');
  link.download = 'chart.jpg';
  link.href = chart.toBase64Image('image/jpeg', 0.9);
  link.click();
}

// Export canvas langsung
function exportCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'chart.png';
  link.href = image;
  link.click();
}
```

```html
<button onclick="exportChart(myChart, 'revenue.png')">📥 Download PNG</button>
<button onclick="exportJPEG(myChart)">📥 Download JPEG</button>

<script>
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: { /* ... */ },
    options: { /* ... */ },
  });
</script>
```

## Latihan

1. **Mixed Chart dengan Dual Axis**: Data: pengunjung website per bulan (bar) dan conversion rate % (line dengan axis kanan). Bar chart warna biru, line chart merah dengan dashed style. Bulan Jan–Des. Tambah annotation garis target conversion rate 5%. Export button download PNG.

2. **Time Series dengan Zoom & Pan**: Generate 500 data point random timestamps (setiap 30 menit selama 10 hari). Tampilkan sebagai line chart time series. Aktifkan zoom drag, wheel zoom, dan pan. Tambah custom HTML tooltip yang nunjukin tanggal lengkap + nilai. Sembunyikan point biar rapi.

3. **Chart dengan Custom Plugin**: Bikin plugin Chart.js yang nge-draw grid vertikal setiap hari Senin (background color berbeda). Register plugin di chart time series. Plugin harus reusable — bisa di-set warna dan opacity lewat options.

4. **Annotation Dashboard**: Bikin chart line dengan 3 dataset (Actual, Budget, Forecast). Tambah annotations: (a) garis horizontal target tahunan, (b) box highlight Q3 region, (c) point marker di lowest actual value dengan label. Tambah label di tiap annotation. Export ke image setelah render.
