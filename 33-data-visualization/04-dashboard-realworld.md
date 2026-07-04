# 33.4 Dashboard Real-World: Real-Time Data, Layout, Dark Mode & Filtering

## Real-Time Data dengan WebSocket + Chart.js

### WebSocket Server (Node.js)

```bash
npm init -y
npm install ws express
```

```javascript
// server.js — WebSocket + Express
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Generate market data
function generatePrice(base = 50000) {
  const change = (Math.random() - 0.5) * 1000;
  return Math.round((base + change) * 100) / 100;
}

function generateData() {
  return {
    timestamp: new Date().toISOString(),
    bitcoin: generatePrice(650000000),
    ethereum: generatePrice(35000000),
    solana: generatePrice(150000),
    volume: Math.floor(Math.random() * 1000) + 500,
  };
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(generateData()));
    }
  }, 2000); // every 2 seconds

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
```

### WebSocket Client + Chart.js

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Real-Time Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
    h1 { margin-bottom: 20px; font-size: 24px; }
    .stats { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .card {
      background: #1e293b; border-radius: 12px; padding: 16px 20px;
      min-width: 160px; flex: 1;
    }
    .card .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .card .value { font-size: 24px; font-weight: 700; margin-top: 4px; }
    .card .change { font-size: 13px; margin-top: 2px; }
    .up { color: #22c55e; }
    .down { color: #ef4444; }
    .chart-container { background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    canvas { max-height: 350px; }
  </style>
</head>
<body>
  <h1>📈 Real-Time Crypto Dashboard</h1>

  <div class="stats" id="stats">
    <div class="card">
      <div class="label">Bitcoin</div>
      <div class="value" id="btc-price">—</div>
      <div class="change" id="btc-change">Menunggu data...</div>
    </div>
    <div class="card">
      <div class="label">Ethereum</div>
      <div class="value" id="eth-price">—</div>
      <div class="change" id="eth-change">Menunggu data...</div>
    </div>
    <div class="card">
      <div class="label">Solana</div>
      <div class="value" id="sol-price">—</div>
      <div class="change" id="sol-change">Menunggu data...</div>
    </div>
    <div class="card">
      <div class="label">Volume (24h)</div>
      <div class="value" id="vol-price">—</div>
    </div>
  </div>

  <div class="chart-container">
    <canvas id="realtimeChart"></canvas>
  </div>

  <script>
    // Setup chart
    const ctx = document.getElementById('realtimeChart').getContext('2d');
    const maxPoints = 50;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          { label: 'Bitcoin', data: [], borderColor: '#f7931a', pointRadius: 0, tension: 0.3 },
          { label: 'Ethereum', data: [], borderColor: '#8b5cf6', pointRadius: 0, tension: 0.3 },
          { label: 'Solana', data: [], borderColor: '#22c55e', pointRadius: 0, tension: 0.3 },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 300 },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'second', displayFormats: { second: 'HH:mm:ss' } },
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8' },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8' },
          },
        },
        plugins: {
          legend: { labels: { color: '#e2e8f0' } },
        },
      },
    });

    // Track previous prices for change %
    let prevPrices = { bitcoin: null, ethereum: null, solana: null };

    // Connect WebSocket
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const time = new Date(data.timestamp);
      const formatted = time.toLocaleTimeString('id-ID');

      // Update stats
      document.getElementById('btc-price').textContent =
        `Rp ${data.bitcoin.toLocaleString('id-ID')}`;
      document.getElementById('eth-price').textContent =
        `Rp ${data.ethereum.toLocaleString('id-ID')}`;
      document.getElementById('sol-price').textContent =
        `Rp ${data.solana.toLocaleString('id-ID')}`;
      document.getElementById('vol-price').textContent =
        `${data.volume.toLocaleString('id-ID')} BTC`;

      // Change %
      for (const [key, label] of [['bitcoin', 'btc'], ['ethereum', 'eth'], ['solana', 'sol']]) {
        const prev = prevPrices[key];
        const current = data[key];
        if (prev !== null) {
          const change = ((current - prev) / prev * 100).toFixed(2);
          const el = document.getElementById(`${label}-change`);
          el.textContent = `${change > 0 ? '+' : ''}${change}%`;
          el.className = `change ${change >= 0 ? 'up' : 'down'}`;
        }
        prevPrices[key] = current;
      }

      // Push data to chart
      chart.data.datasets[0].data.push({ x: time, y: data.bitcoin });
      chart.data.datasets[1].data.push({ x: time, y: data.ethereum });
      chart.data.datasets[2].data.push({ x: time, y: data.solana });

      // Keep max points
      if (chart.data.datasets[0].data.length > maxPoints) {
        chart.data.datasets.forEach(ds => ds.data.shift());
      }

      chart.update('none'); // 'none' = skip animation for perf
    };
  </script>
