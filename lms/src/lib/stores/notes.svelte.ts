import { browser } from '$app/environment';

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
	}

	function getSessionNotes(slug: string, sessionId: string): string {
		return getNotes(slug, sessionId);
	}

	return {
		getNotes,
		setNotes,
		getSessionNotes,
		get version() {
			void version;
			return version;
		}
	};
}

export const notes = createNotesStore();
