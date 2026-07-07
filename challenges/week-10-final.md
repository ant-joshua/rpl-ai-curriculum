# Week 10: Final Challenge — Fullstack AI App

## Tujuan

Menggabungkan **semua materi** dari minggu 1–9 menjadi satu aplikasi **fullstack AI** yang lengkap dengan:
- Frontend React (dengan styling)
- Backend Express API
- Database SQLite / PostgreSQL
- Autentikasi JWT dengan role-based access
- Fitur AI agent dengan tools
- Docker container
- Unit & integration tests
- Deployed ke cloud

Ini adalah **puncak** dari program RPL AI Coding Challenge — portofolio project yang layak dipamerkan.

## Acceptance Criteria

### Wajib
- [ ] **Frontend React** (Vite) dengan halaman: Login, Register, Dashboard
- [ ] **Backend Express** dengan REST API
- [ ] **Database**: SQLite atau PostgreSQL
- [ ] **Autentikasi JWT**: register, login, logout
- [ ] **Role-based access**: admin dan user, dengan halaman berbeda
- [ ] **AI Agent** dengan minimal 2 tool (cuaca, kalkulator, atau search)
- [ ] **Dockerfile** untuk containerization
- [ ] **Unit test** + **Integration test** minimal 5 test cases
- [ ] **Deploy** ke Railway / Render / Vercel
- [ ] **README** lengkap: deskripsi, fitur, cara install & run, endpoint, screenshot

### Recommended Features
Pilih minimal 3 dari daftar berikut:
- CRUD Todo List (dari Week 05)
- Search & filter data
- Dashboard dengan chart/statistik
- Dark mode
- File upload
- Pagination
- Real-time update (WebSocket / SSE)
- Export data (CSV / PDF)

## Step-by-Step

1. **Setup monorepo**
   ```
   challenges/submissions/week-10/nama-kamu/
   ├── client/             (React frontend)
   ├── server/             (Express backend)
   ├── docker-compose.yml  (optional)
   ├── Dockerfile
   ├── .github/            (optional: CI/CD)
   └── README.md
   ```

2. **Backend** (Week 03 + Week 06 + Week 07)
   - Auth routes: register, login, me (JWT)
   - Protected CRUD routes untuk fitur utama
   - AI agent endpoint: `POST /api/agent/ask`
   - Role middleware: admin bisa manage users

3. **AI Agent Endpoint**
   ```js
   POST /api/agent/ask
   Body: { prompt: "Cuaca di Jakarta?" }
   Response: { reply: "Cuaca di Jakarta 28°C, cerah" }
   ```

4. **Frontend** (Week 05 + styling Week 01)
   - Halaman Login & Register
   - Dashboard dengan fitur utama
   - Halaman admin (manage users)
   - Halaman AI Agent (chat interface)
   - Integrasi API dengan fetch/axios

5. **Docker** (Week 08)
   - Multi-stage Dockerfile
   - Atau docker-compose untuk frontend + backend + database

6. **Testing** (Week 09)
   - Unit test untuk helper functions
   - Integration test untuk critical endpoints (auth, CRUD, agent)
   - Coverage minimal 60%

7. **Deployment** (Week 08)
   - Deploy backend ke Railway / Render
   - Deploy frontend ke Vercel
   - Atau deploy full-stack di satu platform

## Bonus (Optional)

- ✅ **CI/CD pipeline** dengan GitHub Actions (auto-test, auto-deploy)
- ✅ **WebSocket** untuk real-time chat dengan AI agent
- ✅ **Rate limiting** dan security headers (helmet)
- ✅ **Swagger / OpenAPI** documentation
- ✅ **Monitoring**: logging (winston/morgan) + error tracking
- ✅ Aksesibilitas (WCAG AA)

## Submission

```
challenges/submissions/week-10/nama-kamu/
├── client/
├── server/
├── tests/
├── Dockerfile
├── docker-compose.yml (optional)
├── .env.example
└── README.md
```

Buat Pull Request dengan judul `[Week 10] Final Project - Nama Kamu`. Sertakan:
- Screenshot aplikasi (min 3)
- Deploy URL
- Dokumentasi lengkap di README

> **Output:** Full Pull Request dengan semua komponen di atas
