# Sesi 2: Frontend CMS & Content Management

> **Durasi**: 2 minggu (Sprint 2)
> **Fokus**: Membangun antarmuka pengelolaan konten, editor artikel, dan sistem tagging

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Membangun frontend CMS untuk manajemen artikel dengan Next.js
2. Mengimplementasikan rich text editor untuk menulis konten
3. Membangun sistem tagging interaktif dengan autocomplete
4. Mengelola state aplikasi dengan React hooks dan Context API
5. Mengintegrasikan frontend dengan backend API secara penuh
6. Menerapkan responsive design untuk dashboard CMS
7. Menulis integration test untuk alur CRUD frontend-to-backend

## 📋 Ringkasan Materi

### Arsitektur Frontend

Frontend CMS dibangun dengan Next.js 14+ (App Router) dan TypeScript:

```
cms-frontend/
├── app/
│   ├── layout.tsx        # Root layout + providers
│   ├── page.tsx          # Halaman login/dashboard
│   ├── dashboard/
│   │   ├── page.tsx      # Dashboard utama
│   │   └── articles/
│   │       ├── page.tsx  # List artikel
│   │       ├── new/
│   │       │   └── page.tsx  # Buat artikel baru
│   │       └── [id]/
│   │           ├── page.tsx  # Edit artikel
│   │           └── preview/page.tsx  # Preview artikel + AI suggestions
│   └── api/              # API route handlers (opsional, bisa langsung fetch ke backend)
├── components/
│   ├── Editor.tsx        # Rich text editor
│   ├── TagInput.tsx      # Tag input dengan autocomplete
│   ├── ArticleCard.tsx   # Card artikel di list
│   └── Layout.tsx        # Navigation sidebar
├── lib/
│   ├── api-client.ts     # HTTP client untuk backend
│   ├── auth-context.tsx  # Context untuk state auth
│   └── types.ts          # TypeScript interfaces
└── styles/
```

### Rich Text Editor Integration

Untuk editor artikel, gunakan TipTap (berbasis ProseMirror) atau React Quill:

```typescript
// components/Editor.tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

export default function Editor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return <EditorContent editor={editor} />;
}
```

Editor menyimpan konten dalam format HTML. Saat submit, HTML dikirim ke backend dan disimpan di kolom `content` (TEXT).

### Tag Input dengan Autocomplete

Komponen tag input memungkinkan user mengetik nama tag dan mendapatkan saran dari database:

```typescript
// components/TagInput.tsx
export default function TagInput({ selectedTags, onTagsChange }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Fetch suggestions from API saat user mengetik
  useEffect(() => {
    if (query.length < 2) return;
    fetch(`/api/tags?search=${query}`)
      .then(res => res.json())
      .then(data => setSuggestions(data.data));
  }, [query]);

  // ... render tag chips + dropdown suggestions
}
```

### State Management dengan Context API

Gunakan React Context untuk mengelola state global:

- **AuthContext**: user info, token, login/logout functions
- **ArticleContext**: artikel yang sedang diedit, draft state
- **UIContext**: sidebar state, modal, toast notifications

Token JWT disimpan di `localStorage` dan dikirim via header `Authorization` di setiap request ke backend.

### Auth Context Implementation

```typescript
// lib/auth-context.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api-client';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.users.me().then(user => {
        setState({ user, token, isLoading: false });
      }).catch(() => {
        localStorage.removeItem('token');
        setState({ user: null, token: null, isLoading: false });
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await api.auth.login(email, password);
    localStorage.setItem('token', token);
    setState({ user, token, isLoading: false });
  };

  const register = async (name: string, email: string, password: string) => {
    const { token, user } = await api.auth.register(name, email, password);
    localStorage.setItem('token', token);
    setState({ user, token, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({ user: null, token: null, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### Auto-Save Draft dengan localStorage

Auto-save mencegah kehilangan data saat menulis artikel panjang:

```typescript
// hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';

const DRAFT_KEY_PREFIX = 'draft:';

