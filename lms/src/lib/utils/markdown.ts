import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

const marked = new Marked(
	markedHighlight({
		langPrefix: 'hljs language-',
		highlight(code: string, lang: string) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return hljs.highlight(code, { language: lang }).value;
				} catch {
					// fallthrough
				}
			}
			return code;
		}
	})
);

// Configure marked for safety
marked.use({
	gfm: true,
	breaks: true,
});

export function parseMarkdown(content: string): string {
	return marked.parse(content) as string;
}

// Detect if markdown content has exercise/latihan sections
export function hasExercise(content: string): boolean {
	return /##\s*(Latihan|Exercise|Praktik|Tugas|Challenge)/i.test(content);
}

// Detect languages for code blocks in a session
export function getExerciseLanguages(content: string): string[] {
	const langs = new Set<string>();
	// Match ``` blocks with language identifiers
	const blockRegex = /```(\w+)/g;
	let match;
	while ((match = blockRegex.exec(content)) !== null) {
		const lang = match[1].toLowerCase();
		if (['javascript', 'js', 'typescript', 'ts', 'html', 'css', 'bash', 'shell', 'python', 'sql'].includes(lang)) {
			langs.add(lang);
		}
	}
	// Prefer js/ts/html
	const ordered = ['javascript', 'html', 'typescript'];
	const result: string[] = [];
	for (const l of ordered) {
		if (langs.has(l)) result.push(l);
	}
	if (result.length === 0 && langs.size > 0) {
		result.push([...langs][0]);
	}
	return result.length > 0 ? result : ['javascript'];
}

// Extract the first executable code block from exercise area
export function extractExerciseCode(content: string): { code: string; language: string } | null {
	// Find ## Latihan or ## Exercise section
	const sectionMatch = content.match(/##\s*(Latihan|Exercise|Praktik|Tugas|Challenge)[\s\S]*/i);
	if (!sectionMatch) return null;

	const section = sectionMatch[0];
	// Find first code block with language
	const codeMatch = section.match(/```(\w+)\n([\s\S]*?)```/);
	if (!codeMatch) return null;

	let lang = codeMatch[1].toLowerCase();
	if (lang === 'js') lang = 'javascript';
	if (lang === 'ts') lang = 'typescript';
	if (lang === 'sh') lang = 'bash';

	return { code: codeMatch[2].trim(), language: lang };
}

// Get exercise starter code from session content (best effort)
export function getExerciseStarterCode(content: string): string {
	const extracted = extractExerciseCode(content);
	if (extracted) return extracted.code;

	// Fallback: find first code block in content
	const codeMatch = content.match(/```\w*\n([\s\S]*?)```/);
	if (codeMatch) return codeMatch[1].trim();

	return '';
}

// Strip frontmatter if present
export function stripFrontmatter(content: string): string {
	const match = content.match(/^---[\s\S]*?---\n*/);
	return match ? content.slice(match[0].length) : content;
}
