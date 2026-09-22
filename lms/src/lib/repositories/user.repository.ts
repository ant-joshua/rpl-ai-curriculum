import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

export interface UserProfileUpdate {
	displayName?: string;
	avatarUrl?: string;
	bio?: string;
	headline?: string;
	website?: string;
	socialLinks?: string;
}

export class UserRepository {
	private db: D1Database;

	constructor(platformOrDb: any) {
		this.db = platformOrDb?.prepare ? platformOrDb : getDB(platformOrDb);
	}

	async findById(id: string) {
		return await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<any>();
	}

	async findByUsernameOrEmail(identifier: string) {
		return await this.db
			.prepare('SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1')
			.bind(identifier, identifier)
			.first<any>();
	}

	async getProfile(id: string) {
		return await this.db.prepare(
			`SELECT u.id, u.display_name, u.avatar_url, u.role, u.created_at,
			        ou.email, ou.name AS oauth_name
			 FROM users u
			 LEFT JOIN oauth_users ou ON ou.id = u.id
			 WHERE u.id = ?`
		).bind(id).first<any>();
	}

	async updateProfile(id: string, updates: UserProfileUpdate) {
		const sets: string[] = [];
		const vals: any[] = [];

		if (updates.displayName !== undefined) {
			sets.push('display_name = ?');
			vals.push(String(updates.displayName));
		}
		if (updates.avatarUrl !== undefined) {
			sets.push('avatar_url = ?');
			vals.push(String(updates.avatarUrl));
		}
		if (updates.bio !== undefined) {
			sets.push('bio = ?');
			vals.push(String(updates.bio));
		}
		if (updates.headline !== undefined) {
			sets.push('headline = ?');
			vals.push(String(updates.headline));
		}
		if (updates.website !== undefined) {
			sets.push('website = ?');
			vals.push(String(updates.website));
		}
		if (updates.socialLinks !== undefined) {
			sets.push('social_links = ?');
			vals.push(updates.socialLinks);
		}

		if (sets.length === 0) return this.getProfile(id);

		sets.push('updated_at = datetime(?)');
		vals.push(new Date().toISOString());
		vals.push(id);

		await this.db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
		return this.getProfile(id);
	}
}
