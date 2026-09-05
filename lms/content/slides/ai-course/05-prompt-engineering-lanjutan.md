---
title: "Prompt Engineering Lanjutan"
module: 5
course: "ai-complete-course"
---

# Module 5: Prompt Engineering Lanjutan

> "Jika Module 4 adalah belajar menulis surat, Module 5 adalah belajar menjadi negosiator ulung."

---

## 🎯 Tujuan Pembelajaran

Setelah modul ini, kamu akan bisa:
- Menerapkan Tree of Thought untuk problem solving kompleks
- Menggunakan ReAct pattern untuk AI yang action-oriented
- Memahami Constitutional AI prompting
- Menggunakan meta-prompting untuk mengoptimalkan prompt
- Mengatur parameter temperature dan parameter lainnya
- Menerapkan teknik anti-hallucination
- Membangun prompt optimization loop

---

## 🌳 1. Tree of Thought (ToT)

**Apa itu:** Meminta AI mengeksplorasi **beberapa jalur pemikiran** sebelum memilih yang terbaik.

**Kapan pakai:** Problem solving kompleks, strategi, decision making.

🧠 ════════════════════════════════════════════════════════════════

### 🌳 Visual: Tree of Thought (Branching Pemikiran)

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌳 TREE OF THOUGHT                           │
│                                                                 │
│                    ┌──────────┐                                 │
│                    │ MASALAH  │                                 │
│                    │  Awal    │                                 │
│                    └────┬─────┘                                 │
│              ┌──────────┼──────────┐                            │
│              ▼          ▼          ▼                            │
│        ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│        │  JALUR   │ │  JALUR   │ │  JALUR   │                  │
│        │    A     │ │    B     │ │    C     │                  │
│        │ (Native) │ │(Cross-   │ │(No-code) │                  │
│        └────┬─────┘ │ platform)│ └────┬─────┘                  │
│             │        └────┬─────┘      │                        │
│             ▼             ▼            ▼                        │
│       ┌──────────┐  ┌──────────┐ ┌──────────┐                  │
│       │Pro: UX   │  │Pro: Satu │ │Pro:      │                  │
│       │Kon: $$$$ │  │  codebase│ │  Murah   │                  │
│       │Est:45-60J│  │Kon: Kual │ │Kon:      │                  │
│       │Verdict:❌│  │Est:25-35J│ │  Limited  │                  │
│       └──────────┘  │Verdict:✅│ │Est:10-15J│                  │
│                     └──────────┘ │Verdict:⚠️│                  │
│                                  └──────────┘                  │
│                                                                 │
│              ════════════════════════════                       │
│              🏆 KEPUTUSAN: JALUR B                              │
│              (Best balance: budget + kualitas)                  │
│              ════════════════════════════                       │
└─────────────────────────────────────────────────────────────────┘
```

**Kapan pakai:** Problem solving kompleks, strategi, decision making.

```
[TEMPLATE]
Analisis masalah ini dengan Tree of Thought:

MASALAH: [deskripsi masalah]

Untuk setiap jalur pemikiran:
- Jalur A: [approach 1]
  - Kelebihan: ...
  - Kekurangan: ...
  - Kemungkinan hasil: ...

- Jalur B: [approach 2]
  - Kelebihan: ...
  - Kekurangan: ...
  - Kemungkinan hasil: ...

- Jalur C: [approach 3]
  - Kelebihan: ...
  - Kekurangan: ...
  - Kemungkinan hasil: ...

Setelah analisis, pilih JALUR TERBAIK dan jelaskan kenapa.
```

### Contoh Lengkap: Tree of Thought

```
Saya punya budget Rp 50 juta untuk membangun MVP aplikasi mobile.
Tim: 2 developer, 1 designer.
Deadline: 3 bulan.

Analisis dengan Tree of Thought:

Jalur A: Native Development (Swift/Kotlin)
- Kelebihan: Performa terbaik, UX native
- Kekurangan: Butuh 2 codebase, budget lebih besar
- Estimasi: Rp 45-60 juta (melebihi budget)
- Verdict: ❌ Tidak realistis

