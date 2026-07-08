# 📝 Bank Soal & Kuis RPL AI

> 35+ soal pilihan ganda mencakup semua modul RPL AI Curriculum.
> Dilengkapi kunci jawaban dan pembahasan singkat.

---

## 📋 Daftar Isi

| # | Modul | Jumlah Soal |
|---|-------|-------------|
| 1 | Fundamental Pemrograman & Web | 3 |
| 2 | JavaScript Fundamentals | 4 |
| 3 | TypeScript Basics | 3 |
| 4 | Web Basics (HTML/CSS/Tailwind) | 3 |
| 5 | Node.js & Express + Database SQL | 4 |
| 6 | Mastra AI — Agents, Tools, Memory & RAG | 4 |
| 7 | Git & GitHub + Deploy | 3 |
| 8 | Algoritma & Struktur Data | 3 |
| 9 | Testing — Vitest & Integration | 2 |
| 10 | System Design | 2 |
| 11 | Cybersecurity | 2 |
| 12 | Soft Skills & Professional | 2 |

---

## 1. Fundamental Pemrograman & Web

### Soal 1
Apa kepanjangan dari HTTP?

A. HyperText Transfer Protocol  
B. High Transfer Text Protocol  
C. HyperText Transmission Process  
D. Host Transfer Text Protocol  

**Jawaban: A**

**Pembahasan:** HTTP (HyperText Transfer Protocol) adalah protokol yang digunakan untuk komunikasi antara browser dan server web.

---

### Soal 2
Manakah yang BUKAN termasuk tipe data primitif di JavaScript?

A. String  
B. Number  
C. Object  
D. Boolean  

**Jawaban: C**

**Pembahasan:** Object bukan tipe data primitif. Tipe data primitif di JavaScript adalah string, number, boolean, null, undefined, symbol, dan bigint. Object adalah tipe data reference.

---

### Soal 3
Apa fungsi dari tag `<meta name="viewport">` di HTML?

A. Mengatur ukuran font website  
B. Mengatur tampilan website agar responsive di mobile  
C. Menambahkan meta data untuk SEO  
D. Menghubungkan file CSS eksternal  

**Jawaban: B**

**Pembahasan:** Tag `<meta name="viewport">` mengatur bagaimana halaman web ditampilkan di perangkat mobile. Tanpa tag ini, website akan tampil terlalu kecil di HP.

---

## 2. JavaScript Fundamentals

### Soal 4
Apa output dari kode berikut?
```javascript
console.log(typeof "Hello");
```

A. `"string"`  
B. `string`  
C. `"Hello"`  
D. `undefined`  

**Jawaban: B**

**Pembahasan:** `typeof` mengembalikan string yang menunjukkan tipe data. Outputnya adalah `"string"` (sebuah string). Tapi karena console.log menampilkan nilai, hasilnya adalah `string` (tanpa kutip di console).

---

### Soal 5
Apa bedanya `==` dan `===` di JavaScript?

A. `==` untuk angka, `===` untuk string  
B. `==` membandingkan nilai saja, `===` membandingkan nilai dan tipe data  
C. `==` untuk perbandingan, `===` untuk assignment  
D. Tidak ada bedanya  

**Jawaban: B**

**Pembahasan:** `==` (loose equality) melakukan type coercion sebelum membandingkan. Contoh: `5 == "5"` → true. `===` (strict equality) membandingkan nilai dan tipe data. `5 === "5"` → false.

---

### Soal 6
Apa yang dimaksud dengan closure di JavaScript?

A. Function yang tidak memiliki nama  
B. Function yang memiliki akses ke variable di outer scope-nya, bahkan setelah outer function selesai  
C. Function yang hanya bisa dipanggil sekali  
D. Function yang menerima function lain sebagai argument  

**Jawaban: B**

**Pembahasan:** Closure adalah kombinasi function dan lexical scope di mana function tersebut dibuat. Function "mengingat" scope-nya bahkan setelah outer function selesai dieksekusi.

