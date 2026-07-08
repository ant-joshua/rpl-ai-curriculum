# 04. Shell Scripting

## Dasar Bash Script

```bash
#!/bin/bash
# ^ shebang — interpreter

# variable
NAMA="Alice"
echo "Halo, $NAMA!"
echo "Halo, ${NAMA}!"           # sama, tapi jelas batasnya

# input
read -p "Masukkan nama: " nama
echo "Hai $nama"

# argument
echo "Script: $0"
echo "Argumen 1: $1"
echo "Argumen 2: $2"
echo "Jumlah argumen: $#"
echo "Semua argumen: $@"
echo "Semua argumen (sebagai string): $*"

# shift — geser argumen
echo "Argumen 1: $1"; shift
echo "Setelah shift, argumen 1 sekarang: $1"
```

## Conditional & Loop

```bash
#!/bin/bash

# if/else
if [ -f "$1" ]; then
  echo "$1 adalah file"
elif [ -d "$1" ]; then
  echo "$1 adalah direktori"
else
  echo "$1 tidak dikenal"
fi

# operator umum
# [ -f file ]  — file exists
# [ -d dir ]   — dir exists
# [ -z str ]   — string kosong
# [ -n str ]   — string tidak kosong
# [ "$a" = "$b" ] — string sama
# [ "$a" != "$b" ] — string beda
# [ "$a" -eq "$b" ] — numeric sama
# [ "$a" -ne "$b" ] — numeric beda
# [ "$a" -gt "$b" ] — numeric lebih besar
# [ "$a" -ge "$b" ] — numeric >=
# [ "$a" -lt "$b" ] — numeric lebih kecil

# operator logika
# [ kondisi1 ] && [ kondisi2 ]  — AND
# [ kondisi1 ] || [ kondisi2 ]  — OR
# ! [ kondisi ]                 — NOT

# if dengan regex
if [[ "$1" =~ ^[0-9]+$ ]]; then
  echo "Ini angka"
fi

# for loop
for file in *.log; do
  echo "Memproses $file"
  gzip "$file"
done

# for loop dengan range
for i in {1..5}; do
  echo "Iterasi $i"
done

# for loop dengan seq (kalo butuh variable)
start=1; end=10
for i in $(seq "$start" "$end"); do
  echo "Angka $i"
done

# for loop array
fruits=("apel" "mangga" "pisang" "jeruk")
for fruit in "${fruits[@]}"; do
  echo "Saya suka $fruit"
done

# while loop — baca file per baris
while IFS= read -r line; do
  echo "Baris: $line"
done < file.txt

# while loop dengan counter
count=1
while [ "$count" -le 5 ]; do
  echo "Count: $count"
  count=$((count + 1))
done

# until loop
count=5
until [ "$count" -eq 0 ]; do
  echo "$count"
  count=$((count - 1))
done

# case
case "$1" in
  start) echo "Starting...";;
  stop)  echo "Stopping...";;
  restart) echo "Restarting...";;
  *)     echo "Usage: $0 {start|stop|restart}";;
esac
```

## Advanced Variable & String Manipulation

```bash
#!/bin/bash

# substitution
text="hello world"
echo "${text/hello/hi}"        # ganti pertama: "hi world"
echo "${text//o/X}"            # ganti semua: "hellX wXrld"

# substring
echo "${text:0:5}"             # "hello" — 5 karakter pertama
echo "${text:6}"               # "world" — dari index 6 sampai akhir
echo "${#text}"                # panjang string: 11

# default value
echo "${VAR:-default}"         # VAR kosong/tidak diset → "default"
echo "${VAR:=default}"         # sama, tapi set VAR juga
echo "${VAR:?error message}"   # error kalau VAR kosong
echo "${VAR:+alternate}"       # "alternate" kalau VAR tidak kosong

# uppercase/lowercase
echo "${text^^}"               # HELLO WORLD
echo "${text,,}"               # hello world
echo "${text^}"                # Hello world — capitalize pertama

# trim pattern
path="/home/midory/project/file.txt"
echo "${path#/*/}"             # hapus shortest prefix: midory/project/file.txt
echo "${path##/*/}"            # hapus longest prefix: file.txt
echo "${path%.*}"              # hapus shortest suffix: /home/midory/project/file
echo "${path%%.*}"             # hapus longest suffix: /home/midory/project/file
```