Jalur B: Cross-platform (Flutter/React Native)  
- Kelebihan: Satu codebase, 2 platform
- Kekurangan: Kualitas native sedikit lebih rendah
- Estimasi: Rp 25-35 juta
- Verdict: ✅ Paling optimal

Jalur C: No-code/Low-code (Bubble, Adalo)
- Kelebihan: Sangat cepat, murah
- Kekurangan: Limitasi fitur, vendor lock-in
- Estimasi: Rp 10-15 juta
- Verdict: ⚠️ Cocok kalau fitur sederhana

KEPUTUSAN: Jalur B (Flutter/React Native)
Alasan: Best balance antara budget, timeline, dan kualitas.
```

---

## 🔄 2. ReAct Pattern (Reason + Act)

**Apa itu:** Menggabungkan **penalaran** dan **aksi** dalam satu prompt — AI berpikir, bertindak, mengamati, lalu mengulang.

**Kapan pakai:** AI agent, research tasks, complex problem solving.

🧠 ════════════════════════════════════════════════════════════════

### 🔄 Visual: Pola ReAct — Think → Act → Observe → Repeat

```
┌─────────────────────────────────────────────────────────────────┐
│                 🔄 POLA ReAct (REASON + ACT)                   │
│                                                                 │
│  ┌──────────┐                                                  │
│  │ 🎯 TUJUAN│  "Cari framework terbaik untuk chatbot WA"      │
│  └────┬─────┘                                                  │
│       ▼                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  💭 THINK  →  🖱️ ACT  →  👁️ OBSERVE  →  🔄 REPEAT?     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  THINK: "Saya perlu framework yang support WA API"      │  │
│  │    ↓                                                     │  │
│  │  ACT: Search "best Python WhatsApp framework 2025"      │  │
│  │    ↓                                                     │  │
│  │  OBSERVE: Hasil: python-wa, Twilio, Baileys             │  │
│  │    ↓                                                     │  │
│  │  THINK: "Perlu bandingkan dari segi kemudahan"           │  │
│  │    ↓                                                     │  │
│  │  ACT: Bandingkan 3 framework dalam tabel                │  │
│  │    ↓                                                     │  │
│  │  OBSERVE: Twilio paling practical untuk Python           │  │
│  │    ↓                                                     │  │
│  │  💡 FINAL ANSWER: Untuk MVP → python-wa                  │  │
│  │                  Untuk Prod → Twilio WhatsApp API        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  📌 ReAct = Gabungan terbaik antara "berpikir" dan "bertindak" │
└─────────────────────────────────────────────────────────────────┘
```

```
[TEMPLATE]
Untuk menyelesaikan: [tujuan]

Ikuti pola ReAct:
Thought: [Pemikiran/konteks]
Action: [Aksi yang diambil]
Observation: [Hasil/temuan]
... (ulang sampai selesai)
Final Answer: [Jawaban akhir]

[CONTOH]
Tujuan: Cari framework Python terbaik untuk membuat chatbot WhatsApp.

Thought: Saya perlu mencari framework yang support WhatsApp API, 
 mudah dipakai, dan actively maintained.

Action: Mencari "best Python WhatsApp chatbot framework 2025"

Observation: Hasil pencarian menunjukkan: python-whatsapp, 
 whatsapppy, Baileys wrapper, dan Twilio WhatsApp API.

Thought: Perlu membandingkan dari segi kemudahan, fitur, dan popularitas.

Action: Bandingkan 3 framework teratas dalam tabel.

Observation: 
- python-whatsapp: Simple, tapi kurang update
- Twilio WhatsApp: Enterprise-ready, ada biaya API
- Baileys (Node.js): Paling lengkap, tapi bukan Python native

Thought: Untuk Python developer, Twilio paling practical. 
 Tapi kalau mau free, python-whatsapp cukup untuk MVP.

Final Answer: Untuk MVP gratis → python-whatsapp. 
Untuk production → Twilio WhatsApp API.
```

### Contoh dalam Kode

```python
# ReAct Pattern Implementation