---

### Soal 7
Apa output dari kode berikut?
```javascript
console.log(Boolean("false"));
```

A. `false`  
B. `true`  
C. `undefined`  
D. `Error`  

**Jawaban: B**

**Pembahasan:** String `"false"` adalah truthy value karena bukan string kosong. Boolean() mengonversi nilai ke boolean. Semua string non-kosong adalah truthy.

---

## 3. TypeScript Basics

### Soal 8
Apa perbedaan utama antara `interface` dan `type` di TypeScript?

A. `interface` bisa di-extend, `type` tidak bisa  
B. `type` bisa untuk union type, `interface` tidak bisa  
C. `interface` lebih cepat daripada `type`  
D. Tidak ada perbedaan  

**Jawaban: B**

**Pembahasan:** `type` bisa digunakan untuk union (`type Status = 'active' | 'inactive'`) dan intersection, sementara `interface` lebih cocok untuk object shapes dan bisa declaration merging. Keduanya bisa di-extend dengan cara berbeda.

---

### Soal 9
Apa fungsi dari generic type di TypeScript?

A. Membuat tipe data yang bisa menangani berbagai jenis tanpa kehilangan type safety  
B. Mempercepat kompilasi kode  
C. Menyembunyikan tipe data dari user  
D. Membuat kode lebih pendek  

**Jawaban: A**

**Pembahasan:** Generic type memungkinkan kita membuat function, class, atau interface yang bisa bekerja dengan berbagai tipe data namun tetap menjaga type safety. Contoh: `function identity<T>(arg: T): T { return arg; }`.

---

### Soal 10
Apa output dari kode TypeScript berikut?
```typescript
type User = { name: string; age: number };
const user: User = { name: "Budi", age: 17 };
console.log(user.name);
```

A. `"Budi"`  
B. `Budi`  
C. `undefined`  
D. Error kompilasi  

**Jawaban: B**

**Pembahasan:** Kode ini valid. Type `User` mendefinisikan object dengan property `name` (string) dan `age` (number). Object `user` sesuai dengan type tersebut, jadi `user.name` mengembalikan `"Budi"`.

---

## 4. Web Basics (HTML/CSS/Tailwind)

### Soal 11
Apa kepanjangan dari CSS?

A. Computer Style Sheets  
B. Cascading Style Sheets  
C. Creative Style Sheets  
D. Colorful Style Sheets  

**Jawaban: B**

**Pembahasan:** CSS adalah Cascading Style Sheets, bahasa yang digunakan untuk mengatur tampilan dan layout halaman web.

---

### Soal 12
Di CSS, properti apa yang digunakan untuk membuat layout dengan baris dan kolom?

A. `flexbox`  
B. `grid`  
C. `position`  
D. `display: block`  

**Jawaban: B**

**Pembahasan:** CSS Grid (`display: grid`) digunakan untuk membuat layout 2 dimensi (baris dan kolom). Flexbox untuk layout 1 dimensi (satu arah).

---

### Soal 13
Apa fungsi dari Tailwind CSS?

A. Framework CSS yang menyediakan utility class siap pakai  
B. Library JavaScript untuk animasi  
C. Database management tool  
D. Text editor untuk CSS  

**Jawaban: A**

**Pembahasan:** Tailwind CSS adalah utility-first CSS framework yang menyediakan class-class kecil (seperti `p-4`, `mt-2`, `flex`, `text-center`) yang bisa dikombinasikan langsung di HTML.

---

## 5. Node.js & Express + Database SQL

### Soal 14
Apa fungsi middleware di Express.js?

A. Function yang berjalan di antara request dan response  
B. Function untuk mengatur database  
C. Function untuk merender halaman HTML  
D. Function untuk mengirim file statis  

**Jawaban: A**

**Pembahasan:** Middleware adalah function yang memiliki akses ke request object, response object, dan fungsi `next()`. Middleware bisa melakukan logging, autentikasi, parsing body, error handling, dll.

---

