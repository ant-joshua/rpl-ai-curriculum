<script lang="ts">
	import TextContent from './TextContent.svelte';
	import VideoContent from './VideoContent.svelte';
	import CodeContent from './CodeContent.svelte';
	import EmbedContent from './EmbedContent.svelte';
	import QuizContent from './QuizContent.svelte';

	let { block }: { block: any } = $props();

	let meta: Record<string, any> = $derived(
		typeof block.meta === 'string'
			? JSON.parse(block.meta || '{}')
			: (block.meta || {})
	);

	let blockType = $derived(block.type || 'text');
	let bodyHtml = $derived(block.body_html || block.body || '');
	let bodyText = $derived(block.body || '');
	let title = $derived(block.title || '');
</script>

{#if blockType === 'text'}
	<TextContent html={bodyHtml} {title} />
{:else if blockType === 'video'}
	<VideoContent {meta} {title} />
{:else if blockType === 'code'}
	<CodeContent {meta} body={bodyText} {title} />
{:else if blockType === 'embed'}
	<EmbedContent {meta} {title} />
{:else if blockType === 'quiz'}
	<QuizContent contentBlock={block} />
{:else if blockType === 'image'}
	<div class="content-block image-wrapper">
		{#if bodyText}
			<img src={bodyText} alt={title || 'Lesson image'} />
		{/if}
		{#if title}
			<p class="content-caption">{title}</p>
		{/if}
	</div>
{:else}
	<TextContent html={bodyHtml} {title} />
{/if}

<style>
	.content-block {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 20px;
		line-height: 1.7;
		font-size: 16px;
	}
	.image-wrapper {
		padding: 16px;
		text-align: center;
	}
	.image-wrapper img {
		max-width: 100%;
		border-radius: 8px;
		display: block;
		margin: 0 auto;
	}
	.content-caption {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 8px 0 0;
		text-align: center;
	}
</style>
