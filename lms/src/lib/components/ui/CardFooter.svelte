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

<div class="flex items-center gap-2 pt-2 {className}" {...rest}>
	{@render children?.()}
</div>
