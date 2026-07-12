// Prebuild: scan reference content dirs, read all .md content, write as static JSON in static/content/references/
// Also copy case studies and slides for rendering as individual pages
// These are fetched as static assets at runtime — no Worker, no fs access needed on CF Pages

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, cpSync, statSync } from 'fs';
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

// --- Copy Case Studies ---
const caseStudiesDir = join(repoRoot, 'case-studies');
const caseStudiesOutputDir = join(outputDir, 'case-studies');
if (existsSync(caseStudiesDir)) {
  mkdirSync(caseStudiesOutputDir, { recursive: true });
  const csFiles = readdirSync(caseStudiesDir).filter(f => f.endsWith('.md'));
  for (const file of csFiles) {
    cpSync(join(caseStudiesDir, file), join(caseStudiesOutputDir, file));
  }
  console.log(`  📋 Case studies: ${csFiles.length} files → ${caseStudiesOutputDir}/`);
}

// --- Copy & Combine Slides ---
const slidesDir = join(repoRoot, 'slides');
const slidesOutputDir = resolve(process.cwd(), 'static', 'content', 'slides');
if (existsSync(slidesDir)) {
  mkdirSync(slidesOutputDir, { recursive: true });
  let totalSlideFiles = 0;

  // Copy theme CSS
  const themeDir = join(slidesDir, 'themes');
  if (existsSync(themeDir)) {
    const themeFiles = readdirSync(themeDir).filter(f => f.endsWith('.css'));
    for (const file of themeFiles) {
      cpSync(join(themeDir, file), join(slidesOutputDir, file));
    }
  }

  // Each module subdir: combine all .md files into one slides/[slug].md with --- separators
  const slideDirs = readdirSync(slidesDir).filter(d => {
    const fullPath = join(slidesDir, d);
    return existsSync(fullPath) && statSync(fullPath).isDirectory() && d !== 'themes';
  });

  for (const dir of slideDirs) {
    const fullDirPath = join(slidesDir, dir);
    const slideFiles = readdirSync(fullDirPath)
      .filter(f => f.endsWith('.md'))
      .sort();

    if (slideFiles.length === 0) continue;

    // Combine all slides with --- separator
    const combined = slideFiles.map(file => {
      const content = readFileSync(join(fullDirPath, file), 'utf-8');
      // Remove frontmatter if present
      const clean = content.replace(/^---[\s\S]*?---\n*/, '').trim();
      return clean;
    }).join('\n\n---\n\n');

    writeFileSync(join(slidesOutputDir, `${dir}.md`), combined);
    totalSlideFiles += slideFiles.length;
    console.log(`  🖥️  Slides combined: ${dir} → ${dir}.md (${slideFiles.length} files)`);
  }

  console.log(`  🖥️  Total: ${totalSlideFiles} slide files → ${slidesOutputDir}/`);
}
