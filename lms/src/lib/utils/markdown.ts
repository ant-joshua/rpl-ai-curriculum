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

/**
 * Parse standard markdown to HTML.
 */
export function parseMarkdown(content: string): string {
	return marked.parse(content) as string;
}

/**
 * Parse markdown with video shortcode support.
 * Converts {video:URL} shortcodes and standalone YouTube/Vimeo URLs
 * into responsive video embeds.
 *
 * Supported formats:
 *   {video:https://youtube.com/watch?v=XXX}
 *   {video:https://youtu.be/XXX}
 *   {video:https://vimeo.com/123456}
 *   https://www.youtube.com/watch?v=XXX  (standalone URL on its own line)
 *   https://youtu.be/XXX                  (standalone URL on its own line)
 *   https://vimeo.com/123456              (standalone URL on its own line)
 */
export function parseMarkdownWithVideo(content: string): string {
	// Step 1: Convert {video:URL} shortcodes
	let html = content.replace(
		/\{video:\s*(https?:\/\/[^\s}]+)\s*\}/gi,
		(_match, url: string) => {
			return getVideoEmbedHtml(url);
		}
	);

	// Step 2: Convert standalone YouTube/Vimeo URLs on their own line
	html = html.replace(
		/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)([^\s$]+)$/gim,
		(_match, _id: string) => {
			return getVideoEmbedHtml(_match.trim());
		}
	);

	// Step 3: Parse the rest as markdown
	return marked.parse(html) as string;
}

/**
 * Generate responsive video embed HTML from a video URL.
 * Supports YouTube (watch, short, embed) and Vimeo URLs.
 */
export function getVideoEmbedHtml(url: string): string {
	const trimmed = url.trim();

	// YouTube — various formats
	const ytMatch = trimmed.match(
		/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S*)?$/
	);
	if (ytMatch) {
		const videoId = ytMatch[1];
		return `<div class="video-embed-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
	}

	// Vimeo
	const vimeoMatch = trimmed.match(
		/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)(?:\?\S*)?$/
	);
	if (vimeoMatch) {
		const videoId = vimeoMatch[1];
		return `<div class="video-embed-wrapper"><iframe src="https://player.vimeo.com/video/${videoId}" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
	}

	// Unknown — render as a link fallback
	return `<a href="${trimmed}" target="_blank" rel="noopener">${trimmed}</a>`;
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
