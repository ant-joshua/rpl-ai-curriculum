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
# [ "$a" = "$b" ] — string sama
# [ "$a" -eq "$b" ] — numeric sama
# [ "$a" -gt "$b" ] — numeric lebih besar

# for loop
for file in *.log; do
  echo "Memproses $file"
  gzip "$file"
done

# while loop — baca file per baris
while IFS= read -r line; do
  echo "Baris: $line"
done < file.txt

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

## Function

```bash
#!/bin/bash

# define
log() {
  local msg="$1"         # local scope
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
```

## Error Handling

```bash
#!/bin/bash

# stop script kalau ada error
set -e               # exit on error
set -u               # error kalau undefined variable
set -o pipefail      # error di pipe cascade

# trap — tangkap signal & cleanup
cleanup() {
  echo "Cleanup: menghapus temporary files..."
  rm -rf /tmp/myscript-*
}

trap cleanup EXIT
trap 'echo "Interrupted!"; exit 1' INT

# manual error check
if ! mkdir -p /var/backups; then
  echo "Gagal buat folder backup!" >&2
  exit 1
fi
```

## Cron Job

```bash
# edit crontab
crontab -e

# format: menit jam hari tanggal bulan weekday perintah
#   */5 * * * * /home/midory/scripts/backup.sh

# contoh
# tiap jam 2 pagi
0 2 * * * /home/midory/scripts/daily-backup.sh

# tiap menit ke-15 tiap 6 jam
15 */6 * * * /home/midory/scripts/health-check.sh

# tiap hari Senin jam 3 pagi
0 3 * * 1 /home/midory/scripts/weekly-report.sh

# log output cron
0 2 * * * /home/midory/scripts/backup.sh >> /var/log/backup.log 2>&1

# list cron
crontab -l

# nonaktifkan sementara (comment pake #)
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
