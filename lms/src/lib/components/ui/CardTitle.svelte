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

<h3 class="card-title {className}" {...rest}>
	{@render children?.()}
</h3>

<style>
	.card-title {
		font-size: 1.125rem;
		font-weight: 590;
		line-height: 1.3;
		color: #1a1a2e;
		font-feature-settings: 'cv01', 'ss03';
	}
</style>
