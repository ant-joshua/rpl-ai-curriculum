import type { D1Database } from '@cloudflare/workers-types';
import { calcNilaiPengetahuan, calcNilaiKeterampilan, getPredikat } from '$lib/grading/k13-calc';

export interface PhScoreRow {
	id: string;
	user_id: string;
	class_subject_id: string;
	kompetensi_dasar_id: string;
	title: string | null;
	score: number;
	max_score: number;
	remedial_score: number | null;
	semester: number;
}

export interface PtsRow {
	id: string;
	user_id: string;
	class_subject_id: string;
	semester: number;
	score: number;
	max_score: number;
	remedial_score: number | null;
}

export interface PasRow {
	id: string;
	user_id: string;
	class_subject_id: string;
	semester: number;
	score: number;
	max_score: number;
	remedial_score: number | null;
}

export interface SkillsRow {
	id: string;
	user_id: string;
	class_subject_id: string;
	kompetensi_dasar_id: string;
	type: string;
	title: string | null;
	score: number;
	max_score: number;
	remedial_score: number | null;
	semester: number;
}

export interface StudentInfo {
	user_id: string;
	nis: string | null;
	display_name: string;
	email: string;
}

export interface GradeRecapItem extends StudentInfo {
	ph_scores: { kd_id: string; score: number; max_score: number }[];
	ph_average: number;
	pts_score: number | null;
	pas_score: number | null;
	na_pengetahuan: number;
	predikat_pengetahuan: string;
	keterampilan_scores: { kd_id: string; type: string; score: number }[];
	na_keterampilan: number;
	predikat_keterampilan: string;
}

export interface GradeSummaryItem {
	subject_id: string;
	subject_name: string;
	subject_code: string | null;
	class_subject_id: string;
	na_pengetahuan: number;
	predikat_pengetahuan: string;
	na_keterampilan: number;
	predikat_keterampilan: string;
}

export interface SavePhInput {
	user_id: string;
	class_subject_id: string;
	kompetensi_dasar_id: string;
	title?: string;
	score: number;
	max_score?: number;
	remedial_score?: number | null;
	semester: number;
	academic_year?: string;
	graded_by: string;
}

export interface SavePtsInput {
	user_id: string;
	class_subject_id: string;
	semester: number;
	score: number;
	max_score?: number;
	remedial_score?: number | null;
	academic_year?: string;
	graded_by: string;
}

export interface SavePasInput {
	user_id: string;
	class_subject_id: string;
	semester: number;
	score: number;
	max_score?: number;
	remedial_score?: number | null;
	academic_year?: string;
	graded_by: string;
}

export interface SaveSkillsInput {
	user_id: string;
	class_subject_id: string;
	kompetensi_dasar_id: string;
	type: string;
	title?: string;
	score: number;
	max_score?: number;
	remedial_score?: number | null;
	semester: number;
	academic_year?: string;
	graded_by: string;
}

export interface SaveAttitudeInput {
	user_id: string;
	class_id: string;
	competence_type: string;
	semester: number;
	predikat: string;
	deskripsi?: string;
	academic_year?: string;
	graded_by: string;
}

export interface SaveExtracurricularInput {
	user_id: string;
	class_id: string;
	activity_name: string;
	predikat: string;
	deskripsi?: string;
	semester: number;
	academic_year?: string;
	academic_period_id?: string;
	graded_by: string;
}

export class K13GradeTypes {
	protected db: D1Database;
	protected tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}
}
