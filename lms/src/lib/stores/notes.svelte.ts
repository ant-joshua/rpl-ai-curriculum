import { browser } from '$app/environment';
import { api } from '$lib/utils/api';

const NOTES_KEY = 'lms-notes';

type NotesMap = Record<string, string>;

function createNotesStore() {
	let version = $state(0);

	function getAllNotes(): NotesMap {
		if (!browser) return {};
		try {
			const raw = localStorage.getItem(NOTES_KEY);
			return raw ? JSON.parse(raw) : {};
		} catch {
			return {};
		}
	}

	function getKey(slug: string, sessionId: string): string {
		return `${slug}/${sessionId}`;
	}

	function getNotes(slug: string, sessionId: string): string {
		void version;
		const all = getAllNotes();
		return all[getKey(slug, sessionId)] || '';
	}

	async function apiSync(slug: string, sessionId: string, content: string): Promise<void> {
		if (!browser) return;
		await api('/api/notes', {
			method: 'POST',
			body: JSON.stringify({ module_slug: slug, session_id: sessionId, content }),
		});
	}

	/** Load notes from API and merge into localStorage */
	async function fetchFromApi(): Promise<void> {
		if (!browser) return;
		try {
			const res = await api<Array<{ module_slug: string; session_id: string; content: string }>>('/api/notes');
			if (res.success && res.data) {
				const local = getAllNotes();
				let changed = false;
				for (const row of res.data) {
					const k = getKey(row.module_slug, row.session_id);
					if (row.content && !local[k]) {
						local[k] = row.content;
						changed = true;
					}
				}
				if (changed) {
					localStorage.setItem(NOTES_KEY, JSON.stringify(local));
					version++;
				}
			}
		} catch {
			// offline
		}
	}

	// Init: fetch from API
	if (browser) {
		fetchFromApi();
	}

	function setNotes(slug: string, sessionId: string, text: string): void {
		if (!browser) return;
		const all = getAllNotes();
		const key = getKey(slug, sessionId);
		if (text) {
			all[key] = text;
		} else {
			delete all[key];
		}
		localStorage.setItem(NOTES_KEY, JSON.stringify(all));
		version++;
		// Async API sync
		apiSync(slug, sessionId, text);
	}

	function getSessionNotes(slug: string, sessionId: string): string {
		return getNotes(slug, sessionId);
	}

	/** Get all notes for a module (across all sessions) */
	function getModuleNotesMap(slug: string): Record<string, string> {
		const all = getAllNotes();
		const result: Record<string, string> = {};
		for (const [key, val] of Object.entries(all)) {
			if (key.startsWith(slug + '/')) {
				const sessionPart = key.slice(slug.length + 1);
				result[sessionPart] = val;
			}
		}
		return result;
	}

	/** Count of sessions with notes for a given module */
	function getModuleNotesCount(slug: string): number {
		return Object.keys(getModuleNotesMap(slug)).length;
	}

	return {
		getNotes,
		setNotes,
		getSessionNotes,
		getModuleNotesCount,
		getModuleNotesMap,
		get version() {
			void version;
			return version;
		}
	};
}

export const notes = createNotesStore();
