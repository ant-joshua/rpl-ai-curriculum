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

export class ReportCardTypes {
	protected db: D1Database;
	protected tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}
}
