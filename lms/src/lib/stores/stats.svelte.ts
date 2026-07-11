import { browser } from '$app/environment';
import { progress } from './progress.svelte';

function createStatsStore() {
	function getWeeklyData(): number[] {
		if (!browser) return [0, 0, 0, 0, 0, 0, 0];

		const completionDates = progress.getCompletionDates();
		const today = new Date();
		const result: number[] = [];

		// Array: [today, yesterday, ..., 6 days ago]
		for (let i = 0; i < 7; i++) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().split('T')[0];
			const count = completionDates.filter((cd) => cd === dateStr).length;
			result.push(count);
		}

		return result;
	}

	return {
		getWeeklyData
	};
}

export const stats = createStatsStore();
