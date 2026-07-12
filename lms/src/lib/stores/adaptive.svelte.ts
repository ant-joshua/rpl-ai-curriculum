import { progress } from '$lib/stores/progress.svelte';
import { browser } from '$app/environment';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_THRESHOLDS: { min: number; max: number; label: UserLevel; value: DifficultyLevel }[] = [
	{ min: 0, max: 10, label: 'beginner', value: 'easy' },
	{ min: 11, max: 30, label: 'intermediate', value: 'medium' },
	{ min: 31, max: Infinity, label: 'advanced', value: 'hard' },
];

function getUserDifficulty(totalCompletedSessions: number): DifficultyLevel {
	for (const t of DIFFICULTY_THRESHOLDS) {
		if (totalCompletedSessions >= t.min && totalCompletedSessions <= t.max) return t.value;
	}
	return 'easy';
}

function getUserLevel(totalCompletedSessions: number): UserLevel {
	for (const t of DIFFICULTY_THRESHOLDS) {
		if (totalCompletedSessions >= t.min && totalCompletedSessions <= t.max) return t.label;
	}
	return 'beginner';
}

function createAdaptiveStore() {
	let totalCompleted = $state(0);

	// Count completed sessions from progress store
	let derivedDifficulty = $derived(getUserDifficulty(totalCompleted));
	let derivedLevel = $derived(getUserLevel(totalCompleted));

	function refresh() {
		if (!browser) return;
		// Count all completed sessions across modules
		const modules = (() => {
			try {
				return JSON.parse(localStorage.getItem('lms-modules') || '[]');
			} catch { return []; }
		})();

		let count = 0;
		for (const mod of modules as Array<{ slug: string; sessions: Array<{ id: string }> }>) {
			try {
				const raw = localStorage.getItem(`lms-progress-${mod.slug}`);
				if (raw) {
					const completed = JSON.parse(raw) as string[];
					count += completed.length;
				}
			} catch {
				// skip
			}
		}
		totalCompleted = count;
	}

	if (browser) {
		refresh();
	}

	return {
		get totalCompleted() { return totalCompleted; },
		get difficulty() { return derivedDifficulty; },
		get level() { return derivedLevel; },
		getUserDifficulty,
		getUserLevel,
		refresh,
		DIFFICULTY_THRESHOLDS,
	};
}

export const adaptive = createAdaptiveStore();
