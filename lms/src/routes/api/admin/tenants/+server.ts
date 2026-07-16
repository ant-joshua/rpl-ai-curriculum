import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';

export async function GET({ platform, locals }: { platform: App.Platform; locals: any }) {
	const db = getDB(platform);
	const tenants = await db.prepare('SELECT * FROM tenants ORDER BY created_at DESC').all<any>();
	return json({ tenants: tenants.results });
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	const db = getDB(platform);
	const body = await request.json();
	const { name, slug, type, email } = body;

	if (!name || !slug || !type) {
		throw error(400, 'Nama, slug, dan tipe wajib diisi');
	}

	// Slug validation
	if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
		throw error(400, 'Slug hanya boleh huruf kecil, angka, dan strip');
	}

	// Check duplicate slug
	const existing = await db.prepare('SELECT id FROM tenants WHERE slug = ?').bind(slug).first();
	if (existing) {
		throw error(409, 'Slug sudah digunakan');
	}

	const user = locals?.user || null;
	const id = crypto.randomUUID();
	await db.prepare(`
		INSERT INTO tenants (id, name, slug, type, config, owner_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, '{}', ?, datetime('now'), datetime('now'))
	`).bind(id, name, slug, type, user?.id || null).run();

	const tenant = await db.prepare('SELECT * FROM tenants WHERE id = ?').bind(id).first<any>();

	return json({ tenant, success: true }, { status: 201 });
}
