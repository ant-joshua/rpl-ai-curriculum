# 30.3 tRPC

## Apa itu tRPC?

tRPC = **TypeScript Remote Procedure Call**. Bikin API endpoint type-safe **tanpa schema generation** atau codegen. Tipe TypeScript jadi source of truth — frontend dan backend pake tipe yang sama.

### GraphQL vs tRPC

| Aspek | GraphQL | tRPC |
|-------|---------|------|
| **Paradigma** | Query language — client specify shape | RPC — call function server langsung |
| **Type safety** | Codegen dari SDL | ✅ Native TypeScript — gak perlu codegen |
| **Learning curve** | Tinggi (SDL, resolvers, N+1) | Rendah — kayak call fungsi biasa |
| **Flexibility** | Client request field apa aja | Server tentuin return shape |
| **Caching** | Susah (perlu APQ/ persisted queries) | ✅ react-query bawaan |
| **Real-time** | Subscriptions (WebSocket) | Subscriptions via `@trpc/server` |
| **Public API** | ✅ Bagus buat public / third-party | ❌ Kurang cocok — butuh REST/GraphQL |
| **Bundle size** | Besar (graphql, Apollo) | Kecil (~4KB gzipped client) |

**Kapan pake apa?** GraphQL → public API / banyak client diverse. tRPC → internal monorepo / full-stack TypeScript.

## Setup tRPC

```bash
mkdir trpc-app && cd trpc-app
npm init -y
npm install @trpc/server @trpc/client zod
npm install express @types/express
npm install -D typescript @types/node ts-node nodemon
npx tsc --init
```

### 1. Define context (`src/context.ts`)

```typescript
import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  let user: { id: string; name: string } | null = null;

  if (token) {
    // verify JWT, get user
    user = { id: '1', name: 'Midory' };
  }

  return { req, res, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;
```

### 2. Define procedures & router (`src/router.ts`)

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

// Helper procedures
const publicProcedure = t.procedure;
const authedProcedure = t.procedure.use((opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Login dulu bro',
    });
  }
  return opts.next();
});

// Types
interface User {
  id: string;
  name: string;
  email: string;
}
const users: User[] = [
  { id: '1', name: 'Midory', email: 'midory@example.com' },
];

// Router
export const appRouter = t.router({
  // ---- QUERIES ----
  userList: publicProcedure.query(() => {
    return users;
  }),

  userById: publicProcedure
    .input(z.string())
    .query(({ input }) => {
      const user = users.find(u => u.id === input);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
      return user;
    }),

  // ---- MUTATIONS ----
  userCreate: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
    )
    .mutation(({ input }) => {
      const newUser: User = {
        id: String(users.length + 1),
        ...input,
      };
      users.push(newUser);
      return newUser;
    }),

  userDelete: authedProcedure
    .input(z.string())
    .mutation(({ input }) => {
      const idx = users.findIndex(u => u.id === input);
      if (idx === -1) throw new TRPCError({ code: 'NOT_FOUND' });
      users.splice(idx, 1);
      return { success: true };
    }),

  // ---- SUBSCRIPTIONS ----
  userCreated: t.procedure.subscription(() => {
    // polling / event emitter pattern
    return {
      next: async () => {
        await new Promise(r => setTimeout(r, 5000)); // poll tiap 5s
        return users[users.length - 1];
      },
    };
  }),
});

export type AppRouter = typeof appRouter;
```

### 3. Server (`src/server.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './context';

const app = express();
app.use(cors());

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(4000, () => {
  console.log('tRPC server at http://localhost:4000/trpc');
});
```

### 4. Run

```bash
npx ts-node src/server.ts
```

Test pake curl:

```bash
curl http://localhost:4000/trpc/userList
curl -X POST http://localhost:4000/trpc/userById -H 'Content-Type: application/json' -d '{"0": "1"}'
curl -X POST http://localhost:4000/trpc/userCreate -H 'Content-Type: application/json' -d '{"0": {"name":"Test","email":"test@test.com"}}'
```

## Procedures Detail

### Query — GET data (idempotent)

```typescript
productById: publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input, ctx }) => {
    return products.find(p => p.id === input.id);
  }),