</body>
</html>
```

## Dashboard Layout dengan CSS Grid

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard Layout</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #0f172a;
      --text-secondary: #64748b;
      --border: #e2e8f0;
      --accent: #3b82f6;
    }

    body {
      font-family: system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    /* HEADER */
    .header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header h1 { font-size: 20px; display: flex; align-items: center; gap: 8px; }
    .header-controls { display: flex; gap: 8px; align-items: center; }

    /* SIDEBAR */
    .layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      min-height: calc(100vh - 64px);
    }
    .sidebar {
      background: var(--surface);
      border-right: 1px solid var(--border);
      padding: 20px;
    }
    .sidebar h3 { font-size: 12px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 0.5px; }
    .sidebar nav { display: flex; flex-direction: column; gap: 4px; }
    .sidebar a {
      padding: 8px 12px; border-radius: 8px; text-decoration: none;
      color: var(--text); font-size: 14px; transition: background 0.15s;
    }
    .sidebar a:hover { background: #e2e8f0; }
    .sidebar a.active { background: var(--accent); color: white; }

    /* GRID CHARTS */
    .main { padding: 20px; }
    .chart-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .chart-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .chart-card h2 {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 12px;
      font-weight: 600;
    }
    .chart-card canvas { max-height: 250px; }

    /* FULL WIDTH */
    .chart-full {
      grid-column: 1 / -1;
    }

    /* FILTER BAR */
    .filter-bar {
      background: var(--surface);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 20px;
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .filter-bar label { font-size: 13px; font-weight: 500; }
    .filter-bar select, .filter-bar input {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 13px;
      background: var(--bg);
      color: var(--text);
    }
    .filter-bar button {
      padding: 6px 16px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .chart-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>📊 Analytics Dashboard</h1>
    <div class="header-controls">
      <span id="lastUpdate" style="font-size:13px;color:var(--text-secondary);"></span>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar">
      <h3>Menu</h3>
      <nav>
        <a href="#" class="active">Overview</a>
        <a href="#">Revenue</a>
        <a href="#">Users</a>
        <a href="#">Traffic</a>
        <a href="#">Settings</a>
      </nav>
    </aside>

    <main class="main">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <label>Periode:</label>
        <select id="periodSelect">
          <option value="7">7 Hari</option>
          <option value="30" selected>30 Hari</option>
          <option value="90">90 Hari</option>
        </select>
        <label>Kategori:</label>
        <select id="categorySelect">
          <option value="all">Semua</option>
          <option value="produk-a">Produk A</option>
          <option value="produk-b">Produk B</option>
          <option value="produk-c">Produk C</option>
        </select>
        <label>Dari:</label>
        <input type="date" id="dateFrom" />
        <label>Sampai:</label>
        <input type="date" id="dateTo" />
        <button onclick="applyFilter()">Terapkan</button>
      </div>

      <!-- Chart Grid -->
      <div class="chart-grid">
        <div class="chart-card chart-full">
          <h2>📈 Revenue Overview</h2>
          <canvas id="revenueChart"></canvas>
        </div>
        <div class="chart-card">
          <h2>👥 User Growth</h2>
          <canvas id="userChart"></canvas>
        </div>
        <div class="chart-card">
          <h2>📱 Traffic Sources</h2>
          <canvas id="trafficChart"></canvas>
        </div>
        <div class="chart-card">
          <h2>🏆 Top Products</h2>
          <canvas id="productChart"></canvas>
        </div>
        <div class="chart-card">
          <h2>📍 Regional</h2>
          <canvas id="regionChart"></canvas>
        </div>
      </div>
    </main>
  </div>

  <script>
    // Sample data
    const labels = Array.from({ length: 30 }, (_, i) => `Hari ${i + 1}`);
    const revenueData = labels.map(() => Math.floor(Math.random() * 80) + 20);
    const userData = labels.map((_, i) => Math.floor(100 + i * 5 + Math.random() * 20));
    const trafficData = [35, 25, 20, 12, 8]; // Organic, Direct, Social, Referral, Other
    const productData = [42, 28, 18, 12];
    const regionData = [35, 25, 20, 12, 8];

    // Revenue Chart
    new Chart(document.getElementById('revenueChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (jt)',
          data: revenueData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          fill: true,
          tension: 0.3,
        }],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });

    // User Growth
    new Chart(document.getElementById('userChart'), {
      type: 'bar',
      data: {
        labels: labels.filter((_, i) => i % 5 === 0),
        datasets: [{
          label: 'Users',
          data: userData.filter((_, i) => i % 5 === 0),
          backgroundColor: '#22c55e',
        }],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });

    // Traffic Sources (Pie)
    new Chart(document.getElementById('trafficChart'), {
      type: 'doughnut',
      data: {
        labels: ['Organic Search', 'Direct', 'Social Media', 'Referral', 'Other'],
        datasets: [{
          data: trafficData,
          backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'],
        }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });

    // Top Products (Horizontal Bar)
    new Chart(document.getElementById('productChart'), {
      type: 'bar',
      data: {
        labels: ['Produk A', 'Produk B', 'Produk C', 'Produk D'],
        datasets: [{
          label: 'Penjualan',
          data: productData,
          backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'],
        }],
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
      },
    });

    // Regional
    new Chart(document.getElementById('regionChart'), {
      type: 'bar',
      data: {
        labels: ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta'],
        datasets: [{
          label: 'Penjualan (jt)',
          data: regionData,
          backgroundColor: '#8b5cf6',
        }],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });

    function applyFilter() {
      const period = document.getElementById('periodSelect').value;
      const category = document.getElementById('categorySelect').value;
      const dateFrom = document.getElementById('dateFrom').value;
      const dateTo = document.getElementById('dateTo').value;
      console.log('Filter:', { period, category, dateFrom, dateTo });
      alert('Filter applied! (check console)');
    }

    // Update timestamp
    document.getElementById('lastUpdate').textContent = `Terakhir: ${new Date().toLocaleString('id-ID')}`;
  </script>
</body>
</html>
```

