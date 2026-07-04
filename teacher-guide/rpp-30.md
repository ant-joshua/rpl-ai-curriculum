# RPP: GraphQL & tRPC

| Info | Detail |
|------|--------|
| Kode | RPL-AI-30 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | JavaScript/TypeScript, Express.js, REST API Design |

## Pertemuan 1: GraphQL Basics

### Tujuan
- Memahami perbedaan GraphQL vs REST
- Mendesain schema GraphQL: types, queries, mutations
- Setup Apollo Server di Express

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: GraphQL vs REST, schema & types, queries & mutations, Apollo Server | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Apollo Server + GraphQL Playground | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah query & mutation baru di schema | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Module README](../30-graphql-trpc/)
- [GraphQL Basics](../30-graphql-trpc/01-graphql-basics.md)

---

## Pertemuan 2: GraphQL Advanced

### Tujuan
- Nulis resolvers chain dan handle N+1 problem dengan DataLoader
- Implementasi subscriptions via WebSocket
- Nambah auth di layer GraphQL

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: resolvers chain, N+1 & DataLoader, subscriptions, auth, union/interface | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implement DataLoader & subscriptions | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah auth context & union types | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [GraphQL Advanced](../30-graphql-trpc/02-graphql-advanced.md)

---

## Pertemuan 3: tRPC

### Tujuan
- Setup tRPC server dan client
- Nulis procedures (query, mutation, subscription)
- Integrasi tRPC dengan React via @trpc/react-query

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: tRPC setup, procedures, middleware, React integration, error handling | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup tRPC server + client + React integration | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah auth middleware & error handling di tRPC | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [tRPC](../30-graphql-trpc/03-trpc.md)

---

## Pertemuan 4: Production GraphQL

### Tujuan
- Setup Apollo Federation + Gateway untuk microservices
- Implementasi persisted queries, APQ caching, rate limiting
- Security best practices di GraphQL

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: Federation, gateway, persisted queries, APQ, rate limiting, security | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Apollo Federation + persisted queries | Hands-on | Starter code |
| 20' | Latihan mandiri: implement rate limiting & security hardening | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Production GraphQL](../30-graphql-trpc/04-production-graphql.md)