```

### Mutation — POST/PUT/DELETE data

```typescript
productUpdate: authedProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().optional(),
    price: z.number().positive().optional(),
  }))
  .mutation(({ input, ctx }) => {
    const idx = products.findIndex(p => p.id === input.id);
    if (idx === -1) throw new TRPCError({ code: 'NOT_FOUND' });
    products[idx] = { ...products[idx], ...input };
    return products[idx];
  }),
```

### Subscription — real-time

```typescript
import { EventEmitter } from 'events';
const ee = new EventEmitter();

// di mutation
ee.emit('update', newProduct);

// subscription
productUpdates: publicProcedure.subscription(() => {
  return {
    next: async () => {
      return new Promise((resolve) => {
        ee.once('update', resolve);
      });
    },
  };
}),
```

## Middleware

### Logging middleware

```typescript
const loggerMiddleware = t.middleware(async (opts) => {
  const start = Date.now();
  const result = await opts.next();
  const duration = Date.now() - start;
  console.log(`[${opts.type}] ${opts.path} — ${duration}ms`);
  return result;
});

const loggedProcedure = t.procedure.use(loggerMiddleware);
```

### Validation middleware

```typescript
const adminMiddleware = t.middleware(async (opts) => {
  if (opts.ctx.user?.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return opts.next();
});

const adminProcedure = t.procedure.use(adminMiddleware);
```

### Middleware Composition

Middleware bisa di-chain — urutan eksekusi sesuai urutan `.use()`:

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

// 1. Logger — jalan duluan
const loggerMiddleware = t.middleware(async (opts) => {
  console.log(`[${opts.type}] ${opts.path} started`);
  const start = Date.now();
  const result = await opts.next();
  console.log(`[${opts.type}] ${opts.path} finished in ${Date.now() - start}ms`);
  return result;
});

// 2. Auth — cek token
const authMiddleware = t.middleware(async (opts) => {
  const { user } = opts.ctx;
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Login dulu bro' });
  }
  return opts.next({ ctx: { ...opts.ctx, user } });
});

// 3. Role check
const roleMiddleware = (role: string) =>
  t.middleware(async (opts) => {
    if (opts.ctx.user?.role !== role) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    return opts.next();
  });

// Composed procedure — chain 3 middleware
const adminProcedure = t.procedure
  .use(loggerMiddleware)
  .use(authMiddleware)
  .use(roleMiddleware('ADMIN'));

// Chain juga bisa di route level
const adminRouter = t.router({
  deleteUser: adminProcedure
    .input(z.string())
    .mutation(({ input, ctx }) => {
      // ctx.user is guaranteed to be Admin here
      return deleteUser(input);
    }),

  getAllLogs: adminProcedure.query(() => {
    return fetchLogs();
  }),
});
```

### Middleware bikin Context Baru

Middleware bisa **nambah** field ke context:

```typescript
const authMiddleware = t.middleware(async (opts) => {
  const token = opts.ctx.req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const user = await verifyToken(token);

  // Return context baru dengan field tambahan
  return opts.next({
    ctx: {
      ...opts.ctx,
      user, // sekarang user ada di context
    },
  });
});

// Procedure yang make middleware ini bisa akses ctx.user
const authedProcedure = t.procedure.use(authMiddleware);

const userRouter = t.router({
  myProfile: authedProcedure.query(({ ctx }) => {
    return ctx.user; // fully typed!
  }),
});
```

### Middleware Error Handling

Kalo middleware throw, semua procedure di bawahnya gak jalan:

```typescript
const rateLimitMiddleware = t.middleware(async (opts) => {
  const ip = opts.ctx.req.ip;
  const key = `ratelimit:${ip}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60); // expire 1 menit
  }

  if (count > 100) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Kecepatan request kegedean, coba lagi nanti',
    });
  }

  return opts.next();
});
```

## tRPC + WebSocket Subscriptions

tRPC juga support real-time subscriptions via WebSocket — beda cara dari GraphQL subscriptions.

### Server — Subscription dengan EventEmitter

```typescript
import { EventEmitter } from 'events';
import { initTRPC, TRPCError } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { z } from 'zod';

