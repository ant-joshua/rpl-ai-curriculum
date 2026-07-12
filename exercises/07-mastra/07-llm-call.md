# Mastra AI — Exercise #7: LLM Call & Structured Output

> **Level:** Intermediate
> **Topics:** LLM call, structured output, Zod schema, JSON response

## Instructions

Buat agent yang mengembalikan output terstruktur (JSON) menggunakan Zod schema.

1. Buat schema `ReviewSchema` untuk analisis review: `rating` (1-5), `ringkasan` (string), `kategori` (positif/netral/negatif), `saran` (optional).
2. Buat agent dengan output schema.
3. Agent menganalisis review dan mengembalikan data terstruktur.

## Starter Code

```javascript
// Conceptual example — requires @mastra/core + zod
import { Agent } from '@mastra/core';
import { z } from 'zod';

// TODO: buat schema untuk structured output

// === SIMULASI BROWSER ===
function analyzeReview(review) {
  // Analisis sederhana berdasarkan kata kunci
  const positifWords = ['bagus', 'mantap', 'puas', 'keren', 'cepat', 'ok', 'baik', 'recommended'];
  const negatifWords = ['jelek', 'lambat', 'kecewa', 'rusak', 'buruk', 'parah', 'kurang'];
  
  let positifScore = 0;
  let negatifScore = 0;
  
  const lower = review.toLowerCase();
  
  for (const word of positifWords) {
    if (lower.includes(word)) positifScore++;
  }
  for (const word of negatifWords) {
    if (lower.includes(word)) negatifScore++;
  }
  
  let kategori;
  let rating;
  
  if (positifScore > negatifScore && positifScore >= 2) {
    kategori = 'positif';
    rating = 4 + (positifScore > 3 ? 1 : 0);
  } else if (negatifScore > positifScore) {
    kategori = 'negatif';
    rating = Math.max(1, 3 - negatifScore);
  } else {
    kategori = 'netral';
    rating = 3;
  }
  
  // Generate saran
  const saran = kategori === 'negatif' 
    ? 'Tingkatkan kualitas produk/layanan'
    : kategori === 'netral' 
      ? 'Bisa ditingkatkan lagi'
      : undefined;
  
  // Ambil kalimat pertama sebagai ringkasan
  const ringkasan = review.split('.')[0] || review;
  
  return {
    rating,
    ringkasan: ringkasan.trim(),
    kategori,
    ...(saran ? { saran } : {}),
  };
}

// Test
const reviews = [
  'Barang ini bagus banget! Cepet sampe, kualitas ok. Recommended!',
  'Produknya jelek, lambat banget sampe. Kecewa berat.',
  'Barangnya standar, sesuai harga. Lumayan lah.',
];

for (const review of reviews) {
  console.log('\nReview:', review);
  console.log('Hasil analisis:', JSON.stringify(analyzeReview(review), null, 2));
}
```

## Expected Output

```
Review: Barang ini bagus banget! Cepet sampe, kualitas ok. Recommended!
Hasil analisis: {
  "rating": 5,
  "ringkasan": "Barang ini bagus banget!",
  "kategori": "positif"
}

Review: Produknya jelek, lambat banget sampe. Kecewa berat.
Hasil analisis: {
  "rating": 1,
  "ringkasan": "Produknya jelek",
  "kategori": "negatif",
  "saran": "Tingkatkan kualitas produk/layanan"
}
```

## Test Cases

```javascript
const r1 = analyzeReview('Bagus banget! Mantap! Keren!');
console.log(r1.kategori === 'positif');  // true
console.log(r1.rating >= 4);             // true

const r2 = analyzeReview('Jelek dan buruk');
console.log(r2.kategori === 'negatif');  // true
console.log(r2.rating <= 2);             // true
```