## Arrays

```bash
#!/bin/bash

# deklarasi array
fruits=("apel" "mangga" "pisang")
numbers=(1 2 3 4 5)

# akses
echo "${fruits[0]}"            # apel
echo "${fruits[@]}"            # semua element
echo "${#fruits[@]}"           # jumlah element: 3

# append
fruits+=("jeruk" "melon")
echo "${#fruits[@]}"           # 5

# loop array
for fruit in "${fruits[@]}"; do
  echo "Buah: $fruit"
done

# associative array (bash 4+)
declare -A user
user[name]="Budi"
user[email]="budi@example.com"
user[role]="developer"
echo "${user[name]}"
echo "${!user[@]}"             # semua keys: name email role
```

## Function

```bash
#!/bin/bash

# define
log() {
  local msg="$1"         # local scope — gak ngaruh ke luar function
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $msg"
}

error_exit() {
  echo "ERROR: $1" >&2
  exit 1
}

# panggil
log "Script dimulai"
log "Memproses file..."

# return value lewat stdout
get_date() {
  date '+%Y%m%d'
}
today=$(get_date)
echo "Today: $today"

# exit code
check_root() {
  if [ "$(id -u)" -ne 0 ]; then
    return 1
  fi
  return 0
}

if check_root; then
  echo "Root user"
else
  echo "Bukan root"
fi

# function dengan argument
greet() {
  local name="$1"
  local greeting="${2:-Halo}"   # default value
  echo "$greeting, $name!"
}

greet "Budi"                   # Halo, Budi!
greet "Ani" "Selamat pagi"    # Selamat pagi, Ani!
```

## Error Handling

```bash
#!/bin/bash

# stop script kalau ada error
set -e               # exit on error
set -u               # error kalau undefined variable
set -o pipefail      # error di pipe cascade — kalau salah satu command di pipe gagal

# kombinasi di awal script
set -euo pipefail

# trap — tangkap signal & cleanup
cleanup() {
  echo "Cleanup: menghapus temporary files..."
  rm -rf /tmp/myscript-*
}

trap cleanup EXIT
trap 'echo "Interrupted!"; exit 1' INT
trap 'echo "Script terminated"; exit 1' TERM

# manual error check
if ! mkdir -p /var/backups; then
  echo "Gagal buat folder backup!" >&2
  exit 1
fi

# try-catch pattern di bash
{
  echo "Mencoba operasi berbahaya..."
  rm -rf /important-dir
} || {
  echo "Operasi gagal, tapi script lanjut" >&2
}
```

## Debugging Script

```bash
#!/bin/bash

# debug mode
set -x               # print tiap command sebelum dijalankan
set +x               # matikan debug

# atau jalankan dengan -x
# bash -x script.sh

# debug partial
echo "Sebelum debug"
set -x
echo "Ini di-debug"
ls /tmp
set +x
echo "Setelah debug"

# trap DEBUG — print baris yang akan dijalankan
trap 'echo "# $(date): $BASH_COMMAND"' DEBUG

# cek syntax tanpa jalanin
# bash -n script.sh
```

## Cron Jobs

```bash
# edit crontab
crontab -e

# format: menit jam hari tanggal bulan weekday perintah
#   * * * * * /home/midory/scripts/backup.sh
#   ┬ ┬ ┬ ┬ ┬
#   │ │ │ │ └── weekday (0=Sun, 6=Sat)
#   │ │ │ └──── bulan (1-12)
#   │ │ └────── tanggal (1-31)
#   │ └──────── jam (0-23)
#   └────────── menit (0-59)

# contoh
# tiap jam 2 pagi
0 2 * * * /home/midory/scripts/daily-backup.sh

# tiap menit ke-15 tiap 6 jam
15 */6 * * * /home/midory/scripts/health-check.sh

# tiap hari Senin jam 3 pagi
0 3 * * 1 /home/midory/scripts/weekly-report.sh

# special strings
@daily /home/midory/scripts/daily.sh    # 0 0 * * *
@hourly /home/midory/scripts/hourly.sh   # 0 * * * *
@reboot /home/midory/scripts/startup.sh   # pas boot

# log output cron
0 2 * * * /home/midory/scripts/backup.sh >> /var/log/backup.log 2>&1

# list cron
crontab -l

# cron milik root (system-wide)
sudo crontab -e

# nonaktifkan sementara (comment pake #)

# environment variables di cron
# PATH=/usr/local/bin:/usr/bin:/bin
# HOME=/home/midory
# 0 2 * * * ./script.sh  # relative path pake HOME

# tips cron:
# 1. Selalu pake absolute path
# 2. Redirect output ke file
# 3. Test script manual dulu
# 4. Cron gak punya akses ke PATH user biasa
# 5. Set MAILTO="" di crontab biar gak spam email
```