const ee = new EventEmitter();

// Event types
interface PostEvent {
  type: 'created' | 'updated' | 'deleted';
  post: { id: string; title: string; content: string };
}

export const postRouter = t.router({
  // Mutation — trigger event
  createPost: publicProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(({ input }) => {
      const post = { id: String(Math.random()), ...input };
      ee.emit('post:change', { type: 'created', post } as PostEvent);
      return post;
    }),

  // Subscription — dengerin event
  onPostChange: publicProcedure.subscription(() => {
    return observable<PostEvent>((emit) => {
      const handler = (event: PostEvent) => {
        emit.next(event);
      };

      ee.on('post:change', handler);

      // Cleanup — penting biar gak memory leak
      return () => {
        ee.off('post:change', handler);
      };
    });
  }),

  // Subscription dengan filter di client
  onPostCreated: publicProcedure.subscription(() => {
    return observable<PostEvent['post']>((emit) => {
      const handler = (event: PostEvent) => {
        if (event.type === 'created') {
          emit.next(event.post);
        }
      };

      ee.on('post:change', handler);
      return () => ee.off('post:change', handler);
    });
  }),

  // Subscription per-user (butuh auth)
  userNotification: authedProcedure
    .input(z.object({ userId: z.string() }))
    .subscription(({ input, ctx }) => {
      return observable((emit) => {
        const handler = (notification: { userId: string; message: string }) => {
          // Filter — cuma kirim kalo buat user ini
          if (notification.userId === ctx.user.id) {
            emit.next(notification);
          }
        };

        ee.on('notification', handler);
        return () => ee.off('notification', handler);
      });
    }),
});
```

### Server — WebSocket Adapter

```bash
npm install @trpc/server ws
```

```typescript
// server.ts
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import ws from 'ws';
import { appRouter } from './router';
import { createContext } from './context';

const { server, listen } = createHTTPServer({
  router: appRouter,
  createContext,
});

// Attach WebSocket
const wss = new ws.Server({ server });
const handler = applyWSSHandler({ wss, router: appRouter, createContext });

server.on('close', () => {
  handler.broadcastReconnectNotification();
});

listen(4000);
```

### Client — Subscription

```typescript
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, splitLink, wsLink } from '@trpc/client';
import type { AppRouter } from '../server/router';
import { createWSClient } from '@trpc/client';

const wsClient = createWSClient({
  url: 'ws://localhost:4000/trpc',
});

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition(op) {
        // Subscription pake WS, sisanya HTTP
        return op.type === 'subscription';
      },
      true: wsLink({ client: wsClient }),
      false: httpBatchLink({
        url: 'http://localhost:4000/trpc',
      }),
    }),
  ],
});
```

React component:

```typescript
function PostLiveFeed() {
  const [posts, setPosts] = useState<Post[]>([]);

  trpc.onPostChange.useSubscription(undefined, {
    onData(event) {
      if (event.type === 'created') {
        setPosts(prev => [event.post, ...prev]);
      }
    },
    onError(err) {
      console.error('Subscription error:', err);
    },
  });

  return (
    <div>
      {posts.map(p => <div key={p.id}>{p.title}</div>)}
    </div>
  );
}
```

### Subscription Lifecycle

| Event | Trigger | Action |
|-------|---------|--------|
| `useSubscription` mount | Client subscribe | Server mulai kirim event |
| Browser reconnect | WS reconnect otomatis | Server resubscribe |
| `onError` | WS disconnect / error | Retry logic (default 3x) |
| Component unmount | Cleanup callback jalan | Server stop kirim event |
| `broadcastReconnectNotification` | Server restart | Semua client reconnect |

## Error Handling Patterns

### Structured Error Response

```typescript
const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      code: error.code,
      httpStatus: getHTTPStatus(error.code),
      timestamp: new Date().toISOString(),
      // Validation errors detail
      zodError:
        error.code === 'BAD_REQUEST'
          ? error.cause?.issues
          : undefined,
    },
  }),
});