react_template = """
I need to {goal}.

Let me think through this step by step:

THOUGHT 1: {initial_thinking}
ACTION 1: {first_action}
OBSERVATION 1: {observation_from_action}

THOUGHT 2: {thinking_based_on_observation}
ACTION 2: {second_action}
OBSERVATION 2: {observation_from_action}

...continue until solved...

FINAL ANSWER: {conclusion}
"""

# Contoh actual usage
prompt = """
I need to optimize a slow Python API that takes 30 seconds to respond.

THOUGHT 1: 30 seconds is way too slow. I need to identify the bottleneck first.
ACTION 1: Profile the code to find which function takes the most time.
OBSERVATION 1: The database query in get_user_orders() takes 28 seconds.

THOUGHT 2: The DB query is the bottleneck. Common fixes: indexing, caching, query optimization.
ACTION 2: Check if the query has proper indexes and is using N+1 pattern.
OBSERVATION 2: The query fetches all orders then loops to get user details - classic N+1 problem.

THOUGHT 3: N+1 problem can be fixed with JOIN or select_related/prefetch.
ACTION 3: Rewrite query using Django select_related() and add database index on user_id.
OBSERVATION 3: Response time should drop from 30s to <1s.

FINAL ANSWER: The N+1 query pattern is the bottleneck. Fix with:
1. Use select_related() for foreign key joins
2. Add database index on orders.user_id
3. Implement Redis caching for frequently accessed data
Expected improvement: 30s → <1s
"""
```

---

## 📜 3. Constitutional AI Prompting

**Apa itu:** Mendefinisikan **prinsip dan batasan etis** yang harus diikuti AI dalam setiap respons.

**Kapan pakai:** Konten sensitif, bisnis, kesehatan, keuangan.

```
[TEMPLATE]
Sebelum menjawab, pastikan setiap respons memenuhi prinsip berikut:

KONSTITUSI AI:
1. [Prinsip 1: Akurasi]
2. [Prinsip 2: Keamanan]
3. [Prinsip 3: Transparansi]
4. [Prinsip 4: Inklusivitas]
5. [Prinsip 5: Kewajaran]

Tugas: [tugas yang diminta]

[CONTOH]
Sebelum menjawab, pastikan setiap respons memenuhi prinsip berikut:

KONSTITUSI AI:
1. AKURASI: Selalu sumberkan klaim medis/keuangan. Jangan buat rekomendasi tanpa disclaimer.
2. KEAMANAN: Jangan berikan saran yang bisa membahayakan. Arahkan ke profesional jika ragu.
3. TRANSPARANSI: Jelaskan limitasi jawabanmu. Akui ketidakpastian.
4. INKLUSIVITAS: Gunakan bahasa netral. Jangan asumsikan gender/suku/agama.
5. KEWAJARAN: Jangan condong ke satu pilihan. Sajikan pro dan kontra.

Tugas: Apa yang harus dilakukan jika saya mengalami gejala焦虑 berkepanjangan?
```

**Dalam kode:**
```python
# Constitutional AI Prompting
constitutional_prompt = """
SYSTEM INSTRUCTIONS (must follow at all times):

1. ACCURACY: Cite sources when making factual claims. 
   If unsure, explicitly say "I'm not certain about this."
2. SAFETY: Never give medical/legal/financial advice as definitive.
   Always recommend consulting a professional.
3. TRANSPARENCY: Acknowledge limitations of your knowledge.
   Distinguish between facts and opinions.
4. INCLUSIVITY: Use gender-neutral language. 
   Avoid stereotypes about any group.
5. FAIRNESS: Present multiple perspectives fairly.
   Don't favor one option without clear justification.

USER REQUEST: {user_request}

Respond following all 5 principles above.
"""
```

---

## 🧠 4. Meta-Prompting

**Apa itu:** Meminta AI **membuat atau mengoptimalkan prompt** untuk kamu.

**Kapan pakai:** Saat kamu tidak yakin cara menulis prompt yang baik.

```
[TEMPLATE]
Saya ingin AI membantu saya [tujuan].
Tapi saya tidak yakin prompt mana yang terbaik.

Buatkan 3 versi prompt dengan pendekatan berbeda:
1. Pendekatan sederhana (zero-shot)
2. Pendekatan terstruktur (dengan format dan contoh)
3. Pendekatan advanced (dengan CoT dan constraint)

