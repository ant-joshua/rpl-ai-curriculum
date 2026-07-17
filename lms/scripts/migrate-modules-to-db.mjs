/**
 * Script: migrate-modules-to-db.mjs
 * Task: Baca 57 module markdown dirs → generate SQL INSERTs → execute ke D1 remote
 * Strategy: Generate SQL, split into chunks, execute via wrangler
 *
 * Usage: node scripts/migrate-modules-to-db.mjs
 *        CLOUDFLARE_ACCOUNT_ID=xxx node scripts/migrate-modules-to-db.mjs --dry-run
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

// ─── Config ────────────────────────────────────────────
const MODULES_DIR = '/home/midory/rpl-ai-curriculum';
const SCRIPTS_DIR = '/home/midory/rpl-ai-curriculum/lms/scripts';
const MIGRATIONS_DIR = '/home/midory/rpl-ai-curriculum/lms/migrations';
const MIGRATION_FILE = join(MIGRATIONS_DIR, '0065_modules_to_db.sql');
const DB_NAME = 'rpl-ai-lms-db';
const TENANT_ID = 'default';
const DRY_RUN = process.argv.includes('--dry-run');
const CHUNK_SIZE = 20;

// Get account ID from env, or let wrangler figure it out
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';

// ─── Helpers ───────────────────────────────────────────
function uuid() {
  return crypto.randomUUID();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function extractDescription(markdown) {
  let rest = markdown.replace(/^#\s.+$/m, '').trim();
  rest = rest.replace(/^<img[^>]*>\s*/gm, '').trim();
  if (rest.length > 2000) rest = rest.substring(0, 2000) + '...';
  return rest;
}

function getModulePrefix(dirName) {
  const match = dirName.match(/^(\d+)/);
  return match ? match[1] : '00';
}

function getLessonFiles(modDir) {
  const files = readdirSync(modDir).sort();
  return files.filter(f =>
    f.match(/^\d+[-_].*\.md$/) &&
    !f.toLowerCase().includes('readme') &&
    !f.toLowerCase().includes('cheatsheet') &&
    !f.toLowerCase().includes('quiz')
  );
}

