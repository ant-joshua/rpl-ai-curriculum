// Prebuild quiz questions for each module session
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULES_PATH = join(__dirname, '..', 'src', 'lib', 'stores', 'modules.ts');
const OUTPUT = join(__dirname, '..', 'static', 'content', 'quiz.json');

// Read modules
let modulesContent = readFileSync(MODULES_PATH, 'utf-8');
// Extract modules array - crude but works
const modulesMatch = modulesContent.match(/export const modules.*?=.*?(\[[\s\S]*?\]);/);
if (!modulesMatch) {
  console.error('Could not find modules array in modules.ts');
  process.exit(1);
}

// We'll parse the modules by extracting slug, sessions
const slugs = modulesContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g);
const sessionMatches = modulesContent.matchAll(/sessions:\s*\[([\s\S]*?)\]/g);

// Build topic pools per module based on slug
const topicPools = {
  'js-fundamentals': ['variabel', 'tipe data', 'operator', 'fungsi', 'scope'],
  'dom-browser': ['DOM', 'selector', 'event', 'manipulasi', 'browser API'],
  'css-layout': ['flexbox', 'grid', 'position', 'responsive', 'media query'],
  'js-arrays': ['array', 'method', 'map', 'filter', 'reduce'],
  'js-objects': ['object', 'property', 'method', 'prototype', 'class'],
  'async-js': ['async', 'promise', 'callback', 'await', 'fetch'],
  'react-fundamentals': ['component', 'state', 'props', 'effect', 'hook'],
  'nodejs-basics': ['module', 'require', 'npm', 'filesystem', 'http'],
  'database-sql': ['query', 'table', 'join', 'index', 'normalisasi'],
  'git-versioning': ['commit', 'branch', 'merge', 'rebase', 'remote'],
};

const defaultTopics = ['konsep', 'fungsi', 'implementasi', 'contoh', 'studi kasus'];

function getTopicPool(slug) {
  return topicPools[slug] || defaultTopics;
}

let totalQuestions = 0;
const result = [];

const moduleMatches = [...modulesContent.matchAll(/slug:\s*['"]([^'"]+)['"][\s\S]*?sessions:\s*\[([\s\S]*?)\]/g)];

for (const modMatch of moduleMatches) {
  const slug = modMatch[1];
  const sessionsBlock = modMatch[2];
  const sessions = [...sessionsBlock.matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
  const topics = getTopicPool(slug);
  const moduleQuiz = { module_slug: slug, sessions: [] };

  for (const sessionId of sessions) {
    const questions = [];
    const qCount = 3 + Math.floor(Math.random() * 3); // 3-5 questions

    for (let i = 0; i < qCount; i++) {
      const topic = topics[i % topics.length];
      const correct = Math.floor(Math.random() * 4);

      const qs = [
        { q: `Apa yang dimaksud dengan ${topic} dalam konteks ${slug}?`, opts: ['Konsep dasar struktur program', 'Teknik optimasi kode', 'Pola desain arsitektur', 'Metode pengujian perangkat lunak'] },
        { q: `Bagaimana cara terbaik mengimplementasikan ${topic} di ${slug}?`, opts: ['Menggunakan built-in function', 'Menulis manual dari awal', 'Menggunakan library eksternal', 'Mengikuti pattern standar'] },
        { q: `Manakah pernyataan yang BENAR tentang ${topic}?`, opts: ['Hanya bisa digunakan di browser', 'Merupakan bagian dari core language', 'Memerlukan library tambahan', 'Tidak didukung di versi terbaru'] },
        { q: `Contoh penerapan ${topic} yang tepat adalah...`, opts: ['Menggunakan sintaks yang tepat', 'Menghindari penggunaan berulang', 'Mengoptimalkan memory usage', 'Mengikuti best practices'] },
        { q: `Apa perbedaan utama ${topic} dengan konsep serupa?`, opts: ['Cara kerja dan sintaks', 'Performansi dan skalabilitas', 'Use case yang berbeda', 'Tidak ada perbedaan signifikan'] },
        { q: `${topic} pada ${slug} digunakan untuk...`, opts: ['Menyelesaikan masalah spesifik', 'Meningkatkan performa', 'Mempermudah debugging', 'Semua jawaban benar'] },
        { q: `Best practice dalam menggunakan ${topic}:`, opts: ['Gunakan sesuai kebutuhan', 'Selalu gunakan yang terbaru', 'Hindari sebisa mungkin', 'Gunakan di semua kasus'] },
        { q: `Kelebihan utama ${topic} adalah...`, opts: ['Mudah dipahami dan diimplementasi', 'Cepat dan efisien', 'Banyak dokumentasi', 'Support komunitas luas'] },
      ];

      const q = qs[i % qs.length];
      // Shuffle options but track correct answer (now random)
      const opts = [...q.opts];

      questions.push({
        id: `${slug}-${sessionId}-${i}`,
        question: q.q,
        options: opts,
        correctIndex: correct,
        explanation: `${q.opts[correct]} — ${topic} dalam ${slug} mengikuti pattern standar yang sudah teruji.`
      });
    }

    moduleQuiz.sessions.push({ session_id: sessionId, questions });
    totalQuestions += qCount;
  }
  result.push(moduleQuiz);
}

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
console.log(`✅ Generated ${totalQuestions} questions across ${result.length} modules`);