Untuk masing-masing, jelaskan:
- Kenapa pendekatan ini dipilih
- Kapan sebaiknya digunakan
- Estimasi kualitas output (1-10)

[CONTOH]
Saya ingin AI menganalisis data penjualan toko online saya.
Data: CSV dengan kolom tanggal, produk, jumlah, total harga.

Buatkan 3 versi prompt dengan pendekatan berbeda:
1. Pendekatan sederhana
2. Pendekatan terstruktur 
3. Pendekatan advanced

Bandingkan kelebihan masing-masing.
```

### Meta-Prompt untuk Optimasi

```
Evaluasi prompt berikut dan optimasi:

PROMPT SAAT INI:
"[prompt kamu di sini]"

Evaluasi:
1. Apakah prompt ini jelas dan spesifik?
2. Ada ambiguitas yang bisa menyebabkan output salah?
3. Apakah format output sudah didefinisikan?
4. Apakah ada konteks yang kurang?

Kemudian buatkan versi yang lebih baik dengan penjelasan perubahan.
```

---

## ⛓️ 5. Prompt Chaining

**Apa itu:** Menghubungkan beberapa prompt dalam **rantai** — output prompt 1 jadi input prompt 2.

**Kapan pakai:** Tugas kompleks yang sulit diselesaikan dalam satu prompt.

🧠 ════════════════════════════════════════════════════════════════

### ⛓️ Visual: Prompt Chaining — Rantai Prompt yang Terhubung

```
┌─────────────────────────────────────────────────────────────────┐
│              ⛓️ PROMPT CHAINING (RANTAI PROMPT)                │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ 🔍 STEP 1│───→│ 📝 STEP 2│───→│ ✍️ STEP 3│───→│ 🔧 STEP 4│ │
│  │Brainstorm│    │ Outline  │    │  Draft   │    │  Edit    │ │
│  │ 10 ide   │    │ Detail   │    │  1000    │    │ Grammar  │ │
│  │ artikel  │    │ struktur │    │  kata    │    │ Flow     │ │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘ │
│       │               │               │               │         │
│       │  Output 1     │  Output 2     │  Output 3     │         │
│       │  = Input 2    │  = Input 3    │  = Input 4    │         │
│       │               │               │               │         │
│       └───────────────┴───────┬───────┴───────────────┘         │
│                               ▼                                 │
│                        ┌──────────┐                             │
│                        │ 🌐 STEP 5│                             │
│                        │   SEO    │                             │
│                        │Optimize  │                             │
│                        └────┬─────┘                             │
│                             ▼                                   │
│                    ┌─────────────────┐                          │
│                    │ 📄 ARTIKEL JADI │                          │
│                    │  Siap Publish!  │                          │
│                    └─────────────────┘                          │
│                                                                 │
│  💡 KEUNGGULAN CHAINING:                                        │
│  • Setiap step fokus → hasil lebih bagus                       │
│  • Bisa koreksi di step tengah tanpa mulai ulang               │
│  • Output setiap step = quality checkpoint                     │
└─────────────────────────────────────────────────────────────────┘
```

```
[TEMPLATE — Rantai untuk Menulis Artikel]

CHAIN STEP 1: Brainstorming
"Buatkan 10 ide artikel tentang [topik]. Setiap ide: judul + 3 poin utama."

CHAIN STEP 2: Outline
"Dari ide nomor [X], buatkan outline detail: judul, sub-judul, poin per bagian."

CHAIN STEP 3: Draft
"Kembangkan outline ini menjadi artikel draft 1000 kata."

CHAIN STEP 4: Editing
"Review artikel ini. Perbaiki: grammar, alur, kejelasan, dan engagement."

CHAIN STEP 5: SEO Optimization
"Optimasi artikel ini untuk SEO: tambahkan keywords, meta description, alt text images."
```

### Contoh dalam Kode

```python
# Prompt Chaining Workflow

