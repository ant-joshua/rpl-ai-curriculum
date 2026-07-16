import { json } from '@sveltejs/kit';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export async function GET() {
	try {
		const specPath = resolve('static/api/openapi.json');
		const spec = JSON.parse(readFileSync(specPath, 'utf-8'));
		return json(spec);
	} catch {
		return json({
			openapi: '3.0.3',
			info: { title: 'LMS API', version: '1.0.0', description: 'Run: npm run generate-api-docs' },
			paths: {},
		});
	}
}
