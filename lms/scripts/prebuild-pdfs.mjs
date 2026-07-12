// Prebuild: copy PDF exports from ../pdf-export/ to static/pdfs/ + generate index
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';

const pdfSourceDir = resolve(process.cwd(), '..', 'pdf-export');
const outputDir = resolve(process.cwd(), 'static', 'pdfs');

mkdirSync(outputDir, { recursive: true });

const files = readdirSync(pdfSourceDir)
  .filter(f => f.endsWith('.pdf'))
  .sort();

const pdfFiles = [];

for (const filename of files) {
  const src = join(pdfSourceDir, filename);
  const dest = join(outputDir, filename);
  copyFileSync(src, dest);

  // dirName is filename without extension — matches module.dirName (e.g. "00-fundamentals")
  const dirName = filename.replace(/\.pdf$/, '');

  // Derive display title from filename
  const title = dirName
    .replace(/^\d{2}-/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  pdfFiles.push({ filename, dirName, title });
}

// Write index JSON — keyed by dirName so module page can look up by mod.dirName
const indexData = { files: pdfFiles };
writeFileSync(join(outputDir, 'index.json'), JSON.stringify(indexData, null, 2));

console.log(`✅ PDFs copied: ${pdfFiles.length} files → ${outputDir}/`);
console.log(`   Index written: ${outputDir}/index.json`);
