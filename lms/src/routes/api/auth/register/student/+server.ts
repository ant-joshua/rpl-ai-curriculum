import bcrypt from 'bcryptjs';
import { jsonResponse, getDB } from '$lib/server/d1';
import { createSession } from '$lib/server/auth';
import { sendEmail } from '$lib/server/email';
import { authRateLimit, getClientIp } from '$lib/server/auth-rate-limit';

const VERIFY_URL = 'https://syllabus.ant-joshua.my.id/verify-email';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		// Rate limit: 10 requests/min per IP
		const rl = authRateLimit(getClientIp(request));
		if (!rl.allowed) {
			return jsonResponse({
				success: false,
				error: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfter} detik.`,
			}, 429);
		}

		if (!platform) {
			return jsonResponse({ success: false, error: 'Platform not available' }, 500);
		}

		const body = await request.json();
		const { name, email, password } = body;

		// Validation
		if (!name || !name.trim()) {
			return jsonResponse({ success: false, error: 'Nama wajib diisi' }, 400);
		}
		if (!email || !email.trim()) {
			return jsonResponse({ success: false, error: 'Email wajib diisi' }, 400);
		}
		// Basic email format check
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			return jsonResponse({ success: false, error: 'Format email tidak valid' }, 400);
		}
		if (!password || password.length < 6) {
			return jsonResponse({ success: false, error: 'Password minimal 6 karakter' }, 400);
		}

		const db = getDB(platform);

		// Check duplicate email
		const existing = await db.prepare(
			'SELECT id FROM users WHERE email = ?'
		).bind(email.trim().toLowerCase()).first<any>();

		if (existing) {
			return jsonResponse({ success: false, error: 'Email sudah terdaftar' }, 409);
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const userId = crypto.randomUUID();
		const now = new Date().toISOString();

		// Insert student user — role='student', is_active=1 (immediately active)
		await db.prepare(
			`INSERT INTO users (id, username, email, display_name, password_hash, role, is_active, created_at)
			 VALUES (?, ?, ?, ?, ?, 'student', 1, ?)`
		).bind(
			userId,
			email.trim().split('@')[0],
			email.trim().toLowerCase(),
			name.trim(),
			hashedPassword,
			now
		).run();

		// Create session so student is logged in immediately
		const token = await createSession(platform, userId, 'password');

		// Send verification email (email_verified defaults to 0)
		const vToken = crypto.randomUUID();
		const vExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
		await db.prepare(
			'INSERT INTO email_verification_tokens (id, user_id, token, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, ?)'
		).bind(crypto.randomUUID(), userId, vToken, vExpires, now).run();

		const verifyLink = `${VERIFY_URL}?token=${vToken}`;
		await sendEmail(
			email.trim().toLowerCase(),
			'Verify your email — RPL AI Curriculum',
			`Hi ${name.trim()}!\n\nWelcome to RPL AI Curriculum! Please verify your email address:\n\n${verifyLink}\n\nThis link expires in 24 hours.\n\nRPL AI Curriculum`
		);

		// Fetch created user for response
		const user = await db.prepare(
			'SELECT id, username, email, display_name, role, is_active, created_at FROM users WHERE id = ?'
		).bind(userId).first<any>();

		return jsonResponse({
			success: true,
			token,
			user,
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
