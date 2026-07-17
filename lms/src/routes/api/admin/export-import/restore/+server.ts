import { jsonResponse, getDB } from '$lib/server/d1';

async function decompressGzip(data: Uint8Array): Promise<Uint8Array> {
	const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
	const ab = await new Response(stream).arrayBuffer();
	return new Uint8Array(ab);
}

/** POST /api/admin/export-import/restore — restore tenant data from uploaded backup */
export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		// Accept either multipart file upload or raw JSON body
		let backup: any;
		const contentType = request.headers.get('content-type') || '';

		if (contentType.includes('multipart/form-data')) {
			const form = await request.formData();
			const file = form.get('file');
			if (!file || typeof file === 'string') {
				return jsonResponse({ success: false, error: 'File backup diperlukan' }, 400);
			}
			const buf = await (file as File).arrayBuffer();
			let raw = new Uint8Array(buf);

			// Auto-detect gzip (magic bytes: 1f 8b)
			if (raw.length > 2 && raw[0] === 0x1f && raw[1] === 0x8b) {
				raw = await decompressGzip(raw);
			}

			const text = new TextDecoder().decode(raw);
			backup = JSON.parse(text);
		} else {
			// Raw JSON body (optionally gzipped)
			const buf = await request.arrayBuffer();
			let raw = new Uint8Array(buf);

			if (raw.length > 2 && raw[0] === 0x1f && raw[1] === 0x8b) {
				raw = await decompressGzip(raw);
			}

			const text = new TextDecoder().decode(raw);
			backup = JSON.parse(text);
		}

		if (!backup.tables || typeof backup.tables !== 'object') {
			return jsonResponse({ success: false, error: 'Format backup tidak valid — properti "tables" diperlukan' }, 400);
		}

		// Restore — insert rows per table using INSERT OR IGNORE
		const results: Record<string, { attempted: number; inserted: number; errors: string[] }> = {};
		const totalTables = Object.keys(backup.tables).length;
		let totalAttempted = 0;
		let totalInserted = 0;

		// Order tables for dependency-safe insertion (parent tables first)
		const priorityOrder = [
			'users', 'courses', 'content_blocks', 'academic_periods', 'badges',
			'faculties', 'study_programs', 'school_levels', 'grade_levels', 'majors', 'classes',
			'course_offerings', 'lessons', 'lesson_content_blocks',
			'question_bank', 'assessments', 'assignments', 'assessment_questions',
			'enrollments', 'assessment_submissions', 'assignment_submissions', 'gradebook',
			'attendance_sessions', 'attendance_records',
			'payments', 'invoices',
			'notifications', 'notification_templates', 'notification_queue',
		];

		const sortedTables = [
			...priorityOrder.filter((t) => backup.tables[t]),
			...Object.keys(backup.tables).filter((t) => !priorityOrder.includes(t)),
		];

		for (const tableName of sortedTables) {
			const rows = backup.tables[tableName];
			if (!Array.isArray(rows) || rows.length === 0) continue;

			const tableResult = { attempted: 0, inserted: 0, errors: [] as string[] };

			for (const row of rows) {
				tableResult.attempted++;
				totalAttempted++;

				const columns = Object.keys(row);
				const placeholders = columns.map(() => '?').join(', ');
				const values = columns.map((c) => row[c]);
				const colList = columns.map((c) => `"${c}"`).join(', ');

				try {
					const stmt = db
						.prepare(`INSERT OR IGNORE INTO "${tableName}" (${colList}) VALUES (${placeholders})`)
						.bind(...values);
					const res = await stmt.run();
					if (res.meta && typeof res.meta.changes === 'number') {
						tableResult.inserted += res.meta.changes;
						totalInserted += res.meta.changes;
					}
				} catch (e: unknown) {
					const msg = e instanceof Error ? e.message : String(e);
					tableResult.errors.push(msg);
				}
			}

			results[tableName] = tableResult;
		}

		return jsonResponse({
			success: true,
			data: {
				tenantId,
				totalTables,
				totalAttempted,
				totalInserted,
				details: results,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
