# 30. Regex Filter 💀

**Level:** Sulit  
**Topik:** Regular Expression

## 🎯 Learning Objective
Menggunakan regex untuk memfilter dan memvalidasi data.

## 📝 Problem
Buat fungsi `filterEmail(daftar)` yang menerima array string dan mengembalikan hanya string yang **valid email** (mengandung `@` dan domain setelahnya, minimal format `user@domain.tld`).

## 🧪 Starter Code

```javascript
function filterEmail(daftar) {
  let regex = /.../;
  return daftar.filter(item => regex.test(item));
}

let data = [
  "budi@gmail.com",
  "halo dunia",
  "admin@school.sch.id",
  "bukan-email",
  "test@test",
  "user@domain.com"
];

console.log(filterEmail(data));
```

## ✅ Expected Output

```
[ 'budi@gmail.com', 'admin@school.sch.id', 'user@domain.com' ]
```

## 💡 Hint
Gunakan regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. `^` awal, `$` akhir, `test()` cek kecocokan.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function filterEmail(daftar) {
  let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return daftar.filter(item => regex.test(item));
}

let data = [
  "budi@gmail.com",
  "halo dunia",
  "admin@school.sch.id",
  "bukan-email",
  "test@test",
  "user@domain.com"
];

console.log(filterEmail(data));
```
</details>
