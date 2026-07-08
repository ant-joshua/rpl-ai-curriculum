# 01 — Docker Basics: Kontainer Pertamamu

> **Durasi:** 2 JP (90 menit)

---

## Tujuan Pembelajaran

Setelah sesi ini, siswa mampu:

- Menjelaskan apa itu Docker dan perbedaan kontainer vs VM
- Menginstall Docker di sistem masing-masing
- Menjalankan kontainer pertama dengan `docker run hello-world`
- Membedakan konsep **image** dan **container**
- Menggunakan perintah dasar Docker: `ps`, `images`, `pull`, `run`, `stop`, `rm`

---

## 1. Apa Itu Docker?

Docker adalah platform untuk **mengemas aplikasi + dependensi** ke dalam **kontainer**. Kontainer = lingkungan terisolasi yang bisa jalan di mana aja — laptop developer, server produksi, atau cloud.

Docker menyelesaikan masalah klasik: *"Works on my machine"*. Dengan Docker, aplikasi jalan sama persis di semua lingkungan karena semua dependensi sudah dikemas rapi.

### Arsitektur Docker

Docker menggunakan arsitektur **client-server**:

```
┌─────────────┐     perintah      ┌────────────────┐
│  Docker CLI  │ ──────────────→  │  Docker Daemon  │
│  (docker)    │ ←──────────────  │  (dockerd)      │
└─────────────┘                   └───────┬────────┘
                                          │
                                   ┌──────▼──────┐
                                   │   Registry   │
                                   │ (Docker Hub) │
                                   └─────────────┘
```

- **Docker Daemon** (`dockerd`) — service yang jalan di background, urus kontainer
- **Docker CLI** (`docker`) — alat baris perintah buat ngobrol sama daemon
- **Docker Registry** — tempat nyimpen image (default: Docker Hub)
- **Docker Hub** — registry publik dengan jutaan image siap pakai

### Kontainer vs VM (Virtual Machine)

Perbedaan mendasar antara kontainer dan VM:

| Aspek | Kontainer (Docker) | Virtual Machine |
|-------|-------------------|----------------|
| OS | Pakai kernel host | Punya OS tamu sendiri |
| Ukuran | MB | GB |
| Boot | Detik | Menit |
| Isolasi | Proses-level | Hardware-level |
| Resource | Ringan | Berat (butuh RAM/CPU dedicated) |

**Analogi:**
- **VM** = rumah penuh — setiap rumah punya fondasi, listrik, pipa sendiri
- **Kontainer** = apartemen — satu gedung, satu fondasi, tiap unit terpisah tapi pakai infrastruktur bareng

### Kernel Sharing

Kontainer **tidak punya OS sendiri**. Semua kontainer di host yang sama pakai kernel Linux yang sama. Ini yang bikin kontainer:
- **Cepat boot** — tinggal jalanin proses, nggak perlu boot OS
- **Ringan** — ukuran image hanya berisi binary + dependensi, bukan OS utuh
- **Efisien** — RAM dipakai bareng, nggak duplikasi per kontainer

> ⚠️ **Catatan:** Di Windows/macOS, Docker jalan di dalam VM Linux kecil (pakai WSL2 atau HyperKit). Tapi pengalaman pakainya sama.

---

## 2. Install Docker

### Linux (Ubuntu/Debian)

```bash
# Hapus versi lama (kalau ada)
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependensi
sudo apt update
sudo apt install ca-certificates curl gnupg

# Tambah GPG key Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Tambah repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verifikasi
sudo docker run hello-world
```

### Windows (WSL2)

