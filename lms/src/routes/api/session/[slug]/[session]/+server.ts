import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { modules } from '$lib/stores/modules';
import { error } from '@sveltejs/kit';

const contentDir = join(process.cwd(), '..');

export function GET({ params }: { params: { slug: string; session: string } }) {
	const { slug, session } = params;

	const mod = modules.find((m) => m.slug === slug);
	if (!mod) {
		error(404, 'Modul tidak ditemukan');
	}

	const sessionPath = join(contentDir, mod.dirName, `${session}.md`);

	if (!existsSync(sessionPath)) {
		error(404, 'Sesi tidak ditemukan');
	}

	const content = readFileSync(sessionPath, 'utf-8');

	return new Response(JSON.stringify({
		content,
		session,
		module: mod.slug,
	}), {
		headers: { 'content-type': 'application/json' },
	});
}
