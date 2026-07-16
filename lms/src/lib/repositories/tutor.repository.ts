import type { D1Database } from '@cloudflare/workers-types';

// ── Learning Package ──

export interface LearningPackageData {
	name: string;
	description?: string;
	type: 'privat_sessions' | 'bimbel_batch' | 'kelompok_kecil' | 'langganan' | 'paket_tryout';
	duration_sessions?: number;
	duration_days?: number;
	price?: number;
	max_students?: number;
	subjects?: string;
	includes_tryout?: number;
	status?: string;
}

export interface LearningPackageRow {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	type: string;
	duration_sessions: number | null;
	duration_days: number | null;
	price: number | null;
	max_students: number | null;
	subjects: string | null;
	includes_tryout: number;
	status: string;
	created_at: string;
}

// ── Batch Enrollment ──

export interface EnrollmentData {
	batch_id?: string;
	user_id: string;
	package_id?: string;
	enrollment_date?: string;
	paid_amount?: number;
	payment_status?: string;
	remaining_sessions?: number;
	status?: string;
}

export interface EnrollmentRow {
	id: string;
	tenant_id: string;
	batch_id: string | null;
	user_id: string;
	package_id: string | null;
	enrollment_date: string;
	paid_amount: number | null;
	payment_status: string;
	remaining_sessions: number | null;
	status: string;
	// joined fields
	display_name?: string;
	email?: string;
	username?: string;
}

// ── Tutoring Session ──

export interface SessionData {
	batch_id?: string;
	tutor_id: string;
	student_id?: string;
	type: 'privat_1on1' | 'bimbel_kelas' | 'kelompok_kecil' | 'online' | 'tryout';
	title?: string;
	date: string;
	start_time: string;
	end_time: string;
	duration_minutes?: number;
	room?: string;
	status?: string;
	notes?: string;
	materials?: string;
	homework?: string;
}

export interface SessionRow {
	id: string;
	tenant_id: string;
	batch_id: string | null;
	tutor_id: string;
	student_id: string | null;
	type: string;
	title: string | null;
	date: string;
	start_time: string;
	end_time: string;
	duration_minutes: number | null;
	room: string | null;
	status: string;
	notes: string | null;
	materials: string | null;
	homework: string | null;
	created_at: string;
	updated_at: string;
	// joined fields
	tutor_name?: string;
	student_name?: string;
}

export interface SessionWithDetail extends SessionRow {
	attendance?: AttendanceRow[];
	progress?: ProgressRow[];
}

// ── Session Attendance ──

export interface AttendanceRow {
	id: string;
	tenant_id: string;
	session_id: string;
	user_id: string;
	status: string;
	time_in: string | null;
	minutes_late: number;
	recorded_by: string | null;
	display_name?: string;
}

export interface AttendanceRecord {
	user_id: string;
	status: string;
	time_in?: string;
	minutes_late?: number;
	recorded_by?: string;
}

// ── Session Progress ──

export interface ProgressRow {
	id: string;
	tenant_id: string;
	session_id: string;
	student_id: string;
	topic_covered: string | null;
	understanding_level: string | null;
	notes: string | null;
	next_session_plan: string | null;
	homework_given: string | null;
	homework_completed: number;
	created_by: string | null;
	created_at: string;
}

export interface ProgressData {
	session_id: string;
	student_id: string;
	topic_covered?: string;
	understanding_level?: 'paham' | 'cukup' | 'kurang' | 'tidak_paham';
	notes?: string;
	next_session_plan?: string;
	homework_given?: string;
	homework_completed?: number;
	created_by?: string;
}

// ── Billing ──

export interface BillingData {
	user_id: string;
	package_id?: string;
	batch_id?: string;
	invoice_number?: string;
	type: string;
	amount: number;
	discount?: number;
	total: number;
	status?: string;
	due_date?: string;
	paid_at?: string;
	payment_method?: string;
	payment_proof?: string;
	notes?: string;
}

