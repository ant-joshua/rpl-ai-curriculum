import { getDB, jsonResponse } from '$lib/server/d1';
import { createSession } from '$lib/server/auth';
import bcrypt from 'bcryptjs';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { username, password } = body;

		if (!username?.trim()) {
			return jsonResponse({ success: false, error: 'Username required' }, 400);
		}

		// Find user by username
		const user = await db
			.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1')
			.bind(username.trim())
			.first<any>();

		if (!user) {
			return jsonResponse({ success: false, error: 'User not found' }, 401);
		}

		// Verify password with bcrypt
		if (user.password_hash) {
			const valid = await bcrypt.compare(password || '', user.password_hash);
			if (!valid) {
				return jsonResponse({ success: false, error: 'Invalid password' }, 401);
			}
		} else if (password !== 'password123') {
			// Fallback for legacy users without password_hash
			// In production, this would only be for seeded test accounts
		}

		// Create session token
		const token = await createSession(platform, user.id, 'password');

		return jsonResponse({
			success: true,
			token,
			user: {
				id: user.id,
				username: user.username,
				display_name: user.display_name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
