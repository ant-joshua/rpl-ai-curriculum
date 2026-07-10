# 36. 🏗️ Web Architecture

## Client-Server Model
```
Browser ──HTTP Request──▶ Server (Node/Go/PHP)
        ◀──HTTP Response──
```
- **Client**: browser, mobile app — kirim request, render response
- **Server**: proses logic, akses DB, balas response
- **Protocol**: HTTP/HTTPS — stateless, text-based

## Rendering Approaches
| Approach | Render di | SEO | Contoh |
|----------|-----------|-----|--------|
| **CSR** (Client-Side Rendering) | Browser | ❌ | React, Vue (default) |
| **SSR** (Server-Side Rendering) | Server | ✅ | Next.js, Nuxt (SSR mode) |
| **SSG** (Static Site Gen) | Build time | ✅ | Astro, Hugo, 11ty |
| **ISR** (Incremental Static Reg) | Mix | ✅ | Next.js ISR |

```js
// CSR: browser fetch data
// SSR: server fetch data, kirim HTML jadi
// SSG: build-time HTML, deploy static
```

## SPA vs MPA
| | SPA | MPA |
|--|-----|-----|
| Halaman | 1 HTML, JS handle routing | HTML per halaman |
| Navigasi | Cepat (client-side) | Reload penuh |
| SEO | Perlu SSR/SSG | Bawaan baik |
| Contoh | React, Vue | Laravel, WordPress |

## Caching
- **Browser Cache**: `Cache-Control: max-age=3600`
- **CDN Cache**: Cloudflare, CloudFront — cache di edge server
- **Server Cache**: Redis, Memcached — cache hasil query DB
- **Service Worker**: cache API response di browser (PWA)

```http
Cache-Control: public, max-age=31536000, immutable
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

## API Architecture
```js
// REST — resource-based
GET    /api/users         // list users
POST   /api/users         // create user
GET    /api/users/:id     // get user
PUT    /api/users/:id     // update user
DELETE /api/users/:id     // delete user

// GraphQL — query apa yang dibutuh
query { user(id: 1) { name email } }
```

## Middleware Flow
```
Request → Logger → Auth → Rate Limit → Router → Controller → Response
```

## Common Pitfalls
- ❌ API fetch di client tanpa loading/error state
- ❌ Cache strategy salah — data basi atau terlalu banyak request
- ❌ Tidak paham CORS — frontend dan backend beda origin
- ❌ SSR tanpa fallback — crash kalau DB down

## Related Links
- [00 Fundamentals](00-fundamentals.md)
- [04 Web Basics](04-web-basics.md)
- [35 HTML CSS](35-html-css.md)
