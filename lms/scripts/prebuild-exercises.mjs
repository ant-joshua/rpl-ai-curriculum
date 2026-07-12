// Prebuild: scan exercises/ and build exercises.json index
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve, extname, basename, dirname } from 'path';

const root = resolve(import.meta.dirname, '..');
const exercisesDir = join(root, '..', 'exercises');
const outputDir = join(root, 'static', 'content');
const modulesTsPath = join(root, 'src', 'lib', 'stores', 'modules.ts');

mkdirSync(outputDir, { recursive: true });

// ── Load modules from modules.ts ──────────────────────────────────────
function loadModules() {
  const src = readFileSync(modulesTsPath, 'utf-8');
  const marker = 'export const modules: Module[] = [';
  const startIdx = src.indexOf(marker);
  if (startIdx === -1) throw new Error('Could not find modules array in modules.ts');
  const arrStart = startIdx + marker.length;

  let depth = 0, endIdx = arrStart;
  for (let i = arrStart; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      if (depth === 0) { endIdx = i + 1; break; }
      depth--;
    }
  }

  let arrText = src.slice(arrStart, endIdx).trim();
  arrText = arrText.replace(/,(\\s*[}\\]])/g, '$1');
  arrText = arrText.replace(/s\('([^']*)',\s*'([^']*)'\)/g, (_, title, id) => {
    const safeTitle = title.replace(/'/g, "\\'");
    const safeId = id.replace(/'/g, "\\'");
    return `{id:'${safeId}',title:'${safeTitle}'}`;
  });
  arrText = '[' + arrText + ']';

  let modules;
  try {
    modules = new Function(`return ${arrText}`)();
  } catch (e) {
    console.warn('⚠️ JS eval failed, falling back to regex:', e.message);
    const moduleBlocks = src.match(/\{\s*\n\s*index:\s*(\d+),[\s\S]*?\n\s*\},?\n/g) || [];
    modules = moduleBlocks.map(block => {
      const index = parseInt(block.match(/index:\s*(\d+)/)?.[1] || '0', 10);
      const slug = block.match(/slug:\s*'([^']*)'/)?.[1] || '';
      const dirName = block.match(/dirName:\s*'([^']*)'/)?.[1] || '';
      const titleMatch = block.match(/title:\s*'([^']*)'/);
      const title = titleMatch ? titleMatch[1].replace(/\\'/g, "'") : '';
      return { index, slug, dirName, title };
    });
  }

  return modules;
}

const modules = loadModules();
console.log(`Loaded ${modules.length} modules`);

// Build prefix → moduleSlug map
// For dir names like '01-js-fundamentals', prefix '01' maps to slug 'js-fundamentals'
const prefixToSlug = {};
for (const m of modules) {
  const match = m.dirName.match(/^(\d+)-/);
  if (match) {
    prefixToSlug[match[1]] = m.slug;
  }
}

