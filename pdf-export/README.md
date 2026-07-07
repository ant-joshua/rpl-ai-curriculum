# PDF Export — RPL AI Curriculum

Semua modul dalam format PDF, di-generate otomatis dari markdown via Pandoc.

## Cara Generate

```bash
# Prasyarat
sudo apt install pandoc texlive-xetex texlive-fonts-recommended

# Generate semua modul
make pdf-all

# Generate satu modul
make pdf-00   # module 00
make pdf-01   # module 01, dst
```

## Daftar PDF

| # | File | Halaman (approx) |
|---|------|-------------------|
| 00 | [pdf-export/00-fundamentals.pdf](./pdf-export/00-fundamentals.pdf) | Web fundamental |
| 01 | [pdf-export/01-js-fundamentals.pdf](./pdf-export/01-js-fundamentals.pdf) | JS basics |
| ... | (57 modul total) | |

> **Catatan:** Emoji mungkin tidak muncul di PDF karena keterbatasan font LaTeX.  
> Akses versi web di [syllabus.ant-joshua.my.id](https://syllabus.ant-joshua.my.id) untuk konten lengkap dengan emoji.
