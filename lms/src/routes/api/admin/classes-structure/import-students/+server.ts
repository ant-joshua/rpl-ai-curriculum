import { getDB, jsonResponse } from '$lib/server/d1';

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
	const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length === 0) return { headers: [], rows: [] };
	const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
	const rows = lines.slice(1).map(line => {
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

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const contentType = request.headers.get('content-type') || '';
		if (!contentType.includes('multipart/form-data')) {
			return jsonResponse({ success: false, error: 'Content-Type harus multipart/form-data' }, 400);
		}

		const formData = await request.formData();
		const file = formData.get('file') as File | null;

		if (!file) {
			return jsonResponse({ success: false, error: 'File CSV tidak ditemukan. Gunakan field name "file"' }, 400);
		}

		const text = await file.text();
		const parsed = parseCSV(text);

		if (parsed.headers.length === 0) {
			return jsonResponse({ success: false, error: 'File CSV kosong' }, 400);
		}

		// Map expected columns
		const nisIdx = parsed.headers.indexOf('nis');
		const nisnIdx = parsed.headers.indexOf('nisn');
		const namaIdx = parsed.headers.indexOf('nama');
		const kelasIdx = parsed.headers.indexOf('kelas');

		if (nisIdx === -1) {
			return jsonResponse({ success: false, error: 'CSV harus memiliki kolom "nis"' }, 400);
		}
		if (namaIdx === -1) {
			return jsonResponse({ success: false, error: 'CSV harus memiliki kolom "nama"' }, 400);
		}
		if (kelasIdx === -1) {
			return jsonResponse({ success: false, error: 'CSV harus memiliki kolom "kelas"' }, 400);
		}

		const now = new Date().toISOString();
		let total = 0;
		let created = 0;
		let skipped = 0;
		const errors: { row: number; nis: string; reason: string }[] = [];
		const createdUsers: { nis: string; nama: string; kelas: string }[] = [];

		for (let i = 0; i < parsed.rows.length; i++) {
			const row = parsed.rows[i];
			total++;

			try {
				const nis = row[nisIdx]?.trim();
				const nama = row[namaIdx]?.trim();
				const kelas = row[kelasIdx]?.trim();
				const nisn = nisnIdx !== -1 ? row[nisnIdx]?.trim() || null : null;

				if (!nis || !nama || !kelas) {
					errors.push({ row: i + 2, nis: nis || '', reason: 'Data tidak lengkap: nis, nama, dan kelas wajib diisi' });
					continue;
				}

				// Auto-create class if not exists
				let classRow = await db.prepare(
					'SELECT id FROM classes WHERE name = ? AND tenant_id = ?'
				).bind(kelas, tenantId).first<any>();

				if (!classRow) {
					const classId = crypto.randomUUID();
					// Create class with minimal data — grade_level_id can be null for now
					await db.prepare(
						'INSERT INTO classes (id, tenant_id, grade_level_id, name, code, created_at) VALUES (?, ?, ?, ?, ?, ?)'
					).bind(classId, tenantId, null, kelas, kelas, now).run();
					classRow = { id: classId };
				}

				const classId = classRow.id;

				// Check if NIS already exists in this class
				const existingMember = await db.prepare(
					'SELECT id FROM class_members WHERE nis = ? AND class_id = ? AND tenant_id = ?'
				).bind(nis, classId, tenantId).first<any>();

				if (existingMember) {
					skipped++;
					continue;
				}

				// Check if user already exists by email (nis@siswa.local)
				const email = `${nis}@siswa.local`;
				let user = await db.prepare(
					'SELECT id FROM users WHERE email = ?'
				).bind(email).first<any>();

				if (!user) {
					const userId = crypto.randomUUID();
					await db.prepare(
						`INSERT INTO users (id, email, username, display_name, role, is_active, created_at, updated_at)
						 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
					).bind(
						userId,
						email,
						nis,
						nama,
						'student',
						1,
						now,
						now
					).run();
					user = { id: userId };
				}

				// Create class membership
				const memberId = crypto.randomUUID();
				await db.prepare(
					`INSERT INTO class_members (id, tenant_id, class_id, user_id, role, status, nis, nisn, joined_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
				).bind(
					memberId,
					tenantId,
					classId,
					user.id,
					'student',
					'active',
					nis,
					nisn,
					now
				).run();

				created++;
				createdUsers.push({ nis, nama, kelas });
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : 'Unknown error';
				errors.push({ row: i + 2, nis: row[nisIdx]?.trim() || '', reason: msg });
			}
		}

		// Sync all members of this class into its linked study group (if any)
		await syncClassGroupMembers(db, classId, tenantId);

		return jsonResponse({
			success: true,
			data: {
				total,
				created,
				skipped,
				errors: errors.length > 0 ? errors : undefined,
				created_users: createdUsers
			}
		}, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// Sync active class members into the class-linked study group (if any).
// Creates the group on demand when the class has no group yet.
async function syncClassGroupMembers(db: any, classId: string, tenantId: string): Promise<void> {
	try {
		let group = await db
			.prepare('SELECT id FROM study_groups WHERE class_id = ?')
			.bind(classId)
			.first();
		if (!group) {
			const cls = await db
				.prepare('SELECT name, code, homeroom_teacher_id FROM classes WHERE id = ?')
				.bind(classId)
				.first();
			if (!cls) return;
			const g: any = cls;
			const groupId = `grp-class-${classId}`;
			const slug = `kelas-${(g.code || g.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`;
			await db
				.prepare('INSERT INTO study_groups (id, name, path_slug, description, created_by, class_id) VALUES (?, ?, ?, ?, ?, ?)')
				.bind(groupId, g.name, slug, `Grup diskusi resmi kelas ${g.name}`, g.homeroom_teacher_id || 'system', classId)
				.run();
			group = { id: groupId };
		}
		const groupId = (group as any).id;

		// Sync active students (and teacher) into group members
		const members = await db
			.prepare(`SELECT DISTINCT user_id, role FROM class_members WHERE class_id = ? AND status = 'active'`)
			.bind(classId)
			.all();
		for (const m of (members as any).results) {
			const role = m.role === 'student' ? 'member' : 'admin';
			await db
				.prepare('INSERT OR IGNORE INTO group_members (id, group_id, user_id, role) VALUES (?, ?, ?, ?)')
				.bind(`gm-${groupId}-${m.user_id}`, groupId, m.user_id, role)
				.run();
		}
	} catch {
		// Best effort: never fail class import because of group sync
	}
}
