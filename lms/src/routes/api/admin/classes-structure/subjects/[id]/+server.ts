import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const subject = await db.prepare(
			'SELECT * FROM subjects WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();

		if (!subject) {
			return jsonResponse({ success: false, error: 'Mata pelajaran tidak ditemukan' }, 404);
		}

		// Fetch associated KD (kompetensi_dasar)
		const kdRows = await db.prepare(
			'SELECT * FROM kompetensi_dasar WHERE subject_id = ? AND tenant_id = ? ORDER BY code ASC'
		).bind(params.id, tenantId).all();

		return jsonResponse({
			success: true,
			data: {
				...subject,
				kompetensi_dasar: kdRows.results || []
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PATCH({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const existing = await db.prepare(
			'SELECT * FROM subjects WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();

		if (!existing) {
			return jsonResponse({ success: false, error: 'Mata pelajaran tidak ditemukan' }, 404);
		}

		const body = await request.json();
		const now = new Date().toISOString();

		const fields: string[] = [];
		const values: any[] = [];

		if (body.name !== undefined) {
			fields.push('name = ?');
			values.push(body.name.trim());
		}
		if (body.code !== undefined) {
			fields.push('code = ?');
			values.push(body.code?.trim() || null);
		}
		if (body.curriculum !== undefined) {
			fields.push('curriculum = ?');
			values.push(body.curriculum);
		}
		if (body.type !== undefined) {
			fields.push('type = ?');
			values.push(body.type);
		}
		if (body.major_id !== undefined) {
			fields.push('major_id = ?');
			values.push(body.major_id || null);
		}
		if (body.grade_level_id !== undefined) {
			fields.push('grade_level_id = ?');
			values.push(body.grade_level_id || null);
		}
		if (body.group_name !== undefined) {
			fields.push('group_name = ?');
			values.push(body.group_name?.trim() || null);
		}
		if (body.description !== undefined) {
			fields.push('description = ?');
			values.push(body.description?.trim() || null);
		}
		if (body.min_hours_per_week !== undefined) {
			fields.push('min_hours_per_week = ?');
			values.push(body.min_hours_per_week != null ? Number(body.min_hours_per_week) : null);
		}

		if (fields.length === 0) {
			return jsonResponse({ success: false, error: 'Tidak ada field yang diupdate' }, 400);
		}

		fields.push('updated_at = ?');
		values.push(now);

		values.push(params.id, tenantId);

		await db.prepare(
			`UPDATE subjects SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`
		).bind(...values).run();

		const updated = await db.prepare('SELECT * FROM subjects WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const existing = await db.prepare(
			'SELECT id FROM subjects WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();

		if (!existing) {
			return jsonResponse({ success: false, error: 'Mata pelajaran tidak ditemukan' }, 404);
		}

		// Check if subject is referenced in class_subjects
		const csRef = await db.prepare(
			'SELECT id FROM class_subjects WHERE subject_id = ? AND tenant_id = ? LIMIT 1'
		).bind(params.id, tenantId).first<any>();

		if (csRef) {
			return jsonResponse({
				success: false,
				error: 'Mata pelajaran masih digunakan di penugasan guru. Hapus penugasan terlebih dahulu.'
			}, 409);
		}

		// Delete associated KD first
		await db.prepare('DELETE FROM kompetensi_dasar WHERE subject_id = ? AND tenant_id = ?')
			.bind(params.id, tenantId).run();

		// Delete the subject
		await db.prepare('DELETE FROM subjects WHERE id = ? AND tenant_id = ?')
			.bind(params.id, tenantId).run();

		return jsonResponse({ success: true, data: { id: params.id } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
