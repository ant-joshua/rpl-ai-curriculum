# 00. 🌐 Fundamental Web

## Internet Basics
- **Internet**: jaringan global komputer saling terhubung via TCP/IP
- **IP Address**: alamat unik tiap perangkat (IPv4: `192.168.1.1`, IPv6: `2001:db8::`)
- **DNS**: Domain Name System — mengubah nama domain (`google.com`) ke IP
- **ISP**: Internet Service Provider — penyedia akses internet

## HTTP & HTTPS
- **HTTP**: HyperText Transfer Protocol — protokol request-response
- **HTTPS**: HTTP + SSL/TLS (terenkripsi)
- **Methods**: GET (baca), POST (kirim), PUT (ubah), DELETE (hapus), PATCH (ubah sebagian)
- **Status Codes**:
  - `200` OK
  - `201` Created
  - `301` Moved Permanently
  - `400` Bad Request
  - `401` Unauthorized
  - `403` Forbidden
  - `404` Not Found
  - `500` Internal Server Error
- **Headers**: Content-Type, Authorization, Cache-Control, User-Agent

## API
- **API**: Application Programming Interface — jembatan antar aplikasi
- **REST API**: arsitektur API berbasis resource (URL) + HTTP methods
- **JSON**: format data API (`{"key": "value"}`)
- **Endpoint**: URL spesifik untuk resource (`/api/users`)

## Client-Server
```
Client (Browser) --HTTP Request--> Server
Server --HTTP Response--> Client (Browser)
```
- **Client**: browser, mobile app, Postman
- **Server**: komputer yang menyimpan & melayani data
- **Stateless**: tiap request independen (tidak ingat sebelumnya)

## Deployment
- **Hosting**: menyewa server untuk aplikasi
- **Domain**: nama unik website (`namasaya.com`)
- **Hosting types**: Shared, VPS, Cloud (AWS, GCP, Azure), Serverless
- **CI/CD**: Continuous Integration / Continuous Deployment — otomatis build + deploy
- **Platforms**: Vercel, Netlify, Railway, Heroku, Firebase

## Common Pitfalls
- ❌ HTTP vs HTTPS — jangan kirim data sensitif via HTTP
- ❌ Lupa error handling di API call
- ❌ Hardcode URL API — pakai environment variable

## Related Links
- [Modul 04 Web Basics](04-web-basics.md)
- [Modul 36 Web Architecture](36-web-architecture.md)
