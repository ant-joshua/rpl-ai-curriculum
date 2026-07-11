import { browser } from '$app/environment';

type Theme = 'dark' | 'light';

function createThemeStore() {
	let theme = $state<Theme>('dark');

	if (browser) {
		const stored = localStorage.getItem('lms-theme') as Theme | null;
		if (stored === 'light' || stored === 'dark') {
			theme = stored;
		} else {
			theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
		}
		applyTheme(theme);
	}

	function applyTheme(t: Theme) {
		document.documentElement.classList.toggle('theme-light', t === 'light');
	}

	return {
		get theme() { return theme; },
		toggle() {
			const next = theme === 'dark' ? 'light' : 'dark';
			theme = next;
			if (browser) {
				localStorage.setItem('lms-theme', next);
				applyTheme(next);
			}
		}
	};
}

export const themeStore = createThemeStore();
