# GraphQL & tRPC — Latihan

## Level 1: Dasar

### 1. Schema Definition — Type & Query
**Pertanyaan:** Tulis GraphQL schema untuk:

1. Type `User` dengan field: `id` (ID!), `name` (String!), `email` (String!), `posts` ([Post!]!)
2. Type `Post` dengan field: `id` (ID!), `title` (String!), `content` (String!), `author` (User!)
3. Query: `users` return [User!]!, `user(id: ID!)` return User

**Hint:** Tanda `!` berarti non-null. Relasi referensi silang: User punya posts, Post punya author.

---

### 2. Resolver — Query Resolver Sederhana
```javascript
const users = [
  { id: '1', name: 'Budi', email: 'budi@email.com' },
  { id: '2', name: 'Siti', email: 'siti@email.com' },
];
```

**Pertanyaan:** Tulis resolver GraphQL (Apollo Server style) untuk:
1. Query `users` — return semua user
2. Query `user(id: ID!)` — cari user by id, return null kalau nggak ada

**Hint:**
```javascript
const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find(u => u.id === id) || null,
  }
};
```

---

### 3. Mutation — Create & Update
**Pertanyaan:** Tambahkan ke schema dan resolver:

1. Mutation `createUser(name: String!, email: String!): User!` — buat user baru, return user
2. Mutation `updateUser(id: ID!, name: String, email: String): User` — update user, return null kalau nggak ada
3. Validasi: email harus unik, kalau duplikat throw error

**Hint:**
```graphql
type Mutation {
  createUser(name: String!, email: String!): User!
  updateUser(id: ID!, name: String, email: String): User
}
```

---

### 4. Arguments & Input Types
**Pertanyaan:** Ubah mutation di soal #3 pake `input` type:

1. Buat `input CreateUserInput { name: String!, email: String! }`
2. Buat `input UpdateUserInput { name: String, email: String }`
3. Sesuaikan mutation pake input types

**Hint:**
```graphql
input CreateUserInput {
  name: String!
  email: String!
}
```

---

### 5. tRPC — Router Setup Dasar
**Pertanyaan:** Tulis tRPC router untuk operasi CRUD User:

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();
```

1. Router dengan query `getAll` (return array user)
2. Router dengan query `getById` (input: `z.string()`)
3. Mutation `create` (input: `z.object({ name: z.string(), email: z.string().email() })`)

**Hint:**
```typescript
export const userRouter = t.router({
  getAll: t.procedure.query(() => users),
  getById: t.procedure.input(z.string()).query(({ input }) => users.find(u => u.id === input)),
  create: t.procedure.input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(({ input }) => { ... }),
});
```

---

### 6. Queries & Mutations — Apollo Client
**Pertanyaan:** Tulis query dan mutation Apollo Client (React hooks):

1. Query `GET_USERS` — fetch semua user
2. Query `GET_USER` — fetch user by id (variable: `$id`)
3. Mutation `CREATE_USER` — create user (variables: `$name`, `$email`)

**Hint:**
```jsx
const { data, loading } = useQuery(GET_USERS);
const [createUser] = useMutation(CREATE_USER);
```

---

### 7. GraphQL vs REST — Perbandingan
**Pertanyaan:** Sebutkan 3 kelebihan GraphQL dibanding REST dan 1 skenario dimana REST lebih cocok.

**Hint:** Over-fetching / under-fetching, satu endpoint, flexible query. REST lebih cocok untuk simple CRUD atau caching di CDN.

---

### 8. tRPC — Client Setup
**Pertanyaan:** Tulis konfigurasi tRPC client di React:

1. Buat `trpc` client dengan `httpBatchLink` ke `http://localhost:3000/api/trpc`
2. Wrap app dengan `TRPCProvider`
3. Call query `getAll` dari userRouter di komponen

**Hint:**
```typescript
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server';

export const trpc = createTRPCReact<AppRouter>();
```

---

## Level 2: Intermediate

### 9. N+1 Problem & DataLoader
**Skenario:** Query berikut memicu N+1 problem:
```graphql
query {
  users {
    name
    posts { title }
  }
}
```

Resolver:
```javascript
const resolvers = {
  User: {
    posts: (parent) => db.posts.findByUserId(parent.id), // N queries!
  },
  Query: {
    users: () => db.users.findAll(), // 1 query
  }
};
```

**Pertanyaan:**
1. Jelaskan kenapa query di atas N+1 problem
2. Implementasi DataLoader untuk batch loading posts
3. Berapa query database yang dijalankan setelah pakai DataLoader?

**Hint:**
```javascript
const postsLoader = new DataLoader(async (userIds) => {
  const posts = await db.posts.findByUserIds(userIds);
  return userIds.map(id => posts.filter(p => p.userId === id));
});
```

