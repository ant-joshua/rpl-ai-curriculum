# Video Pembelajaran — RPL AI Curriculum

Guide buat guru/creator yang mau bikin video pembelajaran dari tiap modul.

## Format Video

| Aspek | Standar |
|-------|---------|
| **Durasi** | 5-15 menit per sesi (gak usah lebih) |
| **Resolusi** | 1080p 30fps |
| **Audio** | Mikrofon eksternal (jangan pake laptop mic) |
| **Format** | MP4 H.264 |
| **Platform** | YouTube (unlisted) + embed di Docsify |

## Struktur Tiap Video

```
⏱️ INTRO (1-2 menit)
  ├ Hook — masalah nyata yang relatable
  ├ Tujuan sesi — "Setelah nonton ini kamu bisa..."
  └ Prasyarat — modul sebelumnya yang wajib

⏱️ ISI (5-8 menit)
  ├ Konsep — slide + diagram (pakai slide deck yang udah ada)
  ├ Demo langsung — coding di VS Code + terminal
  ├ Code review — jelasin baris per baris
  └ Common mistakes — apa yang sering salah

⏱️ PRAKTIK (2-3 menit)
  ├ Kasih challenge / exercise
  ├ Tunjukkin expected output
  └ Hint kalo mentok

⏱️ OUTRO (1 menit)
  ├ Recap — 3 poin penting
  ├ Link ke exercise + cheatsheet
  ├ Next module — spoiler
  └ Call to action — "Coba kerjain challenge week-X"
```

## Script Template

```markdown
# Video: [Modul] — [Sesi]

## Hook (30 detik)
"Lo pernah gak [masalah relatable]? Nah di video ini..."
→ Tunjukkin masalah di layar

## Tujuan (30 detik)
✅ Bisa [kompetensi 1]
✅ Bisa [kompetensi 2]
✅ Bisa [kompetensi 3]

## Demo (5 menit)
1. Buka VS Code — tunjukkin file structure
2. [Step 1] — jelasin sambil ngetik
3. [Step 2] — run + tunjukkin output
4. [Step 3] — error umum + fix

## Challenge (1 menit)
"Sekarang giliran lo. Buka file exercise-XX, kerjain soal nomor 3."
→ Tunjukkin expected output

## Outro (30 detik)
"Gimana? Gampang kan? Next kita bakal bahas [topik]."
→ Tunjuk link sidebar + challenge
```

## Tools

| Tool | Fungsi | Alternatif |
|------|--------|-----------|
| OBS Studio | Screen recording + webcam | Loom, Screen Studio |
| VS Code | Code demo | Cursor, WebStorm |
| Marp | Slide presentasi (dari slide deck kita) | PowerPoint |
| Peek / Kap | GIF recording (buat show error) | Gifski |
| DaVinci Resolve | Editing video | CapCut, Premiere Pro |

## Alur Produksi

```
┌─────────────────────────────────────────────────┐
│  PRE-PRODUCTION                                 │
│  ├ Pilih modul + sesi                           │
│  ├ Baca slide deck (slides/<modul>/<sesi>.md)   │
│  ├ Bikin script (pakai template di atas)        │
│  ├ Siapin demo code (clone repo, buka di VS)    │
│  └ Cek audio + lighting                         │
├─────────────────────────────────────────────────┤
│  PRODUCTION                                     │
│  ├ Record pakai OBS (screen + webcam kecil)     │
│  ├ Read script natural (gak kaku)               │
│  ├ Selingi dengan pertanyaan retoris            │
│  └ Pause kalau salah — edit nanti               │
├─────────────────────────────────────────────────┤
│  POST-PRODUCTION                                │
│  ├ Edit di DaVinci / CapCut                     │
│  ├ Tambahin lower thirds (nama + modul)         │
│  ├ Cut dead air, pause panjang                  │
│  ├ Export 1080p H.264                           │
│  └ Upload ke YouTube (unlisted)                 │
└─────────────────────────────────────────────────┘
```

## List Video per Modul

Ada **57 modul × 4 sesi = 228 video potensial** — gak usah dibikin semua sekali jalan.
Prioritas:

| Wave | Modul | Total Video | Dampak |
|------|-------|-------------|--------|
| 🥇 Wave 1 | 00-07 (Fundamental) | 32 | Kritis — fundamental siswa baru |
| 🥈 Wave 2 | 35-37 (HTML/CSS, Web Arch, DB) | 12 | Pelengkap pemula |
| 🥉 Wave 3 | 08-19 (Intermediate) | 46 | Skill inti |
| Wave 4 | 20-34 (Advanced) | 58 | Khusus minat |
| Wave 5 | 38-56 (AI & Karir) | 80 | Spesialisasi |

> **Rekomendasi:** Mulai dari modul 00-07 + 35-37 (44 video). Itu udah cover siswa dari nol sampe bisa deploy.