class ContentChain:
    """Simulasi prompt chaining untuk content creation"""
    
    def step_1_brainstorm(self, topic):
        prompt = f"""
        Brainstorm 5 unique article angles about: {topic}
        For each: Title + 3 key points + target audience
        """
        return self.call_ai(prompt)
    
    def step_2_outline(self, selected_idea):
        prompt = f"""
        Create detailed outline for this article idea:
        {selected_idea}
        
        Include:
        - Hook/opening paragraph concept
        - 5-7 subheadings with bullet points
        - Key data points to include
        - Conclusion approach
        """
        return self.call_ai(prompt)
    
    def step_3_draft(self, outline):
        prompt = f"""
        Write a 1200-word article based on this outline:
        {outline}
        
        Style: Professional but conversational
        Include: Real examples, actionable tips
        Tone: Authoritative yet approachable
        """
        return self.call_ai(prompt)
    
    def step_4_edit(self, draft):
        prompt = f"""
        Edit this article for:
        1. Grammar and spelling
        2. Flow and transitions
        3. Clarity of arguments
        4. Engagement (add hooks, questions)
        5. Remove fluff words
        
        Article:
        {draft}
        """
        return self.call_ai(prompt)
    
    def step_5_optimize(self, edited_article, target_keyword):
        prompt = f"""
        Optimize this article for SEO:
        Target keyword: {target_keyword}
        
        Tasks:
        1. Suggest meta title (60 chars max)
        2. Write meta description (160 chars max)
        3. Suggest H2/H3 with keywords
        4. Recommend internal linking topics
        5. Suggest image alt texts
        
        Article:
        {edited_article}
        """
        return self.call_ai(prompt)

# Usage
chain = ContentChain()
idea = chain.step_1_brainstorm("productivity hacks for remote workers")
outline = chain.step_2_outline(idea[0])  # Select best idea
draft = chain.step_3_draft(outline)
edited = chain.step_4_edit(draft)
final = chain.step_5_optimize(edited, "remote work productivity")
```

---

## 🖥️ 6. System Prompts

**Apa itu:** Prompt yang ditempatkan di **awal percakapan** untuk mengatur perilaku AI secara konsisten.

**Kapan pakai:** Bot, customer service, aplikasi yang butuh konsistensi.

```
[TEMPLATE — System Prompt untuk Customer Service Bot]

SYSTEM PROMPT:
Kamu adalah asisten customer service untuk [nama bisnis].

ATURAN:
1. Selalu sapa dengan nama customer jika tersedia
2. Jika pertanyaan di luar kemampuan, arahkan ke human agent
3. Gunakan nada: ramah, profesional, solution-oriented
4. Jangan pernah berikan informasi yang tidak kamu yakini
5. Jika komplain: validasi emosi → minta detail → tawarkan solusi

CONTOH RESPONS:
- Customer: "Paket saya belum sampai!"
- AI: "Halo [Nama], saya paham frustasi menunggu paket. 
       Bisa tolong kasih nomor order-nya? Saya bantu cek 
       statusnya sekarang."
```

---

## 🌡️ 7. Temperature & Parameter Tuning

### Apa itu Temperature?

**Temperature** mengontrol **kreativitas vs konsistensi** output AI.

```
Temperature Scale:
0.0 ──────────────────────── 1.0+
│                              │
Lebih konsisten,               Lebih kreatif,
deterministik,                 beragam,
factual                        unpredictable

0.0 = Sangat konsisten (coding, fakta)
0.3 = Konsisten tapi fleksibel (email, dokumen)
0.7 = Seimbang (general use)
1.0 = Kreatif (brainstorming, cerita)
1.2 = Sangat kreatif (eksperimental)
```

### Parameter Lainnya

| Parameter | Fungsi | Range | Contoh Penggunaan |
|-----------|--------|-------|-------------------|
| **Temperature** | Kreativitas | 0.0-2.0 | 0.1 untuk kode, 0.9 untuk cerita |
| **Top-P** | Kepopuleran kata | 0.0-1.0 | 0.9 untuk keseimbangan |
| **Max Tokens** | Panjang output | 1-128K | 100 untuk jawaban pendek, 4000 untuk essay |
| **Frequency Penalty** | Kurangi repetisi | 0.0-2.0 | 0.5 untuk mengurangi pengulangan |
| **Presence Penalty** | Dorong topik baru | 0.0-2.0 | 0.3 untuk brainstorming |
| **Stop Sequences** | Henti di token tertentu | String | "\n\n" untuk paragraf per prompt |

### Kapan Pakai Temperature Berapa

```python
# Temperature Guide

