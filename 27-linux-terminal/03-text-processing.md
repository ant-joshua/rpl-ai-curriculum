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
```

## sed — Stream Editor

```bash
# substitusi
sed 's/lama/baru/' file.txt            # ganti pertama tiap baris
sed 's/lama/baru/g' file.txt           # ganti semua (global)
sed -i 's/lama/baru/g' file.txt        # in-place

# hapus baris
sed '/debug/d' file.txt                # hapus baris mengandung "debug"
sed '3,5d' file.txt                    # hapus baris 3-5

# print baris tertentu
sed -n '10,20p' file.txt
sed -n '/error/p' file.txt             # = grep

# contoh umum
sed 's/  */ /g' file.txt               # compress spasi
sed 's/^[[:space:]]*//' file.txt      # trim leading whitespace
sed '/^$/d' file.txt                   # hapus baris kosong
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
```

## cut, sort, uniq, wc

```bash
# cut — ambil kolom per karakter/delimiter
cut -d: -f1,3 /etc/passwd
cut -c1-10 file.txt                    # karakter 1-10

# sort — urutkan
sort file.txt
sort -n file.txt                       # numeric
sort -r file.txt                       # reverse
sort -k2 -n data.txt                   # berdasarkan kolom 2

# uniq — hilangkan duplikat (HARUS di-sort dulu)
sort file.txt | uniq
sort file.txt | uniq -c               # hitung kemunculan
sort file.txt | uniq -d               # cuma duplikat

# wc — word count
wc -l file.txt                         # jumlah baris
wc -w file.txt                         # jumlah kata
wc -c file.txt                         # jumlah bytes
```

## head, tail & Pipe Chain

```bash
# head/tail
head -20 file.txt                      # 20 baris pertama
tail -50 file.txt                      # 50 baris terakhir
tail -f app.log                        # follow — nunggu output baru

# pipe chain — contoh konkret
# 1. Cari 5 IP paling sering request dari access log
cat access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -5

# 2. Cari endpoint API paling lambat
cat access.log | awk '{print $7, $NF}' | sort -k2 -rn | head -10

# 3. Honeypot — filter IP mencurigakan
cat auth.log | grep "Failed password" | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr | head -10
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