## Systemd Services (review dari modul 02)

```bash
# service template
cat > /etc/systemd/system/myapp.service << 'EOF'
[Unit]
Description=My Application
After=network.target postgresql.service

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
sudo systemctl enable myapp
sudo systemctl start myapp
sudo systemctl status myapp
```

## bashrc & Alias

```bash
# edit ~/.bashrc atau ~/.bash_aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias gs='git status'
alias gp='git push'
alias ..='cd ..'
alias ...='cd ../..'
alias cls='clear'

# fungsi di bashrc
mkcd() {
  mkdir -p "$1" && cd "$1"
}

# reload
source ~/.bashrc

# PATH
export PATH="$HOME/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"

# PS1 — customize prompt
export PS1='\[\e[32m\]\u@\h\[\e[00m\]:\[\e[34m\]\w\[\e[00m\]\$ '
export PS1='\[\e[31m\]\u\[\e[00m\]@\[\e[32m\]\h\[\e[00m\]:\[\e[34m\]\w\[\e[00m\]$(__git_ps1 "(%s)")\$ '
```

## Latihan

### Latihan 1: Backup Script

Buat file `backup.sh` yang:

1. Menerima argumen: folder yang mau di-backup
2. Ngecek folder ada atau tidak
3. Bikin folder backup di `~/backups/` dengan nama `folder-YYYYMMDD-HHMMSS`
4. Copy semua isi folder ke folder backup
5. Log hasil ke `~/backups/backup.log`
6. Exit dengan error code 1 kalau gagal

<details>
<summary>💡 Hint</summary>

```bash
#!/bin/bash
set -euo pipefail

SOURCE="${1:-}"
if [ -z "$SOURCE" ] || [ ! -d "$SOURCE" ]; then
  echo "Usage: $0 <folder>" >&2
  exit 1
fi

BACKUP_DIR="$HOME/backups"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FOLDER_NAME=$(basename "$SOURCE")
DEST="$BACKUP_DIR/$FOLDER_NAME-$TIMESTAMP"

mkdir -p "$DEST"
cp -r "$SOURCE"/* "$DEST/"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup $SOURCE -> $DEST" >> "$BACKUP_DIR/backup.log"
echo "Backup selesai: $DEST"
```
</details>

---

### Latihan 2: Log Rotator

Buat `log-rotate.sh` yang:

1. Cari semua file `*.log` di folder `~/logs/`
2. Kalau ukuran file > 1MB, kompres pake `gzip`
3. File hasil kompres diberi nama `file.log-YYYYMMDD-HHMMSS.gz`
4. Hapus file `.gz` yang lebih tua dari 7 hari
5. Log semua aksi ke `~/logs/rotator.log`

<details>
<summary>💡 Hint</summary>

```bash
#!/bin/bash
set -euo pipefail

LOG_DIR="$HOME/logs"
ROTATE_LOG="$LOG_DIR/rotator.log"
DAYS=7

mkdir -p "$LOG_DIR"

for logfile in "$LOG_DIR"/*.log; do
  [ -f "$logfile" ] || continue
  size=$(stat -c%s "$logfile" 2>/dev/null || stat -f%z "$logfile" 2>/dev/null)
  if [ "$size" -gt 1048576 ]; then
    ts=$(date '+%Y%m%d-%H%M%S')
    mv "$logfile" "$logfile-$ts"
    gzip "$logfile-$ts"
    echo "[$(date)] Compressed: $logfile" >> "$ROTATE_LOG"
  fi
done

find "$LOG_DIR" -name "*.gz" -mtime +$DAYS -delete -print >> "$ROTATE_LOG"
echo "[$(date)] Rotator selesai" >> "$ROTATE_LOG"
```
</details>

