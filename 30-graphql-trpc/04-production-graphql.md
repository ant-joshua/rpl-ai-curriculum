# 30.4 Production GraphQL

## Federation (Apollo Federation)

Federation = GraphQL gateway yang gabungin beberapa **subgraph** jadi satu **supergraph**. Cocok buat microservices.

### Arsitektur

```
         ┌──────────────┐
         │   Gateway     │ ← supergraph schema
         │ (Apollo Router)│
         └──┬────┬────┬──┘
            │    │    │
     ┌──────┴┐ ┌─┴───┐ ┌┴──────┐
     │ Users │ │Posts│ │Comments│
     │Service│ │Svc  │ │ Svc   │
     └───────┘ └─────┘ └───────┘
```

### Setup Subgraph (`users-subgraph`)

```bash
npm install @apollo/subgraph @apollo/server express graphql
```

```typescript
import { buildSubgraphSchema } from '@apollo/subgraph';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';

const typeDefs = `#graphql
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0",
          import: ["@key", "@shareable"])

  type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String! @shareable
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }
`;

const resolvers = {
  User: {
    __resolveReference(ref: { id: string }) {
      return users.find(u => u.id === ref.id);
    },
  },
  Query: {
    users: () => users,
    user: (_: unknown, args: { id: string }) =>
      users.find(u => u.id === args.id),
  },
};

const schema = buildSubgraphSchema({ typeDefs, resolvers });

async function start() {
  const app = express();
  const server = new ApolloServer({ schema });
  await server.start();
  app.use('/graphql', cors(), express.json(), expressMiddleware(server));
  app.listen(4001, () => console.log('Users subgraph at :4001'));
}
start();
```

### Setup Subgraph (`posts-subgraph`)

```typescript
const typeDefs = `#graphql
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.0",
          import: ["@key", "@shareable", "@external", "@requires"])

  type User @key(fields: "id") {
    id: ID!
    posts: [Post!]!
  }

  type Post @key(fields: "id") {
    id: ID!
    title: String!
    content: String
    authorId: String! @external
    author: User! @requires(fields: "authorId")
  }

  type Query {
    posts: [Post!]!
    post(id: ID!): Post
  }
`;

const resolvers = {
  User: {
    posts: (user: { id: string }) =>
      posts.filter(p => p.authorId === user.id),
  },
  Post: {
    __resolveReference(ref: { id: string }) {
      return posts.find(p => p.id === ref.id);
    },
    author: (post: { authorId: string }) => ({ __typename: 'User', id: post.authorId }),
  },
  Query: {
    posts: () => posts,
    post: (_: unknown, args: { id: string }) =>
      posts.find(p => p.id === args.id),
  },
};
```

### Gateway (`gateway`)

```bash
npm install @apollo/gateway @apollo/server
```

```typescript
import { ApolloGateway } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://localhost:4001/graphql' },
      { name: 'posts', url: 'http://localhost:4002/graphql' },
    ],
  }),
});

const server = new ApolloServer({ gateway });

async function start() {
  const app = express();
  await server.start();
  app.use('/graphql', express.json(), expressMiddleware(server));
  app.listen(4000, () => console.log('Gateway at :4000'));
}
start();
```

Query lewat gateway:

```graphql
{
  users {
    name
    posts { title }
  }
}
```

### Federation @shareable & @external

```graphql
# Subgraph A (Users) — define field
type User @key(fields: "id") {
  id: ID!
  name: String!
  email: String! @shareable   # Bisa di-override subgraph lain
}

# Subgraph B (Posts) — extend User
type User @key(fields: "id") {
  id: ID!
  posts: [Post!]!
}

# Subgraph C (Reviews) — extend lagi
type User @key(fields: "id") {
  id: ID!
  @external           # id berasal dari subgraph lain
  reviewCount: Int!
  @requires(fields: "id")
}
```

### Federation dengan Rover CLI

