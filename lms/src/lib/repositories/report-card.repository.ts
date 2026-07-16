import type { D1Database } from '@cloudflare/workers-types';

// ---------- Interfaces ----------

export interface ReportCardTemplate {
	id: string;
	tenant_id: string;
	name: string;
	description: string | null;
	education_level: string | null;
	html_template: string;
	css_style: string | null;
	is_default: number;
	created_at: string;
	updated_at: string;
}

export interface ReportCardTemplateInput {
	name: string;
	description?: string;
	educationLevel?: string;
	htmlTemplate: string;
	cssStyle?: string;
	isDefault?: boolean;
}

export interface ReportCardTemplateUpdate {
	name?: string;
	description?: string;
	educationLevel?: string;
	htmlTemplate?: string;
	cssStyle?: string;
	isDefault?: boolean;
}

export interface ReportCardBatch {
	id: string;
	tenant_id: string;
	template_id: string;
	academic_year: string;
	semester: number;
	grade_level_id: string;
	class_ids: string;
	total_students: number;
	generated_count: number;
	failed_count: number;
	status: 'pending' | 'generating' | 'completed' | 'failed';
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface ReportCardBatchInput {
	templateId: string;
	academicYear: string;
	semester: number;
	gradeLevelId: string;
	classIds: string[];
}

export interface ReportCard {
	id: string;
	tenant_id: string;
	batch_id: string | null;
	template_id: string;
	student_id: string;
	class_id: string;
	academic_year: string;
	semester: number;
	status: 'draft' | 'published' | 'archived';
	rendered_html: string | null;
	published_by: string | null;
	published_at: string | null;
	archived_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface ReportCardSection {
	id: string;
	report_card_id: string;
	section_type: string;
	section_data: string;
	sort_order: number;
	created_at: string;
}

export interface ReportCardSectionInput {
	sectionType: string;
	sectionData: any;
	sortOrder: number;
}

export interface TeacherComment {
	id: string;
	tenant_id: string;
	student_id: string;
	class_subject_id: string;
	academic_year: string;
	semester: number;
	comment: string;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface TeacherCommentInput {
	studentId: string;
	classSubjectId: string;
	academicYear: string;
	semester: number;
	comment: string;
}

export interface TeacherCommentUpdate {
	comment: string;
}

// ---------- Repository ----------

export class ReportCardRepository {
	private db: D1Database;
	private tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}

	// ==================== TEMPLATES ====================

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

	async getComments(tenantId: string, options?: { studentId?: string; classSubjectId?: string; academicYear?: string; semester?: number }): Promise<any[]> {
		let sql = `SELECT tc.*, u.display_name AS student_name, s.name AS subject_name
			FROM teacher_comments tc
			LEFT JOIN users u ON u.id = tc.student_id
			LEFT JOIN class_subjects cs ON cs.id = tc.class_subject_id
			LEFT JOIN subjects s ON s.id = cs.subject_id
			WHERE tc.tenant_id = ?`;
		const params: any[] = [tenantId];

		if (options?.studentId) {
			sql += ` AND tc.student_id = ?`;
			params.push(options.studentId);
		}

		if (options?.classSubjectId) {
			sql += ` AND tc.class_subject_id = ?`;
			params.push(options.classSubjectId);
		}

		if (options?.academicYear) {
			sql += ` AND tc.academic_year = ?`;
			params.push(options.academicYear);
		}

		if (options?.semester !== undefined) {
			sql += ` AND tc.semester = ?`;
			params.push(options.semester);
		}

		sql += ` ORDER BY tc.created_at DESC`;

		const result = await this.db.prepare(sql).bind(...params).all<any>();
		return result.results || [];
	}

	async createComment(tenantId: string, data: TeacherCommentInput, createdBy: string): Promise<TeacherComment | null> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db.prepare(`
			INSERT INTO teacher_comments (id, tenant_id, student_id, class_subject_id, academic_year, semester, comment, created_by, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			id,
			tenantId,
			data.studentId,
			data.classSubjectId,
			data.academicYear,
			data.semester,
			data.comment,
			createdBy,
			now,
			now
		).run();

		return this.db.prepare(
			`SELECT * FROM teacher_comments WHERE id = ?`
		).bind(id).first<TeacherComment>();
	}

	async updateComment(id: string, tenantId: string, data: TeacherCommentUpdate): Promise<TeacherComment | null> {
		const existing = await this.db.prepare(
			`SELECT * FROM teacher_comments WHERE id = ? AND tenant_id = ?`
		).bind(id, tenantId).first<TeacherComment>();

		if (!existing) return null;

		const now = new Date().toISOString();

		await this.db.prepare(`
			UPDATE teacher_comments SET comment = ?, updated_at = ?
			WHERE id = ? AND tenant_id = ?
		`).bind(data.comment, now, id, tenantId).run();

		return this.db.prepare(
			`SELECT * FROM teacher_comments WHERE id = ?`
		).bind(id).first<TeacherComment>();
	}
}
