---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🚀 Portfolio Project Series"
footer: "Sesi 03: Fullstack App"
---

<!-- _class: title -->
# Sesi 03: Todo App with Auth

> **Project 3 dari 5** — Aplikasi Todo fullstack dengan autentikasi JWT + OAuth Google

---

## 🎯 Tujuan

- Membangun fullstack app dari nol (backend + frontend)
- Implementasi autentikasi JWT (register, login, protected routes)
- Integrasi OAuth Google Login
- CRUD todos dengan relasi ke user
- Filter, search, dan pagination
- Deploy backend ke Railway + frontend ke Vercel

---

## 📋 Deliverable

- Live fullstack app: `https://todo-app-namakamu.vercel.app`
- GitHub repo: `github.com/namakamu/todo-app`
- Backend: Railway, Frontend: Vercel

---

## 🧰 Tech Stack

### Backend

| Teknologi | Kegunaan |
|-----------|----------|
| Express + TypeScript | REST API |
| Prisma + PostgreSQL | Database |
| JWT (jsonwebtoken) | Token-based auth |
| Passport.js + Google Strategy | OAuth Google |
| Zod | Validation |
| bcryptjs | Password hashing |

### Frontend

| Teknologi | Kegunaan |
|-----------|----------|
| React + Vite | UI Framework |
| Tailwind CSS | Styling |
| React Router | Routing |
| React Query / TanStack Query | Data fetching |
| Axios | HTTP client |
| Zustand / Context API | State management |

---

## 🗄️ Database Schema

```
User
├── id: String (UUID)
├── email: String (unique)
├── password: String? (nullable untuk OAuth)
├── name: String
├── avatar: String?
├── googleId: String? (unique)
├── createdAt: DateTime
└── updatedAt: DateTime

Todo
├── id: String (UUID)
├── title: String
├── description: String?
├── status: enum (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
├── priority: enum (LOW, MEDIUM, HIGH)
├── category: String?
├── dueDate: DateTime?
├── userId: String (FK → User)
├── createdAt: DateTime
└── updatedAt: DateTime
```

---

## 📝 Bagian 1: Setup Backend

### Langkah 1.1: Init Project

```bash
mkdir todo-api && cd todo-api
npm init -y
npm install express prisma @prisma/client zod dotenv cors jsonwebtoken bcryptjs passport passport-google-oauth20
npm install -D typescript @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/passport @types/passport-google-oauth20 tsx
npx tsc --init
mkdir -p src/{config,lib,routes,controllers,services,schemas,middlewares,types}
npx prisma init
```

### Langkah 1.2: Prisma Schema

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TodoStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum TodoPriority {
  LOW
  MEDIUM
  HIGH
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String?
  name      String
  avatar    String?
  googleId  String?  @unique
  todos     Todo[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Todo {
  id          String       @id @default(uuid())
  title       String
  description String?
  status      TodoStatus   @default(PENDING)
  priority    TodoPriority @default(MEDIUM)
  category    String?
  dueDate     DateTime?
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

Jalankan migration:

```bash
npx prisma migrate dev --name init
```

### Langkah 1.3: Environment Variables

`.env`:

```env
DATABASE_URL="postgresql://user:***@localhost:5432/todoapp"
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:5173"


---

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"
```

> **Google OAuth Setup:** Buka [Google Cloud Console](https://console.cloud.google.com) → Credentials → OAuth 2.0 Client IDs → Buat Web application dengan authorized redirect URI `http://localhost:3001/api/auth/google/callback`

### Langkah 1.4: Prisma Client & Env Config

`src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default prisma;
```

`src/config/env.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
};
```

### Langkah 1.5: Auth Service

`src/services/auth.service.ts`:

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { env } from '../config/env';

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = this.generateToken(user.id);
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new Error('Email atau password salah');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Email atau password salah');
    }

    const token = this.generateToken(user.id);
    return { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } };
  },

  async loginWithGoogle(profile: { id: string; email: string; name: string; avatar?: string }) {
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: profile.id }, { email: profile.email }] },
    });

    if (user) {
      // Link Google ID jika belum ter-link
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id, avatar: profile.avatar || user.avatar },
        });
      }
    } else {
      // Buat user baru
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.id,
          avatar: profile.avatar,
        },
      });
    }

    const token = this.generateToken(user.id);
    return { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    });
    if (!user) throw new Error('User tidak ditemukan');
    return user;
  },

  generateToken(userId: string) {
    return jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  },
};
```

### Langkah 1.6: Auth Middleware

`src/middlewares/auth.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
};
```

### Langkah 1.7: Auth Routes

`src/routes/auth.routes.ts`:

```typescript
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.get('/me', authMiddleware, authController.getProfile);

