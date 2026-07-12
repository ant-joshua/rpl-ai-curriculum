import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const routesPath = join(__dirname, '..', '.svelte-kit', 'cloudflare', '_routes.json');

const routes = JSON.parse(readFileSync(routesPath, 'utf-8'));

// Replace per-file excludes with glob patterns (stays under 100 limit)
routes.exclude = [
	'/_app/*',
	'/build/*',
	'/content/*',
	'/pdfs/*',
	'/favicon.png',
	'/favicon.svg',
	'/manifest.json'
];

// Ensure include has /* so all routes go through function
if (!routes.include.includes('/*')) {
	routes.include.unshift('/*');
}

writeFileSync(routesPath, JSON.stringify(routes, null, '\t'));
console.log('Patched _routes.json — excludes:', routes.exclude.length, 'includes:', routes.include.length);
