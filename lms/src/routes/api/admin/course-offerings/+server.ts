import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const courseId = url.searchParams.get('course_id');

		const params: unknown[] = [];
		let where = 'WHERE 1=1';
		if (courseId) { where += ' AND course_id = ?'; params.push(courseId); }

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM course_offerings ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const rows = await db.prepare(`SELECT * FROM course_offerings ${where} ORDER BY created_at DESC`).bind(...params).all();
			return jsonResponse({ success: true, data: rows.results || [], total });
		}

		const sql = `SELECT * FROM course_offerings ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
		const rows = await db.prepare(sql).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: rows.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const body = await request.json();
		const { course_id, name, code } = body;
		if (!course_id || !name || !code) {
			return jsonResponse({ success: false, error: 'course_id, name, and code required' }, 400);
		}
		const db = getDB(platform);
		const offeringId = crypto.randomUUID();
		const now = new Date().toISOString();

		// Insert the offering
		await db.prepare(
			'INSERT INTO course_offerings (id, course_id, name, code, instructor_id, start_date, end_date, enrollment_start, enrollment_end, max_students, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
		).bind(
			offeringId, course_id, name, code,
			body.instructor_id || null,
			body.start_date || null,
			body.end_date || null,
			body.enrollment_start || null,
			body.enrollment_end || null,
			body.max_students ?? null,
			body.status || 'draft',
			now, now
		).run();

		// Clone template content_blocks from the course (if any)
		const templateBlocks = await db.prepare(
			'SELECT * FROM content_blocks WHERE course_id = ? ORDER BY order_index ASC'
		).bind(course_id).all();

		const blocks = templateBlocks.results as Record<string, unknown>[] | undefined;
		if (blocks && blocks.length > 0) {
			// Relax CHECK constraints during clone (source data already valid)
			await db.prepare('PRAGMA ignore_check_constraints = ON').run();

			// Step A: Insert all template blocks with parent_id=NULL.
			// Store old_id → new_id mapping in the source_id column.
			const insertStmt = db.prepare(
				`INSERT INTO content_blocks
					(id, course_offering_id, parent_id, source_id,
					 type, title, slug, subtitle,
					 body, body_html, meta,
					 order_index, visibility, duration_min,
					 is_optional, unlock_days, weight, due_date,
					 created_at, updated_at)
				 VALUES (?, ?, NULL, ?,
					 ?, ?, ?, ?,
					 ?, ?, ?,
					 ?, ?, ?,
					 ?, ?, ?, ?,
					 ?, ?)`
			);

			const insertBatch: ReturnType<typeof db.prepare>[] = [];

			for (const block of blocks) {
				const newId = crypto.randomUUID();

				insertBatch.push(
					insertStmt.bind(
						newId,
						offeringId,
						block.id,                    // source_id = original id
						block.type || 'text',
						block.title,
						block.slug || null,
						block.subtitle || null,
						block.body || null,
						block.body_html || null,
						block.meta || '{}',
						block.order_index ?? 0,
						block.visibility || 'draft',
						block.duration_min ?? 0,
						block.is_optional ?? 0,
						block.unlock_days ?? null,
						block.weight ?? 0,
						block.due_date ?? null,
						now,
						now
					)
				);
			}

			await db.batch(insertBatch);

			// Step B: Update parent_id using source_id mapping.
			// For each cloned block that had a parent, find the new parent id
			// via the block whose source_id matches the original parent_id.
			const updateStmt = db.prepare(
				`UPDATE content_blocks
				 SET parent_id = (
					 SELECT id FROM content_blocks
					 WHERE source_id = ? AND course_offering_id = ?
				 )
				 WHERE course_offering_id = ? AND source_id = ?`
			);

			const updateBatch: ReturnType<typeof db.prepare>[] = [];
			for (const block of blocks) {
				const origParentId = block.parent_id as string | null;
				if (origParentId) {
					updateBatch.push(
						updateStmt.bind(origParentId, offeringId, offeringId, block.id)
					);
				}
			}

			if (updateBatch.length > 0) {
				await db.batch(updateBatch);
			}
		}

		return jsonResponse({ success: true, data: { id: offeringId } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
