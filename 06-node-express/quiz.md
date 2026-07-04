# Quiz: Node.js & Express

> Jawab pertanyaan di bawah dengan klik pilihan yang benar.

<div class="quiz">

**1. Express.js adalah...**

- [ ] Database untuk Node.js
- [x] Web framework minimalis untuk Node.js
- [ ] Compiler JavaScript
- [ ] Package manager

**2. Cara mendefinisikan route GET `/users` di Express?**

- [ ] `app.get("/users")`
- [x] `app.get("/users", (req, res) => { ... })`
- [ ] `app.use("/users", "GET")`
- [ ] `route.get("/users")`

**3. Middleware di Express adalah fungsi yang memiliki akses ke...**

- [x] `req`, `res`, dan `next`
- [ ] `req` dan `res` saja
- [ ] `err`, `req`, `res`, `next`
- [ ] `data` dan `callback`

**4. `res.json()` digunakan untuk...**

- [ ] Mengirim file HTML
- [x] Mengirim response dalam format JSON
- [ ] Mengirim error
- [ ] Mengirim file statis

**5. REST API menggunakan method HTTP. Method mana untuk membuat resource baru?**

- [ ] GET
- [x] POST
- [ ] PUT
- [ ] DELETE

**6. Port default untuk Express development server biasanya...**

- [ ] 80
- [ ] 443
- [x] 3000
- [ ] 8080

**7. ORM/Query Builder populer untuk database SQL di Node.js?**

- [ ] Mongoose
- [x] Prisma / Knex
- [ ] Axios
- [ ] Lodash

**8. Migration pada database berfungsi untuk...**

- [ ] Backup data
- [x] Mengelola perubahan skema database secara versioned
- [ ] Mempercepat query
- [ ] Menghapus data duplikat

**9. Environment variable di Node.js diakses melalui...**

- [ ] `env.PORT`
- [x] `process.env.PORT`
- [ ] `config.env.PORT`
- [ ] `global.env.PORT`

**10. `app.use(express.json())` berguna untuk...**

- [ ] Mengirim JSON response
- [x] Parse body request JSON menjadi objek JavaScript
- [ ] Validasi JSON
- [ ] Format JSON output

</div>
