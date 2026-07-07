# Week 06: Auth — Login/Register dengan JWT & Role-Based Access

## Tujuan

Membangun sistem **autentikasi dan otorisasi** menggunakan JWT (JSON Web Token) di Express.js. Challenge ini mencakup registrasi, login, protected routes, dan role-based access control.

## Acceptance Criteria

- [ ] **POST /auth/register** — mendaftarkan user baru (name, email, password)
- [ ] **POST /auth/login** — login, mengembalikan JWT token
- [ ] Password di-hash dengan **bcrypt** (minimal 10 salt rounds)
- [ ] **GET /auth/me** — mengembalikan data user yang sedang login (protected)
- [ ] **Middleware `authenticate`** — memverifikasi JWT dari header Authorization
- [ ] **Middleware `authorize`** — memeriksa role user
- [ ] Minimal 2 role: `admin` dan `user`
- [ ] Route khusus admin: `GET /admin/users` — daftar semua user
- [ ] Validasi input: email format valid, password min 6 karakter
- [ ] Error handling: 401 untuk token invalid/expired, 403 untuk role salah

## Step-by-Step

1. **Setup project**
   ```bash
   mkdir -p challenges/submissions/week-06/nama-kamu
   cd challenges/submissions/week-06/nama-kamu
   npm init -y
   npm install express jsonwebtoken bcrypt cors
   ```
2. **Buat struktur file**
   ```
   .
   ├── app.js
   ├── auth/
   │   ├── routes.js
   │   ├── middleware.js
   │   └── controller.js
   └── data/
       └── users.js     (in-memory user array)
   ```
3. **Model user**
   ```js
   {
     id: 1,
     name: "Budi",
     email: "budi@email.com",
     password: "$2b$10$...",  // hash bcrypt
     role: "user"              // "admin" | "user"
   }
   ```
4. **Register** (`POST /auth/register`)
   - Validasi: email sudah terdaftar? → 409 Conflict
   - Hash password dengan bcrypt
   - Simpan user (push ke array)
   - Jangan return password di response
5. **Login** (`POST /auth/login`)
   - Cari user by email
   - Compare password dengan bcrypt
   - Generate JWT: `jwt.sign({ id, role }, SECRET, { expiresIn: '1h' })`
6. **Authenticate middleware**
   ```js
   function authenticate(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ message: 'Token required' });
     try {
       const decoded = jwt.verify(token, SECRET);
       req.user = decoded;
       next();
     } catch (err) {
       return res.status(401).json({ message: 'Invalid or expired token' });
     }
   }
   ```
7. **Authorize middleware**
   ```js
   function authorize(...roles) {
     return (req, res, next) => {
       if (!roles.includes(req.user.role)) {
         return res.status(403).json({ message: 'Forbidden' });
       }
       next();
     };
   }
   ```
8. **Route admin** (`GET /admin/users`)
   ```js
   router.get('/users', authenticate, authorize('admin'), (req, res) => { ... });
   ```

### Contoh Request

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi","email":"budi@email.com","password":"rahasia123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@email.com","password":"rahasia123"}'
# Response: { token: "eyJhbGciOiJIUzI1NiIs..." }

# Akses protected route
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Bonus (Optional)

- ✅ **Refresh token** (JWT dengan short access + long refresh)
- ✅ **Logout** dengan blacklist token (in-memory set)
- ✅ **Rate limiting** untuk endpoint login (express-rate-limit)
- ✅ Simpan secret JWT di `.env` file (pakai `dotenv`)

## Submission

```
challenges/submissions/week-06/nama-kamu/
├── app.js
├── auth/
│   ├── routes.js
│   ├── middleware.js
│   └── controller.js
├── .env (contoh, tanpa secret real)
└── package.json
```

Buat Pull Request dengan judul `[Week 06] JWT Auth - Nama Kamu`.
