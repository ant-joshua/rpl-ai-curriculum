# 01. File System & Permission

## Navigasi Dasar

```bash
# cek posisi sekarang
pwd

# list file & folder
ls
ls -l          # detail (permission, size, date)
ls -a          # include hidden files
ls -lh         # human readable size
ls -la /tmp    # kombinasi
ls -lt         # urut berdasarkan waktu modifikasi
ls -lS         # urut berdasarkan ukuran

# pindah direktori
cd /home
cd ..          # naik 1 level
cd ~           # ke home
cd -           # ke direktori sebelumnya
```

## Manipulasi File & Folder

```bash
# buat folder
mkdir project
mkdir -p project/src/components   # nested — buat semua parent sekaligus

# copy
cp file.txt backup.txt
cp -r folder/ backup-folder/     # recursive
cp -i file.txt backup/           # interactive — konfirmasi sebelum overwrite
cp -p file.txt backup/           # preserve permission, ownership, timestamp

# move / rename
mv file.txt newname.txt
mv file.txt backup/               # pindah
mv -i file.txt backup/            # konfirmasi sebelum overwrite

# hapus
rm file.txt
rm -rf folder/                    # recursive force — hati-hati!
rm -i file.txt                    # konfirmasi sebelum hapus

# link — hard link vs symbolic link
ln file.txt hardlink.txt         # hard link — referensi ke inode yang sama
ln -s file.txt softlink.txt      # soft/symbolic link — referensi ke nama file

# perbedaan hard vs soft link
# Hard link: file asli dan link punya inode sama, hapus satu tidak pengaruh lain
# Soft link: seperti shortcut, link putus kalau file asli dihapus
ls -li                           # cek inode number (kolom pertama)
```

## Vim Basics

Vim adalah editor teks paling populer di terminal. Modal editor — setiap mode punya fungsi beda.

### Mode Vim

| Mode | Fungsi | Cara Masuk |
|------|--------|------------|
| **Normal** | Navigasi, copy, paste, delete | `Esc` dari mode lain |
| **Insert** | Ngetik teks | `i` dari Normal mode |
| **Visual** | Seleksi teks | `v` dari Normal mode |
| **Command** | Simpan, keluar, search | `:` dari Normal mode |

### Navigasi Normal Mode

```bash
# Dasar
h       # kiri
j       # bawah
k       # atas
l       # kanan
w       # loncat ke awal kata berikutnya
b       # loncat ke awal kata sebelumnya
0       # ke awal baris
$       # ke akhir baris
gg      # ke awal file
G       # ke akhir file
:42     # loncat ke baris 42

# Edit
i       # insert di posisi kursor
a       # append setelah kursor
o       # buka baris baru di bawah
O       # buka baris baru di atas
x       # hapus 1 karakter
dd      # hapus 1 baris
yy      # copy 1 baris (yank)
p       # paste di bawah
u       # undo
Ctrl+r  # redo
```

### Simpan & Keluar

```bash
:w        # simpan (write)
:wq       # simpan & keluar
:q!       # keluar tanpa simpan (force)
:x        # simpan & keluar (sama kaya :wq)
ZZ        # simpan & keluar (shortcut Normal mode)
```

### Search & Replace di Vim

```bash
# Search
/text    # cari "text" ke depan
?text    # cari "text" ke belakang
n        # lanjut ke hasil berikutnya
N        # lanjut ke hasil sebelumnya

# Replace
:%s/lama/baru/g          # replace semua "lama" jadi "baru" di seluruh file
:%s/lama/baru/gc         # replace dengan konfirmasi tiap perubahan
:5,20s/lama/baru/g       # replace cuma di baris 5-20
```

### Tips Vim

```bash
# Split window
:sp file.txt       # split horizontal
:vsp file.txt      # split vertikal
Ctrl+w w           # pindah antar split

# Tab
:tabnew file.txt   # buka file di tab baru
gt                 # pindah tab berikutnya

# Visual mode
v                  # select karakter
V                  # select baris
Ctrl+v             # select block (kolom)
# setelah select, tekan : untuk operasi di area select
```

## Mencari File

```bash
# find — cari file berdasarkan nama, size, waktu
find . -name "*.log"
find /var -type f -size +100M
find ~ -mtime -7          # dimodifikasi 7 hari terakhir
find . -empty             # file/folder kosong
find . -perm 644          # cari file dengan permission tertentu
find . -type f -name "*.log" -exec rm {} \;   # hapus file log hasil find
find . -type f -size +10M -exec ls -lh {} \;  # tampilkan file > 10MB

# find + xargs — eksekusi批量 perintah
find . -name "*.tmp" | xargs rm -f
find . -type f -name "*.py" | xargs grep "TODO"

# du — ukuran file/folder
du -sh folder/
du -h --max-depth=1 .
du -ah /var/log/ | sort -rh | head -10   # 10 file terbesar di /var/log

# df — sisa disk
df -h
df -h /home
df -i                    # cek inode usage (sering habis di server kecil)
```