### Soal 15
SQL query mana yang benar untuk mengambil semua user yang umurnya di atas 17 tahun?

A. `SELECT * FROM users WHERE age > 17`  
B. `SELECT * FROM users HAVING age > 17`  
C. `GET * FROM users WHERE age > 17`  
D. `FIND * FROM users WHERE age > 17`  

**Jawaban: A**

**Pembahasan:** `SELECT * FROM users WHERE age > 17` adalah syntax SQL yang benar. `HAVING` digunakan setelah `GROUP BY`, bukan untuk filtering baris biasa.

---

### Soal 16
Apa fungsi dari `JOIN` di SQL?

A. Menggabungkan data dari dua tabel berdasarkan relasi  
B. Menggabungkan dua database  
C. Membuat index baru  
D. Menambahkan kolom baru ke tabel  

**Jawaban: A**

**Pembahasan:** JOIN digunakan untuk menggabungkan baris dari dua atau lebih tabel berdasarkan kolom yang berelasi. Contoh: `SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id`.

---

### Soal 17
Apa yang dimaksud dengan `async/await` di JavaScript/Node.js?

A. Cara menulis kode synchronous yang terlihat asynchronous  
B. Cara menulis kode asynchronous yang terlihat synchronous  
C. Cara menjalankan kode secara paralel  
D. Cara menghentikan eksekusi kode  

**Jawaban: B**

**Pembahasan:** `async/await` adalah syntactic sugar di atas Promise. `async` menandai function sebagai asynchronous, `await` menunggu Promise selesai. Kode terlihat seperti synchronous sehingga lebih mudah dibaca.

---

## 6. Mastra AI — Agents, Tools, Memory & RAG

### Soal 18
Apa itu AI Agent dalam konteks Mastra?

A. Program AI yang bisa menggunakan tools, punya memory, dan mengeksekusi task secara autonomous  
B. Chatbot sederhana yang menjawab pertanyaan  
C. Alat untuk training model AI  
D. Database untuk menyimpan data AI  

**Jawaban: A**

**Pembahasan:** AI Agent adalah program yang menggunakan model AI (LLM) sebagai "otak", dilengkapi tools (functions), memory, dan kemampuan untuk mengeksekusi tugas secara mandiri.

---

### Soal 19
Apa kepanjangan RAG?

A. Retrieval Augmented Generation  
B. Random Access Generation  
C. Rapid Algorithm Generator  
D. Real-time AI Gateway  

**Jawaban: A**

**Pembahasan:** Retrieval Augmented Generation (RAG) adalah teknik di mana AI mengambil dokumen relevan dari database/knowledge base, lalu menggunakannya sebagai konteks untuk menghasilkan jawaban yang akurat.

---

### Soal 20
Manakah yang BUKAN termasuk komponen utama Mastra Agent?

A. Tools  
B. Memory  
C. Database SQL  
D. Instructions  

**Jawaban: C**

**Pembahasan:** Komponen utama Mastra Agent adalah: Instructions (persona/instruksi), Tools (fungsi yang bisa dipanggil), Memory (working memory), dan Model (LLM). Database SQL bukan komponen utama agent meski bisa diakses melalui tools.

---

### Soal 21
Dalam konteks Mastra, apa fungsi dari `createTool()`?

A. Membuat function/API yang bisa dipanggil oleh Agent  
B. Membuat user interface untuk Agent  
C. Membuat database baru  
D. Membuat model AI baru  

**Jawaban: A**

**Pembahasan:** `createTool()` digunakan untuk mendefinisikan tool (function) yang bisa digunakan oleh agent. Tool memiliki nama, deskripsi, schema input, dan executor (implementasi).

---

## 7. Git & GitHub + Deploy

### Soal 22
Apa perintah Git untuk menyimpan perubahan ke repository lokal?

A. `git push`  
B. `git commit`  
C. `git save`  
D. `git store`  

**Jawaban: B**

