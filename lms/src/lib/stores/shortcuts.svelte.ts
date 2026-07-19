import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const SHORTCUTS = {
	'g d': '/dashboard',
	'g f': '/flashcards',
	'g t': '/tutor',
	'g e': '/exercises',
	'g p': '/path',
	'g b': '/badges',
	'g s': '/study',
	'g l': '/leaderboard',
	'g v': '/videos',
	'g x': '/export',
	'?': 'showHelp',
	'Ctrl+K': 'showCommandPalette',
} as const;

export type ShortcutKey = keyof typeof SHORTCUTS;
export type ShortcutAction = (typeof SHORTCUTS)[ShortcutKey];

type Listener = (action: string) => void;

let pressedG = false;
let listeners: Listener[] = [];

export function onShortcut(cb: Listener) {
	listeners.push(cb);
	return () => {
		listeners = listeners.filter(l => l !== cb);
	};
}

let cleanup: (() => void) | null = null;

export function initShortcuts() {
	if (!browser || cleanup) return;

	function handler(e: KeyboardEvent) {
		// Ctrl+K / Cmd+K → command palette
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			listeners.forEach(l => l('showCommandPalette'));
			return;
		}

		// Ignore if in input/textarea
		const tag = (e.target as HTMLElement).tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

		if (e.key === '?') {
			e.preventDefault();
			listeners.forEach(l => l('showHelp'));
			return;
		}

		if (e.key === 'g') {
			pressedG = true;
			// Timeout to reset after 1s
			setTimeout(() => { pressedG = false; }, 1000);
			return;
		}

		if (pressedG) {
			const combo = `g ${e.key}` as ShortcutKey;
			if (combo in SHORTCUTS) {
				e.preventDefault();
				pressedG = false;
				const dest = SHORTCUTS[combo];
				if (typeof dest === 'string') {
					goto(dest);
				}
				return;
			}
			pressedG = false;
		}
	}

	window.addEventListener('keydown', handler);
	cleanup = () => {
		window.removeEventListener('keydown', handler);
		pressedG = false;
	};
}

export function destroyShortcuts() {
	if (cleanup) {
		cleanup();
		cleanup = null;
	}
}
