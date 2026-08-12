import type { D1Database } from '@cloudflare/workers-types';
import { ReportCardTypes } from './types.repository';
import type { ReportCardTemplate, ReportCardTemplateInput, ReportCardTemplateUpdate } from './types.repository';

export class ReportCardTemplatesRepository extends ReportCardTypes {
	async getTemplates(tenantId: string, options?: { educationLevel?: string }): Promise<ReportCardTemplate[]> {
		let sql = `SELECT * FROM report_card_templates WHERE tenant_id = ?`;
		const params: any[] = [tenantId];

		if (options?.educationLevel) {
			sql += ` AND (education_level = ? OR education_level IS NULL)`;
			params.push(options.educationLevel);
		}

		sql += ` ORDER BY created_at DESC`;

		const result = await this.db.prepare(sql).bind(...params).all<ReportCardTemplate>();
		return result.results || [];
	}
	async createTemplate(tenantId: string, data: ReportCardTemplateInput): Promise<ReportCardTemplate> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		// If setting as default, unset existing defaults
		if (data.isDefault) {
			await this.db.prepare(
				`UPDATE report_card_templates SET is_default = 0 WHERE tenant_id = ?`
			).bind(tenantId).run();
		}

		await this.db.prepare(`
			INSERT INTO report_card_templates (id, tenant_id, name, description, education_level, html_template, css_style, is_default, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			id,
			tenantId,
			data.name,
			data.description || null,
			data.educationLevel || null,
			data.htmlTemplate,
			data.cssStyle || null,
			data.isDefault ? 1 : 0,
			now,
			now
		).run();

		const row = await this.db.prepare(
			`SELECT * FROM report_card_templates WHERE id = ?`
		).bind(id).first<ReportCardTemplate>();

		return row!;
	}
	async updateTemplate(id: string, tenantId: string, data: ReportCardTemplateUpdate): Promise<ReportCardTemplate | null> {
		const existing = await this.db.prepare(
			`SELECT * FROM report_card_templates WHERE id = ? AND tenant_id = ?`
		).bind(id, tenantId).first<ReportCardTemplate>();

		if (!existing) return null;

		// If setting as default, unset existing defaults
		if (data.isDefault) {
			await this.db.prepare(
				`UPDATE report_card_templates SET is_default = 0 WHERE tenant_id = ? AND id != ?`
			).bind(tenantId, id).run();
		}

		const now = new Date().toISOString();
		const updates: string[] = [];
		const params: any[] = [];

		if (data.name !== undefined) { updates.push('name = ?'); params.push(data.name); }
		if (data.description !== undefined) { updates.push('description = ?'); params.push(data.description); }
		if (data.educationLevel !== undefined) { updates.push('education_level = ?'); params.push(data.educationLevel); }
		if (data.htmlTemplate !== undefined) { updates.push('html_template = ?'); params.push(data.htmlTemplate); }
		if (data.cssStyle !== undefined) { updates.push('css_style = ?'); params.push(data.cssStyle); }
		if (data.isDefault !== undefined) { updates.push('is_default = ?'); params.push(data.isDefault ? 1 : 0); }

		if (updates.length === 0) return existing;

		updates.push('updated_at = ?');
		params.push(now);
		params.push(id, tenantId);

		await this.db.prepare(
			`UPDATE report_card_templates SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`
		).bind(...params).run();

		return this.db.prepare(
			`SELECT * FROM report_card_templates WHERE id = ?`
		).bind(id).first<ReportCardTemplate>();
	}
	async deleteTemplate(id: string, tenantId: string): Promise<boolean> {
		const result = await this.db.prepare(
			`DELETE FROM report_card_templates WHERE id = ? AND tenant_id = ?`
		).bind(id, tenantId).run();

		return result.success;
	}

	// ==================== BATCHES ====================
}
