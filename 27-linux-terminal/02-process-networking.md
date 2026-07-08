# 02. Process & Networking

## Melihat Proses

```bash
# proses saat ini
ps aux
ps aux | grep nginx

# custom format
ps -eo pid,ppid,cmd,%cpu,%mem --sort=-%cpu | head -10
ps -eo pid,user,comm,lstart,etime

# snapshot real-time
top
htop          # prettier version (kalau ada)

# proses spesifik
pgrep nginx   # dapet PID
pidof nginx   # alternatif

# tree proses
pstree
pstree -p     # tampilkan PID juga
```

## Mengontrol Proses

```bash
# kill berdasarkan PID
kill 1234
kill -9 1234        # force kill (SIGKILL) — tidak bisa ditangkap
kill -15 1234       # graceful (SIGTERM) — default
kill -HUP 1234      # reload config (SIGHUP)
kill -USR1 1234     # signal user-defined (sering untuk log rotate)

# kill berdasarkan nama
pkill nginx
killall node

# cari PID proses yang pake port tertentu
lsof -i :3000
fuser 3000/tcp       # alternatif lebih simpel

# background & foreground
sleep 100 &         # jalan di background
jobs                # lihat background jobs
fg %1               # foreground kan job 1
bg %1               # background kan job 1

# nohup — lanjut jalan walau terminal ditutup
nohup python server.py > server.log 2>&1 &

# nice/renice — prioritas CPU
nice -n 19 ./heavy-task.sh     # prioritas rendah
renice -n -5 -p 1234           # ubah prioritas proses 1234

# ulimit — batasan resources
ulimit -a           # lihat semua limit
ulimit -n 4096      # ubah max open files (sering perlu di server)
```

## Systemd — Service Manager Modern

Cara standar Linux modern untuk manage service, startup, dan daemon.

### Systemctl Commands

```bash
# status service
systemctl status nginx
systemctl is-active nginx
systemctl is-enabled nginx

# start / stop / restart
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx     # reload config tanpa restart

# enable/disable auto-start
sudo systemctl enable nginx     # nyala otomatis pas boot
sudo systemctl disable nginx    # matiin auto-start

# list semua service
systemctl list-units --type=service
systemctl list-units --type=service --state=running
```

### Bikin Service Sendiri

File service: `/etc/systemd/system/myapp.service`

```ini
[Unit]
Description=Aplikasi Node.js Saya
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=midory
WorkingDirectory=/home/midory/myapp
ExecStart=/usr/bin/node /home/midory/myapp/server.js
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/home/midory/myapp/.env

# Security
NoNewPrivileges=true
ReadOnlyPaths=/
ReadWritePaths=/var/log/myapp

[Install]
WantedBy=multi-user.target
```

```bash
# aktifkan service baru
sudo systemctl daemon-reload     # reload config setelah bikin/ubah file
sudo systemctl enable myapp
sudo systemctl start myapp
sudo systemctl status myapp

# lihat log service
journalctl -u myapp              # log service myapp
journalctl -u myapp -f           # follow log (real-time)
journalctl -u myapp --since "1 hour ago"
journalctl -u myapp -p err       # cuma error
```

### Timer — Cron versi systemd

Alternatif cron job pake systemd timer.

```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Backup harian

[Service]
Type=oneshot
ExecStart=/home/midory/scripts/backup.sh
```

```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Jalankan backup tiap hari jam 2 pagi

[Timer]
OnCalendar=daily
OnCalendar=02:00:00
Persistent=true     # jalankan missed timer setelah boot

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable backup.timer
sudo systemctl start backup.timer
systemctl list-timers   # lihat semua timer aktif
```

## Pipes & Redirects

