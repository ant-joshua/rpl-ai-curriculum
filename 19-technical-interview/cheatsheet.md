# 🧠 Cheatsheet: Technical Interview

> Referensi cepet — 1 halaman.

## Topik Utama
- **STAR Method**: Situation → Task → Action → Result (jawab behavioral)
- **CV ATS-Friendly**: PDF simpel, keyword dari job desc, link proyek
- **5 Pola DSA**: Sliding Window, Two Pointers, Fast & Slow Pointer, BFS/DFS, DP
- **System Design 1-2-3**: Klarifikasi (3-5m) → High-Level (5-7m) → Deep Dive (10-15m)
- **Live Coding Strategy**: baca 2x → clarify → brute force → optimasi → kode → test → complexity
- **Portofolio Walkthrough**: judul → stack → arsitektur → fitur → tantangan → pelajaran
- **Negosiasi & Follow-up**: riset gaji, thank you email, follow-up 3 hari

## Command / Sintaks Penting

```text
# STAR Template
S: "Dalam proyek kelompok semester 4..."
T: "Saya bertugas bikin REST API..."
A: "Saya desain skema, buat endpoint Express, tulis unit test..."
R: "API selesai 3 hari lebih cepat. Nilai A."

# System Design — Chat App
1. Klarifikasi: daily active users? 1:1 atau group? pesan persist?
2. High-Level: client → WebSocket server → Redis pub/sub → DB
3. Deep Dive: schema messages(user_id, content, timestamp), API design
```

```typescript
// Sliding Window — max sum subarray
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

## Tips & Trik
- **Think out loud** — interviewer mau liat cara lo berpikir, bukan jawaban sempurna.
- **Persiapkan 5 jawaban STAR** — rekam pakai HP, evaluasi sendiri.
- **NeetCode 150** — 20-30 menit/soal, stuck → lihat solusi → ulang 2 hari kemudian.
- **Portofolio**: README lengkap, live demo (Vercel/Netlify), GitHub rapi.
- **Mock interview** — latihan 30 menit dengan teman, evaluasi pakai skor.

## Common Mistakes
❌ Diam pas coding — interviewer ga tau lagi mikir apa.
❌ Langsung optimal tanpa sebut brute force — tunjukin progress thinking.
❌ CV typo / email ga profesional / klaim skill ga relevan.
❌ Ga riset perusahaan sebelum interview.
❌ Jawab behavioral tanpa STAR — cerita panjang ga terstruktur.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [NeetCode Roadmap](https://neetcode.io/roadmap)
- [STAR Method Guide](https://www.themuse.com/advice/star-interview-method)