export function useAutoSave(articleId: string | undefined, data: {
  title: string;
  content: string;
  tagIds: string[];
}, intervalMs = 30000) {
  const key = articleId
    ? `${DRAFT_KEY_PREFIX}${articleId}`
    : `${DRAFT_KEY_PREFIX}new`;
  const prevData = useRef(data);

  useEffect(() => {
    const timer = setInterval(() => {
      if (JSON.stringify(prevData.current) !== JSON.stringify(data)) {
        localStorage.setItem(key, JSON.stringify({
          ...data,
          savedAt: new Date().toISOString(),
        }));
        prevData.current = data;
        console.log('Draft saved at', new Date().toLocaleTimeString());
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [data, key, intervalMs]);

  const restoreDraft = () => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  };

  const clearDraft = () => {
    localStorage.removeItem(key);
  };

  return { restoreDraft, clearDraft };
}
```

### Unsaved Changes Warning

Cegah navigasi tidak sengaja saat ada perubahan yang belum disimpan:

```typescript
// hooks/useUnsavedChanges.ts
import { useEffect } from 'react';

export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleRouteChange = (url: string) => {
      if (isDirty && !window.confirm(
        'Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?'
      )) {
        throw new Error('Navigation cancelled');
      }
    };

    window.addEventListener('beforeunload', beforeUnload);
    // Untuk Next.js App Router, gunakan router.events
    // window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [isDirty]);
}
```

### API Client Pattern

Buat API client terpusat untuk menghindari duplikasi kode fetch:

```typescript
// lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json();
    throw new ApiError(error.error?.message || 'Request failed', res.status);
  }

  return res.json();
}

