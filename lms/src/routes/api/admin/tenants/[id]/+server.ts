import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }) {
	const db = getDB(platform);
	const tenant = await db.prepare('SELECT * FROM tenants WHERE id = ?').bind(params.id).first<any>();
	if (!tenant) throw error(404, 'Tenant tidak ditemukan');
	return json(tenant);
}

export async function PUT({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }) {
	const db = getDB(platform);
	const body = await request.json();

	if (body.config) {
		try { JSON.parse(body.config); } catch { throw error(400, 'Config harus valid JSON'); }
	}

	await db.prepare(`
		UPDATE tenants SET
			name = COALESCE(?, name),
			config = COALESCE(?, config),
			features = COALESCE(?, features),
			logo_url = COALESCE(?, logo_url),
			primary_color = COALESCE(?, primary_color),
			updated_at = datetime('now')
		WHERE id = ?
	`).bind(
		body.name || null,
		body.config || null,
		body.features || null,
		body.logo_url || null,
		body.primary_color || null,
		params.id
	).run();

	const tenant = await db.prepare('SELECT * FROM tenants WHERE id = ?').bind(params.id).first<any>();
	return json(tenant);
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }) {
	const db = getDB(platform);
	// Don't delete default tenant
	if (params.id === 'default') throw error(400, 'Tidak bisa menghapus tenant default');
	
	const tenant = await db.prepare('SELECT * FROM tenants WHERE id = ?').bind(params.id).first();
	if (!tenant) throw error(404, 'Tenant tidak ditemukan');

	await db.prepare('DELETE FROM tenant_users WHERE tenant_id = ?').bind(params.id).run();
	await db.prepare('DELETE FROM tenants WHERE id = ?').bind(params.id).run();
	return json({ success: true });
}
