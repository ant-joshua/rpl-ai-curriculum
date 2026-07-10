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

// Strip frontmatter if present
export function stripFrontmatter(content: string): string {
	const match = content.match(/^---[\s\S]*?---\n*/);
	return match ? content.slice(match[0].length) : content;
}
