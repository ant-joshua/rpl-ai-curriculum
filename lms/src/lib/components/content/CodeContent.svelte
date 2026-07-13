<script lang="ts">
	let { meta, body, title }: { meta?: Record<string, any>; body?: string; title?: string } = $props();

	let language = $derived(meta?.language || '');
	let code = $derived(body || meta?.initialCode || '');
</script>

{#if title}
	<h3 class="content-title">{title}</h3>
{/if}
{#if language}
	<div class="code-label">{language}</div>
{/if}
<pre class="code-block"><code>{code}</code></pre>

<style>
	.content-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 12px;
	}
	.code-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 8px;
	}
	.code-block {
		background: #0d0e17;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px;
		overflow-x: auto;
		font-size: 14px;
		line-height: 1.6;
		margin: 0;
	}
	.code-block code {
		background: none;
		padding: 0;
		color: var(--text);
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
	}
</style>
