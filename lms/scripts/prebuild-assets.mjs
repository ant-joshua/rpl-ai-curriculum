// Prebuild: generate module banner SVGs + index.json from modules.ts
// Parses modules.ts as text (no TS import needed), generates SVG banners per module.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve(import.meta.dirname, '..');
const tsPath = join(root, 'src/lib/stores/modules.ts');
const thumbDir = join(root, 'static/assets/thumbnails');
const outputDir = join(root, 'static/assets');

mkdirSync(thumbDir, { recursive: true });

const src = readFileSync(tsPath, 'utf-8');

// Extract the modules array block — between 'export const modules: Module[] = [' and the last '];'
const marker = 'export const modules: Module[] = [';
const startIdx = src.indexOf(marker);
if (startIdx === -1) throw new Error('Could not find modules array in modules.ts');
const arrStart = startIdx + marker.length;

// Find the matching closing bracket
let depth = 0, endIdx = arrStart;
for (let i = arrStart; i < src.length; i++) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') {
    if (depth === 0) { endIdx = i + 1; break; }
    depth--;
  }
}

let arrText = src.slice(arrStart, endIdx).trim();

// Strip TypeScript artifacts so we can eval as plain JS
// Remove trailing commas before ] (TS allows them, old JS doesn't)
arrText = arrText.replace(/,(\s*[}\]])/g, '$1');

// Replace s('title', 'id') with {title:'...', id:'...'} objects
arrText = arrText.replace(/s\('([^']*)',\s*'([^']*)'\)/g, (_, title, id) => {
  // Escape single quotes inside the strings
  const safeTitle = title.replace(/'/g, "\\'");
  const safeId = id.replace(/'/g, "\\'");
  return `{id:'${safeId}',title:'${safeTitle}'}`;
});

// Wrap in array brackets since we stripped them
arrText = '[' + arrText + ']';

let modules;
try {
  modules = new Function(`return ${arrText}`)();
} catch (e) {
  // If eval fails, fall back to regex-based extraction
  console.warn('⚠️  JS eval failed, falling back to regex extraction:', e.message);

  // Regex-based extraction for each module block
  const moduleBlocks = src.match(/\{\s*\n\s*index:\s*(\d+),[\s\S]*?\n\s*\},?\n/g) || [];
  modules = moduleBlocks.map(block => {
    const index = parseInt(block.match(/index:\s*(\d+)/)?.[1] || '0', 10);
    const slug = block.match(/slug:\s*'([^']*)'/)?.[1] || '';
    const dirName = block.match(/dirName:\s*'([^']*)'/)?.[1] || '';
    const titleMatch = block.match(/title:\s*'([^']*)'/);
    const title = titleMatch ? titleMatch[1].replace(/\\'/g, "'") : '';
    const descMatch = block.match(/description:\s*'([^']*)'/);
    const description = descMatch ? descMatch[1].replace(/\\'/g, "'") : '';
    const level = block.match(/level:\s*'([^']*)'/)?.[1] || 'Beginner';

    // Extract sessions
    const sessionMatches = block.match(/s\('([^']*)',\s*'([^']*)'\)/g) || [];
    const sessions = sessionMatches.map(s => {
      const m = s.match(/s\('([^']*)',\s*'([^']*)'\)/);
      return m ? { id: m[2], title: m[1] } : { id: '', title: '' };
    });

    return { index, slug, dirName, title, description, level, sessions };
  });
}

console.log(`✅ Parsed ${modules.length} modules from modules.ts`);

// ── Gradient color maps ──
const gradients = {
  Beginner:      { start: '#059669', end: '#10b981' },
  Intermediate:  { start: '#3b82f6', end: '#6366f1' },
  Advanced:      { start: '#7c3aed', end: '#a855f7' },
};

function generateSvg(mod, displayIndex) {
  const g = gradients[mod.level] || gradients.Beginner;
  const count = mod.sessions ? mod.sessions.length : 0;
  const title = (mod.title || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${g.start};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${g.end};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)" rx="16"/>
  <text x="80" y="180" font-family="Inter, sans-serif" font-size="160" font-weight="900" fill="rgba(255,255,255,0.06)">${displayIndex}</text>
  <text x="80" y="400" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#fff">${title}</text>
  <text x="80" y="480" font-family="Inter, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)">${count} sesi · ${mod.level}</text>
  <rect x="80" y="520" width="160" height="40" rx="20" fill="rgba(255,255,255,0.15)"/>
  <text x="160" y="548" font-family="Inter, sans-serif" font-size="16" font-weight="600" fill="rgba(255,255,255,0.9)" text-anchor="middle">${mod.level}</text>
</svg>`;
}

const index = {};
let generated = 0;
for (const mod of modules) {
  if (!mod.slug) {
    console.warn(`  ⚠️  Skipping module with no slug`);
    continue;
  }
  const displayIndex = (typeof mod.index === 'number') ? mod.index + 1 : generated + 1;
  const svg = generateSvg(mod, displayIndex);
  writeFileSync(join(thumbDir, `${mod.slug}.svg`), svg);
  index[mod.slug] = {
    thumbnail: `/assets/thumbnails/${mod.slug}.svg`,
    level: mod.level || 'Beginner',
    title: mod.title || '',
  };
  console.log(`  ${mod.slug}.svg`);
  generated++;
}

writeFileSync(join(outputDir, 'index.json'), JSON.stringify(index, null, 2));
console.log(`\n✅ Generated ${generated} SVGs + index.json → ${outputDir}/`);
