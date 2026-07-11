<script lang="ts">
	let { language = 'javascript', code = $bindable(''), readOnly = false }: {
		language?: string;
		code?: string;
		readOnly?: boolean;
	} = $props();

	let editorEl = $state<HTMLTextAreaElement | null>(null);
	let copyText = $state('Copy');
	let activeLine = $state(-1);

	function handleInput(e: Event) {
		if (readOnly) return;
		const target = e.target as HTMLTextAreaElement;
		code = target.value;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			e.preventDefault();
			const target = e.target as HTMLTextAreaElement;
			const start = target.selectionStart;
			const end = target.selectionEnd;
			code = code.slice(0, start) + '\t' + code.slice(end);
			// need to trigger update after microtask
			requestAnimationFrame(() => {
				target.selectionStart = target.selectionEnd = start + 1;
			});
		}
	}

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code);
			copyText = 'Copied!';
			setTimeout(() => copyText = 'Copy', 2000);
		} catch {
			copyText = 'Failed';
			setTimeout(() => copyText = 'Copy', 2000);
		}
	}

	function trackScroll() {
		if (!editorEl) return;
		// sync scroll between textarea and highlight layer
	}

	// Simple keyword-based highlighting for common languages
	let highlighted = $derived(highlightCode(code, language));

	function highlightCode(src: string, lang: string): string {
		if (!src) return '';
		let escaped = src
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');

		if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
			return highlightJS(escaped);
		}
		if (lang === 'html') {
			return highlightHTML(escaped);
		}
		return escaped;
	}

	function highlightJS(src: string): string {
		// Keywords
		src = src.replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|of|in|class|extends|import|export|default|from|async|await|try|catch|throw|finally|this|super|true|false|null|undefined|NaN|Infinity)\b/g, '<span class="syn-kw">$1</span>');
		// Numbers
		src = src.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-num">$1</span>');
		// Strings (double)
		src = src.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, '<span class="syn-str">"$1"</span>');
		// Strings (single)
		src = src.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '<span class="syn-str">\'$1\'</span>');
		// Template literals
		src = src.replace(/`([^`\\]*(?:\\.[^`\\]*)*)`/g, '<span class="syn-str">`$1`</span>');
		// Comments (single line)
		src = src.replace(/(\/\/[^\n]*)/g, '<span class="syn-cm">$1</span>');
		// Comments (multi-line)
		src = src.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syn-cm">$1</span>');
		return src;
	}

	function highlightHTML(src: string): string {
		// Tags
		src = src.replace(/(&lt;\/?)(\w+)/g, '$1<span class="syn-tag">$2</span>');
		// Attributes
		src = src.replace(/(\s)(\w[\w-]*)(=)/g, '$1<span class="syn-attr">$2</span>$3');
		// Strings
		src = src.replace(/"([^"]*)"/g, '<span class="syn-str">"$1"</span>');
		// Comments
		src = src.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="syn-cm">$1</span>');
		return src;
	}
</script>

<div class="code-editor">
	<div class="editor-header">
		<span class="editor-lang-badge">{language}</span>
		<button class="copy-btn" onclick={copyCode}>
			{copyText === 'Copied!' ? '✓' : copyText === 'Failed' ? '✗' : '📋'} {copyText}
		</button>
	</div>
	<div class="editor-body">
		<textarea
			bind:this={editorEl}
			class="editor-textarea"
			value={code}
			oninput={handleInput}
			onkeydown={handleKeydown}
			spellcheck="false"
			readonly={readOnly}
			wrap="off"></textarea>
		<div class="editor-highlight" aria-hidden="true">
			{@html highlighted}
		</div>
	</div>
</div>

<style>
	.code-editor {
		border: 1px solid #2d3154;
		border-radius: 10px;
		overflow: hidden;
		background: #1a1d2e;
		font-family: 'Cascadia Code', 'JetBrains Mono', 'Consolas', 'Fira Code', monospace;
		font-size: 13px;
		line-height: 1.6;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 14px;
		background: #141726;
		border-bottom: 1px solid #2d3154;
	}

	.editor-lang-badge {
		font-size: 11px;
		font-weight: 600;
		color: #8b8fa3;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid #2d3154;
		background: transparent;
		color: #8b8fa3;
		font-size: 11px;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.copy-btn:hover {
		border-color: #6366f1;
		color: #e8eaf0;
	}

	.editor-body {
		position: relative;
	}

	.editor-textarea,
	.editor-highlight {
		padding: 16px;
		margin: 0;
		white-space: pre;
		tab-size: 2;
		overflow: auto;
		min-height: 120px;
	}

	.editor-textarea {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;
		min-height: 120px;
		color: transparent;
		caret-color: #e8eaf0;
		background: transparent;
		border: none;
		resize: vertical;
		outline: none;
		font: inherit;
		line-height: inherit;
	}

	.editor-textarea::selection {
		background: rgba(99, 102, 241, 0.35);
	}

	.editor-highlight {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 0;
	}
</style>

<!-- Syntax highlight styles -->
<svelte:head>
	<style>
		.syn-kw { color: #c678dd; }
		.syn-num { color: #d19a66; }
		.syn-str { color: #98c379; }
		.syn-cm { color: #5c6370; font-style: italic; }
		.syn-tag { color: #e06c75; }
		.syn-attr { color: #d19a66; }
	</style>
</svelte:head>
