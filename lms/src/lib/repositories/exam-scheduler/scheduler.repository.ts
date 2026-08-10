import type { D1Database } from '@cloudflare/workers-types';
import { ExamConflictsRepository, type ExamConflictDetail } from './conflicts.repository';

// ============================================================
// Stats (final) — split from exam-scheduler.repository.ts
// ============================================================
export class ExamSchedulerRepository extends ExamConflictsRepository {
	// ----------------------------------------------------------
	// STATS
	// ----------------------------------------------------------

	async getExamStats(): Promise<{
		total: number; draft: number; published: number;
		in_progress: number; completed: number; cancelled: number;
		total_participants: number; unresolved_conflicts: number;
	}> {
		const examCounts = await this.db
			.prepare(`SELECT status, COUNT(*) AS count FROM exams WHERE tenant_id = ? GROUP BY status`)
			.bind(this.tenantId)
			.all<{ status: string; count: number }>();
		const counts: Record<string, number> = {};
		let total = 0;
		for (const row of examCounts.results || []) { counts[row.status] = row.count; total += row.count; }
		const participants = await this.db
			.prepare(`SELECT COUNT(*) AS count FROM exam_participants WHERE tenant_id = ?`)
			.bind(this.tenantId).first<{ count: number }>();
		const conflicts = await this.db
			.prepare(`SELECT COUNT(*) AS count FROM exam_conflicts WHERE tenant_id = ? AND resolved = 0`)
			.bind(this.tenantId).first<{ count: number }>();
		return {
			total, draft: counts['draft'] || 0, published: counts['published'] || 0,
			in_progress: counts['in_progress'] || 0, completed: counts['completed'] || 0,
			cancelled: counts['cancelled'] || 0,
			total_participants: participants?.count || 0, unresolved_conflicts: conflicts?.count || 0
		};
	}
}
