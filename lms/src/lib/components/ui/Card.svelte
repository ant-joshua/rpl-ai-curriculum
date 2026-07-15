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
