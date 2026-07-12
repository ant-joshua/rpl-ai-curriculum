import { browser } from '$app/environment';
import { activity } from './activity.svelte';
import { modules } from './modules';

const TARGET_KEY = 'lms-daily-target';

function createDailyGoalStore() {
	let version = $state(0);

	function getTarget(): number {
		if (!browser) return 2;
		try {
			return parseInt(localStorage.getItem(TARGET_KEY) || '2', 10);
		} catch {
			return 2;
		}
	}

	function setTarget(target: number): void {
		if (!browser) return;
		localStorage.setItem(TARGET_KEY, String(target));
		version++;
	}

	function getTodayCompletions(): number {
		if (!browser) return 0;
		const today = new Date().toISOString().split('T')[0];
		const all = activity.getRecent(1000);
		return all.filter(
			e => e.action === 'complete' && new Date(e.timestamp).toISOString().split('T')[0] === today
		).length;
	}

	function getTodayProgress(): { target: number; completed: number; pct: number } {
		void version;
		const target = getTarget();
		const completed = getTodayCompletions();
		return {
			target,
			completed,
			pct: target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0,
		};
	}

	return {
		getTarget,
		setTarget,
		getTodayCompletions,
		getTodayProgress,
		get version() {
			void version;
			return version;
		},
	};
}

export const dailyGoal = createDailyGoalStore();
