# Web Development — Exercise #2: CSS Flexbox

> **Level:** Beginner
> **Topics:** flexbox, display flex, justify-content, align-items, flex-direction, gap

## Instructions

Lengkapi CSS untuk membuat navbar responsif menggunakan Flexbox.

Aturan:
1. Navbar menggunakan `display: flex`, `justify-content: space-between`.
2. Logo di kiri, menu di kanan.
3. Menu (`.nav-links`) menggunakan `display: flex` dengan `gap`.
4. Mobile (< 768px): navbar dan menu berubah jadi vertikal (`flex-direction: column`).

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flexbox Navbar</title>
  <style>
    /* TODO: Flexbox layout */
    .navbar {
      display: /* ? */;
      justify-content: /* ? */; /* space-between */
      align-items: /* ? */;
      background: #333;
      padding: 1rem 2rem;
    }

    .logo {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .nav-links {
      display: /* ? */;
      gap: /* ? */;
      list-style: none;
      margin: 0;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
    }

    .nav-links a:hover {
      background: #555;
      border-radius: 4px;
    }

    /* Mobile: stack vertikal */
    @media (max-width: 768px) {
      .navbar {
        flex-direction: /* ? */;
      }
      .nav-links {
        flex-direction: /* ? */;
        padding-left: 0;
      }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo">MyApp</div>
    <ul class="nav-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Services</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>

  <main style="padding: 2rem;">
    <h1>Flexbox Navbar Demo</h1>
    <p>Resize browser untuk melihat perubahan layout.</p>
  </main>
</body>
</html>
```

## Expected Output

- Desktop: logo kiri, menu kanan, horizontal.
- Mobile (< 768px): semua vertikal, menu di bawah logo.

## Test Cases

```javascript
// Test secara visual — resize browser
console.log("Navbar flexbox siap. Cek di browser desktop dan mobile.");
```
