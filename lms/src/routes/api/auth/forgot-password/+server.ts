import { getDB, jsonResponse } from '$lib/server/d1';
import { sendEmail } from '$lib/server/email';
import { authRateLimit, getClientIp } from '$lib/server/auth-rate-limit';

const RESET_URL = 'https://syllabus.ant-joshua.my.id/reset-password';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		// Rate limit: 10 requests/min per IP
		const rl = authRateLimit(getClientIp(request));
		if (!rl.allowed) {
			return jsonResponse({
				success: false,
				error: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfter} detik.`,
			}, 429);
		}

		const db = getDB(platform);
		const body = await request.json();
		const { email } = body;

		if (!email?.trim()) {
			return jsonResponse({ success: false, error: 'Email required' }, 400);
		}

		// Find user by email
		const user = await db
			.prepare('SELECT id, email FROM users WHERE email = ?')
			.bind(email.trim().toLowerCase())
			.first<{ id: string; email: string }>();

		if (!user) {
			// Don't reveal whether email exists — always return success
			return jsonResponse({
				success: true,
				message: 'If that email is registered, a reset link has been sent.',
			});
		}

		// Generate reset token (valid 1 hour)
		const token = crypto.randomUUID();
		const id = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
		const now = new Date().toISOString();

		// Invalidate old unused tokens
		await db
			.prepare('DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0')
			.bind(user.id)
			.run();

		await db
			.prepare(
				'INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, ?)'
			)
			.bind(id, user.id, token, expiresAt, now)
			.run();

		// Send reset email
		const resetLink = `${RESET_URL}?token=${token}`;
		await sendEmail(
			user.email,
			'Reset your password — RPL AI Curriculum',
			`Hi!\n\nWe received a request to reset your password. Click the link below to set a new one:\n\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.\n\nRPL AI Curriculum`
		);

		// Never expose token in response — email only
		return jsonResponse({
			success: true,
			message: 'If that email is registered, a reset link has been sent.',
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
