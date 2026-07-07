# Week 09: Testing — Unit & Integration Test dengan Vitest

## Tujuan

Menulis **unit test** dan **integration test** untuk REST API Express (dari Week 03 atau Week 06) menggunakan **Vitest** dan **Supertest**.

## Acceptance Criteria

- [ ] Menggunakan **Vitest** sebagai test runner
- [ ] Menggunakan **Supertest** untuk HTTP testing
- [ ] Minimal **5 test cases** untuk unit test (fungsi helper/utility)
- [ ] Minimal **5 test cases** untuk integration test (endpoint API)
- [ ] Test mencakup **happy path** dan **error path**
- [ ] Test bisa dijalankan dengan `npx vitest run`
- [ ] Semua test **PASS** (0 failed)
- [ ] Test tidak bergantung pada environment eksternal (gunakan in-memory atau mock)
- [ ] Coverage report minimal 70% (opsional, tapi dianjurkan)

## Step-by-Step

1. **Setup project test**
   ```bash
   mkdir -p challenges/submissions/week-09/nama-kamu
   cd challenges/submissions/week-09/nama-kamu
   npm init -y
   npm install express
   npm install -D vitest supertest
   ```
2. **Copy aplikasi** dari Week 03 (CRUD Buku) atau buat ulang
3. **Buat file test** `tests/buku.test.js`
4. **Unit test — fungsi helper**
   ```js
   // Misal: fungsi validasi buku
   describe('validateBuku()', () => {
     it('should return true for valid buku', () => {
       const result = validateBuku({ judul: 'A', pengarang: 'B' });
       expect(result.valid).toBe(true);
     });

     it('should return false if judul missing', () => {
       const result = validateBuku({ pengarang: 'B' });
       expect(result.valid).toBe(false);
     });

     it('should return error message for empty pengarang', () => {
       const result = validateBuku({ judul: 'A', pengarang: '' });
       expect(result.message).toContain('pengarang');
     });
   });
   ```
5. **Integration test — endpoint API**
   ```js
   import { describe, it, expect } from 'vitest';
   import supertest from 'supertest';
   import app from '../app.js';

   const request = supertest(app);

   describe('GET /buku', () => {
     it('should return empty array initially', async () => {
       const res = await request.get('/buku');
       expect(res.status).toBe(200);
       expect(res.body.success).toBe(true);
       expect(res.body.data).toEqual([]);
     });
   });

   describe('POST /buku', () => {
     it('should create a new buku', async () => {
       const res = await request.post('/buku').send({
         judul: 'Test Book',
         pengarang: 'Test Author',
         tahun: 2024,
       });
       expect(res.status).toBe(201);
       expect(res.body.data.judul).toBe('Test Book');
     });

     it('should return 400 if judul missing', async () => {
       const res = await request.post('/buku').send({
         pengarang: 'Test Author',
       });
       expect(res.status).toBe(400);
       expect(res.body.success).toBe(false);
     });
   });

   describe('DELETE /buku/:id', () => {
     it('should return 404 for non-existent buku', async () => {
       const res = await request.delete('/buku/999');
       expect(res.status).toBe(404);
     });
   });
   ```
6. **Konfigurasi Vitest** — buat `vitest.config.js` atau set di `package.json`
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest"
     }
   }
   ```
7. **Jalankan test**
   ```bash
   npx vitest run
   ```

### Contoh Output

```bash
✓ tests/buku.test.js (6 tests) 124ms

Test Files  1 passed (1)
     Tests  6 passed (6)
  Duration  168ms
```

## Bonus (Optional)

- ✅ **Coverage report**: `vitest run --coverage`
- ✅ **Mock external module** (vi.mock untuk database)
- ✅ **Test database reset** setiap jalan (beforeEach)
- ✅ **GitHub Actions** — auto-run test di setiap push

## Submission

```
challenges/submissions/week-09/nama-kamu/
├── app.js
├── tests/
│   ├── buku.test.js
│   └── helper.test.js (jika ada)
├── vitest.config.js
└── package.json
```

Buat Pull Request dengan judul `[Week 09] Testing - Nama Kamu`. Sertakan screenshot hasil test (semua PASS).