export default router;
```

### Langkah 1.8: Auth Controller

`src/controllers/auth.controller.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);
      res.status(201).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  },

  googleAuth: passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),

  googleCallback: (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, async (err: any, profile: any) => {
      if (err || !profile) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }
      try {
        const result = await authService.loginWithGoogle({
          id: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
        });
        // Redirect ke frontend dengan token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.token}`);
      } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }
    })(req, res, next);
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.userId!);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};
```

### Langkah 1.9: Passport Google Strategy

`src/config/passport.ts`:

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
    },
    (_accessToken, _refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

export default passport;
```

### Langkah 1.10: Todo Service

`src/services/todo.service.ts`:

```typescript
import prisma from '../lib/prisma';
import { Prisma, TodoStatus, TodoPriority } from '@prisma/client';

interface GetTodosParams {
  userId: string;
  page: number;
  limit: number;
  status?: TodoStatus;
  priority?: TodoPriority;
  category?: string;
  search?: string;
}

export const todoService = {
  async getAll(params: GetTodosParams) {
    const { userId, page, limit, status, priority, category, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TodoWhereInput = { userId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.todo.count({ where }),
    ]);

    return {
      success: true,
      data: todos,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string, userId: string) {
    const todo = await prisma.todo.findFirst({
      where: { id, userId },
    });
    if (!todo) throw new Error('Todo tidak ditemukan');
    return { success: true, data: todo };
  },

  async create(data: { title: string; description?: string; priority?: TodoPriority; category?: string; dueDate?: string }, userId: string) {
    const todo = await prisma.todo.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        userId,
      },
    });
    return { success: true, data: todo };
  },

  async update(id: string, userId: string, data: Prisma.TodoUpdateInput) {
    const existing = await prisma.todo.findFirst({ where: { id, userId } });
    if (!existing) throw new Error('Todo tidak ditemukan');

    const todo = await prisma.todo.update({ where: { id }, data });
    return { success: true, data: todo };
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.todo.findFirst({ where: { id, userId } });
    if (!existing) throw new Error('Todo tidak ditemukan');

    await prisma.todo.delete({ where: { id } });
    return { success: true, message: 'Todo berhasil dihapus' };
  },

  async getCategories(userId: string) {
    const result = await prisma.todo.groupBy({
      by: ['category'],
      where: { userId, category: { not: null } },
    });
    return { success: true, data: result.map((r) => r.category) };
  },
};
```

### Langkah 1.11: Todo Routes & Controller

`src/routes/todo.routes.ts`:

```typescript
import { Router } from 'express';
import { todoController } from '../controllers/todo.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware); // Semua todo routes butuh auth

router.get('/', todoController.getAll);
router.get('/categories', todoController.getCategories);
router.get('/:id', todoController.getById);
router.post('/', todoController.create);
router.put('/:id', todoController.update);
router.delete('/:id', todoController.delete);

export default router;
```

`src/controllers/todo.controller.ts`:

```typescript
import { Response, NextFunction } from 'express';
import { todoService } from '../services/todo.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const todoController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await todoService.getAll({
        userId: req.userId!,
        page,
        limit,
        status: req.query.status as any,
        priority: req.query.priority as any,
        category: req.query.category as string,
        search: req.query.search as string,
      });
      res.json(result);
    } catch (error) { next(error); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await todoService.getById(req.params.id, req.userId!);
      res.json(result);
    } catch (error) { next(error); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await todoService.create(req.body, req.userId!);
      res.status(201).json(result);
    } catch (error) { next(error); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await todoService.update(req.params.id, req.userId!, req.body);
      res.json(result);
    } catch (error) { next(error); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await todoService.delete(req.params.id, req.userId!);
      res.json(result);
    } catch (error) { next(error); }
  },

  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await todoService.getCategories(req.userId!);
      res.json(result);
    } catch (error) { next(error); }
  },
};
```

### Langkah 1.12: Main App

`src/app.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import './config/passport';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.get('/health', (_req, res) => res.json({ status: 'OK' }));

export default app;
```

---

## 📝 Bagian 2: Setup Frontend

### Langkah 2.1: Init React + Vite

```bash
npm create vite@latest todo-app -- --template react-ts
cd todo-app
npm install
npm install tailwindcss @tailwindcss/vite axios react-router-dom @tanstack/react-query
```

### Langkah 2.2: Tailwind Config

`vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/index.css`:

