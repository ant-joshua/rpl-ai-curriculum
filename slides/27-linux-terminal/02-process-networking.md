---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/546819/pexels-pho"
footer: "Sesi 02: Process Networking"
---

<!-- _class: title -->
# 02. Process & Networking

## Melihat Proses

```bash

---

# proses saat ini
ps aux
ps aux | grep nginx


---

# snapshot real-time
top
htop          # prettier version (kalau ada)


---

# proses spesifik
pgrep nginx   # dapet PID
pidof nginx   # alternatif


---

# tree proses
pstree
```

## Mengontrol Proses

```bash

---

# kill berdasarkan PID
kill 1234
kill -9 1234        # force kill (SIGKILL)
kill -15 1234       # graceful (SIGTERM)
kill -HUP 1234      # reload config


---

# kill berdasarkan nama
pkill nginx
killall node


---

# background & foreground
sleep 100 &         # jalan di background
jobs                # lihat background jobs
fg %1               # foreground kan job 1
bg %1               # background kan job 1


---

# nohup — lanjut jalan walau terminal ditutup
nohup python server.py > server.log 2>&1 &
```

## Pipes & Redirects

```bash

---

# redirect stdout ke file
echo "hello" > file.txt        # overwrite
echo "world" >> file.txt       # append


---

# redirect stderr
command 2> error.log
command 2>&1                   # gabung stderr ke stdout


---

# pipe — output jadi input perintah lain
ls -la | grep ".md"
ps aux | sort -nrk 3 | head   # proses paling boros CPU
cat access.log | awk '{print $1}' | sort | uniq -c | sort -nr


---

# /dev/null — buang output
command > /dev/null 2>&1
```

## Networking Dasar

```bash

---

# curl — transfer data dari URL
curl https://api.github.com/users/nousresearch
curl -o file.html https://example.com
curl -X POST -d '{"key":"value"}' -H "Content-Type: application/json" https://api.example.com


---

# wget — download file
wget https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso
wget -c https://...       # lanjutkan download yang terputus


---

# cek koneksi
ping google.com
ping -c 4 8.8.8.8


---

# cek port terbuka
ss -tuln       # modern (netstat pengganti)
netstat -tuln  # legacy


---

# DNS
nslookup google.com
dig google.com
```

## SSH & Remote

```bash

---

# login ke server
ssh user@192.168.1.100
ssh -p 2222 user@host


---

# copy file via SSH
scp file.txt user@host:/home/user/
scp -r folder/ user@host:/home/user/


---

# SSH key
ssh-keygen -t ed25519 -C "email@example.com"
ssh-copy-id user@host


---

# config SSH biar gampang

---

# ~/.ssh/config

---

# Host myserver

---

#     HostName 192.168.1.100

---

#     User midory

---

#     Port 2222

---

#     IdentityFile ~/.ssh/mykey
```

## Tmux — Terminal Multiplexer

```bash

---

# mulai session
tmux new -s myproject


---

# detach: Ctrl+b d

---

# list session
tmux ls


---

# attach ke session
tmux attach -t myproject


---

# split pane: Ctrl+b " (horizontal), Ctrl+b % (vertikal)

---

# navigate pane: Ctrl+b arrow

---

# new window: Ctrl+b c

---

# rename window: Ctrl+b ,
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

---

# Ctrl+b % -> split vertikal

---

# pane kiri: ssh user@host lalu htop

---

# pane kanan: vim script.sh
```
</details>
