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

# scalar types: ID, String, Int, Float, Boolean
# ! = non-null
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
# request
query GetUsers {
  users {
    id
    name
    email
  }
}

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

## Apollo Client — Frontend Integration

Apollo Client = library GraphQL buat frontend (React, Vue, Angular, vanilla JS). Fitur utama: caching, optimistic UI, pagination, error handling.

### Setup Apollo Client

```bash
npm install @apollo/client graphql
```

### Inisialisasi Client

```typescript
// frontend/src/apollo/client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const cache = new InMemoryCache();

export const client = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

**Fetch policy options:**

| Policy | Behavior |
|--------|----------|
| `cache-first` | Cek cache dulu, kalo ada pake cache (default) |
| `cache-and-network` | Cache langsung render, trus fetch ulang di background |
| `network-only` | Skip cache, selalu fetch dari server |
| `cache-only` | Cuma baca cache, gak pernah fetch |
| `no-cache` | Gak simpen hasil di cache |
| `standby` | Kayak cache-first tapi gak update otomatis |

### Normalized Cache — Cara Kerja

```typescript
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      keyFields: ['id'],
      fields: {
        posts: {
          merge(existing, incoming) {
            return [...(existing || []), ...incoming];
          },
        },
      },
    },
    Query: {
      fields: {
        users: {
          read(existing) {
            return existing || [];
          },
        },
      },
    },
  },
});
```

Cache Apollo = **normalized** — setiap object disimpan flat berdasarkan `__typename + id`. Query yang berbeda bisa share data yang sama tanpa redudansi.

### Cache Persistence

Simpen cache ke localStorage biar gak hilang pas reload:

```bash
npm install @apollo/client-cache-persistence
```

```typescript
import { persistCache, LocalStorageWrapper } from '@apollo/client-cache-persistence';

const cache = new InMemoryCache();

async function initClient() {
  await persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    maxSize: 1048576,
  });

  const client = new ApolloClient({ cache, link: httpLink });
  return client;
}
```

### React Integration — useQuery & useMutation

```typescript
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers {
    users { id name email }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id name email
    }
  }
`;

function UserList() {
  const { loading, error, data } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER, {
    update(cache, { data: { createUser } }) {
      const existing = cache.readQuery({ query: GET_USERS });
      if (existing) {
        cache.writeQuery({
          query: GET_USERS,
          data: { users: [...existing.users, createUser] },
        });
      }
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.users.map((user: any) => (
        <div key={user.id}>{user.name} — {user.email}</div>
      ))}
      <button onClick={() => createUser({ variables: { name: 'Budi', email: 'budi@test.com' } })}>
        Add User
      </button>
    </div>
  );
}
```

### Optimistic UI

Update UI seolah-olah mutation berhasil, sebelum server response:

```typescript
const [addComment] = useMutation(ADD_COMMENT, {
  optimisticResponse: {
    addComment: {
      id: 'temp-id',
      text: commentText,
      author: { id: currentUser.id, name: currentUser.name },
      __typename: 'Comment',
    },
  },
  update(cache, { data }) {
    const existing = cache.readQuery({ query: GET_COMMENTS });
    cache.writeQuery({
      query: GET_COMMENTS,
      data: { comments: [...(existing?.comments || []), data.addComment] },
    });
  },
});
```

Kalo server error, Apollo otomatis rollback — optimistic entry dihapus, error muncul.

### Codegen — TypeScript dari Schema

Biar tipe TypeScript sinkron dengan schema GraphQL, pake GraphQL Code Generator:

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```

```yaml
# codegen.yml
schema: 'http://localhost:4000/graphql'
documents: './src/**/*.graphql'
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.yml",
    "codegen:watch": "graphql-codegen --config codegen.yml --watch"
  }
}
```

Jalanin `npm run codegen`. Hasilnya: hook React yang **fully-typed**:

```typescript
import { useGetUsersQuery, useCreateUserMutation } from '../generated/graphql';

function UserList() {
  // Langsung typed — data.users[i].name tahu itu string
  const { data, loading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();

  return <button onClick={() => createUser({ variables: { name: 'Budi', email: 'budi@test.com' } })}>
    Add
  </button>;
}
```

### React Provider

```typescript
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
```

## Schema Design Patterns

### Pagination — Connection Pattern (Relay)

Jangan pake `[Post!]!` langsung — pake Connection pattern biar bisa pagination + metadata:

```graphql
type Query {
  posts(first: Int!, after: String): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

type PostEdge {
  cursor: String!
  node: Post!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### Input Types buat Mutation

```graphql
input CreateUserInput {
  name: String!
  email: String!
  avatar: Upload
}

input UpdateUserInput {
  name: String
  email: String
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User
}
```

### Error Handling di Mutation — Union Return

Daripada throw error, balikin union type:

```graphql
union CreateUserResult = User | UserValidationError

type UserValidationError {
  field: String!
  message: String!
}
```

```typescript
Mutation: {
  createUser: (_: unknown, args: { input: { name: string; email: string } }) => {
    if (!args.input.email.includes('@')) {
      return { __typename: 'UserValidationError', field: 'email', message: 'Email tidak valid' };
    }
    const user = { id: '2', ...args.input };
    users.push(user);
    return { __typename: 'User', ...user };
  },
},
```

## Latihan

1. Tambahin tipe `Post` ke schema dengan field: `id`, `title`, `content`, `authorId`. Tambah query `posts` dan `post(id)`. Tambah mutation `createPost`. Tulis schema SDL lengkap + resolvers TypeScript.

2. Bikin query `searchUsers(keyword: String!): [User!]!` yang filter user berdasarkan name/kandungan keyword. Case-insensitive. Tulis resolver dan contoh query GraphQL.

3. Tambah mutation `updateUser(id: ID!, name: String, email: String): User` buat partial update. Kalo user gak ditemuin, throw `GraphQLError` (import dari `graphql`). Tulis kode.

|4. Setup Apollo Server dengan Express dan tambah REST endpoint `/health` di Express yang return `{ status: "ok" }`. Gabung di server `index.ts` yang sama. Tulis full file.

5. **Apollo Client Setup:** Setup Apollo Client di React app dengan InMemoryCache. Bikin komponen `PostList` yang fetch posts pake `useQuery` dan `useMutation` buat create post. Pastikan cache update otomatis setelah create. Tulis full component code.

6. **Codegen Integration:** Setup GraphQL Code Generator di project yang sama. Generate types dari schema. Tulis ulang `PostList` component pake generated hooks (`useGetPostsQuery`, `useCreatePostMutation`). Tulis codegen config + component code.

7. **Optimistic UI:** Implementasi optimistic response di mutation `createPost`. Tampilkan post baru di UI sebelum server konfirmasi. Kalo server error, rollback otomatis. Tulis mutation dengan optimisticResponse + update function.

8. **Connection Pagination:** Ubah query `posts` jadi Connection pattern (Relay). Tambah field `first` dan `after`. Implementasi `pageInfo` dengan `hasNextPage`. Tulis schema + resolver + contoh query pagination.
