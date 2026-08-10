import type { D1Database } from '@cloudflare/workers-types';
import { UniversityKRSRepository, type KRSItemRow } from './krs.repository';

// ============================================================
// Transcript + IPK (final) — split from university.repository.ts
// ============================================================
export interface TranscriptRecordRow {
	id: string;
	tenant_id: string;
	user_id: string;
	course_catalog_id: string;
	kelas_kuliah_id: string | null;
	academic_semester_id: string;
	grade_letter: string | null;
	grade_numeric: number | null;
	sks: number;
	is_remedial: number;
	is_repeated: number;
	graded_by: string | null;
	graded_at: string | null;
	created_at: string | null;
}

export class UniversityRepository extends UniversityKRSRepository {
	// ── Transcript ───────────────────────────────────────────────────

	async getTranscript(userId: string): Promise<any[]> {
		const rows = await this.db.prepare(`
			SELECT tr.*, cc.code AS course_code, cc.name AS course_name, cc.sks,
				s.name AS semester_name, s.type AS semester_type, s.year AS semester_year
			FROM transcript_records tr
			JOIN course_catalog cc ON cc.id = tr.course_catalog_id
			JOIN academic_semesters s ON s.id = tr.academic_semester_id
			WHERE tr.user_id = ? AND tr.tenant_id = ?
			ORDER BY s.year, s.type, cc.code
		`).bind(userId, this.tenantId).all<any>();
		return rows.results || [];
	}

	async computeIPK(userId: string): Promise<number | null> {
		const rows = await this.db.prepare(
			`SELECT grade_numeric, grade_letter, sks FROM transcript_records
			 WHERE user_id = ? AND tenant_id = ? AND is_repeated = 0`
		).bind(userId, this.tenantId).all<any>();
		const records = rows.results || [];
		if (records.length === 0) return null;
		let totalPointSks = 0;
		let totalSks = 0;
		for (const r of records) {
			const point = r.grade_numeric ?? this.letterToPoint(r.grade_letter);
			totalPointSks += point * r.sks;
			totalSks += r.sks;
		}
		if (totalSks === 0) return null;
		return Math.round((totalPointSks / totalSks) * 100) / 100;
	}
}
