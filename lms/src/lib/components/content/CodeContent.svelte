<script lang="ts">
	import { browser } from '$app/environment';
	import PrismTheme from './PrismTheme.svelte';
	import PlaygroundContent from './PlaygroundContent.svelte';
	import { highlightCode } from '$lib/utils/prism';

	let { meta, body, title }: { meta?: Record<string, any>; body?: string; title?: string } = $props();

	let language = $derived(meta?.language || '');
	let code = $derived(body || meta?.initialCode || '');

	// Prism-highlighted HTML (reactive)
	let highlighted = $derived(
		language ? highlightCode(code, language) : ''
	);

	let showPlayground = $state(false);

	// Determine if runnable for playground
	let isRunnable = $derived(
		['html', 'css', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(language.toLowerCase())
	);
</script>

<PrismTheme />

{#if title}
	<h3 class="content-title">{title}</h3>
{/if}

<div class="code-content-wrapper">
	<div class="code-header">
		{#if language}
			<div class="code-label">{language}</div>
		{/if}
		<div class="code-actions">
			{#if isRunnable}
				<button
					class="playground-btn"
					onclick={() => (showPlayground = !showPlayground)}
				>
					{showPlayground ? '✕ Tutup' : '▶️ Playground'}
				</button>
			{/if}
		</div>
	</div>

	<pre class="code-block"><code class="language-{language}">{@html highlighted || code}</code></pre>
</div>

{#if showPlayground && isRunnable}
	<div class="playground-section">
		<PlaygroundContent {body} {language} />
	</div>
{/if}

<style>
	.content-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 12px;
	}
	.code-content-wrapper {
		background: #0d0e17;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}
	.code-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		background: rgba(255,255,255,0.03);
		border-bottom: 1px solid var(--border);
	}
	.code-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.code-actions {
		display: flex;
		gap: 6px;
	}
	.playground-btn {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 4px;
		border: 1px solid var(--accent);
		background: var(--accent-dim);
		color: var(--accent);
		cursor: pointer;
		transition: all 0.15s;
		font-family: inherit;
		white-space: nowrap;
	}
	.playground-btn:hover {
		background: var(--accent);
		color: #fff;
	}
	.code-block {
		padding: 16px;
		overflow-x: auto;
		font-size: 14px;
		line-height: 1.6;
		margin: 0;
		background: transparent;
	}
	.code-block code {
		background: none;
		padding: 0;
		color: var(--text);
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
	}
	.playground-section {
		margin-top: 16px;
	}
</style>
