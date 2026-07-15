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
	}
</style>