```bash
# Install Rover CLI
curl -sSL https://rover.apollo.dev/nix/latest | sh

# Compose supergraph dari subgraphs
rover supergraph compose --config ./supergraph.yaml > supergraph.graphql

# Contoh supergraph.yaml
federation_version: 2
subgraphs:
  users:
    routing_url: http://localhost:4001/graphql
    schema:
      file: ./users-schema.graphql
  posts:
    routing_url: http://localhost:4002/graphql
    schema:
      file: ./posts-schema.graphql
```

### Federation Error Handling

Gateway otomatis handle partial failure — kalo satu subgraph down, query yang gak butuh subgraph itu tetap jalan:

```graphql
# Kalo posts-subgraph down
# Query ini tetap return users + null untuk posts
{
  users {
    name        # ✅ dari users-subgraph (online)
    posts {     # ❌ null karena posts-subgraph down
      title
    }
  }
}
```

## Load Testing GraphQL

### k6 untuk GraphQL

```bash
# Install k6: https://k6.io/docs/getting-started/installation/
```

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% request di bawah 500ms
  },
};

const query = `
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

export default function () {
  const res = http.post(
    'http://localhost:4000/graphql',
    JSON.stringify({ query }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'no errors': (r) => JSON.parse(r.body).errors === undefined,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
```

Jalanin:

```bash
k6 run graphql-load-test.js
```

### Apollo Studio — Tracing & Metrics

```bash
npm install @apollo/usage-reporting-protobuf
```

```typescript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginUsageReporting({
      sendHeaders: { onlyNames: ['authorization'] },
      sendVariableValues: { all: true },
    }),
  ],
});
```

### Query Complexity Analysis

```bash
npm install graphql-query-complexity
```

```typescript
import { createComplexityLimitRule } from 'graphql-query-complexity';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    createComplexityLimitRule(1000, {
      onCost: (cost) => console.log(`Query cost: ${cost}`),
      formatErrorMessage: (cost) =>
        `Query terlalu kompleks (cost: ${cost}). Maksimum 1000.`,
    }),
  ],
});
```

```graphql
type Query {
  users: [User!]! @cost(complexity: 10)
}

type User {
  id: ID! @cost(complexity: 1)
  name: String! @cost(complexity: 1)
  posts: [Post!]! @cost(complexity: 5)
}
```

## WebSocket Connection Management

### Connection Lifecycle

```typescript
// Server-side WS event handling
const serverCleanup = useServer({
  schema,
  onConnect: async (ctx) => {
    // Verify token pas koneksi
    const token = ctx.connectionParams?.authorization;
    if (!token) {
      // Reject koneksi kalo gak ada token
      return false;
    }
    const user = await verifyToken(token as string);
    ctx.extra = { user };
  },
  onDisconnect(ctx) {
    console.log('Client disconnected');
    // Cleanup resource
  },
  onClose(ctx) {
    console.log('Connection closed');
  },
  keepAlive: 10_000, // Ping tiap 10 detik
}, wsServer);
```

### Subscription Pagination (Event Buffer)

Kalo client disconnect dan reconnect, kasih missed events:

```typescript
const eventBuffer = new Map<string, Post[]>();
const MAX_BUFFER = 50;

Mutation: {
  createPost: (_: unknown, args: { title: string; content: string }, ctx) => {
    const post = { id: String(posts.length + 1), ...args, authorId: ctx.user.id };
    posts.push(post);
    pubsub.publish(POST_CREATED, { postCreated: post });

    // Buffer buat replay
    const userId = ctx.user.id;
    if (!eventBuffer.has(userId)) {
      eventBuffer.set(userId, []);
    }
    const buffer = eventBuffer.get(userId)!;
    buffer.push(post);
    if (buffer.length > MAX_BUFFER) buffer.shift();

    return post;
  },
},

Subscription: {
  missedPosts: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([POST_CREATED]),
      (payload, variables, ctx) => {
        // Kirim missed events kalo ada buffer
        if (variables.replay) {
          const missed = eventBuffer.get(ctx.user.id) || [];
          missed.forEach(p => {
            // Kirim via custom logic
          });
        }
        return true;
      },
    ),
  },
},
```

