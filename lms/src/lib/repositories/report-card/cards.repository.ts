import type { D1Database } from '@cloudflare/workers-types';
import { ReportCardBatchesRepository } from './batches.repository';
import type { ReportCard } from './types.repository';

export class ReportCardCardsRepository extends ReportCardBatchesRepository {
	async getReportCard(id: string, tenantId: string): Promise<ReportCard | null> {
		return this.db.prepare(
			`SELECT * FROM report_cards WHERE id = ? AND tenant_id = ?`
		).bind(id, tenantId).first<ReportCard>();
	}
	async listReportCards(tenantId: string, options?: { batchId?: string; studentId?: string }): Promise<ReportCard[]> {
		let sql = `SELECT rc.*, u.display_name AS student_name, c.name AS class_name
			FROM report_cards rc
			LEFT JOIN users u ON u.id = rc.student_id
			LEFT JOIN classes c ON c.id = rc.class_id
			WHERE rc.tenant_id = ?`;
		const params: any[] = [tenantId];

		if (options?.batchId) {
			sql += ` AND rc.batch_id = ?`;
			params.push(options.batchId);
		}

		if (options?.studentId) {
			sql += ` AND rc.student_id = ?`;
			params.push(options.studentId);
		}

		sql += ` ORDER BY rc.created_at DESC`;

		const result = await this.db.prepare(sql).bind(...params).all<any>();
		return result.results || [];
	}
	async publishCard(id: string, tenantId: string, publishedBy: string): Promise<ReportCard | null> {
		const now = new Date().toISOString();

		await this.db.prepare(`
			UPDATE report_cards SET status = 'published', published_by = ?, published_at = ?, updated_at = ?
			WHERE id = ? AND tenant_id = ?
		`).bind(publishedBy, now, now, id, tenantId).run();

		return this.getReportCard(id, tenantId);
	}
	async archiveCard(id: string, tenantId: string): Promise<ReportCard | null> {
		const now = new Date().toISOString();

		await this.db.prepare(`
			UPDATE report_cards SET status = 'archived', archived_at = ?, updated_at = ?
			WHERE id = ? AND tenant_id = ?
		`).bind(now, now, id, tenantId).run();

		return this.getReportCard(id, tenantId);
	}

	// ==================== SECTIONS ====================
}
