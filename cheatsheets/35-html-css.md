# 35. 🎨 HTML & CSS

## HTML5 Template
```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Judul</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
  <script src="script.js"></script>
</body>
</html>
```

## Semantic HTML
```html
<header>, <nav>, <main>, <section>, <article>
<aside>, <footer>, <figure>, <figcaption>
```

## CSS Selectors
```css
*        /* universal */
.tag     /* element */
#id      /* ID */
.class   /* class */
div p    /* descendant */
div > p  /* direct child */
a:hover  /* pseudo-class */
::before /* pseudo-element */
```

## Box Model
```
┌─ Margin ─────────────────┐
│  ┌─ Border ─────────┐    │
│  │  ┌─ Padding ──┐  │    │
│  │  │  Content    │  │    │
│  │  └─────────────┘  │    │
│  └───────────────────┘    │
└───────────────────────────┘
```
```css
box-sizing: border-box;  /* rekomendasi: padding + border dihitung dalam width */
```

## Flexbox
```css
.container {
  display: flex;
  flex-direction: row;      /* row | column */
  justify-content: center;  /* main axis: flex-start, center, space-between */
  align-items: center;      /* cross axis: center, stretch, flex-start */
  flex-wrap: wrap;          /* wrap | nowrap */
  gap: 16px;                /* jarak antar item */
}

.item {
  flex: 1;                  /* grow */
  align-self: center;       /* override align-items */
}
```

## CSS Grid
```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3 kolom sama besar */
  grid-template-rows: auto 200px;
  gap: 16px;
}

.item {
  grid-column: span 2;      /* lintasi 2 kolom */
  grid-row: 1 / 3;          /* baris 1 ke 3 */
}

/* Auto-fit responsive */
.container {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

## Responsive Design
```css
/* Mobile-first */
.container { display: block; }

@media (min-width: 768px) {
  .container { display: grid; }
}

@media (min-width: 1024px) {
  .container { max-width: 960px; margin: 0 auto; }
}
```

## Units
| Unit | Relatif ke | Contoh |
|------|------------|--------|
| `px` | Piksel tetap | `16px` |
| `rem` | Root font-size | `2rem` = 32px (default) |
| `em` | Parent font-size | `1.5em` |
| `%` | Parent element | `50%` |
| `vw` | 1% viewport width | `100vw` |
| `vh` | 1% viewport height | `100vh` |

## Common Pitfalls
- ❌ Lupa `box-sizing: border-box` → layout broken
- ❌ Flex vs Grid — flex untuk 1D, grid untuk 2D
- ❌ `div` berlebihan — pakai semantic HTML
- ❌ Inline styles → sulit maintenance, rendah specificity

## Related Links
- [04 Web Basics](04-web-basics.md)
- [36 Web Architecture](36-web-architecture.md)
