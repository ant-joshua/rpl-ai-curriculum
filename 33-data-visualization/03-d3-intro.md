# 33.3 D3.js Intro: Select, Data Join, Scale, SVG & Animation

## Apa itu D3.js?

D3 (Data-Driven Documents) = library JavaScript buat manipulasi DOM berdasarkan data. Bedanya sama Chart.js: D3 kasi kontrol penuh atas visual — kamu bikin chart dari nol pake SVG.

```
Chart.js: high-level, instant chart, limited customization
D3.js:   low-level, full control, steeper learning curve
```

### Kapan Pake D3?

- Butuh custom visualization yang Chart.js gak bisa
- Butuh transisi & animasi kompleks
- Integrasi ketat dengan DOM / SVG
- Butuh reusable chart components
- Data visualization yang interaktif & unique

## Setup

### CDN

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
```

### NPM

```bash
npm install d3
```

```typescript
import * as d3 from 'd3';
```

## Select & DOM Manipulation

```javascript
// SELECT — mirip jQuery
d3.select('body')            // select first match
d3.selectAll('p')            // select all matches
d3.select('#chart')          // by ID
d3.selectAll('.bar')         // by class

// MANIPULASI
d3.select('h1')
  .style('color', '#3b82f6')
  .text('Hello D3!')
  .attr('class', 'title');

// APPEND
d3.select('body')
  .append('svg')
  .attr('width', 500)
  .attr('height', 300);
```

## SVG Basics

Chart di D3 dibikin pake SVG (Scalable Vector Graphics).

```svg
<!-- SVG element -->
<svg width="500" height="300">
  <!-- Rectangle -->
  <rect x="10" y="20" width="40" height="100" fill="#3b82f6" />
  
  <!-- Circle -->
  <circle cx="100" cy="80" r="30" fill="#ef4444" />
  
  <!-- Line -->
  <line x1="150" y1="50" x2="250" y2="150" stroke="#22c55e" stroke-width="2" />
  
  <!-- Text -->
  <text x="300" y="100" font-size="14" fill="#333">Hello SVG</text>
  
  <!-- Group -->
  <g transform="translate(50, 50)">
    <rect x="0" y="0" width="50" height="50" fill="#f59e0b" />
    <text x="25" y="30" text-anchor="middle" fill="white">Grup</text>
  </g>
  
  <!-- Path (bentuk bebas) -->
  <path d="M 10 100 L 30 50 L 50 80 L 70 30 L 90 70"
        fill="none" stroke="#8b5cf6" stroke-width="2" />
</svg>
```

### SVG Coordinate System

```
(0,0) → → → → → X →
   ↓
   ↓  Y increase ke BAWAH (kebalikan matematika)
   ↓
   Y
```

## Data Join — Enter, Update, Exit

Core concept D3: bind data ke DOM elements.

```javascript
const data = [10, 20, 30, 40, 50];

// JOIN data ke selection
const circles = d3.select('svg')
  .selectAll('circle')
  .data(data);

// ENTER — buat element baru untuk data yang belum ada
circles.enter()
  .append('circle')
  .attr('cx', (d, i) => 30 + i * 60)
  .attr('cy', 150)
  .attr('r', (d) => d)
  .attr('fill', '#3b82f6');

// UPDATE — update existing elements
circles
  .attr('fill', '#ef4444')
  .attr('r', (d) => d + 5);

// EXIT — remove elements yang gak ada datanya
circles.exit().remove();
```

### General Update Pattern

```javascript
function update(data) {
  const circles = svg.selectAll('circle').data(data);

  // ENTER
  const enter = circles.enter()
    .append('circle')
    .attr('cy', 150)
    .attr('fill', '#3b82f6');

  // MERGE — apply ke enter + update
  enter.merge(circles)
    .attr('cx', (d, i) => 30 + i * 60)
    .attr('r', (d) => d);

  // EXIT
  circles.exit().remove();
}
```

## Scale

Scale = fungsi yang map data domain → pixel range.

```javascript
// Linear Scale
const xScale = d3.scaleLinear()
  .domain([0, 100])    // data range
  .range([0, 500]);    // pixel range

