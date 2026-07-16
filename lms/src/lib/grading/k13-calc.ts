export interface PhScore {
	score: number;
	max_score?: number;
}

export interface WeightConfig {
	ph: number;
	pts: number;
	pas: number;
}

export interface PredikatThresholds {
	A: number;
	B: number;
	C: number;
}

const DEFAULT_WEIGHTS: WeightConfig = {
	ph: 0.6,
	pts: 0.2,
	pas: 0.2
};

const DEFAULT_THRESHOLDS: PredikatThresholds = {
	A: 92,
	B: 84,
	C: 75
};

/**
 * Calculate Nilai Pengetahuan (knowledge score) from PH, PTS, and PAS scores.
 * Formula: (avg_ph * ph_weight) + (pts * pts_weight) + (pas * pas_weight)
 * Default weights: PH=60%, PTS=20%, PAS=20%
 */
export function calcNilaiPengetahuan(
	phScores: PhScore[],
	ptsScore: number | null,
	pasScore: number | null,
	weights?: Partial<WeightConfig>
): number {
	const w: WeightConfig = { ...DEFAULT_WEIGHTS, ...weights };

	const phAverage = phScores.length > 0
		? phScores.reduce((sum, s) => sum + s.score, 0) / phScores.length
		: 0;

	const pts = ptsScore ?? 0;
	const pas = pasScore ?? 0;

	return (phAverage * w.ph) + (pts * w.pts) + (pas * w.pas);
}

/**
 * Calculate Nilai Keterampilan (skills score) from individual skill scores.
 * Simple average of all skill scores.
 */
export function calcNilaiKeterampilan(skillsScores: number[]): number {
	if (skillsScores.length === 0) return 0;
	return skillsScores.reduce((sum, s) => sum + s, 0) / skillsScores.length;
}

/**
 * Get predikat (grade predicate) based on Nilai Akhir (NA).
 * Thresholds: A >= 92, B >= 84, C >= 75, else D
 */
export function getPredikat(
	na: number,
	thresholds?: Partial<PredikatThresholds>
): string {
	const t: PredikatThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

	if (na >= t.A) return 'A';
	if (na >= t.B) return 'B';
	if (na >= t.C) return 'C';
	return 'D';
}

/**
 * Get descriptive label for attitude predikat.
 * SB → Sangat Baik, B → Baik, C → Cukup, K → Kurang
 */
export function getAttitudePredikatLabel(predikat: string): string {
	const labels: Record<string, string> = {
		'SB': 'Sangat Baik',
		'B': 'Baik',
		'C': 'Cukup',
		'K': 'Kurang'
	};
	return labels[predikat] || predikat;
}
