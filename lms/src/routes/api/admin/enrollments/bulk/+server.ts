import { getDB, jsonResponse } from '$lib/server/d1';

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
	const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length === 0) return { headers: [], rows: [] };
	const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
	const rows = lines.slice(1).map(line => {
		// Handle quoted fields
		const fields: string[] = [];
		let current = '';
		let inQuotes = false;
		for (const ch of line) {
			if (ch === '"') { inQuotes = !inQuotes; continue; }
			if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; continue; }
			current += ch;
		}
		fields.push(current.trim());
		return fields;
	});
	return { headers, rows };
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Determine input source: multipart CSV or JSON
		const contentType = request.headers.get('content-type') || '';
		let emails: { email: string; role?: string }[] = [];
		let offeringId = '';

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const file = formData.get('file') as File | null;
			const offeringField = formData.get('offeringId') as string | null;
			if (!offeringField) return jsonResponse({ success: false, error: 'offeringId required' }, 400);
			offeringId = offeringField;

			if (file) {
				const text = await file.text();
				const parsed = parseCSV(text);
				if (parsed.headers.length === 0) return jsonResponse({ success: false, error: 'CSV file empty' }, 400);
				const emailIdx = parsed.headers.indexOf('email');
				if (emailIdx === -1) return jsonResponse({ success: false, error: 'CSV must have an "email" column' }, 400);
				const roleIdx = parsed.headers.indexOf('role');
				for (const row of parsed.rows) {
					const email = row[emailIdx]?.trim();
					if (!email || !email.includes('@')) continue;
					emails.push({ email, role: roleIdx !== -1 ? row[roleIdx]?.trim() : undefined });
				}
			} else {
				return jsonResponse({ success: false, error: 'No file uploaded' }, 400);
			}
		} else {
			const body = await request.json();
			if (!body.offeringId) return jsonResponse({ success: false, error: 'offeringId required' }, 400);
			offeringId = body.offeringId;
			if (Array.isArray(body.emails)) {
				emails = body.emails.map((e: string | { email: string; role?: string }) =>
					typeof e === 'string' ? { email: e } : { email: e.email, role: e.role }
				);
			} else {
				return jsonResponse({ success: false, error: 'emails array required' }, 400);
			}
		}

		if (emails.length === 0) return jsonResponse({ success: false, error: 'No valid emails found' }, 400);

		// Verify offering exists
		const offering = await db.prepare('SELECT id FROM course_offerings WHERE id = ?').bind(offeringId).first<any>();
		if (!offering) return jsonResponse({ success: false, error: 'Course offering not found' }, 404);

		let total = emails.length;
		let created = 0;
		let skipped = 0;
		const errors: { email: string; reason: string }[] = [];

		for (const { email, role } of emails) {
			try {
				// Find or create user
				let user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<any>();
				if (!user) {
					const id = crypto.randomUUID();
					const now = new Date().toISOString();
					const username = email.split('@')[0];
					await db.prepare(
						'INSERT INTO users (id, email, username, display_name, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
					).bind(id, email, username, username, 'student', 1, now, now).run();
					user = { id };
				}

				// Check duplicate enrollment
				const existing = await db.prepare(
					'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
				).bind(user.id, offeringId).first<any>();
				if (existing) {
					skipped++;
					continue;
				}

				// Create enrollment
				const enrollmentId = crypto.randomUUID();
				const now = new Date().toISOString();
				await db.prepare(
					'INSERT INTO enrollments (id, user_id, course_offering_id, role, status, enrolled_at) VALUES (?, ?, ?, ?, ?, ?)'
				).bind(enrollmentId, user.id, offeringId, role || 'student', 'active', now).run();
				created++;
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : 'Unknown error';
				errors.push({ email, reason: msg });
			}
		}

		return jsonResponse({
			success: true,
			data: { total, created, skipped, errors }
		}, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
