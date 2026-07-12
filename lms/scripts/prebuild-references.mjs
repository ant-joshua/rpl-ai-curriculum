// Prebuild: scan reference content dirs, read all .md content, write as static JSON in static/content/references/
// These are fetched as static assets at runtime — no Worker, no fs access needed on CF Pages

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const repoRoot = resolve(process.cwd(), '..');
const outputDir = resolve(process.cwd(), 'static', 'content', 'references');

mkdirSync(outputDir, { recursive: true });

/** Extract title from markdown content — first `# ` heading, or filename-based fallback */
function extractTitle(content, filename) {
  const match = content.match(/^#\s+(.+)/m);
  if (match) return match[1].trim();
  // Fallback: derive title from filename (e.g., "01-halo-dunia.md" → "01. Halo Dunia")
  const base = filename.replace(/\.md$/, '');
  return base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Extract slug from filename (strip number prefix and .md) */
function extractSlug(filename) {
  return filename.replace(/\.md$/, '');
}

/** Check if filename is a README (should be skipped) */
function isReadme(filename) {
  return /^readme\.md$/i.test(filename);
}

/** Build JSON for one reference type */
function buildReference(dirName, label) {
  const dirPath = join(repoRoot, dirName);
  if (!existsSync(dirPath)) {
    console.warn(`  ⚠️  Directory not found: ${dirPath}`);
    return { items: [] };
  }

  const files = readdirSync(dirPath)
    .filter(f => f.endsWith('.md') && !isReadme(f))
    .sort();

  const items = files.map(file => {
    const content = readFileSync(join(dirPath, file), 'utf-8');
    const title = extractTitle(content, file);
    const slug = extractSlug(file);
    return { title, content, slug };
  });

  console.log(`  📄 ${dirName}: ${items.length} items`);
  return { items };
}

// --- Glossary ---
console.log('📚 Prebuilding reference JSON...');
const glossary = buildReference('glossary', 'Glossary');
writeFileSync(join(outputDir, 'glossary.json'), JSON.stringify(glossary));

// --- Daily Challenges ---
const challenges = buildReference('daily-challenges', 'Challenges');
writeFileSync(join(outputDir, 'challenges.json'), JSON.stringify(challenges));

// --- Cheatsheets ---
const cheatsheets = buildReference('cheatsheets', 'Cheatsheets');
writeFileSync(join(outputDir, 'cheatsheets.json'), JSON.stringify(cheatsheets));

// --- Mini Projects ---
const miniProjects = buildReference('mini-projects', 'Mini Projects');
writeFileSync(join(outputDir, 'mini-projects.json'), JSON.stringify(miniProjects));

const totalItems = glossary.items.length + challenges.items.length + cheatsheets.items.length + miniProjects.items.length;
console.log(`✅ References generated: ${totalItems} total items → ${outputDir}/`);