## Persisted Queries (APQ)

Automatic Persisted Queries = cache query hash, kirim hash instead of full query string. Hemat bandwidth.

```bash
npm install @apollo/server-plugin-response-cache
```

```typescript
import ApolloServerPluginCacheControl from '@apollo/server/plugin/cacheControl';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginCacheControl({ defaultMaxAge: 10 }), // cache 10 detik
  ],
});

// APQ built-in di Apollo Server — otomatis
// Client: pake apollo-link-persisted-queries
```

### Client APQ

```bash
npm install apollo-link-persisted-queries @apollo/client
```

```typescript
import { createPersistedQueryLink } from 'apollo-link-persisted-queries';
import { HttpLink, ApolloClient, InMemoryCache } from '@apollo/client';

const link = createPersistedQueryLink().concat(
  new HttpLink({ uri: 'http://localhost:4000/graphql' }),
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

// Request pertama: kirim query + hash
// Request berikutnya: kirim hash doang
// Kalo server gak punya hash, server minta client kirim ulang query
```

## Caching

### Response cache plugin

```typescript
import responseCachePlugin from '@apollo/server-plugin-response-cache';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [responseCachePlugin()],
});

// Cache individual field
const resolvers = {
  Post: {
    title: (parent: Post) => parent.title, // default cache
  },
  Query: {
    posts: (_, __, { cacheControl }) => {
      cacheControl.setCacheHint({ maxAge: 30 });
      return posts;
    },
  },
};
```

### CDN-level caching (full response)

GraphQL response cache di CDN butuh `GET` request:

```typescript
// Enable GET queries
server.use(
  '/graphql',
  expressMiddleware(server, {
    // ...
  }),
);

// Client: kirim query via GET
const link = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  useGETForQueries: true,
});
```

## Rate Limiting

### graphql-rate-limit

```bash
npm install graphql-rate-limit
```

```typescript
import { createRateLimitDirective } from 'graphql-rate-limit';
import { makeExecutableSchema } from '@graphql-tools/schema';

const rateLimitDirective = createRateLimitDirective({
  // store: Redis store (default: in-memory)
});

const typeDefs = `#graphql
  directive @rateLimit(
    max: Int!,
    window: String!,
    message: String = "Too many requests"
  ) on FIELD_DEFINITION

  type Query {
    users: [User!]! @rateLimit(max: 10, window: "1m")
    user(id: ID!): User @rateLimit(max: 30, window: "1m")
  }
`;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    rateLimit: rateLimitDirective,
  },
});
```

### Global rate limiting (Express middleware)

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60_000, // 1 menit
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, coba lagi nanti' },
});

app.use('/graphql', limiter, expressMiddleware(server));
```

### Per-user rate limiting

```typescript
const limiter = rateLimit({
  windowMs: 60_000,
  max: (req) => {
    // User premium: 200 request/menit
    // User gratis: 50 request/menit
    return req.user?.plan === 'premium' ? 200 : 50;
  },
  keyGenerator: (req) => req.user?.id || req.ip,
});
```

## Security

### Depth limiting

Batasi kedalaman query biar gak ada nested abuse.

```bash
npm install graphql-depth-limit
```

```typescript
import depthLimit from 'graphql-depth-limit';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5)], // max 5 level nested
});
```

### Query cost analysis

Estimasi cost tiap query, reject kalo kebesaran.

```bash
npm install graphql-query-cost
```

```typescript
import { createQueryCostDirective } from 'graphql-query-cost';

const typeDefs = `#graphql
  directive @cost(value: Int!) on FIELD_DEFINITION

  type User {
    id: ID!
    name: String! @cost(value: 1)
    email: String! @cost(value: 2)  # lebih expensive
    posts: [Post!]! @cost(value: 5) # cost tinggi
  }

  type Query {
    users: [User!]! @cost(value: 10)
  }
`;
```

### Aliases & Batched queries

Batasi jumlah aliases biar gak abuse.

```typescript
import { createAliasLimitRule } from 'graphql-disable-introspection';

