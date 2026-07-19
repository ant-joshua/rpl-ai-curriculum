<script lang="ts">
	import CodeEditor from './CodeEditor.svelte';

	let {
		code = '',
		language = 'javascript',
		exerciseType = 'js' as 'js' | 'html' | 'terminal',
		starterCode = ''
	} = $props();

	let currentCode = $state('');
	let output = $state('');
	let running = $state(false);
	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let outputType = $state<'output' | 'error'>('output');

	// Initialize code from props and reset when code prop changes
	let initDone = $state(false);
	$effect(() => {
		const src = starterCode || code;
		if (src) {
			currentCode = src;
			output = '';
			initDone = true;
		} else if (!initDone) {
			currentCode = getDefaultStarter(language, exerciseType);
			initDone = true;
		}
	});

	function getDefaultStarter(lang: string, type: string): string {
		if (type === 'html') {
			return '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>Preview</title>\n  <style>\n    body { font-family: system-ui; padding: 20px; }\n  </style>\n</head>\n<body>\n  <h1>Hello!</h1>\n  <script>\n    console.log("Halo dari HTML!");\n  <\/script>\n</body>\n</html>';
		}
		if (lang === 'javascript' || lang === 'js') {
			return '// Write your code here\nconsole.log("Halo, dunia!");\n';
		}
		if (lang === 'typescript' || lang === 'ts') {
			return '// Write your TypeScript code here\nconst message: string = "Halo, dunia!";\nconsole.log(message);\n';
		}
		return '';
	}

	function resetCode() {
		currentCode = starterCode || code || getDefaultStarter(language, exerciseType);
		output = '';
	}

	function runCode() {
		output = '';
		running = true;
		outputType = 'output';

		if (exerciseType === 'html') {
			runHTML(currentCode);
		} else {
			runJS(currentCode);
		}
	}

	function runJS(src: string) {
		const lines: string[] = [];
		const originalLog = console.log;
		const originalError = console.error;
		const originalWarn = console.warn;

		console.log = (...args: unknown[]) => {
			lines.push(args.map(a => formatArg(a)).join(' '));
		};
		console.error = (...args: unknown[]) => {
			lines.push('❌ ' + args.map(a => formatArg(a)).join(' '));
		};
		console.warn = (...args: unknown[]) => {
			lines.push('⚠️ ' + args.map(a => formatArg(a)).join(' '));
		};

		try {
			// Wrap in an async IIFE so top-level await works
			const wrapped = `(async () => {\n${src}\n})()`;
			const fn = new Function('console', wrapped);
			const result = fn({ log: console.log, error: console.error, warn: console.warn });

			if (result instanceof Promise) {
				result
					.then(() => {
						output = lines.join('\n') || '✓ Executed successfully (no output)';
						running = false;
					})
					.catch((err: Error) => {
						output = '❌ ' + (err?.message || String(err));
						outputType = 'error';
						running = false;
					})
					.finally(() => {
						console.log = originalLog;
						console.error = originalError;
						console.warn = originalWarn;
					});
				return;
			}

			output = lines.join('\n') || '✓ Executed successfully (no output)';
		} catch (err) {
			output = '❌ ' + (err instanceof Error ? err.message : String(err));
			outputType = 'error';
		} finally {
			console.log = originalLog;
			console.error = originalError;
			console.warn = originalWarn;
			running = false;
		}
	}

	function runHTML(src: string) {
		if (!iframeEl) {
			running = false;
			output = '❌ Iframe not ready';
			outputType = 'error';
			return;
		}

		// Override console.log in iframe
		const blob = new Blob([src], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		iframeEl.src = url;
		iframeEl.onload = () => {
			URL.revokeObjectURL(url);
			running = false;
			output = '✓ HTML rendered in preview above';
		};
	}

	function formatArg(arg: unknown): string {
		if (arg === null) return 'null';
		if (arg === undefined) return 'undefined';
		if (typeof arg === 'string') return arg;
		if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
		try {
			return JSON.stringify(arg, null, 2);
		} catch {
			return String(arg);
		}
	}

	let hasOutput = $derived(output.length > 0);
</script>

<div class="exercise-runner">
	<div class="runner-toolbar">
		<div class="runner-toolbar-left">
			<span class="runner-badge">▶️ Exercise</span>
			<span class="runner-lang">{language}</span>
		</div>
		<div class="runner-toolbar-actions">
			<button class="runner-btn run-btn" onclick={runCode} disabled={running}>
				{running ? '⏳ Running…' : '▶️ Run'}
			</button>
			<button class="runner-btn reset-btn" onclick={resetCode}>
				↺ Reset
			</button>
		</div>
	</div>

	<CodeEditor
		bind:code={currentCode}
		{language}
		readOnly={false}
	/>

	{#if exerciseType === 'html'}
		<div class="html-preview" class:hidden={!hasOutput && !iframeEl}>
			<div class="preview-header">Preview</div>
			<iframe
				bind:this={iframeEl}
				sandbox="allow-scripts"
				class="preview-iframe"
				title="HTML Preview"></iframe>
		</div>
	{/if}

	{#if hasOutput}
		<div class="runner-output" class:is-error={outputType === 'error'}>
			<div class="output-header">
				{outputType === 'error' ? '❌ Error' : '⏎ Output'}
			</div>
			<pre class="output-content">{output}</pre>
		</div>
	{/if}
</div>

<style>
	.exercise-runner {
		border: 1px solid #2d3154;
		border-radius: 10px;
		overflow: hidden;
		background: #1a1d2e;
		margin-top: 16px;
	}

	.runner-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 14px;
		background: #141726;
		border-bottom: 1px solid #2d3154;
	}

	.runner-toolbar-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.runner-badge {
		font-size: 12px;
		font-weight: 600;
		color: #98c379;
	}

	.runner-lang {
		font-size: 11px;
		color: #5c6370;
		background: #1a1d2e;
		padding: 2px 8px;
		border-radius: 4px;
		border: 1px solid #2d3154;
		font-family: 'JetBrains Mono', 'Consolas', monospace;
	}

	.runner-toolbar-actions {
		display: flex;
		gap: 6px;
	}

	.runner-btn {
		padding: 6px 14px;
		border-radius: 6px;
		border: 1px solid #2d3154;
		font-size: 12px;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.15s ease;
		background: transparent;
		color: #e8eaf0;
	}

	.run-btn {
		background: #4F46E5;
		border-color: #4F46E5;
		color: #fff;
	}

	.run-btn:hover:not(:disabled) {
		background: #5558e6;
	}

	.run-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.reset-btn:hover {
		border-color: #4F46E5;
		color: #4F46E5;
	}

	.html-preview {
		border-top: 1px solid #2d3154;
	}

	.html-preview.hidden {
		display: none;
	}

	.preview-header {
		padding: 8px 14px;
		font-size: 11px;
		color: #8b8fa3;
		background: #141726;
		border-bottom: 1px solid #2d3154;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.preview-iframe {
		width: 100%;
		height: 300px;
		border: none;
		background: #fff;
		display: block;
	}

	.runner-output {
		border-top: 1px solid #2d3154;
	}

	.runner-output.is-error {
		border-color: #e06c75;
	}

	.output-header {
		padding: 8px 14px;
		font-size: 11px;
		color: #8b8fa3;
		background: #141726;
		border-bottom: 1px solid #2d3154;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.runner-output.is-error .output-header {
		color: #e06c75;
		border-color: #e06c75;
	}

	.output-content {
		padding: 14px;
		margin: 0;
		font-family: 'JetBrains Mono', 'Consolas', 'Fira Code', monospace;
		font-size: 13px;
		line-height: 1.6;
		color: #e8eaf0;
		white-space: pre-wrap;
		word-break: break-all;
		max-height: 250px;
		overflow: auto;
	}
</style>
