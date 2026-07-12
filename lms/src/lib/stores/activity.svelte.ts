import { browser } from '$app/environment';

const STORAGE_KEY = 'lms-activity';

export interface ActivityEntry {
	id: string;
	action: 'view' | 'complete' | 'quiz';
	moduleSlug: string;
	sessionId?: string;
	detail?: string;
	timestamp: number;
}

function createActivityStore() {
	let version = $state(0);

	function getAll(): ActivityEntry[] {
		if (!browser) return [];
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}

	function saveAll(entries: ActivityEntry[]): void {
		if (!browser) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
		version++;
	}

	function logAction(
		action: ActivityEntry['action'],
		moduleSlug: string,
		sessionId?: string,
		detail?: string
	): void {
		const entry: ActivityEntry = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			action,
			moduleSlug,
			sessionId,
			detail,
			timestamp: Date.now(),
		};
		const entries = getAll();
		entries.push(entry);
		saveAll(entries);
	}

	function getRecent(limit = 50): ActivityEntry[] {
		const entries = getAll();
		return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
	}

	function clearAll(): void {
		saveAll([]);
	}

	return {
		get version() {
			void version;
			return version;
		},
		logAction,
		getRecent,
		clearAll,
	};
}

export const activity = createActivityStore();
