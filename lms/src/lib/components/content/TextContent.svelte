<script lang="ts">
	import { browser } from '$app/environment';
	import { parseMarkdownWithVideo } from '$lib/utils/markdown';
	import PrismTheme from './PrismTheme.svelte';
	import { highlightContainer } from '$lib/utils/prism';
	import { findAndRenderMath } from '$lib/utils/math';

	let { html, title }: { html?: string; title?: string } = $props();

	// If html is raw markdown (contains {video:} shortcodes or markdown syntax),
	// parse it with video support. If it's already HTML, use as-is.
	let processedHtml = $derived(
		html && (html.includes('{video:') || /^https?:\/\//.test(html.trim()))
			? parseMarkdownWithVideo(html)
			: html || ''
	);

	let contentEl = $state<HTMLDivElement | null>(null);

	// After mount/render, highlight code blocks with Prism and render math
	$effect(() => {
		if (!browser || !contentEl || !processedHtml) return;
		const raf = requestAnimationFrame(() => {
			highlightContainer(contentEl!);
			findAndRenderMath(contentEl!);
		});
		return () => cancelAnimationFrame(raf);
	});
</script>

<PrismTheme />

{#if title}
	<h3 class="content-title">{title}</h3>
{/if}
{#if processedHtml}
	<div bind:this={contentEl} class="text-content prose">{@html processedHtml}</div>
{/if}

<style>
	.content-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 12px;
	}

	/* Prose-like typography container */
	.prose {
		line-height: 1.75;
		font-size: 16px;
		color: #e2e4e7;
	}

	/* Paragraphs */
	.prose :global(p) {
		margin: 0 0 16px;
	}
	.prose :global(p:last-child) {
		margin-bottom: 0;
	}

	/* Headings */
	.prose :global(h2) {
		font-size: 22px;
		font-weight: 700;
		margin: 32px 0 12px;
		color: #f7f8f8;
		letter-spacing: -0.01em;
	}
	.prose :global(h3) {
		font-size: 18px;
		font-weight: 600;
		margin: 28px 0 8px;
		color: #f7f8f8;
	}
	.prose :global(h4) {
		font-size: 16px;
		font-weight: 600;
		margin: 24px 0 8px;
		color: #f7f8f8;
	}

	/* Inline code */
	.prose :global(code) {
		background: rgba(255, 255, 255, 0.06);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.875em;
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		color: #e2e4e7;
		border: 1px solid rgba(255, 255, 255, 0.04);
	}

	/* Code blocks — dark bg with syntax highlight */
	.prose :global(pre) {
		background: #0d0e17;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 8px;
		padding: 20px;
		overflow-x: auto;
		margin: 20px 0;
		position: relative;
	}
	.prose :global(pre code) {
		background: none;
		padding: 0;
		border: none;
		font-size: 13px;
		line-height: 1.6;
		color: #d0d6e0;
	}

	/* Inline code inside pre (already handled above — keep specificity) */
	.prose :global(pre code) {
		background: none;
		padding: 0;
		border: none;
	}

	/* Links */
	.prose :global(a) {
		color: #5e6ad2;
		text-decoration: none;
		border-bottom: 1px solid rgba(94, 106, 210, 0.3);
		transition: border-color 0.15s;
	}
	.prose :global(a:hover) {
		color: #7170ff;
		border-bottom-color: #7170ff;
	}

	/* Images */
	.prose :global(img) {
		max-width: 100%;
		border-radius: 8px;
		margin: 20px auto;
		display: block;
		border: 1px solid rgba(255, 255, 255, 0.04);
	}

	/* Blockquotes */
	.prose :global(blockquote) {
		border-left: 3px solid #5e6ad2;
		margin: 20px 0;
		padding: 12px 20px;
		background: rgba(94, 106, 210, 0.04);
		border-radius: 0 8px 8px 0;
		color: #a0a5b0;
		font-style: italic;
	}
	.prose :global(blockquote p) {
		margin: 4px 0;
	}

	/* Lists */
	.prose :global(ul), .prose :global(ol) {
		padding-left: 24px;
		margin: 12px 0;
	}
	.prose :global(li) {
		margin: 6px 0;
	}
	.prose :global(li > ul), .prose :global(li > ol) {
		margin: 4px 0;
	}

	/* Horizontal rule */
	.prose :global(hr) {
		border: none;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		margin: 32px 0;
	}

	/* Tables */
	.prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
		font-size: 14px;
	}
	.prose :global(th), .prose :global(td) {
		border: 1px solid rgba(255, 255, 255, 0.08);
		padding: 10px 14px;
		text-align: left;
	}
	.prose :global(th) {
		background: rgba(255, 255, 255, 0.04);
		font-weight: 600;
		color: #f7f8f8;
	}
	.prose :global(td) {
		color: #d0d6e0;
	}
	.prose :global(tr:nth-child(even) td) {
		background: rgba(255, 255, 255, 0.02);
	}

	/* Video embeds */
	.prose :global(.video-embed-wrapper) {
		position: relative;
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		margin: 20px 0;
		aspect-ratio: 16 / 9;
		background: #000;
		border: 1px solid rgba(255, 255, 255, 0.06);
	}
	.prose :global(.video-embed-wrapper iframe) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: none;
	}

	/* Captions (used by image blocks in ContentRenderer) */
	.prose :global(figcaption),
	.prose :global(.image-caption) {
		font-size: 13px;
		color: #62666d;
		text-align: center;
		margin-top: 4px;
	}

	/* Emphasis */
	.prose :global(strong) {
		color: #f7f8f8;
		font-weight: 600;
	}
	.prose :global(em) {
		font-style: italic;
	}

	/* Abbreviations */
	.prose :global(abbr) {
		border-bottom: 1px dotted #62666d;
		cursor: help;
	}

	@media (max-width: 640px) {
		.prose {
			font-size: 15px;
			line-height: 1.65;
		}
		.prose :global(h2) {
			font-size: 19px;
		}
		.prose :global(h3) {
			font-size: 16px;
		}
		.prose :global(pre) {
			padding: 14px;
			margin: 16px -12px;
			border-radius: 6px;
		}
	}
</style>
