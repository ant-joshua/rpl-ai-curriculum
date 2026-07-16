import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

export class SurveyRepository {
	private db: D1Database;

	constructor(platform: any) {
		this.db = getDB(platform);
	}

	async getTemplates(tenantId: string, filters?: { survey_type?: string }): Promise<any[]> {
		let sql = 'SELECT * FROM survey_templates WHERE tenant_id = ?';
		const params: any[] = [tenantId];
		if (filters?.survey_type) { sql += ' AND survey_type = ?'; params.push(filters.survey_type); }
		sql += ' ORDER BY name';
		const { results } = await this.db.prepare(sql).bind(...params).all();
		return results;
	}

	async createTemplate(tenantId: string, data: { name: string; description?: string; survey_type?: string; is_anonymous?: number }): Promise<any> {
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO survey_templates (id, tenant_id, name, description, survey_type, is_anonymous, is_active) VALUES (?,?,?,?,?,?,1)'
		).bind(id, tenantId, data.name, data.description || null, data.survey_type || 'feedback', data.is_anonymous ?? 1).run();
		return this.db.prepare('SELECT * FROM survey_templates WHERE id = ?').bind(id).first();
	}

	async updateTemplate(id: string, tenantId: string, data: any): Promise<void> {
		const sets: string[] = [];
		const vals: any[] = [];
		for (const [k, v] of Object.entries(data)) {
			if (v !== undefined) { sets.push(`${k} = ?`); vals.push(v); }
		}
		if (sets.length === 0) return;
		vals.push(id, tenantId);
		await this.db.prepare(`UPDATE survey_templates SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
	}

	async deleteTemplate(id: string, tenantId: string): Promise<void> {
		await this.db.prepare('DELETE FROM survey_templates WHERE id = ? AND tenant_id = ?').bind(id, tenantId).run();
	}

	async getQuestions(tenantId: string, templateId: string): Promise<any[]> {
		const { results } = await this.db.prepare('SELECT * FROM survey_questions WHERE tenant_id = ? AND template_id = ? ORDER BY sort_order').bind(tenantId, templateId).all();
		return results;
	}

	async createQuestion(tenantId: string, data: { template_id: string; question_text: string; question_type: string; options?: string; required?: number; sort_order?: number }): Promise<any> {
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO survey_questions (id, tenant_id, template_id, question_text, question_type, options, required, sort_order) VALUES (?,?,?,?,?,?,?,?)'
		).bind(id, tenantId, data.template_id, data.question_text, data.question_type, data.options || null, data.required ?? 1, data.sort_order ?? 0).run();
		return this.db.prepare('SELECT * FROM survey_questions WHERE id = ?').bind(id).first();
	}

	async updateQuestion(id: string, tenantId: string, data: any): Promise<void> {
		const sets: string[] = [];
		const vals: any[] = [];
		for (const [k, v] of Object.entries(data)) {
			if (v !== undefined) { sets.push(`${k} = ?`); vals.push(v); }
		}
		if (sets.length === 0) return;
		vals.push(id, tenantId);
		await this.db.prepare(`UPDATE survey_questions SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
	}

	async deleteQuestion(id: string, tenantId: string): Promise<void> {
		await this.db.prepare('DELETE FROM survey_questions WHERE id = ? AND tenant_id = ?').bind(id, tenantId).run();
	}

	async createInstance(tenantId: string, data: { template_id: string; title: string; target_type: string; target_id?: string; start_date?: string; end_date?: string }): Promise<any> {
		const id = crypto.randomUUID();
		await this.db.prepare(
			'INSERT INTO survey_instances (id, tenant_id, template_id, title, target_type, target_id, start_date, end_date, status) VALUES (?,?,?,?,?,?,?,?,\'draft\')'
		).bind(id, tenantId, data.template_id, data.title, data.target_type, data.target_id || null, data.start_date || null, data.end_date || null).run();
		return this.db.prepare('SELECT * FROM survey_instances WHERE id = ?').bind(id).first();
	}

	async listInstances(tenantId: string, filters?: { status?: string }): Promise<any[]> {
		let sql = 'SELECT si.*, st.name as template_name FROM survey_instances si LEFT JOIN survey_templates st ON si.template_id = st.id WHERE si.tenant_id = ?';
		const params: any[] = [tenantId];
		if (filters?.status) { sql += ' AND si.status = ?'; params.push(filters.status); }
		sql += ' ORDER BY si.created_at DESC';
		const { results } = await this.db.prepare(sql).bind(...params).all();
		return results;
	}

	async getInstance(id: string, tenantId: string): Promise<any | null> {
		return await this.db.prepare('SELECT si.*, st.name as template_name FROM survey_instances si LEFT JOIN survey_templates st ON si.template_id = st.id WHERE si.id = ? AND si.tenant_id = ?').bind(id, tenantId).first();
	}

	async updateInstanceStatus(id: string, tenantId: string, status: string): Promise<void> {
		await this.db.prepare('UPDATE survey_instances SET status = ? WHERE id = ? AND tenant_id = ?').bind(status, id, tenantId).run();
	}

	async submitResponse(tenantId: string, instanceId: string, respondentId: string | null, answers: { question_id: string; answer_text?: string; answer_numeric?: number }[]): Promise<void> {
		const responseId = crypto.randomUUID();
		const anonymous = respondentId === null;
		await this.db.prepare(
			'INSERT INTO survey_responses (id, tenant_id, instance_id, respondent_id, completed, completed_at) VALUES (?,?,?,?,1,datetime(\'now\'))'
		).bind(responseId, tenantId, instanceId, anonymous ? null : respondentId).run();

		for (const ans of answers) {
			await this.db.prepare(
				'INSERT INTO survey_answers (id, tenant_id, response_id, question_id, answer_text, answer_numeric) VALUES (?,?,?,?,?,?)'
			).bind(crypto.randomUUID(), tenantId, responseId, ans.question_id, ans.answer_text || null, ans.answer_numeric || null).run();
		}

		await this.db.prepare('UPDATE survey_instances SET response_count = response_count + 1 WHERE id = ?').bind(instanceId).run();
	}

	async getResponses(tenantId: string, instanceId: string): Promise<any[]> {
		const { results } = await this.db.prepare(
			'SELECT sr.*, u.display_name as respondent_name FROM survey_responses sr LEFT JOIN users u ON sr.respondent_id = u.id WHERE sr.tenant_id = ? AND sr.instance_id = ? ORDER BY sr.completed_at DESC'
		).bind(tenantId, instanceId).all();
		return results;
	}

	async getAnalytics(tenantId: string, instanceId: string): Promise<any[]> {
		const { results } = await this.db.prepare(
			`SELECT sq.id as question_id, sq.question_text, sq.question_type,
			 AVG(sa.answer_numeric) as avg_numeric,
			 COUNT(sa.id) as response_count
			 FROM survey_questions sq
			 LEFT JOIN survey_answers sa ON sq.id = sa.question_id
			 LEFT JOIN survey_responses sr ON sa.response_id = sr.id AND sr.instance_id = ?
			 WHERE sq.tenant_id = ? AND sq.template_id = (SELECT template_id FROM survey_instances WHERE id = ?)
			 GROUP BY sq.id
			 ORDER BY sq.sort_order`
		).bind(instanceId, tenantId, instanceId).all();
		return results;
	}

	async getStats(tenantId: string): Promise<any> {
		const templates = await this.db.prepare('SELECT COUNT(*) as count FROM survey_templates WHERE tenant_id = ?').bind(tenantId).first<{count: number}>();
		const totalInstances = await this.db.prepare('SELECT COUNT(*) as count FROM survey_instances WHERE tenant_id = ?').bind(tenantId).first<{count: number}>();
		const activeInstances = await this.db.prepare("SELECT COUNT(*) as count FROM survey_instances WHERE tenant_id = ? AND status = 'active'").bind(tenantId).first<{count: number}>();
		const completed = await this.db.prepare('SELECT COUNT(*) as count FROM survey_responses WHERE tenant_id = ?').bind(tenantId).first<{count: number}>();
		return {
			totalTemplates: templates?.count || 0,
			totalInstances: totalInstances?.count || 0,
			activeInstances: activeInstances?.count || 0,
			completedResponses: completed?.count || 0
		};
	}
}
