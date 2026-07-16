import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

export class ParentPortalRepository {
	private db: D1Database;

	constructor(platform: any) {
		this.db = getDB(platform);
	}

	async createParentAccount(tenantId: string, data: { userId: string; name: string; phone?: string; email?: string; relationship: string; isPrimary?: number }) {
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO parent_accounts (id, tenant_id, user_id, name, phone, email, relationship, is_primary) VALUES (?,?,?,?,?,?,?,?)'
		).bind(id, tenantId, data.userId, data.name, data.phone || null, data.email || null, data.relationship, data.isPrimary ?? 0).run();
		return this.getParentAccount(tenantId, data.userId);
	}

	async getParentAccount(tenantId: string, userId: string) {
		return await this.db.prepare('SELECT * FROM parent_accounts WHERE tenant_id = ? AND user_id = ?').bind(tenantId, userId).first();
	}

	async updateParentAccount(id: string, tenantId: string, data: any) {
		const sets: string[] = [];
		const vals: any[] = [];
		for (const [k, v] of Object.entries(data)) {
			if (v !== undefined) { sets.push(`${k} = ?`); vals.push(v); }
		}
		if (sets.length === 0) return;
		vals.push(id, tenantId);
		await this.db.prepare(`UPDATE parent_accounts SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
	}

	async getAllParentAccounts(tenantId: string) {
		const { results } = await this.db.prepare('SELECT * FROM parent_accounts WHERE tenant_id = ? ORDER BY name').bind(tenantId).all();
		return results;
	}

	async linkStudent(tenantId: string, data: { parentId: string; studentId: string; relationship: string; accessLevel?: string }) {
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO parent_student_links (id, tenant_id, parent_id, student_id, relationship, access_level) VALUES (?,?,?,?,?,?)'
		).bind(id, tenantId, data.parentId, data.studentId, data.relationship, data.accessLevel || 'full').run();
		return id;
	}

	async getLinkedStudents(tenantId: string, parentId: string) {
		const { results } = await this.db.prepare(
			`SELECT psl.*, u.display_name as student_name, u.username as student_username
			 FROM parent_student_links psl
			 LEFT JOIN users u ON psl.student_id = u.id
			 WHERE psl.tenant_id = ? AND psl.parent_id = ?`
		).bind(tenantId, parentId).all();
		return results;
	}

	async removeLink(id: string, tenantId: string) {
		await this.db.prepare('DELETE FROM parent_student_links WHERE id = ? AND tenant_id = ?').bind(id, tenantId).run();
	}

	async logAccess(tenantId: string, data: { parentId: string; studentId: string; action: string; ipAddress?: string }) {
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO parent_access_log (id, tenant_id, parent_id, student_id, action, ip_address) VALUES (?,?,?,?,?,?)'
		).bind(id, tenantId, data.parentId, data.studentId, data.action, data.ipAddress || null).run();
	}

	async getAccessLog(tenantId: string, parentId: string, opts?: { limit?: number }) {
		const limit = opts?.limit || 50;
		const { results } = await this.db.prepare(
			'SELECT * FROM parent_access_log WHERE tenant_id = ? AND parent_id = ? ORDER BY created_at DESC LIMIT ?'
		).bind(tenantId, parentId, limit).all();
		return results;
	}

	async sendMessage(tenantId: string, data: { senderId: string; senderRole: string; recipientId: string; studentId: string; subject?: string; body: string }) {
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO parent_messages (id, tenant_id, sender_id, sender_role, recipient_id, student_id, subject, body, is_read) VALUES (?,?,?,?,?,?,?,?,0)'
		).bind(id, tenantId, data.senderId, data.senderRole, data.recipientId, data.studentId, data.subject || null, data.body).run();
		return this.db.prepare('SELECT * FROM parent_messages WHERE id = ?').bind(id).first();
	}

	async getMessages(tenantId: string, userId: string, opts?: { studentId?: string }) {
		let sql = 'SELECT * FROM parent_messages WHERE tenant_id = ? AND (sender_id = ? OR recipient_id = ?)';
		const params: any[] = [tenantId, userId, userId];
		if (opts?.studentId) { sql += ' AND student_id = ?'; params.push(opts.studentId); }
		sql += ' ORDER BY created_at DESC LIMIT 100';
		const { results } = await this.db.prepare(sql).bind(...params).all();
		return results;
	}

	async markMessageRead(id: string, tenantId: string) {
		await this.db.prepare('UPDATE parent_messages SET is_read = 1, read_at = datetime(\'now\') WHERE id = ? AND tenant_id = ?').bind(id, tenantId).run();
	}

	async registerPushToken(tenantId: string, data: { parentId: string; token: string; platform?: string }) {
		const existing = await this.db.prepare('SELECT id FROM parent_push_tokens WHERE token = ?').bind(data.token).first<{ id: string }>();
		if (existing) {
			await this.db.prepare('UPDATE parent_push_tokens SET last_used_at = datetime(\'now\'), is_active = 1 WHERE id = ?').bind(existing.id).run();
		} else {
			await this.db.prepare(
				'INSERT INTO parent_push_tokens (id, tenant_id, parent_id, token, platform) VALUES (?,?,?,?,?)'
			).bind(crypto.randomUUID(), tenantId, data.parentId, data.token, data.platform || null).run();
		}
	}

	async removePushToken(tenantId: string, token: string) {
		await this.db.prepare('UPDATE parent_push_tokens SET is_active = 0 WHERE token = ?').bind(token).run();
	}

	async getParentDashboard(tenantId: string, parentId: string) {
		const students = await this.getLinkedStudents(tenantId, parentId);
		const result: any[] = [];
		for (const s of students) {
			const grades = await this.db.prepare(
				"SELECT COUNT(*) as total, AVG(CASE WHEN score >= 75 THEN 1 ELSE 0 END) * 100 as pass_pct FROM guru_nilai WHERE student_id = ? AND tenant_id = ?"
			).bind(s.student_id, tenantId).first<{ total: number; pass_pct: number }>();

			const attendance = await this.db.prepare(
				"SELECT COUNT(*) as total, SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present FROM attendance_records WHERE student_id = ? AND tenant_id = ?"
			).bind(s.student_id, tenantId).first<{ total: number; present: number }>();

			const invoices = await this.db.prepare(
				"SELECT COUNT(*) as unpaid FROM invoices WHERE student_id = ? AND tenant_id = ? AND status = 'unpaid'"
			).bind(s.student_id, tenantId).first<{ unpaid: number }>();

			result.push({
				student: s,
				grades: grades || { total: 0, pass_pct: 0 },
				attendance: attendance || { total: 0, present: 0 },
				unpaidInvoices: invoices?.unpaid || 0
			});
		}
		return result;
	}
}
