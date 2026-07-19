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

<p class="card-description {className}" {...rest}>
	{@render children?.()}
</p>

<style>
	.card-description {
		font-size: 0.875rem;
		color: #64748b;
		font-feature-settings: 'cv01', 'ss03';
	}
</style>