export interface BillingRow {
	id: string;
	tenant_id: string;
	user_id: string;
	package_id: string | null;
	batch_id: string | null;
	invoice_number: string | null;
	type: string;
	amount: number;
	discount: number;
	total: number;
	status: string;
	due_date: string | null;
	paid_at: string | null;
	payment_method: string | null;
	payment_proof: string | null;
	notes: string | null;
	created_at: string;
}

// ── Repository ──

export class TutorRepository {
	private db: D1Database;
	private tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}

	// ===== LEARNING PACKAGES =====

	async getPackages(): Promise<LearningPackageRow[]> {
		const rows = await this.db
			.prepare(
				`SELECT * FROM learning_packages WHERE tenant_id = ? AND status = 'active' ORDER BY created_at DESC`
			)
			.bind(this.tenantId)
			.all<LearningPackageRow>();
		return rows.results || [];
	}

	async getPackage(id: string): Promise<LearningPackageRow | null> {
		return this.db
			.prepare(`SELECT * FROM learning_packages WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.first<LearningPackageRow>();
	}

	async createPackage(data: LearningPackageData): Promise<LearningPackageRow> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db
			.prepare(
				`INSERT INTO learning_packages (id, tenant_id, name, description, type, duration_sessions, duration_days, price, max_students, subjects, includes_tryout, status, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				this.tenantId,
				data.name,
				data.description || null,
				data.type,
				data.duration_sessions ?? null,
				data.duration_days ?? null,
				data.price ?? null,
				data.max_students ?? null,
				data.subjects || null,
				data.includes_tryout ?? 0,
				data.status || 'active',
				now
			)
			.run();

		return (await this.getPackage(id))!;
	}

	async updatePackage(id: string, data: Partial<LearningPackageData>): Promise<LearningPackageRow | null> {
		const sets: string[] = [];
		const params: any[] = [];

		if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
		if (data.description !== undefined) { sets.push('description = ?'); params.push(data.description); }
		if (data.type !== undefined) { sets.push('type = ?'); params.push(data.type); }
		if (data.duration_sessions !== undefined) { sets.push('duration_sessions = ?'); params.push(data.duration_sessions); }
		if (data.duration_days !== undefined) { sets.push('duration_days = ?'); params.push(data.duration_days); }
		if (data.price !== undefined) { sets.push('price = ?'); params.push(data.price); }
		if (data.max_students !== undefined) { sets.push('max_students = ?'); params.push(data.max_students); }
		if (data.subjects !== undefined) { sets.push('subjects = ?'); params.push(data.subjects); }
		if (data.includes_tryout !== undefined) { sets.push('includes_tryout = ?'); params.push(data.includes_tryout); }
		if (data.status !== undefined) { sets.push('status = ?'); params.push(data.status); }

		if (sets.length === 0) return this.getPackage(id);

		params.push(id, this.tenantId);

		await this.db
			.prepare(`UPDATE learning_packages SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`)
			.bind(...params)
			.run();

		return this.getPackage(id);
	}

	async deletePackage(id: string): Promise<void> {
		await this.db
			.prepare(`DELETE FROM learning_packages WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.run();
	}

	// ===== BATCH ENROLLMENTS =====

	async getEnrollments(batchId?: string): Promise<EnrollmentRow[]> {
		let sql = `
			SELECT be.*, u.display_name, u.email, u.username
			FROM batch_enrollments be
			LEFT JOIN users u ON u.id = be.user_id
			WHERE be.tenant_id = ?
		`;
		const params: any[] = [this.tenantId];

		if (batchId) {
			sql += ' AND be.batch_id = ?';
			params.push(batchId);
		}

		sql += ' ORDER BY be.enrollment_date DESC';

		const rows = await this.db.prepare(sql).bind(...params).all<any>();
		return rows.results || [];
	}

	async createEnrollment(data: EnrollmentData): Promise<EnrollmentRow> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db
			.prepare(
				`INSERT INTO batch_enrollments (id, tenant_id, batch_id, user_id, package_id, enrollment_date, paid_amount, payment_status, remaining_sessions, status)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				this.tenantId,
				data.batch_id || null,
				data.user_id,
				data.package_id || null,
				data.enrollment_date || now,
				data.paid_amount ?? null,
				data.payment_status || 'pending',
				data.remaining_sessions ?? null,
				data.status || 'active'
			)
			.run();

		return (await this.db
			.prepare(`SELECT be.*, u.display_name, u.email, u.username FROM batch_enrollments be LEFT JOIN users u ON u.id = be.user_id WHERE be.id = ?`)
			.bind(id)
			.first<any>())!;
	}

	async updateEnrollment(id: string, data: Partial<EnrollmentData>): Promise<EnrollmentRow | null> {
		const sets: string[] = [];
		const params: any[] = [];

		if (data.batch_id !== undefined) { sets.push('batch_id = ?'); params.push(data.batch_id); }
		if (data.package_id !== undefined) { sets.push('package_id = ?'); params.push(data.package_id); }
		if (data.paid_amount !== undefined) { sets.push('paid_amount = ?'); params.push(data.paid_amount); }
		if (data.payment_status !== undefined) { sets.push('payment_status = ?'); params.push(data.payment_status); }
		if (data.remaining_sessions !== undefined) { sets.push('remaining_sessions = ?'); params.push(data.remaining_sessions); }
		if (data.status !== undefined) { sets.push('status = ?'); params.push(data.status); }

		if (sets.length === 0) {
			return this.db
				.prepare(`SELECT be.*, u.display_name, u.email, u.username FROM batch_enrollments be LEFT JOIN users u ON u.id = be.user_id WHERE be.id = ?`)
				.bind(id)
				.first<any>();
		}

		params.push(id);

		await this.db
			.prepare(`UPDATE batch_enrollments SET ${sets.join(', ')} WHERE id = ?`)
			.bind(...params)
			.run();

		return this.db
			.prepare(`SELECT be.*, u.display_name, u.email, u.username FROM batch_enrollments be LEFT JOIN users u ON u.id = be.user_id WHERE be.id = ?`)
			.bind(id)
			.first<any>();
	}

	async getRemainingSessions(enrollmentId: string): Promise<number | null> {
		const row = await this.db
			.prepare(`SELECT remaining_sessions FROM batch_enrollments WHERE id = ? AND tenant_id = ?`)
			.bind(enrollmentId, this.tenantId)
			.first<{ remaining_sessions: number | null }>();

		return row?.remaining_sessions ?? null;
	}

	async deductSession(enrollmentId: string): Promise<void> {
		await this.db
			.prepare(`UPDATE batch_enrollments SET remaining_sessions = remaining_sessions - 1 WHERE id = ? AND tenant_id = ? AND remaining_sessions > 0`)
			.bind(enrollmentId, this.tenantId)
			.run();
	}

	// ===== TUTORING SESSIONS =====

	async getSessions(opts: {
		tutorId?: string;
		studentId?: string;
		date?: string;
		batchId?: string;
		status?: string;
	}): Promise<SessionRow[]> {
		let sql = `
			SELECT ts.*, tu.display_name AS tutor_name, su.display_name AS student_name
			FROM tutoring_sessions ts
			LEFT JOIN users tu ON tu.id = ts.tutor_id
			LEFT JOIN users su ON su.id = ts.student_id
			WHERE ts.tenant_id = ?
		`;
		const params: any[] = [this.tenantId];

		if (opts.tutorId) { sql += ' AND ts.tutor_id = ?'; params.push(opts.tutorId); }
		if (opts.studentId) { sql += ' AND ts.student_id = ?'; params.push(opts.studentId); }
		if (opts.date) { sql += ' AND ts.date = ?'; params.push(opts.date); }
		if (opts.batchId) { sql += ' AND ts.batch_id = ?'; params.push(opts.batchId); }
		if (opts.status) { sql += ' AND ts.status = ?'; params.push(opts.status); }

		sql += ' ORDER BY ts.date DESC, ts.start_time ASC';

		const rows = await this.db.prepare(sql).bind(...params).all<any>();
		return rows.results || [];
	}

	async getSession(id: string): Promise<SessionWithDetail | null> {
		const session = await this.db
			.prepare(`
				SELECT ts.*, tu.display_name AS tutor_name, su.display_name AS student_name
				FROM tutoring_sessions ts
				LEFT JOIN users tu ON tu.id = ts.tutor_id
				LEFT JOIN users su ON su.id = ts.student_id
				WHERE ts.id = ? AND ts.tenant_id = ?
			`)
			.bind(id, this.tenantId)
			.first<any>();

		if (!session) return null;

		const attendance = await this.getSessionAttendance(id);
		const progress = await this.getSessionProgress(id);

		return { ...session, attendance, progress };
	}

	async createSession(data: SessionData): Promise<SessionRow> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db
			.prepare(`
				INSERT INTO tutoring_sessions (id, tenant_id, batch_id, tutor_id, student_id, type, title, date, start_time, end_time, duration_minutes, room, status, notes, materials, homework, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)
			.bind(
				id,
				this.tenantId,
				data.batch_id || null,
				data.tutor_id,
				data.student_id || null,
				data.type,
				data.title || null,
				data.date,
				data.start_time,
				data.end_time,
				data.duration_minutes ?? null,
				data.room || null,
				data.status || 'scheduled',
				data.notes || null,
				data.materials || null,
				data.homework || null,
				now,
				now
			)
			.run();

		const created = await this.db
			.prepare(`
				SELECT ts.*, tu.display_name AS tutor_name, su.display_name AS student_name
				FROM tutoring_sessions ts
				LEFT JOIN users tu ON tu.id = ts.tutor_id
				LEFT JOIN users su ON su.id = ts.student_id
				WHERE ts.id = ?
			`)
			.bind(id)
			.first<any>();

		return created!;
	}

	async updateSession(id: string, data: Partial<SessionData>): Promise<SessionRow | null> {
		const sets: string[] = [];
		const params: any[] = [];
		const now = new Date().toISOString();

		if (data.batch_id !== undefined) { sets.push('batch_id = ?'); params.push(data.batch_id); }
		if (data.tutor_id !== undefined) { sets.push('tutor_id = ?'); params.push(data.tutor_id); }
		if (data.student_id !== undefined) { sets.push('student_id = ?'); params.push(data.student_id); }
		if (data.type !== undefined) { sets.push('type = ?'); params.push(data.type); }
		if (data.title !== undefined) { sets.push('title = ?'); params.push(data.title); }
		if (data.date !== undefined) { sets.push('date = ?'); params.push(data.date); }
		if (data.start_time !== undefined) { sets.push('start_time = ?'); params.push(data.start_time); }
		if (data.end_time !== undefined) { sets.push('end_time = ?'); params.push(data.end_time); }
		if (data.duration_minutes !== undefined) { sets.push('duration_minutes = ?'); params.push(data.duration_minutes); }
		if (data.room !== undefined) { sets.push('room = ?'); params.push(data.room); }
		if (data.status !== undefined) { sets.push('status = ?'); params.push(data.status); }
		if (data.notes !== undefined) { sets.push('notes = ?'); params.push(data.notes); }
		if (data.materials !== undefined) { sets.push('materials = ?'); params.push(data.materials); }
		if (data.homework !== undefined) { sets.push('homework = ?'); params.push(data.homework); }

		if (sets.length === 0) return this.getSession(id);

		sets.push('updated_at = ?');
		params.push(now);
		params.push(id, this.tenantId);

		await this.db
			.prepare(`UPDATE tutoring_sessions SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`)
			.bind(...params)
			.run();

		return this.getSession(id);
	}

	async completeSession(id: string): Promise<SessionRow | null> {
		const session = await this.db
			.prepare(`SELECT start_time, end_time FROM tutoring_sessions WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.first<{ start_time: string; end_time: string }>();

		if (!session) return null;

		// Compute duration_minutes from start_time and end_time
		const [startH, startM] = session.start_time.split(':').map(Number);
		const [endH, endM] = session.end_time.split(':').map(Number);
		const durationMinutes = Math.max(0, (endH * 60 + endM) - (startH * 60 + startM));

		const now = new Date().toISOString();

		await this.db
			.prepare(`UPDATE tutoring_sessions SET status = 'completed', duration_minutes = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`)
			.bind(durationMinutes, now, id, this.tenantId)
			.run();

		return this.getSession(id);
	}

	async cancelSession(id: string): Promise<SessionRow | null> {
		const now = new Date().toISOString();

		await this.db
			.prepare(`UPDATE tutoring_sessions SET status = 'cancelled', updated_at = ? WHERE id = ? AND tenant_id = ?`)
			.bind(now, id, this.tenantId)
			.run();

		return this.getSession(id);
	}

	async checkConflict(
		tutorId: string,
		date: string,
		startTime: string,
		endTime: string,
		excludeId?: string
	): Promise<boolean> {
		let sql = `
			SELECT COUNT(*) AS count FROM tutoring_sessions
			WHERE tenant_id = ? AND tutor_id = ? AND date = ? AND status != 'cancelled'
			AND start_time < ? AND end_time > ?
		`;
		const params: any[] = [this.tenantId, tutorId, date, endTime, startTime];

		if (excludeId) {
			sql += ' AND id != ?';
			params.push(excludeId);
		}

		const row = await this.db.prepare(sql).bind(...params).first<{ count: number }>();
		return (row?.count ?? 0) > 0;
	}

	// ===== SESSION ATTENDANCE =====

	async getSessionAttendance(sessionId: string): Promise<AttendanceRow[]> {
		const rows = await this.db
			.prepare(`
				SELECT sa.*, u.display_name
				FROM session_attendance sa
				LEFT JOIN users u ON u.id = sa.user_id
				WHERE sa.session_id = ?
				ORDER BY u.display_name ASC
			`)
			.bind(sessionId)
			.all<AttendanceRow>();

		return rows.results || [];
	}

	async saveSessionAttendance(sessionId: string, records: AttendanceRecord[]): Promise<void> {
		if (records.length === 0) return;

		const now = new Date().toISOString();
		const stmts = records.map((r) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(`
					INSERT INTO session_attendance (id, tenant_id, session_id, user_id, status, time_in, minutes_late, recorded_by)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(session_id, user_id) DO UPDATE SET
						status = excluded.status,
						time_in = excluded.time_in,
						minutes_late = excluded.minutes_late,
						recorded_by = excluded.recorded_by
				`)
				.bind(
					id,
					this.tenantId,
					sessionId,
					r.user_id,
					r.status,
					r.time_in || null,
					r.minutes_late ?? 0,
					r.recorded_by || null
				);
		});

		await this.db.batch(stmts);
	}

	// ===== SESSION PROGRESS =====

	async getSessionProgress(sessionId: string, studentId?: string): Promise<ProgressRow[]> {
		let sql = `
			SELECT sp.*, u.display_name
			FROM session_progress sp
			LEFT JOIN users u ON u.id = sp.student_id
			WHERE sp.session_id = ?
		`;
		const params: any[] = [sessionId];

		if (studentId) {
			sql += ' AND sp.student_id = ?';
			params.push(studentId);
		}

		sql += ' ORDER BY sp.created_at ASC';

		const rows = await this.db.prepare(sql).bind(...params).all<ProgressRow>();
		return rows.results || [];
	}

	async saveSessionProgress(data: ProgressData): Promise<ProgressRow> {
		// Check if a progress record already exists for this session + student
		const existing = await this.db
			.prepare(`SELECT id FROM session_progress WHERE session_id = ? AND student_id = ?`)
			.bind(data.session_id, data.student_id)
			.first<{ id: string }>();

		const now = new Date().toISOString();

		if (existing) {
			// Update existing record
			const sets: string[] = [];
			const params: any[] = [];

			if (data.topic_covered !== undefined) { sets.push('topic_covered = ?'); params.push(data.topic_covered); }
			if (data.understanding_level !== undefined) { sets.push('understanding_level = ?'); params.push(data.understanding_level); }
			if (data.notes !== undefined) { sets.push('notes = ?'); params.push(data.notes); }
			if (data.next_session_plan !== undefined) { sets.push('next_session_plan = ?'); params.push(data.next_session_plan); }
			if (data.homework_given !== undefined) { sets.push('homework_given = ?'); params.push(data.homework_given); }
			if (data.homework_completed !== undefined) { sets.push('homework_completed = ?'); params.push(data.homework_completed); }

			if (sets.length > 0) {
				params.push(existing.id);
				await this.db
					.prepare(`UPDATE session_progress SET ${sets.join(', ')} WHERE id = ?`)
					.bind(...params)
					.run();
			}
		} else {
			// Insert new record
			const id = crypto.randomUUID();
			await this.db
				.prepare(`
					INSERT INTO session_progress (id, tenant_id, session_id, student_id, topic_covered, understanding_level, notes, next_session_plan, homework_given, homework_completed, created_by, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`)
				.bind(
					id,
					this.tenantId,
					data.session_id,
					data.student_id,
					data.topic_covered || null,
					data.understanding_level || null,
					data.notes || null,
					data.next_session_plan || null,
					data.homework_given || null,
					data.homework_completed ?? 0,
					data.created_by || null,
					now
				)
				.run();
		}

		return (await this.db
			.prepare(`SELECT sp.*, u.display_name FROM session_progress sp LEFT JOIN users u ON u.id = sp.student_id WHERE sp.session_id = ? AND sp.student_id = ?`)
			.bind(data.session_id, data.student_id)
			.first<ProgressRow>())!;
	}

	// ===== BILLING =====

	async getBillings(opts: {
		userId?: string;
		status?: string;
		batchId?: string;
	}): Promise<BillingRow[]> {
		let sql = 'SELECT * FROM billing_records WHERE tenant_id = ?';
		const params: any[] = [this.tenantId];

		if (opts.userId) { sql += ' AND user_id = ?'; params.push(opts.userId); }
		if (opts.status) { sql += ' AND status = ?'; params.push(opts.status); }
		if (opts.batchId) { sql += ' AND batch_id = ?'; params.push(opts.batchId); }

		sql += ' ORDER BY created_at DESC';

		const rows = await this.db.prepare(sql).bind(...params).all<BillingRow>();
		return rows.results || [];
	}

	async createBilling(data: BillingData): Promise<BillingRow> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		const invoiceNumber = data.invoice_number || `INV-${now.slice(0, 10).replace(/-/g, '')}-${id.slice(0, 8).toUpperCase()}`;

		await this.db
			.prepare(`
				INSERT INTO billing_records (id, tenant_id, user_id, package_id, batch_id, invoice_number, type, amount, discount, total, status, due_date, paid_at, payment_method, payment_proof, notes, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)
			.bind(
				id,
				this.tenantId,
				data.user_id,
				data.package_id || null,
				data.batch_id || null,
				invoiceNumber,
				data.type,
				data.amount,
				data.discount ?? 0,
				data.total,
				data.status || 'unpaid',
				data.due_date || null,
				data.paid_at || null,
				data.payment_method || null,
				data.payment_proof || null,
				data.notes || null,
				now
			)
			.run();

		return (await this.db
			.prepare(`SELECT * FROM billing_records WHERE id = ?`)
			.bind(id)
			.first<BillingRow>())!;
	}

	async updateBillingStatus(id: string, status: string): Promise<BillingRow | null> {
		const now = new Date().toISOString();
		const paidAt = status === 'paid' ? now : null;

		await this.db
			.prepare(`UPDATE billing_records SET status = ?, paid_at = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`)
			.bind(status, paidAt, now, id, this.tenantId)
			.run();

		return this.db
			.prepare(`SELECT * FROM billing_records WHERE id = ?`)
			.bind(id)
			.first<BillingRow>();
	}
}
