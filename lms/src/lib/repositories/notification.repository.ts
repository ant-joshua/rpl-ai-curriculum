import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

// ── Types ────────────────────────────────────────────
export interface AppNotification {
	id: string;
	tenant_id: string;
	user_id: string;
	type: 'assessment' | 'assignment' | 'attendance' | 'payment' | 'grade' | 'system' | 'announcement';
	title: string;
	body: string | null;
	reference_type: string | null;
	reference_id: string | null;
	is_read: number;
	is_archived: number;
	channel: 'in_app' | 'email' | 'whatsapp';
	status: 'pending' | 'sent' | 'failed' | 'queued';
	sent_at: string | null;
	created_at: string;
}

export interface NotificationTemplate {
	id: string;
	tenant_id: string;
	code: string;
	type: string;
	channels: string;
	subject: string | null;
	body_template: string;
	variables: string;
	is_active: number;
	created_at: string;
}

export interface NotificationQueueItem {
	id: string;
	tenant_id: string;
	user_id: string | null;
	channel: 'in_app' | 'email' | 'whatsapp';
	recipient: string | null;
	subject: string | null;
	body: string;
	priority: number;
	status: 'queued' | 'processing' | 'sent' | 'failed';
	attempts: number;
	max_attempts: number;
	last_error: string | null;
	scheduled_at: string | null;
	sent_at: string | null;
	created_at: string;
}

export interface WaTemplate {
	id: string;
	tenant_id: string;
	code: string;
	template_name: string;
	language: string;
	body_template: string;
	variables: string;
	is_active: number;
	created_at: string;
}

export interface NotificationPreferences {
	category: string;
	in_app: boolean;
	email: boolean;
	whatsapp: boolean;
}

// ── Default preferences per notification type ───
const DEFAULT_PREFS: Record<string, NotificationPreferences> = {
	assessment:  { category: 'assessment',  in_app: true, email: true,  whatsapp: false },
	assignment:  { category: 'assignment',  in_app: true, email: true,  whatsapp: false },
	attendance:  { category: 'attendance',  in_app: true, email: false, whatsapp: false },
	payment:     { category: 'payment',     in_app: true, email: true,  whatsapp: true  },
	grade:       { category: 'grade',       in_app: true, email: true,  whatsapp: false },
	system:      { category: 'system',      in_app: true, email: false, whatsapp: false },
	announcement:{ category: 'announcement',in_app: true, email: true,  whatsapp: true  },
};

