# 🧠 Cheatsheet: GraphQL & tRPC

> Referensi cepet — 1 halaman.

## Topik Utama

**GraphQL vs REST:** Single endpoint, client pilih exact fields (no over/under-fetching), strong schema via SDL, built-in type safety.

**GraphQL Schema (SDL):** `type`, `Query`, `Mutation`, `Subscription`, `!` (non-null), `[Type]` (array), custom scalar.

**Resolvers:** Fungsi yang return data untuk tiap field. Chain resolvers untuk nested data.

**N+1 Problem:** N queries untuk N items. Solusi: **DataLoader** — batching + caching.

**Subscriptions:** Real-time via WebSocket. Pake `PubSub` + `Subscription` type.

**tRPC:** Type-safe RPC — shared types antara server & client. No schema file needed.

**tRPC Procedures:** `query` (GET), `mutation` (POST/PUT/DELETE), `subscription` (real-time).

**Apollo Federation:** Bagi GraphQL API into subgraphs + gateway.

## Command / Sintaks Penting

```graphql
# Schema dasar
type User {
  id: ID!
  name: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  author: User!
}

type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
}
```

```typescript
// Apollo Server setup
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
  type Query { hello: String }
`;
const resolvers = { Query: { hello: () => 'World' } };

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
```

```typescript
// DataLoader — solves N+1
const userLoader = new DataLoader(async (ids: readonly number[]) => {
  const users = await db.users.findByIds(ids);
  return ids.map(id => users.find(u => u.id === id));
});
// In resolver: userLoader.load(parent.authorId)
```

```typescript
// tRPC router
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();
const appRouter = t.router({
  userById: t.procedure.input(z.number()).query(async ({ input }) => {
    return await db.user.findUnique({ where: { id: input } });
  }),
  createUser: t.procedure
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(async ({ input }) => {
      return await db.user.create({ data: input });
    }),
});
export type AppRouter = typeof appRouter;
```

## Tips & Trik

- GraphQL buat **public API** fleksibel, tRPC buat **internal type-safe communication**
- Selalu pake **DataLoader** kalau ada nested queries — N+1 masalah paling umum
- **Persisted Queries** + **APQ** (Automatic Persisted Queries) = cache GraphQL
- tRPC + React: `@trpc/react-query` — queries auto-cache, mutations auto-invalidate
- GraphQL **rate limiting**: berdasarkan query complexity (depth + cost), bukan endpoint
- **Union/Interface types** di GraphQL buat polymorphic data

## Common Mistakes

- **No DataLoader** — N+1 problem bikin API slow
- **Over-fetching di GraphQL** — client minta `posts { comments { user { ... } } }` nested dalem
- **tRPC tanpa validation** — selalu pake Zod/Valibot di input
- **Public GraphQL tanpa depth limiting** — attacker bisa query nested sampe 10 level
- **Subscription tanpa WebSocket** — stateful connection, perlu PubSub backend (Redis)

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
