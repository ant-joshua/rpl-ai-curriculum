# Mastra AI — Exercise #4: RAG Pipeline

> **Level:** Intermediate
> **Topics:** RAG, document retrieval, context injection, LLM with context

## Instructions

Buat agent yang bisa menjawab pertanyaan berdasarkan dokumen (Retrieval Augmented Generation).

1. Siapkan dokumen knowledge base (array of strings tentang kurikulum RPL AI).
2. Buat fungsi `retrieveRelevant(query, documents)` yang mencari dokumen relevan berdasarkan keyword matching.
3. Inject context ke prompt agent.
4. Agent harus menjawab berdasarkan dokumen, bukan dari pengetahuannya sendiri.

## Starter Code

```javascript
// Dokumentasi kurikulum
const documents = [
  'RPL AI Curriculum memiliki 7 modul: JavaScript, Algoritma & DSA, TypeScript, Web Development, Git, Node.js, dan Mastra AI.',
  'Setiap modul memiliki 4 sesi: materi, demo, praktik, dan tugas.',
  'Modul 1 (JavaScript) mencakup variable, function, array, object, async/await, dan error handling.',
  'Modul 2 (DSA) mencakup Big O, sorting, searching, linked list, stack, queue, tree, graph.',
  'Modul 3 (TypeScript) mencakup type annotations, generics, utility types, dan type guards.',
  'Modul 4 (Web) mencakup HTML semantic, CSS Flexbox/Grid, DOM, Fetch API, dan localStorage.',
  'Modul 5 (Git) mencakup init, branch, merge, rebase, remote, dan pull request workflow.',
  'Modul 6 (Node.js) mencakup Express, middleware, REST API, error handling, dan database.',
  'Modul 7 (Mastra AI) mencakup agents, tools, memory, RAG, workflows, dan multi-agent.',
  'Nilai akhir = (Tugas × 30%) + (Kuis × 10%) + (Mini Project × 20%) + (Final Project × 35%) + (Partisipasi × 5%)',
  'Total durasi: 14 minggu (1 semester), 4 sesi per minggu, 2-3 jam per sesi.',
  'Final project: full-stack application dengan AI feature menggunakan Mastra.',
];

function retrieveRelevant(query, docs) {
  // TODO: cari dokumen relevan berdasarkan keyword matching
  // Return array of matching documents (max 3)
  const lower = query.toLowerCase();
  const keywords = lower.split(' ');
  
  return docs
    .map((doc, index) => ({
      text: doc,
      score: keywords.filter(kw => doc.toLowerCase().includes(kw)).length,
      index,
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.text);
}

function generateAnswer(query, docs) {
  const relevant = retrieveRelevant(query, docs);
  
  if (relevant.length === 0) {
    return 'Saya tidak punya informasi tentang itu.';
  }
  
  return `Berdasarkan dokumen yang tersedia:\n${relevant.map(d => `• ${d}`).join('\n')}`;
}

// Test
console.log('Q: Ada berapa modul di RPL AI?');
console.log(generateAnswer('ada berapa modul', documents));
console.log('\nQ: Gimana cara hitung nilai akhir?');
console.log(generateAnswer('nilai akhir', documents));
console.log('\nQ: Apa itu quantum computing?');
console.log(generateAnswer('quantum computing', documents));
console.log('\nQ: Apa saja yang dipelajari di modul JavaScript?');
console.log(generateAnswer('modul JavaScript', documents));
```

## Expected Output

```
Q: Ada berapa modul di RPL AI?
Berdasarkan dokumen yang tersedia:
• RPL AI Curriculum memiliki 7 modul: JavaScript, Algoritma & DSA, ...

Q: Gimana cara hitung nilai akhir?
Berdasarkan dokumen yang tersedia:
• Nilai akhir = (Tugas × 30%) + (Kuis × 10%) + (Mini Project × 20%) + ...

Q: Apa itu quantum computing?
Saya tidak punya informasi tentang itu.

Q: Apa saja yang dipelajari di modul JavaScript?
Berdasarkan dokumen yang tersedia:
• Modul 1 (JavaScript) mencakup variable, function, array, object, ...
```

## Test Cases

```javascript
const hasil = retrieveRelevant('modul javascript', documents);
console.log(hasil.length > 0);           // true
console.log(hasil[0].includes('JavaScript'));  // true

const hasil2 = retrieveRelevant('quantum', documents);
console.log(hasil2.length === 0);        // true
```
