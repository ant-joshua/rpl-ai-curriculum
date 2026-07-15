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

<p class="text-sm {className}" {...rest}>
	{@render children?.()}
</p>

<style>
	p {
		color: var(--muted-foreground);
	}
</style>
