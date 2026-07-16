import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

export interface NotificationChannel {
	id: string;
	tenant_id: string;
	name: string;
	channel_type: string;
	provider: string;
	is_active: number;
	config_json: string;
	created_at: string;
}

export interface NotificationTemplate {
	id: string;
	tenant_id: string;
	name: string;
	category: string;
	channel_type: string;
	subject: string;
	body_template: string;
	is_active: number;
	created_at: string;
}

export interface NotificationQueue {
	id: string;
	tenant_id: string;
	template_id: string;
	channel_type: string;
	recipient_id: string;
	recipient_address: string;
	subject: string;
	body: string;
	status: string;
	sent_at: string;
	delivered_at: string;
	error_message: string;
	retry_count: number;
	metadata: string;
	created_at: string;
}

export class NotificationRepository {
	static async getChannels(platform: { env: { DB: D1Database } }, tenantId: string): Promise<NotificationChannel[]> {
		const db = getDB(platform);
		const { results } = await db.prepare('SELECT * FROM notification_channels WHERE tenant_id = ? ORDER BY name').bind(tenantId).all<NotificationChannel>();
		return results;
	}

	static async createChannel(platform: { env: { DB: D1Database } }, tenantId: string, data: { name: string; channel_type: string; provider?: string; config_json?: string }): Promise<NotificationChannel> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO notification_channels (id, tenant_id, name, channel_type, provider, is_active, config_json) VALUES (?,?,?,?,?,1,?)'
		).bind(id, tenantId, data.name, data.channel_type, data.provider || null, data.config_json || null).run();
		return this.getById(platform, tenantId, id) as Promise<NotificationChannel>;
	}

	static async getById(platform: { env: { DB: D1Database } }, tenantId: string, id: string): Promise<NotificationChannel | null> {
		const db = getDB(platform);
		return db.prepare('SELECT * FROM notification_channels WHERE id = ? AND tenant_id = ?').bind(id, tenantId).first<NotificationChannel>();
	}

	static async updateChannel(platform: { env: { DB: D1Database } }, id: string, tenantId: string, data: { name?: string; is_active?: number; config_json?: string }): Promise<void> {
		const db = getDB(platform);
		const sets: string[] = [];
		const vals: any[] = [];
		if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
		if (data.is_active !== undefined) { sets.push('is_active = ?'); vals.push(data.is_active); }
		if (data.config_json !== undefined) { sets.push('config_json = ?'); vals.push(data.config_json); }
		if (sets.length === 0) return;
		vals.push(id, tenantId);
		await db.prepare(`UPDATE notification_channels SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
	}

	static async getTemplates(platform: { env: { DB: D1Database } }, tenantId: string, filters?: { category?: string }): Promise<NotificationTemplate[]> {
		const db = getDB(platform);
		let sql = 'SELECT * FROM notification_templates WHERE tenant_id = ?';
		const params: any[] = [tenantId];
		if (filters?.category) { sql += ' AND category = ?'; params.push(filters.category); }
		sql += ' ORDER BY name';
		const { results } = await db.prepare(sql).bind(...params).all<NotificationTemplate>();
		return results;
	}

	static async createTemplate(platform: { env: { DB: D1Database } }, tenantId: string, data: { name: string; category: string; channel_type: string; subject?: string; body_template: string }): Promise<NotificationTemplate> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO notification_templates (id, tenant_id, name, category, channel_type, subject, body_template, is_active) VALUES (?,?,?,?,?,?,?,1)'
		).bind(id, tenantId, data.name, data.category, data.channel_type, data.subject || null, data.body_template).run();
		return db.prepare('SELECT * FROM notification_templates WHERE id = ?').bind(id).first<NotificationTemplate>() as Promise<NotificationTemplate>;
	}

	static async updateTemplate(platform: { env: { DB: D1Database } }, id: string, tenantId: string, data: { name?: string; category?: string; subject?: string; body_template?: string; is_active?: number }): Promise<void> {
		const db = getDB(platform);
		const sets: string[] = [];
		const vals: any[] = [];
		if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
		if (data.category !== undefined) { sets.push('category = ?'); vals.push(data.category); }
		if (data.subject !== undefined) { sets.push('subject = ?'); vals.push(data.subject); }
		if (data.body_template !== undefined) { sets.push('body_template = ?'); vals.push(data.body_template); }
		if (data.is_active !== undefined) { sets.push('is_active = ?'); vals.push(data.is_active); }
		if (sets.length === 0) return;
		vals.push(id, tenantId);
		await db.prepare(`UPDATE notification_templates SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
	}

	static async deleteTemplate(platform: { env: { DB: D1Database } }, id: string, tenantId: string): Promise<void> {
		const db = getDB(platform);
		await db.prepare('DELETE FROM notification_templates WHERE id = ? AND tenant_id = ?').bind(id, tenantId).run();
	}

	static async queueNotification(platform: { env: { DB: D1Database } }, tenantId: string, data: { template_id?: string; channel_type: string; recipient_id?: string; recipient_address: string; subject?: string; body: string; metadata?: string }): Promise<string> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO notification_queue (id, tenant_id, template_id, channel_type, recipient_id, recipient_address, subject, body, status, metadata) VALUES (?,?,?,?,?,?,?,?,\'pending\',?)'
		).bind(id, tenantId, data.template_id || null, data.channel_type, data.recipient_id || null, data.recipient_address, data.subject || null, data.body, data.metadata || null).run();
		return id;
	}

	static async listNotifications(platform: { env: { DB: D1Database } }, tenantId: string, filters?: { status?: string; recipient_id?: string; limit?: number }): Promise<NotificationQueue[]> {
		const db = getDB(platform);
		let sql = 'SELECT * FROM notification_queue WHERE tenant_id = ?';
		const params: any[] = [tenantId];
		if (filters?.status) { sql += ' AND status = ?'; params.push(filters.status); }
		if (filters?.recipient_id) { sql += ' AND recipient_id = ?'; params.push(filters.recipient_id); }
		sql += ' ORDER BY created_at DESC';
		if (filters?.limit) { sql += ' LIMIT ?'; params.push(filters.limit); }
		const { results } = await db.prepare(sql).bind(...params).all<NotificationQueue>();
		return results;
	}

	static async getNotificationStats(platform: { env: { DB: D1Database } }, tenantId: string): Promise<{ sent: number; pending: number; delivered: number; failed: number }> {
		const db = getDB(platform);
		const rows = await db.prepare(
			"SELECT status, COUNT(*) as count FROM notification_queue WHERE tenant_id = ? GROUP BY status"
		).bind(tenantId).all<{ status: string; count: number }>();
		const stats = { sent: 0, pending: 0, delivered: 0, failed: 0 };
		for (const r of rows.results) {
			if (r.status === 'sent') stats.sent = r.count;
			else if (r.status === 'pending') stats.pending = r.count;
			else if (r.status === 'delivered') stats.delivered = r.count;
			else if (r.status === 'failed') stats.failed = r.count;
		}
		return stats;
	}

	static async getUserNotifications(platform: { env: { DB: D1Database } }, userId: string, tenantId: string, opts?: { unreadOnly?: boolean }): Promise<any[]> {
		const db = getDB(platform);
		let sql = `SELECT nq.*, nr.read_at FROM notification_queue nq LEFT JOIN notification_read nr ON nq.id = nr.notification_id AND nr.user_id = ? WHERE nq.tenant_id = ? AND nq.recipient_id = ?`;
		const params: any[] = [userId, tenantId, userId];
		if (opts?.unreadOnly) { sql += ' AND nr.id IS NULL'; }
		sql += ' ORDER BY nq.created_at DESC LIMIT 50';
		const { results } = await db.prepare(sql).bind(...params).all<any>();
		return results;
	}

	static async markAsRead(platform: { env: { DB: D1Database } }, userId: string, notificationId: string): Promise<void> {
		const db = getDB(platform);
		await db.prepare(
			'INSERT OR IGNORE INTO notification_read (id, tenant_id, user_id, notification_id) VALUES (?, (SELECT tenant_id FROM notification_queue WHERE id = ?), ?, ?)'
		).bind(crypto.randomUUID(), notificationId, userId, notificationId).run();
	}

	static async markAllAsRead(platform: { env: { DB: D1Database } }, userId: string, tenantId: string): Promise<void> {
		const db = getDB(platform);
		await db.prepare(
			`INSERT OR IGNORE INTO notification_read (id, tenant_id, user_id, notification_id)
			 SELECT DISTINCT ? || '_' || nq.id, ?, ?, nq.id FROM notification_queue nq
			 WHERE nq.tenant_id = ? AND nq.recipient_id = ? AND nq.id NOT IN (SELECT notification_id FROM notification_read WHERE user_id = ?)`
		).bind(userId, tenantId, userId, tenantId, userId, userId).run();
	}

	static async getUnreadCount(platform: { env: { DB: D1Database } }, userId: string, tenantId: string): Promise<number> {
		const db = getDB(platform);
		const row = await db.prepare(
			"SELECT COUNT(*) as count FROM notification_queue nq WHERE nq.tenant_id = ? AND nq.recipient_id = ? AND nq.id NOT IN (SELECT notification_id FROM notification_read WHERE user_id = ?)"
		).bind(tenantId, userId, userId).first<{ count: number }>();
		return row?.count || 0;
	}

	static async getPreferences(platform: { env: { DB: D1Database } }, userId: string, tenantId: string): Promise<any[]> {
		const db = getDB(platform);
		const { results } = await db.prepare(
			'SELECT * FROM notification_preferences WHERE tenant_id = ? AND user_id = ?'
		).bind(tenantId, userId).all();
		return results;
	}

	static async updatePreferences(platform: { env: { DB: D1Database } }, userId: string, tenantId: string, category: string, prefs: { email_enabled?: number; push_enabled?: number; sms_enabled?: number; in_app_enabled?: number }): Promise<void> {
		const db = getDB(platform);
		const existing = await db.prepare(
			'SELECT id FROM notification_preferences WHERE tenant_id = ? AND user_id = ? AND category = ?'
		).bind(tenantId, userId, category).first<{ id: string }>();
		if (existing) {
			const sets: string[] = [];
			const vals: any[] = [];
			if (prefs.email_enabled !== undefined) { sets.push('email_enabled = ?'); vals.push(prefs.email_enabled); }
			if (prefs.push_enabled !== undefined) { sets.push('push_enabled = ?'); vals.push(prefs.push_enabled); }
			if (prefs.sms_enabled !== undefined) { sets.push('sms_enabled = ?'); vals.push(prefs.sms_enabled); }
			if (prefs.in_app_enabled !== undefined) { sets.push('in_app_enabled = ?'); vals.push(prefs.in_app_enabled); }
			if (sets.length === 0) return;
			vals.push(existing.id);
			await db.prepare(`UPDATE notification_preferences SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
		} else {
			await db.prepare(
				'INSERT INTO notification_preferences (id, tenant_id, user_id, category, email_enabled, push_enabled, sms_enabled, in_app_enabled) VALUES (?,?,?,?,?,?,?,?)'
			).bind(crypto.randomUUID(), tenantId, userId, category, prefs.email_enabled ?? 1, prefs.push_enabled ?? 1, prefs.sms_enabled ?? 0, prefs.in_app_enabled ?? 1).run();
		}
	}

	static async registerToken(platform: { env: { DB: D1Database } }, tenantId: string, data: { user_id: string; token: string; platform?: string }): Promise<void> {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT id FROM push_tokens WHERE token = ?').bind(data.token).first<{ id: string }>();
		if (existing) {
			await db.prepare('UPDATE push_tokens SET last_used_at = datetime(\'now\'), is_active = 1 WHERE id = ?').bind(existing.id).run();
		} else {
			await db.prepare(
				'INSERT INTO push_tokens (id, tenant_id, user_id, token, platform, is_active) VALUES (?,?,?,?,?,1)'
			).bind(crypto.randomUUID(), tenantId, data.user_id, data.token, data.platform || null).run();
		}
	}

	static async removeToken(platform: { env: { DB: D1Database } }, token: string): Promise<void> {
		const db = getDB(platform);
		await db.prepare('UPDATE push_tokens SET is_active = 0 WHERE token = ?').bind(token).run();
	}
}
