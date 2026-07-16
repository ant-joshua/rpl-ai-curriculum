import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';

export async function POST({ params, platform }: { params: { id: string, action: string }; platform: App.Platform }) {
	const db = getDB(platform);
	const tenant = await db.prepare('SELECT * FROM tenants WHERE id = ?').bind(params.id).first<any>();
	if (!tenant) throw error(404, 'Tenant tidak ditemukan');

	if (params.action === 'deactivate') {
		if (tenant.slug === 'default') throw error(400, 'Tidak bisa menonaktifkan tenant default');
		await db.prepare('UPDATE tenants SET is_active = 0, updated_at = datetime(\'now\') WHERE id = ?').bind(params.id).run();
	} else if (params.action === 'activate') {
		await db.prepare('UPDATE tenants SET is_active = 1, updated_at = datetime(\'now\') WHERE id = ?').bind(params.id).run();
	} else {
		throw error(400, 'Aksi tidak valid');
	}

	return json({ success: true });
}