---

### Latihan 3: Deploy Script

Buat `deploy.sh` yang:

1. Clone/pull repo dari `git@github.com:user/project.git` ke `~/project`
2. Kalau folder belum ada, clone. Kalau udah ada, pull.
3. Install dependencies (asumsi `npm install` atau `pip install -r requirements.txt`)
4. Restart service (asumsi `systemctl restart myapp`)
5. Rollback kalau gagal — simpan backup folder sebelum deploy
6. Kirim notifikasi (echo aja) sukses/gagal

<details>
<summary>💡 Hint</summary>

```bash
#!/bin/bash
set -euo pipefail

REPO="git@github.com:user/project.git"
DIR="$HOME/project"
BACKUP_DIR="$HOME/deploy-backups"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')

rollback() {
  echo "[$TIMESTAMP] DEPLOY FAILED! Rollback..." >&2
  if [ -d "$BACKUP_DIR/$TIMESTAMP" ]; then
    rm -rf "$DIR"
    cp -r "$BACKUP_DIR/$TIMESTAMP" "$DIR"
    echo "Rollback selesai"
  fi
  exit 1
}

trap rollback ERR

if [ -d "$DIR" ]; then
  cp -r "$DIR" "$BACKUP_DIR/$TIMESTAMP"
  cd "$DIR" && git pull
else
  git clone "$REPO" "$DIR"
fi

cd "$DIR"
if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
elif [ -f "package.json" ]; then
  npm install
fi

# restart service
sudo systemctl restart myapp || true

echo "[$TIMESTAMP] Deploy sukses ke $DIR"
```
</details>

---

### Latihan 4: Monitoring Dashboard

Buat `monitor.sh` yang:

1. Tampilkan tabel berisi:
   - CPU usage (dari `/proc/stat` atau `top -bn1`)
   - RAM usage (dari `free -h`)
   - Disk usage (dari `df -h`)
   - 5 proses dengan CPU tertinggi
   - 5 proses dengan RAM tertinggi
2. Update setiap 5 detik (clear screen tiap loop)
3. Berhenti kalau ditekan `Ctrl+C`
4. Simpan snapshot ke file `monitor-YYYYMMDD-HHMMSS.log` kalau argumen `--save` diberikan

<details>
<summary>💡 Hint</summary>

```bash
#!/bin/bash
set -euo pipefail

SAVE=false
if [ "${1:-}" = "--save" ]; then
  SAVE=true
  SNAPSHOT="$HOME/monitor-$(date '+%Y%m%d-%H%M%S').log"
fi

cleanup() {
  echo "Monitor dihentikan."
  exit 0
}

trap cleanup INT

while true; do
  clear
  echo "========== SYSTEM MONITOR =========="
  echo "Waktu: $(date)"
  echo ""
  echo "--- CPU Usage ---"
  top -bn1 | grep "Cpu(s)" | awk '{print $2"% user, " $4"% system, " $8"% idle"}'
  echo ""
  echo "--- RAM Usage ---"
  free -h | awk '/Mem:/ {print "Total: " $2 " | Used: " $3 " | Free: " $4 " | Available: " $7}'
  echo ""
  echo "--- Disk Usage ---"
  df -h / /home 2>/dev/null | awk 'NR>1 {print $1 ": " $3 " / " $2 " (" $5 " used)"}'
  echo ""
  echo "--- Top 5 CPU Processes ---"
  ps aux --sort=-%cpu | head -6 | awk '{printf "%-5s %-5s %-5s %s\n", $2, $3"%", $11, $NF}'
  echo ""
  echo "--- Top 5 RAM Processes ---"
  ps aux --sort=-%mem | head -6 | awk '{printf "%-5s %-5s %-5s %s\n", $2, $4"%", $11, $NF}'
  echo ""
  echo "Tekan Ctrl+C untuk keluar"

  if $SAVE; then
    {
      echo "=== Snapshot $(date) ==="
      echo "CPU: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2"%"}')"
      echo "RAM: $(free -h | awk '/Mem:/ {print $3 "/" $2}')"
    } >> "$SNAPSHOT"
  fi

  sleep 5
done
```
</details>

