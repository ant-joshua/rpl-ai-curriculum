<script lang="ts">
	import katex from 'katex';
	import { browser } from '$app/environment';

	let {
		content,
		displayMode = false,
	}: {
		content?: string;
		displayMode?: boolean;
	} = $props();

	let katexEl = $state<HTMLElement | null>(null);
	let renderedHtml = $state('');
	let hasError = $state(false);

	$effect(() => {
		if (!content) {
			renderedHtml = '';
			hasError = false;
			return;
		}

		try {
			const html = katex.renderToString(content, {
				displayMode,
				throwOnError: false,
				output: 'html',
			});
			renderedHtml = html;
			hasError = false;
		} catch {
			hasError = true;
			renderedHtml = '';
		}
	});

	// After DOM update, re-run KaTeX for proper font sizing
	// (renderToString produces HTML but browser may need re-render)
	$effect(() => {
		if (!browser || !katexEl || !renderedHtml) return;

		const raf = requestAnimationFrame(() => {
			if (!katexEl || !content) return;
			try {
				// Re-render into the element for proper sizing
				katex.render(content, katexEl, {
					displayMode,
					throwOnError: false,
				});
			} catch {
				// Already have fallback HTML from SSR
			}
		});
		return () => cancelAnimationFrame(raf);
	});
</script>

{#if hasError}
	<span class="katex-error" class:display={displayMode}>
		{content}
	</span>
{:else if renderedHtml}
	<span
		bind:this={katexEl as HTMLSpanElement}
		class="math-content"
		class:katex-display={displayMode}
		class:katex-inline={!displayMode}
	>
		{@html renderedHtml}
	</span>
{/if}

<style>
	.display {
		display: block;
	}
	.math-content {
		display: inline;
		/* Wrap KaTeX in content-flow-safe inline context */
	}
	.math-content.katex-display {
		display: block;
		text-align: center;
		margin: 16px 0;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 8px 0;
	}
	.math-content.katex-inline {
		display: inline;
		white-space: nowrap;
	}
	:global(.katex-error) {
		color: var(--danger, #ef4444);
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 4px;
		padding: 2px 6px;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.85em;
		white-space: pre-wrap;
		word-break: break-word;
	}
	:global(.katex-display.display) {
		display: block;
	}
</style>