// ── NotificationRepository ──────────────────────────
export class NotificationRepository {
	// ─── NOTIFICATIONS (user-facing in-app) ───────
	static async getUserNotifications(
		platform: { env: { DB: D1Database } },
		userId: string,
		tenantId: string,
		opts?: { unreadOnly?: boolean; type?: string; limit?: number; offset?: number }
	): Promise<{ rows: AppNotification[]; total: number; unreadCount: number }> {
		const db = getDB(platform);
		const params: any[] = [tenantId, userId];
		const where = ['n.tenant_id = ?', 'n.user_id = ?'];

		if (opts?.unreadOnly) {
			where.push('n.is_read = 0');
		}
		if (opts?.type) {
			where.push('n.type = ?');
			params.push(opts.type);
		}

		const whereClause = where.join(' AND ');
		const limit = opts?.limit ?? 20;
		const offset = opts?.offset ?? 0;

		const countRow = await db.prepare(
			`SELECT COUNT(*) as count FROM notifications n WHERE ${whereClause}`
		).bind(...params).first<{ count: number }>();
		const total = countRow?.count ?? 0;

		const unreadRow = await db.prepare(
			'SELECT COUNT(*) as count FROM notifications WHERE tenant_id = ? AND user_id = ? AND is_read = 0'
		).bind(tenantId, userId).first<{ count: number }>();
		const unreadCount = unreadRow?.count ?? 0;

		const { results } = await db.prepare(
			`SELECT * FROM notifications n WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
		).bind(...params, limit, offset).all<AppNotification>();

		return { rows: results || [], total, unreadCount };
	}

	static async markAsRead(userId: string, notificationId: string, platform: { env: { DB: D1Database } }): Promise<boolean> {
		const db = getDB(platform);
		const result = await db.prepare(
			'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?'
		).bind(notificationId, userId).run();
		return (result.meta?.changes ?? 0) > 0;
	}

	static async markAllAsRead(userId: string, tenantId: string, platform: { env: { DB: D1Database } }): Promise<void> {
		const db = getDB(platform);
		await db.prepare(
			'UPDATE notifications SET is_read = 1 WHERE tenant_id = ? AND user_id = ? AND is_read = 0'
		).bind(tenantId, userId).run();
	}

	static async archiveNotification(userId: string, notificationId: string, platform: { env: { DB: D1Database } }): Promise<boolean> {
		const db = getDB(platform);
		const result = await db.prepare(
			'UPDATE notifications SET is_archived = 1 WHERE id = ? AND user_id = ?'
		).bind(notificationId, userId).run();
		return (result.meta?.changes ?? 0) > 0;
	}

	static async createNotification(
		platform: { env: { DB: D1Database } },
		data: {
			tenant_id: string;
			user_id: string;
			type: string;
			title: string;
			body?: string;
			reference_type?: string;
			reference_id?: string;
			channel?: string;
			status?: string;
		}
	): Promise<AppNotification> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			`INSERT INTO notifications (id, tenant_id, user_id, type, title, body, reference_type, reference_id, channel, status, sent_at, created_at)
			 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
		).bind(
			id, data.tenant_id, data.user_id, data.type, data.title,
			data.body || null, data.reference_type || null, data.reference_id || null,
			data.channel || 'in_app', data.status || 'sent',
			data.status === 'sent' ? now : null, now
		).run();
		return db.prepare('SELECT * FROM notifications WHERE id = ?').bind(id).first<AppNotification>() as Promise<AppNotification>;
	}

