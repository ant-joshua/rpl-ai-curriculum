import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

export class TenantRepository {
	private db: D1Database;

	constructor(platform: any) {
		this.db = getDB(platform);
	}

	async findAll() {
		const { results } = await this.db.prepare('SELECT * FROM tenants ORDER BY name').all();
		return results;
	}

	async findById(id: string) {
		return await this.db.prepare('SELECT * FROM tenants WHERE id = ?').bind(id).first();
	}

	async findBySlug(slug: string) {
		return await this.db.prepare('SELECT * FROM tenants WHERE slug = ?').bind(slug).first();
	}

	async create(data: { name: string; slug: string; type?: string }) {
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO tenants (id, name, slug, type) VALUES (?,?,?,?)'
		).bind(id, data.name, data.slug, data.type || 'school').run();
		return this.findById(id);
	}

	async update(id: string, data: any) {
		const sets: string[] = [];
		const vals: any[] = [];
		for (const [k, v] of Object.entries(data)) {
			if (v !== undefined) { sets.push(`${k} = ?`); vals.push(v); }
		}
		if (sets.length === 0) return;
		vals.push(id);
		await this.db.prepare(`UPDATE tenants SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
		return this.findById(id);
	}

	async delete(id: string) {
		await this.db.prepare('DELETE FROM tenants WHERE id = ?').bind(id).run();
	}
}
