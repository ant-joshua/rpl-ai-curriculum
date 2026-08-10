import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { BimbelRepository } from '$lib/repositories/bimbel.repository';

const ALLOWED_ROLES = ['superadmin', 'admin', 'instructor'];

function checkAuth(locals: any) {
	const user = locals.user;
	if (!user || !ALLOWED_ROLES.includes(user.role)) {
		throw error(403, 'Forbidden — admin/instructor role required');
	}
	return user;
}

export async function GET({ params, platform, locals }: { params: any; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new BimbelRepository(db, tenantId);

		const results = await repo.getAnalysis(params.id);
		return json({ success: true, data: (results || []).map((r: any) => ({
			question_id: r.question_id,
			correct_count: r.correct_count,
			wrong_count: r.wrong_count,
			skip_count: r.skip_count,
			difficulty_index: r.difficulty_index,
			discrimination_index: r.discrimination_index
		})) });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ params, request, platform, locals }: { params: any; request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new BimbelRepository(db, tenantId);
		const body = await request.json();

		const tryout = await repo.getBatch(params.id);
		if (!tryout) throw error(404, 'Tryout not found');

		if (!Array.isArray(body.records)) {
			throw error(400, 'records array required');
		}

		await repo.upsertAnalysis(body.records.map((r: any) => ({
			tryout_batch_id: params.id,
			question_id: r.question_id,
			correct_count: r.correct_count,
			wrong_count: r.wrong_count,
			skip_count: r.skip_count,
			difficulty_index: r.difficulty_index,
			discrimination_index: r.discrimination_index
		})));

		return json({ success: true, data: null });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