temperature_settings = {
    # Konsistensi tinggi
    "code_generation":       {"temp": 0.0, "top_p": 0.95},
    "data_analysis":         {"temp": 0.1, "top_p": 0.9},
    "factual_qa":            {"temp": 0.2, "top_p": 0.9},
    "email_professional":    {"temp": 0.3, "top_p": 0.9},
    
    # Keseimbangan
    "general_chat":          {"temp": 0.7, "top_p": 0.9},
    "blog_writing":          {"temp": 0.7, "top_p": 0.9},
    "summarization":         {"temp": 0.5, "top_p": 0.9},
    
    # Kreativitas tinggi
    "brainstorming":         {"temp": 0.9, "top_p": 0.95},
    "creative_writing":      {"temp": 1.0, "top_p": 0.95},
    "poetry":                {"temp": 1.1, "top_p": 0.95},
    "marketing_slogans":     {"temp": 0.9, "top_p": 0.9},
}

# Contoh penggunaan API
import openai

# Untuk kode (temperature rendah)
code_response = openai.ChatCompletion.create(
    model="gpt-4",
    temperature=0.0,      # Konsisten
    messages=[{"role": "user", "content": "Write a Python function..."}]
)

# Untuk brainstorming (temperature tinggi)
brainstorm_response = openai.ChatCompletion.create(
    model="gpt-4",
    temperature=0.9,      # Kreatif
    messages=[{"role": "user", "content": "Give me 10 creative app ideas..."}]
)
```

---

## 🛡️ 8. Anti-Hallucination Techniques

🧠 ════════════════════════════════════════════════════════════════

### ✅ Visual: Anti-Hallucination Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│              🛡️ ANTI-HALLUCINATION CHECKLIST                    │
│              (Centang semua untuk jawaban terpercaya!)          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ☑️ 1. GROUNDING                                               │
│     └── "Berdasarkan data berikut..."                          │
│     └── Selalu kasih data/referensi sebagai dasar              │
│                                                                 │
│  ☑️ 2. CITATION REQUIRED                                       │
│     └── "Untuk setiap klaim, sertakan sumbernya"              │
│     └── Minta AI menunjuk dari mana informasi datang           │
│                                                                 │
│  ☑️ 3. CONFIDENCE SCORING                                      │
│     └── "Berikan confidence level: HIGH/MEDIUM/LOW"            │
│     └── Skor 1-10 untuk tingkat kepastian                      │
│                                                                 │
│  ☑️ 4. DUAL VERIFICATION                                      │
│     └── "Beri 2 jawaban dari perspektif berbeda"              │
│     └── Cek konsistensi antar jawaban                          │
│                                                                 │
│  ☑️ 5. "TIDAK TAHU" DIPERBOLEHKAN                              │
│     └── "Jika tidak yakin, katakan 'Data tidak tersedia'"     │
│     └── Jangan paksa AI menebak                                │
│                                                                 │
│  📊 EFEKTIVITAS:                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Grounding     ████████████████████  95% efektif        │  │
│  │  Citation      ██████████████████    88% efektif        │  │
│  │  Confidence    ████████████████      78% efektif        │  │
│  │  Dual Verif    ██████████████        72% efektif        │  │
│  │  "Tidak Tahu"  ████████████████████  92% efektif        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  💡 GABUNGKAN semua 5 teknik untuk hasil terbaik!              │
└─────────────────────────────────────────────────────────────────┘
```

### Teknik 1: Grounding dengan Data

```
Berdasarkan data berikut, jawab pertanyaan.
JIKA jawabannya tidak ada di data, katakan "Data tidak tersedia."

DATA:
[masukkan data/konteks di sini]

PERTANYAAN: [pertanyaan kamu]
```

### Teknik 2: Citations Required

