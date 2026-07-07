---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/270637/pexels-pho"
footer: "Sesi 03: Trpc"
---

<!-- _class: title -->
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