**Pembahasan:** `git commit` menyimpan perubahan yang sudah di-stage ke repository lokal. `git push` mengirim perubahan ke repository remote (GitHub).

---

### Soal 23
Apa fungsi dari branch di Git?

A. Membuat salinan kode yang terpisah dari branch utama untuk pengembangan fitur  
B. Menghapus kode yang tidak digunakan  
C. Menggabungkan dua repository  
D. Menyimpan konfigurasi pengguna  

**Jawaban: A**

**Pembahasan:** Branch memungkinkan developer bekerja pada fitur terpisah tanpa mengganggu kode di branch utama (main/master). Setelah selesai, branch bisa di-merge.

---

### Soal 24
Platform mana yang digunakan untuk deploy frontend React secara gratis?

A. Vercel  
B. PostgreSQL  
C. MongoDB  
D. Docker  

**Jawaban: A**

**Pembahasan:** Vercel adalah platform deploy untuk frontend yang terintegrasi dengan GitHub. Gratis untuk project personal. Railway untuk backend.

---

## 8. Algoritma & Struktur Data

### Soal 25
Struktur data apa yang menggunakan prinsip LIFO (Last In, First Out)?

A. Queue  
B. Stack  
C. Array  
D. Tree  

**Jawaban: B**

**Pembahasan:** Stack menggunakan prinsip LIFO — elemen terakhir yang dimasukkan adalah yang pertama dikeluarkan. Seperti tumpukan piring. Queue menggunakan FIFO.

---

### Soal 26
Apa kompleksitas waktu dari Binary Search?

A. O(1)  
B. O(log n)  
C. O(n)  
D. O(n²)  

**Jawaban: B**

**Pembahasan:** Binary Search memiliki kompleksitas waktu O(log n) karena setiap iterasi memotong setengah data yang dicari. Ini yang membuatnya sangat efisien untuk data terurut.

---

### Soal 27
Apa yang dimaksud dengan rekursi?

A. Function yang memanggil dirinya sendiri  
B. Function yang memanggil function lain  
C. Loop yang tidak pernah berhenti  
D. Function tanpa parameter  

**Jawaban: A**

**Pembahasan:** Rekursi adalah teknik di mana sebuah function memanggil dirinya sendiri. Setiap pemanggilan harus mendekati base case untuk menghindari infinite loop.

---

## 9. Testing — Vitest & Integration

### Soal 28
Apa tujuan dari Unit Test?

A. Menguji unit terkecil dari kode (function/class) secara terisolasi  
B. Menguji seluruh aplikasi dari frontend ke backend  
C. Menguji performa aplikasi  
D. Menguji keamanan aplikasi  

**Jawaban: A**

**Pembahasan:** Unit Test menguji unit terkecil dari kode — biasanya sebuah function atau class — secara terisolasi dari dependensi eksternal.

---

### Soal 29
Apa fungsi dari `supertest` di testing Express.js?

A. Library untuk melakukan HTTP request dalam test  
B. Library untuk mocking database  
C. Library untuk mengukur coverage  
D. Library untuk format kode  

**Jawaban: A**

**Pembahasan:** Supertest adalah library yang memungkinkan kita melakukan HTTP request ke aplikasi Express dalam test environment. Cocok untuk integration testing API.

---

## 10. System Design

### Soal 30
Apa fungsi dari load balancer dalam arsitektur sistem?

A. Mendistribusikan traffic ke beberapa server  
B. Menyimpan data sementara  
C. Mengamankan server dari serangan  
D. Mengompres data sebelum dikirim  

**Jawaban: A**

**Pembahasan:** Load balancer mendistribusikan incoming traffic ke beberapa server backend untuk mencegah overload pada satu server. Meningkatkan availability dan reliability.

---

### Soal 31
Manakah yang termasuk strategi caching di sistem terdistribusi?

A. Redis cache  
B. SQL injection  
C. Binary search  
D. Recursive function  

**Jawaban: A**