```bash
# redirect stdout ke file
echo "hello" > file.txt        # overwrite
echo "world" >> file.txt       # append

# redirect stderr
command 2> error.log
command 2>&1                   # gabung stderr ke stdout
command &> all.log             # stdout + stderr ke 1 file (bash 4+)
command > /dev/null 2>&1       # buang semua output

# pipe — output jadi input perintah lain
ls -la | grep ".md"
ps aux | sort -nrk 3 | head   # proses paling boros CPU
cat access.log | awk '{print $1}' | sort | uniq -c | sort -nr

# tee — simpan ke file AND print ke layar
ls -la | tee output.txt
command | tee -a log.txt       # append mode

# named pipe (fifo) — komunikasi antar proses lewat file
mkfifo mypipe
cat mypipe &                   # baca dari pipe (background)
echo "hello" > mypipe          # tulis ke pipe
```

## Networking Dasar

```bash
# curl — transfer data dari URL
curl https://api.github.com/users/nousresearch
curl -o file.html https://example.com
curl -s -o /dev/null -w "HTTP %{http_code}, Time: %{time_total}s\n" https://example.com
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://api.example.com
curl -H "Authorization: Bearer token123" https://api.example.com/protected
curl -v https://example.com     # verbose — lihat headers & handshake

# wget — download file
wget https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso
wget -c https://...       # lanjutkan download yang terputus
wget -m https://example.com    # mirror entire site
wget -r -l2 https://example.com # recursive, max 2 level

# cek koneksi
ping google.com
ping -c 4 8.8.8.8
ping -i 0.5 google.com        # interval 0.5 detik

# cek port terbuka
ss -tuln       # modern (netstat pengganti)
netstat -tuln  # legacy
ss -tuln | grep :80

# scan port dengan nc
nc -zv example.com 80
nc -zv example.com 22 80 443
nc -zvn 192.168.1.1 1-1000   # scan port range

# DNS
nslookup google.com
dig google.com
dig +short google.com         # compact output
dig -x 8.8.8.8                # reverse DNS lookup
host google.com

# traceroute
traceroute google.com
mtr google.com                # kombinasi ping + traceroute (interactive)
```

## SSH & Remote

### Koneksi Dasar

```bash
# login ke server
ssh user@192.168.1.100
ssh -p 2222 user@host
ssh -J jumpuser@jumphost user@target    # SSH via jump host / bastion
ssh -L 8080:localhost:80 user@host       # port forwarding lokal → remote

# copy file via SSH
scp file.txt user@host:/home/user/
scp -r folder/ user@host:/home/user/
scp user@host:/remote/file.txt ./       # download dari remote

# rsync — sync folder via SSH (lebih efisien dari scp)
rsync -avz folder/ user@host:/home/user/folder/
rsync -avz --delete user@host:/remote/ ./local/  # mirror — hapus file yang gak ada di source
rsync -avz --progress folder/ user@host:/path/   # tampilkan progress
```

### SSH Key Management

```bash
# generate key pair
ssh-keygen -t ed25519 -C "email@example.com"          # recommended (lebih aman)
ssh-keygen -t rsa -b 4096 -C "email@example.com"      # fallback

# copy public key ke server
ssh-copy-id user@host
# alternatif manual:
cat ~/.ssh/id_ed25519.pub | ssh user@host "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# test koneksi SSH key
ssh -T git@github.com     # test GitHub key

# SSH agent — simpan passphrase sekali
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l                # list key yang terdaftar di agent
```

### SSH Config — Biar Gampang

File `~/.ssh/config`:

```bash
Host myserver
    HostName 192.168.1.100
    User midory
    Port 2222
    IdentityFile ~/.ssh/mykey
    ForwardAgent yes        # forward SSH agent ke server
    ServerAliveInterval 60  # keep alive tiap 60 detik

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github
    IdentitiesOnly yes

Host *.internal
    User deploy
    IdentityFile ~/.ssh/deploy-key
```

```bash
# sekarang SSH jadi simpel:
ssh myserver                # equivalent ke ssh -p 2222 midory@192.168.1.100
scp file.txt myserver:~/    # pakai alias juga
```

