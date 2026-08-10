import type { D1Database } from '@cloudflare/workers-types';
import { UniversityKelasRepository, type KelasKuliahRow } from './kelas.repository';

// ============================================================
// KRS + Grades — split from university.repository.ts
// ============================================================
export interface KRSRow {
	id: string;
	tenant_id: string;
	user_id: string;
	academic_semester_id: string;
	status: string;
	total_sks: number;
	ip_semester: number | null;
	approved_by: string | null;
	approved_at: string | null;
	created_at: string | null;
	updated_at: string | null;
}

export interface KRSItemRow {
	id: string;
	krs_id: string;
	kelas_kuliah_id: string;
	status: string;
	dropped_at: string | null;
	grade_letter: string | null;
	grade_numeric: number | null;
	created_at: string | null;
}


export class UniversityKRSRepository extends UniversityKelasRepository {
	async createKRS(data: { user_id: string; academic_semester_id: string }): Promise<any> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db.prepare(
			`INSERT INTO krs (id, tenant_id, user_id, academic_semester_id, status, total_sks, created_at, updated_at)
			 VALUES (?, ?, ?, ?, 'draft', 0, ?, ?)`
		).bind(id, this.tenantId, data.user_id, data.academic_semester_id, now, now).run();
		return this.getKRS(id);
	}

	async getKRS(krsId: string): Promise<any | null> {
		const row = await this.db.prepare(`
			SELECT k.*, s.name AS semester_name, s.type AS semester_type, s.year AS semester_year,
				u.display_name AS mahasiswa_name
			FROM krs k
			JOIN academic_semesters s ON s.id = k.academic_semester_id
			LEFT JOIN users u ON u.id = k.user_id
			WHERE k.id = ? AND k.tenant_id = ?
		`).bind(krsId, this.tenantId).first<any>();
		if (!row) return null;
		const items = await this.db.prepare(`
			SELECT ki.*, kk.code AS kelas_kode, kk.dosen_id, kk.schedule_json,
				cc.code AS course_code, cc.name AS course_name, cc.sks, cc.sks_praktikum
			FROM krs_items ki
			JOIN kelas_kuliah kk ON kk.id = ki.kelas_kuliah_id
			JOIN course_catalog cc ON cc.id = kk.course_catalog_id
			WHERE ki.krs_id = ? AND ki.status != 'dropped'
			ORDER BY cc.code
		`).bind(krsId).all<any>();
		return { ...row, items: items.results || [] };
	}

	async getKRSByUser(userId: string, semesterId: string): Promise<any | null> {
		const row = await this.db.prepare(
			'SELECT * FROM krs WHERE user_id = ? AND academic_semester_id = ? AND tenant_id = ?'
		).bind(userId, semesterId, this.tenantId).first<any>();
		if (!row) return null;
		return this.getKRS(row.id);
	}

	async getPendingKRS(semesterId?: string): Promise<any[]> {
		let q = `SELECT k.*, u.display_name AS mahasiswa_name, u.email
			FROM krs k
			JOIN users u ON u.id = k.user_id
			WHERE k.status = 'submitted' AND k.tenant_id = ?`;
		const p: any[] = [this.tenantId];
		if (semesterId) { q += ' AND k.academic_semester_id = ?'; p.push(semesterId); }
		q += ' ORDER BY k.updated_at';
		const rows = await this.db.prepare(q).bind(...p).all<any>();
		return rows.results || [];
	}

	async addKRSItem(krsId: string, kelasKuliahId: string): Promise<KRSItemRow> {
		const krs = await this.db.prepare('SELECT * FROM krs WHERE id = ? AND tenant_id = ?').bind(krsId, this.tenantId).first<any>();
		if (!krs) throw new Error('KRS not found');
		if (krs.status !== 'draft') throw new Error('KRS is not in draft status');

		const dup = await this.db.prepare("SELECT id FROM krs_items WHERE krs_id = ? AND kelas_kuliah_id = ? AND status = 'active'").bind(krsId, kelasKuliahId).first<any>();
		if (dup) throw new Error('Course already added to KRS');

		const kelas = await this.db.prepare(
			'SELECT cc.sks FROM kelas_kuliah kk JOIN course_catalog cc ON cc.id = kk.course_catalog_id WHERE kk.id = ? AND kk.tenant_id = ?'
		).bind(kelasKuliahId, this.tenantId).first<{ sks: number }>();
		if (!kelas) throw new Error('Kelas kuliah not found');

		const newTotal = (krs.total_sks || 0) + kelas.sks;
		if (newTotal > 24) throw new Error(`Total SKS would exceed max 24 (current: ${krs.total_sks}, adding: ${kelas.sks})`);

		const itemId = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db.batch([
			this.db.prepare("INSERT INTO krs_items (id, krs_id, kelas_kuliah_id, status, created_at) VALUES (?, ?, ?, 'active', ?)").bind(itemId, krsId, kelasKuliahId, now),
			this.db.prepare('UPDATE krs SET total_sks = ?, updated_at = ? WHERE id = ?').bind(newTotal, now, krsId)
		]);

		return { id: itemId, krs_id: krsId, kelas_kuliah_id: kelasKuliahId, status: 'active', dropped_at: null, grade_letter: null, grade_numeric: null, created_at: now };
	}

	async removeKRSItem(krsItemId: string): Promise<boolean> {
		const r = await this.db.prepare("UPDATE krs_items SET status = 'dropped', dropped_at = ? WHERE id = ?").bind(new Date().toISOString(), krsItemId).run();
		return (r.meta.changes ?? 0) > 0;
	}

	async submitKRS(krsId: string): Promise<boolean> {
		const r = await this.db.prepare("UPDATE krs SET status = 'submitted', updated_at = ? WHERE id = ? AND tenant_id = ? AND status = 'draft'").bind(new Date().toISOString(), krsId, this.tenantId).run();
		return (r.meta.changes ?? 0) > 0;
	}

	async approveKRS(krsId: string, approverId: string): Promise<boolean> {
		const krs = await this.db.prepare("SELECT * FROM krs WHERE id = ? AND tenant_id = ? AND status = 'submitted'").bind(krsId, this.tenantId).first<any>();
		if (!krs) return false;
		const now = new Date().toISOString();
		const items = await this.db.prepare("SELECT * FROM krs_items WHERE krs_id = ? AND status = 'active'").bind(krsId).all<any>();
		const activeItems = items.results || [];
		const stmts: any[] = [
			this.db.prepare('UPDATE krs SET status = \'approved\', approved_by = ?, approved_at = ?, updated_at = ? WHERE id = ?').bind(approverId, now, now, krsId)
		];
		for (const item of activeItems) {
			stmts.push(this.db.prepare('UPDATE kelas_kuliah SET current_students = current_students + 1 WHERE id = ?').bind(item.kelas_kuliah_id));
		}
		await this.db.batch(stmts);
		return true;
	}

	async rejectKRS(krsId: string): Promise<boolean> {
		const r = await this.db.prepare("UPDATE krs SET status = 'revision', updated_at = ? WHERE id = ? AND tenant_id = ? AND status = 'submitted'").bind(new Date().toISOString(), krsId, this.tenantId).run();
		return (r.meta.changes ?? 0) > 0;
	}

	async getStudentsWithGrades(kelasKuliahId: string): Promise<any[]> {
		const rows = await this.db.prepare(`
			SELECT ki.id AS krs_item_id, ki.grade_numeric, ki.grade_letter,
				u.id AS user_id, u.display_name AS student_name, u.email,
				cc.sks, cc.name AS course_name, cc.code AS course_code
			FROM krs_items ki
			JOIN krs ON krs.id = ki.krs_id
			JOIN users u ON u.id = krs.user_id
			JOIN kelas_kuliah kk ON kk.id = ki.kelas_kuliah_id
			JOIN course_catalog cc ON cc.id = kk.course_catalog_id
			WHERE ki.kelas_kuliah_id = ? AND krs.status = 'approved' AND ki.status = 'active'
			ORDER BY u.display_name
		`).bind(kelasKuliahId).all<any>();
		return rows.results || [];
	}

	async saveGrades(grades: { krs_item_id: string; grade_numeric: number }[]): Promise<void> {
		const stmts = grades.map((g) => {
			const letter = this.numericToLetter(g.grade_numeric);
			return this.db.prepare('UPDATE krs_items SET grade_numeric = ?, grade_letter = ? WHERE id = ?').bind(g.grade_numeric, letter, g.krs_item_id);
		});
		if (stmts.length > 0) await this.db.batch(stmts);
	}
	// ── Helpers ──────────────────────────────────────────────────────

	numericToLetter(score: number): string {
		if (score >= 80) return 'A';
		if (score >= 75) return 'A-';
		if (score >= 70) return 'B+';
		if (score >= 65) return 'B';
		if (score >= 60) return 'B-';
		if (score >= 55) return 'C+';
		if (score >= 50) return 'C';
		if (score >= 40) return 'D';
		return 'E';
	}

	letterToPoint(letter: string | null): number {
		switch (letter) {
			case 'A': return 4.0;
			case 'A-': return 3.7;
			case 'B+': return 3.3;
			case 'B': return 3.0;
			case 'B-': return 2.7;
			case 'C+': return 2.3;
			case 'C': return 2.0;
			case 'D': return 1.0;
			case 'E': return 0.0;
			default: return 0.0;
		}
	}
}
