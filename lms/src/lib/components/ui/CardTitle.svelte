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

<h3 class="text-lg font-semibold leading-tight tracking-tight {className}" {...rest}>
	{@render children?.()}
</h3>

<style>
	h3 {
		color: var(--foreground);
	}
</style>
