# 🧠 Cheatsheet: Linux Terminal & Shell Scripting

> Referensi cepet — 1 halaman.

## Topik Utama

**Navigasi & File:** `pwd`, `ls`, `cd`, `cp`, `mv`, `rm`, `mkdir`, `find`, `chmod`, `chown`

**Process & Networking:** `ps`, `top`, `kill`, `cron`, `curl`, `SSH`, `tmux`, pipes (`|`), redirects (`>`, `>>`)

**Text Processing:** `grep`, `sed`, `awk`, `cut`, `sort`, `uniq`, `jq`

**Shell Scripting:** Variables, loops (`for`, `while`), conditionals (`if`/`elif`/`else`), functions, error handling (`set -e`, `trap`)

## Command / Sintaks Penting

```bash
# File permissions
chmod 755 script.sh          # rwxr-xr-x
chmod +x script.sh           # tambah execute
chown user:group file.txt    # ubah owner

# Process
ps aux                       # semua proses
top                          # real-time monitor
kill -9 PID                  # force kill
crontab -e                   # edit cron jobs

# Text processing
grep -rn "TODO" src/         # recursive search with line numbers
sed -i 's/foo/bar/g' file   # replace all in-place
awk '{print $1, $3}' data    # print column 1 & 3
curl -s https://api.example.com | jq '.data[].name'

# Networking
curl -I https://example.com  # cek headers aja
ssh user@host                # remote login
scp file.txt user@host:/path # copy via SSH
```

```bash
# Shell script template
#!/bin/bash
set -euo pipefail           # strict mode

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }

if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <arg>"
    exit 1
fi

for file in "$@"; do
    log "Processing $file..."
done
```

## Tips & Trik

- `cd -` balik ke direktori sebelumnya
- `!!` ulang command terakhir, `!$` argumen terakhir
- `Ctrl+R` cari command history (reverse search)
- `set -euo pipefail` di awal script = safety net
- `watch -n 1 command` jalankan command tiap 1 detik
- `du -sh *` cek ukuran semua folder

## Common Mistakes

- **Spasi di variable assignment** — `VAR = value` (salah), `VAR=value` (benar)
- **Lupa `chmod +x`** — script gak bisa jalan langsung
- **`rm -rf` sembarangan** — double check sebelum hapus
- **Pipe tanpa error handling** — `set -o pipefail` biar pipe gagal ketahuan
- **Loop over file dengan spasi** — pake `while IFS= read -r` instead of `for`

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
