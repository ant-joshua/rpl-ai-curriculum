<script lang="ts">
	let { html, title }: { html?: string; title?: string } = $props();
</script>

{#if title}
	<h3 class="content-title">{title}</h3>
{/if}
{#if html}
	<div class="text-content markdown-content">{@html html}</div>
{/if}

<style>
	.content-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 12px;
	}
	.text-content {
		line-height: 1.7;
		font-size: 16px;
	}
	.text-content :global(p) {
		margin: 0 0 12px;
	}
	.text-content :global(p:last-child) {
		margin-bottom: 0;
	}
	.text-content :global(code) {
		background: var(--bg-code, rgba(255,255,255,0.06));
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.9em;
	}
	.text-content :global(pre) {
		background: #0d0e17;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px;
		overflow-x: auto;
		margin: 12px 0;
	}
	.text-content :global(pre code) {
		background: none;
		padding: 0;
	}
	.text-content :global(img) {
		max-width: 100%;
		border-radius: 8px;
		margin: 12px 0;
	}
	.text-content :global(a) {
		color: var(--accent);
		text-decoration: none;
	}
	.text-content :global(a:hover) {
		text-decoration: underline;
	}
	.text-content :global(blockquote) {
		border-left: 3px solid var(--accent);
		margin: 12px 0;
		padding: 8px 16px;
		background: rgba(255,255,255,0.03);
		border-radius: 0 8px 8px 0;
	}
	.text-content :global(ul), .text-content :global(ol) {
		padding-left: 24px;
		margin: 8px 0;
	}
	.text-content :global(li) {
		margin: 4px 0;
	}
	.text-content :global(h2) {
		font-size: 20px;
		margin: 24px 0 12px;
		color: var(--text);
	}
	.text-content :global(h3) {
		font-size: 17px;
		margin: 20px 0 8px;
		color: var(--text);
	}
	.text-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 12px 0;
	}
	.text-content :global(th), .text-content :global(td) {
		border: 1px solid var(--border);
		padding: 8px 12px;
		text-align: left;
	}
	.text-content :global(th) {
		background: rgba(255,255,255,0.04);
		font-weight: 600;
	}
</style>
