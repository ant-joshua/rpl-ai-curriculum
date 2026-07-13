# Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare Pages                    │
│  ┌─────────────────────────────────────────────────┐ │
│  │              SvelteKit App (worker)              │ │
│  │                                                   │ │
│  │  ┌──────────┐  ┌─────────┐  ┌───────────────┐   │ │
│  │  │ Auth     │  │ Server  │  │ Client        │   │ │
│  │  │ Middleware│  │ Load    │  │ Pages         │   │ │
│  │  │ hooks    │  │ Functions│  │ + Components  │   │ │
│  │  │ .server  │  │ +server │  │ + Runes       │   │ │
│  │  └──────────┘  │ .ts     │  └───────────────┘   │ │
│  │                 └─────────┘                       │ │
│  └─────────────────────────────────────────────────┘ │
│                           │                           │
│              ┌────────────┼────────────┐              │
│              ▼            ▼            ▼              │
│  ┌──────────────┐ ┌───────────┐ ┌──────────┐        │
│  │  D1 Database  │ │  R2 Assets│ │ 9router  │        │
│  │  (SQLite)     │ │  (images) │ │ AI API   │        │
│  └──────────────┘ └───────────┘ └──────────┘        │
└─────────────────────────────────────────────────────┘
```

## Auth Flow

```
User → /api/auth/oauth (POST)
  └──→ Generate session token
       └──→ Store in D1 sessions table
            └──→ Return Bearer token

User → Admin API (GET /api/admin/*)
  └──→ hooks.server.ts intercepts
       ├──→ parse Bearer token
       ├──→ validate session
       ├──→ check user.role IN ('superadmin','admin')
       └──→ pass through or 401/403

User → OAuth (Google/GitHub)
  └──→ Redirect to provider
       └──→ Callback creates/updates user
            └──→ Generates session token
```

## Agent Loop (for AI Tutor)

```
User message → LLM generates response
  └──→ If needs tool call (e.g. lesson lookup)
       └──→ Execute tool
            └──→ Feed result back to LLM
                 └──→ Generate final answer
```

## Component Tree

```
+layout.svelte
├── NotificationBell (top bar)
└── Admin sidebar / Main content
    ├── admin/analytics (dashboard)
    ├── admin/courses (CRUD)
    ├── admin/lessons (CRUD)
    ├── admin/users (role management)
    ├── admin/prerequisites (chains)
    ├── admin/badges (achievements)
    ├── admin/gradebook (grading)
    └── learn/[offeringId]
        ├── +page (course overview)
        └── lessons/[slug]
            ├── ContentRenderer
            │   ├── TextContent
            │   ├── VideoContent
            │   ├── CodeContent
            │   ├── EmbedContent
            │   └── QuizContent
            └── DiscussionPanel (bottom)
```

## Route Design

```
/api/admin/*       → Admin CRUD (auth required)
/api/auth/*        → Public OAuth endpoints
/api/lessons/*     → Authenticated lesson access
/api/notifications → Authenticated notifications
/api/my/*          → Student data (grades, badges)
/api/threads/*     → Discussion threads

/admin/*           → Admin UI pages
/learn/*           → Student course pages
/my/*              → Student profile pages
```