Pastikan WSL2 sudah terinstall. Install Docker Desktop for Windows dari [docker.com](https://www.docker.com/products/docker-desktop/), atau install langsung di WSL2 pakai script Linux di atas.

### macOS

Download Docker Desktop for Mac dari [docker.com](https://www.docker.com/products/docker-desktop/).

### Verifikasi Install

```bash
docker --version
# Output: Docker version 24.0.7, build afdd53b

docker info
# Info detail tentang instalasi Docker
```

---

## 3. Image vs Container

Dua konsep paling penting di Docker:

| Konsep | Analogi | Sifat |
|--------|---------|-------|
| **Image** | Class / template / resep kue | Read-only, nggak bisa diubah |
| **Container** | Instance / kue jadi | Bisa di-start, stop, hapus |

- **Image** = file read-only berisi instruksi + data untuk membuat kontainer
- **Container** = hasil jalanin image — lingkungan yang bisa ditulis
- Satu image bisa bikin **banyak container** (beda nama/port/config)

```bash
# Image ibarat ISO — template
# Container ibarat VM yang jalan dari ISO itu
```

---

## 4. Kontainer Pertama: `docker run hello-world`

```bash
docker run hello-world
```

Apa yang terjadi saat perintah di atas dijalankan:

1. Docker cek image `hello-world` di lokal
2. Kalau nggak ada, Docker **pull** dari Docker Hub
3. Docker bikin kontainer dari image itu
4. Kontainer jalan, print pesan, lalu mati

Output:

```
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.
```

---

## 5. Perintah Dasar Docker

### Kelola Image

```bash
# Lihat daftar image di lokal
docker images

# Download image tanpa jalanin
docker pull node:20-alpine

# Download image tertentu
docker pull nginx:alpine
docker pull postgres:16-alpine

# Hapus image
docker rmi hello-world
```

### Kelola Kontainer

```bash
# Jalanin kontainer
docker run nginx:alpine                        # foreground (terminal nempel)
docker run -d --name web-ku nginx:alpine       # background mode (-d = detach)
docker run -d --name app-ku -p 3000:3000 node:20-alpine sleep infinity

# Lihat kontainer yang jalan
docker ps

# Lihat semua kontainer (termasuk yang mati)
docker ps -a

# Stop kontainer
docker stop web-ku

# Start ulang kontainer yang mati
docker start web-ku

# Hapus kontainer
docker rm web-ku

# Hapus paksa kontainer yang jalan
docker rm -f web-ku

# Lihat log kontainer
docker logs web-ku
docker logs -f web-ku       # follow mode — streaming log

# Masuk ke shell kontainer
docker exec -it web-ku sh

# Copy file dari host ke kontainer
docker cp file.txt web-ku:/app/
```

### Contoh Lengkap — Jalanin Nginx

```bash
# Pull image nginx
docker pull nginx:alpine

# Jalanin kontainer nginx
docker run -d --name my-nginx -p 8080:80 nginx:alpine

# Cek apakah jalan
docker ps

# Buka browser: http://localhost:8080

# Lihat log
docker logs my-nginx

# Masuk shell
docker exec -it my-nginx sh

# Di dalam kontainer:
# ls /usr/share/nginx/html
# exit

# Stop & hapus
docker stop my-nginx
docker rm my-nginx
```

---

## 6. Latihan

1. **Hello World:** Jalanin `docker run hello-world`. Catat outputnya.
2. **Pull & Run:** Pull image `nginx:alpine`, jalanin sebagai kontainer dengan nama `web-test`, port `8080:80`. Akses di browser.
3. **Eksplorasi:** Jalanin `docker ps` saat kontainer jalan, `docker ps -a` setelah di-stop.
4. **Shell:** Masuk ke kontainer nginx dengan `docker exec -it web-test sh`. Cari file `index.html`.
5. **Cleanup:** Stop dan hapus semua kontainer. Hapus image `hello-world`.
6. **Diskusi perbedaan:** Kontainer vs VM — kenapa kontainer lebih ringan?

---

## Ringkasan

- Docker mengemas aplikasi + dependensi dalam **kontainer**
- Kontainer pakai kernel host → **ringan & cepat**
- **Image** = template read-only, **Container** = instance yang bisa jalan
- Arsitektur: CLI → Daemon → Registry
- Perintah dasar: `docker run`, `docker ps`, `docker images`, `docker pull`, `docker stop`, `docker rm`

---
<table>
<tr>
<td align="center"><a href="README.md">← Index Modul</a></td>
<td align="center"><a href="02-dockerfile-images.md">Lanjut ke Dockerfile & Images →</a></td>
</tr>
</table>