// ── Parse a single exercise file ──────────────────────────────────────
function parseExercise(filePath, relPath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Derive slug from filename
  const slug = basename(filePath, '.md');

  // Title: first # heading
  let title = slug.replace(/^\d+-/, '').replace(/[-_]/g, ' ');
  title = title.charAt(0).toUpperCase() + title.slice(1);
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].replace(/^\p{Emoji}*\s*/u, '').trim();
  }

  // Difficulty: check both frontmatter-style and heading-based
  let difficulty = 'Beginner';
  const levelMatch = content.match(/>\s*\*\*Level:\*\*\s*(.+)/i);
  if (levelMatch) {
    difficulty = levelMatch[1].replace(/[🌱📐🚀]/g, '').trim();
  } else if (content.match(/##\s+Level\s+3/i) || content.match(/##\s+Level\s+3/i)) {
    difficulty = 'Advanced';
  } else if (content.match(/##\s+Level\s+2/i)) {
    difficulty = 'Intermediate';
  }

  // Normalize difficulty
  if (/advanced|challenge|sulit/i.test(difficulty)) difficulty = 'Advanced';
  else if (/intermediate|medium|sedang/i.test(difficulty)) difficulty = 'Intermediate';
  else difficulty = 'Beginner';

  // Type: detect from first code block language
  let type = 'js';
  const codeBlockMatch = content.match(/```(\w+)/);
  if (codeBlockMatch) {
    const lang = codeBlockMatch[1].toLowerCase();
    if (['html', 'htm'].includes(lang)) type = 'html';
    else if (['bash', 'sh', 'shell', 'zsh'].includes(lang)) type = 'bash';
    else if (['python', 'py'].includes(lang)) type = 'python';
    else type = 'js'; // javascript, typescript, js, ts → js
  }

  // Check if exercise has code blocks (for "Coba Kode" button)
  const hasCode = /```[\s\S]*?```/g.test(content);

  // Description: first meaningful paragraph after title/level
  let description = '';
  const descLines = [];
  let inDesc = false;
  for (const line of lines) {
    if (line.startsWith('# ')) continue;
    if (line.startsWith('>')) continue;
    if (line.startsWith('---')) continue;
    if (line.startsWith('## ')) { if (inDesc) break; continue; }
    if (line.trim() && !line.startsWith('```')) {
      descLines.push(line.trim());
      inDesc = true;
    } else if (inDesc && !line.trim()) {
      break;
    }
  }
  description = descLines.join(' ').replace(/^[🏋️📘🌐🧠🖥️🤖📋]\s*/, '').trim();
  if (description.length > 200) description = description.slice(0, 197) + '...';

  // ModuleSlug: derive from parent dir or file prefix
  let moduleSlug = null;
  const relDir = dirname(relPath);
  if (relDir && relDir !== '.') {
    // Subdirectory like '01-js' → extract prefix
    const prefixMatch = relDir.match(/^(\d+)/);
    if (prefixMatch && prefixToSlug[prefixMatch[1]]) {
      moduleSlug = prefixToSlug[prefixMatch[1]];
    }
  } else {
    // Standalone file like '09-testing.md' → extract prefix from filename
    const prefixMatch = slug.match(/^(\d+)/);
    if (prefixMatch && prefixToSlug[prefixMatch[1]]) {
      moduleSlug = prefixToSlug[prefixMatch[1]];
    }
  }

  return {
    title,
    slug,
    difficulty,
    type,
    moduleSlug,
    description,
    content,
    hasCode,
  };
}

// ── Scan exercises directory ──────────────────────────────────────────
const exercises = [];
const seenSlugs = new Set();

function scanDir(dirPath, relPath = '') {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    const entryRel = relPath ? `${relPath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      scanDir(fullPath, entryRel);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Skip README.md files (case-insensitive)
      if (entry.name.toUpperCase() === 'README.MD') continue;

      // Skip root-level .md files — real exercises live only in subdirectories
      if (!relPath) continue;

      try {
        const exercise = parseExercise(fullPath, entryRel);

        // Deduplicate slugs (later file wins)
        if (seenSlugs.has(exercise.slug)) {
          console.warn(`⚠️ Duplicate slug: ${exercise.slug} (${entryRel})`);
        }
        seenSlugs.add(exercise.slug);

        exercises.push(exercise);
        console.log(`  ${exercise.slug} (${exercise.difficulty}, ${exercise.type})${exercise.moduleSlug ? ' → ' + exercise.moduleSlug : ''}`);
      } catch (e) {
        console.warn(`⚠️ Error parsing ${entryRel}: ${e.message}`);
      }
    }
  }
}

console.log(`\nScanning ${exercisesDir}...`);
scanDir(exercisesDir);
console.log(`Found ${exercises.length} exercise files`);

// ── Group by moduleSlug ───────────────────────────────────────────────
const grouped = {};
for (const ex of exercises) {
  const key = ex.moduleSlug || '__standalone';
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(ex);
}

// ── Write output ──────────────────────────────────────────────────────
const output = {
  exercises,
  grouped,
  meta: {
    total: exercises.length,
    generatedAt: new Date().toISOString(),
  },
};

writeFileSync(join(outputDir, 'exercises.json'), JSON.stringify(output, null, 2));
console.log(`\n✅ Written ${join(outputDir, 'exercises.json')} (${exercises.length} exercises, ${Object.keys(grouped).length} groups)`);
