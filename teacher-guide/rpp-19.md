# RPP Modul 19: Technical Interview

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Menerapkan STAR method untuk behavioral questions
- Memecahkan DSA problem (sliding window, two pointers, BFS/DFS, DP)
- Menjawab system design question (chat app, URL shortener)
- Mempresentasikan portofolio dengan struktur jelas
- Negosiasi gaji dan follow-up

## Tools & Bahan

- NeetCode 150 / LeetCode
- Whiteboard / Excalidraw
- Google Docs untuk STAR draft
- Zoom / Google Meet untuk mock interview
- CV template

---

## Sesi 1: STAR Method + CV + Portofolio (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: STAR Method** | Situation → Task → Action → Result. Contoh jawaban STAR untuk proyek kelompok. CV ATS-friendly: PDF, keyword, link. |
| 45 menit | **Coding: STAR Draft + CV Review** | Siswa tulis 5 jawaban STAR dari pengalaman mereka. Review CV masing-masing. Perbaiki format ATS. |
| 20 menit | **Latihan: Mock Behavioral** | Pair up: 1 interviewer, 1 interviewee. 5 menit per orang. Praktik STAR. Evaluasi struktur. |
| 10 menit | **Review** | Feedback: STAR paling kuat. CV improvement. Portofolio walkthrough structure. |

**STAR template:**

```text
S: "Dalam proyek kelompok semester 4..."
T: "Saya bertugas bikin REST API..."
A: "Saya desain skema, buat endpoint Express, tulis unit test..."
R: "API selesai 3 hari lebih cepat. Nilai A."
```

**Checklist siswa:**
- [ ] 5 STAR answers
- [ ] CV ATS-friendly
- [ ] Portofolio README lengkap
- [ ] Test mock behavioral

---

## Sesi 2: DSA + Live Coding (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: 5 DSA Patterns** | Sliding Window, Two Pointers, Fast & Slow Pointer, BFS/DFS, DP. Live coding strategy: baca 2x → clarify → brute force → optimasi → kode → test → complexity. |
| 45 menit | **Coding: LeetCode Live** | Demo: 2 soal LeetCode (easy + medium). Show think-out-loud process. Brute force first, then optimize. |
| 20 menit | **Latihan: Pair LeetCode** | Siswa pair up, selesaikan 2 soal. Satu ngetik, satu review. Ganti per 15 menit. Think out loud. |
| 10 menit | **Review** | Kenapa harus sebut brute force dulu? Bagaimana handle stuck? |

**Code demo — sliding window:**

```typescript
function maxSubarraySum(arr: number[], k: number): number {
  let max = 0, sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  max = sum;
  for (let i = k; i < arr.length; i++) {
    sum = sum - arr[i - k] + arr[i];
    max = Math.max(max, sum);
  }
  return max;
}
```

**Checklist siswa:**
- [ ] 2 LeetCode selesai
- [ ] Think out loud selama coding
- [ ] Brute force → optimasi
- [ ] Time & space complexity dijelaskan

---

## Sesi 3: System Design + Negosiasi (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: System Design 1-2-3** | Klarifikasi (3-5m) → High-Level (5-7m) → Deep Dive (10-15m). Contoh: Chat App, URL Shortener. Negosiasi: riset gaji, thank you email. |
| 45 menit | **Coding: System Design Whiteboard** | Demo: design chat app di Excalidraw. Klarifikasi requirements. High-level arsitektur. Deep dive: schema, API, WebSocket. |
| 20 menit | **Latihan: Mock System Design** | Siswa design URL shortener / e-commerce cart. Presentasi 10 menit. Feedback dari peer. |
| 10 menit | **Review** | Tips negosiasi gaji. Follow-up email template. After-interview checklist. |

**System design template — Chat App:**

```text
1. Klarifikasi: DAU? 1:1 atau group? Pesan persist? Media?
2. High-Level: client → WebSocket server → Redis pub/sub → DB
3. Deep Dive: schema messages(user_id, content, timestamp, room_id), API design, scaling
```

**Checklist siswa:**
- [ ] System design selesai (high-level + deep dive)
- [ ] Klarifikasi requirements
- [ ] Arsitektur diagram
- [ ] Mock interview 10 menit

## Assessment

| Kriteria | Bobot |
|----------|-------|
| STAR method + CV | 25% |
| DSA + live coding | 30% |
| System design | 30% |
| Partisipasi | 15% |
