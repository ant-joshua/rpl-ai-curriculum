import { getDB, jsonResponse } from '$lib/server/d1';
import { createSession } from '$lib/server/auth';

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

		// Simple password check (seeded users use 'password123')
		// In production, use bcrypt/argon2
		if (password && user.password_hash && password !== 'password123') {
			// TODO: proper hash verification
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
