# Linux Terminal — Latihan

## Level 1: Dasar

### 1. File System — Navigasi
Direktori struktur:
```
/home/user/
├── projects/
│   ├── webapp/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── js/
│   │       └── app.js
│   └── data/
│       └── backup.sql
└── documents/
    └── notes.txt
```

**Pertanyaan:** Tulis perintah untuk:
1. Pindah dari `/home/user` ke `projects/webapp/js`
2. Kembali ke `/home/user`
3. Melihat isi `projects/data` tanpa pindah direktori
4. Melihat path lengkap direktori saat ini

**Expected output (untuk #4):**
```
/home/user
```

**Hint:** Gunakan `cd`, `ls`, `pwd`.

---

### 2. File Operations — Manipulasi File
**Pertanyaan:** Berdasarkan struktur di soal #1, tulis perintah untuk:
1. Buat file `readme.md` di dalam `webapp/` 
2. Copy `backup.sql` ke `webapp/` dengan nama `db.sql`
3. Rename `notes.txt` jadi `catatan.txt`
4. Hapus file `style.css`

**Expected output:** Setelah perintah dijalankan, `ls projects/webapp/` menampilkan:
```
db.sql  index.html  js  readme.md
```

**Hint:** Gunakan `touch`, `cp`, `mv`, `rm`.

---

### 3. Pipe — Rantai Perintah
```bash
cat data.txt
# isi file:
# 12
# 7
# 25
# 3
# 18
# 9
```

**Pertanyaan:** Tulis satu baris perintah menggunakan pipe (`|`) untuk:
1. Sortir angka dari terkecil ke terbesar
2. Hitung jumlah baris
3. Ambil 3 angka teratas setelah disortir

**Expected output (#3):**
```
3
7
9
```

**Hint:** Gunakan `sort -n`, `wc -l`, `head -3`.

---

### 4. Text Processing — grep
```bash
cat employees.txt
# Alice Johnson, Engineering, alice@email.com
# Bob Smith, Marketing, bob@email.com
# Charlie Brown, Engineering, charlie@email.com
# Diana Prince, HR, diana@email.com
# Eve Davis, Engineering, eve@email.com
```

**Pertanyaan:** Tulis perintah grep untuk:
1. Cari semua baris yang mengandung "Engineering"
2. Cari semua alamat email (pola `*@*`)
3. Hitung berapa banyak karyawan di Engineering

**Expected output (#1):**
```
Alice Johnson, Engineering, alice@email.com
Charlie Brown, Engineering, charlie@email.com
Eve Davis, Engineering, eve@email.com
```

**Expected output (#3):**
```
3
```

**Hint:** `grep` punya flag `-c` untuk count.

---

### 5. Text Processing — awk & cut
```bash
cat scores.txt
# Budi:90
# Siti:85
# Agus:92
# Dewi:78
# Rudi:88
```

**Pertanyaan:** 
1. Tampilkan hanya nama (sebelum `:`) pakai `cut`
2. Tampilkan hanya nilai (setelah `:`) pakai `awk`
3. Hitung rata-rata nilai pakai `awk`

**Expected output (#1):**
```
Budi
Siti
Agus
Dewi
Rudi
```

**Expected output (#3):**
```
86.6
```

**Hint:** `cut -d':' -f1`, `awk -F':' '{print $2}'`, `awk '{sum+=$1} END{print sum/NR}'`.

---

### 6. File Permission — izin akses
```bash
ls -l script.sh
# -rwxr--r-- 1 user user 42 Jul 4 10:00 script.sh
```

**Pertanyaan:** 
1. Jelaskan arti `-rwxr--r--`
2. Tulis perintah untuk: tambah izin execute untuk group, hapus izin read untuk others
3. Tulis perintah untuk mengubah owner jadi `root` (gunakan `sudo`)

**Expected output (setelah #2):** `ls -l` → `-rwxr-x---`

**Hint:** `chmod`, `chown`.

---

### 7. Shell Script — Sederhana
**Pertanyaan:** Buat file `hello.sh` yang:
1. Menampilkan "Halo, selamat datang!"
2. Menampilkan tanggal dan jam saat ini
3. Menampilkan siapa yang login
4. Menampilkan direktori saat ini

**Expected output (contoh):**
```
Halo, selamat datang!
Tanggal: Sat Jul 4 10:30:00 WIB 2026
User: midory
Direktori: /home/midory
```

**Hint:** `date`, `whoami`, `pwd` — jangan lupa `#!/bin/bash` dan `chmod +x`.

---

### 8. Find & Locate — Cari File
**Pertanyaan:** Tulis perintah untuk:
1. Cari semua file `.log` di `/var/log` yang lebih besar dari 10MB
2. Cari file bernama `config.json` di seluruh sistem
3. Cari direktori bernama `node_modules` dan hitung jumlahnya

**Hint:** `find /var/log -name "*.log" -size +10M`, `locate config.json`.

---

## Level 2: Intermediate

### 9. Pipe Chain — Log Analysis
```bash
# access.log — contoh 1000 baris, ini cuplikan:
192.168.1.1 - - [04/Jul/2026:10:15:30] "GET /api/users HTTP/1.1" 200 1234
192.168.1.2 - - [04/Jul/2026:10:16:45] "POST /api/login HTTP/1.1" 401 256
192.168.1.1 - - [04/Jul/2026:10:17:00] "GET /api/products HTTP/1.1" 200 5678
10.0.0.1 - - [04/Jul/2026:10:18:12] "GET /api/users HTTP/1.1" 500 89
192.168.1.2 - - [04/Jul/2026:10:19:30] "POST /api/login HTTP/1.1" 200 1024
```

**Pertanyaan:** Tulis pipeline (satu baris dengan pipe) untuk:
1. Cari semua request yang return status 500
2. Hitung jumlah request per IP address, urutkan dari yang paling sering
3. Cari endpoint yang paling sering diakses (path URL-nya aja)

**Expected output (#2):**
```
      3 192.168.1.1
      2 192.168.1.2
      1 10.0.0.1
```

**Hint:** `awk '{print $1}' | sort | uniq -c | sort -rn`.

---

### 10. Sed & Awk — Transformasi Data
```bash
cat users.csv
# Name,Email,Phone,City
# Budi Santoso,budi@email.com,08123456789,Jakarta
# Siti Nurhaliza,siti@email.com,08234567891,Bandung
# Agus Wijaya,agus@email.com,08345678912,Surabaya
```

**Pertanyaan:** Tulis perintah `sed` atau `awk` untuk:
1. Ubah semua email jadi `***@email.com` (sensor)
2. Tambahkan nomor urut di depan setiap baris (kecuali header)
3. Filter hanya baris yang kota-nya "Jakarta" atau "Bandung"

**Expected output (#1):**
```
Name,Email,Phone,City
***@email.com,08123456789,Jakarta
***@email.com,08234567891,Bandung
***@email.com,08345678912,Surabaya
```

**Hint:** `sed 's/budi@email.com/***@email.com/g'` — atau lebih general: `awk -F',' 'BEGIN{OFS=","} NR>1{$2="***@email.com"} {print}'`.

---

### 11. Shell Script — Backup Otomatis
**Pertanyaan:** Buat script `backup.sh` yang:
1. Menerima 1 argument: nama direktori yang akan di-backup
2. Membuat archive `.tar.gz` dengan format nama: `backup_YYYYMMDD_HHMMSS.tar.gz`
3. Menyimpan archive ke direktori `~/backups/` (buat jika belum ada)
4. Menampilkan pesan sukses dengan ukuran file hasil backup
5. Kalau direktori sumber tidak ada, tampilkan error dan exit code 1

**Expected output (contoh):**
```
Backup berhasil: /home/user/backups/backup_20260704_103000.tar.gz (2.3M)
```

**Hint:** `tar -czf`, `date +%Y%m%d_%H%M%S`, `du -sh`, `$1`, `mkdir -p`.

---

### 12. Process Management — Job Control
**Pertanyaan:** Kamu menjalankan perintah yang butuh waktu lama:
```bash
$ sleep 300 &
[1] 12345
```

1. Bagaimana cara melihat daftar background jobs?
2. Bagaimana cara membawa job ke foreground?
3. Bagaimana cara mengirim sinyal SIGTERM ke proses dengan PID 12345?
4. Bagaimana cara menjalankan perintah yang tetap hidup walau terminal ditutup?

**Hint:** `jobs`, `fg`, `kill`, `nohup` atau `disown`.

---

### 13. Text Processing — Duplikat & Sortir
```ba#sh
cat ip-list.txt
# 192.168.1.1
# 10.0.0.1
# 192.168.1.1
# 172.16.0.1
# 10.0.0.2
# 192.168.1.1
# 10.0.0.1
```

**Pertanyaan:** Tulis perintah untuk:
1. Hapus baris duplikat, simpan ke file baru
2. Sortir IP address secara numerik
3. Cari IP yang muncul lebih dari 1 kali

**Expected output (#1):**
```
192.168.1.1
10.0.0.1
172.16.0.1
10.0.0.2
```

**Expected output (#3):**
```
      3 192.168.1.1
      2 10.0.0.1
```

**Hint:** `sort -u`, `sort -V` (version sort untuk IP), `sort | uniq -c | awk '$1 > 1'`.

---

## Level 3: Challenge

### 14. Shell Script — Log Rotator & Analyzer
**Pertanyaan:** Buat script `log-manager.sh` yang melakukan:

1. **Rotasi log:** Pindahkan file `app.log` ke `app.log.1`, `app.log.1` ke `app.log.2`, dst sampai `.3` (file paling lama dihapus)
2. **Analisis:** Dari file `app.log` yang baru/before rotation:
   - Hitung jumlah baris
   - Hitung jumlah error (cari kata "ERROR")
   - Cari 5 error message paling sering muncul
3. **Report:** Kirim output ke file `log-report-$(date +%F).txt`
4. **Cleanup:** Hapus report yang lebih dari 30 hari

Semua harus dalam 1 script, dengan fungsi terpisah: `rotate_logs`, `analyze_logs`, `generate_report`, `cleanup_old`.

**Hint:** Gunakan `mv` untuk rotasi (loop dari 3 ke 1). `sort | uniq -c | sort -rn | head -5` untuk top errors. `find ... -mtime +30 -delete` untuk cleanup.

---

### 15. Pipe Chain — Real-time Log Monitoring
**Skenario:** File `access.log` terus bertambah (live). Admin ingin monitor beberapa metrik real-time.

**Pertanyaan:** Tulis perintah one-liner (pakai `tail -f` + pipe) untuk:

1. Monitor status code 5xx saja, real-time
2. Hitung request per menit secara real-time
3. Tampilkan IP yang melakukan request > 100 kali dalam 5 menit terakhir

**Hint:** `tail -f access.log | grep " 5[0-9][0-9] "`, `tail -f access.log | awk '{print $4}' | uniq -c`, kombinasi `tail -f` dengan `awk` atau `grep --line-buffered`.

---

### 16. One-liner Challenge — Data Pipeline
**Tugas:** File `transactions.log` berisi:
```
2026-07-04 10:00:00 | user_001 | beli | 50000
2026-07-04 10:01:00 | user_002 | beli | 25000
2026-07-04 10:02:00 | user_001 | topup | 100000
2026-07-04 10:03:00 | user_003 | beli | 75000
2026-07-04 10:04:00 | user_002 | beli | 30000
```

**Pertanyaan:** Buat satu baris perintah (tanpa script!) yang menghasilkan output:

1. Total pemasukan dari transaksi `beli` per user, urut desc
2. User yang total belanjanya > 50000

**Expected output (#1):**
```
user_001: 50000
user_002: 55000
user_003: 75000
```

**Hint:** `grep '| beli |' | awk -F'|' '{users[$2]+=$4} END{for(u in users) print u": "users[u]}' | sort -t: -k2 -rn`.

---

### 17. Shell Script — Deploy Script
**Pertanyaan:** Buat script `deploy.sh` yang melakukan automatic deployment aplikasi Node.js:

1. **Check:** Pastikan git branch saat ini adalah `main`, kalau bukan exit
2. **Pull:** `git pull origin main`
3. **Install:** `npm install` (hanya jika `package.json` berubah)
4. **Build:** `npm run build`
5. **Test:** Jalankan test, kalau gagal rollback ke commit sebelumnya
6. **Restart:** Restart PM2 process
7. **Health check:** Curl endpoint `/health`, kalau nggak response 200 dalam 10 detik, rollback
8. **Log:** Catat semua output ke `deploy.log` dengan timestamp

**Hint:** `set -e`, `git log --oneline -1`, `if npm test; then ... else git reset --hard HEAD~1; fi`, `timeout 10 curl -f http://localhost:3000/health`.

---

### 18. File System Challenge — Large Scale Cleanup
**Skenario:** Sebuah server penyimpanan hampir penuh (95%). Kamu perlu bersihin file-file sampah.

**Pertanyaan:** Tulis perintah atau script untuk:

1. Cari 10 file terbesar di seluruh sistem (kecuali `/proc`, `/sys`, `/dev`)
2. Cari semua file `*.log` yang lebih besar dari 100MB dan lebih tua dari 7 hari
3. Cari direktori kosong di `/home` yang lebih tua dari 30 hari
4. Buat summary: total ruang yang bisa dibebaskan dari point 2 dan 3

**Hint:** `find / -type f -exec du -h {} + 2>/dev/null | sort -rh | head -10`, `find /var -name "*.log" -size +100M -mtime +7`, `find /home -type d -empty -mtime +30`.
