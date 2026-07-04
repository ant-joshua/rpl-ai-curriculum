# RPP: REST API Design

| Info | Detail |
|------|--------|
| Kode | RPL-AI-28 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | JavaScript/TypeScript dasar, Express.js |

## Pertemuan 1: REST Principles

### Tujuan
- Memahami prinsip REST (stateless, resource-based, uniform interface)
- Merancang URL design yang konsisten
- Menguasai HTTP methods & status codes

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: REST constraints, URL naming, HTTP methods & status codes | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: desain endpoint REST untuk resource blog | Hands-on | Whiteboard / Excalidraw |
| 20' | Latihan mandiri: bikin route Express sederhana sesuai REST | Problem solving | Starter code |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Module README](../28-rest-api-design/)
- [REST Principles](../28-rest-api-design/01-rest-principles.md)

---

## Pertemuan 2: OpenAPI & Swagger

### Tujuan
- Memahami struktur spesifikasi OpenAPI 3.0
- Setup Swagger UI otomatis dari kode
- Mendokumentasikan endpoint dengan swagger-jsdoc

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: OpenAPI spec structure, paths, schemas, swagger-jsdoc | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Swagger UI di Express + dokumentasi endpoint | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah dokumentasi OpenAPI untuk semua endpoint | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [OpenAPI & Swagger](../28-rest-api-design/02-openapi-swagger.md)

---

## Pertemuan 3: Error Handling & Pagination

### Tujuan
- Menangani error secara terstruktur (RFC 7807)
- Menerapkan pagination offset vs cursor
- Sorting & filtering di REST API

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: RFC 7807, offset vs cursor pagination, sorting/filtering | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implement error handler & pagination middleware | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah sorting & filtering ke endpoint | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Error Handling & Pagination](../28-rest-api-design/03-error-pagination.md)

---

## Pertemuan 4: Versioning & Security

### Tujuan
- Mengelola versioning API (URL/header/query)
- Mengamankan API dengan JWT, CORS, helmet
- Setup logging untuk monitoring

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: versioning strategies, JWT, CORS, helmet, logging | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implement JWT auth & CORS config | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah versioning & helmet security | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Versioning & Security](../28-rest-api-design/04-versioning-security.md)