export const api = {
  articles: {
    list: (params) => apiClient(`/articles?${new URLSearchParams(params)}`),
    get: (id) => apiClient(`/articles/${id}`),
    create: (data) => apiClient('/articles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiClient(`/articles/${id}`, { method: 'DELETE' }),
  },
  tags: {
    list: (search) => apiClient(`/tags${search ? `?search=${search}` : ''}`),
    create: (name) => apiClient('/tags', { method: 'POST', body: JSON.stringify({ name }) }),
  },
};
```

### Dashboard Layout

Dashboard CMS memiliki layout sidebar dengan navigasi:

- **Dashboard**: Statistik (total artikel, published, draft, tags count)
- **Articles**: List semua artikel dengan status filter
- **Tags**: Manajemen tag
- **AI Tools**: Akses ke fitur AI (write, summarize, social media)

Setiap halaman di layout menggunakan skeleton loading saat fetch data dan menampilkan empty state jika tidak ada data.

### Responsive Design

Gunakan Tailwind CSS untuk responsive design:

- Mobile: sidebar collapse, single column layout
- Tablet: sidebar icons only, two column
- Desktop: full sidebar, multi-column grid untuk article list

## 🛠️ Latihan

### Latihan 1: Setup Next.js Frontend

Inisialisasi proyek frontend Next.js:

1. Buat proyek dengan `npx create-next-app@latest cms-frontend --typescript --tailwind`
2. Setup environment variable `NEXT_PUBLIC_API_URL`
3. Buat layout dasar dengan sidebar navigasi
4. Implementasi halaman login sederhana (form email + password)
5. Hubungkan ke backend: login → simpan token → redirect ke dashboard

**Kriteria sukses**: Frontend bisa login, token tersimpan, redirect ke dashboard.

### Latihan 2: Article List Page

Bangun halaman daftar artikel:

1. Tampilkan artikel dalam format card (title, status, tags, date)
2. Implementasi pagination dengan tombol prev/next
3. Filter artikel by status (draft/published) via tab buttons
4. Search artikel by title dengan debounce
5. Tampilkan loading skeleton saat fetching

**Kriteria sukses**: List artikel muncul dengan pagination, filter dan search berfungsi.

### Latihan 3: Rich Text Editor

Integrasi editor teks kaya:

1. Install TipTap dan extensions dasar (StarterKit, Link, Image)
2. Build toolbar: bold, italic, heading, bullet list, link
3. Simpan konten sebagai HTML
4. Tampilkan preview HTML di halaman detail
5. Handle empty state saat artikel belum punya konten

**Kriteria sukses**: User bisa menulis, format teks, dan menyimpan artikel dengan editor.

### Latihan 4: Tag Input Component

Buat komponen tag input interaktif:

1. Input text dengan autocomplete suggestions dari API
2. Tampilkan tag sebagai chips/ badges yang bisa dihapus
3. Create tag baru jika tidak ada di suggestions
4. Validasi: maksimal 5 tags per artikel
5. Animasi masuk/keluar tag chip

**Kriteria sukses**: Tag bisa ditambahkan, dihapus, autocomplete bekerja, maksimal 5 tags.

### Latihan 5: Create & Edit Article Page

Bangun halaman form artikel lengkap:

1. Form: title input, tag input, editor, status toggle (draft/published)
2. Auto-save draft ke localStorage setiap 30 detik
3. Validasi form sebelum submit (title required, content minimal 10 karakter)
4. Tampilkan toast notification sukses/gagal
5. Handle unsaved changes warning saat navigasi

**Kriteria sukses**: Artikel bisa dibuat, diedit, auto-save draft bekerja.

### Latihan 6: Dashboard & Statistics

Buat halaman dashboard dengan statistik:

1. Hitung total artikel, published, draft dari API
2. Tampilkan grafik sederhana (bar chart) artikel per bulan (gunakan recharts atau chart.js)
3. Recent activity feed (5 artikel terakhir dimodifikasi)
4. Quick action buttons: buat artikel baru, generate AI
5. Refresh data otomatis setiap 60 detik

**Kriteria sukses**: Dashboard menampilkan statistik akurat, grafik berfungsi.

### Latihan 7: Integration Test CRUD

Tulis integration test untuk alur CRUD frontend:

1. Setup Playwright atau Vitest + jsdom untuk testing
2. Test: login → buka halaman articles → lihat list → klik new article
3. Test: create artikel dengan title dan konten → verify muncul di list
4. Test: edit artikel → change title → verify tersimpan
5. Test: delete artikel → verify hilang dari list
6. Test: filter articles by status dan search by title

**Kriteria sukses**: Semua test passing, CRUD flow terverifikasi end-to-end.

### Latihan 8: Media Upload Gallery

Buat halaman upload dan manajemen media:

1. Komponen drag-and-drop file upload dengan preview gambar
2. Validasi tipe file (hanya gambar: jpg, png, webp) dan ukuran (max 5MB)
3. Upload progress bar dengan XMLHttpRequest atau fetch
4. Gallery grid dengan lazy loading
5. Pilih gambar dari gallery untuk featured image artikel

**Kriteria sukses**: File bisa diupload, tampil di gallery, bisa dipilih sebagai featured image.

### Latihan 9: Toast Notification System

Buat sistem notifikasi toast global:

1. Toast context dengan queue notifikasi
2. Variasi tipe: success, error, warning, info
3. Auto-dismiss setelah 5 detik
4. Animasi slide-in dari kanan atas
5. Tombol close manual

**Kriteria sukses**: Toast muncul untuk setiap aksi CRUD, auto-dismiss berfungsi.

### Latihan 10: Responsive Sidebar Layout

Implementasi sidebar responsif:

1. Desktop: sidebar tetap (fixed) dengan navigasi penuh
2. Tablet: sidebar collapsible, icon-only saat collapsed
3. Mobile: bottom navigation bar
4. Animasi transisi sidebar buka/tutup
5. Active link highlighting berdasarkan route saat ini

**Kriteria sukses**: Layout beradaptasi di semua ukuran layar, navigasi tetap usable.

## 📚 Referensi

- [Next.js Documentation](https://nextjs.org/docs)
- [TipTap Editor](https://tiptap.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Context API](https://react.dev/reference/react/createContext)
- [Playwright Testing](https://playwright.dev/docs/writing-tests)
- [MDN Drag & Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [React Toast Pattern](https://react-hot-toast.com/)

---
**Capstone 4 — Sesi 2: Frontend CMS & Content Management.** Lanjut ke [Sesi 3: AI Integration & Deployment](03-ai-deploy.md).
