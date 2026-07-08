# 03. Text Processing

## grep — Cari Teks

```bash
# basic
grep "error" app.log
grep -i "warning" app.log      # case-insensitive
grep -r "TODO" src/            # recursive
grep -l "config" *.py          # cuma nama file
grep -n "function" index.js    # tampilkan nomor baris
grep -c "failed" log.txt       # hitung jumlah

# regex
grep "^2024-" log.txt          # baris diawali "2024-"
grep "error\|fatal\|panic" log.txt
grep -E "[0-9]{3}\.[0-9]{3}"  # extended regex (ERE)
grep -P "\d{3}\.\d{3}"        # perl regex (kalau support)

# inverse & context
grep -v "debug" log.txt        # kecualikan
grep -A 2 "error" log.txt     # 2 baris setelah
grep -B 2 "error" log.txt     # 2 baris sebelum
grep -C 3 "error" log.txt     # 3 baris konteks

# soal praktik — real scenarios

# 1. Cari IP mencurigakan dari auth log
grep "Failed password" /var/log/auth.log | grep -oE "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b" | sort | uniq -c | sort -nr

# 2. Cari baris log dengan durasi request > 5 detik
grep -E "duration=[5-9]\.[0-9]|duration=[1-9][0-9]+\.[0-9]" app.log

# 3. Cari error yang bukan dari health check endpoint
grep "ERROR" app.log | grep -v "/health"

# 4. Cari kode HTTP >= 500 di access log
grep -E '" (5[0-9]{2}) ' access.log

# 5. Cari semua file konfigurasi yang belum di-comment
grep -r "^[^#]" /etc/nginx/ --include="*.conf"
```

## sed — Stream Editor

```bash
# substitusi
sed 's/lama/baru/' file.txt            # ganti pertama tiap baris
sed 's/lama/baru/g' file.txt           # ganti semua (global)
sed -i 's/lama/baru/g' file.txt        # in-place — langsung ubah file
sed -i.bak 's/lama/baru/g' file.txt    # backup dulu (.bak)

# hapus baris
sed '/debug/d' file.txt                # hapus baris mengandung "debug"
sed '3,5d' file.txt                    # hapus baris 3-5
sed '/^#/d' config.txt                 # hapus comment line
sed '/^$/d' file.txt                   # hapus baris kosong
sed -n '/ERROR/,/END_ERROR/p' log.txt  # print range baris

# print baris tertentu
sed -n '10,20p' file.txt
sed -n '/error/p' file.txt             # = grep

# contoh umum
sed 's/  */ /g' file.txt               # compress spasi
sed 's/^[[:space:]]*//' file.txt      # trim leading whitespace
sed 's/[[:space:]]*$//' file.txt      # trim trailing whitespace
sed 's/^[[:space:]]*//;s/[[:space:]]*$//' file.txt  # trim kedua sisi

# real scenarios

# 1. Ganti environment variable di file .env
sed -i 's/DATABASE_URL=.*/DATABASE_URL=postgresql:\/\/newuser:pass@localhost:5432\/mydb/' .env

# 2. Tambah baris setelah pattern match
sed -i '/\[database\]/a host = localhost' config.ini

# 3. Hapus 5 baris pertama file CSV (header)
sed -i '1,5d' data.csv

# 4. Tambah prefix ke setiap baris
sed 's/^/PREFIX: /' file.txt

# 5. Extract antara 2 marker
sed -n '/<config>/,/<\/config>/p' app.xml | sed '1d;$d'
```

## awk — Pemrosesan Kolom

```bash
# basic — print kolom
awk '{print $1, $3}' file.txt
awk '{print NF, NR, $0}' file.txt     # jumlah kolom, nomor baris, seluruh baris

# delimiter kustom
awk -F: '{print $1}' /etc/passwd      # split by ":"
awk -F',' '{sum+=$3} END {print sum}' data.csv

# filter & hitung
awk '$3 > 50 {print $1, $3}' scores.txt
awk '/error/ {count++} END {print count}' log.txt

# format output
awk '{printf "%-20s %10d\n", $1, $3}' data.txt

# real scenarios

# 1. Parse access.log — hitung bandwidth per IP
awk '{bytes[$1]+=$10} END {for (ip in bytes) print ip, bytes[ip]}' access.log | sort -k2 -rn | head

# 2. Rata-rata, min, max response time
awk '{sum+=$NF; count++; if ($NF > max) max=$NF; if (min=="" || $NF < min) min=$NF} END {print "Avg:", sum/count, "Min:", min, "Max:", max}' access.log

# 3. Hitung jumlah request per status code
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# 4. Filter baris dengan kolom tertentu tidak kosong
awk '$3 != "" && $5 > 0' file.txt

# 5. Group by jam — hitung request per jam
awk '{print substr($4,2,3)}' access.log | sort | uniq -c | sort -k2
```

## cut, sort, uniq, wc