---

### Latihan 5: String Manipulation

Buat `rename-files.sh` yang:

1. Cari semua file `.txt` di folder saat ini
2. Ubah spasi di nama file jadi underscore
3. Ubah uppercase jadi lowercase
4. Tambah prefix `draft-` ke setiap file
5. Log perubahan ke `rename.log`

<details>
<summary>💡 Hint</summary>

```bash
#!/bin/bash
set -euo pipefail

LOG="rename.log"
echo "[$(date)] Mulai rename" >> "$LOG"

for f in *.txt; do
  [ -f "$f" ] || continue
  newname=$(echo "$f" | tr ' ' '_' | tr 'A-Z' 'a-z')
  newname="draft-$newname"
  mv -i "$f" "$newname"
  echo "  $f -> $newname" >> "$LOG"
done

echo "[$(date)] Selesai" >> "$LOG"
```
</details>

---

### Latihan 6: Cron Job Setup

1. Buat script `cleanup-temp.sh` yang hapus file `.tmp` di `/tmp` yang lebih tua dari 1 hari
2. Set cron job untuk jalan tiap hari jam 3 pagi
3. Redirect output ke `~/logs/cleanup.log`
4. Verifikasi pake `crontab -l`

<details>
<summary>💡 Hint</summary>

```bash
# cleanup-temp.sh
cat > ~/cleanup-temp.sh << 'EOF'
#!/bin/bash
set -euo pipefail
LOG="$HOME/logs/cleanup.log"
mkdir -p "$(dirname "$LOG")"
echo "[$(date)] Cleaning /tmp/*.tmp older than 1 day..." >> "$LOG"
find /tmp -name "*.tmp" -mtime +1 -delete -print >> "$LOG"
echo "[$(date)] Done" >> "$LOG"
EOF

chmod +x ~/cleanup-temp.sh

# Set cron
crontab -l > current-cron 2>/dev/null || true
echo "0 3 * * * $HOME/cleanup-temp.sh >> $HOME/logs/cleanup.log 2>&1" >> current-cron
crontab current-cron
rm current-cron
crontab -l
```
</details>

---

### Latihan 7: Multi-function Script

Buat `project-tools.sh` yang punya 3 subcommand:

- `./project-tools.sh init [nama]` — bikin folder proyek dengan struktur standar (src, tests, docs, README.md)
- `./project-tools.sh backup` — bikin archive `.tar.gz` dari folder proyek
- `./project-tools.sh stats` — hitung jumlah file, baris code, ukuran folder
- `./project-tools.sh help` — tampilkan help

Pakai `case` untuk routing subcommand.

<details>
<summary>💡 Hint</summary>

```bash
#!/bin/bash
set -euo pipefail

init() {
  local name="${1:-my-project}"
  mkdir -p "$name"/{src,tests,docs}
  echo "# $name" > "$name/README.md"
  echo "# $name" > "$name/src/index.js"
  echo "Proyek $name berhasil dibuat!"
}

backup() {
  local dir="${1:-.}"
  local name=$(basename "$(realpath "$dir")")
  local archive="$HOME/backups/${name}-$(date '+%Y%m%d-%H%M%S').tar.gz"
  mkdir -p "$HOME/backups"
  tar -czvf "$archive" "$dir"
  echo "Backup: $archive"
}

stats() {
  local dir="${1:-.}"
  echo "=== Stats Proyek ==="
  echo "File: $(find "$dir" -type f | wc -l)"
  echo "Baris code: $(find "$dir" -type f -exec cat {} + | wc -l)"
  echo "Ukuran: $(du -sh "$dir" | cut -f1)"
}

case "${1:-help}" in
  init)
    init "${2:-}"
    ;;
  backup)
    backup "${2:-.}"
    ;;
  stats)
    stats "${2:-.}"
    ;;
  help|*)
    echo "Usage: $0 {init|backup|stats|help}"
    ;;
esac
```
</details>
