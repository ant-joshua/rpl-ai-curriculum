// Prebuild: read each module's md files, extract quiz blocks, create quiz-index.json
// Used by flashcards generator and AI tutor offline search

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const repoRoot = resolve(process.cwd(), '..');
const outputDir = resolve(process.cwd(), 'static', 'content');
const outputPath = join(outputDir, 'quiz-index.json');

// Module dirs: 00-* to 56-*
const moduleDirs = readdirSync(repoRoot)
  .filter(d => /^\d{2}-/.test(d) && statSync(join(repoRoot, d)).isDirectory());

// Map dirName -> moduleSlug from modules.ts
// Convention: dirName matches, we strip the numeric prefix for slug
function dirToSlug(dirName) {
  return dirName.replace(/^\d{2}-/, '');
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)/m);
  if (match) return match[1].trim();
  return '';
}

const quizIndex = {};

for (const dir of moduleDirs) {
  const dirPath = join(repoRoot, dir);
  const quizFilePath = join(dirPath, 'quiz.md');
  const slug = dirToSlug(dir);

  if (!existsSync(quizFilePath)) continue;

  const quizContent = readFileSync(quizFilePath, 'utf-8');
  const title = extractTitle(quizContent) || slug.replace(/-/g, ' ');

  // Also read module content JSON (prebuilt) to find session titles
  const contentJsonPath = join(outputDir, `${dir}.json`);
  let contentData = {};
  try {
    contentData = JSON.parse(readFileSync(contentJsonPath, 'utf-8'));
  } catch { /* empty */ }

  // Extract individual questions from the quiz.md
  // Format: <div class="quiz"> ... </div> with **N. Question** and - [x] Answer
  const quizBlocks = [];
  const divRegex = /<div\s+class="quiz"[^>]*>([\s\S]*?)<\/div>/gi;
  let divMatch;

  while ((divMatch = divRegex.exec(quizContent)) !== null) {
    const inner = divMatch[1];

    // Extract question-answer pairs
    const qRegex = /\*\*(\d+)[.)]\s*(.*?)\*\*/g;
    let qMatch;
    let lastIdx = 0;
    const pairs = [];

    while ((qMatch = qRegex.exec(inner)) !== null) {
      const num = parseInt(qMatch[1], 10);
      const question = qMatch[2].trim();
      const startIdx = qMatch.index + qMatch[0].length;

      // Find next question or end
      qRegex.lastIndex = startIdx;
      const nextMatch = qRegex.exec(inner);
      const endIdx = nextMatch ? nextMatch.index : inner.length;
      qRegex.lastIndex = endIdx;

      const rest = inner.slice(startIdx, endIdx);

      // Extract correct answer
      const correctMatch = rest.match(/-\s*\[\s*[xX]\s*\]\s*(.*?)$/m);
      const answer = correctMatch ? correctMatch[1].trim() : '';

      pairs.push({ question, answer });
    }

    for (const pair of pairs) {
      quizBlocks.push({
        question: pair.question,
        answer: pair.answer,
      });
    }
  }

  if (quizBlocks.length > 0) {
    quizIndex[slug] = {
      title,
      dirName: dir,
      quizCount: quizBlocks.length,
      questions: quizBlocks,
    };
    console.log(`  📝 ${dir}: ${quizBlocks.length} questions`);
  }
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(quizIndex, null, 2));

const totalModules = Object.keys(quizIndex).length;
const totalQuestions = Object.values(quizIndex).reduce((acc, m) => acc + m.quizCount, 0);
console.log(`✅ Quiz index generated: ${totalModules} modules, ${totalQuestions} questions → ${outputPath}`);
