// Prebuild: generate static JSON from curriculum video registry
// Output: static/content/videos.json (fetched by frontend at runtime)
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const outputDir = resolve(process.cwd(), 'static', 'content');

// ── Video registry (mirrors src/lib/stores/videos.ts moduleVideos) ──
// Kept as JS here so Node can run it directly without TS compilation.
const moduleVideos = [
  {
    moduleSlug: 'fundamentals',
    title: 'Fundamental Pemrograman & Web',
    playlistUrl: 'https://youtube.com/playlist?list=PLFIM0718LjIVu4p1DC4GCj1gqUXNC6goN',
    videos: [
      { id: 'NBZ9Me6rNoM', title: 'Internet & Cara Kerja Web', duration: '12:30' },
      { id: '5TZqY5jJgXc', title: 'Apa itu HTTP & DNS?', duration: '14:20' },
      { id: 'Xq3YhUcO0Lc', title: 'Pengenalan API & Database', duration: '10:45' },
      { id: 'yKbYh2P3cFg', title: 'Deployment untuk Pemula', duration: '13:00' },
    ],
  },
  {
    moduleSlug: 'js-fundamentals',
    title: 'JavaScript Fundamentals',
    playlistUrl: 'https://youtube.com/playlist?list=PLFIM0718LjIW-XBdVOerYgKegBtD6rSfD',
    videos: [
      { id: 'hdI2bqOjy3c', title: 'Pendahuluan & Setup JavaScript', duration: '11:20' },
      { id: 'RUTV_5m4VeI', title: 'Variabel & Tipe Data', duration: '15:30' },
      { id: '1l4w0gV6VAY', title: 'Control Flow (if/else, switch)', duration: '14:10' },
      { id: 'cML6dPJ3tRs', title: 'Array & Object', duration: '18:20' },
      { id: 'Vh7P1pGm6p0', title: 'Fungsi & Scope', duration: '16:45' },
    ],
  },
  {
    moduleSlug: 'algorithms-data-structures',
    title: 'Algoritma & Struktur Data',
    playlistUrl: 'https://youtube.com/playlist?list=PLZS8Q17vJvJPNoZMWvPGoT3XBWd0p5eHM',
    videos: [
      { id: 'BmKv7gYvBcI', title: 'Apa itu Algoritma & Big O?', duration: '16:00' },
      { id: 'gCjJ4ZNcWgQ', title: 'Array & Hash Table', duration: '18:30' },
      { id: 'Z3BQY5r7mLk', title: 'Stack & Queue', duration: '14:25' },
      { id: 'p2oJ8sVjXqA', title: 'Linked List', duration: '20:10' },
      { id: 'Rsq5tP4K6oM', title: 'Rekursi & Sorting', duration: '22:00' },
      { id: 'L8fWqD5pRvE', title: 'Tree & Graph', duration: '25:30' },
    ],
  },
  {
    moduleSlug: 'typescript',
    title: 'TypeScript',
    playlistUrl: 'https://youtube.com/playlist?list=PLZS8Q17vJvJ_Lsbjbkx2g0FjWW1E3YfQA',
    videos: [
      { id: '9i3xY5Vj3Lk', title: 'Dasar TypeScript — Setup & Tipe', duration: '14:30' },
      { id: 'R3qP8mLkx5Y', title: 'Interface & Type Alias', duration: '16:15' },
      { id: 'cN7wVj2BqT9', title: 'Generics & Utility Types', duration: '20:00' },
      { id: 'Xp4Lk6NvR8m', title: 'TypeScript dengan Node.js', duration: '13:45' },
    ],
  },
  {
    moduleSlug: 'web-basics',
    title: 'Web Basics (HTML, CSS, Tailwind, DOM)',
    playlistUrl: 'https://youtube.com/playlist?list=PLFIM0718LjIVu4p1DC4GCj1gqUXNC6goN',
    videos: [
      { id: 'NBZ9Me6rNoM', title: 'HTML Dasar — Struktur & Tag', duration: '14:00' },
      { id: '4W9AqB5pRvE', title: 'CSS Dasar — Styling Pertama', duration: '16:30' },
      { id: 'zP6KbOFO9FI', title: 'Tailwind CSS — Utility-First', duration: '18:20' },
      { id: 'kM8LXNP4Y6o', title: 'DOM Manipulation & Fetch API', duration: '21:00' },
    ],
  },
  {
    moduleSlug: 'git-deploy',
    title: 'Git & Deployment',
    playlistUrl: 'https://youtube.com/playlist?list=PLFIM0718Lj0Wj0s2nbfY2_4wn2Yk_iM5',
    videos: [
      { id: 'kM8LXNP4Y6o', title: 'Git Dasar — Init, Add, Commit', duration: '13:20' },
      { id: 'Xq3YhUcO0Lc', title: 'Branching & Merge', duration: '16:40' },
      { id: 'B4tCVS7CZAM', title: 'GitHub Remote & Kolaborasi', duration: '15:10' },
      { id: 'yKbYh2P3cFg', title: 'Deploy ke Vercel & Netlify', duration: '12:30' },
    ],
  },
  {
    moduleSlug: 'node-express',
    title: 'Node.js & Express',
    playlistUrl: 'https://youtube.com/playlist?list=PLFIM0718LjIW-XBdVOerYgKegBtD6rSfD',
    videos: [
      { id: 'B4tCVS7CZAM', title: 'Node.js Dasar — Module & NPM', duration: '17:00' },
      { id: 'wLk9PqT4R6m', title: 'Express.js — Routing & Middleware', duration: '20:30' },
      { id: 'Xp4Lk6NvR8m', title: 'Database dengan Prisma ORM', duration: '22:15' },
      { id: 'cN7wVj2BqT9', title: 'REST CRUD API Lengkap', duration: '25:00' },
    ],
  },
  {
    moduleSlug: 'mastra-ai',
    title: 'Mastra AI Framework',
    videos: [
      { id: 'BmKv7gYvBcI', title: 'Pengenalan AI Agent Framework', duration: '14:00' },
      { id: 'Rsq5tP4K6oM', title: 'Bikin Agent Pertama dengan Mastra', duration: '18:30' },
      { id: 'L8fWqD5pRvE', title: 'Tools & Memory untuk Agent', duration: '20:00' },
      { id: 'p2oJ8sVjXqA', title: 'RAG Pattern & Workflow', duration: '22:10' },
    ],
  },
  {
    moduleSlug: 'project',
    title: 'Project — Aplikasi AI Chatbot',
    videos: [
      { id: 'Z3BQY5r7mLk', title: 'Sprint 1 — Setup & Planning', duration: '12:00' },
      { id: '9i3xY5Vj3Lk', title: 'Sprint 2 — Fitur Chat', duration: '16:45' },
      { id: 'R3qP8mLkx5Y', title: 'Sprint 3 — AI Integration', duration: '19:30' },
      { id: 'cN7wVj2BqT9', title: 'Sprint 4 — Deploy & Polish', duration: '14:20' },
    ],
  },
  {
    moduleSlug: 'testing',
    title: 'Software Testing',
    videos: [
      { id: 'Xp4Lk6NvR8m', title: 'Unit Test dengan Vitest', duration: '18:00' },
      { id: 'wLk9PqT4R6m', title: 'Integration Testing', duration: '20:30' },
      { id: 'B4tCVS7CZAM', title: 'CI/CD Pipeline GitHub Actions', duration: '22:00' },
    ],
  },
  {
    moduleSlug: 'design-patterns',
    title: 'Design Patterns',
    videos: [
      { id: 'BmKv7gYvBcI', title: 'SOLID Principles', duration: '21:00' },
      { id: 'gCjJ4ZNcWgQ', title: 'Creational Patterns (Factory, Singleton)', duration: '19:30' },
      { id: 'Rsq5tP4K6oM', title: 'Structural & Behavioral Patterns', duration: '24:00' },
      { id: 'L8fWqD5pRvE', title: 'Design Pattern di Dunia Nyata', duration: '17:45' },
    ],
  },
  {
    moduleSlug: 'system-design',
    title: 'System Design',
    videos: [
      { id: 'p2oJ8sVjXqA', title: 'Arsitektur Software Modern', duration: '22:00' },
      { id: 'Z3BQY5r7mLk', title: 'Desain Database & Scaling', duration: '25:30' },
      { id: 'Xq3YhUcO0Lc', title: 'Caching & CAP Theorem', duration: '18:20' },
      { id: 'yKbYh2P3cFg', title: 'Message Queue & Hosting', duration: '16:00' },
    ],
  },
  {
    moduleSlug: 'ui-ux-design',
    title: 'UI/UX Design',
    videos: [
      { id: '4W9AqB5pRvE', title: 'Design Thinking untuk Developer', duration: '15:00' },
      { id: 'zP6KbOFO9FI', title: 'Wireframe & Prototype dengan Figma', duration: '19:30' },
      { id: 'kM8LXNP4Y6o', title: 'Design System & Component', duration: '22:00' },
      { id: '5TZqY5jJgXc', title: 'Aksesibilitas Web (A11y)', duration: '14:20' },
    ],
  },
  {
    moduleSlug: 'flutter-mobile',
    title: 'Flutter Mobile',
    videos: [
      { id: '9i3xY5Vj3Lk', title: 'Dart & Widget Dasar', duration: '17:00' },
      { id: 'R3qP8mLkx5Y', title: 'Layout & State Management', duration: '20:30' },
      { id: 'cN7wVj2BqT9', title: 'Navigasi & HTTP API', duration: '18:10' },
      { id: 'Xp4Lk6NvR8m', title: 'Firebase & Deploy ke Play Store', duration: '23:00' },
    ],
  },
  {
    moduleSlug: 'cybersecurity',
    title: 'Cybersecurity',
    videos: [
      { id: 'BmKv7gYvBcI', title: 'OWASP Top 10 untuk Developer', duration: '20:00' },
      { id: 'gCjJ4ZNcWgQ', title: 'SQL Injection & XSS', duration: '18:30' },
      { id: 'Rsq5tP4K6oM', title: 'CSRF & Authentication Bypass', duration: '16:45' },
      { id: 'L8fWqD5pRvE', title: 'HTTPS, CORS & DevSecOps', duration: '22:00' },
    ],
  },
  {
    moduleSlug: 'agile-scrum',
    title: 'Agile & Scrum',
    videos: [
      { id: 'Z3BQY5r7mLk', title: 'Apa itu Agile & Scrum?', duration: '14:00' },
      { id: '9i3xY5Vj3Lk', title: 'Ceremonies & Backlog Management', duration: '16:30' },
      { id: 'R3qP8mLkx5Y', title: 'Scrum Tools (Jira, Linear, Notion)', duration: '15:20' },
    ],
  },
  {
    moduleSlug: 'realtime-apps',
    title: 'Real-Time Applications',
    videos: [
      { id: 'cN7wVj2BqT9', title: 'WebSocket — Konsep & Implementasi', duration: '19:00' },
      { id: 'wLk9PqT4R6m', title: 'Socket.IO — Chat Real-Time', duration: '22:30' },
      { id: 'Xp4Lk6NvR8m', title: 'Scaling WebSocket di Production', duration: '18:00' },
    ],
  },
  {
    moduleSlug: 'advanced-database',
    title: 'Advanced Database',
    videos: [
      { id: 'p2oJ8sVjXqA', title: 'Indexing & Query Optimization', duration: '21:00' },
      { id: 'Rsq5tP4K6oM', title: 'Transaksi, Locking & Isolasi', duration: '23:30' },
      { id: 'L8fWqD5pRvE', title: 'Database Scaling & Backup', duration: '20:00' },
    ],
  },
  {
    moduleSlug: 'ai-prompt-engineering',
    title: 'AI Prompt Engineering',
    videos: [
      { id: 'BmKv7gYvBcI', title: 'Teknik Prompt Dasar', duration: '15:00' },
      { id: 'gCjJ4ZNcWgQ', title: 'Prompt untuk Generate Kode', duration: '18:30' },
      { id: '9i3xY5Vj3Lk', title: 'System Prompt & Structured Output', duration: '20:00' },
      { id: 'Xq3YhUcO0Lc', title: 'Prompt Chaining & Multi-Step', duration: '16:45' },
    ],
  },
  {
    moduleSlug: 'technical-interview',
    title: 'Technical Interview Prep',
    videos: [
      { id: 'Z3BQY5r7mLk', title: 'Persiapan Behavioral & CV', duration: '14:00' },
      { id: 'R3qP8mLkx5Y', title: 'DSA & LeetCode untuk Interview', duration: '26:30' },
      { id: 'cN7wVj2BqT9', title: 'System Design Interview', duration: '24:00' },
      { id: 'yKbYh2P3cFg', title: 'Mock Interview & Portfolio', duration: '18:20' },
    ],
  },
  {
    moduleSlug: 'frontend-frameworks',
    title: 'Frontend Frameworks (React, Next.js)',
    videos: [
      { id: '4W9AqB5pRvE', title: 'React Dasar — Component & Props', duration: '18:00' },
      { id: 'zP6KbOFO9FI', title: 'React Hooks — useState, useEffect', duration: '21:30' },
      { id: 'kM8LXNP4Y6o', title: 'Next.js — App Router & SSR', duration: '24:00' },
    ],
  },
  {
    moduleSlug: 'docker',
    title: 'Docker',
    playlistUrl: 'https://youtube.com/playlist?list=PLZS8Q17vJvJPNoZMWvPGoT3XBWd0p5eHM',
    videos: [
      { id: 'B4tCVS7CZAM', title: 'Docker Dasar — Container & Image', duration: '16:00' },
      { id: 'Xp4Lk6NvR8m', title: 'Dockerfile & Docker Compose', duration: '20:30' },
      { id: 'wLk9PqT4R6m', title: 'Docker untuk Production', duration: '18:00' },
    ],
  },
  {
    moduleSlug: 'monorepo',
    title: 'Monorepo',
    videos: [
      { id: '9i3xY5Vj3Lk', title: 'Apa itu Monorepo?', duration: '14:30' },
      { id: 'R3qP8mLkx5Y', title: 'pnpm Workspaces', duration: '16:00' },
      { id: 'cN7wVj2BqT9', title: 'Nx & Turborepo', duration: '19:30' },
      { id: 'Xp4Lk6NvR8m', title: 'CI Monorepo Strategy', duration: '17:00' },
    ],
  },
  {
    moduleSlug: 'system-runtime',
    title: 'System & Runtime',
    playlistUrl: 'https://youtube.com/playlist?list=PLFIM0718LjIW-XBdVOerYgKegBtD6rSfD',
    videos: [
      { id: '8aGhZQkoFbQ', title: 'What the heck is the event loop anyway? (JSConf)', duration: '26:30' },
      { id: 'BmKv7gYvBcI', title: 'Async Patterns — Callback, Promise, Async/Await', duration: '22:00' },
      { id: 'gCjJ4ZNcWgQ', title: 'Multithreading & Worker Threads', duration: '19:30' },
      { id: 'Rsq5tP4K6oM', title: 'Runtime Performance Optimization', duration: '24:00' },
    ],
  },
  {
    moduleSlug: 'resilience-patterns',
    title: 'Resilience Patterns',
    videos: [
      { id: 'L8fWqD5pRvE', title: 'Retry & Backoff Strategy', duration: '16:00' },
      { id: 'p2oJ8sVjXqA', title: 'Circuit Breaker Pattern', duration: '18:30' },
      { id: 'Z3BQY5r7mLk', title: 'Timeout & Bulkhead', duration: '15:20' },
      { id: 'yKbYh2P3cFg', title: 'Saga Pattern & Health Check', duration: '20:00' },
    ],
  },
  {
    moduleSlug: 'soft-skills',
    title: 'Soft Skills',
    videos: [
      { id: 'Xq3YhUcO0Lc', title: 'Komunikasi Efektif dalam Tim', duration: '14:00' },
      { id: '5TZqY5jJgXc', title: 'Client Handling & Negosiasi', duration: '16:30' },
      { id: 'wLk9PqT4R6m', title: 'Manajemen Waktu untuk Developer', duration: '13:20' },
      { id: 'cN7wVj2BqT9', title: 'Growth Mindset & Continuous Learning', duration: '12:00' },
    ],
  },
  {
    moduleSlug: 'pragmatic-programming',
    title: 'Pragmatic Programming',
    videos: [
      { id: '4W9AqB5pRvE', title: 'Clean Code — Prinsip Dasar', duration: '18:00' },
      { id: 'zP6KbOFO9FI', title: 'Naming Convention & Comments', duration: '14:30' },
      { id: 'kM8LXNP4Y6o', title: 'Refactoring & Estimasi', duration: '20:00' },
      { id: 'B4tCVS7CZAM', title: 'Code Review Best Practices', duration: '16:45' },
    ],
  },
  {
    moduleSlug: 'linux-terminal',
    title: 'Linux & Terminal',
    videos: [
      { id: '9i3xY5Vj3Lk', title: 'File System & Basic Commands', duration: '16:00' },
      { id: 'R3qP8mLkx5Y', title: 'Proses & Networking di Linux', duration: '18:30' },
      { id: 'cN7wVj2BqT9', title: 'Text Processing (grep, sed, awk)', duration: '20:00' },
      { id: 'Xp4Lk6NvR8m', title: 'Shell Scripting untuk Otomasi', duration: '22:00' },
    ],
  },
  {
    moduleSlug: 'rest-api-design',
    title: 'REST API Design',
    videos: [
      { id: 'wLk9PqT4R6m', title: 'Prinsip REST & Best Practices', duration: '18:00' },
      { id: 'BmKv7gYvBcI', title: 'OpenAPI & Swagger Documentation', duration: '16:30' },
      { id: 'gCjJ4ZNcWgQ', title: 'Error Handling & Pagination', duration: '19:00' },
      { id: 'Rsq5tP4K6oM', title: 'API Versioning & Security', duration: '20:30' },
    ],
  },
  {
    moduleSlug: 'cloud-computing',
    title: 'Cloud Computing',
    videos: [
      { id: 'L8fWqD5pRvE', title: 'Cloud Basics — IaaS, PaaS, SaaS', duration: '15:00' },
      { id: 'p2oJ8sVjXqA', title: 'Compute & Storage (AWS/GCP/Azure)', duration: '22:00' },
      { id: 'Z3BQY5r7mLk', title: 'Serverless Functions & Edge', duration: '18:30' },
      { id: 'yKbYh2P3cFg', title: 'Infrastructure as Code (Terraform)', duration: '24:00' },
    ],
  },
  {
    moduleSlug: 'graphql-trpc',
    title: 'GraphQL & tRPC',
    videos: [
      { id: 'Xq3YhUcO0Lc', title: 'GraphQL Dasar — Query & Mutation', duration: '20:00' },
      { id: '5TZqY5jJgXc', title: 'GraphQL Advanced — Subscription', duration: '18:30' },
      { id: 'B4tCVS7CZAM', title: 'tRPC — End-to-End Typesafe API', duration: '16:00' },
    ],
  },
  {
    moduleSlug: 'auth-identity',
    title: 'Authentication & Identity',
    videos: [
      { id: 'cN7wVj2BqT9', title: 'Password Auth & Hashing', duration: '16:00' },
      { id: 'Xp4Lk6NvR8m', title: 'OAuth 2.0 & OpenID Connect', duration: '22:30' },
      { id: 'wLk9PqT4R6m', title: 'SSO & MFA Implementasi', duration: '19:00' },
      { id: 'R3qP8mLkx5Y', title: 'Security Best Practices Auth', duration: '18:00' },
    ],
  },
  {
    moduleSlug: 'performance',
    title: 'Web Performance',
    videos: [
      { id: '4W9AqB5pRvE', title: 'Web Vitals — LCP, FID, CLS', duration: '17:00' },
      { id: 'zP6KbOFO9FI', title: 'Lazy Loading & Caching Strategy', duration: '19:30' },
      { id: 'kM8LXNP4Y6o', title: 'Bundle Optimization (Code Splitting)', duration: '16:00' },
      { id: 'BmKv7gYvBcI', title: 'Lighthouse CI & Performance Budget', duration: '14:30' },
    ],
  },
  {
    moduleSlug: 'data-visualization',
    title: 'Data Visualization',
    videos: [
      { id: 'gCjJ4ZNcWgQ', title: 'Chart Basics — Bar, Line, Pie', duration: '14:00' },
      { id: 'Rsq5tP4K6oM', title: 'Chart Advanced — Interaktif & Real-time', duration: '18:30' },
      { id: 'L8fWqD5pRvE', title: 'D3.js untuk Data Visualization', duration: '22:00' },
      { id: 'p2oJ8sVjXqA', title: 'Dashboard Real-World', duration: '20:00' },
    ],
  },
  {
    moduleSlug: 'pwa-offline',
    title: 'PWA & Offline',
    videos: [
      { id: 'Z3BQY5r7mLk', title: 'Service Worker & Cache API', duration: '18:00' },
      { id: '9i3xY5Vj3Lk', title: 'IndexedDB & Offline Storage', duration: '20:30' },
      { id: 'R3qP8mLkx5Y', title: 'PWA Manifest & Push Notifications', duration: '16:00' },
    ],
  },
  {
    moduleSlug: 'html-css-intro',
    title: 'HTML & CSS Intro',
    playlistUrl: 'https://youtube.com/playlist?list=PLFIM0718LjIVu4p1DC4GCj1gqUXNC6goN',
    videos: [
      { id: 'NBZ9Me6rNoM', title: 'HTML Dasar — Tag, Atribut, Semantic', duration: '16:00' },
      { id: 'ZvkuTdLh4V4', title: 'CSS Dasar — Selector & Property', duration: '18:00' },
      { id: '5TZqY5jJgXc', title: 'CSS Layout — Flexbox & Grid', duration: '21:30' },
      { id: 'yKbYh2P3cFg', title: 'Form & Deploy Website', duration: '14:00' },
    ],
  },
  {
    moduleSlug: 'web-architecture',
    title: 'Web Architecture',
    videos: [
      { id: 'Xq3YhUcO0Lc', title: 'Cara Kerja Web (DNS, HTTP, CDN)', duration: '18:00' },
      { id: 'B4tCVS7CZAM', title: 'HTTP Deep Dive & RESTful', duration: '20:30' },
      { id: 'wLk9PqT4R6m', title: 'Frontend vs Backend Architecture', duration: '15:00' },
      { id: 'cN7wVj2BqT9', title: 'Hosting, Domain & Deploy Strategy', duration: '17:00' },
    ],
  },
  {
    moduleSlug: 'database-intro',
    title: 'Database Intro',
    videos: [
      { id: 'Xp4Lk6NvR8m', title: 'Apa itu Database? Relational vs NoSQL', duration: '16:00' },
      { id: '9i3xY5Vj3Lk', title: 'SQL Basic — SELECT, INSERT, UPDATE', duration: '19:30' },
      { id: 'R3qP8mLkx5Y', title: 'Table Relationships & JOIN', duration: '18:00' },
      { id: 'Z3BQY5r7mLk', title: 'Database Design & Normalization', duration: '22:00' },
    ],
  },
  {
    moduleSlug: 'ai-dev-workflow',
    title: 'AI Developer Workflow',
    videos: [
      { id: 'BmKv7gYvBcI', title: 'AI Coding Tools — Copilot, Claude, Codex', duration: '16:00' },
      { id: 'gCjJ4ZNcWgQ', title: 'AI Pair Programming Workflow', duration: '18:30' },
      { id: 'Rsq5tP4K6oM', title: 'AI Code Review & Refactoring', duration: '20:00' },
      { id: 'L8fWqD5pRvE', title: 'AI Workflow untuk Produktivitas', duration: '15:30' },
    ],
  },
  {
    moduleSlug: 'payment-integration',
    title: 'Payment Integration',
    videos: [
      { id: 'p2oJ8sVjXqA', title: 'Payment Gateway Basics', duration: '14:00' },
      { id: 'Z3BQY5r7mLk', title: 'Midtrans & Xendit Integration', duration: '22:30' },
      { id: 'yKbYh2P3cFg', title: 'Stripe Webhook & Production', duration: '20:00' },
    ],
  },
  {
    moduleSlug: 'background-jobs',
    title: 'Background Jobs',
    videos: [
      { id: 'Xq3YhUcO0Lc', title: 'Queue Concepts — RabbitMQ, Redis', duration: '18:00' },
      { id: '5TZqY5jJgXc', title: 'BullMQ Advanced Patterns', duration: '22:30' },
      { id: 'B4tCVS7CZAM', title: 'Real-World Queue Architecture', duration: '20:00' },
    ],
  },
  {
    moduleSlug: 'monitoring',
    title: 'Monitoring & Observability',
    videos: [
      { id: 'cN7wVj2BqT9', title: 'Structured Logging (Winston, Pino)', duration: '16:00' },
      { id: 'Xp4Lk6NvR8m', title: 'Sentry & Error Tracking', duration: '18:30' },
      { id: 'wLk9PqT4R6m', title: 'Health Check & Uptime Monitoring', duration: '15:00' },
    ],
  },
  {
    moduleSlug: 'file-upload',
    title: 'File Upload',
    videos: [
      { id: '4W9AqB5pRvE', title: 'Upload Basics (multer, formidable)', duration: '16:00' },
      { id: 'zP6KbOFO9FI', title: 'Cloud Storage (S3, Cloudinary)', duration: '20:30' },
      { id: 'kM8LXNP4Y6o', title: 'Image Optimization (Sharp, AVIF)', duration: '18:00' },
    ],
  },
  {
    moduleSlug: 'search-implementation',
    title: 'Search Implementation',
    videos: [
      { id: 'BmKv7gYvBcI', title: 'PostgreSQL Full-Text Search', duration: '18:00' },
      { id: 'gCjJ4ZNcWgQ', title: 'Meilisearch — Setup & Query', duration: '20:30' },
      { id: 'Rsq5tP4K6oM', title: 'Client-Side Search (Fuse.js, Lunr)', duration: '14:00' },
    ],
  },
  {
    moduleSlug: 'portfolio-branding',
    title: 'Portfolio & Personal Branding',
    videos: [
      { id: 'L8fWqD5pRvE', title: 'GitHub Profile yang Profesional', duration: '12:00' },
      { id: 'p2oJ8sVjXqA', title: 'Bikin Portfolio Website', duration: '22:00' },
      { id: 'Z3BQY5r7mLk', title: 'LinkedIn & Personal Branding', duration: '14:30' },
    ],
  },
  {
    moduleSlug: 'internationalization',
    title: 'Internationalization (i18n)',
    videos: [
      { id: '9i3xY5Vj3Lk', title: 'i18n Concepts & Setup', duration: '15:00' },
      { id: 'R3qP8mLkx5Y', title: 'React i18n (react-i18next)', duration: '18:30' },
      { id: 'cN7wVj2BqT9', title: 'RTL Support & Backend i18n', duration: '17:00' },
    ],
  },
  {
    moduleSlug: 'debugging-devtools',
    title: 'Debugging & DevTools',
    videos: [
      { id: 'Xp4Lk6NvR8m', title: 'Browser DevTools — Debugging CSS & JS', duration: '20:00' },
      { id: 'wLk9PqT4R6m', title: 'VS Code Debugger — Step Through Code', duration: '16:30' },
      { id: 'B4tCVS7CZAM', title: 'API Debugging (Postman, Thunder Client)', duration: '14:00' },
    ],
  },
  {
    moduleSlug: 'team-git-workflow',
    title: 'Team Git Workflow',
    videos: [
      { id: 'Xq3YhUcO0Lc', title: 'Branching Strategy (Git Flow, Trunk)', duration: '18:00' },
      { id: '5TZqY5jJgXc', title: 'Pull Request Workflow & Code Review', duration: '16:00' },
      { id: 'yKbYh2P3cFg', title: 'Conflict Resolution & Rebase', duration: '20:30' },
      { id: 'BmKv7gYvBcI', title: 'GitHub Actions untuk Automation', duration: '22:00' },
    ],
  },
  {
    moduleSlug: 'portfolio-project-series',
    title: 'Portfolio Project Series',
    videos: [
      { id: 'gCjJ4ZNcWgQ', title: 'Landing Page — HTML/CSS/JS', duration: '20:00' },
      { id: 'Rsq5tP4K6oM', title: 'CRUD API — Express + Prisma', duration: '24:00' },
      { id: 'L8fWqD5pRvE', title: 'Fullstack App — React + Node.js', duration: '28:00' },
      { id: 'p2oJ8sVjXqA', title: 'AI Agent App — Integrasi LLM', duration: '22:00' },
      { id: 'Z3BQY5r7mLk', title: 'Production Deploy & Monitoring', duration: '18:00' },
    ],
  },
  {
    moduleSlug: 'production-ready-code',
    title: 'Production-Ready Code',
    videos: [
      { id: '9i3xY5Vj3Lk', title: 'Input Validation (Zod, Joi)', duration: '16:00' },
      { id: 'R3qP8mLkx5Y', title: 'Security Hardening (Helmet, Rate Limit)', duration: '18:30' },
      { id: 'cN7wVj2BqT9', title: 'Health Check & Graceful Shutdown', duration: '14:00' },
      { id: 'Xp4Lk6NvR8m', title: 'Environment Config (dotenv, 12-factor)', duration: '12:30' },
    ],
  },
  {
    moduleSlug: 'microservices-hands-on',
    title: 'Microservices Hands-On',
    videos: [
      { id: 'wLk9PqT4R6m', title: 'Monolith to Microservices', duration: '22:00' },
      { id: 'B4tCVS7CZAM', title: 'Docker Multi-Service Setup', duration: '20:00' },
      { id: 'Xq3YhUcO0Lc', title: 'Inter-Service Communication (gRPC, HTTP)', duration: '24:30' },
      { id: '5TZqY5jJgXc', title: 'API Gateway Pattern (Kong, Traefik)', duration: '18:00' },
    ],
  },
  {
    moduleSlug: 'lks-competition-prep',
    title: 'LKS Competition Prep',
    videos: [
      { id: 'yKbYh2P3cFg', title: 'Pemetaan LKS & Strategi', duration: '14:00' },
      { id: 'BmKv7gYvBcI', title: 'Mock Project — Web Dev LKS', duration: '26:00' },
      { id: 'gCjJ4ZNcWgQ', title: 'Mock Project — Mobile LKS', duration: '28:00' },
    ],
  },
  {
    moduleSlug: 'indonesian-tech-ecosystem',
    title: 'Indonesian Tech Ecosystem',
    videos: [
      { id: 'Rsq5tP4K6oM', title: 'Freelance & Side Hustle untuk Developer', duration: '16:00' },
      { id: 'L8fWqD5pRvE', title: 'Job Hunting & Interview Tips', duration: '18:30' },
      { id: 'p2oJ8sVjXqA', title: 'Career Growth & Skill Path', duration: '14:00' },
      { id: 'Z3BQY5r7mLk', title: 'Tech Community & Networking', duration: '12:00' },
    ],
  },
  {
    moduleSlug: 'ai-coding-agents',
    title: 'AI Coding Agents',
    videos: [
      { id: '9i3xY5Vj3Lk', title: 'AI Coding Tools Comparison', duration: '18:00' },
      { id: 'R3qP8mLkx5Y', title: 'Multi-Agent Workflow (Claude, Codex)', duration: '22:30' },
      { id: 'cN7wVj2BqT9', title: 'Coding Loop — Agent-Driven Dev', duration: '20:00' },
      { id: 'Xp4Lk6NvR8m', title: 'Mastering Hermes Agent', duration: '16:00' },
    ],
  },
  {
    moduleSlug: 'prompt-engineering-dev',
    title: 'Prompt Engineering untuk Developer',
    videos: [
      { id: 'wLk9PqT4R6m', title: 'System Prompt Design', duration: '16:00' },
      { id: 'B4tCVS7CZAM', title: 'Code Generation Prompting', duration: '19:30' },
      { id: 'Xq3YhUcO0Lc', title: 'Prompt Patterns (Chain, Tree, Map)', duration: '22:00' },
      { id: '5TZqY5jJgXc', title: 'Production Prompting (Caching, Evals)', duration: '18:00' },
    ],
  },
  {
    moduleSlug: 'ai-docs-spec',
    title: 'AI Docs & Spec',
    videos: [
      { id: 'yKbYh2P3cFg', title: 'Tech Spec dengan AI Assistant', duration: '16:30' },
      { id: 'BmKv7gYvBcI', title: 'Doc Generation (Mintlify, Docusaurus)', duration: '18:00' },
      { id: 'gCjJ4ZNcWgQ', title: 'Context Files & Rules Files (cursorrules)', duration: '14:00' },
    ],
  },
  {
    moduleSlug: 'advanced-ai-dev',
    title: 'Advanced AI Development',
    videos: [
      { id: 'Rsq5tP4K6oM', title: 'AI Code Review Pipeline', duration: '18:00' },
      { id: 'L8fWqD5pRvE', title: 'AI Testing Strategy (Eval, Assert)', duration: '20:30' },
      { id: 'p2oJ8sVjXqA', title: 'AI Security & Quality Gates', duration: '16:00' },
      { id: 'Z3BQY5r7mLk', title: 'AI Refactoring & Migration', duration: '22:00' },
    ],
  },
];

// Build the output object
const output = {
  modules: {}  // keyed by moduleSlug
};

for (const mv of moduleVideos) {
  output.modules[mv.moduleSlug] = {
    title: mv.title,
    playlistUrl: mv.playlistUrl || null,
    videos: mv.videos,
  };
}

// Write JSON
mkdirSync(outputDir, { recursive: true });
const jsonPath = resolve(outputDir, 'videos.json');
writeFileSync(jsonPath, JSON.stringify(output, null, 2));

const totalVideos = moduleVideos.reduce((sum, m) => sum + m.videos.length, 0);
console.log(`✅ Videos generated: ${moduleVideos.length} modules, ${totalVideos} videos → ${jsonPath}`);
