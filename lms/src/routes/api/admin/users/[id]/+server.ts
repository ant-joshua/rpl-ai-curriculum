import { getDB, jsonResponse } from '$lib/server/d1';
import bcrypt from 'bcryptjs';

const VALID_ROLES = ['superadmin', 'admin', 'instructor', 'ta', 'student', 'parent'];

export async function PUT({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM users WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'User not found' }, 404);

		const body = await request.json();
		const updates: string[] = [];
		const values: any[] = [];

		if (body.role !== undefined) {
			if (!VALID_ROLES.includes(body.role)) {
				return jsonResponse({ success: false, error: 'Invalid role. Must be: ' + VALID_ROLES.join(', ') }, 400);
			}
			updates.push('role = ?');
			values.push(body.role);
		}
		if (body.display_name !== undefined) {
			updates.push('display_name = ?');
			values.push(body.display_name);
		}
		if (body.email !== undefined) {
			updates.push('email = ?');
			values.push(body.email);
		}
		if (body.is_active !== undefined) {
			updates.push('is_active = ?');
			values.push(body.is_active ? 1 : 0);
		}

		// Password reset support
		if (body.password !== undefined) {
			if (!body.password || body.password.length < 6) {
				return jsonResponse({ success: false, error: 'Password must be at least 6 characters' }, 400);
			}
			const salt = await bcrypt.genSalt(10);
			const hashed = await bcrypt.hash(body.password, salt);
			updates.push('password_hash = ?');
			values.push(hashed);
		}

		if (updates.length === 0) {
			return jsonResponse({ success: false, error: 'No valid fields to update' }, 400);
		}

		updates.push("updated_at = datetime('now')");
		values.push(params.id);

		await db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

		const updated = await db.prepare('SELECT * FROM users WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM users WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'User not found' }, 404);

		// Prevent deleting superadmin
		if (existing.role === 'superadmin') {
			return jsonResponse({ success: false, error: 'Cannot delete superadmin' }, 400);
		}

		await db.prepare('DELETE FROM users WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true, message: `User ${existing.username} deleted` });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
