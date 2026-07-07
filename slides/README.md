### Slide Deck — RPL AI Curriculum

Semua slide ada di `slides/` — format **Marp** (Markdown → Presentasi).

## Cara Pakai

1. **VS Code** — Install extension "Marp for VS Code", buka file `.md`, klik "Open Preview"
2. **CLI** — `npx @marp-team/marp-cli slides/<modul>/<sesi>.md`
3. **Export** — `npx @marp-team/marp-cli slides/<modul>/<sesi>.md -o output.pdf`
   atau `-o output.pptx`

## Regenerate Semua

```bash
python3 scripts/marpify.py
```

Struktur: `slides/<module-dir>/<sesi>-<judul>.md`

## Theme

Custom theme di `slides/themes/rpl.css` — dark theme, warna primary indigo.
