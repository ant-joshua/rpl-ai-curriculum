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
		font-weight: 510;
		color: #64748b;
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
		white-space: nowrap;
		font-feature-settings: 'cv01', 'ss03';
		background: rgba(255, 255, 255, 0.01);
	}
</style>