---

### 10. GraphQL Subscriptions — Real-time Chat
**Pertanyaan:** Implementasi subscription untuk chat real-time:

1. Schema: `type Message { id: ID!, user: String!, text: String!, createdAt: String! }`
2. Mutation `sendMessage(user: String!, text: String!): Message!`
3. Subscription `messageSent: Message!` — broadcast ke semua client
4. Gunakan `PubSub` dari Apollo Server

**Hint:**
```javascript
const pubsub = new PubSub();
const MESSAGE_SENT = 'MESSAGE_SENT';

const resolvers = {
  Subscription: {
    messageSent: { subscribe: () => pubsub.asyncIterator([MESSAGE_SENT]) },
  },
  Mutation: {
    sendMessage: (_, { user, text }) => {
      const message = { id: uuid(), user, text, createdAt: new Date().toISOString() };
      pubsub.publish(MESSAGE_SENT, { messageSent: message });
      return message;
    },
  },
};
```

---

### 11. tRPC — Middleware & Context
**Pertanyaan:** Tambahkan middleware dan context ke tRPC:

1. **Context:** Parse `authorization` header, cari user, set `ctx.user`
2. **Auth middleware:** Protect route — return error kalau user tidak login
3. **Logging middleware:** Log setiap request (method, path, duration)
4. Terapkan di router: `getProfile` harus authenticated

**Hint:**
```typescript
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { user: ctx.user } });
});
const authedProcedure = t.procedure.use(isAuthed);
```

---

### 12. Fragments & Union Types
**Pertanyaan:** Desain schema untuk feed berisi berbagai tipe konten:

1. `type TextPost { id: ID!, title: String!, body: String! }`
2. `type ImagePost { id: ID!, title: String!, imageUrl: String!, caption: String }`
3. `type VideoPost { id: ID!, title: String!, videoUrl: String!, duration: Int! }`
4. `union FeedItem = TextPost | ImagePost | VideoPost`
5. Query `feed: [FeedItem!]!`

Tulis query yang mengambil semua field dari tiap tipe pake fragment.

**Hint:**
```graphql
query {
  feed {
    ... on TextPost { title body }
    ... on ImagePost { title imageUrl caption }
    ... on VideoPost { title videoUrl duration }
  }
}
```

---

### 13. GraphQL Error Handling
**Pertanyaan:** Implementasi error handling di Apollo Server:

1. Custom error class `NotFoundError` — code `NOT_FOUND`, http status 404
2. Custom error class `ValidationError` — code `VALIDATION_ERROR`, http status 400
3. Format error response konsisten: `{ message, code, details }`
4. Jangan expose internal error message di production (NODE_ENV)

**Hint:**
```javascript
class ValidationError extends ApolloError {
  constructor(message, details) {
    super(message, 'VALIDATION_ERROR');
    this.details = details;
  }
}
// formatError: (err) => ({ message: err.message, code: err.extensions.code, ... })
```

---

### 14. tRPC — Error Handling & Input Validation
**Pertanyaan:** Tulis router tRPC untuk product catalog dengan:

1. Query `search(input: { q: string, minPrice?: number, maxPrice?: number })` 
2. Validasi: `q` minimal 2 karakter, `minPrice` < `maxPrice`
3. Error handling: produk tidak ditemukan → `NOT_FOUND`, invalid input → `BAD_REQUEST`
4. Pagination: return `{ items: Product[], total: number, nextCursor?: string }`

**Hint:**
```typescript
export const productRouter = t.router({
  search: t.procedure
    .input(z.object({ q: z.string().min(2), minPrice: z.number().optional(), maxPrice: z.number().optional() })
      .refine(d => !d.minPrice || !d.maxPrice || d.minPrice < d.maxPrice, { message: 'minPrice must be < maxPrice' }))
    .query(({ input }) => { ... }),
});
```

---

## Level 3: Challenge

### 15. Full GraphQL API — Blog Platform
**Pertanyaan:** Implementasi full GraphQL API untuk blog platform:

**Schema:**
```graphql
type User { id: ID!, name: String!, email: String!, posts: [Post!]!, comments: [Comment!]! }
type Post { id: ID!, title: String!, content: String!, published: Boolean!, author: User!, comments: [Comment!]! }
type Comment { id: ID!, text: String!, author: User!, post: Post! }
type Query { users: [User!]!, user(id: ID!): User, posts(published: Boolean, search: String): [Post!]!, post(id: ID!): Post }
type Mutation { createPost(input: CreatePostInput!): Post!, updatePost(id: ID!, input: UpdatePostInput!): Post!, deletePost(id: ID!): Boolean!, addComment(postId: ID!, text: String!): Comment! }
type Subscription { postCreated: Post!, commentAdded(postId: ID!): Comment! }
```

