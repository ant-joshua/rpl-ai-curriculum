import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { RaporRepository } from '$lib/repositories/rapor.repository';

export async function GET({ params, platform, locals }: { params: { raporId: string }; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['superadmin', 'admin', 'instructor'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const repo = new RaporRepository(db, tenantId);
		const rapor = await repo.getRapor(params.raporId);

		if (!rapor) {
			throw error(404, 'Rapor tidak ditemukan');
		}

		return json({ success: true, data: rapor });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PATCH({ request, params, platform, locals }: { request: Request; params: { raporId: string }; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['superadmin', 'admin', 'instructor'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const body = await request.json();
		const { action, homeroom_notes, actor_id } = body;

		if (!action) {
			throw error(400, 'action wajib diisi (finalize|unlock|notes)');
		}

		const actorId = actor_id || user.id;
		const repo = new RaporRepository(db, tenantId);

		let rapor;

		switch (action) {
			case 'finalize':
				rapor = await repo.finalizeRapor(params.raporId, actorId, homeroom_notes);
				break;
			case 'unlock':
				rapor = await repo.unlockRapor(params.raporId, actorId);
				break;
			case 'notes':
				if (!homeroom_notes) throw error(400, 'homeroom_notes wajib diisi untuk action notes');
				rapor = await repo.updateNotes(params.raporId, homeroom_notes, actorId);
				break;
			default:
				throw error(400, 'action tidak valid. Gunakan: finalize, unlock, atau notes');
		}

		if (!rapor) {
			throw error(404, 'Rapor tidak ditemukan');
		}

		return json({ success: true, data: rapor });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ params, platform, locals }: { params: { raporId: string }; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['superadmin', 'admin', 'instructor'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const repo = new RaporRepository(db, tenantId);

		// Check existence first
		const existing = await repo.getRapor(params.raporId);
		if (!existing) {
			throw error(404, 'Rapor tidak ditemukan');
		}

		await repo.deleteRaporById(params.raporId);

		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}