### Keamanan SSH

```bash
# Lockdown SSH server (/etc/ssh/sshd_config)
# Port 2222                    # ganti port 22 biar aman
# PermitRootLogin no           # jangan izin root login
# PasswordAuthentication no    # cuma pake key
# PubkeyAuthentication yes
# AllowUsers midory deploy     # cuma user tertentu
# MaxAuthTries 3               # maks 3x gagal login

sudo systemctl restart sshd
```

## Tmux — Terminal Multiplexer

### Session Management

```bash
# mulai session
tmux new -s myproject
tmux new -s dev -d            # create detach langsung

# detach: Ctrl+b d

# list session
tmux ls

# attach ke session
tmux attach -t myproject
tmux a -t myproject            # alias

# rename session: Ctrl+b $
# kill session
tmux kill-session -t myproject
```

### Pane & Window Management

```bash
# split pane
# Ctrl+b "   — split horizontal (atas-bawah)
# Ctrl+b %   — split vertikal (kiri-kanan)
# Ctrl+b arrow — pindah pane
# Ctrl+b ;   — pindah ke pane sebelumnya
# Ctrl+b z   — zoom pane (full screen), tekan lagi untuk unzoom
# Ctrl+b { } — swap pane (geser kiri/kanan)
# Ctrl+b x   — close pane (konfirmasi)
# Ctrl+b space — cycle layout (tiling, even, main-horizontal, dll)

# resize pane
# Ctrl+b Ctrl+arrow — resize 1 baris/kolom
# Ctrl+b M-arrow    — resize 5 baris/kolom (option/alt+arrow)

# window management
# Ctrl+b c   — new window
# Ctrl+b ,   — rename window
# Ctrl+b p   — previous window
# Ctrl+b n   — next window
# Ctrl+b w   — list windows
# Ctrl+b 0-9 — loncat ke window 0-9
```

### Tmux Config

File `~/.tmux.conf`:

```bash
# ubah prefix ke Ctrl+a (mirip screen)
set -g prefix C-a
unbind C-b
bind C-a send-prefix

# mouse support (scroll, resize pane pake mouse)
set -g mouse on

# status bar customization
set -g status-bg colour235
set -g status-fg white
set -g status-left '#[fg=green]#S #[default]'
set -g status-right '#[fg=yellow]%Y-%m-%d %H:%M #[default]'
set -g status-interval 60

# vi-style navigation di copy mode
setw -g mode-keys vi

# bind r untuk reload config
bind r source-file ~/.tmux.conf \; display "Config reloaded!"
```

### Tmux Workflow — Multi-Server

```bash
# 1. Buat session utama
tmux new -s devops

# 2. Buat window untuk tiap server
# Ctrl+b c → rename jadi "web" → ssh web-server
# Ctrl+b c → rename jadi "db" → ssh db-server
# Ctrl+b c → rename jadi "monitor" → htop

# 3. Bikin 4 pane di satu window (vertical split terus):
# Ctrl+b % → Ctrl+b % → Ctrl+b % → 4 pane vertikal

# 4. Synchronize panes (ketik di semua pane sekaligus)
# Ctrl+b : set synchronize-panes on
# Ctrl+b : set synchronize-panes off
```

### Screen — Alternatif Lebih Ringan

```bash
# mulai session
screen -S myproject

# detach: Ctrl+a d
# list: screen -ls
# attach: screen -r myproject
# kill: screen -XS myproject quit

# key bindings
# Ctrl+a c    — new window
# Ctrl+a n/p  — next/prev window
# Ctrl+a k    — kill window
# Ctrl+a "    — list windows
# Ctrl+a |    — split vertikal
# Ctrl+a S    — split horizontal
# Ctrl+a tab  — pindah pane
```

## Docker CLI

Docker adalah container runtime — jalanin aplikasi terisolasi tanpa full VM.

### Docker Dasar

