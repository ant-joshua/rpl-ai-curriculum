---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/546819/pexels-pho"
footer: "Sesi 01: File System"
---

<!-- _class: title -->
# 01. File System & Permission

## Navigasi Dasar

```bash

---

# cek posisi sekarang
pwd


---

# list file & folder
ls
ls -l          # detail (permission, size, date)
ls -a          # include hidden files
ls -lh         # human readable size
ls -la /tmp    # kombinasi


---

# pindah direktori
cd /home
cd ..          # naik 1 level
cd ~           # ke home
cd -           # ke direktori sebelumnya
```

## Manipulasi File & Folder

```bash

---

# buat folder
mkdir project
mkdir -p project/src/components   # nested


---

# copy
cp file.txt backup.txt
cp -r folder/ backup-folder/     # recursive


---

# move / rename
mv file.txt newname.txt
mv file.txt backup/               # pindah


---

# hapus
rm file.txt
rm -rf folder/                    # recursive force — hati-hati!
```

## File Permission

```bash

---

# lihat permission
ls -l script.sh

---

# -rwxr-xr--  1 user group  1234 Apr 10 12:00 script.sh

---

# ^^^rwxr-x---

---

# |  |||||||||

---

# |  ||||||||+-- other: read

---

# |  ||||||+--- other: --

---

# |  |||||+---- group: read, exec

---

# |  ||||+----- group: --

---

# |  |||+------ owner: read, write, exec

---

# |  ||+------- sticky bit

---

# |  |+-------- setgid

---

# |  +--------- setuid / file type


---

# ubah permission (chmod)
chmod 755 script.sh       # rwxr-xr-x
chmod u+x script.sh       # owner + execute
chmod g-w file.txt        # group - write
chmod o+r file.txt        # other + read


---

# ubah owner (chown — pake sudo)
sudo chown user:group file.txt
sudo chown -R user:group folder/
```

## Mencari File

```bash

---

# find — cari file berdasarkan nama, size, waktu
find . -name "*.log"
find /var -type f -size +100M
find ~ -mtime -7          # dimodifikasi 7 hari terakhir
find . -empty             # file/folder kosong


---

# du — ukuran file/folder
du -sh folder/
du -h --max-depth=1 .


---

# df — sisa disk
df -h
df -h /home
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
