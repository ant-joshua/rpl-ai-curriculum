import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { modules } from '$lib/stores/modules';
import { error } from '@sveltejs/kit';

const contentDir = join(process.cwd(), '..');

export function GET({ params }: { params: { slug: string } }) {
	const { slug } = params;

	const mod = modules.find((m) => m.slug === slug);
	if (!mod) {
		error(404, 'Modul tidak ditemukan');
	}

	const readmePath = join(contentDir, mod.dirName, 'README.md');

	if (!existsSync(readmePath)) {
		error(404, 'README.md tidak ditemukan');
	}

	const content = readFileSync(readmePath, 'utf-8');

	return new Response(JSON.stringify({
		content,
		module: mod,
	}), {
		headers: { 'content-type': 'application/json' },
	});
}
