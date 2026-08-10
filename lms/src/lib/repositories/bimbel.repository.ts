import type { D1Database } from '@cloudflare/workers-types';

// ── Tryout Batch ──

export interface BatchData {
	batch_id?: string;
	title?: string;
	date?: string;
	duration_minutes?: number;
	question_count?: number;
	subjects?: string;
}

export interface BatchRow {
	id: string;
	tenant_id: string;
	batch_id: string | null;
	title: string | null;
	date: string | null;
	duration_minutes: number;
	question_count: number;
	subjects: string | null;
	created_at: string;
	participant_count?: number;
}

// ── Tryout Participant ──

export interface ParticipantData {
	tryout_batch_id: string;
	user_id: string;
	session_id?: string;
	total_score?: number;
	rank?: number;
	subject_scores?: string;
	status?: string;
}

export interface ParticipantRow {
	id: string;
	tryout_batch_id: string;
	user_id: string;
	session_id: string | null;
	total_score: number | null;
	rank: number | null;
	subject_scores: string | null;
	status: string;
	created_at: string;
	display_name?: string;
	email?: string;
	username?: string;
}

// ── Tryout Analysis ──

export interface AnalysisData {
	tryout_batch_id: string;
	question_id: string;
	correct_count?: number;
	wrong_count?: number;
	skip_count?: number;
	difficulty_index?: number;
	discrimination_index?: number;
}

export interface AnalysisRow {
	id: string;
	tryout_batch_id: string;
	question_id: string;
	correct_count: number;
	wrong_count: number;
	skip_count: number;
	difficulty_index: number | null;
	discrimination_index: number | null;
	created_at: string;
}

// ── Batch Stats ──

export interface BatchStats {
	average_score: number | null;
	max_score: number | null;
	min_score: number | null;
	participant_count: number;
}

// ── Repository ──

