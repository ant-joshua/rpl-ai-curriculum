import type { D1Database } from '@cloudflare/workers-types';
import { ReportCardTemplatesRepository } from './templates.repository';
import type { ReportCardBatch, ReportCardBatchInput } from './types.repository';

export class ReportCardBatchesRepository extends ReportCardTemplatesRepository {
	async createBatch(tenantId: string, data: ReportCardBatchInput, createdBy: string): Promise<ReportCardBatch> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		const classIdsJson = JSON.stringify(data.classIds);

		await this.db.prepare(`
			INSERT INTO report_card_batches (id, tenant_id, template_id, academic_year, semester, grade_level_id, class_ids, total_students, generated_count, failed_count, status, created_by, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'pending', ?, ?, ?)
		`).bind(
			id,
			tenantId,
			data.templateId,
			data.academicYear,
			data.semester,
			data.gradeLevelId,
			classIdsJson,
			createdBy,
			now,
			now
		).run();

		const row = await this.db.prepare(
			`SELECT * FROM report_card_batches WHERE id = ?`
		).bind(id).first<ReportCardBatch>();

		return row!;
	}
	async listBatches(tenantId: string, options?: { status?: string }): Promise<ReportCardBatch[]> {
		let sql = `SELECT * FROM report_card_batches WHERE tenant_id = ?`;
		const params: any[] = [tenantId];

		if (options?.status) {
			sql += ` AND status = ?`;
			params.push(options.status);
		}

		sql += ` ORDER BY created_at DESC`;

		const result = await this.db.prepare(sql).bind(...params).all<ReportCardBatch>();
		return result.results || [];
	}
	async getBatch(id: string, tenantId: string): Promise<ReportCardBatch | null> {
		return this.db.prepare(
			`SELECT * FROM report_card_batches WHERE id = ? AND tenant_id = ?`
		).bind(id, tenantId).first<ReportCardBatch>();
	}
	async updateBatchProgress(id: string, tenantId: string, data: { generatedCount?: number; failedCount?: number; status?: string }): Promise<ReportCardBatch | null> {
		const existing = await this.getBatch(id, tenantId);
		if (!existing) return null;

		const now = new Date().toISOString();
		const updates: string[] = [];
		const params: any[] = [];

		if (data.generatedCount !== undefined) { updates.push('generated_count = ?'); params.push(data.generatedCount); }
		if (data.failedCount !== undefined) { updates.push('failed_count = ?'); params.push(data.failedCount); }
		if (data.status !== undefined) { updates.push('status = ?'); params.push(data.status); }

		if (updates.length === 0) return existing;

		updates.push('updated_at = ?');
		params.push(now);
		params.push(id, tenantId);

		await this.db.prepare(
			`UPDATE report_card_batches SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`
		).bind(...params).run();

		return this.getBatch(id, tenantId);
	}

	// ==================== REPORT CARDS ====================
}