function readFileSafe(filePath) {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function runWrangler(args) {
  const cmd = `npx wrangler d1 execute ${DB_NAME} --remote ${args} 2>&1`;
  const env = { ...process.env };
  if (CLOUDFLARE_ACCOUNT_ID) env.CLOUDFLARE_ACCOUNT_ID = CLOUDFLARE_ACCOUNT_ID;
  return execSync(cmd, { cwd: '/home/midory/rpl-ai-curriculum/lms', encoding: 'utf-8', timeout: 120000, env });
}

function parseWranglerJson(output) {
  // Wrangler outputs JSON array wrapped in a result object
  // Find the first [ ... ] block and parse it
  const start = output.indexOf('[');
  const end = output.lastIndexOf(']');
  if (start === -1 || end === -1) return [];
  try {
    return JSON.parse(output.substring(start, end + 1));
  } catch {
    return [];
  }
}

// ─── SQL Builders ──────────────────────────────────────
function buildInsertCourse(id, title, slug, description, shortDesc, level, category) {
  return `INSERT INTO courses (id, title, slug, description, short_description, icon, cover_image, category, level, created_by, created_at, updated_at, featured, tenant_id)
VALUES (${escapeSql(id)}, ${escapeSql(title)}, ${escapeSql(slug)}, ${escapeSql(description)}, ${escapeSql(shortDesc)}, NULL, NULL, ${escapeSql(category)}, ${escapeSql(level)}, NULL, datetime('now'), datetime('now'), 0, ${escapeSql(TENANT_ID)});`;
}

function buildInsertCourseOffering(id, courseId, name, code) {
  return `INSERT INTO course_offerings (id, course_id, name, code, instructor_id, start_date, end_date, enrollment_start, enrollment_end, max_students, status, created_at, updated_at, grade_weight_config, tenant_id)
VALUES (${escapeSql(id)}, ${escapeSql(courseId)}, ${escapeSql(name)}, ${escapeSql(code)}, NULL, NULL, NULL, NULL, NULL, NULL, 'active', datetime('now'), datetime('now'), NULL, ${escapeSql(TENANT_ID)});`;
}

function buildInsertContentBlock(id, type, title, body, orderIndex, courseOfferingId, courseId, slug, isOptional) {
  return `INSERT INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at, course_offering_id, course_id, parent_id, slug, subtitle, duration_min, is_optional, unlock_days, weight, due_date, source_id, tenant_id)
VALUES (${escapeSql(id)}, ${escapeSql(type)}, ${escapeSql(title)}, ${escapeSql(body)}, NULL, '{}', ${orderIndex}, 'published', datetime('now'), datetime('now'), ${escapeSql(courseOfferingId)}, ${escapeSql(courseId)}, NULL, ${escapeSql(slug)}, NULL, 0, ${isOptional ? 1 : 0}, NULL, 0.0, NULL, NULL, ${escapeSql(TENANT_ID)});`;
}

function buildInsertLesson(id, courseOfferingId, contentBlockId, title, slug, orderIndex, isOptional) {
  return `INSERT INTO lessons (id, course_offering_id, content_block_id, title, slug, order_index, duration_minutes, is_optional, status, unlock_days, created_at, updated_at, tenant_id)
VALUES (${escapeSql(id)}, ${escapeSql(courseOfferingId)}, ${escapeSql(contentBlockId)}, ${escapeSql(title)}, ${escapeSql(slug)}, ${orderIndex}, 0, ${isOptional ? 1 : 0}, 'published', NULL, datetime('now'), datetime('now'), ${escapeSql(TENANT_ID)});`;
}

// ─── Main ──────────────────────────────────────────────
async function main() {
  console.log('=== Migrate Modules Markdown → DB ===\n');

  // 1. Discover module dirs
  const allDirs = readdirSync(MODULES_DIR).filter(d =>
    d.match(/^\d+-/) && existsSync(join(MODULES_DIR, d, 'README.md'))
  ).sort();
  console.log(`Found ${allDirs.length} module dirs with README.md\n`);

  // 2. Get existing courses from DB
  console.log('Checking existing courses in DB...');
  let existingSlugs = new Set();
  if (!DRY_RUN) {
    try {
      const result = runWrangler(`--command "SELECT slug FROM courses;"`);
      const rows = parseWranglerJson(result);
      rows.forEach(r => existingSlugs.add(r.slug));
      console.log(`  Existing slugs in DB: ${[...existingSlugs].join(', ') || '(none)'}`);
    } catch (err) {
      console.error('  WARNING: Could not query existing courses.');
      console.error('  Error:', err.message.split('\n')[0]);
      console.log('  Will attempt insert anyway (may get duplicates)\n');
    }
  }
  console.log('');

  // 3. Process modules
  const allStatements = [];
  let stats = { courses: 0, offerings: 0, contentBlocks: 0, lessons: 0, skipped: 0 };

  for (const dirName of allDirs) {
    const modDir = join(MODULES_DIR, dirName);
    const slug = dirName;

    if (existingSlugs.has(slug)) {
      console.log(`  ⏭️  SKIP ${dirName} — already in DB`);
      stats.skipped++;
      continue;
    }

    const readme = readFileSafe(join(modDir, 'README.md')) || '# Unknown';
    const courseTitle = extractTitle(readme);
    const description = extractDescription(readme);
    const shortDesc = description.length > 200 ? description.substring(0, 200) + '...' : description;
    const prefix = getModulePrefix(dirName);

    let level = 'beginner';
    if (readme.includes('Intermediate') || readme.includes('intermediate') || readme.includes('Menengah')) level = 'intermediate';
    if (readme.includes('Advanced') || readme.includes('advanced') || readme.includes('Lanjutan')) level = 'advanced';

    let category = 'programming';
    if (slug.includes('flutter') || slug.includes('mobile')) category = 'mobile';
    else if (slug.includes('design') || slug.includes('ui-ux')) category = 'design';
    else if (slug.includes('security') || slug.includes('cyber')) category = 'security';
    else if (slug.includes('devops') || slug.includes('docker') || slug.includes('cloud') || slug.includes('deploy')) category = 'devops';
    else if (slug.includes('ai-') || slug.includes('prompt') || slug.includes('machine')) category = 'ai';
    else if (slug.includes('soft-skill') || slug.includes('portfolio') || slug.includes('interview') || slug.includes('branding')) category = 'career';
    else if (slug.includes('database') || slug.includes('data-')) category = 'data';
    else if (slug.includes('test')) category = 'testing';
    else if (slug.includes('fundamental') || slug.includes('web-basics') || slug.includes('html-css')) category = 'fundamentals';

    const courseId = uuid();
    const offeringId = uuid();
    const code = `${prefix}-2026`;

    console.log(`  📦 ${dirName}: "${courseTitle}" (${level}, ${category})`);

    allStatements.push('-- ' + dirName);
    allStatements.push(buildInsertCourse(courseId, courseTitle, slug, description, shortDesc, level, category));
    allStatements.push(buildInsertCourseOffering(offeringId, courseId, courseTitle, code));
    stats.courses++;
    stats.offerings++;

    const lessonFiles = getLessonFiles(modDir);
    let lessonOrder = 0;

    for (const lf of lessonFiles) {
      lessonOrder++;
      const content = readFileSafe(join(modDir, lf)) || '# Empty';
      const lessonTitle = extractTitle(content);
      const lessonSlug = slugify(lf.replace(/\.md$/, ''));
      const cbId = uuid();
      const lessonId = uuid();

      allStatements.push(buildInsertContentBlock(cbId, 'text', lessonTitle, content, lessonOrder, offeringId, courseId, lessonSlug, false));
      allStatements.push(buildInsertLesson(lessonId, offeringId, cbId, lessonTitle, lessonSlug, lessonOrder, false));
      stats.contentBlocks++;
      stats.lessons++;
      console.log(`    📝 ${lf}: "${lessonTitle}"`);
    }

    const cheatFile = readdirSync(modDir).find(f => f.toLowerCase() === 'cheatsheet.md');
    if (cheatFile) {
      lessonOrder++;
      const content = readFileSafe(join(modDir, cheatFile)) || '# Cheatsheet';
      const lessonTitle = '🧠 Cheatsheet';
      const lessonSlug = slugify(dirName + '-cheatsheet');
      const cbId = uuid();
      const lessonId = uuid();

      allStatements.push(buildInsertContentBlock(cbId, 'text', lessonTitle, content, lessonOrder, offeringId, courseId, lessonSlug, true));
      allStatements.push(buildInsertLesson(lessonId, offeringId, cbId, lessonTitle, lessonSlug, lessonOrder, true));
      stats.contentBlocks++;
      stats.lessons++;
      console.log(`    📝 cheatsheet.md: "🧠 Cheatsheet" (optional)`);
    }

    const quizFile = readdirSync(modDir).find(f => f.toLowerCase() === 'quiz.md');
    if (quizFile) {
      lessonOrder++;
      const content = readFileSafe(join(modDir, quizFile)) || '# Quiz';
      const lessonTitle = '📝 Quiz';
      const lessonSlug = slugify(dirName + '-quiz');
      const cbId = uuid();
      const lessonId = uuid();

      allStatements.push(buildInsertContentBlock(cbId, 'text', lessonTitle, content, lessonOrder, offeringId, courseId, lessonSlug, true));
      allStatements.push(buildInsertLesson(lessonId, offeringId, cbId, lessonTitle, lessonSlug, lessonOrder, true));
      stats.contentBlocks++;
      stats.lessons++;
      console.log(`    📝 quiz.md: "📝 Quiz" (optional)`);
    }

    console.log('');
  }

  console.log('=== Migration Summary ===');
  console.log(`  Skipped (already in DB): ${stats.skipped}`);
  console.log(`  New courses:             ${stats.courses}`);
  console.log(`  New offerings:          ${stats.offerings}`);
  console.log(`  New content_blocks:     ${stats.contentBlocks}`);
  console.log(`  New lessons:            ${stats.lessons}`);
  console.log(`  Total SQL statements:   ${allStatements.length}`);
  console.log('');

  if (allStatements.length === 0) {
    console.log('✅ Nothing to migrate. All modules already in DB.');
    return;
  }

  // 5. Write migration file
  const header = `-- Migration 0065: Modules to DB (courses/lessons/content_blocks)
-- Generated: ${new Date().toISOString()}
-- Modules processed: ${stats.courses} new, ${stats.skipped} skipped
-- Total statements: ${allStatements.length}

`;
  const sqlContent = header + allStatements.join('\n') + '\n';
  writeFileSync(MIGRATION_FILE, sqlContent, 'utf-8');
  console.log(`📄 SQL written to: ${MIGRATION_FILE}`);
  console.log(`   File size: ${(sqlContent.length / 1024).toFixed(1)} KB\n`);

  if (DRY_RUN) {
    console.log('🧪 DRY RUN — no SQL executed. To execute: remove --dry-run');
    return;
  }

  // 6. Execute in chunks
  console.log('🚀 Executing migration to D1 remote...\n');

  // Split non-comment SQL statements into chunks
  const insertStatements = allStatements.filter(l => l.startsWith('INSERT'));
  console.log(`Total INSERT statements: ${insertStatements.length}`);
  console.log(`Chunk size: ${CHUNK_SIZE} statements\n`);

  let chunks = [];
  for (let i = 0; i < insertStatements.length; i += CHUNK_SIZE) {
    chunks.push(insertStatements.slice(i, i + CHUNK_SIZE));
  }
  console.log(`SQL split into ${chunks.length} chunks\n`);

  let totalExecuted = 0;
  let failedChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkSql = chunks[i].join('\n');
    const chunkFile = join(SCRIPTS_DIR, `_chunk_${String(i).padStart(3, '0')}.sql`);

    writeFileSync(chunkFile, chunkSql, 'utf-8');

    console.log(`  Chunk ${i + 1}/${chunks.length} (${chunks[i].length} INSERTs)...`);

    try {
      const result = runWrangler(`--file ${chunkFile}`);

      const execMatch = result.match(/Executed (\d+) commands?/);
      if (execMatch) {
        const count = parseInt(execMatch[1]);
        totalExecuted += count;
        console.log(`    ✅ Executed ${count} commands`);
      } else {
        console.log(`    ✅ OK`);
      }

      // Check for errors in response
      const lower = result.toLowerCase();
      if (lower.includes('error') || lower.includes('fail') || lower.includes('not found')) {
        const errLines = result.split('\n').filter(l =>
          l.toLowerCase().includes('error') || l.toLowerCase().includes('fail')
        ).slice(0, 3);
        if (errLines.length) {
          console.log(`    ⚠️  Issues:`);
          errLines.forEach(l => console.log(`       ${l.trim()}`));
        }
      }

      try { unlinkSync(chunkFile); } catch {}
    } catch (err) {
      // Get actual stderr output
      const stderr = err.stderr || '';
      const stdout = err.stdout || '';
      const errMsg = stderr || stdout || err.message;

      console.error(`    ❌ FAILED:`);
      const lines = errMsg.split('\n').filter(l => l.trim());
      lines.slice(0, 8).forEach(l => console.error(`       ${l.trim()}`));

      // Save failed chunk
      const failFile = chunkFile.replace('.sql', '_FAILED.sql');
      try { writeFileSync(failFile, chunkSql); } catch {}
      console.error(`       Saved to: ${failFile}`);
      failedChunks.push(i);
    }
  }

  console.log(`\n📊 Total SQL statements executed: ${totalExecuted} / ${insertStatements.length}`);
  if (failedChunks.length > 0) {
    console.log(`❌ Failed chunks: ${failedChunks.length}`);
  }

  // 7. Verify
  console.log('\n🔍 Verifying migration...');
  try {
    const verifyResult = runWrangler(`--command "SELECT COUNT(*) as cnt FROM courses;"`);
    const rows = parseWranglerJson(verifyResult);
    if (rows.length) {
      console.log(`   Total courses in DB: ${rows[0].cnt}`);
    }
  } catch (err) {
    console.log(`   Verify query failed: ${err.message.split('\n')[0]}`);
  }

  console.log('\n✅ Migration complete!');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
