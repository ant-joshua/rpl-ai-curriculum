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
		root.classList.toggle('theme-light', t === 'light');

		if (t === 'light') {
			root.style.setProperty('--bg', '#ffffff');
			root.style.setProperty('--bg-secondary', '#f0f0f0');
			root.style.setProperty('--surface', '#f5f5f5');
			root.style.setProperty('--surface-hover', '#e8e8e8');
			root.style.setProperty('--text', '#1a1a1a');
			root.style.setProperty('--text-secondary', '#666666');
			root.style.setProperty('--accent', '#3b82f6');
			root.style.setProperty('--accent-hover', '#2563eb');
			root.style.setProperty('--accent-secondary', '#8b5cf6');
			root.style.setProperty('--accent-dim', '#dbeafe');
			root.style.setProperty('--muted', '#999999');
			root.style.setProperty('--border', '#e0e0e0');
			root.style.setProperty('--hover', '#e8e8e8');
			root.style.setProperty('--danger', '#ef4444');
			root.style.setProperty('--success', '#22c55e');
			root.style.setProperty('--warning', '#f59e0b');
			root.style.setProperty('--radius', '8px');
			root.style.setProperty('--shadow', '0 1px 3px rgba(0,0,0,0.1)');
		} else {
			// Restore dark mode defaults (clear overrides so CSS vars fall through)
			root.style.removeProperty('--bg');
			root.style.removeProperty('--bg-secondary');
			root.style.removeProperty('--surface');
			root.style.removeProperty('--surface-hover');
			root.style.removeProperty('--text');
			root.style.removeProperty('--text-secondary');
			root.style.removeProperty('--accent');
			root.style.removeProperty('--accent-hover');
			root.style.removeProperty('--accent-secondary');
			root.style.removeProperty('--accent-dim');
			root.style.removeProperty('--muted');
			root.style.removeProperty('--border');
			root.style.removeProperty('--hover');
			root.style.removeProperty('--danger');
			root.style.removeProperty('--success');
			root.style.removeProperty('--warning');
			root.style.removeProperty('--radius');
			root.style.removeProperty('--shadow');
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
