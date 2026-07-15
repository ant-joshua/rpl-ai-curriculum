<script lang="ts">
	import TextContent from './TextContent.svelte';
	import VideoContent from './VideoContent.svelte';
	import CodeContent from './CodeContent.svelte';
	import EmbedContent from './EmbedContent.svelte';
	import QuizContent from './QuizContent.svelte';
	import PlaygroundContent from './PlaygroundContent.svelte';
	import MathContent from './MathContent.svelte';

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
	<div class="content-block">
		<VideoContent {meta} {title} />
	</div>
{:else if blockType === 'code'}
	<div class="content-block">
		<CodeContent {meta} body={bodyText} {title} />
	</div>
{:else if blockType === 'embed'}
	<div class="content-block">
		<EmbedContent {meta} {title} />
	</div>
{:else if blockType === 'quiz'}
	<div class="content-block content-block-quiz">
		<QuizContent contentBlock={block} />
	</div>
{:else if blockType === 'playground'}
	<div class="content-block">
		<PlaygroundContent body={bodyText} language={meta?.language || 'html'} {title} />
	</div>
{:else if blockType === 'image'}
	<figure class="image-block">
		{#if bodyText}
			<img src={bodyText} alt={title || 'Lesson image'} />
		{/if}
		{#if title}
			<figcaption class="image-caption">{title}</figcaption>
		{/if}
	</figure>
{:else if blockType === 'math'}
	<div class="content-block">
		<MathContent content={bodyText} displayMode={meta?.displayMode ?? false} />
	</div>
{:else}
	<TextContent html={bodyHtml} {title} />
{/if}

<style>
	.content-block {
		margin-bottom: 24px;
	}

	.content-block-quiz {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 12px;
		padding: 24px;
	}

	.image-block {
		margin: 20px 0;
		text-align: center;
	}

	.image-block img {
		max-width: 100%;
		border-radius: 8px;
		display: block;
		margin: 0 auto;
		border: 1px solid rgba(255, 255, 255, 0.04);
	}

	.image-caption {
		font-size: 13px;
		color: #62666d;
		margin: 8px 0 0;
		text-align: center;
	}
</style>
