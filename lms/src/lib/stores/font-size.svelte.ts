import { browser } from '$app/environment';

const STORAGE_KEY = 'lms-font-size';
const DEFAULT_SIZE = 16;
const SIZES = [14, 15, 16, 18, 20, 22, 24] as const;

function clampSize(px: number): number {
	const clamped = SIZES.reduce((prev, curr) =>
		Math.abs(curr - px) < Math.abs(prev - px) ? curr : prev
	);
	return clamped;
}

function createFontSizeStore() {
	let fontSize = $state(DEFAULT_SIZE);

	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const n = parseInt(stored, 10);
			if (!isNaN(n) && (SIZES as readonly number[]).includes(n)) {
				fontSize = n;
			}
		}
		applyFontSize(fontSize);
	}

	function applyFontSize(px: number) {
		document.documentElement.style.setProperty('--reading-font-size', `${px}px`);
	}

	function persist(px: number) {
		fontSize = px;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, String(px));
			applyFontSize(px);
		}
	}

	return {
		get fontSize() { return fontSize; },
		get sizes() { return SIZES; },
		increase() {
			const idx = SIZES.indexOf(fontSize as typeof SIZES[number]);
			if (idx < SIZES.length - 1) {
				persist(SIZES[idx + 1]);
			}
		},
		decrease() {
			const idx = SIZES.indexOf(fontSize as typeof SIZES[number]);
			if (idx > 0) {
				persist(SIZES[idx - 1]);
			}
		},
		setSize(px: number) {
			persist(clampSize(px));
		}
	};
}

export const fontSizeStore = createFontSizeStore();
