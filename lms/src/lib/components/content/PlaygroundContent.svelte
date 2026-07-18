<script lang="ts">
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import CodeSandbox from '$lib/components/CodeSandbox.svelte';

	let {
		body = '',
		language = 'html',
		title = '',
	}: {
		body?: string;
		language?: string;
		title?: string;
	} = $props();

	// Normalise language for code editor
	let editorLang = $derived.by(() => {
		switch (language.toLowerCase()) {
			case 'html': case 'htm': return 'html';
			case 'css': return 'css';
			case 'javascript': case 'js': case 'jsx': return 'jsx';
			case 'typescript': case 'ts': case 'tsx': return 'tsx';
			case 'python': case 'py': return 'javascript'; // fallback
			default: return 'html';
		}
	});

	let showPlayground = $state(false);

	// Determine if this code is runnable (HTML/CSS/JS)
	let isRunnable = $derived(
		['html', 'css', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(language.toLowerCase())
	);

	let code = $state('');
	let editorKey = $state(0);

	$effect(() => {
		code = body;
		editorKey++;
	});

	function resetCode() {
		code = body;
		editorKey++;
	}

	// Wrap code in minimal HTML if needed
	let playgroundCode = $derived.by(() => {
		if (['html', 'htm'].includes(language.toLowerCase())) {
			return code;
		}
		// For JS/TS/CSS — wrap in an HTML scaffold
		if (['javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx'].includes(language.toLowerCase())) {
			return `<script>\n${code}\n<\/script>`;
		}
		return code;
	});
</script>

<div class="playground-content">
	{#if title}
		<div class="playground-header">
			<h3 class="content-title">{title}</h3>
			{#if isRunnable}
				<button
					class="playground-toggle"
					onclick={() => (showPlayground = !showPlayground)}
				>
					{showPlayground ? '✕ Tutup Playground' : '▶️ Buka Playground'}
				</button>
			{/if}
		</div>
	{:else if isRunnable}
		<div class="playground-header">
			<button
				class="playground-toggle"
				onclick={() => (showPlayground = !showPlayground)}
			>
				{showPlayground ? '✕ Tutup Playground' : '▶️ Buka Playground'}
			</button>
		</div>
	{/if}

	{#if showPlayground && isRunnable}
		<div class="playground-panel">
			<div class="playground-editor">
				<div class="editor-toolbar">
					<span class="editor-lang-badge">{language}</span>
					<button class="reset-btn" onclick={resetCode}>↺ Reset</button>
				</div>
				<CodeEditor bind:value={code} lang={editorLang} />
			</div>
			<div class="playground-preview">
				<div class="preview-toolbar">
					<span class="preview-label">▶ Live Preview</span>
				</div>
				<CodeSandbox bind:code={playgroundCode} autoRun={false} debounceMs={800} />
			</div>
		</div>
	{/if}
</div>

<style>
	.playground-content {
		margin-bottom: 0;
	}

	.playground-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 0;
	}

	.content-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0;
	}

	.playground-toggle {
		flex-shrink: 0;
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
		background: var(--accent-dim);
		border: 1px solid var(--accent);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
		font-family: inherit;
	}

	.playground-toggle:hover {
		background: var(--accent);
		color: #fff;
	}

	.playground-panel {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin-top: 16px;
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
		background: var(--surface);
		height: 520px;
	}

	.playground-editor {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-bottom: 1px solid var(--border);
	}

	.editor-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		background: #0d0e17;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.editor-lang-badge {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.reset-btn {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-secondary);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 2px 8px;
		cursor: pointer;
		transition: all 0.15s;
		font-family: inherit;
	}

	.reset-btn:hover {
		color: var(--text);
		border-color: var(--accent);
	}

	.playground-preview {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: #fff;
	}

	.preview-toolbar {
		display: flex;
		align-items: center;
		padding: 4px 12px;
		background: #f0f0f0;
		border-bottom: 1px solid #ddd;
		flex-shrink: 0;
	}

	.preview-label {
		font-size: 11px;
		font-weight: 600;
		color: #8a8f98;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	@media (max-width: 640px) {
		.playground-panel {
			height: 480px;
		}
		.playground-header {
			flex-direction: column;
			align-items: flex-start;
		}
		.playground-toggle {
			align-self: flex-start;
		}
	}
</style>