function getHTTPStatus(code: TRPC_ERROR_CODE_KEY): number {
  const map: Record<string, number> = {
    PARSE_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    METHOD_NOT_SUPPORTED: 405,
    TOO_MANY_REQUESTS: 429,
    CLIENT_CLOSED_REQUEST: 499,
    INTERNAL_SERVER_ERROR: 500,
  };
  return map[code] || 500;
}
```

### Custom Error Classes

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: TRPC_ERROR_CODE_KEY,
    public httpStatus: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Di procedure
userUpdate: authedProcedure
  .input(z.object({ id: z.string(), email: z.string().email() }))
  .mutation(({ input }) => {
    const existing = users.find(u => u.email === input.email);
    if (existing && existing.id !== input.id) {
      throw new AppError('Email sudah terdaftar', 'CONFLICT', 409);
    }
    return updateUser(input.id, { email: input.email });
  }),
```

## Load Testing tRPC

### Artillery Quick Test

```bash
npm install -D artillery
```

```yaml
# artillery/trpc-test.yml
config:
  target: "http://localhost:4000"
  phases:
    - duration: 30
      arrivalRate: 5
      name: "Warm up"
    - duration: 60
      arrivalRate: 20
      name: "Load test"
  defaults:
    headers:
      Content-Type: "application/json"

scenarios:
  - name: "Query user list"
    flow:
      - post:
          url: "/trpc/userList"
      - think: 2
      - post:
          url: "/trpc/userById"
          json:
            "0": "1"
```

Jalanin:

```bash
npx artillery run artillery/trpc-test.yml
```

### k6 Quick Test (populer buat load testing)

```bash
npm install -D webpack
# Kalo pake k6 langsung:
# brew install k6 (Mac) atau download dari k6.io
```

```javascript
// k6-trpc.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // ramping ke 20 users
    { duration: '1m', target: 20 },   // stay 20 users
    { duration: '30s', target: 0 },   // turun
  ],
};

export default function () {
  const url = 'http://localhost:4000/trpc/userList';

  const res = http.post(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

Jalanin:

```bash
k6 run k6-trpc.js
```

## tRPC vs React Query Integration

tRPC built-in sama React Query (TanStack Query). Ini bedanya pake tRPC vs manual React Query:

| Aspek | Manual React Query | tRPC + React Query |
|-------|-------------------|-------------------|
| Hook definition | Define sendiri `useQuery` | Auto dari `trpc.xyz.useQuery()` |
| Type safety | Manual types | ✅ Full inferred types |
| Caching | Configure sendiri | ✅ Auto dari react-query |
| Invalidation | `queryClient.invalidateQueries` | ✅ `trpc.useUtils().userList.invalidate()` |
| Optimistic update | Manual | ✅ Built-in via `onMutate` |

### Utility API — Invalidate & Refetch

```typescript
function UserManager() {
  const utils = trpc.useUtils();

  const createUser = trpc.userCreate.useMutation({
    onSuccess: () => {
      // Invalidate semua query yang related
      utils.userList.invalidate();
      utils.userById.invalidate();
    },
  });

  const deleteUser = trpc.userDelete.useMutation({
    onSuccess: () => {
      // Refetch tanpa nunggu
      utils.userList.refetch();
    },
  });

  // Optimistic update
  const updateUser = trpc.userUpdate.useMutation({
    onMutate: async (newData) => {
      // Cancel outgoing fetches
      await utils.userList.cancel();
      // Snapshot previous value
      const prev = utils.userList.getData();
      // Optimistic update
      utils.userList.setData(undefined, (old) =>
        old?.map(u => u.id === newData.id ? { ...u, ...newData } : u)
      );
      return { prev };
    },
    onError: (err, newData, context) => {
      // Rollback
      utils.userList.setData(undefined, context?.prev);
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.userList.invalidate();
    },
  });
}
```

## React Integration

```bash
npm install @trpc/react-query @trpc/client @tanstack/react-query
```

### Client setup (`src/client.ts`)

```typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/router';

