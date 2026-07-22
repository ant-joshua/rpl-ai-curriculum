import { getDB, jsonResponse } from '$lib/server/d1';
import { createSession } from '$lib/server/auth';
import bcrypt from 'bcryptjs';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { username, password } = body;

		if (!username?.trim()) {
			return jsonResponse({ success: false, error: 'Username required' }, 400);
		}

		// Find user by username or email
		const user = await db
			.prepare('SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1')
			.bind(username.trim(), username.trim())
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
		}

		// If user has 2FA enabled, issue temp_token instead of full session
		if (user.totp_verified === 1) {
			const tempToken = crypto.randomUUID();
			await db.prepare(
				'INSERT INTO temp_sessions (id, user_id, created_at) VALUES (?, ?, ?)'
			).bind(tempToken, user.id, new Date().toISOString()).run();

			return jsonResponse({
				success: true,
				need2fa: true,
				temp_token: tempToken,
			});
		}

		// Create session token
		const token = await createSession(platform, user.id, 'password');

		// Set cookie + JSON response
		const json = JSON.stringify({
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

		return new Response(json, {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': `lms_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
