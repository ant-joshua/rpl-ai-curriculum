import type { D1Database } from '@cloudflare/workers-types';
import { ReportCardCardsRepository } from './cards.repository';
import type { ReportCardSection, ReportCardSectionInput } from './types.repository';

export class ReportCardSectionsRepository extends ReportCardCardsRepository {
	async addSection(reportCardId: string, tenantId: string, data: ReportCardSectionInput): Promise<ReportCardSection | null> {
		const card = await this.getReportCard(reportCardId, tenantId);
		if (!card) return null;

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		const sectionDataJson = typeof data.sectionData === 'string' ? data.sectionData : JSON.stringify(data.sectionData);

		await this.db.prepare(`
			INSERT INTO report_card_sections (id, report_card_id, section_type, section_data, sort_order, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`).bind(id, reportCardId, data.sectionType, sectionDataJson, data.sortOrder, now).run();

		return this.db.prepare(
			`SELECT * FROM report_card_sections WHERE id = ?`
		).bind(id).first<ReportCardSection>();
	}
	async getSections(reportCardId: string, tenantId: string): Promise<ReportCardSection[]> {
		// Verify the card exists under this tenant
		const card = await this.getReportCard(reportCardId, tenantId);
		if (!card) return [];

		const result = await this.db.prepare(`
			SELECT * FROM report_card_sections WHERE report_card_id = ? ORDER BY sort_order ASC
		`).bind(reportCardId).all<ReportCardSection>();

		return result.results || [];
	}

	// ==================== TEACHER COMMENTS ====================
}
