<script lang="ts">
	let { meta, title }: { meta?: Record<string, any>; title?: string } = $props();

	let videoId = $derived(meta?.videoId || '');
	let startTime = $derived(meta?.startTime || 0);
	let embedUrl = $derived(
		videoId ? `https://www.youtube.com/embed/${videoId}?start=${startTime}` : ''
	);
</script>

{#if embedUrl}
	<div class="video-wrapper">
		{#if title}
			<h3 class="content-title">{title}</h3>
		{/if}
		<div class="video-embed">
			<iframe
				src={embedUrl}
				title={title || 'YouTube video'}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				loading="lazy"
			></iframe>
		</div>
	</div>
{:else if meta?.url}
	<div class="video-wrapper">
		{#if title}
			<h3 class="content-title">{title}</h3>
		{/if}
		<div class="video-embed">
			<iframe
				src={meta.url}
				title={title || 'Video embed'}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				loading="lazy"
			></iframe>
		</div>
	</div>
{/if}

<style>
	.video-wrapper {
		padding: 0;
	}
	.content-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 12px;
	}
	.video-embed {
		position: relative;
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
	}
	.video-embed :global(iframe) {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: none;
		border-radius: 8px;
	}
</style>
