#!/usr/bin/env node
/**
 * sync-content-blocks.mjs
 *
 * Reads prebuilt static content JSONs + modules.ts registry,
 * generates D1 upsert SQL for content_blocks table.
 *
 * NEW: Supports multi-block lessons by parsing `---` delimiters
 * in session content. Each block can specify a type:
 *
 *   --- text ---
 *   Regular markdown content
 *
 *   --- video ---
 *   {video:https://youtube.com/watch?v=XXX}
 *
 *   --- quiz ---
 *   ## Quiz
 *   questions here
 *
 *   --- code ---
 *   ```js
 *   console.log('hello');
 *   ```
 *
 * Usage:
 *   node scripts/sync-content-blocks.mjs                    # prints SQL to stdout
 *   node scripts/sync-content-blocks.mjs | wrangler d1 execute rpl-ai-lms-db --remote  # execute
 *   node scripts/sync-content-blocks.mjs --out migrations/0029_sync_content_blocks.sql  # write file
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const staticContentDir = resolve(root, 'static', 'content');
const modulesTsPath = resolve(root, 'src', 'lib', 'stores', 'modules.ts');

// ── Parse modules.ts to extract module + session metadata ──────────────
function parseModulesTs(filePath) {
  const src = readFileSync(filePath, 'utf-8');
  const modules = [];

  // Match each module block: { index, slug, dirName, title, description, level, sessions: [...] }
  const moduleRegex = /\{\s*index:\s*(\d+),[\s\S]*?slug:\s*'([^']+)',[\s\S]*?dirName:\s*'([^']+)',[\s\S]*?title:\s*'([^']+)',[\s\S]*?description:\s*'([^']*)',[\s\S]*?level:\s*'([^']+)',[\s\S]*?sessions:\s*\[([\s\S]*?)\]\s*\},/g;

  let match;
  while ((match = moduleRegex.exec(src)) !== null) {
    const [, index, slug, dirName, title, description, level, sessionsSrc] = match;
    // Parse sessions: s('title', 'id'),  or  s('title', 'id')
    const sessions = [];
    const sessionRegex = /s\(\s*'([^']*)'\s*,\s*'([^']+)'\s*\)/g;
    let sm;
    while ((sm = sessionRegex.exec(sessionsSrc)) !== null) {
      sessions.push({ title: sm[1], id: sm[2] });
    }
    modules.push({ index: Number(index), slug, dirName, title, description, level, sessions });
  }

  return modules;
}

// ── Generate upsert SQL for one content_block ──────────────────────────
function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + val.replace(/'/g, "''") + "'";
}

function generateContentBlockInsert(id, type, title, body, bodyHtml, meta, orderIndex) {
  const metaJson = JSON.stringify(meta);
  return [
    `INSERT OR REPLACE INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at)`,
    `VALUES (`,
    `  ${escapeSql(id)},`,
    `  ${escapeSql(type)},`,
    `  ${escapeSql(title)},`,
    `  ${escapeSql(body)},`,
    `  ${escapeSql(bodyHtml)},`,
    `  ${escapeSql(metaJson)},`,
    `  ${orderIndex},`,
    `  'published',`,
    `  datetime('now'),`,
    `  datetime('now')`,
    `);`
  ].join('\n');
}

function generateLessonContentBlockInsert(id, lessonId, contentBlockId, orderIndex, typeOverride) {
  const typeOverrideStr = typeOverride ? escapeSql(typeOverride) : 'NULL';
  return [
    `INSERT OR REPLACE INTO lesson_content_blocks (id, lesson_id, content_block_id, order_index, type_override, created_at)`,
    `VALUES (`,
    `  ${escapeSql(id)},`,
    `  ${escapeSql(lessonId)},`,
    `  ${escapeSql(contentBlockId)},`,
    `  ${orderIndex},`,
    `  ${typeOverrideStr},`,
    `  datetime('now')`,
    `);`
  ].join('\n');
}

// ── Parse multi-block content from markdown ────────────────────────────
// Supports blocks delimited by --- type --- markers:
//   --- text ---
//   ...content...
//   --- video ---
//   ...content...
//   --- quiz ---
//   ...content...
function parseMultiBlockContent(rawMarkdown, sessionTitle, sessionId, moduleSlug, dirName, lessonId) {
  // Check if content has block delimiters
  const blockRegex = /^---\s*(\w+)\s*---\s*$/gm;
  const blocks = [];

  // Split by block markers
  const parts = rawMarkdown.split(/^---\s*(\w+)\s*---\s*$/m);

  if (parts.length < 3) {
    // No multi-block structure — single text block
    return null;
  }

  // parts[0] = preamble (before first ---)
  // parts[1] = first type
  // parts[2] = first content
  // parts[3] = second type
  // parts[4] = second content
  // etc.

  let preamble = parts[0]?.trim();
  let idx = 0;

  // If there's preamble content before the first ---, treat it as text block
  if (preamble) {
    const blockId = `cb-${sessionId}-b${idx}`;
    blocks.push({
      id: blockId,
      type: 'text',
      title: idx === 0 ? sessionTitle : '',
      body: preamble,
      bodyHtml: preamble,
      meta: { moduleSlug, dirName, sessionId, blockIndex: idx },
      orderIndex: idx,
      typeOverride: null
    });
    idx++;
  }

  for (let i = 1; i < parts.length; i += 2) {
    const blockType = parts[i]?.trim() || 'text';
    const blockContent = (parts[i + 1] || '').trim();
    if (!blockContent) continue;

    // Normalize block type
    let type = blockType.toLowerCase();
    if (['text', 'video', 'code', 'quiz', 'embed', 'image'].includes(type)) {
      // valid
    } else {
      type = 'text';
    }

    const blockId = `cb-${sessionId}-b${idx}`;
    const blockTitle = idx === 0 ? sessionTitle : '';

    // For quiz blocks, store questions in meta
    const meta = { moduleSlug, dirName, sessionId, blockIndex: idx };

    if (type === 'quiz') {
      // Extract questions from quiz markdown into meta.questions
      const questions = parseQuizBlocks(blockContent);
      meta.questions = questions;
    }

    // For video blocks, the body_html will be processed by the frontend
    // Store the raw content as body
    const body = blockContent;
    const bodyHtml = blockContent;

    blocks.push({
      id: blockId,
      type,
      title: blockTitle,
      body,
      bodyHtml,
      meta,
      orderIndex: idx,
      typeOverride: null
    });
    idx++;
  }

  return blocks;
}

// ── Parse quiz questions from markdown ─────────────────────────────────
function parseQuizBlocks(content) {
  const questions = [];
  // Match ## Question NN or **Q:** style questions with options
  const lines = content.split('\n');
  let currentQuestion = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match: ## Question 1, **Question:*, etc.
    const qMatch = trimmed.match(/^##\s*(?:Question|Soal|Pertanyaan)\s*(\d*)\s*[:.]?\s*(.*)?$/i);
    if (qMatch) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = {
        question: qMatch[2]?.trim() || '',
        options: [],
        correctIndex: null,
        explanation: ''
      };
      continue;
    }

    // Match numbered options: 1. Option text  or - Option text or * Option text
    if (currentQuestion) {
      // Check for correct answer marker: **option text** or *option text*
      const correctMatch = trimmed.match(/^[-*\d]+\.?\s*\*{1,2}(.+)\*{1,2}$/);
      if (correctMatch) {
        const optIdx = currentQuestion.options.length;
        currentQuestion.options.push(correctMatch[1].trim());
        currentQuestion.correctIndex = optIdx;
        continue;
      }

      // Regular option: 1. Option text  or - Option text
      const optMatch = trimmed.match(/^[-*\d]+\.?\s+(.+)$/);
      if (optMatch && !trimmed.startsWith('#')) {
        currentQuestion.options.push(optMatch[1].trim());
        continue;
      }

      // Explanation
      const expMatch = trimmed.match(/^(?:Explanation|Penjelasan|Jawaban):\s*(.+)$/i);
      if (expMatch) {
        currentQuestion.explanation = expMatch[1].trim();
        continue;
      }
    }
  }

  if (currentQuestion) questions.push(currentQuestion);
  return questions;
}

// ── Main ──────────────────────────────────────────────────────────────
function main() {
  const writeMode = process.argv.includes('--out');
  const outIndex = process.argv.indexOf('--out');
  let outFile = null;
  if (writeMode && outIndex >= 0 && outIndex < process.argv.length - 1) {
    outFile = process.argv[outIndex + 1];
  }

  console.error(`Reading modules from ${modulesTsPath}`);
  const modules = parseModulesTs(modulesTsPath);
  console.error(`Found ${modules.length} modules`);

  const lines = [];
  let totalBlocks = 0;
  let totalLinks = 0;

  // Header
  lines.push('-- ============================================');
  lines.push('-- Generated by scripts/sync-content-blocks.mjs');
  lines.push(`-- Date: ${new Date().toISOString()}`);
  lines.push('-- ============================================');
  lines.push('');

  for (const mod of modules) {
    const jsonPath = join(staticContentDir, `${mod.dirName}.json`);
    if (!existsSync(jsonPath)) {
      console.error(`  SKIP ${mod.dirName} — no static JSON found at ${jsonPath}`);
      continue;
    }

    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    console.error(`  ${mod.dirName} (${mod.slug}) — ${mod.sessions.length} sessions`);

    // Create content_blocks for each session
    for (let i = 0; i < mod.sessions.length; i++) {
      const session = mod.sessions[i];
      const rawMarkdown = json[session.id] || '';

      // Generate a stable lesson ID from the session ID
      const lessonId = session.id; // same as session id in modules.ts

      // Check if session has multi-block content
      const multiBlocks = parseMultiBlockContent(rawMarkdown, session.title, session.id, mod.slug, mod.dirName, lessonId);

      if (multiBlocks && multiBlocks.length > 0) {
        // Multi-block lesson — generate content_blocks + lesson_content_blocks links
        for (const block of multiBlocks) {
          lines.push('');
          lines.push(generateContentBlockInsert(
            block.id,
            block.type,
            block.title,
            block.body,
            block.bodyHtml,
            block.meta,
            block.orderIndex
          ));
          totalBlocks++;

          // Link to lesson
          const linkId = `lcb-${session.id}-${block.orderIndex}`;
          lines.push(generateLessonContentBlockInsert(
            linkId,
            lessonId,
            block.id,
            block.orderIndex,
            block.typeOverride
          ));
          totalLinks++;
        }
      } else {
        // Single text block (legacy behavior)
        const blockId = `cb-${session.id}`;
        const meta = { moduleSlug: mod.slug, dirName: mod.dirName, sessionId: session.id };

        lines.push('');
        lines.push(generateContentBlockInsert(
          blockId,
          'text',
          session.title,
          rawMarkdown,
          rawMarkdown, // store raw markdown as body_html fallback too
          meta,
          i
        ));
        totalBlocks++;
      }
    }

    // Also store README if present
    if (json['README']) {
      const blockId = `cb-${mod.dirName}-README`;
      const meta = { moduleSlug: mod.slug, dirName: mod.dirName, type: 'readme' };
      lines.push('');
      lines.push(generateContentBlockInsert(
        blockId,
        'text',
        `README — ${mod.title}`,
        json['README'],
        json['README'],
        meta,
        -1
      ));
      totalBlocks++;
    }

    // Store quiz content if present (as separate content block, not linked to a specific lesson)
    if (json['quiz']) {
      const blockId = `cb-${mod.dirName}-quiz`;
      const meta = { moduleSlug: mod.slug, dirName: mod.dirName, type: 'quiz' };
      lines.push('');
      lines.push(generateContentBlockInsert(
        blockId,
        'quiz',
        `Quiz — ${mod.title}`,
        json['quiz'],
        json['quiz'],
        meta,
        -1
      ));
      totalBlocks++;
    }
  }

  lines.push('');
  lines.push(`-- Total: ${totalBlocks} content_blocks, ${totalLinks} lesson_content_blocks links`);

  const sql = lines.join('\n');

  if (outFile) {
    writeFileSync(outFile, sql, 'utf-8');
    console.error(`\n✅ Wrote ${totalBlocks} statements → ${outFile}`);
  } else {
    console.log(sql);
    console.error(`\n✅ ${totalBlocks} statements generated (stdout)`);
    console.error(`   Pipe to: wrangler d1 execute rpl-ai-lms-db --remote --file=-`);
    console.error(`   Or:     node scripts/sync-content-blocks.mjs --out migrations/0029_sync_content_blocks.sql`);
  }
}

main();