```bash
# cut — ambil kolom per karakter/delimiter
cut -d: -f1,3 /etc/passwd
cut -c1-10 file.txt                    # karakter 1-10
cut -d' ' -f2- access.log              # kolom 2 sampai akhir

# sort — urutkan
sort file.txt
sort -n file.txt                       # numeric
sort -r file.txt                       # reverse
sort -k2 -n data.txt                   # berdasarkan kolom 2
sort -t: -k3 -rn /etc/passwd           # delimiter :, kolom 3 numeric reverse
sort -u file.txt                       # sort + uniq sekaligus

# uniq — hilangkan duplikat (HARUS di-sort dulu)
sort file.txt | uniq
sort file.txt | uniq -c               # hitung kemunculan
sort file.txt | uniq -d               # cuma duplikat
sort file.txt | uniq -u               # cuma yang unik

# wc — word count
wc -l file.txt                         # jumlah baris
wc -w file.txt                         # jumlah kata
wc -c file.txt                         # jumlah bytes
wc -L file.txt                         # panjang baris terpanjang
```

## head, tail & Pipe Chain

```bash
# head/tail
head -20 file.txt                      # 20 baris pertama
tail -50 file.txt                      # 50 baris terakhir
tail -f app.log                        # follow — nunggu output baru
tail -n +100 file.txt                  # dari baris 100 sampai akhir

# pipe chain — contoh konkret
# 1. Cari 5 IP paling sering request dari access log
cat access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -5

# 2. Cari endpoint API paling lambat
cat access.log | awk '{print $7, $NF}' | sort -k2 -rn | head -10

# 3. Honeypot — filter IP mencurigakan
cat auth.log | grep "Failed password" | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr | head -10

# 4. Analisis HTTP status code distribution
awk '{print $9}' access.log | sort | uniq -c | sort -rn | awk '{printf "%s: %d (%d%%)\n", $2, $1, $1/NR*100}'

# 5. Cari baris error yang paling sering muncul (group by message)
grep "ERROR" app.log | sort | uniq -c | sort -rn | head

# 6. Bandingkan 2 file — cari baris yang berbeda
diff file1.txt file2.txt
comm -3 file1.txt file2.txt            # baris yang cuma ada di salah satu

# 7. Extract JSON dari log baris
grep "response:" app.log | sed 's/.*response: //' | head -5
```

## Log Analysis — Real World Scenarios

### Analisis Nginx/Apache Access Log

Format umum access log:

```
192.168.1.1 - - [12/Jun/2024:10:15:30 +0000] "GET /api/users HTTP/1.1" 200 1234
```

```bash
# 1. Request per detik (throughput)
awk '{print $4}' access.log | cut -d: -f2-3 | sort | uniq -c | sort -rn | head

# 2. Cari slow requests (> 5 detik) — kalo access log ada response_time di akhir
awk '$NF > 5 {print $1, $7, $NF}' access.log | sort -k3 -rn

# 3. Cari 404 errors terbanyak
awk '$9 == 404 {print $7}' access.log | sort | uniq -c | sort -rn | head

# 4. User agent distribution
awk -F'"' '{print $6}' access.log | sort | uniq -c | sort -rn | head

# 5. Traffic per endpoint
awk '{print $7}' access.log | sort | uniq -c | sort -rn | head
```

### Analisis Log Aplikasi

Log aplikasi sering format JSON atau structured:

```bash
# 1. Filter level log
grep '"level":"error"' app.json.log | wc -l

# 2. Ekstrak trace_id untuk tracing request
grep "request_id=abc123" app.log | awk '{print $1, $2, $0}'

# 3. Cari error dalam rentang waktu
awk '$1 >= "2024-06-01" && $1 <= "2024-06-02" && /ERROR/' app.log

# 4. Hitung rata-rata durasi tiap endpoint
awk '{split($7, path, "?"); endpoint=path[1]; duration[$NF]++; total[$NF]+=$NF} END {for (e in total) print e, total[e]/duration[e]}' access.log
```

### Journalctl — System Log

```bash
# journalctl — log systemd service
journalctl -u nginx
journalctl -u nginx -f                      # follow
journalctl -u nginx --since "2024-06-01" --until "2024-06-02"
journalctl -u nginx -p err                  # cuma error
journalctl -u nginx --no-pager              # no pager (full output)
journalctl -k                               # kernel messages
journalctl --list-boots                     # daftar boot sessions
```

## jq — JSON Parser

```bash
# basic
echo '{"name":"Alice","age":30}' | jq '.'
echo '{"name":"Alice","age":30}' | jq '.name'

# array
curl -s https://api.github.com/users/nousresearch/repos | jq '.[].name'
curl -s https://api.github.com/repos/nousresearch/hermes-agent | jq '{name, description, stars: .stargazers_count}'

# filter
cat data.json | jq 'select(.age > 25)'
cat data.json | jq '.[] | select(.status=="active") | {name, email}'

# format
cat minified.json | jq '.'             # prettify
jq -c '.' pretty.json                  # minify

# path traversal
jq '.metadata.timestamps.created' data.json

# array operations
jq '.[0:3]' data.json                  # slice — 3 item pertama
jq 'map(select(.price > 10))' data.json
jq 'group_by(.category) | map({category: .[0].category, items: . | length})' data.json

# merge & transform
jq '{total: [.items[].price] | add, count: .items | length}' data.json
```

