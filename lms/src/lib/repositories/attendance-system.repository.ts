import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

export class AttendanceSystemRepository {
	private db: D1Database;

	constructor(platform: any) {
		this.db = getDB(platform);
	}

	async listSessions(tenantId: string, opts: { class_subject_id?: string; status?: string; date?: string; page?: number; limit?: number } = {}) {
		const page = opts.page || 1;
		const limit = opts.limit || 20;
		const offset = (page - 1) * limit;

		let sql = 'SELECT * FROM attendance_sessions WHERE tenant_id = ?';
		const params: any[] = [tenantId];

		if (opts.class_subject_id) { sql += ' AND class_subject_id = ?'; params.push(opts.class_subject_id); }
		if (opts.status) { sql += ' AND status = ?'; params.push(opts.status); }
		if (opts.date) { sql += " AND date(created_at) = ?"; params.push(opts.date); }

		const countResult = await this.db.prepare(sql.replace('SELECT *', 'SELECT COUNT(*) as total')).bind(...params).first<{ total: number }>();
		sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
		const { results } = await this.db.prepare(sql).bind(...params, limit, offset).all();
		return { sessions: results || [], total: countResult?.total || 0 };
	}

	async createSession(tenantId: string, data: { class_subject_id: string; academic_year: string; semester: number; session_date: string; start_time: string; end_time?: string; location_required?: boolean; location_lat?: number; location_lng?: number; location_radius?: number; notes?: string }, userId: string) {
		const id = crypto.randomUUID();
		const qrCode = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
		await this.db.prepare(
			'INSERT INTO attendance_sessions (id, tenant_id, session_type, class_subject_id, title, qr_code, qr_expires_at, max_duration, status, created_by) VALUES (?,?,\'class\',?,?,?,datetime(\'now\',\'+2 hours\'),60,\'active\',?)'
		).bind(id, tenantId, data.class_subject_id, data.session_date + ' ' + data.start_time, qrCode, userId).run();
		return this.db.prepare('SELECT * FROM attendance_sessions WHERE id = ?').bind(id).first();
	}

	async getSession(id: string, tenantId: string) {
		return await this.db.prepare('SELECT * FROM attendance_sessions WHERE id = ? AND tenant_id = ?').bind(id, tenantId).first();
	}

	async getRecords(tenantId: string, sessionId: string) {
		const { results } = await this.db.prepare(
			'SELECT ar.*, u.display_name as student_name FROM attendance_records ar LEFT JOIN users u ON ar.student_id = u.id WHERE ar.tenant_id = ? AND ar.session_id = ? ORDER BY ar.created_at'
		).bind(tenantId, sessionId).all();
		return results || [];
	}

	async getStudentHistory(tenantId: string, studentId: string, opts: { startDate?: string; endDate?: string } = {}) {
		let sql = 'SELECT ar.*, asess.title as session_title FROM attendance_records ar LEFT JOIN attendance_sessions asess ON ar.session_id = asess.id WHERE ar.tenant_id = ? AND ar.student_id = ?';
		const params: any[] = [tenantId, studentId];
		if (opts.startDate) { sql += ' AND ar.created_at >= ?'; params.push(opts.startDate); }
		if (opts.endDate) { sql += ' AND ar.created_at <= ?'; params.push(opts.endDate); }
		sql += ' ORDER BY ar.created_at DESC LIMIT 200';
		const { results } = await this.db.prepare(sql).bind(...params).all();
		return results || [];
	}

