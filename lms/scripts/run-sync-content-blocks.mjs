#!/usr/bin/env node
/**
 * run-sync-content-blocks.mjs
 *
 * Executes the content blocks sync against D1 in small batches.
 * Splits per-module to avoid SQLITE_TOOBIG errors.
 *
 * Usage:
 *   CLOUDFLARE_ACCOUNT_ID=xxx node scripts/run-sync-content-blocks.mjs
 *   CLOUDFLARE_ACCOUNT_ID=xxx node scripts/run-sync-content-blocks.mjs --local   # use local D1 dev
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const modulesTsPath = resolve(root, 'src', 'lib', 'stores', 'modules.ts');
const staticContentDir = resolve(root, 'static', 'content');
const batchDir = resolve(root, '.tmp-sync-batches');

const isLocal = process.argv.includes('--local');
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';

// ── Parse modules ──
function parseModulesTs(filePath) {
  const src = readFileSync(filePath, 'utf-8');
  const modules = [];
  const moduleRegex = /\{\s*index:\s*(\d+),[\s\S]*?slug:\s*'([^']+)',[\s\S]*?dirName:\s*'([^']+)',[\s\S]*?title:\s*'([^']+)',[\s\S]*?description:\s*'([^']*)',[\s\S]*?level:\s*'([^']+)',[\s\S]*?sessions:\s*\[([\s\S]*?)\]\s*\},/g;
  let match;
  while ((match = moduleRegex.exec(src)) !== null) {
    const [, index, slug, dirName, title, description, level, sessionsSrc] = match;
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

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + val.replace(/'/g, "''") + "'";
}

function genStmt(id, type, title, body, bodyHtml, meta, orderIndex) {
  const metaJson = JSON.stringify(meta);
  return `INSERT OR REPLACE INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at) VALUES (${esc(id)}, ${esc(type)}, ${esc(title)}, ${esc(body)}, ${esc(bodyHtml)}, ${esc(metaJson)}, ${orderIndex}, 'published', datetime('now'), datetime('now'));\n`;
}

// ── Main ──
function main() {
  if (!accountId && !isLocal) {
    console.error('ERROR: Set CLOUDFLARE_ACCOUNT_ID env var, or pass --local');
    process.exit(1);
  }

  const modules = parseModulesTs(modulesTsPath);
  console.error(`Found ${modules.length} modules`);

  // batchDir might exist from previous run — that's fine
  mkdirSync(batchDir, { recursive: true });

  const flag = isLocal ? '' : `--remote`;
  const account = accountId ? `CLOUDFLARE_ACCOUNT_ID=${accountId}` : '';

  let totalStatements = 0;
  let failedBatches = [];

  for (const mod of modules) {
    const jsonPath = join(staticContentDir, `${mod.dirName}.json`);
    if (!existsSync(jsonPath)) {
      console.error(`  SKIP ${mod.dirName} — no static JSON`);
      continue;
    }

    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'));

    // Build batch SQL for this module
    let sql = '';
    for (let i = 0; i < mod.sessions.length; i++) {
      const sess = mod.sessions[i];
      const md = json[sess.id] || '';
      sql += genStmt(`cb-${sess.id}`, 'text', sess.title, md, md, { moduleSlug: mod.slug, dirName: mod.dirName, sessionId: sess.id }, i);
      totalStatements++;
    }

    // README
    if (json['README']) {
      sql += genStmt(`cb-${mod.dirName}-README`, 'text', `README — ${mod.title}`, json['README'], json['README'], { moduleSlug: mod.slug, dirName: mod.dirName, type: 'readme' }, -1);
      totalStatements++;
    }

    // quiz
    if (json['quiz']) {
      sql += genStmt(`cb-${mod.dirName}-quiz`, 'quiz', `Quiz — ${mod.title}`, json['quiz'], json['quiz'], { moduleSlug: mod.slug, dirName: mod.dirName, type: 'quiz' }, -1);
      totalStatements++;
    }

    if (!sql.trim()) {
      console.error(`  EMPTY ${mod.dirName}`);
      continue;
    }

    // Write batch file
    const batchFile = join(batchDir, `${mod.dirName}.sql`);
    writeFileSync(batchFile, sql);

    // Execute
    try {
      const cmd = `${account} npx wrangler d1 execute rpl-ai-lms-db ${flag} --file=${batchFile}`;
      console.error(`  Executing ${mod.dirName} (${mod.sessions.length + (json['README'] ? 1 : 0) + (json['quiz'] ? 1 : 0)} statements)...`);
      const out = execSync(cmd, { cwd: root, encoding: 'utf-8', timeout: 120000 });
      // Check for errors in output
      if (out.includes('ERROR') || out.includes('error')) {
        const errLines = out.split('\n').filter(l => l.includes('ERROR') || l.includes('error') || l.includes('Error'));
        console.error(`  ⚠️  Errors in ${mod.dirName}:`, errLines.join('; '));
      } else {
        console.error(`  ✅ ${mod.dirName}`);
      }
    } catch (e) {
      console.error(`  ❌ ${mod.dirName}: ${e.message}`);
      failedBatches.push(mod.dirName);
    }

    // Clean up batch file
    try { unlinkSync(batchFile); } catch {}
  }

  // Cleanup
  try { execSync(`rm -rf ${batchDir}`); } catch {}

  console.error(`\n=== DONE ===`);
  console.error(`Total statements: ${totalStatements}`);
  if (failedBatches.length > 0) {
    console.error(`Failed batches: ${failedBatches.join(', ')}`);
    process.exit(1);
  } else {
    console.error(`All batches succeeded.`);
  }
}

main();
