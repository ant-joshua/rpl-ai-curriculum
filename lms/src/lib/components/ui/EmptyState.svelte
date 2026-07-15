<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		icon,
		title,
		description,
		class: className = '',
		children,
		...rest
	}: {
		icon?: string;
		title?: string;
		description?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<div class="empty-state {className}" {...rest}>
	{#if icon}
		<div class="empty-state-icon">{icon}</div>
	{/if}
	{#if title}
		<h3 class="empty-state-title">{title}</h3>
	{/if}
	{#if description}
		<p class="empty-state-description">{description}</p>
	{/if}
	{#if children}
		<div class="empty-state-action">
			{@render children?.()}
		</div>
	{/if}
</div>
