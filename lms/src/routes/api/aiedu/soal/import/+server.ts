import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// POST /api/aiedu/soal/import — import generated soal doc into question bank
// Body: { document_id, course_offering_id }
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const body = await request.json();
		const { document_id, course_offering_id } = body;
		if (!document_id) return jsonResponse({ success: false, error: 'document_id required' }, 400);

		const db = getDB(platform);
		const doc = await db.prepare(
			"SELECT * FROM aiedu_documents WHERE id = ? AND doc_type = 'soal'"
		).bind(document_id).first<any>();
		if (!doc) return jsonResponse({ success: false, error: 'Document not found or not a soal doc' }, 404);

		// Parse markdown soal → extract questions
		const questions = parseSoalMarkdown(doc.content || '');
		if (questions.length === 0) return jsonResponse({ success: false, error: 'Tidak ada soal ditemukan di dokumen' }, 400);

		// Batch insert
		const stmts: any[] = [];

		for (const q of questions) {
			stmts.push(
				db.prepare(
					`INSERT INTO question_bank (id, course_offering_id, type, question, options, difficulty, tags, explanation, points, status, source_doc_id, imported_by, created_at, updated_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, datetime('now'), datetime('now'))`
				).bind(
					crypto.randomUUID(),
					course_offering_id || null,
					q.type,
					q.question,
					q.options ? JSON.stringify(q.options) : null,
					q.difficulty || 'medium',
					q.tags || '',
					q.explanation || null,
					q.points || 1,
					document_id,
					session.user.id
				)
			);
		}

		await db.batch(stmts);

		return jsonResponse({ success: true, data: { count: questions.length, document_id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

function parseSoalMarkdown(content: string): {
	type: string; question: string; options: string[] | null; difficulty: string; explanation: string | null; points: number; tags: string;
}[] {
	const questions: ReturnType<typeof parseSoalMarkdown>[0][] = [];
	// Split by numbered questions: 1. / 2. / etc.
	const blocks = content.split(/\n\s*\n(?=\d+[\.\)]\s)/).filter(b => /^\d+[\.\)]\s/.test(b.trim()));

	for (const block of blocks) {
		const lines = block.trim().split('\n');
		const firstLine = lines[0].replace(/^\d+[\.\)]\s*/, '').trim();
		let question = firstLine;
		let options: string[] = [];
		let explanation = '';
		let difficulty = 'medium';
		let points = 1;

		for (let i = 1; i < lines.length; i++) {
			const line = lines[i].trim();
			// Options: a) / A. / - / *
			const optMatch = line.match(/^[a-dA-D][\.\)]\s+(.+)/);
			if (optMatch) { options.push(optMatch[1].trim()); continue; }
			if (/^[-*•]\s+/.test(line)) { options.push(line.replace(/^[-*•]\s+/, '').trim()); continue; }
			// Answer / explanation
			if (/jawaban\s*[:\-]/i.test(line) || /penjelasan\s*[:\-]/i.test(line)) {
				explanation += line.replace(/.*[:\-]\s*/i, '').trim() + ' ';
				continue;
			}
			if (/^\*\*jawaban\*\*/i.test(line)) {
				explanation += line.replace(/\*\*jawaban\*\*\s*[:\-]?\s*/i, '').trim() + ' ';
				continue;
			}
		}

		const type = options.length >= 2 ? 'multiple_choice' : 'essay';
		const tags = (firstLine.match(/#(\w+)/) || []).join(',');

		questions.push({ type, question, options: options.length ? options : null, difficulty, explanation: explanation.trim() || null, points, tags });
	}

	// If no numbered blocks found, try simpler pattern
	if (questions.length === 0) {
		const lines = content.split('\n').filter(l => l.trim());
		let currentQ: typeof questions[0] | null = null;
		for (const line of lines) {
			const qMatch = line.match(/^\d+[\.\)]\s+(.+)/);
			if (qMatch) {
				if (currentQ) questions.push(currentQ);
				currentQ = { type: 'essay', question: qMatch[1].trim(), options: null, difficulty: 'medium', explanation: null, points: 1, tags: '' };
			} else if (currentQ) {
				const optMatch = line.match(/^[a-dA-D][\.\)]\s+(.+)/);
				if (optMatch) {
					currentQ.options = currentQ.options || [];
					currentQ.options.push(optMatch[1].trim());
					if (currentQ.options.length >= 2) currentQ.type = 'multiple_choice';
				}
			}
		}
		if (currentQ) questions.push(currentQ);
	}

	return questions;
}
