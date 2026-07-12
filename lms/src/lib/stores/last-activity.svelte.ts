import { browser } from '$app/environment';

const STORAGE_KEY = 'lms-last-activity';

export interface LastActivity {
	moduleSlug: string;
	sessionId: string;
	timestamp: number;
}

function createLastActivityStore() {
	let state = $state<LastActivity | null>(null);

	function load(): LastActivity | null {
		if (!browser) return null;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	function save(moduleSlug: string, sessionId: string): void {
		if (!browser) return;
		const entry: LastActivity = { moduleSlug, sessionId, timestamp: Date.now() };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
		state = entry;
	}

	function get(): LastActivity | null {
		if (!state) {
			state = load();
		}
		return state;
	}

	return {
		get get() {
			return get();
		},
		save,
	};
}

export const lastActivity = createLastActivityStore();
