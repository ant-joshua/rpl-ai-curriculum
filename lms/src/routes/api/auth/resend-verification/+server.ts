import { getDB, jsonResponse } from '$lib/server/d1';
import { sendEmail } from '$lib/server/email';
import { authRateLimit, getClientIp } from '$lib/server/auth-rate-limit';

const VERIFY_URL = 'https://syllabus.ant-joshua.my.id/verify-email';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		// Rate limit: 5 requests/min per IP (spam protection for emails)
		const rl = authRateLimit(getClientIp(request));
		if (!rl.allowed) {
			return jsonResponse({
				success: false,
				error: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfter} detik.`,
			}, 429);
		}

		if (!platform) return jsonResponse({ success: false, error: 'Platform not available' }, 500);
		const db = getDB(platform);
		const body = await request.json();
		const { email } = body;

		if (!email?.trim()) return jsonResponse({ success: false, error: 'Email required' }, 400);

		const user = await db.prepare('SELECT id, email FROM users WHERE email = ?')
			.bind(email.trim().toLowerCase()).first<{ id: string; email: string }>();

		if (!user) return jsonResponse({ success: true, message: 'If that email is registered, a verification email has been sent.' });

		// Check already verified
		const u = await db.prepare('SELECT email_verified FROM users WHERE id = ?').bind(user.id).first<{ email_verified: number }>();
		if (u?.email_verified === 1) return jsonResponse({ success: false, error: 'Email already verified' }, 400);

		// Delete old unused tokens for this user
		await db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ? AND used = 0').bind(user.id).run();

		// Create token (valid 24h)
		const token = crypto.randomUUID();
		const id = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
		await db.prepare(
			'INSERT INTO email_verification_tokens (id, user_id, token, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, ?)'
		).bind(id, user.id, token, expiresAt, new Date().toISOString()).run();

		// Send email
		const link = `${VERIFY_URL}?token=${token}`;
		await sendEmail(
			user.email,
			'Verify your email — RPL AI Curriculum',
			`Hi!\n\nPlease verify your email address to activate your account:\n\n${link}\n\nThis link expires in 24 hours.\n\nIf you didn't create an account, you can ignore this email.\n\nRPL AI Curriculum`
		);

		return jsonResponse({ success: true, message: 'Verification email sent.' });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
