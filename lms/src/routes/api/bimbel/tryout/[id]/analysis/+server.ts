import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';

const ALLOWED_ROLES = ['superadmin', 'admin', 'instructor'];

function checkAuth(locals: any) {
	const user = locals.user;
	if (!user || !ALLOWED_ROLES.includes(user.role)) {
		throw error(403, 'Forbidden — admin/instructor role required');
	}
	return user;
}

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const { results } = await db.prepare(
			'SELECT * FROM tryout_analysis WHERE tryout_batch_id = ? ORDER BY question_id ASC'
		).bind(params.id).all<any>();

		return json({
			success: true,
			data: (results || []).map((r: any) => ({
				...r,
				difficulty_index: r.difficulty_index ?? null,
				discrimination_index: r.discrimination_index ?? null,
				total_attempts: (r.correct_count || 0) + (r.wrong_count || 0) + (r.skip_count || 0)
			}))
		});
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		// Verify tryout exists
		const tryout = await db.prepare(
			'SELECT id FROM tryout_batches WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!tryout) throw error(404, 'Tryout not found');

		const body = await request.json();
		const { records } = body;
		if (!records || !Array.isArray(records)) {
			throw error(400, 'records array required');
		}

		const stmts = [];
		for (const rec of records) {
			const { question_id, correct_count, wrong_count, skip_count, difficulty_index, discrimination_index } = rec;
			if (!question_id) continue;

			// Upsert per question
			const existing = await db.prepare(
				'SELECT id FROM tryout_analysis WHERE tryout_batch_id = ? AND question_id = ?'
			).bind(params.id, question_id).first<any>();

			if (existing) {
				stmts.push(
					db.prepare(
						`UPDATE tryout_analysis SET correct_count=?, wrong_count=?, skip_count=?, difficulty_index=?, discrimination_index=?
						 WHERE id=?`
					).bind(
						correct_count ?? 0, wrong_count ?? 0, skip_count ?? 0,
						difficulty_index ?? null, discrimination_index ?? null,
						existing.id
					)
				);
			} else {
				const id = crypto.randomUUID();
				stmts.push(
					db.prepare(
						`INSERT INTO tryout_analysis (id, tryout_batch_id, question_id, correct_count, wrong_count, skip_count, difficulty_index, discrimination_index)
						 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
					).bind(
						id, params.id, question_id,
						correct_count ?? 0, wrong_count ?? 0, skip_count ?? 0,
						difficulty_index ?? null, discrimination_index ?? null
					)
				);
			}
		}

		if (stmts.length > 0) {
			await db.batch(stmts);
		}

		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
