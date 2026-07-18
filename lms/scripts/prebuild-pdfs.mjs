// Prebuild: generate PDF index.json only (PDFs live on R2, served via /api/pdfs/[filename])
import { writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const pdfSourceDir = resolve(process.cwd(), '..', 'pdf-export');
const outputDir = resolve(process.cwd(), 'static', 'pdfs');

mkdirSync(outputDir, { recursive: true });

let files = [];
try {
	files = readdirSync(pdfSourceDir)
		.filter(f => f.endsWith('.pdf'))
		.sort();
} catch {
	// pdf-export dir may not exist — that's fine
}

const pdfFiles = [];

for (const filename of files) {
	const dirName = filename.replace(/\.pdf$/, '');
	const title = dirName
		.replace(/^\d{2}-/, '')
		.replace(/[-_]/g, ' ')
		.replace(/\b\w/g, c => c.toUpperCase());

	pdfFiles.push({ filename, dirName, title });
}

// Write index JSON only — PDFs served from R2 via /api/pdfs/[filename]
const indexData = { files: pdfFiles };
writeFileSync(join(outputDir, 'index.json'), JSON.stringify(indexData, null, 2));

console.log(`✅ PDF index: ${pdfFiles.length} files → ${outputDir}/index.json`);
console.log(`   PDFs served from R2 (not static)`);
