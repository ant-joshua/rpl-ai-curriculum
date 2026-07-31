import { getDB, jsonResponse } from '$lib/server/d1';
import { sendEmail } from '$lib/server/email';

const VERIFY_URL = 'https://syllabus.ant-joshua.my.id/verify-email';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		if (!platform) return jsonResponse({ success: false, error: 'Platform not available' }, 500);
		const db = getDB(platform);
		const body = await request.json();
		const { token } = body;

		if (!token) return jsonResponse({ success: false, error: 'Token required' }, 400);

		const record = await db.prepare(
			'SELECT * FROM email_verification_tokens WHERE token = ?'
		).bind(token).first<any>();

		if (!record) return jsonResponse({ success: false, error: 'Invalid or expired token' }, 400);
		if (record.used === 1) return jsonResponse({ success: false, error: 'Token already used' }, 400);
		if (record.expires_at < new Date().toISOString()) {
			return jsonResponse({ success: false, error: 'Token expired. Request a new one.' }, 400);
		}

		// Mark token used + set email_verified
		await db.prepare('UPDATE email_verification_tokens SET used = 1 WHERE id = ?').bind(record.id).run();
		await db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?')
			.bind(new Date().toISOString(), record.user_id).run();

		return jsonResponse({ success: true, message: 'Email verified successfully' });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