```
Jawab pertanyaan berikut dan untuk setiap klaim faktual,
sertakan sumbernya. Jika tidak ada sumber, jelaskan bahwa
ini adalah pendapat/estimasi.

Format: [Klaim] (Sumber: [referensi])
```

### Teknik 3: Confidence Scoring

```
Untuk setiap jawaban, berikan confidence level:
- HIGH (90-100%): Fakta yang sangat pasti
- MEDIUM (60-89%): Cukup yakin tapi perlu verifikasi
- LOW (<60%): Berdasarkan inferensi, mungkin salah

Jawab dengan format:
[Jawaban]
Confidence: [LEVEL]
Alasan confidence: [penjelasan]
```

### Teknik 4: Dual Verification

```
Untuk pertanyaan ini, berikan:
1. Jawaban versi pertama (dari pengetahuan kamu)
2. Jawaban versi kedua (dari perspektif berbeda/validator)
3. Kesimpulan: Apakah kedua versi konsisten?

Jika tidak konsisten, jelaskan area ketidakpastian.
```

```python
# Anti-Hallucination Prompt Template
anti_hallucination_prompt = """
IMPORTANT: You MUST follow these rules:

1. ONLY use information from the provided context: {context}
2. If the answer is NOT in the context, respond with:
   "Based on the provided information, I cannot find the answer to this question."
3. For every factual claim, cite the specific part of context it comes from
4. Distinguish between:
   - Facts (directly stated in context)
   - Inferences (logical conclusions from context)
   - Unknown (not covered by context)
5. Never make up statistics, names, dates, or specific numbers

QUESTION: {question}

Respond with:
ANSWER: [your answer]
CONFIDENCE: [HIGH/MEDIUM/LOW]
EVIDENCE: [which part of context supports this]
CAVEATS: [any limitations or uncertainties]
"""
```

---

## 📊 9. Evaluation Metrics untuk Prompt

### Cara Menilai Kualitas Prompt

| Kriteria | Deskripsi | Skor 1-5 |
|----------|-----------|----------|
| **Clarity** | Apakah instruksi jelas dan tidak ambigu? | |
| **Specificity** | Apakah sudah cukup spesifik format & konten? | |
| **Context** | Apakah konteks yang diberikan memadai? | |
| **Constraints** | Apakah ada batasan yang jelas? | |
| **Output Format** | Apakah format output didefinisikan? | |
| **Completeness** | Apakah semua kebutuhan tercakup? | |

### Prompt Quality Checklist

```
□ Apakah AI tahu PERAN yang harus dimainkan?
□ Apakah TUGAS spesifik dan terukur?
□ Apakah KONTEKS cukup untuk menghasilkan jawaban relevan?
□ Apakah FORMAT output didefinisikan?
□ Apakah BATASAN ditetapkan (panjang, gaya, bahasa)?
□ Apakah ada CONTOH atau referensi?
□ Apakah ada INSTRUKSI tentang apa yang TIDAK boleh?
□ Apakah ada VALIDATION step?
```

---

## 🔄 10. Prompt Optimization Loop

```
┌──────────────────────────────────────────┐
│           PROMPT OPTIMIZATION LOOP        │
│                                          │
│  1. WRITE → Tulis prompt awal            │
│       ↓                                  │
│  2. TEST → Kirim ke AI, lihat output     │
│       ↓                                  │
│  3. EVALUATE → Apakah output sesuai?     │
│       ↓                                  │
│  4. IDENTIFY → Apa yang kurang?          │
│       ↓                                  │
│  5. REFINE → Perbaiki prompt             │
│       ↓                                  │
│  6. REPEAT → Ulangi sampai puas          │
│                                          │
└──────────────────────────────────────────┘
```

