<script lang="ts">
	let { meta, title }: { meta?: Record<string, any>; title?: string } = $props();

	let url = $derived(meta?.url || '');
	let embedWidth = $derived(meta?.width || '100%');
	let embedHeight = $derived(meta?.height || '400px');
</script>

{#if url}
	<div class="embed-wrapper">
		{#if title}
			<h3 class="content-title">{title}</h3>
		{/if}
		<iframe
			src={url}
			title={title || 'Embedded content'}
			style="width: {embedWidth}; height: {embedHeight};"
			loading="lazy"
			allowfullscreen
			sandbox="allow-scripts allow-same-origin allow-popups"
		></iframe>
	</div>
{/if}

<style>
	.embed-wrapper {
		padding: 0;
	}
	.content-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 12px;
	}
	.embed-wrapper :global(iframe) {
		border: none;
		border-radius: 8px;
		width: 100%;
	}
</style>
