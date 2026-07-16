import { getDB, jsonResponse } from '$lib/server/d1';

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();

		const { subject_id, kds } = body;

		if (!subject_id) {
			return jsonResponse({ success: false, error: 'subject_id wajib diisi' }, 400);
		}

		if (!Array.isArray(kds) || kds.length === 0) {
			return jsonResponse({ success: false, error: 'kds harus berupa array dengan minimal 1 item' }, 400);
		}

		// Verify subject exists and belongs to tenant
		const subject = await db.prepare(
			'SELECT id FROM subjects WHERE id = ? AND tenant_id = ?'
		).bind(subject_id, tenantId).first<any>();

		if (!subject) {
			return jsonResponse({ success: false, error: 'Mata pelajaran tidak ditemukan' }, 404);
		}

		const now = new Date().toISOString();
		const created: any[] = [];
		const errors: { index: number; reason: string }[] = [];

		const insertStmt = db.prepare(
			`INSERT INTO kompetensi_dasar (id, tenant_id, subject_id, code, type, competence_type, description, grade_level_id, semester, topics, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		);

		const batch: ReturnType<typeof db.prepare>[] = [];

		for (let i = 0; i < kds.length; i++) {
			const kd = kds[i];
			try {
				if (!kd.code || !kd.code.trim()) {
					errors.push({ index: i, reason: 'code wajib diisi' });
					continue;
				}
				if (!kd.competence_type || !kd.competence_type.trim()) {
					errors.push({ index: i, reason: 'competence_type wajib diisi (pengetahuan/keterampilan)' });
					continue;
				}
				if (!kd.description || !kd.description.trim()) {
					errors.push({ index: i, reason: 'description wajib diisi' });
					continue;
				}

				const id = crypto.randomUUID();
				batch.push(
					insertStmt.bind(
						id,
						tenantId,
						subject_id,
						kd.code.trim(),
						kd.type || 'umum',
						kd.competence_type.trim(),
						kd.description.trim(),
						kd.grade_level_id || null,
						kd.semester != null ? Number(kd.semester) : null,
						kd.topics || null,
						now
					)
				);
				created.push({ index: i, id, code: kd.code });
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : 'Unknown error';
				errors.push({ index: i, reason: msg });
			}
		}

		if (batch.length > 0) {
			await db.batch(batch);
		}

		return jsonResponse({
			success: true,
			data: {
				total: kds.length,
				created: created.length,
				errors: errors.length > 0 ? errors : undefined
			}
		}, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
