import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { modules } from '$lib/stores/modules';
import { error } from '@sveltejs/kit';

const contentDir = join(process.cwd(), '..');

function countWords(text: string): number {
	const cleaned = text.replace(/^---[\s\S]*?---\n*/, '').trim();
	if (!cleaned) return 0;
	return cleaned.split(/\s+/).length;
}

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

	// Compute word counts for each session
	const sessionWordCounts: Record<string, number> = {};
	for (const session of mod.sessions) {
		const sessionPath = join(contentDir, mod.dirName, `${session.id}.md`);
		if (existsSync(sessionPath)) {
			const sessionContent = readFileSync(sessionPath, 'utf-8');
			sessionWordCounts[session.id] = countWords(sessionContent);
		} else {
			sessionWordCounts[session.id] = 0;
		}
	}

	const totalWords = countWords(content);

	return new Response(JSON.stringify({
		content,
		totalWords,
		module: mod,
		sessionWordCounts,
	}), {
		headers: { 'content-type': 'application/json' },
	});
}