**Pembahasan:** Redis adalah in-memory data store yang sering digunakan untuk caching. Caching menyimpan data yang sering diakses di memory agar response lebih cepat.

---

## 11. Cybersecurity

### Soal 32
Apa itu SQL Injection?

A. Serangan dengan menyisipkan query SQL berbahaya melalui input user  
B. Teknik mempercepat query SQL  
C. Cara menyimpan password di database  
D. Metode backup database  

**Jawaban: A**

**Pembahasan:** SQL Injection adalah kerentanan keamanan di mana attacker menyisipkan query SQL jahat melalui input field. Contoh: input `' OR 1=1 --` bisa mengakses data tanpa autentikasi.

---

### Soal 33
Apa cara terbaik menyimpan password di database?

A. Disimpan dalam plain text  
B. Di-hash dengan bcrypt  
C. Di-encode dengan Base64  
D. Disimpan di file teks terpisah  

**Jawaban: B**

**Pembahasan:** Password harus di-hash menggunakan algoritma hashing yang kuat seperti bcrypt. Bcrypt menggunakan salt secara otomatis dan lambat secara komputasi sehingga sulit di-crack.

---

## 12. Soft Skills & Professional

### Soal 34
Apa metode yang tepat untuk menjawab pertanyaan behavioral di interview?

A. Langsung menyebutkan kelebihan diri  
B. Menggunakan metode STAR (Situation, Task, Action, Result)  
C. Menjawab dengan singkat "Saya bisa"  
D. Menyalahkan orang lain atas kegagalan  

**Jawaban: B**

**Pembahasan:** Metode STAR adalah struktur menjawab pertanyaan behavioral: Situation (konteks), Task (tugas), Action (tindakan), Result (hasil). Ini memberikan jawaban yang terstruktur dan meyakinkan.

---

### Soal 35
Apa yang paling penting dalam portfolio seorang developer junior?

A. Desain yang sangat cantik  
B. Banyak sertifikat  
C. Project yang berfungsi, terdeploy, dan bisa dilihat orang lain  
D. Foto profil yang bagus  

**Jawaban: C**

**Pembahasan:** Portfolio yang baik adalah project yang berfungsi (live demo), ter-deploy, dan ada link GitHub-nya. HR dan technical interviewer ingin melihat kemampuan coding nyata, bukan hanya screenshot atau sertifikat.

---

## Kunci Jawaban Cepat

| No | Jawaban | No | Jawaban | No | Jawaban | No | Jawaban |
|----|---------|----|---------|----|---------|----|---------|
| 1 | A | 11 | B | 21 | A | 31 | A |
| 2 | C | 12 | B | 22 | B | 32 | A |
| 3 | B | 13 | A | 23 | A | 33 | B |
| 4 | B | 14 | A | 24 | A | 34 | B |
| 5 | B | 15 | A | 25 | B | 35 | C |
| 6 | B | 16 | A | 26 | B | 36 | A |
| 7 | B | 17 | B | 27 | A | 37 | A |
| 8 | B | 18 | A | 28 | A | 38 | B |
| 9 | A | 19 | A | 29 | A | 39 | B |
| 10 | B | 20 | C | 30 | A | 40 | A |
| 41 | A | 42 | A | 43 | A | 44 | A |
| 45 | A | 46 | A | 47 | A | 48 | A |
| 49 | A | 50 | A | | | | |

---

## 📊 Distribusi Soal

| Modul | Jumlah |
|-------|--------|
| Fundamental & Web | 3 |
| JavaScript | 4 |
| TypeScript | 3 |
| HTML/CSS/Tailwind | 3 |
| Node.js & Express & SQL | 4 |
| Mastra AI | 5 |
| Git & Deploy | 5 |
| Algoritma & Data Structure | 5 |
| Testing | 4 |
| System Design | 3 |
| Cybersecurity | 2 |
| UI/UX | 1 |
| Business & Monetization | 1 |
| Docker & Deployment | 4 |
| Soft Skills | 3 |
| **Total** | **50** |

---

## 🧩 Additional Questions

