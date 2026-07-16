import type { D1Database } from '@cloudflare/workers-types';

export interface SaveAttendanceInput {
	user_id: string;
	status: 'hadir' | 'sakit' | 'izin' | 'alpha' | 'dispensasi' | 'terlambat';
	reason?: string;
	time_in?: string;
	minutes_late?: number;
}

export interface AttendanceStudentRow {
	user_id: string;
	nis: string | null;
	display_name: string;
	status: string | null;
	reason: string | null;
	minutes_late: number | null;
	time_in: string | null;
}

export interface AttendanceDailyStatus {
	date: string;
	statuses: Record<string, string | null>;
}

export interface AttendanceRecapRow {
	id: string;
	tenant_id: string;
	user_id: string;
	academic_period_id: string;
	month: number;
	year: number;
	total_hadir: number;
	total_sakit: number;
	total_izin: number;
	total_alpha: number;
	total_dispensasi: number;
	total_terlambat: number;
	percentage: number;
}

export class AttendanceRepository {
	private db: D1Database;
	private tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}

	/**
	 * Get attendance for all students in a class on a given date.
	 * Returns student list with or without existing attendance status.
	 */
	async getByClassAndDate(
		classId: string,
		date: string,
		subjectId?: string
	): Promise<AttendanceStudentRow[]> {
		let query = `
			SELECT cm.user_id, cm.nis, u.display_name, a.status, a.reason, a.minutes_late, a.time_in
			FROM class_members cm
			JOIN users u ON u.id = cm.user_id
			LEFT JOIN attendance a ON a.user_id = cm.user_id AND a.class_id = cm.class_id AND a.date = ?
		`;
		const params: any[] = [date];

		if (subjectId) {
			query += ` AND a.subject_id = ?`;
			params.push(subjectId);
		}

		query += ` WHERE cm.class_id = ? AND cm.role = 'student' ORDER BY cm.nis`;
		params.push(classId);

		const rows = await this.db.prepare(query).bind(...params).all<any>();
		return (rows.results || []).map((row: any) => ({
			user_id: row.user_id,
			nis: row.nis,
			display_name: row.display_name,
			status: row.status || null,
			reason: row.reason || null,
			minutes_late: row.minutes_late ?? null,
			time_in: row.time_in || null
		}));
	}

	/**
	 * Batch upsert attendance records.
	 * Conflicts resolved on (tenant_id, class_id, user_id, date, subject_id).
	 */
	async saveBatch(data: {
		class_id: string;
		date: string;
		subject_id?: string | null;
		records: SaveAttendanceInput[];
		documented_by?: string;
		recorded_by?: string;
	}): Promise<void> {
		const now = new Date().toISOString();
		const stmts = data.records.map((d) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(`
					INSERT INTO attendance (id, tenant_id, class_id, user_id, date, subject_id, status, time_in, minutes_late, reason, documented_by, recorded_by, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
										ON CONFLICT(class_id, user_id, date, subject_id)
					DO UPDATE SET
						status = excluded.status,
						time_in = excluded.time_in,
						minutes_late = excluded.minutes_late,
						reason = excluded.reason,
						documented_by = excluded.documented_by,
						recorded_by = excluded.recorded_by
				`)
				.bind(
					id,
					this.tenantId,
					data.class_id,
					d.user_id,
					data.date,
					data.subject_id || null,
					d.status,
					d.time_in || null,
					d.minutes_late ?? null,
					d.reason || null,
					data.documented_by || null,
					data.recorded_by || null,
					now
				);
		});

		if (stmts.length > 0) {
			await this.db.batch(stmts);
		}
	}

	/**
	 * Get a single attendance recap for a user in a given period/month.
	 */
	async getRecap(
		userId: string,
		academicPeriodId: string,
		month: number,
		year: number
	): Promise<AttendanceRecapRow | null> {
		const row = await this.db.prepare(`
			SELECT * FROM attendance_recaps
			WHERE user_id = ? AND academic_period_id = ? AND month = ? AND year = ? AND tenant_id = ?
		`).bind(userId, academicPeriodId, month, year, this.tenantId).first<any>();
		return row || null;
	}

	/**
	 * Compute attendance recap from raw attendance data.
	 * Counts 'terlambat' as hadir, calculates percentage against total calendar days in month.
	 */
	async computeRecap(
		userId: string,
		academicPeriodId: string,
		month: number,
		year: number
	): Promise<void> {
		const daysInMonth = new Date(year, month, 0).getDate();
		const monthStr = String(month).padStart(2, '0');
		const startDate = `${year}-${monthStr}-01`;
		const endDate = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

		const stats = await this.db.prepare(`
			SELECT status, COUNT(*) AS count
			FROM attendance
			WHERE user_id = ? AND tenant_id = ? AND date >= ? AND date <= ?
			GROUP BY status
		`).bind(userId, this.tenantId, startDate, endDate).all<{ status: string; count: number }>();

		const counts: Record<string, number> = {};
		for (const row of (stats.results || [])) {
			counts[row.status] = row.count;
		}

		const totalHadir = (counts['hadir'] || 0) + (counts['terlambat'] || 0);
		const totalSakit = counts['sakit'] || 0;
		const totalIzin = counts['izin'] || 0;
		const totalAlpha = counts['alpha'] || 0;
		const totalDispensasi = counts['dispensasi'] || 0;
		const totalTerlambat = counts['terlambat'] || 0;

		const percentage = daysInMonth > 0 ? Math.round((totalHadir / daysInMonth) * 100) : 0;

		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db.prepare(`
			INSERT INTO attendance_recaps (id, tenant_id, user_id, academic_period_id, month, year, total_hadir, total_sakit, total_izin, total_alpha, total_dispensasi, total_terlambat, percentage)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
						ON CONFLICT(user_id, academic_period_id, month, year)
			DO UPDATE SET
				total_hadir = excluded.total_hadir,
				total_sakit = excluded.total_sakit,
				total_izin = excluded.total_izin,
				total_alpha = excluded.total_alpha,
				total_dispensasi = excluded.total_dispensasi,
				total_terlambat = excluded.total_terlambat,
				percentage = excluded.percentage
		`).bind(
			id,
			this.tenantId,
			userId,
			academicPeriodId,
			month,
			year,
			totalHadir,
			totalSakit,
			totalIzin,
			totalAlpha,
			totalDispensasi,
			totalTerlambat,
			percentage
		).run();
	}

	/**
	 * Get monthly attendance for all students in a class (calendar view).
	 * Returns array of { date, statuses: { [userId]: status } } for each day of the month.
	 */
	async getMonthlyAttendance(
		classId: string,
		year: number,
		month: number
	): Promise<AttendanceDailyStatus[]> {
		const daysInMonth = new Date(year, month, 0).getDate();
		const monthStr = String(month).padStart(2, '0');

		const students = await this.db.prepare(`
			SELECT cm.user_id, cm.nis, u.display_name
			FROM class_members cm
			JOIN users u ON u.id = cm.user_id
			WHERE cm.class_id = ? AND cm.role = 'student'
			ORDER BY cm.nis
		`).bind(classId).all<any>();

		const studentList = students.results || [];
		if (studentList.length === 0) return [];

		const startDate = `${year}-${monthStr}-01`;
		const endDate = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

		const attendanceRows = await this.db.prepare(`
			SELECT user_id, date, status
			FROM attendance
			WHERE class_id = ? AND tenant_id = ? AND date >= ? AND date <= ?
			ORDER BY date
		`).bind(classId, this.tenantId, startDate, endDate).all<any>();

		const dateStatusMap: Record<string, Record<string, string | null>> = {};
		for (const row of (attendanceRows.results || [])) {
			if (!dateStatusMap[row.date]) {
				dateStatusMap[row.date] = {};
			}
			dateStatusMap[row.date][row.user_id] = row.status;
		}

		const result: AttendanceDailyStatus[] = [];
		for (let day = 1; day <= daysInMonth; day++) {
			const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
			const statuses: Record<string, string | null> = {};
			for (const student of studentList) {
				statuses[student.user_id] = dateStatusMap[dateStr]?.[student.user_id] || null;
			}
			result.push({ date: dateStr, statuses });
		}

		return result;
	}

	/**
	 * Delete attendance records by class, date, and optionally subject.
	 */
	async deleteAttendance(classId: string, date: string, subjectId?: string): Promise<void> {
		let query = `DELETE FROM attendance WHERE class_id = ? AND date = ? AND tenant_id = ?`;
		const params: any[] = [classId, date, this.tenantId];

		if (subjectId) {
			query += ` AND subject_id = ?`;
			params.push(subjectId);
		}

		await this.db.prepare(query).bind(...params).run();
	}
}
