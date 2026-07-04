# 🧠 Cheatsheet: AI Prompt Engineering

> Referensi cepet — 1 halaman.

## Topik Utama
- **6 Teknik Prompt**: zero-shot, few-shot, chain-of-thought, role prompting, structured output, iterative refinement
- **Coding Prompts**: boilerplate, refactor, debug, explain, test, dokumentasi
- **Code Review AI**: cari security, performa, code smell, best practice
- **PROMPT-LOG.md**: catet tiap prompt + pelajaran — anti plagiarisme
- **Cursor / Copilot**: agent mode, inline chat, `/fix`, `/explain`
- **Etika**: jangan copy paste mentah, aturan 70/30 (manual≥70%)

## Command / Sintaks Penting

```text
# Template Prompt Baik
Buatkan [task] pake [stack].
Spesifikasi: [fitur detail].
Batasan: [jangan lakukan X].
Konteks: [project scope].

# Debug Prompt
Error: [message] di [file:baris].
Kode: [tempel].
Yang udah dicoba: [xyz].
Analisis penyebab aja — jangan kasih fix.
```

```markdown
# PROMPT-LOG.md format
## 2025-01-20
### Prompt: [tujuan]
- **Amanan:** [security/performa/readability]
- **Hasil:** [output AI]
- **Yang dipelajari:** [insight]
- **Modifikasi manual:** [apa yang diubah]
```

## Tips & Trik
- **Chain-of-thought**: breakdown problem → tanya step-by-step, bukan 1 prompt besar.
- **Structured output**: minta JSON — `Respond in JSON: { "explanation": "...", "code": "..." }`
- **Project context**: kasih AI gambaran proyek + stack sebelum minta bantuan.
- **Agent mode (Cursor)**: commit dulu, minta rencana dulu, review tiap perubahan.
- **Aturan 70/30**: ≥70% kode lo tulis manual, maks 30% AI — biar paham.

## Common Mistakes
❌ Copy paste mentah tanpa paham — nyontek, ga belajar.
❌ Prompt vague ("Buatin CRUD") — hasil ga sesuai, harus iterate.
❌ Minta AI fix langsung tanpa analisis penyebab — lo ga belajar debugging.
❌ Ga bikin PROMPT-LOG — ga bisa tracking progress, dianggap plagiat.
❌ Push kode AI tanpa review — security hole tanggung jawab lo.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [OpenAI Prompt Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Cursor AI](https://cursor.sh)
