# Quiz: REST API Design

<div class="quiz">

**1. Manakah endpoint yang PALING sesuai dengan prinsip REST untuk mengambil data user dengan ID 5?**

- [ ] `GET /getUser?id=5`
- [ ] `POST /users/5`
- [x] `GET /users/5`
- [ ] `GET /users?action=fetch&id=5`

**2. Metode HTTP mana yang digunakan untuk memperbarui sebagian data resource?**

- [x] `PATCH`
- [ ] `PUT`
- [ ] `POST`
- [ ] `DELETE`

**3. Dalam OpenAPI/Swagger, komponen `paths` digunakan untuk:**

- [ ] Mendefinisikan tipe data reusable
- [x] Mendefinisikan endpoint dan operasi API yang tersedia
- [ ] Menentukan server base URL
- [ ] Mengatur authentication scheme

**4. Response error yang tepat ketika validasi request gagal adalah:**

- [ ] `200 OK` dengan body `{ "error": "invalid" }`
- [ ] `500 Internal Server Error`
- [x] `400 Bad Request` dengan detail validasi
- [ ] `404 Not Found`

**5. Strategi pagination yang paling RESTful dan scalable adalah:**

- [ ] Page-based dengan nomor halaman
- [x] Cursor-based dengan token/link next
- [ ] Offset-based tanpa limit
- [ ] Mengembalikan semua data sekaligus

**6. API versioning via URL path yang paling umum digunakan:**

- [x] `/api/v1/users`
- [ ] `/api/users?version=1`
- [ ] `X-API-Version: 1` di header
- [ ] `/api/users/v1`

</div>
