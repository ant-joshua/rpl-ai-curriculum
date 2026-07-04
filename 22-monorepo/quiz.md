# Quiz: Monorepo & Tooling

<div class="quiz">

**1. Apa itu monorepo?**

- [ ] Repository dengan satu file codebase
- [x] Satu repository Git yang berisi banyak project/packages
- [ ] Repository yang hanya untuk frontend
- [ ] Repository yang di-host di server lokal

**2. Manakah BUKAN keuntungan monorepo?**

- [ ] Berbagi kode antar package lebih mudah
- [ ] Atomic commit (satu commit untuk perubahan di banyak package)
- [ ] Tooling terpusat (lint, test, build)
- [x] Setiap package harus punya repository sendiri

**3. Alat build system monorepo yang populer untuk JavaScript/TypeScript?**

- [ ] webpack
- [x] Turborepo / Nx
- [ ] Vite
- [ ] Parcel

**4. Fitur npm workspaces memungkinkan?**

- [ ] Menginstall semua package secara global
- [x] Mengelola multiple packages dalam satu repository dengan hoisting dependensi
- [ ] Menghapus node_modules
- [ ] Build hanya satu package

**5. Perintah npm untuk menambahkan dependency ke workspace tertentu?**

- [ ] `npm install package-name`
- [x] `npm install package-name --workspace=packages/nama`
- [ ] `npm run install packages/nama`
- [ ] `npm add package-name`

**6. Apa yang dimaksud dengan shared package dalam monorepo?**

- [ ] Package yang dibagikan ke publik
- [x] Package internal yang berisi kode bersama (UI components, utils, types) yang dipakai oleh package lain
- [ ] Package yang diinstal dari npm
- [ ] Package yang tidak pernah diubah

**7. Bagaimana cara menjalankan test untuk semua package di Turborepo?**

- [ ] Test satu per satu manual
- [x] `turbo run test` (dengan pipeline caching)
- [ ] `npm test --all`
- [ ] `yarn workspaces test`

**8. Manfaat caching di Turborepo?**

- [ ] Menyimpan kode source
- [x] Tidak perlu menjalankan ulang task jika input dan output tidak berubah (skip cache hit)
- [ ] Menyimpan dependency
- [ ] Backup repository

**9. Apa masalah umum pada monorepo tanpa tooling yang baik?**

- [ ] Terlalu banyak branch
- [x] Waktu CI/CD lama karena semua package di-build/test meskipun tidak berubah
- [ ] Repository terlalu kecil
- [ ] Dependency tidak bisa di-share

**10. CI/CD strategy yang tepat untuk monorepo?**

- [ ] Build seluruh monorepo setiap commit
- [x] Hanya build dan test package yang berubah (affected projects detection)
- [ ] Build hanya package utama
- [ ] Build manual

</div>
