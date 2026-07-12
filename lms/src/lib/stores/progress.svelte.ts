import { browser } from '$app/environment';
import { modules, type Module } from './modules';
import { certificate } from './certificate.svelte';
import { api } from '$lib/utils/api';
import { afterSessionComplete } from './gamification.svelte';

const STREAK_KEY = 'lms-streak';
const LAST_READ_KEY = 'lms-last-read';
const DATE_KEY = 'lms-last-date';
const COMPLETION_DATES_KEY = 'lms-completion-dates';

function getProgressKey(slug: string): string {
	return `lms-progress-${slug}`;
}

function createProgressStore() {
	// Track reactivity key — increment on write so $derived recomputes
	let version = $state(0);

	function getCompletedSessions(slug: string): string[] {
		if (!browser) return [];
		try {
			const raw = localStorage.getItem(getProgressKey(slug));
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}

	function getModuleProgress(slug: string): number {
		const mod = modules.find((m) => m.slug === slug);
		if (!mod || mod.sessions.length === 0) return 0;
		const completed = getCompletedSessions(slug);
		return Math.round((completed.length / mod.sessions.length) * 100);
	}

	function getCompletionDates(): string[] {
		if (!browser) return [];
		try {
			const raw = localStorage.getItem(COMPLETION_DATES_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}

	function saveCompletionDate(): void {
		if (!browser) return;
		const today = new Date().toISOString().split('T')[0];
		const dates = getCompletionDates();
		if (!dates.includes(today)) {
			dates.push(today);
			localStorage.setItem(COMPLETION_DATES_KEY, JSON.stringify(dates));
		}
	}

	async function apiSync(slug: string, sessionId: string, completed: boolean): Promise<void> {
		if (!browser) return;
		await api('/api/progress', {
			method: 'POST',
			body: JSON.stringify({
				module_slug: slug,
				session_id: sessionId,
				completed: completed ? 1 : 0,
			}),
		});
	}

	/** Upload all local progress to API */
	async function syncProgress(): Promise<void> {
		if (!browser) return;
		for (const mod of modules) {
			const completed = getCompletedSessions(mod.slug);
			for (const sessionId of completed) {
				await api('/api/progress', {
					method: 'POST',
					body: JSON.stringify({
						module_slug: mod.slug,
						session_id: sessionId,
						completed: 1,
					}),
				});
			}
		}
	}

	/** Try to merge API data into localStorage on init */
	async function fetchFromApi(): Promise<void> {
		if (!browser) return;
		try {
			const res = await api<Array<{ module_slug: string; session_id: string; completed: number }>>('/api/progress');
			if (res.success && res.data) {
				for (const row of res.data) {
					if (row.completed) {
						const key = getProgressKey(row.module_slug);
						const local = getCompletedSessions(row.module_slug);
						if (!local.includes(row.session_id)) {
							local.push(row.session_id);
							localStorage.setItem(key, JSON.stringify(local));
						}
					}
				}
				version++;
			}
		} catch {
			// offline — use localStorage only
		}
	}

	// Init: fetch from API once on browser
	if (browser) {
		fetchFromApi();
	}

	function toggleSession(slug: string, sessionId: string): void {
		if (!browser) return;
		const key = getProgressKey(slug);
		const completed = getCompletedSessions(slug);
		const idx = completed.indexOf(sessionId);
		let nowCompleted = false;
		if (idx >= 0) {
			completed.splice(idx, 1);
		} else {
			completed.push(sessionId);
			saveCompletionDate();
			nowCompleted = true;
		}
		localStorage.setItem(key, JSON.stringify(completed));
		version++;
		certificate.checkAndMark();
		// Gamification: award XP and check badges
		if (nowCompleted) {
			afterSessionComplete(slug, sessionId);
		}
		// Async API sync
		apiSync(slug, sessionId, nowCompleted);
	}

	function isSessionCompleted(slug: string, sessionId: string): boolean {
		return getCompletedSessions(slug).includes(sessionId);
	}

	function setLastRead(slug: string): void {
		if (!browser) return;
		localStorage.setItem(LAST_READ_KEY, slug);
	}

	function getLastRead(): string | null {
		if (!browser) return null;
		return localStorage.getItem(LAST_READ_KEY);
	}

	// Streak tracking
	function updateStreak(): void {
		if (!browser) return;
		const today = new Date().toISOString().split('T')[0];
		const lastDate = localStorage.getItem(DATE_KEY);
		const currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

		if (lastDate === today) return; // already counted today

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split('T')[0];

		if (lastDate === yesterdayStr) {
			localStorage.setItem(STREAK_KEY, String(currentStreak + 1));
		} else {
			localStorage.setItem(STREAK_KEY, '1');
		}
		localStorage.setItem(DATE_KEY, today);
		version++;
	}

	function getStreak(): number {
		if (!browser) return 0;
		return parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
	}

	// Compute overall stats (all modules)
	let completedCount = $derived.by(() => {
		// read version to force recompute
		void version;
		let count = 0;
		for (const mod of modules) {
			if (getModuleProgress(mod.slug) === 100) count++;
		}
		return count;
	});

	let totalModules = $derived(modules.length);

	function getOverallProgress(): number {
		// read version to force recompute
		void version;
		if (modules.length === 0) return 0;
		let totalSessions = 0;
		let completedSessions = 0;
		for (const mod of modules) {
			for (const sess of mod.sessions) {
				totalSessions++;
				if (isSessionCompleted(mod.slug, sess.id)) {
					completedSessions++;
				}
			}
		}
		return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
	}

	// Filtered helpers — accept explicit module list so dashboard can pass filteredModules
	function getFilteredCompletedCount(filteredModules: Module[]): number {
		void version;
		let count = 0;
		for (const mod of filteredModules) {
			if (getModuleProgress(mod.slug) === 100) count++;
		}
		return count;
	}

	function getFilteredOverallProgress(filteredModules: Module[]): number {
		void version;
		if (filteredModules.length === 0) return 0;
		let totalSessions = 0;
		let completedSessions = 0;
		for (const mod of filteredModules) {
			for (const sess of mod.sessions) {
				totalSessions++;
				if (isSessionCompleted(mod.slug, sess.id)) {
					completedSessions++;
				}
			}
		}
		return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
	}

	return {
		get completedCount() {
			void version; // react to changes
			return completedCount;
		},
		get totalModules() {
			return totalModules;
		},
		getModuleProgress,
		getCompletedSessions,
		toggleSession,
		isSessionCompleted,
		setLastRead,
		getLastRead,
		updateStreak,
		getStreak,
		getOverallProgress,
		getFilteredCompletedCount,
		getFilteredOverallProgress,
		getCompletionDates,
		syncProgress,
	};
}

export const progress = createProgressStore();
