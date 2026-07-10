import { modules } from '$lib/stores/modules';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const contentDir = join(process.cwd(), '..');

function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

export function GET() {
	const moduleData = modules.map((mod) => {
		const readmePath = join(contentDir, mod.dirName, 'README.md');
		let wordCount = 0;
		let sessionCounts: Record<string, number> = {};

		if (existsSync(readmePath)) {
			const content = readFileSync(readmePath, 'utf-8');
			wordCount = countWords(content);
		}

		for (const session of mod.sessions) {
			const sessionPath = join(contentDir, mod.dirName, `${session.id}.md`);
			if (existsSync(sessionPath)) {
				const content = readFileSync(sessionPath, 'utf-8');
				sessionCounts[session.id] = countWords(content);
			} else {
				sessionCounts[session.id] = 0;
			}
		}

		return {
			...mod,
			wordCount,
			sessionCounts,
		};
	});

	return new Response(JSON.stringify(moduleData), {
		headers: { 'content-type': 'application/json' },
	});
}