	static async createNotificationForAllUsers(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		data: {
			type: string;
			title: string;
			body?: string;
			reference_type?: string;
			reference_id?: string;
			channel?: string;
		}
	): Promise<number> {
		const db = getDB(platform);
		const now = new Date().toISOString();
		const id = crypto.randomUUID();

		// Insert into a batch table first, then fan out via a background process
		// For immediate broadcast, we INSERT into notifications per user
		const { results: users } = await db.prepare(
			'SELECT id FROM users WHERE tenant_id = ? AND is_active = 1'
		).bind(tenantId).all<{ id: string }>();
		if (!users || users.length === 0) return 0;

		// Batch insert in chunks of 50
		const chunkSize = 50;
		let count = 0;
		for (let i = 0; i < users.length; i += chunkSize) {
			const chunk = users.slice(i, i + chunkSize);
			const values = chunk.map(u => {
				const nid = crypto.randomUUID();
				return `('${nid}','${tenantId}','${u.id}','${data.type}','${data.title.replace(/'/g, "''")}',${data.body ? `'${data.body.replace(/'/g, "''")}'` : 'NULL'},${data.reference_type ? `'${data.reference_type}'` : 'NULL'},${data.reference_id ? `'${data.reference_id}'` : 'NULL'},${data.channel || "'in_app'"},'sent','${now}','${now}')`;
			}).join(',');
			await db.prepare(
				`INSERT INTO notifications (id, tenant_id, user_id, type, title, body, reference_type, reference_id, channel, status, sent_at, created_at) VALUES ${values}`
			).run();
			count += chunk.length;
		}
		return count;
	}

	// ─── TEMPLATES ──────────────────────────────
	static async getTemplates(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		filters?: { type?: string }
	): Promise<NotificationTemplate[]> {
		const db = getDB(platform);
		let sql = 'SELECT * FROM notification_templates WHERE tenant_id = ?';
		const params: any[] = [tenantId];
		if (filters?.type) { sql += ' AND type = ?'; params.push(filters.type); }
		sql += ' ORDER BY code';
		const { results } = await db.prepare(sql).bind(...params).all<NotificationTemplate>();
		return results;
	}

	static async getTemplateById(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string
	): Promise<NotificationTemplate | null> {
		const db = getDB(platform);
		return db.prepare('SELECT * FROM notification_templates WHERE id = ? AND tenant_id = ?').bind(id, tenantId).first<NotificationTemplate>();
	}

	static async createTemplate(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		data: { code: string; type: string; channels?: string; subject?: string; body_template: string; variables?: string }
	): Promise<NotificationTemplate> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO notification_templates (id, tenant_id, code, type, channels, subject, body_template, variables) VALUES (?,?,?,?,?,?,?,?)'
		).bind(id, tenantId, data.code, data.type, data.channels || 'in_app', data.subject || null, data.body_template, data.variables || '[]').run();
		return db.prepare('SELECT * FROM notification_templates WHERE id = ?').bind(id).first<NotificationTemplate>() as Promise<NotificationTemplate>;
	}

	static async updateTemplate(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string,
		data: { code?: string; type?: string; channels?: string; subject?: string; body_template?: string; variables?: string; is_active?: number }
	): Promise<void> {
		const db = getDB(platform);
		const sets: string[] = [];
		const vals: any[] = [];
		if (data.code !== undefined) { sets.push('code = ?'); vals.push(data.code); }
		if (data.type !== undefined) { sets.push('type = ?'); vals.push(data.type); }
		if (data.channels !== undefined) { sets.push('channels = ?'); vals.push(data.channels); }
		if (data.subject !== undefined) { sets.push('subject = ?'); vals.push(data.subject); }
		if (data.body_template !== undefined) { sets.push('body_template = ?'); vals.push(data.body_template); }
		if (data.variables !== undefined) { sets.push('variables = ?'); vals.push(data.variables); }
		if (data.is_active !== undefined) { sets.push('is_active = ?'); vals.push(data.is_active); }
		if (sets.length === 0) return;
		vals.push(id, tenantId);
		await db.prepare(`UPDATE notification_templates SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
	}

	static async deleteTemplate(platform: { env: { DB: D1Database } }, id: string, tenantId: string): Promise<void> {
		const db = getDB(platform);
		await db.prepare('DELETE FROM notification_templates WHERE id = ? AND tenant_id = ?').bind(id, tenantId).run();
	}

	// ─── QUEUE ──────────────────────────────────
	static async enqueue(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		data: {
			user_id?: string;
			channel: string;
			recipient?: string;
			subject?: string;
			body: string;
			priority?: number;
			scheduled_at?: string;
			max_attempts?: number;
		}
	): Promise<string> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO notification_queue (id, tenant_id, user_id, channel, recipient, subject, body, priority, max_attempts, scheduled_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
		).bind(
			id, tenantId, data.user_id || null, data.channel, data.recipient || null,
			data.subject || null, data.body, data.priority ?? 0, data.max_attempts ?? 3,
			data.scheduled_at || null
		).run();
		return id;
	}

	static async listQueue(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		filters?: { status?: string; channel?: string; limit?: number; offset?: number }
	): Promise<{ rows: NotificationQueueItem[]; total: number }> {
		const db = getDB(platform);
		const params: any[] = [tenantId];
		const where = ['tenant_id = ?'];
		if (filters?.status) { where.push('status = ?'); params.push(filters.status); }
		if (filters?.channel) { where.push('channel = ?'); params.push(filters.channel); }
		const whereClause = where.join(' AND ');
		const limit = filters?.limit ?? 50;
		const offset = filters?.offset ?? 0;

		const countRow = await db.prepare(
			`SELECT COUNT(*) as count FROM notification_queue WHERE ${whereClause}`
		).bind(...params).first<{ count: number }>();
		const total = countRow?.count ?? 0;

		const { results } = await db.prepare(
			`SELECT * FROM notification_queue WHERE ${whereClause} ORDER BY priority DESC, created_at DESC LIMIT ? OFFSET ?`
		).bind(...params, limit, offset).all<NotificationQueueItem>();
		return { rows: results || [], total };
	}

	static async retryFailed(platform: { env: { DB: D1Database } }, tenantId: string, maxItems?: number): Promise<number> {
		const db = getDB(platform);
		const limit = maxItems ?? 50;
		const result = await db.prepare(
			`UPDATE notification_queue SET status = 'queued', attempts = 0, last_error = NULL
			 WHERE tenant_id = ? AND status = 'failed' AND attempts < max_attempts
			 LIMIT ?`
		).bind(tenantId, limit).run();
		return result.meta?.changes ?? 0;
	}

	static async getQueueStats(platform: { env: { DB: D1Database } }, tenantId: string): Promise<Record<string, number>> {
		const db = getDB(platform);
		const rows = await db.prepare(
			'SELECT status, COUNT(*) as count FROM notification_queue WHERE tenant_id = ? GROUP BY status'
		).bind(tenantId).all<{ status: string; count: number }>();
		const stats: Record<string, number> = { queued: 0, processing: 0, sent: 0, failed: 0 };
		for (const r of rows.results) {
			stats[r.status] = r.count;
		}
		return stats;
	}

	// ─── WA TEMPLATES ───────────────────────────
	static async getWaTemplates(platform: { env: { DB: D1Database } }, tenantId: string): Promise<WaTemplate[]> {
		const db = getDB(platform);
		const { results } = await db.prepare('SELECT * FROM wa_templates WHERE tenant_id = ? ORDER BY code').bind(tenantId).all<WaTemplate>();
		return results;
	}

	static async createWaTemplate(platform: { env: { DB: D1Database } }, tenantId: string, data: { code: string; template_name: string; language?: string; body_template: string; variables?: string }): Promise<WaTemplate> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO wa_templates (id, tenant_id, code, template_name, language, body_template, variables) VALUES (?,?,?,?,?,?,?)'
		).bind(id, tenantId, data.code, data.template_name, data.language || 'id', data.body_template, data.variables || '[]').run();
		return db.prepare('SELECT * FROM wa_templates WHERE id = ?').bind(id).first<WaTemplate>() as Promise<WaTemplate>;
	}

	// ─── PREFERENCES (stored as JSON in user meta or notification_preferences) ─────
	static async getPreferences(platform: { env: { DB: D1Database } }, userId: string, tenantId: string): Promise<NotificationPreferences[]> {
		const db = getDB(platform);
		const { results } = await db.prepare(
			'SELECT * FROM notification_preferences WHERE tenant_id = ? AND user_id = ? ORDER BY category'
		).bind(tenantId, userId).all<any>();
		if (results.length > 0) {
			return results.map(r => ({
				category: r.category,
				in_app: r.in_app_enabled === 1,
				email: r.email_enabled === 1,
				whatsapp: r.sms_enabled === 1,
			}));
		}
		// Return defaults
		return Object.values(DEFAULT_PREFS);
	}

	static async updatePreferences(
		platform: { env: { DB: D1Database } },
		userId: string,
		tenantId: string,
		prefs: NotificationPreferences
	): Promise<void> {
		const db = getDB(platform);
		const existing = await db.prepare(
			'SELECT id FROM notification_preferences WHERE tenant_id = ? AND user_id = ? AND category = ?'
		).bind(tenantId, userId, prefs.category).first<{ id: string }>();
		if (existing) {
			await db.prepare(
				'UPDATE notification_preferences SET in_app_enabled = ?, email_enabled = ?, sms_enabled = ? WHERE id = ?'
			).bind(prefs.in_app ? 1 : 0, prefs.email ? 1 : 0, prefs.whatsapp ? 1 : 0, existing.id).run();
		} else {
			await db.prepare(
				'INSERT INTO notification_preferences (id, tenant_id, user_id, category, in_app_enabled, email_enabled, sms_enabled) VALUES (?,?,?,?,?,?,?)'
			).bind(crypto.randomUUID(), tenantId, userId, prefs.category, prefs.in_app ? 1 : 0, prefs.email ? 1 : 0, prefs.whatsapp ? 1 : 0).run();
		}
	}
}