### Docker & Deployment

**Soal 36**
Apa fungsi dari Dockerfile?

A. Menentukan cara build Docker image  
B. Menjalankan container  
C. Mengatur network container  
D. Menyimpan log container  

**Jawaban: A**

**Pembahasan:** Dockerfile adalah file konfigurasi yang berisi instruksi untuk membangun Docker image, seperti base image, install dependencies, copy file, dan menentukan command yang dijalankan.

---

**Soal 37**
Apa perintah untuk menjalankan container berdasarkan docker-compose.yml?

A. `docker compose up`  
B. `docker run compose`  
C. `docker start compose`  
D. `docker container up`  

**Jawaban: A**

**Pembahasan:** `docker compose up` membaca file docker-compose.yml, membangun image (jika perlu), dan menjalankan semua service yang didefinisikan.

---

### Algoritma & Struktur Data

**Soal 38**
Struktur data apa yang paling tepat untuk implementasi antrian (queue)?

A. Stack  
B. Linked List  
C. Tree  
D. Hash Table  

**Jawaban: B**

**Pembahasan:** Linked list cocok untuk queue karena operasi enqueue (tambah di akhir) dan dequeue (hapus dari awal) bisa O(1). Stack menggunakan LIFO, bukan FIFO seperti queue.

---

**Soal 39**
Apa kompleksitas waktu average case dari Quick Sort?

A. O(n)  
B. O(n log n)  
C. O(n²)  
D. O(log n)  

**Jawaban: B**

**Pembahasan:** Quick Sort memiliki kompleksitas rata-rata O(n log n). Worst case O(n²) terjadi ketika pivot dipilih tidak seimbang (sorted array dengan pivot pertama/terakhir).

---

**Soal 40**
Apa yang dimaksud dengan algoritma greedy?

A. Algoritma yang mengambil keputusan terbaik saat ini tanpa memikirkan konsekuensi masa depan  
B. Algoritma yang mencoba semua kemungkinan  
C. Algoritma yang membagi masalah menjadi sub-masalah  
D. Algoritma yang menggunakan randomness  

**Jawaban: A**

**Pembahasan:** Greedy algorithm membuat pilihan optimal lokal dengan harapan mengarah ke solusi optimal global. Contoh: coin change dengan mata uang standar, Huffman coding, Dijkstra's algorithm.

---

### AI / Mastra

**Soal 41**
Apa fungsi dari embeddings dalam konteks RAG?

A. Mengubah teks menjadi representasi vektor numerik  
B. Menyimpan teks di database  
C. Meng-compress teks  
D. Meng-enkripsi teks  

**Jawaban: A**

**Pembahasan:** Embeddings mengubah teks menjadi vektor angka (array of numbers) yang merepresentasikan makna semantik. Vektor ini digunakan untuk mencari dokumen yang mirip secara semantik di database vektor.

---

**Soal 42**
Apa yang dimaksud dengan "chunking" dalam RAG pipeline?

A. Memecah dokumen besar menjadi potongan-potongan kecil  
B. Menggabungkan beberapa dokumen  
C. Menghapus dokumen yang tidak relevan  
D. Mengubah format dokumen  

**Jawaban: A**

**Pembahasan:** Chunking adalah proses memecah dokumen besar menjadi segmen-segmen kecil (chunks) sebelum di-embedding. Ukuran chunk yang ideal biasanya 256-1024 token. Chunking yang baik meningkatkan kualitas retrieval.

---

### Git lanjutan

**Soal 43**
Apa fungsi dari `git rebase`?

A. Memindahkan atau menggabungkan rangkaian commit ke base baru  
B. Menghapus branch  
C. Mengembalikan file ke versi sebelumnya  
D. Menggabungkan dua repository  

**Jawaban: A**

**Pembahasan:** `git rebase` mengambil commit dari branch saat ini dan "memindahkan"-nya ke ujung branch lain. Hasilnya: history linear dan bersih. `git merge` sebaliknya, menyimpan history branching.

