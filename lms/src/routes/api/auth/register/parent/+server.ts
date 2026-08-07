import bcrypt from 'bcryptjs';
import { jsonResponse, getDB } from '$lib/server/d1';
import { createSession } from '$lib/server/auth';
import { authRateLimit, getClientIp } from '$lib/server/auth-rate-limit';

// POST /api/auth/register/parent — create parent (orang tua/wali) account
// Body: { name, email, password, child_code? }
// If child_code provided, also link to that student. Otherwise parent links
// children later via the portal (admin or self-serve by student).
export async function POST({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
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
		const { name, email, password, relationship = 'guardian', child_code } = body;

		// Validation
		if (!name || !name.trim()) {
			return jsonResponse({ success: false, error: 'Nama wajib diisi' }, 400);
		}
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			return jsonResponse({ success: false, error: 'Format email tidak valid' }, 400);
		}
		if (!password || password.length < 6) {
			return jsonResponse({ success: false, error: 'Password minimal 6 karakter' }, 400);
		}

		const db = getDB(platform);
		const emailLower = email.trim().toLowerCase();

		// Check duplicate email
		const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(emailLower).first<any>();
		if (existing) {
			return jsonResponse({ success: false, error: 'Email sudah terdaftar' }, 409);
		}

		// If child_code provided, find the child student
		let childUser: any = null;
		if (child_code && child_code.trim()) {
			childUser = await db.prepare(
				'SELECT id, display_name FROM users WHERE (username = ? OR id = ?) AND role = \'student\''
			).bind(child_code.trim(), child_code.trim()).first<any>();
			if (!childUser) {
				return jsonResponse({ success: false, error: 'Kode anak tidak ditemukan. Gunakan username/ID anak murid.' }, 400);
			}
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const userId = crypto.randomUUID();
		const now = new Date().toISOString();
		const username = `parent_${emailLower.split('@')[0]}`;

		// Insert parent user — role='parent'
		await db.prepare(
			`INSERT INTO users (id, username, email, display_name, password_hash, role, is_active, created_at)
			 VALUES (?, ?, ?, ?, ?, 'parent', 1, ?)`
		).bind(userId, username, emailLower, name.trim(), hashedPassword, now).run();

		// Create session
		const token = await createSession(platform, userId, 'password');

		// Create parent_accounts record + optional link
		const tenantId = 'default';
		const parentAccId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO parent_accounts (id, tenant_id, user_id, name, email, relationship, is_primary, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
		).bind(parentAccId, tenantId, userId, name.trim(), emailLower, relationship, now).run();

		if (childUser) {
			await db.prepare(
				`INSERT INTO parent_student_links (id, tenant_id, parent_id, student_id, relationship, is_primary, access_level, created_at)
				 VALUES (?, ?, ?, ?, ?, 1, 'full', ?)`
			).bind(crypto.randomUUID(), tenantId, parentAccId, childUser.id, relationship, now).run();
		}

		// Fetch created user for response
		const user = await db.prepare(
			'SELECT id, username, email, display_name, role, is_active, created_at FROM users WHERE id = ?'
		).bind(userId).first<any>();

		return jsonResponse({
			success: true,
			token,
			user,
			linkedChildId: childUser?.id || null,
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}