export const trpc = createTRPCReact<AppRouter>();
```

### Provider (`src/App.tsx`)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from './client';

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:4000/trpc',
          headers: () => ({
            authorization: `Bearer ${localStorage.getItem('token')}`,
          }),
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <UserList />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Component

```typescript
function UserList() {
  // Query — fully type-safe
  const { data: users, isLoading } = trpc.userList.useQuery();

  // Mutation
  const createUser = trpc.userCreate.useMutation({
    onSuccess: () => queryClient.invalidateQueries(['userList']),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {users?.map(u => (
        <div key={u.id}>{u.name} — {u.email}</div>
      ))}
      <button onClick={() => createUser.mutate({ name: 'New', email: 'new@test.com' })}>
        Add User
      </button>
    </div>
  );
}
```

## Error Handling

### TRPCError — built-in error codes

```typescript
throw new TRPCError({ code: 'NOT_FOUND', message: 'User gak ada' });
```

| Code | HTTP Status | Kapan |
|------|-------------|-------|
| `PARSE_ERROR` | 400 | Input JSON invalid |
| `BAD_REQUEST` | 400 | Zod validation fail |
| `UNAUTHORIZED` | 401 | Gak login |
| `FORBIDDEN` | 403 | Login tapi gak punya akses |
| `NOT_FOUND` | 404 | Resource gak ditemuin |
| `CONFLICT` | 409 | Duplicate data |
| `PRECONDITION_FAILED` | 412 | Prasyarat gak terpenuhi |
| `PAYLOAD_TOO_LARGE` | 413 | Input terlalu besar |
| `METHOD_NOT_SUPPORTED` | 405 | Method salah |
| `TOO_MANY_REQUESTS` | 429 | Rate limit |
| `CLIENT_CLOSED_REQUEST` | 499 | Client cancel |
| `INTERNAL_SERVER_ERROR` | 500 | Error server |

### Error formatting

```typescript
const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      code: error.code,
      timestamp: new Date().toISOString(),
    },
  }),
});
```

### Client-side error handling

```typescript
const mutation = trpc.userCreate.useMutation({
  onError: (error) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    toast.error(error.message);
  },
});
```

## Latihan

1. Bikin tRPC router untuk product CRUD: `productList`, `productById`, `productCreate`, `productUpdate`, `productDelete`. Pake Zod validation: name min 3 chars, price positive, optional description. Tulis router lengkap + procedure definitions.

2. Implementasi logging middleware yang catet: timestamp, procedure path, input size, duration. Tulis middleware + contoh pakenya di 2 procedure.

3. Bikin React component `ProductManager` pake tRPC: query list produk, form create product (name + price + description), tombol delete tiap item. Pake `useMutation` dengan `onSuccess` invalidate query. Tulis full component code.

4. Tambah subscription `productPriceUpdates` yang emit event tiap ada perubahan price. Gunakan EventEmitter. Tulis subscription procedure + client-side `useSubscription` hook.

5. **Middleware Chain:** Bikin 3 middleware: logger, auth, rate-limiter (max 10 request/menit per user). Chain jadi satu `protectedProcedure`. Implementasi di route `userList` dan `userCreate`. Tulis middleware chain + procedure usage.

6. **WebSocket Subscription:** Setup tRPC server dengan WebSocket adapter (ws). Bikin subscription `orderUpdates` yang emit tiap kali order status berubah. Client subscribe dan tampilkan toast. Tulis server adapter + client splitLink + React component.

7. **Error Formatter Custom:** Bikin error formatter yang nambah field `timestamp`, `httpStatus`, dan validation error detail dari Zod. Test dengan input invalid dan lihat response format. Tulis errorFormatter + contoh error response.

8. **Load Testing:** Setup k6 atau Artillery buat test endpoint `userList` dengan 50 concurrent users. Ukur response time P50, P95, P99. Tulis test script + hasil analisis. Identifikasi bottleneck kalo ada.

9. **Optimistic Update:** Implementasi optimistic update di mutation `updateUser`. Pake `useUtils()` buat cancel outgoing fetches, snapshot previous data, set optimistic data, rollback kalo error. Tulis full component code.

10. **tRPC vs React Query Comparison:** Ambil satu fitur (misal: user CRUD). Implementasi 2 versi: (1) pake React Query manual + fetch, (2) pake tRPC + react-query. Bandingkan baris kode, type safety, dan developer experience. Tulis kedua versi lengkap.