export class BimbelRepository {
	private db: D1Database;
	private tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}

	// ===== TRYOUT BATCHES =====

	async getBatches(): Promise<BatchRow[]> {
		const rows = await this.db
			.prepare(`
				SELECT tb.*, COUNT(tp.id) AS participant_count
				FROM tryout_batches tb
				LEFT JOIN tryout_participants tp ON tp.tryout_batch_id = tb.id
				WHERE tb.tenant_id = ?
				GROUP BY tb.id
				ORDER BY tb.created_at DESC
			`)
			.bind(this.tenantId)
			.all<any>();
		return (rows.results || []).map((r: any) => ({ ...r, participant_count: r.participant_count ?? 0 }));
	}

	async createBatch(data: BatchData): Promise<BatchRow> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db
			.prepare(`
				INSERT INTO tryout_batches (id, tenant_id, batch_id, title, date, duration_minutes, question_count, subjects, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)
			.bind(
				id,
				this.tenantId,
				data.batch_id || null,
				data.title || null,
				data.date || null,
				data.duration_minutes ?? 180,
				data.question_count ?? 100,
				data.subjects || null,
				now
			)
			.run();

		return (await this.getBatch(id))!;
	}

	async getBatch(id: string): Promise<BatchRow | null> {
		const row = await this.db
			.prepare(`
				SELECT tb.*, COUNT(tp.id) AS participant_count
				FROM tryout_batches tb
				LEFT JOIN tryout_participants tp ON tp.tryout_batch_id = tb.id
				WHERE tb.id = ? AND tb.tenant_id = ?
				GROUP BY tb.id
			`)
			.bind(id, this.tenantId)
			.first<any>();

		if (!row) return null;
		return { ...row, participant_count: row.participant_count ?? 0 };
	}

	// ===== PARTICIPANTS =====

	async getParticipants(tryoutBatchId: string): Promise<ParticipantRow[]> {
		const rows = await this.db
			.prepare(`
				SELECT tp.*, u.display_name, u.email, u.username
				FROM tryout_participants tp
				LEFT JOIN users u ON u.id = tp.user_id
				WHERE tp.tryout_batch_id = ?
				ORDER BY COALESCE(tp.total_score, 0) DESC
			`)
			.bind(tryoutBatchId)
			.all<ParticipantRow>();

		return rows.results || [];
	}

	async registerParticipant(data: ParticipantData): Promise<ParticipantRow> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db
			.prepare(`
				INSERT INTO tryout_participants (id, tryout_batch_id, user_id, session_id, total_score, rank, subject_scores, status, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)
			.bind(
				id,
				data.tryout_batch_id,
				data.user_id,
				data.session_id || null,
				data.total_score ?? null,
				data.rank ?? null,
				data.subject_scores || null,
				data.status || 'registered',
				now
			)
			.run();

		return (await this.db
			.prepare(`SELECT tp.*, u.display_name, u.email, u.username FROM tryout_participants tp LEFT JOIN users u ON u.id = tp.user_id WHERE tp.id = ?`)
			.bind(id)
			.first<ParticipantRow>())!;
	}

	async updateParticipantScore(
		id: string,
		totalScore: number,
		subjectScores?: string
	): Promise<ParticipantRow | null> {
		// Update score for the participant
		await this.db
			.prepare(`
				UPDATE tryout_participants SET total_score = ?, subject_scores = ?, status = 'completed' WHERE id = ?
			`)
			.bind(totalScore, subjectScores || null, id)
			.run();

		// Get the participant to find tryout_batch_id
		const participant = await this.db
			.prepare(`SELECT tryout_batch_id FROM tryout_participants WHERE id = ?`)
			.bind(id)
			.first<{ tryout_batch_id: string }>();

		if (participant) {
			// Recompute ranks for all participants in this batch
			const ranked = await this.db
				.prepare(`
					SELECT id FROM tryout_participants
					WHERE tryout_batch_id = ? AND total_score IS NOT NULL
					ORDER BY total_score DESC
				`)
				.bind(participant.tryout_batch_id)
				.all<{ id: string }>();

			if (ranked.results) {
				// Batch update ranks in order
				const stmts = ranked.results.map((r: any, idx: number) =>
					this.db
						.prepare(`UPDATE tryout_participants SET rank = ? WHERE id = ?`)
						.bind(idx + 1, r.id)
				);
				if (stmts.length > 0) {
					await this.db.batch(stmts);
				}
			}
		}

		return this.db
			.prepare(`SELECT tp.*, u.display_name, u.email, u.username FROM tryout_participants tp LEFT JOIN users u ON u.id = tp.user_id WHERE tp.id = ?`)
			.bind(id)
			.first<ParticipantRow>();
	}

	async getRanking(tryoutBatchId: string): Promise<ParticipantRow[]> {
		const rows = await this.db
			.prepare(`
				SELECT tp.*, u.display_name, u.email, u.username
				FROM tryout_participants tp
				LEFT JOIN users u ON u.id = tp.user_id
				WHERE tp.tryout_batch_id = ? AND tp.total_score IS NOT NULL
				ORDER BY tp.rank ASC, tp.total_score DESC
			`)
			.bind(tryoutBatchId)
			.all<ParticipantRow>();

		return rows.results || [];
	}

	// ===== ANALYSIS =====

	async getAnalysis(tryoutBatchId: string): Promise<AnalysisRow[]> {
		const rows = await this.db
			.prepare(`
				SELECT * FROM tryout_analysis
				WHERE tryout_batch_id = ?
				ORDER BY question_id ASC
			`)
			.bind(tryoutBatchId)
			.all<AnalysisRow>();

		return rows.results || [];
	}

	async upsertAnalysis(data: AnalysisData[]): Promise<void> {
		if (data.length === 0) return;

		const now = new Date().toISOString();
		const stmts = data.map((d) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(`
					INSERT INTO tryout_analysis (id, tryout_batch_id, question_id, correct_count, wrong_count, skip_count, difficulty_index, discrimination_index, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(tryout_batch_id, question_id) DO UPDATE SET
						correct_count = excluded.correct_count,
						wrong_count = excluded.wrong_count,
						skip_count = excluded.skip_count,
						difficulty_index = excluded.difficulty_index,
						discrimination_index = excluded.discrimination_index
				`)
				.bind(
					id,
					d.tryout_batch_id,
					d.question_id,
					d.correct_count ?? 0,
					d.wrong_count ?? 0,
					d.skip_count ?? 0,
					d.difficulty_index ?? null,
					d.discrimination_index ?? null,
					now
				);
		});

		await this.db.batch(stmts);
	}

	// ===== BATCH STATS =====

	async getBatchStats(tryoutBatchId: string): Promise<BatchStats> {
		const row = await this.db
			.prepare(`
				SELECT
					AVG(total_score) AS average_score,
					MAX(total_score) AS max_score,
					MIN(total_score) AS min_score,
					COUNT(*) AS participant_count
				FROM tryout_participants
				WHERE tryout_batch_id = ? AND total_score IS NOT NULL
			`)
			.bind(tryoutBatchId)
			.first<any>();

		return {
			average_score: row?.average_score ?? null,
			max_score: row?.max_score ?? null,
			min_score: row?.min_score ?? null,
			participant_count: row?.participant_count ?? 0,
		};
	}

	// ===== BIMBEL BATCH (learning_packages type='bimbel_batch') =====

	async getBimbelBatches(options?: { status?: string; batchId?: string }): Promise<any[]> {
		let query = 'SELECT * FROM learning_packages WHERE tenant_id = ? AND type = ?';
		const params: any[] = [this.tenantId, 'bimbel_batch'];
		if (options?.batchId) { query += ' AND id = ?'; params.push(options.batchId); }
		if (options?.status) { query += ' AND status = ?'; params.push(options.status); }
		query += ' ORDER BY created_at DESC';
		const rows = await this.db.prepare(query).bind(...params).all<any>();
		return rows.results || [];
	}

	async createBimbelBatch(data: { name: string; description?: string; duration_sessions?: number; duration_days?: number; price?: number; max_students?: number; subjects?: any; includes_tryout?: number; status?: string }): Promise<any> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db
			.prepare(
				`INSERT INTO learning_packages (id, tenant_id, name, description, type, duration_sessions, duration_days, price, max_students, subjects, includes_tryout, status, created_at, updated_at)
				 VALUES (?, ?, ?, ?, 'bimbel_batch', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id, this.tenantId, data.name, data.description || null,
				data.duration_sessions ?? null, data.duration_days ?? null,
				data.price ?? null, data.max_students ?? null,
				data.subjects ? JSON.stringify(data.subjects) : null,
				data.includes_tryout ?? 0, data.status || 'active', now, now
			)
			.run();
		return (await this.db.prepare('SELECT * FROM learning_packages WHERE id = ? AND tenant_id = ?').bind(id, this.tenantId).first<any>())!;
	}

	async updateBimbelBatch(id: string, data: Record<string, any>): Promise<any> {
		const sets: string[] = [];
		const params: any[] = [];
		const allowed = ['name', 'description', 'duration_sessions', 'duration_days', 'price', 'max_students', 'subjects', 'includes_tryout', 'status'];
		for (const key of allowed) {
			if (data[key] === undefined) continue;
			const val = key === 'subjects' && Array.isArray(data[key]) ? JSON.stringify(data[key]) : data[key];
			sets.push(`${key} = ?`);
			params.push(val ?? null);
		}
		if (sets.length === 0) return (await this.db.prepare('SELECT * FROM learning_packages WHERE id = ? AND tenant_id = ?').bind(id, this.tenantId).first<any>()) || null;
		sets.push('updated_at = ?');
		params.push(new Date().toISOString(), id, this.tenantId);
		await this.db.prepare(`UPDATE learning_packages SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...params).run();
		return (await this.db.prepare('SELECT * FROM learning_packages WHERE id = ? AND tenant_id = ?').bind(id, this.tenantId).first<any>()) || null;
	}

	async deleteBimbelBatch(id: string): Promise<boolean> {
		const result = await this.db.prepare('DELETE FROM learning_packages WHERE id = ? AND tenant_id = ?').bind(id, this.tenantId).run();
		return (result.meta?.changes ?? 0) > 0;
	}

	async getBimbelBatchEnrollments(batchId: string): Promise<any[]> {
		const rows = await this.db
			.prepare(
				`SELECT be.*, u.display_name, u.email, u.username
				 FROM batch_enrollments be
				 LEFT JOIN users u ON u.id = be.user_id
				 WHERE be.batch_id = ? AND be.tenant_id = ?
				 ORDER BY be.enrollment_date DESC`
			)
			.bind(batchId, this.tenantId)
			.all<any>();
		return rows.results || [];
	}

	async registerBimbelParticipant(data: { batch_id: string; user_id: string; package_id?: string; paid_amount?: number; payment_status?: string; remaining_sessions?: number }): Promise<any> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db
			.prepare(
				`INSERT INTO batch_enrollments (id, tenant_id, batch_id, user_id, package_id, enrollment_date, paid_amount, payment_status, remaining_sessions, status)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id, this.tenantId, data.batch_id, data.user_id, data.package_id || null,
				now, data.paid_amount ?? null, data.payment_status || 'pending',
				data.remaining_sessions ?? null, 'active'
			)
			.run();
		return { id, batch_id: data.batch_id, user_id: data.user_id };
	}

	async unenrollBimbelParticipant(batchId: string, userId: string): Promise<boolean> {
		const result = await this.db
			.prepare("UPDATE batch_enrollments SET status = 'dropped' WHERE batch_id = ? AND user_id = ? AND tenant_id = ? AND status = 'active'")
			.bind(batchId, userId, this.tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}

	// ===== BIMBEL BILLING =====

	async getBimbelBillings(options?: { batchId?: string; status?: string; userId?: string }): Promise<any[]> {
		let query = `
			SELECT br.*, u.display_name, u.email, lp.name AS package_name
			FROM billing_records br
			LEFT JOIN users u ON u.id = br.user_id
			LEFT JOIN learning_packages lp ON lp.id = br.package_id
			WHERE br.tenant_id = ?
		`;
		const params: any[] = [this.tenantId];
		if (options?.batchId) { query += ' AND br.batch_id = ?'; params.push(options.batchId); }
		if (options?.status) { query += ' AND br.status = ?'; params.push(options.status); }
		if (options?.userId) { query += ' AND br.user_id = ?'; params.push(options.userId); }
		query += ' ORDER BY br.created_at DESC';
		const rows = await this.db.prepare(query).bind(...params).all<any>();
		return rows.results || [];
	}

	async createBimbelBilling(data: { user_id: string; package_id?: string; batch_id?: string; invoice_number?: string; type: string; amount: number; discount?: number; total: number; status?: string; due_date?: string; paid_at?: string; payment_method?: string; payment_proof?: string; notes?: string }): Promise<{ id: string; invoice_number: string }> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		const invoiceNumber = data.invoice_number || `INV-${Date.now()}`;
		await this.db
			.prepare(
				`INSERT INTO billing_records (id, tenant_id, user_id, package_id, batch_id, invoice_number, type, amount, discount, total, status, due_date, paid_at, payment_method, payment_proof, notes, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id, this.tenantId, data.user_id, data.package_id || null, data.batch_id || null,
				invoiceNumber, data.type, data.amount, data.discount ?? 0, data.total,
				data.status || 'unpaid', data.due_date || null, data.paid_at || null,
				data.payment_method || null, data.payment_proof || null, data.notes || null, now
			)
			.run();
		return { id, invoice_number: invoiceNumber };
	}

}