```bash
# cek instalasi
docker --version
docker info
docker system df           # cek disk usage docker

# pull image
docker pull nginx:alpine
docker pull postgres:16

# list images
docker images
docker image ls

# hapus image
docker rmi nginx:alpine
docker image prune          # hapus image yang gak dipake
```

### Container Lifecycle

```bash
# run container
docker run nginx:alpine                 # foreground
docker run -d --name my-nginx nginx:alpine   # background (detached)
docker run -d -p 8080:80 nginx:alpine        # port mapping host:container
docker run -d -p 3000:3000 --name myapp -e NODE_ENV=production myapp:latest

# list container
docker ps                      # running
docker ps -a                   # semua container (termasuk stopped)
docker ps -aq                  # cuma ID (buat scripting)

# manage container
docker stop my-nginx
docker start my-nginx
docker restart my-nginx
docker rm my-nginx               # hapus container
docker rm -f my-nginx            # force hapus (running sekalipun)

# exec ke container
docker exec -it my-nginx sh         # masuk shell interaktif
docker exec my-nginx cat /etc/nginx/conf.d/default.conf
docker exec -it myapp bash          # kalo image pake bash

# logs
docker logs my-nginx
docker logs -f my-nginx          # follow (real-time)
docker logs --tail 100 my-nginx   # 100 baris terakhir
docker logs --since 10m my-nginx  # 10 menit terakhir
```

### Docker Network

```bash
# list networks
docker network ls

# buat custom network
docker network create my-network

# container di network yang sama bisa saling akses pake nama container
docker run -d --name db --network my-network postgres:16
docker run -d --name app --network my-network -p 3000:3000 myapp
# app bisa connect ke "db:5432"

# port mapping
docker run -d -p 80:80 -p 443:443 nginx
```

### Docker Volumes (Persistence)

```bash
# named volume — data disimpan meski container dihapus
docker volume create pgdata
docker run -d --name postgres -v pgdata:/var/lib/postgresql/data postgres:16

# bind mount — folder host di-mount ke container
docker run -d --name nginx -v /home/midory/html:/usr/share/nginx/html nginx

# inspect volume
docker volume ls
docker volume inspect pgdata
```

### Docker Compose

File `docker-compose.yml`:

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
# jalankan semua service
docker compose up -d

# lihat log semua service
docker compose logs -f

# rebuild & restart service tertentu
docker compose up -d --build web

# stop semua
docker compose down

# stop + hapus volumes (hati-hati — data ilang)
docker compose down -v
```

### Docker Tips

```bash
# bersihin docker (sering bikin disk penuh)
docker system prune                 # hapus container, network, image yang dangling
docker system prune -a              # hapus SEMUA image yang gak dipake
docker volume prune                 # hapus volume yang gak dipake

# inspect details
docker inspect container-name       # JSON detail (IP, mount, config)
docker inspect --format '{{.NetworkSettings.IPAddress}}' container-name

# copy file ke/dari container
docker cp file.txt container-name:/path/
docker cp container-name:/path/file.txt ./
```

## Uptime & System Info

```bash
# uptime — berapa lama server hidup
uptime
# output: 10:30:45 up 14 days,  3:25,  2 users,  load average: 0.08, 0.03, 0.01
# load average: 1, 5, 15 menit — nilai < jumlah CPU core = sehat

# uname — system info
uname -a                    # kernel version, hostname, arch
uname -r                    # kernel release aja
lsb_release -a              # distro info (Ubuntu/Debian)
cat /etc/os-release         # alternatif distro info
hostnamectl                 # systemd hostname + OS info

# lscpu — CPU info
lscpu
nproc                       # jumlah CPU core

# free — RAM
free -h
free -w                     # wide format