---

**Soal 44**
Apa perbedaan `git pull` dan `git fetch`?

A. `git fetch` hanya download perubahan, `git pull` download + merge  
B. `git pull` hanya download, `git fetch` download + merge  
C. Tidak ada perbedaan  
D. `git fetch` untuk branch, `git pull` untuk semua branch  

**Jawaban: A**

**Pembahasan:** `git fetch` mengunduh data dari remote repository tapi tidak mengubah working directory. `git pull` = `git fetch` + `git merge`, jadi langsung menggabungkan perubahan ke branch lokal.

---

### UI/UX

**Soal 45**
Apa kepanjangan dari UX?

A. User Experience  
B. User Extension  
C. Universal X  
D. Unified XML  

**Jawaban: A**

**Pembahasan:** UX (User Experience) adalah keseluruhan pengalaman pengguna saat berinteraksi dengan produk atau layanan. Mencakup kemudahan penggunaan, efisiensi, dan kepuasan.

---

### Business & Monetization

**Soal 46**
Apa model bisnis di mana aplikasi gratis tapi ada pembelian di dalam aplikasi?

A. Freemium  
B. Subscription  
C. Advertising  
D. One-time purchase  

**Jawaban: A**

**Pembahasan:** Freemium adalah model bisnis di mana fitur dasar diberikan gratis, sementara fitur premium berbayar. Contoh: Spotify (gratis dengan iklan, premium tanpa iklan).

---

### Soft Skills

**Soal 47**
Apa yang dimaksud dengan "rubber duck debugging"?

A. Menjelaskan masalah kode ke obyek (boneka bebek) untuk menemukan solusi  
B. Debugging menggunakan AI  
C. Debugging dengan rubber duck sebagai tool  
D. Nama tools debugging  

**Jawaban: A**

**Pembahasan:** Rubber duck debugging adalah teknik di mana programmer menjelaskan kode mereka baris per baris ke obyek (bisa boneka bebek, teman, atau kucing). Proses menjelaskan sering membantu menemukan bug.

---

### System Design

**Soal 48**
Apa keuntungan utama microservices dibanding monolithic?

A. Independent deployment dan scaling per service  
B. Lebih sedikit code  
C. Database lebih sederhana  
D. Testing lebih mudah  

**Jawaban: A**

**Pembahasan:** Microservices memungkinkan setiap service di-deploy, di-scale, dan di-maintain secara independen. Tim bisa kerja di service berbeda tanpa saling mengganggu.

---

### Docker

**Soal 49**
Apa perbedaan Docker image dan Docker container?

A. Image adalah template, container adalah instance jalan  
B. Container adalah template, image adalah instance  
C. Image untuk development, container untuk production  
D. Tidak ada perbedaan  

**Jawaban: A**

**Pembahasan:** Docker image adalah file read-only yang berisi instruksi untuk membuat container. Container adalah instance yang berjalan dari sebuah image. Image bisa digunakan untuk membuat banyak container.

---

### Testing

**Soal 50**
Apa itu test coverage?

A. Persentase kode yang dijalankan oleh test  
B. Jumlah test yang ditulis  
C. Waktu yang dibutuhkan test  
D. Jumlah bug yang ditemukan  

**Jawaban: A**

**Pembahasan:** Test coverage mengukur seberapa banyak kode (baris, branch, function) yang dieksekusi saat test dijalankan. Target coverage minimal 70% untuk production code.

1. **Baca soal dua kali** — pastikan paham apa yang ditanya
2. **Eliminasi jawaban yang pasti salah** — biasanya ada 2 jawaban yang jelas tidak masuk akal
3. **Perhatikan keyword** — kata seperti "BUKAN", "kecuali", "paling tepat" sangat penting
4. **Jangan terburu-buru** — 1-2 menit per soal cukup
5. **Review jawaban ragu** — tandai soal yang tidak yakin, kembali setelah selesai

---

Selamat mengerjakan! 🎯