**Persyaratan:**
1. DataLoader untuk resolve posts/comments di User
2. Autentikasi JWT di context
3. Cuma author yang bisa update/delete postnya
4. Subscription `commentAdded` filter by postId
5. Pagination untuk posts (gunakan `limit` + `offset` argument)
6. Error handling global

**Hint:** Pakai `withFilter` untuk filter subscription:
```javascript
import { withFilter } from 'graphql-subscriptions';
commentAdded: { subscribe: withFilter(() => pubsub.asyncIterator(COMMENT_ADDED), (payload, variables) => payload.commentAdded.postId === variables.postId) }
```

---

### 16. tRPC — Full Stack Todo App
**Skenario:** Bangun full-stack todo app dengan tRPC + React + Prisma (SQLite).

**Pertanyaan:** Implementasi:

**Server (tRPC router):**
1. `todoRouter` dengan:
   - `getAll`: filter by `status` ('all' | 'active' | 'completed')
   - `getById`: single todo
   - `create`: input `{ title: string!, description?: string }`
   - `update`: input `{ id: string, title?: string, description?: string, completed?: boolean }`
   - `delete`: input `{ id: string }`
   - `clearCompleted`: delete semua completed todos
2. Protected routes (hanya authenticated user)
3. Context: user dari session/token

**Client (React):**
4. TRPCProvider setup
5. TodoList component: fetch + render
6. TodoForm component: create + validation
7. Optimistic update untuk toggle completed

**Hint:**
```typescript
// Optimistic update example
const utils = trpc.useContext();
const toggleMutation = trpc.todo.update.useMutation({
  onMutate: async (updatedTodo) => {
    await utils.todo.getAll.cancel();
    const previous = utils.todo.getAll.getData();
    utils.todo.getAll.setData(undefined, (old) => old?.map(t => t.id === updatedTodo.id ? { ...t, ...updatedTodo } : t));
    return { previous };
  },
  onError: (err, newTodo, context) => { utils.todo.getAll.setData(undefined, context?.previous); },
});
```

---

### 17. Performance Optimization — Query Complexity & Batching
**Skenario:** API GraphQL menerima query kompleks yang bisa bikin database collapse:
```graphql
query {
  users {
    posts {
      comments {
        author {
          posts { title }
        }
      }
    }
  }
}
```

**Pertanyaan:** Implementasi proteksi dan optimasi:

1. **Query complexity analysis:** Hitung complexity tiap field. Batasi max complexity = 100. Tolak query yang melebihi.
   - User: 1, User.posts: 2, Post.comments: 2, Comment.author: 2, Author.posts: 2
   - Query di atas: 1 (users) + 10× (2 + 5× (2 + 5× (2 + 2))) = ?

2. **Depth limiting:** Batasi max depth = 5

3. **DataLoader batch:** Pastikan semua N+1 tertangani

4. **Response caching:** Cache query yang sama dalam window 5 detik (pakai response cache plugin Apollo)

**Hint:**
```javascript
// Query complexity plugin
const { createComplexityRule, simpleEstimator } = require('graphql-query-complexity');
const rule = createComplexityRule({
  estimators: [simpleEstimator({ defaultComplexity: 1 })],
  maximumComplexity: 100,
});
```

---

### 18. Schema Federation — Microservices GraphQL
**Skenario:** Arsitektur monolit GraphQL mulai terlalu besar. Pisah jadi 3 service: `users`, `posts`, `comments`.

**Pertanyaan:** Implementasi Apollo Federation:

1. **Users service** — `type User @key(fields: "id") { id: ID!, name: String!, email: String! }`
2. **Posts service** — `type Post @key(fields: "id") { id: ID!, title: String!, content: String!, author: User! }` — extend User: `extend type User @key(fields: "id") { id: ID! @external, posts: [Post!]! }`
3. **Comments service** — extend Post dan User untuk relasi comment
4. **Gateway** — Apollo Gateway yang menggabungkan semua service

Tulis:
- Schema dan resolver untuk tiap service
- Konfigurasi gateway
- Bagaimana cara handle error antar service

**Hint:**
```javascript
// Posts service
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  extend type User @key(fields: "id") { id: ID! @external, posts: [Post!]! }
  type Post @key(fields: "id") { id: ID!, title: String!, content: String!, author: User! }
  extend type Query { posts: [Post!]! }
`;

const resolvers = {
  Post: { __resolveReference: (ref) => db.posts.find(ref.id), author: (post) => ({ __typename: 'User', id: post.authorId }) },
  User: { posts: (user) => db.posts.findByUserId(user.id) },
};
```