# dmesg — kernel ring buffer
dmesg | tail -20            # hardware error, driver, device
dmesg -w                    # follow
```

## Latihan

### Latihan 1: Monitor Proses

Buat satu baris command untuk menampilkan 5 proses dengan penggunaan memori terbanyak.

<details>
<summary>💡 Hint</summary>

```bash
ps aux --sort=-%mem | head -6
```
</details>

---

### Latihan 2: Pipe Chain

Dari file `/var/log/syslog` (atau `access.log`), ekstrak:

1. Ambil baris yang mengandung "error" (case-insensitive)
2. Ambil kolom pertama (timestamp/IP)
3. Urutkan
4. Hitung unik
5. Tampilkan 10 teratas

<details>
<summary>💡 Hint</summary>

```bash
grep -i "error" /var/log/syslog | awk '{print $1}' | sort | uniq -c | sort -nr | head -10
```
</details>

---

### Latihan 3: Cek Kesehatan Server

Bikin script satu baris yang ngecek:

- Apakah port 80 (HTTP) kebuka?
- Berapa rata-rata response time?
- Bandingin sama port 443 (HTTPS)

Pake `curl` dan `ping`.

<details>
<summary>💡 Hint</summary>

```bash
echo "HTTP:" && curl -o /dev/null -s -w "Time: %{time_total}s\n" http://example.com && echo "HTTPS:" && curl -o /dev/null -s -w "Time: %{time_total}s\n" https://example.com
```
</details>

---

### Latihan 4: SSH + Tmux Workflow

Buat sesi tmux bernama "dev" dengan 2 pane:

1. Pane kiri: SSH ke server remote, jalanin `htop`
2. Pane kanan: local, siap buat nulis script

Tulis langkah-langkahnya.

<details>
<summary>💡 Hint</summary>

```bash
tmux new -s dev
# Ctrl+b % -> split vertikal
# pane kiri: ssh user@host lalu htop
# pane kanan: vim script.sh
```
</details>

---

### Latihan 5: Bikin Systemd Service

Buat service untuk API Node.js di `~/myapp/server.js`:

1. Buat file service `/etc/systemd/system/myapi.service`
2. Isi dengan Type=simple, WorkingDirectory=~/myapp, ExecStart=/usr/bin/node server.js
3. Enable auto-start, restart on failure
4. Jalankan dan cek status
5. Lihat log pake `journalctl -u myapi`

<details>
<summary>💡 Hint</summary>

```bash
sudo cat > /etc/systemd/system/myapi.service << 'EOF'
[Unit]
Description=My API Service
After=network.target

[Service]
Type=simple
User=midory
WorkingDirectory=/home/midory/myapp
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable myapi
sudo systemctl start myapi
sudo systemctl status myapi
journalctl -u myapi -f
```
</details>

---

### Latihan 6: Docker Container

1. Pull image `nginx:alpine`
2. Run container dengan nama `web-test`, port 8080:80
3. Copy file `index.html` ke container
4. Akses `http://localhost:8080`
5. Lihat log container
6. Stop & hapus container

<details>
<summary>💡 Hint</summary>

```bash
docker pull nginx:alpine
docker run -d --name web-test -p 8080:80 nginx:alpine
echo "<h1>Halo Docker!</h1>" > index.html
docker cp index.html web-test:/usr/share/nginx/html/
curl http://localhost:8080
docker logs web-test
docker stop web-test && docker rm web-test
```
</details>

---

### Latihan 7: SSH Key Setup

1. Generate SSH key ed25519
2. Copy public key ke server (atau GitHub)
3. Test koneksi
4. Buat SSH config alias untuk server

<details>
<summary>💡 Hint</summary>

```bash
ssh-keygen -t ed25519 -C "latihan@example.com"
ssh-copy-id user@192.168.1.100
ssh user@192.168.1.100  # sekarang tanpa password!
# Buat ~/.ssh/config:
echo "Host myserver
    HostName 192.168.1.100
    User user
    IdentityFile ~/.ssh/id_ed25519" >> ~/.ssh/config
ssh myserver  # pake alias!
```
</details>
