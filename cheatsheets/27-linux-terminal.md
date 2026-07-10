# 27. 🐧 Linux & Terminal

## File System
| Command | Kegunaan |
|---------|----------|
| `pwd` | Cetak direktori saat ini |
| `ls` | List file (`-a` hidden, `-l` detail, `-R` recursive) |
| `cd <dir>` | Pindah direktori |
| `mkdir <nama>` | Buat folder |
| `touch <file>` | Buat file kosong |
| `cp <src> <dst>` | Copy file (`-r` untuk folder) |
| `mv <src> <dst>` | Move/rename |
| `rm <file>` | Hapus file (`-rf` hapus folder paksa) |
| `cat <file>` | Baca file |
| `less <file>` | Baca file dengan scroll |
| `head -n 5 <file>` | 5 baris pertama |
| `tail -n 5 <file>` | 5 baris terakhir |

## Permissions
```bash
chmod 755 script.sh     # rwx r-x r-x
chmod +x script.sh      # tambah executable
chown user:group file   # ganti kepemilikan
```

## Searching & Text
```bash
grep "pattern" file         # cari teks
grep -r "pattern" dir/      # recursive
grep -i "pattern" file      # case insensitive
wc -l file                  # hitung baris
sort file                   # urutkan
uniq file                   # hilangkan duplikat
diff file1 file2            # bandingkan file
```

## Process Management
```bash
ps aux              # lihat semua proses
top / htop          # monitor proses real-time
kill <PID>          # matikan proses
kill -9 <PID>       # paksa matikan
fg / bg             # foreground / background
nohup command &     # jalankan tanpa hangup
```

## File Info
```bash
du -sh dir/         # ukuran folder
df -h               # disk space
file nama           # tipe file
which node          # lokasi binary
```

## Pipes & Redirection
```bash
command1 | command2           # pipe output ke command lain
command > file                # redirect output (overwrite)
command >> file               # redirect output (append)
command 2>&1                  # stderr ke stdout
command < file                # input dari file
```

## Shortcuts
| Shortcut | Fungsi |
|----------|--------|
| `Ctrl+C` | Hentikan proses |
| `Ctrl+D` | EOF / keluar shell |
| `Ctrl+Z` | Suspend (bg) |
| `Ctrl+R` | Cari history command |
| `!!` | Ulangi command terakhir |
| `Tab` | Autocomplete |
| `~` | Home directory |
| `.` | Dir saat ini |
| `..` | Parent dir |

## Common Pitfalls
- ❌ `rm -rf /` — hapus semua (jangan coba!)
- ❌ Lupa `sudo` — command butuh root
- ❌ Spasi di nama file — gunakan `\` atau quotes
- ❌ Pipe tanpa paham — cek output tiap tahap

## Related Links
- [05 Git Deploy](05-git-deploy.md)
