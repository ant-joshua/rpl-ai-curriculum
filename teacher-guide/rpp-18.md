# RPP Modul 18: AI Prompt Engineering

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Menguasai 6 teknik prompt (zero-shot, few-shot, CoT, role, structured, iterative)
- Menggunakan AI untuk coding, debugging, code review
- Menjaga etika penggunaan AI (aturan 70/30)
- Mendokumentasikan prompt di PROMPT-LOG.md

## Tools & Bahan

- Cursor / VS Code Copilot / ChatGPT / Claude
- Project repo (bisa project sebelumnya)
- PROMPT-LOG.md template
- Contoh kode yang perlu direfactor / debug

---

## Sesi 1: Fundamental Prompting (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: 6 Teknik Prompt** | Zero-shot, few-shot, chain-of-thought, role prompting, structured output, iterative refinement. Contoh tiap teknik. |
| 45 menit | **Coding: Prompt Practice** | Demo: minta AI bikin boilerplate (zero-shot). Kasih contoh (few-shot). Minta AI breakdown problem (CoT). Minta AI jadi code reviewer (role). |
| 20 menit | **Latihan: 5 Prompt Challenge** | Siswa tulis 5 prompt berbeda untuk task yang sama (bikin fungsi sorting). Bandingkan hasilnya. |
| 10 menit | **Review** | Prompt mana yang hasilnya paling akurat? Kenapa structured output penting? |

**Template prompt baik:**

```text
Buatkan [task] pake [stack].
Spesifikasi: [fitur detail].
Batasan: [jangan lakukan X].
Konteks: [project scope].
```

**Checklist siswa:**
- [ ] Zero-shot prompt
- [ ] Few-shot dengan contoh
- [ ] Chain-of-thought (step by step)
- [ ] Role prompting (jadilah...)
- [ ] Structured output (JSON)

---

## Sesi 2: AI untuk Coding + Debugging (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: AI-assisted Development** | Pola: boilerplate, refactor, debug, explain code, generate test, dokumentasi. Agent mode di Cursor. |
| 45 menit | **Coding: Debug + Refactor with AI** | Demo: kode error → minta AI analisis penyebab (bukan fix langsung). Refactor spaghetti code. Generate unit test. |
| 20 menit | **Latihan: Fix Bugs with AI** | Siswa dikasih kode error. Prompt AI untuk analisis. Fix sendiri berdasarkan analisis. Jangan copy-paste mentah. |
| 10 menit | **Review** | Kenapa minta AI analisis dulu sebelum fix lebih baik? Bahaya copy-paste mentah? |

**Debug prompt template:**

```text
Error: [message] di [file:baris].
Kode: [tempel].
Yang udah dicoba: [xyz].
Analisis penyebab aja — jangan kasih fix.
```

**Checklist siswa:**
- [ ] Prompt AI untuk analisis error
- [ ] AI-assisted refactoring
- [ ] Generate unit test via AI
- [ ] Tidak copy-paste mentah
- [ ] Modifikasi manual setelah AI output

---

## Sesi 3: Etika + PROMPT-LOG + Cursor Agent (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Etika AI + PROMPT-LOG** | Aturan 70/30 (manual ≥70%). PROMPT-LOG.md format. Plagiarisme. Security review kode AI. |
| 45 menit | **Coding: Agent Mode + Code Review** | Demo Cursor agent mode: commit dulu → minta rencana → review tiap perubahan. AI code review: cari security hole, performa, code smell. |
| 20 menit | **Latihan: PROMPT-LOG + Review** | Siswa install Cursor agent, bikin fitur kecil, dokumentasikan di PROMPT-LOG.md. Lakukan code review hasil AI. |
| 10 menit | **Review** | Tanggung jawab developer atas kode AI. Bagaimana deteksi kode hasil AI? |

**Format PROMPT-LOG.md:**

```markdown
## 2025-01-20
### Prompt: [tujuan]
- **Amanan:** [security/performa/readability]
- **Hasil:** [output AI]
- **Yang dipelajari:** [insight]
- **Modifikasi manual:** [apa yang diubah]
```

**Checklist siswa:**
- [ ] PROMPT-LOG.md dengan 3+ entry
- [ ] Aturan 70/30 dipatuhi
- [ ] AI code review menemukan issue
- [ ] Agent mode digunakan
- [ ] Security review kode AI

## Assessment

| Kriteria | Bobot |
|----------|-------|
| 6 teknik prompt | 25% |
| AI coding & debugging | 30% |
| PROMPT-LOG + etika 70/30 | 30% |
| Partisipasi | 15% |
