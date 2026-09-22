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

<tr class="table-row {className}" {...rest}>
	{@render children?.()}
</tr>

<style>
	.table-row {
		border-bottom: 1px solid var(--surface-alt);
		transition: background-color 0.15s ease;
	}
	.table-row:hover {
		background: var(--surface-alt);
	}
	.table-row:last-child {
		border-bottom: none;
	}
</style>
