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
		if (!browser) return;
		const root = document.documentElement;

		if (t === 'light') {
			// Light mode — bright, student-friendly
			root.setAttribute('data-theme', 'light');
			root.style.setProperty('--bg', '#F4F7FA');
			root.style.setProperty('--surface', '#FFFFFF');
			root.style.setProperty('--surface-alt', '#F1F5F9');
			root.style.setProperty('--text', '#1a1a2e');
			root.style.setProperty('--text-secondary', '#64748b');
			root.style.setProperty('--text-muted', '#94a3b8');
			root.style.setProperty('--border', '#E2E8F0');
			root.style.setProperty('--border-light', 'rgba(0,0,0,0.06)');
			root.style.setProperty('--accent', '#4F46E5');
			root.style.setProperty('--accent-hover', '#4338CA');
			root.style.setProperty('--accent-light', 'rgba(79,70,229,0.08)');
			root.style.setProperty('--success', '#22C55E');
			root.style.setProperty('--success-light', 'rgba(34,197,94,0.1)');
			root.style.setProperty('--warning', '#F59E0B');
			root.style.setProperty('--danger', '#EF4444');
			root.style.setProperty('--danger-light', 'rgba(239,68,68,0.08)');
			root.style.setProperty('--shadow-sm', '0 1px 2px rgba(0,0,0,0.05)');
			root.style.setProperty('--shadow', '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)');
			root.style.setProperty('--shadow-lg', '0 4px 12px rgba(0,0,0,0.08)');
			root.style.setProperty('--shadow-3d', '0 4px 0 #3730A3');
			root.style.setProperty('--radius', '12px');
			root.style.setProperty('--radius-lg', '16px');
			root.style.setProperty('--radius-sm', '8px');
			root.style.setProperty('--radius-full', '9999px');
		} else {
			// Dark mode — developer feel
			root.setAttribute('data-theme', 'dark');
			root.style.setProperty('--bg', '#0a0b0c');
			root.style.setProperty('--surface', '#131415');
			root.style.setProperty('--surface-alt', '#191a1b');
			root.style.setProperty('--text', '#f7f8f8');
			root.style.setProperty('--text-secondary', '#8a8f98');
			root.style.setProperty('--text-muted', '#62666d');
			root.style.setProperty('--border', 'rgba(255,255,255,0.08)');
			root.style.setProperty('--border-light', 'rgba(255,255,255,0.06)');
			root.style.setProperty('--accent', '#5e6ad2');
			root.style.setProperty('--accent-hover', '#7170ff');
			root.style.setProperty('--accent-light', 'rgba(94,106,210,0.15)');
			root.style.setProperty('--success', '#22C55E');
			root.style.setProperty('--success-light', 'rgba(34,197,94,0.15)');
			root.style.setProperty('--warning', '#F59E0B');
			root.style.setProperty('--danger', '#EF4444');
			root.style.setProperty('--danger-light', 'rgba(239,68,68,0.15)');
			root.style.setProperty('--shadow-sm', '0 1px 2px rgba(0,0,0,0.2)');
			root.style.setProperty('--shadow', '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)');
			root.style.setProperty('--shadow-lg', '0 4px 12px rgba(0,0,0,0.4)');
			root.style.setProperty('--shadow-3d', '0 4px 0 #3730A3');
			root.style.setProperty('--radius', '12px');
			root.style.setProperty('--radius-lg', '16px');
			root.style.setProperty('--radius-sm', '8px');
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