## Dark Mode Dashboard

```css
/* Dark mode — toggle class di body */
:root {
  /* Light */
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #0f172a;
  --text-secondary: #64748b;
  --border: #e2e8f0;
}

body.dark {
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #e2e8f0;
  --text-secondary: #94a3b8;
  --border: #334155;
}

/* Toggle button */
.theme-toggle {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  color: var(--text);
  font-size: 14px;
}

/* Chart.js dark mode — update options */
function getChartOptions(dark) {
  return {
    scales: {
      x: {
        grid: { color: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: dark ? '#94a3b8' : '#64748b' },
      },
      y: {
        grid: { color: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: dark ? '#94a3b8' : '#64748b' },
      },
    },
    plugins: {
      legend: { labels: { color: dark ? '#e2e8f0' : '#0f172a' } },
    },
  };
}
```

```javascript
// Toggle theme
const toggleBtn = document.getElementById('themeToggle');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  toggleBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';

  // Update semua chart
  charts.forEach(chart => {
    chart.options = { ...chart.options, ...getChartOptions(isDark) };
    chart.update();
  });
});
```

## Filtering & Date Range

```javascript
// Data source — lengkap
const allData = [
  { date: '2024-01-05', category: 'produk-a', value: 30 },
  { date: '2024-01-12', category: 'produk-b', value: 45 },
  // ... banyak data
];

function filterData(data, { category, dateFrom, dateTo }) {
  return data.filter(d => {
    if (category !== 'all' && d.category !== category) return false;
    if (dateFrom && new Date(d.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(d.date) > new Date(dateTo)) return false;
    return true;
  });
}

function updateCharts(filteredData) {
  // Aggregate by date
  const aggregated = {};
  filteredData.forEach(d => {
    aggregated[d.date] = (aggregated[d.date] || 0) + d.value;
  });

  const labels = Object.keys(aggregated).sort();
  const values = labels.map(l => aggregated[l]);

  // Update chart data
  revenueChart.data.labels = labels;
  revenueChart.data.datasets[0].data = values;
  revenueChart.update();
}
```

