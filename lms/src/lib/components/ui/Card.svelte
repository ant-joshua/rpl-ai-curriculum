<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'interactive' | 'glass' | 'bordered';
	type Padding = 'sm' | 'md' | 'lg';

	let {
		variant = 'default',
		padding = 'md',
		class: className = '',
		children,
		hover = false,
		onclick,
		...rest
	}: {
		variant?: Variant;
		padding?: Padding;
		class?: string;
		children?: Snippet;
		hover?: boolean;
		onclick?: (e: MouseEvent) => void;
		[key: string]: unknown;
	} = $props();

	const base = 'card';
	const variantClass = $derived(
		variant === 'interactive' ? 'card-interactive' :
		variant === 'glass' ? 'card-glass' :
		variant === 'bordered' ? 'card-bordered' : ''
	);
	const paddingClass = $derived(`card-padding-${padding}`);
	const hoverClass = $derived(hover ? 'card-hover' : '');
	const clickableClass = $derived(onclick ? 'card-clickable' : '');
	const cls = $derived([base, variantClass, paddingClass, hoverClass, clickableClass, className].filter(Boolean).join(' '));
</script>

{#if onclick}
	<button class={cls} {onclick} type="button" {...rest}>
		{@render children?.()}
	</button>
{:else}
	<div class={cls} {...rest}>
		{@render children?.()}
	</div>
{/if}

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		transition: all 0.15s ease;
		text-align: left;
		font-family: inherit;
		color: inherit;
		width: 100%;
		cursor: default;
	}
	.card-clickable {
		cursor: pointer;
	}
	.card-hover:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(0,0,0,0.1);
	}
	.card-glass {
		background: var(--gradient-card);
		backdrop-filter: blur(8px);
	}
	.card-bordered {
		border-color: color-mix(in srgb, var(--accent) 20%, var(--border));
	}
	.card-interactive:hover {
		border-color: var(--accent);
		background: var(--accent-dim);
	}
	.card-padding-sm { padding: 12px; }
	.card-padding-md { padding: 16px 20px; }
	.card-padding-lg { padding: 24px 28px; }
</style>
