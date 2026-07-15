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
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 8px;
		overflow: hidden;
	}
</style>
