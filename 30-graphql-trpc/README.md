<img src="https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="GraphQL tRPC" style="width:100%;border-radius:12px;margin:12px 0;">

# 30. GraphQL & tRPC

> **Level:** 🚀 Advanced  
> **Jam:** 8 (4 minggu × 2 sesi)  
> **Prasyarat:** JavaScript/TypeScript, Express.js, REST API Design  
> **Output:** API built with GraphQL (Apollo Server) + tRPC

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Memahami perbedaan GraphQL vs REST dan kapan pake masing-masing
- Mendesain schema GraphQL: types, queries, mutations, subscriptions
- Setup Apollo Server di Express dan pake GraphQL Playground
- Nulis resolvers chain dan handle N+1 problem dengan DataLoader
- Implementasi subscriptions via WebSocket
- Nambah auth di layer GraphQL (context + directives)
- Pake union types, interface types, dan fragments
- Setup tRPC server dan client
- Nulis procedures (query, mutation, subscription) di tRPC
- Nambah middleware tRPC (auth, logging, validation)
- Integrasi tRPC dengan React via @trpc/react-query
- Handle error di tRPC secara terstruktur
- Paham perbedaan arsitektur GraphQL vs tRPC
- Setup Apollo Federation + Gateway buat microservices
- Implementasi persisted queries, caching (APQ), rate limiting
- Nerapin security best practices di GraphQL

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | GraphQL Basics — vs REST, schema & types, queries & mutations, Apollo Server setup, Playground | [01-graphql-basics.md](01-graphql-basics.md) |
| 2 | GraphQL Advanced — resolvers chain, N+1 & DataLoader, subscriptions, auth, union/interface, fragments | [02-graphql-advanced.md](02-graphql-advanced.md) |
| 3 | tRPC — setup, procedures, middleware, React integration, error handling, vs GraphQL | [03-trpc.md](03-trpc.md) |
| 4 | Production GraphQL — Federation, gateway, persisted queries, APQ caching, rate limiting, security | [04-production-graphql.md](04-production-graphql.md) |

## Output Akhir Modul

> **API hybrid** — GraphQL API (Apollo Server + subscriptions) dan tRPC API di satu project monorepo. GraphQL endpoint buat public API fleksibel, tRPC endpoint buat internal type-safe communication dengan frontend React.

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Generate GraphQL schema for a blog platform with users, posts, comments"
- "Convert this REST endpoint to a GraphQL query"
- "Help me fix N+1 problem in this resolver — write DataLoader"
- "Generate tRPC router with auth middleware for a todo app"
- "Compare: should I use GraphQL or tRPC for this use case?"
- "Generate Apollo Federation subgraph schema for user service"
- "Help me debug this GraphQL resolver — why is it returning null?"
- "Write rate limiting middleware for Apollo Server"
