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

export async function GET({ params, platform, locals }: { params: any; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new TutorRepository(db, tenantId);

		const enrollment = await repo.getEnrollment(params.id);
		if (!enrollment) throw error(404, 'Enrollment not found');
		return json({ success: true, data: enrollment });
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
		const repo = new TutorRepository(db, tenantId);
		const body = await request.json();

		const existing = await repo.getEnrollment(params.id);
		if (!existing) throw error(404, 'Enrollment not found');

		let package_id = body.package_id ?? existing.package_id ?? undefined;
		let sessions = body.remaining_sessions ?? existing.remaining_sessions ?? undefined;

		if (body.package_id && body.package_id !== existing.package_id) {
			const pkg = await repo.getPackage(body.package_id);
			if (!pkg) throw error(404, 'Package not found');
			package_id = pkg.id;
			sessions = pkg.duration_sessions ?? existing.remaining_sessions ?? undefined;
		}

		await repo.updateEnrollment(params.id, {
			package_id,
			remaining_sessions: sessions,
			paid_amount: body.paid_amount ?? undefined,
			payment_status: body.payment_status || undefined
		});

		return json({ success: true, data: { id: params.id } });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