xScale(50);   // → 250 (tengah)

// Ordinal Scale (kategori)
const colorScale = d3.scaleOrdinal()
  .domain(['A', 'B', 'C'])
  .range(['#3b82f6', '#ef4444', '#22c55e']);

colorScale('B');   // → '#ef4444'

// Band Scale (bar chart)
const bandScale = d3.scaleBand()
  .domain(['Jan', 'Feb', 'Mar', 'Apr'])
  .range([0, 400])
  .padding(0.2);     // spacing antar bar

bandScale('Jan');    // → 0 (start position)
bandScale.bandwidth();  // → width of each bar

// Time Scale
const timeScale = d3.scaleTime()
  .domain([new Date('2024-01-01'), new Date('2024-12-31')])
  .range([0, 600]);

// Other scales: scaleSqrt, scaleLog, scalePow, scalePoint
```

## Axis

```javascript
// Bikin axis dari scale
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

// Render
svg.append('g')
  .attr('transform', `translate(0, ${height})`)
  .call(xAxis);

svg.append('g')
  .call(yAxis);

// Styling axis
svg.append('g')
  .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `Rp ${d}rb`));

// Grid lines
svg.append('g')
  .call(d3.axisLeft(yScale)
    .tickSize(-width)    // horizontal grid lines
    .tickFormat('')      // hide labels
  )
  .selectAll('line')
  .attr('stroke', '#e2e8f0');
```

## Bar Chart from Scratch

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>D3 Bar Chart</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; }
    .chart-container { max-width: 700px; }
    .bar:hover { opacity: 0.7; }
    .tooltip {
      position: absolute; background: #1e293b; color: white;
      padding: 6px 10px; border-radius: 6px; font-size: 13px;
      pointer-events: none; opacity: 0; transition: opacity 0.15s;
    }
  </style>
</head>
<body>
  <h1>📊 D3 Bar Chart</h1>
  <div class="chart-container">
    <div id="chart" style="position: relative;"></div>
  </div>

  <script>
    const data = [
      { kategori: 'Elektronik', nilai: 45 },
      { kategori: 'Fashion', nilai: 30 },
      { kategori: 'Makanan', nilai: 55 },
      { kategori: 'Buku', nilai: 20 },
      { kategori: 'Olahraga', nilai: 35 },
      { kategori: 'Kesehatan', nilai: 25 },
    ];

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.kategori))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.nilai) + 10])
      .range([height, 0]);

    // Color
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.kategori))
      .attr('y', d => yScale(d.nilai))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.nilai))
      .attr('fill', (d, i) => color(i))
      .attr('rx', 4)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#3b82f6');
        tooltip.style('opacity', 1)
          .html(`<strong>${d.kategori}</strong>: ${d.nilai}jt`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 30) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('fill', (_, i) => color(i));
        tooltip.style('opacity', 0);
      });

    // Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Penjualan per Kategori (jt)');

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#1e293b')
      .style('color', 'white')
      .style('padding', '6px 10px')
      .style('border-radius', '6px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('opacity', 0);
  </script>
</body>
</html>
```

## Line Chart with Axes

```html
<canvas id="lineChart"></canvas>

<script>
  const data = [
    { date: '2024-01', value: 30 },
    { date: '2024-02', value: 45 },
    { date: '2024-03', value: 38 },
    { date: '2024-04', value: 52 },
    { date: '2024-05', value: 48 },
    { date: '2024-06', value: 62 },
  ];

  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;

  const svg = d3.select('#lineChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = d3.scalePoint()
    .domain(data.map(d => d.date))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) + 10])
    .range([height, 0]);

  // Line generator
  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .curve(d3.curveCatmullRom);   // smooth curve

  // Area generator
  const area = d3.area()
    .x(d => xScale(d.date))
    .y0(height)
    .y1(d => yScale(d.value))
    .curve(d3.curveCatmullRom);

  // Draw area
  svg.append('path')
    .datum(data)
    .attr('d', area)
    .attr('fill', 'rgba(59, 130, 246, 0.1)');

  // Draw line
  svg.append('path')
    .datum(data)
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 3);

  // Points
  svg.selectAll('.point')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'point')
    .attr('cx', d => xScale(d.date))
    .attr('cy', d => yScale(d.value))
    .attr('r', 5)
    .attr('fill', 'white')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 3);

  // Labels on points
  svg.selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .attr('x', d => xScale(d.date))
    .attr('y', d => yScale(d.value) - 12)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#333')
    .text(d => d.value);

  // Axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .call(d3.axisLeft(yScale));

  // Grid
  svg.append('g')
    .call(d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat('')
    )
    .selectAll('line')
    .attr('stroke', '#e2e8f0')
    .attr('stroke-dasharray', '3 3');
</script>
```

