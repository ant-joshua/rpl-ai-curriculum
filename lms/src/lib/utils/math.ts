import katex from 'katex';

// Math delimiters map: [open, close] pairs with display mode flag
const DELIMITERS: [string, string, boolean][] = [
	['$$', '$$', true],   // block display
	['$', '$', false],    // inline
	['\\[', '\\]', true], // LaTeX block
	['\\(', '\\)', false],// LaTeX inline
];

/**
 * Find math delimiters ($...$, $$...$$, \(...\), \[...\]) inside a DOM
 * container and render them in-place using KaTeX.
 *
 * Walk is iterative (no deep recursion issues) and mutates the DOM:
 * text nodes containing math are split and replaced with KaTeX HTML.
 */
export function findAndRenderMath(container: HTMLElement): void {
	if (!container) return;

	const walker = document.createTreeWalker(
		container,
		NodeFilter.SHOW_TEXT,
		null,
	);
	const textNodes: Text[] = [];
	let node: Text | null;
	while ((node = walker.nextNode() as Text | null)) {
		textNodes.push(node);
	}

	for (const textNode of textNodes) {
		const text = textNode.textContent || '';
		if (!hasDelimiter(text)) continue;

		// Replace math sequences with KaTeX HTML
		const fragments = processMath(text);
		if (!fragments || fragments.length === 0) continue;

		// If only one fragment and it's the same text, skip
		if (fragments.length === 1 && fragments[0].type === 'text' && fragments[0].content === text) {
			continue;
		}

		const parent = textNode.parentNode;
		if (!parent) continue;

		const after: Node[] = [];
		for (const f of fragments) {
			if (f.type === 'text') {
				after.push(document.createTextNode(f.content));
			} else {
				try {
					const html = katex.renderToString(f.content, {
						displayMode: f.displayMode,
						throwOnError: false,
						output: 'html',
					});
					const wrapper = document.createElement('span');
					wrapper.className = `katex-block ${f.displayMode ? 'katex-display' : 'katex-inline'}`;
					wrapper.innerHTML = html;
					after.push(wrapper);
				} catch {
					// Fallback: show raw LaTeX in red
					const err = document.createElement('span');
					err.className = 'katex-error';
					err.textContent = f.raw;
					after.push(err);
				}
			}
		}

		// Replace the original text node with processed fragments
		const fragment = document.createDocumentFragment();
		for (const n of after) {
			fragment.appendChild(n);
		}
		parent.replaceChild(fragment, textNode);
	}
}

interface MathFragment {
	type: 'text' | 'math';
	content: string;
	displayMode: boolean;
	raw: string;
}

/**
 * Process a string that may contain math delimiters.
 * Returns array of fragments (text + math) ready for KaTeX rendering.
 */
function processMath(text: string): MathFragment[] {
	// Try to match delimiters in order of priority (longest first to avoid
	 // greedy prefix issues — try $$ before $)
	const sorted = [...DELIMITERS].sort((a, b) => b[0].length - a[0].length);

	let remaining = text;
	const fragments: MathFragment[] = [];

	while (remaining.length > 0) {
		let earliestFound = -1;
		let earliestDelim: (typeof sorted)[number] | null = null;
		let earliestCloseIdx = -1;

		for (const [open, close, displayMode] of sorted) {
			const openIdx = remaining.indexOf(open);
			if (openIdx === -1) continue;

			// Find matching close delimiter (skip escaped)
			const searchFrom = openIdx + open.length;
			const closeIdx = remaining.indexOf(close, searchFrom);
			if (closeIdx === -1) continue;

			// Pick the delimiter that starts earliest
			if (earliestFound === -1 || openIdx < earliestFound) {
				earliestFound = openIdx;
				earliestDelim = [open, close, displayMode];
				earliestCloseIdx = closeIdx;
			}
		}

		if (earliestFound === -1 || !earliestDelim) {
			// No more math — add remaining as text
			fragments.push({
				type: 'text',
				content: remaining,
				displayMode: false,
				raw: remaining,
			});
			break;
		}

		// Text before math
		if (earliestFound > 0) {
			fragments.push({
				type: 'text',
				content: remaining.slice(0, earliestFound),
				displayMode: false,
				raw: remaining.slice(0, earliestFound),
			});
		}

		const [open, close, displayMode] = earliestDelim;
		const mathContent = remaining.slice(
			earliestFound + open.length,
			earliestCloseIdx,
		);

		fragments.push({
			type: 'math',
			content: mathContent,
			displayMode,
			raw: open + mathContent + close,
		});

		// Continue searching after the close delimiter
		remaining = remaining.slice(earliestCloseIdx + close.length);
	}

	return fragments;
}

/** Quick check if text contains any math delimiter */
function hasDelimiter(text: string): boolean {
	for (const [open] of DELIMITERS) {
		if (text.includes(open)) return true;
	}
	return false;
}