## Multiple Chart Sync

Sinkronisasi hover/zoom antar chart.

```javascript
// Sync tooltip crosshair antar chart
function syncCrosshair(sourceChart, targetChart) {
  sourceChart.canvas.addEventListener('mousemove', (e) => {
    const rect = sourceChart.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;

    // Hitung index di source
    const meta = sourceChart.getDatasetMeta(0);
    const index = Math.round(x * (meta.data.length - 1));
    if (index < 0 || index >= meta.data.length) return;

    // Set active elements di semua chart
    [sourceChart, targetChart].forEach(chart => {
      chart.setActiveElements([
        { datasetIndex: 0, index: Math.min(index, chart.data.labels.length - 1) },
      ]);
      chart.draw();
    });
  });
}

// Sync zoom level antar time series
function syncZoom(sourceChart, targetCharts) {
  sourceChart.canvas.addEventListener('mouseup', () => {
    const xScale = sourceChart.scales.x;
    const { min, max } = xScale;

    targetCharts.forEach(chart => {
      chart.options.scales.x.min = min;
      chart.options.scales.x.max = max;
      chart.update();
    });
  });
}
```

## Latihan

1. **Live CPU Monitor Dashboard**: Bikin dashboard real-time dengan WebSocket server (simulasi CPU/memory/disk usage — update tiap 1 detik). Tampilkan 3 line chart (CPU%, Memory%, Disk%) + stat cards (current value, min, max, avg). Pake dark theme. Data retention: last 60 detik. Tambah tombol pause/resume.

2. **E-Commerce Dashboard**: Bikin dashboard 6 chart: (1) revenue line chart (7 hari), (2) orders bar chart per hari, (3) pie chart kategori produk, (4) horizontal bar top 5 produk, (5) area chart conversion rate, (6) scatter plot qty vs revenue. Layout 3 kolom × 2 baris pake CSS Grid. Tambah filter tanggal & kategori. Responsive — jadi 1 kolom di mobile.

3. **Dark Mode + Theme Switcher**: Ambil dashboard dari latihan 2. Tambah: (a) toggle dark/light mode, (b) chart colors auto-adjust, (c) persist theme preference di localStorage, (d) smooth transition CSS antar mode. Wajib update chart options pas toggle (scale grid colors, text colors).

4. **Synchronized Multi-Chart + Export**: Bikin 3 chart yang saling sync: (a) line chart overview (full range), (b) bar chart zoom detail (sync selection dari overview), (c) pie chart distribusi berdasarkan range yang dipilih. Tambah: (a) sync hover crosshair antar chart, (b) klik di chart overview set range chart detail, (c) export all charts sebagai 1 image (pake html2canvas atau manual canvas composite).
