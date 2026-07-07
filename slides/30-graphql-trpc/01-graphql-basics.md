---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/270637/pexels-pho"
footer: "Sesi 01: Graphql Basics"
---

<!-- _class: title -->
# 30.1 GraphQL Basics

## GraphQL vs REST

| Aspek | REST | GraphQL |
|-------|------|---------|
| **Data fetching** | Multiple endpoints, fixed response shape | Single endpoint, client request exact fields |
| **Over-fetching** | Sering — dapet data kebanyakan | ✅ Gak ada — client milih field |
| **Under-fetching** | Sering — butuh N request buat N resource | ✅ Satu query bisa nested |
| **Versioning** | URL versioning (`/v1/users`) | ✅ Gak perlu — evolusi lewat field deprecation |
| **Caching** | HTTP caching built-in (`Cache-Control`, ETag) | ❌ Manual — perlu persisted queries / APQ |
| **File upload** | Native `multipart/form-data` | ❌ Butuh ekstensi |
| **Tooling** | Swagger, Postman, Insomnia | GraphQL Playground, Apollo Studio, GraphiQL |
| **Type safety** | Manual (OpenAPI spec) | ✅ Schema = contract otomatis (SDL) |

## Schema & Types

GraphQL pake **Schema Definition Language (SDL)**.

```graphql

---

# type = model
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String
  author: User!
  createdAt: String!
}


---

# entry points
type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(name: String!, email: String!): User!
  deleteUser(id: ID!): Boolean!
}


---

# scalar types: ID, String, Int, Float, Boolean

---

# ! = non-null

---

# [Type!]! = array non-null, isi non-null
```

### Scalar custom

```graphql
scalar Date
scalar JSON
```

Implementasi di code pake `GraphQLScalarType`.

## Queries & Mutations

### Query — ambil data

```graphql

---

# request
query GetUsers {
  users {
    id
    name
    email
  }
}


---

# response
{
  "data": {
    "users": [
      { "id": "1", "name": "Midory", "email": "midory@example.com" }
    ]
  }
}
```

Query with args:

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    posts {
      title
    }
  }
}
```

### Mutation — ubah data

```graphql
mutation CreateUser($name: String!, $email: String!) {
  createUser(name: $name, email: $email) {
    id
    name
    email
  }
}
```

## Apollo Server Setup in Express

```bash
npm init -y
npm install @apollo/server express graphql cors body-parser
npm install -D typescript @types/node @types/express ts-node nodemon
npx tsc --init
```

### Schema (`src/schema.ts`)

```typescript
export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
  }
`;
```

### Resolvers (`src/resolvers.ts`)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const users: User[] = [
  { id: '1', name: 'Midory', email: 'midory@example.com' },
];

export const resolvers = {
  Query: {
    users: (): User[] => users,
    user: (_: unknown, args: { id: string }): User | undefined =>
      users.find(u => u.id === args.id),
  },
  Mutation: {
    createUser: (
      _: unknown,
      args: { name: string; email: string },
    ): User => {
      const newUser: User = {
        id: String(users.length + 1),
        name: args.name,
        email: args.email,
      };
      users.push(newUser);
      return newUser;
    },
  },
};
```

### Server (`src/index.ts`)

```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

async function start() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server),
  );

  app.listen(4000, () => {
    console.log('🚀 Server ready at http://localhost:4000/graphql');
  });
}

start();
```

### Run

```bash
npx ts-node src/index.ts
```

Buka `http://localhost:4000/graphql` — GraphQL Playground muncul.

## GraphQL Playground

Playground built-in di Apollo Server. Coba query:

```graphql
{
  users {
    id
    name
    email
  }
}
```

Fitur:
- **Schema tab** — liat semua types, queries, mutations
- **Docs** — dokumentasi otomatis dari schema
- **Variables** — input JSON buat query parameterized
- **History** — riwayat query

## Latihan

1. Tambahin tipe `Post` ke schema dengan field: `id`, `title`, `content`, `authorId`. Tambah query `posts` dan `post(id)`. Tambah mutation `createPost`. Tulis schema SDL lengkap + resolvers TypeScript.

2. Bikin query `searchUsers(keyword: String!): [User!]!` yang filter user berdasarkan name/kandungan keyword. Case-insensitive. Tulis resolver dan contoh query GraphQL.

3. Tambah mutation `updateUser(id: ID!, name: String, email: String): User` buat partial update. Kalo user gak ditemuin, throw `GraphQLError` (import dari `graphql`). Tulis kode.

4. Setup Apollo Server dengan Express dan tambah REST endpoint `/health` di Express yang return `{ status: "ok" }`. Gabung di server `index.ts` yang sama. Tulis full file.
