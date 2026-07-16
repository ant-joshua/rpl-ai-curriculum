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
				const stmts = ranked.results.map((r, idx) =>
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
}