## Transition & Animation

```javascript
// Basic transition
d3.select('rect')
  .transition()
  .duration(800)
  .delay(200)
  .ease(d3.easeElastic)
  .attr('width', 200)
  .attr('fill', '#ef4444');

// Staggered transition
svg.selectAll('.bar')
  .data(data)
  .enter()
  .append('rect')
  .attr('y', height)
  .attr('height', 0)
  .transition()
  .delay((d, i) => i * 50)
  .duration(600)
  .ease(d3.easeBackOut)
  .attr('y', d => yScale(d.nilai))
  .attr('height', d => height - yScale(d.nilai));

// Update transition (data change)
function updateChart(newData) {
  const bars = svg.selectAll('.bar').data(newData, d => d.kategori);

  // EXIT
  bars.exit()
    .transition()
    .duration(400)
    .attr('y', height)
    .attr('height', 0)
    .remove();

  // ENTER
  const enter = bars.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('y', height)
    .attr('height', 0);

  // MERGE + UPDATE
  enter.merge(bars)
    .transition()
    .duration(600)
    .delay((d, i) => i * 30)
    .attr('x', d => xScale(d.kategori))
    .attr('y', d => yScale(d.nilai))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - yScale(d.nilai))
    .attr('fill', (d, i) => color(i));
}

// Tween — interpolate nilai
d3.select('text')
  .transition()
  .duration(1000)
  .tween('text', function() {
    const that = this;
    const current = 0;
    const target = 100;
    const interpolator = d3.interpolate(current, target);
    return (t) => {
      that.textContent = Math.round(interpolator(t));
    };
  });
```

### Easing Functions

```javascript
d3.easeLinear          // konstan
d3.easeQuad            // quadratic in/out
d3.easeCubic           // cubic in/out
d3.easeElastic         // elastic bounce (karet)
d3.easeBounce          // bounce di akhir
d3.easeBackOut         // overshoot sedikit
d3.easeCircle          // circular in/out
```

## Latihan

1. **Bar Chart Interaktif**: Data: populasi 5 kota besar Indonesia (Jakarta 10.6jt, Surabaya 2.97jt, Bandung 2.44jt, Medan 2.11jt, Semarang 1.63jt). Bikin bar chart pake D3 dengan: (a) color scale categorical, (b) tooltip nunjukin nama kota + populasi, (c) bar muncul dengan animasi stagger dari bawah. Horizontal bar chart.

2. **Multi-Line Chart**: Data: suhu harian 3 kota (Jakarta, Bandung, Surabaya) selama 7 hari. Bikin line chart dengan 3 line (warna berbeda), legend di kanan atas, grid lines horizontal, dan titik data dengan label suhu. Pake `d3.scaleTime()` untuk sumbu x.

3. **Scatter Plot dengan Transisi**: Generate 50 data point random (x: 0-100, y: 0-100, group: A/B/C). Bikin scatter plot dengan: (a) warna per group, (b) radius proportional ke nilai ke-3 (z), (c) tooltip, (d) tombol "Acak Ulang" yang update data dengan transisi. Pake general update pattern.

4. **Animated Pie Chart**: Data: budget bulanan (makan 2.5jt, transport 1.2jt, hiburan 800rb, tagihan 1.5jt, tabungan 1jt). Bikin pie/donut chart dari scratch pake D3 (pake `d3.arc()` dan `d3.pie()`). Tambah: (a) animasi masuk (arc grow dari 0), (b) hover effect (arc expand sedikit), (c) label persentase di tiap slice.
