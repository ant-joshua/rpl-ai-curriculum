import { getDB, jsonResponse } from '$lib/server/d1';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { email } = body;

		if (!email?.trim()) {
			return jsonResponse({ success: false, error: 'Email required' }, 400);
		}

		// Find user by email
		const user = await db
			.prepare('SELECT id, email FROM users WHERE email = ?')
			.bind(email.trim())
			.first<{ id: string; email: string }>();

		if (!user) {
			// Don't reveal whether email exists — always return success
			return jsonResponse({
				success: true,
				message: 'If that email is registered, a reset link has been generated.',
			});
		}

		// Generate reset token (valid 1 hour)
		const token = crypto.randomUUID();
		const id = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
		const now = new Date().toISOString();

		await db
			.prepare(
				'INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, ?)'
			)
			.bind(id, user.id, token, expiresAt, now)
			.run();

		// MVP: return reset link directly (no email system yet)
		const resetLink = `/reset-password?token=${token}`;

		return jsonResponse({
			success: true,
			message: 'If that email is registered, a reset link has been generated.',
			reset_link: resetLink,
			token, // exposed for MVP convenience
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