	async checkIn(tenantId: string, data: { session_id: string; student_id: string; method: string; device_info?: string; location_lat?: number; location_lng?: number }) {
		const existing = await this.db.prepare('SELECT id, status FROM attendance_records WHERE session_id = ? AND student_id = ?').bind(data.session_id, data.student_id).first<{ id: string; status: string }>();
		if (existing) {
			await this.db.prepare(
				'UPDATE attendance_records SET status = ?, check_in_time = datetime(\'now\'), method = ?, device_info = ?, location_lat = ?, location_lng = ? WHERE id = ?'
			).bind('present', data.method, data.device_info || null, data.location_lat || null, data.location_lng || null, existing.id).run();
			return this.db.prepare('SELECT * FROM attendance_records WHERE id = ?').bind(existing.id).first();
		}
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO attendance_records (id, tenant_id, session_id, student_id, status, check_in_time, method, device_info, location_lat, location_lng) VALUES (?,?,?,?,?,datetime(\'now\'),?,?,?,?)'
		).bind(id, tenantId, data.session_id, data.student_id, 'present', data.method, data.device_info || null, data.location_lat || null, data.location_lng || null).run();
		return this.db.prepare('SELECT * FROM attendance_records WHERE id = ?').bind(id).first();
	}

	async bulkCheckIn(tenantId: string, sessionId: string, records: { student_id: string; method?: string }[]) {
		const results: any[] = [];
		for (const r of records) {
			const id = crypto.randomUUID();
			await this.db.prepare(
				'INSERT OR IGNORE INTO attendance_records (id, tenant_id, session_id, student_id, status, check_in_time, method) VALUES (?,?,?,?,?,datetime(\'now\'),?)'
			).bind(id, tenantId, sessionId, r.student_id, 'present', r.method || 'manual').run();
			results.push({ id, student_id: r.student_id });
		}
		return results;
	}

	async getExceptions(tenantId: string, opts: { studentId?: string; status?: string; page?: number; limit?: number } = {}) {
		const page = opts.page || 1;
		const limit = opts.limit || 20;
		const offset = (page - 1) * limit;
		let sql = 'SELECT ae.*, u.display_name as student_name FROM attendance_exceptions ae LEFT JOIN users u ON ae.student_id = u.id WHERE ae.tenant_id = ?';
		const params: any[] = [tenantId];
		if (opts.studentId) { sql += ' AND ae.student_id = ?'; params.push(opts.studentId); }
		if (opts.status) { sql += ' AND ae.status = ?'; params.push(opts.status); }
		sql += ' ORDER BY ae.created_at DESC LIMIT ? OFFSET ?';
		const { results } = await this.db.prepare(sql).bind(...params, limit, offset).all();
		return results || [];
	}

	async createException(tenantId: string, data: { student_id: string; start_date: string; end_date: string; type: string; reason: string; attachment_url?: string }) {
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO attendance_exceptions (id, tenant_id, student_id, start_date, end_date, type, reason, attachment_url, status) VALUES (?,?,?,?,?,?,?,?,\'pending\')'
		).bind(id, tenantId, data.student_id, data.start_date, data.end_date, data.type, data.reason, data.attachment_url || null).run();
		return this.db.prepare('SELECT * FROM attendance_exceptions WHERE id = ?').bind(id).first();
	}

	async approveException(id: string, tenantId: string, approvedBy: string) {
		await this.db.prepare("UPDATE attendance_exceptions SET status = 'approved', approved_by = ? WHERE id = ? AND tenant_id = ?").bind(approvedBy, id, tenantId).run();
		return this.db.prepare('SELECT * FROM attendance_exceptions WHERE id = ?').bind(id).first();
	}

	async rejectException(id: string, tenantId: string, reason?: string) {
		await this.db.prepare('UPDATE attendance_exceptions SET status = \'rejected\' WHERE id = ? AND tenant_id = ?').bind(id, tenantId).run();
		return this.db.prepare('SELECT * FROM attendance_exceptions WHERE id = ?').bind(id).first();
	}

	async getAttendanceStats(tenantId: string) {
		const totalSessions = await this.db.prepare('SELECT COUNT(*) as count FROM attendance_sessions WHERE tenant_id = ?').bind(tenantId).first<{ count: number }>();
		const activeSessions = await this.db.prepare("SELECT COUNT(*) as count FROM attendance_sessions WHERE tenant_id = ? AND status = 'active'").bind(tenantId).first<{ count: number }>();
		const totalRecords = await this.db.prepare('SELECT COUNT(*) as count FROM attendance_records WHERE tenant_id = ?').bind(tenantId).first<{ count: number }>();
		const presentToday = await this.db.prepare(
			"SELECT COUNT(*) as count FROM attendance_records ar JOIN attendance_sessions asess ON ar.session_id = asess.id WHERE ar.tenant_id = ? AND asess.created_at >= datetime('now', '-1 day') AND ar.status = 'present'"
		).bind(tenantId).first<{ count: number }>();
		return {
			totalSessions: totalSessions?.count || 0,
			activeSessions: activeSessions?.count || 0,
			totalRecords: totalRecords?.count || 0,
			presentToday: presentToday?.count || 0
		};
	}

	async getSummaries(tenantId: string, opts: { class_subject_id?: string; academic_year?: string; page?: number; limit?: number } = {}) {
		const page = opts.page || 1;
		const limit = opts.limit || 50;
		const offset = (page - 1) * limit;
		let sql = 'SELECT asum.*, u.display_name as student_name FROM attendance_summary asum LEFT JOIN users u ON asum.student_id = u.id WHERE asum.tenant_id = ?';
		const params: any[] = [tenantId];
		if (opts.class_subject_id) { sql += ' AND asum.class_subject_id = ?'; params.push(opts.class_subject_id); }
		if (opts.academic_year) { sql += ' AND asum.academic_year = ?'; params.push(opts.academic_year); }
		const countResult = await this.db.prepare(sql.replace(/SELECT .*? FROM/, 'SELECT COUNT(*) as total FROM')).bind(...params).first<{ total: number }>();
		sql += ' ORDER BY asum.student_id LIMIT ? OFFSET ?';
		const { results } = await this.db.prepare(sql).bind(...params, limit, offset).all();
		return { summaries: results || [], total: countResult?.total || 0 };
	}
}