## Kompresi & Arsip

```bash
# tar — archive
tar -cvf archive.tar folder/     # buat tar (compress NO)
tar -xvf archive.tar             # extract tar
tar -czvf archive.tar.gz folder/ # buat tar + gzip
tar -xzvf archive.tar.gz         # extract tar.gz
tar -cjvf archive.tar.bz2 folder/ # buat tar + bzip2

# gzip / gunzip
gzip file.txt                    # compress → file.txt.gz
gunzip file.txt.gz               # decompress
gzip -k file.txt                 # compress, keep original

# zip / unzip (sering di Windows)
zip -r archive.zip folder/
unzip archive.zip
unzip -l archive.zip             # lihat isi zip tanpa extract
```

## Latihan

### Latihan 1: Navigasi & Struktur Folder

Buat struktur folder proyek berikut dalam satu command:

```
project/
├── src/
│   ├── components/
│   └── utils/
├── tests/
└── docs/
```

<details>
<summary>💡 Hint</summary>

```bash
mkdir -p project/{src/{components,utils},tests,docs}
```
</details>

---

### Latihan 2: File Permission

1. Buat file `deploy.sh`
2. Isi dengan `#!/bin/bash\necho "Deploying..."`
3. Ubah permission jadi executable buat owner, readable & executable buat group, readable aja buat other
4. Jalankan `./deploy.sh`

<details>
<summary>💡 Hint</summary>

```bash
touch deploy.sh
echo '#!/bin/bash
echo "Deploying..."' > deploy.sh
chmod 755 deploy.sh
./deploy.sh
```
</details>

---

### Latihan 3: Cari File Besar

Cari 5 file terbesar di `/var/log/`, tampilkan ukuran & path-nya.

<details>
<summary>💡 Hint</summary>

```bash
du -ah /var/log/ | sort -rh | head -5
```
</details>

---

### Latihan 4: Backup Otomatis (Manual)

1. Buat folder `source/` dengan 3 file dummy
2. Buat folder `backup/`
3. Copy semua file dari `source/` ke `backup/` pake `cp` + wildcard
4. Ganti nama folder `backup/` jadi `backup-$(date +%Y%m%d)`
5. Cek hasilnya

<details>
<summary>💡 Hint</summary>

```bash
mkdir source backup
touch source/file{a,b,c}.txt
cp source/* backup/
mv backup/ "backup-$(date +%Y%m%d)"
ls -la
```
</details>

---

### Latihan 5: Vim — Edit File

1. Buat file `catatan.txt` pake Vim
2. Masuk Insert mode, tulis 3 baris tentang hobimu
3. Simpan & keluar
4. Buka lagi, search kata tertentu pake `/`
5. Ganti semua kata "saya" jadi "aku" pake `:%s/saya/aku/g`

<details>
<summary>💡 Hint</summary>

```bash
vim catatan.txt
# tekan i → tulis teks → Esc → :wq
vim catatan.txt  # buka lagi
# /saya → cari → n buat next
# :%s/saya/aku/g → replace semua
```
</details>

---

### Latihan 6: Hard vs Soft Link

1. Buat file `original.txt` dengan isi "Halo Dunia"
2. Buat hard link `hard.txt` dan soft link `soft.txt`
3. Bandingkan inode pake `ls -li`
4. Hapus `original.txt`, coba baca `hard.txt` dan `soft.txt`
5. Amati perbedaannya

<details>
<summary>💡 Hint</summary>

```bash
echo "Halo Dunia" > original.txt
ln original.txt hard.txt
ln -s original.txt soft.txt
ls -li original.txt hard.txt soft.txt
rm original.txt
cat hard.txt   # masih ada isinya
cat soft.txt   # error: No such file or directory
```
</details>

---

### Latihan 7: Arsip & Kompresi

1. Buat folder `data/` dengan 3 file .txt
2. Archive folder `data/` jadi `data.tar.gz` pake tar
3. Extract `data.tar.gz` ke folder `restore/`
4. Bandingkan ukuran folder asli vs file arsip

<details>
<summary>💡 Hint</summary>

```bash
mkdir data restore
touch data/file{a,b,c}.txt
tar -czvf data.tar.gz data/
ls -lh data.tar.gz
tar -xzvf data.tar.gz -C restore/
ls restore/
du -sh data/ data.tar.gz
```
</details>
