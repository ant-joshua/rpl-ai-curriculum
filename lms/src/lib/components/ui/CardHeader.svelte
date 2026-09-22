<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: {
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<div class="card-header {className}" {...rest}>
	{@render children?.()}
</div>

<style>
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 18px;
		border-bottom: 1px solid var(--border);
	}
	.card-header :global(h3),
	.card-header :global(h2) {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
	}
</style>
