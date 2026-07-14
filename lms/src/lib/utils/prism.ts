import Prism from 'prismjs';

// Import language components
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Highlight code with Prism.js, returning HTML string.
 * Falls back to escaped plain text for unknown languages.
 */
export function highlightCode(code: string, language: string): string {
	if (!language) return escapeHtml(code);
	const lang = language.toLowerCase();
	if (!Prism.languages[lang]) return escapeHtml(code);
	try {
		return Prism.highlight(code, Prism.languages[lang], lang);
	} catch {
		return escapeHtml(code);
	}
}

/**
 * Find all `<pre><code class="language-...">` elements inside a container
 * and apply Prism syntax highlighting to them.
 */
export function highlightContainer(container: HTMLElement): void {
	if (!container) return;
	const blocks = container.querySelectorAll<HTMLElement>('pre code[class*="language-"]');
	for (const el of blocks) {
		const classList = Array.from(el.classList);
		const langClass = classList.find((c) => c.startsWith('language-'));
		if (!langClass) continue;
		const lang = langClass.replace('language-', '');
		const code = el.textContent || '';
		if (lang && code) {
			el.innerHTML = highlightCode(code, lang);
		}
	}
}

export function getSupportedLanguages(): string[] {
	return Object.keys(Prism.languages).filter((l) => l !== 'meta');
}