const server = new ApolloServer({
  validationRules: [
    (context) => ({
      OperationDefinition(node) {
        const aliasCount = countAliases(node);
        if (aliasCount > 10) {
          context.reportError(
            new GraphQLError('Max 10 aliases per query', { nodes: node }),
          );
        }
      },
    }),
  ],
});
```

### Introspection guard

Matikan introspection di production biar orang gak bisa dump schema.

```typescript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
});
```

Atau pake plugin:

```typescript
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';

const server = new ApolloServer({
  introspection: false,
  plugins: [
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginInlineTrace()
      : undefined,
  ].filter(Boolean),
});
```

### CSRF protection

```typescript
app.use('/graphql', (req, res, next) => {
  if (req.method === 'POST') {
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('application/json')) {
      return res.status(400).json({ error: 'Bad content-type' });
    }
  }
  next();
});
```

### Whitelist persisted queries only

Pake list hash yang di-allow, reject query unknown.

```typescript
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';

const persistedQueries = new Set([
  'sha256hash1...',
  'sha256hash2...',
]);

const server = new ApolloServer({
  plugins: [
    {
      async requestDidStart() {
        return {
          async didResolveOperation({ request }) {
            const hash = request.extensions?.persistedQuery?.sha256Hash;
            if (hash && !persistedQueries.has(hash)) {
              throw new GraphQLError('Persisted query not found');
            }
          },
        };
      },
    },
  ],
});
```

## Latihan

1. Bikin 2 subgraph: `orders-subgraph` (type Order @key) dan `products-subgraph` (type Product @key). Order punya field `product: Product!` yang refer ke produk. Tulis schema + resolvers + gateway yang compose keduanya. Test query: `{ orders { id product { name price } } }`.

2. Setup APQ di server + client. Kirim 3 query, pastikan request kedua cuma kirim hash (cek network tab / logs). Tulis server config + client config + contoh cURL request pertama dan kedua.

3. Implementasi rate limiting dengan express-rate-limit: 50 request/menit per IP. Tapi kalo user pake JWT dengan role 'premium', dapet 200 request/menit. Tulis middleware + keyGenerator function.

4. Setup security layer: depth limit (max 4), matikan introspection di production, alias limit (max 5), CSRF guard. Tulis Apollo Server config lengkap dengan semua validation rules dan plugins.

5. **Federation Multi-Service:** Bikin 3 subgraph: `orders`, `products`, `users`. Order punya relasi ke product dan user. Compose supergraph pake Rover CLI. Tulis schema + resolvers + gateway config + compose command.

6. **Load Testing dengan k6:** Setup k6 untuk test endpoint `user(id: ID!)` dengan 100 concurrent users. Ukur P50, P95, P99 latency. Tulis test script + hasil. Identifikasi bottleneck kalo ada.

7. **Query Complexity:** Implementasi query complexity analysis dengan `graphql-query-complexity`. Set limit 500. Test query sederhana (cost kecil) vs query nested dalam (cost besar). Tulis konfigurasi + contoh hasil.

8. **WebSocket Lifecycle:** Setup onConnect handler yang verify JWT sebelum koneksi subscription diizinkan. Tambah keepAlive 15 detik. onDisconnect cleanup. Tulis server config + client yang kirim token di connectionParams.

9. **Apollo Studio Tracing:** Setup Apollo usage reporting ke Apollo Studio. Kirim header authorization (tanpa value) dan variable values. Analisis performa query di dashboard. Tulis plugin config + langkah setup Apollo Studio.

10. **Supergraph dengan Rover:** Buat 2 subgraph (users, posts) + gateway. Compose supergraph.yaml + generate supergraph.graphql. Deploy gateway pake supergraph file statis (bukan IntrospectAndCompose). Tulis Rover CLI commands + gateway config.
