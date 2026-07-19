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

<table class="table-root {className}" {...rest}>
	{@render children?.()}
</table>

<style>
	.table-root {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 8px;
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.table-root {
			font-size: 0.8125rem;
		}
		:global(.table-root) th,
		:global(.table-root) td {
			padding: 6px 8px;
			white-space: nowrap;
		}
	}
</style>