```python
# Prompt Optimization Loop (Conceptual)

def optimize_prompt(initial_prompt, task_description, quality_threshold=8):
    """
    Iterative prompt optimization loop
    """
    best_prompt = initial_prompt
    best_score = 0
    iteration = 0
    
    while best_score < quality_threshold:
        iteration += 1
        print(f"\n=== Iteration {iteration} ===")
        
        # Step 1: Test current prompt
        output = call_ai(best_prompt)
        
        # Step 2: Evaluate output
        score = evaluate_output(output, task_description)
        print(f"Score: {score}/10")
        
        if score > best_score:
            best_score = score
            print("✅ Improvement found!")
        
        if score >= quality_threshold:
            print(f"🎯 Target reached at iteration {iteration}")
            return best_prompt
        
        # Step 3: Get optimization suggestions
        meta_prompt = f"""
        Current prompt: {best_prompt}
        Task: {task_description}
        Current output score: {score}/10
        
        Suggest 3 specific improvements to make the prompt better.
        For each, explain why the change would improve output.
        """
        
        suggestions = call_ai(meta_prompt)
        
        # Step 4: Apply best suggestion
        improvement_prompt = f"""
        Here are suggestions to improve the prompt:
        {suggestions}
        
        Current prompt: {best_prompt}
        
        Apply the best suggestion and output the improved prompt.
        Only output the new prompt, nothing else.
        """
        
        best_prompt = call_ai(improvement_prompt)
    
    return best_prompt

# Example usage
optimized = optimize_prompt(
    initial_prompt="Write a marketing email",
    task_description="Professional marketing email for SaaS product launch, 200 words, CTA included",
    quality_threshold=8
)
print(f"Final optimized prompt:\n{optimized}")
```

---

## 📝 Ringkasan Modul 5

```
✅ Tree of Thought: eksplorasi beberapa jalur pemikiran sebelum memilih
✅ ReAct Pattern: kombinasi Reason + Act untuk problem solving
✅ Constitutional AI: prinsip etis yang mengatur respons AI
✅ Meta-prompting: biarkan AI membantu mengoptimalkan prompt kamu
✅ Prompt Chaining: rangkai beberapa prompt untuk tugas kompleks
✅ Temperature: 0.0 untuk kode/fakta, 0.7 untuk umum, 1.0+ untuk kreativitas
✅ Anti-Hallucination: grounding, citations, confidence scoring, dual verification
✅ Prompt Optimization Loop: write → test → evaluate → refine → repeat
```

---

## 🔑 Key Takeaways

1. **Tree of Thought untuk keputusan kompleks** — minta AI mengeksplorasi beberapa opsi sebelum memilih yang terbaik
2. **ReAct Pattern untuk aksi konkret** — gabungkan reasoning dengan action steps untuk output yang actionable
3. **Temperature adalah senjata rahasia** — rendah untuk akurasi, tinggi untuk kreativitas
4. **Anti-hallucination bukan opsional** — selalu gunakan grounding dan citation untuk informasi penting
5. **Optimization loop = kunci mastery** — prompt yang baik datang dari iterasi, bukan sekali jadi

---

## 🏋️ Practice Exercises

### Exercise 1: Tree of Thought
Gunakan ToT untuk memutuskan: Platform apa yang harus dipilih untuk membangun portfolio online? Eksplorasi minimal 3 opsi dengan pro/ kontra masing-masing.

### Exercise 2: ReAct Pattern
Gunakan ReAct untuk memecahkan masalah nyata: "Server website saya lambat. Bagaimana cara mengatasinya?" — ikuti pola Thought → Action → Observation sampai selesai.

### Exercise 3: Anti-Hallucination
Kirim pertanyaan ke AI tentang topik yang kamu tahu jawabannya. Gunakan 4 teknik anti-hallucination dan bandingkan mana yang paling efektif.

### Exercise 4: Temperature Experiment
Kirim prompt yang sama ke AI dengan temperature 0.0, 0.5, dan 1.0. Bandingkan hasilnya. Untuk tugas apa temperature mana yang paling cocok?

### Exercise 5: Prompt Optimization Loop
Ambil prompt yang kamu punya saat ini. Lakukan minimal 5 iterasi optimization loop. Dokumentasikan setiap perubahan dan skor kualitasnya.

---

## 🚀 Next Module: AI Agents

> Di **Module 6**, kita akan mempelajari AI Agents — AI yang tidak hanya menjawab pertanyaan, tapi **melakukan tugas secara otonom**. Dari Claude Code hingga Devin, dari function calling hingga multi-agent systems. Welcome to the future of AI!