```css
@import "tailwindcss";
```

### Langkah 2.3: API Client

`src/lib/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Interceptor untuk attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor untuk handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Langkah 2.4: Auth Context

`src/context/AuthContext.tsx`:

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/api/auth/me')
        .then((res) => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.post('/api/auth/register', { email, password, name });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

### Langkah 2.5: Login Page

`src/pages/Login.tsx`:

```tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Masuk</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            Masuk
          </button>
        </form>
        <div className="mt-4 text-center">
          <button className="w-full border py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
            Masuk dengan Google
          </button>
        </div>
        <p className="text-center mt-4 text-sm text-gray-600">
          Belum punya akun? <Link to="/register" className="text-blue-600 hover:underline">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
```

### Langkah 2.6: Todo Dashboard

`src/pages/Dashboard.tsx`:

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['todos', statusFilter],
    queryFn: () => api.get(`/api/todos${statusFilter ? `?status=${statusFilter}` : ''}`),
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => api.post('/api/todos', { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setTitle('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/todos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/api/todos/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) createMutation.mutate(title);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center max-w-4xl mx-auto">
        <h1 className="text-xl font-bold">Todo App</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-red-600 hover:underline">Keluar</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4">
        {/* Add Todo Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tambah todo baru..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Tambah
          </button>
        </form>

        {/* Status Filter */}
        <div className="flex gap-2 mb-4">
          {['', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-sm ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {s || 'Semua'}
            </button>
          ))}
        </div>

        {/* Todo List */}
        {isLoading ? (
          <p className="text-center text-gray-500">Memuat...</p>
        ) : (
          <div className="space-y-3">
            {data?.data?.data?.map((todo: any) => (
              <div key={todo.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.status === 'COMPLETED'}
                    onChange={() => updateMutation.mutate({
                      id: todo.id,
                      data: { status: todo.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
                    })}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className={`font-medium ${todo.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
                      {todo.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {todo.priority} · {todo.category || 'Uncategorized'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(todo.id)}
                  className="text-red-500 hover:text-red-700">
                  Hapus
                </button>
              </div>
            ))}
            {data?.data?.data?.length === 0 && (
              <p className="text-center text-gray-400">Belum ada todo. Tambahkan sekarang!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
```

### Langkah 2.7: App Router

`src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 📝 Langkah 3: Deploy

### Backend → Railway

1. Push backend ke GitHub
2. Railway: New Project → Deploy from GitHub
3. Tambah PostgreSQL
4. Set environment variables di Railway:
   - `JWT_SECRET`, `FRONTEND_URL` (URL Vercel nanti)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Update `GOOGLE_CALLBACK_URL` ke `https://todo-api-production.up.railway.app/api/auth/google/callback`
5. Start command: `npx prisma migrate deploy && npm start`

### Frontend → Vercel

1. Buat `.env.production`:
```env
VITE_API_URL=https://todo-api-production.up.railway.app
```

2. Push frontend ke GitHub
3. Vercel: Import repo → Deploy
4. Set `VITE_API_URL` di Vercel Environment Variables

> ![Screenshot](https://via.placeholder.com/800x400?text=Todo+App+Deploy+Success)

---

## 🧪 Latihan

1. **Due date picker** — tambahkan input date untuk due date, tampilkan todo yang overdue
2. **Drag & drop** — implementasikan drag and drop untuk mengubah status todo
3. **Filter by category** — dropdown filter kategori dinamis
4. **Export data** — tambahkan tombol export todos ke CSV
5. **Dark mode** — implementasikan dark mode toggle
6. **Pagination UI** — tambahkan navigasi halaman di frontend
7. **Toast notification** — tampilkan notifikasi sukses/gagal
8. **PWA** — buat todo app jadi Progressive Web App

---

## ✅ Checklist

- [ ] Backend: Register & Login dengan JWT
- [ ] Backend: OAuth Google login
- [ ] Backend: CRUD todos dengan autentikasi
- [ ] Backend: Filter & pagination
- [ ] Frontend: Login & Register page
- [ ] Frontend: Dashboard dengan daftar todo
- [ ] Frontend: Form tambah todo
- [ ] Frontend: Update status (checklist)
- [ ] Frontend: Hapus todo
- [ ] Frontend: Protected routes
- [ ] Deploy backend ke Railway
- [ ] Deploy frontend ke Vercel
- [ ] Auth flow: register → login → CRUD → logout

---

> **Project 3 selesai!** Lanjut ke [Sesi 04: AI Chat Assistant](./04-ai-agent-app.md)
