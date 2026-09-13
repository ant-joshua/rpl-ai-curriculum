import { browser } from '$app/environment';

type Theme = 'dark' | 'light';

function createThemeStore() {
	let theme = $state<Theme>('light');

	if (browser) {
		const stored = localStorage.getItem('lms-theme') as Theme | null;
		if (stored === 'light' || stored === 'dark') {
			theme = stored;
		} else {
			theme = 'light';
		}
		applyTheme(theme);
	}

	function applyTheme(t: Theme) {
		if (!browser) return;
		const root = document.documentElement;

		if (t === 'light') {
			root.setAttribute('data-theme', 'light');
			root.style.setProperty('--bg', '#FFFFFF');
			root.style.setProperty('--surface', '#FFFFFF');
			root.style.setProperty('--surface-alt', '#F5F5F5');
			root.style.setProperty('--text', '#111111');
			root.style.setProperty('--text-secondary', '#555555');
			root.style.setProperty('--text-muted', '#999999');
			root.style.setProperty('--border', '#E5E5E5');
			root.style.setProperty('--border-light', 'rgba(0,0,0,0.06)');
			root.style.setProperty('--accent', '#111111');
			root.style.setProperty('--accent-hover', '#333333');
			root.style.setProperty('--accent-light', 'rgba(0,0,0,0.05)');
			root.style.setProperty('--accent-rgb', '17, 17, 17');
			root.style.setProperty('--success', '#16A34A');
			root.style.setProperty('--success-light', 'rgba(22,163,74,0.08)');
			root.style.setProperty('--warning', '#D97706');
			root.style.setProperty('--danger', '#DC2626');
			root.style.setProperty('--danger-light', 'rgba(220,38,38,0.08)');
			root.style.setProperty('--shadow-sm', 'none');
			root.style.setProperty('--shadow', '0 1px 2px rgba(0,0,0,0.04)');
			root.style.setProperty('--shadow-lg', '0 2px 8px rgba(0,0,0,0.06)');
			root.style.setProperty('--shadow-3d', 'none');
			root.style.setProperty('--shadow-3d-success', 'none');
			root.style.setProperty('--radius', '8px');
			root.style.setProperty('--radius-lg', '12px');
			root.style.setProperty('--radius-sm', '6px');
			root.style.setProperty('--radius-full', '9999px');
		} else {
			root.setAttribute('data-theme', 'dark');
			root.style.setProperty('--bg', '#0a0b0c');
			root.style.setProperty('--surface', '#131415');
			root.style.setProperty('--surface-alt', '#191a1b');
			root.style.setProperty('--text', '#f7f8f8');
			root.style.setProperty('--text-secondary', '#8a8f98');
			root.style.setProperty('--text-muted', '#62666d');
			root.style.setProperty('--border', 'rgba(255,255,255,0.08)');
			root.style.setProperty('--border-light', 'rgba(255,255,255,0.06)');
			root.style.setProperty('--accent', '#ffffff');
			root.style.setProperty('--accent-hover', '#cccccc');
			root.style.setProperty('--accent-light', 'rgba(255,255,255,0.08)');
			root.style.setProperty('--accent-rgb', '255, 255, 255');
			root.style.setProperty('--success', '#22C55E');
			root.style.setProperty('--success-light', 'rgba(34,197,94,0.15)');
			root.style.setProperty('--warning', '#F59E0B');
			root.style.setProperty('--danger', '#EF4444');
			root.style.setProperty('--danger-light', 'rgba(239,68,68,0.15)');
			root.style.setProperty('--shadow-sm', 'none');
			root.style.setProperty('--shadow', 'none');
			root.style.setProperty('--shadow-lg', 'none');
			root.style.setProperty('--shadow-3d', 'none');
			root.style.setProperty('--shadow-3d-success', 'none');
			root.style.setProperty('--radius', '8px');
			root.style.setProperty('--radius-lg', '12px');
			root.style.setProperty('--radius-sm', '6px');
			root.style.setProperty('--radius-full', '9999px');
		}
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
