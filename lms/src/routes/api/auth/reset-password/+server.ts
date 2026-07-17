import { getDB, jsonResponse } from '$lib/server/d1';
import bcrypt from 'bcryptjs';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { token, new_password } = body;

		if (!token) {
			return jsonResponse({ success: false, error: 'Token required' }, 400);
		}

		if (!new_password || new_password.length < 6) {
			return jsonResponse({ success: false, error: 'Password must be at least 6 characters' }, 400);
		}

		// Look up token
		const record = await db
			.prepare('SELECT * FROM password_reset_tokens WHERE token = ?')
			.bind(token)
			.first<any>();

		if (!record) {
			return jsonResponse({ success: false, error: 'Invalid token' }, 404);
		}

		if (record.used === 1) {
			return jsonResponse({ success: false, error: 'Token already used' }, 400);
		}

		const now = new Date().toISOString();
		if (record.expires_at < now) {
			return jsonResponse({ success: false, error: 'Token expired' }, 400);
		}

		// Hash new password
		const passwordHash = await bcrypt.hash(new_password, 10);

		// Update user password
		await db
			.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
			.bind(passwordHash, now, record.user_id)
			.run();

		// Mark token as used
		await db
			.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?')
			.bind(record.id)
			.run();

		return jsonResponse({
			success: true,
			message: 'Password has been reset successfully.',
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
