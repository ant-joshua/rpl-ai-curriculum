<img src="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="API Design" style="width:100%;border-radius:12px;margin:12px 0;">

# 28. REST API Design

> **Level:** 🌱 Intermediate  
> **Jam:** 8 (4 minggu × 2 sesi)  
> **Prasyarat:** JavaScript/TypeScript dasar, Express.js  
> **Output:** REST API documented with OpenAPI + production-ready

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Merancang REST API dengan prinsip-prinsip REST (stateless, resource-based, uniform interface)
- Membuat URL design yang konsisten dan mengikuti best practices
- Mendokumentasikan API secara otomatis dengan OpenAPI 3.0 + Swagger UI
- Menangani error secara terstruktur (Problem Details RFC 7807)
- Menerapkan pagination, sorting, filtering, dan rate limiting
- Mengelola versioning API dengan strategi backward compatibility
- Mengamankan API dengan API keys, JWT, CORS, helmet, dan logging

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | REST Principles — constraints, URL naming, HTTP methods & status codes | [01-rest-principles.md](01-rest-principles.md) |
| 2 | OpenAPI & Swagger — spec structure, paths, schemas, swagger-jsdoc setup | [02-openapi-swagger.md](02-openapi-swagger.md) |
| 3 | Error Handling & Pagination — RFC 7807, offset vs cursor, sorting/filtering | [03-error-pagination.md](03-error-pagination.md) |
| 4 | Versioning & Security — URL/header/query versioning, JWT, CORS, helmet, logging | [04-versioning-security.md](04-versioning-security.md) |

## Output Akhir Modul

> **Production-ready REST API** — Express/TypeScript API dengan dokumentasi OpenAPI otomatis, error handling terstruktur, pagination, versioning, security (JWT + CORS + helmet), dan logging.

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Generate OpenAPI 3.0 spec for this endpoint"
- "Review my API design — what REST principles am I violating?"
- "Help me choose: offset pagination vs cursor pagination for this use case"
- "Generate JWT middleware for Express with TypeScript"
- "Write error responses following RFC 7807 format"
- "What security headers should I add to this Express app?"
