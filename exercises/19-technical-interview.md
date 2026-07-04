# Technical Interview — Latihan

## Level 1: Dasar

### Soal 1 — STAR Method
Jelaskan **STAR method** (Situation, Task, Action, Result). 

Buat contoh jawaban STAR untuk pertanyaan interview:

> "Ceritakan tentang pengalaman Anda menyelesaikan konflik dalam tim."

Gunakan template STAR dan tulis jawaban lengkap dalam Bahasa Indonesia.

### Soal 2 — Behavioral Questions
Jawab 3 pertanyaan behavioral berikut dengan struktur STAR:

a) "Pernahkah Anda gagal menyelesaikan tugas tepat waktu? Apa yang terjadi?"
b) "Ceritakan pengalaman saat Anda harus mempelajari teknologi baru dalam waktu singkat."
c) "Bagaimana Anda menangani feedback negatif dari atasan atau rekan kerja?"

### Soal 3 — Communication & Collaboration
Seorang non-teknis (misal: Product Manager) meminta fitur yang secara teknis **tidak feasible** dalam batas waktu yang diminta.

1. Bagaimana Anda menyampaikan penolakan secara profesional?
2. Berikan alternatif solusi yang tetap memenuhi kebutuhan bisnis
3. Tulis contoh dialog antara engineer dan PM untuk skenario ini

## Level 2: Intermediate

### Soal 4 — DSA Patterns
Selesaikan soal berikut dan identifikasi **pola algoritma** yang digunakan:

**Soal A**: "Diberikan array integer, temukan dua angka yang jumlahnya sama dengan target."

```js
// Input: nums = [2, 7, 11, 15], target = 9
// Output: [0, 1] (karena nums[0] + nums[1] == 9)
```

Kerjakan dengan:
- Brute force (O(n²))
- HashMap approach (O(n))

Identifikasi pola: apakah ini Two Pointers? Sliding Window? Hash Map? Jelaskan ciri-ciri soal yang cocok dengan pola ini.

**Soal B**: "Diberikan string, periksa apakah string tersebut adalah palindrome yang valid (abaikan non-alphanumeric dan case)."

```js
// Input: "A man, a plan, a canal: Panama"
// Output: true
```

Kerjakan dengan Two Pointers. Identifikasi kapan pola Two Pointers tepat digunakan.

### Soal 5 — Mock Interview: Live Coding
Soal live coding untuk simulasi interview 30 menit:

> "Buat fungsi `groupAnagrams` yang menerima array of strings dan mengelompokkan anagram bersama-sama."
>
> Contoh:
> ```js
> Input: ["eat", "tea", "tan", "ate", "nat", "bat"]
> Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]
> ```

Tugas:
1. Tanyakan clarifying questions (tulis contoh)
2. Ucapkan approach sebelum coding (think out loud)
3. Tulis solusi (boleh pseudo-code dulu)
4. Analisis time & space complexity
5. Beri test case termasuk edge cases
6. Optimasi jika memungkinkan

### Soal 6 — System Design Interview
Soa mock interview **system design** (45 menit):

> "Desain URL shortener seperti TinyURL."

**Yang harus dibahas dalam jawaban:**
1. **Requirements** — functional & non-functional
2. **Estimation** — traffic (read/write ratio), storage, bandwidth
3. **API design** — endpoints, request/response format
4. **Database schema** — tables, indexes, mengapa pakai SQL vs NoSQL
5. **Key algorithm** — bagaimana generate short URL? (base62 encoding? hash?)
6. **Data flow** — dari user submit URL → redirect
7. **Scaling** — database sharding, caching (Redis), CDN
8. **Edge cases** — custom alias, expiry, duplicate URL

Tulis jawaban lengkap dalam format terstruktur.

## Level 3: Challenge

### Soal 7 — System Design: Live Comments
Soal **system design** (lanjutan):

> "Desain sistem live comments untuk platform streaming seperti YouTube Live atau TikTok Live."

**Constraints:**
- 1 juta concurrent viewers
- 10.000 comments/detik saat puncak
- Latency < 500ms dari submit ke muncul di layar semua viewer
- Moderasi (auto-filter spam, offensive words)
- Persistence: comments harus bisa di-replay setelah livestream selesai

Jawab dengan:
1. **Arsitektur** — component diagram + data flow
2. **WebSocket management** — connection pooling, room management
3. **Caching layer** — hot comments, rate limiting per user
4. **Moderation pipeline** — real-time filtering (machine learning? regex? hybrid?)
5. **Storage strategy** — time-series DB? Cassandra? partitioning by stream session?
6. **Fault tolerance** — apa yang terjadi jika server mati? message replay? Kafka offset?

### Soal 8 — Full Interview Simulation
Simulasi **technical interview 60 menit** lengkap dengan skenario:

**Bagian 1 — Behavioral (15 menit)**
Pertanyaan: "Ceritakan proyek paling kompleks yang pernah Anda kerjakan."
   - Evaluasi: apakah jawaban terstruktur (STAR)? apakah dampak bisnis disebutkan?

**Bagian 2 — Coding (25 menit)**
Soal: "Implementasikan **LRU Cache** dengan kapasitas tertentu. `get(key)` dan `put(key, value)` harus O(1)."
   - Evaluasi: pilihan data structure, handling edge case, complexity analysis

**Bagian 3 — System Design (20 menit)**
Soal: "Desain **real-time leaderboard** untuk game mobile dengan 10 juta user. Skor diupdate tiap kali user selesai bermain. Top 100 harus bisa dilihat real-time."
   - Evaluasi: apakah leaderboard bisa pakai Redis Sorted Set? bagaimana handle update rate tinggi?

Buat **rubrik penilaian** untuk setiap bagian (skor 1-5 dengan deskriptor).
