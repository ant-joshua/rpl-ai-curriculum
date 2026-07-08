# 30.2 GraphQL Advanced

## Resolvers Chain

Resolver bisa return object, dan GraphQL lanjut resolve field-child.

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

const users: User[] = [
  { id: '1', name: 'Midory', email: 'midory@example.com' },
];
const posts: Post[] = [
  { id: '1', title: 'GraphQL 101', content: '...', authorId: '1' },
];

export const resolvers = {
  Query: {
    users: (): User[] => users,
    user: (_: unknown, args: { id: string }) =>
      users.find(u => u.id === args.id),
    posts: (): Post[] => posts,
  },

  // Resolver khusus buat field di tipe User
  User: {
    posts: (parent: User): Post[] =>
      posts.filter(p => p.authorId === parent.id),
  },

  // Resolver khusus buat field di tipe Post
  Post: {
    author: (parent: Post): User | undefined =>
      users.find(u => u.id === parent.authorId),
  },
};
```

Resolver signature: `fieldName(parent, args, contextValue, info)`.

- `parent` — hasil return dari resolver parent (root buat Query/Mutation)
- `args` — arguments dari query
- `contextValue` — shared context (bisa diisi di server setup)
- `info` — metadata query (jarang dipake)

## N+1 Problem & DataLoader

### Masalah

Query ini trigger **N+1 query** ke database:

```graphql
{
  posts {
    title
    author { name }   // 1 query per post = N queries
  }
}
```

Resolver `Post.author` jalan per post — kalo 100 post, 100 query database.

### Solusi: DataLoader (batch + cache)

```bash
npm install dataloader
```

```typescript
import DataLoader from 'dataloader';

// Batch function — kumpulin semua ID, query 1x
async function batchUsers(ids: readonly string[]): Promise<User[]> {
  console.log('Batch query:', ids);
  const result = users.filter(u => ids.includes(u.id));
  // Urutkan sesuai urutan ids
  return ids.map(id => result.find(u => u.id === id)!);
}

// Loader instance — taruh di context biar shared per request
const userLoader = new DataLoader(batchUsers);

// Di context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async () => ({
    userLoader: new DataLoader(batchUsers),
  }),
});

// Di resolver — pake loader, bukan find langsung
Post: {
  author: (parent: Post, _: unknown, context: { userLoader: DataLoader<string, User> }) =>
    context.userLoader.load(parent.authorId),
},
```

Sekarang 100 post → 1 query batch. DataLoader juga cache per request.

## Subscriptions (WebSocket)

Subscriptions pake WebSocket buat real-time.

```bash
npm install graphql-ws ws @graphql-yoga/node
```

### Schema

```graphql
type Subscription {
  postCreated: Post!
  userOnline(userId: ID!): Boolean!
}
```

### Server setup (Apollo + WebSocket)

```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = http.createServer(app);

// WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use('/graphql', cors(), express.json(), expressMiddleware(server));

httpServer.listen(4000, () => {
  console.log('Server + WS at ws://localhost:4000/graphql');
});
```

### Resolver Subscription

```typescript
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const POST_CREATED = 'POST_CREATED';

export const resolvers = {
  // ...
  Mutation: {
    createPost: (_: unknown, args: { title: string; content: string }) => {
      const post = { id: String(posts.length + 1), ...args, authorId: '1' };
      posts.push(post);
      pubsub.publish(POST_CREATED, { postCreated: post });
      return post;
    },
  },
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator([POST_CREATED]),
    },
  },
};
```

Test pake Playground:

```graphql
subscription {
  postCreated {
    id
    title
    author { name }
  }
}
```

### Subscription dengan Filter

Kadang client cuma mau dapet event tertentu — pake `subscribe` dengan filter:

```typescript
Subscription: {
  userOnline: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['USER_ONLINE']),
      (payload, variables) => {
        // Cuma kirim kalo userId sesuai
        return payload.userOnline.userId === variables.userId;
      },
    ),
  },
  postCreated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([POST_CREATED]),
      (payload, variables) => {
        // Filter by author
        if (variables.authorId) {
          return payload.postCreated.authorId === variables.authorId;
        }
        return true;
      },
    ),
  },
}
```

`withFilter` import dari `graphql-subscriptions`.

### Subscription Client — Apollo Client

```typescript
import { ApolloClient, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { HttpLink } from '@apollo/client';

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });

const wsLink = new GraphQLWsLink(
  createClient({ url: 'ws://localhost:4000/graphql' }),
);

// Split: kirim via WS kalo subscription, HTTP kalo query/mutation
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

React component:

```typescript
import { gql, useSubscription } from '@apollo/client';

const POST_CREATED_SUB = gql`
  subscription OnPostCreated {
    postCreated {
      id
      title
      author { name }
    }
  }
`;

function NewPostAlert() {
  const { data, loading } = useSubscription(POST_CREATED_SUB);

  useEffect(() => {
    if (data?.postCreated) {
      toast.info(`Post baru: ${data.postCreated.title}`);
    }
  }, [data]);

  return null;
}
```

### PubSub Implementations

| PubSub Engine | Kelebihan | Cocok |
|--------------|-----------|-------|
| `PubSub` (graphql-subscriptions) | Simpel, zero dep | Development, single process |
| `RedisPubSub` | Scale ke multiple process | Production, multi-server |
| `MqttPubSub` | MQTT protocol | IoT / real-time fleet |
| `KafkaPubSub` | Event streaming | Event-driven architecture |

