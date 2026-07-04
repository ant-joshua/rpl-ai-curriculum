# Quiz: Docker & Containerization

<div class="quiz">

**1. Apa itu Docker container?**

- [ ] Virtual machine lengkap dengan OS
- [x] Unit standar software yang mengemas kode dan semua dependensinya untuk berjalan konsisten di mana saja
- [ ] File konfigurasi jaringan
- [ ] Database server

**2. File apa yang digunakan untuk mendefinisikan cara build image Docker?**

- [ ] `docker-compose.yml`
- [x] `Dockerfile`
- [ ] `package.json`
- [ ] `Docker.conf`

**3. Perintah untuk build Docker image dari Dockerfile?**

- [ ] `docker run .`
- [x] `docker build -t nama-image .`
- [ ] `docker create .`
- [ ] `docker compile .`

**4. Apa fungsi multi-stage build di Dockerfile?**

- [ ] Build banyak image sekaligus
- [x] Memisahkan environment build dan runtime untuk menghasilkan image final yang lebih kecil
- [ ] Menjalankan container secara paralel
- [ ] Menggabungkan dua image jadi satu

**5. Perintah untuk menjalankan container berdasarkan image?**

- [ ] `docker build`
- [x] `docker run`
- [ ] `docker start`
- [ ] `docker exec`

**6. File `docker-compose.yml` digunakan untuk?**

- [ ] Build satu image saja
- [x] Mendefinisikan dan menjalankan multi-container Docker applications
- [ ] Menyimpan log container
- [ ] Mengatur network Docker

**7. Docker volume digunakan untuk?**

- [ ] Membatasi resource container
- [x] Menyimpan data persisten yang tetap ada meskipun container dihapus
- [ ] Mengatur port mapping
- [ ] Menjalankan container di background

**8. Perintah untuk melihat container yang sedang berjalan?**

- [ ] `docker ps -a`
- [x] `docker ps`
- [ ] `docker list`
- [ ] `docker status`

**9. Bagaimana cara menghubungkan dua container agar bisa berkomunikasi?**

- [ ] Copy IP dari satu container ke container lain
- [x] Membuat Docker network dan menghubungkan kedua container ke network yang sama
- [ ] Menggunakan file bersama
- [ ] Container otomatis terhubung

**10. Docker Registry seperti Docker Hub digunakan untuk?**

- [ ] Menjalankan container
- [ ] Build image
- [x] Menyimpan dan mendistribusikan Docker images
- [ ] Monitoring container

</div>
