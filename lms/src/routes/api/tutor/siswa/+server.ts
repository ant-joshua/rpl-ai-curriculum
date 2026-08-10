import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { TutorRepository } from '$lib/repositories/tutor.repository';

const ALLOWED_ROLES = ['superadmin', 'admin', 'instructor'];

function checkAuth(locals: any) {
	const user = locals.user;
	if (!user || !ALLOWED_ROLES.includes(user.role)) {
		throw error(403, 'Forbidden — admin/instructor role required');
	}
	return user;
}

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new TutorRepository(db, tenantId);

		const batchId = url.searchParams.get('batch_id') || undefined;
		const status = url.searchParams.get('status') || undefined;

		const results = await repo.getEnrollments({ batchId, status });
		return json({ success: true, data: results || [] });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new TutorRepository(db, tenantId);
		const body = await request.json();

		if (!body.user_id) {
			throw error(400, 'user_id required');
		}

		const created = await repo.createEnrollment({
			user_id: body.user_id,
			package_id: body.package_id || undefined,
			batch_id: body.batch_id || undefined,
			enrollment_date: body.enrollment_date || undefined,
			paid_amount: body.paid_amount ?? undefined,
			payment_status: body.payment_status || undefined,
			remaining_sessions: body.remaining_sessions ?? undefined,
			status: body.status || 'active'
		});

		return json({ success: true, data: created }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
