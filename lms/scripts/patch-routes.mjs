import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const routesPath = join(__dirname, '..', '.svelte-kit', 'cloudflare', '_routes.json');

if (!existsSync(routesPath)) {
	console.log('patch-routes: _routes.json not found, skipping (adapter v3 handles this)');
	process.exit(0);
}

const routes = JSON.parse(readFileSync(routesPath, 'utf-8'));

// Replace per-file excludes with glob patterns (stays under 100 limit)
routes.exclude = [
	'/_app/*',
	'/assets/*',
	'/build/*',
	'/content/*',
	'/icons/*',
	'/pdfs/*',
	'/api/openapi.json',
	'/favicon.png',
	'/favicon.svg',
	'/manifest.json',
	'/robots.txt',
	'/sw.js'
];

// Ensure include has /* so all routes go through function
if (!routes.include.includes('/*')) {
	routes.include.unshift('/*');
}

writeFileSync(routesPath, JSON.stringify(routes, null, '\t'));
console.log('Patched _routes.json — excludes:', routes.exclude.length, 'includes:', routes.include.length);
