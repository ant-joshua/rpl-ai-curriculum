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
			root.style.setProperty('--bg', '#f7f8f8');
			root.style.setProperty('--bg-secondary', '#f3f4f5');
			root.style.setProperty('--surface', '#ffffff');
			root.style.setProperty('--surface-hover', '#eef0f2');
			root.style.setProperty('--text', '#171717');
			root.style.setProperty('--text-secondary', '#5f6368');
			root.style.setProperty('--text-tertiary', '#80868b');
			root.style.setProperty('--text-quaternary', '#a6aab0');
			root.style.setProperty('--heading', '#171717');
			root.style.setProperty('--accent', '#5e6ad2');
			root.style.setProperty('--accent-hover', '#7170ff');
			root.style.setProperty('--accent-secondary', '#7170ff');
			root.style.setProperty('--accent-dim', '#eef0ff');
			root.style.setProperty('--accent-glow', 'rgba(94, 106, 210, 0.2)');
			root.style.setProperty('--muted', '#f3f4f5');
			root.style.setProperty('--muted-foreground', '#80868b');
			root.style.setProperty('--border', 'rgba(0, 0, 0, 0.08)');
			root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.04)');
			root.style.setProperty('--border-solid', '#e0e0e0');
			root.style.setProperty('--hover', 'rgba(0, 0, 0, 0.04)');
			root.style.setProperty('--danger', '#ef4444');
			root.style.setProperty('--success', '#10b981');
			root.style.setProperty('--warning', '#f59e0b');
			root.style.setProperty('--info', '#5e6ad2');
			root.style.setProperty('--input', 'rgba(0, 0, 0, 0.08)');
			root.style.setProperty('--background', '#f7f8f8');
			root.style.setProperty('--foreground', '#171717');
			root.style.setProperty('--card', '#ffffff');
			root.style.setProperty('--card-foreground', '#171717');
			root.style.setProperty('--primary', '#5e6ad2');
			root.style.setProperty('--primary-foreground', '#ffffff');
			root.style.setProperty('--radius', '8px');
			root.style.setProperty('--shadow-soft', '0 2px 8px rgba(0,0,0,0.06)');
			root.style.setProperty('--shadow-card', '0 4px 24px rgba(0,0,0,0.08)');
		} else {
			// Reset to dark mode defaults (CSS vars from app.css take over)
			root.style.removeProperty('--bg');
			root.style.removeProperty('--bg-secondary');
			root.style.removeProperty('--surface');
			root.style.removeProperty('--surface-hover');
			root.style.removeProperty('--text');
			root.style.removeProperty('--text-secondary');
			root.style.removeProperty('--text-tertiary');
			root.style.removeProperty('--text-quaternary');
			root.style.removeProperty('--heading');
			root.style.removeProperty('--accent');
			root.style.removeProperty('--accent-hover');
			root.style.removeProperty('--accent-secondary');
			root.style.removeProperty('--accent-dim');
			root.style.removeProperty('--accent-glow');
			root.style.removeProperty('--muted');
			root.style.removeProperty('--muted-foreground');
			root.style.removeProperty('--border');
			root.style.removeProperty('--border-subtle');
			root.style.removeProperty('--border-solid');
			root.style.removeProperty('--hover');
			root.style.removeProperty('--danger');
			root.style.removeProperty('--success');
			root.style.removeProperty('--warning');
			root.style.removeProperty('--info');
			root.style.removeProperty('--input');
			root.style.removeProperty('--background');
			root.style.removeProperty('--foreground');
			root.style.removeProperty('--card');
			root.style.removeProperty('--card-foreground');
			root.style.removeProperty('--primary');
			root.style.removeProperty('--primary-foreground');
			root.style.removeProperty('--radius');
			root.style.removeProperty('--shadow-soft');
			root.style.removeProperty('--shadow-card');
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
