// Prebuild: scan module dirs, read all .md content, write as static JSON in static/content/
// Modules fetch these directly as static assets — no Worker, no fs at runtime

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const repoRoot = resolve(process.cwd(), '..');
const outputDir = resolve(process.cwd(), 'static', 'content');

// Module dirs: 00-* to 56-*
const moduleDirs = readdirSync(repoRoot)
  .filter(d => /^\d{2}-/.test(d) && statSync(join(repoRoot, d)).isDirectory());

// Build manifest for frontend navigation
const manifest = [];
let totalFiles = 0;
let totalBytes = 0;

mkdirSync(outputDir, { recursive: true });

for (const dir of moduleDirs) {
  const dirPath = join(repoRoot, dir);
  const files = readdirSync(dirPath).filter(f => f.endsWith('.md'));
  
  const content = {};
  for (const file of files) {
    const filePath = join(dirPath, file);
    const key = file.replace('.md', '');
    content[key] = readFileSync(filePath, 'utf-8');
    totalFiles++;
    totalBytes += content[key].length;
  }
  
  // Write individual module JSON
  const jsonPath = join(outputDir, `${dir}.json`);
  writeFileSync(jsonPath, JSON.stringify(content));
  
  manifest.push({
    dir,
    files: Object.keys(content),
    size_bytes: Buffer.byteLength(JSON.stringify(content)),
  });
}

// Write manifest
writeFileSync(join(outputDir, 'manifest.json'), JSON.stringify(manifest));

const mb = (totalBytes / 1024 / 1024).toFixed(1);
console.log(`✅ Content generated: ${totalFiles} files, ${mb} MB → ${outputDir}/`);
console.log(`   ${manifest.length} module dirs, manifest at static/content/manifest.json`);
