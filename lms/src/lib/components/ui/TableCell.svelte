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

<td class="table-cell {className}" {...rest}>
	{@render children?.()}
</td>

<style>
	.table-cell {
		padding: 0.75rem 1rem;
		vertical-align: middle;
	}
	:global(.table-header) .table-cell {
		font-weight: 510;
		color: #8a8f98;
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
</style>