```bash
npm install graphql-redis-subscriptions ioredis
```

```typescript
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const options = {
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
};

export const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});
```

Dengan RedisPubSub, subscription tetap jalan meski server diganti — publish ke Redis, semua subscriber di semua instance server dapet event.

## Auth di GraphQL

### Context-based auth

```typescript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return { user: null };

    try {
      const decoded = jwt.verify(token, SECRET) as { userId: string };
      const user = users.find(u => u.id === decoded.userId);
      return { user };
    } catch {
      return { user: null };
    }
  },
});
```

### Resolver cek auth

```typescript
Query: {
  me: (_: unknown, __: unknown, context: { user: User | null }) => {
    if (!context.user) {
      throw new GraphQLError('Unauthorized', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    return context.user;
  },
},
```

### Custom directive (AuthDirective)

```bash
npm install @graphql-tools/utils
```

```typescript
import { mapSchema, getDirectives, MapperKind } from '@graphql-tools/utils';

function authDirectiveTransformer(schema: GraphQLSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directives = getDirectives(schema, fieldConfig);
      if (directives['auth']) {
        const originalResolver = fieldConfig.resolve;
        fieldConfig.resolve = (source, args, context, info) => {
          if (!context.user) {
            throw new GraphQLError('Unauthorized', {
              extensions: { code: 'UNAUTHENTICATED' },
            });
          }
          return originalResolver?.(source, args, context, info);
        };
      }
      return fieldConfig;
    },
  });
}

// Schema: directive @auth on FIELD_DEFINITION
// type Query { me: User! @auth }
```

## Union & Interface Types

### Interface (shared fields)

```graphql
interface Notification {
  id: ID!
  createdAt: String!
  message: String!
}

type LikeNotification implements Notification {
  id: ID!
  createdAt: String!
  message: String!
  postId: ID!
  likedBy: User!
}

type CommentNotification implements Notification {
  id: ID!
  createdAt: String!
  message: String!
  commentId: ID!
  commenter: User!
}

type Query {
  notifications: [Notification!]!
}
```

Resolver pake `__resolveType`:

```typescript
Notification: {
  __resolveType(obj: { postId?: string; commentId?: string }) {
    if (obj.postId) return 'LikeNotification';
    if (obj.commentId) return 'CommentNotification';
    return null;
  },
},
```

### Union (no shared fields)

```graphql
union SearchResult = User | Post

type Query {
  search(keyword: String!): [SearchResult!]!
}
```

```typescript
SearchResult: {
  __resolveType(obj: { name?: string; title?: string }) {
    if (obj.name) return 'User';
    if (obj.title) return 'Post';
    return null;
  },
},
```

Query pake fragment:

```graphql
query Search($q: String!) {
  search(keyword: $q) {
    ... on User {
      id
      name
    }
    ... on Post {
      id
      title
    }
  }
}
```

## Fragments

Fragments = reusable field sets.

```graphql
fragment UserFields on User {
  id
  name
  email
}

fragment PostFields on Post {
  id
  title
  author {
    ...UserFields
  }
}

query {
  users { ...UserFields }
  posts { ...PostFields }
}
```

### Inline fragments (buat union/interface)

```graphql
query {
  notifications {
    id
    message
    ... on LikeNotification {
      likedBy { name }
    }
    ... on CommentNotification {
      commenter { name }
    }
  }
}
```

## Latihan

1. Tambah DataLoader buat batch-load posts by authorId. Tambah field `User.posts` dan pastikan query `{ users { name posts { title } } }` cuma 2 query database (1 buat users, 1 batch buat posts). Tulis resolvers + DataLoader code.

2. Bikin subscription `postUpdated` dan `postDeleted`. Setiap mutation `updatePost` dan `deletePost` publish ke subscription yang sesuai. Tulis schema, resolvers, dan contoh subscription query.

3. Implementasi auth directive `@auth` yang bisa dipake di field mana aja. Tambah role-based check: `@auth(requires: ADMIN)`. Kalo user gak punya role, throw error. Tulis directive transformer + contoh schema + resolver.

4. Bikin union type `Media = Image | Video` dengan field `id`, `url`, dan field spesifik: Image punya `width` & `height`, Video punya `duration` & `thumbnailUrl`. Tulis query `media: [Media!]!` dan resolvers termasuk `__resolveType`.

5. **Subscription dengan Filter:** Bikin subscription `notificationReceived(userId: ID!)` yang hanya kirim notifikasi ke user tertentu. Pake `withFilter`. Tulis schema, resolvers, filter logic, dan contoh subscription query.

6. **Redis PubSub:** Ganti PubSub in-memory dengan RedisPubSub. Setup Redis connection. Tunjukkan perbedaan kode sebelum dan sesudah pake Redis. Tulis konfigurasi RedisPubSub + example resolver subscription.

7. **Subscription Client React:** Bikin komponen `LiveFeed` yang subscribe ke event `postCreated` via WebSocket. Tampilkan post baru sebagai toast notification. Tulis full component code dengan `useSubscription` hook + split link setup.

8. **Argumen Subscription:** Buat subscription `postByAuthor(authorId: ID!)` yang subscribe ke post baru dari author tertentu. Pake `withFilter` di resolver dan pake variable di client. Tulis resolver + client component.
