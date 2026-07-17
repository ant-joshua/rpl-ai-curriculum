import bcrypt from 'bcryptjs';
import { jsonResponse, getDB } from '$lib/server/d1';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		if (!platform) {
			return jsonResponse({ success: false, error: 'Platform not available' }, 500);
		}

		const body = await request.json();
		const { name, email, password, bio, course_interests } = body;

		// Validation
		if (!name || !name.trim()) {
			return jsonResponse({ success: false, error: 'Nama wajib diisi' }, 400);
		}
		if (!email || !email.trim()) {
			return jsonResponse({ success: false, error: 'Email wajib diisi' }, 400);
		}
		if (!password || password.length < 6) {
			return jsonResponse({ success: false, error: 'Password minimal 6 karakter' }, 400);
		}

		const db = getDB(platform);

		// Check existing user
		const existing = await db.prepare(
			'SELECT id FROM users WHERE email = ?'
		).bind(email.trim().toLowerCase()).first<any>();

		if (existing) {
			return jsonResponse({ success: false, error: 'Email sudah terdaftar' }, 409);
		}

		// Hash password using bcrypt (consistent with login endpoint)
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const userId = crypto.randomUUID();
		const now = new Date().toISOString();

		// Create user with role 'instructor' (pending admin approval)
		await db.prepare(
			`INSERT INTO users (id, username, email, display_name, password_hash, role, is_active, created_at)
			 VALUES (?, ?, ?, ?, ?, 'instructor', 0, ?)`
		).bind(
			userId,
			email.trim().split('@')[0],
			email.trim().toLowerCase(),
			name.trim(),
			hashedPassword,
			now
		).run();

		// Create instructor application record
		const appId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO instructor_applications (id, user_id, status, bio, course_interests, created_at, updated_at)
			 VALUES (?, ?, 'pending', ?, ?, ?, ?)`
		).bind(
			appId,
			userId,
			bio || '',
			course_interests || '',
			now,
			now
		).run();

		return jsonResponse({
			success: true,
			message: 'Pendaftaran berhasil. Menunggu persetujuan admin.',
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