## Latihan

### Latihan 1: Log Analyzer — grep + awk + sort

Dari file `server.log` (buat dummy dulu):

```
2024-06-01 10:00:00 INFO Server started
2024-06-01 10:01:23 ERROR Connection timeout to db
2024-06-01 10:02:45 WARN Memory usage 85%
2024-06-01 10:03:12 ERROR Disk full on /dev/sda1
2024-06-01 10:04:00 INFO Request handled in 230ms
2024-06-01 10:05:30 ERROR Connection timeout to db
```

Tampilkan:

1. Semua ERROR beserta pesannya
2. Hitung berapa kali tiap ERROR muncul
3. Urutkan dari yang paling sering

<details>
<summary>💡 Hint</summary>

```bash
grep "ERROR" server.log | awk -F'ERROR ' '{print $2}' | sort | uniq -c | sort -nr
```
</details>

---

### Latihan 2: CSV Processing — awk + sort

File `nilai.csv` (buat sendiri):

```
nama,matematika,ipa,inggris
Alice,85,90,78
Bob,72,68,85
Charlie,90,95,92
Diana,60,75,70
```

Hitung rata-rata tiap siswa, urutkan dari tertinggi.

<details>
<summary>💡 Hint</summary>

```bash
awk -F',' 'NR>1 {rata=($2+$3+$4)/3; print rata, $1}' nilai.csv | sort -rn
```
</details>

---

### Latihan 3: JSON API — jq

Pakai curl ambil data dari public API (contoh: JSONPlaceholder), lalu:

1. Ambil semua judul post
2. Cari post yang userID = 1
3. Tampilkan post yang judulnya mengandung kata "eum"

<details>
<summary>💡 Hint</summary>

```bash
curl -s https://jsonplaceholder.typicode.com/posts | jq '.[] | select(.userId==1) | .title'
curl -s https://jsonplaceholder.typicode.com/posts | jq '.[] | select(.title | test("eum"; "i")) | {id, title}'
```
</details>

---

### Latihan 4: Pipe Chain — Data Pipeline

Dari `access.log` (buat dummy dengan format `IP - - [date] "METHOD /path HTTP/1.1" status bytes`):

1. Ekstrak IP & path request
2. Hitung berapa request tiap IP
3. Tampilkan 3 IP paling banyak request
4. Simpan hasil ke file `top-ips.txt`

<details>
<summary>💡 Hint</summary>

```bash
awk '{print $1, $7}' access.log | sort | uniq -c | sort -nr | head -3 > top-ips.txt
```
</details>

---

### Latihan 5: sed In-Place Edit

File `config.env` punya isi:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devdb
DB_USER=admin
DB_PASS=secret123
```

Ganti semua nilai pake sed:

1. DB_HOST → production.example.com
2. DB_NAME → proddb
3. Backup file asli dengan ekstensi `.bak`

<details>
<summary>💡 Hint</summary>

```bash
sed -i.bak 's/DB_HOST=.*/DB_HOST=production.example.com/' config.env
sed -i 's/DB_NAME=.*/DB_NAME=proddb/' config.env
cat config.env
```
</details>

---

### Latihan 6: Analisis Log — Top 404

Dari access log, cari:

1. Endpoint mana yang paling sering return 404
2. Tampilkan 5 endpoint dengan 404 terbanyak
3. Tampilkan juga IP yang paling sering dapat 404

<details>
<summary>💡 Hint</summary>

```bash
# Endpoint 404 terbanyak
awk '$9 == 404 {print $7}' access.log | sort | uniq -c | sort -rn | head -5

# IP 404 terbanyak
awk '$9 == 404 {print $1}' access.log | sort | uniq -c | sort -rn | head -5
```
</details>

---

### Latihan 7: awk — Generate Laporan

Dari file `transaksi.csv` dengan format `tanggal,produk,harga,jumlah`:

```
2024-06-01,Nasi Goreng,15000,2
2024-06-01,Es Teh,5000,3
2024-06-02,Nasi Goreng,15000,1
2024-06-02,Mie Ayam,12000,2
2024-06-03,Es Teh,5000,4
```

Buat laporan:

1. Total penjualan per produk (harga × jumlah)
2. Total pendapatan per hari
3. Produk terlaris (jumlah terbanyak)

<details>
<summary>💡 Hint</summary>

```bash
# Total per produk
awk -F',' 'NR>1 {total[$2]+=$3*$4} END {for (p in total) printf "%s: Rp %d\n", p, total[p]}' transaksi.csv

# Total per hari
awk -F',' 'NR>1 {harian[$1]+=$3*$4} END {for (h in harian) printf "%s: Rp %d\n", h, harian[h]}' transaksi.csv

# Produk terlaris
awk -F',' 'NR>1 {qty[$2]+=$4} END {for (p in qty) printf "%s: %d item\n", p, qty[p]}' transaksi.csv | sort -t: -k2 -rn | head
```
</details>
