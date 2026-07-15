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

<th class="table-head {className}" scope="col" {...rest}>
	{@render children?.()}
</th>

<style>
	.table-head {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		color: var(--muted-foreground);
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}
</style>
